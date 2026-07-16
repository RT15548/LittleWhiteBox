export type ImageRequestQueueState = {
    ahead: number;
    position: number;
};

export type ImageRequestCooldownState = {
    duration: number;
};

export type ImageRequestQueueCallbacks = {
    signal?: AbortSignal;
    onQueued?: (state: ImageRequestQueueState) => void;
    onStart?: () => void;
    onCooldown?: (state: ImageRequestCooldownState) => void;
};

export type SerialImageRequestQueueOptions = {
    createAbortError?: () => Error;
    getCooldownMs?: () => number;
    waitForCooldown?: (duration: number) => Promise<void>;
};

export type SerialImageRequestQueue = {
    clear: () => void;
    enqueue: <Result>(
        run: () => Result | Promise<Result>,
        callbacks?: ImageRequestQueueCallbacks,
    ) => Promise<Result>;
};

export function createSerialImageRequestQueue(
    options?: SerialImageRequestQueueOptions,
): SerialImageRequestQueue;
