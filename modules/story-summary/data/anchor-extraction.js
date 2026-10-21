import { assertMemoryWritable, commitSummaryMemory, publishSummaryMemory, readSummaryMemory } from './memory-commit.js';
import { sameMemory } from '../maintenance/domain.js';
import { getContext } from '../../../../../../extensions.js';

// A short-lived extraction draft. No timers and no partial writes during model requests.
export function createAnchorExtractionDraft(chatId, chat, { persistence = 'confirmed' } = {}) {
    assertMemoryWritable(chatId);
    const baseline = readSummaryMemory();
    const source = structuredClone(chat.map(message => ({ mes: message.mes, is_user: message.is_user, name: message.name })));
    const statuses = new Map();
    const atoms = [];
    return {
        getStatus: floor => statuses.get(floor) || baseline.l0Index.byFloor[String(floor)] || null,
        setStatus(floor, record) { statuses.set(floor, { ...record, floor, updatedAt: Date.now() }); },
        addAtoms(items) { atoms.push(...items); },
        async commit() {
            if (!statuses.size && !atoms.length) return;
            const previous = readSummaryMemory();
            const next = structuredClone(previous);
            const validate = () => {
                const currentChat = getContext().chat || [];
                for (const floor of statuses.keys()) {
                    const floorAtoms = items => items.filter(atom => atom.floor === floor);
                    const floors = source[floor - 1]?.is_user ? [floor - 1, floor] : [floor];
                    const sourceMatches = floors.every(index => sameMemory(source[index], currentChat[index] && {
                        mes: currentChat[index].mes, is_user: currentChat[index].is_user, name: currentChat[index].name,
                    }));
                    if (!sourceMatches || !sameMemory(floorAtoms(previous.stateAtoms), floorAtoms(baseline.stateAtoms))
                        || !sameMemory(previous.l0Index.byFloor[floor], baseline.l0Index.byFloor[floor])) {
                        throw Object.assign(new Error('metadata_draft_conflict'), { code: 'metadata_draft_conflict' });
                    }
                }
            };
            const ids = new Set(next.stateAtoms.map(atom => atom.atomId));
            for (const atom of atoms) {
                if (!ids.has(atom.atomId)) { next.stateAtoms.push(atom); ids.add(atom.atomId); }
            }
            for (const [floor, record] of statuses) next.l0Index.byFloor[String(floor)] = record;
            if (persistence === 'host') publishSummaryMemory(chatId, next, { previous, validate });
            else await commitSummaryMemory(chatId, next, { previous, validate });
        },
    };
}
