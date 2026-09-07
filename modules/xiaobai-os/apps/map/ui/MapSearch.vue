<script setup lang="ts">
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';
import { computed, ref } from 'vue';
import type { MapAtlas } from '../../../domains/map/types.js';
import MapIcon from './MapIcon.vue';
import { MAP_SCALE_LABELS } from './map-presentation.js';
const props = defineProps<{ atlas: MapAtlas }>();
defineEmits<{ close: []; select: [key: string] }>();
const query = ref('');
const filter = ref('all');
const results = computed(() => props.atlas.locations.filter(place => {
    const match = [place.name, place.brief, props.atlas.locations.find(parent => parent.key === place.parent)?.name].some(value => value?.toLocaleLowerCase().includes(query.value.trim().toLocaleLowerCase()));
    return match && (filter.value === 'all' || (filter.value === 'unvisited' ? place.status !== 'visited' : place.status === 'visited'));
}));
</script>
<template>
    <AppDialog class="map-dialog map-search-dialog" aria-label="查找地点" @close="$emit('close')">
        <header class="map-search-input"><MapIcon name="search" /><input v-model="query" type="search" aria-label="搜索地点" placeholder="想去哪里？" autofocus><button type="button" @click="$emit('close')">取消</button></header>
        <nav class="map-search-filters" aria-label="地点筛选"><button v-for="option in [{id:'all', name:'全部地点'}, {id:'unvisited', name:'还没去过'}, {id:'visited', name:'已到访'}]" :key="option.id" type="button" :aria-pressed="filter === option.id" @click="filter = option.id">{{ option.name }}</button></nav>
        <div class="map-search-results"><small>{{ results.length }} 个地点</small><button v-for="place in results" :key="place.key" type="button" class="map-search-result" @click="$emit('select', place.key)"><span class="map-result-icon"><MapIcon name="pin" /></span><span><strong>{{ place.name }}</strong><small>{{ MAP_SCALE_LABELS[place.scale] }} · {{ place.status === 'visited' ? '已到访' : '未到访' }}</small><p v-if="place.brief">{{ place.brief }}</p></span><MapIcon name="next" /></button><div v-if="!results.length" class="map-search-empty"><MapIcon name="search" /><h3>还没有找到这个地点</h3><p>试试其他名称，或看看全部地点。</p></div></div>
    </AppDialog>
</template>
