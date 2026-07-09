export interface RequestLogSnapshotMeta {
    requestKind?: string;
    providerLabel?: string;
    provider?: string;
    model?: string;
    presetName?: string;
    capturedAt?: number;
    messageCount?: number;
    messageChars?: number;
}

export interface RequestLogPreviewField {
    key: string;
    label: string;
    value: unknown;
    text: string;
    kind: 'scalar' | 'json';
    summary: string;
}

export interface RequestLogPreviewTextSegment {
    text: string;
    kind: 'text' | 'xml-tag';
}

export interface RequestLogPreviewMessage {
    index: number;
    role: string;
    roleLabel: string;
    roleClass: string;
    name: string;
    contentText: string;
    contentSegments: RequestLogPreviewTextSegment[];
    metaFields: RequestLogPreviewField[];
}

export interface RequestLogPreview {
    rawJson: string;
    parseError: string;
    chips: string[];
    outerFields: RequestLogPreviewField[];
    requestFieldsBeforeMessages: RequestLogPreviewField[];
    messages: RequestLogPreviewMessage[];
    requestFieldsAfterMessages: RequestLogPreviewField[];
}

type JsonRecord = Record<string, unknown>;

const ROLE_LABELS: Record<string, string> = {
    system: 'SYSTEM',
    user: 'USER',
    assistant: 'ASSISTANT',
    tool: 'TOOL',
};

function isRecord(value: unknown): value is JsonRecord {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function safeStringify(value: unknown): string {
    try {
        const json = JSON.stringify(value, null, 2);
        return typeof json === 'string' ? json : String(value ?? '');
    } catch {
        return String(value ?? '');
    }
}

function summarizeValue(value: unknown): string {
    if (Array.isArray(value)) {return `${value.length} items`;}
    if (isRecord(value)) {return `${Object.keys(value).length} keys`;}
    if (typeof value === 'string') {return value.length > 80 ? `${value.slice(0, 80)}...` : value;}
    if (value === null) {return 'null';}
    if (value === undefined) {return 'undefined';}
    return String(value);
}

function fieldFromEntry(path: string, value: unknown): RequestLogPreviewField {
    const scalar = value === null || ['string', 'number', 'boolean'].includes(typeof value);
    return {
        key: path,
        label: path,
        value,
        text: scalar ? String(value ?? 'null') : safeStringify(value),
        kind: scalar ? 'scalar' : 'json',
        summary: summarizeValue(value),
    };
}

function normalizeRole(role: unknown): string {
    const value = String(role || '').toLowerCase();
    if (value === 'model') {return 'assistant';}
    if (value === 'human') {return 'user';}
    return value || 'user';
}

function parseEmbeddedBody(value: unknown): unknown {
    if (typeof value !== 'string') {return value;}
    const trimmed = value.trim();
    if (!/^[{[]/.test(trimmed)) {return value;}
    try {
        return JSON.parse(trimmed) as unknown;
    } catch {
        return value;
    }
}

function normalizePreviewRoot(value: unknown): unknown {
    if (Array.isArray(value)) {return value.map(normalizePreviewRoot);}
    if (!isRecord(value)) {return value;}
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
        key,
        normalizePreviewRoot(key === 'body' ? parseEmbeddedBody(entry) : entry),
    ]));
}

export function displayRequestLogContent(content: unknown): string {
    if (typeof content === 'string') {return content;}
    if (Array.isArray(content)) {
        return content.map((part) => {
            if (typeof part === 'string') {return part;}
            if (!part || typeof part !== 'object') {return '';}
            const item = part as JsonRecord;
            if (item.type === 'text') {return String(item.text || '');}
            if (item.type === 'image_url') {return '[image]';}
            if (item.type === 'video_url') {return '[video]';}
            if (item.type === 'audio_url') {return '[audio]';}
            if (item.type === 'tool_use') {return '[tool_use]';}
            if (item.type === 'tool_result') {return '[tool_result]';}
            return safeStringify(item);
        }).filter(Boolean).join('\n\n');
    }
    return safeStringify(content);
}

export function segmentRequestLogText(text = ''): RequestLogPreviewTextSegment[] {
    const source = String(text || '');
    const tagPattern = /(<[^&<>]+?>)/g;
    const segments: RequestLogPreviewTextSegment[] = [];
    let cursor = 0;
    for (const match of source.matchAll(tagPattern)) {
        const start = match.index ?? 0;
        if (start > cursor) {
            segments.push({ text: source.slice(cursor, start), kind: 'text' });
        }
        segments.push({ text: match[0], kind: 'xml-tag' });
        cursor = start + match[0].length;
    }
    if (cursor < source.length) {
        segments.push({ text: source.slice(cursor), kind: 'text' });
    }
    return segments.length ? segments : [{ text: source, kind: 'text' }];
}

function messageFromValue(value: unknown, index: number): RequestLogPreviewMessage {
    const message = isRecord(value) ? value : { content: value };
    const role = normalizeRole(message.role);
    const contentText = displayRequestLogContent(message.content);
    const metaFields = Object.entries(message)
        .filter(([key]) => !['role', 'content'].includes(key))
        .map(([key, entry]) => fieldFromEntry(key, entry));
    return {
        index,
        role,
        roleLabel: ROLE_LABELS[role] || role.toUpperCase(),
        roleClass: `is-${role.replace(/[^a-z0-9_-]/gi, '-')}`,
        name: String(message.name || ''),
        contentText,
        contentSegments: segmentRequestLogText(contentText),
        metaFields,
    };
}

function readAtPath(root: unknown, path: string[]): unknown {
    return path.reduce<unknown>((current, key) => (isRecord(current) ? current[key] : undefined), root);
}

