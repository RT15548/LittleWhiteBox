<script setup lang="ts">
import { computed } from 'vue';
import type { MapDomainV1, MapLocation } from '../../../domains/map/types.js';
import MapIcon from './MapIcon.vue';
import { connectedPlaces } from './world-map.js';
import { isMapRegion, locationTrail } from '../../../domains/map/hierarchy.js';
import { MAP_SCALE_LABELS, MAP_LINK_LABELS } from './map-presentation.js';
import { MAP_NAV_COPY, MAP_VISIT_LABELS } from './map-copy.js';
const props = defineProps<{ location: MapLocation; map: MapDomainV1; currentKey: string }>();
defineEmits<{ close: []; scene: []; explore: []; select: [key: string] }>();
const trail = computed(() => locationTrail(props.map.atlas, props.location.key).slice(0, -1));
const region = computed(() => isMapRegion(props.location));
const actors = computed(() => props.map.atlas.actors.filter(actor => actor.locationKey === props.location.key));
const connections = computed(() => connectedPlaces(props.map.atlas, props.location.key));
</script>
<template>
    <section class="map-place-detail" aria-labelledby="map-place-title">
        <div class="map-sheet-grip" aria-hidden="true" />
        <header><div><small>{{ MAP_SCALE_LABELS[location.scale] }} · {{ currentKey === location.key ? '当前位置' : MAP_VISIT_LABELS[location.status === 'visited' ? 'visited' : 'unvisited'] }}</small><h2 id="map-place-title">{{ location.name }}</h2></div><button type="button" class="map-round-button" aria-label="关闭地点详情" @click="$emit('close')"><MapIcon name="close" /></button></header>
        <div class="map-place-content">
            <p v-if="location.name.length > 24" class="map-place-full-name">{{ location.name }}</p>
            <p v-if="trail.length" class="map-address"><MapIcon name="pin" />{{ trail.map(place => place.name).join(' · ') }}</p>
            <p class="map-place-intro">{{ location.brief || '这个地点已记录在世界地图上，更多介绍等待故事展开。' }}</p>
            <div class="map-place-actions"><button v-if="region" type="button" class="map-primary-button" @click="$emit('explore')"><MapIcon name="compass" />{{ MAP_NAV_COPY.regionMap }}</button><button v-else type="button" class="map-secondary-button" @click="$emit('scene')"><MapIcon name="layers" />{{ MAP_NAV_COPY.sceneMap }}</button></div>
            <section v-if="actors.length" class="map-detail-section"><h3>记录在这里的人物</h3><p class="map-people"><span v-for="actor in actors" :key="actor.actorKey"><MapIcon name="person" />{{ actor.displayName }}</span></p></section>
            <section v-if="connections.length" class="map-detail-section"><h3>相连的地方</h3><button v-for="connection in connections" :key="connection.link.id" type="button" class="map-connection" @click="$emit('select', connection.location.key)"><MapIcon name="route" /><span><strong>{{ connection.location.name }}</strong><small>{{ connection.link.label || MAP_LINK_LABELS[connection.link.kind] }}{{ connection.link.bidirectional ? '' : connection.outgoing ? ' · 单向前往' : ' · 仅可从对面到达' }}</small></span><MapIcon name="next" /></button></section>
            <p class="map-detail-footnote">查看地图不会改变你在故事中的位置</p>
        </div>
    </section>
</template>
