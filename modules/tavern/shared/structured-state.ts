import db, {
    appendTavernStructuredStatePatch,
    ensureSeedStructuredStateDocument,
    getTavernStructuredStateDocument,
    listTavernStructuredStateDocuments,
    listTavernStructuredStatePatches,
    putTavernStructuredStateDocument,
    tavernMessagesTable,
    tavernSessionsTable,
    tavernStateDocumentsTable,
    tavernStatePatchesTable,
    type TavernStructuredStateDocType,
    type TavernStructuredStateDocumentRecord,
    type TavernStructuredStatePatchRecord,
} from './session-db';
import {
    buildSeedLabelId,
    buildSeedMapHint,
    createSeedMapDocument,
    isSeedLabelId,
    isUninitializedMapData,
    TAVERN_MAP_DOC_ID,
    TAVERN_MAP_DOC_TYPE,
    type TavernMapStatus,
    type TavernMapTheme,
} from './map-state-seed';
import {
    createSeedAtlasDocument,
    TAVERN_ATLAS_DOC_ID,
    TAVERN_ATLAS_DOC_TYPE,
} from './atlas-state-seed';
import { hasSpatialMapContent } from './map-state-content';
import { mergeMapElementPatch } from './map-state-ops';
import {
    canonicalMaterialSymbolName,
    normalizeMaterialSymbolName,
    type MaterialSymbolName,
} from './material-symbols';
import {
    isMapExitSemantic,
    normalizeMapElementKind,
    TAVERN_MAP_ELEMENT_KINDS,
    type TavernMapElementKind,
} from './map-material-symbols';
import {
    canMapElementHaveDerivedLabel,
    isTavernMapCertainty,
    isTavernMapMaterial,
    isTavernMapMood,
    semanticFingerprint,
    TAVERN_MAP_CERTAINTIES,
    TAVERN_MAP_MATERIALS,
    TAVERN_MAP_MOODS,
    type TavernMapCertainty,
    type TavernMapMaterial,
    type TavernMapMood,
} from './map-semantics';

export const TAVERN_STATE_TOOL_NAMES = {
    LIST: 'MapDocs',
    READ: 'MapInspect',
    PATCH: 'MapPatch',
    READ_ATLAS: 'MapAtlasRead',
    READ_SCENE: 'MapSceneRead',
    EDIT_SCENE: 'MapSceneEdit',
} as const;

const MODEL_FACING_STATE_TOOL_NAMES = new Set<string>([
    TAVERN_STATE_TOOL_NAMES.READ_ATLAS,
    TAVERN_STATE_TOOL_NAMES.READ_SCENE,
    TAVERN_STATE_TOOL_NAMES.EDIT_SCENE,
]);

export type TavernMapElementCategory =
    | 'wall'
    | 'road'
    | 'water'
    | 'terrain'
    | 'furniture'
    | 'decoration'
    | 'door'
    | 'danger'
    | 'marker'
    | 'actor'
    | 'label'
    | 'grid'
    | 'magic'
    | 'secret'
    | 'light';

export interface TavernMapStyle {
    color?: string;
    width?: number;
    dash?: string;
}

export interface TavernMapDocumentMeta {
    name: string | null;
    viewBox: [number, number, number, number] | null;
    theme: TavernMapTheme;
    status: TavernMapStatus;
    mood?: TavernMapMood;
    hint?: string;
}

export interface TavernMapElement {
    id: string;
    at: [number, number];
    cat: TavernMapElementCategory;
    shape?: 'icon';
    rect?: [number, number];
    circle?: number;
    path?: Array<[number, number]>;
    curve?: Array<[number, number]>;
    icon?: MaterialSymbolName;
    kind?: TavernMapElementKind;
    text?: string;
    actorKey?: string;
    material?: TavernMapMaterial;
    certainty?: TavernMapCertainty;
    closed?: boolean;
    fill?: string;
    style?: TavernMapStyle;
}

export type TavernMapElementPatchSet = Partial<{ [K in keyof TavernMapElement]: TavernMapElement[K] | null }>;

export interface TavernMapDocument {
    meta: TavernMapDocumentMeta;
    elements: TavernMapElement[];
}

export type TavernAtlasLocationScale = 'city' | 'district' | 'building' | 'floor' | 'room' | 'outdoor';
export type TavernAtlasLocationStatus = 'mentioned' | 'visited';
export type TavernAtlasLinkKind = 'door' | 'stairs' | 'elevator' | 'path' | 'road' | 'portal' | 'passage';

export interface TavernAtlasLocation {
    key: string;
    name: string;
    scale: TavernAtlasLocationScale;
    status: TavernAtlasLocationStatus;
    parent?: string;
    mapDocId?: string;
    aliases?: string[];
    brief?: string;
}

export interface TavernAtlasLink {
    id: string;
    from: string;
    to: string;
    kind: TavernAtlasLinkKind;
    label?: string;
    bidirectional: boolean;
}

export interface TavernAtlasActorPosition {
    actorKey: string;
    locationKey: string;
}

export interface TavernAtlasDocument {
    version: 1;
    activeLocationKey?: string;
    locations: TavernAtlasLocation[];
    links: TavernAtlasLink[];
    actors: TavernAtlasActorPosition[];
}

export type TavernMapPatchOp =
    | { op: 'meta'; set: Partial<TavernMapDocumentMeta> }
    | { op: 'add'; element: TavernMapElement }
    | { op: 'modify'; id: string; set: TavernMapElementPatchSet }
    | { op: 'remove'; id: string; _internalSoft?: true };

export type TavernAtlasPatchOp =
    | { op: 'upsert-location'; key: string; set?: Partial<Omit<TavernAtlasLocation, 'key'>>; unset?: Array<'parent' | 'mapDocId' | 'aliases' | 'brief'> }
    | { op: 'remove-location'; key: string }
    | { op: 'upsert-link'; id?: string; from: string; to: string; kind: TavernAtlasLinkKind; label?: string; bidirectional?: boolean }
    | { op: 'remove-link'; id?: string; from?: string; to?: string; kind?: TavernAtlasLinkKind; bidirectional?: boolean }
    | { op: 'move-actor'; actorKey: string; locationKey: string };

export interface TavernStateToolResult {
    ok: boolean;
    summary: string;
    file?: string;
    scene?: string;
    docType?: TavernStructuredStateDocType;
    docId?: string;
    title?: string;
    revision?: number;
    changed?: boolean;
    appliedCount?: number;
    satisfiedCount?: number;
    failedCount?: number;
    failed?: Array<{ index: number; error: string; hint?: string }>;
    count?: number;
    truncated?: boolean;
    nextOffset?: number;
    documents?: TavernStateDocumentListItem[];
    document?: unknown;
    digest?: string;
    meta?: TavernMapDocumentMeta;
    elementCount?: number;
    element?: TavernMapElement;
    elements?: TavernMapElement[];
    activeLocationKey?: string;
    locations?: TavernAtlasLocation[];
    location?: TavernAtlasLocation & { links?: TavernAtlasLink[]; actors?: TavernAtlasActorPosition[] };
    links?: TavernAtlasLink[];
    actors?: TavernAtlasActorPosition[];
    removedElements?: TavernMapElement[];
    patches?: TavernStructuredStatePatchRecord[];
    changedIds?: string[];
    applied?: Array<Record<string, unknown>>;
    skipped?: Array<Record<string, unknown>>;
    warnings?: string[];
    error?: string;
    details?: unknown;
}

export type TavernStateToolCaller = 'auto' | 'chat';

type MapShapeKey = 'rect' | 'circle' | 'path' | 'curve' | 'icon' | 'text';
type MapIntentShapeKey = 'rect' | 'circle' | 'path' | 'curve' | 'icon' | 'label';
type NormalizeSource = 'model-input' | 'stored-document';

const MAP_DOC_TYPE: TavernStructuredStateDocType = TAVERN_MAP_DOC_TYPE;
const ATLAS_DOC_TYPE: TavernStructuredStateDocType = TAVERN_ATLAS_DOC_TYPE;
const DEFAULT_DOC_ID = TAVERN_MAP_DOC_ID;
const DEFAULT_ATLAS_DOC_ID = TAVERN_ATLAS_DOC_ID;
const MAX_MAP_ELEMENTS = 2000;
const MAX_STATE_PATCH_OPS = 1000;
const MAX_STATE_READ_LIMIT = 300;

const MAP_SHAPE_KEYS: MapShapeKey[] = ['rect', 'circle', 'path', 'curve', 'icon', 'text'];
const MAP_GEOMETRY_KEYS: MapShapeKey[] = ['rect', 'circle', 'path', 'curve', 'icon'];
const MAP_ELEMENT_CATEGORIES = new Set<TavernMapElementCategory>([
    'wall',
    'road',
    'water',
    'terrain',
    'furniture',
    'decoration',
    'door',
    'danger',
    'marker',
    'actor',
    'label',
    'grid',
    'magic',
    'secret',
    'light',
]);
const MAP_THEMES = new Set<TavernMapTheme>(['parchment', 'paper', 'dark', 'blueprint', 'grid']);
const MAP_STATUSES = new Set<TavernMapStatus>(['uninitialized', 'active']);
const ATLAS_LOCATION_SCALES = new Set<TavernAtlasLocationScale>(['city', 'district', 'building', 'floor', 'room', 'outdoor']);
const ATLAS_LOCATION_STATUSES = new Set<TavernAtlasLocationStatus>(['mentioned', 'visited']);
const ATLAS_LINK_KINDS = new Set<TavernAtlasLinkKind>(['door', 'stairs', 'elevator', 'path', 'road', 'portal', 'passage']);
const ATLAS_UNSET_FIELDS = new Set(['parent', 'mapDocId', 'aliases', 'brief']);
const MAP_INTENT_SHAPES = new Set<MapIntentShapeKey>(['rect', 'circle', 'path', 'curve', 'icon', 'label']);

interface TavernMapIntentTarget {
    sceneName: string;
    locationKey: string;
    docId: string;
    title: string;
    existingLocation?: TavernAtlasLocation;
}

interface TavernMapIntentCompileResult {
    document: TavernMapDocument;
    effectiveOps: TavernMapPatchOp[];
    appliedCount: number;
    satisfiedCount: number;
    applied: Array<Record<string, unknown>>;
    skipped: Array<Record<string, unknown>>;
    warnings: string[];
    changedIds: string[];
    removedElements: TavernMapElement[];
    changed: boolean;
}

export type TavernStateDocumentListItem = Pick<TavernStructuredStateDocumentRecord, 'docType' | 'docId' | 'title' | 'revision' | 'digest' | 'status' | 'updatedAt'> & {
    active?: boolean;
};

export type TavernMapStateDocumentItem = TavernStructuredStateDocumentRecord & {
    active?: boolean;
};

function now(): number {
    return Date.now();
}

function hashSceneKey(value: string): string {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

function normalizeMapDocId(value: unknown = DEFAULT_DOC_ID): string {
    const text = String(value || DEFAULT_DOC_ID).trim() || DEFAULT_DOC_ID;
    return /^[\w.-]{1,80}$/i.test(text) ? text : DEFAULT_DOC_ID;
}

function mapDocIdFromSceneKey(sceneKey: string): string {
    const text = String(sceneKey || '').trim();
    if (/^[\w.-]{1,80}$/i.test(text)) {return text;}
    return `scene-${hashSceneKey(text || 'scene')}`;
}

function normalizeMapDocIdOrThrow(value: unknown, error = 'state_doc_id_invalid'): string {
    const text = String(value || '').trim();
    if (!text || !/^[\w.-]{1,80}$/i.test(text)) {throw new Error(error);}
    return text;
}

function isUninitializedSeedMapRecord(record: Pick<TavernStructuredStateDocumentRecord, 'docType' | 'docId' | 'revision' | 'data'> | null | undefined): boolean {
    return record?.docType === MAP_DOC_TYPE
        && record.docId === DEFAULT_DOC_ID
        && Number(record.revision) === 0
        && isUninitializedMapData(record.data);
}

function sortMapRecordsForDisplay<T extends Pick<TavernStructuredStateDocumentRecord, 'revision' | 'updatedAt'>>(records: T[]): T[] {
    return [...records].sort((left, right) => (
        (Number(right.updatedAt) || 0) - (Number(left.updatedAt) || 0)
        || (Number(right.revision) || 0) - (Number(left.revision) || 0)
    ));
}

async function getActiveMapDocId(sessionId = ''): Promise<string> {
    const session = await tavernSessionsTable.get(String(sessionId || '').trim());
    return normalizeMapDocId(session?.state?.activeMapDocId || DEFAULT_DOC_ID);
}

async function setActiveMapDocId(sessionId = '', docId = DEFAULT_DOC_ID): Promise<string> {
    const id = String(sessionId || '').trim();
    const activeMapDocId = normalizeMapDocId(docId);
    if (!id) {return activeMapDocId;}
    const session = await tavernSessionsTable.get(id);
    const state = session?.state && typeof session.state === 'object' && !Array.isArray(session.state)
        ? { ...session.state, activeMapDocId }
        : { activeMapDocId };
    await tavernSessionsTable.update(id, {
        state,
        updatedAt: now(),
    });
    return activeMapDocId;
}

async function buildMapAtlasMismatchWarning(sessionId = '', activatedDocId = ''): Promise<string[]> {
    const atlasRecord = await getTavernStructuredStateDocument(sessionId, ATLAS_DOC_TYPE, DEFAULT_ATLAS_DOC_ID);
    const atlas = normalizeAtlasDocumentFromRecord(atlasRecord);
    const activeLocation = atlas.locations.find((location) => location.key === atlas.activeLocationKey);
    const atlasMapDocId = activeLocation?.mapDocId;
    if (!atlas.activeLocationKey || !atlasMapDocId || atlasMapDocId === activatedDocId) {return [];}
    return [
        `Map doc '${activatedDocId}' activated. Atlas still says player/current location is '${atlas.activeLocationKey}'. If the story moved the player, send tavern.atlas move-actor with actorKey:"player" and the correct locationKey.`,
    ];
}

async function resolveTavernActiveMapDocument(
    sessionId = '',
    options: { includeStale?: boolean } = {},
): Promise<{
    requestedDocId: string;
    activeDocId: string;
    record: TavernStructuredStateDocumentRecord | null;
    documents: TavernStructuredStateDocumentRecord[];
}> {
    await ensureSeedStructuredStateDocument(sessionId, { touchSession: false });
    const requestedDocId = await getActiveMapDocId(sessionId);
    const documents = await listTavernStructuredStateDocuments(sessionId, {
        docType: MAP_DOC_TYPE,
        includeStale: options.includeStale === true,
    });
    const initializedDocuments = sortMapRecordsForDisplay(documents.filter((document) => !isUninitializedSeedMapRecord(document)));
    const requestedRecord = documents.find((document) => document.docId === requestedDocId) || null;
    const defaultRecord = documents.find((document) => document.docId === DEFAULT_DOC_ID) || null;
    const record = requestedRecord && (!isUninitializedSeedMapRecord(requestedRecord) || !initializedDocuments.length)
        ? requestedRecord
        : (!isUninitializedSeedMapRecord(defaultRecord) ? defaultRecord : null)
        || initializedDocuments[0]
        || documents[0]
        || null;
    return {
        requestedDocId,
        activeDocId: record?.docId || requestedDocId,
        record,
        documents,
    };
}

function cloneJson<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value: unknown = '', limit = 400): string {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    return text.length > limit ? text.slice(0, limit) : text;
}

function stableStringify(value: unknown): string {
    return JSON.stringify(value ?? null);
}

function deepEqual(left: unknown, right: unknown): boolean {
    return stableStringify(left) === stableStringify(right);
}

function normalizeDocType(value: unknown = MAP_DOC_TYPE): TavernStructuredStateDocType {
    const text = String(value || MAP_DOC_TYPE).trim();
    if (text === MAP_DOC_TYPE || text === ATLAS_DOC_TYPE) {return text as TavernStructuredStateDocType;}
    throw new Error('state_doc_type_not_supported');
}

function normalizeDocId(value: unknown = DEFAULT_DOC_ID): string {
    const text = String(value || DEFAULT_DOC_ID).trim() || DEFAULT_DOC_ID;
    if (!/^[\w.-]{1,80}$/i.test(text)) {throw new Error('state_doc_id_invalid');}
    return text;
}

function normalizeStateDocIdForType(docType: TavernStructuredStateDocType, value: unknown): string {
    if (docType === ATLAS_DOC_TYPE) {
        const text = String(value || DEFAULT_ATLAS_DOC_ID).trim() || DEFAULT_ATLAS_DOC_ID;
        if (text !== DEFAULT_ATLAS_DOC_ID) {throw new Error('atlas_doc_id_invalid');}
        return DEFAULT_ATLAS_DOC_ID;
    }
    return normalizeDocId(value || DEFAULT_DOC_ID);
}

function normalizeMapTheme(value: unknown, fallback: TavernMapTheme = 'parchment'): TavernMapTheme {
    return MAP_THEMES.has(String(value || '').trim() as TavernMapTheme)
        ? String(value).trim() as TavernMapTheme
        : fallback;
}

function normalizeMapStatus(value: unknown, fallback: TavernMapStatus = 'active'): TavernMapStatus {
    return MAP_STATUSES.has(String(value || '').trim() as TavernMapStatus)
        ? String(value).trim() as TavernMapStatus
        : fallback;
}

function normalizeViewBox(value: unknown): [number, number, number, number] | null {
    if (value === null) {return null;}
    if (!Array.isArray(value) || value.length !== 4) {return null;}
    const numbers = value.map((item) => Number(item));
    if (!numbers.every((item) => Number.isFinite(item))) {return null;}
    return [numbers[0], numbers[1], Math.max(1, numbers[2]), Math.max(1, numbers[3])];
}

function normalizePoint(value: unknown): [number, number] | null {
    if (Array.isArray(value) && value.length >= 2) {
        const x = Number(value[0]);
        const y = Number(value[1]);
        return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : null;
    }
    if (isPlainObject(value)) {
        const x = Number(value.x ?? value.cx);
        const y = Number(value.y ?? value.cy);
        return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : null;
    }
    return null;
}

function pointOrThrow(value: unknown, error: string): [number, number] {
    const point = normalizePoint(value);
    if (!point) {throw new Error(error);}
    return point;
}

function pointListOrThrow(value: unknown, error: string, minPoints = 2): Array<[number, number]> {
    if (!Array.isArray(value) || value.length < minPoints) {throw new Error(error);}
    const points = value.map((item) => normalizePoint(item));
    if (points.some((point) => !point)) {throw new Error(error);}
    return points as Array<[number, number]>;
}

function positiveNumber(value: unknown): number | null {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
}

function numberPair(value: unknown): [number, number] | null {
    if (!Array.isArray(value) || value.length < 2) {return null;}
    const left = Number(value[0]);
    const right = Number(value[1]);
    return Number.isFinite(left) && Number.isFinite(right) ? [left, right] : null;
}

function positiveNumberPair(value: unknown): [number, number] | null {
    const pair = numberPair(value);
    return pair && pair[0] > 0 && pair[1] > 0 ? pair : null;
}

function normalizeCategory(value: unknown, fallback: TavernMapElementCategory): TavernMapElementCategory {
    const text = String(value || '').trim();
    if ([
        'floor',
        'ground',
        'surface',
        'base',
        'area',
        'deck',
        'platform',
        'walkway',
        'clearing',
        'yard',
    ].includes(text)) {return 'terrain';}
    if (text && MAP_ELEMENT_CATEGORIES.has(text as TavernMapElementCategory)) {return text as TavernMapElementCategory;}
    return fallback;
}

function normalizeMapMood(value: unknown, fallback: TavernMapMood = 'neutral', warnings?: string[]): TavernMapMood {
    const text = String(value || '').trim();
    if (isTavernMapMood(text)) {return text;}
    if (text) {warnings?.push(`Ignored invalid map mood: ${text}.`);}
    return fallback;
}

function normalizeMapMaterial(
    value: unknown,
    context: { elementId?: string; warnings?: string[]; source?: NormalizeSource } = {},
): TavernMapMaterial | undefined {
    if (value === null || value === undefined || value === '') {return undefined;}
    const text = String(value || '').trim();
    if (isTavernMapMaterial(text)) {return text;}
    context.warnings?.push(`Ignored invalid map material${context.elementId ? ` for ${context.elementId}` : ''}: ${text}.`);
    return undefined;
}

function normalizeMapCertainty(
    value: unknown,
    fallback?: TavernMapCertainty,
    context: { elementId?: string; warnings?: string[] } = {},
): TavernMapCertainty | undefined {
    if (value === null || value === undefined || value === '') {return fallback;}
    const text = String(value || '').trim();
    if (isTavernMapCertainty(text)) {return text;}
    context.warnings?.push(`Ignored invalid map certainty${context.elementId ? ` for ${context.elementId}` : ''}: ${text}.`);
    return fallback;
}

function normalizeMapKind(
    value: unknown,
    context: { elementId?: string; warnings?: string[] } = {},
): TavernMapElementKind | undefined {
    if (value === null || value === undefined || value === '') {return undefined;}
    const kind = normalizeMapElementKind(value);
    if (kind) {return kind;}
    context.warnings?.push(`Ignored invalid map kind${context.elementId ? ` for ${context.elementId}` : ''}: ${normalizeText(value, 80)}.`);
    return undefined;
}

function normalizeIcon(
    value: unknown,
    context: { elementId?: string; warnings?: string[] } = {},
): MaterialSymbolName | undefined {
    if (value === null || value === undefined || value === '') {return undefined;}
    const normalized = normalizeMaterialSymbolName(value);
    if (!normalized) {return undefined;}
    const icon = canonicalMaterialSymbolName(value);
    if (icon) {return icon;}
    context.warnings?.push(`Ignored invalid Material Symbols icon${context.elementId ? ` for ${context.elementId}` : ''}: ${normalizeText(value, 80)}.`);
    return undefined;
}

