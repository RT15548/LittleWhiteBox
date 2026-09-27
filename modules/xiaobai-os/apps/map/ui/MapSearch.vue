<script setup lang="ts">
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';
import { computed, ref } from 'vue';
import MapIcon from './MapIcon.vue';
import { MAP_SCALE_LABELS } from './map-presentation.js';
import { searchMapScope, type MapBrowseScope, type MapBrowseFilter } from './map-browse.js';
import { MAP_BROWSE_COPY, MAP_NAV_COPY, MAP_VISIT_LABELS, mapBrowseCount } from './map-copy.js';
const props = defineProps<{ scope: MapBrowseScope; title: string; initialFilter: MapBrowseFilter }>();
defineEmits<{ close: []; select: [key: string] }>();
const query = ref('');
const filter = ref(props.initialFilter);
const copy = computed(() => MAP_BROWSE_COPY[props.scope.kind]);
const options = computed(() => [
    { id: 'all' as const, name: copy.value.all },
    { id: 'unvisited' as const, name: MAP_VISIT_LABELS.unvisited },
    { id: 'visited' as const, name: MAP_VISIT_LABELS.visited },
]);
const results = computed(() => searchMapScope(props.scope, query.value, filter.value));
</script>
<template>
    <AppDialog class="map-dialog map-search-dialog" :aria-label="copy.search" @close="$emit('close')">
        <header class="map-search-input"><MapIcon name="search" /><input v-model="query" type="search" :aria-label="copy.search" :placeholder="copy.search" autofocus><button type="button" @click="$emit('close')">{{ MAP_NAV_COPY.cancel }}</button></header>
        <h2 class="map-search-scope">{{ title }}</h2>
        <nav class="map-search-filters" :aria-label="MAP_NAV_COPY.filters"><button v-for="option in options" :key="option.id" type="button" :aria-pressed="filter === option.id" @click="filter = option.id">{{ option.name }}</button></nav>
        <div class="map-search-results"><small>{{ mapBrowseCount(scope.kind, results.length) }}</small><button v-for="place in results" :key="place.key" type="button" class="map-search-result" @click="$emit('select', place.key)"><span class="map-result-icon"><MapIcon :name="scope.kind === 'world' ? 'globe' : 'pin'" /></span><span><strong>{{ place.name }}</strong><small>{{ MAP_SCALE_LABELS[place.scale] }} · {{ MAP_VISIT_LABELS[place.status === 'visited' ? 'visited' : 'unvisited'] }}</small><p v-if="place.brief">{{ place.brief }}</p></span><MapIcon name="next" /></button><div v-if="!results.length" class="map-search-empty"><MapIcon name="search" /><h3>{{ copy.notFound }}</h3><p>{{ MAP_NAV_COPY.searchHint }}</p></div></div>
    </AppDialog>
</template>
