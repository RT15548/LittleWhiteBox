<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { IslandView } from '../service.js';
import type { Point, WashSupply } from '../model.js';
import { BLUEPRINTS, ITEMS, RESOURCE_RULES } from '../survival-content.js';
import { distance, withinReach } from '../space.js';
import { COPY as c } from '../copy.js';
const props = defineProps<{ observation: NonNullable<IslandView['player']>; minimum: number; verb: string; disabled: boolean; cleanOnly?: boolean; excludeItem?: string }>();
const emit = defineEmits<{ use: [supply: WashSupply, millilitres: number]; move: [position: Point] }>();
const selected = ref(''), amount = ref(props.minimum);
const options = computed(() => {
    const v = props.observation;
    const result: { key: string; name: string; supply: WashSupply; available: number; position: Point }[] = [];
    for (const i of v.items) {
        if (!i.water || i.id === props.excludeItem || !(i.location.kind === 'ground' || i.location.kind === 'carried' && i.location.person === v.observer)) { continue; }
        if (props.cleanOnly && (i.water.quality !== 'treated' || i.water.food !== null || i.cleanliness !== 'clean')) { continue; }
        result.push({ key: `container:${i.id}`, name: ITEMS[i.kind].name, supply: { kind: 'container', id: i.id }, available: i.water.millilitres,
            position: i.location.kind === 'ground' ? i.location.position : v.self.position });
    }
    if (!props.cleanOnly) {
        for (const r of v.resources.filter(r => r.kind === 'seep')) { result.push({ key: r.id, name: RESOURCE_RULES[r.kind].name, supply: { kind: 'source', id: r.id }, available: r.stock, position: r.position }); }
        for (const s of v.structures.filter(s => s.water && !s.workLeft)) { result.push({ key: s.id, name: BLUEPRINTS[s.kind].name, supply: { kind: 'source', id: s.id }, available: s.water!.millilitres, position: s.position }); }
        if (v.seaReachable) { result.push({ key: 'sea', name: c.seaWater, supply: { kind: 'sea' }, available: 10000, position: v.self.position }); }
    }
    return result.filter(o => o.available >= props.minimum);
});
watch(() => props.minimum, min => { amount.value = min; });
watch(options, values => { if (!values.some(v => v.key === selected.value)) { selected.value = values[0]?.key ?? ''; } }, { immediate: true });
const chosen = computed(() => options.value.find(o => o.key === selected.value));
const near = computed(() => !!chosen.value && withinReach(props.observation.self.position, chosen.value.position));
const valid = computed(() => !!chosen.value && Number.isSafeInteger(amount.value) && amount.value >= props.minimum && amount.value <= Math.min(10000, chosen.value.available));
function use() {
    if (!chosen.value || props.disabled) { return; }
    if (!near.value) { emit('move', chosen.value.position); }
    else if (valid.value) { emit('use', chosen.value.supply, amount.value); }
}
</script>
<template>
    <form v-if="chosen" class="island-wash-water" @submit.prevent="use">
        <label>{{ c.washSupply }}<select v-model="selected" :disabled="disabled"><option v-for="o in options" :key="o.key" :value="o.key">{{ o.name }}{{ o.supply.kind === 'sea' ? '' : ` · ${Math.floor(o.available)} ml · ${c.distance(distance(observation.self.position,o.position))}` }}</option></select></label>
        <label>{{ c.washAmount }}<input v-model.number="amount" type="number" :min="minimum" :max="Math.min(10000,chosen.available)" :disabled="disabled"></label>
        <button :disabled="disabled || near && !valid">{{ near ? verb : c.approach }}</button>
    </form>
    <p v-else>{{ c.noWashWater }}</p>
</template>
<style scoped>
.island-wash-water{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.island-wash-water label{display:grid;gap:5px;font-size:12px;flex:1;min-width:120px}.island-wash-water label:first-child{flex-basis:100%}.island-wash-water select,.island-wash-water input{width:100%;min-height:40px;background:white;border:1px solid var(--island-line);border-radius:4px;padding:6px}.island-wash-water button{align-self:end;min-height:40px}
</style>
