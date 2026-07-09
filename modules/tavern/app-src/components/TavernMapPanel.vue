<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, type CSSProperties } from 'vue';
import type {
    TavernStructuredStateDocumentRecord,
    TavernStructuredStatePatchRecord,
} from '../../shared/session-db';
import type { TavernMapDocument, TavernMapElement, TavernMapStateDocumentItem } from '../../shared/structured-state';
import { isRenderableMapDocument } from '../../shared/map-state-content';
import { createSeedMapDocument } from '../../shared/map-state-seed';
import { applyTrustedMapPatchOps } from '../../shared/map-state-ops';
import { compareMapStableText, materialEntry, zOf } from '../../shared/map-semantics';
import {
    getTavernMapElementBounds,
    getTavernMapPresentationTransform,
    projectTavernMapPresentationPoint,
    type TavernMapBounds,
} from '../map-display';
import { layoutTavernMapLabels } from '../map-label-layout';
import {
    getTavernMapSceneSurfaceBackground,
    getTavernMapSceneSurfaceElement,
    getTavernMapSceneSurfaceFill,
    getTavernMapSceneSurfaceOpacity,
} from '../map-scene-surface';
import {
    tavernMapElementBlend,
    tavernMapElementColor,
    tavernMapElementFill,
    tavernMapElementHasAreaShape,
    tavernMapElementLineCasing,
    tavernMapElementStrokeWidth,
    type TavernMapElementVisualContext,
} from '../map-render-style';
import {
    resolveMapElementIconName,
    TAVERN_MAP_MATERIAL_SYMBOL_SIZE,
} from '../../shared/map-material-symbols';

type MapReplayMode = 'full' | 'patch' | 'timeline';
type MapRenderLayer = 'fill' | 'avatar' | 'line' | 'light' | 'label';
type MapOpKind = 'add' | 'modify' | 'remove' | 'stable';
type MapBlendMode = 'normal' | 'multiply' | 'screen' | 'overlay';

interface MapRenderItem {
    element: TavernMapElement;
    id: string;
    layer: MapRenderLayer;
    path: string;
    color: string;
    fill: string;
    blend: MapBlendMode;
    opacity: number;
    z: number;
    strokeWidth: number;
    dash: string;
    delayMs: number;
    durationMs: number;
    length: number;
    opKind: MapOpKind;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    anchor: string;
    transform: string;
    symbolIcon?: string;
    fillRule: 'nonzero' | 'evenodd';
    role?: string;
    avatarHref?: string;
    avatarClipId?: string;
    avatarX?: number;
    avatarY?: number;
    avatarSize?: number;
}
type MapAvatarImageItem = MapRenderItem & Required<Pick<MapRenderItem, 'avatarHref' | 'avatarClipId' | 'avatarX' | 'avatarY' | 'avatarSize'>>;

interface MapReplayFrame {
    revision: number;
    document: TavernMapDocument;
    patch: TavernStructuredStatePatchRecord;
    index: number;
}

interface MapSceneSurface {
    elementId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    style: CSSProperties;
}

function pickPenAnimationItem<T extends { symbolIcon?: string; layer: string; path: string }>(items: T[]): T | null {
    return items.find((item) => !item.symbolIcon && item.layer !== 'label' && !!item.path) || null;
}

