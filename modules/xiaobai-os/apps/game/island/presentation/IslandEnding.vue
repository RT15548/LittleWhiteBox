<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { ExperienceView } from '../cooperation.js';
import { COPY as c } from '../copy.js';
import Journal from './Journal.vue';

defineProps<{ journey: string; playerName: string; clock: number; recent: ExperienceView[];
    load: (after: number) => Promise<{ entries: ExperienceView[]; next: number | null } | null>; blocked: boolean }>();
defineEmits<{ back: []; restart: [] }>();
const heading = ref<HTMLElement | null>(null);
onMounted(() => heading.value?.focus({ preventScroll: true }));
</script>

<template>
    <section class="island-recollection" :aria-label="c.identity.continueEnded">
        <header><button type="button" @click="$emit('back')">← {{ c.back }}</button><span>{{ playerName }} · {{ c.time(clock) }}</span></header>
        <div class="island-recollection-body">
            <h1 ref="heading" tabindex="-1">{{ c.dead }}</h1><p>{{ c.deadDetail }}</p>
            <h2>{{ c.journal }}</h2><Journal :journey="journey" :player-name="playerName" :recent="recent" :load="load" />
        </div>
        <footer><button type="button" class="island-primary" :disabled="blocked" @click="$emit('restart')">{{ c.identity.newJourney }}</button></footer>
    </section>
</template>

<style scoped>
.island-recollection{position:absolute;inset:0;display:flex;flex-direction:column;min-height:0;background:var(--island-paper)}
.island-recollection>header,.island-recollection>footer{display:flex;align-items:center;gap:16px;padding:16px clamp(18px,5%,64px);flex-shrink:0}
.island-recollection>header{border-bottom:1px solid var(--island-line)}.island-recollection>header span{font-size:12px;overflow-wrap:anywhere}
.island-recollection>header button{background:none;border:0;white-space:nowrap}.island-recollection>footer{border-top:1px solid var(--island-line);justify-content:flex-end}
.island-recollection-body{width:min(100%,760px);margin:0 auto;padding:32px clamp(18px,5%,48px);overflow:auto;overscroll-behavior:contain;min-height:0;flex:1}
.island-recollection h1{font-family:Georgia,'Noto Serif SC',serif;font-size:28px;font-weight:500;line-height:1.5}.island-recollection h2{font-size:15px;margin:28px 0 14px}
.island-recollection-body>p{font-size:13px;line-height:1.8;margin-top:12px}.island-recollection button{min-height:44px}
</style>
