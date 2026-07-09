interface TavernAgentAdapterChatOptions {
    systemPrompt?: string;
    messages?: unknown[];
    tools?: unknown[];
    toolChoice?: string;
    temperature?: unknown;
    maxTokens?: unknown;
    signal?: AbortSignal;
    onStreamProgress?: (snapshot: {
        text?: string;
        thoughts?: Array<{ label?: string; text?: string }>;
        toolCalls?: unknown[];
        toolCallDraft?: boolean;
    }) => void;
}

interface TavernAgentAdapterChatResult {
    text?: string;
    thoughts?: Array<{ label?: string; text?: string }>;
    model?: string;
    provider?: string;
    finishReason?: string;
    toolCalls?: unknown[];
    providerPayload?: unknown;
}

declare module 'showdown';

declare module '*.mjs' {
    const value: {
        dump(value: unknown, options?: Record<string, unknown>): string;
        load?(value: string, options?: Record<string, unknown>): unknown;
    };
    export default value;
}

declare module '*.js' {
    const value: unknown;
    export default value;
    export const extensionFolderPath: string;
    export function getRequestHeaders(): Record<string, string>;
    export function getThumbnailUrl(type: string, file: string, t?: boolean): string;
    export function getContext(): Record<string, unknown>;
    export function writeExtensionField(characterId: string | number, key: string, value: unknown): Promise<void>;
    export function getUserAvatars(doRender?: boolean, openPageAt?: string): Promise<string[]>;
    export function setUserAvatar(
        imgfile: string,
        options?: { toastPersonaNameChange?: boolean; navigateToCurrent?: boolean },
    ): Promise<void>;
    export function saveSettingsDebounced(): void;
    export const event_types: Record<string, string>;
    export const eventSource: {
        emit?: (eventName: string, ...args: unknown[]) => unknown;
    };
    export function prepareOpenAIMessages(input: Record<string, unknown>, dryRun?: boolean): Promise<[unknown[] | null, unknown]>;
    export function parseExampleIntoIndividual(messageExampleString: string, appendNamesForGroup?: boolean): unknown[];
    export function parseMesExamples(examplesStr: string, isInstruct?: boolean): string[];
    export function baseChatReplace(value: unknown, name1Override?: string | null, name2Override?: string | null): string;
    export const getMaxPromptTokens: ((overrideResponseLength?: number | null) => number) | undefined;
    export const getMaxContextSize: (() => number) | undefined;
    export const depth_prompt_depth_default: number;
    export const depth_prompt_role_default: string;
    export const extension_settings: Record<string, Record<string, unknown>>;
    export const extension_prompts: Record<string, Record<string, unknown>>;
    export const extension_prompt_types: Record<string, number>;
    export const extension_prompt_roles: Record<string, number>;
    export const inject_ids: {
        CUSTOM_WI_DEPTH: string;
        CUSTOM_WI_OUTLET: (key: string) => string;
        [key: string]: unknown;
    };
    export function setExtensionPrompt(
        key: string,
        value: string,
        position: number,
        depth: number,
        scan?: boolean,
        role?: number,
        filter?: unknown,
    ): void;
    export function getPresetManager(apiId?: string): {
        getSelectedPresetName?: () => string;
        getAllPresets?: () => string[];
        getCompletionPresetByName?: (name: string) => unknown;
        getPresetSettings?: (name?: string) => unknown;
        savePreset?: (name: string, preset?: unknown) => Promise<void>;
        findPreset?: (name: string) => unknown;
        selectPreset?: (value: unknown) => void;
    } | null;
    export const promptManager: {
        activeCharacter?: unknown;
        serviceSettings?: Record<string, unknown>;
        getPromptCollection?: (generationType?: string) => { collection?: unknown[] };
        getPromptOrderForCharacter?: (character?: Record<string, unknown>) => unknown[];
        saveServiceSettings?: () => Promise<void> | void;
        render?: (force?: boolean) => void;
    } | null;
    export const context_presets: Array<Record<string, unknown>>;
    export const instruct_presets: Array<Record<string, unknown>>;
    export const system_prompts: Array<Record<string, unknown>>;
    export const power_user: Record<string, unknown>;
    export const persona_description_positions: Record<string, number>;
    export const user_avatar: string;
    export const chat_metadata: Record<string, unknown>;
    export const characters: Array<Record<string, unknown>>;
    export const this_chid: string | number | undefined;
    export function select_selected_character(chid: string | number, options?: { switchMenu?: boolean }): void;
    export function unshallowCharacter(characterId?: string | number): Promise<void>;
    export function getOneCharacter(avatarUrl: string): Promise<void>;
    export const name2: string;
    export function setCharacterId(value?: string | number | null): void;
    export function setCharacterName(value: string): void;
    export const tag_map: Record<string, string[]>;
    export function getTagKeyForEntity(entityId?: string | number | null): string;
    export function getCurrentChatId(): string | null;
    export function substituteParams(content: unknown, options?: Record<string, unknown>): string;
    export function executeSlashCommandsWithOptions(command: string, options?: Record<string, unknown>): Promise<Record<string, unknown>>;
    export const world_info: Record<string, unknown>;
    export const world_info_position: Record<string, number>;
    export const world_names: string[];
    export const selected_world_info: string[];
    export const METADATA_KEY: string;
    export function getWorldInfoSettings(): Record<string, unknown>;
    export const updateWorldInfoSettings: ((settings: Record<string, unknown>, activeWorldInfo?: string[]) => void) | undefined;
    export function updateWorldInfoList(): Promise<void>;
    export function checkWorldInfo(
        chat: string[],
        maxContext: number,
        isDryRun: boolean,
        globalScanData?: Record<string, unknown>,
    ): Promise<Record<string, unknown>>;
    export function openWorldInfoEditor(worldName: string): void;
    export function loadWorldInfo(name: string): Promise<Record<string, unknown> | null>;
    export function saveWorldInfo(name: string, data: Record<string, unknown>, immediately?: boolean): Promise<void>;
    export function convertCharacterBook(characterBook: Record<string, unknown>): Record<string, unknown>;
    export function charUpdatePrimaryWorld(name: string): Promise<void>;
    export function createWorldInfoEntry(name: string, data: Record<string, unknown>): Record<string, unknown> | undefined;
    export function splitKeywordsAndRegexes(input: string): string[];
    export function getCharaFilename(chid?: string | number | null, options?: Record<string, unknown>): string;
    export const SCRIPT_TYPES: { GLOBAL: number; SCOPED: number; PRESET: number };
    export const regex_placement: Record<string, number>;
    export const substitute_find_regex: { NONE: number; RAW: number; ESCAPED: number };
    export const RegexProvider: { instance?: { clear?: () => void } } | undefined;
    export function getRegexedString(rawString: string, placement: number, options?: Record<string, unknown>): string;
    export function runRegexScript(regexScript: Record<string, unknown>, rawString: string, options?: Record<string, unknown>): string;
    export function getScriptsByType(scriptType: number, options?: { allowedOnly?: boolean }): Array<Record<string, unknown>>;
    export function saveScriptsByType(scripts: Array<Record<string, unknown>>, scriptType: number): Promise<void>;
    export function isScopedScriptsAllowed(character?: unknown): boolean;
    export function allowScopedScripts(character?: unknown): void;
    export function isPresetScriptsAllowed(apiId?: string | null, presetName?: string | null): boolean;
    export function allowPresetScripts(apiId?: string | null, presetName?: string | null): void;
    export function getCurrentPresetAPI(): string | null;
    export function getCurrentPresetName(): string | null;
    export const AssistantStorage: {
        get<T = unknown>(key: string, fallback?: T): Promise<T>;
        load(): Promise<Record<string, unknown>>;
        saveNow(options?: Record<string, unknown>): Promise<void>;
        _dirtyVersion?: number;
    };
    export const AGENT_SETTINGS_CONFIG_VERSION: number;
    export function normalizeAgentSettings(settings: Record<string, unknown>): Record<string, unknown>;
    export function normalizeAgentConfig(settings: Record<string, unknown>): Record<string, unknown>;
    export function normalizeJsApiPermission(value: unknown): string;
    export function normalizePresetName(value: unknown): string;
    export function createFirstPartyIframeOverlay(options: {
        overlayId: string;
        iframeId: string;
        htmlPath: string;
        version?: string;
        overlayCss?: string;
        iframeCss?: string;
    }): Promise<HTMLElement>;
    export function loadFirstPartyIframeCacheKey(path: string): Promise<string>;
    export function isTrustedMessage(event: MessageEvent, iframe: HTMLIFrameElement | null, source: string): boolean;
    export function postToIframe(iframe: HTMLIFrameElement, message: unknown, source: string): boolean;
    export function createLightBrakeController(options?: {
        threshold?: number;
        getMessageText?: (toolName: string, errorCode: string, count: number) => string;
    }): {
        record(toolName: string, errorCode: string): void;
        reset(): void;
        getMessage(): string;
    };
    export function createAgentAdapter(
        config: Record<string, unknown>,
        options?: Record<string, unknown>,
    ): { chat(options: TavernAgentAdapterChatOptions): Promise<TavernAgentAdapterChatResult> };
    export function setHostChatCompletionsRequestHeadersProvider(
        provider: null | (() => Record<string, unknown> | Promise<Record<string, unknown>>),
    ): void;
    export function resolveActiveProviderConfig(
        config: Record<string, unknown>,
        options?: Record<string, unknown>,
    ): Record<string, unknown>;
    export const TAVILY_TOOL_NAME: string;
    export function getTavilySearchToolDefinition(): {
        type: 'function';
        function: { name: string; description: string; parameters: unknown };
    };
    export function isTavilyConfigured(config?: Record<string, unknown>): boolean;
    export function runTavilySearchTool(
        config?: Record<string, unknown>,
        args?: Record<string, unknown>,
        options?: Record<string, unknown>,
    ): Promise<Record<string, unknown>>;
    export function applyTextEdits(content: string, edits: unknown): {
        ok: boolean;
        content: string;
        appliedCount?: number;
        warning?: string;
        results?: unknown;
    };
    export function buildProviderAssistantToolCallMessage(
        result?: Record<string, unknown>,
        toolCalls?: unknown[],
        options?: Record<string, unknown>,
    ): Record<string, unknown>;
    export function buildProviderToolResultMessage(message?: Record<string, unknown>): Record<string, unknown>;
    export function hasVisibleText(text: unknown): boolean;
    export function resolveResultToolCalls(
        result?: Record<string, unknown>,
        providerConfig?: Record<string, unknown>,
        options?: Record<string, unknown>,
    ): Array<{ id: string; name: string; arguments: string }>;
    export const HTML_PREVIEW_SANDBOX: string;
    export function renderMarkdownToHtml(text: string, options?: Record<string, unknown>): string;
    export function enhanceMarkdownContent(rootNode: ParentNode, options?: Record<string, unknown>): ParentNode;
    export function postToIframe(iframe: HTMLIFrameElement, payload: Record<string, unknown>, source?: string, targetOrigin?: string | null): boolean;
    export function getIframeBaseScript(): string;
    export function getWrapperScript(): string;
    export function replaceXbGetVarInString(value: string): string;
    export function createAgentSettingsPanel(deps?: Record<string, unknown>): {
        getActiveProviderConfig(options?: Record<string, unknown>): Record<string, unknown>;
        syncConfigToForm(root: ParentNode): void;
        bindSettingsPanelEvents(root: ParentNode): void;
    };
    export function buildAgentSettingsPanelMarkup(options?: Record<string, unknown>): string;
    export const NOTE_MODULE_NAME: string;
    export const metadata_keys: Record<string, string>;
    export function setFloatingPrompt(): void;
}
