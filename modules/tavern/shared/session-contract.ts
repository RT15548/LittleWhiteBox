export type TavernContractTier = 'silent-operations' | 'fate-arbitration' | 'narrative-orchestration';

export type TavernContractPermissionKey =
    | 'memoryArchiving'
    | 'cartographyEngine'
    | 'statusPanel'
    | 'actionChecks'
    | 'randomEncounters'
    | 'questOrchestration';

export interface TavernSessionContract {
    memoryArchiving: boolean;
    cartographyEngine: boolean;
    statusPanel: boolean;
    actionChecks: boolean;
    randomEncounters: boolean;
    questOrchestration: boolean;
}

export interface TavernContractManagerPromptOptions {
    includeMemory: boolean;
    includeCartography: boolean;
    includeStatus: boolean;
    includeQuestOrchestration: boolean;
}

export interface TavernContractRuntimeCapability {
    includeMemoryFiles?: boolean;
    includeStructuredStates?: boolean;
    includeStatusStates?: boolean;
    includeActionChecks?: boolean;
    includeRandomEncounters?: boolean;
    automaticManagerWork?: boolean;
    managerPromptMemory?: boolean;
    managerPromptCartography?: boolean;
    managerPromptStatus?: boolean;
}

export interface TavernSessionContractRuntime {
    contract: TavernSessionContract;
    enabledKeys: TavernContractPermissionKey[];
    includeMemoryFiles: boolean;
    includeStructuredStates: boolean;
    includeStatusStates: boolean;
    includeActionChecks: boolean;
    includeRandomEncounters: boolean;
    includeQuestOrchestration: boolean;
    hasAutomaticManagerWork: boolean;
    managerPromptOptions: TavernContractManagerPromptOptions;
}

export interface TavernContractMandateDefinition {
    key: TavernContractPermissionKey;
    tier: TavernContractTier;
    icon: string;
    title: string;
    summary: string;
    description: string;
}

export const DEFAULT_TAVERN_SESSION_CONTRACT: TavernSessionContract = {
    memoryArchiving: true,
    cartographyEngine: true,
    statusPanel: true,
    actionChecks: true,
    randomEncounters: true,
    questOrchestration: false,
};

export const TAVERN_SESSION_CONTRACT_KEYS: TavernContractPermissionKey[] = [
    'memoryArchiving',
    'cartographyEngine',
    'statusPanel',
    'actionChecks',
    'randomEncounters',
    'questOrchestration',
];

export const TAVERN_CONTRACT_TIER_LABELS: Record<TavernContractTier, string> = {
    'silent-operations': '暗中行事',
    'fate-arbitration': '命运仲裁',
    'narrative-orchestration': '叙事编排',
};

export const TAVERN_CONTRACT_MANDATES: TavernContractMandateDefinition[] = [
    {
        key: 'memoryArchiving',
        tier: 'silent-operations',
        icon: '📓',
        title: '记忆存档',
        summary: '',
        description: '授权代理人管理你的长期记忆。它将默默维护、压缩和召回上下文——确保故事永不遗忘。',
    },
    {
        key: 'cartographyEngine',
        tier: 'silent-operations',
        icon: '🗺️',
        title: '制图引擎',
        summary: '',
        description: '允许代理人在你探索时生成、更新和渲染空间数据。随着叙事展开，区域、地标和兴趣点将在附录面板中逐渐显现。',
    },
    {
        key: 'statusPanel',
        tier: 'silent-operations',
        icon: '📋',
        title: '角色档案',
        summary: '',
        description: '授权代理人持续记录状态面板。属性、状态、随身之物与关系亲疏，将被默默记录与更新。',
    },
    {
        key: 'actionChecks',
        tier: 'fate-arbitration',
        icon: '🎲',
        title: '行动检定',
        summary: '',
        description: '当你尝试不确定的事——说服陌生人、翻越高墙、破译符文——由骰子裁决，而非AI。一次真随机掷骰仲裁结果，故事顺从命运。',
    },
    {
        key: 'randomEncounters',
        tier: 'fate-arbitration',
        icon: '⚔️',
        title: '随机遭遇',
        summary: '',
        description: '允许世界给你意外。每隔一段时间，一颗无形的骰子在暗中滚动。当它落定，意料之外的事降临——路上的伏击、天空中的异兆、门缝下塞进的一封信。',
    },
    {
        key: 'questOrchestration',
        tier: 'narrative-orchestration',
        icon: '🧭',
        title: '织线者',
        summary: '',
        description: '让代理人感知你故事中的暗流，浮现接下来可能发生的事。当势头停滞，一根线索显现——追随它、忽视它，或任它消散。',
    },
];

