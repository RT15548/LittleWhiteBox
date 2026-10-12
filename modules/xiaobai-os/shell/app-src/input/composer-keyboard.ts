export function shouldSendOnEnter(event: KeyboardEvent, composing: boolean, touch = window.matchMedia('(pointer: coarse)').matches): boolean {
    // Safari can report the composition-confirming Enter after compositionend.
    return !touch && !composing && !event.isComposing && event.keyCode !== 229
        && event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;
}
