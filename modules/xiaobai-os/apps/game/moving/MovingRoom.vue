<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onMounted, ref } from 'vue';
import type { XiaobaiOsFrameBridge } from '../../../shell/app-src/frame-bridge.js';
import { useAppBack, useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
import { MOVING_COPY as c, ROOM_NAMES, CHALLENGE_NAMES } from './copy.js';
import { CHAPTER_LEVELS } from './levels.js';
import { MOVING_POLICY } from './policy.js';
import { runStatus } from './domain.js';
import { createMovingClient } from './client.js';
import MovingBoard from './MovingBoard.vue';
import ItemIcon from './ItemIcon.vue';
import './moving.css';

const props = defineProps<{ bridge: XiaobaiOsFrameBridge; chatIdentity: string; generationActive: boolean }>();
const client = createMovingClient(props.bridge, props.chatIdentity);
const { view, busy, blocked, notice, generating, failed } = client;
const page = ref<'chapters' | 'board'>('chapters');
const modal = ref<'admission' | 'abandon' | 'restart' | null>(null);
const dialog = ref<HTMLElement | null>(null);
const animating = ref(false);
let mounted = false;
const active = computed(() => view.value?.active ?? null);
const paidLive = computed(() => !!active.value && active.value.stage === null && runStatus(active.value) === 'playing');
const unlocked = computed(() => view.value?.completed.length === CHAPTER_LEVELS.length);
const disabled = computed(() => blocked.value || animating.value || props.generationActive);
useAppLayer(dialog, () => { modal.value = null; });
useAppBack(() => {
    if (page.value !== 'board') { return false; }
    page.value = 'chapters'; return true;
});
async function start(stage: number) {
    if (await client.act({ type: 'start', stage })) { page.value = 'board'; }
}
async function confirm() {
    const operation = modal.value;
    if (!operation) { return; }
    modal.value = null;
    if (await client.act({ type: operation === 'admission' ? 'challenge' : operation })) { page.value = 'board'; }
}
function challenge() {
    if (paidLive.value) { page.value = 'board'; }
    else { modal.value = 'admission'; }
}
async function next() {
    if (!active.value) { return; }
    if (active.value.stage !== null && active.value.stage < CHAPTER_LEVELS.length - 1) { await start(active.value.stage + 1); }
    else { challenge(); }
}
onMounted(async () => { await client.read(); if (active.value) { page.value = 'board'; } mounted = true; });
onActivated(() => { if (mounted) { void client.read(); } });
onBeforeUnmount(client.dispose);
</script>
<template>
    <div class="moving-app" :class="{ 'moving-app-board': page === 'board' }">
        <div v-if="view" class="moving-account">
            <span>{{ c.balance(view.balance) }}</span><small role="status">{{ generationActive ? c.storyBusy : busy ? generating ? c.generating : c.saving : view.writeState === 'ready' && !failed ? c.saved : '' }}</small>
        </div>
        <aside v-if="notice || failed || view?.pending || view?.writeState === 'failed'" class="moving-save-notice" role="alert">
            <p>{{ notice || c.saveProblem }}</p>
            <button type="button" :disabled="busy" @click="client.recover">{{ c.recover }}</button>
            <button v-if="view?.writeState === 'conflict'" type="button" :disabled="busy" @click="client.read">{{ c.refresh }}</button>
        </aside>
        <p v-if="!view" class="moving-loading" role="status">{{ c.loading }}</p>
        <MovingBoard
            v-else-if="page === 'board' && active && view.board" :key="active.id"
            :active="active" :board="view.board" :disabled="blocked || generationActive" :award="view.award" :challenge="view.challenge"
            :sound-enabled="view.soundEnabled" :set-sound-enabled="client.setSoundEnabled"
            @pick="id => client.act({ type: 'pick', id })" @undo="client.act({ type: 'undo' })"
            @restart="modal = 'restart'" @abandon="modal = 'abandon'" @chapters="page = 'chapters'" @next="next"
            @animation="value => animating = value"
        />
        <section v-else-if="view" class="moving-chapters moving-room" :aria-label="c.chapters">
            <button v-if="active && runStatus(active) === 'playing'" type="button" class="moving-resume" @click="page = 'board'">
                <span>{{ c.resume }} · {{ ROOM_NAMES[active.level.id] }}</span><span aria-hidden="true">→</span>
            </button>
            <article class="moving-chapter-card chapter-home">
                <div class="moving-chapter-art" aria-hidden="true"><ItemIcon kind="cat" /><ItemIcon kind="plant" /></div>
                <div class="moving-chapter-title"><small>{{ c.chapterOne }}</small><h2>{{ ROOM_NAMES.weekend }}</h2><p>{{ c.firstReward }}</p></div>
                <ol class="moving-stage-path">
                    <li v-for="(level, index) in CHAPTER_LEVELS" :key="level.key">
                        <button type="button" :data-stage="index" :aria-label="c.stage(index)" :disabled="disabled || paidLive || index > view.completed.length" :class="{ 'is-cleared': view.completed.includes(index) }" @click="start(index)">
                            <strong>{{ index + 1 }}</strong><small>{{ view.completed.includes(index) ? '✓' : '+' + MOVING_POLICY.chapterReward }}</small>
                        </button>
                    </li>
                </ol>
            </article>
            <article class="moving-chapter-card chapter-witch">
                <div class="moving-chapter-art" aria-hidden="true"><ItemIcon kind="potion" /><ItemIcon kind="star" /></div>
                <div class="moving-chapter-title"><small>{{ c.chapterTwo }} · <span :data-tier="view.challenge.tier">{{ CHALLENGE_NAMES[view.challenge.tier] }}</span></small><h2>{{ ROOM_NAMES.witch }}</h2><p>{{ c.challengeTerms }}</p></div>
                <p v-if="unlocked" class="moving-session-note">{{ c.tierProgress(view.challenge) }}</p>
                <button type="button" class="moving-primary" :disabled="disabled || !unlocked || !paidLive && view.balance < MOVING_POLICY.challengeFee" @click="challenge">{{ paidLive ? c.resume : unlocked ? c.admission : c.challengeLocked }}</button>
                <p v-if="unlocked && !paidLive && view.balance < MOVING_POLICY.challengeFee" class="moving-session-note">{{ c.noFunds }}</p>
            </article>
            <p class="moving-session-note">{{ c.sessionNote }}</p>
        </section>
        <div v-if="generating" class="moving-generating" role="status">{{ c.generating }}</div>
        <div v-if="modal" class="moving-modal-backdrop moving-room-theme" @click.self="modal = null">
            <section ref="dialog" class="moving-modal" role="dialog" aria-modal="true" aria-labelledby="moving-confirm-title" tabindex="-1">
                <header><h2 id="moving-confirm-title">{{ modal === 'admission' && view ? c.admissionTitle(view.challenge.tier) : modal === 'abandon' ? c.abandonTitle : c.restartTitle }}</h2><button type="button" :aria-label="c.close" @click="modal = null">×</button></header>
                <p>{{ modal === 'admission' ? c.admissionBody : modal === 'abandon' ? c.abandonBody : c.discard }}</p>
                <p v-if="modal === 'admission' && view" class="moving-session-note" :data-tier="view.challenge.tier">{{ c.tierProgress(view.challenge) }}<br>{{ c.tierRule }}</p>
                <div class="moving-confirm-actions"><button type="button" class="moving-plain" @click="modal = null">{{ c.cancel }}</button><button type="button" class="moving-primary" :disabled="disabled" @click="confirm">{{ modal === 'admission' ? c.admission : c.confirm }}</button></div>
            </section>
        </div>
    </div>
</template>
