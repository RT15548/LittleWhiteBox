<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import type { createIslandClient } from '../client.js';
import type { IslandHostView } from '../host.js';
import type { NpcId, Operation } from '../model.js';
import { GUARD } from '../interaction-content.js';
import { COPY as c, eventText, personName } from '../copy.js';
import { transcriptRows } from './transcript.js';
import Portrait from './Portrait.vue';
import IslandIcon from './IslandIcon.vue';
import IncomingOffers from './IncomingOffers.vue';
import CareOffers from './CareOffers.vue';
import ContactOffers from './ContactOffers.vue';
import GmFailure from './GmFailure.vue';
import PlayerComposer from './PlayerComposer.vue';

const props = defineProps<{ view: IslandHostView; client: ReturnType<typeof createIslandClient>; disabled: boolean; busy: boolean; error: string; failedGm: boolean; compact: boolean }>();
const emit = defineEmits<{ act: [operation: Operation]; accepted: [operation: Operation]; person: [person: NpcId]; people: []; journal: [] }>();
const observation = computed(() => props.view.player!);
const feed = computed(() => transcriptRows(props.view.recent));
const lastSpeech = computed(() => [...props.view.recent].reverse().find(e => e.payload.kind === 'speech' || e.payload.kind === 'declaration'));
const excerpt = computed(() => {
    const event = lastSpeech.value;
    return event && (event.payload.kind === 'speech' || event.payload.kind === 'declaration')
        ? c.conversationExcerpt(personName(event.payload.actor, props.view.identity!.name), eventText(event.payload, event.shared, props.view.identity!.name)) : c.opening;
});
const expanded = ref(false), transcript = ref<HTMLElement | null>(null), following = ref(true), updates = ref(false);
const visible = computed(() => !props.compact || expanded.value);
const threats = computed(() => observation.value.threats.filter(t => t.to === 'player'));
const requests = computed(() => [...observation.value.offers, ...observation.value.careOffers, ...observation.value.contactOffers, ...threats.value].filter(o => o.to === 'player'));
function trackScroll() {
    const el = transcript.value;
    if (!el || !visible.value) { return; }
    following.value = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    if (following.value) { updates.value = false; }
}
function latest() {
    if (transcript.value) { transcript.value.scrollTop = transcript.value.scrollHeight; }
    following.value = true; updates.value = false;
}
watch(() => props.view.recent.at(-1)?.sequence, async () => {
    const el = transcript.value;
    const anchor = el && visible.value && !following.value ? [...el.querySelectorAll<HTMLElement>('[data-sequence]')].find(row => row.getBoundingClientRect().bottom > el.getBoundingClientRect().top) : null;
    const offset = anchor?.getBoundingClientRect().top;
    await nextTick();
    if (visible.value && following.value) { latest(); }
    else {
        updates.value = true;
        if (anchor?.isConnected && offset !== undefined && el) { el.scrollTop += anchor.getBoundingClientRect().top - offset; }
    }
});
watch(visible, async value => { if (value) { await nextTick(); if (following.value) { latest(); } } });
watch(() => props.view.intent?.id, id => { if (id) { expanded.value = true; } }, { immediate: true });
watch(() => props.failedGm, failed => { if (failed) { expanded.value = true; } }, { immediate: true });
watch(() => threats.value.map(t => t.from).join(','), value => { if (value) { expanded.value = true; } }, { immediate: true });
onMounted(() => { if (visible.value) { latest(); } });
function back() { if (!props.compact || !expanded.value) { return false; } expanded.value = false; return true; }
defineExpose({ back });
</script>

