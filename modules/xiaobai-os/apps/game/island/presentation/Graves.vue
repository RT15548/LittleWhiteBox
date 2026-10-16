<script setup lang="ts">
import type { observe } from '../scene.js';
import type { Operation, Point } from '../model.js';
import { COPY as c } from '../copy.js';
import { RULES } from '../content.js';
import { distance, withinReach } from '../space.js';
import DiggingWork from './DiggingWork.vue';
const props = defineProps<{ observation: ReturnType<typeof observe>; disabled: boolean }>();
const emit = defineEmits<{ act: [operation: Operation]; move: [point: Point] }>();
function approach(to: Point) {
    const from = props.observation.self.position, span = distance(from, to);
    if (withinReach(from, to)) { return; }
    const fraction = (span - RULES.reachMetres * .8) / span;
    emit('move', { x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction });
}
</script>
<template>
    <section v-if="observation.graves.length">
        <h3>{{ c.groundTraces }}</h3>
        <article v-for="grave in observation.graves" :key="grave.grave" class="island-item">
            <strong>{{ c.grave }}</strong><small> · {{ c.distance(distance(observation.self.position, grave.position)) }}</small>
            <button v-if="!withinReach(observation.self.position, grave.position)" :disabled="disabled || !!observation.self.activity" @click="approach(grave.position)">{{ c.approach }}</button>
            <DiggingWork v-else :observation="observation" :task="{ kind: 'exhume_body', grave: grave.grave }" :disabled="disabled || !!observation.self.activity" @work="emit('act', { kind: 'work', task: $event })" />
        </article>
    </section>
</template>
