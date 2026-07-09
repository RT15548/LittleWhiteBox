export interface TavernSubstituteParamsOptions {
    name1Override?: string;
    name2Override?: string;
    original?: string;
    replaceCharacterCard?: boolean;
}

export interface TavernSubstituteParamsItem {
    id: string;
    text: string;
    options?: TavernSubstituteParamsOptions;
}

export interface TavernSubstitutedParamsItem {
    id: string;
    text: string;
    changed: boolean;
}

export interface TavernSubstituteParamsResult {
    items: TavernSubstitutedParamsItem[];
    changedCount: number;
}

export type TavernApplySubstituteParams = (items: TavernSubstituteParamsItem[]) => Promise<TavernSubstituteParamsResult>;
