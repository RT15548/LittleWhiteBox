<script setup lang="ts">
import { computed, nextTick, ref, watch, useId } from 'vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { MapDomainV1 } from '../../../domains/map/types.js';
import MapAtlas from './MapAtlas.vue';
import MapSceneView from './MapSceneView.vue';
import MapProjectionControls from './MapProjectionControls.vue';
import MapLegend from './MapLegend.vue';
import { resolveInitialMapView } from './map-view.js';
import MapSearch from './MapSearch.vue';
import MapPlaceDetail from './MapPlaceDetail.vue';
import MapIcon from './MapIcon.vue';
import { locationInScope } from './world-map.js';
import { isMapRegion, locationRegion } from '../../../domains/map/hierarchy.js';
import { mapBrowseScope, type MapBrowseFilter } from './map-browse.js';
import { MAP_PROJECTION_COPY, MAP_BROWSE_COPY, MAP_NAV_COPY, MAP_VIEW_LABELS, mapBrowseAction, mapBrowseSummary } from './map-copy.js';
import './map.css';

const props = defineProps<{ map: MapDomainV1 | null; chatIdentity: string; compact?: boolean }>();
const summaryId = `map-browse-summary-${useId()}`;
const selectedKey = ref('');
type MapView = { kind: 'world' } | { kind: 'region' | 'scene'; key: string };
// An empty key follows the player's region/scene; explicit keys browse without moving anyone.
const initialView = (): MapView => resolveInitialMapView(props.map) === 'scene' ? { kind: 'scene', key: '' } : { kind: 'world' };
const view = ref<MapView>(initialView());
const renderMode = ref<'2d' | '3d'>('3d');
const lowWalls = ref(false);
const showLabels = ref(true);
const threeUnavailable = ref(false);
const threeNotice = ref('');
let viewChosen = false;
const showingScene = computed(() => view.value.kind === 'scene');
const sceneKey = computed(() => view.value.kind === 'scene' ? view.value.key : '');
const focusKey = ref('');
const focusSequence = ref(0);
const searchFilter = ref<MapBrowseFilter | null>(null);
const helpOpen = ref(false);
const atlas = computed(() => props.map?.atlas);
const playerKey = computed(() => atlas.value?.actors.find(actor => actor.actorKey === 'player')?.locationKey || '');
const player = computed(() => atlas.value?.locations.find(place => place.key === playerKey.value));
const sceneLocation = computed(() => atlas.value?.locations.find(place => place.key === (sceneKey.value || playerKey.value)));
const scene = computed(() => showingScene.value && sceneLocation.value?.sceneKey ? props.map?.scenes[sceneLocation.value.sceneKey] : undefined);
const currentRegion = computed(() => {
    if (!atlas.value || view.value.kind === 'world') {return undefined;}
    const key = view.value.key || playerKey.value;
    return locationRegion(atlas.value, key);
});
const scope = computed(() => mapBrowseScope(atlas.value || { locations: [], links: [], actors: [] }, view.value.kind === 'world' ? null : currentRegion.value?.key || ''));
const selected = computed(() => scope.value.locations.find(place => place.key === selectedKey.value));
const browseTitle = computed(() => scope.value.kind === 'world' ? MAP_VIEW_LABELS.world : currentRegion.value?.name || MAP_NAV_COPY.unknownRegion);
const browseCopy = computed(() => MAP_BROWSE_COPY[scope.value.kind]);
const bannerFilter = computed(() => scope.value.unvisited ? 'unvisited' : 'all');

