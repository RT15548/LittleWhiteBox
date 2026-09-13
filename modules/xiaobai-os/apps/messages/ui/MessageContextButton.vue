<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { MessagesClientState } from '../types.js';
import type { MessagesContextStats } from '../application/context-budget.js';
import { CONTEXT_LIMIT, IMAGE_TOKEN_RESERVE, SUMMARY_TRIGGER } from '../application/context-policy.js';
import { estimateTokenCount } from '../../../../agent-core/runtime/context-tokens.js';
import { escapePromptData } from '../../../host/prompt-context/format.js';
import type { MessageDraft } from './draft.js';

const props = defineProps<{ bridge: XiaobaiOsAppProps['bridge']; state: MessagesClientState; contactId: string; draft: MessageDraft }>();
const open = ref(false); const loading = ref(false); const failed = ref(false); const retry = ref(0);
const stats = ref<MessagesContextStats | null>(null);
useAppBack(() => {open.value = false; return true;}, () => open.value);
watch(() => JSON.stringify([props.contactId, props.state.chatIdentity, props.state.revision, props.state.boundary,
    props.state.settings.imagePrompt, props.state.settings.voicePrompt, !!props.state.busy, props.state.generationActive, retry.value]), async (_, _old, cleanup) => {
    let current = true; cleanup(() => {current = false;});
    loading.value = true; failed.value = false;
    if (props.state.busy || props.state.generationActive) {return;}
    const revision = props.state.revision; const boundary = props.state.boundary;
    try {
        const result = await props.bridge.request('messages/context', { chatIdentity: props.state.chatIdentity, contactId: props.contactId }, 60000) as {
            result: { revision: string; boundary: number; stats: MessagesContextStats };
        };
        if (!current) {return;}
        if (result.result.revision !== revision || result.result.boundary !== boundary) {throw new Error('stale');}
        stats.value = result.result.stats;
    } catch {if (current) {failed.value = true; stats.value = null;}}
    finally {if (current) {loading.value = false;}}
}, { immediate: true });
const draftText = computed(() => estimateTokenCount(escapePromptData(props.draft.text)));
const imageTokens = computed(() => (stats.value?.imageTokens ?? 0) + (props.draft.image ? IMAGE_TOKEN_RESERVE : 0));
const used = computed(() => (stats.value?.usedTokens ?? 0) + draftText.value + (props.draft.image ? IMAGE_TOKEN_RESERVE : 0));
const ratio = computed(() => Math.min(1, used.value / CONTEXT_LIMIT));
const format = (value: number) => `${(value / 1000).toFixed(1)}k`;
</script>

<template>
    <div class="messages-context" @keydown.esc.stop="open = false">
        <button
            type="button" class="messages-context-ring" :class="{ 'is-warning': used >= SUMMARY_TRIGGER }"
            :style="{ '--context-fill': `${stats ? ratio * 360 : 0}deg` }" :aria-label="stats ? `上下文：约 ${format(used)} / 158k` : '上下文用量'"
            :aria-expanded="open" title="上下文" @click="open = !open"
        >
            <span>{{ loading ? '…' : failed || !stats ? '—' : Math.round(ratio * 100) }}</span>
        </button>
        <section v-if="open" class="messages-context-popover" aria-label="上下文用量">
            <header><strong>上下文</strong><button type="button" aria-label="关闭上下文用量" @click="open = false">×</button></header>
            <template v-if="stats">
                <p class="messages-context-total">约 {{ format(used) }} / 158k</p>
                <dl>
                    <dt>剧情与设定</dt><dd>{{ format(stats.backgroundTokens) }}</dd>
                    <dt>通讯摘要</dt><dd>{{ format(stats.summaryTokens) }}</dd>
                    <dt>通讯原文</dt><dd>{{ format(stats.historyTokens) }}</dd>
                    <dt>提示词与输入</dt><dd>{{ format(stats.promptTokens + draftText) }}</dd>
                    <template v-if="imageTokens"><dt>图片预留</dt><dd>{{ format(imageTokens) }}</dd></template>
                </dl>
            </template>
            <p v-if="loading" role="status">{{ state.busy?.stage === 'summarizing' ? '正在总结较早通讯…' : state.busy || state.generationActive ? '本轮结束后更新用量。' : '正在读取…' }}</p>
            <template v-else-if="failed"><p role="status">用量暂时无法读取。</p><button type="button" class="messages-secondary" @click="retry++">重试</button></template>
            <p>128k 时在下次回复前自动总结，保留近期原文。</p>
            <small v-if="imageTokens">图片按每张 6k 预留，实际用量由模型决定。</small>
        </section>
    </div>
</template>
