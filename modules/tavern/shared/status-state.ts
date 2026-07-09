import db, {
    appendTavernStructuredStatePatch,
    getTavernStructuredStateDocument,
    listTavernStructuredStatePatches,
    tavernMessagesTable,
    tavernSessionsTable,
    tavernStateDocumentsTable,
    tavernStatePatchesTable,
    tavernStatusSnapshotsTable,
    type TavernStatusSnapshotRecord,
    type TavernStructuredStateDocumentRecord,
    type TavernStructuredStatePatchRecord,
} from './session-db';
import { resolveAcceptedSnapshotFloor } from './tasks';
import { canonicalMaterialSymbolName, normalizeMaterialSymbolName } from './status-material-symbols';

export const TAVERN_STATUS_DOC_TYPE = 'tavern.status' as const;
export const TAVERN_STATUS_DOC_ID = 'main' as const;

export const TAVERN_STATUS_TOOL_NAMES = {
    READ: 'StatusRead',
    INIT: 'StatusInit',
    PATCH: 'StatusPatch',
} as const;

const STATUS_FORMS = new Set(['gauge', 'tag', 'item', 'text']);
const TAG_KINDS = new Set(['harm', 'boon', 'state']);
const GAUGE_DISPLAYS = new Set(['bar', 'percent', 'dots', 'num']);
const ITEM_LAYOUTS = new Set(['list', 'grid']);
const MAX_READ_LIMIT = 80;
const STATUS_INIT_DOCUMENT_DESCRIPTION = [
    'Full StatusDoc: meta plus subjects/tabs/blocks/fields.',
    'Block forms are gauge/tag/item/text.',
    'Gauge fields may set display to bar, percent, dots, or num.',
    'Map user wording exactly when present: 进度条/bar => display "bar"; 百分比/percent => display "percent"; 点阵/dots => display "dots"; 普通数字/数字/num => display "num".',
].join(' ');

export type TavernStatusForm = 'gauge' | 'tag' | 'item' | 'text';
export type TavernStatusToolCaller = 'auto' | 'chat';

export interface TavernStatusDocument {
    meta: {
        revision: number;
        activeSubject: string;
    };
    subjects: TavernStatusSubject[];
}

export interface TavernStatusSubject {
    id: string;
    name: string;
    subtitle?: string;
    icon?: string;
    tabs: TavernStatusTab[];
}

export interface TavernStatusTab {
    id: string;
    label: string;
    blocks: TavernStatusBlock[];
}

export interface TavernStatusBlock {
    id: string;
    title: string;
    form: TavernStatusForm;
    layout?: 'list' | 'grid';
    fields: TavernStatusField[];
}

export type TavernStatusField =
    | TavernStatusGaugeField
    | TavernStatusTagField
    | TavernStatusItemField
    | TavernStatusTextField;

export interface TavernStatusGaugeField {
    id: string;
    name: string;
    value: number;
    min?: number;
    max?: number;
    display?: 'bar' | 'percent' | 'dots' | 'num';
    accent?: boolean;
    step?: number;
}

export interface TavernStatusTagField {
    id: string;
    label: string;
    kind?: 'harm' | 'boon' | 'state';
}

export interface TavernStatusItemField {
    id: string;
    name: string;
    icon?: string;
    qty?: number;
    key?: boolean;
    lore?: string;
    empty?: boolean;
    slot?: string;
}

export interface TavernStatusTextField {
    id: string;
    name?: string;
    value: string;
}

export interface TavernStatusToolResult {
    ok: boolean;
    summary: string;
    changed?: boolean;
    docType?: typeof TAVERN_STATUS_DOC_TYPE;
    docId?: string;
    revision?: number;
    document?: TavernStatusDocument;
    subjects?: Array<{ id: string; name: string; tabs: number; blocks: number; fields: number }>;
    patches?: Array<Pick<TavernStructuredStatePatchRecord, 'id' | 'revision' | 'managerRunId' | 'sourceUserOrder' | 'sourceAssistantOrder' | 'summary' | 'createdAt'>>;
    warnings?: string[];
    errors?: string[];
    changedIds?: string[];
    error?: string;
}

export type TavernStatusFieldDeltaMap = Record<string, number>;

export interface TavernStatusToolOptions {
    caller?: TavernStatusToolCaller;
    managerRunId?: string;
    sourceUserOrder?: number;
    sourceAssistantOrder?: number;
    beforeWriteGuard?: () => Promise<void> | void;
}

function now(): number {
    return Date.now();
}

function cloneJson<T>(value: T, fallback: T): T {
    try {
        if (value === undefined) {return fallback;}
        return JSON.parse(JSON.stringify(value)) as T;
    } catch {
        return fallback;
    }
}

function normalizeText(value: unknown = '', limit = 120): string {
    const text = String(value || '').replace(/\r\n/g, '\n').trim();
    return text.length > limit ? text.slice(0, limit) : text;
}

function normalizeStatusIcon(value: unknown, owner: string, warnings: string[]): string | undefined {
    const normalized = normalizeMaterialSymbolName(value);
    if (!normalized) {return undefined;}
    const icon = canonicalMaterialSymbolName(value);
    if (icon) {return icon;}
    warnings.push(`${owner}: icon非法(${normalizeText(value, 80)})，已忽略`);
    return undefined;
}

function applyStatusItemIconSet(item: TavernStatusItemField, value: unknown, warnings: string[]): boolean {
    const normalized = normalizeMaterialSymbolName(value);
    if (!normalized) {return false;}
    const icon = canonicalMaterialSymbolName(value);
    if (!icon) {
        warnings.push(`${item.id}: icon非法(${normalizeText(value, 80)})，保留原图标`);
        return false;
    }
    if (item.icon === icon) {return false;}
    item.icon = icon;
    return true;
}

