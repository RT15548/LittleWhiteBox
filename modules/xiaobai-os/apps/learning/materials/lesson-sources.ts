import { parseLearningMaterial } from '../../../domains/learning/facts.js';
import { learningRecord, learningText } from '../../../domains/learning/profile.js';
import { LEARNING_LIMITS as L, type LearningMaterial } from '../../../domains/learning/types.js';
import { learningId, learningInteger, learningTimestamp, requireLearning } from '../../../domains/learning/validation.js';

export interface LearningSource {
    id: string; url: string; title: string; retrievedAt: string;
    paragraphs: { id: string; text: string }[];
}

/** Runtime-only sources supplied by the extraction adapter, never by a lesson tool argument. */
export function createLearningSourceRegistry() {
    const sources = new Map<string, LearningSource>();
    return {
        add(source: LearningSource) {
            requireLearning(!sources.has(source.id), 'sourceId', 'Source identity has already been used');
            learningId(source.id, 'sourceId');
            learningTimestamp(source.retrievedAt, 'retrievedAt');
            requireLearning(source.paragraphs.length > 0 && source.paragraphs.every(paragraph => paragraph.text.trim()), 'paragraphs', 'Source needs readable text');
            sources.set(source.id, structuredClone(source));
        },
        get(id: string): LearningSource | undefined { return structuredClone(sources.get(id)); },
        list: () => [...sources.values()].map(source => ({ id: source.id, title: source.title, url: source.url, paragraphs: source.paragraphs.length })),
    };
}

export function compileLearningMaterial(value: unknown, id: string, sources: Pick<ReturnType<typeof createLearningSourceRegistry>, 'get'>): LearningMaterial {
    const input = learningRecord(value, 'materials', ['key', 'title', 'kind', 'sourceId', 'from', 'through', 'text']);
    let text: string;
    let provenance: LearningMaterial['provenance'];
    if (input.kind === 'authored') {
        learningRecord(value, 'materials', ['key', 'title', 'kind', 'text']);
        text = learningText(input.text, 'materials.text', L.materialText);
        provenance = { kind: 'authored' };
    } else {
        const source = sources.get(learningId(input.sourceId, 'materials.sourceId'));
        requireLearning(source, 'materials.sourceId', 'Choose an extracted source from this classroom');
        requireLearning(input.kind === 'original' || input.kind === 'adapted', 'materials.kind', 'Expected original, adapted or authored');
        provenance = { kind: input.kind, url: source.url, title: source.title, retrievedAt: source.retrievedAt };
        if (input.kind === 'original') {
            learningRecord(value, 'materials', ['key', 'title', 'kind', 'sourceId', 'from', 'through']);
            const from = learningInteger(input.from, 'materials.from', 1, source.paragraphs.length);
            const through = learningInteger(input.through, 'materials.through', from, source.paragraphs.length);
            text = source.paragraphs.slice(from - 1, through).map(paragraph => paragraph.text).join('\n\n');
        } else {
            learningRecord(value, 'materials', ['key', 'title', 'kind', 'sourceId', 'text']);
            text = learningText(input.text, 'materials.text', L.materialText);
        }
    }
    const paragraphs = text.split(/\r?\n\s*\r?\n/u).filter(part => part.trim()).map((part, index) => ({ id: `p${index + 1}`, text: part }));
    return parseLearningMaterial({ id, title: input.title, provenance, paragraphs, transcriptRevealed: false });
}
