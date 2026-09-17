import type { WorldDomain } from '../../domains/world/types.js';
import type { XiaobaiOsFileState } from '../../kernel/contracts.js';

export interface WorldSettings {
    subscribed: boolean;
    injectToStory: boolean;
}

export interface WorldClientState {
    chatIdentity: string;
    world: WorldDomain;
    settings: WorldSettings;
    writeState: XiaobaiOsFileState;
    pendingSave: boolean;
    maintenance: 'idle' | 'running' | 'error';
    message: string;
}
