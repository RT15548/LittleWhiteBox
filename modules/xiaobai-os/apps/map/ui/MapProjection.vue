<script setup lang="ts">
import type { MapDomainV1 } from '../../../domains/map/types.js';
import MapBrowser from './MapBrowser.vue';
defineProps<{ map: MapDomainV1 | null; chatIdentity: string; message: string }>();
</script>
<template>
    <MapBrowser compact class="map-projection-view" :map="map" :chat-identity="chatIdentity">
        <template #feedback><aside v-if="message" class="map-notice" role="status"><p>{{ message }}</p></aside></template>
    </MapBrowser>
</template>
