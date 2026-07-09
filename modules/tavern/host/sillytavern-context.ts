import { extension_settings, getContext } from '../../../../../../extensions.js';
import { power_user } from '../../../../../../power-user.js';
import { user_avatar } from '../../../../../../personas.js';
import { getTagKeyForEntity, tag_map } from '../../../../../../tags.js';
import { getCharaFilename } from '../../../../../../utils.js';
import { getWorldInfoSettings, selected_world_info, world_info } from '../../../../../../world-info.js';
import { characters as sillyTavernCharacters, getOneCharacter, getRequestHeaders, getThumbnailUrl, unshallowCharacter } from '../../../../../../../script.js';

const LITTLE_WHITE_BOX_EXT_ID = 'LittleWhiteBox';

interface TavernHostOptions {
    nativeCharacterId?: string | number;
    includeHistory?: boolean;
    includeWorldbooks?: boolean;
    onStartupProgress?: (payload: { percent: number; action: string }) => void;
}

interface TavernHostDiagnostics {
    ok: boolean;
    message: string;
    worldbookErrors: Array<{ name: string; error: string }>;
}

interface TavernHostCharacterOption {
    characterKey: string;
    nativeCharacterId: string;
    name: string;
    avatar: string;
    shallow: boolean;
    description: string;
    personality: string;
    scenario: string;
    firstMessage: string;
    alternateGreetings: string[];
    mesExample: string;
    creatorNotes: string;
    characterDepthPrompt: string;
}

interface TavernHostContextPayload {
    context: Record<string, unknown>;
    diagnostics: TavernHostDiagnostics;
    availableCharacters: TavernHostCharacterOption[];
    selectedCharacterKey: string;
    htmlRenderEnabled: boolean;
    hostMainFontSizePx: string;
    hostProseLineHeightPx: string;
}

interface TavernWorldbookSource {
    name: string;
    sourceType: 'character' | 'global';
    sourceIndex: number;
}

function normalizeText(value: unknown = ''): string {
    return String(value || '').trim();
}