<template>
    <section class="island-conversation" :class="{ 'island-conversation-expanded': expanded }" :aria-label="c.conversation">
        <header class="island-conversation-header">
            <button v-if="compact" class="island-conversation-toggle" :aria-expanded="expanded" :aria-label="expanded ? c.collapseConversation : c.expandConversation" @click="expanded = !expanded">
                <span class="island-conversation-mark"><IslandIcon name="chat" /><i v-if="updates || requests.length" /></span>
                <span class="island-conversation-caption"><strong>{{ requests.length ? c.awaitingResponse(requests.length) : view.thinking ? view.interpreting ? c.interpreting : c.thinking : view.scene ? c[view.scene] : c.conversation }}</strong><span v-if="!expanded" class="island-conversation-excerpt">{{ excerpt }}</span></span>
                <IslandIcon :name="expanded ? 'down' : 'up'" />
            </button>
            <div v-else class="island-conversation-heading"><IslandIcon name="chat" /><strong>{{ c.conversation }}</strong><small>{{ view.scene ? c[view.scene] : '' }}</small></div>
            <button v-if="visible" class="island-conversation-next" :disabled="disabled || view.scene === 'alone' && !view.needsDecision" @click="client.think()">{{ c.conversationNext }}<IslandIcon name="arrow" /></button>
        </header>
        <div v-show="visible" class="island-conversation-content">
            <nav class="island-presence" :aria-label="c.inSight"><div><button v-for="person in observation.people" :key="person.id" :aria-label="person.identity.name" @click="emit('person', person.id as NpcId)"><Portrait :person="person.id as NpcId" /><span>{{ person.identity.name }}</span><small v-if="person.body.kind === 'dead'">{{ c.remains }}</small></button><small v-if="!observation.people.length">{{ c.nobody }}</small></div><button class="island-presence-more" :aria-label="c.people" @click="emit('people')"><IslandIcon name="people" /></button></nav>
            <div class="island-transcript-area">
                <div ref="transcript" class="island-transcript" role="log" aria-live="polite" aria-relevant="additions" @scroll="trackScroll">
                    <button class="island-transcript-history" @click="emit('journal')">{{ c.earlier }}</button>
                    <article v-for="{ event: e, repetitions } in feed" :key="e.sequence" :data-sequence="e.sequence" :class="{ speech: e.payload.kind === 'speech' || e.payload.kind === 'declaration', mine: 'actor' in e.payload && e.payload.actor === 'player' }">
                        <template v-if="e.payload.kind === 'speech' || e.payload.kind === 'declaration'"><button v-if="e.payload.actor !== 'player'" class="island-speaker" :aria-label="personName(e.payload.actor)" @click="emit('person', e.payload.actor)"><Portrait :person="e.payload.actor" /></button><strong>{{ personName(e.payload.actor, view.identity!.name) }}</strong></template>
                        <p>{{ eventText(e.payload, e.shared, view.identity!.name) }}<small v-if="repetitions > 1"> {{ c.repeated(repetitions) }}</small></p>
                    </article>
                    <p v-if="!feed.length" class="island-opening">{{ c.opening }}</p>
                </div>
                <button v-if="updates && !following" class="island-latest" @click="latest">{{ c.latest }}<IslandIcon name="down" /></button>
            </div>
            <div v-if="requests.length" class="island-requests">
                <IncomingOffers :offers="observation.offers" :disabled="disabled" @accept="from => emit('act', { kind: 'accept', from })" @decline="from => emit('act', { kind: 'decline_offer', from })" />
                <CareOffers :observation="observation" :disabled="disabled" @act="emit('act', $event)" />
                <ContactOffers :observation="observation" :disabled="disabled" @act="emit('act', $event)" />
                <article v-for="threat in threats" :key="threat.from" class="island-item" role="alert"><strong>{{ c.threat(threat.from) }}</strong><div class="island-item-actions"><button :disabled="disabled" @click="emit('act', { kind: 'guard', seconds: GUARD.defaultSeconds })">{{ c.guard }}</button><button v-if="observation.self.activity" :disabled="disabled" @click="client.act({ kind: 'cancel' })">{{ c.pause }}</button><button :disabled="disabled" @click="client.advance(1)">{{ c.responseMoment }}</button></div></article>
            </div>
            <div v-if="view.thinking" class="island-thinking" role="status"><span>{{ view.interpreting ? c.interpreting : c.thinking }}</span><button @click="client.cancel()">{{ c.stopGm }}</button></div>
            <GmFailure v-if="failedGm" :error="error" :busy="busy" :disabled="disabled" @retry="client.think()" @settings="client.settings()" />
            <PlayerComposer :client="client" :disabled="disabled" @accepted="emit('accepted', $event)" />
        </div>
    </section>
</template>