function normalizeActorKey(value: unknown = ''): string {
    return String(value || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .slice(0, 120);
}

function normalizeStyle(value: unknown): TavernMapStyle | undefined {
    if (value === null) {return undefined;}
    const source = isPlainObject(value) ? value : {};
    const next: TavernMapStyle = {};
    const color = normalizeText(source.color, 80);
    const dash = normalizeText(source.dash, 80);
    const width = positiveNumber(source.width);
    if (color) {next.color = color;}
    if (dash) {next.dash = dash;}
    if (width !== null) {next.width = width;}
    return Object.keys(next).length ? next : undefined;
}

function normalizeMapMeta(value: unknown, fallback: Partial<TavernMapDocumentMeta> = {}, warnings?: string[]): TavernMapDocumentMeta {
    const source = isPlainObject(value) ? value : {};
    const status = normalizeMapStatus(source.status ?? fallback.status ?? 'active', fallback.status ?? 'active');
    const nameSource = 'name' in source ? source.name : fallback.name;
    const hintSource = 'hint' in source ? source.hint : fallback.hint;
    return {
        name: nameSource === null ? null : normalizeText(nameSource, 120) || null,
        viewBox: 'viewBox' in source ? normalizeViewBox(source.viewBox) : normalizeViewBox(fallback.viewBox ?? null),
        theme: normalizeMapTheme(source.theme ?? fallback.theme ?? 'parchment', fallback.theme ?? 'parchment'),
        status,
        mood: normalizeMapMood(source.mood ?? fallback.mood ?? 'neutral', fallback.mood ?? 'neutral', warnings),
        ...(status === 'uninitialized'
            ? { hint: normalizeText(hintSource ?? buildSeedMapHint(), 1200) || buildSeedMapHint() }
            : {}),
    };
}

function normalizeMetaSet(value: unknown, warnings: string[] = []): Partial<TavernMapDocumentMeta> {
    if (!isPlainObject(value)) {throw new Error('map_meta_set_required');}
    const set: Partial<TavernMapDocumentMeta> = {};
    if ('name' in value) {
        set.name = value.name === null ? null : normalizeText(value.name, 120) || null;
    }
    if ('viewBox' in value) {
        set.viewBox = normalizeViewBox(value.viewBox);
    }
    if ('theme' in value) {
        set.theme = normalizeMapTheme(value.theme);
    }
    if ('status' in value) {
        set.status = normalizeMapStatus(value.status);
    }
    if ('mood' in value) {
        const moodText = String(value.mood || '').trim();
        if (isTavernMapMood(moodText)) {
            set.mood = moodText;
        } else if (value.mood === null || moodText === '') {
            set.mood = 'neutral';
        } else {
            warnings.push(`Ignored invalid map mood: ${moodText}.`);
        }
    }
    if ('hint' in value) {
        const hint = normalizeText(value.hint, 1200);
        set.hint = hint || undefined;
    }
    return set;
}

function mergeMapMeta(current: TavernMapDocumentMeta, set: Partial<TavernMapDocumentMeta>): TavernMapDocumentMeta {
    return normalizeMapMeta({
        ...current,
        ...set,
        ...(set.hint === undefined && 'hint' in set ? { hint: null } : {}),
    }, current);
}

function shapeKeyForElement(element: Partial<TavernMapElement>): MapShapeKey | null {
    if (element.shape === 'icon') {return 'icon';}
    for (const key of MAP_SHAPE_KEYS) {
        if (key === 'icon') {continue;}
        if (key === 'circle') {
            if (typeof element.circle === 'number') {return key;}
            continue;
        }
        if (key === 'text') {
            if (typeof element.text === 'string' && element.text.trim()) {return key;}
            continue;
        }
        if (Array.isArray(element[key])) {return key;}
        if (typeof element[key] === 'string' && element[key]) {return key;}
    }
    if (typeof element.icon === 'string' && element.icon) {return 'icon';}
    return null;
}

function defaultCategoryForShape(shape: MapShapeKey | null): TavernMapElementCategory {
    if (shape === 'text') {return 'label';}
    if (shape === 'icon') {return 'marker';}
    return 'wall';
}

function arcToCurvePoints(source: Record<string, unknown>, id: string): Array<[number, number]> {
    const center = pointOrThrow(source.center ?? source.pos ?? { x: source.cx, y: source.cy }, `map_element_center_required:${id}`);
    const radius = positiveNumber(source.r ?? source.radius);
    if (radius === null) {throw new Error(`map_element_radius_required:${id}`);}
    const start = Number(source.startAngle);
    const end = Number(source.endAngle);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {throw new Error(`map_element_arc_angles_required:${id}`);}
    const delta = end - start;
    const segments = Math.max(4, Math.min(24, Math.ceil(Math.abs(delta) / 30)));
    return Array.from({ length: segments + 1 }, (_, index) => {
        const angle = (start + (delta * index / segments)) * Math.PI / 180;
        return [
            Number((center[0] + radius * Math.cos(angle)).toFixed(2)),
            Number((center[1] + radius * Math.sin(angle)).toFixed(2)),
        ];
    });
}

function normalizePathLikePoints(
    value: unknown,
    id: string,
    at: [number, number] | null,
): { at: [number, number]; points: Array<[number, number]> } {
    const absolute = pointListOrThrow(value, `map_element_points_required:${id}`, 2);
    if (at) {
        return { at, points: absolute };
    }
    const anchor = absolute[0];
    return {
        at: anchor,
        points: absolute.map(([x, y]) => [Number((x - anchor[0]).toFixed(2)), Number((y - anchor[1]).toFixed(2))]),
    };
}

function labelPositionForElement(element: Pick<TavernMapElement, 'at' | 'rect' | 'circle' | 'path' | 'curve' | 'icon'>): [number, number] {
    const [x, y] = element.at;
    if (element.rect) {return [x + Math.max(18, element.rect[0] / 2), y - 18];}
    if (typeof element.circle === 'number') {return [x + element.circle + 18, y - 6];}
    return [x + 18, y - 18];
}

function assertElementId(id: string, options: { allowReserved?: boolean } = {}): string {
    if (!id || !/^[\w:.-]{1,120}$/i.test(id)) {throw new Error('map_element_id_invalid');}
    if (!options.allowReserved && isSeedLabelId(id)) {throw new Error(`map_element_id_reserved:${id}`);}
    return id;
}

function validateShapeConflict(id: string, shapeKeys: MapShapeKey[]) {
    const unique = [...new Set(shapeKeys)];
    if (!unique.length) {throw new Error(`map_element_shape_required:${id}`);}
    if (unique.length === 1) {return;}
    if (unique.length === 2 && unique.includes('text') && unique.some((shape) => MAP_GEOMETRY_KEYS.includes(shape))) {return;}
    throw new Error(`map_element_shape_conflict:${id}`);
}

function isEmptyShapeArray(value: unknown): boolean {
    return Array.isArray(value) && value.length === 0;
}

function suppliedEmptyShapeKeys(value: Record<string, unknown>, keys: string[]): string[] {
    return keys.filter((key) => Object.prototype.hasOwnProperty.call(value, key) && isEmptyShapeArray(value[key]));
}

function firstNonEmptyPathLikeSource(value: Record<string, unknown>): unknown {
    for (const key of ['path', 'points', 'line']) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {continue;}
        const candidate = value[key];
        if (isEmptyShapeArray(candidate)) {continue;}
        return candidate;
    }
    if (value.x1 !== undefined || value.y1 !== undefined || value.x2 !== undefined || value.y2 !== undefined) {
        return [[value.x1, value.y1], [value.x2, value.y2]];
    }
    return null;
}

function warnIgnoredEmptyShapeFields(id: string, keys: string[], warnings?: string[]): void {
    if (!keys.length) {return;}
    warnings?.push(`Ignored empty shape field(s) for ${id}: ${[...new Set(keys)].join(', ')}. Omit unused shape fields instead of sending empty arrays.`);
}

function finalizeElement(
    element: Partial<TavernMapElement>,
    id: string,
    options: {
        allowReservedId?: boolean;
        warnings?: string[];
        source?: NormalizeSource;
    } = {},
): TavernMapElement {
    const finalId = assertElementId(id, { allowReserved: options.allowReservedId === true });
    const shape = shapeKeyForElement(element);
    if (!shape) {throw new Error(`map_element_shape_required:${finalId}`);}
    const at = pointOrThrow(element.at, `map_element_at_required:${finalId}`);
    const cat = normalizeCategory(element.cat, defaultCategoryForShape(shape));
    const next: TavernMapElement = {
        id: finalId,
        at,
        cat,
    };
    const kind = normalizeMapKind(element.kind, { elementId: finalId, warnings: options.warnings });
    if (kind) {next.kind = kind;}
    if (element.rect) {
        const rect = numberPair(element.rect);
        if (!rect || rect[0] <= 0 || rect[1] <= 0) {throw new Error(`map_element_rect_invalid:${finalId}`);}
        next.rect = rect;
    }
    if (typeof element.circle === 'number') {
        if (!(element.circle > 0)) {throw new Error(`map_element_radius_required:${finalId}`);}
        next.circle = element.circle;
    }
    if (element.path) {
        next.path = pointListOrThrow(element.path, `map_element_points_required:${finalId}`, 2);
    }
    if (element.curve) {
        next.curve = pointListOrThrow(element.curve, `map_element_points_required:${finalId}`, 2);
    }
    if (shape === 'icon') {
        next.shape = 'icon';
        if (element.icon) {
            const icon = normalizeIcon(element.icon, {
                elementId: finalId,
                warnings: options.warnings,
            });
            if (icon) {next.icon = icon;}
        }
    }
    if (element.text !== undefined) {
        const text = normalizeText(element.text, 240);
        if (!text) {throw new Error(`map_element_text_required:${finalId}`);}
        next.text = text;
    }
    const actorKey = normalizeText(element.actorKey, 120);
    if (actorKey && next.cat === 'actor') {next.actorKey = actorKey;}
    const material = normalizeMapMaterial(element.material, { elementId: finalId, warnings: options.warnings, source: options.source });
    if (material) {
        if (next.cat === 'actor' && material === 'shadow') {
            options.warnings?.push(`Ignored material:"shadow" for actor ${finalId}; spectral actors are not represented by material in map v1.1.`);
        } else {
            next.material = material;
        }
    }
    const certainty = normalizeMapCertainty(element.certainty, undefined, { elementId: finalId, warnings: options.warnings });
    if (certainty && certainty !== 'confirmed') {next.certainty = certainty;}
    if (element.closed === true) {next.closed = true;}
    if (normalizeText(element.fill, 120)) {next.fill = normalizeText(element.fill, 120);}
    if (element.style !== undefined) {
        const style = normalizeStyle(element.style);
        if (style) {next.style = style;}
    }
    return next;
}

function normalizeMapElementInput(
    value: unknown,
    options: {
        forcedId?: string;
        allowReservedId?: boolean;
        splitGeometryText?: boolean;
        source?: NormalizeSource;
        warnings?: string[];
    } = {},
): TavernMapElement[] {
    if (!isPlainObject(value)) {throw new Error('map_element_must_be_object');}
    const source = options.source || 'model-input';
    const rawId = options.forcedId || String(value.id || '').trim();
    const id = assertElementId(rawId, {
        allowReserved: options.allowReservedId === true || source === 'stored-document',
    });
    const kind = normalizeMapKind(value.kind, { elementId: id, warnings: options.warnings });
    let at = normalizePoint(value.at ?? value.pos ?? value.center ?? value.position);
    if (!at && (value.x !== undefined || value.y !== undefined)) {
        at = normalizePoint({ x: value.x, y: value.y });
    }
    if (!at && (value.cx !== undefined || value.cy !== undefined)) {
        at = normalizePoint({ x: value.cx, y: value.cy });
    }

    const shapeParts: Partial<TavernMapElement> = {};
    const legacyType = String(value.type || '').trim();

    const rect = numberPair(value.rect ?? value.size ?? (value.width !== undefined || value.height !== undefined ? [value.width, value.height] : null));
    if (rect) {shapeParts.rect = rect;}

    const circle = legacyType === 'arc' ? null : positiveNumber(value.circle ?? value.r ?? value.radius);
    if (circle !== null) {shapeParts.circle = circle;}

    const emptyPathLikeKeys = suppliedEmptyShapeKeys(value, ['path', 'points', 'line']);
    const emptyCurveKeys = suppliedEmptyShapeKeys(value, ['curve']);
    const pathSource = firstNonEmptyPathLikeSource(value);
    const curveSource = Object.prototype.hasOwnProperty.call(value, 'curve') && !isEmptyShapeArray(value.curve)
        ? value.curve
        : null;

    const textValue = normalizeText(value.text ?? value.content ?? value.label ?? value.value, 240);
    if (textValue) {shapeParts.text = textValue;}

    const explicitIconShape = legacyType === 'icon' || String(value.shape || '').trim() === 'icon';
    const suppliedIcon = Object.prototype.hasOwnProperty.call(value, 'icon');
    const icon = normalizeIcon(value.icon, { elementId: id, warnings: options.warnings });
    if (explicitIconShape || (source === 'stored-document' && suppliedIcon)) {
        shapeParts.shape = 'icon';
        if (icon) {shapeParts.icon = icon;}
    }

    if (legacyType === 'line' && pathSource) {
        const normalized = normalizePathLikePoints(pathSource, id, at);
        at = normalized.at;
        shapeParts.path = normalized.points;
    } else if (legacyType === 'curve' && (curveSource ?? pathSource)) {
        const normalized = normalizePathLikePoints(curveSource ?? pathSource, id, at);
        at = normalized.at;
        shapeParts.curve = normalized.points;
    } else if (legacyType === 'fill' && pathSource) {
        const normalized = normalizePathLikePoints(pathSource, id, at);
        at = normalized.at;
        shapeParts.path = normalized.points;
        shapeParts.closed = true;
        if (normalizeText(value.fill, 120)) {shapeParts.fill = normalizeText(value.fill, 120);}
    } else if (legacyType === 'arc') {
        const normalized = normalizePathLikePoints(arcToCurvePoints(value, id), id, at);
        at = normalized.at;
        shapeParts.curve = normalized.points;
    } else {
        if (pathSource && !shapeParts.path && !shapeParts.curve) {
            const normalized = normalizePathLikePoints(pathSource, id, at);
            at = normalized.at;
            shapeParts.path = normalized.points;
        }
        if (curveSource && !shapeParts.curve) {
            const normalized = normalizePathLikePoints(curveSource, id, at);
            at = normalized.at;
            shapeParts.curve = normalized.points;
        }
    }

    const shapeKeys = MAP_SHAPE_KEYS.filter((key) => {
        if (key === 'icon' && shapeParts.shape === 'icon') {return true;}
        if (key === 'circle') {return typeof shapeParts.circle === 'number';}
        if (key === 'text') {return typeof shapeParts.text === 'string' && !!shapeParts.text.trim();}
        return key in shapeParts;
    });
    if (!shapeKeys.length && (emptyPathLikeKeys.length || emptyCurveKeys.length)) {
        throw new Error(`map_element_points_required:${id}`);
    }
    if (shapeKeys.length) {
        warnIgnoredEmptyShapeFields(id, [...emptyPathLikeKeys, ...emptyCurveKeys], options.warnings);
    }
    validateShapeConflict(id, shapeKeys);

    const cat = normalizeCategory(value.cat, defaultCategoryForShape(shapeKeys.find((key) => key !== 'text') || shapeKeys[0] || null));
    const material = normalizeMapMaterial(value.material, { elementId: id, warnings: options.warnings, source });
    const certainty = normalizeMapCertainty(value.certainty, undefined, { elementId: id, warnings: options.warnings });
    const normalizedFill = normalizeText(value.fill ?? shapeParts.fill, 120) || undefined;
    const fill = material && normalizedFill && source === 'model-input'
        ? undefined
        : normalizedFill;
    if (material && normalizedFill && source === 'model-input') {
        options.warnings?.push(`Dropped legacy fill for ${id} because material:"${material}" was supplied.`);
    }
    const base: Partial<TavernMapElement> = {
        id,
        at: at || undefined,
        cat,
        closed: value.closed === true || shapeParts.closed === true,
        fill,
        style: normalizeStyle(value.style),
        actorKey: normalizeText(value.actorKey, 120) || undefined,
        kind,
        material,
        certainty,
        ...shapeParts,
    };

    if (shapeKeys.length === 2 && options.splitGeometryText !== false) {
        const geometryKey = shapeKeys.find((key) => key !== 'text') as MapShapeKey;
        const geometryCat = normalizeCategory(value.cat, defaultCategoryForShape(geometryKey));
        const geometry: Partial<TavernMapElement> = {
            id,
            at: base.at,
            cat: geometryCat,
            closed: base.closed,
            fill: base.fill,
            style: base.style,
            actorKey: base.actorKey,
            kind: base.kind,
            material: base.material,
            certainty: base.certainty,
            shape: geometryKey === 'icon' ? 'icon' : undefined,
            [geometryKey]: base[geometryKey],
        };
        const geometryElement = finalizeElement(geometry, id, { allowReservedId: options.allowReservedId === true || source === 'stored-document', warnings: options.warnings, source });
        if (!canMapElementHaveDerivedLabel(geometryElement.cat)) {
            options.warnings?.push(`Ignored label text for ${id}; cat:"${geometryElement.cat}" does not derive map labels.`);
            return [geometryElement];
        }
        const labelId = buildSeedLabelId(id);
        const labelElement = finalizeElement({
            id: labelId,
            at: labelPositionForElement(geometryElement),
            cat: 'label',
            text: base.text,
        }, labelId, { allowReservedId: true, warnings: options.warnings, source });
        return [geometryElement, labelElement];
    }

    return [finalizeElement(base, id, { allowReservedId: options.allowReservedId === true || source === 'stored-document', warnings: options.warnings, source })];
}

function repairStoredMapElements(rawElements: unknown[]): TavernMapElement[] {
    const byId = new Map<string, TavernMapElement>();
    const derivedLabelBaseById = new Map<string, string>();
    const putElement = (element: TavernMapElement, options: { derivedFrom?: string } = {}) => {
        if (byId.has(element.id)) {
            byId.delete(element.id);
            derivedLabelBaseById.delete(element.id);
        }
        byId.set(element.id, cloneJson(element));
        if (options.derivedFrom) {
            derivedLabelBaseById.set(element.id, options.derivedFrom);
        } else if (isSeedLabelId(element.id)) {
            derivedLabelBaseById.delete(element.id);
        }
    };

    rawElements.forEach((rawElement) => {
        const normalized = normalizeMapElementInput(rawElement, { source: 'stored-document' });
        const geometry = normalized[0];
        const derivedLabel = normalized.length === 2
            && geometry
            && normalized[1]?.id === buildSeedLabelId(geometry.id)
            ? normalized[1]
            : null;
        if (geometry && !derivedLabel && !isSeedLabelId(geometry.id) && hasGeometryShape(geometry)) {
            const labelId = buildSeedLabelId(geometry.id);
            if (derivedLabelBaseById.get(labelId) === geometry.id) {
                byId.delete(labelId);
                derivedLabelBaseById.delete(labelId);
            }
        }
        normalized.forEach((element) => {
            putElement(element, derivedLabel && element.id === derivedLabel.id ? { derivedFrom: geometry.id } : {});
        });
    });
    return [...byId.values()];
}

function normalizeMapDocument(
    value: unknown,
    fallback: Partial<TavernMapDocumentMeta> = {},
    normalizeSource: NormalizeSource = 'stored-document',
    warnings: string[] = [],
): TavernMapDocument {
    const raw = isPlainObject(value) ? value : {};
    const meta = normalizeMapMeta(raw.meta, fallback, normalizeSource === 'model-input' ? warnings : undefined);
    const elements = Array.isArray(raw.elements)
        ? normalizeSource === 'stored-document'
            ? repairStoredMapElements(raw.elements)
            : raw.elements.flatMap((element) => normalizeMapElementInput(element, { source: normalizeSource, warnings }))
        : [];
    if (elements.length > MAX_MAP_ELEMENTS) {throw new Error('map_elements_limit_exceeded');}
    if (normalizeSource === 'model-input') {
        const ids = new Set<string>();
        elements.forEach((element) => {
            if (ids.has(element.id)) {throw new Error(`map_element_duplicate:${element.id}`);}
            ids.add(element.id);
        });
    }
    return { meta, elements };
}

function defaultMapDocument(): TavernMapDocument {
    return normalizeMapDocument(createSeedMapDocument(), createSeedMapDocument().meta, 'stored-document');
}

function normalizeMapDocumentFromRecord(document: TavernStructuredStateDocumentRecord | null): TavernMapDocument {
    if (!document?.data) {return defaultMapDocument();}
    return normalizeMapDocument(document.data, createSeedMapDocument().meta, 'stored-document');
}

function uniqueShortList(values: string[] = [], limit = 8): string[] {
    return [...new Set(values.map((value) => normalizeText(value, 40)).filter(Boolean))].slice(0, limit);
}

function fallbackMapElementName(element: TavernMapElement): string {
    const kind = normalizeText(element.kind, 40);
    if (kind && !['marker', 'actor', 'player'].includes(kind)) {return kind;}
    return normalizeText(String(element.id || '').replace(/^__label__/, '').replace(/[-_]+/g, ' '), 40);
}

function isGenericActorLabel(value: unknown): boolean {
    const text = normalizeText(value, 40);
    const lower = text.toLowerCase();
    return lower === 'player'
        || lower === 'user'
        || lower.startsWith('player ')
        || lower.startsWith('user ')
        || text === '玩家'
        || text.startsWith('玩家')
        || text === '用户'
        || text.startsWith('用户')
        || text === '你'
        || text === '您';
}

function actorMapElementName(element: TavernMapElement, labelsByBaseId: Map<string, string>): string {
    const text = normalizeText(element.text, 40);
    if (text && !isGenericActorLabel(text)) {return text;}
    const label = normalizeText(labelsByBaseId.get(element.id), 40);
    if (label && !isGenericActorLabel(label)) {return label;}
    const actorKey = normalizeText(element.actorKey, 40);
    if (actorKey && !isGenericActorLabel(actorKey)) {return actorKey;}
    if (actorKey && isGenericActorLabel(actorKey)) {return '';}
    const fallback = fallbackMapElementName(element);
    return fallback && !isGenericActorLabel(fallback) ? fallback : '';
}

function labeledMapElementName(element: TavernMapElement, labelsByBaseId: Map<string, string>): string {
    return normalizeText(element.text, 40)
        || normalizeText(labelsByBaseId.get(element.id), 40)
        || fallbackMapElementName(element);
}

function createMapDigest(document: TavernMapDocument, revision = 0): string {
    void revision;
    if (document.meta.status !== 'active' || !hasSpatialMapContent(document.elements)) {return '';}
    const title = normalizeText(document.meta.name || 'Map', 80) || 'Map';
    const labelsByBaseId = new Map<string, string>();
    const labelElements = document.elements.filter((element) => element.cat === 'label' && typeof element.text === 'string' && element.text.trim());
    labelElements.forEach((element) => {
        if (!isSeedLabelId(element.id)) {return;}
        const baseId = element.id.slice(buildSeedLabelId('').length);
        const text = normalizeText(element.text, 40);
        if (baseId && text) {labelsByBaseId.set(baseId, text);}
    });
    const sceneElements = document.elements.filter((element) => element.cat !== 'label' && !isSeedLabelId(element.id));
    const sceneElementById = new Map(sceneElements.map((element) => [element.id, element]));
    const labels = uniqueShortList(labelElements.map((element) => {
        const text = normalizeText(element.text, 40);
        if (!isSeedLabelId(element.id)) {return text;}
        const baseId = element.id.slice(buildSeedLabelId('').length);
        const baseElement = sceneElementById.get(baseId);
        return baseElement?.cat === 'actor' && isGenericActorLabel(text) ? '' : text;
    }), 8);
    const namesFor = (cats: TavernMapElementCategory[]) => uniqueShortList(sceneElements
        .filter((element) => cats.includes(element.cat))
        .map((element) => labeledMapElementName(element, labelsByBaseId)), 8);
    const actors = uniqueShortList(sceneElements
        .filter((element) => element.cat === 'actor')
        .map((element) => actorMapElementName(element, labelsByBaseId)), 8);
    const exits = uniqueShortList(sceneElements
        .filter((element) => isMapExitSemantic(element.cat, element.kind))
        .map((element) => labeledMapElementName(element, labelsByBaseId)), 8);
    const interactives = namesFor(['furniture', 'decoration', 'danger', 'secret', 'magic', 'marker']);
    const terrain = namesFor(['terrain', 'road', 'water']);
    return [
        `地图：${title}`,
        actors.length ? `场景人物：${actors.join('、')}` : '',
        exits.length ? `出入口：${exits.join('、')}` : '',
        interactives.length ? `可互动：${interactives.join('、')}` : '',
        terrain.length ? `主表面/地形：${terrain.join('、')}` : '',
        labels.length ? `标注：${labels.join(', ')}` : '',
    ].filter(Boolean).join('\n');
}

function mapTitle(document: TavernMapDocument): string {
    return normalizeText(document.meta.name || 'Map', 120) || 'Map';
}

function normalizeAtlasKey(value: unknown = ''): string {
    return String(value || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 120);
}

