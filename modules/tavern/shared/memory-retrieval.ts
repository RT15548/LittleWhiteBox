import type {
    XbTavernContext,
    XbTavernMemoryContext,
} from './message-assembler';
import {
    getCharacterNameFromMemoryPath,
    getTavernMemoryFile,
    isCharacterMemoryPath,
    isStateMemoryPath,
    getTavernMemoryIndex,
    rebuildTavernMemoryDerivedIndex,
    isReservedUserMemoryCharacterName,
} from './memory-files';
import { buildTavernSpatialStateDigest, listTavernStructuredStateDigests } from './structured-state';
import {
    type TavernMemoryFileRecord,
    type TavernMemoryIndexFileEntry,
} from './session-db';

export interface XbTavernMemorySelectionInput {
    memoryFiles?: Array<TavernMemoryIndexFileEntry | TavernMemoryFileRecord>;
    queryText?: string;
    ignoredTerms?: string[];
}

const MEMORY_QUERY_CONTEXT_MESSAGE_COUNT = 2;

const DEFAULT_MEMORY_TEXT_FILTER_RULES = [
    { start: '<think>', end: '</think>' },
    { start: '<thinking>', end: '</thinking>' },
    { start: '```', end: '```' },
];

function normalizeEntityKey(value: unknown = ''): string {
    return String(value || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '')
        .trim();
}

