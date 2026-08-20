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

export declare function insertScenePlacements(
    sourceText: string,
    insertions: ScenePlacementInsertion[],
    options?: { block?: boolean },
): string;

export declare function removeSceneSlotPlaceholders(
    sourceText: string,
    slotIds?: string[],
    markerName?: string,
): string;

export declare function settleSceneSlotPlaceholders(options?: {
    currentText?: string;
    originalText?: string;
    allSlotIds?: string[];
    completedSlotIds?: string[];
    successCount?: number;
}): string;
