<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import type {
    TavernAssistantToolCallDetail,
    TavernAssistantToolTurnDetail,
    TavernAssistantToolTurnUnit,
} from '../../features/assistant-chat/assistant-chat-projection';
import TavernMessageMarkdown from './TavernMessageMarkdown.vue';

const props = defineProps<{
    item: TavernAssistantToolTurnUnit;
    open: boolean;
    loadDetail: (item: TavernAssistantToolTurnUnit) => Promise<TavernAssistantToolTurnDetail | null>;
    renderMarkdown: (text: string) => string;
    markdownSignature: (text: string) => string;
}>();

const emit = defineEmits<{ (event: 'toggle', open: boolean): void }>();
const detail = shallowRef<TavernAssistantToolTurnDetail | null>(null);
const detailLoading = ref(false);
const detailError = ref('');
const openThoughtRounds = ref(new Set<number>());
let detailLoadSerial = 0;

function releaseDetail() {
    detailLoadSerial += 1;
    detail.value = null;
    detailLoading.value = false;
    detailError.value = '';
    openThoughtRounds.value = new Set();
}

async function requestDetail() {
    const requestSerial = ++detailLoadSerial;
    detail.value = null;
    detailLoading.value = true;
    detailError.value = '';
    try {
        const loaded = await props.loadDetail(props.item);
        if (requestSerial !== detailLoadSerial || !props.open) {return;}
        detail.value = loaded;
        if (!loaded) {detailError.value = '这段工具过程已不可用。';}
    } catch (error) {
        if (requestSerial !== detailLoadSerial || !props.open) {return;}
        console.warn('[小白酒馆] 读取助手工具详情失败', error);
        detailError.value = '工具过程读取失败。';
    } finally {
        if (requestSerial === detailLoadSerial) {detailLoading.value = false;}
    }
}

watch(
    [() => props.item.key, () => props.open],
    ([, open]) => {
        releaseDetail();
        if (open) {void requestDetail();}
    },
    { immediate: true },
);

onBeforeUnmount(releaseDetail);

function handleToggle(event: Event) {
    const open = Boolean((event.currentTarget as HTMLDetailsElement | null)?.open);
    if (!open) {releaseDetail();}
    emit('toggle', open);
}

function isThoughtOpen(roundIndex: number) {return openThoughtRounds.value.has(roundIndex);}

function toggleThought(roundIndex: number, event: Event) {
    const next = new Set(openThoughtRounds.value);
    if ((event.currentTarget as HTMLDetailsElement | null)?.open) {next.add(roundIndex);}
    else {next.delete(roundIndex);}
    openThoughtRounds.value = next;
}

function toolStatusLabel(call: TavernAssistantToolCallDetail) {
    if (call.status === 'running') {return '运行中';}
    if (call.status === 'error') {return '失败';}
    return '已返回';
}

function toolElapsedLabel(elapsedMs = 0) {
    const value = Math.max(0, Number(elapsedMs) || 0);
    return value ? `${(value / 1000).toFixed(1)}s` : '';
}

function itemRoundCount() {
    return props.item.roundCount;
}

function itemToolCount() {
    return props.item.toolCount;
}

function turnStatusLabel() {
    if (props.item.status === 'running') {return '处理中';}
    if (props.item.status === 'error') {return '部分失败';}
    return '已完成';
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
      <span>
        <strong>{{ turnStatusLabel() }} · {{ itemRoundCount() }} 轮 · {{ itemToolCount() }} 个工具</strong>
        <small>
          {{ item.toolNames.slice(0, 3).join('、') || '工具过程' }}
          <template v-if="item.summary"> · {{ item.summary }}</template>
        </small>
      </span>
      <span
        class="assistant-tool-run-fold"
        aria-hidden="true"
      />
    </summary>
    <div
      v-if="open"
      class="assistant-tool-run-body"
    >
      <p v-if="detailLoading">
        正在读取工具过程...
      </p>
      <p v-else-if="detailError">
        {{ detailError }}
      </p>
      <template v-else>
        <section
          v-for="(round, roundIndex) in detail?.rounds || []"
          :key="round.key"
          class="assistant-tool-run-round"
        >
          <small>第 {{ roundIndex + 1 }} 轮 · {{ round.calls.length }} 个工具</small>
          <details
            v-if="round.thoughts.length"
            class="assistant-tool-run-thoughts"
            :open="isThoughtOpen(roundIndex)"
            @toggle="toggleThought(roundIndex, $event)"
          >
            <summary>思考过程 · {{ round.thoughts.length }} 段</summary>
            <div v-if="isThoughtOpen(roundIndex)">
              <div
                v-for="(thought, thoughtIndex) in round.thoughts"
                :key="`${round.key}:thought:${thoughtIndex}`"
                class="chat-thought-block"
              >
                <strong>{{ thought.label || `思考 ${thoughtIndex + 1}` }}</strong>
                <pre>{{ thought.text }}</pre>
              </div>
            </div>
          </details>
          <TavernMessageMarkdown
            v-if="round.preface"
            class="assistant-tool-run-preface xb-tavern-markdown"
            :text="round.preface"
            :render="renderMarkdown"
            :signature="markdownSignature(round.preface)"
            phase="settled"
          />
          <article
            v-for="call in round.calls"
            :key="call.displayKey"
            class="assistant-tool-run-call"
            :class="`is-${call.status}`"
          >
            <header>
              <span>{{ call.name }}</span>
              <em>
                {{ toolStatusLabel(call) }}
                <template v-if="toolElapsedLabel(call.elapsedMs)"> · {{ toolElapsedLabel(call.elapsedMs) }}</template>
              </em>
            </header>
            <small v-if="call.path">位置 · {{ call.path }}</small>
            <p>{{ call.summary }}</p>
          </article>
        </section>
      </template>
    </div>
  </details>
</template>
