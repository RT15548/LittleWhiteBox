<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { FourthWallContextStats, FourthWallTaskPhase } from '../types.js';

const props = defineProps<{ stats: FourthWallContextStats; busy: boolean; phase?: FourthWallTaskPhase }>();
const emit = defineEmits<{ summarize: []; cancel: [] }>();
const open = ref(false);
useAppBack(() => { open.value = false; return true; }, () => open.value);
const ratio = computed(() => Math.min(1, props.stats.usedTokens / props.stats.limit));
const format = (value: number) => `${(value / 1000).toFixed(1)}k`;
const phases = { counting: '计算中', summarizing: '总结中', saving: '保存中', replying: '回复中' };
</script>

<template>
    <div class="fourth-wall-context">
        <button
            type="button" class="fourth-wall-context-ring" :class="{ 'is-warning': stats.usedTokens >= stats.trigger }"
            :style="{ '--context-fill': `${ratio * 360}deg` }" :aria-label="`上下文：约 ${format(stats.usedTokens)} / 158k`"
            :aria-expanded="open" title="上下文" @click="open = !open"
        >
            <span>{{ busy ? '…' : Math.round(ratio * 100) }}</span>
        </button>
        <section v-if="open" class="fourth-wall-context-popover" aria-label="上下文用量">
            <header><strong>上下文</strong><button type="button" aria-label="关闭上下文用量" @click="open = false">×</button></header>
            <p class="fourth-wall-context-total">约 {{ format(stats.usedTokens) }} / 158k</p>
            <dl>
                <dt>主剧情</dt><dd>{{ format(stats.mainTokens) }}</dd>
                <dt>皮下记忆</dt><dd>{{ format(stats.memoryTokens) }}</dd>
                <dt>皮下聊天</dt><dd>{{ format(stats.historyTokens) }}</dd>
                <dt>提示词与输入</dt><dd>{{ format(stats.promptTokens) }}</dd>
            </dl>
            <p>128k 时在下次回复前自动总结。</p>
            <button v-if="busy" type="button" @click="emit('cancel')">{{ phase ? phases[phase] : '处理中' }} · 取消</button>
            <button v-else type="button" :disabled="!stats.canSummarize" @click="emit('summarize'); open = false">立即总结</button>
            <small v-if="!stats.canSummarize && !busy">暂无可总结的较早聊天，近期原文会保留。</small>
        </section>
    </div>
</template>