export const TAVERN_CONTRACT_RUNTIME_CAPABILITIES: Record<TavernContractPermissionKey, TavernContractRuntimeCapability> = {
    memoryArchiving: {
        includeMemoryFiles: true,
        automaticManagerWork: true,
        managerPromptMemory: true,
    },
    cartographyEngine: {
        includeStructuredStates: true,
        automaticManagerWork: true,
        managerPromptCartography: true,
    },
    statusPanel: {
        includeStatusStates: true,
        automaticManagerWork: true,
        managerPromptStatus: true,
    },
    actionChecks: {
        includeActionChecks: true,
    },
    randomEncounters: {
        includeRandomEncounters: true,
    },
    questOrchestration: {
        automaticManagerWork: true,
    },
};

export function normalizeTavernSessionContract(value: unknown): TavernSessionContract {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
    return {
        memoryArchiving: 'memoryArchiving' in source ? Boolean(source.memoryArchiving) : DEFAULT_TAVERN_SESSION_CONTRACT.memoryArchiving,
        cartographyEngine: 'cartographyEngine' in source ? Boolean(source.cartographyEngine) : DEFAULT_TAVERN_SESSION_CONTRACT.cartographyEngine,
        statusPanel: 'statusPanel' in source ? Boolean(source.statusPanel) : DEFAULT_TAVERN_SESSION_CONTRACT.statusPanel,
        actionChecks: 'actionChecks' in source ? Boolean(source.actionChecks) : DEFAULT_TAVERN_SESSION_CONTRACT.actionChecks,
        randomEncounters: 'randomEncounters' in source ? Boolean(source.randomEncounters) : DEFAULT_TAVERN_SESSION_CONTRACT.randomEncounters,
        questOrchestration: 'questOrchestration' in source ? Boolean(source.questOrchestration) : DEFAULT_TAVERN_SESSION_CONTRACT.questOrchestration,
    };
}

export function hasTavernSessionContractOverride(value: unknown): value is Partial<TavernSessionContract> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {return false;}
    return TAVERN_SESSION_CONTRACT_KEYS.some((key) => Object.prototype.hasOwnProperty.call(value, key));
}

export function mergeTavernSessionContract(
    current: Partial<TavernSessionContract> | null | undefined,
    override: Partial<TavernSessionContract> | null | undefined,
): TavernSessionContract {
    return normalizeTavernSessionContract({
        ...normalizeTavernSessionContract(current),
        ...(hasTavernSessionContractOverride(override) ? override : {}),
    });
}

export function countActiveTavernSessionContract(value: Partial<TavernSessionContract> | null | undefined): number {
    const contract = normalizeTavernSessionContract(value);
    return Object.values(contract).filter(Boolean).length;
}

export function getTavernContractMandateDefinition(key: TavernContractPermissionKey): TavernContractMandateDefinition | undefined {
    return TAVERN_CONTRACT_MANDATES.find((mandate) => mandate.key === key);
}

export function resolveTavernSessionContractRuntime(
    value: Partial<TavernSessionContract> | null | undefined,
): TavernSessionContractRuntime {
    const contract = normalizeTavernSessionContract(value);
    const enabledKeys = TAVERN_SESSION_CONTRACT_KEYS.filter((key) => contract[key]);
    const runtime = enabledKeys.reduce<TavernSessionContractRuntime>((current, key) => {
        const capability = TAVERN_CONTRACT_RUNTIME_CAPABILITIES[key];
        if (!capability) {return current;}
        return {
            ...current,
            includeMemoryFiles: current.includeMemoryFiles || capability.includeMemoryFiles === true,
            includeStructuredStates: current.includeStructuredStates || capability.includeStructuredStates === true,
            includeStatusStates: current.includeStatusStates || capability.includeStatusStates === true,
            includeActionChecks: current.includeActionChecks || capability.includeActionChecks === true,
            includeRandomEncounters: current.includeRandomEncounters || capability.includeRandomEncounters === true,
            includeQuestOrchestration: current.includeQuestOrchestration || key === 'questOrchestration',
            hasAutomaticManagerWork: current.hasAutomaticManagerWork || capability.automaticManagerWork === true,
            managerPromptOptions: {
                includeMemory: current.managerPromptOptions.includeMemory || capability.managerPromptMemory === true,
                includeCartography: current.managerPromptOptions.includeCartography || capability.managerPromptCartography === true,
                includeStatus: current.managerPromptOptions.includeStatus || capability.managerPromptStatus === true,
                includeQuestOrchestration: current.managerPromptOptions.includeQuestOrchestration || key === 'questOrchestration',
            },
        };
    }, {
        contract,
        enabledKeys,
        includeMemoryFiles: false,
        includeStructuredStates: false,
        includeStatusStates: false,
        includeActionChecks: false,
        includeRandomEncounters: false,
        includeQuestOrchestration: false,
        hasAutomaticManagerWork: false,
        managerPromptOptions: {
            includeMemory: false,
            includeCartography: false,
            includeStatus: false,
            includeQuestOrchestration: false,
        },
    });
    return runtime;
}
