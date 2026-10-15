<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ObservedItem } from '../food.js';
import type { WorkTask } from '../model.js';
import { HYGIENE, ITEMS } from '../survival-content.js';
import { COPY as c } from '../copy.js';
const props = defineProps<{ item: ObservedItem; accessible: ObservedItem[]; disabled: boolean }>();
const emit = defineEmits<{ work: [task: WorkTask] }>();
const pouring = ref(false), target = ref(''), amount = ref(250);
const available = computed(() => Math.floor(props.item.water?.millilitres ?? 0));
const containers = computed(() => props.accessible.filter(i => i.id !== props.item.id && i.water && i.water.millilitres < ITEMS[i.kind].capacity));
const limit = computed(() => {
    const to = containers.value.find(i => i.id === target.value);
    return to ? Math.floor(Math.min(available.value, ITEMS[to.kind].capacity - to.water!.millilitres)) : 0;
});
watch(containers, items => { if (!items.some(i => i.id === target.value)) { target.value = items[0]?.id ?? ''; } }, { immediate: true });
watch(available, (value, before) => { if (value < before) { pouring.value = false; } });
function openPour() { pouring.value = true; amount.value = Math.min(250, limit.value); }
function pour() { emit('work', { kind: 'pour', from: props.item.id, container: target.value, millilitres: amount.value }); }
</script>
<template>
    <template v-if="available">
        <div class="island-item-actions">
            <button :disabled="disabled" @click="emit('work',{kind:'drink',container:item.id,millilitres:Math.min(250,available)})">{{ item.water?.food === 'off_odor' ? c.drinkDespiteSpoilage : c.drink }}</button>
            <button v-if="available >= HYGIENE.minimumWashMl" :disabled="disabled" @click="emit('work',{kind:'wash',supply:{kind:'container',id:item.id},millilitres:Math.min(HYGIENE.portionMl,available)})">{{ c.wash }}</button>
            <button v-if="containers.length && !pouring" :disabled="disabled" @click="openPour">{{ c.pour }}</button>
            <button :disabled="disabled" @click="emit('work',{kind:'empty',container:item.id,millilitres:available})">{{ c.emptyLiquid }}</button>
        </div>
        <form v-if="pouring" class="island-pour" @submit.prevent="pour">
            <label>{{ c.pourTo }}<select v-model="target" :disabled="disabled"><option v-for="container in containers" :key="container.id" :value="container.id">{{ ITEMS[container.kind].name }} · {{ Math.floor(container.water!.millilitres) }} ml · {{ container.location.kind === 'ground' ? c.ground : c.carried }}</option></select></label>
            <label>{{ c.pourAmount }}<input v-model.number="amount" type="number" min="1" :max="limit" :disabled="disabled"></label>
            <div class="island-item-actions"><button :disabled="disabled || !Number.isSafeInteger(amount) || amount < 1 || amount > limit">{{ c.pour }}</button><button type="button" :disabled="disabled" @click="pouring=false">{{ c.cancel }}</button></div>
        </form>
    </template>
</template>
<style scoped>
.island-pour{display:grid;grid-template-columns:minmax(0,1fr) 100px;gap:10px;margin-top:12px}.island-pour label{display:grid;gap:5px;font-size:12px}.island-pour select,.island-pour input{width:100%;min-width:0;min-height:36px;border:1px solid var(--island-line);padding:5px;background:white;border-radius:4px}.island-pour .island-item-actions{grid-column:1/-1}
</style>
