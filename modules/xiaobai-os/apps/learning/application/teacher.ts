import { parseTeacherPreference, type LearningTeacherPreference } from '../../../domains/learning/profile.js';
import { selectKnownPeople, type KnownPerson } from '../../../host/prompt-context/known-people.js';
import type { PartitionStore } from '../../../kernel/contracts.js';
import type { LearningStoredCompanions, LearningCompanionConfiguration } from '../partition.js';
import { emptyLearningCompanions, emptyLearningMemory, selectedLearningCompanion } from '../domain/conversation.js';
import { createLearningId } from './identity.js';

export function createLearningTeacherService(store: PartitionStore<LearningStoredCompanions>, sources: {
    knownPeople(): KnownPerson[];
    playerName(): string;
}) {
    const current = (): LearningCompanionConfiguration | null => {
        const value = store.peekCurrent()?.value;
        return value && 'schemaVersion' in value ? value : null;
    };
    return Object.freeze({
        candidates: () => selectKnownPeople(sources.knownPeople(), sources.playerName()),
        current,
        selected: () => selectedLearningCompanion(current()),
        async read() {
            const snapshot = await store.read();
            if (snapshot.value && 'schemaVersion' in snapshot.value) { return snapshot; }
            const previous = snapshot.value?.teacher;
            const next = emptyLearningCompanions();
            if (previous) {
                const id = createLearningId();
                next.sessions.push({ id, person: previous, memory: emptyLearningMemory() }); next.activeSessionId = id;
            }
            const result = await store.transact(transaction => transaction.replace(next), {
                commitGuard: () => store.peekCurrent()?.identityKey === snapshot.identityKey,
            });
            if (result.status !== 'confirmed' && result.status !== 'unchanged') { throw new Error('learning_companion_upgrade_unconfirmed'); }
            return store.read();
        },
        select(identityKey: string, teacher: LearningTeacherPreference['teacher'], isCurrent: () => boolean) {
            const preference = parseTeacherPreference({ teacher });
            const key = (name: string) => name.trim().normalize('NFKC').toLocaleLowerCase();
            const player = key(sources.playerName());
            const playerNames = [player, ...sources.knownPeople().filter(person => [person.name, ...person.aliases].some(name => key(name) === player))
                .flatMap(person => [person.name, ...person.aliases].map(key))];
            if (preference.teacher && playerNames.includes(key(preference.teacher.name))) { throw new Error('learning_teacher_is_player'); }
            const valid = () => !!identityKey && isCurrent() && store.peekCurrent()?.identityKey === identityKey;
            return store.transact(transaction => {
                if (!valid()) { throw new Error('learning_context_changed'); }
                const state = transaction.currentOrInitial();
                if (!('schemaVersion' in state)) { throw new Error('learning_companion_upgrade_required'); }
                if (!preference.teacher) { state.activeSessionId = null; }
                else {
                    let session = state.sessions.find(entry => key(entry.person.name) === key(preference.teacher!.name));
                    if (!session) {
                        session = { id: createLearningId(), person: preference.teacher, memory: emptyLearningMemory() };
                        state.sessions.push(session);
                    } else { session.person = preference.teacher; }
                    state.activeSessionId = session.id;
                }
                transaction.replace(state);
            }, { commitGuard: valid });
        },
    });
}