function normalizeId(value: unknown = '', fallback = ''): string {
    const text = normalizeText(value, 80)
        .replace(/\s+/g, '-')
        .replace(/[^\w:.-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
    return text || fallback;
}

function hashText(value: unknown = ''): string {
    const text = String(value || '');
    let left = 2166136261;
    let right = 2166136261 ^ 0x9e3779b9;
    for (let index = 0; index < text.length; index += 1) {
        const code = text.charCodeAt(index);
        left ^= code;
        left = Math.imul(left, 16777619) >>> 0;
        right ^= code + index;
        right = Math.imul(right, 16777619) >>> 0;
    }
    return `${text.length.toString(36)}:${left.toString(16)}${right.toString(16)}`;
}

function stableJson(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableJson(item)).join(',')}]`;
    }
    if (value && typeof value === 'object') {
        return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableJson((value as Record<string, unknown>)[key])}`).join(',')}}`;
    }
    return JSON.stringify(value ?? null);
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function numberOrUndefined(value: unknown): number | undefined {
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
}

function clampGaugeValue(field: TavernStatusGaugeField, value: number): number {
    let next = value;
    if (Number.isFinite(field.min as number)) {next = Math.max(Number(field.min), next);}
    if (Number.isFinite(field.max as number)) {next = Math.min(Number(field.max), next);}
    return next;
}

function normalizeGaugeField(value: unknown, fallbackId: string, warnings: string[]): TavernStatusGaugeField | null {
    const source = asRecord(value);
    const name = normalizeText(source.name, 80);
    const rawValue = Number(source.value);
    if (!name) {
        warnings.push(`${fallbackId}: gauge缺name`);
        return null;
    }
    if (!Number.isFinite(rawValue)) {
        warnings.push(`${name}: gauge缺value`);
        return null;
    }
    const field: TavernStatusGaugeField = {
        id: normalizeId(source.id, normalizeId(name, fallbackId)),
        name,
        value: rawValue,
    };
    const min = numberOrUndefined(source.min);
    const max = numberOrUndefined(source.max);
    const step = numberOrUndefined(source.step);
    if (min !== undefined) {field.min = min;}
    if (max !== undefined) {field.max = max;}
    if (step !== undefined && step > 0) {field.step = step;}
    const display = normalizeText(source.display, 20);
    if (GAUGE_DISPLAYS.has(display)) {field.display = display as TavernStatusGaugeField['display'];}
    if (source.accent === true) {field.accent = true;}
    field.value = clampGaugeValue(field, field.value);
    return field;
}

function normalizeTagField(value: unknown, fallbackId: string, warnings: string[]): TavernStatusTagField | null {
    const source = asRecord(value);
    const label = normalizeText(source.label, 80);
    if (!label) {
        warnings.push(`${fallbackId}: tag缺label`);
        return null;
    }
    const field: TavernStatusTagField = {
        id: normalizeId(source.id, normalizeId(label, fallbackId)),
        label,
    };
    const kind = normalizeText(source.kind, 20);
    if (TAG_KINDS.has(kind)) {field.kind = kind as TavernStatusTagField['kind'];}
    return field;
}

function normalizeItemField(value: unknown, fallbackId: string, warnings: string[]): TavernStatusItemField | null {
    const source = asRecord(value);
    const name = normalizeText(source.name, 100);
    if (!name) {
        warnings.push(`${fallbackId}: item缺name`);
        return null;
    }
    const field: TavernStatusItemField = {
        id: normalizeId(source.id, normalizeId(name, fallbackId)),
        name,
    };
    const icon = normalizeStatusIcon(source.icon, `${field.id}: item`, warnings);
    const lore = normalizeText(source.lore, 500);
    const slot = normalizeText(source.slot, 60);
    const qty = numberOrUndefined(source.qty);
    if (icon) {field.icon = icon;}
    if (qty !== undefined) {field.qty = Math.max(0, Math.floor(qty));}
    if (source.key === true) {field.key = true;}
    if (lore) {field.lore = lore;}
    if (source.empty === true) {field.empty = true;}
    if (slot) {field.slot = slot;}
    return field;
}

function normalizeTextField(value: unknown, fallbackId: string, warnings: string[]): TavernStatusTextField | null {
    const source = asRecord(value);
    if (!('value' in source)) {
        warnings.push(`${fallbackId}: text缺value`);
        return null;
    }
    const field: TavernStatusTextField = {
        id: normalizeId(source.id, normalizeId(source.name || source.value, fallbackId)),
        value: normalizeText(source.value, 1200),
    };
    const name = normalizeText(source.name, 80);
    if (name) {field.name = name;}
    return field;
}

function normalizeField(form: TavernStatusForm, value: unknown, fallbackId: string, warnings: string[]): TavernStatusField | null {
    if (form === 'gauge') {return normalizeGaugeField(value, fallbackId, warnings);}
    if (form === 'tag') {return normalizeTagField(value, fallbackId, warnings);}
    if (form === 'item') {return normalizeItemField(value, fallbackId, warnings);}
    return normalizeTextField(value, fallbackId, warnings);
}

export function createEmptyStatusDocument(): TavernStatusDocument {
    return {
        meta: {
            revision: 0,
            activeSubject: '',
        },
        subjects: [],
    };
}

export function normalizeStatusDocument(value: unknown): { document: TavernStatusDocument; warnings: string[] } {
    const source = asRecord(value);
    const meta = asRecord(source.meta);
    const warnings: string[] = [];
    const subjects: TavernStatusSubject[] = [];
    (Array.isArray(source.subjects) ? source.subjects : []).forEach((subjectValue, subjectIndex) => {
        const subjectSource = asRecord(subjectValue);
        const name = normalizeText(subjectSource.name, 80) || `状态栏 ${subjectIndex + 1}`;
        const subjectId = normalizeId(subjectSource.id, normalizeId(name, `subject-${subjectIndex + 1}`));
        const tabs: TavernStatusTab[] = [];
        (Array.isArray(subjectSource.tabs) ? subjectSource.tabs : []).forEach((tabValue, tabIndex) => {
            const tabSource = asRecord(tabValue);
            const label = normalizeText(tabSource.label, 50) || `页面 ${tabIndex + 1}`;
            const tabId = normalizeId(tabSource.id, normalizeId(label, `tab-${tabIndex + 1}`));
            const blocks: TavernStatusBlock[] = [];
            (Array.isArray(tabSource.blocks) ? tabSource.blocks : []).forEach((blockValue, blockIndex) => {
                const blockSource = asRecord(blockValue);
                const formText = normalizeText(blockSource.form, 20);
                if (!STATUS_FORMS.has(formText)) {
                    warnings.push(`${subjectId}/${tabId}/block-${blockIndex + 1}: 未知form`);
                    return;
                }
                const form = formText as TavernStatusForm;
                const title = normalizeText(blockSource.title, 80) || `区块 ${blockIndex + 1}`;
                const blockId = normalizeId(blockSource.id, normalizeId(title, `block-${blockIndex + 1}`));
                const fields: TavernStatusField[] = [];
                (Array.isArray(blockSource.fields) ? blockSource.fields : []).forEach((fieldValue, fieldIndex) => {
                    const field = normalizeField(form, fieldValue, `${blockId}-field-${fieldIndex + 1}`, warnings);
                    if (field) {fields.push(field);}
                });
                const block: TavernStatusBlock = { id: blockId, title, form, fields };
                const layout = normalizeText(blockSource.layout, 20);
                if (form === 'item' && ITEM_LAYOUTS.has(layout)) {block.layout = layout as TavernStatusBlock['layout'];}
                blocks.push(block);
            });
            tabs.push({ id: tabId, label, blocks });
        });
        const subject: TavernStatusSubject = { id: subjectId, name, tabs };
        const subtitle = normalizeText(subjectSource.subtitle, 120);
        const icon = normalizeStatusIcon(subjectSource.icon, `${subjectId}: subject`, warnings);
        if (subtitle) {subject.subtitle = subtitle;}
        if (icon) {subject.icon = icon;}
        subjects.push(subject);
    });
    const activeSubject = normalizeId(meta.activeSubject, subjects[0]?.id || '');
    return {
        document: {
            meta: {
                revision: Math.max(0, Math.floor(Number(meta.revision) || 0)),
                activeSubject,
            },
            subjects,
        },
        warnings,
    };
}

function semanticStatusDocument(value: TavernStatusDocument): unknown {
    return {
        meta: {
            activeSubject: value.meta.activeSubject || '',
        },
        subjects: value.subjects.map((subject) => ({
            id: subject.id,
            name: subject.name,
            subtitle: subject.subtitle || '',
            icon: subject.icon || '',
            tabs: subject.tabs.map((tab) => ({
                id: tab.id,
                label: tab.label,
                blocks: tab.blocks.map((block) => ({
                    id: block.id,
                    title: block.title,
                    form: block.form,
                    layout: block.layout || '',
                    fields: block.fields.map((field) => {
                        const clean = { ...field } as Record<string, unknown>;
                        delete clean.delta;
                        delete clean.lastDelta;
                        delete clean._new;
                        return clean;
                    }),
                })),
            })),
        })),
    };
}

export function createStatusSemanticFingerprint(document: TavernStatusDocument): string {
    return hashText(stableJson(semanticStatusDocument(document)));
}

function summarizeStatusDocument(document: TavernStatusDocument) {
    return document.subjects.map((subject) => {
        const blocks = subject.tabs.flatMap((tab) => tab.blocks);
        const fields = blocks.flatMap((block) => block.fields);
        return {
            id: subject.id,
            name: subject.name,
            tabs: subject.tabs.length,
            blocks: blocks.length,
            fields: fields.length,
        };
    });
}

export function createStatusFieldKey(subjectId = '', tabId = '', blockId = '', fieldId = ''): string {
    return [subjectId, tabId, blockId, fieldId].map((part) => normalizeId(part)).join('/');
}

function collectGaugeValues(document: TavernStatusDocument): Record<string, number> {
    const values: Record<string, number> = {};
    document.subjects.forEach((subject) => {
        subject.tabs.forEach((tab) => {
            tab.blocks.forEach((block) => {
                if (block.form !== 'gauge') {return;}
                block.fields.forEach((field) => {
                    const gauge = field as TavernStatusGaugeField;
                    if (!Number.isFinite(Number(gauge.value))) {return;}
                    values[createStatusFieldKey(subject.id, tab.id, block.id, gauge.id)] = Number(gauge.value);
                });
            });
        });
    });
    return values;
}

export function deriveRecentStatusFieldDeltas(patches: TavernStructuredStatePatchRecord[] = []): TavernStatusFieldDeltaMap {
    const latestPatch = [...patches]
        .filter((patch) => patch.status !== 'rolled_back')
        .filter((patch) => patch.beforeData !== undefined && patch.afterData !== undefined)
        .sort((left, right) => Number(right.revision) - Number(left.revision) || Number(right.createdAt) - Number(left.createdAt))[0];
    if (!latestPatch) {return {};}
    const before = collectGaugeValues(normalizeStatusDocument(latestPatch.beforeData).document);
    const after = collectGaugeValues(normalizeStatusDocument(latestPatch.afterData).document);
    const deltas: TavernStatusFieldDeltaMap = {};
    Object.entries(after).forEach(([key, afterValue]) => {
        const beforeValue = before[key];
        if (!Number.isFinite(beforeValue)) {return;}
        const delta = afterValue - beforeValue;
        if (delta) {deltas[key] = delta;}
    });
    return deltas;
}

function titleForStatusDocument(document: TavernStatusDocument): string {
    return document.subjects[0]?.name || '状态';
}

async function getStatusRecord(sessionId = ''): Promise<TavernStructuredStateDocumentRecord | null> {
    return await getTavernStructuredStateDocument(sessionId, TAVERN_STATUS_DOC_TYPE, TAVERN_STATUS_DOC_ID);
}

function statusRecordFingerprint(record: TavernStructuredStateDocumentRecord | null | undefined): string {
    if (!record) {return '';}
    return createStatusSemanticFingerprint(normalizeStatusDocument(record.data).document);
}

function statusSnapshotFingerprint(snapshot: TavernStatusSnapshotRecord | null | undefined): string {
    if (!snapshot?.document) {return '';}
    return statusRecordFingerprint(snapshot.document);
}

export async function saveTavernStatusSnapshot(sessionId = '', floorInput?: number): Promise<TavernStatusSnapshotRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    return await db.transaction('rw', tavernMessagesTable, tavernStateDocumentsTable, tavernStatusSnapshotsTable, async () => {
        const current = await getStatusRecord(id);
        if (!current) {return null;}
        const floor = await resolveAcceptedSnapshotFloor(id, floorInput);
        const currentFingerprint = statusRecordFingerprint(current);
        const effective = await getLatestTavernStatusSnapshot(id, floor);
        if (effective && statusSnapshotFingerprint(effective) === currentFingerprint) {
            return null;
        }
        const record: TavernStatusSnapshotRecord = {
            sessionId: id,
            floor,
            document: cloneJson(current, current),
            digest: currentFingerprint,
            createdAt: now(),
        };
        await tavernStatusSnapshotsTable.put(record);
        return record;
    });
}

export async function listTavernStatusSnapshots(sessionId = ''): Promise<TavernStatusSnapshotRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    return (await tavernStatusSnapshotsTable.where('sessionId').equals(id).sortBy('floor'))
        .sort((left, right) => left.floor - right.floor || left.createdAt - right.createdAt);
}

export async function getLatestTavernStatusSnapshot(
    sessionId = '',
    targetFloor = Number.POSITIVE_INFINITY,
): Promise<TavernStatusSnapshotRecord | null> {
    const id = String(sessionId || '').trim();
    const floor = Number(targetFloor);
    if (!id) {return null;}
    const snapshots = await listTavernStatusSnapshots(id);
    return snapshots
        .filter((snapshot) => Number(snapshot.floor) <= floor || floor === Number.POSITIVE_INFINITY)
        .sort((left, right) => Number(right.floor) - Number(left.floor) || Number(right.createdAt) - Number(left.createdAt))[0]
        || null;
}

export async function trimTavernStatusSnapshotsFromFloor(sessionId = '', fromFloor = 0): Promise<number> {
    const id = String(sessionId || '').trim();
    const floor = Number(fromFloor);
    if (!id || !Number.isFinite(floor)) {return 0;}
    return await db.transaction('rw', tavernStatusSnapshotsTable, async () => {
        const snapshots = await listTavernStatusSnapshots(id);
        const affected = snapshots.filter((snapshot) => Number(snapshot.floor) >= floor);
        if (!affected.length) {return 0;}
        await tavernStatusSnapshotsTable.bulkDelete(affected.map((snapshot) => [snapshot.sessionId, snapshot.floor]));
        return affected.length;
    });
}

export async function describeTavernStatusRestoreImpact(sessionId = '', targetFloor = -1): Promise<{
    changed: boolean;
    currentExists: boolean;
    targetExists: boolean;
}> {
    const id = String(sessionId || '').trim();
    if (!id) {return { changed: false, currentExists: false, targetExists: false };}
    const [current, snapshot] = await Promise.all([
        getStatusRecord(id),
        getLatestTavernStatusSnapshot(id, targetFloor),
    ]);
    const currentFingerprint = statusRecordFingerprint(current);
    const targetFingerprint = statusSnapshotFingerprint(snapshot);
    return {
        changed: currentFingerprint !== targetFingerprint,
        currentExists: !!current,
        targetExists: !!snapshot?.document,
    };
}

export async function restoreTavernStatusToFloor(sessionId = '', targetFloor = -1): Promise<TavernStructuredStateDocumentRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {throw new Error('status_session_required');}
    return await db.transaction('rw', tavernStateDocumentsTable, tavernStatusSnapshotsTable, tavernSessionsTable, async () => {
        const snapshot = await getLatestTavernStatusSnapshot(id, targetFloor);
        const timestamp = now();
        if (!snapshot?.document) {
            await tavernStateDocumentsTable.delete([id, TAVERN_STATUS_DOC_TYPE, TAVERN_STATUS_DOC_ID]);
            await tavernSessionsTable.update(id, { updatedAt: timestamp });
            return null;
        }
        const normalized = normalizeStatusDocument(snapshot.document.data).document;
        const digest = createStatusSemanticFingerprint(normalized);
        const restored: TavernStructuredStateDocumentRecord = {
            ...cloneJson(snapshot.document, snapshot.document),
            sessionId: id,
            docType: TAVERN_STATUS_DOC_TYPE,
            docId: TAVERN_STATUS_DOC_ID,
            title: titleForStatusDocument(normalized),
            revision: normalized.meta.revision,
            data: normalized,
            digest,
            status: 'active',
            updatedAt: timestamp,
        };
        await tavernStateDocumentsTable.put(restored);
        await tavernSessionsTable.update(id, { updatedAt: timestamp });
        return restored;
    });
}

export async function getTavernStatusStateForSession(sessionId = ''): Promise<{
    document: TavernStructuredStateDocumentRecord | null;
    status: TavernStatusDocument;
    patches: TavernStructuredStatePatchRecord[];
    fieldDeltas: TavernStatusFieldDeltaMap;
}> {
    const record = await getStatusRecord(sessionId);
    const normalized = normalizeStatusDocument(record?.data || createEmptyStatusDocument()).document;
    const patches = await listTavernStructuredStatePatches({
        sessionId,
        docType: TAVERN_STATUS_DOC_TYPE,
        docId: TAVERN_STATUS_DOC_ID,
        limit: MAX_READ_LIMIT,
    });
    return { document: record, status: normalized, patches, fieldDeltas: deriveRecentStatusFieldDeltas(patches) };
}

export async function describeStatusStateRollbackImpactForMessageRange(sessionId = '', fromOrder = 0): Promise<{
    changed: boolean;
    writtenStatusPatches: number;
}> {
    const id = String(sessionId || '').trim();
    const order = Number(fromOrder);
    if (!id || !Number.isFinite(order)) {
        return { changed: false, writtenStatusPatches: 0 };
    }
    const patches = (await listTavernStructuredStatePatches({
        sessionId: id,
        docType: TAVERN_STATUS_DOC_TYPE,
        docId: TAVERN_STATUS_DOC_ID,
        includeRolledBack: true,
    }))
        .filter((patch) => patch.status !== 'rolled_back')
        .filter((patch) => Number(patch.sourceUserOrder) >= order || Number(patch.sourceAssistantOrder) >= order);
    return {
        changed: patches.length > 0,
        writtenStatusPatches: patches.length,
    };
}

function findSubject(document: TavernStatusDocument, id: unknown): TavernStatusSubject | null {
    const target = normalizeId(id);
    return document.subjects.find((subject) => subject.id === target || subject.name === String(id || '').trim()) || null;
}

function findTab(subject: TavernStatusSubject, id: unknown): TavernStatusTab | null {
    const target = normalizeId(id);
    return subject.tabs.find((tab) => tab.id === target || tab.label === String(id || '').trim()) || null;
}

function findBlock(tab: TavernStatusTab, id: unknown): TavernStatusBlock | null {
    const target = normalizeId(id);
    return tab.blocks.find((block) => block.id === target || block.title === String(id || '').trim()) || null;
}

function findFieldIndex(block: TavernStatusBlock, op: Record<string, unknown>): number {
    const fieldId = normalizeId(op.fieldId || op.id);
    const name = normalizeText(op.name || op.label, 100);
    return block.fields.findIndex((field) => {
        if (fieldId && field.id === fieldId) {return true;}
        if (!name) {return false;}
        if ('name' in field && field.name === name) {return true;}
        return 'label' in field && field.label === name;
    });
}

function resolveBlock(document: TavernStatusDocument, op: Record<string, unknown>, errors: string[]): TavernStatusBlock | null {
    const subject = findSubject(document, op.subjectId);
    if (!subject) {
        errors.push(`subject_not_found:${String(op.subjectId || '')}`);
        return null;
    }
    const tab = findTab(subject, op.tabId);
    if (!tab) {
        errors.push(`tab_not_found:${String(op.tabId || '')}`);
        return null;
    }
    const block = findBlock(tab, op.blockId);
    if (!block) {
        errors.push(`block_not_found:${String(op.blockId || '')}`);
        return null;
    }
    return block;
}

function applySetToField(field: TavernStatusField, block: TavernStatusBlock, op: Record<string, unknown>, warnings: string[]): boolean {
    const set = asRecord(op.set || op.field || op);
    if (block.form === 'gauge' && 'value' in set) {
        const next = Number(set.value);
        if (!Number.isFinite(next)) {
            warnings.push(`${field.id}: value需为数字`);
            return false;
        }
        (field as TavernStatusGaugeField).value = clampGaugeValue(field as TavernStatusGaugeField, next);
        return true;
    }
    if (block.form === 'text' && 'value' in set) {
        (field as TavernStatusTextField).value = normalizeText(set.value, 1200);
        return true;
    }
    if (block.form === 'tag') {
        if ('label' in set) {(field as TavernStatusTagField).label = normalizeText(set.label, 80) || (field as TavernStatusTagField).label;}
        if ('kind' in set) {
            const kind = normalizeText(set.kind, 20);
            if (TAG_KINDS.has(kind)) {(field as TavernStatusTagField).kind = kind as TavernStatusTagField['kind'];}
        }
        return true;
    }
    if (block.form === 'item') {
        const item = field as TavernStatusItemField;
        let changed = false;
        if ('name' in set) {item.name = normalizeText(set.name, 100) || item.name;}
        if ('icon' in set) {changed = applyStatusItemIconSet(item, set.icon, warnings) || changed;}
        if ('lore' in set) {item.lore = normalizeText(set.lore, 500) || undefined;}
        if ('slot' in set) {item.slot = normalizeText(set.slot, 60) || undefined;}
        if ('qty' in set) {
            const qty = Number(set.qty);
            if (Number.isFinite(qty)) {item.qty = Math.max(0, Math.floor(qty));}
        }
        if ('key' in set) {item.key = set.key === true;}
        if ('empty' in set) {item.empty = set.empty === true;}
        return changed || Object.keys(set).some((key) => key !== 'icon');
    }
    warnings.push(`${field.id}: unsupported_set`);
    return false;
}

function applyStatusOps(document: TavernStatusDocument, ops: unknown[] = []): {
    document: TavernStatusDocument;
    warnings: string[];
    errors: string[];
    changedIds: string[];
} {
    const next = cloneJson(document, createEmptyStatusDocument());
    const warnings: string[] = [];
    const errors: string[] = [];
    const changedIds: string[] = [];
    ops.forEach((rawOp, index) => {
        const op = asRecord(rawOp);
        const kind = normalizeText(op.op, 20);
        if (!['set', 'delta', 'push', 'remove'].includes(kind)) {
            errors.push(`op_${index + 1}:unsupported_op`);
            return;
        }
        const block = resolveBlock(next, op, errors);
        if (!block) {return;}
        if (kind === 'push') {
            const field = normalizeField(block.form, op.field || op.value || op, `${block.id}-field-${block.fields.length + 1}`, warnings);
            if (!field) {return;}
            if (block.fields.some((existing) => existing.id === field.id)) {
                errors.push(`field_exists:${field.id}`);
                return;
            }
            block.fields.push(field);
            changedIds.push(field.id);
            return;
        }
        const fieldIndex = findFieldIndex(block, op);
        if (fieldIndex < 0) {
            errors.push(`field_not_found:${String(op.fieldId || op.id || op.name || op.label || '')}`);
            return;
        }
        const field = block.fields[fieldIndex];
        if (kind === 'remove') {
            block.fields.splice(fieldIndex, 1);
            changedIds.push(field.id);
            return;
        }
        if (kind === 'delta') {
            if (block.form !== 'gauge') {
                errors.push(`field_not_gauge:${field.id}`);
                return;
            }
            const delta = Number(op.delta ?? op.value);
            if (!Number.isFinite(delta)) {
                errors.push(`delta_invalid:${field.id}`);
                return;
            }
            const gauge = field as TavernStatusGaugeField;
            const step = Number(gauge.step) || 0;
            const appliedDelta = step > 0 ? Math.max(-step, Math.min(step, delta)) : delta;
            if (appliedDelta !== delta) {warnings.push(`${gauge.name}已限制到${appliedDelta > 0 ? '+' : ''}${appliedDelta}`);}
            gauge.value = clampGaugeValue(gauge, gauge.value + appliedDelta);
            changedIds.push(gauge.id);
            return;
        }
        if (applySetToField(field, block, op, warnings)) {
            changedIds.push(field.id);
        }
    });
    return { document: next, warnings, errors, changedIds: [...new Set(changedIds)] };
}

export function getTavernStatusToolDefinitions(): Array<{ type: 'function'; function: { name: string; description: string; parameters: unknown } }> {
    const locationSchema = {
        subjectId: { type: 'string', description: 'Existing subject id. Subjects are preset-defined pages/dossiers, not map actors.' },
        tabId: { type: 'string', description: 'Existing tab id.' },
        blockId: { type: 'string', description: 'Existing block id. Runtime patches may only change fields inside existing blocks.' },
    };
    return [
        {
            type: 'function',
            function: {
                name: TAVERN_STATUS_TOOL_NAMES.READ,
                description: 'Read the current structured status panel document or its patch history. This reads status only, not map, memory, chat, or worldbook sources.',
                parameters: {
                    type: 'object',
                    properties: {
                        mode: { type: 'string', enum: ['summary', 'document', 'history'], description: 'Read mode. Default summary.' },
                        tail: { type: 'number', minimum: 1, maximum: MAX_READ_LIMIT },
                    },
                    additionalProperties: false,
                },
            },
        },
        {
            type: 'function',
            function: {
                name: TAVERN_STATUS_TOOL_NAMES.INIT,
                description: [
                    'Initialize or rebuild the status panel skeleton from the user status preset.',
                    'Use this only when the status panel is missing or the user explicitly changed the status preset. Init may create subjects/tabs/blocks/forms; normal updates must use StatusPatch.',
                    'Do not invent fields outside the user preset. Missing required field keys are skipped with warnings.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        desc: { type: 'string', description: 'Short summary of this initialization.' },
                        document: { type: 'object', description: STATUS_INIT_DOCUMENT_DESCRIPTION },
                        dryRun: { type: 'boolean' },
                    },
                    required: ['document'],
                    additionalProperties: false,
                },
            },
        },
        {
            type: 'function',
            function: {
                name: TAVERN_STATUS_TOOL_NAMES.PATCH,
                description: [
                    'Patch values/items inside the existing status panel skeleton.',
                    'Allowed ops are set, delta, push, and remove. You may only change fields inside an existing block.',
                    'Never add subject, tab, block, or change a block form here. If the structure must change, the user must reinitialize from the status preset.',
                    'Saved patches keep before/after data for audit and manager-run cleanup. User-floor rollback restores accepted snapshots.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        desc: { type: 'string', description: 'Short summary of this status update.' },
                        dryRun: { type: 'boolean' },
                        ops: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    op: { type: 'string', enum: ['set', 'delta', 'push', 'remove'] },
                                    ...locationSchema,
                                    fieldId: { type: 'string', description: 'Existing field id for set/delta/remove.' },
                                    id: { type: 'string', description: 'Alias for fieldId, or new field id for push.' },
                                    name: { type: 'string', description: 'Optional field name lookup or pushed field name.' },
                                    label: { type: 'string', description: 'Optional tag label lookup or pushed tag label.' },
                                    value: { description: 'New value for set, delta amount alias, text value, or gauge value.' },
                                    delta: { type: 'number', description: 'Gauge delta. Clamped by field step when present.' },
                                    set: { type: 'object', description: 'Partial field value for set.' },
                                    field: { type: 'object', description: 'New field for push.' },
                                },
                                required: ['op', 'subjectId', 'tabId', 'blockId'],
                                additionalProperties: true,
                            },
                        },
                    },
                    required: ['ops'],
                    additionalProperties: false,
                },
            },
        },
    ];
}

export function isTavernStatusToolName(toolName = ''): boolean {
    return Object.values(TAVERN_STATUS_TOOL_NAMES).includes(String(toolName || '').trim() as typeof TAVERN_STATUS_TOOL_NAMES[keyof typeof TAVERN_STATUS_TOOL_NAMES]);
}

export async function executeTavernStatusTool(
    sessionId = '',
    toolName = '',
    args: Record<string, unknown> = {},
    options: TavernStatusToolOptions = {},
): Promise<TavernStatusToolResult> {
    const id = String(sessionId || '').trim();
    const name = String(toolName || '').trim();
    if (!id) {return { ok: false, summary: '缺少 sessionId。', changed: false, error: 'status_session_required' };}
    if (!isTavernStatusToolName(name)) {return { ok: false, summary: `${name || 'Status tool'} 不可用。`, changed: false, error: 'status_tool_not_available' };}

    if (name === TAVERN_STATUS_TOOL_NAMES.READ) {
        const mode = normalizeText(args.mode, 20) || 'summary';
        const state = await getTavernStatusStateForSession(id);
        if (mode === 'document') {
            return {
                ok: true,
                summary: state.document ? `状态栏 REV ${state.document.revision}` : '状态栏尚未初始化。',
                changed: false,
                docType: TAVERN_STATUS_DOC_TYPE,
                docId: TAVERN_STATUS_DOC_ID,
                revision: state.document?.revision || 0,
                document: state.status,
            };
        }
        if (mode === 'history') {
            const tail = Math.max(1, Math.min(MAX_READ_LIMIT, Math.floor(Number(args.tail) || 20)));
            return {
                ok: true,
                summary: `返回最近 ${Math.min(tail, state.patches.length)} 条状态栏 patch。`,
                changed: false,
                docType: TAVERN_STATUS_DOC_TYPE,
                docId: TAVERN_STATUS_DOC_ID,
                revision: state.document?.revision || 0,
                patches: state.patches.slice(-tail).map((patch) => ({
                    id: patch.id,
                    revision: patch.revision,
                    managerRunId: patch.managerRunId,
                    sourceUserOrder: patch.sourceUserOrder,
                    sourceAssistantOrder: patch.sourceAssistantOrder,
                    summary: patch.summary,
                    createdAt: patch.createdAt,
                })),
            };
        }
        return {
            ok: true,
            summary: state.document ? `状态栏含 ${state.status.subjects.length} 个档案入口。` : '状态栏尚未初始化。',
            changed: false,
            docType: TAVERN_STATUS_DOC_TYPE,
            docId: TAVERN_STATUS_DOC_ID,
            revision: state.document?.revision || 0,
            subjects: summarizeStatusDocument(state.status),
        };
    }

    if (name === TAVERN_STATUS_TOOL_NAMES.INIT) {
        const normalized = normalizeStatusDocument(args.document);
        const fingerprint = createStatusSemanticFingerprint(normalized.document);
        const existing = await getStatusRecord(id);
        const before = normalizeStatusDocument(existing?.data || createEmptyStatusDocument()).document;
        if (existing?.digest === fingerprint && createStatusSemanticFingerprint(before) === fingerprint) {
            return {
                ok: true,
                summary: '状态栏结构未变化。',
                changed: false,
                docType: TAVERN_STATUS_DOC_TYPE,
                docId: TAVERN_STATUS_DOC_ID,
                revision: existing.revision,
                warnings: normalized.warnings,
            };
        }
        if (args.dryRun === true) {
            return {
                ok: true,
                summary: `状态栏初始化预检通过：${normalized.document.subjects.length} 个档案入口。`,
                changed: false,
                docType: TAVERN_STATUS_DOC_TYPE,
                docId: TAVERN_STATUS_DOC_ID,
                document: normalized.document,
                warnings: normalized.warnings,
            };
        }
        await options.beforeWriteGuard?.();
        const timestamp = now();
        const revision = (existing?.revision || 0) + 1;
        normalized.document.meta.revision = revision;
        const record: TavernStructuredStateDocumentRecord = {
            sessionId: id,
            docType: TAVERN_STATUS_DOC_TYPE,
            docId: TAVERN_STATUS_DOC_ID,
            title: titleForStatusDocument(normalized.document),
            revision,
            data: cloneJson(normalized.document, normalized.document),
            digest: fingerprint,
            status: 'active',
            source: 'status-init',
            createdAt: existing?.createdAt || timestamp,
            updatedAt: timestamp,
        };
        await db.transaction('rw', tavernStateDocumentsTable, tavernStatePatchesTable, tavernSessionsTable, async () => {
            await tavernStateDocumentsTable.put(record);
            await appendTavernStructuredStatePatch({
                sessionId: id,
                docType: TAVERN_STATUS_DOC_TYPE,
                docId: TAVERN_STATUS_DOC_ID,
                revision,
                managerRunId: options.managerRunId,
                sourceUserOrder: options.sourceUserOrder,
                sourceAssistantOrder: options.sourceAssistantOrder,
                summary: normalizeText(args.desc, 160) || '初始化状态栏',
                source: 'status-init',
                ops: [{ op: 'init' }],
                changedIds: normalized.document.subjects.map((subject) => subject.id),
                beforeData: before,
                afterData: normalized.document,
            });
            await tavernSessionsTable.update(id, { updatedAt: timestamp });
        });
        return {
            ok: true,
            summary: `状态栏已初始化：${normalized.document.subjects.length} 个档案入口。`,
            changed: true,
            docType: TAVERN_STATUS_DOC_TYPE,
            docId: TAVERN_STATUS_DOC_ID,
            revision,
            document: normalized.document,
            warnings: normalized.warnings,
        };
    }

    const existing = await getStatusRecord(id);
    if (!existing) {
        return {
            ok: false,
            summary: '状态栏尚未初始化，请先使用 StatusInit。',
            changed: false,
            docType: TAVERN_STATUS_DOC_TYPE,
            docId: TAVERN_STATUS_DOC_ID,
            error: 'status_document_not_found',
        };
    }
    const before = normalizeStatusDocument(existing.data).document;
    const ops = Array.isArray(args.ops) ? args.ops : [];
    const applied = applyStatusOps(before, ops);
    const afterNormalized = normalizeStatusDocument(applied.document);
    const after = afterNormalized.document;
    const beforeFingerprint = createStatusSemanticFingerprint(before);
    const afterFingerprint = createStatusSemanticFingerprint(after);
    const warnings = [...applied.warnings, ...afterNormalized.warnings];
    if (applied.errors.length) {
        return {
            ok: false,
            summary: `状态栏 patch 有 ${applied.errors.length} 个错误，未保存。`,
            changed: false,
            docType: TAVERN_STATUS_DOC_TYPE,
            docId: TAVERN_STATUS_DOC_ID,
            revision: existing.revision,
            warnings,
            errors: applied.errors,
            error: 'status_patch_invalid',
        };
    }
    if (beforeFingerprint === afterFingerprint) {
        return {
            ok: true,
            summary: '状态栏 patch 没有改变渲染结果。',
            changed: false,
            docType: TAVERN_STATUS_DOC_TYPE,
            docId: TAVERN_STATUS_DOC_ID,
            revision: existing.revision,
            warnings,
        };
    }
    if (args.dryRun === true) {
        return {
            ok: true,
            summary: `状态栏 patch 预检通过，将更新 ${applied.changedIds.length} 个字段。`,
            changed: false,
            docType: TAVERN_STATUS_DOC_TYPE,
            docId: TAVERN_STATUS_DOC_ID,
            revision: existing.revision + 1,
            document: after,
            warnings,
            changedIds: applied.changedIds,
        };
    }
    await options.beforeWriteGuard?.();
    const timestamp = now();
    const revision = existing.revision + 1;
    after.meta.revision = revision;
    const record: TavernStructuredStateDocumentRecord = {
        ...existing,
        title: titleForStatusDocument(after),
        revision,
        data: cloneJson(after, after),
        digest: afterFingerprint,
        updatedAt: timestamp,
    };
    await db.transaction('rw', tavernStateDocumentsTable, tavernStatePatchesTable, tavernSessionsTable, async () => {
        await tavernStateDocumentsTable.put(record);
        await appendTavernStructuredStatePatch({
            sessionId: id,
            docType: TAVERN_STATUS_DOC_TYPE,
            docId: TAVERN_STATUS_DOC_ID,
            revision,
            managerRunId: options.managerRunId,
            sourceUserOrder: options.sourceUserOrder,
            sourceAssistantOrder: options.sourceAssistantOrder,
            summary: normalizeText(args.desc, 160) || '更新状态栏',
            source: 'status-patch',
            ops,
            changedIds: applied.changedIds,
            beforeData: before,
            afterData: after,
        });
        await tavernSessionsTable.update(id, { updatedAt: timestamp });
    });
    return {
        ok: true,
        summary: `状态栏已更新 ${applied.changedIds.length} 个字段。`,
        changed: true,
        docType: TAVERN_STATUS_DOC_TYPE,
        docId: TAVERN_STATUS_DOC_ID,
        revision,
        document: after,
        warnings,
        changedIds: applied.changedIds,
    };
}

export async function rollbackStatusStateForMessageRange(sessionId = '', fromOrder = 0): Promise<{
    runIds: string[];
    rolledBack: number;
    conflicts: string[];
    skipped: number;
}> {
    const id = String(sessionId || '').trim();
    const order = Number(fromOrder);
    if (!id || !Number.isFinite(order)) {
        return { runIds: [], rolledBack: 0, conflicts: [], skipped: 0 };
    }
    const candidatePatches = (await listTavernStructuredStatePatches({
        sessionId: id,
        docType: TAVERN_STATUS_DOC_TYPE,
        docId: TAVERN_STATUS_DOC_ID,
        includeRolledBack: true,
    }))
        .filter((patch) => patch.status !== 'rolled_back')
        .filter((patch) => Number(patch.sourceUserOrder) >= order || Number(patch.sourceAssistantOrder) >= order)
        .sort((left, right) => Number(right.revision) - Number(left.revision) || Number(right.createdAt) - Number(left.createdAt));
    const beforeRestore = statusRecordFingerprint(await getStatusRecord(id));
    await restoreTavernStatusToFloor(id, order - 1);
    const afterRestore = statusRecordFingerprint(await getStatusRecord(id));
    const timestamp = now();
    if (candidatePatches.length) {
        await db.transaction('rw', tavernStatePatchesTable, tavernSessionsTable, async () => {
            await Promise.all(candidatePatches.map((patch) => tavernStatePatchesTable.update(patch.id, {
                status: 'rolled_back',
                updatedAt: timestamp,
            })));
            await tavernSessionsTable.update(id, { updatedAt: timestamp });
        });
    }
    return {
        runIds: [...new Set(candidatePatches.map((patch) => String(patch.managerRunId || '')).filter(Boolean))],
        rolledBack: candidatePatches.length || beforeRestore !== afterRestore ? Math.max(1, candidatePatches.length) : 0,
        conflicts: [],
        skipped: 0,
    };
}

export async function rollbackStatusStateForManagerRun(managerRunId = ''): Promise<{
    runIds: string[];
    rolledBack: number;
    conflicts: string[];
    skipped: number;
}> {
    const runId = String(managerRunId || '').trim();
    if (!runId) {return { runIds: [], rolledBack: 0, conflicts: [], skipped: 0 };}
    const candidatePatches = (await tavernStatePatchesTable.where('managerRunId').equals(runId).toArray())
        .filter((patch) => patch.docType === TAVERN_STATUS_DOC_TYPE && patch.docId === TAVERN_STATUS_DOC_ID)
        .filter((patch) => patch.status !== 'rolled_back')
        .sort((left, right) => Number(right.revision) - Number(left.revision) || Number(right.createdAt) - Number(left.createdAt));
    const patches = candidatePatches.filter((patch) => patch.beforeData !== undefined && patch.afterData !== undefined);
    const skipped = candidatePatches.length - patches.length;
    if (!patches.length) {return { runIds: candidatePatches.length ? [runId] : [], rolledBack: 0, conflicts: [], skipped };}
    return await rollbackStatusPatches(patches[0].sessionId, patches, skipped);
}

async function rollbackStatusPatches(
    sessionId = '',
    patches: TavernStructuredStatePatchRecord[] = [],
    skipped = 0,
): Promise<{
    runIds: string[];
    rolledBack: number;
    conflicts: string[];
    skipped: number;
}> {
    const id = String(sessionId || '').trim();
    if (!id || !patches.length) {return { runIds: [], rolledBack: 0, conflicts: [], skipped };}
    const current = await getStatusRecord(id);
    if (!current) {return { runIds: [...new Set(patches.map((patch) => String(patch.managerRunId || '')).filter(Boolean))], rolledBack: 0, conflicts: [], skipped: patches.length + skipped };}
    const latestAfter = normalizeStatusDocument(patches[0]?.afterData || createEmptyStatusDocument()).document;
    const currentStatus = normalizeStatusDocument(current.data).document;
    if (createStatusSemanticFingerprint(currentStatus) !== createStatusSemanticFingerprint(latestAfter)) {
        return {
            runIds: [...new Set(patches.map((patch) => String(patch.managerRunId || '')).filter(Boolean))],
            rolledBack: 0,
            conflicts: ['status'],
            skipped,
        };
    }
    const targetBefore = patches[patches.length - 1]?.beforeData;
    const normalized = normalizeStatusDocument(targetBefore || createEmptyStatusDocument()).document;
    normalized.meta.revision = Math.max(0, (patches[patches.length - 1]?.revision || 1) - 1);
    const timestamp = now();
    const digest = createStatusSemanticFingerprint(normalized);
    await db.transaction('rw', tavernStateDocumentsTable, tavernStatePatchesTable, tavernSessionsTable, async () => {
        await tavernStateDocumentsTable.put({
            ...current,
            title: titleForStatusDocument(normalized),
            revision: normalized.meta.revision,
            data: normalized,
            digest,
            updatedAt: timestamp,
        });
        await Promise.all(patches.map((patch) => tavernStatePatchesTable.update(patch.id, {
            status: 'rolled_back',
            updatedAt: timestamp,
        })));
        await tavernSessionsTable.update(id, { updatedAt: timestamp });
    });
    return {
        runIds: [...new Set(patches.map((patch) => String(patch.managerRunId || '')).filter(Boolean))],
        rolledBack: patches.length,
        conflicts: [],
        skipped,
    };
}
