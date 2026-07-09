export type TavernRegexPlacementKey = 'userInput' | 'aiOutput' | 'worldInfo' | 'reasoning';

export interface TavernApplyRegexItem {
    id: string;
    text: string;
    placement: TavernRegexPlacementKey;
    options?: {
        characterOverride?: string;
        isMarkdown?: boolean;
        isPrompt?: boolean;
        isEdit?: boolean;
        depth?: number | null;
    };
}

export interface TavernAppliedRegexItem {
    id: string;
    text: string;
    changed: boolean;
}

export interface TavernApplyRegexResult {
    items: TavernAppliedRegexItem[];
    changedCount: number;
}

export type TavernApplyRegex = (items: TavernApplyRegexItem[], options?: { nativeCharacterId?: string }) => Promise<TavernApplyRegexResult>;

export interface TavernRegexApplicationSummary {
    userInput?: number;
    worldInfo?: number;
    aiOutput?: number;
    reasoning?: number;
}

export function countRegexApplications(items: TavernAppliedRegexItem[] = []): TavernRegexApplicationSummary {
    const summary: TavernRegexApplicationSummary = {};
    items.forEach((item) => {
        const [placement] = String(item.id || '').split(':');
        if (!item.changed || !['userInput', 'worldInfo', 'aiOutput', 'reasoning'].includes(placement)) {return;}
        const key = placement as keyof TavernRegexApplicationSummary;
        summary[key] = (summary[key] || 0) + 1;
    });
    return summary;
}

export function hasRegexApplications(summary?: TavernRegexApplicationSummary): boolean {
    return !!summary && Object.values(summary).some((count) => Number(count) > 0);
}
