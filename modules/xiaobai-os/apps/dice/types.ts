import type { XiaobaiOsFileState } from '../../kernel/contracts.js';

export interface DiceClientState {
    chatIdentity: string;
    actionChecksEnabled: boolean;
    encountersEnabled: boolean;
    fileState: XiaobaiOsFileState;
    pending: boolean;
}
