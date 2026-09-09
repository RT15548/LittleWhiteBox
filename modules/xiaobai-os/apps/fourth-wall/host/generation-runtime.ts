import type { FourthWallBuiltPrompt, FourthWallGenerationResult } from '../types.js';

export interface FourthWallGenerateOptions {
    config: unknown;
    builtPrompt: FourthWallBuiltPrompt;
    stream: boolean;
    disableAssistantPrefill: boolean;
    signal: AbortSignal;
    onStreamProgress?: (snapshot: FourthWallGenerationResult) => void;
}

export type FourthWallGenerateResponse = (options: FourthWallGenerateOptions) => Promise<FourthWallGenerationResult>;

export interface FourthWallGenerationStartOptions {
    requestId: string;
    builtPrompt: FourthWallBuiltPrompt;
    stream: boolean;
    disableAssistantPrefill: boolean;
    initialize?: (signal: AbortSignal) => Promise<void>;
    prepare?: (config: unknown, signal: AbortSignal) => Promise<FourthWallBuiltPrompt>;
    prepareOnly?: boolean;
    onProgress?: (snapshot: FourthWallGenerationResult) => void;
    onComplete?: (result: FourthWallGenerationResult) => void | Promise<void>;
    onError?: (error: unknown) => void | Promise<void>;
    onCancelled?: (reason: string) => void;
}

export type FourthWallGenerationOutcome =
    | { status: 'completed'; result: FourthWallGenerationResult }
    | { status: 'cancelled' }
    | { status: 'failed'; error: unknown };

interface ActiveGeneration {
    sequence: number;
    requestId: string;
    controller: AbortController;
    initializing: boolean;
    onCancelled?: (reason: string) => void;
}

export interface FourthWallGenerationRuntime {
    start: (options: FourthWallGenerationStartOptions) => {
        requestId: string;
        done: Promise<FourthWallGenerationOutcome>;
    };
    cancel: (reason?: string) => boolean;
    isRunning: () => boolean;
    getRequestId: () => string;
}

function isAbortError(error: unknown): boolean {
    const candidate = error as { name?: unknown; message?: unknown } | null | undefined;
    const name = String(candidate?.name || '');
    const message = String(candidate?.message || error || '');
    return name === 'AbortError' || /abort|aborted|已取消/i.test(message);
}

export function createFourthWallGenerationRuntime({
    generateResponse,
    loadAgentConfig,
}: {
    generateResponse: FourthWallGenerateResponse;
    loadAgentConfig: () => unknown | Promise<unknown>;
}): FourthWallGenerationRuntime {
    if (typeof generateResponse !== 'function' || typeof loadAgentConfig !== 'function') {
        throw new TypeError('generation runtime requires generateResponse and loadAgentConfig');
    }

    let sequence = 0;
    let active: ActiveGeneration | null = null;

    function isCurrent(run: ActiveGeneration): boolean {
        return active === run && run.sequence === sequence && !run.controller.signal.aborted;
    }

    function finishCancellation(run: ActiveGeneration, reason: string): void {
        if (active !== run) { return; }
        active = null;
        sequence += 1;
        run.onCancelled?.(reason);
    }

    function cancel(reason = 'cancelled'): boolean {
        if (!active || active.controller.signal.aborted) {
            return false;
        }
        const run = active;
        run.controller.abort(reason);
        // A pending input write must settle before the caller can decide whether to restore its draft.
        if (!run.initializing) { finishCancellation(run, reason); }
        return true;
    }

    function start(options: FourthWallGenerationStartOptions) {
        cancel('superseded');
        const run: ActiveGeneration = {
            sequence: ++sequence,
            requestId: String(options.requestId || ''),
            controller: new AbortController(),
            initializing: !!options.initialize,
            onCancelled: options.onCancelled,
        };
        active = run;

        const done: Promise<FourthWallGenerationOutcome> = Promise.resolve()
            .then(async (): Promise<FourthWallGenerationOutcome> => {
                try {
                    if (!isCurrent(run)) { return { status: 'cancelled' }; }
                    await options.initialize?.(run.controller.signal);
                } finally {
                    run.initializing = false;
                    if (run.controller.signal.aborted) {
                        finishCancellation(run, String(run.controller.signal.reason || 'cancelled'));
                    }
                }
                if (!isCurrent(run)) { return { status: 'cancelled' }; }
                const config = await loadAgentConfig();
                if (!isCurrent(run)) {
                    return { status: 'cancelled' };
                }
                const builtPrompt = options.prepare ? await options.prepare(config, run.controller.signal) : options.builtPrompt;
                if (!isCurrent(run)) { return { status: 'cancelled' }; }
                const result = options.prepareOnly ? {} : await generateResponse({
                    config,
                    builtPrompt,
                    stream: options.stream === true,
                    disableAssistantPrefill: options.disableAssistantPrefill === true,
                    signal: run.controller.signal,
                    onStreamProgress(snapshot: FourthWallGenerationResult) {
                        if (isCurrent(run)) {
                            options.onProgress?.(snapshot || {});
                        }
                    },
                });
                if (!isCurrent(run)) {
                    return { status: 'cancelled' };
                }
                await options.onComplete?.(result || {});
                if (active === run) {
                    active = null;
                }
                return { status: 'completed', result };
            })
            .catch(async (error) => {
                if (run.controller.signal.aborted || run.sequence !== sequence || isAbortError(error)) {
                    finishCancellation(run, 'aborted');
                    return { status: 'cancelled' };
                }
                active = null;
                await options.onError?.(error);
                return { status: 'failed', error };
            });

        return Object.freeze({ requestId: run.requestId, done });
    }

    return Object.freeze({
        start,
        cancel,
        isRunning: () => active !== null,
        getRequestId: () => active?.requestId || '',
    });
}