function normalizePositivePx(value: unknown, fallback: number): number {
    const parsed = Number.parseFloat(String(value || ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatPx(value: number, fallback: string): string {
    return Number.isFinite(value) && value > 0
        ? `${Math.round(value * 100) / 100}px`
        : fallback;
}

function getHostTypographyMetrics(): Pick<TavernHostContextPayload, 'hostMainFontSizePx' | 'hostProseLineHeightPx'> {
    const root = document.documentElement;
    const body = document.body || root;
    const rootStyles = getComputedStyle(root);
    const bodyStyles = getComputedStyle(body);
    const mainFontSizePx = normalizePositivePx(bodyStyles.fontSize, 15);
    const rootFontSizePx = normalizePositivePx(rootStyles.fontSize, 16);
    const proseLineHeightPx = mainFontSizePx + (rootFontSizePx * 0.5);
    return {
        hostMainFontSizePx: formatPx(mainFontSizePx, '15px'),
        hostProseLineHeightPx: formatPx(proseLineHeightPx, '23px'),
    };
}

function isHtmlRenderEnabled(): boolean {
    return asRecord(extension_settings?.[LITTLE_WHITE_BOX_EXT_ID]).renderEnabled !== false;
}

function isSystemCharacterName(value: unknown = ''): boolean {
    return /^(sillytavern\s+system|system)\b/i.test(normalizeText(value));
}

function toAbsoluteAvatarUrl(value: unknown = ''): string {
    const text = normalizeText(value);
    if (!text) {return '';}
    if (/^(data:|blob:|https?:)/i.test(text)) {return text;}
    const origin = typeof location !== 'undefined' && location.origin ? location.origin : '';
    if (text.startsWith('User Avatars/')) {return `${origin}/${text}`;}
    const encoded = text
        .replace(/^\/+/, '')
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');
    return `${origin}/${encoded}`;
}

function normalizeCharacterAvatar(value: unknown = ''): string {
    const text = normalizeText(value);
    if (!text) {return '';}
    if (/^(data:|blob:|https?:)/i.test(text)) {return text;}
    if (text === 'none') {return '';}
    if (text.startsWith('img/')) {return toAbsoluteAvatarUrl(text);}
    try {
        return getThumbnailUrl('avatar', text);
    } catch {
        return `/thumbnail?type=avatar&file=${encodeURIComponent(text)}`;
    }
}

function pickUserAvatarFromDom(): string {
    const selectors = ['#user_avatar_block img', '#avatar_user img', '.user_avatar img', 'img#avatar_user', '.st-user-avatar img'];
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (!(element instanceof HTMLImageElement)) {continue;}
        const highRes = element.getAttribute('data-izoomify-url');
        if (highRes) {return highRes;}
        if (element.src) {return element.src;}
    }
    return '';
}

function normalizePersonaAvatar(personaId = ''): string {
    const id = normalizeText(personaId);
    if (!id) {return '';}
    try {
        return getThumbnailUrl('persona', id);
    } catch {
        return `/thumbnail?type=persona&file=${encodeURIComponent(id)}`;
    }
}

function normalizeUserAvatar(): string {
    let avatar = pickUserAvatarFromDom() || readGlobalString('default_user_avatar');
    const personaMatch = String(avatar).match(/\/thumbnail\?type=persona&file=([^&]+)/i);
    if (personaMatch) {
        avatar = decodeURIComponent(personaMatch[1] || '');
    }
    if (avatar && !/^(data:|blob:|https?:)/i.test(String(avatar)) && !String(avatar).startsWith('img/')) {
        return `/thumbnail?type=persona&file=${encodeURIComponent(String(avatar))}`;
    }
    return toAbsoluteAvatarUrl(avatar);
}

function readPersonaName(avatarId = ''): string {
    const id = normalizeText(avatarId);
    if (!id) {return '';}
    return normalizeText(asRecord(power_user?.personas)[id]);
}

function readPersonaDescription(avatarId = ''): string {
    const id = normalizeText(avatarId);
    if (!id) {return '';}
    const raw = asRecord(power_user?.persona_descriptions)[id];
    if (typeof raw === 'string') {return normalizeText(raw);}
    const details = asRecord(raw);
    return normalizeText(details.description || details.title);
}

function asArray<T = unknown>(value: unknown): T[] {
    return Array.isArray(value) ? value as T[] : [];
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function mergeCharacterRecord(primary: Record<string, unknown> = {}, fallback: Record<string, unknown> = {}): Record<string, unknown> {
    const primaryData = asRecord(primary.data);
    const fallbackData = asRecord(fallback.data);
    const data = Object.keys(primaryData).length || Object.keys(fallbackData).length
        ? { ...fallbackData, ...primaryData }
        : undefined;
    return data
        ? { ...fallback, ...primary, data }
        : { ...fallback, ...primary };
}

function readEntryList(value: unknown): Record<string, unknown>[] {
    if (Array.isArray(value)) {return value.map((item) => asRecord(item));}
    const record = asRecord(value);
    return Object.keys(record).length ? Object.values(record).map((item) => asRecord(item)) : [];
}

function addUnique(target: string[], value: unknown): void {
    if (Array.isArray(value)) {
        value.forEach((item) => addUnique(target, item));
        return;
    }
    const text = normalizeText(value);
    if (text && !target.includes(text)) {target.push(text);}
}

function addUniqueSource(target: TavernWorldbookSource[], seen: Set<string>, source: Omit<TavernWorldbookSource, 'sourceIndex'>): void {
    const name = normalizeText(source.name);
    if (!name || seen.has(name)) {return;}
    seen.add(name);
    target.push({
        ...source,
        name,
        sourceIndex: target.length,
    });
}

function cloneJson<T>(value: T): T {
    try {
        return JSON.parse(JSON.stringify(value)) as T;
    } catch {
        return value;
    }
}

function makeWorldbookEntryKey(entry: Record<string, unknown> = {}, fallbackIndex = 0): string {
    const uid = normalizeText(entry.uid ?? entry.id);
    if (uid) {return `uid:${uid}`;}
    const bodyKey = [
        'body',
        normalizeText(entry.comment),
        normalizeText(entry.content),
        JSON.stringify(entry.key || ''),
        JSON.stringify(entry.keysecondary || entry.secondary_keys || ''),
    ].join('\u0000');
    return bodyKey === 'body\u0000\u0000\u0000""\u0000""' ? `empty:${fallbackIndex}` : bodyKey;
}

function dedupeWorldBooks(books: Array<Record<string, unknown>> = []): Array<Record<string, unknown>> {
    const byName = new Map<string, Record<string, unknown>>();
    books.forEach((book, bookIndex) => {
        const name = normalizeText(book.name) || `worldbook-${bookIndex + 1}`;
        const existing = byName.get(name);
        if (!existing) {
            byName.set(name, {
                ...book,
                name,
                entries: [],
            });
        }
        const target = byName.get(name) as Record<string, unknown>;
        if (!target.error && book.error) {target.error = book.error;}
        const seen = new Set(readEntryList(target.entries).map((entry, index) => makeWorldbookEntryKey(entry, index)));
        readEntryList(book.entries).forEach((entry, entryIndex) => {
            const key = makeWorldbookEntryKey(entry, entryIndex);
            if (seen.has(key)) {return;}
            seen.add(key);
            (target.entries as Record<string, unknown>[]).push(entry);
        });
    });
    return Array.from(byName.values());
}

function getWindowRecord(): Record<string, unknown> {
    return window as unknown as Record<string, unknown>;
}

function readGlobalString(name = ''): string {
    return normalizeText(getWindowRecord()[name]);
}

function hashString(value = ''): string {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

function stableJson(value: unknown): string {
    if (value === null || value === undefined) {return '';}
    if (typeof value !== 'object') {return JSON.stringify(value);}
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableJson(item)).join(',')}]`;
    }
    const record = asRecord(value);
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`;
}

function rawCharacterAvatarName(character: Record<string, unknown>, data: Record<string, unknown>, nativeCharacterId: unknown): string {
    const raw = normalizeText(character.avatar || data.avatar);
    if (raw && raw !== 'none' && !/^(data:|blob:|https?:)/i.test(raw)) {
        return raw.replace(/\\/g, '/').split('/').filter(Boolean).pop() || raw;
    }
    try {
        return normalizeText(getCharaFilename(nativeCharacterId as string | number | null));
    } catch {
        return '';
    }
}

function buildCharacterKey(character: Record<string, unknown>, nativeCharacterId: unknown): string {
    const data = asRecord(character.data) || character;
    const name = normalizeText(character.name || data.name);
    const avatar = rawCharacterAvatarName(character, data, nativeCharacterId);
    if (avatar) {
        return `avatar:${avatar}`;
    }
    const cardPayload = normalizeText(character.json_data) || stableJson(data) || stableJson(character);
    const hash = hashString(cardPayload || name);
    if (cardPayload) {
        return `card:${hash}`;
    }
    return `name:${name || 'unknown'}`;
}

async function hydrateCharacterAt(index: number): Promise<void> {
    if (!Number.isInteger(index) || index < 0) {return;}
    const character = asRecord(sillyTavernCharacters?.[index]);
    const avatar = normalizeText(character.avatar);
    if (!avatar || avatar === 'none') {return;}
    if (character.shallow !== true && normalizeText(character.json_data)) {return;}
    try {
        if (character.shallow === true) {
            await unshallowCharacter(String(index));
            return;
        }
        await getOneCharacter(avatar);
    } catch (error) {
        console.warn('[LittleWhiteBox/tavern] Failed to hydrate character card', index, error);
    }
}

async function hydrateSelectedCharacter(ctx: Record<string, unknown>, options: TavernHostOptions): Promise<void> {
    const index = Number(resolveNativeCharacterId(ctx, options));
    if (Number.isInteger(index)) {
        await hydrateCharacterAt(index);
    }
}

function resolveNativeCharacterId(_ctx: Record<string, unknown> = getContext?.() || {}, options: TavernHostOptions = {}): unknown {
    return options.nativeCharacterId;
}

function getCurrentCharacter(ctx: Record<string, unknown> = getContext?.() || {}, options: TavernHostOptions = {}): Record<string, unknown> | null {
    const id = resolveNativeCharacterId(ctx, options);
    const index = Number(id);
    const runtime = Number.isInteger(index) ? asRecord(sillyTavernCharacters?.[index]) : {};
    const getCharacter = typeof ctx.getCharacter === 'function' ? ctx.getCharacter as (id: unknown) => unknown : null;
    if (getCharacter && id !== undefined && id !== null) {
        try {
            const character = getCharacter(id);
            if (character && typeof character === 'object') {
                return mergeCharacterRecord(runtime, character as Record<string, unknown>);
            }
        } catch {}
    }
    if (Array.isArray(ctx.characters) && id !== undefined && id !== null) {
        const character = ctx.characters[index];
        if (character && typeof character === 'object') {
            return mergeCharacterRecord(runtime, character as Record<string, unknown>);
        }
    }
    if (Object.keys(runtime).length) {return runtime;}
    return null;
}

function normalizeCharacter(ctx: Record<string, unknown> = getContext?.() || {}, options: TavernHostOptions = {}): Record<string, unknown> {
    const character = getCurrentCharacter(ctx, options) || {};
    const nativeCharacterId = resolveNativeCharacterId(ctx, options);
    if (nativeCharacterId === undefined || nativeCharacterId === null || !Object.keys(character).length) {
        return {
            characterKey: '',
            nativeCharacterId: '',
            name: '',
            avatar: '',
            tags: [],
            description: '',
            personality: '',
            scenario: '',
            firstMessage: '',
            alternateGreetings: [],
            mesExample: '',
            creatorNotes: '',
            data: {},
        };
    }
    const data = asRecord(character.data) || character;
    const name = [
        character.name,
        data.name,
        ctx.name2,
    ].map((value) => normalizeText(value)).find((value) => value && !isSystemCharacterName(value)) || '';
    const tagKey = getTagKeyForEntity?.(nativeCharacterId as string | number | null);
    const tags = tagKey && Array.isArray(tag_map?.[tagKey])
        ? tag_map[tagKey].map((item) => normalizeText(item)).filter(Boolean)
        : [];
    return {
        characterKey: buildCharacterKey(character, nativeCharacterId),
        nativeCharacterId: normalizeText(nativeCharacterId),
        name,
        avatar: normalizeCharacterAvatar(character.avatar || data.avatar || readGlobalString('default_avatar')),
        tags,
        description: normalizeText(data.description || character.description),
        personality: normalizeText(data.personality || character.personality),
        scenario: normalizeText(data.scenario || character.scenario),
        firstMessage: normalizeText(data.first_mes || character.first_mes),
        alternateGreetings: asArray(data.alternate_greetings || character.alternate_greetings).map(normalizeText).filter(Boolean),
        mesExample: normalizeText(data.mes_example || character.mes_example),
        creatorNotes: normalizeText(data.creator_notes || character.creator_notes),
        data: cloneJson(data),
    };
}

function normalizeUser(ctx: Record<string, unknown> = getContext?.() || {}): Record<string, unknown> {
    const personaId = normalizeText(user_avatar);
    return {
        id: personaId,
        name: readPersonaName(personaId) || normalizeText(ctx.name1) || 'User',
        avatar: normalizePersonaAvatar(personaId) || normalizeUserAvatar(),
        persona: readPersonaDescription(personaId) || normalizeText(ctx.userPersona || ctx.persona),
    };
}

function readCharacterAvatarName(ctx: Record<string, unknown> = getContext?.() || {}, options: TavernHostOptions = {}): string {
    const character = getCurrentCharacter(ctx, options) || {};
    const data = asRecord(character.data) || character;
    const raw = normalizeText(data.avatar || character.avatar);
    if (raw && !/^(data:|blob:|https?:)/i.test(raw)) {
        return raw.replace(/\\/g, '/').split('/').filter(Boolean).pop() || raw;
    }
    try {
        return normalizeText(getCharaFilename(resolveNativeCharacterId(ctx, options) as string | number | null));
    } catch {
        return '';
    }
}

function normalizeAuthorNote(ctx: Record<string, unknown> = getContext?.() || {}, options: TavernHostOptions = {}): Record<string, unknown> {
    const noteSettings = asRecord(extension_settings?.note);
    const characterName = readCharacterAvatarName(ctx, options);
    const charaNote = Array.isArray(noteSettings.chara)
        ? noteSettings.chara.map(asRecord).find((entry) => normalizeText(entry.name) === characterName)
        : null;
    return {
        prompt: normalizeText(noteSettings.default),
        interval: Number(noteSettings.defaultInterval ?? 0),
        position: Number(noteSettings.defaultPosition ?? 1),
        depth: Number(noteSettings.defaultDepth ?? 4),
        role: Number(noteSettings.defaultRole ?? 0),
        scan: noteSettings.allowWIScan === true,
        characterName,
        characterPrompt: normalizeText(charaNote?.prompt),
        characterUse: charaNote?.useChara === true,
        characterPosition: Number(charaNote?.position ?? 0),
    };
}

function collectWorldbookSources(ctx: Record<string, unknown> = getContext?.() || {}, options: TavernHostOptions = {}): TavernWorldbookSource[] {
    const character = getCurrentCharacter(ctx, options) || {};
    const data = asRecord(character.data) || character;
    const dataExtensions = asRecord(data.extensions);
    const characterBook = asRecord(data.character_book);
    const worldInfo = asRecord(world_info);
    const sources: TavernWorldbookSource[] = [];
    const seen = new Set<string>();
    const globalNames: string[] = [];
    addUnique(globalNames, selected_world_info);
    const globalSet = new Set(globalNames);

    const characterNames: string[] = [];
    addUnique(characterNames, dataExtensions.world);
    addUnique(characterNames, character.world);
    if (!readEntryList(characterBook.entries).length) {
        addUnique(characterNames, characterBook.name);
    }
    const characterLoreIds: string[] = [];
    addUnique(characterLoreIds, character.avatar);
    addUnique(characterLoreIds, data.avatar);
    try {
        addUnique(characterLoreIds, getCharaFilename(resolveNativeCharacterId(ctx, options) as string | number | null));
    } catch {}
    const characterLoreIdSet = new Set(characterLoreIds);
    asArray<Record<string, unknown>>(worldInfo.charLore).forEach((entry) => {
        if (characterLoreIdSet.has(normalizeText(entry?.name))) {
            addUnique(characterNames, entry?.extraBooks);
        }
    });
    characterNames
        .filter((name) => !globalSet.has(name))
        .forEach((name) => addUniqueSource(sources, seen, { name, sourceType: 'character' }));
    globalNames.forEach((name) => addUniqueSource(sources, seen, { name, sourceType: 'global' }));
    return sources;
}

function buildWorldSettings(ctx: Record<string, unknown> = getContext?.() || {}): Record<string, unknown> {
    const settings = getWorldInfoSettings();
    const maxContext = Math.max(0, Number(ctx.maxContext) || 0);
    const budgetPercent = Math.min(100, Math.max(1, Number(settings.world_info_budget ?? 25)));
    const percentBudgetChars = maxContext > 0 ? Math.round(maxContext * 4 * budgetPercent / 100) : 0;
    const cap = Number(settings.world_info_budget_cap ?? 0);
    const capChars = Number.isFinite(cap) && cap > 0 ? Math.round(cap * 4) : 0;
    const budgetChars = capChars > 0 && percentBudgetChars > 0
        ? Math.min(capChars, percentBudgetChars)
        : capChars || percentBudgetChars || 24000;
    const maxRecursionSteps = Math.max(0, Number(settings.world_info_max_recursion_steps) || 0);
    return {
        scanDepth: Math.max(0, Number(settings.world_info_depth) || 0),
        caseSensitive: settings.world_info_case_sensitive === true,
        matchWholeWords: settings.world_info_match_whole_words === true,
        includeNames: settings.world_info_include_names === true,
        useGroupScoring: settings.world_info_use_group_scoring === true,
        minActivations: Math.max(0, Number(settings.world_info_min_activations) || 0),
        minActivationsDepthMax: Math.max(0, Number(settings.world_info_min_activations_depth_max) || 0),
        recursion: settings.world_info_recursive === true,
        recursionLimit: maxRecursionSteps,
        insertionStrategy: Number.isFinite(Number(settings.world_info_character_strategy))
            ? Number(settings.world_info_character_strategy)
            : 1,
        budgetChars,
    };
}

function listCharacters(ctx: Record<string, unknown> = getContext?.() || {}): TavernHostCharacterOption[] {
    const contextCharacters = asArray<Record<string, unknown>>(ctx.characters);
    const runtimeCharacters = asArray<Record<string, unknown>>(sillyTavernCharacters);
    const count = Math.max(contextCharacters.length, runtimeCharacters.length);
    return Array.from({ length: count }, (_, index) => {
        const character = mergeCharacterRecord(asRecord(runtimeCharacters[index]), asRecord(contextCharacters[index]));
        const data = asRecord(character?.data) || character || {};
        const extensions = asRecord(data.extensions);
        const depthPrompt = asRecord(extensions.depth_prompt);
        const legacyDepthPrompt = asRecord(data.depth_prompt);
        return {
            characterKey: buildCharacterKey(character, index),
            nativeCharacterId: String(index),
            name: normalizeText(character?.name || data.name || `Character ${index + 1}`),
            avatar: normalizeCharacterAvatar(character?.avatar || data.avatar || readGlobalString('default_avatar')),
            shallow: character.shallow === true,
            description: normalizeText(data.description || character.description),
            personality: normalizeText(data.personality || character.personality),
            scenario: normalizeText(data.scenario || character.scenario),
            firstMessage: normalizeText(data.first_mes || character.first_mes),
            alternateGreetings: asArray(data.alternate_greetings || character.alternate_greetings).map(normalizeText).filter(Boolean),
            mesExample: normalizeText(data.mes_example || character.mes_example),
            creatorNotes: normalizeText(data.creator_notes || character.creator_notes),
            characterDepthPrompt: normalizeText(
                depthPrompt.prompt
                || data.character_depth_prompt
                || legacyDepthPrompt.prompt
                || (typeof data.depth_prompt === 'string' ? data.depth_prompt : ''),
            ),
        };
    }).filter((character) => character.name && !isSystemCharacterName(character.name));
}

async function fetchWorldbook(source: TavernWorldbookSource): Promise<Record<string, unknown>> {
    const response = await fetch('/api/worldinfo/get', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({ name: source.name }),
    });
    if (!response.ok) {throw new Error(`worldbook_http_${response.status}`);}
    const data = await response.json();
    let entries = data?.entries;
    if (entries && !Array.isArray(entries)) {entries = Object.values(entries);}
    return {
        name: source.name,
        worldSourceType: source.sourceType,
        worldSourceIndex: source.sourceIndex,
        entries: Array.isArray(entries)
            ? entries.map((entry) => ({
                ...asRecord(entry),
                sourceWorldBook: source.name,
                worldSourceType: source.sourceType,
                worldSourceIndex: source.sourceIndex,
            }))
            : [],
    };
}

