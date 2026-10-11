<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { Campaign } from '../campaign/types.js';
import { TRAVELER_GENDERS, TRAVELER_NAME_LIMIT, type Traveler } from '../campaign/traveler.js';
import { FIRST_CHAPTER, chapterTitle } from '../content/chapters.js';
import { JOURNEY_COPY as j } from '../content/journey-copy.js';
import { TRAVELER_AGES, type TravelerAge } from '../content/traveler-ages.js';
import { CAMPAIGN_COPY as c } from '../content/campaign-copy.js';
import type { JourneySetup, Weapon } from '../types.js';
import WeaponSelection from './WeaponSelection.vue';
import WorldFrontispiece from './WorldFrontispiece.vue';
import { WORLD_ART } from '../artwork.js';

const props = defineProps<{ campaign: Campaign | null; ready: boolean; busy: boolean; blocked: boolean }>();
const emit = defineEmits<{ start: [setup: Omit<JourneySetup, 'outfit'>]; continue: [] }>();
const step = ref<'title' | 'identity' | 'chapters' | 'weapon'>('title'), creating = ref(false);
const name = ref(props.campaign?.traveler.name ?? ''), gender = ref<Traveler['gender'] | null>(props.campaign?.traveler.gender ?? null);
const appearanceAge = ref<TravelerAge | ''>(props.campaign?.traveler.appearanceAge ?? '');
const weapon = ref<Weapon>(props.campaign?.weapon ?? 'blade'), confirmed = ref(false), heading = ref<HTMLElement | null>(null), sheet = ref<HTMLElement | null>(null);
const headingText = computed(() => ({ title: c.title, identity: j.identity, chapters: j.chooseChapter, weapon: j.chooseWeapon })[step.value]);
watch(step, async () => { await nextTick(); if (sheet.value) { sheet.value.scrollTop = 0; } heading.value?.focus({ preventScroll: true }); });
function begin() { creating.value = true; confirmed.value = false; step.value = 'identity'; }
function identify() { if (name.value.trim() && gender.value && appearanceAge.value) { name.value = name.value.trim(); step.value = 'chapters'; } }
function back() { step.value = step.value === 'weapon' ? 'chapters' : step.value === 'chapters' && creating.value ? 'identity' : 'title'; }
function chooseChapter() { if (props.campaign && !creating.value) { emit('continue'); } else { step.value = 'weapon'; } }
function start() {
    if (!gender.value || !appearanceAge.value || !name.value.trim() || props.blocked || props.campaign && !confirmed.value) { return; }
    emit('start', { traveler: { name: name.value.trim(), gender: gender.value, appearanceAge: appearanceAge.value }, weapon: weapon.value, chapter: FIRST_CHAPTER.id });
}
defineExpose({ back: () => { if (step.value === 'title') { return false; } back(); return true; } });
</script>
<template>
    <section class="ember-entry" :class="{ 'is-title': step === 'title' }" :aria-label="c.title">
        <WorldFrontispiece />
        <div class="entry-shade" />
        <div v-if="step === 'title'" class="entry-title">
            <p class="entry-city">{{ j.city }}</p><h1 ref="heading" tabindex="-1">{{ c.title }}</h1>
            <nav :aria-label="c.title">
                <button v-if="campaign" class="entry-primary" type="button" :disabled="!ready || blocked" @click="emit('continue')">{{ c.resume }}<span aria-hidden="true">→</span></button>
                <button v-else class="entry-primary" type="button" :disabled="!ready || blocked" @click="begin">{{ ready ? j.begin : j.loading }}<span aria-hidden="true">→</span></button>
                <button v-if="campaign" type="button" :disabled="!ready || blocked" @click="creating = false; step = 'chapters'">{{ j.chapters }}</button>
                <button v-if="campaign" type="button" :disabled="!ready || blocked" @click="begin">{{ j.newJourney }}</button>
            </nav>
            <p v-if="campaign" class="entry-save"><span>{{ campaign.traveler.name }}</span><span>{{ chapterTitle }}</span></p>
        </div>
        <div v-else ref="sheet" class="entry-sheet">
            <header><button type="button" :disabled="busy" @click="back">← {{ j.back }}</button><span>{{ c.title }}</span></header>
            <h2 ref="heading" tabindex="-1">{{ headingText }}</h2>
            <form v-if="step === 'identity'" class="entry-identity" @submit.prevent="identify">
                <div class="entry-name">
                    <label for="ember-traveler-name">{{ j.name }}</label>
                    <input id="ember-traveler-name" v-model="name" :maxlength="TRAVELER_NAME_LIMIT" :placeholder="j.namePlaceholder" required autocomplete="off" :pattern="'.*\\S.*'">
                </div>
                <div class="entry-identity-details">
                    <fieldset><legend>{{ j.gender }}</legend><label v-for="id in TRAVELER_GENDERS" :key="id"><input v-model="gender" type="radio" name="ember-traveler-gender" :value="id" required><span>{{ j.genders[id] }}</span></label></fieldset>
                    <div class="entry-age">
                        <label for="ember-traveler-age">{{ j.age }}</label>
                        <select id="ember-traveler-age" v-model="appearanceAge" required>
                            <option disabled value="">{{ j.agePlaceholder }}</option>
                            <option v-for="(label, id) in TRAVELER_AGES" :key="id" :value="id">{{ label }}</option>
                        </select>
                    </div>
                </div>
                <button class="entry-primary" type="submit">{{ j.next }}<span aria-hidden="true">→</span></button>
            </form>
            <div v-else-if="step === 'chapters'" class="entry-chapters">
                <button type="button" class="entry-chapter" @click="chooseChapter">
                    <img class="entry-chapter-art" :src="WORLD_ART.chapter" alt="" decoding="async">
                    <span class="entry-numeral" aria-hidden="true">{{ FIRST_CHAPTER.numeral }}</span>
                    <span class="entry-chapter-body"><small>{{ FIRST_CHAPTER.number }}</small><strong>{{ FIRST_CHAPTER.title }}</strong><span>{{ c.opening }}</span>
                        <small v-if="campaign && !creating">{{ campaign.facts.includes('chapter_completed') ? j.completeChapter : j.currentChapter }}</small></span>
                    <span class="entry-chapter-arrow" aria-hidden="true">→</span>
                </button>
                <div class="entry-forthcoming"><span>{{ j.nextChapter }}</span><span>{{ j.forthcoming }}</span></div>
            </div>
            <form v-else class="entry-loadout" @submit.prevent="start">
                <p class="entry-traveler"><strong>{{ name }}</strong><span>{{ gender ? j.genders[gender] : '' }} · {{ appearanceAge ? TRAVELER_AGES[appearanceAge] : '' }} · {{ j.identityRole }}</span></p>
                <WeaponSelection v-model="weapon" />
                <label v-if="campaign" class="entry-restart"><input v-model="confirmed" type="checkbox" required><span>{{ j.restartWarning }}</span></label>
                <button class="entry-primary" type="submit" :disabled="blocked">{{ busy ? j.entering : campaign ? j.confirmRestart : j.enter }}<span v-if="!busy" aria-hidden="true">→</span></button>
            </form>
        </div>
    </section>
