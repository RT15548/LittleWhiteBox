<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BLUEPRINT_IDS, RECIPE_IDS, type BlueprintId, type RecipeId, type WorkTask } from '../model.js';
import type { ObservedItem } from '../food.js';
import { BLUEPRINTS, ITEMS, RECIPES, MATERIAL_NAMES, TOOL_NAMES, materialAmounts } from '../survival-content.js';
import { craftBlocker } from '../crafting.js';
import { ERRORS } from '../fault.js';
import { COPY as c } from '../copy.js';
import { groupMaterials, selectMaterials } from './material-selection.js';
const props = defineProps<{ mode: 'craft' | 'build'; items: ObservedItem[]; hasFire: boolean; disabled: boolean }>();
const emit = defineEmits<{ work: [task: WorkTask] }>();
const selected = ref<RecipeId | BlueprintId>('tear_cloth'), quantities = ref<Record<string, number>>({});
const entries = computed(() => props.mode === 'craft' ? RECIPE_IDS.map(id => ({ id, ...RECIPES[id] })) : BLUEPRINT_IDS.map(id => ({ id, ...BLUEPRINTS[id] })));
const spec = computed(() => props.mode === 'craft' ? RECIPES[selected.value as RecipeId] : BLUEPRINTS[selected.value as BlueprintId]);
const available = computed(() => props.items.filter(i => i.quantity && !i.water?.millilitres
    && (Object.keys(ITEMS[i.kind].materials).some(key => key in spec.value.needs) || 'kinds' in spec.value && i.kind in spec.value.kinds)));
const groups = computed(() => groupMaterials(available.value));
const selection = computed(() => selectMaterials(groups.value, quantities.value));
const inputs = computed(() => selection.value ?? []);
const wornInputs = computed(() => groups.value.filter(g => g.location === 'worn' && quantities.value[g.key] > 0).map(g => ITEMS[g.kind].name));
const spoiledInputs = computed(() => groups.value.some(g => g.food === 'off_odor' && quantities.value[g.key] > 0));
const amounts = computed(() => materialAmounts(inputs.value.map(m => ({ kind: available.value.find(i => i.id === m.item)!.kind, units: m.units }))));
const requirements = computed(() => [
    ...Object.entries(spec.value.needs).map(([key, amount]) => ({ name: MATERIAL_NAMES[key as keyof typeof MATERIAL_NAMES], needed: amount, chosen: amounts.value.capabilities[key as keyof typeof amounts.value.capabilities] ?? 0 })),
    ...('kinds' in spec.value ? Object.entries(spec.value.kinds).map(([key, amount]) => ({ name: ITEMS[key as keyof typeof ITEMS].name, needed: amount, chosen: amounts.value.kinds[key as keyof typeof amounts.value.kinds] ?? 0 })) : []),
]);
const enough = computed(() => selection.value !== null && requirements.value.every(r => r.chosen >= r.needed));
const blocker = computed(() => props.mode === 'craft' ? craftBlocker(selected.value as RecipeId, props.items,
    inputs.value.map(m => available.value.find(i => i.id === m.item)!), props.hasFire) : null);