function svgLocalId(value: string): string {
    return String(value || '')
        .trim()
        .replace(/[^A-Za-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || 'item';
}

const props = withDefaults(defineProps<{
    documents?: TavernMapStateDocumentItem[];
    activeDocId?: string;
    selectedDocId?: string;
    document: TavernStructuredStateDocumentRecord | null;
    patches: TavernStructuredStatePatchRecord[];
    compact?: boolean;
    playerDisplayName?: string;
    playerAvatarUrl?: string;
    materialSymbolsReady?: boolean;
    materialSymbolsStatus?: 'idle' | 'loading' | 'ready' | 'failed';
}>(), {
    documents: () => [],
    activeDocId: 'main',
    selectedDocId: '',
    compact: false,
    playerDisplayName: 'User',
    playerAvatarUrl: '',
    materialSymbolsReady: false,
    materialSymbolsStatus: 'idle',
});
const emit = defineEmits<{
    (event: 'update:selectedDocId', docId: string): void;
}>();

const replayKey = ref(0);
const svgDefsNonce = ref(0);
const replayMode = ref<MapReplayMode>('patch');
const timelineIndex = ref(0);
const localSelectedDocId = ref('');
const mapSvgRef = ref<SVGSVGElement | null>(null);
const mapPanOffset = ref<[number, number]>([0, 0]);
const mapZoom = ref(1);
const mapDrag = ref<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPanX: number;
    startPanY: number;
    viewWidth: number;
    viewHeight: number;
    clientWidth: number;
    clientHeight: number;
} | null>(null);
let timelineTimer: number | undefined;

function svgDefId(id: string): string {
    return `${svgLocalId(id)}-r${svgDefsNonce.value}`;
}

function svgUrl(id: string): string {
    return `url(#${svgDefId(id)})`;
}

function scopeSvgUrl(value: string): string {
    return String(value || '').replace(/url\(#([^)]+)\)/g, (_match, id: string) => svgUrl(id));
}

function cloneValue<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function defaultDisplayMap(): TavernMapDocument {
    return createSeedMapDocument();
}

function normalizeDisplayMap(value: unknown): TavernMapDocument {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {return defaultDisplayMap();}
    const source = value as Partial<TavernMapDocument>;
    const fallback = defaultDisplayMap();
    return {
        meta: source.meta && typeof source.meta === 'object' && !Array.isArray(source.meta)
            ? {
                ...fallback.meta,
                ...cloneValue(source.meta),
            }
            : fallback.meta,
        elements: Array.isArray(source.elements)
            ? cloneValue(source.elements).filter((element): element is TavernMapElement => !!element && typeof element === 'object' && !Array.isArray(element) && typeof (element as TavernMapElement).id === 'string')
            : [],
    };
}

const selectedDocumentRecord = computed<TavernMapStateDocumentItem | TavernStructuredStateDocumentRecord | null>(() => {
    const docs = Array.isArray(props.documents) ? props.documents : [];
    const selected = String(localSelectedDocId.value || props.activeDocId || props.document?.docId || '').trim();
    return docs.find((document) => document.docId === selected)
        || docs.find((document) => document.docId === props.activeDocId)
        || props.document
        || null;
});
const selectedDocPatches = computed(() => {
    const docId = String(selectedDocumentRecord.value?.docId || '').trim();
    return docId && docId === String(props.document?.docId || '').trim() ? props.patches : [];
});
const mapDocument = computed<TavernMapDocument | null>(() => {
    const data = selectedDocumentRecord.value?.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {return null;}
    return normalizeDisplayMap(data);
});

const latestPatch = computed(() => selectedDocPatches.value.at(-1) || null);
const mapBadgeExpanded = ref(false);
const timelineFrames = computed<MapReplayFrame[]>(() => {
    const sorted = [...selectedDocPatches.value].sort((left, right) => Number(left.revision || 0) - Number(right.revision || 0));
    let document = defaultDisplayMap();
    return sorted.map((patch, index) => {
        const ops = Array.isArray(patch.ops) ? patch.ops as Array<Record<string, unknown>> : [];
        document = applyTrustedMapPatchOps(normalizeDisplayMap(document), ops);
        return {
            revision: Number(patch.revision || index + 1),
            document: cloneValue(document),
            patch,
            index,
        };
    });
});
const activeTimelineFrame = computed(() => {
    if (!timelineFrames.value.length) {return null;}
    const index = Math.max(0, Math.min(timelineIndex.value, timelineFrames.value.length - 1));
    return timelineFrames.value[index] || null;
});
const canReplayTimeline = computed(() => timelineFrames.value.length > 0 && Number(timelineFrames.value[0]?.revision || 0) <= 1);
const activePatch = computed(() => replayMode.value === 'timeline' ? activeTimelineFrame.value?.patch || latestPatch.value : latestPatch.value);
const activeMapDocument = computed(() => replayMode.value === 'timeline' ? activeTimelineFrame.value?.document || mapDocument.value : mapDocument.value);
const latestOps = computed(() => Array.isArray(activePatch.value?.ops) ? activePatch.value?.ops as Array<Record<string, unknown>> : []);
const latestChangedIds = computed(() => new Set((activePatch.value?.changedIds || []).map((id) => String(id || '').trim()).filter(Boolean)));
const latestOpById = computed(() => {
    const map = new Map<string, MapOpKind>();
    latestOps.value.forEach((op) => {
        const opName = String(op.op || '').trim();
        const element = op.element && typeof op.element === 'object' && !Array.isArray(op.element) ? op.element as Record<string, unknown> : null;
        const id = String(op.id || element?.id || '').trim();
        if (id && (opName === 'add' || opName === 'modify' || opName === 'remove')) {
            map.set(id, opName as MapOpKind);
        }
    });
    return map;
});
const removedOps = computed(() => latestOps.value
    .filter((op) => String(op.op || '').trim() === 'remove')
    .map((op, index) => ({
        id: String(op.id || `removed-${index}`).trim(),
        delayMs: index * 120,
    }))
    .filter((item) => item.id));
const removedElements = computed<TavernMapElement[]>(() => {
    const source = Array.isArray(activePatch.value?.removedElements) ? activePatch.value?.removedElements : [];
    return source.filter((item): item is TavernMapElement => !!item && typeof item === 'object' && !Array.isArray(item) && typeof (item as TavernMapElement).id === 'string');
});

const presentationTransform = computed(() => getTavernMapPresentationTransform(activeMapDocument.value));
const baseViewBoxArray = computed<[number, number, number, number]>(() => presentationTransform.value.viewBox);
const viewBoxArray = computed<[number, number, number, number]>(() => {
    const [x, y, width, height] = baseViewBoxArray.value;
    const [offsetX, offsetY] = mapPanOffset.value;
    const zoom = Math.max(0.5, Math.min(4, mapZoom.value));
    const zoomedWidth = width / zoom;
    const zoomedHeight = height / zoom;
    return [
        Number((x + offsetX + (width - zoomedWidth) / 2).toFixed(2)),
        Number((y + offsetY + (height - zoomedHeight) / 2).toFixed(2)),
        Number(zoomedWidth.toFixed(2)),
        Number(zoomedHeight.toFixed(2)),
    ];
});
const viewBox = computed(() => viewBoxArray.value.join(' '));
const mapZoomLabel = computed(() => `${Math.round(mapZoom.value * 100)}%`);
const theme = computed(() => String(activeMapDocument.value?.meta?.theme || 'parchment'));
const title = computed(() => String(replayMode.value === 'timeline'
    ? activeMapDocument.value?.meta?.name || selectedDocumentRecord.value?.title || '地图'
    : selectedDocumentRecord.value?.title || activeMapDocument.value?.meta?.name || '地图'));
const digest = computed(() => String(selectedDocumentRecord.value?.digest || ''));
const revisionLabel = computed(() => activeTimelineFrame.value && replayMode.value === 'timeline'
    ? `revision ${activeTimelineFrame.value.revision}`
    : selectedDocumentRecord.value ? `revision ${selectedDocumentRecord.value.revision}` : 'no map');
const patchLabel = computed(() => activePatch.value?.summary || (activePatch.value ? `revision ${activePatch.value.revision}` : '等待空间变化'));
const badgeModeLabel = computed(() => (
    replayMode.value === 'full'
        ? '完整重绘'
        : replayMode.value === 'timeline'
            ? `回合 ${timelineLabel.value}`
            : '地图更新'
));
function userFacingDigestLine(line = '') {
    const text = String(line || '').trim();
    if (!text) {return '';}
    if (/^(氛围|材质)：/.test(text)) {return '';}
    return text;
}
const digestLines = computed(() => digest.value.split('\n').map(userFacingDigestLine).filter(Boolean).slice(0, 4));
const elementCount = computed(() => activeMapDocument.value?.elements.length || 0);
const totalPatchCount = computed(() => selectedDocPatches.value.length);
const mapDocuments = computed(() => Array.isArray(props.documents) && props.documents.length
    ? props.documents
    : props.document ? [{ ...props.document, active: true }] : []);
const normalizedPlayerDisplayName = computed(() => String(props.playerDisplayName || '').trim() || 'User');
const normalizedPlayerAvatarUrl = computed(() => String(props.playerAvatarUrl || '').trim());
const timelineLabel = computed(() => activeTimelineFrame.value ? `${activeTimelineFrame.value.index + 1} / ${timelineFrames.value.length}` : '0 / 0');
const hasRenderableMap = computed(() => isRenderableMapDocument(activeMapDocument.value));
const showMapBadge = computed(() => !!activePatch.value);
const sceneSurfaceElement = computed(() => getTavernMapSceneSurfaceElement(activeMapDocument.value));
const sceneSurfaceElementId = computed(() => String(sceneSurfaceElement.value?.id || '').trim());
const sceneSurface = computed<MapSceneSurface | null>(() => {
    const element = sceneSurfaceElement.value;
    if (!element) {return null;}
    const [x, y, width, height] = viewBoxArray.value;
    return {
        elementId: element.id,
        x,
        y,
        width,
        height,
        fill: scopeSvgUrl(getTavernMapSceneSurfaceFill(element)),
        style: {
            opacity: getTavernMapSceneSurfaceOpacity(element),
        },
    };
});
const mapCanvasStyle = computed<CSSProperties>(() => {
    const background = getTavernMapSceneSurfaceBackground(sceneSurfaceElement.value);
    return background ? { background } : {};
});

function mapVisualContext(): TavernMapElementVisualContext {
    return {
        surfaceElementId: sceneSurfaceElementId.value,
        surfaceMaterial: String(sceneSurfaceElement.value?.material || '').trim(),
    };
}

watch(() => props.document?.revision, () => {
    replayMode.value = 'patch';
    clearTimelineTimer();
    timelineIndex.value = Math.max(0, timelineFrames.value.length - 1);
    replayKey.value += 1;
    mapBadgeExpanded.value = false;
});

watch(() => [props.selectedDocId, props.activeDocId, props.document?.docId, props.documents.length] as const, () => {
    const next = String(props.selectedDocId || localSelectedDocId.value || props.activeDocId || props.document?.docId || '').trim();
    const exists = mapDocuments.value.some((document) => document.docId === next);
    const resolved = exists ? next : String(props.activeDocId || props.document?.docId || mapDocuments.value[0]?.docId || '').trim();
    const previous = localSelectedDocId.value;
    localSelectedDocId.value = resolved;
    if (previous && resolved && previous !== resolved) {
        resetMapPan();
    }
    if (resolved && resolved !== props.selectedDocId) {
        emit('update:selectedDocId', resolved);
    }
}, { immediate: true });

watch(() => selectedDocPatches.value.length, () => {
    if (timelineIndex.value >= timelineFrames.value.length) {
        timelineIndex.value = Math.max(0, timelineFrames.value.length - 1);
    }
    if (replayMode.value === 'timeline' && !canReplayTimeline.value) {
        replayMode.value = 'patch';
        clearTimelineTimer();
    }
    mapBadgeExpanded.value = false;
});

onBeforeUnmount(() => {
    clearTimelineTimer();
});

function clearTimelineTimer() {
    if (timelineTimer !== undefined) {
        window.clearTimeout(timelineTimer);
        timelineTimer = undefined;
    }
}

function resetMapPan() {
    mapPanOffset.value = [0, 0];
    mapZoom.value = 1;
    mapDrag.value = null;
}

function redrawMapRenderLayer() {
    svgDefsNonce.value += 1;
    replayKey.value += 1;
}

function setMapZoom(nextZoom: number, anchor?: { clientX: number; clientY: number }) {
    const svg = mapSvgRef.value;
    const bounds = svg?.getBoundingClientRect();
    const [oldX, oldY, oldWidth, oldHeight] = viewBoxArray.value;
    const [baseX, baseY, baseWidth, baseHeight] = baseViewBoxArray.value;
    const clampedZoom = Number(Math.max(0.5, Math.min(4, nextZoom)).toFixed(2));
    if (clampedZoom === mapZoom.value) {return;}

    let anchorRatioX = 0.5;
    let anchorRatioY = 0.5;
    if (anchor && bounds && bounds.width > 0 && bounds.height > 0) {
        anchorRatioX = Math.max(0, Math.min(1, (anchor.clientX - bounds.left) / bounds.width));
        anchorRatioY = Math.max(0, Math.min(1, (anchor.clientY - bounds.top) / bounds.height));
    }
    const anchorMapX = oldX + oldWidth * anchorRatioX;
    const anchorMapY = oldY + oldHeight * anchorRatioY;
    const nextWidth = baseWidth / clampedZoom;
    const nextHeight = baseHeight / clampedZoom;
    mapZoom.value = clampedZoom;
    mapPanOffset.value = [
        Number((anchorMapX - nextWidth * anchorRatioX - baseX - (baseWidth - nextWidth) / 2).toFixed(2)),
        Number((anchorMapY - nextHeight * anchorRatioY - baseY - (baseHeight - nextHeight) / 2).toFixed(2)),
    ];
}

function zoomMapBy(step: number) {
    setMapZoom(mapZoom.value + step);
}

function numberPair(value: unknown, fallback: [number, number] = [0, 0]): [number, number] {
    if (!Array.isArray(value) || value.length < 2) {return fallback;}
    const left = Number(value[0]);
    const right = Number(value[1]);
    return Number.isFinite(left) && Number.isFinite(right) ? [left, right] : fallback;
}

function projectMapPoint(point: [number, number]): [number, number] {
    return projectTavernMapPresentationPoint(point, presentationTransform.value);
}

function shouldScaleLocalGeometry(element: TavernMapElement): boolean {
    return ['terrain', 'wall'].includes(String(element.cat || '').trim());
}

function absolutePoints(element: TavernMapElement, points: Array<[number, number]>): Array<[number, number]> {
    return points.map(([dx, dy]) => projectMapPoint([element.at[0] + dx, element.at[1] + dy]));
}

function pointsToPath(points: Array<[number, number]>, closed = false): string {
    if (!Array.isArray(points) || points.length < 2) {return '';}
    const path = [`M ${points[0][0]} ${points[0][1]}`, ...points.slice(1).map(([x, y]) => `L ${x} ${y}`)];
    if (closed) {path.push('Z');}
    return path.join(' ');
}

function curveToPath(points: Array<[number, number]>, closed = false): string {
    if (!Array.isArray(points) || points.length < 2) {return '';}
    if (points.length === 2) {return pointsToPath(points, closed);}
    const tension = 0.3;
    const path = [`M ${points[0][0]} ${points[0][1]}`];
    for (let index = 0; index < points.length - 1; index += 1) {
        const p0 = points[Math.max(index - 1, 0)];
        const p1 = points[index];
        const p2 = points[index + 1];
        const p3 = points[Math.min(index + 2, points.length - 1)];
        path.push(`C ${p1[0] + (p2[0] - p0[0]) * tension} ${p1[1] + (p2[1] - p0[1]) * tension}, ${p2[0] - (p3[0] - p1[0]) * tension} ${p2[1] - (p3[1] - p1[1]) * tension}, ${p2[0]} ${p2[1]}`);
    }
    if (closed) {path.push('Z');}
    return path.join(' ');
}

function rectToPath(element: TavernMapElement): string {
    const [rawX, rawY] = element.at;
    const [width, height] = numberPair(element.rect, [10, 10]);
    if (shouldScaleLocalGeometry(element)) {
        const [left, top] = projectMapPoint([rawX, rawY]);
        const [right, bottom] = projectMapPoint([rawX + width, rawY + height]);
        const x = Math.min(left, right);
        const y = Math.min(top, bottom);
        const nextWidth = Math.abs(right - left);
        const nextHeight = Math.abs(bottom - top);
        return `M ${x} ${y} L ${x + nextWidth} ${y} L ${x + nextWidth} ${y + nextHeight} L ${x} ${y + nextHeight} Z`;
    }
    const [centerX, centerY] = projectMapPoint([rawX + width / 2, rawY + height / 2]);
    const x = Number((centerX - width / 2).toFixed(2));
    const y = Number((centerY - height / 2).toFixed(2));
    return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
}

function circlePathAt(cx: number, cy: number, radius: number): string {
    const r = Number.isFinite(radius) && radius > 0 ? radius : 8;
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy}`;
}

function circleToPath(element: TavernMapElement): string {
    const [cx, cy] = projectMapPoint(element.at);
    const radius = Number(element.circle || 8);
    const scale = shouldScaleLocalGeometry(element) ? presentationTransform.value.scale : 1;
    return circlePathAt(cx, cy, Number.isFinite(radius) && radius > 0 ? radius * scale : 8);
}

function iconToPath(element: TavernMapElement): string {
    const [x, y] = projectMapPoint(element.at);
    return circlePathAt(x, y, TAVERN_MAP_MATERIAL_SYMBOL_SIZE / 2);
}

function elementPath(element: TavernMapElement): string {
    if (element.rect) {return rectToPath(element);}
    if (typeof element.circle === 'number') {return circleToPath(element);}
    if (element.path) {return pointsToPath(absolutePoints(element, element.path), element.closed === true);}
    if (element.curve) {return curveToPath(absolutePoints(element, element.curve), element.closed === true);}
    if (isIconShapeElement(element)) {return iconToPath(element);}
    return '';
}

function elementColor(element: TavernMapElement): string {
    return tavernMapElementColor(element, mapVisualContext());
}

function hasAreaShape(element: TavernMapElement): boolean {
    return tavernMapElementHasAreaShape(element);
}

function certaintyOpacity(element: TavernMapElement): number {
    if (element.certainty === 'unknown') {return 0.48;}
    if (element.certainty === 'inferred') {return 0.68;}
    return 1;
}

function elementFill(element: TavernMapElement): string {
    return tavernMapElementFill(element, mapVisualContext());
}

function elementBlend(element: TavernMapElement): MapBlendMode {
    return tavernMapElementBlend(element, mapVisualContext());
}

function strokeWidth(element: TavernMapElement): number {
    return tavernMapElementStrokeWidth(element);
}

function dashArray(element: TavernMapElement): string {
    return String(element.style?.dash || '');
}

function estimatePathLength(element: TavernMapElement, path: string): number {
    if (typeof element.circle === 'number') {
        return Math.max(32, Math.PI * 2 * element.circle);
    }
    if (element.rect) {
        return Math.max(40, Math.abs(element.rect[0]) * 2 + Math.abs(element.rect[1]) * 2);
    }
    const coordinates = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    let length = 0;
    for (let index = 0; index + 3 < coordinates.length; index += 2) {
        const dx = coordinates[index + 2] - coordinates[index];
        const dy = coordinates[index + 3] - coordinates[index + 1];
        length += Math.hypot(dx, dy);
    }
    return Math.max(28, Math.min(2400, length || 180));
}

function opKindFor(element: TavernMapElement): MapOpKind {
    if (replayMode.value === 'full') {return 'add';}
    return latestOpById.value.get(element.id) || (latestChangedIds.value.has(element.id) ? 'modify' : 'stable');
}

function mergeBounds(left: TavernMapBounds | null, right: TavernMapBounds | null): TavernMapBounds | null {
    if (!left) {return right;}
    if (!right) {return left;}
    const minX = Math.min(left.minX, right.minX);
    const minY = Math.min(left.minY, right.minY);
    const maxX = Math.max(left.maxX, right.maxX);
    const maxY = Math.max(left.maxY, right.maxY);
    return {
        minX,
        minY,
        maxX,
        maxY,
        width: Math.max(0, maxX - minX),
        height: Math.max(0, maxY - minY),
    };
}

function mapBodyBounds(): TavernMapBounds | null {
    return (activeMapDocument.value?.elements || []).reduce<TavernMapBounds | null>((bounds, item) => {
        if (item.text || String(item.cat || '') === 'label') {return bounds;}
        return mergeBounds(bounds, sourceBoundsForDerivedLabel(item));
    }, null);
}

function sourceIconRadiusForDerivedLabel(source: TavernMapElement): number {
    if (isPlayerActorElement(source) && normalizedPlayerAvatarUrl.value) {return 12;}
    if (!isIconShapeElement(source)) {return 10;}
    return TAVERN_MAP_MATERIAL_SYMBOL_SIZE / 2;
}

function sourceBoundsForDerivedLabel(source: TavernMapElement): TavernMapBounds | null {
    if (String(source.cat || '').trim() === 'light' || materialEntry(source.material)?.layer === 'light') {
        const [cx, cy] = projectMapPoint(source.at);
        const radius = 4;
        return {
            minX: cx - radius,
            minY: cy - radius,
            maxX: cx + radius,
            maxY: cy + radius,
            width: radius * 2,
            height: radius * 2,
        };
    }
    if (source.rect) {
        const [rawX, rawY] = source.at;
        const [width, height] = numberPair(source.rect, [10, 10]);
        if (shouldScaleLocalGeometry(source)) {
            const [left, top] = projectMapPoint([rawX, rawY]);
            const [right, bottom] = projectMapPoint([rawX + width, rawY + height]);
            return {
                minX: Math.min(left, right),
                minY: Math.min(top, bottom),
                maxX: Math.max(left, right),
                maxY: Math.max(top, bottom),
                width: Math.abs(right - left),
                height: Math.abs(bottom - top),
            };
        }
        const [centerX, centerY] = projectMapPoint([rawX + width / 2, rawY + height / 2]);
        return {
            minX: centerX - width / 2,
            minY: centerY - height / 2,
            maxX: centerX + width / 2,
            maxY: centerY + height / 2,
            width,
            height,
        };
    }
    if (typeof source.circle === 'number') {
        const [cx, cy] = projectMapPoint(source.at);
        const scale = shouldScaleLocalGeometry(source) ? presentationTransform.value.scale : 1;
        const radius = Math.max(1, Number(source.circle || 8) * scale);
        return {
            minX: cx - radius,
            minY: cy - radius,
            maxX: cx + radius,
            maxY: cy + radius,
            width: radius * 2,
            height: radius * 2,
        };
    }
    if (source.path || source.curve) {
        const points = source.path || source.curve || [];
        return points.reduce<TavernMapBounds | null>((bounds, [dx, dy]) => {
            const [x, y] = projectMapPoint([source.at[0] + dx, source.at[1] + dy]);
            const pointBounds: TavernMapBounds = { minX: x, minY: y, maxX: x, maxY: y, width: 0, height: 0 };
            return mergeBounds(bounds, pointBounds);
        }, null);
    }
    const [cx, cy] = projectMapPoint(source.at);
    const radius = sourceIconRadiusForDerivedLabel(source);
    return {
        minX: cx - radius,
        minY: cy - radius,
        maxX: cx + radius,
        maxY: cy + radius,
        width: radius * 2,
        height: radius * 2,
    };
}

function derivedLabelPosition(element: TavernMapElement): [number, number] | null {
    const source = sourceElementForDerivedLabel(element);
    if (!source) {return null;}
    const sourceBounds = sourceBoundsForDerivedLabel(source);
    if (!sourceBounds) {return null;}
    const sourceCenterX = (sourceBounds.minX + sourceBounds.maxX) / 2;
    const actorGap = String(source.cat || '').trim() === 'actor' ? 4 : 6;
    return [
        Number(sourceCenterX.toFixed(2)),
        Number((sourceBounds.minY - actorGap).toFixed(2)),
    ];
}

function labelPosition(element: TavernMapElement): [number, number] {
    const projectedAt = projectMapPoint(element.at);
    if (!element.text || String(element.cat || '') !== 'label') {return projectedAt;}
    const id = String(element.id || '').trim().toLowerCase();
    if (id.startsWith('__label__')) {return derivedLabelPosition(element) || projectedAt;}
    const [viewX, viewY, viewWidth, viewHeight] = viewBoxArray.value;
    const topGuard = viewY + Math.max(72, viewHeight * 0.26);
    if (!['label', 'room-label', 'scene-label', 'place-label', 'map-label'].includes(id) || projectedAt[1] >= topGuard) {
        return projectedAt;
    }
    const bodyBounds = mapBodyBounds();
    const left = (bodyBounds?.minX ?? viewX) + 24;
    const right = (bodyBounds?.maxX ?? viewX + viewWidth) - 24;
    const bodyTop = bodyBounds ? bodyBounds.minY + Math.min(90, Math.max(42, bodyBounds.height * 0.22)) : topGuard;
    const y = Math.max(topGuard, bodyTop);
    return [
        Math.min(right, Math.max(left, projectedAt[0])),
        Math.min(viewY + viewHeight - 24, y),
    ];
}

function labelFontSize(element: TavernMapElement): number {
    if (!element.text || String(element.cat || '') !== 'label') {return 14;}
    const id = String(element.id || '').trim().toLowerCase();
    if (id.startsWith('__label__')) {return 14;}
    if (['label', 'room-label', 'scene-label', 'place-label', 'map-label'].includes(id)) {return 13;}
    return 14;
}

function sourceElementForDerivedLabel(element: TavernMapElement): TavernMapElement | null {
    const id = String(element.id || '');
    if (!id.startsWith('__label__')) {return null;}
    const sourceId = id.slice('__label__'.length);
    return (activeMapDocument.value?.elements || []).find((item) => item.id === sourceId) || null;
}

function isPlayerActorElement(element: TavernMapElement | null | undefined): boolean {
    return String(element?.cat || '').trim().toLowerCase() === 'actor'
        && String(element?.actorKey || element?.id || '').trim().toLowerCase() === 'player';
}

function isIconShapeElement(element: TavernMapElement | null | undefined): boolean {
    return element?.shape === 'icon' || !!element?.icon;
}

function materialSymbolGlyphText(symbolIcon = ''): string {
    if (props.materialSymbolsReady) {return symbolIcon;}
    if (props.materialSymbolsStatus === 'failed') {return '!';}
    return '';
}

function displayTextForElement(element: TavernMapElement): string {
    if (isPlayerActorElement(element)) {
        return normalizedPlayerDisplayName.value;
    }
    const source = sourceElementForDerivedLabel(element);
    if (source && isPlayerActorElement(source)) {
        return normalizedPlayerDisplayName.value;
    }
    return String(element.text || '');
}

function labelLayoutPriority(item: MapRenderItem): number {
    const source = sourceElementForDerivedLabel(item.element);
    const cat = String(source?.cat || item.element.cat || '').trim().toLowerCase();
    const actorKey = String(source?.actorKey || source?.id || item.element.id || '').trim().toLowerCase();
    const id = String(item.element.id || '').trim().toLowerCase();
    if (cat === 'actor' && actorKey === 'player') {return 0;}
    if (cat === 'actor') {return 1;}
    if (['danger', 'decoration', 'door', 'marker', 'magic', 'secret'].includes(cat)) {return 2;}
    if (id.startsWith('__label__')) {return 3;}
    if (['label', 'room-label', 'scene-label', 'place-label', 'map-label'].includes(id)) {return 5;}
    return 4;
}

function buildRenderItemsForElement(element: TavernMapElement, index: number, forcedOpKind?: MapOpKind): MapRenderItem[] {
    if (!getTavernMapElementBounds(element)) {return [];}
    const opKind = forcedOpKind || opKindFor(element);
    const material = materialEntry(element.material);
    const baseOpacity = (material?.opacity ?? 1) * certaintyOpacity(element);
    const baseBlend = elementBlend(element);
    const z = zOf(element.cat, element.material);
    const baseDelay = forcedOpKind === 'remove'
        ? index * 110
        : replayMode.value === 'full'
            ? index * 115
            : opKind === 'stable' ? 0 : index * 30;
    const isPlayer = isPlayerActorElement(element);

    if (element.text) {
        const [labelX, labelY] = labelPosition(element);
        const text = displayTextForElement(element);
        if (!text) {return [];}
        return [{
            element,
            id: `${element.id}-label`,
            layer: 'label',
            path: '',
            color: forcedOpKind === 'remove' ? '#b94035' : elementColor(element),
            fill: 'none',
            blend: 'normal',
            opacity: certaintyOpacity(element),
            z,
            strokeWidth: 0,
            dash: '',
            delayMs: baseDelay,
            durationMs: 900,
            length: 60,
            opKind,
            text,
            x: labelX,
            y: labelY,
            fontSize: labelFontSize(element),
            anchor: 'middle',
            transform: '',
            fillRule: 'nonzero',
        }];
    }

    const path = elementPath(element);
    if (!path) {return [];}
    const symbolIcon = isIconShapeElement(element) ? resolveMapElementIconName(element.icon, {
        kind: element.kind,
        cat: element.cat,
        actorKey: element.actorKey,
    }) : '';
    const length = symbolIcon ? 120 : estimatePathLength(element, path);
    const durationMs = forcedOpKind === 'remove' ? 1050 : Math.max(680, Math.min(2200, length * 4.2));
    const color = forcedOpKind === 'remove' ? '#b94035' : elementColor(element);
    const fill = forcedOpKind === 'remove'
        ? (hasAreaShape(element) ? 'rgba(185, 64, 53, 0.16)' : 'none')
        : elementFill(element);
    const items: MapRenderItem[] = [];
    if (material?.layer === 'light' && forcedOpKind !== 'remove' && hasAreaShape(element)) {
        items.push({
            element,
            id: `${element.id}-light`,
            layer: 'light',
            path,
            color,
            fill: material.paint,
            blend: baseBlend,
            opacity: baseOpacity,
            z,
            strokeWidth: 0,
            dash: '',
            delayMs: baseDelay,
            durationMs,
            length,
            opKind,
            text: '',
            x: 0,
            y: 0,
            fontSize: 0,
            anchor: 'middle',
            transform: '',
            fillRule: 'nonzero',
        });
        return items;
    }
    if (isPlayer && normalizedPlayerAvatarUrl.value && forcedOpKind !== 'remove') {
        const avatarRadius = 12;
        const outlineRadius = 13.25;
        const avatarSize = avatarRadius * 2;
        const [avatarCenterX, avatarCenterY] = projectMapPoint(element.at);
        const avatarX = avatarCenterX - avatarRadius;
        const avatarY = avatarCenterY - avatarRadius;
        const avatarClipId = `map-avatar-${index}-${svgLocalId(String(element.id || 'player'))}`;
        items.push({
            element,
            id: `${element.id}-avatar`,
            layer: 'avatar',
            path: circlePathAt(avatarCenterX, avatarCenterY, avatarRadius),
            color,
            fill: 'none',
            blend: 'normal',
            opacity: certaintyOpacity(element),
            z,
            strokeWidth: 0,
            dash: '',
            delayMs: baseDelay,
            durationMs,
            length: Math.max(48, Math.PI * 2 * avatarRadius),
            opKind,
            text: '',
            x: 0,
            y: 0,
            fontSize: 0,
            anchor: 'middle',
            transform: '',
            fillRule: 'nonzero',
            avatarHref: normalizedPlayerAvatarUrl.value,
            avatarClipId,
            avatarX,
            avatarY,
            avatarSize,
        });
        items.push({
            element,
            id: `${element.id}-player-outline`,
            layer: 'avatar',
            path: circlePathAt(avatarCenterX, avatarCenterY, outlineRadius),
            color: '#18120f',
            fill: 'none',
            blend: 'normal',
            opacity: 0.86 * certaintyOpacity(element),
            z,
            strokeWidth: 1.15,
            dash: '3 2',
            delayMs: baseDelay,
            durationMs,
            length: Math.max(48, Math.PI * 2 * outlineRadius),
            opKind,
            text: '',
            x: 0,
            y: 0,
            fontSize: 0,
            anchor: 'middle',
            transform: '',
            fillRule: 'nonzero',
        });
        return items;
    }
    if (symbolIcon) {
        const [symbolX, symbolY] = projectMapPoint(element.at);
        items.push({
            element,
            id: `${element.id}-symbol`,
            layer: 'line',
            path,
            color,
            fill: color,
            blend: 'normal',
            opacity: certaintyOpacity(element),
            z,
            strokeWidth: 0,
            dash: '',
            delayMs: baseDelay,
            durationMs,
            length,
            opKind,
            text: symbolIcon,
            x: symbolX,
            y: symbolY,
            fontSize: TAVERN_MAP_MATERIAL_SYMBOL_SIZE,
            anchor: 'middle',
            transform: '',
            symbolIcon,
            fillRule: 'nonzero',
        });
        return items;
    }
    if (fill !== 'none') {
        items.push({
            element,
            id: `${element.id}-fill`,
            layer: 'fill',
            path,
            color,
            fill,
            blend: baseBlend,
            opacity: baseOpacity,
            z,
            strokeWidth: 0,
            dash: '',
            delayMs: baseDelay,
            durationMs,
            length,
            opKind,
            text: '',
            x: 0,
            y: 0,
            fontSize: 0,
            anchor: 'middle',
            transform: '',
            fillRule: 'nonzero',
        });
    }
    const casing = forcedOpKind === 'remove' ? null : tavernMapElementLineCasing(element);
    if (casing) {
        items.push({
            element,
            id: `${element.id}-line-casing`,
            layer: 'line',
            path,
            color: casing.color,
            fill: 'none',
            blend: 'normal',
            opacity: casing.opacity * certaintyOpacity(element),
            z,
            strokeWidth: casing.width,
            dash: dashArray(element),
            delayMs: baseDelay,
            durationMs,
            length,
            opKind,
            text: '',
            x: 0,
            y: 0,
            fontSize: 0,
            anchor: 'middle',
            transform: '',
            fillRule: 'nonzero',
            role: 'line-casing',
        });
    }
    items.push({
        element,
        id: `${element.id}-line`,
        layer: 'line',
        path,
        color,
        fill: 'none',
        blend: 'normal',
        opacity: certaintyOpacity(element),
        z,
        strokeWidth: strokeWidth(element),
        dash: dashArray(element),
        delayMs: baseDelay,
        durationMs,
        length,
        opKind,
        text: '',
        x: 0,
        y: 0,
        fontSize: 0,
        anchor: 'middle',
        transform: '',
        fillRule: 'nonzero',
        role: 'line-core',
    });
    if (isPlayer) {
        const ringRadius = isIconShapeElement(element) ? 18 : typeof element.circle === 'number' ? element.circle + 5 : 16;
        items.push({
            element,
            id: `${element.id}-player-outline`,
            layer: 'avatar',
            path: circleToPath({ ...element, circle: ringRadius }),
            color: '#18120f',
            fill: 'none',
            blend: 'normal',
            opacity: 0.72 * certaintyOpacity(element),
            z,
            strokeWidth: 1.15,
            dash: '3 2',
            delayMs: baseDelay,
            durationMs,
            length: Math.max(48, Math.PI * 2 * ringRadius),
            opKind,
            text: '',
            x: 0,
            y: 0,
            fontSize: 0,
            anchor: 'middle',
            transform: '',
            fillRule: 'nonzero',
        });
    }
    return items;
}

const renderItems = computed<MapRenderItem[]>(() => (activeMapDocument.value?.elements || [])
    .flatMap((element, index) => buildRenderItemsForElement(element, index)));
const visibleRenderItems = computed<MapRenderItem[]>(() => {
    const surfaceId = sceneSurfaceElementId.value;
    if (!surfaceId) {return renderItems.value;}
    return renderItems.value.filter((item) => item.element.id !== surfaceId);
});

const fillItems = computed(() => visibleRenderItems.value
    .filter((item) => item.layer === 'fill')
    .sort((left, right) => left.z - right.z || compareMapStableText(left.element.id, right.element.id) || compareMapStableText(left.id, right.id)));
const avatarItems = computed(() => renderItems.value
    .filter((item) => item.layer === 'avatar')
    .sort((left, right) => left.z - right.z || compareMapStableText(left.element.id, right.element.id) || compareMapStableText(left.id, right.id)));
const avatarImageItems = computed<MapAvatarImageItem[]>(() => avatarItems.value.filter((item): item is MapAvatarImageItem => !!item.avatarClipId && !!item.avatarHref));
const avatarPathItems = computed(() => avatarItems.value.filter((item) => !item.avatarHref));
const lineItems = computed(() => visibleRenderItems.value.filter((item) => item.layer === 'line'));
const regularLineItems = computed(() => lineItems.value.filter((item) => !item.symbolIcon));
const regularLineCasingItems = computed(() => regularLineItems.value.filter((item) => item.role === 'line-casing'));
const regularLineCoreItems = computed(() => regularLineItems.value.filter((item) => item.role !== 'line-casing'));
const symbolLineItems = computed(() => lineItems.value.filter((item) => item.symbolIcon));
const lightItems = computed(() => visibleRenderItems.value
    .filter((item) => item.layer === 'light')
    .sort((left, right) => left.z - right.z || compareMapStableText(left.element.id, right.element.id) || compareMapStableText(left.id, right.id)));
const labelItems = computed(() => visibleRenderItems.value.filter((item) => item.layer === 'label'));
const laidOutLabelItems = computed(() => layoutTavernMapLabels(labelItems.value, viewBoxArray.value, {
    priority: labelLayoutPriority,
}));
const removedRenderItems = computed(() => removedElements.value.flatMap((element, index) => buildRenderItemsForElement(element, index, 'remove')));
const removedFillItems = computed(() => removedRenderItems.value.filter((item) => item.layer === 'fill'));
const removedLightItems = computed(() => removedRenderItems.value.filter((item) => item.layer === 'light'));
const removedLineItems = computed(() => removedRenderItems.value.filter((item) => item.layer === 'line'));
const regularRemovedLineItems = computed(() => removedLineItems.value.filter((item) => !item.symbolIcon));
const symbolRemovedLineItems = computed(() => removedLineItems.value.filter((item) => item.symbolIcon));
const removedLabelItems = computed(() => removedRenderItems.value.filter((item) => item.layer === 'label'));
const animatedItems = computed(() => visibleRenderItems.value.filter((item) => replayMode.value === 'full' || item.opKind !== 'stable'));
const totalAnimationMs = computed(() => {
    const animated = animatedItems.value;
    if (!animated.length) {return 1200;}
    return Math.max(...animated.map((item) => item.delayMs + item.durationMs)) + 360;
});
const progressStyle = computed(() => ({
    '--map-progress-duration': `${totalAnimationMs.value}ms`,
}));
const penStyle = computed(() => {
    const animated = pickPenAnimationItem(animatedItems.value);
    if (!animated) {return { display: 'none' };}
    return {
        offsetPath: `path("${animated.path}")`,
        animationDelay: `${animated.delayMs}ms`,
        animationDuration: `${animated.durationMs}ms`,
    };
});

const moodOverlay = computed(() => {
    const mood = String(activeMapDocument.value?.meta?.mood || 'neutral');
    const overlays: Record<string, { fill: string; blend: MapBlendMode; opacity: number }> = {
        warm: { fill: svgUrl('mood-warm'), blend: 'overlay', opacity: 0.34 },
        cold: { fill: svgUrl('mood-cold'), blend: 'multiply', opacity: 0.28 },
        dark: { fill: svgUrl('mood-dark'), blend: 'multiply', opacity: 0.36 },
        mystic: { fill: svgUrl('mood-mystic'), blend: 'screen', opacity: 0.22 },
        danger: { fill: svgUrl('mood-danger'), blend: 'multiply', opacity: 0.26 },
        calm: { fill: svgUrl('mood-calm'), blend: 'screen', opacity: 0.18 },
    };
    const overlay = overlays[mood];
    if (!overlay) {return null;}
    const [x, y, width, height] = viewBoxArray.value;
    const style: CSSProperties = {
        opacity: overlay.opacity,
        mixBlendMode: overlay.blend,
    };
    return { ...overlay, x, y, width, height, style };
});

const vignetteOverlay = computed(() => {
    const [x, y, width, height] = viewBoxArray.value;
    const style: CSSProperties = {
        mixBlendMode: 'multiply',
    };
    return { x, y, width, height, fill: svgUrl('map-vignette-radial'), style };
});

function scheduleTimelineNext() {
    clearTimelineTimer();
    if (replayMode.value !== 'timeline' || !canReplayTimeline.value || timelineFrames.value.length <= 1) {return;}
    void nextTick(() => {
        timelineTimer = window.setTimeout(() => {
            if (replayMode.value !== 'timeline') {return;}
            timelineIndex.value = timelineIndex.value + 1 >= timelineFrames.value.length ? 0 : timelineIndex.value + 1;
            replayKey.value += 1;
            scheduleTimelineNext();
        }, totalAnimationMs.value + 420);
    });
}

function itemStyle(item: MapRenderItem) {
    return {
        '--map-delay': `${item.delayMs}ms`,
        '--map-duration': `${item.durationMs}ms`,
        '--map-length': `${item.length}`,
        opacity: item.opacity,
        mixBlendMode: item.blend === 'normal' ? undefined : item.blend,
    } as CSSProperties & Record<string, string | number | undefined>;
}

function itemClass(item: MapRenderItem) {
    return [
        'map-element',
        item.symbolIcon ? 'map-material-symbol' : `map-${item.layer}`,
        item.role ? `role-${item.role}` : '',
        `cat-${item.element.cat || 'wall'}`,
        `op-${item.opKind}`,
        {
            'is-animated': replayMode.value === 'full' || item.opKind !== 'stable',
            'is-latest': latestChangedIds.value.has(item.element.id),
            'is-material-symbol': !!item.symbolIcon,
        },
    ];
}

function replayLatestPatch() {
    clearTimelineTimer();
    replayMode.value = 'patch';
    replayKey.value += 1;
    resetMapPan();
}

function replayFullMap() {
    clearTimelineTimer();
    replayMode.value = 'full';
    replayKey.value += 1;
    resetMapPan();
}

function replayTimeline() {
    if (!canReplayTimeline.value) {return;}
    replayMode.value = 'timeline';
    timelineIndex.value = 0;
    replayKey.value += 1;
    resetMapPan();
    scheduleTimelineNext();
}

function stepTimeline(offset: number) {
    clearTimelineTimer();
    replayMode.value = 'timeline';
    if (!canReplayTimeline.value) {return;}
    const length = timelineFrames.value.length;
    if (!length) {return;}
    timelineIndex.value = (timelineIndex.value + offset + length) % length;
    replayKey.value += 1;
    resetMapPan();
}

function toggleMapBadge() {
    mapBadgeExpanded.value = !mapBadgeExpanded.value;
}

function collapseMapBadge() {
    mapBadgeExpanded.value = false;
}

function handleSelectedDocChange(event: Event) {
    const target = event.target instanceof HTMLSelectElement ? event.target : null;
    localSelectedDocId.value = String(target?.value || '').trim();
    emit('update:selectedDocId', localSelectedDocId.value);
    replayMode.value = 'patch';
    clearTimelineTimer();
    replayKey.value += 1;
    resetMapPan();
}

function handleMapPointerDown(event: PointerEvent) {
    const svg = event.currentTarget instanceof SVGSVGElement ? event.currentTarget : mapSvgRef.value;
    if (!svg || event.button !== 0) {return;}
    const bounds = svg.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) {return;}
    const [, , viewWidth, viewHeight] = viewBoxArray.value;
    const [startPanX, startPanY] = mapPanOffset.value;
    mapDrag.value = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPanX,
        startPanY,
        viewWidth,
        viewHeight,
        clientWidth: bounds.width,
        clientHeight: bounds.height,
    };
    svg.setPointerCapture(event.pointerId);
}

function handleMapPointerMove(event: PointerEvent) {
    const drag = mapDrag.value;
    if (!drag || drag.pointerId !== event.pointerId) {return;}
    const deltaX = -((event.clientX - drag.startClientX) / drag.clientWidth) * drag.viewWidth;
    const deltaY = -((event.clientY - drag.startClientY) / drag.clientHeight) * drag.viewHeight;
    mapPanOffset.value = [
        Number((drag.startPanX + deltaX).toFixed(2)),
        Number((drag.startPanY + deltaY).toFixed(2)),
    ];
}

function handleMapPointerEnd(event: PointerEvent) {
    const drag = mapDrag.value;
    if (!drag || drag.pointerId !== event.pointerId) {return;}
    const svg = event.currentTarget instanceof SVGSVGElement ? event.currentTarget : mapSvgRef.value;
    if (svg?.hasPointerCapture(event.pointerId)) {
        svg.releasePointerCapture(event.pointerId);
    }
    mapDrag.value = null;
}

function handleMapWheel(event: WheelEvent) {
    if (!mapSvgRef.value) {return;}
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    setMapZoom(mapZoom.value + direction * 0.18, { clientX: event.clientX, clientY: event.clientY });
}
</script>

<template>
  <aside
    class="tavern-map-panel xb-editor"
    :class="{ 'is-compact': compact, 'is-symbol-font-failed': materialSymbolsStatus === 'failed' }"
  >
    <header
      v-if="!compact"
      class="tavern-editor-head xb-editor-head tavern-map-head"
    >
      <div class="tavern-map-title">
        <span class="tavern-map-kicker">LIVE CARTOGRAPHY</span>
        <strong>{{ title }}</strong>
        <span v-if="selectedDocumentRecord">{{ revisionLabel }} · {{ elementCount }} elements</span>
      </div>
      <div class="tavern-editor-actions xb-editor-actions tavern-map-actions">
        <select
          class="tavern-map-select"
          :value="selectedDocumentRecord?.docId || ''"
          :disabled="mapDocuments.length <= 1"
          aria-label="选择地图"
          @change="handleSelectedDocChange"
        >
          <option
            v-for="mapDocumentItem in mapDocuments"
            :key="mapDocumentItem.docId"
            :value="mapDocumentItem.docId"
          >
            {{ mapDocumentItem.active ? '当前 · ' : '' }}{{ mapDocumentItem.title || mapDocumentItem.docId }}
          </option>
        </select>
        <button
          type="button"
          class="tavern-editor-mode-button"
          :class="{ active: replayMode === 'patch' }"
          :disabled="!latestPatch"
          @click="replayLatestPatch"
        >
          最近回合
        </button>
        <button
          type="button"
          class="tavern-editor-mode-button"
          :class="{ active: replayMode === 'full' }"
          :disabled="!hasRenderableMap"
          @click="replayFullMap"
        >
          完整重绘
        </button>
        <button
          type="button"
          class="tavern-editor-mode-button"
          :class="{ active: replayMode === 'timeline' }"
          :disabled="!canReplayTimeline"
          @click="replayTimeline"
        >
          回合回放
        </button>
      </div>
    </header>
    <div
      v-if="hasRenderableMap"
      class="tavern-map-canvas"
      :class="[`theme-${theme}`, `mode-${replayMode}`, { 'is-panning': mapDrag, 'has-scene-surface': sceneSurface }]"
      :style="mapCanvasStyle"
    >
      <div
        v-if="compact"
        class="tavern-map-compact-controls is-floating"
      >
        <select
          class="tavern-map-select"
          :value="selectedDocumentRecord?.docId || ''"
          :disabled="mapDocuments.length <= 1"
          aria-label="选择地图"
          @change="handleSelectedDocChange"
        >
          <option
            v-for="mapDocumentItem in mapDocuments"
            :key="mapDocumentItem.docId"
            :value="mapDocumentItem.docId"
          >
            {{ mapDocumentItem.active ? '当前 · ' : '' }}{{ mapDocumentItem.title || mapDocumentItem.docId }}
          </option>
        </select>
      </div>
      <div
        class="tavern-map-zoom-controls"
        aria-label="地图缩放"
      >
        <button
          type="button"
          aria-label="缩小地图"
          :disabled="mapZoom <= 0.5"
          @click="zoomMapBy(-0.25)"
        >
          -
        </button>
        <button
          type="button"
          class="tavern-map-zoom-value"
          aria-label="重置地图缩放"
          @click="resetMapPan"
        >
          {{ mapZoomLabel }}
        </button>
        <button
          type="button"
          aria-label="放大地图"
          :disabled="mapZoom >= 4"
          @click="zoomMapBy(0.25)"
        >
          +
        </button>
      </div>
      <svg
        ref="mapSvgRef"
        :key="replayKey"
        :viewBox="viewBox"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        :aria-label="title"
        @pointerdown="handleMapPointerDown"
        @pointermove="handleMapPointerMove"
        @pointerup="handleMapPointerEnd"
        @pointercancel="handleMapPointerEnd"
        @dblclick="resetMapPan"
        @wheel="handleMapWheel"
      >
        <defs>
          <filter
            :id="svgDefId('tavern-map-sketch')"
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.025"
              numOctaves="3"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="0.65"
            />
          </filter>
          <filter
            :id="svgDefId('tavern-map-glow')"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur
              stdDeviation="3"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            :id="svgDefId('tavern-map-shadow')"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="2.2"
              flood-color="#05050a"
              flood-opacity="0.42"
            />
          </filter>
          <filter
            :id="svgDefId('tavern-mat-texture')"
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.7"
              numOctaves="3"
              seed="4"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              in="noise"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.055 0"
              result="grain"
            />
            <feBlend
              in="SourceGraphic"
              in2="grain"
              mode="multiply"
            />
          </filter>
          <pattern
            :id="svgDefId('mat-wood')"
            width="40"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="40"
              height="20"
              fill="#4a3018"
            />
            <rect
              x="0"
              y="0"
              width="20"
              height="10"
              fill="#583c22"
            />
            <rect
              x="20"
              y="10"
              width="20"
              height="10"
              fill="#54371e"
            />
            <path
              d="M0 10 H40 M0 20 H40 M20 0 V10 M0 10 V20 M40 10 V20"
              stroke="#1a0e05"
              stroke-width="1.4"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M0 1 H20 M20 11 H40"
              stroke="#74543a"
              stroke-width="0.9"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M3 4 Q8 3 12 5 T18 4 M23 14 Q28 13 32 15 T38 14"
              stroke="#3b2412"
              stroke-width="0.6"
              fill="none"
            />
            <circle
              cx="2"
              cy="2"
              r="0.8"
              fill="#1a0e05"
            />
            <circle
              cx="18"
              cy="2"
              r="0.8"
              fill="#1a0e05"
            />
            <circle
              cx="22"
              cy="12"
              r="0.8"
              fill="#1a0e05"
            />
            <circle
              cx="38"
              cy="12"
              r="0.8"
              fill="#1a0e05"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-stone')"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="48"
              height="48"
              fill="#52535e"
            />
            <path
              d="M0 0 H28 V22 H0 Z"
              fill="#5a5b66"
            />
            <path
              d="M28 0 H48 V26 H28 Z"
              fill="#4d4e58"
            />
            <path
              d="M0 22 H22 V48 H0 Z"
              fill="#4f5059"
            />
            <path
              d="M22 26 H48 V48 H22 Z"
              fill="#585964"
            />
            <path
              d="M28 0 V22 H0 M22 22 V48 M22 26 H48"
              stroke="#2c2d36"
              stroke-width="2"
              fill="none"
            />
            <path
              d="M0 1 H27 M0 23 H21"
              stroke="#73747f"
              stroke-width="0.8"
              opacity="0.6"
              fill="none"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-tile')"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="32"
              height="32"
              fill="#2a2a38"
            />
            <rect
              x="1.5"
              y="1.5"
              width="29"
              height="29"
              rx="2"
              fill="#34344a"
            />
            <path
              d="M1.5 1.5 H30.5 M1.5 1.5 V30.5"
              stroke="#43435e"
              stroke-width="1.2"
              fill="none"
              opacity="0.8"
            />
            <path
              d="M30.5 1.5 V30.5 M1.5 30.5 H30.5"
              stroke="#1c1c28"
              stroke-width="1.2"
              fill="none"
              opacity="0.9"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-carpet')"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="24"
              height="24"
              fill="#7a1f30"
            />
            <rect
              width="24"
              height="24"
              fill="#8a2438"
              opacity="0.5"
            />
            <path
              d="M12 2 L22 12 L12 22 L2 12 Z"
              fill="none"
              stroke="#c9a24a"
              stroke-width="1.2"
              opacity="0.7"
            />
            <path
              d="M12 7 L17 12 L12 17 L7 12 Z"
              fill="#5e1624"
              opacity="0.6"
            />
            <path
              d="M0 0 H24 M0 24 H24"
              stroke="#5e1624"
              stroke-width="1.5"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-bed-sheet')"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="48"
              height="48"
              fill="#e8e3dc"
            />
            <rect
              width="48"
              height="48"
              fill="#f2eee8"
              opacity="0.5"
            />
            <path
              d="M0 14 Q12 8 24 14 T48 14"
              stroke="#d2ccc2"
              stroke-width="3"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M0 30 Q14 36 28 30 T48 32"
              stroke="#d2ccc2"
              stroke-width="3"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M0 12 Q12 6 24 12 T48 12"
              stroke="#fbf8f3"
              stroke-width="1.5"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M0 28 Q14 34 28 28 T48 30"
              stroke="#fbf8f3"
              stroke-width="1.5"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M6 44 Q20 40 34 44 M14 4 Q28 0 42 4"
              stroke="#dcd6cc"
              stroke-width="0.8"
              fill="none"
              opacity="0.4"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-fabric')"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="16"
              height="16"
              fill="#6b5b73"
            />
            <rect
              width="16"
              height="16"
              fill="#74647c"
              opacity="0.4"
            />
            <path
              d="M0 4 H16 M0 12 H16"
              stroke="#5a4b62"
              stroke-width="2"
              opacity="0.5"
            />
            <path
              d="M4 0 V16 M12 0 V16"
              stroke="#5a4b62"
              stroke-width="2"
              opacity="0.5"
            />
            <path
              d="M0 3 H16 M3 0 V16"
              stroke="#857391"
              stroke-width="0.6"
              opacity="0.5"
            />
            <circle
              cx="2"
              cy="2"
              r="0.7"
              fill="#857391"
              opacity="0.5"
            />
            <circle
              cx="10"
              cy="8"
              r="0.7"
              fill="#5a4b62"
              opacity="0.6"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-tatami')"
            width="80"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="80"
              height="40"
              fill="#c9b878"
            />
            <rect
              width="80"
              height="40"
              fill="#d3c282"
              opacity="0.4"
            />
            <path
              d="M0 4 H80 M0 8 H80 M0 12 H80 M0 16 H80 M0 20 H80 M0 24 H80 M0 28 H80 M0 32 H80 M0 36 H80"
              stroke="#b3a268"
              stroke-width="0.8"
              opacity="0.6"
            />
            <path
              d="M0 4 H80 M0 12 H80 M0 20 H80 M0 28 H80 M0 36 H80"
              stroke="#dcca8a"
              stroke-width="0.5"
              opacity="0.5"
            />
            <rect
              x="0"
              y="0"
              width="80"
              height="40"
              fill="none"
              stroke="#2a2620"
              stroke-width="2.5"
            />
            <path
              d="M40 0 V40"
              stroke="#2a2620"
              stroke-width="2.5"
              opacity="0.9"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-sand')"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="40"
              height="40"
              fill="#e0cb96"
            />
            <rect
              width="40"
              height="40"
              fill="#ead7a4"
              opacity="0.4"
            />
            <path
              d="M0 10 Q10 7 20 10 T40 10"
              stroke="#d3bd84"
              stroke-width="1.2"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M0 26 Q12 23 24 26 T40 27"
              stroke="#d3bd84"
              stroke-width="1.2"
              fill="none"
              opacity="0.5"
            />
            <circle
              cx="6"
              cy="6"
              r="0.8"
              fill="#c2a96e"
            />
            <circle
              cx="22"
              cy="14"
              r="0.6"
              fill="#fff"
              opacity="0.7"
            />
            <circle
              cx="30"
              cy="8"
              r="0.7"
              fill="#c2a96e"
            />
            <circle
              cx="14"
              cy="30"
              r="0.8"
              fill="#c2a96e"
            />
            <circle
              cx="34"
              cy="32"
              r="0.6"
              fill="#fff"
              opacity="0.6"
            />
            <circle
              cx="4"
              cy="34"
              r="0.7"
              fill="#c2a96e"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-marble')"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="80"
              height="80"
              fill="#eef0f3"
            />
            <rect
              width="80"
              height="80"
              fill="#f6f7fa"
              opacity="0.5"
            />
            <path
              d="M0 20 Q20 10 35 28 T70 32 Q78 36 80 30"
              stroke="#c2c7d0"
              stroke-width="1.5"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M10 0 Q24 22 18 44 T30 80"
              stroke="#cdd2da"
              stroke-width="1.2"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M50 0 Q58 18 72 24 T80 60"
              stroke="#c2c7d0"
              stroke-width="1"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M0 55 Q22 50 40 62 T80 58"
              stroke="#d6dae1"
              stroke-width="0.8"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M30 30 q8 6 4 16 M60 40 q-6 8 2 14"
              stroke="#b8bdc7"
              stroke-width="0.6"
              fill="none"
              opacity="0.4"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-blood')"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="40"
              height="40"
              fill="#5a0c14"
            />
            <ellipse
              cx="14"
              cy="12"
              rx="11"
              ry="8"
              fill="#3d070e"
            />
            <ellipse
              cx="30"
              cy="28"
              rx="9"
              ry="11"
              fill="#48090f"
            />
            <ellipse
              cx="20"
              cy="22"
              rx="6"
              ry="4"
              fill="#6e1018"
              opacity="0.7"
            />
            <circle
              cx="34"
              cy="8"
              r="2"
              fill="#3d070e"
            />
            <circle
              cx="6"
              cy="32"
              r="2.5"
              fill="#3d070e"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-water')"
            width="44"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="44"
              height="24"
              fill="#1f5f7a"
            />
            <rect
              width="44"
              height="24"
              fill="#2a7396"
              opacity="0.5"
            />
            <path
              d="M0 6 Q11 2 22 6 T44 6"
              stroke="#7fd0e8"
              stroke-width="1.2"
              fill="none"
              opacity="0.55"
            />
            <path
              d="M0 16 Q11 12 22 16 T44 16"
              stroke="#5bb6d6"
              stroke-width="1"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M0 21 Q11 18 22 21 T44 21"
              stroke="#9fe0f2"
              stroke-width="0.8"
              fill="none"
              opacity="0.3"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-grass')"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="28"
              height="28"
              fill="#2f5226"
            />
            <rect
              width="28"
              height="28"
              fill="#37602c"
              opacity="0.5"
            />
            <path
              d="M4 26 Q3 18 5 14 M4 26 Q6 19 8 16"
              stroke="#4a7a38"
              stroke-width="1.1"
              fill="none"
            />
            <path
              d="M16 28 Q15 20 17 15 M16 28 Q18 21 21 17"
              stroke="#3f6b30"
              stroke-width="1.1"
              fill="none"
            />
            <path
              d="M24 26 Q23 20 25 16"
              stroke="#54883f"
              stroke-width="1"
              fill="none"
            />
            <circle
              cx="10"
              cy="8"
              r="1"
              fill="#54883f"
              opacity="0.6"
            />
            <circle
              cx="22"
              cy="6"
              r="1"
              fill="#4a7a38"
              opacity="0.6"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-dirt')"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="36"
              height="36"
              fill="#5a4226"
            />
            <rect
              width="36"
              height="36"
              fill="#634a2c"
              opacity="0.4"
            />
            <circle
              cx="8"
              cy="10"
              r="2"
              fill="#6e5536"
              opacity="0.7"
            />
            <circle
              cx="26"
              cy="14"
              r="1.6"
              fill="#4a3420"
              opacity="0.8"
            />
            <circle
              cx="16"
              cy="26"
              r="2.4"
              fill="#6e5536"
              opacity="0.6"
            />
            <circle
              cx="31"
              cy="30"
              r="1.3"
              fill="#4a3420"
            />
            <circle
              cx="4"
              cy="28"
              r="1.2"
              fill="#73593a"
              opacity="0.6"
            />
            <path
              d="M12 6 q4 2 8 1 M20 32 q4 1 8 -1"
              stroke="#4a3420"
              stroke-width="0.8"
              fill="none"
              opacity="0.5"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-snow')"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="36"
              height="36"
              fill="#dfe7f0"
            />
            <ellipse
              cx="12"
              cy="14"
              rx="9"
              ry="6"
              fill="#c4d2e2"
              opacity="0.6"
            />
            <ellipse
              cx="28"
              cy="26"
              rx="8"
              ry="5"
              fill="#cdd9e8"
              opacity="0.5"
            />
            <circle
              cx="6"
              cy="6"
              r="1"
              fill="#fff"
            />
            <circle
              cx="22"
              cy="8"
              r="1.2"
              fill="#fff"
            />
            <circle
              cx="30"
              cy="14"
              r="0.9"
              fill="#fff"
            />
            <circle
              cx="14"
              cy="28"
              r="1.1"
              fill="#fff"
            />
            <circle
              cx="32"
              cy="32"
              r="0.9"
              fill="#fff"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-metal')"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="40"
              height="40"
              fill="#3d4148"
            />
            <path
              d="M0 5 H40 M0 13 H40 M0 21 H40 M0 29 H40 M0 37 H40"
              stroke="#4a4f57"
              stroke-width="0.6"
              opacity="0.5"
            />
            <path
              d="M0 2 H40"
              stroke="#5c626c"
              stroke-width="0.5"
              opacity="0.4"
            />
            <rect
              x="2"
              y="2"
              width="36"
              height="36"
              rx="3"
              fill="none"
              stroke="#2a2d33"
              stroke-width="2"
            />
            <circle
              cx="6"
              cy="6"
              r="1.8"
              fill="#5c626c"
            />
            <circle
              cx="34"
              cy="6"
              r="1.8"
              fill="#5c626c"
            />
            <circle
              cx="6"
              cy="34"
              r="1.8"
              fill="#5c626c"
            />
            <circle
              cx="34"
              cy="34"
              r="1.8"
              fill="#5c626c"
            />
            <circle
              cx="6"
              cy="6"
              r="0.7"
              fill="#23262b"
            />
            <circle
              cx="34"
              cy="6"
              r="0.7"
              fill="#23262b"
            />
          </pattern>
          <pattern
            :id="svgDefId('mat-rune')"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="48"
              height="48"
              fill="#2a1840"
            />
            <circle
              cx="24"
              cy="24"
              r="18"
              fill="none"
              stroke="#7b4fd0"
              stroke-width="1"
              opacity="0.7"
            />
            <circle
              cx="24"
              cy="24"
              r="12"
              fill="none"
              stroke="#9a6ff0"
              stroke-width="0.8"
              opacity="0.55"
            />
            <path
              d="M24 6 L24 42 M6 24 L42 24 M11 11 L37 37 M37 11 L11 37"
              stroke="#8a5fe0"
              stroke-width="0.6"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M24 14 l4 6 l-8 0 z M20 28 l8 0 l-4 6 z"
              fill="#c9a8ff"
              opacity="0.6"
            />
            <circle
              cx="24"
              cy="24"
              r="2"
              fill="#d9c0ff"
              opacity="0.8"
            />
          </pattern>
          <radialGradient :id="svgDefId('grad-warm')">
            <stop
              offset="0%"
              stop-color="#ffd9a0"
              stop-opacity="0.9"
            />
            <stop
              offset="45%"
              stop-color="#ff9d4a"
              stop-opacity="0.45"
            />
            <stop
              offset="100%"
              stop-color="#ff7a2a"
              stop-opacity="0"
            />
          </radialGradient>
          <radialGradient :id="svgDefId('grad-cold')">
            <stop
              offset="0%"
              stop-color="#cfe4ff"
              stop-opacity="0.7"
            />
            <stop
              offset="50%"
              stop-color="#7fb0e8"
              stop-opacity="0.3"
            />
            <stop
              offset="100%"
              stop-color="#4d80c0"
              stop-opacity="0"
            />
          </radialGradient>
          <radialGradient :id="svgDefId('mood-warm')">
            <stop
              offset="0%"
              stop-color="#ffcf88"
              stop-opacity="0.2"
            />
            <stop
              offset="100%"
              stop-color="#633016"
              stop-opacity="0.45"
            />
          </radialGradient>
          <radialGradient :id="svgDefId('mood-cold')">
            <stop
              offset="0%"
              stop-color="#8ab6ff"
              stop-opacity="0.06"
            />
            <stop
              offset="100%"
              stop-color="#0b1630"
              stop-opacity="0.62"
            />
          </radialGradient>
          <radialGradient :id="svgDefId('mood-dark')">
            <stop
              offset="0%"
              stop-color="#1d2530"
              stop-opacity="0.12"
            />
            <stop
              offset="100%"
              stop-color="#000000"
              stop-opacity="0.78"
            />
          </radialGradient>
          <radialGradient :id="svgDefId('mood-mystic')">
            <stop
              offset="0%"
              stop-color="#a77dff"
              stop-opacity="0.24"
            />
            <stop
              offset="100%"
              stop-color="#123f4d"
              stop-opacity="0.32"
            />
          </radialGradient>
          <radialGradient :id="svgDefId('mood-danger')">
            <stop
              offset="0%"
              stop-color="#c9463d"
              stop-opacity="0.14"
            />
            <stop
              offset="100%"
              stop-color="#2a0606"
              stop-opacity="0.56"
            />
          </radialGradient>
          <radialGradient :id="svgDefId('mood-calm')">
            <stop
              offset="0%"
              stop-color="#c4e8d1"
              stop-opacity="0.16"
            />
            <stop
              offset="100%"
              stop-color="#49706f"
              stop-opacity="0.18"
            />
          </radialGradient>
          <radialGradient
            :id="svgDefId('map-vignette-radial')"
            cx="50%"
            cy="48%"
            r="76%"
          >
            <stop
              offset="0%"
              stop-color="#ffffff"
              stop-opacity="1"
            />
            <stop
              offset="62%"
              stop-color="#ffffff"
              stop-opacity="1"
            />
            <stop
              offset="100%"
              stop-color="#1a1d2e"
              stop-opacity="1"
            />
          </radialGradient>
          <clipPath
            v-for="item in avatarImageItems"
            :id="svgDefId(item.avatarClipId)"
            :key="`${item.avatarClipId}-${svgDefsNonce}`"
          >
            <circle
              :cx="item.avatarX + item.avatarSize / 2"
              :cy="item.avatarY + item.avatarSize / 2"
              :r="item.avatarSize / 2"
            />
          </clipPath>
        </defs>
        <rect
          v-if="sceneSurface"
          class="map-scene-surface"
          :x="sceneSurface.x"
          :y="sceneSurface.y"
          :width="sceneSurface.width"
          :height="sceneSurface.height"
          :fill="sceneSurface.fill"
          :filter="svgUrl('tavern-mat-texture')"
          :style="sceneSurface.style"
        />
        <g class="map-fill-layer">
          <path
            v-for="item in fillItems"
            :key="item.id"
            :d="item.path"
            :fill="scopeSvgUrl(item.fill)"
            :transform="item.transform"
            :fill-rule="item.fillRule"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          />
        </g>
        <g
          class="map-line-layer"
          :filter="svgUrl('tavern-map-sketch')"
        >
          <path
            v-for="item in regularLineCasingItems"
            :key="item.id"
            :d="item.path"
            :fill="scopeSvgUrl(item.fill)"
            :stroke="item.color"
            :stroke-width="item.strokeWidth"
            :stroke-dasharray="item.dash"
            :transform="item.transform"
            :fill-rule="item.fillRule"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          />
          <path
            v-for="item in regularLineCoreItems"
            :key="item.id"
            :d="item.path"
            :fill="scopeSvgUrl(item.fill)"
            :stroke="item.color"
            :stroke-width="item.strokeWidth"
            :stroke-dasharray="item.dash"
            :transform="item.transform"
            :fill-rule="item.fillRule"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          />
        </g>
        <g :filter="svgUrl('tavern-map-shadow')">
          <text
            v-for="item in symbolLineItems"
            :key="item.id"
            :x="item.x"
            :y="item.y"
            :font-size="item.fontSize"
            :fill="scopeSvgUrl(item.fill)"
            text-anchor="middle"
            dominant-baseline="central"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          >
            {{ materialSymbolGlyphText(item.symbolIcon) }}
          </text>
        </g>
        <g class="map-light-layer">
          <path
            v-for="item in lightItems"
            :key="item.id"
            :d="item.path"
            :fill="scopeSvgUrl(item.fill)"
            :transform="item.transform"
            :fill-rule="item.fillRule"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          />
        </g>
        <rect
          v-if="moodOverlay"
          class="map-mood-overlay"
          :x="moodOverlay.x"
          :y="moodOverlay.y"
          :width="moodOverlay.width"
          :height="moodOverlay.height"
          :fill="moodOverlay.fill"
          :style="moodOverlay.style"
        />
        <rect
          class="map-vignette-overlay"
          :x="vignetteOverlay.x"
          :y="vignetteOverlay.y"
          :width="vignetteOverlay.width"
          :height="vignetteOverlay.height"
          :fill="vignetteOverlay.fill"
          :style="vignetteOverlay.style"
        />
        <g class="map-label-layer">
          <text
            v-for="item in laidOutLabelItems"
            :key="item.id"
            :x="item.x"
            :y="item.y"
            :font-size="item.fontSize"
            :fill="item.color"
            stroke="rgba(245, 235, 210, 0.78)"
            stroke-width="4"
            stroke-linejoin="round"
            paint-order="stroke"
            :text-anchor="item.anchor"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          >
            {{ item.text }}
          </text>
        </g>
        <g class="map-removed-layer">
          <path
            v-for="item in removedFillItems"
            :key="`removed-fill-${item.id}`"
            :d="item.path"
            :fill="scopeSvgUrl(item.fill)"
            :transform="item.transform"
            :fill-rule="item.fillRule"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          />
          <path
            v-for="item in removedLightItems"
            :key="`removed-light-${item.id}`"
            :d="item.path"
            :fill="scopeSvgUrl(item.fill)"
            :transform="item.transform"
            :fill-rule="item.fillRule"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          />
          <path
            v-for="item in regularRemovedLineItems"
            :key="`removed-line-${item.id}`"
            :d="item.path"
            :fill="scopeSvgUrl(item.fill)"
            :stroke="item.color"
            :stroke-width="item.strokeWidth"
            :stroke-dasharray="item.dash"
            :transform="item.transform"
            :fill-rule="item.fillRule"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          />
          <text
            v-for="item in symbolRemovedLineItems"
            :key="`removed-symbol-${item.id}`"
            :x="item.x"
            :y="item.y"
            :font-size="item.fontSize"
            :fill="scopeSvgUrl(item.fill)"
            text-anchor="middle"
            dominant-baseline="central"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          >
            {{ materialSymbolGlyphText(item.symbolIcon) }}
          </text>
          <text
            v-for="item in removedLabelItems"
            :key="`removed-label-${item.id}`"
            :x="item.x"
            :y="item.y"
            :font-size="item.fontSize"
            :fill="item.color"
            stroke="rgba(245, 235, 210, 0.78)"
            stroke-width="4"
            stroke-linejoin="round"
            paint-order="stroke"
            :text-anchor="item.anchor"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          >
            {{ item.text }}
          </text>
        </g>
        <g
          class="map-avatar-layer"
          :filter="svgUrl('tavern-map-shadow')"
        >
          <image
            v-for="item in avatarImageItems"
            :key="item.id"
            :href="item.avatarHref"
            :x="item.avatarX"
            :y="item.avatarY"
            :width="item.avatarSize"
            :height="item.avatarSize"
            :clip-path="scopeSvgUrl(`url(#${item.avatarClipId})`)"
            preserveAspectRatio="xMidYMid slice"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          />
          <path
            v-for="item in avatarPathItems"
            :key="item.id"
            :d="item.path"
            :fill="scopeSvgUrl(item.fill)"
            :stroke="item.strokeWidth > 0 ? item.color : undefined"
            :stroke-width="item.strokeWidth || undefined"
            :stroke-dasharray="item.dash || undefined"
            :transform="item.transform"
            :fill-rule="item.fillRule"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="itemClass(item)"
            :style="itemStyle(item)"
          />
        </g>
      </svg>
      <div
        :key="`pen-${replayKey}`"
        class="tavern-map-pen"
        :style="penStyle"
      />
      <div
        :key="`progress-${replayKey}`"
        class="tavern-map-progress"
        :style="progressStyle"
      />
      <button
        type="button"
        class="tavern-map-redraw-button"
        title="重绘地图渲染层"
        aria-label="重绘地图渲染层"
        @click="redrawMapRenderLayer"
      >
        ⟳
      </button>
      <div
        v-if="showMapBadge"
        class="tavern-map-badge-shell"
        :class="{ 'is-open': mapBadgeExpanded }"
      >
        <button
          type="button"
          class="tavern-map-badge-toggle"
          :aria-expanded="mapBadgeExpanded"
          :title="mapBadgeExpanded ? '收起地图更新提示' : '显示地图更新提示'"
          aria-label="切换地图更新提示"
          @click="toggleMapBadge"
        >
          !
        </button>
        <button
          v-if="mapBadgeExpanded"
          type="button"
          class="tavern-map-badge"
          title="收起地图更新提示"
          @click="collapseMapBadge"
        >
          <span>{{ badgeModeLabel }}</span>
          <strong>{{ patchLabel }}</strong>
        </button>
      </div>
      <div
        v-if="replayMode === 'timeline' && canReplayTimeline && timelineFrames.length > 1"
        class="tavern-map-timeline-control"
      >
        <button
          type="button"
          @click="stepTimeline(-1)"
        >
          上一回合
        </button>
        <button
          type="button"
          @click="stepTimeline(1)"
        >
          下一回合
        </button>
      </div>
      <div
        v-if="removedOps.length"
        :key="`removed-${replayKey}`"
        class="tavern-map-removed-stack"
      >
        <span
          v-for="item in removedOps"
          :key="item.id"
          :style="{ animationDelay: `${item.delayMs}ms` }"
        >
          - {{ item.id }}
        </span>
      </div>
    </div>

    <div
      v-else
      class="tavern-map-empty"
    >
      <div
        v-if="compact"
        class="tavern-map-compact-controls"
      >
        <select
          class="tavern-map-select"
          :value="selectedDocumentRecord?.docId || ''"
          :disabled="mapDocuments.length <= 1"
          aria-label="选择地图"
          @change="handleSelectedDocChange"
        >
          <option
            v-for="mapDocumentItem in mapDocuments"
            :key="mapDocumentItem.docId"
            :value="mapDocumentItem.docId"
          >
            {{ mapDocumentItem.active ? '当前 · ' : '' }}{{ mapDocumentItem.title || mapDocumentItem.docId }}
          </option>
        </select>
      </div>
      <strong>地图待初始化</strong>
      <span>当前会话已备好种子地图；剧情出现明确空间变化后，后台会激活并维护它。</span>
    </div>

    <footer
      v-if="!compact"
      class="tavern-editor-foot xb-editor-foot tavern-map-foot"
    >
      <span>{{ totalPatchCount }} patches</span>
      <span v-if="digestLines.length">{{ digestLines[0] }}</span>
      <span v-if="digestLines[1]">{{ digestLines[1] }}</span>
    </footer>
  </aside>
</template>
