import { createLifecycleJournal, LIFECYCLE_JOURNAL_KEY } from './lifecycle-journal.js';
import { readDesign, writeDesign } from './design.js';
import { changeCardDirectory } from './workspace.js';
import { COPY } from './copy.js';
import { showLifecycleFailure, showLifecycleRestoreFailure, clearLifecycleFailure } from './lifecycle-feedback.js';
import { createIdentifier } from '../../shared/common/identifier.js';
import { reserveCardLifecycle } from './lifecycle-lane.js';
import { observeBackgroundTask } from '../../shared/common/async-errors.js';

const journal = createLifecycleJournal();
let publishDirectoryChange = async (_from, _to) => {};

export function createCardLifecycle({ storage = journal, read = readDesign, write = writeDesign,
    readName = async avatar => (await (await import('./host.js')).readCharacter(avatar)).data.name,
    changeDirectory = changeCardDirectory, changed = (from, to) => publishDirectoryChange(from, to),
    failed = showLifecycleFailure, restoreFailed = showLifecycleRestoreFailure, recovered = clearLifecycleFailure } = {}) {
    let journalTail = Promise.resolve();
    const pendingRecords = [];

    // Journal I/O never waits for uploads. Appends and removals share this short
    // lane so completing an older operation cannot erase a newly recorded one.
    function accessJournal(work) {
        const result = journalTail.then(work);
        journalTail = result.then(() => undefined, () => undefined);
        return result;
    }
    const readJournal = () => accessJournal(() => storage.read());

    // Registration is one short, shared journal transaction. Reserve all card
    // lanes here, before another page can register a later save/rename/restore.
    // Uploads run outside it; unrelated cards can execute at the same time.
    function schedule(batch, plan, registrationFailed) {
        let jobs = [];
        const registered = accessJournal(async () => {
            try {
                const next = await storage.update(operations => {
                    const additions = batch.filter(item => pendingRecords.includes(item)
                        && !operations.some(saved => saved.id === item.id));
                    const next = additions.length ? [...operations, ...additions] : operations;
                    for (const job of plan(next)) {
                        const aliases = related(job.snapshot, job.avatars).flatMap(op => [op.from, op.to].filter(Boolean));
                        jobs.push({ ...job, lane: reserveCardLifecycle([...job.avatars, ...aliases]) });
                    }
                    return next;
                });
                const ids = new Set(next.map(op => op.id));
                const remaining = pendingRecords.filter(op => !ids.has(op.id));
                pendingRecords.splice(0, pendingRecords.length, ...remaining);
            } catch (error) {
                for (const job of jobs) job.lane.cancel();
                registrationFailed(error);
                throw error;
            }
        });
        return registered.then(() => Promise.all(jobs.map(async job => {
            let started = false;
            try {
                return await job.lane.run(() => { started = true; return job.work(); });
            } catch (error) {
                if (!started) restoreFailed(error, restore);
                throw error;
            }
        })));
    }

    function related(operations, avatars) {
        const names = new Set(avatars);
        let size;
        do {
            size = names.size;
            for (const op of operations) if (names.has(op.from) || names.has(op.to)) {
                names.add(op.from);
                if (op.to) names.add(op.to);
            }
        } while (names.size !== size);
        return operations.filter(op => names.has(op.from) || names.has(op.to));
    }

    async function apply(op) {
        if (op.to) {
            const content = await read(op.from);
            if (content !== null) {
                const destination = await read(op.to);
                if (destination !== null && destination !== content) throw new Error(COPY.designMoveConflict);
                if (destination === null) await write(op.to, content);
            }
            // Move the current draft, including edits made while uploading.
            // Retrying after a completed move is a no-op, not an overwrite.
            await changeDirectory(op.from, op.to, async () => {
                // Intermediate names can already have disappeared on the host.
                // Read the surviving card's real name, never infer it from its
                // avatar filename (which can contain a uniqueness suffix).
                const operations = await readJournal();
                let avatar = op.to;
                for (const next of operations.slice(operations.findIndex(item => item.id === op.id) + 1)) {
                    if (next.from === avatar) avatar = next.to;
                }
                return avatar ? readName(avatar) : undefined;
            });
            await changed(op.from, op.to);
            await write(op.from, '');
        } else {
            await write(op.from, '');
            await changeDirectory(op.from);
            await changed(op.from);
        }
    }

    async function recover(avatars, snapshot) {
        const ids = new Set(snapshot.map(op => op.id));
        let current;
        try { current = await readJournal(); } catch (error) {
            restoreFailed(error, restore);
            throw error;
        }
        const operations = related(current.filter(op => ids.has(op.id)), avatars);
        for (const op of operations) {
            try {
                await apply(op);
                await accessJournal(() => storage.update(operations => operations.filter(item => item.id !== op.id)));
                recovered(op.id);
            } catch (error) {
                failed(op, error, () => run(avatars, () => {}));
                throw new Error(COPY.lifecyclePending(op.from, op.to), { cause: error });
            }
        }
    }

    function record(from, to) {
        const op = { id: createIdentifier(), from, ...(to ? { to } : {}) };
        pendingRecords.push(op);
        const batch = [...pendingRecords];
        const avatars = [from, to].filter(Boolean);
        const submit = () => {
            return schedule(batch, operations => {
                const snapshot = operations.slice(0, operations.findIndex(item => item.id === op.id) + 1);
                return [{ avatars, snapshot, work: () => recover(avatars, snapshot) }];
            }, error => failed({ ...op, recordingFailed: true }, error, submit));
        };
        return submit();
    }

    function run(avatars, work) {
        return schedule([...pendingRecords], snapshot => [{ avatars, snapshot, work: async () => {
            await recover(avatars, snapshot);
            return work();
        } }], error => restoreFailed(error, restore)).then(([result]) => result);
    }

    async function restore() {
        let registrationError;
        try {
            await schedule([...pendingRecords], snapshot => {
                const seen = new Set(), jobs = [];
                for (const op of snapshot) {
                    if (seen.has(op.id)) continue;
                    const group = related(snapshot, [op.from]);
                    for (const item of group) seen.add(item.id);
                    jobs.push({ avatars: [op.from], snapshot: group, work: async () => {
                        try { await recover([op.from], group); } catch (error) {
                            // Recovery owns its visible retry; other cards proceed.
                            console.error('[LittleWhiteBox]', error);
                        }
                    } });
                }
                return jobs;
            }, error => { registrationError = error; restoreFailed(error, restore); });
            recovered(LIFECYCLE_JOURNAL_KEY);
        } catch (error) {
            if (error !== registrationError) throw error;
        }
    }

    return {
        run,
        rename: (from, to) => record(from, to),
        delete: from => record(from),
        restore,
    };
}

export const cardLifecycle = createCardLifecycle();

// Registered for the page lifetime, even while the plugin switch is off.
export async function watchCardLifecycle({ eventSource, eventTypes }, onDirectoryChanged = async () => {}, lifecycle = cardLifecycle,
    channel = new BroadcastChannel('LittleWhiteBox_CardDirectories')) {
    publishDirectoryChange = async (from, to) => {
        await onDirectoryChanged(from, to);
        channel.postMessage({ from, to });
    };
    // Other pages only rebind their editor. They never replay the server action.
    channel.onmessage = ({ data: { from, to } }) => {
        const op = { id: `directory:${from}:${to || ''}`, from, to };
        const sync = async () => {
            try { await onDirectoryChanged(from, to); clearLifecycleFailure(op.id); }
            catch (error) { showLifecycleFailure(op, error, sync); }
        };
        observeBackgroundTask(sync(), { source: import.meta.url, operation: 'syncCardDirectory' });
    };
    eventSource.on(eventTypes.CHARACTER_RENAMED, (from, to) => lifecycle.rename(from, to));
    eventSource.on(eventTypes.CHARACTER_DELETED, ({ character }) => lifecycle.delete(character.avatar));
    await lifecycle.restore();
}
