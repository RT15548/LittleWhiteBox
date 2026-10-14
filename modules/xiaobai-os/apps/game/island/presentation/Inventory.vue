<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { IslandView } from '../service.js';
import type { Operation, PersonId, Point } from '../model.js';
import type { ObservedItem as Item } from '../food.js';
import { ITEMS, WEAR_SLOTS } from '../survival-content.js';
import { CAST } from '../content.js';
import { withinReach } from '../space.js';
import { COPY as c } from '../copy.js';
import IncomingOffers from './IncomingOffers.vue';
import FoodReadout from './FoodReadout.vue';
import LiquidActions from './LiquidActions.vue';
const props = defineProps<{ observation: NonNullable<IslandView['player']>; disabled: boolean }>();
const emit = defineEmits<{ act: [operation: Operation]; move: [point: Point] }>();
function owner(item: Item) { return item.location.kind === 'ground' ? null : props.observation.people.find(p => item.location.kind !== 'ground' && p.id === item.location.person); }
const visible = computed(() => props.observation.items.filter(i => i.location.kind === 'ground' || i.location.person === 'player' || owner(i)?.body.kind === 'dead'));
const held = (item: Item) => item.location.kind !== 'ground' && item.location.person === 'player';
function position(item: Item) { return item.location.kind === 'ground' ? item.location.position : owner(item)?.position ?? props.observation.self.position; }
const near = (item: Item) => withinReach(props.observation.self.position, position(item));
const accessible = computed(() => visible.value.filter(i => held(i) || i.location.kind === 'ground' && near(i)));
const busy = computed(() => props.disabled || !!props.observation.self.activity);
const outgoing = computed(() => props.observation.self.activity?.kind === 'offer' ? props.observation.self.activity : null);
const recipients = computed(() => props.observation.people.filter(p => p.body.kind === 'living' && withinReach(props.observation.self.position, p.position)));
const offering = ref<string | null>(null), recipient = ref<PersonId | ''>(''), units = ref(1);
watch(() => props.observation, () => {
    if (outgoing.value?.item === offering.value || !visible.value.some(i => i.id === offering.value && held(i))) { offering.value = null; }
});
function selectOffer(item: string) { offering.value = item; recipient.value = recipients.value[0]?.id ?? ''; units.value = 1; }
function offer(item: string) {
    if (!recipient.value || busy.value) { return; }
    emit('act', { kind: 'offer', item, to: recipient.value, units: units.value });
}
</script>
<template>
    <div>
        <IncomingOffers :offers="observation.offers" :disabled="disabled" @accept="from => emit('act',{kind:'accept',from})" />
        <p v-if="!visible.length">{{ c.empty }}</p>
        <article v-for="item in visible" :key="item.id" class="island-item">
            <div><strong>{{ ITEMS[item.kind].name }}</strong><span> × {{ item.quantity }}<small v-if="item.location.kind === 'worn'"> · {{ c.worn }}</small><small v-else-if="item.location.kind === 'ground'"> · {{ c.ground }}</small><small v-else-if="item.location.kind === 'covering'"> · {{ c.covering }}</small></span><small v-if="owner(item)?.body.kind === 'dead' && item.location.kind !== 'covering'">{{ c.remains }}</small><FoodReadout :water="item.water" :food="item.food" /></div>
            <div class="island-item-actions">
                <button v-if="!held(item)" :disabled="busy" @click="near(item) ? emit('act',{kind:'take',item:item.id}) : emit('move',position(item))">{{ near(item) ? c.take : c.approach }}</button>
                <template v-if="held(item)">
                    <button :disabled="busy" @click="emit('act',{kind:'drop',item:item.id})">{{ c.drop }}</button>
                    <button v-if="WEAR_SLOTS[item.kind]" :disabled="busy" @click="emit('act',{kind:item.location.kind==='worn'?'unwear':'wear',item:item.id})">{{ item.location.kind === 'worn' ? c.unwear : c.wear }}</button>
                    <button v-if="item.location.kind === 'carried' && offering !== item.id" :disabled="busy" @click="selectOffer(item.id)">{{ c.offer }}</button>
                </template>
                <template v-if="held(item) || item.location.kind === 'ground' && near(item)">
                    <button v-if="ITEMS[item.kind].energy" :disabled="busy" @click="emit('act',{kind:'work',task:{kind:'eat',item:item.id}})">{{ item.food === 'off_odor' ? c.eatDespiteSpoilage : c.eat }}</button>
                </template>
            </div>
            <LiquidActions v-if="item.water && (held(item) || item.location.kind === 'ground' && near(item))" :item="item" :accessible="accessible" :disabled="busy" @work="task=>emit('act',{kind:'work',task})" />
            <form v-if="offering === item.id" class="island-offer-form" @submit.prevent="offer(item.id)"><p v-if="!recipients.length">{{ c.noRecipient }}</p><template v-else><label>{{ c.offerTo }}<select v-model="recipient" :disabled="busy"><option v-for="p in recipients" :key="p.id" :value="p.id">{{ CAST[p.id].name }}</option></select></label><label v-if="item.quantity > 1">{{ c.quantity }}<input v-model.number="units" type="number" min="1" :max="item.quantity" :disabled="busy"></label></template><div class="island-item-actions"><button :disabled="busy || !recipients.some(p=>p.id===recipient) || !Number.isSafeInteger(units) || units < 1 || units > item.quantity">{{ c.offer }}</button><button type="button" :disabled="disabled" @click="offering=null">{{ c.cancel }}</button></div></form>
            <div v-if="outgoing?.item === item.id" class="island-item-actions"><span>{{ c.offering(outgoing.to) }} × {{ outgoing.units }}</span><button :disabled="disabled" @click="emit('act',{kind:'cancel'})">{{ c.takeBack }}</button></div>
        </article>
    </div>
</template>
<style scoped>
.island-offer-form{margin:12px 0 0;display:flex;gap:10px;flex-wrap:wrap}.island-offer-form label{display:grid;gap:5px;font-size:12px;flex:1;min-width:70px}.island-offer-form select,.island-offer-form input{width:100%;min-height:36px;border:1px solid var(--island-line);padding:5px;background:white;border-radius:4px}.island-offer-form .island-item-actions{width:100%}.island-offer-form p{font-size:12px}
</style>
