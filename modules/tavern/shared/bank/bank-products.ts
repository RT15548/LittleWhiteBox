import {
    throwTavernBankError,
    type TavernBankDepositProduct,
    type TavernBankFundProduct,
} from './bank-types';

export const TAVERN_BANK_BASIS_POINTS = 10_000 as const;

function freezeDepositProduct(product: TavernBankDepositProduct): TavernBankDepositProduct {
    return Object.freeze({ ...product });
}

function freezeFundProduct(product: TavernBankFundProduct): TavernBankFundProduct {
    return Object.freeze({
        ...product,
        returnRangeBps: Object.freeze({ ...product.returnRangeBps }),
    });
}

/**
 * Immutable contract registry. Published IDs and financial terms stay here
 * after retirement so open positions and archived activities remain valid.
 * A repriced product must receive a new ID instead of mutating an old entry.
 */
export const TAVERN_BANK_DEPOSIT_CONTRACTS: readonly TavernBankDepositProduct[] = Object.freeze([
    freezeDepositProduct({
        id: 'short-term',
        name: '短期存单',
        lockRounds: 10,
        interestBps: 600,
        earlyPenaltyBps: 300,
        minAmount: 100,
        maxAmount: 2_000,
    }),
    freezeDepositProduct({
        id: 'mid-term',
        name: '中期存单',
        lockRounds: 25,
        interestBps: 1_800,
        earlyPenaltyBps: 500,
        minAmount: 200,
        maxAmount: 5_000,
    }),
    freezeDepositProduct({
        id: 'long-term',
        name: '长期存单',
        lockRounds: 50,
        interestBps: 4_500,
        earlyPenaltyBps: 1_000,
        minAmount: 500,
        maxAmount: 10_000,
    }),
]);

/** See TAVERN_BANK_DEPOSIT_CONTRACTS. */
export const TAVERN_BANK_FUND_CONTRACTS: readonly TavernBankFundProduct[] = Object.freeze([
    freezeFundProduct({
        id: 'steady-fund',
        name: '稳健基金',
        description: '小幅波动，稳步前行。',
        lockRounds: 20,
        returnRangeBps: { min: -500, max: 2_000 },
        riskLevel: 'low',
        minAmount: 200,
        maxAmount: 3_000,
    }),
    freezeFundProduct({
        id: 'growth-fund',
        name: '成长基金',
        description: '回报与波动都更明显。',
        lockRounds: 30,
        returnRangeBps: { min: -2_000, max: 5_000 },
        riskLevel: 'medium',
        minAmount: 500,
        maxAmount: 5_000,
    }),
    freezeFundProduct({
        id: 'venture-fund',
        name: '风险基金',
        description: '高波动，收益在到期前不揭晓。',
        lockRounds: 40,
        returnRangeBps: { min: -5_000, max: 15_000 },
        riskLevel: 'high',
        minAmount: 1_000,
        maxAmount: 10_000,
    }),
]);

function assertPositiveSafeInteger(value: unknown, detail: string): number {
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number <= 0) {
        throwTavernBankError('bank_amount_invalid', detail);
    }
    return number;
}

function assertSafeInteger(value: unknown, detail: string): number {
    const number = Number(value);
    if (!Number.isSafeInteger(number)) {
        throwTavernBankError('bank_amount_invalid', detail);
    }
    return number;
}

function assertCatalogRange(minAmount: unknown, maxAmount: unknown, detail: string): void {
    const min = assertPositiveSafeInteger(minAmount, `${detail}:min`);
    const max = assertPositiveSafeInteger(maxAmount, `${detail}:max`);
    if (min > max) {throwTavernBankError('bank_product_invalid', `${detail}:range`);}
}

