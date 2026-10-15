<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, useId, watch } from 'vue';
import type { Campaign } from '../campaign/types.js';
import { isPerson, type Participant } from '../content/participants.js';
import { loadNarrativeCanon, type NarrativeCanon } from '../narrative/canon.js';
import { projectRelationship } from '../narrative/relationship-profile.js';
import { conversationUsage } from '../narrative/usage.js';
import { DIALOGUE_COPY as c } from '../content/dialogue-copy.js';
import { errorText } from '../copy.js';
import { useAppBack } from '../../../../shell/app-src/navigation/app-navigation.js';
import type { MemoryJobState } from '../narrative/memory-jobs.js';
import { currentClothing } from '../clothing.js';
import { CLOTHING_COPY } from '../content/clothing.js';
import ClothingList from './ClothingList.vue';

const props = defineProps<{ campaign: Campaign; person: Participant; draft: string; memoryState?: MemoryJobState; blocked?: boolean }>();
defineEmits<{ 'retry-memory': [] }>();
const canon = shallowRef<NarrativeCanon | null>(null), open = ref<'clothing' | 'affection' | 'context' | null>(null);
const titles = { clothing: CLOTHING_COPY.title, affection: c.affection, context: c.context };
const clothing = computed(() => currentClothing(props.campaign, props.person));
const meters = ref<HTMLElement | null>(null);
function close() { meters.value?.querySelector<HTMLButtonElement>('button[aria-expanded=true]')?.focus(); open.value = null; }
const change = ref(0), error = ref('');
let controller: AbortController | null = null, timer: ReturnType<typeof setTimeout> | undefined;
async function load() {
    controller?.abort(); controller = new AbortController(); const request = controller;
    canon.value = null; error.value = '';
    try { const loaded = await loadNarrativeCanon(props.person, request.signal); if (!request.signal.aborted) { canon.value = loaded; } }
    catch (cause) { if (!request.signal.aborted) { error.value = errorText(cause); } }
}
watch(() => props.person, () => { open.value = null; change.value = 0; void load(); }, { immediate: true });
const affection = computed(() => isPerson(props.person) ? props.campaign.relationships[props.person].affection : 0);
const affectionFillId = `ember-affection-${useId()}`;
const affectionHeight = computed(() => 19 * affection.value / 100);
const name = computed(() => canon.value?.relationship ? projectRelationship(canon.value.relationship, affection.value).name : '');
const usage = computed(() => canon.value ? conversationUsage(props.campaign, props.person, props.draft, canon.value) : null);
watch(() => [props.person, affection.value] as const, ([person, value], [previousPerson, previous]) => {
    if (person === previousPerson && value === previous) { return; }
    if (timer) { clearTimeout(timer); }
    change.value = person === previousPerson ? value - previous : 0;
    if (change.value) { timer = setTimeout(() => { change.value = 0; }, 3500); }
});
useAppBack(() => { close(); return true; }, () => !!open.value);
onBeforeUnmount(() => { controller?.abort(); if (timer) { clearTimeout(timer); } });
const format = (value: number) => `${(value / 1000).toFixed(1)}k`;
</script>

<template>
    <div ref="meters" class="ember-meters" @keydown.esc.stop="close">
        <button type="button" class="ember-meter-button ember-clothing-button" :aria-label="CLOTHING_COPY.title" :aria-expanded="open === 'clothing'" @click="open = open === 'clothing' ? null : 'clothing'">
            <svg viewBox="2 2 20 20" aria-hidden="true"><path d="m8 4-5 3 2 5 3-1v9h8v-9l3 1 2-5-5-3c0 2-1.5 3-4 3S8 6 8 4Z" /></svg>
        </button>
        <button v-if="isPerson(person)" type="button" class="ember-meter-button" :aria-label="c.affection" :aria-expanded="open === 'affection'" @click="open = open === 'affection' ? null : 'affection'">
            <svg class="ember-affection-heart" viewBox="2 3 20 19" aria-hidden="true">
                <defs>
                    <path :id="`${affectionFillId}-shape`" d="M12 21C10.6 19.8 3 14.7 3 8.5C3 5.9 5.1 4 7.5 4C9.4 4 11 5 12 6.5C13 5 14.6 4 16.5 4C18.9 4 21 5.9 21 8.5C21 14.7 13.4 19.8 12 21Z" />
                    <clipPath :id="affectionFillId"><rect x="2" :y="22 - affectionHeight" width="20" :height="affectionHeight" /></clipPath>
                </defs>
                <use :href="`#${affectionFillId}-shape`" class="ember-affection-track" />
                <use :href="`#${affectionFillId}-shape`" class="ember-affection-filled" :clip-path="`url(#${affectionFillId})`" />
            </svg>
            <small v-if="change" class="ember-affection-change" :class="{ 'is-down': change < 0 }" role="status">{{ change > 0 ? '+' : '' }}{{ change }}</small>
        </button>
        <button type="button" class="ember-meter-button" :aria-label="c.context" :aria-expanded="open === 'context'" @click="open = open === 'context' ? null : 'context'">
            <span class="ember-meter-ring" :class="{ 'is-warning': usage && usage.used >= usage.trigger }" :style="{ '--meter-fill': `${Math.min(1, (usage?.used ?? 0) / (usage?.limit ?? 1)) * 360}deg` }"><span /></span>
        </button>
        <section v-if="open" class="ember-meter-popover" :class="{ 'ember-clothing-popover': open === 'clothing' }" :aria-label="titles[open]">
            <header><strong>{{ titles[open] }}</strong><button type="button" :aria-label="c.close" @click="close">×</button></header>
            <template v-if="open === 'affection'"><p class="ember-meter-total">{{ affection }} <small>/ 100</small></p><p v-if="!error">{{ name || c.loading }}</p></template>
            <ClothingList v-else-if="open === 'clothing'" :clothing="clothing" />
            <template v-else-if="usage">
                <p class="ember-meter-total">{{ format(usage.used) }} / {{ format(usage.limit) }}</p>
                <dl class="ember-meter-breakdown"><template v-for="(label, key) in c.contextParts" :key="key"><dt>{{ label }}</dt><dd>{{ format(usage[key]) }}</dd></template></dl>
                <template v-if="memoryState?.status === 'failed'"><p class="ember-error-detail" role="status">{{ errorText(memoryState) }}</p><button type="button" :disabled="blocked" @click="$emit('retry-memory')">{{ c.memoryRetry }}</button></template>
            </template><p v-else-if="!error">{{ c.loading }}</p>
            <template v-if="error && open !== 'clothing'"><p role="status">{{ error }}</p><button type="button" @click="load">{{ c.retry }}</button></template>
        </section>
    </div>
