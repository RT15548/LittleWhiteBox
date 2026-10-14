import type { Experience, Journey, Landscape, PersonId } from './model.js';
import { observe } from './scene.js';
import { browse, chunks, readChunk, readExperience, recall, type VectorIndex } from './memory.js';
import { fail } from './fault.js';
import { AGENT_POLICY } from './agent/policy.js';
import { knownExperiences } from './experience.js';
import { experienceView } from './cooperation.js';

function previewText(text: string) {
    let end = Math.min(text.length, AGENT_POLICY.statementPreviewCharacters);
    if (end < text.length && /[\uD800-\uDBFF]/u.test(text[end - 1])) { end--; }
    return text.slice(0, end);
}
function previewExperience(event: Experience) {
    const p = event.payload;
    if (!('text' in p)) { return event; }
    const text = previewText(p.text);
    return { ...event, payload: { ...p, text }, textTruncated: text.length < p.text.length };
}

function pageObservation(view: ReturnType<typeof observe>, offset: number, count: number) {
    const end = offset + count;
    return { ...view, items: view.items.slice(offset, end), resources: view.resources.slice(offset, end), structures: view.structures.slice(offset, end),
        intention: view.intention ? previewExperience(view.intention) : null,
        waste: view.waste.slice(offset, end), declarations: view.declarations.slice(offset, end).map(previewExperience), offset,
        knownPlaces: view.knownPlaces.slice(offset, end),
        agreements: view.agreements.slice(offset, end).map(({ terms, commitments, ...a }) => ({ ...a,
            termsPreview: previewText(terms), termsTruncated: previewText(terms).length < terms.length,
            commitments: commitments.map(({ text: _text, ...response }) => response) })),
        next: Math.max(view.items.length, view.resources.length, view.structures.length, view.waste.length, view.declarations.length, view.knownPlaces.length, view.agreements.length) > end ? end : null };
}


// Each caller fixes its readers. Player interpretation never uses the GM knowledge union.
export function createAgentKnowledge(current: () => Journey, readers: PersonId[], land: Landscape) {
    return {
        context(offset = 0) {
            const candidate = current();
            const views = readers.map(id => observe(candidate, id, land));
            for (let count = AGENT_POLICY.pageSize as number; count > 0; count--) {
                const page = views.map(v => pageObservation(v, offset, count));
                if (JSON.stringify(page).length <= AGENT_POLICY.observationCharacters) { return page; }
            }
            return fail('context_full');
        },
        recent() {
            const candidate = current();
            const known = knownExperiences(candidate, readers), entries = [];
            let used = 0;
            for (let i = known.length - 1; i >= 0; i--) {
                const event = experienceView(candidate, known[i]), size = JSON.stringify(event).length;
                if (used + size > AGENT_POLICY.recentCharacters) { break; }
                entries.unshift(structuredClone(event)); used += size;
            }
            return { entries, earlier: entries.length < known.length };
        },
        indexInputs() {
            const candidate = current();
            return chunks(candidate, AGENT_POLICY.chunkCharacters).filter(c => readers.some(id => c.audience.includes(id))).map(c => ({
                chunk: c.id, digest: c.digest, text: JSON.stringify(readChunk(candidate, readers, c)),
            }));
        },
        read: (sequence: number) => readExperience(current(), readers, sequence),
        browse: (after: number, limit: number) => browse(current(), readers, after, limit),
        recall(index: VectorIndex, query: { space: string; vector: number[] }, limit: number, chunkCharacters: number) {
            return recall(current(), readers, chunks(current(), chunkCharacters), index, query, limit);
        },
    };
}