export function validateTavernBankProductCatalog(input: {
    deposits: readonly TavernBankDepositProduct[];
    funds: readonly TavernBankFundProduct[];
}): void {
    const ids = new Set<string>();
    for (const product of input.deposits) {
        const id = String(product?.id || '').trim();
        if (!id || ids.has(id)) {throwTavernBankError('bank_product_invalid', `deposit:${id || 'id'}`);}
        ids.add(id);
        if (!String(product.name || '').trim() || !Number.isSafeInteger(product.lockRounds) || product.lockRounds <= 0) {
            throwTavernBankError('bank_product_invalid', `deposit:${id}:metadata`);
        }
        if (!Number.isSafeInteger(product.interestBps) || product.interestBps < 0
            || !Number.isSafeInteger(product.earlyPenaltyBps) || product.earlyPenaltyBps < 0
            || product.earlyPenaltyBps >= TAVERN_BANK_BASIS_POINTS) {
            throwTavernBankError('bank_product_invalid', `deposit:${id}:bps`);
        }
        assertCatalogRange(product.minAmount, product.maxAmount, `deposit:${id}`);
        try {
            amountAtTavernBankBps(product.maxAmount, product.interestBps);
            amountAtTavernBankBps(product.maxAmount, -product.earlyPenaltyBps);
        } catch {
            throwTavernBankError('bank_product_invalid', `deposit:${id}:amount-overflow`);
        }
    }
    for (const product of input.funds) {
        const id = String(product?.id || '').trim();
        if (!id || ids.has(id)) {throwTavernBankError('bank_product_invalid', `fund:${id || 'id'}`);}
        ids.add(id);
        if (!String(product.name || '').trim() || !String(product.description || '').trim()
            || !Number.isSafeInteger(product.lockRounds) || product.lockRounds <= 0
            || !['low', 'medium', 'high'].includes(product.riskLevel)) {
            throwTavernBankError('bank_product_invalid', `fund:${id}:metadata`);
        }
        if (!Number.isSafeInteger(product.returnRangeBps?.min) || !Number.isSafeInteger(product.returnRangeBps?.max)
            || product.returnRangeBps.min > product.returnRangeBps.max
            || product.returnRangeBps.min <= -TAVERN_BANK_BASIS_POINTS) {
            throwTavernBankError('bank_product_invalid', `fund:${id}:bps`);
        }
        assertCatalogRange(product.minAmount, product.maxAmount, `fund:${id}`);
        try {
            amountAtTavernBankBps(product.maxAmount, product.returnRangeBps.min);
            amountAtTavernBankBps(product.maxAmount, product.returnRangeBps.max);
        } catch {
            throwTavernBankError('bank_product_invalid', `fund:${id}:amount-overflow`);
        }
    }
}

validateTavernBankProductCatalog({
    deposits: TAVERN_BANK_DEPOSIT_CONTRACTS,
    funds: TAVERN_BANK_FUND_CONTRACTS,
});

const depositContractsById = new Map(TAVERN_BANK_DEPOSIT_CONTRACTS.map((product) => [product.id, product]));
const fundContractsById = new Map(TAVERN_BANK_FUND_CONTRACTS.map((product) => [product.id, product]));

/** Only these immutable contracts are offered for new positions. */
const TAVERN_BANK_DEPOSIT_SHELF_IDS = Object.freeze(['short-term', 'mid-term', 'long-term'] as const);
const TAVERN_BANK_FUND_SHELF_IDS = Object.freeze(['steady-fund', 'growth-fund', 'venture-fund'] as const);

export const TAVERN_BANK_DEPOSIT_PRODUCTS: readonly TavernBankDepositProduct[] = Object.freeze(
    TAVERN_BANK_DEPOSIT_SHELF_IDS.map((id) => getTavernBankDepositContract(id)),
);
export const TAVERN_BANK_FUND_PRODUCTS: readonly TavernBankFundProduct[] = Object.freeze(
    TAVERN_BANK_FUND_SHELF_IDS.map((id) => getTavernBankFundContract(id)),
);

const depositProductsById = new Map(TAVERN_BANK_DEPOSIT_PRODUCTS.map((product) => [product.id, product]));
const fundProductsById = new Map(TAVERN_BANK_FUND_PRODUCTS.map((product) => [product.id, product]));

export function listTavernBankDepositProducts(): readonly TavernBankDepositProduct[] {
    return TAVERN_BANK_DEPOSIT_PRODUCTS;
}

export function listTavernBankFundProducts(): readonly TavernBankFundProduct[] {
    return TAVERN_BANK_FUND_PRODUCTS;
}

export function findTavernBankDepositProduct(productId = ''): TavernBankDepositProduct | null {
    return depositProductsById.get(String(productId || '').trim()) || null;
}

export function findTavernBankFundProduct(productId = ''): TavernBankFundProduct | null {
    return fundProductsById.get(String(productId || '').trim()) || null;
}

