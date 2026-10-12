<script setup lang="ts">
import { useId } from 'vue';
import { WEAPON_LIST } from '../content.js';
import { WEAPON_COPY } from '../copy.js';
import { JOURNEY_COPY as j } from '../content/journey-copy.js';
import type { Weapon } from '../types.js';
import ExpeditionIcon from '../ExpeditionIcon.vue';
import { WEAPON_ART } from '../artwork.js';

const weapon = defineModel<Weapon>({ required: true });
const group = useId();
</script>

<template>
    <fieldset class="ember-weapon-selector" :aria-label="j.chooseWeapon">
        <div class="ember-weapon-layout">
            <div class="ember-weapon-list">
                <label v-for="id in WEAPON_LIST" :key="id" :class="{ 'is-selected': weapon === id }">
                    <input v-model="weapon" type="radio" :name="group" :value="id">
                    <ExpeditionIcon :name="id" /><span>{{ WEAPON_COPY[id].name }}</span>
                </label>
            </div>
            <div class="ember-weapon-profile" aria-live="polite" aria-atomic="true">
                <img :key="weapon" class="ember-weapon-art" :src="WEAPON_ART[weapon]" alt="" decoding="async" width="640" height="640">
                <h3>{{ WEAPON_COPY[weapon].name }}</h3>
                <p>{{ WEAPON_COPY[weapon].detail }}</p>
                <div class="ember-weapon-skill"><strong>{{ WEAPON_COPY[weapon].action }}</strong><p>{{ WEAPON_COPY[weapon].skill }}</p></div>
            </div>
        </div>
    </fieldset>
</template>

<style scoped>
.ember-weapon-selector { container: weapon-selection / inline-size; margin:0; padding:0; min-width:0; border:0; }
.ember-weapon-layout { display:grid; grid-template-columns:145px minmax(0,1fr); gap:24px; }
.ember-weapon-list { display:flex; flex-direction:column; gap:2px; }
label { position:relative; display:flex; align-items:center; gap:8px; padding:10px 8px; min-height:44px; box-sizing:border-box; cursor:pointer; border-left:2px solid transparent; color:#50666a; }
label:hover { color:#253f46; background:#24475109; }
label.is-selected { border-color:#a55a37; color:#753f28; background:#a55a370c; }
label:has(input:focus-visible) { outline:2px solid #a55a37; outline-offset:2px; }
input { position:absolute; width:1px; height:1px; opacity:0; }
.ember-weapon-list :deep(.exp-icon) { width:22px; height:22px; }
.ember-weapon-profile { display:flex; flex-direction:column; align-items:flex-start; min-width:0; gap:10px; padding:8px 0; }
.ember-weapon-art { width:100%; height:clamp(150px,25cqh,260px); object-fit:contain; }
.ember-weapon-profile h3 { font-size:21px; font-weight:600; letter-spacing:.06em; }
.ember-weapon-profile p { font-size:13px; line-height:1.75; }
.ember-weapon-skill { margin-top:auto; padding-top:14px; border-top:1px solid #31556025; width:100%; }
.ember-weapon-skill strong { display:block; font-size:13px; margin-bottom:5px; color:#47616a; }
.ember-weapon-skill p { color:#52686b; }
@container weapon-selection (max-width:440px) {
    .ember-weapon-layout { grid-template-columns:1fr; gap:20px; }
    .ember-weapon-list { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px 0; }
    label { flex-direction:column; gap:4px; border-left:0; border-bottom:2px solid transparent; padding:7px 2px; font-size:12px; }
    .ember-weapon-profile { display:grid; grid-template-columns:minmax(0,1fr); gap:8px; align-content:start; padding:0; }
    .ember-weapon-art { height:180px; }
    .ember-weapon-profile h3 { font-size:19px; }
    .ember-weapon-skill { grid-column:1/-1; margin-top:8px; padding-top:10px; }
}
@media (min-width:701px) and (max-height:450px) {
    .ember-weapon-layout { grid-template-columns:minmax(180px,.9fr) minmax(0,1fr); gap:18px; }
    .ember-weapon-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:4px; align-content:start; }
    label { flex-direction:row; gap:5px; padding:8px 4px; font-size:12px; border-left:2px solid transparent; border-bottom:0; }
    .ember-weapon-profile { display:flex; min-height:0; gap:5px; padding:0; }
    .ember-weapon-art { height:100px; }
    .ember-weapon-profile h3 { font-size:18px; }
    .ember-weapon-skill { margin-top:4px; padding-top:8px; }
}
</style>
