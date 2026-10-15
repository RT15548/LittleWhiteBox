<script setup lang="ts">
import { computed } from 'vue';
import type { IslandView } from '../service.js';
import type { Point } from '../model.js';
import { BLUEPRINTS, RESOURCE_RULES } from '../survival-content.js';
import { distance } from '../space.js';
import { COPY as c } from '../copy.js';
const props = defineProps<{ observation: NonNullable<IslandView['player']>; disabled: boolean }>();
const emit = defineEmits<{ move: [position: Point] }>();
const places = computed(() => [...props.observation.knownPlaces].sort((a, b) => distance(props.observation.self.position, a.position) - distance(props.observation.self.position, b.position)));
</script>
<template>
    <p class="island-known-note">{{ c.knownPlacesNote }}</p>
    <p v-if="!places.length">{{ c.noKnownPlaces }}</p>
    <article v-for="place in places" :key="`${place.subject.kind}:${place.subject.id}`" class="island-item">
        <div><strong>{{ place.subject.kind === 'resource' ? RESOURCE_RULES[place.subject.form].name : BLUEPRINTS[place.subject.form].name }}</strong><small>{{ c.distance(distance(observation.self.position,place.position)) }} · {{ c.firstObserved }} {{ c.time(place.observedAt) }}</small></div>
        <div class="island-item-actions"><button :disabled="disabled" @click="emit('move',place.position)">{{ c.goThere }}</button></div>
    </article>
</template>
<style scoped>.island-known-note{font-size:12px;line-height:1.8;color:#657d73;margin-bottom:12px}</style>
