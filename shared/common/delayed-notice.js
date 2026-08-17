export function scheduleDelayedNotice(notify, delayMs = 3000, onError = () => {}) {
    if (typeof notify !== 'function') throw new TypeError('notify must be a function');

    const reportError = error => {
        try {
            onError(error);
        } catch {
            // A status notification must never affect the task it describes.
        }
    };
    let timerId = setTimeout(() => {
        timerId = null;
        try {
            Promise.resolve(notify()).catch(reportError);
        } catch (error) {
            reportError(error);
        }
    }, Math.max(0, Number(delayMs) || 0));

    return () => {
        if (timerId === null) return;
        clearTimeout(timerId);
        timerId = null;
    };
}
