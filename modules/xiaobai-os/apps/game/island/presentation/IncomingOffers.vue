<script setup lang="ts">
import type { IslandView } from '../service.js';
import type { PersonId } from '../model.js';
import { COPY as c } from '../copy.js';
import { ITEMS } from '../survival-content.js';
import FoodReadout from './FoodReadout.vue';
defineProps<{ offers: NonNullable<IslandView['player']>['offers']; disabled: boolean }>();
const emit = defineEmits<{ accept: [from: PersonId] }>();
</script>
<template>
    <div v-if="offers.some(o=>o.to==='player')" class="island-incoming" :aria-label="c.incoming">
        <button v-for="o in offers.filter(o=>o.to==='player')" :key="o.from" :disabled="disabled" @click="emit('accept',o.from)"><span>{{ c.receive }} · {{ ITEMS[o.form].name }} × {{ o.units }}<FoodReadout :water="o.water" :food="o.food" /></span><small>{{ c.offeredBy(o.from) }}</small></button>
    </div>
</template>
<style scoped>
.island-incoming{display:grid;gap:5px;max-height:130px;overflow:auto;padding:10px 12px;background:#ecf5ef;border-top:1px solid var(--island-line)}.island-incoming button{display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;font-size:12px;background:#fff;border-color:#abc8bc}.island-incoming small{flex-shrink:0}
</style>
