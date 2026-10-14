<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ExperienceView } from '../cooperation.js';
import { COPY as c, eventText } from '../copy.js';
const props = defineProps<{ journey: string; recent: ExperienceView[]; load: (after: number) => Promise<{ entries: ExperienceView[]; next: number | null } | null> }>();
const page = ref<{ entries: ExperienceView[]; next: number | null } | null>(null), loading = ref(false);
watch(() => props.journey, () => { page.value = null; });
async function read(after: number) {
    if (loading.value) { return; } loading.value = true;
    try { const result = await props.load(after); if (result) { page.value = result; } }
    finally { loading.value = false; }
}
</script>
<template>
    <div class="island-history-controls"><button :disabled="loading" @click="read(0)">{{ c.earlier }}</button><button v-if="page" @click="page = null">{{ c.recent }}</button></div>
    <article v-for="event in page?.entries ?? recent" :key="event.sequence" class="island-log"><small>{{ c.time(event.at) }}</small><p>{{ eventText(event.payload, event.shared) }}</p></article>
    <p v-if="page && !page.entries.length">{{ c.historyEmpty }}</p><button v-if="page?.next" :disabled="loading" @click="read(page.next)">{{ c.nextPage }}</button>
</template>
