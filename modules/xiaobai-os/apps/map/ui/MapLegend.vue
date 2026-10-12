<script setup lang="ts">
import { MAP_NAV_COPY } from './map-copy.js';
</script>
<template>
    <div class="map-legend-content">
        <strong>{{ MAP_NAV_COPY.legendTitle }}</strong>
        <p><i class="map-key-current" />{{ MAP_NAV_COPY.legendCurrent }} <i class="map-key-place" />{{ MAP_NAV_COPY.legendPlace }}</p>
        <p>{{ MAP_NAV_COPY.legendRoutes }}</p>
        <small>{{ MAP_NAV_COPY.legend }}</small>
    </div>
</template>
