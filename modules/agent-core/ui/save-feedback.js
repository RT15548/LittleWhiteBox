// Transient feedback only: the caller owns persistence and reports its outcome.
export function createSaveFeedback(onChange) {
    let current = { status: 'idle' };
    let timer = null;
    function clearTimer() {
        if (timer !== null) clearTimeout(timer);
        timer = null;
    }
    function set(next) {
        clearTimer();
        current = next;
        onChange(current);
        if (current.status === 'success') timer = setTimeout(() => set({ status: 'idle' }), 1800);
    }
    return {
        get current() { return current; },
        set,
        resetSuccess() { if (current.status === 'success') set({ status: 'idle' }); },
        destroy: clearTimer,
    };
}
