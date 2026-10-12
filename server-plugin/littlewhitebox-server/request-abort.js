'use strict';

function createRequestAbortScope(req, res) {
    const controller = new AbortController();
    let cause = null;
    let timeoutId = null;
    const abort = (nextCause) => {
        if (nextCause === 'client' || cause === null) cause = nextCause;
        if (!controller.signal.aborted) controller.abort();
    };
    const abortForClient = () => abort('client');
    const abortIfIncomplete = () => {
        if (!res.writableEnded) abortForClient();
    };
    req.once('aborted', abortForClient);
    res.once('close', abortIfIncomplete);
    // Tavern may destroy a fully consumed request body while its response socket remains alive.
    if (req.aborted || (!req.complete && req.destroyed) || res.destroyed) abortForClient();
    return {
        signal: controller.signal,
        get cause() { return cause; },
        setDeadline(timeout) {
            timeoutId = setTimeout(() => abort('timeout'), timeout);
            timeoutId.unref?.();
        },
        dispose() {
            if (timeoutId !== null) clearTimeout(timeoutId);
            req.off('aborted', abortForClient);
            res.off('close', abortIfIncomplete);
        },
    };
}

module.exports = { createRequestAbortScope };
