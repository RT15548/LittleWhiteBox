<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { TavernStructuredStateDocumentRecord, TavernStructuredStatePatchRecord } from '../../shared/session-db';
import type { TavernAtlasActorPosition, TavernAtlasDocument, TavernAtlasLink, TavernAtlasLocation, TavernMapStateDocumentItem } from '../../shared/structured-state';
import { layoutTavernAtlasDocument } from '../atlas-display';
import {
    resolveAtlasScaleIconName,
    TAVERN_MAP_MATERIAL_SYMBOL_SIZE,
} from '../../shared/map-material-symbols';

const props = withDefaults(defineProps<{
    document: TavernStructuredStateDocumentRecord | null;
    patches?: TavernStructuredStatePatchRecord[];
    activeLocationKey?: string;
    activeMapDocId?: string;
    previewMapDocId?: string;
    mapDocuments?: TavernMapStateDocumentItem[];
    displayMode?: 'full' | 'graph' | 'detail';
    materialSymbolsReady?: boolean;
    materialSymbolsStatus?: 'idle' | 'loading' | 'ready' | 'failed';
}>(), {
    patches: () => [],
    activeLocationKey: '',
    activeMapDocId: 'main',
    previewMapDocId: '',
    mapDocuments: () => [],
    displayMode: 'full',
    materialSymbolsReady: false,
    materialSymbolsStatus: 'idle',
});

