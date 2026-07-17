<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ManagerToolTurnDisplayItem } from '../../manager-tool-display';
import TavernMessageMarkdown from './TavernMessageMarkdown.vue';

const props = defineProps<{
    item: ManagerToolTurnDisplayItem;
    open: boolean;
    renderMarkdown: (text: string) => string;
    markdownSignature: (text: string) => string;
}>();

const emit = defineEmits<{ (event: 'toggle', open: boolean): void }>();
const openThoughtRounds = ref(new Set<number>());

watch(() => props.item.key, () => { openThoughtRounds.value = new Set(); });
watch(() => props.open, (open) => { if (!open) {openThoughtRounds.value = new Set();} });

function handleToggle(event: Event) {
    emit('toggle', Boolean((event.currentTarget as HTMLDetailsElement | null)?.open));
}

function isThoughtOpen(roundIndex: number) {return openThoughtRounds.value.has(roundIndex);}

function toggleThought(roundIndex: number, event: Event) {
    const next = new Set(openThoughtRounds.value);
    if ((event.currentTarget as HTMLDetailsElement | null)?.open) {next.add(roundIndex);}
    else {next.delete(roundIndex);}
    openThoughtRounds.value = next;
}

function toolResultText(call: ManagerToolTurnDisplayItem['calls'][number]) {
    return String(call.toolMessage?.content || call.resultText || '').trim() || '等待工具返回。';
}
</script>

<template>
  <details
    class="assistant-tool-run"
    :open="open"
    :data-manager-anchor-key="item.anchorKey"
    @toggle="handleToggle"
  >
    <summary>
      <span>已处理 {{ item.rounds.length }} 轮</span>
      <span
        class="assistant-tool-run-fold"
        aria-hidden="true"
      />
    </summary>
    <div
      v-if="open"
      class="assistant-tool-run-body"
    >
      <section
        v-for="(round, roundIndex) in item.rounds"
        :key="`${item.key}:round:${roundIndex}`"
        class="assistant-tool-run-round"
      >
        <small>第 {{ roundIndex + 1 }} 轮 · {{ round.calls.length }} 个工具</small>
        <details
          v-if="round.assistantMessage.thoughts?.length"
          class="assistant-tool-run-thoughts"
          :open="isThoughtOpen(roundIndex)"
          @toggle="toggleThought(roundIndex, $event)"
        >
          <summary>思考过程 · {{ round.assistantMessage.thoughts.length }} 段</summary>
          <div v-if="isThoughtOpen(roundIndex)">
            <div
              v-for="(thought, thoughtIndex) in round.assistantMessage.thoughts"
              :key="`${item.key}:${roundIndex}:${thoughtIndex}`"
              class="chat-thought-block"
            >
              <strong>{{ thought.label || `思考 ${thoughtIndex + 1}` }}</strong>
              <pre>{{ thought.text }}</pre>
            </div>
          </div>
        </details>
        <TavernMessageMarkdown
          v-if="round.assistantMessage.content"
          class="assistant-tool-run-preface xb-tavern-markdown"
          :html="renderMarkdown(round.assistantMessage.content)"
          :signature="markdownSignature(round.assistantMessage.content)"
          phase="settled"
        />
        <article
          v-for="call in round.calls"
          :key="call.id"
          class="assistant-tool-run-call"
          :class="call.toolMessage ? (call.ok ? 'is-resolved' : 'is-error') : 'is-running'"
        >
          <header><span>{{ call.name }}</span><em>{{ call.toolMessage ? (call.ok ? '已返回' : '失败') : '运行中' }}</em></header>
          <small v-if="call.argumentsText">参数</small>
          <pre v-if="call.argumentsText">{{ call.argumentsText }}</pre>
          <small>结果</small>
          <pre>{{ toolResultText(call) }}</pre>
        </article>
      </section>
    </div>
  </details>
</template>
