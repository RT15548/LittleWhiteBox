<script setup lang="ts">
import type { IslandView } from '../service.js';
import type { PersonId } from '../model.js';
import { COPY as c } from '../copy.js';
import { ITEMS } from '../survival-content.js';
import FoodReadout from './FoodReadout.vue';
defineProps<{ offers: NonNullable<IslandView['player']>['offers']; disabled: boolean }>();
const emit = defineEmits<{ accept: [from: PersonId]; decline: [from: PersonId] }>();
</script>
<template>
    <div v-if="offers.some(o=>o.to==='player')" class="island-incoming" :aria-label="c.incoming">
        <div v-for="o in offers.filter(o=>o.to==='player')" :key="o.from"><button :disabled="disabled" @click="emit('accept',o.from)"><span>{{ c.receive }} · {{ ITEMS[o.form].name }} × {{ o.units }}<FoodReadout :water="o.water" :food="o.food" /></span><small>{{ c.offeredBy(o.from) }}</small></button><button :disabled="disabled" @click="emit('decline',o.from)">{{ c.declineOffer }}</button></div>
    </div>
</template>
<style scoped>
.island-incoming{display:grid;gap:8px;padding:12px 0}.island-incoming>div{display:flex;gap:6px;align-items:stretch}.island-incoming button{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:5px;text-align:left;font-size:12px;background:#fff}.island-incoming button:first-child{flex:1}.island-incoming button:last-child{flex-shrink:0}.island-incoming small{color:var(--island-muted)}
</style>
