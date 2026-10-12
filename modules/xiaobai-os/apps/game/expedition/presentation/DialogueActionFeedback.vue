<script setup lang="ts">
import { computed } from 'vue';
import type { Campaign, ConversationTurn } from '../campaign/types.js';
import type { Participant } from '../content/participants.js';
import { dialogueActionFeedback } from './action-feedback.js';

const props = defineProps<{ campaign: Campaign; person: Participant; turn: ConversationTurn }>();
const feedback = computed(() => dialogueActionFeedback(props.campaign, props.person, props.turn));
</script>

<template>
    <p v-if="feedback" class="ember-action-feedback" :data-action="feedback.action" :data-phase="feedback.phase">
        <svg viewBox="0 0 20 20" aria-hidden="true">
            <template v-if="feedback.phase === 'pending'"><circle cx="10" cy="10" r="7" /><path d="M10 5v5l3 2" /></template>
            <path v-else d="m4 10 4 4 8-8" />
        </svg>
        <span>{{ feedback.text }}</span>
    </p>
</template>

<style scoped>
.ember-action-feedback { display:flex; align-items:flex-start; gap:6px; padding:8px 8px 0; color:#5b6b83; font-size:13px; line-height:1.65; overflow-wrap:anywhere; }
.ember-action-feedback svg { flex:0 0 16px; width:16px; height:16px; margin-top:3px; fill:none; stroke:currentColor; stroke-width:1.4; stroke-linecap:round; stroke-linejoin:round; }
.ember-action-feedback span { min-width:0; }
</style>
