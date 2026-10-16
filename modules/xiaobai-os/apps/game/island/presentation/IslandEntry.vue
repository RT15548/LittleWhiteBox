<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { PLAYER_AGES, PLAYER_BACKGROUND_LIMIT, PLAYER_BODIES, PLAYER_GENDERS, PLAYER_NAME_LIMIT, type PlayerAge, type PlayerGender, type PlayerIdentity } from '../characters.js';
import { COPY as c } from '../copy.js';
import { ISLAND_ART } from './artwork.js';
import { characterPortrait, playerCharacterKey } from './character-media.js';
import IslandIcon from './IslandIcon.vue';

const props = defineProps<{ identity: PlayerIdentity | null; replacing: boolean; unreadable: boolean; ended: boolean; creating: boolean; ready: boolean; busy: boolean; blocked: boolean }>();
const emit = defineEmits<{ start: [identity: PlayerIdentity]; continue: [] }>();
const step = ref<'title' | 'identity'>(props.creating ? 'identity' : 'title');
const name = ref(props.identity?.name ?? ''), gender = ref<PlayerGender | ''>(props.identity?.gender ?? ''), age = ref<PlayerAge | ''>(props.identity?.appearanceAge ?? '');
const background = ref(props.identity?.background ?? ''), confirmed = ref(false);
const root = ref<HTMLElement | null>(null), heading = ref<HTMLElement | null>(null), sheet = ref<HTMLElement | null>(null), portraitLayout = ref(false);
let resize: ResizeObserver | null = null;
const valid = computed(() => !!name.value.trim() && name.value.trim().length <= PLAYER_NAME_LIMIT && !/[\r\n]/.test(name.value) && !!gender.value && !!age.value && background.value.length <= PLAYER_BACKGROUND_LIMIT);
const portrait = computed(() => gender.value && age.value ? characterPortrait(playerCharacterKey({ gender: gender.value, appearanceAge: age.value })) : null);
watch(() => props.identity, identity => {
    if (step.value !== 'title') { return; }
    name.value = identity?.name ?? ''; gender.value = identity?.gender ?? ''; age.value = identity?.appearanceAge ?? ''; background.value = identity?.background ?? '';
});
watch(step, async () => { await nextTick(); if (sheet.value) { sheet.value.scrollTop = 0; } heading.value?.focus({ preventScroll: true }); });
onMounted(() => {
    resize = new ResizeObserver(([entry]) => { portraitLayout.value = entry.contentRect.height > entry.contentRect.width; });
    resize.observe(root.value!);
});
onBeforeUnmount(() => resize?.disconnect());
function begin() { confirmed.value = false; step.value = 'identity'; }
function start() {
    if (!valid.value || !gender.value || !age.value || props.blocked || props.replacing && !confirmed.value) { return; }
    emit('start', { name: name.value.trim(), gender: gender.value, appearanceAge: age.value, ...(background.value.trim() ? { background: background.value.trim() } : {}) });
}
function back() {
    if (step.value === 'title' || props.busy) { return false; }
    step.value = 'title'; return true;
}
defineExpose({ back });
</script>