const conditions = computed(() => {
    if (props.mode !== 'craft') { return []; }
    const recipe = RECIPES[selected.value as RecipeId], rows = [];
    if (recipe.toolOptions.length) { rows.push({ label: c.toolChoice(recipe.toolOptions.map(t => TOOL_NAMES[t])), ready: props.items.some(i => i.quantity > 0 && ITEMS[i.kind].tools.some(t => recipe.toolOptions.includes(t))) }); }
    if (recipe.fire) { rows.push({ label: c.nearbyFire, ready: props.hasFire }); }
    return rows;
});
function suggest() {
    const left = { ...spec.value.needs } as Record<string, number>, kinds = 'kinds' in spec.value ? { ...spec.value.kinds } as Record<string, number> : {};
    const chosen: Record<string, number> = {};
    for (const i of groups.value) {
        if (i.location === 'worn' || i.food === 'off_odor') { continue; }
        let count = 0;
        for (let n = 0; n < i.quantity; n++) {
            if (!(kinds[i.kind] > 0) && !Object.entries(ITEMS[i.kind].materials).some(([k]) => left[k] > 0)) { break; }
            count++; kinds[i.kind] = Math.max(0, (kinds[i.kind] ?? 0) - 1);
            for (const [key, amount] of Object.entries(ITEMS[i.kind].materials)) { left[key] = Math.max(0, (left[key] ?? 0) - amount); }
        }
        if (count) { chosen[i.key] = count; }
    }
    quantities.value = chosen;
}
watch(() => props.mode, () => { selected.value = props.mode === 'craft' ? 'tear_cloth' : 'shelter'; }, { immediate: true });
watch([selected, available], suggest, { immediate: true });
function submit() {
    if (!enough.value || blocker.value) { return; }
    emit('work', props.mode === 'craft' ? { kind: 'craft', recipe: selected.value as RecipeId, materials: inputs.value }
        : { kind: 'build', blueprint: selected.value as BlueprintId, materials: inputs.value });
}
</script>
<template>
    <div class="island-workshop">
        <div class="island-recipes"><button v-for="entry in entries" :key="entry.id" :aria-pressed="selected === entry.id" @click="selected = entry.id">{{ entry.name }}</button></div>
        <p class="island-recipe-result">{{ c.duration(spec.seconds) }}<template v-if="'outputs' in spec"> · {{ c.produces }} {{ Object.entries(spec.outputs).map(([kind, count]) => `${ITEMS[kind as keyof typeof ITEMS].name} × ${count}`).join('、') }}</template></p>
        <h3>{{ c.materials }}</h3>
        <ul class="island-requirements"><li v-for="r in requirements" :key="r.name" :class="{missing:r.chosen < r.needed}"><span>{{ r.name }}</span><span>{{ Number(r.chosen.toFixed(1)) }} / {{ r.needed }}</span></li></ul>
        <p v-if="!available.length">{{ c.noMaterials }}</p>
        <label v-for="group in groups" :key="group.key" class="island-material"><span>{{ ITEMS[group.kind].name }}<small> · {{ c.materialAvailable(group.quantity) }}<template v-if="group.location === 'worn'"> · {{ c.worn }}</template><template v-else-if="group.location === 'ground'"> · {{ c.ground }}</template></small><small v-if="group.food" class="island-material-food">{{ c.foodCondition[group.food] }}</small></span><input v-model.number="quantities[group.key]" type="number" min="0" :max="group.quantity" :aria-label="`${ITEMS[group.kind].name} · ${group.food ? c.foodCondition[group.food] + ' · ' : ''}${c.quantity}`"></label>
        <p v-if="wornInputs.length" class="island-material-warning">{{ c.dismantleWarning(wornInputs) }}</p>
        <p v-if="spoiledInputs" class="island-material-warning">{{ c.spoiledCooking }}</p>
        <template v-if="conditions.length"><h3>{{ c.tools }}</h3><ul class="island-requirements"><li v-for="condition in conditions" :key="condition.label" :class="{missing:!condition.ready}"><span>{{ condition.label }}</span><span>{{ condition.ready ? c.ready : c.missingCondition }}</span></li></ul><small>{{ c.toolsKept }}</small></template>
        <p v-if="blocker" class="island-material-warning" role="status">{{ ERRORS[blocker] }}</p>
        <button class="island-primary" :disabled="disabled || !enough || !!blocker" @click="submit">{{ enough ? mode === 'craft' ? c.make : c.place : c.materialMissing }}</button>
    </div>
</template>
<style scoped>
.island-material-food{display:block;margin-top:4px;color:#8a5b31;line-height:1.6}
.island-recipes{display:flex;flex-wrap:wrap;gap:6px}.island-recipes button{background:#eaf2ed;border:1px solid #cad9d1;border-radius:5px;padding:8px 10px}.island-recipes button[aria-pressed=true]{background:#2a6968;color:white}.island-material{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid #dde5de}.island-material input{width:64px;border:1px solid #b8cbc2;padding:7px;border-radius:4px}.island-workshop h3{font-size:14px;margin:20px 0 6px}.island-workshop>.island-primary{margin-top:18px;width:100%}
.island-workshop .island-material-warning{margin-top:12px;color:#8a5b31;font-size:12px;line-height:1.8}
.island-recipe-result{color:#58716b;font-size:13px;margin-top:14px}.island-requirements{list-style:none;padding:0;margin:8px 0 12px;font-size:13px}.island-requirements li{display:flex;justify-content:space-between;gap:16px;padding:4px 0;color:#2b6c5a}.island-requirements li.missing{color:#89572e}.island-workshop>small{color:#58716b}
</style>