function findMessagesPath(value: unknown): string[] | null {
    if (Array.isArray(value)) {return [];}
    const preferredPaths = [
        ['messages'],
        ['request', 'messages'],
        ['request', 'body', 'messages'],
        ['requestData', 'messages'],
        ['body', 'messages'],
    ];
    for (const path of preferredPaths) {
        if (Array.isArray(readAtPath(value, path))) {return path;}
    }
    const queue: Array<{ value: unknown; path: string[]; depth: number }> = [{ value, path: [], depth: 0 }];
    while (queue.length) {
        const current = queue.shift();
        if (!current || current.depth > 4 || !isRecord(current.value)) {continue;}
        for (const [key, entry] of Object.entries(current.value)) {
            const nextPath = [...current.path, key];
            if (key === 'messages' && Array.isArray(entry)) {return nextPath;}
            if (isRecord(entry)) {queue.push({ value: entry, path: nextPath, depth: current.depth + 1 });}
        }
    }
    return null;
}

function isWrapperBranchKey(key = ''): boolean {
    return key === 'request' || key === 'requestData';
}

function displayPath(path: string[]): string {
    return path.filter((part) => !isWrapperBranchKey(part)).join('.');
}

function collectSiblingFields(root: unknown, messagesPath: string[] | null): {
    outerFields: RequestLogPreviewField[];
    beforeFields: RequestLogPreviewField[];
    afterFields: RequestLogPreviewField[];
} {
    const outerFields: RequestLogPreviewField[] = [];
    const beforeFields: RequestLogPreviewField[] = [];
    const afterFields: RequestLogPreviewField[] = [];
    if (!isRecord(root)) {return { outerFields, beforeFields, afterFields };}
    if (!messagesPath) {
        beforeFields.push(...Object.entries(root).map(([key, value]) => fieldFromEntry(key, value)));
        return { outerFields, beforeFields, afterFields };
    }
    if (!messagesPath.length) {return { outerFields, beforeFields, afterFields };}
    let current: unknown = root;
    for (let depth = 0; depth < messagesPath.length; depth += 1) {
        if (!isRecord(current)) {break;}
        const branchKey = messagesPath[depth];
        const entries = Object.entries(current);
        const branchIndex = entries.findIndex(([key]) => key === branchKey);
        if (branchIndex < 0) {break;}
        const isRootWrapper = depth === 0 && messagesPath.length > 1 && isWrapperBranchKey(branchKey);
        const targetBefore = isRootWrapper ? outerFields : beforeFields;
        const targetAfter = isRootWrapper ? outerFields : afterFields;
        entries.forEach(([key, value], index) => {
            if (key === branchKey) {return;}
            const labelPath = displayPath([...messagesPath.slice(0, depth), key]) || key;
            const field = fieldFromEntry(labelPath, value);
            if (index < branchIndex) {
                targetBefore.push(field);
            } else {
                targetAfter.push(field);
            }
        });
        current = current[branchKey];
    }
    return { outerFields, beforeFields, afterFields };
}

function resolveMessageChars(root: unknown, messages: RequestLogPreviewMessage[], meta: RequestLogSnapshotMeta = {}): number {
    const rootRecord = isRecord(root) ? root : {};
    const explicit = [meta.messageChars, rootRecord.messageChars].find((value) => Number.isFinite(Number(value)));
    if (explicit !== undefined) {return Math.max(0, Math.floor(Number(explicit)));}
    return messages.reduce((sum, message) => sum + message.contentText.length, 0);
}

function buildChips(root: unknown, messages: RequestLogPreviewMessage[], meta: RequestLogSnapshotMeta = {}): string[] {
    const rootRecord = isRecord(root) ? root : {};
    const messageChars = resolveMessageChars(root, messages, meta);
    const chips = [
        messageChars || messages.length ? `${messageChars} chars` : '',
    ];
    const capturedAt = meta.capturedAt ?? rootRecord.capturedAt;
    if (capturedAt) {
        const date = new Date(Number(capturedAt));
        if (!Number.isNaN(date.getTime())) {chips.push(date.toLocaleString());}
    }
    return [...new Set(chips.map((chip) => String(chip || '').trim()).filter(Boolean))];
}

export function buildRequestLogPreview(rawJson = '', meta: RequestLogSnapshotMeta = {}): RequestLogPreview {
    const raw = String(rawJson || '');
    if (!raw.trim()) {
        return {
            rawJson: raw,
            parseError: '',
            chips: ['暂无记录'],
            outerFields: [],
            requestFieldsBeforeMessages: [],
            messages: [],
            requestFieldsAfterMessages: [],
        };
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        return {
            rawJson: raw,
            parseError: error instanceof Error ? error.message : String(error || 'json_parse_failed'),
            chips: ['解析失败'],
            outerFields: [],
            requestFieldsBeforeMessages: [fieldFromEntry('raw', raw)],
            messages: [],
            requestFieldsAfterMessages: [],
        };
    }
    const previewRoot = normalizePreviewRoot(parsed);
    const messagesPath = findMessagesPath(previewRoot);
    const messagesValue = messagesPath ? readAtPath(previewRoot, messagesPath) : Array.isArray(previewRoot) ? previewRoot : [];
    const messages = (Array.isArray(messagesValue) ? messagesValue : []).map(messageFromValue);
    const fields = collectSiblingFields(previewRoot, messagesPath);
    return {
        rawJson: raw,
        parseError: '',
        chips: buildChips(previewRoot, messages, meta),
        outerFields: fields.outerFields,
        requestFieldsBeforeMessages: fields.beforeFields,
        messages,
        requestFieldsAfterMessages: fields.afterFields,
    };
}