<template>
    <section ref="root" class="island-entry" :class="{ 'island-entry-editing': step === 'identity', 'island-entry-tall': portraitLayout }" :aria-label="c.name">
        <img class="island-entry-art" :src="portraitLayout ? ISLAND_ART.portrait : ISLAND_ART.title" alt="">
        <div class="island-entry-shade" />
        <div v-if="step === 'title'" class="island-entry-title">
            <div class="island-entry-wordmark"><IslandIcon name="mark" /><h1 ref="heading" tabindex="-1">{{ c.name }}</h1></div>
            <div class="island-entry-menu">
                <p v-if="unreadable" class="island-entry-unreadable" role="status">{{ c.identity.unreadable }}</p>
                <nav :aria-label="c.name">
                    <button v-if="identity" type="button" class="island-entry-start" :disabled="!ready || blocked" @click="emit('continue')"><span>{{ ended ? c.identity.continueEnded : c.resume }}</span><IslandIcon name="arrow" /></button>
                    <button type="button" :class="identity ? 'island-entry-new' : 'island-entry-start'" :disabled="!ready || blocked" @click="begin"><span>{{ replacing ? c.identity.newJourney : c.start }}</span><IslandIcon v-if="!identity" name="arrow" /></button>
                </nav>
                <div v-if="identity" class="island-entry-save"><strong>{{ identity.name }}</strong><span>{{ PLAYER_BODIES[identity.gender].label }} · {{ PLAYER_AGES[identity.appearanceAge] }}</span></div>
            </div>
        </div>
        <div v-else ref="sheet" class="island-entry-sheet">
            <header><button type="button" :disabled="busy" @click="back"><IslandIcon name="back" />{{ c.back }}</button><span>{{ c.name }}</span></header>
            <h2 ref="heading" tabindex="-1">{{ c.identity.title }}</h2>
            <form class="island-entry-form" @submit.prevent="start">
                <div class="island-entry-form-content">
                    <div class="island-entry-appearance">
                        <div class="island-entry-preview"><img v-if="portrait" :src="portrait" alt=""><template v-else><IslandIcon name="body" /><span>{{ c.identity.preview }}</span></template></div>
                        <div class="island-entry-fields">
                            <label class="island-entry-name">{{ c.identity.name }}<input v-model="name" :maxlength="PLAYER_NAME_LIMIT" :placeholder="c.identity.namePlaceholder" :disabled="busy" required autocomplete="off" :pattern="'.*\\S.*'"></label>
                            <fieldset :disabled="busy"><legend>{{ c.identity.gender }}</legend><label v-for="id in PLAYER_GENDERS" :key="id" :class="{ selected: gender === id }"><input v-model="gender" type="radio" name="island-identity-gender" :value="id" required><span>{{ PLAYER_BODIES[id].label }}</span></label></fieldset>
                            <label class="island-entry-age">{{ c.identity.age }}<select v-model="age" :disabled="busy" required><option disabled value="">{{ c.identity.agePlaceholder }}</option><option v-for="(label, id) in PLAYER_AGES" :key="id" :value="id">{{ label }}</option></select></label>
                        </div>
                    </div>
                    <label class="island-entry-background"><span>{{ c.identity.background }}<small>{{ c.identity.optional }}</small></span><textarea v-model="background" rows="4" :maxlength="PLAYER_BACKGROUND_LIMIT" :placeholder="c.identity.backgroundPlaceholder" :disabled="busy" /><small class="island-entry-count">{{ c.identity.backgroundCount(background.length, PLAYER_BACKGROUND_LIMIT) }}</small></label>
                    <label v-if="replacing" class="island-entry-replace"><input v-model="confirmed" type="checkbox" :disabled="busy" required><span>{{ c.identity.confirmed }}</span></label>
                </div>
                <footer><small>{{ c.identity.adult }}</small><button class="island-primary" :disabled="blocked || !valid || replacing && !confirmed"><span>{{ busy ? c.identity.entering : replacing ? c.identity.restart : c.identity.enter }}</span><IslandIcon name="arrow" /></button></footer>
            </form>
        </div>
    </section>
</template>

