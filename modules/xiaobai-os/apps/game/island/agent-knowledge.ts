import type { Experience, Journey, Landscape, PersonId } from './model.js';
import { observe } from './scene.js';
import { browse, chunks, readChunk, readExperience, recall, type VectorIndex } from './memory.js';
import { fail } from './fault.js';
import { AGENT_POLICY } from './agent/policy.js';
import { knownExperiences } from './experience.js';
import { experienceView } from './cooperation.js';
import { CAST } from './characters.js';

function rememberedNames(world: Journey, observer: PersonId) {
    const names = new Map<PersonId, { id: PersonId; name: string; source: number }>();
    const remember = (id: PersonId, source: number) => {
        if (id !== observer && !names.has(id)) {
            names.set(id, { id, name: id === 'player' ? world.playerIdentity.name : CAST[id].name, source });
        }
    };
    for (let i = world.experiences.length - 1; i >= 0; i--) {
        const event = world.experiences[i], p = event.payload;
        if (!event.audience.includes(observer)) { continue; }
        if (p.kind === 'encounter' && p.actor === observer) { remember(p.subject, event.sequence); }
        if (p.kind === 'speech' || p.kind === 'declaration') {
            remember(p.actor, event.sequence);
            if (p.kind === 'declaration' && p.choice.kind === 'relay') {
                remember(experienceView(world, event).shared!.actor, event.sequence);
            }
        }
    }
    return [...names.values()];
}

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
        waste: view.waste.slice(offset, end), graves: view.graves.slice(offset, end), declarations: view.declarations.slice(offset, end).map(previewExperience), offset,
        knownPlaces: view.knownPlaces.slice(offset, end),
        agreements: view.agreements.slice(offset, end).map(({ terms, commitments, ...a }) => ({ ...a,
            termsPreview: previewText(terms), termsTruncated: previewText(terms).length < terms.length,
            commitments: commitments.map(({ text: _text, ...response }) => response) })),
        next: Math.max(view.items.length, view.resources.length, view.structures.length, view.waste.length, view.graves.length, view.declarations.length, view.knownPlaces.length, view.agreements.length) > end ? end : null };
}


// Each caller fixes its readers. Player interpretation never uses the GM knowledge union.
export function createAgentKnowledge(current: () => Journey, readers: PersonId[], land: Landscape) {
    const reader = (observer: PersonId) => {
        if (!readers.includes(observer)) { fail('memory_unavailable'); }
        return [observer];
    };
    return {
        playerIdentity: () => structuredClone(current().playerIdentity),
        context(offset = 0) {
            const candidate = current();
            const views = readers.map(id => ({ ...observe(candidate, id, land), knownNames: rememberedNames(candidate, id) }));
            for (let count = AGENT_POLICY.pageSize as number; count > 0; count--) {
                const page = views.map(v => ({ ...pageObservation(v, offset, count), knownNames: v.knownNames }));
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
        indexInputs(observer: PersonId) {
            const candidate = current();
            const permitted = reader(observer);
            return chunks(candidate, AGENT_POLICY.chunkCharacters).filter(c => c.audience.includes(observer)).map(c => ({
                chunk: c.id, digest: c.digest, text: JSON.stringify(readChunk(candidate, permitted, c)),
            }));
        },
        read: (observer: PersonId, sequence: number) => readExperience(current(), reader(observer), sequence),
        browse: (observer: PersonId, after: number, limit: number) => browse(current(), reader(observer), after, limit),
        recall(observer: PersonId, index: VectorIndex, query: { space: string; vector: number[] }, limit: number, chunkCharacters: number) {
            return recall(current(), reader(observer), chunks(current(), chunkCharacters), index, query, limit);
        },
    };
}