function normalizeAtlasKeyOrThrow(value: unknown, error: string): string {
    const key = normalizeAtlasKey(value);
    if (!key || /[/\\:*?"<>|\u0000-\u001F]/.test(key) || key === '.' || key === '..') {
        throw new Error(error);
    }
    return key;
}

function normalizeAtlasScale(value: unknown): TavernAtlasLocationScale {
    const text = String(value || '').trim() as TavernAtlasLocationScale;
    if (!ATLAS_LOCATION_SCALES.has(text)) {throw new Error('atlas_location_scale_invalid');}
    return text;
}

function normalizeAtlasStatus(value: unknown): TavernAtlasLocationStatus {
    const text = String(value || '').trim() as TavernAtlasLocationStatus;
    if (!ATLAS_LOCATION_STATUSES.has(text)) {throw new Error('atlas_location_status_invalid');}
    return text;
}

function normalizeAtlasLinkKind(value: unknown): TavernAtlasLinkKind {
    const text = String(value || '').trim() as TavernAtlasLinkKind;
    if (!ATLAS_LINK_KINDS.has(text)) {throw new Error('atlas_link_kind_invalid');}
    return text;
}

function normalizeAtlasStringArray(value: unknown, limit = 20): string[] | undefined {
    if (!Array.isArray(value)) {return undefined;}
    return [...new Set(value.map((item) => normalizeText(item, 80)).filter(Boolean))].slice(0, limit);
}

function defaultAtlasLinkId(from: string, to: string, kind: TavernAtlasLinkKind, bidirectional = true): string {
    if (bidirectional === false) {
        return `link:${from}:${to}:${kind}`;
    }
    return `link:${[from, to].sort().join(':')}:${kind}`;
}

function normalizeAtlasLocation(value: unknown): TavernAtlasLocation | null {
    if (!isPlainObject(value)) {return null;}
    const key = normalizeAtlasKey(value.key);
    const name = normalizeText(value.name, 120);
    const scaleText = String(value.scale || '').trim() as TavernAtlasLocationScale;
    const statusText = String(value.status || '').trim() as TavernAtlasLocationStatus;
    if (!key || !name || !ATLAS_LOCATION_SCALES.has(scaleText) || !ATLAS_LOCATION_STATUSES.has(statusText)) {return null;}
    const location: TavernAtlasLocation = {
        key,
        name,
        scale: scaleText,
        status: statusText,
    };
    const parent = normalizeAtlasKey(value.parent);
    if (parent) {location.parent = parent;}
    const mapDocId = normalizeText(value.mapDocId, 80);
    if (mapDocId && /^[\w.-]{1,80}$/i.test(mapDocId)) {location.mapDocId = mapDocId;}
    const aliases = normalizeAtlasStringArray(value.aliases);
    if (aliases?.length) {location.aliases = aliases;}
    const brief = normalizeText(value.brief, 240);
    if (brief) {location.brief = brief;}
    return location;
}

function normalizeAtlasLink(value: unknown): TavernAtlasLink | null {
    if (!isPlainObject(value)) {return null;}
    const from = normalizeAtlasKey(value.from);
    const to = normalizeAtlasKey(value.to);
    const kind = String(value.kind || '').trim() as TavernAtlasLinkKind;
    if (!from || !to || !ATLAS_LINK_KINDS.has(kind)) {return null;}
    const bidirectional = value.bidirectional !== false;
    const id = normalizeText(value.id, 160) || defaultAtlasLinkId(from, to, kind, bidirectional);
    const link: TavernAtlasLink = { id, from, to, kind, bidirectional };
    const label = normalizeText(value.label, 120);
    if (label) {link.label = label;}
    return link;
}

function normalizeAtlasActor(value: unknown): TavernAtlasActorPosition | null {
    if (!isPlainObject(value)) {return null;}
    const actorKey = normalizeActorKey(value.actorKey);
    const locationKey = normalizeAtlasKey(value.locationKey);
    return actorKey && locationKey ? { actorKey, locationKey } : null;
}

function defaultAtlasDocument(): TavernAtlasDocument {
    return normalizeAtlasDocument(createSeedAtlasDocument());
}

function normalizeAtlasDocument(value: unknown): TavernAtlasDocument {
    const raw = isPlainObject(value) ? value : {};
    const locations = Array.isArray(raw.locations)
        ? raw.locations.map(normalizeAtlasLocation).filter((item): item is TavernAtlasLocation => !!item)
        : [];
    const links = Array.isArray(raw.links)
        ? raw.links.map(normalizeAtlasLink).filter((item): item is TavernAtlasLink => !!item)
        : [];
    const actors = Array.isArray(raw.actors)
        ? raw.actors.map(normalizeAtlasActor).filter((item): item is TavernAtlasActorPosition => !!item)
        : [];
    const locationKeys = new Set<string>();
    const uniqueLocations: TavernAtlasLocation[] = [];
    locations.forEach((location) => {
        if (locationKeys.has(location.key)) {return;}
        locationKeys.add(location.key);
        uniqueLocations.push(location);
    });
    const linkIds = new Set<string>();
    const uniqueLinks: TavernAtlasLink[] = [];
    links.forEach((link) => {
        if (linkIds.has(link.id)) {return;}
        linkIds.add(link.id);
        uniqueLinks.push(link);
    });
    const actorMap = new Map<string, TavernAtlasActorPosition>();
    actors.forEach((actor) => actorMap.set(actor.actorKey, actor));
    const activeLocationKey = normalizeAtlasKey(raw.activeLocationKey);
    return {
        version: 1,
        ...(activeLocationKey ? { activeLocationKey } : {}),
        locations: uniqueLocations,
        links: uniqueLinks,
        actors: [...actorMap.values()],
    };
}

function normalizeAtlasDocumentFromRecord(document: TavernStructuredStateDocumentRecord | null): TavernAtlasDocument {
    if (!document?.data) {return defaultAtlasDocument();}
    return normalizeAtlasDocument(document.data);
}

function atlasTitle(document: TavernAtlasDocument): string {
    const active = document.locations.find((location) => location.key === document.activeLocationKey);
    return active ? `世界图：${active.name}` : '世界图';
}

function resolveMapIntentTarget(atlas: TavernAtlasDocument, args: Record<string, unknown> = {}): TavernMapIntentTarget {
    const sceneName = normalizeText(args.scene ?? args.sceneName ?? args.location ?? args.path, 120);
    if (!sceneName) {throw new Error('map_scene_required');}
    const requestedKey = normalizeAtlasKey(args.locationKey ?? args.key ?? sceneName);
    const existingLocation = atlas.locations.find((location) => (
        location.key === requestedKey
        || location.name === sceneName
        || (location.aliases || []).includes(sceneName)
    ));
    const locationKey = existingLocation?.key || normalizeAtlasKeyOrThrow(requestedKey || sceneName, 'atlas_location_key_invalid');
    const docId = existingLocation?.mapDocId && /^[\w.-]{1,80}$/i.test(existingLocation.mapDocId)
        ? existingLocation.mapDocId
        : mapDocIdFromSceneKey(locationKey);
    return {
        sceneName,
        locationKey,
        docId,
        title: existingLocation?.name || sceneName,
        ...(existingLocation ? { existingLocation } : {}),
    };
}

function createAtlasDigest(document: TavernAtlasDocument): string {
    const active = document.locations.find((location) => location.key === document.activeLocationKey);
    const visitedCount = document.locations.filter((location) => location.status === 'visited').length;
    return [
        active ? `当前地点：${active.name}` : '',
        `地点：${document.locations.length}`,
        `连接：${document.links.length}`,
        `人物：${document.actors.length}`,
        visitedCount ? `已探索：${visitedCount}` : '',
    ].filter(Boolean).join('\n');
}

function hasParentCycle(locations: Map<string, TavernAtlasLocation>, startKey: string): boolean {
    const visited = new Set<string>();
    let current: string | undefined = startKey;
    while (current) {
        if (visited.has(current)) {return true;}
        visited.add(current);
        current = locations.get(current)?.parent;
    }
    return false;
}

function mapElementSummary(element: TavernMapElement): TavernMapElement {
    return cloneJson(element);
}

async function dedupeActorElementsForSavedDocument(input: {
    sessionId: string;
    docType: TavernStructuredStateDocType;
    docId: string;
    document: TavernMapDocument;
    timestamp: number;
    managerRunId?: string;
    sourceUserOrder?: number;
    sourceAssistantOrder?: number;
}): Promise<{
    document: TavernMapDocument;
    removedElements: TavernMapElement[];
    otherDocumentRemovals: Array<{
        docId: string;
        revision: number;
        removedElements: TavernMapElement[];
        removeOps: Extract<TavernMapPatchOp, { op: 'remove' }>[];
    }>;
}> {
    const actorKeyToKeepId = new Map<string, string>();
    input.document.elements.forEach((element) => {
        if (element.cat !== 'actor') {return;}
        const key = normalizeActorKey(element.actorKey || element.id);
        if (key) {actorKeyToKeepId.set(key, element.id);}
    });
    if (!actorKeyToKeepId.size) {
        return { document: input.document, removedElements: [], otherDocumentRemovals: [] };
    }

    const dedupeElements = (document: TavernMapDocument, isSavedDocument: boolean): {
        document: TavernMapDocument;
        removedElements: TavernMapElement[];
        removeOps: Extract<TavernMapPatchOp, { op: 'remove' }>[];
    } => {
        let changed = false;
        const removedActorIds = new Set<string>();
        const removedElements: TavernMapElement[] = [];
        const withoutDuplicateActors = document.elements.filter((element) => {
            if (element.cat !== 'actor') {return true;}
            const key = normalizeActorKey(element.actorKey || element.id);
            if (!actorKeyToKeepId.has(key)) {return true;}
            const keep = isSavedDocument && actorKeyToKeepId.get(key) === element.id;
            if (!keep) {
                removedElements.push(cloneJson(element));
                removedActorIds.add(element.id);
                changed = true;
            }
            return keep;
        });
        const removedLabelIds = new Set([...removedActorIds].map((actorId) => buildSeedLabelId(actorId)));
        const elements = removedLabelIds.size
            ? withoutDuplicateActors.filter((element) => {
                if (!removedLabelIds.has(element.id)) {return true;}
                removedElements.push(cloneJson(element));
                changed = true;
                return false;
            })
            : withoutDuplicateActors;
        const removeOps = removedElements.map((element) => ({ op: 'remove' as const, id: element.id }));
        return { document: changed ? { ...document, elements } : document, removedElements, removeOps };
    };

    const currentDedupe = dedupeElements(input.document, true);
    const otherDocumentRemovals: Array<{
        docId: string;
        revision: number;
        removedElements: TavernMapElement[];
        removeOps: Extract<TavernMapPatchOp, { op: 'remove' }>[];
    }> = [];
    const rows = await tavernStateDocumentsTable.where('sessionId').equals(input.sessionId).toArray();
    for (const row of rows) {
        if (row.docType !== input.docType || row.docId === input.docId || row.status === 'stale') {continue;}
        const current = normalizeMapDocumentFromRecord(row);
        const next = dedupeElements(current, false);
        if (!next.removedElements.length) {continue;}
        const revision = Math.max(0, Number(row.revision) || 0) + 1;
        const digest = createMapDigest(next.document, revision);
        await tavernStateDocumentsTable.put({
            ...row,
            data: next.document,
            digest,
            revision,
            title: mapTitle(next.document),
            updatedAt: input.timestamp,
        });
        await appendTavernStructuredStatePatch({
            sessionId: input.sessionId,
            docType: input.docType,
            docId: row.docId,
            revision,
            status: 'active',
            managerRunId: input.managerRunId,
            sourceUserOrder: input.sourceUserOrder,
            sourceAssistantOrder: input.sourceAssistantOrder,
            source: 'system',
            summary: normalizeText(`Actor dedupe ${revision}`, 400),
            ops: next.removeOps,
            changedIds: next.removedElements.map((element) => element.id),
            removedElements: next.removedElements,
        });
        otherDocumentRemovals.push({
            docId: row.docId,
            revision,
            removedElements: next.removedElements,
            removeOps: next.removeOps,
        });
    }

    return {
        document: currentDedupe.document,
        removedElements: currentDedupe.removedElements,
        otherDocumentRemovals,
    };
}

function describeMapPatchError(error = ''): string {
    const [code, rawId = 'element'] = String(error || '').split(':');
    const id = rawId || 'element';
    switch (code) {
    case 'map_element_id_invalid':
        return 'Invalid element id. Use a short stable id containing only letters, numbers, underscores, dots, colons, and hyphens.';
    case 'map_scene_required':
        return 'Missing scene. MapSceneEdit requires an explicit scene name, like a file path.';
    case 'map_intent_element_must_be_object':
        return 'Each MapSceneEdit element must be a JSON object.';
    case 'map_intent_element_id_required':
        return `Element ${id} is missing id. Provide a stable id for each scene element.`;
    case 'map_intent_shape_required':
        return `${id} is missing usable shape/geo data. Provide shape plus geo, or enough geo for the runtime to infer rect/circle/path/curve/icon/label.`;
    case 'map_element_id_reserved':
        return `${id} uses the reserved \`__label__\` prefix. Use a normal id instead.`;
    case 'map_element_at_required':
        return `${id} is missing a position. Provide \`at:[x,y]\`. Legacy aliases such as pos/center/x+y are also accepted.`;
    case 'map_element_rect_invalid':
        return `${id} has an invalid rect. Use positive dimensions such as \`rect:[120,80]\`.`;
    case 'map_element_radius_required':
        return `${id} is missing a valid radius. \`circle\` must be a number greater than 0.`;
    case 'map_element_points_required':
        return `${id} is missing a valid point array. \`path\` and \`curve\` need at least two points. If this element is not a line/curve, omit empty path/curve fields and use rect/circle/icon/text instead. With \`at\`, points are relative offsets; without \`at\`, the first point becomes the anchor.`;
    case 'map_element_text_required':
        return `${id} is missing text content. \`text\` must be a short non-empty label.`;
    case 'map_element_icon_invalid':
        return `${id} has an invalid icon. Use a Material Symbols official name in lowercase underscores, or omit icon and provide a closed kind such as door/stairs/portal/trap/chest/marker.`;
    case 'map_element_shape_required':
        return `${id} is missing a shape field. Every element must provide exactly one geometry shape: rect/circle/path/curve/text or explicit shape:"icon".`;
    case 'map_element_shape_conflict':
        return `${id} has multiple shape fields. Only the special "geometry + text" input is allowed, and it will be split into a derived label automatically.`;
    case 'map_element_duplicate':
        return `${id} is duplicated. Use a stable unique id.`;
    case 'map_element_not_found':
        return `${id} does not exist. Use MapSceneRead elements first to find existing scene element ids.`;
    case 'map_element_already_exists':
        return `${id} already exists. Use \`modify\` to change it. If it is already identical, do not repeat the \`add\`.`;
    case 'map_element_id_cannot_change':
        return `${id} cannot change id inside a \`modify\` op.`;
    case 'map_meta_set_required':
        return '`meta` requires a `set` object.';
    case 'map_modify_set_required':
        return `${id} is missing a \`set\` object. \`modify\` requires \`set\`.`;
    case 'map_op_not_supported':
        return `Unsupported op: ${id}. Supported canonical ops are meta/add/modify/remove. Legacy init/reset/replace input is still absorbed at runtime.`;
    case 'map_element_center_required':
        return `${id} is missing a center point.`;
    case 'map_element_arc_angles_required':
        return `${id} is missing arc start/end angles.`;
    case 'atlas_doc_id_invalid':
        return 'Atlas has exactly one document: tavern.atlas/main.';
    case 'atlas_activate_not_supported':
        return 'Atlas does not support activate:true. Move the player with move-actor(actorKey:"player").';
    case 'atlas_location_key_invalid':
        return 'Invalid atlas location key. Use a stable non-empty key without path separators or control characters.';
    case 'atlas_location_create_required':
        return `${id} is new. Provide set.name, set.scale, and set.status.`;
    case 'atlas_location_not_found':
        return `${id} does not exist in the atlas. Create the location before linking or moving actors there.`;
    case 'atlas_parent_not_found':
        return `${id} does not exist. Create the parent location before assigning it.`;
    case 'atlas_parent_cycle':
        return `${id} would create a parent cycle.`;
    case 'atlas_link_location_not_found':
        return `${id} does not exist. Atlas links cannot point to missing locations.`;
    case 'atlas_link_kind_invalid':
        return 'Invalid atlas link kind. Use door/stairs/elevator/path/road/portal/passage.';
    case 'atlas_link_not_found':
        return `${id} does not exist. Use MapAtlasRead links first.`;
    case 'atlas_location_has_children':
    case 'atlas_location_has_links':
    case 'atlas_location_has_actors':
    case 'atlas_location_active':
        return `${id} still has dependencies. Remove child locations, links, actors, or active status first.`;
    case 'atlas_op_not_supported':
        return `Unsupported atlas op: ${id}. Use upsert-location/remove-location/upsert-link/remove-link/move-actor.`;
    default:
        return error;
    }
}

function summarizePatchFailures(failed: Array<{ index: number; error: string; hint?: string }>): string {
    const head = failed.slice(0, 3).map((item) => {
        const position = item.index >= 0 ? `op ${item.index + 1}` : 'transaction';
        return `${position}: ${item.hint || describeMapPatchError(item.error) || item.error}`;
    });
    const more = failed.length > head.length ? `; plus ${failed.length - head.length} more failures` : '';
    return head.length ? `${head.join('; ')}${more}` : '';
}

function enforceRenderableMapState(document: TavernMapDocument, warnings: string[] = []): {
    document: TavernMapDocument;
    statusChanged: boolean;
} {
    const hasSpatial = hasSpatialMapContent(document.elements);
    if (hasSpatial) {
        if (document.meta.status === 'uninitialized') {
            return {
                document: {
                    ...document,
                    meta: mergeMapMeta(document.meta, { status: 'active' }),
                },
                statusChanged: true,
            };
        }
        return { document, statusChanged: false };
    }
    if (document.meta.status === 'active') {
        warnings.push('Map stays uninitialized: it needs at least one spatial geometry element. Name, viewBox, or text labels alone are not enough.');
        return {
            document: {
                ...document,
                meta: mergeMapMeta(document.meta, { status: 'uninitialized' }),
            },
            statusChanged: true,
        };
    }
    return { document, statusChanged: false };
}

function summarizeMapElements(document: TavernMapDocument, args: Record<string, unknown> = {}): {
    elements: TavernMapElement[];
    count: number;
    truncated: boolean;
    nextOffset: number;
} {
    const query = normalizeText(args.query, 120).toLowerCase();
    const shape = String(args.elementType || args.type || '').trim();
    const category = String(args.category || args.cat || '').trim();
    const kind = String(args.kind || '').trim();
    const offset = Math.max(0, Number(args.offset) || 0);
    const limit = Math.max(1, Math.min(MAX_STATE_READ_LIMIT, Number(args.limit) || 30));
    const matches = document.elements.filter((element) => {
        const elementShape = shapeKeyForElement(element) || '';
        if (shape && elementShape !== shape) {return false;}
        if (category && element.cat !== category) {return false;}
        if (kind && element.kind !== kind) {return false;}
        if (!query) {return true;}
        const haystack = [
            element.id,
            element.cat,
            element.kind,
            elementShape,
            element.text,
            element.icon,
            element.material,
            element.certainty,
        ].map((item) => String(item || '').toLowerCase()).join('\n');
        return haystack.includes(query);
    });
    const page = matches.slice(offset, offset + limit).map(mapElementSummary);
    const nextOffset = offset + page.length < matches.length ? offset + page.length : 0;
    return {
        elements: page,
        count: matches.length,
        truncated: nextOffset > 0,
        nextOffset,
    };
}

function summarizeAtlasLocations(document: TavernAtlasDocument, args: Record<string, unknown> = {}): {
    locations: TavernAtlasLocation[];
    count: number;
    truncated: boolean;
    nextOffset: number;
} {
    const query = normalizeText(args.query, 120).toLowerCase();
    const parent = normalizeAtlasKey(args.parent);
    const status = String(args.status || '').trim();
    const offset = Math.max(0, Number(args.offset) || 0);
    const limit = Math.max(1, Math.min(MAX_STATE_READ_LIMIT, Number(args.limit) || 30));
    const matches = document.locations.filter((location) => {
        if (parent && location.parent !== parent) {return false;}
        if (status && location.status !== status) {return false;}
        if (!query) {return true;}
        return [
            location.key,
            location.name,
            location.scale,
            location.status,
            location.brief,
            ...(location.aliases || []),
        ].join('\n').toLowerCase().includes(query);
    });
    const page = matches.slice(offset, offset + limit).map((location) => cloneJson(location));
    const nextOffset = offset + page.length < matches.length ? offset + page.length : 0;
    return { locations: page, count: matches.length, truncated: nextOffset > 0, nextOffset };
}

function summarizeAtlasLinks(document: TavernAtlasDocument, args: Record<string, unknown> = {}): {
    links: TavernAtlasLink[];
    count: number;
    truncated: boolean;
    nextOffset: number;
} {
    const query = normalizeText(args.query, 120).toLowerCase();
    const from = normalizeAtlasKey(args.from);
    const to = normalizeAtlasKey(args.to);
    const kind = String(args.kind || '').trim();
    const offset = Math.max(0, Number(args.offset) || 0);
    const limit = Math.max(1, Math.min(MAX_STATE_READ_LIMIT, Number(args.limit) || 30));
    const matches = document.links.filter((link) => {
        if (from && link.from !== from) {return false;}
        if (to && link.to !== to) {return false;}
        if (kind && link.kind !== kind) {return false;}
        if (!query) {return true;}
        return [link.id, link.from, link.to, link.kind, link.label].join('\n').toLowerCase().includes(query);
    });
    const page = matches.slice(offset, offset + limit).map((link) => cloneJson(link));
    const nextOffset = offset + page.length < matches.length ? offset + page.length : 0;
    return { links: page, count: matches.length, truncated: nextOffset > 0, nextOffset };
}

function normalizeAtlasLocationSet(value: unknown = {}): Partial<Omit<TavernAtlasLocation, 'key'>> {
    if (!isPlainObject(value)) {throw new Error('atlas_location_set_required');}
    const set: Partial<Omit<TavernAtlasLocation, 'key'>> = {};
    if ('name' in value) {
        const name = normalizeText(value.name, 120);
        if (!name) {throw new Error('atlas_location_name_required');}
        set.name = name;
    }
    if ('scale' in value) {set.scale = normalizeAtlasScale(value.scale);}
    if ('status' in value) {set.status = normalizeAtlasStatus(value.status);}
    if ('parent' in value) {
        const parent = normalizeAtlasKey(value.parent);
        if (parent) {set.parent = parent;}
        else {set.parent = undefined;}
    }
    if ('mapDocId' in value) {
        const mapDocId = normalizeText(value.mapDocId, 80);
        if (mapDocId) {set.mapDocId = normalizeMapDocIdOrThrow(mapDocId, 'atlas_location_map_doc_id_invalid');}
        else {set.mapDocId = undefined;}
    }
    if ('aliases' in value) {set.aliases = normalizeAtlasStringArray(value.aliases) || [];}
    if ('brief' in value) {
        const brief = normalizeText(value.brief, 240);
        if (brief) {set.brief = brief;}
        else {set.brief = undefined;}
    }
    return set;
}

function applyAtlasOps(source: TavernAtlasDocument, rawOps: unknown[]): {
    document: TavernAtlasDocument;
    effectiveOps: TavernAtlasPatchOp[];
    appliedCount: number;
    satisfiedCount: number;
    failed: Array<{ index: number; error: string; hint?: string }>;
    warnings: string[];
    changedIds: string[];
    changed: boolean;
    syncedActiveMapDocId?: string;
} {
    if (!Array.isArray(rawOps)) {throw new Error('state_patch_ops_must_be_array');}
    if (!rawOps.length) {throw new Error('state_patch_ops_required');}
    if (rawOps.length > MAX_STATE_PATCH_OPS) {throw new Error('state_patch_ops_limit_exceeded');}

    let document = normalizeAtlasDocument(source);
    const effectiveOps: TavernAtlasPatchOp[] = [];
    const failed: Array<{ index: number; error: string; hint?: string }> = [];
    const warnings: string[] = [];
    const changedIds = new Set<string>();
    let appliedCount = 0;
    let satisfiedCount = 0;
    let changed = false;
    let syncedActiveMapDocId: string | undefined;

    const locationMap = () => new Map(document.locations.map((location) => [location.key, location]));
    const linkIndex = (id: string) => document.links.findIndex((link) => link.id === id);
    const actorIndex = (actorKey: string) => document.actors.findIndex((actor) => actor.actorKey === actorKey);
    const assertParentGraph = () => {
        const locations = locationMap();
        document.locations.forEach((location) => {
            if (location.parent) {
                if (location.parent === location.key) {throw new Error(`atlas_parent_cycle:${location.key}`);}
                if (!locations.has(location.parent)) {throw new Error(`atlas_parent_not_found:${location.parent}`);}
            }
        });
        document.locations.forEach((location) => {
            if (hasParentCycle(locations, location.key)) {throw new Error(`atlas_parent_cycle:${location.key}`);}
        });
    };
    const assertLinkEndpoints = (from: string, to: string) => {
        const locations = locationMap();
        if (!locations.has(from)) {throw new Error(`atlas_link_location_not_found:${from}`);}
        if (!locations.has(to)) {throw new Error(`atlas_link_location_not_found:${to}`);}
    };
    const markApplied = (op: TavernAtlasPatchOp, id: string) => {
        effectiveOps.push(cloneJson(op));
        changedIds.add(id);
        changed = true;
        appliedCount += 1;
    };

    rawOps.forEach((raw, index) => {
        try {
            if (!isPlainObject(raw)) {throw new Error('atlas_op_invalid');}
            const op = String(raw.op || '').trim();
            if (op === 'upsert-location') {
                const key = normalizeAtlasKeyOrThrow(raw.key, 'atlas_location_key_invalid');
                const set = normalizeAtlasLocationSet(raw.set || {});
                const rawUnset = Array.isArray(raw.unset) ? raw.unset.map((field) => String(field || '').trim()) : [];
                const invalidUnset = rawUnset.find((field) => !ATLAS_UNSET_FIELDS.has(field));
                if (invalidUnset) {throw new Error(`atlas_unset_field_invalid:${invalidUnset || 'empty'}`);}
                const unset = rawUnset.filter(Boolean);
                const existingIndex = document.locations.findIndex((location) => location.key === key);
                if (existingIndex < 0) {
                    if (!set.name || !set.scale || !set.status) {throw new Error(`atlas_location_create_required:${key}`);}
                    const location: TavernAtlasLocation = {
                        key,
                        name: set.name,
                        scale: set.scale,
                        status: set.status,
                    };
                    if (set.parent) {location.parent = set.parent;}
                    if (set.mapDocId) {location.mapDocId = set.mapDocId;}
                    if (set.aliases?.length) {location.aliases = set.aliases;}
                    if (set.brief) {location.brief = set.brief;}
                    document.locations.push(location);
                    assertParentGraph();
                    markApplied({ op: 'upsert-location', key, set: cloneJson(set), ...(unset.length ? { unset: unset as Array<'parent' | 'mapDocId' | 'aliases' | 'brief'> } : {}) }, `location:${key}`);
                    return;
                }
                const current = document.locations[existingIndex];
                const next: TavernAtlasLocation = { ...current, ...set };
                const effectiveSet: Partial<Omit<TavernAtlasLocation, 'key'>> = { ...set };
                if (current.status === 'visited' && set.status === 'mentioned') {
                    next.status = 'visited';
                    effectiveSet.status = 'visited';
                    warnings.push(`${key} is already visited; status was not downgraded to mentioned.`);
                }
                unset.forEach((field) => {
                    delete (next as unknown as Record<string, unknown>)[field];
                });
                if (!next.name || !next.scale || !next.status) {throw new Error(`atlas_location_required_field:${key}`);}
                document.locations[existingIndex] = next;
                assertParentGraph();
                if (deepEqual(current, next)) {
                    satisfiedCount += 1;
                    return;
                }
                markApplied({ op: 'upsert-location', key, set: cloneJson(effectiveSet), ...(unset.length ? { unset: unset as Array<'parent' | 'mapDocId' | 'aliases' | 'brief'> } : {}) }, `location:${key}`);
                return;
            }
            if (op === 'remove-location') {
                const key = normalizeAtlasKeyOrThrow(raw.key, 'atlas_location_key_invalid');
                const existingIndex = document.locations.findIndex((location) => location.key === key);
                if (existingIndex < 0) {throw new Error(`atlas_location_not_found:${key}`);}
                if (document.activeLocationKey === key) {throw new Error(`atlas_location_active:${key}`);}
                if (document.locations.some((location) => location.parent === key)) {throw new Error(`atlas_location_has_children:${key}`);}
                if (document.links.some((link) => link.from === key || link.to === key)) {throw new Error(`atlas_location_has_links:${key}`);}
                if (document.actors.some((actor) => actor.locationKey === key)) {throw new Error(`atlas_location_has_actors:${key}`);}
                document.locations.splice(existingIndex, 1);
                markApplied({ op: 'remove-location', key }, `location:${key}`);
                return;
            }
            if (op === 'upsert-link') {
                const from = normalizeAtlasKeyOrThrow(raw.from, 'atlas_link_from_required');
                const to = normalizeAtlasKeyOrThrow(raw.to, 'atlas_link_to_required');
                const kind = normalizeAtlasLinkKind(raw.kind);
                const bidirectional = raw.bidirectional !== false;
                const id = normalizeText(raw.id, 160) || defaultAtlasLinkId(from, to, kind, bidirectional);
                assertLinkEndpoints(from, to);
                const next: TavernAtlasLink = { id, from, to, kind, bidirectional };
                const label = normalizeText(raw.label, 120);
                if (label) {next.label = label;}
                const existingIndex = linkIndex(id);
                if (existingIndex >= 0) {
                    if (deepEqual(document.links[existingIndex], next)) {
                        satisfiedCount += 1;
                        return;
                    }
                    document.links[existingIndex] = next;
                } else {
                    document.links.push(next);
                }
                markApplied({ op: 'upsert-link', id, from, to, kind, ...(label ? { label } : {}), bidirectional }, `link:${id}`);
                return;
            }
            if (op === 'remove-link') {
                let id = normalizeText(raw.id, 160);
                if (!id) {
                    const from = normalizeAtlasKey(raw.from);
                    const to = normalizeAtlasKey(raw.to);
                    const kind = String(raw.kind || '').trim() as TavernAtlasLinkKind;
                    if (!from || !to || !ATLAS_LINK_KINDS.has(kind)) {throw new Error('atlas_link_remove_locator_required');}
                    id = defaultAtlasLinkId(from, to, kind, raw.bidirectional !== false);
                }
                const existingIndex = linkIndex(id);
                if (existingIndex < 0) {throw new Error(`atlas_link_not_found:${id}`);}
                document.links.splice(existingIndex, 1);
                markApplied({ op: 'remove-link', id }, `link:${id}`);
                return;
            }
            if (op === 'move-actor') {
                const actorKey = normalizeActorKey(raw.actorKey);
                const locationKey = normalizeAtlasKeyOrThrow(raw.locationKey, 'atlas_actor_location_required');
                if (!actorKey) {throw new Error('atlas_actor_key_required');}
                const location = locationMap().get(locationKey);
                if (!location) {throw new Error(`atlas_location_not_found:${locationKey}`);}
                const nextActor: TavernAtlasActorPosition = { actorKey, locationKey };
                const existingIndex = actorIndex(actorKey);
                const current = existingIndex >= 0 ? document.actors[existingIndex] : null;
                if (current && deepEqual(current, nextActor) && !(actorKey === 'player' && document.activeLocationKey !== locationKey)) {
                    satisfiedCount += 1;
                    return;
                }
                if (existingIndex >= 0) {document.actors[existingIndex] = nextActor;}
                else {document.actors.push(nextActor);}
                if (actorKey === 'player') {
                    document.activeLocationKey = locationKey;
                    const locationIndex = document.locations.findIndex((item) => item.key === locationKey);
                    if (locationIndex >= 0 && document.locations[locationIndex].status !== 'visited') {
                        document.locations[locationIndex] = { ...document.locations[locationIndex], status: 'visited' };
                    }
                    syncedActiveMapDocId = document.locations[locationIndex]?.mapDocId;
                }
                markApplied({ op: 'move-actor', actorKey, locationKey }, `actor:${actorKey}`);
                return;
            }
            throw new Error(`atlas_op_not_supported:${op || 'unknown'}`);
        } catch (error) {
            failed.push({
                index,
                error: error instanceof Error ? error.message : String(error || 'atlas_op_failed'),
            });
        }
    });

    return {
        document,
        effectiveOps,
        appliedCount,
        satisfiedCount,
        failed,
        warnings,
        changedIds: [...changedIds],
        changed,
        syncedActiveMapDocId,
    };
}

function normalizePartialSet(value: unknown, id: string, warnings: string[] = []): Partial<TavernMapElement> {
    if (!isPlainObject(value)) {throw new Error(`map_modify_set_required:${id}`);}
    const set: Partial<TavernMapElement> = {};
    const legacyType = String(value.type || '').trim();
    const explicitIconShape = legacyType === 'icon' || String(value.shape || '').trim() === 'icon';
    if (explicitIconShape) {
        set.shape = 'icon';
    }
    if ('id' in value && normalizeText(value.id, 120) && normalizeText(value.id, 120) !== id) {
        throw new Error(`map_element_id_cannot_change:${id}`);
    }
    if ('at' in value || 'pos' in value || 'center' in value || 'position' in value || 'x' in value || 'y' in value || 'cx' in value || 'cy' in value) {
        const point = normalizePoint(value.at ?? value.pos ?? value.center ?? value.position)
            || normalizePoint({ x: value.x, y: value.y })
            || normalizePoint({ x: value.cx, y: value.cy });
        if (!point) {throw new Error(`map_element_at_required:${id}`);}
        set.at = point;
    }
    if ('cat' in value) {
        set.cat = normalizeCategory(value.cat, 'wall');
    }
    if ('kind' in value) {
        if (value.kind === null) {
            set.kind = undefined;
        } else {
            const kind = normalizeMapKind(value.kind, { elementId: id, warnings });
            if (kind) {set.kind = kind;}
        }
    }
    if ('material' in value) {
        if (value.material === null) {
            set.material = undefined;
        } else {
            const material = normalizeMapMaterial(value.material, { elementId: id, warnings, source: 'model-input' });
            if (material) {set.material = material;}
        }
    }
    if ('certainty' in value) {
        if (value.certainty === null) {
            set.certainty = undefined;
        } else {
            const certainty = normalizeMapCertainty(value.certainty, undefined, { elementId: id, warnings });
            if (certainty) {set.certainty = certainty === 'confirmed' ? undefined : certainty;}
        }
    }
    if ('rect' in value || 'size' in value || 'width' in value || 'height' in value) {
        const rect = numberPair(value.rect ?? value.size ?? [value.width, value.height]);
        if (!rect || rect[0] <= 0 || rect[1] <= 0) {throw new Error(`map_element_rect_invalid:${id}`);}
        set.rect = rect;
    }
    if ('circle' in value || 'r' in value || 'radius' in value) {
        const circle = positiveNumber(value.circle ?? value.r ?? value.radius);
        if (circle === null) {throw new Error(`map_element_radius_required:${id}`);}
        set.circle = circle;
    }
    if ('path' in value || 'points' in value || 'line' in value) {
        const emptyKeys = suppliedEmptyShapeKeys(value, ['path', 'points', 'line']);
        const pathSource = firstNonEmptyPathLikeSource(value);
        if (pathSource) {
            const baseAt = set.at || null;
            const normalized = normalizePathLikePoints(pathSource, id, baseAt);
            if (!set.at) {set.at = normalized.at;}
            set.path = normalized.points;
            warnIgnoredEmptyShapeFields(id, emptyKeys, warnings);
        } else {
            warnIgnoredEmptyShapeFields(id, emptyKeys, warnings);
        }
    }
    if ('curve' in value) {
        if (isEmptyShapeArray(value.curve)) {
            warnIgnoredEmptyShapeFields(id, ['curve'], warnings);
        } else {
            const baseAt = set.at || null;
            const normalized = normalizePathLikePoints(value.curve, id, baseAt);
            if (!set.at) {set.at = normalized.at;}
            set.curve = normalized.points;
        }
    }
    if ('icon' in value) {
        if (value.icon === null || value.icon === undefined || value.icon === '') {
            set.icon = undefined;
        } else {
            const icon = normalizeIcon(value.icon, { elementId: id, warnings });
            if (icon) {set.icon = icon;}
        }
    }
    if ('text' in value || 'content' in value || 'label' in value || 'value' in value) {
        const rawText = value.text ?? value.content ?? value.label ?? value.value;
        const text = normalizeText(rawText, 240);
        set.text = text || undefined;
    }
    if ('actorKey' in value) {
        set.actorKey = value.actorKey === null ? undefined : normalizeText(value.actorKey, 120) || undefined;
    }
    if ('closed' in value) {
        set.closed = value.closed === true;
    }
    if ('fill' in value) {
        set.fill = value.fill === null ? undefined : normalizeText(value.fill, 120) || undefined;
    }
    if (set.material && set.fill) {
        warnings.push(`Dropped legacy fill for ${id} because material:"${set.material}" was supplied.`);
        delete set.fill;
    }
    if ('style' in value) {
        set.style = value.style === null ? undefined : normalizeStyle(value.style);
    }
    if (legacyType === 'fill' && !set.path) {
        const pathSource = firstNonEmptyPathLikeSource(value);
        if (pathSource) {
            const normalized = normalizePathLikePoints(pathSource, id, set.at || null);
            set.at = normalized.at;
            set.path = normalized.points;
            set.closed = true;
        } else if (suppliedEmptyShapeKeys(value, ['path', 'points', 'line']).length) {
            warnIgnoredEmptyShapeFields(id, suppliedEmptyShapeKeys(value, ['path', 'points', 'line']), warnings);
        }
    }
    if (legacyType === 'arc' && !set.curve) {
        const normalized = normalizePathLikePoints(arcToCurvePoints(value, id), id, set.at || null);
        set.at = normalized.at;
        set.curve = normalized.points;
    }
    return set;
}

function buildNextElement(current: TavernMapElement, set: Partial<TavernMapElement>, warnings: string[] = []): TavernMapElement {
    const next = mergeMapElementPatch(current, set);
    if (Object.prototype.hasOwnProperty.call(set, 'material') && set.material && next.fill) {
        warnings.push(`Dropped legacy fill for ${current.id} because material:"${set.material}" was supplied.`);
        delete next.fill;
    }
    return finalizeElement(next, current.id, { allowReservedId: isSeedLabelId(current.id), warnings, source: 'model-input' });
}

function buildCanonicalElementReplaySet(current: TavernMapElement, next: TavernMapElement): TavernMapElementPatchSet {
    const set: TavernMapElementPatchSet = {};
    const keys = new Set<keyof TavernMapElement>([
        ...Object.keys(current) as Array<keyof TavernMapElement>,
        ...Object.keys(next) as Array<keyof TavernMapElement>,
    ]);
    keys.delete('id');
    keys.forEach((key) => {
        const currentHasKey = Object.prototype.hasOwnProperty.call(current, key);
        const nextHasKey = Object.prototype.hasOwnProperty.call(next, key);
        if (nextHasKey && !deepEqual(current[key], next[key])) {
            set[key] = cloneJson(next[key]) as never;
            return;
        }
        if (currentHasKey && !nextHasKey) {
            set[key] = null as never;
        }
    });
    return set;
}

function hasGeometryShape(element: Partial<TavernMapElement>): boolean {
    return MAP_GEOMETRY_KEYS.some((key) => {
        if (key === 'circle') {return typeof element.circle === 'number';}
        if (key === 'icon') {
            return element.shape === 'icon'
                || (
                    typeof element.icon === 'string'
                    && !!element.icon.trim()
                    && !element.rect
                    && typeof element.circle !== 'number'
                    && !element.path
                    && !element.curve
                    && !element.text
                );
        }
        return Array.isArray(element[key]);
    });
}

function withoutTextShape(set: Partial<TavernMapElement>): Partial<TavernMapElement> {
    const next = { ...set };
    delete next.text;
    return next;
}

function hasPatchFields(set: Partial<TavernMapElement>): boolean {
    return Object.keys(set).length > 0;
}

function normalizeMapIntentShape(value: unknown): MapIntentShapeKey | '' {
    const text = String(value || '').trim() as MapIntentShapeKey;
    return MAP_INTENT_SHAPES.has(text) ? text : '';
}

function hasUsablePointList(value: unknown): boolean {
    return Array.isArray(value)
        && value.length >= 2
        && value.every((item) => !!normalizePoint(item));
}

function firstUsablePointList(...values: unknown[]): unknown {
    return values.find((value) => hasUsablePointList(value)) ?? null;
}

function firstPositiveNumber(...values: unknown[]): number | null {
    for (const value of values) {
        const number = positiveNumber(value);
        if (number !== null) {return number;}
    }
    return null;
}

type MapIntentRectCandidate = {
    center?: [number, number];
    rect: [number, number];
};

function normalizeMapIntentRectCandidate(value: unknown): MapIntentRectCandidate | null {
    if (Array.isArray(value)) {
        const numbers = value.map((item) => Number(item));
        if (numbers.length >= 4 && numbers.slice(0, 4).every((item) => Number.isFinite(item)) && numbers[2] > 0 && numbers[3] > 0) {
            return { center: [numbers[0], numbers[1]], rect: [numbers[2], numbers[3]] };
        }
        const rect = positiveNumberPair(value);
        return rect ? { rect } : null;
    }
    if (isPlainObject(value)) {
        const rect = positiveNumberPair(value.size ?? value.rect ?? [value.width ?? value.w, value.height ?? value.h]);
        if (!rect) {return null;}
        const center = normalizePoint(value.center ?? value.at ?? value.pos ?? {
            x: value.x ?? value.left,
            y: value.y ?? value.top,
        });
        return center ? { center, rect } : { rect };
    }
    return null;
}

function topLeftFromRectCenter(center: [number, number], rect: [number, number]): [number, number] {
    return [
        Number((center[0] - rect[0] / 2).toFixed(2)),
        Number((center[1] - rect[1] / 2).toFixed(2)),
    ];
}

function firstMapIntentRect(source: Record<string, unknown>, geo: Record<string, unknown>): MapIntentRectCandidate | null {
    const candidates = [
        geo.size,
        source.size,
        geo.rect,
        source.rect,
        [geo.width ?? geo.w, geo.height ?? geo.h],
        [source.width ?? source.w, source.height ?? source.h],
    ];
    for (const candidate of candidates) {
        const rect = normalizeMapIntentRectCandidate(candidate);
        if (rect) {return rect;}
    }
    return null;
}

function firstMapIntentPath(source: Record<string, unknown>, geo: Record<string, unknown>): unknown {
    return firstUsablePointList(geo.points, source.points, geo.path, source.path, geo.line, source.line);
}

function firstMapIntentCurve(source: Record<string, unknown>, geo: Record<string, unknown>): unknown {
    return firstUsablePointList(geo.curve, source.curve);
}

function mapIntentShapeHasUsableData(shape: MapIntentShapeKey, source: Record<string, unknown>, geo: Record<string, unknown>): boolean {
    if (shape === 'rect') {return !!firstMapIntentRect(source, geo);}
    if (shape === 'circle') {return firstPositiveNumber(geo.radius, source.radius, geo.r, source.r, geo.circle, source.circle) !== null;}
    if (shape === 'curve') {return !!firstMapIntentCurve(source, geo);}
    if (shape === 'path') {return !!firstMapIntentPath(source, geo);}
    if (shape === 'icon') {
        const at = normalizePoint(geo.at ?? source.at ?? geo.pos ?? source.pos ?? geo.center ?? source.center ?? {
            x: geo.x ?? source.x ?? geo.cx ?? source.cx,
            y: geo.y ?? source.y ?? geo.cy ?? source.cy,
        });
        return !!normalizeIcon(geo.icon ?? source.icon)
            || !!normalizeMapElementKind(source.kind)
            || (!!at && MAP_ELEMENT_CATEGORIES.has(String(source.cat || '').trim() as TavernMapElementCategory));
    }
    return !!normalizeText(source.label ?? source.text ?? source.content ?? source.value, 240);
}

function mapIntentShapeOrderForCategory(category: TavernMapElementCategory): MapIntentShapeKey[] {
    if (category === 'door') {return ['icon', 'path', 'rect', 'circle', 'label'];}
    if (category === 'actor') {return ['icon', 'circle', 'label'];}
    if (category === 'light') {return ['circle', 'rect', 'icon', 'label'];}
    if (category === 'road') {return ['path', 'curve', 'rect', 'label'];}
    if (category === 'wall') {return ['rect', 'path', 'curve', 'label'];}
    if (category === 'terrain' || category === 'water' || category === 'magic' || category === 'danger') {return ['rect', 'circle', 'path', 'curve', 'icon', 'label'];}
    if (category === 'furniture' || category === 'decoration') {return ['rect', 'circle', 'icon', 'label'];}
    return ['rect', 'circle', 'path', 'curve', 'icon', 'label'];
}

function inferMapIntentShape(source: Record<string, unknown>, geo: Record<string, unknown>): MapIntentShapeKey | '' {
    const category = normalizeCategory(source.cat, 'marker');
    for (const shape of mapIntentShapeOrderForCategory(category)) {
        if (mapIntentShapeHasUsableData(shape, source, geo)) {return shape;}
    }
    return '';
}

function buildMapIntentElementInput(rawElement: unknown, index: number, warnings: string[] = []): {
    id: string;
    element: Record<string, unknown>;
    shape: MapIntentShapeKey;
} {
    if (!isPlainObject(rawElement)) {throw new Error('map_intent_element_must_be_object');}
    const geo = isPlainObject(rawElement.geo) ? rawElement.geo : {};
    const id = normalizeText(rawElement.id, 120);
    if (!id) {throw new Error(`map_intent_element_id_required:${index + 1}`);}
    const explicitShape = normalizeMapIntentShape(rawElement.shape);
    let shape = explicitShape;
    const inferredShape = inferMapIntentShape(rawElement, geo);
    if (explicitShape && !mapIntentShapeHasUsableData(explicitShape, rawElement, geo) && inferredShape && inferredShape !== 'label') {
        shape = inferredShape;
        warnings.push(`Shape "${explicitShape}" for ${id} had unusable geo; used "${shape}" from valid geo instead.`);
    } else if (!explicitShape && inferredShape) {
        shape = inferredShape;
        warnings.push(`Inferred shape "${shape}" for ${id}.`);
    }
    if (!shape) {throw new Error(`map_intent_shape_required:${id}`);}

    let at = normalizePoint(geo.at ?? rawElement.at ?? geo.pos ?? rawElement.pos ?? geo.center ?? rawElement.center ?? {
        x: geo.x ?? rawElement.x ?? geo.cx ?? rawElement.cx,
        y: geo.y ?? rawElement.y ?? geo.cy ?? rawElement.cy,
    });
    const labelWasProvided = ['label', 'text', 'content', 'value'].some((key) => Object.prototype.hasOwnProperty.call(rawElement, key));
    const label = normalizeText(rawElement.label ?? rawElement.text ?? rawElement.content ?? rawElement.value, 240);
    const fallbackCat = shape === 'label' ? 'label' : defaultCategoryForShape(shape);
    const cat = normalizeCategory(rawElement.cat, fallbackCat);
    const kind = normalizeMapKind(rawElement.kind, { elementId: id, warnings });
    const element: Record<string, unknown> = {
        id,
        cat,
    };
    if (kind) {element.kind = kind;}
    if (at) {element.at = at;}
    const material = normalizeMapMaterial(rawElement.material, { elementId: id, warnings, source: 'model-input' });
    if (material) {element.material = material;}
    const certainty = normalizeMapCertainty(rawElement.certainty, undefined, { elementId: id, warnings });
    if (certainty && certainty !== 'confirmed') {element.certainty = certainty;}
    const actorKey = normalizeText(rawElement.actorKey, 120);
    if (actorKey) {element.actorKey = actorKey;}
    if (rawElement.closed === true || geo.closed === true) {element.closed = true;}

    if (shape === 'rect') {
        const rect = firstMapIntentRect(rawElement, geo);
        if (!rect) {throw new Error(`map_element_rect_invalid:${id}`);}
        const center = normalizePoint(geo.center ?? rawElement.center ?? geo.at ?? rawElement.at ?? geo.pos ?? rawElement.pos) ?? rect.center ?? at;
        if (!center) {throw new Error(`map_element_at_required:${id}`);}
        at = topLeftFromRectCenter(center, rect.rect);
        element.at = at;
        const hasRectCenter = Object.prototype.hasOwnProperty.call(geo, 'center') || Object.prototype.hasOwnProperty.call(rawElement, 'center');
        if (!hasRectCenter && (Object.prototype.hasOwnProperty.call(geo, 'at') || Object.prototype.hasOwnProperty.call(rawElement, 'at'))) {
            warnings.push(`Interpreted rect position for ${id} as center; use geo.center with geo.size for rectangles.`);
        }
        element.rect = rect.rect;
    } else if (shape === 'circle') {
        const circle = firstPositiveNumber(geo.radius, rawElement.radius, geo.r, rawElement.r, geo.circle, rawElement.circle);
        if (circle === null) {throw new Error(`map_element_radius_required:${id}`);}
        element.circle = circle;
    } else if (shape === 'path') {
        const points = firstMapIntentPath(rawElement, geo);
        if (!hasUsablePointList(points)) {throw new Error(`map_element_points_required:${id}`);}
        element.path = points;
    } else if (shape === 'curve') {
        const points = firstMapIntentCurve(rawElement, geo);
        if (!hasUsablePointList(points)) {throw new Error(`map_element_points_required:${id}`);}
        element.curve = points;
    } else if (shape === 'icon') {
        element.shape = 'icon';
        const icon = normalizeIcon(geo.icon ?? rawElement.icon, { elementId: id, warnings });
        if (icon) {element.icon = icon;}
    } else if (shape === 'label') {
        if (!label) {throw new Error(`map_element_text_required:${id}`);}
        element.text = label;
    }
    if (shape !== 'label' && label) {element.text = label;}
    else if (shape !== 'label' && labelWasProvided) {element.text = null;}
    return { id, element, shape };
}

function compileMapIntentToPatch(currentDocument: TavernMapDocument, args: Record<string, unknown> = {}): TavernMapIntentCompileResult {
    const rawElements = Array.isArray(args.elements) ? args.elements : [];
    const warnings: string[] = [];
    let working = cloneJson(currentDocument);
    const effectiveOps: TavernMapPatchOp[] = [];
    const applied: Array<Record<string, unknown>> = [];
    const skipped: Array<Record<string, unknown>> = [];
    const changedIds = new Set<string>();
    const removedElements: TavernMapElement[] = [];
    let appliedCount = 0;
    let satisfiedCount = 0;
    let changed = false;

    const metaSet: Partial<TavernMapDocumentMeta> = {};
    const sceneTitle = normalizeText(args.title ?? args.name ?? args.scene, 120);
    if (sceneTitle) {metaSet.name = sceneTitle;}
    if ('viewBox' in args) {metaSet.viewBox = normalizeViewBox(args.viewBox);}
    if ('theme' in args) {metaSet.theme = normalizeMapTheme(args.theme);}
    if ('mood' in args) {
        const moodText = String(args.mood || '').trim();
        if (isTavernMapMood(moodText)) {metaSet.mood = moodText;}
        else if (moodText) {warnings.push(`Ignored invalid map mood: ${moodText}.`);}
    }
    if (Object.keys(metaSet).length) {
        const metaPatch = applyMapOps(working, [{ op: 'meta', set: metaSet }]);
        if (!metaPatch.failed.length) {
            working = metaPatch.document;
            effectiveOps.push(...metaPatch.effectiveOps);
            appliedCount += metaPatch.appliedCount;
            satisfiedCount += metaPatch.satisfiedCount;
            metaPatch.changedIds.forEach((item) => changedIds.add(item));
            warnings.push(...metaPatch.warnings);
            changed = changed || metaPatch.changed;
        }
    }

    rawElements.forEach((rawElement, index) => {
        try {
            const compiled = buildMapIntentElementInput(rawElement, index, warnings);
            const exists = working.elements.some((element) => element.id === compiled.id);
            const op = exists
                ? { op: 'modify' as const, id: compiled.id, set: compiled.element }
                : { op: 'add' as const, element: compiled.element };
            const patch = applyMapOps(working, [op]);
            if (patch.failed.length) {
                const failure = patch.failed[0];
                skipped.push({
                    index,
                    id: compiled.id,
                    reason: failure.error,
                    hint: failure.hint || describeMapPatchError(failure.error),
                    guessedShape: compiled.shape,
                });
                warnings.push(...patch.warnings);
                return;
            }
            working = patch.document;
            effectiveOps.push(...patch.effectiveOps);
            appliedCount += patch.appliedCount;
            satisfiedCount += patch.satisfiedCount;
            removedElements.push(...patch.removedElements);
            patch.changedIds.forEach((item) => changedIds.add(item));
            warnings.push(...patch.warnings);
            changed = changed || patch.changed;
            applied.push({
                index,
                id: compiled.id,
                op: exists ? 'modify' : 'add',
                shape: compiled.shape,
                changed: patch.changed,
            });
        } catch (error) {
            const reason = error instanceof Error ? error.message : String(error || 'map_intent_element_failed');
            skipped.push({
                index,
                id: isPlainObject(rawElement) ? normalizeText(rawElement.id, 120) : '',
                reason,
                hint: describeMapPatchError(reason),
            });
        }
    });

    return {
        document: working,
        effectiveOps,
        appliedCount,
        satisfiedCount,
        applied,
        skipped,
        warnings: [...new Set(warnings)],
        changedIds: [...changedIds],
        removedElements,
        changed,
    };
}

function buildDerivedLabelElement(
    geometry: TavernMapElement,
    text: string,
    existing?: TavernMapElement,
    at?: [number, number],
): TavernMapElement {
    const labelId = buildSeedLabelId(geometry.id);
    return finalizeElement({
        id: labelId,
        at: at || existing?.at || labelPositionForElement(geometry),
        cat: 'label',
        text,
        style: existing?.style,
    }, labelId, { allowReservedId: true });
}

function buildDerivedLabelModifySet(existing: TavernMapElement, text: string, at?: [number, number]): Partial<TavernMapElement> {
    return {
        cat: 'label',
        text,
        ...(at ? { at } : {}),
        ...(existing.style ? { style: cloneJson(existing.style) } : {}),
    };
}

function isCanonicalLabelElement(element: TavernMapElement): boolean {
    return element.cat === 'label'
        && typeof element.text === 'string'
        && !!element.text.trim()
        && !hasGeometryShape(element)
        && !element.actorKey
        && element.closed !== true
        && !element.fill;
}

function buildCanonicalLabelElement(
    id: string,
    current: TavernMapElement,
    set: Partial<TavernMapElement> = {},
): TavernMapElement {
    const hasText = Object.prototype.hasOwnProperty.call(set, 'text');
    const hasAt = Object.prototype.hasOwnProperty.call(set, 'at');
    const hasStyle = Object.prototype.hasOwnProperty.call(set, 'style');
    return finalizeElement({
        id,
        at: hasAt ? set.at : current.at,
        cat: 'label',
        text: hasText ? set.text : current.text,
        style: hasStyle ? set.style : current.style,
    }, id, { allowReservedId: true });
}

async function getSeededMapDocumentRecord(
    sessionId = '',
    docType: TavernStructuredStateDocType = MAP_DOC_TYPE,
    docId = DEFAULT_DOC_ID,
): Promise<TavernStructuredStateDocumentRecord | null> {
    if (docType !== MAP_DOC_TYPE || docId !== DEFAULT_DOC_ID) {
        return await getTavernStructuredStateDocument(sessionId, docType, docId);
    }
    const existing = await getTavernStructuredStateDocument(sessionId, docType, docId);
    if (existing) {return existing;}
    return await ensureSeedStructuredStateDocument(sessionId, { touchSession: false });
}

async function getSeededAtlasDocumentRecord(
    sessionId = '',
): Promise<TavernStructuredStateDocumentRecord | null> {
    const existing = await getTavernStructuredStateDocument(sessionId, ATLAS_DOC_TYPE, DEFAULT_ATLAS_DOC_ID);
    if (existing) {return existing;}
    await ensureSeedStructuredStateDocument(sessionId, { touchSession: false });
    return await getTavernStructuredStateDocument(sessionId, ATLAS_DOC_TYPE, DEFAULT_ATLAS_DOC_ID);
}

function buildCanonicalFullReplaceOps(current: TavernMapDocument, next: TavernMapDocument): TavernMapPatchOp[] {
    const ops: TavernMapPatchOp[] = [];
    current.elements.forEach((element) => {
        ops.push({ op: 'remove', id: element.id, _internalSoft: true });
    });
    ops.push({
        op: 'meta',
        set: {
            name: next.meta.name,
            viewBox: next.meta.viewBox,
            theme: next.meta.theme,
            status: next.meta.status,
            mood: next.meta.mood,
            hint: next.meta.hint,
        },
    });
    next.elements.forEach((element) => {
        ops.push({ op: 'add', element });
    });
    return ops;
}

function applyMapOps(source: TavernMapDocument, rawOps: unknown[]): {
    document: TavernMapDocument;
    effectiveOps: TavernMapPatchOp[];
    appliedCount: number;
    satisfiedCount: number;
    failed: Array<{ index: number; error: string; hint?: string }>;
    warnings: string[];
    changedIds: string[];
    removedElements: TavernMapElement[];
    changed: boolean;
} {
    if (!Array.isArray(rawOps)) {throw new Error('state_patch_ops_must_be_array');}
    if (!rawOps.length) {throw new Error('state_patch_ops_required');}
    if (rawOps.length > MAX_STATE_PATCH_OPS) {throw new Error('state_patch_ops_limit_exceeded');}

    const sourceDocument = normalizeMapDocument(source, source.meta, 'stored-document');
    let document = cloneJson(sourceDocument);
    const effectiveOps: TavernMapPatchOp[] = [];
    const warnings: string[] = [];
    const changedIds = new Set<string>();
    const removedElements: TavernMapElement[] = [];
    const failed: Array<{ index: number; error: string; hint?: string }> = [];
    let appliedCount = 0;
    let satisfiedCount = 0;
    let changed = false;

    const findIndex = (id: string) => document.elements.findIndex((element) => element.id === id);

    const applyMeta = (set: Partial<TavernMapDocumentMeta>) => {
        const nextMeta = mergeMapMeta(document.meta, set);
        if (deepEqual(nextMeta, document.meta)) {
            satisfiedCount += 1;
            return;
        }
        document.meta = nextMeta;
        effectiveOps.push({ op: 'meta', set: cloneJson(set) });
        changed = true;
        appliedCount += 1;
        changedIds.add('meta');
    };

    const applyAdd = (element: TavernMapElement) => {
        const index = findIndex(element.id);
        if (index >= 0) {
            if (deepEqual(document.elements[index], element)) {
                satisfiedCount += 1;
                return;
            }
            throw new Error(`map_element_already_exists:${element.id}`);
        }
        document.elements.push(cloneJson(element));
        effectiveOps.push({ op: 'add', element: cloneJson(element) });
        changed = true;
        appliedCount += 1;
        changedIds.add(element.id);
    };

    const applyRemove = (id: string, options: { soft?: boolean; cascadeLabel?: boolean } = {}) => {
        const index = findIndex(id);
        if (index < 0) {
            if (options.soft) {
                satisfiedCount += 1;
                return;
            }
            throw new Error(`map_element_not_found:${id}`);
        }
        const [removed] = document.elements.splice(index, 1);
        removedElements.push(cloneJson(removed));
        effectiveOps.push({ op: 'remove', id, ...(options.soft ? { _internalSoft: true } : {}) });
        changed = true;
        appliedCount += 1;
        changedIds.add(id);
        if (options.cascadeLabel !== false && !isSeedLabelId(id)) {
            const labelId = buildSeedLabelId(id);
            if (findIndex(labelId) >= 0) {
                applyRemove(labelId, { soft: true, cascadeLabel: false });
            }
        }
    };

    const applyModify = (id: string, set: Partial<TavernMapElement>) => {
        const index = findIndex(id);
        if (index < 0) {throw new Error(`map_element_not_found:${id}`);}
        const current = document.elements[index];
        if (isSeedLabelId(id)) {
            const nextLabel = buildCanonicalLabelElement(id, current, set);
            if (deepEqual(current, nextLabel)) {
                satisfiedCount += 1;
                return;
            }
            document.elements[index] = nextLabel;
            if (isCanonicalLabelElement(current) && deepEqual(current.style, nextLabel.style)) {
                effectiveOps.push({ op: 'modify', id, set: buildDerivedLabelModifySet(current, nextLabel.text, nextLabel.at) });
            } else {
                removedElements.push(cloneJson(current));
                effectiveOps.push({ op: 'remove', id, _internalSoft: true });
                effectiveOps.push({ op: 'add', element: cloneJson(nextLabel) });
            }
            changed = true;
            appliedCount += 1;
            changedIds.add(id);
            return;
        }
        const labelId = buildSeedLabelId(id);
        const labelIndex = findIndex(labelId);
        const existingLabel = labelIndex >= 0 ? document.elements[labelIndex] : null;
        const setHasText = Object.prototype.hasOwnProperty.call(set, 'text');
        const text = setHasText ? normalizeText(set.text, 240) : normalizeText(current.text || existingLabel?.text, 240);
        const textlessSet = setHasText
            ? { ...withoutTextShape(set), ...(text ? {} : { text: undefined }) }
            : set;
        const geometryCandidate = hasPatchFields(textlessSet) || (setHasText && hasGeometryShape(current))
            ? buildNextElement(current, textlessSet, warnings)
            : cloneJson(current);
        const hasGeometryCandidate = hasGeometryShape(geometryCandidate);
        const candidate = setHasText && text && !hasGeometryCandidate ? { ...geometryCandidate, text } : geometryCandidate;
        const shouldUpsertDerivedLabel = !isSeedLabelId(id)
            && hasGeometryCandidate
            && !!text
            && canMapElementHaveDerivedLabel(geometryCandidate.cat);
        const next = shouldUpsertDerivedLabel
            ? geometryCandidate
            : candidate;
        let modifiedGeometry = false;
        if (!deepEqual(current, next)) {
            document.elements[index] = next;
            effectiveOps.push({ op: 'modify', id, set: buildCanonicalElementReplaySet(current, next) });
            changed = true;
            appliedCount += 1;
            changedIds.add(id);
            modifiedGeometry = true;
        }

        if (shouldUpsertDerivedLabel && !isSeedLabelId(id) && set.at && current.at) {
            const labelId = buildSeedLabelId(id);
            const labelIndex = findIndex(labelId);
            if (labelIndex >= 0) {
                const label = document.elements[labelIndex];
                const delta: [number, number] = [set.at[0] - current.at[0], set.at[1] - current.at[1]];
                if (delta[0] || delta[1]) {
                    const labelAt: [number, number] = [
                        Number((label.at[0] + delta[0]).toFixed(2)),
                        Number((label.at[1] + delta[1]).toFixed(2)),
                    ];
                    const moved = shouldUpsertDerivedLabel
                        ? buildDerivedLabelElement(next, text, label, labelAt)
                        : buildNextElement(label, { at: labelAt }, warnings);
                    document.elements[labelIndex] = moved;
                    if (shouldUpsertDerivedLabel && !isCanonicalLabelElement(label)) {
                        removedElements.push(cloneJson(label));
                        effectiveOps.push({ op: 'remove', id: labelId, _internalSoft: true });
                        effectiveOps.push({ op: 'add', element: cloneJson(moved) });
                    } else {
                        effectiveOps.push({ op: 'modify', id: labelId, set: shouldUpsertDerivedLabel ? buildDerivedLabelModifySet(label, text, labelAt) : { at: labelAt } });
                    }
                    changed = true;
                    if (shouldUpsertDerivedLabel) {appliedCount += 1;}
                    changedIds.add(labelId);
                    if (shouldUpsertDerivedLabel) {return;}
                }
            }
        }

        if (shouldUpsertDerivedLabel) {
            if (labelIndex >= 0) {
                const label = document.elements[labelIndex];
                const labelNext = buildDerivedLabelElement(next, text, label);
                if (!deepEqual(label, labelNext)) {
                    document.elements[labelIndex] = labelNext;
                    if (isCanonicalLabelElement(label)) {
                        effectiveOps.push({ op: 'modify', id: labelId, set: buildDerivedLabelModifySet(label, text) });
                    } else {
                        removedElements.push(cloneJson(label));
                        effectiveOps.push({ op: 'remove', id: labelId, _internalSoft: true });
                        effectiveOps.push({ op: 'add', element: cloneJson(labelNext) });
                    }
                    changed = true;
                    appliedCount += 1;
                    changedIds.add(labelId);
                    return;
                }
            } else {
                const labelNext = buildDerivedLabelElement(next, text);
                document.elements.push(labelNext);
                effectiveOps.push({ op: 'add', element: cloneJson(labelNext) });
                changed = true;
                appliedCount += 1;
                changedIds.add(labelId);
                return;
            }
        }

        if (!shouldUpsertDerivedLabel && labelIndex >= 0) {
            applyRemove(labelId, { soft: true, cascadeLabel: false });
            return;
        }

        if (!modifiedGeometry) {
            satisfiedCount += 1;
        }
    };

    for (let index = 0; index < rawOps.length; index += 1) {
        const rawOp = rawOps[index];
        try {
            if (!isPlainObject(rawOp)) {throw new Error('op_must_be_object');}
            const op = String(rawOp.op || '').trim();
            if (!op) {throw new Error('map_op_not_supported:empty');}

            if (op === 'meta') {
                applyMeta(normalizeMetaSet(rawOp.set ?? rawOp.changes ?? rawOp.meta, warnings));
                continue;
            }

            if (op === 'add') {
                const elements = normalizeMapElementInput(rawOp.element ?? rawOp, { source: 'model-input', warnings });
                elements.forEach((element) => applyAdd(element));
                continue;
            }

            if (op === 'remove') {
                const id = normalizeText(rawOp.id, 120);
                if (!id) {throw new Error('map_element_id_invalid');}
                applyRemove(id);
                continue;
            }

            if (op === 'modify') {
                const id = normalizeText(rawOp.id, 120);
                if (!id) {throw new Error('map_element_id_invalid');}
                applyModify(id, normalizePartialSet(rawOp.set ?? rawOp.changes, id, warnings));
                continue;
            }

            if (op === 'replace') {
                const id = normalizeText(rawOp.id, 120);
                if (!id) {throw new Error('map_element_id_invalid');}
                if (findIndex(id) < 0) {throw new Error(`map_element_not_found:${id}`);}
                applyRemove(id, { cascadeLabel: true });
                normalizeMapElementInput(rawOp.element, { forcedId: id, source: 'model-input', warnings }).forEach((element) => applyAdd(element));
                continue;
            }

            if (op === 'init' || op === 'reset') {
                const next = normalizeMapDocument(rawOp.document || {
                    meta: {
                        ...(isPlainObject(rawOp.meta) ? rawOp.meta : {}),
                        status: 'active',
                    },
                    elements: rawOp.elements,
                }, {
                    ...document.meta,
                    status: 'active',
                    hint: document.meta.hint,
                }, 'model-input', warnings);
                if (op === 'init' && document.meta.status === 'active' && document.elements.length && rawOp.replaceDocument !== true) {
                    throw new Error('state_init_existing_document_requires_reset');
                }
                buildCanonicalFullReplaceOps(document, next).forEach((canonicalOp) => {
                    if (canonicalOp.op === 'meta') {applyMeta(canonicalOp.set);}
                    else if (canonicalOp.op === 'add') {applyAdd(canonicalOp.element);}
                    else if (canonicalOp.op === 'remove') {applyRemove(canonicalOp.id, { soft: canonicalOp._internalSoft === true, cascadeLabel: false });}
                });
                continue;
            }

            throw new Error(`map_op_not_supported:${op}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error || 'map_op_failed');
            failed.push({ index, error: message, hint: describeMapPatchError(message) });
            break;
        }
    }

    if (!failed.length) {
        const enforced = enforceRenderableMapState(document, warnings);
        document = enforced.document;
        if (enforced.statusChanged) {
            effectiveOps.push({ op: 'meta', set: { status: document.meta.status } });
            changed = true;
            changedIds.add('meta');
        }
    }

    if (!failed.length && document.elements.length > MAX_MAP_ELEMENTS) {
        failed.push({ index: -1, error: 'map_elements_limit_exceeded', hint: `Map has more than ${MAX_MAP_ELEMENTS} elements. Split or reduce the element count.` });
    }

    if (!failed.length && changed && deepEqual(semanticFingerprint(sourceDocument), semanticFingerprint(document))) {
        satisfiedCount += appliedCount;
        appliedCount = 0;
        changed = false;
        changedIds.clear();
        effectiveOps.splice(0, effectiveOps.length);
        removedElements.splice(0, removedElements.length);
    }

    return {
        document,
        effectiveOps,
        appliedCount,
        satisfiedCount,
        failed,
        warnings,
        changedIds: [...changedIds],
        removedElements,
        changed,
    };
}

function buildMapElementSchema() {
    return {
        type: 'object',
        description: 'One map element. It must have `id` and `cat`, plus exactly one geometry shape: `rect`, `circle`, `path`, `curve`, `text`, or explicit `shape:"icon"`. The `icon` field is only a visual Material Symbols name for icon-shaped elements. Omit unused shape keys entirely; never send empty `path:[]`, `curve:[]`, `points:[]`, or `line:[]`. Most elements use `at:[x,y]`; `path` and `curve` may omit `at` and let the first point become the anchor.',
        properties: {
            id: {
                type: 'string',
                description: 'Stable unique id. Do not use the reserved `__label__` prefix.',
            },
            at: {
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2,
                description: 'Anchor coordinate `[x,y]`. Most elements should provide `at`; `path` and `curve` may omit it and use the first point as the anchor. North = smaller y, south = larger y, west = smaller x, east = larger x.',
            },
            cat: {
                type: 'string',
                enum: [...MAP_ELEMENT_CATEGORIES],
                description: 'Closed layer/category such as wall, door, marker, actor, terrain, road, furniture, decoration, light, or label. Use terrain for the main continuous scene surface or filled base area: floor, ground, deck, platform, clearing, yard, roadbed, shoreline area, or any large closed support surface. Do not use floor, ground, surface, deck, platform, base, area, or region as category names.',
            },
            kind: {
                type: 'string',
                enum: [...TAVERN_MAP_ELEMENT_KINDS],
                description: 'Optional closed system semantic for logic such as exits and interactives. Use kind for facts like door/stairs/elevator/portal/passage/entrance/exit/trap/chest/marker/player/actor/north/south/east/west/up/down. Do not put visual icon names here.',
            },
            material: {
                type: 'string',
                enum: [...TAVERN_MAP_MATERIALS],
                description: 'Optional renderer-owned material enum. Use only when RP facts confirm it. Common values include wood, stone, tile, carpet, bed-sheet, fabric, tatami, sand, marble, blood, water, grass, dirt, snow, metal, rune, warm-light, cold-light, shadow, or unknown. Use bed-sheet/fabric for bedding, upholstery, curtains, cushions, or other furniture/soft goods, not the main terrain surface. Do not invent material names.',
            },
            certainty: {
                type: 'string',
                enum: [...TAVERN_MAP_CERTAINTIES],
                description: 'Optional semantic confidence. Omit for confirmed facts. Use inferred for likely/unconfirmed placements and unknown when the position or existence is explicitly uncertain.',
            },
            rect: {
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2,
                description: 'Rectangle `[width,height]`. The top-left corner is at `at`.',
            },
            circle: {
                type: 'number',
                description: 'Circle radius. The center is at `at`.',
            },
            path: {
                type: 'array',
                items: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 },
                description: 'Polyline point array with at least two points. Omit this key for non-line elements; do not send an empty array. With `at`, points are relative offsets. Without `at`, points are absolute coordinates and the first point becomes the anchor.',
            },
            curve: {
                type: 'array',
                items: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 },
                description: 'Smooth curve point array with at least two points. Omit this key for non-curve elements; do not send an empty array. The anchor and relative/absolute rules are the same as `path`.',
            },
            shape: {
                type: 'string',
                enum: ['icon'],
                description: 'Explicit icon geometry marker. Use shape:"icon" when the element is a point icon and `icon` is omitted or only a visual override.',
            },
            icon: {
                type: 'string',
                description: 'Optional visual Material Symbols official name for shape:"icon". Use lowercase underscores, such as door_open, stairs, elevator, inventory_2, chair, table_bar, single_bed, local_bar, menu_book, science, biotech, swords, local_fire_department, water_drop, skull, park, or location_on. Omit when unsure; renderer falls back from kind/cat. Do not invent non-official names such as sword or door.',
            },
            text: {
                type: 'string',
                description: 'Short label text. If you provide text together with label-eligible geometry in an add input, the runtime will split the text into a derived label element automatically. Terrain, light, grid, and label categories do not derive labels from geometry text.',
            },
            actorKey: {
                type: 'string',
                description: 'Optional full-session actor identity key for cat:"actor". If omitted, the element id is used as the actor key fallback.',
            },
            closed: { type: 'boolean', description: 'Whether a path or curve should be closed.' },
        },
        required: ['id', 'cat'],
        additionalProperties: false,
    };
}

function buildMapMetaSetSchema() {
    return {
        type: 'object',
        description: 'For map `meta`, merge only map document fields. Renderer style fields such as fill/style/opacity/zIndex/rotation/blur and visual transform scale are intentionally not part of this schema.',
        properties: {
            name: { type: 'string', description: 'Map title. Empty string clears the title.' },
            viewBox: { type: 'array', items: { type: 'number' }, minItems: 4, maxItems: 4, description: 'Map camera frame `[x,y,width,height]`; it does not move elements.' },
            theme: { type: 'string', enum: [...MAP_THEMES], description: 'Map renderer theme.' },
            status: { type: 'string', enum: [...MAP_STATUSES], description: 'Map document status.' },
            mood: { type: 'string', enum: [...TAVERN_MAP_MOODS], description: 'Map mood; use only when scene facts support it.' },
            hint: { type: 'string', description: 'Map maintenance hint for uninitialized scene maps.' },
        },
        additionalProperties: false,
    };
}

function buildMapElementSetSchema() {
    const pointPair = {
        type: 'array',
        items: { type: 'number' },
        minItems: 2,
        maxItems: 2,
    };
    const pointList = {
        type: 'array',
        items: pointPair,
    };
    return {
        type: 'object',
        description: 'For map `modify`, merge only map element semantic and geometry fields. Renderer style fields such as fill/style/opacity/zIndex/rotation/blur and visual transform scale are intentionally not part of this schema.',
        properties: {
            at: { ...pointPair, description: 'Map element anchor coordinate `[x,y]`.' },
            cat: { type: 'string', enum: [...MAP_ELEMENT_CATEGORIES], description: 'Map element semantic category.' },
            kind: { type: 'string', enum: [...TAVERN_MAP_ELEMENT_KINDS], description: 'Closed map element semantic kind for logic; do not use visual icon names here.' },
            material: { type: 'string', enum: [...TAVERN_MAP_MATERIALS], description: 'Map element material enum. Use unknown when the material is explicitly unclear.' },
            certainty: { type: 'string', enum: [...TAVERN_MAP_CERTAINTIES], description: 'Map element certainty enum. Use confirmed to clear stored uncertainty.' },
            rect: { ...pointPair, description: 'Map element rectangle size `[width,height]`.' },
            circle: { type: 'number', description: 'Map element circle radius.' },
            path: { ...pointList, description: 'Map element polyline points. Omit this key unless changing the element into a real path with at least two points; do not send an empty array.' },
            curve: { ...pointList, description: 'Map element curve points. Omit this key unless changing the element into a real curve with at least two points; do not send an empty array.' },
            shape: { type: 'string', enum: ['icon'], description: 'Explicitly changes the element geometry into an icon shape. Use this to convert an existing rect/circle/path/curve/text element into a point icon.' },
            icon: { type: 'string', description: 'Visual Material Symbols official name for an icon-shaped element. Setting or clearing icon only affects the explicit visual name; it does not change geometry by itself.' },
            text: { type: 'string', description: 'Map label text. Empty string clears source/derived label text.' },
            actorKey: { type: 'string', description: 'Map actor identity key for cat:"actor".' },
            closed: { type: 'boolean', description: 'Whether a path or curve should be closed.' },
        },
        additionalProperties: false,
    };
}

function buildAtlasLocationSetSchema() {
    return {
        type: 'object',
        description: 'For atlas `upsert-location`, merge only world-location fields. Atlas locations do not accept scene-map element geometry such as shape/icon/rect/circle/path.',
        properties: {
            name: { type: 'string', description: 'Atlas location display name.' },
            scale: { type: 'string', enum: [...ATLAS_LOCATION_SCALES], description: 'Atlas location scale.' },
            status: { type: 'string', enum: [...ATLAS_LOCATION_STATUSES], description: 'Atlas location status.' },
            parent: { type: 'string', description: 'Atlas parent location key. Prefer unset:["parent"] to clear it.' },
            mapDocId: { type: 'string', description: 'Atlas linked scene-map docId. Prefer unset:["mapDocId"] to clear it.' },
            aliases: { type: 'array', items: { type: 'string' }, description: 'Atlas location aliases.' },
            brief: { type: 'string', description: 'Short atlas location note. Prefer unset:["brief"] to clear it.' },
        },
        additionalProperties: false,
    };
}

export function getTavernStateToolDefinitions(): Array<{ type: 'function'; function: { name: string; description: string; parameters: unknown } }> {
    const mapElementSchema = buildMapElementSchema();
    const mapMetaSetSchema = buildMapMetaSetSchema();
    const mapElementSetSchema = buildMapElementSetSchema();
    const atlasLocationSetSchema = buildAtlasLocationSetSchema();
    return [
        {
            type: 'function',
            function: {
                name: TAVERN_STATE_TOOL_NAMES.LIST,
                description: [
                    'List structured map documents in the current RP session.',
                    'Returns document entries only. It does not read full state, elements, or patch history.',
                    'Use before MapInspect when you need available scene-map documents, or when you need the atlas world index.',
                    'Map scope is fixed to this tavern session; it cannot inspect text sources, memory Markdown, RP chat history, character cards, world books, settings, or plugin source code.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        docType: { type: 'string', enum: [MAP_DOC_TYPE, ATLAS_DOC_TYPE], description: 'Optional structured document type filter: `tavern.map` for scene maps, `tavern.atlas` for the world index.' },
                    },
                    additionalProperties: false,
                },
            },
        },
        {
            type: 'function',
            function: {
                name: TAVERN_STATE_TOOL_NAMES.READ,
                description: [
                    'Inspect a structured scene map or world atlas document in the current RP session.',
                    'Use `summary` first when choosing what to patch, checking revision, or deciding whether a map/atlas update is needed.',
                    'For `tavern.map`, use `summary` first, `elements` to browse map elements, `element` for one id, `document` for the full map, and `history` for saved map patch transactions.',
                    'For `tavern.atlas`, use `summary`, `document`, `locations`, `location`, `links`, `actors`, or `history`. Atlas does not have map elements.',
                    'This inspects structured spatial data only. Use LS/Grep/Read for text evidence, memory files, chat history, and worldbook material.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        docType: { type: 'string', enum: [MAP_DOC_TYPE, ATLAS_DOC_TYPE], description: 'Structured document type. Use `tavern.map` for scene maps or `tavern.atlas` for the world index.' },
                        docId: { type: 'string', description: 'Structured document id. Omit for the active map; atlas always uses `main`.' },
                        mode: { type: 'string', enum: ['summary', 'elements', 'document', 'element', 'history', 'locations', 'location', 'links', 'actors'], description: 'For maps: summary/elements/document/element/history. For atlas: summary/document/locations/location/links/actors/history.' },
                        elementId: { type: 'string', description: 'Required for `element` mode. Exact element id to read.' },
                        locationKey: { type: 'string', description: 'Required for atlas `location` mode.' },
                        actorKey: { type: 'string', description: 'Optional atlas `actors` filter.' },
                        parent: { type: 'string', description: 'Optional atlas `locations` parent filter.' },
                        status: { type: 'string', enum: ['mentioned', 'visited'], description: 'Optional atlas `locations` status filter.' },
                        from: { type: 'string', description: 'Optional atlas `links` from filter.' },
                        to: { type: 'string', description: 'Optional atlas `links` to filter.' },
                        kind: { type: 'string', enum: [...new Set([...ATLAS_LINK_KINDS, ...TAVERN_MAP_ELEMENT_KINDS])], description: 'Optional map element kind filter for `elements` mode, or atlas `links` kind filter.' },
                        elementType: { type: 'string', enum: [...MAP_SHAPE_KEYS], description: 'Optional `elements`-mode shape filter such as rect, circle, path, curve, icon, or text.' },
                        category: { type: 'string', enum: [...MAP_ELEMENT_CATEGORIES], description: 'Optional `elements`-mode category filter such as wall, door, marker, terrain, road, or label.' },
                        query: { type: 'string', description: 'Optional `elements`-mode text query matched against id, category, kind, shape, icon, label text, material, and certainty.' },
                        offset: { type: 'number', minimum: 0, description: 'Pagination offset for `elements` or `history` results. Default 0.' },
                        limit: { type: 'number', minimum: 1, maximum: MAX_STATE_READ_LIMIT, description: 'Maximum `elements` or `history` results to return. Default 30 for `elements`, 20 for `history`.' },
                        tail: { type: 'number', minimum: 1, maximum: MAX_STATE_READ_LIMIT, description: 'For `history` mode, return the final N patch transactions.' },
                    },
                    additionalProperties: false,
                },
            },
        },
        {
            type: 'function',
            function: {
                name: TAVERN_STATE_TOOL_NAMES.READ_ATLAS,
                description: [
                    'Read the map world file for the current RP session.',
                    'The world file is the atlas: it lists known places, scene map files, links, and actor locations such as player.',
                    'Use this before editing a scene map so you can choose an explicit scene name. The file name is always `world`.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        mode: { type: 'string', enum: ['summary', 'document', 'locations', 'links', 'actors'], description: 'World read mode. Default summary.' },
                        query: { type: 'string', description: 'Optional location search text for locations mode.' },
                        actorKey: { type: 'string', description: 'Optional actor key filter for actors mode.' },
                        limit: { type: 'number', minimum: 1, maximum: MAX_STATE_READ_LIMIT },
                        offset: { type: 'number', minimum: 0 },
                    },
                    additionalProperties: false,
                },
            },
        },
        {
            type: 'function',
            function: {
                name: TAVERN_STATE_TOOL_NAMES.READ_SCENE,
                description: [
                    'Read one scene map file by explicit scene name.',
                    'Use this when you need existing element ids before editing. Missing scene files are reported clearly; MapSceneEdit creates them automatically.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        scene: { type: 'string', description: 'Explicit scene name or stable place key, such as 酒馆大厅 or 地下走廊.' },
                        mode: { type: 'string', enum: ['summary', 'elements', 'document', 'element', 'history'], description: 'Scene read mode. Default summary.' },
                        elementId: { type: 'string', description: 'Required for element mode.' },
                        query: { type: 'string', description: 'Optional element text/id/category search.' },
                        category: { type: 'string', enum: [...MAP_ELEMENT_CATEGORIES] },
                        limit: { type: 'number', minimum: 1, maximum: MAX_STATE_READ_LIMIT },
                        offset: { type: 'number', minimum: 0 },
                        tail: { type: 'number', minimum: 1, maximum: MAX_STATE_READ_LIMIT },
                    },
                    required: ['scene'],
                    additionalProperties: false,
                },
            },
        },
        {
            type: 'function',
            function: {
                name: TAVERN_STATE_TOOL_NAMES.EDIT_SCENE,
                description: [
                    'Edit one scene map file with tolerant map intent. Use this as the normal map write tool.',
                    'Always provide an explicit `scene` name. The runtime creates the scene file if needed, links it from the world atlas, normalizes intent into canonical map ops, and saves only clean canonical results.',
                    'Elements use one `shape` plus `geo`; label is independent and does not count as a shape. Renderer styling such as opacity, color, zIndex, blur, pattern, and custom fill is not accepted.',
                    'Use only the minimum geo for the chosen shape: rect={center,size}, circle={at,radius}, icon={at,icon?}, path={points}, curve={curve}, label={at}+label. Do not fill unused geo keys.',
                    '`cat` and optional `kind` are closed semantics for map logic; `icon` is only a visual Material Symbols official name. If unsure about the official icon name, omit icon and provide kind/cat.',
                    'If one element is bad, that element is skipped and the other valid elements can still save. Read the returned applied/skipped/warnings report before retrying only failed elements.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        scene: { type: 'string', description: 'Explicit scene file name or place key. Required; do not rely on current/active map.' },
                        title: { type: 'string', description: 'Optional display title. Defaults to scene.' },
                        scale: { type: 'string', enum: [...ATLAS_LOCATION_SCALES], description: 'Optional atlas location scale for new places. Default room.' },
                        status: { type: 'string', enum: [...ATLAS_LOCATION_STATUSES], description: 'Optional atlas location status. Defaults visited only when playerHere is true, otherwise mentioned.' },
                        playerHere: { type: 'boolean', description: 'Set true only when the current RP confirms the player is in this scene. This writes world.actors.player.locationKey.' },
                        viewBox: { type: 'array', items: { type: 'number' }, minItems: 4, maxItems: 4, description: 'Optional camera frame [x,y,width,height]. It does not move elements.' },
                        mood: { type: 'string', enum: [...TAVERN_MAP_MOODS], description: 'Optional scene mood when facts support it.' },
                        theme: { type: 'string', enum: [...MAP_THEMES], description: 'Optional renderer theme.' },
                        desc: { type: 'string', description: 'Short summary of this map edit.' },
                        dryRun: { type: 'boolean', description: 'Validate and compile without saving.' },
                        elements: {
                            type: 'array',
                            description: 'Tolerant scene element intents. Prefer one shape plus geo; if shape is missing, the runtime can infer it from geo or label.',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', description: 'Stable element id within this scene.' },
                                    cat: { type: 'string', enum: [...MAP_ELEMENT_CATEGORIES], description: 'Closed layer/category.' },
                                    kind: { type: 'string', enum: [...TAVERN_MAP_ELEMENT_KINDS], description: 'Optional closed system semantic: door/stairs/elevator/portal/passage/entrance/exit/trap/chest/marker/player/actor/north/south/east/west/up/down.' },
                                    shape: { type: 'string', enum: [...MAP_INTENT_SHAPES], description: 'One shape: rect/circle/path/curve/icon/label.' },
                                    geo: {
                                        type: 'object',
                                        description: 'Minimal geometry for the chosen shape only. Omit unused keys.',
                                        properties: {
                                            center: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2, description: 'Center [x,y] for shape:"rect".' },
                                            at: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2, description: 'Position [x,y] for circle, icon, or label.' },
                                            size: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2, description: 'Rect size [width,height].' },
                                            radius: { type: 'number', description: 'Circle radius.' },
                                            points: { type: 'array', items: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 }, description: 'Path points.' },
                                            curve: { type: 'array', items: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 }, description: 'Curve control/polyline points.' },
                                            icon: { type: 'string', description: 'Visual Material Symbols official name for shape:"icon", lowercase underscores. Examples: door_open, stairs, elevator, inventory_2, chair, table_bar, single_bed, local_bar, menu_book, science, biotech, swords, local_fire_department, water_drop, skull, park, location_on. Omit when unsure; renderer falls back from kind/cat.' },
                                        },
                                        additionalProperties: false,
                                    },
                                    label: { type: 'string', description: 'Optional label attached to this element. It is not a shape.' },
                                    actorKey: { type: 'string', description: 'Actor identity for cat:"actor". Use player for the player marker.' },
                                    material: { type: 'string', enum: [...TAVERN_MAP_MATERIALS], description: 'Closed semantic material enum; omit if unsure.' },
                                    certainty: { type: 'string', enum: [...TAVERN_MAP_CERTAINTIES], description: 'Optional uncertainty marker; omit for confirmed.' },
                                    closed: { type: 'boolean' },
                                },
                                required: ['id'],
                                additionalProperties: false,
                            },
                        },
                    },
                    required: ['scene', 'elements'],
                    additionalProperties: false,
                },
            },
        },
        {
            type: 'function',
            function: {
                name: TAVERN_STATE_TOOL_NAMES.PATCH,
                description: [
                    'Advanced/internal structured map/atlas patch transaction tool. Prefer MapAtlasRead and MapSceneEdit for normal model map work.',
                    'Use this only for confirmed spatial changes from RP source text or a user-requested correction. If nothing spatial changed, do not patch.',
                    'Read MapInspect summary first unless you already have the current doc, ids, and revision from this turn. Use `baseRevision` when you are protecting against concurrent changes.',
                    'For `tavern.map`, canonical ops are `meta`, `add`, `modify`, and `remove`. One MapPatch call is one atomic transaction and becomes exactly one revision when it saves.',
                    'Use `meta` to update document fields such as name, viewBox, theme, status, mood, or hint. Mood enum is neutral/warm/cold/dark/mystic/danger/calm; write it only when the scene facts support it.',
                    'Each element has `id` and closed `cat`, optional closed `kind`, plus exactly one geometry shape: `rect`, `circle`, `path`, `curve`, `text`, or explicit `shape:"icon"`. `kind` drives map logic such as exits; `icon` is only a visual Material Symbols official name and never changes geometry by itself. Most elements use `at:[x,y]`; `path` and `curve` may omit `at` and use the first point as the anchor.',
                    'Omit unused shape keys entirely. Never send empty `path:[]`, `curve:[]`, `points:[]`, or `line:[]`; for a rectangular room use only `rect`. Player markers may be `circle` or shape:"icon"; normal MapSceneEdit examples use icon with kind/cat fallback when icon is omitted.',
                    'Minimal first scene-map example: `{"docType":"tavern.map","docId":"main","activate":true,"ops":[{"op":"meta","set":{"name":"测试房间","viewBox":[0,0,320,220],"status":"active"}},{"op":"add","element":{"id":"room-surface","cat":"terrain","at":[30,30],"rect":[240,140],"material":"wood"}},{"op":"add","element":{"id":"room-wall","cat":"wall","at":[30,30],"rect":[240,140],"text":"房间"}},{"op":"add","element":{"id":"player","cat":"actor","kind":"player","actorKey":"player","shape":"icon","at":[150,110],"text":"玩家"}}]}`.',
                    'Use semantic material/certainty instead of renderer styling. Material enum is unknown/wood/stone/tile/carpet/bed-sheet/fabric/tatami/sand/marble/blood/water/grass/dirt/snow/metal/rune/warm-light/cold-light/shadow. Use bed-sheet/fabric only for bedding, upholstery, curtains, cushions, or other furniture/soft goods, not the main terrain surface. Certainty enum is confirmed/inferred/unknown; omit confirmed fields.',
                    'Use cat:"terrain" for the main continuous scene surface or filled base area: indoor floor, outdoor ground, deck, platform, clearing, yard, roadbed, shoreline area, or any large closed support surface. Then draw walls, edges, shell outlines, doors, furniture, hazards, labels, and actors on top. Do not use floor, ground, surface, deck, platform, base, area, region, subtype, opacity, zIndex, rotation, visual scale, blur, or custom fill colors in new map patches.',
                    'For `cat:"actor"`, optional `actorKey` is the full-session identity key. If omitted, the element id is used. The runtime keeps only the latest actor with the same final key across all map documents.',
                    'With `at`, `path` and `curve` points are relative offsets. Without `at`, the points are treated as absolute coordinates and the stored result becomes relative to the first point.',
                    'If one add element contains label-eligible geometry plus text, the runtime splits the text into a system label element automatically. Terrain/light/grid geometry does not derive labels.',
                    'Atlas scale describes place hierarchy; the renderer chooses its visual icon. Scene maps describe local space; draw the local walls, doors, roads, furniture, hazards, objects, labels, and actor positions instead of writing place glyphs.',
                    'For `tavern.atlas/main`, use only `upsert-location`, `remove-location`, `upsert-link`, `remove-link`, and `move-actor`. There is no set-active-location op.',
                    'Atlas links may omit `id`. The default link id is `link:${sorted(from,to).join(":")}:${kind}` for bidirectional links and `link:${from}:${to}:${kind}` for `bidirectional:false`. Use an explicit id only when two locations need multiple same-kind links.',
                    'Move the player between places with `move-actor` and `actorKey:"player"`. That updates atlas.activeLocationKey, marks the location visited, and syncs activeMapDocId when the location has mapDocId. Non-player actors do not change the current location.',
                    'Pass `activate:true` only for `tavern.map` to make that map document active for map tools. Activate-only calls may omit `ops` or pass `ops:[]`. Do not use map activate to represent player movement.',
                    '`meta.viewBox` is the camera. Changing it does not move elements. Move actors by changing their `at`, then adjust `viewBox` only if the camera should follow.',
                    'The `ops` argument must be a real JSON array, not a quoted JSON string. With `dryRun:true`, validate without saving or incrementing revision.',
                    'Legacy `init`, `reset`, and `replace` input is still absorbed at runtime, but do not rely on it in new calls.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        docType: { type: 'string', enum: [MAP_DOC_TYPE, ATLAS_DOC_TYPE], description: 'Structured document type. Use `tavern.map` for scene maps or `tavern.atlas` for the world index.' },
                        docId: { type: 'string', description: 'Structured document id. For scene maps, prefer an explicit stable place-named docId; omit only when intentionally maintaining the currently active scene-map doc. Atlas always uses `main`.' },
                        baseRevision: { type: 'number', description: 'Optional optimistic revision check from MapInspect summary/document.' },
                        dryRun: { type: 'boolean', description: 'Validate and simulate the transaction without saving or incrementing the revision.' },
                        activate: { type: 'boolean', description: 'Set this map document as the current scene after the transaction. With `ops:[]`, this only switches the active map.' },
                        desc: { type: 'string', description: 'Short one-line summary of this turn’s spatial update.' },
                        ops: {
                            type: 'array',
                            description: 'Patch ops as one atomic transaction. Required unless `activate:true` is only switching an existing scene map. For maps use `meta/add/modify/remove`. For atlas use `upsert-location/remove-location/upsert-link/remove-link/move-actor`.',
                            items: {
                                anyOf: [
                                    {
                                        type: 'object',
                                        description: 'Map document metadata update.',
                                        properties: {
                                            op: { type: 'string', enum: ['meta'], description: 'Map document metadata operation.' },
                                            set: mapMetaSetSchema,
                                        },
                                        required: ['op'],
                                        additionalProperties: false,
                                    },
                                    {
                                        type: 'object',
                                        description: 'Add one full scene-map element.',
                                        properties: {
                                            op: { type: 'string', enum: ['add'], description: 'Map element add operation.' },
                                            element: { ...mapElementSchema, description: 'Full element object for `add`. Use exactly one shape key and omit unused shape keys; never send empty `path:[]`, `curve:[]`, `points:[]`, or `line:[]`.' },
                                        },
                                        required: ['op', 'element'],
                                        additionalProperties: false,
                                    },
                                    {
                                        type: 'object',
                                        description: 'Modify one existing scene-map element.',
                                        properties: {
                                            op: { type: 'string', enum: ['modify'], description: 'Map element modify operation.' },
                                            id: { type: 'string', description: 'Map element id for `modify`.' },
                                            set: mapElementSetSchema,
                                        },
                                        required: ['op', 'id', 'set'],
                                        additionalProperties: false,
                                    },
                                    {
                                        type: 'object',
                                        description: 'Remove one existing scene-map element.',
                                        properties: {
                                            op: { type: 'string', enum: ['remove'], description: 'Map element remove operation.' },
                                            id: { type: 'string', description: 'Map element id for `remove`.' },
                                        },
                                        required: ['op', 'id'],
                                        additionalProperties: false,
                                    },
                                    {
                                        type: 'object',
                                        description: 'Create or update one world-atlas location.',
                                        properties: {
                                            op: { type: 'string', enum: ['upsert-location'], description: 'Atlas location upsert operation.' },
                                            key: { type: 'string', description: 'Atlas location key.' },
                                            set: atlasLocationSetSchema,
                                            unset: { type: 'array', items: { type: 'string', enum: ['parent', 'mapDocId', 'aliases', 'brief'] }, description: 'Atlas upsert-location optional fields to remove.' },
                                        },
                                        required: ['op', 'key'],
                                        additionalProperties: false,
                                    },
                                    {
                                        type: 'object',
                                        description: 'Remove one world-atlas location.',
                                        properties: {
                                            op: { type: 'string', enum: ['remove-location'], description: 'Atlas location remove operation.' },
                                            key: { type: 'string', description: 'Atlas location key.' },
                                        },
                                        required: ['op', 'key'],
                                        additionalProperties: false,
                                    },
                                    {
                                        type: 'object',
                                        description: 'Create or update one world-atlas link.',
                                        properties: {
                                            op: { type: 'string', enum: ['upsert-link'], description: 'Atlas link upsert operation.' },
                                            id: { type: 'string', description: 'Optional atlas link id. Atlas links may omit it and use the default id rule.' },
                                            from: { type: 'string', description: 'Atlas link source location key.' },
                                            to: { type: 'string', description: 'Atlas link target location key.' },
                                            kind: { type: 'string', enum: [...ATLAS_LINK_KINDS], description: 'Atlas link kind.' },
                                            label: { type: 'string', description: 'Optional atlas link label.' },
                                            bidirectional: { type: 'boolean', description: 'Atlas link direction flag. Defaults true.' },
                                        },
                                        required: ['op', 'from', 'to', 'kind'],
                                        additionalProperties: false,
                                    },
                                    {
                                        type: 'object',
                                        description: 'Remove one world-atlas link.',
                                        properties: {
                                            op: { type: 'string', enum: ['remove-link'], description: 'Atlas link remove operation.' },
                                            id: { type: 'string', description: 'Atlas link id for `remove-link`.' },
                                        },
                                        required: ['op', 'id'],
                                        additionalProperties: false,
                                    },
                                    {
                                        type: 'object',
                                        description: 'Move one actor between atlas locations.',
                                        properties: {
                                            op: { type: 'string', enum: ['move-actor'], description: 'Atlas actor move operation.' },
                                            actorKey: { type: 'string', description: 'Atlas actor key. Use actorKey:"player" for the player.' },
                                            locationKey: { type: 'string', description: 'Atlas target location key.' },
                                        },
                                        required: ['op', 'actorKey', 'locationKey'],
                                        additionalProperties: false,
                                    },
                                ],
                            },
                        },
                    },
                    additionalProperties: false,
                },
            },
        },
    ];
}

export function getTavernManagerStateToolDefinitions(): Array<{ type: 'function'; function: { name: string; description: string; parameters: unknown } }> {
    return getTavernStateToolDefinitions()
        .filter((tool) => MODEL_FACING_STATE_TOOL_NAMES.has(String(tool.function.name || '').trim()));
}

export async function executeTavernStateTool(
    sessionId = '',
    toolName = '',
    args: Record<string, unknown> = {},
    options: {
        caller?: TavernStateToolCaller;
        managerRunId?: string;
        sourceUserOrder?: number;
        sourceAssistantOrder?: number;
        beforeWriteGuard?: () => Promise<void> | void;
    } = {},
): Promise<TavernStateToolResult> {
    const id = String(sessionId || '').trim();
    const normalizedToolName = String(toolName || '').trim();
    if (!id) {return { ok: false, summary: 'Missing sessionId.', error: 'state_session_required' };}
    try {
        if (normalizedToolName === TAVERN_STATE_TOOL_NAMES.READ_ATLAS) {
            const mode = String(args.mode || 'summary').trim() || 'summary';
            const record = await getSeededAtlasDocumentRecord(id);
            const document = normalizeAtlasDocumentFromRecord(record);
            const base = {
                ok: true,
                file: 'world',
                docType: ATLAS_DOC_TYPE,
                docId: 'world',
                title: atlasTitle(document),
                revision: Number(record?.revision) || 0,
                digest: createAtlasDigest(document),
                activeLocationKey: document.activeLocationKey,
            };
            if (mode === 'document') {
                return {
                    ...base,
                    summary: `Read world atlas, revision ${base.revision}.`,
                    document,
                };
            }
            if (mode === 'locations') {
                const result = summarizeAtlasLocations(document, args);
                return {
                    ...base,
                    summary: `Matched ${result.count} world location(s); returned ${result.locations.length}.`,
                    count: result.count,
                    truncated: result.truncated,
                    nextOffset: result.nextOffset,
                    locations: result.locations,
                };
            }
            if (mode === 'links') {
                const result = summarizeAtlasLinks(document, args);
                return {
                    ...base,
                    summary: `Matched ${result.count} world link(s); returned ${result.links.length}.`,
                    count: result.count,
                    truncated: result.truncated,
                    nextOffset: result.nextOffset,
                    links: result.links,
                };
            }
            if (mode === 'actors') {
                const actorKey = normalizeActorKey(args.actorKey);
                const actors = actorKey
                    ? document.actors.filter((actor) => actor.actorKey === actorKey)
                    : document.actors;
                return {
                    ...base,
                    summary: `Matched ${actors.length} world actor position(s).`,
                    count: actors.length,
                    actors: actors.map((actor) => cloneJson(actor)),
                };
            }
            return {
                ...base,
                summary: `Read world atlas summary, revision ${base.revision}.`,
                count: document.locations.length,
                locations: document.locations.map((location) => cloneJson(location)),
                actors: document.actors.map((actor) => cloneJson(actor)),
                details: {
                    locationCount: document.locations.length,
                    linkCount: document.links.length,
                    actorCount: document.actors.length,
                },
            };
        }

        if (normalizedToolName === TAVERN_STATE_TOOL_NAMES.READ_SCENE) {
            const atlasRecord = await getSeededAtlasDocumentRecord(id);
            const atlas = normalizeAtlasDocumentFromRecord(atlasRecord);
            const target = resolveMapIntentTarget(atlas, args);
            const mode = String(args.mode || 'summary').trim() || 'summary';
            const record = await getTavernStructuredStateDocument(id, MAP_DOC_TYPE, target.docId);
            if (!record) {
                return {
                    ok: false,
                    file: target.sceneName,
                    scene: target.sceneName,
                    docType: MAP_DOC_TYPE,
                    docId: target.docId,
                    summary: `Scene map ${target.sceneName} does not exist yet. MapSceneEdit will create it when needed.`,
                    error: 'map_scene_not_found',
                };
            }
            const document = normalizeMapDocumentFromRecord(record);
            if (mode === 'document') {
                return {
                    ok: true,
                    file: target.sceneName,
                    scene: target.sceneName,
                    summary: `Read scene ${target.sceneName}, revision ${record.revision}.`,
                    docType: MAP_DOC_TYPE,
                    docId: target.docId,
                    title: record.title,
                    revision: record.revision,
                    digest: record.digest,
                    meta: cloneJson(document.meta),
                    elementCount: document.elements.length,
                    document,
                };
            }
            if (mode === 'element') {
                const elementId = normalizeText(args.elementId, 120);
                if (!elementId) {return { ok: false, file: target.sceneName, scene: target.sceneName, summary: 'Missing elementId.', docType: MAP_DOC_TYPE, docId: target.docId, error: 'state_element_id_required' };}
                const element = document.elements.find((item) => item.id === elementId);
                if (!element) {return { ok: false, file: target.sceneName, scene: target.sceneName, summary: `${elementId} does not exist.`, docType: MAP_DOC_TYPE, docId: target.docId, revision: record.revision, error: 'state_element_not_found' };}
                return {
                    ok: true,
                    file: target.sceneName,
                    scene: target.sceneName,
                    summary: `Read ${target.sceneName}/${elementId}.`,
                    docType: MAP_DOC_TYPE,
                    docId: target.docId,
                    revision: record.revision,
                    element: mapElementSummary(element),
                };
            }
            if (mode === 'elements') {
                const result = summarizeMapElements(document, args);
                return {
                    ok: true,
                    file: target.sceneName,
                    scene: target.sceneName,
                    summary: `Matched ${result.count} scene element(s); returned ${result.elements.length}.`,
                    docType: MAP_DOC_TYPE,
                    docId: target.docId,
                    revision: record.revision,
                    count: result.count,
                    truncated: result.truncated,
                    nextOffset: result.nextOffset,
                    elements: result.elements,
                };
            }
            if (mode === 'history') {
                const patches = await listTavernStructuredStatePatches({ sessionId: id, docType: MAP_DOC_TYPE, docId: target.docId });
                const tail = Math.max(0, Number(args.tail) || 0);
                const limit = Math.max(1, Math.min(MAX_STATE_READ_LIMIT, Number(args.limit) || 20));
                const offset = Math.max(0, Number(args.offset) || 0);
                const start = tail > 0 ? Math.max(0, patches.length - Math.min(MAX_STATE_READ_LIMIT, tail)) : offset;
                const page = patches.slice(start, start + (tail > 0 ? Math.min(MAX_STATE_READ_LIMIT, tail) : limit));
                const nextOffset = start + page.length < patches.length ? start + page.length : 0;
                return {
                    ok: true,
                    file: target.sceneName,
                    scene: target.sceneName,
                    summary: `Found ${patches.length} saved scene patch transaction(s); returned ${page.length}.`,
                    docType: MAP_DOC_TYPE,
                    docId: target.docId,
                    revision: record.revision,
                    count: patches.length,
                    truncated: nextOffset > 0,
                    nextOffset,
                    patches: page,
                };
            }
            return {
                ok: true,
                file: target.sceneName,
                scene: target.sceneName,
                summary: `Read scene ${target.sceneName} summary, revision ${record.revision}, status ${document.meta.status}.`,
                docType: MAP_DOC_TYPE,
                docId: target.docId,
                title: record.title,
                revision: record.revision,
                digest: record.digest,
                meta: cloneJson(document.meta),
                elementCount: document.elements.length,
            };
        }

        if (normalizedToolName === TAVERN_STATE_TOOL_NAMES.EDIT_SCENE) {
            const atlasRecord = await getSeededAtlasDocumentRecord(id);
            const atlas = normalizeAtlasDocumentFromRecord(atlasRecord);
            const target = resolveMapIntentTarget(atlas, args);
            const existing = await getTavernStructuredStateDocument(id, MAP_DOC_TYPE, target.docId);
            const currentDocument = existing ? normalizeMapDocumentFromRecord(existing) : defaultMapDocument();
            const compileArgs = { ...args, title: args.title ?? target.title };
            const compiled = compileMapIntentToPatch(currentDocument, compileArgs);
            const atlasStatusText = String(args.status || '').trim() as TavernAtlasLocationStatus;
            const atlasStatus = ATLAS_LOCATION_STATUSES.has(atlasStatusText)
                ? atlasStatusText
                : args.playerHere === true
                    ? 'visited'
                    : target.existingLocation?.status || 'mentioned';
            const atlasScaleText = String(args.scale || '').trim() as TavernAtlasLocationScale;
            const atlasScale = ATLAS_LOCATION_SCALES.has(atlasScaleText)
                ? atlasScaleText
                : target.existingLocation?.scale || 'room';
            const atlasOps: TavernAtlasPatchOp[] = [{
                op: 'upsert-location',
                key: target.locationKey,
                set: {
                    name: target.title,
                    scale: atlasScale,
                    status: atlasStatus,
                    mapDocId: target.docId,
                },
            }];
            if (args.playerHere === true) {
                atlasOps.push({ op: 'move-actor', actorKey: 'player', locationKey: target.locationKey });
            }
            const atlasPatch = applyAtlasOps(atlas, atlasOps);
            if (atlasPatch.failed.length) {
                const firstFailure = atlasPatch.failed[0];
                return {
                    ok: false,
                    file: target.sceneName,
                    scene: target.sceneName,
                    summary: `MapSceneEdit saved nothing for ${target.sceneName}: world atlas link failed before write.`,
                    docType: MAP_DOC_TYPE,
                    docId: target.docId,
                    changed: false,
                    appliedCount: 0,
                    satisfiedCount: compiled.satisfiedCount,
                    failedCount: compiled.skipped.length + atlasPatch.failed.length,
                    applied: compiled.applied,
                    skipped: [
                        ...compiled.skipped,
                        ...atlasPatch.failed.map((failure) => ({
                            index: failure.index,
                            id: `world:${target.locationKey}`,
                            reason: failure.error,
                            hint: failure.hint || describeMapPatchError(failure.error),
                        })),
                    ],
                    warnings: [...new Set([...compiled.warnings, ...atlasPatch.warnings])],
                    error: firstFailure?.error || 'map_scene_atlas_link_failed',
                };
            }

            if (!compiled.effectiveOps.length && compiled.skipped.length && !compiled.applied.length) {
                return {
                    ok: false,
                    file: target.sceneName,
                    scene: target.sceneName,
                    summary: `MapSceneEdit saved nothing for ${target.sceneName}: all ${compiled.skipped.length} element(s) were skipped.`,
                    docType: MAP_DOC_TYPE,
                    docId: target.docId,
                    changed: false,
                    appliedCount: 0,
                    satisfiedCount: compiled.satisfiedCount,
                    failedCount: compiled.skipped.length,
                    applied: compiled.applied,
                    skipped: compiled.skipped,
                    warnings: compiled.warnings,
                    error: 'map_scene_edit_no_valid_elements',
                };
            }

            if (args.dryRun === true) {
                return {
                    ok: true,
                    file: target.sceneName,
                    scene: target.sceneName,
                    summary: `Dry run compiled ${compiled.applied.length} scene element(s), skipped ${compiled.skipped.length}. Nothing was saved.`,
                    docType: MAP_DOC_TYPE,
                    docId: target.docId,
                    title: mapTitle(compiled.document),
                    revision: Number(existing?.revision) || 0,
                    changed: compiled.changed || atlasPatch.changed,
                    appliedCount: compiled.appliedCount,
                    satisfiedCount: compiled.satisfiedCount,
                    failedCount: compiled.skipped.length,
                    applied: compiled.applied,
                    skipped: compiled.skipped,
                    changedIds: compiled.changedIds,
                    removedElements: compiled.removedElements,
                    warnings: [...new Set([...compiled.warnings, ...atlasPatch.warnings])],
                    meta: cloneJson(compiled.document.meta),
                    elementCount: compiled.document.elements.length,
                    document: compiled.document,
                };
            }

            let mapResult: TavernStateToolResult;
            let atlasResult: TavernStateToolResult;
            const timestamp = now();
            if (compiled.effectiveOps.length || atlasPatch.changed) {
                await options.beforeWriteGuard?.();
                const currentRevision = Number(existing?.revision) || 0;
                const nextRevision = currentRevision + 1;
                const atlasCurrentRevision = Number(atlasRecord?.revision) || 0;
                const atlasNextRevision = atlasCurrentRevision + 1;
                let saved: TavernStructuredStateDocumentRecord | null = null;
                let nextDocument = compiled.document;
                let effectiveOps = [...compiled.effectiveOps];
                let removedElements = [...compiled.removedElements];
                let changedIds = [...compiled.changedIds];
                await db.transaction('rw', tavernStateDocumentsTable, tavernStatePatchesTable, tavernSessionsTable, async () => {
                    if (compiled.effectiveOps.length) {
                        const actorDedupe = await dedupeActorElementsForSavedDocument({
                            sessionId: id,
                            docType: MAP_DOC_TYPE,
                            docId: target.docId,
                            document: compiled.document,
                            timestamp,
                            managerRunId: options.managerRunId,
                            sourceUserOrder: options.sourceUserOrder,
                            sourceAssistantOrder: options.sourceAssistantOrder,
                        });
                        nextDocument = actorDedupe.document;
                        effectiveOps = [
                            ...compiled.effectiveOps,
                            ...actorDedupe.removedElements.map((element) => ({ op: 'remove' as const, id: element.id })),
                        ];
                        removedElements = [...compiled.removedElements, ...actorDedupe.removedElements];
                        changedIds = [...new Set([
                            ...compiled.changedIds,
                            ...actorDedupe.removedElements.map((element) => element.id),
                        ])];
                        const digest = createMapDigest(nextDocument, nextRevision);
                        saved = await putTavernStructuredStateDocument({
                            sessionId: id,
                            docType: MAP_DOC_TYPE,
                            docId: target.docId,
                            title: mapTitle(nextDocument),
                            revision: nextRevision,
                            data: nextDocument,
                            digest,
                            status: 'active',
                            source: options.caller || 'auto',
                            createdAt: Number(existing?.createdAt) || timestamp,
                            updatedAt: timestamp,
                        });
                        await appendTavernStructuredStatePatch({
                            sessionId: id,
                            docType: MAP_DOC_TYPE,
                            docId: target.docId,
                            revision: nextRevision,
                            status: 'active',
                            managerRunId: options.managerRunId,
                            sourceUserOrder: options.sourceUserOrder,
                            sourceAssistantOrder: options.sourceAssistantOrder,
                            source: options.caller || 'auto',
                            summary: normalizeText(args.desc || `MapSceneEdit ${nextRevision}`, 400),
                            ops: effectiveOps,
                            changedIds,
                            removedElements,
                        });
                    }
                    if (atlasPatch.changed) {
                        await putTavernStructuredStateDocument({
                            sessionId: id,
                            docType: ATLAS_DOC_TYPE,
                            docId: DEFAULT_ATLAS_DOC_ID,
                            title: atlasTitle(atlasPatch.document),
                            revision: atlasNextRevision,
                            data: atlasPatch.document,
                            digest: createAtlasDigest(atlasPatch.document),
                            status: 'active',
                            source: options.caller || 'auto',
                            createdAt: Number(atlasRecord?.createdAt) || timestamp,
                            updatedAt: timestamp,
                        });
                        await appendTavernStructuredStatePatch({
                            sessionId: id,
                            docType: ATLAS_DOC_TYPE,
                            docId: DEFAULT_ATLAS_DOC_ID,
                            revision: atlasNextRevision,
                            status: 'active',
                            managerRunId: options.managerRunId,
                            sourceUserOrder: options.sourceUserOrder,
                            sourceAssistantOrder: options.sourceAssistantOrder,
                            source: options.caller || 'auto',
                            summary: normalizeText(args.desc || `Link scene ${target.sceneName}`, 400),
                            ops: atlasPatch.effectiveOps,
                            changedIds: atlasPatch.changedIds,
                            removedElements: [],
                        });
                    }
                });
                mapResult = {
                    ok: true,
                    summary: compiled.effectiveOps.length
                        ? `Updated scene ${target.sceneName} to revision ${saved?.revision || nextRevision} with ${compiled.appliedCount} applied op(s).`
                        : `Scene ${target.sceneName} is already at the target result. No scene write was needed.`,
                    docType: MAP_DOC_TYPE,
                    docId: target.docId,
                    title: saved?.title || mapTitle(nextDocument),
                    revision: saved?.revision || Number(existing?.revision) || 0,
                    digest: saved?.digest || (existing ? createMapDigest(currentDocument, Number(existing.revision) || 0) : createMapDigest(currentDocument, 0)),
                    changed: compiled.effectiveOps.length > 0,
                    appliedCount: compiled.appliedCount,
                    satisfiedCount: compiled.satisfiedCount,
                    failedCount: 0,
                    changedIds,
                    removedElements,
                    warnings: compiled.warnings,
                    meta: cloneJson(nextDocument.meta),
                    elementCount: nextDocument.elements.length,
                };
                atlasResult = {
                    ok: true,
                    summary: atlasPatch.changed
                        ? `Linked world atlas to scene ${target.sceneName}, revision ${atlasNextRevision}.`
                        : `World atlas already links scene ${target.sceneName}.`,
                    docType: ATLAS_DOC_TYPE,
                    docId: DEFAULT_ATLAS_DOC_ID,
                    title: atlasTitle(atlasPatch.document),
                    revision: atlasPatch.changed ? atlasNextRevision : atlasCurrentRevision,
                    digest: createAtlasDigest(atlasPatch.document),
                    changed: atlasPatch.changed,
                    appliedCount: atlasPatch.appliedCount,
                    satisfiedCount: atlasPatch.satisfiedCount,
                    failedCount: 0,
                    changedIds: atlasPatch.changedIds,
                    warnings: atlasPatch.warnings,
                };
            } else {
                mapResult = {
                    ok: true,
                    summary: `Scene ${target.sceneName} is already at the target result. No scene write was needed.`,
                    docType: MAP_DOC_TYPE,
                    docId: target.docId,
                    revision: Number(existing?.revision) || 0,
                    changed: false,
                    appliedCount: 0,
                    satisfiedCount: compiled.satisfiedCount,
                    failedCount: 0,
                    warnings: compiled.warnings,
                };
                atlasResult = {
                    ok: true,
                    summary: `World atlas already links scene ${target.sceneName}.`,
                    docType: ATLAS_DOC_TYPE,
                    docId: DEFAULT_ATLAS_DOC_ID,
                    revision: Number(atlasRecord?.revision) || 0,
                    changed: false,
                    appliedCount: 0,
                    satisfiedCount: atlasPatch.satisfiedCount,
                    failedCount: 0,
                    warnings: atlasPatch.warnings,
                };
            }

            return {
                ...mapResult,
                ok: mapResult.ok && atlasResult.ok,
                file: target.sceneName,
                scene: target.sceneName,
                summary: [
                    `Edited scene ${target.sceneName}: ${compiled.applied.length} element(s) compiled, ${compiled.skipped.length} skipped.`,
                    atlasResult.ok ? 'World atlas is linked.' : `World atlas link failed: ${atlasResult.summary}`,
                ].join(' '),
                changed: !!mapResult.changed || !!atlasResult.changed,
                applied: compiled.applied,
                skipped: compiled.skipped,
                failedCount: compiled.skipped.length + (atlasResult.ok ? 0 : 1),
                warnings: [...new Set([
                    ...(mapResult.warnings || []),
                    ...(atlasResult.warnings || []),
                ])],
                details: {
                    scene: target.sceneName,
                    locationKey: target.locationKey,
                    mapDocId: target.docId,
                    atlas: atlasResult.ok ? { changed: atlasResult.changed, revision: atlasResult.revision } : atlasResult,
                },
            };
        }

        const explicitDocType = normalizeText(args.docType, 40);
        const hasExplicitDocType = !!explicitDocType;
        const docType = normalizeDocType(explicitDocType || MAP_DOC_TYPE);
        const explicitDocId = normalizeText(args.docId, 80);
        const docId = normalizeStateDocIdForType(docType, explicitDocId || (
            docType === MAP_DOC_TYPE && (normalizedToolName === TAVERN_STATE_TOOL_NAMES.READ || normalizedToolName === TAVERN_STATE_TOOL_NAMES.PATCH)
                ? (await resolveTavernActiveMapDocument(id)).activeDocId
                : docType === ATLAS_DOC_TYPE
                    ? DEFAULT_ATLAS_DOC_ID
                    : DEFAULT_DOC_ID
        ));

        if (normalizedToolName === TAVERN_STATE_TOOL_NAMES.LIST) {
            const listAllDocTypes = !hasExplicitDocType;
            const activeMapState = listAllDocTypes || docType === MAP_DOC_TYPE
                ? await resolveTavernActiveMapDocument(id, { includeStale: true })
                : null;
            const documents = listAllDocTypes
                ? await listTavernStructuredStateDocuments(id, { includeStale: true })
                : activeMapState?.documents || await listTavernStructuredStateDocuments(id, { docType, includeStale: true });
            const activeMapDocId = activeMapState?.activeDocId || DEFAULT_DOC_ID;
            const sorted = [...documents].sort((left, right) => {
                const leftActive = left.docType === MAP_DOC_TYPE && left.docId === activeMapDocId;
                const rightActive = right.docType === MAP_DOC_TYPE && right.docId === activeMapDocId;
                if (leftActive !== rightActive) {return leftActive ? -1 : 1;}
                if (left.docType !== right.docType) {return left.docType.localeCompare(right.docType);}
                return (Number(right.updatedAt) || 0) - (Number(left.updatedAt) || 0)
                    || (Number(right.revision) || 0) - (Number(left.revision) || 0);
            });
            return {
                ok: true,
                summary: `Found ${sorted.length} map/atlas document(s).`,
                count: sorted.length,
                docId: activeMapDocId,
                documents: sorted.map((document) => ({
                    docType: document.docType,
                    docId: document.docId,
                    title: document.title,
                    revision: document.revision,
                    digest: document.digest,
                    status: document.status,
                    updatedAt: document.updatedAt,
                    active: document.docType === MAP_DOC_TYPE
                        ? document.docId === activeMapDocId
                        : document.docType === ATLAS_DOC_TYPE && document.docId === DEFAULT_ATLAS_DOC_ID,
                })),
            };
        }

        if (normalizedToolName === TAVERN_STATE_TOOL_NAMES.READ) {
            const mode = String(args.mode || 'summary').trim() || 'summary';
            if (docType === ATLAS_DOC_TYPE) {
                const record = await getSeededAtlasDocumentRecord(id);
                if (!record) {
                    return { ok: false, summary: `${docType}/${docId} does not exist.`, docType, docId, error: 'state_document_not_found' };
                }
                const document = normalizeAtlasDocumentFromRecord(record);
                if (mode === 'summary') {
                    return {
                        ok: true,
                        summary: `Read atlas summary, revision ${record.revision}.`,
                        docType,
                        docId,
                        title: record.title,
                        revision: record.revision,
                        digest: createAtlasDigest(document),
                        activeLocationKey: document.activeLocationKey,
                        count: document.locations.length,
                        details: {
                            locationCount: document.locations.length,
                            linkCount: document.links.length,
                            actorCount: document.actors.length,
                        },
                    };
                }
                if (mode === 'document') {
                    return {
                        ok: true,
                        summary: `Read full atlas, revision ${record.revision}.`,
                        docType,
                        docId,
                        title: record.title,
                        revision: record.revision,
                        digest: createAtlasDigest(document),
                        activeLocationKey: document.activeLocationKey,
                        document,
                    };
                }
                if (mode === 'locations') {
                    const result = summarizeAtlasLocations(document, args);
                    return {
                        ok: true,
                        summary: `Matched ${result.count} atlas location(s); returned ${result.locations.length}.`,
                        docType,
                        docId,
                        revision: record.revision,
                        count: result.count,
                        truncated: result.truncated,
                        nextOffset: result.nextOffset,
                        locations: result.locations,
                    };
                }
                if (mode === 'location') {
                    const locationKey = normalizeAtlasKey(args.locationKey ?? args.key);
                    if (!locationKey) {return { ok: false, summary: 'Missing locationKey.', docType, docId, error: 'atlas_location_key_required' };}
                    const location = document.locations.find((item) => item.key === locationKey);
                    if (!location) {return { ok: false, summary: `${locationKey} does not exist.`, docType, docId, revision: record.revision, error: 'atlas_location_not_found' };}
                    return {
                        ok: true,
                        summary: `Read atlas location ${location.name}.`,
                        docType,
                        docId,
                        revision: record.revision,
                        location: {
                            ...cloneJson(location),
                            links: document.links.filter((link) => link.from === locationKey || link.to === locationKey).map((link) => cloneJson(link)),
                            actors: document.actors.filter((actor) => actor.locationKey === locationKey).map((actor) => cloneJson(actor)),
                        },
                    };
                }
                if (mode === 'links') {
                    const result = summarizeAtlasLinks(document, args);
                    return {
                        ok: true,
                        summary: `Matched ${result.count} atlas link(s); returned ${result.links.length}.`,
                        docType,
                        docId,
                        revision: record.revision,
                        count: result.count,
                        truncated: result.truncated,
                        nextOffset: result.nextOffset,
                        links: result.links,
                    };
                }
                if (mode === 'actors') {
                    const actorKey = normalizeActorKey(args.actorKey);
                    const actors = actorKey
                        ? document.actors.filter((actor) => actor.actorKey === actorKey)
                        : document.actors;
                    return {
                        ok: true,
                        summary: `Matched ${actors.length} atlas actor position(s).`,
                        docType,
                        docId,
                        revision: record.revision,
                        count: actors.length,
                        actors: actors.map((actor) => cloneJson(actor)),
                    };
                }
                if (mode === 'history') {
                    const patches = await listTavernStructuredStatePatches({ sessionId: id, docType, docId });
                    const tail = Math.max(0, Number(args.tail) || 0);
                    const limit = Math.max(1, Math.min(MAX_STATE_READ_LIMIT, Number(args.limit) || 20));
                    const offset = Math.max(0, Number(args.offset) || 0);
                    const start = tail > 0 ? Math.max(0, patches.length - Math.min(MAX_STATE_READ_LIMIT, tail)) : offset;
                    const page = patches.slice(start, start + (tail > 0 ? Math.min(MAX_STATE_READ_LIMIT, tail) : limit));
                    const nextOffset = start + page.length < patches.length ? start + page.length : 0;
                    return {
                        ok: true,
                        summary: `Found ${patches.length} saved atlas patch transaction(s); returned ${page.length}.`,
                        docType,
                        docId,
                        revision: record.revision,
                        count: patches.length,
                        truncated: nextOffset > 0,
                        nextOffset,
                        patches: page,
                    };
                }
                return { ok: false, summary: `Unsupported atlas MapInspect mode: ${mode}`, docType, docId, error: 'state_read_mode_invalid' };
            }
            const record = await getSeededMapDocumentRecord(id, docType, docId);
            if (!record) {
                return { ok: false, summary: `${docType}/${docId} does not exist.`, docType, docId, error: 'state_document_not_found' };
            }
            const document = normalizeMapDocumentFromRecord(record);
            if (mode === 'summary') {
                return {
                    ok: true,
                    summary: `Read summary for ${record.title || docId}, revision ${record.revision}, status ${document.meta.status}.`,
                    docType,
                    docId,
                    title: record.title,
                    revision: record.revision,
                    digest: record.digest,
                    meta: cloneJson(document.meta),
                    elementCount: document.elements.length,
                };
            }
            if (mode === 'document') {
                return {
                    ok: true,
                    summary: `Read full state for ${record.title || docId}, revision ${record.revision}.`,
                    docType,
                    docId,
                    title: record.title,
                    revision: record.revision,
                    digest: record.digest,
                    meta: cloneJson(document.meta),
                    elementCount: document.elements.length,
                    document,
                };
            }
            if (mode === 'element') {
                const elementId = normalizeText(args.elementId, 120);
                if (!elementId) {return { ok: false, summary: 'Missing elementId.', docType, docId, error: 'state_element_id_required' };}
                const element = document.elements.find((item) => item.id === elementId);
                if (!element) {return { ok: false, summary: `${elementId} does not exist.`, docType, docId, revision: record.revision, error: 'state_element_not_found' };}
                return {
                    ok: true,
                    summary: `Read element ${elementId}.`,
                    docType,
                    docId,
                    revision: record.revision,
                    element: mapElementSummary(element),
                };
            }
            if (mode === 'elements') {
                const result = summarizeMapElements(document, args);
                return {
                    ok: true,
                    summary: `Matched ${result.count} map element(s); returned ${result.elements.length}.`,
                    docType,
                    docId,
                    revision: record.revision,
                    count: result.count,
                    truncated: result.truncated,
                    nextOffset: result.nextOffset,
                    elements: result.elements,
                };
            }
            if (mode === 'history') {
                const patches = await listTavernStructuredStatePatches({ sessionId: id, docType, docId });
                const tail = Math.max(0, Number(args.tail) || 0);
                const limit = Math.max(1, Math.min(MAX_STATE_READ_LIMIT, Number(args.limit) || 20));
                const offset = Math.max(0, Number(args.offset) || 0);
                const start = tail > 0 ? Math.max(0, patches.length - Math.min(MAX_STATE_READ_LIMIT, tail)) : offset;
                const page = patches.slice(start, start + (tail > 0 ? Math.min(MAX_STATE_READ_LIMIT, tail) : limit));
                const nextOffset = start + page.length < patches.length ? start + page.length : 0;
                return {
                    ok: true,
                    summary: `Found ${patches.length} saved patch transaction(s); returned ${page.length}.`,
                    docType,
                    docId,
                    revision: record.revision,
                    count: patches.length,
                    truncated: nextOffset > 0,
                    nextOffset,
                    patches: page,
                };
            }
            return { ok: false, summary: `Unsupported MapInspect mode: ${mode}`, docType, docId, error: 'state_read_mode_invalid' };
        }

        if (normalizedToolName === TAVERN_STATE_TOOL_NAMES.PATCH) {
            if (!Array.isArray(args.ops) && args.activate !== true) {
                return { ok: false, summary: 'MapPatch ops must be a real array.', docType, docId, error: 'state_patch_ops_must_be_array' };
            }
            const ops = Array.isArray(args.ops) ? args.ops as unknown[] : [];
            const activate = args.activate === true;
            if (!ops.length && !activate) {
                return { ok: false, summary: 'MapPatch ops are required unless activate:true is used to switch active map.', docType, docId, error: 'state_patch_ops_required' };
            }
            if (docType === ATLAS_DOC_TYPE && activate) {
                return { ok: false, summary: 'Atlas has no activate:true operation. Move the player with move-actor(actorKey:"player").', docType, docId, error: 'atlas_activate_not_supported' };
            }
            if (docType === ATLAS_DOC_TYPE) {
                return await db.transaction(
                    'rw',
                    tavernStateDocumentsTable,
                    tavernStatePatchesTable,
                    tavernMessagesTable,
                    tavernSessionsTable,
                    async () => {
                        await options.beforeWriteGuard?.();
                        const existing = await getSeededAtlasDocumentRecord(id);
                        const currentRevision = Number(existing?.revision) || 0;
                        if (Number.isFinite(Number(args.baseRevision)) && Number(args.baseRevision) !== currentRevision) {
                            return {
                                ok: false,
                                summary: `Revision changed: current is ${currentRevision}, but this call was based on ${Number(args.baseRevision)}. Run MapInspect again before patching.`,
                                docType,
                                docId,
                                revision: currentRevision,
                                error: 'state_revision_conflict',
                            };
                        }
                        const currentDocument = normalizeAtlasDocumentFromRecord(existing);
                        const patch = applyAtlasOps(currentDocument, ops);
                        if (patch.failed.length) {
                            const failureSummary = summarizePatchFailures(patch.failed);
                            return {
                                ok: false,
                                summary: `Atlas patch was not saved: ${patch.failed.length} op(s) failed.${failureSummary ? ` ${failureSummary}` : ''}`,
                                docType,
                                docId,
                                revision: currentRevision,
                                changed: false,
                                appliedCount: 0,
                                satisfiedCount: patch.satisfiedCount,
                                failedCount: patch.failed.length,
                                failed: patch.failed,
                                warnings: patch.warnings,
                                error: 'state_patch_failed',
                                details: patch.failed,
                            };
                        }
                        if (!patch.changed) {
                            return {
                                ok: true,
                                summary: 'Atlas is already at the target result. No write was needed.',
                                docType,
                                docId,
                                revision: currentRevision,
                                changed: false,
                                appliedCount: 0,
                                satisfiedCount: patch.satisfiedCount,
                                failedCount: 0,
                                warnings: patch.warnings,
                            };
                        }
                        const nextRevision = currentRevision + 1;
                        const digest = createAtlasDigest(patch.document);
                        if (args.dryRun === true) {
                            return {
                                ok: true,
                                summary: `Dry run passed: ${docType}/${docId} would advance to revision ${nextRevision} with ${patch.appliedCount} applied op(s). Nothing was saved.`,
                                docType,
                                docId,
                                title: atlasTitle(patch.document),
                                revision: currentRevision,
                                digest,
                                changed: true,
                                appliedCount: patch.appliedCount,
                                satisfiedCount: patch.satisfiedCount,
                                failedCount: 0,
                                changedIds: patch.changedIds,
                                warnings: patch.warnings,
                                activeLocationKey: patch.document.activeLocationKey,
                                document: patch.document,
                            };
                        }
                        const timestamp = now();
                        const saved = await putTavernStructuredStateDocument({
                            sessionId: id,
                            docType,
                            docId,
                            title: atlasTitle(patch.document),
                            revision: nextRevision,
                            data: patch.document,
                            digest,
                            status: 'active',
                            source: options.caller || 'auto',
                            createdAt: Number(existing?.createdAt) || timestamp,
                            updatedAt: timestamp,
                        });
                        await appendTavernStructuredStatePatch({
                            sessionId: id,
                            docType,
                            docId,
                            revision: nextRevision,
                            status: 'active',
                            managerRunId: options.managerRunId,
                            sourceUserOrder: options.sourceUserOrder,
                            sourceAssistantOrder: options.sourceAssistantOrder,
                            source: options.caller || 'auto',
                            summary: normalizeText(args.desc || `AtlasPatch ${nextRevision}`, 400),
                            ops: patch.effectiveOps,
                            changedIds: patch.changedIds,
                            removedElements: [],
                        });
                        if (patch.syncedActiveMapDocId) {
                            await setActiveMapDocId(id, patch.syncedActiveMapDocId);
                        }
                        return {
                            ok: true,
                            summary: `Updated ${docType}/${docId} to revision ${saved.revision} with ${patch.appliedCount} applied op(s).`,
                            docType,
                            docId,
                            title: saved.title,
                            revision: saved.revision,
                            digest: saved.digest,
                            changed: true,
                            appliedCount: patch.appliedCount,
                            satisfiedCount: patch.satisfiedCount,
                            failedCount: 0,
                            changedIds: patch.changedIds,
                            warnings: patch.warnings,
                            activeLocationKey: patch.document.activeLocationKey,
                            document: patch.document,
                        };
                    },
                );
            }
            return await db.transaction(
                'rw',
                tavernStateDocumentsTable,
                tavernStatePatchesTable,
                tavernMessagesTable,
                tavernSessionsTable,
                async () => {
                    await options.beforeWriteGuard?.();
                    const existing = await getTavernStructuredStateDocument(id, docType, docId);
                    const currentRevision = Number(existing?.revision) || 0;
                    if (Number.isFinite(Number(args.baseRevision)) && Number(args.baseRevision) !== currentRevision) {
                        return {
                            ok: false,
                            summary: `Revision changed: current is ${currentRevision}, but this call was based on ${Number(args.baseRevision)}. Run MapInspect again before patching.`,
                            docType,
                            docId,
                            revision: currentRevision,
                            error: 'state_revision_conflict',
                        };
                    }

                    if (!ops.length && activate) {
                        if (!existing) {
                            return { ok: false, summary: `${docType}/${docId} does not exist.`, docType, docId, error: 'state_document_not_found' };
                        }
                        const previousActiveDocId = await getActiveMapDocId(id);
                        const activeDocId = await setActiveMapDocId(id, docId);
                        const warnings = await buildMapAtlasMismatchWarning(id, docId);
                        return {
                            ok: true,
                            summary: `Activated ${docType}/${docId}.`,
                            docType,
                            docId,
                            title: existing.title,
                            revision: currentRevision,
                            digest: existing.digest,
                            changed: previousActiveDocId !== activeDocId,
                            appliedCount: 0,
                            satisfiedCount: 0,
                            failedCount: 0,
                            warnings,
                        };
                    }

                    const currentDocument = existing ? normalizeMapDocumentFromRecord(existing) : defaultMapDocument();
                    const patch = applyMapOps(currentDocument, ops);
                    if (patch.failed.length) {
                        const failureSummary = summarizePatchFailures(patch.failed);
                        return {
                            ok: false,
                            summary: `MapPatch was not saved: ${patch.failed.length} op(s) failed.${failureSummary ? ` ${failureSummary}` : ''}`,
                            docType,
                            docId,
                            revision: currentRevision,
                            changed: false,
                            appliedCount: 0,
                            satisfiedCount: patch.satisfiedCount,
                            failedCount: patch.failed.length,
                            failed: patch.failed,
                            warnings: patch.warnings,
                            error: 'state_patch_failed',
                            details: patch.failed,
                        };
                    }
                    if (!patch.changed) {
                        let activeChanged = false;
                        if (activate && args.dryRun !== true) {
                            if (!existing) {
                                return { ok: false, summary: `${docType}/${docId} does not exist.`, docType, docId, error: 'state_document_not_found' };
                            }
                            const previousActiveDocId = await getActiveMapDocId(id);
                            const activeDocId = await setActiveMapDocId(id, docId);
                            activeChanged = previousActiveDocId !== activeDocId;
                        }
                        const activateWarnings = activate && args.dryRun !== true
                            ? await buildMapAtlasMismatchWarning(id, docId)
                            : [];
                        return {
                            ok: true,
                            summary: activeChanged
                                ? `Activated ${docType}/${docId}. State was already at the target result.`
                                : 'State is already at the target result. No write was needed.',
                            docType,
                            docId,
                            revision: currentRevision,
                            changed: activeChanged,
                            appliedCount: 0,
                            satisfiedCount: patch.satisfiedCount,
                            failedCount: 0,
                            warnings: [...patch.warnings, ...activateWarnings],
                        };
                    }

                    const nextRevision = currentRevision + 1;
                    const timestamp = now();
                    if (args.dryRun === true) {
                        const digest = createMapDigest(patch.document, nextRevision);
                        return {
                            ok: true,
                            summary: `Dry run passed: ${docType}/${docId} would advance to revision ${nextRevision} with ${patch.appliedCount} applied op(s). Nothing was saved.`,
                            docType,
                            docId,
                            title: mapTitle(patch.document),
                            revision: currentRevision,
                            digest,
                            changed: true,
                            appliedCount: patch.appliedCount,
                            satisfiedCount: patch.satisfiedCount,
                            failedCount: 0,
                            changedIds: patch.changedIds,
                            removedElements: patch.removedElements,
                            warnings: patch.warnings,
                            meta: cloneJson(patch.document.meta),
                            elementCount: patch.document.elements.length,
                        };
                    }

                    const actorDedupe = await dedupeActorElementsForSavedDocument({
                        sessionId: id,
                        docType,
                        docId,
                        document: patch.document,
                        timestamp,
                        managerRunId: options.managerRunId,
                        sourceUserOrder: options.sourceUserOrder,
                        sourceAssistantOrder: options.sourceAssistantOrder,
                    });
                    const nextDocument = actorDedupe.document;
                    const effectiveOps = [...patch.effectiveOps, ...actorDedupe.removedElements.map((element) => ({ op: 'remove' as const, id: element.id }))];
                    const removedElements = [...patch.removedElements, ...actorDedupe.removedElements];
                    const changedIds = [...new Set([
                        ...patch.changedIds,
                        ...actorDedupe.removedElements.map((element) => element.id),
                    ])];
                    const digest = createMapDigest(nextDocument, nextRevision);

                    const saved = await putTavernStructuredStateDocument({
                        sessionId: id,
                        docType,
                        docId,
                        title: mapTitle(nextDocument),
                        revision: nextRevision,
                        data: nextDocument,
                        digest,
                        status: 'active',
                        source: options.caller || 'auto',
                        createdAt: Number(existing?.createdAt) || timestamp,
                        updatedAt: timestamp,
                    });
                    await appendTavernStructuredStatePatch({
                        sessionId: id,
                        docType,
                        docId,
                        revision: nextRevision,
                        status: 'active',
                        managerRunId: options.managerRunId,
                        sourceUserOrder: options.sourceUserOrder,
                        sourceAssistantOrder: options.sourceAssistantOrder,
                        source: options.caller || 'auto',
                        summary: normalizeText(args.desc || `MapPatch ${nextRevision}`, 400),
                        ops: effectiveOps,
                        changedIds,
                        removedElements,
                    });
                    if (activate) {
                        await setActiveMapDocId(id, docId);
                    }
                    const activateWarnings = activate
                        ? await buildMapAtlasMismatchWarning(id, docId)
                        : [];
                    return {
                        ok: true,
                        summary: `Updated ${docType}/${docId} to revision ${saved.revision} with ${patch.appliedCount} applied op(s).`,
                        docType,
                        docId,
                        title: saved.title,
                        revision: saved.revision,
                        digest: saved.digest,
                        changed: true,
                        appliedCount: patch.appliedCount,
                        satisfiedCount: patch.satisfiedCount,
                        failedCount: 0,
                        changedIds,
                        removedElements,
                        warnings: [...patch.warnings, ...activateWarnings],
                        meta: cloneJson(nextDocument.meta),
                        elementCount: nextDocument.elements.length,
                    };
                },
            );
        }

        return { ok: false, summary: `${toolName} is not available.`, error: 'state_tool_not_available' };
    } catch (error) {
        const name = error instanceof Error ? error.name : '';
        const message = error instanceof Error ? error.message : String(error || 'state_tool_failed');
        if (name === 'AbortError' || message === 'manager_source_messages_changed' || message === 'manager_epoch_expired' || message === 'manager_aborted') {
            throw error;
        }
        return {
            ok: false,
            summary: describeMapPatchError(message) || message,
            error: message,
        };
    }
}

export async function getTavernMapStateForSession(sessionId = ''): Promise<{
    documents: TavernMapStateDocumentItem[];
    activeDocId: string;
    activeDocument: TavernStructuredStateDocumentRecord | null;
    activePatches: TavernStructuredStatePatchRecord[];
}> {
    const resolved = await resolveTavernActiveMapDocument(sessionId);
    const activeDocId = resolved.activeDocId;
    const rows = resolved.documents;
    const visibleRows = rows.some((record) => !isUninitializedSeedMapRecord(record))
        ? rows.filter((record) => !isUninitializedSeedMapRecord(record))
        : rows;
    const documents = visibleRows
        .map((record) => {
            const normalized = normalizeMapDocumentFromRecord(record);
            return {
                ...record,
                data: normalized,
                docType: record.docType,
                docId: record.docId,
                title: mapTitle(normalized),
                revision: record.revision,
                digest: createMapDigest(normalized, record.revision),
                status: record.status,
                updatedAt: record.updatedAt,
                active: record.docId === activeDocId,
            };
        })
        .sort((left, right) => {
            if (!!left.active !== !!right.active) {return left.active ? -1 : 1;}
            return (Number(right.updatedAt) || 0) - (Number(left.updatedAt) || 0)
                || (Number(right.revision) || 0) - (Number(left.revision) || 0);
        });
    const record = resolved.record;
    const normalizedDocument = record ? normalizeMapDocumentFromRecord(record) : null;
    const activePatches = record
        ? await listTavernStructuredStatePatches({ sessionId, docType: MAP_DOC_TYPE, docId: record.docId, limit: 80 })
        : [];
    if (!record || !normalizedDocument) {
        return { documents, activeDocId, activeDocument: null, activePatches: [] };
    }
    return {
        documents,
        activeDocId,
        activeDocument: {
            ...record,
            data: normalizedDocument,
            title: mapTitle(normalizedDocument),
            digest: createMapDigest(normalizedDocument, record.revision),
        },
        activePatches,
    };
}

export async function getTavernAtlasStateForSession(sessionId = ''): Promise<{
    document: TavernStructuredStateDocumentRecord | null;
    patches: TavernStructuredStatePatchRecord[];
    activeLocationKey: string;
}> {
    const record = await getSeededAtlasDocumentRecord(sessionId);
    if (!record) {return { document: null, patches: [], activeLocationKey: '' };}
    const normalized = normalizeAtlasDocumentFromRecord(record);
    const patches = await listTavernStructuredStatePatches({
        sessionId,
        docType: ATLAS_DOC_TYPE,
        docId: DEFAULT_ATLAS_DOC_ID,
        limit: 80,
    });
    return {
        document: {
            ...record,
            data: normalized,
            title: atlasTitle(normalized),
            digest: createAtlasDigest(normalized),
        },
        patches,
        activeLocationKey: normalized.activeLocationKey || '',
    };
}

function atlasLocationLabel(location: TavernAtlasLocation | undefined): string {
    if (!location) {return '';}
    return location.brief
        ? `${location.name}（${location.brief}）`
        : location.name;
}

function mapDigestLabels(digest = ''): string {
    return String(digest || '')
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.startsWith('标注：'))
        ?.replace(/^标注：/, '')
        .trim() || '';
}

function mapDigestSceneLines(digest = ''): string[] {
    const lines = String(digest || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    const title = lines.find((line) => line.startsWith('地图：'))?.replace(/^地图：/, '').trim();
    return [
        title ? `当前场景：${title}` : '',
        ...lines.filter((line) => !line.startsWith('地图：') && !line.startsWith('标注：')),
    ].filter(Boolean);
}

export async function buildTavernSpatialStateDigest(sessionId = ''): Promise<string> {
    await ensureSeedStructuredStateDocument(sessionId, { touchSession: false });
    const atlasRecord = await getTavernStructuredStateDocument(sessionId, ATLAS_DOC_TYPE, DEFAULT_ATLAS_DOC_ID);
    const atlas = normalizeAtlasDocumentFromRecord(atlasRecord);
    const locations = new Map(atlas.locations.map((location) => [location.key, location]));
    const active = atlas.activeLocationKey ? locations.get(atlas.activeLocationKey) : undefined;
    if (!active) {return '';}
    const parent = active.parent ? locations.get(active.parent) : undefined;
    const adjacent = atlas.links
        .flatMap((link) => {
            if (link.from === active.key) {return [locations.get(link.to)];}
            if (link.bidirectional && link.to === active.key) {return [locations.get(link.from)];}
            return [];
        })
        .filter((location): location is TavernAtlasLocation => !!location);
    const visited = atlas.locations
        .filter((location) => location.status === 'visited')
        .map((location) => location.name)
        .filter(Boolean);
    const mentioned = atlas.locations
        .filter((location) => location.status === 'mentioned')
        .map((location) => location.name)
        .filter(Boolean);
    const actorLines = atlas.actors
        .map((actor) => {
            if (isGenericActorLabel(actor.actorKey)) {return '';}
            const location = locations.get(actor.locationKey);
            return location ? `${actor.actorKey}=${location.name}` : '';
        })
        .filter(Boolean);
    const mapRecord = active.mapDocId
        ? await getTavernStructuredStateDocument(sessionId, MAP_DOC_TYPE, active.mapDocId)
        : null;
    const mapDigest = mapRecord ? createMapDigest(normalizeMapDocumentFromRecord(mapRecord), mapRecord.revision) : '';
    const sceneLabels = mapDigestLabels(mapDigest);
    const sceneLines = mapDigestSceneLines(mapDigest);

    return [
        `当前地点：${atlasLocationLabel(active)}`,
        parent ? `上级地点：${parent.name}` : '',
        adjacent.length ? `相邻地点：${adjacent.map((location) => atlasLocationLabel(location)).join('、')}` : '',
        visited.length ? `已探索地点：${visited.join('、')}` : '',
        mentioned.length ? `已知但未到达：${mentioned.join('、')}` : '',
        actorLines.length ? `人物位置：${actorLines.join('，')}` : '',
        ...sceneLines,
        sceneLabels ? `当前场景标注：${sceneLabels}` : active.mapDocId ? '当前场景标注：暂无' : '当前地点暂无详细地图',
    ].filter(Boolean).join('\n');
}

export async function listTavernStructuredStateDigests(sessionId = '') {
    const { record } = await resolveTavernActiveMapDocument(sessionId);
    if (!record) {return [];}
    const normalized = normalizeMapDocumentFromRecord(record);
    if (normalized.meta.status !== 'active' || isUninitializedMapData(normalized)) {return [];}
    return [{
        docType: record.docType,
        docId: record.docId,
        title: mapTitle(normalized),
        revision: record.revision,
        digest: createMapDigest(normalized, record.revision),
    }];
}
