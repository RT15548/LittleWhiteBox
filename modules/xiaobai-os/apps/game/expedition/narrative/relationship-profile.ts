import { relationshipBand, RELATIONSHIP_RULES } from '../campaign/relationships.js';
import { fault } from '../random.js';
import { canonFields } from './canon-fields.js';

const AXES = Object.freeze({ position: '位置', longing: '渴求', possession: '占有', defense: '防御', surrender: '让渡', balance: '力量关系' } as const);
export type Psychology = Record<typeof AXES[keyof typeof AXES], string>;
export interface RelationshipScale { name: string; psychology: Psychology }
export interface RelationshipProfile { zero: Psychology; bands: RelationshipScale[] }

export function parseRelationshipProfile(document: string): RelationshipProfile {
    let zero: Psychology | undefined;
    const bands: RelationshipScale[] = [];
    for (const block of document.matchAll(/<!-- relationship:(zero|\d+) -->\s*([\s\S]*?)<!-- \/relationship -->/g)) {
        const fields = canonFields(block[2]);
        const required = (key: string) => { const value = fields.get(key); if (!value) { fault('narrative_unavailable'); } return value; };
        const psychology = Object.fromEntries(Object.entries(AXES).map(([key, label]) => [label, required(key)])) as Psychology;
        if (block[1] === 'zero') {
            if (zero) { fault('narrative_unavailable'); }
            zero = psychology;
        } else {
            const band = Number(block[1]);
            if (bands[band] || band >= RELATIONSHIP_RULES.bands.length) { fault('narrative_unavailable'); }
            bands[band] = { name: required('name'), psychology };
        }
    }
    if (!zero || RELATIONSHIP_RULES.bands.some((_, band) => !bands[band])) { fault('narrative_unavailable'); }
    return { zero, bands };
}

/** Zero is a psychological baseline, not a new persisted disclosure-band index. */
export function projectRelationship(profile: RelationshipProfile, affection: number): RelationshipScale {
    const scale = profile.bands[relationshipBand(affection)];
    return affection === 0 ? { name: scale.name, psychology: profile.zero } : scale;
}
