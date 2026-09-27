<script setup lang="ts">
import { computed, useId } from 'vue';
import type { MapAtlas } from '../../../domains/map/types.js';
import MapViewport from './MapViewport.vue';
import MapIcon from './MapIcon.vue';
import { layoutWorldMap, locationInScope } from './world-map.js';
import type { MapBrowseScope } from './map-browse.js';
import { MAP_VISIT_LABELS } from './map-copy.js';

const props = defineProps<{ atlas: MapAtlas; scope: MapBrowseScope; label: string; currentLocationKey: string; selectedLocationKey: string; focusKey: string; focusSequence: number }>();
defineEmits<{ select: [key: string] }>();
const layout = computed(() => layoutWorldMap(props.atlas, props.scope));
const current = computed(() => locationInScope(props.atlas, props.currentLocationKey, props.scope.locations));
const focus = computed(() => layout.value.nodes.find(node => node.location.key === props.focusKey));
const arrow = 'map-arrow-' + useId();
function icon(terrain: string | undefined, scale: string): string {
    return terrain === 'water' ? 'water' : terrain === 'forest' ? 'tree' : terrain === 'mountain' ? 'mountain' : ['world', 'region'].includes(scale) ? 'globe' : scale === 'outdoor' ? 'compass' : 'building';
}
</script>
<template>
    <MapViewport v-slot="{ unitScale }" :view-box="layout.viewBox" :reset-key="`${scope.kind}:${scope.region?.key || ''}`" :label="label" :focus-point="focus ? [focus.x, focus.y] : undefined" :focus-sequence="focusSequence">
        <defs><marker :id="arrow" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1l8 4-8 4z" fill="var(--map-road-ink)" /></marker></defs>
        <g class="map-landscapes" aria-hidden="true">
            <g v-for="node in layout.nodes" :key="node.location.key" :transform="`translate(${node.x} ${node.y})`" :class="`is-${node.location.terrain || 'urban'}`">
                <path d="M-108-20Q-100-100-32-94T87-56Q127-13 99 48T21 99Q-57 113-90 65T-108-20Z" />
                <path class="map-contour" d="M-133-22Q-124-126-39-116T110-70Q156-17 124 60T26 123Q-71 139-112 81T-133-22Z" />
            </g>
        </g>
        <g class="map-world-roads" aria-hidden="true">
            <g v-for="route in layout.routes" :key="route.link.id" :class="{ 'is-path': route.link.kind === 'path', 'is-portal': route.link.kind === 'portal' }">
                <path class="map-road-casing" :d="route.path" /><path class="map-road-line" :d="route.path" :marker-end="!route.link.bidirectional ? `url(#${arrow})` : undefined" />
                <text v-if="route.link.label" :x="route.x" :y="route.y - 14">{{ route.link.label }}</text>
            </g>
        </g>
        <g v-for="node in layout.nodes" :key="node.location.key" class="map-place" :class="{ 'is-selected': node.location.key === selectedLocationKey, 'is-current': node.location.key === current, 'is-unvisited': node.location.status !== 'visited' }" :transform="`translate(${node.x} ${node.y}) scale(${unitScale * .5})`" role="button" tabindex="0" :aria-label="`查看${node.location.name}`" @click.stop="$emit('select', node.location.key)" @keydown.enter.stop="$emit('select', node.location.key)" @keydown.space.stop.prevent="$emit('select', node.location.key)">
            <circle class="map-pin-halo" r="39" /><path class="map-pin-body" d="M0 33C-6 25-26 8-26-6a26 26 0 0 1 52 0C26 8 6 25 0 33Z" />
            <g transform="translate(-14 -20)"><MapIcon :name="icon(node.location.terrain, node.location.scale)" width="28" height="28" /></g>
            <text y="64" class="map-place-name">{{ node.location.name.length > 14 ? node.location.name.slice(0, 13) + '…' : node.location.name }}</text>
            <text v-if="node.location.key === current" y="89" class="map-place-status">你在这里</text>
            <text v-else-if="node.location.status !== 'visited'" y="89" class="map-place-status">{{ MAP_VISIT_LABELS.unvisited }}</text>
            <title>{{ node.location.name }}{{ node.location.brief ? ' · ' + node.location.brief : '' }}</title>
        </g>
    </MapViewport>
</template>
