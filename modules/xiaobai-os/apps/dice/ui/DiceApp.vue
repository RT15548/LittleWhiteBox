<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import { HostRequestError } from '../../../shell/app-src/frame-bridge.js';
import type { ActionCheckFrequency, ActionCheckRule, DiceClientState } from '../types.js';
import Coc7Sheet from './Coc7Sheet.vue';
import { COC7_UI } from './coc7-copy.js';
const props = defineProps<XiaobaiOsAppProps>();
const state = ref(props.initialState as DiceClientState);
const busy = ref(false);
const error = ref<{ type: string; message: string } | null>(null);
const continuationNotice = '使用不支持预填充的模型时，请关闭「续写预填充」，并保留预设「实用提示词」里的「继续推进」内容（不能为空）。';
const frequencyChoices: Record<ActionCheckFrequency, { label: string; description: string }> = {
    standard: { label: '标准', description: '有风险或阻力，且成败会改变后续的行动才检定。' },
    active: { label: '积极', description: '日常小目标，以及效果、耗时和代价的不确定性也可检定。' },
};
const ruleChoices: Record<ActionCheckRule, { label: string; description: string }> = {
    d20: { label: '通用 D20', description: '不需要人物数值，由情境决定难度。' },
    coc7: { label: COC7_UI.rule, description: COC7_UI.description },
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
async function send(type: string, payload: Record<string, unknown>, reportError = true) {
    if (busy.value) { return false; }
    busy.value = true; error.value = null;
    const identity = state.value.chatIdentity;
    const version = pushed;
    try {
        const response = await props.bridge.request(type, { chatIdentity: identity, ...payload }) as { result: DiceClientState };
        if (mounted && version === pushed && response.result.chatIdentity === identity) { state.value = response.result; }
        return mounted && response.result.chatIdentity === identity;
    } catch (cause) {
        if (mounted && reportError) { error.value = { type, message: cause instanceof HostRequestError && cause.code === 'app_request_failed'
            ? cause.message : '操作未完成，请稍后重试。' }; }
        return false;
    }
    finally { if (mounted) { busy.value = false; } }
}
function clearSheetFailure() {
    if (error.value?.type === 'dice/set-coc7-sheet' || error.value?.type === 'dice/confirm-sheet-save') { error.value = null; }
}
</script>

<template>
    <main class="dice-app">
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
            <p class="dice-intro">当你尝试不确定的事——说服陌生人、翻越高墙、破译符文——由骰点裁决，而非 AI。</p>
            <fieldset v-if="state.actionChecksEnabled" class="dice-frequency" :disabled="busy" aria-describedby="dice-rule-description">
                <legend>检定规则</legend>
                <div class="dice-frequency-options">
                    <button
                        v-for="(choice, rule) in ruleChoices" :key="rule" type="button" class="dice-frequency-option"
                        :aria-pressed="state.actionCheckRule === rule"
                        @click="state.actionCheckRule !== rule && send('dice/set-rule', { rule })"
                    >
                        {{ choice.label }}
                    </button>
                </div>
                <p id="dice-rule-description" aria-live="polite">{{ ruleChoices[state.actionCheckRule].description }}</p>
            </fieldset>
            <fieldset v-if="state.actionChecksEnabled && state.actionCheckRule === 'd20'" class="dice-frequency" :disabled="busy" aria-describedby="dice-frequency-description">
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
            <Coc7Sheet
                v-if="state.coc7Sheet.kind === 'invalid' || state.actionChecksEnabled && state.actionCheckRule === 'coc7'"
                :sheet="state.coc7Sheet.kind === 'ready' ? state.coc7Sheet.sheet : null" :invalid="state.coc7Sheet.kind === 'invalid'"
                :busy="busy" :failure="error?.message" :blocked="state.sheetStorage !== 'ready'"
                :check-save="() => send('dice/confirm-sheet-save', {})" :save="sheet => send('dice/set-coc7-sheet', { sheet })"
                @confirmed="clearSheetFailure"
            />
            <aside class="dice-notice">
                <p>请勿开启酒馆的「自动续写」。</p>
                <p>{{ continuationNotice }}</p>
                <p>酒馆 1.14 / 1.15：点击检定的「继续」会发送输入框中尚未发送的文字。</p>
                <p>功能开启期间，会自动创建「小白 OS · 行动检定显示」全局正则。</p>
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
            <p>{{ error.message }}</p>
        </section>
    </main>
</template>

<style scoped>
.dice-app { height:calc(100% - var(--os-status-height)); max-width:36rem; margin:var(--os-status-height) auto 0; padding:24px 22px; overflow-y:auto; color:var(--xiaobai-os-ink); font-size:14px; line-height:1.75; }
.dice-switch-row { display:flex; align-items:center; justify-content:space-between; gap:16px; }
h1,h2 { margin:0; font-size:20px; font-weight:650; }
.dice-feature + .dice-feature { margin-top:28px; padding-top:24px; border-top:1px solid color-mix(in srgb,currentColor 15%,transparent); }
.dice-rates { font-size:13px; word-spacing:.08em; }
.dice-rates span { margin:0 .2em; opacity:.5; }
.dice-cooldown { font-size:13px; }
p { margin:14px 0; }
.dice-intro { margin-top:24px; }
.dice-frequency { min-width:0; margin:20px 0 0; padding:0; border:0; }
.dice-frequency legend { margin-bottom:8px; padding:0; font-size:13px; }
.dice-frequency-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:4px; padding:4px; border-radius:12px; background:color-mix(in srgb,currentColor 7%,transparent); }
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
@container os-stage (min-width: 900px) {
    .dice-app { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); align-content: start; align-items: start; gap: 36px; max-width: 1000px; padding: 28px 32px; }
    .dice-feature + .dice-feature { margin: 0; padding: 0 0 0 32px; border-top: 0; border-left: 1px solid color-mix(in srgb, currentColor 15%, transparent); }
    .dice-recovery { grid-column: 1 / -1; }
}
@media (prefers-reduced-motion: reduce) { .dice-switch > span:first-child { transition:none; } }
</style>
