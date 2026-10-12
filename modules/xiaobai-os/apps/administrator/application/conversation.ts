import { administratorPage } from './projection.js';
import { createAdministratorData, invalidateSummary } from '../domain/data.js';
import type { AdministratorRepository } from '../storage/repository.js';
import { administratorAttachments, type AdministratorImages } from '../storage/images.js';
import type { AdministratorData, AdministratorImage, AdministratorTurn } from '../domain/types.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';

type Cleanup = { osId: string; images: AdministratorImage[] | 'all' };
type PendingSave = { candidate: AdministratorData; revision: number; clear: boolean; cleanup: Cleanup | null; osId: string | null; guard(): boolean };
const matchesCandidate = (data: AdministratorData, pending: PendingSave) => data.revision === pending.revision + 1
    && JSON.stringify(data.turns) === JSON.stringify(pending.candidate.turns)
    && JSON.stringify(data.summary) === JSON.stringify(pending.candidate.summary);
const createSession = () => ({ data: createAdministratorData(), identity: '', corrupted: false, conflict: false,
    unsaved: null as PendingSave | null, cleanup: null as Cleanup | null });

export function createAdministratorConversation(repository: AdministratorRepository, images: AdministratorImages) {
    let session = createSession();
    type Session = typeof session;
    function capture() {
        const owner = session, identity = repository.identity();
        return () => session === owner && !!identity && repository.identity() === identity;
    }
    async function clean(owner: Session) {
        const work = owner.cleanup;
        if (!work) { return; }
        if (work.images === 'all') { await images.clear(work.osId); }
        else { for (const image of work.images) { await images.remove(work.osId, image); } }
        if (owner.cleanup === work) { owner.cleanup = null; }
    }
    async function refresh() {
        const owner = session, identity = repository.identity(), current = capture();
        try {
            const data = await repository.refresh();
            if (!current()) { throw new Error('administrator_context_changed'); }
            owner.data = data; owner.corrupted = false;
        } catch (error) {
            if (!current() || (error as Error).message !== 'administrator_data_invalid') { throw error; }
            owner.corrupted = true; owner.data = createAdministratorData();
        }
        owner.identity = identity;
    }
    async function save(candidate: AdministratorData, guard: () => boolean, options: { clear?: boolean; cleanup?: AdministratorImage[] | 'all' } = {}) {
        if (!guard()) { throw new Error('administrator_context_changed'); }
        const owner = session, current = capture();
        if (owner.unsaved) { throw new Error('administrator_save_pending'); }
        const osId = repository.osId();
        const prepared: PendingSave = { candidate: structuredClone(candidate), revision: owner.data.revision, clear: !!options.clear, osId, guard: () => current() && guard(),
            cleanup: options.cleanup && osId ? { osId, images: options.cleanup } : null };
        try {
            const data = await repository.save(prepared.candidate, prepared.revision, prepared.guard, prepared.clear);
            if (current()) { owner.data = data; owner.corrupted = false; owner.conflict = false; }
        } catch (error) {
            if (current()) { owner.unsaved = prepared; owner.conflict = (error as Error).message === 'administrator_history_conflict'; }
            throw error;
        }
        // Confirmed deletion still owns its original attachments after switching chats.
        owner.cleanup = prepared.cleanup;
        await clean(owner);
    }
    return {
        read: () => session.data, identity: () => session.identity, corrupted: () => session.corrupted,
        capture, isCurrent: () => !!session.identity && session.identity === repository.identity(),
        fileState: repository.writeState,
        conflict: () => session.conflict || repository.writeState() === 'conflict',
        unsaved: () => !!session.unsaved || !!session.cleanup || repository.pending(),
        page: (start?: number) => administratorPage(session.data, start),
        refresh, save,
        async prepareTurn(turn: AdministratorTurn, guard: () => boolean) {
            const candidate = structuredClone(session.data);
            const index = candidate.turns.findIndex(item => item.id === turn.id);
            if (index < 0) { candidate.turns.push(turn); }
            else {
                invalidateSummary(candidate, turn.id);
                candidate.turns = [...candidate.turns.slice(0, index), turn];
                if (JSON.stringify(candidate) === JSON.stringify(session.data)) { return; }
            }
            const retained = new Set(administratorAttachments(candidate).map(image => image.path));
            const cleanup = administratorAttachments(session.data).filter(image => !retained.has(image.path));
            await save(candidate, guard, { cleanup });
        },
        async adopt() {
            const owner = session, current = capture();
            const abandoned = owner.unsaved;
            const result = await repository.adoptServer();
            if (!current()) { throw new Error('administrator_context_changed'); }
            if (!['adopted', 'none'].includes(result.status)) { throw new Error(`administrator_save_${result.status}`); }
            owner.unsaved = null; owner.conflict = false;
            // Cleanup follows a confirmed deletion, not the abandoned candidate.
            await clean(owner);
            if (!current()) { throw new Error('administrator_context_changed'); }
            await refresh();
            if (!current()) { throw new Error('administrator_context_changed'); }
            if (abandoned && matchesCandidate(owner.data, abandoned)) {
                owner.cleanup = abandoned.cleanup;
                await clean(owner);
            }
            if (abandoned?.osId && !owner.corrupted) {
                const retained = new Set(administratorAttachments(owner.data).map(image => image.path));
                owner.cleanup = { osId: abandoned.osId, images: administratorAttachments(abandoned.candidate).filter(image => !retained.has(image.path)) };
                await clean(owner);
            }
        },
        async confirm(guard: () => boolean, readOnly = false) {
            const owner = session, current = capture();
            const valid = () => current() && guard();
            const result = await repository.confirmPending(readOnly);
            if (!valid()) { throw new Error('administrator_context_changed'); }
            if (readOnly && result.status === 'unconfirmed') { return; }
            if (!['none', 'confirmed'].includes(result.status)) { throw new Error(`administrator_save_${result.status}`); }
            const pending = owner.unsaved;
            await refresh();
            if (!valid()) { throw new Error('administrator_context_changed'); }
            if (pending) {
                const data = owner.data;
                if (matchesCandidate(data, pending)) {
                    owner.unsaved = null; owner.cleanup = pending.cleanup;
                } else if (!owner.corrupted && data.revision !== pending.revision) {
                    owner.conflict = true;
                    throw new Error('administrator_history_conflict');
                } else if (!readOnly) {
                    const saved = await repository.save(pending.candidate, pending.revision, () => valid() && pending.guard(), pending.clear);
                    if (valid()) { owner.data = saved; owner.unsaved = null; owner.corrupted = false; }
                    owner.cleanup = pending.cleanup;
                }
            }
            await clean(owner);
        },
        async editUserMessage(turnId: string, text: unknown, guard: () => boolean) {
            const candidate = structuredClone(session.data), turn = candidate.turns.find(t => t.id === turnId);
            if (!turn?.user) { throw new Error('administrator_message_missing'); }
            if (typeof text !== 'string' || text.length > POLICY.maxInputChars || !text.trim() && !turn.user.image) { throw new Error('administrator_input_invalid'); }
            if (turn.user.text === text.trim()) { return; }
            turn.user.text = text.trim();
            invalidateSummary(candidate, turnId);
            await save(candidate, guard);
        },
        async deleteMessage(turnId: string, role: string, guard: () => boolean) {
            const candidate = structuredClone(session.data), turn = candidate.turns.find(t => t.id === turnId);
            if (!turn || !['user', 'assistant'].includes(role)) { throw new Error('administrator_message_missing'); }
            invalidateSummary(candidate, turnId);
            const removed = role === 'user' && turn.user?.image ? [turn.user.image] : [];
            if (role === 'user') { turn.user = null; } else {
                turn.assistant = null; delete turn.assistantPayload; turn.toolMessages = []; turn.operations = []; turn.status = 'finished'; turn.error = '';
            }
            if (!turn.user && turn.assistant === null && !turn.toolMessages.length && !turn.operations.length) { candidate.turns.splice(candidate.turns.indexOf(turn), 1); }
            await save(candidate, guard, { cleanup: removed });
        },
        async clear(guard: () => boolean) { await save(createAdministratorData(), guard, { clear: true, cleanup: 'all' }); },
        reset() { session = createSession(); },
    };
}
export type AdministratorConversation = ReturnType<typeof createAdministratorConversation>;
