import { createAbortError, throwIfSignalAborted } from '../../shared/common/abort-utils.js';
import {
    ConfirmableChatSaveUncertainError, createConfirmableChatTarget, readChatAndConfirm,
    saveChatAndConfirm, withConfirmableChatMutation,
} from '../draw/shared/confirmable-chat-save.js';
import { PLANNER_COPY } from './ena-planner-copy.js';

const persistedMessage = (chat, index) => chat[index + (Object.hasOwn(chat[0] || {}, 'chat_metadata') ? 1 : 0)];

// Call only after the user confirms sending. Retries must reuse this run (and
// skip planning): sourceText stays original; saveState owns the frozen plan and
// target. Only a fulfilled call releases the main request. `applied` describes
// the expected RAM text, independently of the persisted status. A pending host
// save may still finish after its timeout, so an original read is not then proof
// of failure and must not allow a rollback or another write.
export async function savePlannerResult(run, plan, { getContext, identity, update }) {
    const context = getContext();
    await withConfirmableChatMutation(context, async () => {
        let state = run.saveState;
        const assertCurrent = () => {
            throwIfSignalAborted(run.controller.signal);
            const expected = state?.applied ? state.text : run.sourceText;
            if (identity() !== run.chatId || getContext()?.chat?.[run.index] !== run.source
                || run.source.mes !== expected) throw createAbortError(PLANNER_COPY.changed);
        };
        assertCurrent();
        const retry = Boolean(state);
        if (!state) {
            state = run.saveState = {
                plan, text: `${String(run.sourceText).trimEnd()}\n\n${plan}`,
                target: createConfirmableChatTarget(context),
                status: 'ready', attempted: false, applied: false, writePending: false,
            };
        }
        const reconcile = chat => {
            const saved = persistedMessage(chat, run.index);
            if (saved?.is_user === true && saved.mes === state.text) {
                state.status = 'confirmed';
                return true;
            }
            if (saved?.is_user === true && saved.mes === run.sourceText && !state.writePending) {
                state.status = 'failed';
                if (state.applied && run.source.mes === state.text) {
                    run.source.mes = run.sourceText;
                    state.applied = false;
                }
            } else {
                state.status = 'uncertain';
            }
            return false;
        };
        if (retry) {
            // Never repeat a potentially successful write just because its first
            // read-back failed. Consult the original file without saving RAM.
            try {
                await readChatAndConfirm({ ctx: context, target: state.target, verify: reconcile });
            } catch (cause) {
                state.status = 'uncertain';
                throw new ConfirmableChatSaveUncertainError('readback_failed',
                    'Unable to confirm the previous planner save', { cause });
            }
            assertCurrent();
            if (state.status === 'confirmed') {
                // A prior failed attempt may have been persisted by another host
                // save after rollback. Restore only our still-owned original RAM.
                run.source.mes = state.text;
                state.applied = true;
                update(run.index, run.source);
                return;
            }
            if (state.status !== 'failed') {
                throw new ConfirmableChatSaveUncertainError('content_mismatch',
                    'The previous planner save is still uncertain');
            }
        }
        await saveChatAndConfirm({
            ctx: { ...context, saveChat: async () => {
                assertCurrent();
                run.source.mes = state.text;
                state.applied = true;
                state.attempted = true;
                state.status = 'uncertain';
                state.writePending = true;
                try {
                    await context.saveChat();
                } finally {
                    state.writePending = false;
                }
            } },
            precondition: chat => {
                assertCurrent();
                const saved = persistedMessage(chat, run.index);
                return saved?.is_user === true && saved.mes === run.sourceText;
            },
            verify: reconcile,
        });
        assertCurrent();
        update(run.index, run.source);
    });
}
