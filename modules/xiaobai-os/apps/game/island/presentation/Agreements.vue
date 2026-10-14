<script setup lang="ts">
import { ref, watch } from 'vue';
import type { IslandView } from '../service.js';
import type { Operation } from '../model.js';
import { COPY as c } from '../copy.js';
import { CAST, RULES } from '../content.js';
const props = defineProps<{ agreements: NonNullable<IslandView['player']>['agreements']; disabled: boolean }>();
const emit = defineEmits<{ act: [operation: Operation] }>();
const composing = ref(false), draft = ref(''), submitted = ref<{ text: string; after: number } | null>(null);
watch(() => props.agreements, agreements => {
    if (submitted.value !== null && agreements.some(a => a.proposer === 'player' && a.terms === submitted.value!.text && a.proposal > submitted.value!.after)) {
        if (draft.value.trim() === submitted.value.text) { draft.value = ''; composing.value = false; }
        submitted.value = null;
    }
});
function propose() {
    const text = draft.value.trim(); if (!text || props.disabled) { return; }
    submitted.value = { text, after: Math.max(0, ...props.agreements.map(a => a.proposal)) };
    emit('act', { kind: 'declare', text, choice: { kind: 'proposal' } });
}
function respond(proposal: number, stance: 'accept' | 'decline') {
    emit('act', { kind: 'declare', text: c.respondAgreement(stance === 'accept'), choice: { kind: 'response', proposal, stance } });
}
function relay(reference: number) {
    emit('act', { kind: 'declare', text: c.relayStatement, choice: { kind: 'relay', reference } });
}
</script>
<template>
    <section class="island-agreements">
        <header><h3>{{ c.agreements }}</h3><button v-if="!composing" :disabled="disabled" @click="composing = true">{{ c.propose }}</button></header>
        <form v-if="composing" @submit.prevent="propose">
            <label>{{ c.proposalTerms }}<textarea v-model="draft" rows="4" :maxlength="RULES.maxSpeechCharacters" :placeholder="c.proposalPlaceholder" :disabled="disabled" /></label>
            <small>{{ c.agreementNote }}</small>
            <div class="island-item-actions"><button class="island-primary" :disabled="disabled || !draft.trim()">{{ c.propose }}</button><button type="button" :disabled="disabled" @click="composing = false">{{ c.cancel }}</button></div>
        </form>
        <p v-if="!agreements.length && !composing" class="island-agreement-empty">{{ c.noAgreements }}</p>
        <article v-for="a in agreements" :key="a.proposal" class="island-agreement">
            <strong>{{ c.proposalBy(a.proposer) }}</strong><small>{{ c.time(a.learnedAt) }} · {{ c.through(a.through) }}</small>
            <p class="island-agreement-terms">{{ a.terms }}</p>
            <ul><li v-for="answer in a.commitments" :key="answer.actor"><span>{{ CAST[answer.actor].name }}</span><span :class="answer.stance">{{ c.commitment[answer.stance] }}</span><details v-if="answer.reference !== a.proposal"><summary :aria-label="`${CAST[answer.actor].name} · ${c.look}`">{{ c.look }}</summary><small>{{ c.time(answer.learnedAt) }} · {{ c.through(answer.through) }}</small><p class="island-agreement-terms">{{ answer.text }}</p><button :disabled="disabled" @click="relay(answer.reference)">{{ c.relayResponse }}</button></details></li></ul>
            <div class="island-item-actions"><button v-if="!a.commitments.some(s => s.actor === 'player' && s.stance === 'accept')" :disabled="disabled" @click="respond(a.proposal, 'accept')">{{ c.accept }}</button><button v-if="!a.commitments.some(s => s.actor === 'player' && s.stance === 'decline')" :disabled="disabled" @click="respond(a.proposal, 'decline')">{{ a.commitments.some(s => s.actor === 'player' && s.stance === 'accept') ? c.withdraw : c.decline }}</button><button :disabled="disabled" @click="relay(a.proposal)">{{ c.relayTerms }}</button></div>
        </article>
    </section>
</template>
<style scoped>
.island-agreements{margin-top:24px}.island-agreements>header{display:flex;align-items:center;justify-content:space-between;gap:12px}.island-agreements h3{font-size:14px}.island-agreements button{font-size:12px}.island-agreements form{margin:12px 0}.island-agreements label{font-size:13px;display:block}.island-agreements textarea{display:block;width:100%;resize:vertical;min-height:100px;margin:8px 0;border:1px solid var(--island-line);border-radius:4px;padding:10px;background:white;line-height:1.7}.island-agreement-empty{font-size:12px;padding:15px 0;color:#628078}.island-agreement{padding:18px 0;border-bottom:1px solid var(--island-line);font-size:13px}.island-agreement>small{display:block;margin-top:5px}.island-agreement-terms{margin:12px 0;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.8}.island-agreement ul{list-style:none;padding:0;margin:10px 0;display:grid;gap:8px}.island-agreement li{display:grid;grid-template-columns:1fr auto;gap:5px 10px;align-items:center}.island-agreement li .accept{color:#276c6d}.island-agreement li .decline{color:#886049}.island-agreement details{grid-column:1 / -1;color:#628078;font-size:12px}.island-agreement details summary{cursor:pointer;padding:4px 0;min-height:28px}.island-agreement details small{display:block;margin:4px 0}
</style>
