<script setup lang="ts">
import { CLOTHING_COPY as c, CLOTHING_SLOTS, type ClothingChange } from '../content/clothing.js';
defineProps<{ clothing: ClothingChange }>();
</script>

<template>
    <dl class="ember-clothing-list">
        <template v-for="(label, slot) in CLOTHING_SLOTS" :key="slot">
            <template v-if="clothing[slot] !== undefined">
                <dt>{{ label }}</dt><dd :data-clothing-slot="slot" :class="{ 'is-absent': !clothing[slot] }">{{ clothing[slot] || c.absent }}</dd>
            </template>
        </template>
    </dl>
</template>

<style scoped>
.ember-clothing-list { display:grid; grid-template-columns:auto minmax(0,1fr); gap:13px 16px; margin:16px 0 4px; font-size:13px; line-height:1.7; text-align:left; }
.ember-clothing-list dt { color:var(--ember-muted); }
.ember-clothing-list dd { margin:0; min-width:0; color:var(--ember-ink); overflow-wrap:anywhere; white-space:pre-wrap; }
.ember-clothing-list .is-absent { color:var(--ember-muted); }
</style>