export function findTavernBankDepositContract(productId = ''): TavernBankDepositProduct | null {
    return depositContractsById.get(String(productId || '').trim()) || null;
}

export function findTavernBankFundContract(productId = ''): TavernBankFundProduct | null {
    return fundContractsById.get(String(productId || '').trim()) || null;
}

export function getTavernBankDepositProduct(productId = ''): TavernBankDepositProduct {
    const id = String(productId || '').trim();
    if (!id) {throwTavernBankError('bank_product_id_required');}
    return findTavernBankDepositProduct(id) || throwTavernBankError('bank_product_missing', id);
}

export function getTavernBankFundProduct(productId = ''): TavernBankFundProduct {
    const id = String(productId || '').trim();
    if (!id) {throwTavernBankError('bank_product_id_required');}
    return findTavernBankFundProduct(id) || throwTavernBankError('bank_product_missing', id);
}

export function getTavernBankDepositContract(productId = ''): TavernBankDepositProduct {
    const id = String(productId || '').trim();
    if (!id) {throwTavernBankError('bank_product_id_required');}
    return findTavernBankDepositContract(id) || throwTavernBankError('bank_product_missing', id);
}

export function getTavernBankFundContract(productId = ''): TavernBankFundProduct {
    const id = String(productId || '').trim();
    if (!id) {throwTavernBankError('bank_product_id_required');}
    return findTavernBankFundContract(id) || throwTavernBankError('bank_product_missing', id);
}

export function assertTavernBankProductAmount(
    product: Pick<TavernBankDepositProduct, 'minAmount' | 'maxAmount'>,
    amount: unknown,
): number {
    const normalized = assertPositiveSafeInteger(amount, 'principal');
    if (normalized < product.minAmount || normalized > product.maxAmount) {
        throwTavernBankError('bank_amount_out_of_range', String(normalized));
    }
    return normalized;
}

export function multiplyTavernBankAmount(
    amount: unknown,
    numerator: unknown,
    denominator: unknown,
): number {
    const base = assertPositiveSafeInteger(amount, 'amount');
    const multiplier = assertPositiveSafeInteger(numerator, 'numerator');
    const divisor = assertPositiveSafeInteger(denominator, 'denominator');
    if (base > Math.floor(Number.MAX_SAFE_INTEGER / multiplier)) {
        throwTavernBankError('bank_amount_overflow');
    }
    const result = Math.floor((base * multiplier) / divisor);
    if (!Number.isSafeInteger(result) || result < 0) {throwTavernBankError('bank_amount_overflow');}
    return result;
}

export function amountAtTavernBankBps(principal: unknown, bps: unknown): number {
    const amount = assertPositiveSafeInteger(principal, 'principal');
    const returnBps = assertSafeInteger(bps, 'bps');
    const multiplier = TAVERN_BANK_BASIS_POINTS + returnBps;
    if (multiplier < 0) {throwTavernBankError('bank_amount_invalid', 'bps');}
    if (multiplier === 0) {return 0;}
    return multiplyTavernBankAmount(amount, multiplier, TAVERN_BANK_BASIS_POINTS);
}

export interface TavernBankDepositContract {
    maturityAmount: number;
    earlyWithdrawalAmount: number;
}

export function createTavernBankDepositContract(
    product: TavernBankDepositProduct,
    principal: unknown,
): TavernBankDepositContract {
    const amount = assertTavernBankProductAmount(product, principal);
    return {
        maturityAmount: amountAtTavernBankBps(amount, product.interestBps),
        earlyWithdrawalAmount: amountAtTavernBankBps(amount, -product.earlyPenaltyBps),
    };
}

export interface TavernBankFundContract {
    resolvedReturnBps: number;
    settlementAmount: number;
}

export function createTavernBankFundContract(
    product: TavernBankFundProduct,
    principal: unknown,
    resolvedReturnBps: unknown,
): TavernBankFundContract {
    const amount = assertTavernBankProductAmount(product, principal);
    const returnBps = assertSafeInteger(resolvedReturnBps, 'fund-return-bps');
    if (returnBps < product.returnRangeBps.min || returnBps > product.returnRangeBps.max) {
        throwTavernBankError('bank_amount_out_of_range', 'fund-return-bps');
    }
    return {
        resolvedReturnBps: returnBps,
        settlementAmount: amountAtTavernBankBps(amount, returnBps),
    };
}