function normalizeEntityText(value: unknown = ''): string {
    return String(value || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .toLowerCase();
}

function normalizeEntitySourceText(value: unknown = ''): string {
    return String(value || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '');
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyMemoryTextFilterRules(text: string, rules: Array<{ start?: unknown; end?: unknown }> = []): string {
    if (!text || !rules.length) {return text;}
    let result = text;
    for (const rule of rules) {
        const start = String(rule?.start ?? '');
        const end = String(rule?.end ?? '');
        if (!start && !end) {continue;}
        if (start && end) {
            result = result.replace(new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`, 'gi'), '');
        } else if (start) {
            const index = result.toLowerCase().indexOf(start.toLowerCase());
            if (index >= 0) {result = result.slice(0, index);}
        } else if (end) {
            const index = result.toLowerCase().indexOf(end.toLowerCase());
            if (index >= 0) {result = result.slice(index + end.length);}
        }
    }
    return result.trim();
}

function getConfiguredMemoryTextFilterRules(): Array<{ start?: unknown; end?: unknown }> {
    try {
        const storage = (globalThis as unknown as { localStorage?: { getItem?: (key: string) => string | null } }).localStorage;
        const raw = storage?.getItem?.('summary_panel_config');
        if (!raw) {return DEFAULT_MEMORY_TEXT_FILTER_RULES;}
        const parsed = JSON.parse(raw) as { textFilterRules?: unknown; vector?: { textFilterRules?: unknown } };
        const rules = Array.isArray(parsed?.textFilterRules)
            ? parsed.textFilterRules
            : Array.isArray(parsed?.vector?.textFilterRules)
                ? parsed.vector.textFilterRules
                : DEFAULT_MEMORY_TEXT_FILTER_RULES;
        return rules.filter((rule): rule is { start?: unknown; end?: unknown } => !!rule && typeof rule === 'object');
    } catch {
        return DEFAULT_MEMORY_TEXT_FILTER_RULES;
    }
}

function normalizeIgnoredTerms(values: unknown[] = []): Set<string> {
    return new Set(values
        .map((value) => normalizeEntityKey(value))
        .filter((value) => value.length >= 2));
}

function isSelectableEntityKey(entityKey: string): boolean {
    if (entityKey.length < 2) {return false;}
    if (/^[a-z0-9]+$/.test(entityKey) && entityKey.length < 3) {return false;}
    return true;
}

function isLatinEntityText(value: string): boolean {
    return /^[a-z0-9\s_-]+$/.test(value.trim());
}

interface EntityNameMatch {
    coordinate: 'text' | 'compact';
    start: number;
    end: number;
    length: number;
    tokenCount: number;
}

function isCapitalizedLatinToken(value = ''): boolean {
    return /^[A-Z0-9]/.test(value);
}

function isSingleLatinNameInsideLongerName(scanSourceText: string, start: number, end: number): boolean {
    const before = scanSourceText.slice(0, start).match(/([A-Za-z0-9]+)([\s_-]+)$/);
    if (before && (before[2].includes('-') || before[2].includes('_')) && isCapitalizedLatinToken(before[1])) {
        return true;
    }
    const after = scanSourceText.slice(end).match(/^([\s_-]+)([A-Za-z0-9]+)/);
    if (!after) {return false;}
    return after[1].includes('-') || after[1].includes('_') || isCapitalizedLatinToken(after[2]);
}

function findEntityNameMatches(characterName: string, scanText: string, scanSourceText: string, scanKey: string): EntityNameMatch[] {
    const entityText = normalizeEntityText(characterName).trim();
    const entityKey = normalizeEntityKey(characterName);
    if (!isSelectableEntityKey(entityKey)) {return [];}
    if (isLatinEntityText(entityText)) {
        const tokens = entityText.split(/[\s_-]+/).filter(Boolean);
        if (!tokens.length) {return [];}
        const pattern = tokens.map(escapeRegex).join('[\\s_-]+');
        const matcher = new RegExp(`(^|[^a-z0-9])(${pattern})(?=$|[^a-z0-9])`, 'gi');
        const matches: EntityNameMatch[] = [];
        for (const match of scanText.matchAll(matcher)) {
            const prefix = match[1] || '';
            const matchedText = match[2] || '';
            const start = Number(match.index || 0) + prefix.length;
            const end = start + matchedText.length;
            if (tokens.length === 1 && isSingleLatinNameInsideLongerName(scanSourceText, start, end)) {
                continue;
            }
            matches.push({
                coordinate: 'text',
                start,
                end,
                length: matchedText.replace(/[\s_-]+/g, '').length,
                tokenCount: tokens.length,
            });
        }
        return matches;
    }
    const start = scanKey.indexOf(entityKey);
    if (start < 0) {return [];}
    return [{
        coordinate: 'compact',
        start,
        end: start + entityKey.length,
        length: entityKey.length,
        tokenCount: 1,
    }];
}

function isCoveredByLongerEntityMatch(match: EntityNameMatch & { path: string }, other: EntityNameMatch & { path: string }): boolean {
    if (match.path === other.path || match.coordinate !== other.coordinate) {return false;}
    if (other.start > match.start || other.end < match.end) {return false;}
    return other.tokenCount > match.tokenCount || other.length > match.length;
}

function stripSpeakerPrefixes(text: string, names: string[] = []): string {
    const labels = [
        ...names,
        'user',
        'assistant',
        '用户',
        '角色',
        '玩家',
        '旁白',
    ].map((name) => String(name || '').trim()).filter(Boolean);
    if (!labels.length) {return text;}
    const labelPattern = labels.map(escapeRegex).join('|');
    return String(text || '').split(/\r?\n/).map((line) => (
        line.replace(new RegExp(`^\\s*(?:${labelPattern})\\s*[:：]\\s*`, 'i'), '')
    )).join('\n');
}

function cleanMemoryText(value: unknown = ''): string {
    return applyMemoryTextFilterRules(String(value || ''), getConfiguredMemoryTextFilterRules())
        .replace(/\[tts:[^\]]*]/gi, ' ')
        .replace(/<state>[\s\S]*?<\/state>/gi, ' ')
        .replace(/<status[^>]*>[\s\S]*?<\/status>/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function cleanSourceTextForManager(value: unknown = ''): string {
    return String(value || '')
        .replace(/\[(?:tavern-image|img|图片)\s*:[^\]]*]/gi, ' ')
        .replace(/\r\n/g, '\n')
        .trim();
}

function memoryFileTitle(file: TavernMemoryIndexFileEntry | TavernMemoryFileRecord): string {
    if ('title' in file && file.title) {return String(file.title || '').trim();}
    const heading = 'content' in file ? String(file.content || '').match(/^\s*#\s+(.+?)\s*$/m)?.[1] : '';
    return String(heading || file.path.split('/').pop() || file.path).trim();
}

function memoryFilePromptContent(file: TavernMemoryIndexFileEntry | TavernMemoryFileRecord): string {
    return String(('content' in file ? file.content : '') || ('preview' in file ? file.preview : '') || '');
}

function isRecallMemoryFile(file: Pick<TavernMemoryIndexFileEntry, 'path' | 'status'> | Pick<TavernMemoryFileRecord, 'path' | 'status'>): boolean {
    const path = String(file.path || '');
    if (file.status === 'stale') {return false;}
    const characterName = getCharacterNameFromMemoryPath(path);
    if (characterName && isReservedUserMemoryCharacterName(characterName)) {return false;}
    return isStateMemoryPath(path) || isCharacterMemoryPath(path);
}

async function hydrateSelectedMemoryPromptContent(sessionId = '', context: XbTavernMemoryContext = {}): Promise<XbTavernMemoryContext> {
    const files = Array.isArray(context.memoryFiles) ? context.memoryFiles : [];
    if (!files.length) {return context;}
    const hydrated = await Promise.all(files.map(async (file) => ({
        summary: file,
        record: await getTavernMemoryFile(sessionId, file.path),
    })));
    return {
        ...context,
        memoryFiles: hydrated.map(({ summary, record }) => record
            ? { ...summary, content: String(record.content || '') }
            : summary),
    };
}

export function buildXbTavernMemoryIgnoredTerms(context: XbTavernContext = {}): string[] {
    return [
        context.user?.name,
    ].map((value) => String(value || '').trim()).filter((value) => value.length >= 2);
}

export function buildXbTavernMemoryQuery(context: XbTavernContext = {}, currentUserMessage = ''): string {
    const history = Array.isArray(context.history) ? context.history.slice(-MEMORY_QUERY_CONTEXT_MESSAGE_COUNT) : [];
    const names = buildXbTavernMemoryIgnoredTerms(context);
    const cleanLine = (value: unknown) => stripSpeakerPrefixes(cleanMemoryText(value), names);
    return [
        cleanLine(currentUserMessage),
        ...history.map((message) => cleanLine(message.content || message.mes || message.message || '')),
        cleanLine(context.character?.name || ''),
    ].filter(Boolean).join('\n');
}

export function selectXbTavernMemoryContext(input: XbTavernMemorySelectionInput = {}): XbTavernMemoryContext {
    const memoryFiles = [...(input.memoryFiles || [])]
        .filter(isRecallMemoryFile)
        .sort((left, right) => left.path.localeCompare(right.path));
    const ignoredTerms = normalizeIgnoredTerms(input.ignoredTerms || []);
    const scanSourceText = normalizeEntitySourceText(input.queryText || '');
    const scanText = normalizeEntityText(input.queryText || '');
    const scanKey = normalizeEntityKey(scanText);
    const characterMatches = memoryFiles
        .map((file) => ({
            file,
            characterName: getCharacterNameFromMemoryPath(file.path),
        }))
        .flatMap((item) => {
            if (!isCharacterMemoryPath(item.file.path)) {return [];}
            const entityKey = normalizeEntityKey(item.characterName);
            if (!isSelectableEntityKey(entityKey) || ignoredTerms.has(entityKey)) {return [];}
            return findEntityNameMatches(item.characterName, scanText, scanSourceText, scanKey).map((match) => ({
                ...match,
                path: item.file.path,
                file: item.file,
                characterName: item.characterName,
            }));
        });
    const selectedCharacterPaths = new Set(characterMatches
        .filter((match) => !characterMatches.some((other) => isCoveredByLongerEntityMatch(match, other)))
        .map((match) => match.path));
    const selectedMemoryFiles = memoryFiles
        .filter((file) => isStateMemoryPath(file.path) || selectedCharacterPaths.has(file.path))
        .map((file) => ({
            file,
            characterName: getCharacterNameFromMemoryPath(file.path),
        }))
        .sort((left, right) => {
            const leftState = isStateMemoryPath(left.file.path) ? 0 : 1;
            const rightState = isStateMemoryPath(right.file.path) ? 0 : 1;
            return leftState - rightState || left.file.path.localeCompare(right.file.path);
        })
        .map((item) => ({
            ...item.file,
            title: isCharacterMemoryPath(item.file.path) ? item.characterName : memoryFileTitle(item.file),
            recallReason: isStateMemoryPath(item.file.path)
                ? 'fixed'
                : 'entity',
            recallScore: isStateMemoryPath(item.file.path) ? 0 : 1,
        }));

    return {
        memoryFiles: selectedMemoryFiles.map((file) => ({
            path: file.path,
            title: memoryFileTitle(file),
            content: memoryFilePromptContent(file),
            recallReason: file.recallReason,
            recallScore: file.recallScore,
        })),
    };
}

export async function retrieveXbTavernMemoryContext(input: {
    sessionId: string;
    queryText?: string;
    ignoredTerms?: string[];
    includeMemoryFiles?: boolean;
    includeStructuredStates?: boolean;
}): Promise<XbTavernMemoryContext> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {return {};}
    const includeMemoryFiles = input.includeMemoryFiles !== false;
    const includeStructuredStates = input.includeStructuredStates !== false;
    const [memoryIndex, structuredStates, spatialState] = await Promise.all([
        includeMemoryFiles ? getTavernMemoryIndex(sessionId) : Promise.resolve(null),
        includeStructuredStates ? listTavernStructuredStateDigests(sessionId) : Promise.resolve([]),
        includeStructuredStates ? buildTavernSpatialStateDigest(sessionId) : Promise.resolve(''),
    ]);
    const readyMemoryIndex = includeMemoryFiles && memoryIndex?.status === 'ready' && Array.isArray(memoryIndex.files)
        ? memoryIndex
        : includeMemoryFiles && memoryIndex?.status === 'stale' && memoryIndex.error && Array.isArray(memoryIndex.files)
            ? memoryIndex
            : includeMemoryFiles
                ? await rebuildTavernMemoryDerivedIndex(sessionId)
                : null;
    const memoryFiles = Array.isArray(readyMemoryIndex?.files) ? readyMemoryIndex.files : [];
    const hasRecallMemory = memoryFiles.some(isRecallMemoryFile);
    if (!hasRecallMemory && !structuredStates.length && !spatialState) {return {};}
    const memoryContext = hasRecallMemory
        ? selectXbTavernMemoryContext({
            memoryFiles,
            queryText: input.queryText,
            ignoredTerms: input.ignoredTerms,
        })
        : {};
    const hydratedMemoryContext = hasRecallMemory
        ? await hydrateSelectedMemoryPromptContent(sessionId, memoryContext)
        : memoryContext;
    return {
        ...hydratedMemoryContext,
        structuredStates,
        ...(spatialState ? { spatialState } : {}),
    };
}
