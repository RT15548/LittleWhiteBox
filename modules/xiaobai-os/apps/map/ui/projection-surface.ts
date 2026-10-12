import type { MapClientState } from '../types.js';

/** A read-only, movable view owned by the projection, not by a message floor. */
export interface MapProjectionSurface {
    update(state: MapClientState, theme: 'light' | 'dark'): void;
    dispose(): void;
}

export type MountMapProjection = (container: HTMLElement) => MapProjectionSurface;