</template>
<style scoped>
.ember-entry { position:absolute; inset:0; overflow:hidden; color:#29374f; container:journey-entry / size; background:#bcc7e1; }
.entry-shade { position:absolute; inset:0; background:linear-gradient(90deg,#142039cf,#27395938 48%,transparent 70%); pointer-events:none; }
.entry-title { position:relative; display:flex; flex-direction:column; justify-content:center; height:100%; box-sizing:border-box; width:48%; padding:6% 8%; color:#fbf4e3; }
.entry-city { letter-spacing:.5em; font-size:13px; color:#d1dbd4; }
.entry-title h1 { font-family:'Songti SC','Noto Serif CJK SC',SimSun,serif; font-size:clamp(64px,9cqw,120px); letter-spacing:.15em; font-weight:400; line-height:1.35; margin:12px 0 48px; }
.entry-title nav { display:grid; gap:12px; max-width:250px; }
.ember-entry button { text-align:left; border-radius:3px; min-height:44px; font-size:14px; }
.entry-title nav button { color:#eff4e9; background:transparent; border-color:transparent; padding:10px 0; }
.ember-entry .entry-primary { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:12px 18px; background:var(--ember-action); border:1px solid var(--ember-action); color:#fff9eb; min-height:48px; width:100%; }
.entry-title nav .entry-primary { background:#edf1e8; color:var(--ember-ink); border-color:#edf1e8; margin-bottom:4px; }
.entry-title nav button:hover { color:#f1be81; }
.entry-title nav .entry-primary:hover { color:var(--ember-ink); background:#fff7e6; }
.entry-save { display:grid; gap:3px; margin-top:30px!important; font-size:12px; color:#cad7d3; }
.entry-save span:first-child { color:#f2e5cc; font-size:14px; }
.entry-sheet { position:absolute; inset:0 0 0 auto; width:min(620px,54%); box-sizing:border-box; padding:28px 36px; background:#f4f5fcf5; overflow:auto; display:flex; flex-direction:column; gap:28px; }
.entry-sheet header { display:flex; align-items:center; justify-content:space-between; color:#627b7c; font-size:13px; }
.entry-sheet header button { background:none; border:0; padding:8px 0; }
.entry-sheet h2 { font-family:'Songti SC',SimSun,serif; font-weight:400; font-size:30px; }
.entry-identity { display:flex; flex-direction:column; gap:28px; margin-block:auto; padding-bottom:28px; }
.entry-name,.entry-age { display:flex; flex-direction:column; gap:10px; min-width:0; }
.entry-name>label,.entry-age>label,.entry-identity legend { font-size:13px; color:#5c7275; }
.entry-name>input { font:inherit; color:inherit; box-sizing:border-box; width:100%; border:0; border-bottom:1px solid #90a6a7; background:transparent; padding:10px 0; font-size:23px; border-radius:0; }
.entry-identity-details { display:grid; grid-template-columns:minmax(112px,1fr) minmax(0,1.5fr); gap:24px; }
.entry-age select { width:100%; min-height:44px; box-sizing:border-box; padding:8px; font:inherit; font-size:16px; color:inherit; background:#fff9; border:1px solid #90a6a7; border-radius:3px; }
.entry-identity fieldset { border:0; padding:0; margin:0; min-width:0; display:flex; gap:24px; }
.entry-identity legend { margin-bottom:10px; }
.entry-identity fieldset label { display:flex; align-items:center; gap:9px; min-height:44px; cursor:pointer; }
.ember-entry input { accent-color:var(--ember-action); }
.ember-entry input:focus-visible,.ember-entry select:focus-visible { outline:2px solid #b86f40; outline-offset:4px; }
.entry-chapters { display:flex; flex-direction:column; gap:28px; margin-block:auto; padding-bottom:28px; }
.ember-entry .entry-chapter { display:grid; grid-template-columns:64px minmax(0,1fr) 24px; gap:20px 16px; padding:0 0 24px; background:none; border:0; border-bottom:1px solid #839d9c66; position:relative; }
.entry-chapter-art { grid-column:1/-1; width:100%; aspect-ratio:16/9; object-fit:cover; border-radius:2px; }
.entry-numeral { font-family:Georgia,serif; font-size:72px; line-height:1; color:#b48152; }
.entry-chapter-body { display:flex; flex-direction:column; gap:14px; }
.entry-chapter-body strong { font-family:'Songti SC',SimSun,serif; font-size:27px; font-weight:400; }
.entry-chapter-body>span { font-size:14px; line-height:1.95; color:#547074; }
.entry-chapter-body small { color:#7e6650; }
.entry-chapter-arrow { align-self:flex-end; font-size:24px; }
.entry-forthcoming { display:flex; justify-content:space-between; font-size:13px; color:#6d8283; padding-left:42px; }
.entry-loadout { display:flex; flex-direction:column; gap:24px; }
.entry-traveler { display:flex; flex-wrap:wrap; gap:4px 14px; align-items:baseline; overflow-wrap:anywhere; }
.entry-traveler span { font-size:12px; color:#6d8283; }
.entry-restart { display:flex; align-items:flex-start; gap:10px; font-size:12px; color:#826048; line-height:1.8; }
.entry-restart input { margin-top:5px; flex-shrink:0; }
@container journey-entry (max-width:700px) {
 .entry-title { width:100%; padding:32px; justify-content:flex-end; }.entry-title h1 { font-size:76px; margin:8px 0 24px; }.entry-title nav { width:100%; max-width:320px; }.entry-title .entry-save { margin-top:18px!important; }
 .entry-shade { background:linear-gradient(0deg,#18223ff5,transparent 100%); }.entry-sheet { inset:0; width:100%; padding:18px 24px; background:#f4f5fcf2; gap:24px; }.entry-sheet h2 { font-size:26px; }
}
@container journey-entry (max-height:420px) {
 .entry-title { padding:20px 32px; justify-content:center; }.entry-title h1 { font-size:54px; margin:0 0 10px; }.entry-title nav { gap:0; }.entry-city,.entry-save { display:none; }.entry-sheet { padding:12px 24px; gap:12px; }.entry-identity { margin:0; gap:16px; padding-bottom:12px; }.entry-chapters { margin:0; }.entry-sheet h2 { font-size:24px; }
}
@container journey-entry (min-width:701px) and (max-height:420px) {
 .entry-sheet { width:100%; }.entry-sheet > h2 { position:absolute; top:18px; left:50%; transform:translateX(-50%); }
 .entry-identity { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); align-items:end; gap:24px 32px; padding:12px 0; }
 .entry-identity > button { grid-column:2; }
 .entry-loadout { display:grid; grid-template-columns:minmax(0,1fr) 180px; gap:12px 24px; align-items:start; }
 .entry-loadout > .ember-weapon-selector { grid-column:1; grid-row:1/4; }
 .entry-traveler { grid-column:2; grid-row:1; flex-direction:column; gap:2px; }
 .entry-restart { grid-column:2; grid-row:2; }
 .entry-loadout > button { grid-column:2; grid-row:3; }
 .entry-chapter-art { grid-column:1; grid-row:1; width:180px; height:120px; }.ember-entry .entry-chapter { grid-template-columns:180px minmax(0,1fr) 24px; padding-bottom:12px; }.entry-numeral { display:none; }
}
</style>
