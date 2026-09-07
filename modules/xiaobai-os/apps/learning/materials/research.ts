import { isTavilyConfigured, searchWithTavily } from '../../../../agent-core/tavily-search.js';
import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import { learningRecord, learningText, LearningValidationError } from '../../../domains/learning/profile.js';
import { learningArray, learningId, learningInteger, requireLearning } from '../../../domains/learning/validation.js';
import type { createLearningSourceRegistry, LearningSource } from './lesson-sources.js';
import { createLearningId } from '../application/identity.js';
import { extractLearningSources, LearningMaterialError, learningPublicUrl } from './tavily-extract.js';

export const LEARNING_RESEARCH_LIMITS = Object.freeze({ query: 400,
    results: 8, defaultResults: 5, page: 4500, chunk: 500 });
const L = LEARNING_RESEARCH_LIMITS;
type Candidate = { id: string; url: string; title: string; summary: string };

function sourceParagraphs(text: string) {
    return text.split(/\r?\n\s*\r?\n/u).filter(part => part.trim()).map((text, index) => ({ id: `p${index + 1}`, text }));
}

function sourcePage(source: LearningSource, offset: number) {
    const chunks = source.paragraphs.flatMap((paragraph, index) => {
        const points = [...paragraph.text];
        return Array.from({ length: Math.ceil(points.length / L.chunk) }, (_, part) => ({
            paragraph: index + 1, id: paragraph.id, textOffset: part * L.chunk,
            text: points.slice(part * L.chunk, (part + 1) * L.chunk).join(''),
            paragraphComplete: (part + 1) * L.chunk >= points.length,
        }));
    });
    const base = { sourceId: source.id, url: source.url, title: source.title, retrievedAt: source.retrievedAt,
        paragraphCount: source.paragraphs.length };
    const paragraphs: typeof chunks = [];
    for (const chunk of chunks.slice(offset)) {
        if (paragraphs.length && [...safePromptJson({ ...base, paragraphs: [...paragraphs, chunk] })].length > L.page - 256) { break; }
        paragraphs.push(chunk);
    }
    const nextOffset = offset + paragraphs.length < chunks.length ? offset + paragraphs.length : null;
    return { ...base, paragraphs, nextOffset };
}

export function createLearningResearchCache() {
    return { candidates: new Map<string, Candidate>(), extracted: new Map<string, LearningSource>() };
}

/** Search/extraction identities remain valid for the live classroom, not just one button press. */
export function createLearningResearch(config: { tavilyApiKey?: string; tavilyBaseUrl?: string }, options: {
    sources: ReturnType<typeof createLearningSourceRegistry>; signal: AbortSignal;
    cache?: ReturnType<typeof createLearningResearchCache>;
    createId?: () => string; now?: () => string; timeoutMs?: number;
}) {
    const { candidates, extracted } = options.cache ?? createLearningResearchCache();
    const createId = options.createId ?? createLearningId;
    const available = isTavilyConfigured(config);
    async function search(args: unknown) {
        const input = learningRecord(args, 'LearningSearch', ['query', 'maxResults']);
        const query = learningText(input.query, 'query', L.query);
        const maxResults = learningInteger(input.maxResults ?? L.defaultResults, 'maxResults', 1, L.results);
        const controller = new AbortController();
        const abort = () => controller.abort();
        options.signal.addEventListener('abort', abort, { once: true });
        const timer = setTimeout(abort, options.timeoutMs ?? 30_000);
        try {
            if (options.signal.aborted) { abort(); throw new LearningMaterialError('learning_research_cancelled'); }
            const results = await searchWithTavily(config, { query, maxResults, signal: controller.signal });
            if (controller.signal.aborted) { throw new LearningMaterialError('learning_search_timeout'); }
            const selected: Candidate[] = [];
            for (const result of results.slice(0, maxResults)) {
                let url;
                try { url = learningPublicUrl(result.url); } catch { continue; }
                if (url.length > 2048) { continue; }
                const candidate = { id: createId(), url, title: [...result.title].slice(0, 240).join(''),
                    summary: [...result.content].slice(0, 600).join('') };
                candidates.set(candidate.id, candidate);
                selected.push(candidate);
            }
            return { ok: true, results: selected };
        } catch {
            throw new LearningMaterialError(controller.signal.aborted ? 'learning_search_timeout' : 'learning_search_failed');
        } finally {
            clearTimeout(timer);
            options.signal.removeEventListener('abort', abort);
        }
    }
    async function extract(args: unknown) {
        const input = learningRecord(args, 'LearningExtract', ['candidateIds', 'sourceId', 'offset']);
        const offset = learningInteger(input.offset ?? 0, 'offset');
        if (input.sourceId !== undefined) {
            requireLearning(input.candidateIds === undefined, 'sourceId', 'Choose sourceId or candidateIds for this read');
            const source = options.sources.get(learningId(input.sourceId, 'sourceId'));
            requireLearning(source, 'sourceId', 'Use a source ID from LearningRead section sources');
            return { ok: true, results: [sourcePage(source, offset)], failed: [] };
        }
        const ids = learningArray(input.candidateIds, 'candidateIds', learningId, 2);
        requireLearning(ids.length > 0 && new Set(ids).size === ids.length, 'candidateIds', 'Choose one or two distinct search candidates');
        const selected = ids.map(id => {
            const candidate = candidates.get(id);
            requireLearning(candidate, 'candidateIds', 'Choose an ID returned by LearningSearch in this classroom');
            return candidate;
        });
        const missing = selected.filter(candidate => !extracted.has(candidate.id));
        const failed: { candidateId: string; error: string }[] = [];
        if (missing.length) {
            const received = await extractLearningSources(config, missing.map(candidate => candidate.url), options);
            if (options.signal.aborted) { throw new LearningMaterialError('learning_research_cancelled'); }
            for (const candidate of missing) {
                const text = received.results.find(result => result.url === candidate.url)?.text;
                const projected = sourceParagraphs(text ?? '');
                if (!projected.length) {
                    failed.push({ candidateId: candidate.id, error: 'learning_source_unavailable' });
                    continue;
                }
                const source = { id: createId(), url: candidate.url, title: candidate.title || candidate.url.slice(0, 240),
                    retrievedAt: (options.now ?? (() => new Date().toISOString()))(), paragraphs: projected };
                options.sources.add(source);
                extracted.set(candidate.id, source);
            }
        }
        return { ok: failed.length === 0, results: selected.flatMap(candidate => {
            const entry = extracted.get(candidate.id);
            return entry ? [{ candidateId: candidate.id, ...sourcePage(entry, offset) }] : [];
        }), failed };
    }
    return {
        available,
        async executeTool(name: string, args: unknown): Promise<unknown> {
            try {
                requireLearning(available, 'tool', 'Configure the shared Tavily key in API settings to use web research');
                if (options.signal.aborted) { throw new LearningMaterialError('learning_research_cancelled'); }
                if (name === 'LearningSearch') { return await search(args); }
                if (name === 'LearningExtract') { return await extract(args); }
                throw new LearningMaterialError('learning_research_unknown_tool');
            } catch (error) {
                if (options.signal.aborted) { throw new LearningMaterialError('learning_research_cancelled'); }
                if (error instanceof LearningValidationError) { return { ok: false, error: 'invalid_arguments', path: error.path, message: error.message }; }
                return { ok: false, error: error instanceof LearningMaterialError ? error.code : 'learning_research_failed' };
            }
        },
    };
}
