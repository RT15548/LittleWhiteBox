import {
    type XbTavernCharacter,
    type XbTavernContext,
    type XbTavernHistoryMessage,
    type XbTavernUser,
    type XbTavernWorldBook,
    type XbTavernWorldEntry,
} from './message-assembler';

export interface SillyTavernContextSource {
    nativeCharacterId?: number | string;
    characters?: unknown[];
    character?: unknown;
    chat?: unknown[];
    name1?: string;
    name2?: string;
    userPersona?: string;
    persona?: string;
    selectedWorldInfo?: string[] | string;
    selected_world_info?: string[] | string;
    globalWorldNames?: string[];
    globalSelect?: string[] | string;
    charLore?: Array<{ name?: string; extraBooks?: string[] }>;
    sessionMeta?: Record<string, unknown>;
}

export interface BuildXbTavernContextOptions {
    worldBooks?: XbTavernWorldBook[];
    extraWorldBooks?: XbTavernWorldBook[];
    worldbookNames?: string[];
    includeChat?: boolean;
    historyLimit?: number;
}

export interface SillyTavernWorldbookSource {
    name: string;
    sourceType: 'character' | 'global';
    sourceIndex: number;
}

function normalizeText(value: unknown = ''): string {
    return String(value || '').trim();
}

function isSystemCharacterName(value: unknown = ''): boolean {
    return /^(sillytavern\s+system|system)\b/i.test(normalizeText(value));
}

