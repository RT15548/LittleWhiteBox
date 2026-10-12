import { extensionFolderPath } from '../../../../../../core/constants.js';
import { isPerson, PARTICIPANT_IDS, type Participant } from '../content/participants.js';
import { PARLEY_ENEMIES } from '../content/parley.js';
import { fault } from '../random.js';
import { parseStages, type RelationshipStage } from './stages.js';

export interface NarrativeCanon {
    system: string; world: string; player: string; protocol: string; npcs: string; character: string;
    stages: RelationshipStage[]; opening: { initial: string; returned: string | null };
}
export type CanonReader = (name: string, signal: AbortSignal) => Promise<string>;
const readDocument: CanonReader = async (name, signal) => {
    const response = await fetch(`/${extensionFolderPath}/modules/xiaobai-os/docs/expedition-cards/${name}.md`, { signal, cache: 'no-cache' });
    if (!response.ok) { fault('narrative_unavailable'); }
    const text = await response.text();
    if (!text.trim()) { fault('narrative_unavailable'); }
    return text;
};
/** Public introductions are projected from each card; only the current participant's full card crosses the model boundary. */
export async function loadNarrativeCanon(person: Participant, signal: AbortSignal, read: CanonReader = readDocument): Promise<NarrativeCanon> {
    const [system, world, player, protocol, cards] = await Promise.all([
        read('system-prompt', signal), read('world', signal), read('player', signal), read('meta-protocol', signal),
        Promise.all(PARTICIPANT_IDS.map(async id => ({ id, document: await read(isPerson(id) ? id : PARLEY_ENEMIES[id].card, signal) }))),
    ]);
    const characters = cards.map(({ id, document }) => {
        const blocks = [...document.matchAll(/<!-- public -->\s*([\s\S]*?)\s*<!-- \/public -->/g)];
        if (blocks.length !== 1 || !blocks[0][1].trim()) { fault('narrative_unavailable'); }
        return { id, introduction: blocks[0][1].trim(), document: document.replace(blocks[0][0], '').trim() };
    });
    const npcs = characters.map(card => card.introduction).join('\n');
    const document = characters.find(card => card.id === person)!.document;
    const shared = { system, world, player, protocol, npcs };
    if (!isPerson(person)) {
        const block = /<!-- opening:([a-z]+\.initial) -->\s*([\s\S]*?)\s*<!-- \/opening -->/.exec(document);
        if (!block || block[1] !== `${person}.initial`) { fault('narrative_unavailable'); }
        return { ...shared, character: document.slice(0, block.index).replace(/# 开场\s*$/, '').trim(), stages: [], opening: { initial: block[2], returned: null } };
    }
    const [openings, stages] = await Promise.all(['openings', `${person}-stages`].map(name => read(name, signal)));
    // Explicit authoring protocol IDs, never a display name or heading used as a key.
    const blocks = new Map([...openings.matchAll(/<!-- opening:([a-z]+\.(?:initial|returned)) -->\s*([\s\S]*?)\s*<!-- \/opening -->/g)]
        .map(match => [match[1], match[2].trim()]));
    const initial = blocks.get(`${person}.initial`), returned = blocks.get(`${person}.returned`) ?? null;
    if (!initial || (person === 'anian' || person === 'kouzi') && !returned) { fault('narrative_unavailable'); }
    return { ...shared, character: document, stages: parseStages(stages), opening: { initial, returned } };
}
