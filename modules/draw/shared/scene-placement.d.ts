export interface ScenePlacement {
    mode: 'source' | 'tail';
    insertAfter?: number;
    offset?: number;
    sourceHash?: string;
}

export interface ScenePlacementInsertion {
    placement?: ScenePlacement | null;
    content: string;
}

export declare class ScenePlacementError extends Error {
    code: string;
}

export declare function assertSceneSourceUnchanged(sourceText: string, expectedHash: string): string;

export declare function isSceneSlotAlive(currentText: string, slotId: string): boolean;

export declare function getSceneSlotIds(sourceText: string): string[];

export declare function setActiveMessageText(message: {
    mes?: string;
    swipe_id?: number;
    swipes?: string[];
}, text: string): string;

export declare function insertScenePlacements(
    sourceText: string,
    insertions: ScenePlacementInsertion[],
    options?: { block?: boolean },
): string;

export declare function insertScenePlacementsPreservingSlots(
    sourceText: string,
    insertions: ScenePlacementInsertion[],
    options?: { block?: boolean },
): string;

export declare function removeSceneSlotPlaceholders(
    sourceText: string,
    slotIds?: string[],
    markerName?: string,
): string;

export declare function commitSettledScenePlacements(
    plannedText: string,
    options?: {
        allSlotIds?: string[];
        settledSlotIds?: string[];
    },
): string;

export declare function commitRecoverableScenePlacements(options: {
    getCurrentChatId: () => unknown;
    getCurrentMessage: (messageId: string | number) => { mes?: string } | null | undefined;
    expectedChatId: unknown;
    messageId: string | number;
    message: { mes?: string };
    originalText: string;
    plannedText: string;
    slotIds: string[];
    isEditing?: (messageId: string | number) => boolean;
    persist?: () => Promise<unknown> | unknown;
    syncAfterRollback?: (messageText: string) => Promise<unknown> | unknown;
}): Promise<boolean>;

export declare function commitSceneSlotReplacement(options: {
    message: { mes?: string; swipe_id?: number; swipes?: string[] };
    stagedText: string;
    replacedSlotIds?: string[];
    persist?: () => Promise<unknown> | unknown;
}): Promise<string>;

export declare function commitSceneSlotDelivery(options: {
    committedEarly?: boolean;
    resolveTarget?: () => unknown;
    guard?: () => Promise<unknown> | unknown;
    persist: (target?: unknown) => Promise<unknown> | unknown;
    rollbackPersisted?: () => Promise<unknown> | unknown;
    select?: () => Promise<unknown> | unknown;
    rollbackSelection?: () => Promise<unknown> | unknown;
}): Promise<boolean>;