watch(() => ({ map: props.map, chatIdentity: props.chatIdentity }), (next, previous) => {
    const changedChat = next.chatIdentity !== previous.chatIdentity;
    if (changedChat || !next.map?.atlas.locations.some(place => place.key === selectedKey.value)) {selectedKey.value = '';}
    if (changedChat) {viewChosen = false;}
    const target = view.value.kind === 'world' ? '' : view.value.key;
    const missingTarget = target && !next.map?.atlas.locations.some(place => place.key === target);
    if (changedChat || (!previous.map?.atlas.locations.length && next.map?.atlas.locations.length && !viewChosen) || missingTarget) {
        view.value = initialView();
    }
    if (changedChat) {searchFilter.value = null; helpOpen.value = false;}
});
watch(scope, (next, previous) => {
    if (!next.locations.some(place => place.key === selectedKey.value)) {selectedKey.value = '';}
    if (next.kind !== previous.kind || next.region?.key !== previous.region?.key || !atlas.value) {
        selectedKey.value = ''; searchFilter.value = null; helpOpen.value = false;
    }
});
function navigate(next: MapView): void {
    viewChosen = true;
    view.value = next;
    selectedKey.value = '';
    searchFilter.value = null;
    helpOpen.value = false;
}
function enterRegion(key = ''): void {navigate({ kind: 'region', key });}
async function selectPlace(key: string, locate = false): Promise<void> {
    const place = atlas.value?.locations.find(item => item.key === key);
    if (!place) {return;}
    viewChosen = true;
    if (locate && atlas.value) {
        if (isMapRegion(place)) {showWorld();}
        else {
            const owner = locationRegion(atlas.value, key);
            if (!owner) {showScene(key); return;}
            enterRegion(owner.key);
        }
        await nextTick();
    }
    selectedKey.value = key;
    searchFilter.value = null;
    helpOpen.value = false;
    await nextTick();
    focusKey.value = atlas.value ? locationInScope(atlas.value, key, scope.value.locations) : key;
    focusSequence.value += 1;
}
async function locatePlayer(): Promise<void> {
    if (!player.value || !atlas.value) {return;}
    if (isMapRegion(player.value)) {await selectPlace(player.value.key, true); return;}
    const owner = locationRegion(atlas.value, player.value.key);
    if (!owner) {showScene(); return;}
    enterRegion();
    await nextTick();
    await selectPlace(player.value.key);
}
function showScene(key = ''): void {
    navigate({ kind: 'scene', key: key === playerKey.value ? '' : key });
}
function showWorld(): void {
    navigate({ kind: 'world' });
}
function fallbackThree(reason: string): void {
    if (threeUnavailable.value) {return;}
    threeUnavailable.value = true;
    renderMode.value = '2d';
    threeNotice.value = reason;
}
useAppBack(() => {
    if (helpOpen.value) { helpOpen.value = false; return true; }
    if (showingScene.value) { enterRegion(sceneKey.value ? currentRegion.value?.key || '' : ''); return true; }
    if (selectedKey.value) { selectedKey.value = ''; return true; }
    if (view.value.kind === 'region') { showWorld(); return true; }
    return false;
});
</script>
<template>
    <main class="map-app" :class="{ 'has-view-switch': atlas?.locations.length, 'is-scene-view': showingScene }">
        <MapProjectionControls v-if="compact && atlas?.locations.length" v-model:mode="renderMode" v-model:low-walls="lowWalls" v-model:show-labels="showLabels" :view="view.kind" :scene-available="scene?.status === 'active'" :three-unavailable="threeUnavailable" :located="Boolean(player)" @navigate="kind => navigate(kind === 'world' ? { kind } : { kind, key: '' })" @locate="showingScene ? showScene() : locatePlayer()" />
        <div class="map-top">
            <template v-if="!compact">
                <header class="map-search-bar"><MapIcon :name="showingScene ? 'layers' : 'search'" /><button v-if="!showingScene" type="button" class="map-search-entry" :disabled="!atlas?.locations.length" @click="searchFilter = 'all'">{{ browseCopy.search }}<small>{{ browseTitle }}</small></button><div v-else class="map-search-entry">{{ sceneLocation?.name || MAP_VIEW_LABELS.scene }}<small>{{ sceneKey ? MAP_NAV_COPY.sceneBrowsing : MAP_NAV_COPY.sceneCurrent }}</small></div><slot name="toolbar" /></header>
                <div v-if="atlas?.locations.length" class="map-view-row">
                    <nav class="map-view-switch" :aria-label="MAP_NAV_COPY.viewLabel">
                        <button type="button" :aria-pressed="view.kind === 'world'" @click="showWorld"><MapIcon name="globe" />{{ MAP_VIEW_LABELS.world }}</button>
                        <button type="button" :aria-pressed="view.kind === 'region'" @click="enterRegion()"><MapIcon name="compass" />{{ MAP_VIEW_LABELS.region }}</button>
                        <button type="button" :aria-pressed="showingScene" @click="showScene()"><MapIcon name="layers" />{{ MAP_VIEW_LABELS.scene }}</button>
                    </nav>
                    <div v-if="showingScene" class="map-scene-tools">
                        <button v-if="sceneKey" type="button" class="map-round-button" aria-label="回到当前场景" @click="showScene()"><MapIcon name="locate" /></button>
                        <button type="button" class="map-round-button" :aria-expanded="helpOpen" :aria-label="MAP_NAV_COPY.legendLabel" @click="helpOpen = !helpOpen"><MapIcon name="layers" /></button>
                    </div>
                </div>
                <nav v-if="atlas?.locations.length && !showingScene" class="map-region-trail" :aria-label="MAP_NAV_COPY.trailLabel"><button type="button" :aria-current="view.kind === 'world' ? 'page' : undefined" @click="showWorld"><MapIcon name="globe" />{{ MAP_VIEW_LABELS.world }}</button><template v-if="view.kind === 'region'"><MapIcon name="next" /><span aria-current="page">{{ browseTitle }}</span></template></nav>
            </template>
            <aside v-if="threeNotice" class="map-notice" role="status"><p>{{ threeNotice }}</p><button type="button" class="map-notice-close" aria-label="关闭三维提示" @click="threeNotice = ''"><MapIcon name="close" /></button></aside>
            <slot name="feedback" />
        </div>
        <div class="map-canvas" :class="{ 'has-detail': selected && !showingScene }">
            <template v-if="map && atlas?.locations.length">
                <MapAtlas v-if="scope.locations.length" v-show="!showingScene" :atlas="map.atlas" :scope="scope" :label="browseTitle" :current-location-key="playerKey" :selected-location-key="selectedKey" :focus-key="focusKey" :focus-sequence="focusSequence" @select="key => selectPlace(key)" />
                <template v-if="showingScene">
                    <MapSceneView v-if="scene?.status === 'active'" v-model:mode="renderMode" v-model:low-walls="lowWalls" v-model:show-labels="showLabels" :scene="scene" :compact="compact" :three-unavailable="threeUnavailable" @fallback="fallbackThree" />
                    <div v-else class="map-empty"><MapIcon name="layers" /><h2>{{ sceneLocation ? MAP_NAV_COPY.sceneEmpty : MAP_NAV_COPY.unknownLocation }}</h2><template v-if="sceneKey && sceneKey !== playerKey"><button type="button" class="map-secondary-button" @click="currentRegion ? enterRegion(currentRegion.key) : showWorld()">{{ currentRegion ? MAP_NAV_COPY.regionMap : MAP_VIEW_LABELS.world }}</button></template><slot v-else name="scene-empty-action" :located="Boolean(sceneLocation)" /></div>
                </template>
                <div v-if="!showingScene && !scope.locations.length" class="map-empty"><MapIcon name="pin" /><h2>{{ view.kind === 'region' && !currentRegion ? MAP_NAV_COPY.unknownRegion : browseCopy.empty }}</h2><p>{{ view.kind === 'region' && !currentRegion ? MAP_NAV_COPY.unknownRegionHint : browseCopy.emptyHint }}</p><button v-if="view.kind === 'region'" type="button" class="map-secondary-button" @click="showWorld">{{ MAP_VIEW_LABELS.world }}</button><slot v-else name="scope-empty-action" /></div>
            </template>
            <slot v-else name="empty-map"><div class="map-empty"><MapIcon name="globe" /><h2>{{ MAP_PROJECTION_COPY.empty }}</h2></div></slot>
        </div>
        <div v-if="!compact && atlas?.locations.length && !showingScene" class="map-floating-tools" :class="{ 'has-detail': selected }"><button type="button" class="map-round-button" :disabled="!player" aria-label="回到我的位置" @click="locatePlayer"><MapIcon name="locate" /></button><button type="button" class="map-round-button" :aria-expanded="helpOpen" :aria-label="MAP_NAV_COPY.legendLabel" @click="helpOpen = !helpOpen"><MapIcon name="layers" /></button></div>
        <aside v-if="helpOpen" class="map-key"><MapLegend /></aside>
        <MapPlaceDetail v-if="selected && map && !showingScene" :key="selected.key" :location="selected" :map="map" :current-key="playerKey" @close="selectedKey = ''" @scene="showScene(selected.key)" @explore="enterRegion(selected.key)" @select="key => selectPlace(key, true)" />
        <button v-else-if="!compact && atlas?.locations.length && !showingScene" type="button" class="map-region-card" :aria-label="mapBrowseAction(scope.kind, bannerFilter)" :aria-describedby="summaryId" @click="searchFilter = bannerFilter"><span class="map-region-icon"><MapIcon :name="scope.kind === 'world' ? 'globe' : 'compass'" /></span><span :id="summaryId" class="map-region-summary"><strong>{{ browseTitle }}</strong><small>{{ mapBrowseSummary(scope.kind, scope.locations.length, scope.unvisited) }}</small></span><span class="map-round-button" aria-hidden="true"><MapIcon name="next" /></span></button>
        <footer v-else-if="!compact && showingScene && atlas?.locations.length" class="map-scene-caption"><MapIcon name="layers" /><span><strong>{{ sceneLocation?.name || '当前位置待确认' }}</strong><small>{{ sceneKey ? '正在查看场景图 · 不会移动人物' : '当前位置的场景图' }}</small></span></footer>
        <div v-if="compact && atlas?.locations.length && !selected" class="map-projection-caption" :title="showingScene ? sceneLocation?.name : browseTitle"><MapIcon :name="showingScene ? 'pin' : 'compass'" /><span>{{ showingScene ? sceneLocation?.name || MAP_NAV_COPY.unknownLocation : browseTitle }}</span></div>
        <MapSearch v-if="searchFilter && atlas" :scope="scope" :title="browseTitle" :initial-filter="searchFilter" @close="searchFilter = null" @select="key => selectPlace(key)" />
        <slot name="overlay" />
    </main>
</template>