export async function buildTavernContext(options: TavernHostOptions = {}): Promise<TavernHostContextPayload> {
    const ctx = (getContext?.() || {}) as Record<string, unknown>;
    options.onStartupProgress?.({ percent: 25, action: 'hydrateSelectedCharacter' });
    await hydrateSelectedCharacter(ctx, options);
    const includeWorldbooks = options.includeWorldbooks !== false;
    options.onStartupProgress?.({ percent: 32, action: 'collectWorldbookSources' });
    const worldbookSources = collectWorldbookSources(ctx, options);
    const worldbookNames = worldbookSources.map((source) => source.name);
    const fetchedWorldBooks = includeWorldbooks
        ? await Promise.all(worldbookSources.map(async (source, index) => {
            try {
                const span = worldbookSources.length > 1 ? 14 / (worldbookSources.length - 1) : 0;
                options.onStartupProgress?.({
                    percent: Math.round(worldbookSources.length > 1 ? 38 + (index * span) : 45),
                    action: `fetchWorldbook:${source.name}`,
                });
                return await fetchWorldbook(source);
            } catch (error) {
                return {
                    name: source.name,
                    worldSourceType: source.sourceType,
                    worldSourceIndex: source.sourceIndex,
                    entries: [],
                    error: error instanceof Error ? error.message : String(error || 'worldbook_failed'),
                };
            }
        }))
        : [];
    options.onStartupProgress?.({ percent: 58, action: 'assembleTavernContext' });
    const worldBooks = dedupeWorldBooks([
        ...fetchedWorldBooks,
    ]);
    const context = {
        character: normalizeCharacter(ctx, options),
        user: normalizeUser(ctx),
        authorNote: normalizeAuthorNote(ctx, options),
        history: [] as Array<Record<string, unknown>>,
        worldSettings: buildWorldSettings(ctx),
        worldBooks,
        worldEntries: worldBooks.flatMap((book) => Array.isArray(book.entries) ? book.entries : []),
        sessionMeta: {
            worldbookNames,
            worldbookSources,
            worldbookSourcesSynced: true,
            worldbooksIncluded: includeWorldbooks,
            chatLength: 0,
            historySource: 'littlewhitebox-session',
            source: 'sillytavern-character-card',
        },
    };
    const character = asRecord(context.character);
    return {
        context,
        diagnostics: {
            ok: !!character.name,
            message: character.name
                ? `已同步小白会话角色和 ${worldBooks.length} 本世界书`
                : '当前没有选中角色，页面会先显示空状态',
            worldbookErrors: worldBooks.filter((book) => book.error).map((book) => ({
                name: normalizeText(book.name),
                error: normalizeText(book.error),
            })),
        },
        availableCharacters: listCharacters(ctx),
        selectedCharacterKey: normalizeText(asRecord(context.character).characterKey),
        htmlRenderEnabled: isHtmlRenderEnabled(),
        ...getHostTypographyMetrics(),
    };
}
