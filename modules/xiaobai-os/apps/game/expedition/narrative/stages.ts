import { relationshipBand, RELATIONSHIP_RULES, type Relationship } from '../campaign/relationships.js';
import { fault } from '../random.js';
import { canonFields } from './canon-fields.js';

export interface RelationshipStage {
    memory: string; shadow: string; secret: string | null;
}
/** HTML markers are the authoring protocol. Chinese headings and labels are presentation, not keys. */
export function parseStages(document: string, chapter = 1): RelationshipStage[] {
    const stages: RelationshipStage[] = [];
    for (const block of document.matchAll(/<!-- stage:(\d+):(\d+) -->\s*([\s\S]*?)<!-- \/stage -->/g)) {
        if (Number(block[1]) !== chapter) { continue; }
        const band = Number(block[2]);
        if (stages[band] || band >= RELATIONSHIP_RULES.bands.length) { fault('narrative_unavailable'); }
        const fields = canonFields(block[3]);
        stages[band] = { memory: fields.get('memory') ?? '', shadow: fields.get('shadow') ?? '', secret: fields.get('secret') ?? null };
    }
    if (RELATIONSHIP_RULES.bands.some((_, band) => !stages[band])) { fault('narrative_unavailable'); }
    return stages;
}
export function projectStage(stages: readonly RelationshipStage[], relation: Relationship, disclosed: boolean) {
    const current = stages[relationshipBand(relation.affection)];
    return { shadow: current.shadow,
        personalPast: stages.slice(0, relation.highestBand + 1).map(stage => stage.memory).filter(Boolean),
        secret: current.secret, disclosedSecret: disclosed ? stages.find(stage => stage.secret)?.secret ?? null : null };
}
