<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { IslandView } from '../service.js';
import type { Operation, PersonId, Point, Treatment, Wound } from '../model.js';
import { CARE } from '../survival-content.js';
import { withinReach } from '../space.js';
import { COPY as c } from '../copy.js';
import WashWater from './WashWater.vue';
const props = defineProps<{ observation: NonNullable<IslandView['player']>; subject: PersonId; disabled: boolean }>();
const emit = defineEmits<{ act: [operation: Operation]; move: [position: Point] }>();
const wound = ref<Wound>('skin'), mode = ref<Treatment['kind']>('rinse'), cloth = ref('');
const isSelf = computed(() => props.subject === props.observation.observer);
const near = computed(() => isSelf.value || props.observation.people.some(p => p.id === props.subject && withinReach(p.position, props.observation.self.position)));
const blocked = computed(() => props.disabled || !!props.observation.self.activity || !near.value);
const fabrics = computed(() => props.observation.items.filter(i => i.kind === 'cloth' && i.cleanliness === 'clean' && i.wetness <= CARE.dressingMaxWetness
    && (i.location.kind === 'carried' && i.location.person === props.observation.observer || i.location.kind === 'ground' && withinReach(i.location.position, props.observation.self.position))));
watch(fabrics, items => { if (!items.some(i => i.id === cloth.value)) { cloth.value = items[0]?.id ?? ''; } }, { immediate: true });
function act(treatment: Treatment) {
    if (blocked.value) { return; }
    emit('act', isSelf.value ? { kind: 'work', task: { kind: 'tend', subject: props.subject, wound: wound.value, treatment } }
        : { kind: 'offer_care', to: props.subject, wound: wound.value, treatment });
}
</script>
<template>
    <section class="island-care">
        <h3>{{ c.care }}</h3>
        <label>{{ c.woundPart }}<select v-model="wound" :disabled="blocked"><option v-for="(label,key) in c.wounds" :key="key" :value="key">{{ label }}</option></select></label>
        <nav><button v-for="(label,key) in c.treatments" :key="key" :aria-pressed="mode===key" :disabled="blocked" @click="mode=key">{{ label }}</button></nav>
        <WashWater v-if="mode==='rinse'" :observation="observation" :minimum="CARE.rinseMl" :verb="isSelf ? c.treatments.rinse : c.offerCare" :disabled="blocked" clean-only @use="(supply,millilitres)=>act({kind:'rinse',supply,millilitres})" @move="emit('move',$event)" />
        <template v-else-if="mode==='dress'"><label v-if="fabrics.length">{{ c.careCloth }}<select v-model="cloth" :disabled="blocked"><option v-for="i in fabrics" :key="i.id" :value="i.id">{{ c.careCloth }} · {{ i.quantity }} · {{ i.location.kind==='ground' ? c.ground : c.carried }}</option></select></label><p v-else>{{ c.noCareCloth }}</p><button :disabled="blocked || !cloth" @click="act({kind:'dress',item:cloth})">{{ isSelf ? c.treatments.dress : c.offerCare }}</button></template>
        <button v-else :disabled="blocked" @click="act({kind:'uncover'})">{{ isSelf ? c.treatments.uncover : c.offerCare }}</button>
        <small>{{ c.careNote }}</small>
    </section>
</template>
<style scoped>
.island-care{margin-top:22px;border-top:1px solid var(--island-line);padding-top:12px}.island-care h3{font-size:14px}.island-care label{display:grid;gap:6px;font-size:12px;margin:10px 0}.island-care select{min-height:40px;max-width:100%;border:1px solid var(--island-line);background:white;padding:6px;border-radius:4px}.island-care nav{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}.island-care button{min-height:40px}.island-care button[aria-pressed=true]{box-shadow:inset 0 -2px var(--island-ink)}.island-care small{display:block;margin-top:10px;font-size:12px;line-height:1.6}
</style>