</template>

<style scoped>
.ember-meters{position:relative;display:flex;align-items:center;gap:2px;flex-shrink:0}
.ember-campaign .ember-meter-button{position:relative;display:grid;place-items:center;min-height:44px;width:44px;padding:8px;border:0;background:transparent}
.ember-meter-button>svg,.ember-meter-ring{width:28px;height:28px;flex-shrink:0}
.ember-campaign .ember-clothing-button{color:var(--ember-muted);border-radius:8px}
.ember-clothing-button svg{fill:none;stroke:currentColor;stroke-width:1.4;stroke-linejoin:round}
.ember-clothing-button[aria-expanded=true]{background:#dce6ef;color:#365675}
.ember-meter-ring{--meter-fill:0deg;--meter-accent:#326b70;box-sizing:border-box;padding:3px;border-radius:50%;background:conic-gradient(var(--meter-accent) var(--meter-fill),#ceded6 0);display:grid;place-items:center;transition:background .25s}
.ember-meter-ring>span{width:100%;height:100%;border-radius:50%;background:#f3f7ee;display:grid;place-items:center}.ember-meter-ring.is-warning{--meter-accent:#bd7b32}
.ember-affection-heart{overflow:visible;stroke-width:1.4;stroke-linejoin:round}.ember-affection-track{fill:none;stroke:#d8c3cb}.ember-affection-filled{fill:#bd637a;stroke:#bd637a}
.ember-affection-change{position:absolute;left:50%;bottom:-12px;transform:translateX(-50%);font-size:12px;line-height:18px;font-weight:500;font-variant-numeric:tabular-nums;color:#a66c7e;pointer-events:none}.ember-affection-change.is-down{color:#728898}
.ember-meter-popover{position:absolute;right:0;top:46px;z-index:6;width:min(260px,calc(100cqw - 64px));box-sizing:border-box;padding:12px 15px;background:#fbfdf7;box-shadow:0 5px 28px #163e4226;border:1px solid #ccddd1;border-radius:14px;font-size:12px;line-height:1.6}
.ember-meter-popover header{display:flex;align-items:center;justify-content:space-between;gap:10px}.ember-meter-popover strong{font-size:13px}.ember-campaign .ember-meter-popover button{min-height:32px;padding:0 10px;border:0;background:transparent}
.ember-meter-popover .ember-error-detail{max-height:30dvh;overflow:auto;overscroll-behavior:contain}
.ember-meter-popover.ember-clothing-popover{width:min(350px,calc(100cqw - 48px));max-height:60dvh;overflow:auto;background:var(--ember-paper);border-color:var(--ember-line);color:var(--ember-ink)}
.ember-clothing-popover header{position:sticky;top:-12px;padding-block:4px;background:var(--ember-paper);z-index:1}
.ember-campaign .ember-meter-total{font-size:21px;margin:8px 0 12px;font-variant-numeric:tabular-nums}.ember-meter-breakdown{display:grid;grid-template-columns:1fr auto;gap:7px}.ember-meter-breakdown dd{margin:0;font-variant-numeric:tabular-nums}.ember-meter-popover small{display:block;color:#5e7977;line-height:1.5}.ember-meter-total small{display:inline}
@media(min-width:650px) and (max-height:450px){.ember-meters{position:static}.ember-meter-popover{top:56px;right:20px;max-height:calc(100% - 116px);overflow:auto}}
@container(max-width:520px){.ember-meters:has(.ember-clothing-popover){position:static}.ember-meter-popover.ember-clothing-popover{top:auto;bottom:0;left:0;right:0;width:100%;max-height:70%;padding:12px 20px 20px;border-radius:16px 16px 0 0;box-shadow:0 -8px 32px #26364f26}}
@media(prefers-reduced-motion:reduce){.ember-meter-ring{transition:none}}
</style>
