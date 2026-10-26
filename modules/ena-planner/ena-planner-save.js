import { createAbortError, throwIfSignalAborted } from '../../shared/common/abort-utils.js';
import { saveChatAndConfirm, withConfirmableChatMutation } from '../draw/shared/confirmable-chat-save.js';
import { PLANNER_COPY } from './ena-planner-copy.js';

const persistedMessage = (chat, index) => chat[index + (Object.hasOwn(chat[0] || {}, 'chat_metadata') ? 1 : 0)];

export async function savePlannerResult(run, plan, { getContext, identity, update }) {
    const context = getContext();
    const text = `${String(run.sourceText).trimEnd()}\n\n${plan}`;
    const assertCurrent = (expected = run.sourceText) => {
        throwIfSignalAborted(run.controller.signal);
        if (identity() !== run.chatId || getContext()?.chat?.[run.index] !== run.source
            || run.source.mes !== expected) throw createAbortError(PLANNER_COPY.changed);
    };
    await withConfirmableChatMutation(context, async () => {
        assertCurrent();
        let mutated = false;
        let confirmed = false;
        try {
            await saveChatAndConfirm({
                ctx: { ...context, saveChat: async () => {
                    assertCurrent();
                    run.source.mes = text;
                    mutated = true;
                    await context.saveChat();
                } },
                precondition: chat => {
                    assertCurrent();
                    const saved = persistedMessage(chat, run.index);
                    return saved?.is_user === true && saved.mes === run.sourceText;
                },
                verify: chat => {
                    const saved = persistedMessage(chat, run.index);
                    confirmed = saved?.is_user === true && saved.mes === text;
                    return confirmed;
                },
            });
            assertCurrent(text);
            update(run.index, run.source);
        } catch (error) {
            // A confirmed save belongs to the original chat even if the user
            // switched/cancelled while awaiting it. Never undo that fact in RAM.
            if (!confirmed && mutated && run.source.mes === text) run.source.mes = run.sourceText;
            throw error;
        }
    });
}
