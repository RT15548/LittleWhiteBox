import {
    TASK_MAX_ACTION_ID_LENGTH,
    TASK_MAX_ID_LENGTH,
    normalizeTaskActionId,
    normalizeTaskIdentity,
} from '../../../domains/tasks/invariants.js';
import { TaskError } from '../../../domains/tasks/types.js';
import { createStorageId } from '../../../kernel/identity.js';

export type TaskOpaqueIdKind = 'task' | 'event' | 'action' | 'board' | 'listing' | 'candidate';

export interface TaskIdFactory {
    create: (kind: TaskOpaqueIdKind, occupied: Set<string>) => string;
}

interface TaskIdFactoryDependencies {
    randomUuid?: (() => string) | null;
    now?: () => number;
}

const PREFIXES: Readonly<Record<TaskOpaqueIdKind, string>> = Object.freeze({
    task: 'task-',
    event: 'task-event-',
    action: 'task-action-',
    board: 'task-board-',
    listing: 'task-listing-',
    candidate: 'task-candidate-',
});

export function createTaskIdFactory({
    randomUuid = createStorageId,
    now = Date.now,
}: TaskIdFactoryDependencies = {}): TaskIdFactory {
    let fallbackSequence = 0;

    function create(kind: TaskOpaqueIdKind, occupied: Set<string>): string {
        if (!(occupied instanceof Set)) {throw new TypeError('task ID creation requires an occupied set');}
        const prefix = PREFIXES[kind];
        if (!prefix) {throw new TypeError('unsupported task ID kind');}
        for (let attempt = 0; attempt < 1_000; attempt += 1) {
            const suffix = randomUuid?.() ?? `${now()}-${++fallbackSequence}`;
            const candidate = kind === 'action'
                ? normalizeTaskActionId(`${prefix}${suffix}`.slice(0, TASK_MAX_ACTION_ID_LENGTH))
                : normalizeTaskIdentity(`${prefix}${suffix}`.slice(0, TASK_MAX_ID_LENGTH));
            if (occupied.has(candidate)) {continue;}
            occupied.add(candidate);
            return candidate;
        }
        throw new TaskError('task_id_conflict', kind);
    }

    return Object.freeze({ create });
}
