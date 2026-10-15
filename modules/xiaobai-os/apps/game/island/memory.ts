import { sha256 } from 'js-sha256';
import type { Journey, NpcId, PersonId, SceneScope } from './model.js';
import { fail } from './fault.js';
import { knownExperiences } from './experience.js';
import { experienceView, type ExperienceView } from './cooperation.js';

export interface MemoryChunk { id: string; sequence: number; start: number; end: number; digest: string; audience: PersonId[] }
export interface VectorEntry { chunk: string; digest: string; vector: number[] }
export interface VectorIndex { space: string; dimensions: number; entries: VectorEntry[] }

function sourceText(event: ExperienceView): string {
    const p = event.payload;
    if (event.shared && p.kind === 'declaration') { return `${p.text}\n${JSON.stringify(event.shared)}`; }
    return p.kind === 'speech' || p.kind === 'declaration' || p.kind === 'intention' ? p.text : JSON.stringify(p);
}
export function chunks(world: Journey, maxCharacters: number): MemoryChunk[] {
    if (!Number.isSafeInteger(maxCharacters) || maxCharacters < 1) { fail('invalid'); }
    return world.experiences.flatMap(raw => {
        const event = experienceView(world, raw);
        const text = sourceText(event), result: MemoryChunk[] = [];
        for (let start = 0; start < text.length;) {
            let end = Math.min(text.length, start + maxCharacters);
            if (end < text.length && /[\uD800-\uDBFF]/u.test(text[end - 1])) { end++; }
            result.push({ id: `${world.id}:${event.sequence}:${start}`, sequence: event.sequence, start, end,
                digest: sha256(JSON.stringify([event, start, end])), audience: [...event.audience] });
            start = end;
        }
        return result;
    });
}
export function memoryScope(scene: SceneScope): NpcId[] { return [...scene.actors]; }
export function readExperience(world: Journey, readers: readonly PersonId[], sequence: number): ExperienceView {
    const event = world.experiences.find(e => e.sequence === sequence);
    if (!event || !readers.some(id => event.audience.includes(id))) { fail('memory_unavailable'); }
    return experienceView(world, event);
}
export function readChunk(world: Journey, readers: readonly PersonId[], chunk: MemoryChunk) {
    const event = readExperience(world, readers, chunk.sequence);
    if (chunk.digest !== sha256(JSON.stringify([event, chunk.start, chunk.end]))) { fail('memory_unavailable'); }
    return { source: event.sequence, at: event.at, position: event.position, audience: event.audience,
        kind: event.payload.kind, actor: 'actor' in event.payload ? event.payload.actor : null,
        text: sourceText(event).slice(chunk.start, chunk.end), start: chunk.start, end: chunk.end };
}
export function browse(world: Journey, readers: readonly PersonId[], after: number, limit: number) {
    if (!Number.isSafeInteger(after) || after < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) { fail('invalid'); }
    const eligible = knownExperiences(world, readers).filter(e => e.sequence > after);
    const entries = eligible.slice(0, limit).map(e => experienceView(world, e));
    return { entries, next: eligible.length > limit ? entries.at(-1)!.sequence : null };
}
function magnitude(vector: number[]) { return Math.hypot(...vector); }
function validVector(vector: number[], dimensions: number) {
    return vector.length === dimensions && vector.every(Number.isFinite) && magnitude(vector) > 0;
}
export function recall(world: Journey, readers: readonly PersonId[], sourceChunks: readonly MemoryChunk[], index: VectorIndex,
    query: { space: string; vector: number[] }, limit: number) {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) { fail('invalid'); }
    if (query.space !== index.space || !validVector(query.vector, index.dimensions)) { fail('vector_space'); }
    const events = new Map(world.experiences.map(e => [e.sequence, e]));
    const vectors = new Map(index.entries.map(e => [`${e.chunk}:${e.digest}`, e]));
    const eligible = sourceChunks.filter(chunk => {
        const source = events.get(chunk.sequence);
        return source && readers.some(id => source.audience.includes(id));
    });
    const missing: string[] = [], hits: { chunk: MemoryChunk; score: number }[] = [];
    for (const chunk of eligible) {
        const event = experienceView(world, events.get(chunk.sequence)!);
        const digest = sha256(JSON.stringify([event, chunk.start, chunk.end]));
        const stored = chunk.digest === digest ? vectors.get(`${chunk.id}:${digest}`) : undefined;
        if (!stored) { missing.push(chunk.id); continue; }
        if (!validVector(stored.vector, index.dimensions)) { fail('vector_space'); }
        const score = stored.vector.reduce((sum, value, i) => sum + value * query.vector[i], 0)
            / magnitude(stored.vector) / magnitude(query.vector);
        hits.push({ chunk, score });
    }
    hits.sort((a, b) => b.score - a.score || a.chunk.sequence - b.chunk.sequence || a.chunk.start - b.chunk.start);
    return { hits: hits.slice(0, limit).map(hit => ({ ...readChunk(world, readers, hit.chunk), score: hit.score })),
        missing, complete: missing.length === 0 };
}
