<script setup lang="ts">
import { CLOTHING_COPY as c, CLOTHING_SLOTS, type ClothingChange } from '../content/clothing.js';
import ClothingList from './ClothingList.vue';
defineProps<{ clothing: ClothingChange }>();
</script>

<template>
    <details class="ember-clothing-feedback">
        <summary>{{ c.changed }}<span><template v-for="(label, slot) in CLOTHING_SLOTS" :key="slot"><small v-if="clothing[slot] !== undefined">{{ label }}</small></template></span></summary>
        <ClothingList :clothing="clothing" />
    </details>
</template>

<style scoped>
.ember-clothing-feedback { padding:8px 8px 0; color:var(--ember-muted); font-size:12px; line-height:1.7; }
.ember-clothing-feedback summary { cursor:pointer; }
.ember-clothing-feedback summary::marker { font-size:10px; }
.ember-clothing-feedback summary span { display:inline-flex; flex-wrap:wrap; gap:8px; margin-left:10px; }
.ember-clothing-feedback small { font-size:inherit; }
</style>
