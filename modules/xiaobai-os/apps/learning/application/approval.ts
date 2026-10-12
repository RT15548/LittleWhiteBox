import { createLearningId } from './identity.js';

export interface LearningApproval {
    id: string;
    unitId: string;
    title: string;
}

/** Approval waits inside the tool call. Nothing here survives its owning run. */
export function createLearningApprovals(changed: () => void) {
    const pending = new Map<string, { request: LearningApproval; finish: (approved: boolean) => void }>();
    return {
        current: () => structuredClone(pending.values().next().value?.request ?? null),
        resolve(id: string, approved: boolean) { pending.get(id)?.finish(approved); },
        request(unit: { id: string; title: string }, signal: AbortSignal): Promise<boolean> {
            if (signal.aborted) { return Promise.resolve(false); }
            return new Promise(resolve => {
                const id = createLearningId();
                const abort = () => finish(false);
                const finish = (approved: boolean) => {
                    if (!pending.delete(id)) { return; }
                    signal.removeEventListener('abort', abort);
                    changed();
                    resolve(approved);
                };
                pending.set(id, { request: { id, unitId: unit.id, title: unit.title }, finish });
                signal.addEventListener('abort', abort, { once: true });
                changed();
            });
        },
    };
}
