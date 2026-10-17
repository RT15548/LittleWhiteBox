<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue';
import type { createIslandClient } from '../client.js';
import type { GmContextUsage } from '../agent/runner.js';
import { COPY as c } from '../copy.js';
import { useAppBack } from '../../../../shell/app-src/navigation/app-navigation.js';

const props = defineProps<{ client: ReturnType<typeof createIslandClient>; sequence: number | undefined }>();
const usage = ref<GmContextUsage | null>(null), failure = ref(''), open = ref(false), measuring = ref(true);
let timer: ReturnType<typeof setTimeout> | undefined, active = true, asked = 0;
async function measure() {
    if (!active) { return; }
    clearTimeout(timer);
    const mine = ++asked; measuring.value = true;
    const result = await props.client.context();
    if (!active || mine !== asked) { return; }
    measuring.value = false;
    if ('usage' in result) { usage.value = result.usage; failure.value = ''; } else { usage.value = null; failure.value = result.failure; }
}
function schedule(delay = 0) {
    clearTimeout(timer);
    if (active) { timer = setTimeout(() => void measure(), delay); }
}
function suspend() { active = false; ++asked; open.value = false; clearTimeout(timer); }
function escape(event: KeyboardEvent) { if (open.value) { event.stopPropagation(); open.value = false; } }
useAppBack(() => { open.value = false; return true; }, () => open.value);
// New talk changes what the next reply reads; measuring waits for the exchange to settle.
watch(() => props.sequence, () => schedule(1500));
watch(open, value => { if (value) { void measure(); } });
// Mount + initial activation coalesce into one measurement. Later activations refresh even if no one spoke.
onMounted(() => schedule());
onActivated(() => { active = true; schedule(); });
onDeactivated(suspend);
onBeforeUnmount(suspend);
const fill = computed(() => usage.value ? Math.min(1, usage.value.used / usage.value.limit) * 360 : 0);
const trimmed = computed(() => !!usage.value && usage.value.used >= usage.value.trim);
const parts = computed(() => usage.value ? (['system', 'rules', 'story'] as const).map(key => ({ key, tokens: usage.value![key] })) : []);
const format = (value: number) => `${(value / 1000).toFixed(1)}k`;
</script>

<template>
    <div class="island-context" @keydown.esc="escape">
        <button type="button" class="island-context-button" :aria-label="c.contextUsage" :aria-expanded="open" @click="open = !open">
            <span class="island-context-ring" :class="{ 'island-context-warn': trimmed, 'island-context-unknown': !usage }" :style="{ '--context-fill': `${fill}deg` }"><span /></span>
        </button>
        <section v-if="open" class="island-context-popover" :aria-label="c.contextUsage">
            <header><strong>{{ c.context }}</strong><button type="button" :aria-label="c.close" @click="open = false">×</button></header>
            <template v-if="usage">
                <p class="island-context-total">{{ c.contextTotal(usage.used, usage.limit) }}</p>
                <dl><template v-for="part in parts" :key="part.key"><dt>{{ c.contextParts[part.key] }}</dt><dd>{{ format(part.tokens) }}</dd></template></dl>
                <small>{{ trimmed ? c.contextTrimmed : c.contextNote }}</small>
            </template>
            <small v-else-if="measuring">{{ c.contextMeasuring }}</small>
            <small v-else>{{ failure || c.contextUnavailable }}</small>
        </section>
    </div>
</template>

<style scoped>
.island-context{position:relative;flex-shrink:0}
.island-context .island-context-button{display:grid;place-items:center;width:40px;min-height:40px;padding:0;border:0;background:none}
.island-context-ring{--context-fill:0deg;display:grid;place-items:center;width:26px;height:26px;padding:3px;border-radius:50%;background:conic-gradient(var(--island-accent) var(--context-fill),var(--island-line) 0)}
.island-context-ring>span{width:100%;height:100%;border-radius:50%;background:var(--island-paper)}
.island-context-warn{background:conic-gradient(#c58b3f var(--context-fill),var(--island-line) 0)}
.island-context-unknown{background:var(--island-line)}
.island-context-popover{position:absolute;right:0;top:44px;z-index:6;width:236px;padding:12px 15px;background:var(--island-paper);border:1px solid var(--island-line);border-radius:12px;box-shadow:0 5px 28px #254b6526}
.island-context-popover header{display:flex;align-items:center;justify-content:space-between;gap:10px}
.island-context-popover header strong{font-size:13px}
.island-context-popover header button{border:0;background:none;min-height:32px;width:32px;padding:0;color:var(--island-muted)}
.island-context-total{font-size:20px;margin:6px 0 10px;font-variant-numeric:tabular-nums}
.island-context-popover dl{display:grid;grid-template-columns:1fr auto;gap:7px;font-size:12px;margin:0 0 10px}
.island-context-popover dd{margin:0;font-variant-numeric:tabular-nums}
.island-context-popover small{display:block;line-height:1.6}
</style>
