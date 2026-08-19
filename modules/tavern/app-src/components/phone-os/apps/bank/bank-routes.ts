import type { TavernBankPublicGameView } from '../../../../../shared/bank/bank-types';

export const TAVERN_BANK_VAULT_PATH = '/vault';
export const TAVERN_BANK_FLOOR_PATH = '/floor';
export const TAVERN_BANK_RECORDS_PATH = '/records';
export const TAVERN_BANK_DICE_PATH = '/floor/dice';
export const TAVERN_BANK_PUSH_PATH = '/floor/push';
export const TAVERN_BANK_LADDER_PATH = '/floor/ladder';

export const TAVERN_BANK_TAB_PATHS = [
    TAVERN_BANK_VAULT_PATH,
    TAVERN_BANK_FLOOR_PATH,
    TAVERN_BANK_RECORDS_PATH,
];

export const TAVERN_BANK_KNOWN_PATHS = [
    ...TAVERN_BANK_TAB_PATHS,
    TAVERN_BANK_DICE_PATH,
    TAVERN_BANK_PUSH_PATH,
    TAVERN_BANK_LADDER_PATH,
];

export function tavernBankGamePath(kind: TavernBankPublicGameView['kind']): string {
    switch (kind) {
        case 'dice':
            return TAVERN_BANK_DICE_PATH;
        case 'push':
            return TAVERN_BANK_PUSH_PATH;
        case 'ladder':
            return TAVERN_BANK_LADDER_PATH;
        default:
            return TAVERN_BANK_FLOOR_PATH;
    }
}
