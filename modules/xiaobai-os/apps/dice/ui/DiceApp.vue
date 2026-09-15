<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import { HostRequestError } from '../../../shell/app-src/frame-bridge.js';
import type { DiceClientState } from '../types.js';
const props = defineProps<XiaobaiOsAppProps>();
const state = ref(props.initialState as DiceClientState);
const busy = ref(false);
const error = ref('');
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
async function send(type: string, feature?: 'actionChecksEnabled' | 'encountersEnabled', enabled?: boolean) {
    if (busy.value) { return; }
    busy.value = true; error.value = '';
    const identity = state.value.chatIdentity;
    const version = pushed;
    try {
        const response = await props.bridge.request(type, { chatIdentity: identity, ...(feature ? { feature, enabled } : {}) }) as { result: DiceClientState };
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
        <p class="dice-scope">当前聊天</p>
        <section aria-labelledby="dice-action-label" class="dice-feature">
            <div class="dice-switch-row">
                <h1 id="dice-action-label">行动检定</h1>
                <button
                    type="button" class="dice-switch" role="switch" aria-labelledby="dice-action-label" :aria-checked="state.actionChecksEnabled"
                    :disabled="busy || state.fileState !== 'ready'" @click="send('dice/set-feature', 'actionChecksEnabled', !state.actionChecksEnabled)"
                >
                    <span aria-hidden="true" /><span class="dice-sr">{{ state.actionChecksEnabled ? '关闭' : '开启' }}</span>
                </button>
            </div>
            <p class="dice-intro">当你尝试不确定的事——说服陌生人、翻越高墙、破译符文——由骰子裁决，而非 AI。一次真随机掷骰仲裁结果，故事顺从命运。</p>
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
                    :disabled="busy || state.fileState !== 'ready'" @click="send('dice/set-feature', 'encountersEnabled', !state.encountersEnabled)"
                >
                    <span aria-hidden="true" /><span class="dice-sr">{{ state.encountersEnabled ? '关闭' : '开启' }}</span>
                </button>
            </div>
            <p>偶尔为剧情添一点变数，也可从已开启的世界背景与剧情记忆中寻找灵感。</p>
            <p class="dice-rates">轻微 5% <span aria-hidden="true">·</span> 中等 3% <span aria-hidden="true">·</span> 重大 1%</p>
            <p class="dice-cooldown">触发后，接下来的两次用户发言不会触发新遭遇。不额外调用模型。</p>
        </section>
        <section v-if="['conflict', 'failed', 'unconfirmed'].includes(state.fileState) || error" class="dice-recovery" aria-live="polite">
            <p>{{ error || '还不确定设置是否保存成功，暂时沿用之前的设置。' }}</p>
            <button v-if="state.pending" :disabled="busy" @click="send('dice/retry-file')">检查保存</button>
            <button
                v-if="state.fileState === 'conflict' || state.fileState === 'failed' || state.fileState === 'unconfirmed'"
                :disabled="busy" @click="send('dice/adopt-file')"
            >
                使用已保存版本
            </button>
            <p v-if="['conflict', 'failed', 'unconfirmed'].includes(state.fileState)" class="dice-recovery-note">使用已保存版本会放弃当前聊天中尚未确认的 OS 修改。</p>
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
.dice-switch { position:relative; width:48px; height:32px; border:0; padding:4px; flex-shrink:0; border-radius:20px; background:#858795; cursor:pointer; }
.dice-switch::after { content:""; position:absolute; inset:-6px 0; }
.dice-switch > span:first-child { display:block; width:24px; height:24px; border-radius:50%; background:white; transition:transform .15s; }
.dice-switch[aria-checked="true"] { background:#7062d9; }
.dice-switch[aria-checked="true"] > span:first-child { transform:translateX(16px); }
.dice-switch:disabled { opacity:.5; cursor:wait; }
.dice-switch:focus-visible, .dice-recovery button:focus-visible { outline:2px solid #8577f0; outline-offset:4px; }
.dice-notice { margin-top:28px; border-top:1px solid color-mix(in srgb,currentColor 15%,transparent); font-size:13px; }
.dice-recovery { margin-top:20px; }
.dice-recovery-note { font-size:12px; }
.dice-recovery button { min-height:40px; padding:6px 12px; margin:0 8px 8px 0; color:inherit; background:transparent; border:1px solid currentColor; border-radius:7px; font:inherit; cursor:pointer; }
.dice-sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
@media (prefers-reduced-motion: reduce) { .dice-switch > span:first-child { transition:none; } }
</style>
