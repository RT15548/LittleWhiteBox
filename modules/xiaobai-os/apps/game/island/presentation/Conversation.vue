<script setup lang="ts">
import { computed, nextTick, onActivated, onDeactivated, onMounted, ref, watch } from 'vue';
import type { createIslandClient } from '../client.js';
import type { IslandHostView } from '../host.js';
import type { NpcId, Operation, PersonId } from '../model.js';
import { GUARD } from '../interaction-content.js';
import { COPY as c, eventText, personName } from '../copy.js';
import { sceneTalk } from './transcript.js';
import { playerRequests } from './requests.js';
import Portrait from './Portrait.vue';
import IslandIcon from './IslandIcon.vue';
import IncomingOffers from './IncomingOffers.vue';
import CareOffers from './CareOffers.vue';
import ContactOffers from './ContactOffers.vue';
import ContextRing from './ContextRing.vue';
import PlayerComposer from './PlayerComposer.vue';
import DialogueText from './DialogueText.vue';

const props = defineProps<{ view: IslandHostView; client: ReturnType<typeof createIslandClient>; disabled: boolean }>();
const emit = defineEmits<{ act: [operation: Operation]; accepted: [operation: Operation]; person: [person: NpcId]; journal: []; close: [] }>();
const observation = computed(() => props.view.player!);
const name = computed(() => props.view.identity!.name);
const talk = computed(() => sceneTalk(props.view.recent, props.view.listeners).flatMap(event =>
    'actor' in event.payload ? [{ event, actor: event.payload.actor, text: eventText(event.payload, event.shared, name.value) }] : []));
const root = ref<HTMLElement | null>(null), transcript = ref<HTMLElement | null>(null), following = ref(true), updates = ref(false);
let active = true, scrollTop = 0;
const requests = computed(() => playerRequests(observation.value));
const listening = (id: PersonId) => props.view.listeners.some(listener => listener === id);
function trackScroll() {
    const el = transcript.value;
    if (!el || !active) { return; }
    scrollTop = el.scrollTop;
    following.value = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    if (following.value) { updates.value = false; }
}
function latest() {
    if (transcript.value) { transcript.value.scrollTop = transcript.value.scrollHeight; }
    following.value = true; updates.value = false;
}
async function submitted() { following.value = true; await nextTick(); latest(); }
// New lines never pull a reader away from what they are rereading.
watch(() => talk.value.at(-1)?.event.sequence, async () => {
    if (!active) { updates.value = true; return; }
    const el = transcript.value;
    const anchor = el && !following.value ? [...el.querySelectorAll<HTMLElement>('[data-sequence]')].find(row => row.getBoundingClientRect().bottom > el.getBoundingClientRect().top) : null;
    const offset = anchor?.getBoundingClientRect().top;
    await nextTick();
    if (!active) { updates.value = true; return; }
    if (following.value) { latest(); }
    else {
        updates.value = true;
        if (anchor?.isConnected && offset !== undefined && el) { el.scrollTop += anchor.getBoundingClientRect().top - offset; scrollTop = el.scrollTop; }
    }
});
onMounted(latest);
onDeactivated(() => { active = false; });
onActivated(async () => {
    active = true;
    await nextTick();
    if (!active || !transcript.value) { return; }
    if (following.value) { latest(); }
    else { transcript.value.scrollTop = scrollTop; }
    if (document.activeElement === document.body || !document.activeElement?.isConnected) { root.value?.focus({ preventScroll: true }); }
});
</script>

<template>
    <section ref="root" class="island-conversation" role="region" :aria-label="c.conversation" tabindex="-1" @keydown.esc.stop="emit('close')">
        <header class="island-conversation-header">
            <div class="island-conversation-heading">
                <strong>{{ c.conversation }}</strong>
            </div>
            <button class="island-conversation-history" :aria-label="c.earlier" @click="emit('journal')"><IslandIcon name="journal" /></button>
            <ContextRing :client="client" :sequence="view.recent.at(-1)?.sequence" />
            <button class="island-conversation-close" :aria-label="c.closeConversation" @click="emit('close')"><IslandIcon name="close" /></button>
        </header>
        <nav v-if="observation.people.length" class="island-presence" :aria-label="c.inSight">
            <button v-for="person in observation.people" :key="person.id" :aria-label="`${person.identity.name} · ${person.body.kind === 'dead' ? c.remains : listening(person.id) ? c.canHear : c.sightOnly}`" @click="emit('person', person.id as NpcId)">
                <Portrait :person="person.id as NpcId" /><span>{{ person.identity.name }}<small v-if="person.body.kind === 'dead'">{{ c.remains }}</small><small v-else-if="!listening(person.id)">{{ c.sightOnly }}</small></span>
            </button>
        </nav>
        <div class="island-transcript-area">
            <div ref="transcript" class="island-transcript" role="log" aria-live="polite" aria-relevant="additions" @scroll="trackScroll">
                <article v-for="row in talk" :key="row.event.sequence" :data-sequence="row.event.sequence" class="speech" :class="{ mine: row.actor === 'player' }">
                    <button v-if="row.actor !== 'player'" class="island-speaker" :aria-label="personName(row.actor)" @click="emit('person', row.actor)"><Portrait :person="row.actor" /></button>
                    <div class="island-speech-content"><strong>{{ personName(row.actor, name) }}</strong><DialogueText :text="row.text" /></div>
                </article>
                <p v-if="!talk.length" class="island-opening">{{ view.scene === 'alone' ? c.noOneNear : c.noTalk }}</p>
            </div>
            <button v-if="updates && !following" class="island-latest" @click="latest">{{ c.latest }}<IslandIcon name="down" /></button>
        </div>
        <div class="island-conversation-notices">
            <div v-if="requests.count" class="island-requests">
                <IncomingOffers :offers="observation.offers" :disabled="disabled" @accept="from => emit('act', { kind: 'accept', from })" @decline="from => emit('act', { kind: 'decline_offer', from })" />
                <CareOffers :observation="observation" :disabled="disabled" @act="emit('act', $event)" />
                <ContactOffers :observation="observation" :disabled="disabled" @act="emit('act', $event)" />
                <article v-for="threat in requests.threats" :key="threat.from" class="island-item" role="alert"><strong>{{ c.threat(threat.from) }}</strong><div class="island-item-actions"><button :disabled="disabled" @click="emit('act', { kind: 'guard', seconds: GUARD.defaultSeconds })">{{ c.guard }}</button><button v-if="observation.self.activity" :disabled="disabled" @click="client.act({ kind: 'cancel' })">{{ c.pause }}</button></div></article>
            </div>
            <slot />
        </div>
        <div v-if="view.thinking" class="island-thinking" role="status"><span>{{ view.interpreting ? c.interpreting : c.thinking }}</span><button @click="client.cancel()">{{ c.stopGm }}</button></div>
        <PlayerComposer :client="client" :disabled="disabled" @submitted="submitted" @accepted="emit('accepted', $event)" />
    </section>
</template>
