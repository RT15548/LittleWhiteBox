export type SharedImageProgress = (
    status: string,
    ahead?: number,
    delay?: number,
) => void;

export type SharedImageRequest = Record<string, unknown> & {
    prompt?: string;
    signal?: AbortSignal;
    cache?: boolean;
    cacheNamespace?: string;
    onProgress?: SharedImageProgress;
};

export function generateSharedImage(input?: string | SharedImageRequest): Promise<string>;
export function checkGeneratedImageCache(input?: string | SharedImageRequest): Promise<string | null>;
export function clearSharedImageRequests(): void;
export function clearExpiredGeneratedImageCache(): Promise<void>;
