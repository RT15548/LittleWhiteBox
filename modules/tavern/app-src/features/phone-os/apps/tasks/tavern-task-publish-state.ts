export interface TavernTaskPublishAvailabilityInput {
    balance: number;
    balanceError: string;
    balanceLoading: boolean;
    balanceReady: boolean;
    blockedReason: string;
    busy: boolean;
    reward: unknown;
}

export interface TavernTaskPublishAvailability {
    escrowAmount: number;
    insufficientFunds: boolean;
    canSubmit: boolean;
}

export function resolveTavernTaskPublishAvailability(
    input: TavernTaskPublishAvailabilityInput,
): TavernTaskPublishAvailability {
    const reward = Number(input.reward);
    const escrowAmount = Number.isSafeInteger(reward) && reward > 0 ? reward : 0;
    const insufficientFunds = input.balanceReady
        && escrowAmount > 0
        && escrowAmount > input.balance;
    return {
        escrowAmount,
        insufficientFunds,
        canSubmit: !input.busy
            && !input.blockedReason
            && !input.balanceLoading
            && !input.balanceError
            && input.balanceReady
            && escrowAmount > 0
            && !insufficientFunds,
    };
}
