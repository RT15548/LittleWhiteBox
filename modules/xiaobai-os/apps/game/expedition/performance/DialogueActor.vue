<script setup lang="ts">
import { computed, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue';
import { ACTOR_ART } from './artwork.js';
import type { Performance, Performer } from './catalog.js';
import { performGesture } from './motion.js';
import { DIALOGUE_COPY as c } from '../content/dialogue-copy.js';

const props = defineProps<{ person: Performer; performance?: Performance; animate: boolean }>();
const root = ref<HTMLElement | null>(null), head = ref<HTMLElement | null>(null), arm = ref<HTMLElement | null>(null);
const art = computed(() => ACTOR_ART[props.person]);
const failed = ref(false), retry = ref(0);
let loaded = 0, visible = false, spent = false, animation: Animation | null = null;
let observer: IntersectionObserver | undefined, reduced: MediaQueryList | undefined;
function stop() { spent = true; animation?.cancel(); animation = null; }
function play() {
    if (!props.animate || spent || failed.value || loaded < 3 || !visible) { return; }
    if (document.hidden || reduced?.matches) { stop(); return; }
    if (head.value && arm.value) {
        spent = true;
        animation = performGesture(props.performance?.gesture ?? 'none', { head: head.value, arm: arm.value }, art.value.armDirection);
    }
}
function imageLoaded() { loaded++; play(); }
function imageFailed() { failed.value = true; stop(); }
function reload() { loaded = 0; failed.value = false; retry.value++; }
function visibility() { if (document.hidden) { stop(); } }
function preference() { if (reduced?.matches) { stop(); } }
watch(() => props.animate, value => { if (!value) { stop(); } else { play(); } });
onMounted(() => {
    reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (document.hidden || reduced.matches) { stop(); }
    reduced.addEventListener('change', preference);
    document.addEventListener('visibilitychange', visibility);
    observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .25;
        if (visible) { play(); } else if (animation) { stop(); }
    }, { threshold: .25 });
    if (root.value) { observer.observe(root.value); }
});
onDeactivated(stop);
onBeforeUnmount(() => {
    stop(); observer?.disconnect(); reduced?.removeEventListener('change', preference);
    document.removeEventListener('visibilitychange', visibility);
});
</script>

<template>
    <span ref="root" class="ember-dialogue-actor" :class="{ 'actor-failed': failed }">
        <template v-if="!failed">
            <img :key="'body-' + retry" :src="art.body" alt="" width="420" height="495" decoding="async" loading="lazy" @load="imageLoaded" @error="imageFailed">
            <img :key="'head-' + retry" ref="head" class="actor-head" :src="art.heads[performance?.expression ?? 'neutral']" :style="{ transformOrigin: art.headOrigin }" alt="" width="420" height="495" decoding="async" loading="lazy" @load="imageLoaded" @error="imageFailed">
            <img :key="'arm-' + retry" ref="arm" class="actor-arm" :src="art.arm" :style="{ transformOrigin: art.armOrigin }" alt="" width="420" height="495" decoding="async" loading="lazy" @load="imageLoaded" @error="imageFailed">
        </template>
        <button v-else type="button" @click="reload">{{ c.reloadArtwork }}</button>
    </span>
</template>

<style scoped>
.ember-dialogue-actor { position:relative; float:left; display:block; width:160px; aspect-ratio:420/495; margin:0 14px 6px -8px; shape-outside:polygon(0 0,85% 0,88% 42%,100% 70%,95% 100%,0 100%); }
.ember-dialogue-actor img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; pointer-events:none; }
.ember-dialogue-actor.actor-failed { float:none; width:auto; aspect-ratio:auto; margin:0 0 8px; }
.ember-dialogue-actor button { font-size:12px; min-height:32px; padding:4px 8px; background:transparent; }
@container (max-width:450px) { .ember-dialogue-actor { width:138px; margin-right:8px; } }
</style>
