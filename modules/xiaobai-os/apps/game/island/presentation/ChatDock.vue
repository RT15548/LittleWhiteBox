<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { IslandHostView } from '../host.js';
import type { NpcId } from '../model.js';
import { COPY as c, eventText, personName } from '../copy.js';
import { sceneTalk } from './transcript.js';
import { playerRequests } from './requests.js';
import Portrait from './Portrait.vue';
import IslandIcon from './IslandIcon.vue';

const props = defineProps<{ view: IslandHostView; open: boolean }>();
const emit = defineEmits<{ toggle: [] }>();
const HINT_MILLISECONDS = 8000;
// The conversation never opens by itself. Someone speaking to the player is announced here and waits to be opened.
const incoming = computed(() => sceneTalk(props.view.recent, props.view.listeners).filter(e => 'actor' in e.payload && e.payload.actor !== 'player'));
const newest = computed(() => incoming.value.at(-1) ?? null);
// Anything said before now is already known: someone walking into earshot does not bring their old words back as news.
const latestSequence = () => props.view.recent.at(-1)?.sequence ?? 0;
const readThrough = ref(latestSequence());
const unread = computed(() => props.open ? 0 : incoming.value.filter(e => e.sequence > readThrough.value).length);
const hint = ref<typeof newest.value>(null);
let timer: ReturnType<typeof setTimeout> | undefined;
watch(() => newest.value?.sequence, sequence => {
    if (props.open) { readThrough.value = latestSequence(); return; }
    if (!sequence || sequence <= readThrough.value) { return; }
    hint.value = newest.value; clearTimeout(timer); timer = setTimeout(() => { hint.value = null; }, HINT_MILLISECONDS);
});
watch(() => props.open, open => { if (open) { readThrough.value = latestSequence(); hint.value = null; clearTimeout(timer); } });
onBeforeUnmount(() => clearTimeout(timer));
const requests = computed(() => props.view.player ? playerRequests(props.view.player) : { threats: [], count: 0 });
const badge = computed(() => requests.value.count + unread.value);
const speaker = computed(() => hint.value && 'actor' in hint.value.payload ? hint.value.payload.actor as NpcId : null);
</script>

<template>
    <div v-if="!open" class="island-chat">
        <button v-if="requests.count" class="island-chat-hint" :class="{ 'island-chat-alert': requests.threats.length }" @click="emit('toggle')">
            <strong>{{ c.awaitingResponse(requests.count) }}</strong>
        </button>
        <button v-else-if="hint && speaker" class="island-chat-hint" @click="emit('toggle')">
            <Portrait :person="speaker" />
            <span><strong>{{ personName(speaker) }}</strong><span>{{ eventText(hint.payload, hint.shared) }}</span></span>
        </button>
        <button class="island-chat-button" :aria-label="c.openConversation" @click="emit('toggle')">
            <IslandIcon name="chat" /><span>{{ c.conversation }}</span><b v-if="view.thinking" class="island-chat-wait" role="status" :aria-label="c.thinking">…</b><i v-if="badge" aria-hidden="true">{{ badge > 9 ? '9+' : badge }}</i>
        </button>
    </div>
</template>
