export type AppFailurePhase =
    | 'install'
    | 'dependency'
    | 'partition'
    | 'activate'
    | 'runtime'
    | 'background'
    | 'ui-load'
    | 'ui-render';

export interface AppFailure {
    code: string;
    message: string;
    phase: AppFailurePhase;
    retryable: boolean;
}

export type AppStatus =
    | { state: 'loading'; phase: AppFailurePhase }
    | { state: 'ready' }
    | { state: 'failed'; failure: AppFailure };

export class XiaobaiOsExecutionScope {
    readonly #controller = new AbortController();
    readonly #cleanups = new Set<() => void | Promise<void>>();
    readonly #tasks = new Set<Promise<unknown>>();
    readonly #failureSink: (error: unknown) => void;
    #disposed = false;

    constructor(failureSink: (error: unknown) => void) {
        if (typeof failureSink !== 'function') { throw new TypeError('execution scope requires a failure sink'); }
        this.#failureSink = failureSink;
    }

    get signal(): AbortSignal { return this.#controller.signal; }
    get disposed(): boolean { return this.#disposed; }

    #reportFailure(error: unknown): void {
        console.error('[LittleWhiteBox] 小白 OS 后台任务失败', error);
        try {
            this.#failureSink(error);
        } catch (reportingError) {
            console.error('[LittleWhiteBox] 小白 OS 后台错误处理失败', { error, reportingError });
        }
    }

    run<T>(task: (signal: AbortSignal) => Promise<T> | T): Promise<T> {
        if (this.#disposed) {
            const rejected = Promise.reject<T>(new Error('execution_scope_disposed'));
            rejected.catch(error => console.error('[LittleWhiteBox] 小白 OS 已释放的执行器收到任务', error));
            return rejected;
        }
        const promise = Promise.resolve().then(() => task(this.signal));
        this.#tasks.add(promise);
        promise.then(
            () => { this.#tasks.delete(promise); },
            error => {
                this.#tasks.delete(promise);
                if (!this.signal.aborted) { this.#reportFailure(error); }
            },
        );
        return promise;
    }

    addCleanup(cleanup: () => void | Promise<void>): () => void {
        if (typeof cleanup !== 'function') { throw new TypeError('cleanup must be a function'); }
        if (this.#disposed) {
            Promise.resolve().then(cleanup).catch(error => this.#reportFailure(error));
            return () => undefined;
        }
        this.#cleanups.add(cleanup);
        return () => this.#cleanups.delete(cleanup);
    }

    listen(
        target: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>,
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: AddEventListenerOptions | boolean,
    ): () => void {
        if (this.#disposed) { throw new Error('execution_scope_disposed'); }
        const wrapped: EventListener = event => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises -- run observes rejection and reports it to this scope's failure owner.
            void this.run(() => typeof listener === 'function'
                ? listener(event)
                : listener.handleEvent(event));
        };
        target.addEventListener(type, wrapped, options);
        const cleanup = () => target.removeEventListener(type, wrapped, options);
        this.addCleanup(cleanup);
        return cleanup;
    }

    setTimeout(task: () => void | Promise<void>, delay: number): () => void {
        if (this.#disposed) { throw new Error('execution_scope_disposed'); }
        if (typeof task !== 'function') { throw new TypeError('timeout task must be a function'); }
        const timer = globalThis.setTimeout(() => {
            this.#cleanups.delete(cleanup);
            // eslint-disable-next-line @typescript-eslint/no-floating-promises -- run observes rejection and reports it to this scope's failure owner.
            void this.run(() => task());
        }, delay);
        const cleanup = () => globalThis.clearTimeout(timer);
        this.#cleanups.add(cleanup);
        return cleanup;
    }

    async dispose(reason = 'execution-scope-disposed'): Promise<void> {
        if (this.#disposed) { return; }
        this.#disposed = true;
        this.#controller.abort(reason);
        const cleanups = [...this.#cleanups].reverse();
        this.#cleanups.clear();
        const results = await Promise.allSettled(cleanups.map(cleanup => Promise.resolve().then(cleanup)));
        const errors = results
            .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
            .map(result => result.reason as unknown);
        errors.forEach(error => this.#reportFailure(error));
        await Promise.allSettled([...this.#tasks]);
    }
}
