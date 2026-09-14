<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
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
async function send(type: string, enabled?: boolean) {
    if (busy.value) { return; }
    busy.value = true; error.value = '';
    const identity = state.value.chatIdentity;
    const version = pushed;
    try {
        const response = await props.bridge.request(type, { chatIdentity: identity, ...(enabled === undefined ? {} : { enabled }) }) as { result: DiceClientState };
        if (mounted && version === pushed && response.result.chatIdentity === identity) { state.value = response.result; }
    } catch (cause) { if (mounted) { error.value = cause instanceof Error ? cause.message : String(cause); } }
    finally { if (mounted) { busy.value = false; } }
}
</script>

<template>
    <main class="dice-app">
        <section class="dice-switch-row">
            <h1 id="dice-action-label">行动检定</h1>
            <button
                type="button" class="dice-switch" role="switch" aria-labelledby="dice-action-label" :aria-checked="state.enabled"
                :disabled="busy || state.fileState !== 'ready'" @click="send('dice/set-enabled', !state.enabled)"
            >
                <span aria-hidden="true" /><span class="dice-sr">{{ state.enabled ? '关闭' : '开启' }}</span>
            </button>
        </section>
        <p class="dice-intro">让关键行动的成败交给骰子。AI 提出检定，Dice 投出 D20，再由 AI 接着讲完故事。</p>
        <p>骰点与后文留在同一条回复中。本聊天单独启用，没有属性加成。</p>
        <aside class="dice-notice">
            <p>每次检定会调用一次聊天主 API 续写，按你的模型正常计费。</p>
            <p>请关闭酒馆的「自动续写」。生成期间不要编辑或删除 Dice 的显示正则。</p>
        </aside>
        <section v-if="state.fileState !== 'ready' || error" class="dice-recovery" aria-live="polite">
            <p>{{ error || (state.fileState === 'saving' ? '正在保存…' : '文件尚未确认，开关保持上一次已保存的状态。') }}</p>
            <button v-if="state.pending" :disabled="busy" @click="send('dice/retry-file')">核实并重试保存</button>
            <button
                v-if="state.fileState === 'conflict' || state.fileState === 'failed' || state.fileState === 'unconfirmed'"
                :disabled="busy" @click="send('dice/adopt-file')"
            >
                使用服务端文件
            </button>
        </section>
    </main>
</template>

<style scoped>
.dice-app { max-width:36rem; margin:0 auto; padding:24px 22px; color:var(--xiaobai-os-ink); font-size:14px; line-height:1.75; }
.dice-switch-row { display:flex; align-items:center; justify-content:space-between; gap:16px; }
h1 { margin:0; font-size:20px; font-weight:650; }
p { margin:14px 0; }
.dice-intro { margin-top:24px; }
.dice-switch { width:48px; height:32px; border:0; padding:4px; flex-shrink:0; border-radius:20px; background:#858795; cursor:pointer; }
.dice-switch > span:first-child { display:block; width:24px; height:24px; border-radius:50%; background:white; transition:transform .15s; }
.dice-switch[aria-checked="true"] { background:#7062d9; }
.dice-switch[aria-checked="true"] > span:first-child { transform:translateX(16px); }
.dice-switch:disabled { opacity:.5; cursor:wait; }
.dice-switch:focus-visible, .dice-recovery button:focus-visible { outline:2px solid #8577f0; outline-offset:4px; }
.dice-notice { margin-top:28px; border-top:1px solid color-mix(in srgb,currentColor 15%,transparent); font-size:13px; }
.dice-recovery { margin-top:20px; }
.dice-recovery button { min-height:40px; padding:6px 12px; margin:0 8px 8px 0; color:inherit; background:transparent; border:1px solid currentColor; border-radius:7px; font:inherit; cursor:pointer; }
.dice-sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
@media (prefers-reduced-motion: reduce) { .dice-switch > span:first-child { transition:none; } }
</style>
