<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { IslandView } from '../service.js';
import type { Point, WorkTask } from '../model.js';
import { HYGIENE, BLUEPRINTS, ITEMS, RESOURCE_RULES } from '../survival-content.js';
import { distance, withinReach } from '../space.js';
import { buildingGround } from '../environment.js';
import { COPY as c } from '../copy.js';
const props = defineProps<{ observation: NonNullable<IslandView['player']>; disabled: boolean }>();
const emit = defineEmits<{ work: [task: WorkTask]; move: [point: Point] }>();
const selected = ref(''), amount = ref<number>(HYGIENE.portionMl);
const supplies = computed(() => {
    const view = props.observation;
    const containers = view.items.filter(i => i.water && (i.location.kind === 'ground' || i.location.kind === 'carried' && i.location.person === view.observer))
        .map(i => ({ supply: { kind: 'container' as const, id: i.id }, name: ITEMS[i.kind].name, available: i.water!.millilitres,
            position: i.location.kind === 'ground' ? i.location.position : view.self.position }));
    const sources = view.resources.filter(r => r.kind === 'seep').map(r => ({ supply: { kind: 'source' as const, id: r.id },
        name: RESOURCE_RULES[r.kind].name, available: r.stock, position: r.position }));
    const collectors = view.structures.filter(s => s.water && !s.workLeft).map(s => ({ supply: { kind: 'source' as const, id: s.id },
        name: BLUEPRINTS[s.kind].name, available: s.water!.millilitres, position: s.position }));
    return [...containers, ...sources, ...collectors].filter(s => s.available >= HYGIENE.minimumWashMl)
        .map(s => ({ ...s, key: `${s.supply.kind}:${s.supply.id}` }));
});
watch(supplies, values => { if (!values.some(s => s.key === selected.value)) { selected.value = values[0]?.key ?? ''; } }, { immediate: true });
const chosen = computed(() => supplies.value.find(s => s.key === selected.value));
const near = (position: Point) => withinReach(props.observation.self.position, position);
function wash() {
    if (!chosen.value) { return; }
    if (!near(chosen.value.position)) { emit('move', chosen.value.position); return; }
    emit('work', { kind: 'wash', supply: chosen.value.supply, millilitres: amount.value });
}
</script>
<template>
    <section class="island-hygiene">
        <h3>{{ c.washSupply }}</h3>
        <form v-if="chosen" @submit.prevent="wash">
            <select v-model="selected" :aria-label="c.washSupply" :disabled="disabled"><option v-for="s in supplies" :key="s.key" :value="s.key">{{ s.name }} · {{ Math.floor(s.available) }} ml · {{ c.distance(distance(observation.self.position,s.position)) }}</option></select>
            <label>{{ c.washAmount }}<input v-model.number="amount" type="number" :min="HYGIENE.minimumWashMl" :max="Math.min(10000,Math.floor(chosen.available))" :disabled="disabled"></label>
            <button :disabled="disabled || near(chosen.position) && (!Number.isSafeInteger(amount) || amount < HYGIENE.minimumWashMl || amount > Math.min(10000,chosen.available))">{{ near(chosen.position) ? c.wash : c.approach }}</button>
            <small>{{ c.washNote }}</small>
        </form>
        <p v-else>{{ c.noWashWater }}</p>
        <template v-if="observation.waste.length">
            <h3>{{ c.groundTraces }}</h3>
            <article v-for="w in observation.waste" :key="w.id" class="island-item">
                <span>{{ c.wasteKind[w.kind] }} · {{ c.distance(distance(observation.self.position,w.position)) }}</span>
                <button v-if="w.kind !== 'disturbed_ground' && buildingGround(w.position)" :disabled="disabled" @click="near(w.position) ? emit('work',{kind:'cover_waste',waste:w.id}) : emit('move',w.position)">{{ near(w.position) ? c.cover : c.approach }}</button>
            </article>
        </template>
    </section>
</template>
<style scoped>
.island-hygiene{margin-top:22px;border-top:1px solid var(--island-line)}.island-hygiene h3{font-size:13px;font-weight:600;margin:18px 0 10px}.island-hygiene form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}.island-hygiene select,.island-hygiene small{grid-column:1/-1}.island-hygiene select,.island-hygiene input{width:100%;min-width:0;min-height:38px;border:1px solid var(--island-line);border-radius:4px;background:white;padding:7px}.island-hygiene label{display:grid;gap:5px;font-size:12px}.island-hygiene button{align-self:end;min-height:38px}.island-hygiene small,.island-hygiene p{font-size:12px;line-height:1.6}
</style>
