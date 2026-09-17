<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import { HostRequestError } from '../../../shell/app-src/frame-bridge.js';
import type { ActionCheckFrequency, DiceClientState } from '../types.js';
const props = defineProps<XiaobaiOsAppProps>();
const state = ref(props.initialState as DiceClientState);
const busy = ref(false);
const error = ref('');
const frequencyChoices: Record<ActionCheckFrequency, { label: string; description: string }> = {
    light: { label: '轻量', description: '模型会更克制地使用骰子。' },
    standard: { label: '标准', description: '模型会在合适的时候使用骰子。' },
    active: { label: '活跃', description: '模型将更活跃地使用骰子参与剧情。' },
};
let unsubscribe = () => {};
let mounted = false;
let pushed = 0;
onMounted(() => {
    mounted = true;
    unsubscribe = props.bridge.subscribe(message => {
        if (message.type === 'dice/state') {
            const next = (message.payload as { state: DiceClientState }).state;
            if (next.chatIdentity === state.value.chatIdentity) { pushed++; state.value = next; }
        }
    });
});
onBeforeUnmount(() => { mounted = false; unsubscribe(); });
async function send(type: string, payload: Record<string, unknown>) {
    if (busy.value) { return; }
    busy.value = true; error.value = '';
    const identity = state.value.chatIdentity;
    const version = pushed;
    try {
        const response = await props.bridge.request(type, { chatIdentity: identity, ...payload }) as { result: DiceClientState };
        if (mounted && version === pushed && response.result.chatIdentity === identity) { state.value = response.result; }
    } catch (cause) {
        if (mounted) { error.value = cause instanceof HostRequestError && cause.code === 'app_request_failed'
            ? cause.message : '操作未完成，请稍后重试。'; }
    }
    finally { if (mounted) { busy.value = false; } }
}
</script>

<template>
    <main class="dice-app">
        <p class="dice-scope">全局设置</p>
        <section aria-labelledby="dice-action-label" class="dice-feature">
            <div class="dice-switch-row">
                <h1 id="dice-action-label">行动检定</h1>
                <button
                    type="button" class="dice-switch" role="switch" aria-labelledby="dice-action-label" :aria-checked="state.actionChecksEnabled"
                    :disabled="busy" @click="send('dice/set-feature', { feature: 'actionChecksEnabled', enabled: !state.actionChecksEnabled })"
                >
                    <span aria-hidden="true" /><span class="dice-sr">{{ state.actionChecksEnabled ? '关闭' : '开启' }}</span>
                </button>
            </div>
            <p class="dice-intro">当你尝试不确定的事——说服陌生人、翻越高墙、破译符文——由骰子裁决，而非 AI。一次真随机掷骰仲裁结果，故事顺从命运。</p>
            <fieldset v-if="state.actionChecksEnabled" class="dice-frequency" :disabled="busy" aria-describedby="dice-frequency-description">
                <legend>检定频率</legend>
                <div class="dice-frequency-options">
                    <button
                        v-for="(choice, frequency) in frequencyChoices" :key="frequency" type="button" class="dice-frequency-option"
                        :aria-pressed="state.actionCheckFrequency === frequency"
                        @click="state.actionCheckFrequency !== frequency && send('dice/set-frequency', { frequency })"
                    >
                        {{ choice.label }}
                    </button>
                </div>
                <p id="dice-frequency-description" aria-live="polite">{{ frequencyChoices[state.actionCheckFrequency].description }}</p>
            </fieldset>
            <aside class="dice-notice">
                <p>请关闭酒馆的「自动续写」。</p>
                <p>功能开启期间，请勿修改或删除「小白 OS · 行动检定显示」正则。</p>
            </aside>
        </section>
        <section aria-labelledby="dice-encounter-label" class="dice-feature">
            <div class="dice-switch-row">
                <h2 id="dice-encounter-label">随机遭遇</h2>
                <button
                    type="button" class="dice-switch" role="switch" aria-labelledby="dice-encounter-label" :aria-checked="state.encountersEnabled"
                    :disabled="busy" @click="send('dice/set-feature', { feature: 'encountersEnabled', enabled: !state.encountersEnabled })"
                >
                    <span aria-hidden="true" /><span class="dice-sr">{{ state.encountersEnabled ? '关闭' : '开启' }}</span>
                </button>
            </div>
            <p>偶尔为剧情添一点变数，也可从已开启的世界背景与剧情记忆中寻找灵感。</p>
            <p class="dice-rates">轻微 5% <span aria-hidden="true">·</span> 中等 3% <span aria-hidden="true">·</span> 重大 1%</p>
            <p class="dice-cooldown">触发后，接下来的两次用户发言不会触发新遭遇。不额外调用模型。</p>
        </section>
        <section v-if="error" class="dice-recovery" aria-live="polite">
            <p>{{ error }}</p>
        </section>
    </main>
</template>

<style scoped>
.dice-app { max-width:36rem; margin:0 auto; padding:24px 22px; color:var(--xiaobai-os-ink); font-size:14px; line-height:1.75; }
.dice-switch-row { display:flex; align-items:center; justify-content:space-between; gap:16px; }
h1,h2 { margin:0; font-size:20px; font-weight:650; }
.dice-scope { margin:0 0 18px; font-size:12px; opacity:.7; }
.dice-feature + .dice-feature { margin-top:28px; padding-top:24px; border-top:1px solid color-mix(in srgb,currentColor 15%,transparent); }
.dice-rates { font-size:13px; word-spacing:.08em; }
.dice-rates span { margin:0 .2em; opacity:.5; }
.dice-cooldown { font-size:13px; }
p { margin:14px 0; }
.dice-intro { margin-top:24px; }
.dice-frequency { min-width:0; margin:20px 0 0; padding:0; border:0; }
.dice-frequency legend { margin-bottom:8px; padding:0; font-size:13px; }
.dice-frequency-options { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:4px; padding:4px; border-radius:12px; background:color-mix(in srgb,currentColor 7%,transparent); }
.dice-frequency-option { min-width:0; min-height:44px; padding:8px; border:0; border-radius:8px; background:transparent; color:inherit; font:inherit; line-height:1.4; text-align:center; cursor:pointer; }
.dice-frequency-option[aria-pressed="true"] { background:#7062d9; color:white; font-weight:600; }
.dice-frequency-option:focus-visible { outline:2px solid #8577f0; outline-offset:2px; }
.dice-frequency:disabled { opacity:.6; }
.dice-frequency-option:disabled { cursor:wait; }
.dice-frequency p { margin:8px 0 0; font-size:13px; }
.dice-switch { position:relative; width:48px; height:32px; border:0; padding:4px; flex-shrink:0; border-radius:20px; background:#858795; cursor:pointer; }
.dice-switch::after { content:""; position:absolute; inset:-6px 0; }
.dice-switch > span:first-child { display:block; width:24px; height:24px; border-radius:50%; background:white; transition:transform .15s; }
.dice-switch[aria-checked="true"] { background:#7062d9; }
.dice-switch[aria-checked="true"] > span:first-child { transform:translateX(16px); }
.dice-switch:disabled { opacity:.5; cursor:wait; }
.dice-switch:focus-visible { outline:2px solid #8577f0; outline-offset:4px; }
.dice-notice { margin-top:28px; border-top:1px solid color-mix(in srgb,currentColor 15%,transparent); font-size:13px; }
.dice-recovery { margin-top:20px; }
.dice-sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
@media (prefers-reduced-motion: reduce) { .dice-switch > span:first-child { transition:none; } }
</style>
