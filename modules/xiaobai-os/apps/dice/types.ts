import type { XiaobaiOsFileState } from '../../kernel/contracts.js';

export interface DiceClientState {
    chatIdentity: string;
    enabled: boolean;
    fileState: XiaobaiOsFileState;
    pending: boolean;
}
