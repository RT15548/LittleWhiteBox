<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { IslandView } from '../service.js';
import type { Operation, Point } from '../model.js';
import type { ObservedItem } from '../food.js';
import { BLUEPRINTS, ITEMS } from '../survival-content.js';
import { COPY as c } from '../copy.js';
import { distance, withinReach } from '../space.js';
import { groupMaterials, selectMaterials } from './material-selection.js';
const props = defineProps<{ sites: NonNullable<IslandView['player']>['structures']; items: ObservedItem[]; position: Point; disabled: boolean }>();
const emit = defineEmits<{ act: [operation: Operation]; move: [point: Point] }>();
const container = ref(''), fuel = ref(''), fuelUnits = ref(1);
const containers = computed(() => props.items.filter(i => i.water));
const fuels = computed(() => groupMaterials(props.items.filter(i => ITEMS[i.kind].materials.fuel)));
const fuelGroup = computed(() => fuels.value.find(group => group.key === fuel.value));
const fuelInputs = computed(() => selectMaterials(fuels.value, { [fuel.value]: fuelUnits.value }));
const enoughFuel = computed(() => !!fuelGroup.value && !!fuelInputs.value?.length
    && ITEMS[fuelGroup.value.kind].materials.fuel! * fuelUnits.value >= 1);
watch(fuel, () => { fuelUnits.value = fuelGroup.value ? Math.ceil(1 / ITEMS[fuelGroup.value.kind].materials.fuel!) : 1; });
const tinder = computed(() => props.items.find(i => i.kind === 'tinder')), drill = computed(() => props.items.find(i => i.kind === 'fire_drill'));
const near = (p: Point) => withinReach(props.position, p);
function fillAmount(stock: number) {
    const item = containers.value.find(i => i.id === container.value);
    return item ? Math.max(0, Math.floor(Math.min(250, stock, ITEMS[item.kind].capacity - item.water!.millilitres))) : 0;
}
function ignite(site: string) { if (tinder.value && drill.value) { emit('act', { kind: 'work', task: { kind: 'ignite', site, tinder: tinder.value.id, drill: drill.value.id } }); } }
function addFuel(site: string) { if (enoughFuel.value) { emit('act', { kind: 'work', task: { kind: 'fuel', site, materials: fuelInputs.value! } }); } }
</script>
<template>
    <section v-if="sites.length" class="island-sites">
        <article v-for="site in sites" :key="site.id" class="island-site">
            <header><strong>{{ BLUEPRINTS[site.kind].name }}</strong><small>{{ c.distance(distance(position,site.position)) }}</small></header>
            <button v-if="!near(site.position)" :disabled="disabled" @click="emit('move',site.position)">{{ c.approach }}</button>
            <button v-else-if="site.workLeft" :disabled="disabled" @click="emit('act',{kind:'construct',site:site.id})">{{ c.work }}</button>
            <template v-else>
                <template v-if="site.kind === 'firepit'">
                    <small>{{ site.burning ? c.fireBurning : c.fireUnlit }} · {{ site.fuelSeconds ? c.fuelTime(site.fuelSeconds) : c.fireNeedsFuel }}</small>
                    <div class="island-site-row"><select v-model="fuel" :aria-label="c.fuel"><option value="" disabled>{{ c.materials }}</option><option v-for="group in fuels" :key="group.key" :value="group.key">{{ ITEMS[group.kind].name }} × {{ group.quantity }}</option></select><input v-if="fuelGroup" v-model.number="fuelUnits" type="number" min="1" :max="fuelGroup.quantity" :aria-label="`${c.fuel} · ${c.quantity}`"><button :disabled="disabled || !enoughFuel" @click="addFuel(site.id)">{{ c.fuel }}</button></div>
                    <button :disabled="disabled || site.burning || !site.fuelSeconds || !tinder || !drill" @click="ignite(site.id)">{{ c.fire }}</button>
                    <div class="island-site-row"><select v-model="container" :aria-label="c.waterContainer"><option value="" disabled>{{ c.waterContainer }}</option><option v-for="i in containers.filter(i=>ITEMS[i.kind].heatSafe && i.water!.millilitres)" :key="i.id" :value="i.id">{{ ITEMS[i.kind].name }}</option></select><button :disabled="disabled || !site.burning || !container" @click="emit('act',{kind:'work',task:{kind:'boil',site:site.id,container}})">{{ c.boil }}</button></div>
                </template>
                <template v-if="site.water"><small>{{ Math.floor(site.water.millilitres) }} ml</small><div class="island-site-row"><select v-model="container" :aria-label="c.waterContainer"><option value="" disabled>{{ c.waterContainer }}</option><option v-for="i in containers" :key="i.id" :value="i.id">{{ ITEMS[i.kind].name }}</option></select><button :disabled="disabled || !fillAmount(site.water.millilitres)" @click="emit('act',{kind:'work',task:{kind:'fill',source:site.id,container,millilitres:fillAmount(site.water!.millilitres)}})">{{ c.fill }}</button></div><button :disabled="disabled || site.water.millilitres < 1" @click="emit('act',{kind:'work',task:{kind:'sip',source:site.id,millilitres:Math.min(250,Math.floor(site.water!.millilitres))}})">{{ c.sip }}</button><small>{{ c.rawWaterRisk }}</small></template>
            </template>
        </article>
    </section>
</template>
<style scoped>
.island-sites{border-top:1px solid #d2dfd5;margin-top:22px}.island-site{padding:17px 0;border-bottom:1px solid #d2dfd5;display:grid;gap:8px}.island-site header{display:flex;justify-content:space-between;gap:12px}.island-site strong{font-size:13px;font-weight:550}.island-site select{max-width:100%;min-width:0;flex:1;background:white;border:1px solid #c1d2c7;border-radius:4px;padding:7px}.island-site-row{display:flex;gap:7px}.island-site button{font-size:12px}
.island-site-row input{width:58px;min-width:0;border:1px solid #c1d2c7;border-radius:4px;padding:7px;background:white}
</style>
