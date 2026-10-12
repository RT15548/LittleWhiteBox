<script setup lang="ts">
import { ref } from 'vue';
import type { Campaign } from '../campaign/types.js';
import type { Relic } from '../types.js';
import { rewardOffers } from '../campaign/rewards.js';
import { RULES } from '../content.js';
import { COPY, RELIC_COPY } from '../copy.js';
import { COMBAT_COPY as c } from '../content/combat-copy.js';
import { CAMPAIGN_COPY } from '../content/campaign-copy.js';
import ExpeditionIcon from '../ExpeditionIcon.vue';
const props = defineProps<{ campaign: Campaign; blocked: boolean }>();
const emit = defineEmits<{ choose: [id: Relic, replace?: Relic]; leave: [] }>();
const selected = ref<Relic | null>(null);
function choose(id: Relic) {
    if (props.campaign.equipped.length >= RULES.relicSlots && !props.campaign.equipped.includes(id)) { selected.value = id; }
    else { emit('choose', id); }
}
</script>
<template>
    <template v-if="selected">
        <h3>{{ RELIC_COPY[selected].name }} · {{ c.replace }}</h3>
        <div class="ember-relics"><button v-for="id in campaign.equipped" :key="id" type="button" :disabled="blocked" @click="emit('choose', selected, id)"><ExpeditionIcon :name="id" /><h3>{{ RELIC_COPY[id].name }}</h3></button></div>
        <button type="button" :disabled="blocked" @click="emit('choose', selected)">{{ c.store }}</button>
        <button type="button" :disabled="blocked" @click="selected = null">{{ c.back }}</button>
    </template>
    <template v-else>
        <div class="ember-relics"><button v-for="offer in rewardOffers(campaign)" :key="offer.id" type="button" :disabled="blocked" @click="choose(offer.id)"><ExpeditionIcon :name="offer.id" /><h3>{{ RELIC_COPY[offer.id].name }} <small>{{ COPY.rank(offer.rank) }}</small></h3><p>{{ RELIC_COPY[offer.id].detail }}</p></button></div>
        <button type="button" :disabled="blocked" @click="emit('leave')">{{ CAMPAIGN_COPY.skip }}</button>
    </template>
</template>
