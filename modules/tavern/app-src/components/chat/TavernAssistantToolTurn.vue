<script setup lang="ts">
import { ref, watch } from 'vue';
import {
    managerToolTurnPreview,
    managerToolTurnSummary,
    type ManagerToolTurnDisplayItem,
} from '../../manager-tool-display';
import TavernMessageMarkdown from './TavernMessageMarkdown.vue';

const props = withDefaults(defineProps<{
    item: ManagerToolTurnDisplayItem;
    live?: boolean;
    open?: boolean;
    renderMarkdown: (text: string) => string;
    markdownSignature: (text: string) => string;
}>(), {
    live: false,
    open: false,
});

const emit = defineEmits<{
    (event: 'toggle', open: boolean): void;
}>();

const openThoughtRounds = ref(new Set<number>());

watch(() => props.item.key, () => {
    openThoughtRounds.value = new Set();
});

watch([() => props.open, () => props.live], ([open, live]) => {
    if (!open && !live) {
        openThoughtRounds.value = new Set();
    }
});

function handleTurnToggle(event: Event) {
    if (props.live) {return;}
    emit('toggle', Boolean((event.currentTarget as HTMLDetailsElement | null)?.open));
}

function thoughtRoundOpen(roundIndex: number) {
    return props.live || openThoughtRounds.value.has(roundIndex);
}

function handleThoughtToggle(roundIndex: number, event: Event) {
    if (props.live) {return;}
    const next = new Set(openThoughtRounds.value);
    if ((event.currentTarget as HTMLDetailsElement | null)?.open) {
        next.add(roundIndex);
    } else {
        next.delete(roundIndex);
    }
    openThoughtRounds.value = next;
}

function toolResultText(call: ManagerToolTurnDisplayItem['calls'][number]) {
    return String(call.toolMessage?.content || call.resultText || '').trim() || '等待工具返回。';
}
</script>

<template>
  <details
    class="manager-card manager-tool-turn"
    :class="{ 'is-live': live }"
    :open="live || open"
    :data-manager-anchor-key="item.anchorKey"
    @toggle="handleTurnToggle"
  >
    <summary>
      <span
        class="manager-tool-turn-mark"
        aria-hidden="true"
      >⌁</span>
      <span>
        <strong>{{ live ? '助手正在使用工具' : '助手的工具经过' }}</strong>
        <small>{{ managerToolTurnPreview(item) }}</small>
      </span>
      <em>{{ managerToolTurnSummary(item) }}</em>
    </summary>

    <div
      v-if="live || open"
      class="manager-tool-turn-body"
    >
      <section
        v-for="(round, roundIndex) in item.rounds"
        :key="`${item.key}:round:${roundIndex}`"
        class="manager-tool-round"
      >
        <header>
          <span>第 {{ roundIndex + 1 }} 轮</span>
          <small>{{ round.calls.length }} 个工具</small>
        </header>

        <details
          v-if="round.assistantMessage.thoughts?.length"
          class="manager-tool-thoughts"
          :open="thoughtRoundOpen(roundIndex)"
          @toggle="handleThoughtToggle(roundIndex, $event)"
        >
          <summary>思考过程 · {{ round.assistantMessage.thoughts.length }} 段</summary>
          <div v-if="thoughtRoundOpen(roundIndex)">
            <div
              v-for="(thought, thoughtIndex) in round.assistantMessage.thoughts"
              :key="`${item.key}:round:${roundIndex}:thought:${thoughtIndex}`"
              class="chat-thought-block"
            >
              <strong>{{ thought.label || `思考 ${thoughtIndex + 1}` }}</strong>
              <pre>{{ thought.text }}</pre>
            </div>
          </div>
        </details>

        <TavernMessageMarkdown
          v-if="round.assistantMessage.content"
          class="manager-tool-preface xb-tavern-markdown"
          :html="renderMarkdown(round.assistantMessage.content)"
          :signature="markdownSignature(round.assistantMessage.content)"
          :phase="live ? 'live' : 'settled'"
        />

        <div class="manager-tool-list">
          <article
            v-for="call in round.calls"
            :key="call.id"
            class="manager-tool-item"
            :class="call.toolMessage ? (call.ok ? 'is-resolved' : 'is-error') : 'is-running'"
          >
            <div class="manager-tool-head">
              <span>{{ call.name }}</span>
              <em>{{ call.toolMessage ? (call.ok ? '已返回' : '失败') : '运行中' }}</em>
            </div>
            <small v-if="call.argumentsText">参数</small>
            <pre
              v-if="call.argumentsText"
              class="manager-tool-payload"
            >{{ call.argumentsText }}</pre>
            <small>结果</small>
            <pre class="manager-tool-payload">{{ toolResultText(call) }}</pre>
          </article>
        </div>
      </section>
    </div>
  </details>
</template>
