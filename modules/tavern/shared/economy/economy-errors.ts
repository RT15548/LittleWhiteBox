export type TavernEconomyErrorCode =
    | 'economy_session_required'
    | 'economy_session_missing'
    | 'economy_account_id_invalid'
    | 'economy_account_missing'
    | 'economy_account_state_invalid'
    | 'economy_amount_invalid'
    | 'economy_anchor_order_invalid'
    | 'economy_anchor_order_regression'
    | 'economy_ledger_order_invalid'
    | 'economy_idempotency_key_required'
    | 'economy_idempotency_conflict'
    | 'economy_transfer_accounts_same'
    | 'economy_balance_insufficient'
    | 'economy_balance_overflow'
    | 'economy_transaction_missing'
    | 'economy_transaction_already_reversed'
    | 'economy_reversal_anchor_invalid';

export class TavernEconomyError extends Error {
    readonly code: TavernEconomyErrorCode;

    constructor(code: TavernEconomyErrorCode, detail = '') {
        super(detail ? `${code}:${detail}` : code);
        this.name = 'TavernEconomyError';
        this.code = code;
    }
}

export function throwTavernEconomyError(code: TavernEconomyErrorCode, detail = ''): never {
    throw new TavernEconomyError(code, detail);
}
