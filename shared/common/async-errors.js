/**
 * @param {unknown} task
 * @param {unknown} context
 */
export function observeBackgroundTask(task, context) {
    Promise.resolve(task).catch(error => console.error('[LittleWhiteBox]', context, error));
}

/**
 * DOM, jQuery and timer APIs do not observe returned Promises.
 * Keep `this` and arguments while owning failures at that event boundary.
 * @template T
 * @template {unknown[]} A
 * @param {(this: T, ...args: A) => unknown} handler
 * @param {unknown} context
 * @returns {(this: T, ...args: A) => void}
 */
export function observeAsyncCallback(handler, context) {
    return function (...args) {
        try {
            observeBackgroundTask(handler.apply(this, args), context);
        } catch (error) {
            console.error('[LittleWhiteBox]', context, error);
        }
    };
}
