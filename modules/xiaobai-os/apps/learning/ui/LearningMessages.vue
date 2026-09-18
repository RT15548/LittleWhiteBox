<script setup lang="ts">
import { computed } from 'vue';
import type { LearningMessageView } from '../application/message-view.js';
import LearningMarkdown from './LearningMarkdown.vue';

const props = defineProps<{ messages: LearningMessageView[]; running: boolean }>();
// Display batches are derived from the same assistant/tool messages used for provider replay.
const batches = computed(() => {
    const groups: { message: LearningMessageView; results: LearningMessageView[] }[] = [];
    for (const message of props.messages) {
        if (message.role === 'assistant') { groups.push({ message, results: [] }); }
        else if (message.role === 'tool') { groups.at(-1)?.results.push(message); }
    }
    return groups.map(group => ({ message: group.message, tools: (group.message.toolCalls ?? []).map(call => {
        const result = group.results.find(result => result.toolCallId === call.id);
        const status = group.message.streaming ? 'generating' : result?.streaming ? 'running'
            : result?.content ? (result.error || failed(result.content) ? 'failed' : 'done') : props.running && !group.message.error ? 'pending' : 'cancelled';
        return { call, result, status };
    }) }));
});
const labels: Record<string, string> = {
    LearningRead: '读取学习记录', LearningContextRead: '查看背景资料', LearningSearch: '搜索教材', LearningExtract: '读取原文',
    LearningProfileEdit: '更新学习目标', LearningLessonEdit: '编排课件', LearningAnswer: '记录原答',
    LearningAssess: '评估作答', LearningHelp: '确认讲解范围', LearningPresent: '安排学习活动', LearningComplete: '总结本课',
};
const statuses: Record<string, string> = { generating: '生成参数中', pending: '待执行', running: '执行中', done: '已完成', failed: '失败', cancelled: '未执行' };
function failed(content: string) {
    try { return JSON.parse(content)?.ok === false; } catch { return false; }
}
function format(value: string) {
    try { return JSON.stringify(JSON.parse(value), null, 2); } catch { return value; }
}
function problem(result?: string) {
    if (!result) { return ''; }
    try {
        const value = JSON.parse(result);
        return (value.errors?.map((entry: { message: string }) => entry.message).join('；') || value.message || value.error || '工具返回失败，展开查看结果。') as string;
    } catch { return result; }
}
</script>

<template>
    <div class="learning-messages">
        <template v-for="(batch, index) in batches" :key="index">
            <p v-if="batch.message.hasReasoning && batch.message.streaming && !batch.message.content && !batch.tools.length" class="learning-reasoning" role="status">正在思考…</p>
            <div v-if="batch.message.content" class="learning-output" :class="{ 'is-streaming': batch.message.streaming }">
                <LearningMarkdown v-if="batch.message.content" :text="batch.message.content" />
            </div>
            <div v-for="tool in batch.tools" :key="tool.call.id" class="learning-tool-entry" :class="`is-${tool.status}`">
                <details>
                    <summary><span class="learning-tool-name">{{ labels[tool.call.name] || tool.call.name }}<code>{{ tool.call.name }}</code></span><span class="learning-tool-status">{{ statuses[tool.status] }}</span></summary>
                    <div class="learning-tool-details"><h3>参数摘要</h3><pre>{{ format(tool.call.arguments) }}</pre><template v-if="tool.result?.content"><h3>结果摘要</h3><pre>{{ format(tool.result.content) }}</pre></template></div>
                </details>
                <p v-if="tool.status === 'failed'" class="learning-tool-error">{{ problem(tool.result?.content) }}</p>
            </div>
        </template>
    </div>
</template>
