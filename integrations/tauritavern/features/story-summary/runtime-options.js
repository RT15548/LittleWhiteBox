// TauriTavern saves only the JSONL header through saveMetadata().
// A chat-summary toggle also restores message.is_system, so it must save
// the complete chat. This applies with virtualization both on and off.
// Remove this override only when the supported TT host persists message changes
// through saveMetadata() as well; newer TT versions are not validated here.
export function getStorySummaryRuntimeOptions({ isTauriTavern, managed }) {
    return {
        ownsMessageButtons: !managed,
        ...(isTauriTavern ? { saveChatState: context => context.saveChat() } : {}),
    };
}