function cloneJson<T>(value: T): T {
    try {
        return JSON.parse(JSON.stringify(value)) as T;
    } catch {
        return value;
    }
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function hashString(value = ''): string {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

function buildCharacterKey(character: Record<string, unknown>, _nativeCharacterId: unknown): string {
    const data = pickData(character);
    const name = normalizeText(character.name || data.name);
    const avatar = normalizeText(character.avatar || data.avatar);
    if (avatar) {return `avatar:${avatar}`;}
    const payload = normalizeText(character.json_data) || JSON.stringify(data || character || {});
    const hash = hashString(payload || name);
    if (payload) {return `card:${hash}`;}
    return `name:${name || 'unknown'}`;
}

function readEntryList(value: unknown): unknown[] {
    if (Array.isArray(value)) {return value;}
    const record = asRecord(value);
    return Object.keys(record).length ? Object.values(record) : [];
}

function pickCharacter(source: SillyTavernContextSource = {}): Record<string, unknown> {
    if (source.character && typeof source.character === 'object') {return asRecord(source.character);}
    const id = source.nativeCharacterId;
    if (id === undefined || id === null) {return {};}
    const index = Number(id);
    if (!Number.isInteger(index)) {return {};}
    return asRecord(asArray(source.characters)[index]);
}

function pickData(character: Record<string, unknown>): Record<string, unknown> {
    return asRecord(character.data) || {};
}

export function normalizeSillyTavernCharacter(source: SillyTavernContextSource = {}): XbTavernCharacter {
    const character = pickCharacter(source);
    const data = pickData(character);
    const nativeCharacterId = source.nativeCharacterId;
    const name = [
        character.name,
        data.name,
        source.name2,
    ].map((value) => normalizeText(value)).find((value) => value && !isSystemCharacterName(value)) || '';
    return {
        characterKey: Object.keys(character).length ? buildCharacterKey(character, nativeCharacterId) : '',
        nativeCharacterId: normalizeText(nativeCharacterId),
        name,
        avatar: normalizeText(character.avatar || data.avatar),
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

export function normalizeSillyTavernUser(source: SillyTavernContextSource = {}): XbTavernUser {
    return {
        name: normalizeText(source.name1) || 'User',
        persona: normalizeText(source.userPersona || source.persona),
    };
}

export function normalizeSillyTavernHistory(source: SillyTavernContextSource = {}, options: BuildXbTavernContextOptions = {}): XbTavernHistoryMessage[] {
    if (options.includeChat === false) {return [];}
    const raw = asArray(source.chat);
    const limit = Number(options.historyLimit);
    const selected = Number.isFinite(limit) && limit > 0 ? raw.slice(-limit) : raw;
    return selected.map((item) => {
        const message = asRecord(item);
        return {
            role: message.is_user ? 'user' as const : 'assistant' as const,
            name: normalizeText(message.name),
            content: normalizeText(message.mes || message.message || message.content),
            is_user: !!message.is_user,
        };
    }).filter((message) => message.content);
}

function addUnique(target: string[], value: unknown): void {
    if (Array.isArray(value)) {
        value.forEach((item) => addUnique(target, item));
        return;
    }
    const text = normalizeText(value);
    if (text && !target.includes(text)) {target.push(text);}
}

function addUniqueSource(
    target: SillyTavernWorldbookSource[],
    seen: Set<string>,
    source: Omit<SillyTavernWorldbookSource, 'sourceIndex'>,
): void {
    const name = normalizeText(source.name);
    if (!name || seen.has(name)) {return;}
    seen.add(name);
    target.push({
        ...source,
        name,
        sourceIndex: target.length,
    });
}

function makeWorldbookEntryKey(entry: XbTavernWorldEntry = {}, fallbackIndex = 0): string {
    const uid = normalizeText(entry.uid ?? entry.id);
    if (uid) {return `uid:${uid}`;}
    const bodyKey = [
        'body',
        normalizeText(entry.comment || entry.title || entry.name),
        normalizeText(entry.content),
        JSON.stringify(entry.key || ''),
        JSON.stringify(entry.keysecondary || entry.secondary_keys || ''),
    ].join('\u0000');
    return bodyKey === 'body\u0000\u0000\u0000""\u0000""' ? `empty:${fallbackIndex}` : bodyKey;
}

function dedupeWorldBooks(books: XbTavernWorldBook[] = []): XbTavernWorldBook[] {
    const byName = new Map<string, XbTavernWorldBook>();
    books.forEach((book, bookIndex) => {
        const name = normalizeText(book.name) || `worldbook-${bookIndex + 1}`;
        const existing = byName.get(name) || {
            ...book,
            name,
            entries: [],
        };
        if (!existing.error && book.error) {existing.error = book.error;}
        const seen = new Set(existing.entries.map((entry, index) => makeWorldbookEntryKey(entry, index)));
        (Array.isArray(book.entries) ? book.entries : []).forEach((entry, entryIndex) => {
            const key = makeWorldbookEntryKey(entry, entryIndex);
            if (seen.has(key)) {return;}
            seen.add(key);
            existing.entries.push(entry);
        });
        byName.set(name, existing);
    });
    return Array.from(byName.values());
}

export function collectSillyTavernWorldbookSources(source: SillyTavernContextSource = {}, options: BuildXbTavernContextOptions = {}): SillyTavernWorldbookSource[] {
    const character = pickCharacter(source);
    const data = pickData(character);
    const extensions = asRecord(data.extensions);
    const characterBook = asRecord(data.character_book);
    const sources: SillyTavernWorldbookSource[] = [];
    const seen = new Set<string>();
    const globalNames: string[] = [];
    addUnique(globalNames, source.selectedWorldInfo);
    addUnique(globalNames, source.selected_world_info);
    addUnique(globalNames, source.globalWorldNames);
    const globalSet = new Set(globalNames);
    const characterNames: string[] = [];
    addUnique(characterNames, options.worldbookNames);
    addUnique(characterNames, extensions.world);
    addUnique(characterNames, character.world);
    if (!readEntryList(characterBook.entries).length) {
        addUnique(characterNames, characterBook.name);
    }

    const characterLoreIds: string[] = [];
    addUnique(characterLoreIds, character.avatar);
    addUnique(characterLoreIds, data.avatar);
    const characterLoreIdSet = new Set(characterLoreIds);
    asArray(source.charLore).forEach((entry) => {
        const record = asRecord(entry);
        if (characterLoreIdSet.has(normalizeText(record.name))) {
            addUnique(characterNames, record.extraBooks);
        }
    });

    characterNames
        .filter((name) => !globalSet.has(name))
        .forEach((name) => addUniqueSource(sources, seen, { name, sourceType: 'character' }));
    globalNames.forEach((name) => addUniqueSource(sources, seen, { name, sourceType: 'global' }));
    return sources;
}

export function collectSillyTavernWorldbookNames(source: SillyTavernContextSource = {}, options: BuildXbTavernContextOptions = {}): string[] {
    return collectSillyTavernWorldbookSources(source, options).map((item) => item.name);
}

export function normalizeWorldbookData(name = '', data: unknown, source?: Partial<SillyTavernWorldbookSource>): XbTavernWorldBook {
    const record = asRecord(data);
    const rawEntries = record.entries && !Array.isArray(record.entries)
        ? Object.values(asRecord(record.entries))
        : asArray(record.entries);
    const worldSourceType = normalizeText(source?.sourceType || record.worldSourceType);
    const worldSourceIndex = Number.isFinite(Number(source?.sourceIndex ?? record.worldSourceIndex))
        ? Number(source?.sourceIndex ?? record.worldSourceIndex)
        : undefined;
    return {
        name: normalizeText(name || record.name),
        ...(worldSourceType ? { worldSourceType } : {}),
        ...(worldSourceIndex !== undefined ? { worldSourceIndex } : {}),
        entries: rawEntries.map((entry) => ({
            ...cloneJson(asRecord(entry)),
            sourceWorldBook: normalizeText(name || record.name),
            ...(worldSourceType ? { worldSourceType } : {}),
            ...(worldSourceIndex !== undefined ? { worldSourceIndex } : {}),
        }) as XbTavernWorldEntry),
    };
}

function applyWorldbookSource(book: XbTavernWorldBook, source?: SillyTavernWorldbookSource): XbTavernWorldBook {
    if (!source) {return book;}
    return {
        ...book,
        worldSourceType: source.sourceType,
        worldSourceIndex: source.sourceIndex,
        entries: (Array.isArray(book.entries) ? book.entries : []).map((entry) => ({
            ...entry,
            worldSourceType: entry.worldSourceType || source.sourceType,
            worldSourceIndex: Number.isFinite(Number(entry.worldSourceIndex)) ? entry.worldSourceIndex : source.sourceIndex,
        })),
    } as XbTavernWorldBook;
}

export function buildXbTavernContextFromSillyTavern(
    source: SillyTavernContextSource = {},
    options: BuildXbTavernContextOptions = {},
): XbTavernContext {
    const worldbookSources = collectSillyTavernWorldbookSources(source, options);
    const sourceByName = new Map(worldbookSources.map((item) => [item.name, item]));
    const worldBooks = dedupeWorldBooks([
        ...(Array.isArray(options.worldBooks) ? options.worldBooks.map((book) => applyWorldbookSource(book, sourceByName.get(book.name))) : []),
        ...(Array.isArray(options.extraWorldBooks) ? options.extraWorldBooks.map((book) => applyWorldbookSource(book, sourceByName.get(book.name))) : []),
    ]);
    return {
        character: normalizeSillyTavernCharacter(source),
        user: normalizeSillyTavernUser(source),
        history: normalizeSillyTavernHistory(source, options),
        worldBooks,
        worldEntries: worldBooks.flatMap((book) => Array.isArray(book.entries)
            ? book.entries.map((entry) => ({
                ...entry,
                sourceWorldBook: entry.sourceWorldBook || book.name,
            }))
            : []),
        sessionMeta: {
            ...(source.sessionMeta || {}),
            worldbookNames: worldbookSources.map((item) => item.name),
            worldbookSources,
        },
    };
}
