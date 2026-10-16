<script setup lang="ts">
import type { IslandView } from '../service.js';
import type { Point, WorkTask } from '../model.js';
import { HYGIENE } from '../survival-content.js';
import { distance, withinReach } from '../space.js';
import { buildingGround } from '../environment.js';
import { COPY as c } from '../copy.js';
import WashWater from './WashWater.vue';
const props = defineProps<{ observation: NonNullable<IslandView['player']>; disabled: boolean }>();
const emit = defineEmits<{ work: [task: WorkTask]; move: [point: Point] }>();
const near = (position: Point) => withinReach(props.observation.self.position, position);
</script>
<template>
    <section class="island-hygiene">
        <h3>{{ c.wash }}</h3>
        <WashWater
            :observation="observation" :minimum="HYGIENE.minimumWashMl" :verb="c.wash" :disabled="disabled"
            @use="(supply,millilitres)=>emit('work',{kind:'wash',supply,millilitres})" @move="emit('move',$event)"
        />
        <small>{{ c.washNote }}</small>
        <template v-if="observation.waste.length">
            <h3>{{ c.groundTraces }}</h3>
            <article v-for="w in observation.waste" :key="w.id" class="island-item">
                <span>{{ c.wasteKind[w.kind] }} · {{ c.distance(distance(observation.self.position,w.position)) }}</span>
                <small v-if="w.faded">{{ c.fadedTrace }}</small>
                <button
                    v-if="w.kind !== 'disturbed_ground' && buildingGround(w.position)" :disabled="disabled"
                    @click="near(w.position) ? emit('work',{kind:'cover_waste',waste:w.id}) : emit('move',w.position)"
                >
                    {{ near(w.position) ? c.cover : c.approach }}
                </button>
            </article>
        </template>
    </section>
</template>
<style scoped>
.island-hygiene{margin-top:22px;border-top:1px solid var(--island-line)}.island-hygiene h3{font-size:13px;font-weight:600;margin:18px 0 10px}.island-hygiene small{font-size:12px;line-height:1.6}
</style>