const selectedLocationKey = ref('');
const atlasSvgRef = ref<SVGSVGElement | null>(null);
const atlasPanOffset = ref<[number, number]>([0, 0]);
const atlasZoom = ref(1);
const atlasDrag = ref<{
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

const atlas = computed<TavernAtlasDocument>(() => {
    const raw = props.document?.data;
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Partial<TavernAtlasDocument> : {};
    return {
        version: 1,
        activeLocationKey: String(source.activeLocationKey || props.activeLocationKey || '').trim() || undefined,
        locations: Array.isArray(source.locations) ? source.locations.filter(isAtlasLocation) : [],
        links: Array.isArray(source.links) ? source.links.filter(isAtlasLink) : [],
        actors: Array.isArray(source.actors) ? source.actors.filter(isAtlasActor) : [],
    };
});
const layout = computed(() => layoutTavernAtlasDocument(atlas.value));
const locationMap = computed(() => new Map(atlas.value.locations.map((location) => [location.key, location])));
const selectedLocation = computed(() => locationMap.value.get(selectedLocationKey.value) || currentLocation.value || atlas.value.locations[0] || null);
const currentLocation = computed(() => locationMap.value.get(atlas.value.activeLocationKey || '') || null);
const currentMapDocId = computed(() => String(currentLocation.value?.mapDocId || '').trim());
const mapMismatchWarning = computed(() => !!currentMapDocId.value && !!props.activeMapDocId && currentMapDocId.value !== props.activeMapDocId);
const latestPatchSummary = computed(() => String(props.patches.at(-1)?.summary || '').trim());
const mapTitleById = computed(() => {
    const table = new Map<string, string>();
    props.mapDocuments.forEach((document) => table.set(document.docId, document.title || document.docId));
    return table;
});
const mapDocIds = computed(() => new Set(props.mapDocuments.map((document) => document.docId)));
const selectedActors = computed(() => actorsForLocation(selectedLocation.value?.key || ''));
const selectedActorLabels = computed(() => selectedActors.value.map(actorLabel).filter(Boolean));
const selectedLinks = computed(() => {
    const key = selectedLocation.value?.key || '';
    return atlas.value.links.filter((link) => link.from === key || link.to === key);
});
const showGraph = computed(() => props.displayMode !== 'detail');
const showDetail = computed(() => props.displayMode !== 'graph');
const atlasViewBoxArray = computed<[number, number, number, number]>(() => {
    const [x, y, width, height] = layout.value.viewBox;
    const [offsetX, offsetY] = atlasPanOffset.value;
    const zoom = Math.max(0.5, Math.min(4, atlasZoom.value));
    const zoomedWidth = width / zoom;
    const zoomedHeight = height / zoom;
    return [
        Number((x + offsetX + (width - zoomedWidth) / 2).toFixed(2)),
        Number((y + offsetY + (height - zoomedHeight) / 2).toFixed(2)),
        Number(zoomedWidth.toFixed(2)),
        Number(zoomedHeight.toFixed(2)),
    ];
});
const atlasViewBox = computed(() => atlasViewBoxArray.value.join(' '));
const atlasZoomLabel = computed(() => `${Math.round(atlasZoom.value * 100)}%`);

watch([() => atlas.value.activeLocationKey, () => atlas.value.locations.length], ([key]) => {
    if (selectedLocationKey.value && locationMap.value.has(selectedLocationKey.value)) {return;}
    selectedLocationKey.value = String(key || atlas.value.locations[0]?.key || '');
}, { immediate: true });

watch(() => [props.document?.docId, props.displayMode] as const, () => {
    resetAtlasPan();
});

function isAtlasLocation(value: unknown): value is TavernAtlasLocation {
    return !!value && typeof value === 'object' && !Array.isArray(value) && typeof (value as TavernAtlasLocation).key === 'string';
}

function isAtlasLink(value: unknown): value is TavernAtlasLink {
    return !!value && typeof value === 'object' && !Array.isArray(value) && typeof (value as TavernAtlasLink).id === 'string';
}

function isAtlasActor(value: unknown): value is TavernAtlasActorPosition {
    return !!value && typeof value === 'object' && !Array.isArray(value) && typeof (value as TavernAtlasActorPosition).actorKey === 'string';
}

function actorsForLocation(locationKey: string) {
    return atlas.value.actors
        .filter((actor) => actor.locationKey === locationKey)
        .sort((left, right) => {
            if (left.actorKey === 'player') {return -1;}
            if (right.actorKey === 'player') {return 1;}
            return left.actorKey.localeCompare(right.actorKey);
        });
}

function actorLabel(actor: TavernAtlasActorPosition): string {
    if (isGenericActorKey(actor.actorKey)) {return '';}
    return actor.actorKey;
}

function nodeActors(locationKey: string): string {
    const actors = actorsForLocation(locationKey);
    if (!actors.length) {return '';}
    const actorLabels = actors.map(actorLabel).filter(Boolean);
    const labels = actorLabels.slice(0, 2);
    if (!labels.length) {return '';}
    return actorLabels.length > 2 ? `${labels.join('、')} +${actorLabels.length - 2}` : labels.join('、');
}

function isGenericActorKey(value: unknown): boolean {
    const text = String(value || '').trim();
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

function locationClass(location: TavernAtlasLocation) {
    return {
        'is-current': location.key === atlas.value.activeLocationKey,
        'is-preview': location.mapDocId && location.mapDocId === props.previewMapDocId,
        'is-selected': location.key === selectedLocationKey.value,
        'is-mentioned': location.status === 'mentioned',
        'has-map': hasMapDocument(location),
    };
}

function hasMapDocument(location: TavernAtlasLocation | null | undefined): boolean {
    const docId = String(location?.mapDocId || '').trim();
    return !!docId && mapDocIds.value.has(docId);
}

function mapDocumentLabel(location: TavernAtlasLocation | null | undefined): string {
    const docId = String(location?.mapDocId || '').trim();
    if (!docId) {return '暂无详细地图';}
    return mapTitleById.value.get(docId) || `已关联 ${docId}，地图未创建`;
}

function atlasNodeIcon(location: TavernAtlasLocation | null | undefined) {
    return resolveAtlasScaleIconName(location?.scale);
}

function atlasNodeIconText(location: TavernAtlasLocation | null | undefined): string {
    if (props.materialSymbolsReady) {return atlasNodeIcon(location);}
    return props.materialSymbolsStatus === 'failed' ? '!' : '';
}

function atlasLinkForLayout(linkId: string): TavernAtlasLink | undefined {
    return atlas.value.links.find((item) => item.id === linkId);
}

function atlasLinkLabel(linkId: string): string {
    const link = atlasLinkForLayout(linkId);
    return String(link?.label || link?.kind || '').trim();
}

function resetAtlasPan() {
    atlasPanOffset.value = [0, 0];
    atlasZoom.value = 1;
    atlasDrag.value = null;
}

function setAtlasZoom(nextZoom: number, anchor?: { clientX: number; clientY: number }) {
    const svg = atlasSvgRef.value;
    const bounds = svg?.getBoundingClientRect();
    const [oldX, oldY, oldWidth, oldHeight] = atlasViewBoxArray.value;
    const [baseX, baseY, baseWidth, baseHeight] = layout.value.viewBox;
    const clampedZoom = Number(Math.max(0.5, Math.min(4, nextZoom)).toFixed(2));
    if (clampedZoom === atlasZoom.value) {return;}

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
    atlasZoom.value = clampedZoom;
    atlasPanOffset.value = [
        Number((anchorMapX - nextWidth * anchorRatioX - baseX - (baseWidth - nextWidth) / 2).toFixed(2)),
        Number((anchorMapY - nextHeight * anchorRatioY - baseY - (baseHeight - nextHeight) / 2).toFixed(2)),
    ];
}

function zoomAtlasBy(step: number) {
    setAtlasZoom(atlasZoom.value + step);
}

function handleAtlasPointerDown(event: PointerEvent) {
    const svg = event.currentTarget instanceof SVGSVGElement ? event.currentTarget : atlasSvgRef.value;
    if (!svg || event.button !== 0) {return;}
    const bounds = svg.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) {return;}
    const [, , viewWidth, viewHeight] = atlasViewBoxArray.value;
    const [startPanX, startPanY] = atlasPanOffset.value;
    atlasDrag.value = {
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

function handleAtlasPointerMove(event: PointerEvent) {
    const drag = atlasDrag.value;
    if (!drag || drag.pointerId !== event.pointerId) {return;}
    const deltaX = -((event.clientX - drag.startClientX) / drag.clientWidth) * drag.viewWidth;
    const deltaY = -((event.clientY - drag.startClientY) / drag.clientHeight) * drag.viewHeight;
    atlasPanOffset.value = [
        Number((drag.startPanX + deltaX).toFixed(2)),
        Number((drag.startPanY + deltaY).toFixed(2)),
    ];
}

function handleAtlasPointerEnd(event: PointerEvent) {
    const drag = atlasDrag.value;
    if (!drag || drag.pointerId !== event.pointerId) {return;}
    const svg = event.currentTarget instanceof SVGSVGElement ? event.currentTarget : atlasSvgRef.value;
    if (svg?.hasPointerCapture(event.pointerId)) {
        svg.releasePointerCapture(event.pointerId);
    }
    atlasDrag.value = null;
}

function handleAtlasWheel(event: WheelEvent) {
    if (!atlasSvgRef.value) {return;}
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    setAtlasZoom(atlasZoom.value + direction * 0.18, { clientX: event.clientX, clientY: event.clientY });
}

</script>

<template>
  <section
    class="tavern-atlas-panel"
    :class="[`is-${displayMode}`, { 'is-symbol-font-failed': materialSymbolsStatus === 'failed' }]"
  >
    <div
      v-if="!atlas.locations.length"
      class="tavern-atlas-empty"
    >
      <strong>世界地图尚未建立</strong>
      <p>随着剧情展开，AI 会自动记录你去过的地点，以及地点之间的联系。</p>
      <span>当前场景图：{{ mapTitleById.get(activeMapDocId) || activeMapDocId || 'main' }}</span>
    </div>
    <template v-else>
      <div
        v-if="showDetail && mapMismatchWarning"
        class="tavern-atlas-warning"
      >
        当前激活的场景图不是世界当前位置的地图。
      </div>
      <div
        v-if="showGraph"
        class="tavern-atlas-graph"
        :class="{ 'is-panning': atlasDrag }"
      >
        <div
          class="tavern-map-zoom-controls tavern-atlas-zoom-controls"
          aria-label="世界图缩放"
        >
          <button
            type="button"
            aria-label="缩小世界图"
            :disabled="atlasZoom <= 0.5"
            @click="zoomAtlasBy(-0.25)"
          >
            -
          </button>
          <button
            type="button"
            class="tavern-map-zoom-value"
            aria-label="重置世界图缩放"
            @click="resetAtlasPan"
          >
            {{ atlasZoomLabel }}
          </button>
          <button
            type="button"
            aria-label="放大世界图"
            :disabled="atlasZoom >= 4"
            @click="zoomAtlasBy(0.25)"
          >
            +
          </button>
        </div>
        <svg
          ref="atlasSvgRef"
          :viewBox="atlasViewBox"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="世界图"
          @pointerdown="handleAtlasPointerDown"
          @pointermove="handleAtlasPointerMove"
          @pointerup="handleAtlasPointerEnd"
          @pointercancel="handleAtlasPointerEnd"
          @dblclick="resetAtlasPan"
          @wheel="handleAtlasWheel"
        >
          <defs>
            <filter
              id="tavern-atlas-sketch"
              x="-5%"
              y="-5%"
              width="110%"
              height="110%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.022"
                numOctaves="3"
                seed="11"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="0.55"
              />
            </filter>
          </defs>
          <path
            v-for="link in layout.links"
            :key="link.id"
            class="tavern-atlas-link"
            :class="`kind-${atlasLinkForLayout(link.id)?.kind || 'path'}`"
            :d="link.path"
            filter="url(#tavern-atlas-sketch)"
          />
          <text
            v-for="link in layout.links"
            :key="`${link.id}:label`"
            class="tavern-atlas-link-label"
            :class="`kind-${atlasLinkForLayout(link.id)?.kind || 'path'}`"
            :x="link.labelX"
            :y="link.labelY"
            text-anchor="middle"
          >
            {{ atlasLinkLabel(link.id) }}
          </text>
          <g
            v-for="node in layout.nodes"
            :key="node.key"
            class="tavern-atlas-node"
            :class="locationClass(locationMap.get(node.key)!)"
            role="button"
            tabindex="0"
            @click="selectedLocationKey = node.key"
            @keydown.enter.prevent="selectedLocationKey = node.key"
          >
            <rect
              :x="node.x"
              :y="node.y"
              :width="node.width"
              :height="node.height"
              rx="8"
              filter="url(#tavern-atlas-sketch)"
            />
            <text
              class="tavern-atlas-node-symbol"
              :x="node.x + 18"
              :y="node.y + 23"
              :font-size="TAVERN_MAP_MATERIAL_SYMBOL_SIZE - 2"
              text-anchor="middle"
              dominant-baseline="central"
            >
              {{ atlasNodeIconText(locationMap.get(node.key)) }}
            </text>
            <text
              :x="node.x + 36"
              :y="node.y + 22"
              text-anchor="start"
            >
              {{ locationMap.get(node.key)?.name || node.key }}
            </text>
            <text
              :x="node.x + 36"
              :y="node.y + 40"
              text-anchor="start"
              class="tavern-atlas-node-meta"
            >
              {{ nodeActors(node.key) || locationMap.get(node.key)?.scale }}
            </text>
          </g>
        </svg>
      </div>
      <aside
        v-if="showDetail"
        class="tavern-atlas-detail"
      >
        <header>
          <div>
            <strong>{{ selectedLocation?.name || '地点' }}</strong>
            <span>{{ selectedLocation?.key }}</span>
          </div>
          <em>{{ selectedLocation?.status === 'visited' ? '已探索' : '已知' }}</em>
        </header>
        <p v-if="selectedLocation?.brief">
          {{ selectedLocation.brief }}
        </p>
        <dl>
          <div>
            <dt>层级</dt>
            <dd>{{ selectedLocation?.scale || '-' }}</dd>
          </div>
          <div>
            <dt>上级</dt>
            <dd>{{ selectedLocation?.parent ? (locationMap.get(selectedLocation.parent)?.name || selectedLocation.parent) : '顶级地点' }}</dd>
          </div>
          <div>
            <dt>场景图</dt>
            <dd>{{ mapDocumentLabel(selectedLocation) }}</dd>
          </div>
          <div>
            <dt>人物</dt>
            <dd>{{ selectedActorLabels.length ? selectedActorLabels.join('、') : '无' }}</dd>
          </div>
        </dl>
        <div
          v-if="selectedLinks.length"
          class="tavern-atlas-detail-links"
        >
          <span
            v-for="link in selectedLinks"
            :key="link.id"
          >
            {{ link.label || link.kind }} · {{ locationMap.get(link.from)?.name || link.from }} → {{ locationMap.get(link.to)?.name || link.to }}
          </span>
        </div>
        <small v-if="latestPatchSummary">最近更新：{{ latestPatchSummary }}</small>
      </aside>
    </template>
  </section>
</template>

<style scoped>
.tavern-atlas-panel {
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    overflow: hidden;
    background: var(--xb-chat-panel-bg);
}

.tavern-atlas-panel.is-graph,
.tavern-atlas-panel.is-detail {
    grid-template-rows: minmax(0, 1fr);
}

.tavern-atlas-panel.is-graph .tavern-atlas-graph {
    height: 100%;
}

.tavern-atlas-panel.is-graph .tavern-atlas-graph svg {
    min-height: 0;
}

.tavern-atlas-panel.is-detail .tavern-atlas-detail {
    min-height: 0;
    overflow: auto;
    border-top: 0;
}

.tavern-atlas-empty,
.tavern-atlas-detail {
    padding: 18px 34px 22px;
    color: var(--xb-ink);
    font-family: var(--xb-font-serif);
}

.tavern-atlas-empty {
    display: flex;
    min-height: 320px;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
}

.tavern-atlas-empty strong {
    font: 600 18px/1.25 var(--xb-font-serif);
}

.tavern-atlas-empty p,
.tavern-atlas-empty span {
    margin: 0;
    color: var(--xb-ink-soft);
    font: 13px/1.55 var(--xb-font-ui);
}

.tavern-atlas-warning {
    border-bottom: 1px solid rgba(172, 92, 46, 0.28);
    background: rgba(172, 92, 46, 0.08);
    color: var(--xb-ink);
    font: 12px/1.35 var(--xb-font-ui);
    padding: 9px 34px;
}

.tavern-atlas-graph {
    position: relative;
    min-height: 0;
    overflow: hidden;
    isolation: isolate;
    background:
        radial-gradient(circle at 20% 12%, rgba(255, 251, 220, 0.58), transparent 28%),
        radial-gradient(circle at 86% 78%, rgba(102, 63, 23, 0.16), transparent 32%),
        linear-gradient(135deg, rgba(67, 43, 18, 0.08), transparent 38%, rgba(255, 255, 255, 0.18)),
        #e6d8ae;
}

.tavern-atlas-graph::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
        linear-gradient(90deg, rgba(45, 35, 22, 0.035) 1px, transparent 1px),
        linear-gradient(rgba(45, 35, 22, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(circle at center, #000 0, #000 68%, transparent 100%);
}

.tavern-atlas-graph::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
    box-shadow:
        inset 0 0 0 1px rgba(45, 34, 22, 0.08),
        inset 0 0 80px rgba(45, 34, 22, 0.16);
}

.tavern-atlas-graph svg {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    min-height: 280px;
    cursor: grab;
    touch-action: none;
    user-select: none;
}

.tavern-atlas-graph.is-panning svg {
    cursor: grabbing;
}

.tavern-atlas-link {
    fill: none;
    stroke: #7e6746;
    stroke-width: 2.1;
    stroke-dasharray: 7 5;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.82;
}

.tavern-atlas-link.kind-road {
    stroke: #7a4b25;
    stroke-width: 2.45;
    stroke-dasharray: none;
    opacity: 0.86;
}

.tavern-atlas-link.kind-path {
    stroke: #7e6746;
    stroke-dasharray: 7 5;
}

.tavern-atlas-link.kind-portal {
    stroke: #8052a1;
    stroke-width: 1.45;
    stroke-dasharray: 3 5;
    opacity: 0.78;
}

.tavern-atlas-link.kind-stairs,
.tavern-atlas-link.kind-elevator {
    stroke: #6f604a;
    stroke-width: 1.8;
    stroke-dasharray: 2 4;
}

.tavern-atlas-link-label {
    fill: rgba(45, 33, 24, 0.82);
    paint-order: stroke;
    pointer-events: none;
    stroke: rgba(236, 222, 186, 0.92);
    stroke-linejoin: round;
    stroke-width: 5;
    font: 10px/1 var(--xb-font-ui);
}

.tavern-atlas-link-label.kind-road {
    fill: #5a361e;
    font-weight: 600;
}

.tavern-atlas-link-label.kind-portal {
    fill: #653b85;
}

.tavern-atlas-node {
    cursor: pointer;
}

.tavern-atlas-node rect {
    fill: #ead9b1;
    stroke: #665033;
    stroke-width: 1.4;
}

.tavern-atlas-node-symbol {
    fill: #6f4b31;
    font-family: "Material Symbols Rounded", sans-serif;
    font-feature-settings: "liga";
    font-style: normal;
    font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24;
    font-weight: 300;
    letter-spacing: 0;
    opacity: 0.86;
    pointer-events: none;
    text-transform: none;
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
}

.tavern-atlas-node text {
    fill: #2d2118;
    font: 13px/1 var(--xb-font-ui);
    pointer-events: none;
}

.tavern-atlas-node .tavern-atlas-node-symbol {
    fill: #6f4b31;
    font-family: "Material Symbols Rounded", sans-serif;
    font-size: 22px;
    font-style: normal;
    font-weight: 300;
}

.tavern-atlas-panel.is-symbol-font-failed .tavern-atlas-node-symbol {
    font-family: var(--xb-font-ui), sans-serif;
    font-size: 18px;
    font-weight: 800;
}

.tavern-atlas-node .tavern-atlas-node-meta {
    fill: #6d5a3f;
    font: 11px/1 var(--xb-font-mono);
}

.tavern-atlas-node.is-mentioned rect {
    fill: rgba(237, 220, 181, 0.58);
    stroke: #8a7655;
    stroke-dasharray: 4 4;
}

.tavern-atlas-node.is-mentioned .tavern-atlas-node-symbol {
    opacity: 0.46;
}

.tavern-atlas-node.has-map rect {
    stroke: #9a5d30;
}

.tavern-atlas-node.is-current rect {
    fill: #f1dfb4;
    stroke: #a0462c;
    stroke-width: 2.2;
}

.tavern-atlas-node.is-current .tavern-atlas-node-symbol {
    fill: #9c3d29;
    opacity: 0.94;
}

.tavern-atlas-node.is-preview rect,
.tavern-atlas-node.is-selected rect {
    filter: url(#tavern-atlas-sketch) drop-shadow(0 5px 14px rgba(95, 54, 24, 0.18));
}

.tavern-atlas-detail {
    border-top: 1px solid var(--xb-rule);
    background: var(--xb-chat-editor-bg);
}

.tavern-atlas-detail header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
}

.tavern-atlas-detail header div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.tavern-atlas-detail strong {
    overflow: hidden;
    color: var(--xb-ink);
    font: 600 var(--xb-host-main-font-size, 15px)/1.35 var(--xb-font-serif);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tavern-atlas-detail header span,
.tavern-atlas-detail small {
    color: var(--xb-ink-soft);
    font: 12px/1.3 var(--xb-font-mono);
}

.tavern-atlas-detail em {
    flex: 0 0 auto;
    border: 1px solid var(--xb-rule);
    border-radius: 6px;
    color: var(--xb-ink-soft);
    font: 12px/1.2 var(--xb-font-ui);
    font-style: normal;
    padding: 4px 8px;
}

.tavern-atlas-detail p {
    margin: 10px 0 0;
    color: var(--xb-ink-soft);
    font: 13px/1.55 var(--xb-font-ui);
}

.tavern-atlas-detail dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin: 13px 0 0;
}

.tavern-atlas-detail dl div {
    min-width: 0;
}

.tavern-atlas-detail dt {
    color: var(--xb-ink-faint);
    font: 11px/1.25 var(--xb-font-mono);
}

.tavern-atlas-detail dd {
    overflow: hidden;
    margin: 3px 0 0;
    color: var(--xb-ink);
    font: 13px/1.35 var(--xb-font-ui);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tavern-atlas-detail-links {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 13px;
}

.tavern-atlas-detail-links span {
    border: 1px solid var(--xb-rule);
    border-radius: 6px;
    color: var(--xb-ink-soft);
    font: 11px/1.2 var(--xb-font-ui);
    padding: 4px 7px;
}

</style>