<style scoped>
.island-entry{position:absolute;inset:0;overflow:hidden;background:#80cde5;container:island-entry / size}
.island-entry-art,.island-entry-shade{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.island-entry-shade{background:linear-gradient(90deg,#083e6e70,transparent 67%)}
.island-entry-title{position:relative;display:flex;flex-direction:column;justify-content:space-between;width:min(520px,54%);height:100%;padding:clamp(32px,7%,90px);color:#fff}
.island-entry-wordmark{padding-top:5%}.island-entry-wordmark>.island-icon{width:32px;height:32px;margin-bottom:24px;opacity:.9}
.island-entry-title h1{font-family:'Noto Serif SC','Songti SC',SimSun,serif;font-size:clamp(68px,9cqw,108px);letter-spacing:.2em;font-weight:500;line-height:1.3;text-shadow:0 3px 30px #16477925}
.island-entry-menu{display:grid;gap:22px;max-width:310px}.island-entry-title nav{display:grid;gap:10px}
.island-entry-title nav button{display:flex;justify-content:space-between;align-items:center;min-height:52px;letter-spacing:.08em;padding:12px 20px;border-radius:4px}
.island-entry-title .island-entry-start{background:#fffcf5;color:#21485e;border-color:#fffcf5;box-shadow:0 5px 20px #164a7126}
.island-entry-title .island-entry-start:hover:not(:disabled){background:#fff;color:#146384;transform:translateY(-1px)}
.island-entry-title .island-entry-new{border-color:#ffffff70;background:#174b6d30;color:white}
.island-entry-title .island-entry-new:hover:not(:disabled){background:#174b6d50;border-color:#fff}
.island-entry-save{display:flex;align-items:baseline;gap:14px;font-size:12px;text-shadow:0 1px 5px #124d69}.island-entry-save strong{font-size:15px;font-weight:500}.island-entry-save span{opacity:.85}
.island-entry-unreadable{font-size:13px;line-height:1.8;background:#12394d80;padding:12px}
.island-entry-sheet{position:absolute;inset:24px 24px 24px auto;width:min(660px,66%);padding:24px 36px;background:#fffdf9;display:flex;flex-direction:column;gap:20px;overflow:hidden;border-radius:9px;box-shadow:0 16px 50px #1749672b;color:var(--island-ink)}
.island-entry-sheet>header{display:flex;align-items:center;justify-content:space-between;color:var(--island-muted);font-size:12px;letter-spacing:.16em}
.island-entry-sheet>header button{display:flex;align-items:center;gap:8px;border:0;background:none;padding-left:0;font-size:13px;letter-spacing:0}.island-entry-sheet>header .island-icon{width:18px;height:18px}
.island-entry-sheet>h2{font-family:'Noto Serif SC','Songti SC',SimSun,serif;font-size:30px;font-weight:500;letter-spacing:.08em}
.island-entry-sheet>header,.island-entry-sheet>h2{flex-shrink:0}
.island-entry-form{display:flex;flex-direction:column;gap:20px;margin:0;flex:1;min-height:0}
.island-entry-form-content{display:flex;flex-direction:column;gap:22px;flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:4px 4px 4px 0}
.island-entry-appearance{display:grid;grid-template-columns:minmax(100px,34%) minmax(0,1fr);gap:26px}
.island-entry-preview{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:16px;border-radius:6px;background:#eaf2f5;overflow:hidden;height:220px;align-self:start;flex-shrink:0}
.island-entry-preview img{width:100%;height:100%;object-fit:cover;min-height:0}.island-entry-preview>.island-icon{width:48px;height:48px;color:#8aa8b5}.island-entry-preview span{color:#6e8a99;font-size:12px}
.island-entry-fields{display:flex;flex-direction:column;justify-content:space-between;gap:18px}
.island-entry-name,.island-entry-age{display:flex;flex-direction:column;gap:8px;font-size:12px}
.island-entry-name input,.island-entry-age select{width:100%;min-height:42px;border:1px solid var(--island-line);border-radius:4px;padding:8px 10px;background:#fff;font-size:14px}
.island-entry-name input{border-width:0 0 1px;border-radius:0;background:transparent;font-size:20px;padding-left:0}.island-entry-name input::placeholder{font-size:14px;color:#81939e}
.island-entry-form fieldset{border:0;margin:0;padding:0;display:flex;gap:8px}.island-entry-form legend{font-size:12px;margin-bottom:8px}
.island-entry-form fieldset label{display:flex;justify-content:center;gap:8px;align-items:center;min-height:40px;border:1px solid var(--island-line);border-radius:4px;padding:5px 16px;flex:1;cursor:pointer;font-size:13px}.island-entry-form fieldset label.selected{background:var(--island-soft);border-color:var(--island-accent);color:var(--island-accent)}
.island-entry-form input[type=radio],.island-entry-form input[type=checkbox]{accent-color:var(--island-accent);width:16px;height:16px;flex-shrink:0;margin:0}
.island-entry-background{display:flex;flex-direction:column;gap:10px;font-size:13px}.island-entry-background>span{display:flex;gap:10px;align-items:baseline}.island-entry-background textarea{resize:vertical;min-height:100px;max-height:220px;line-height:1.8;padding:12px;border:1px solid var(--island-line);border-radius:4px;background:#fff;font-size:14px}.island-entry-background textarea::placeholder{color:#81939e}.island-entry-count{text-align:right;margin-top:-4px;font-variant-numeric:tabular-nums}
.island-entry-form .island-entry-replace{display:flex;align-items:flex-start;gap:10px;font-size:12px;line-height:1.8;color:#9a5b41}.island-entry-replace input{margin-top:4px}
.island-entry-form footer{display:flex;align-items:center;justify-content:space-between;gap:14px;border-top:1px solid var(--island-line);padding-top:18px;flex-shrink:0}.island-entry-form footer button{display:flex;align-items:center;justify-content:center;gap:18px;min-height:46px;flex-shrink:0}.island-entry-form footer small{max-width:150px}
.island-entry-tall .island-entry-title{width:100%;padding:42px 30px 48px}.island-entry-tall .island-entry-wordmark{padding-top:0}.island-entry-tall .island-entry-title h1{font-size:76px}
.island-entry-tall .island-entry-shade{background:linear-gradient(180deg,#125d8240,transparent 40%,#0b3f6c80)}.island-entry-tall .island-entry-menu{width:100%;max-width:360px}
@container island-entry (max-width:700px){.island-entry-sheet{inset:0;width:100%;border-radius:0;padding:20px 24px;gap:20px}.island-entry-form{gap:22px}.island-entry-appearance{grid-template-columns:minmax(90px,32%) minmax(0,1fr);gap:18px}.island-entry-preview{min-height:220px}.island-entry-form footer{flex-direction:column;align-items:stretch;gap:12px}.island-entry-form footer small{max-width:none}.island-entry-form fieldset label{padding:5px 8px}}
@container island-entry (max-height:500px){.island-entry-title{padding:24px 36px;gap:18px}.island-entry-wordmark{padding-top:0}.island-entry-wordmark>.island-icon{display:none}.island-entry-title h1{font-size:60px}.island-entry-title nav button{min-height:44px}.island-entry-menu{gap:12px}.island-entry-sheet{inset:0 0 0 auto;border-radius:0;padding:16px 24px;gap:16px}.island-entry-form{margin:0;gap:18px}}
</style>
