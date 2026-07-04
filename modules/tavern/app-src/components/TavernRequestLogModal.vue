<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { buildRequestLogPreview, type RequestLogPreviewField, type RequestLogSnapshotMeta } from '../utils/request-log-preview';

interface RequestSnapshotLike {
    requestKind?: string;
    providerLabel?: string;
    provider?: string;
    model?: string;
    presetName?: string;
    capturedAt?: number;
    messageCount?: number;
    messageChars?: number;
}

const props = defineProps<{
    tab: 'history' | 'simulate';
    lastRequestRawJson: string;
    lastRequestSnapshot: RequestSnapshotLike | null | undefined;
    simulateInput: string;
    simulateStatus: string;
    simulateError: string;
    simulateJson: string;
}>();

const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'update:tab', value: 'history' | 'simulate'): void;
    (event: 'update:simulateInput', value: string): void;
    (event: 'simulate'): void;
}>();

function handleInput(event: Event) {
    emit('update:simulateInput', (event.target as HTMLTextAreaElement).value);
}

const displayMode = ref<'pretty' | 'raw'>('pretty');
const searchText = ref('');
const currentSearchIndex = ref(-1);
const bodyRef = ref<HTMLElement | null>(null);
const searchMarks = ref<HTMLElement[]>([]);
const expandedJsonFields = ref<Set<string>>(new Set());

const activeRawJson = computed(() => String(
    props.tab === 'history' ? props.lastRequestRawJson : props.simulateJson,
));
const activeSnapshot = computed<RequestLogSnapshotMeta>(() => props.tab === 'history'
    ? props.lastRequestSnapshot || {}
    : { requestKind: 'simulate' });
const activePreview = computed(() => buildRequestLogPreview(activeRawJson.value, activeSnapshot.value));
const emptyLogText = computed(() => props.tab === 'history' ? '暂无请求历史。' : '生成后会显示本次模拟请求。');
const searchInfo = computed(() => {
    if (!searchText.value.trim()) {return '';}
    if (!searchMarks.value.length) {return '无结果';}
    return `${Math.max(0, currentSearchIndex.value) + 1}/${searchMarks.value.length}`;
});

function isJsonField(field: RequestLogPreviewField): boolean {
    return field.kind === 'json';
}

function isFieldExpanded(key: string): boolean {
    return expandedJsonFields.value.has(key);
}

function toggleExpandedField(key: string) {
    const next = new Set(expandedJsonFields.value);
    if (next.has(key)) {
        next.delete(key);
    } else {
        next.add(key);
    }
    expandedJsonFields.value = next;
}

function fieldExpansionKey(scope: string, field: RequestLogPreviewField, messageIndex?: number): string {
    return messageIndex === undefined ? `${scope}:${field.key}` : `${scope}:${messageIndex}:${field.key}`;
}

function isJsonFieldExpanded(scope: string, field: RequestLogPreviewField, messageIndex?: number): boolean {
    return isJsonField(field) && isFieldExpanded(fieldExpansionKey(scope, field, messageIndex));
}

function jsonToggleLabel(scope: string, field: RequestLogPreviewField, messageIndex?: number): string {
    return isFieldExpanded(fieldExpansionKey(scope, field, messageIndex)) ? '收起' : field.summary;
}

function clearSearchMarks(root = bodyRef.value) {
    if (!root) {return;}
    root.querySelectorAll('mark.prompt-search-mark').forEach((mark) => {
        const parent = mark.parentNode;
        if (!parent) {return;}
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
    });
    searchMarks.value = [];
    currentSearchIndex.value = -1;
}

function collectSearchTextNodes(root: HTMLElement): Text[] {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.nodeValue) {return NodeFilter.FILTER_REJECT;}
            const parent = node.parentElement;
            if (parent?.closest('textarea,input,button,script,style,mark')) {return NodeFilter.FILTER_REJECT;}
            return NodeFilter.FILTER_ACCEPT;
        },
    });
    const nodes: Text[] = [];
    let node = walker.nextNode();
    while (node) {
        nodes.push(node as Text);
        node = walker.nextNode();
    }
    return nodes;
}

function highlightCurrentSearchMark() {
    searchMarks.value.forEach((mark, index) => mark.classList.toggle('current', index === currentSearchIndex.value));
    const current = searchMarks.value[currentSearchIndex.value];
    current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

async function refreshSearch() {
    await nextTick();
    const root = bodyRef.value;
    clearSearchMarks(root);
    const query = searchText.value.trim();
    if (!root || !query) {return;}
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const marks: HTMLElement[] = [];
    collectSearchTextNodes(root).forEach((textNode) => {
        const text = textNode.nodeValue || '';
        regex.lastIndex = 0;
        const matches = [...text.matchAll(regex)].filter((match) => match[0]);
        if (!matches.length) {return;}
        const fragment = document.createDocumentFragment();
        let cursor = 0;
        matches.forEach((match) => {
            const start = match.index ?? 0;
            const value = match[0];
            if (start > cursor) {fragment.append(document.createTextNode(text.slice(cursor, start)));}
            const mark = document.createElement('mark');
            mark.className = 'prompt-search-mark';
            mark.textContent = value;
            fragment.append(mark);
            marks.push(mark);
            cursor = start + value.length;
        });
        if (cursor < text.length) {fragment.append(document.createTextNode(text.slice(cursor)));}
        textNode.replaceWith(fragment);
    });
    searchMarks.value = marks;
    currentSearchIndex.value = marks.length ? 0 : -1;
    highlightCurrentSearchMark();
}

function moveSearch(direction: 'prev' | 'next') {
    if (!searchMarks.value.length) {return;}
    currentSearchIndex.value = direction === 'next'
        ? (currentSearchIndex.value + 1) % searchMarks.value.length
        : currentSearchIndex.value <= 0 ? searchMarks.value.length - 1 : currentSearchIndex.value - 1;
    highlightCurrentSearchMark();
}

watch(searchText, () => {
    void refreshSearch();
});

watch([displayMode, () => props.tab, activeRawJson], () => {
    expandedJsonFields.value = new Set();
    void refreshSearch();
});

watch(expandedJsonFields, () => {
    void refreshSearch();
});

onBeforeUnmount(() => clearSearchMarks());
</script>

<template>
  <div
    class="prompt-inspector-overlay"
    role="dialog"
    aria-modal="true"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
  >
    <section
      class="prompt-inspector-modal"
      tabindex="-1"
    >
      <header class="prompt-inspector-head">
        <div class="prompt-inspector-heading">
          <h2>请求日志</h2>
        </div>
        <button
          type="button"
          class="prompt-inspector-close"
          aria-label="关闭日志"
          @click="$emit('close')"
        >
          关闭
        </button>
      </header>

      <div
        class="prompt-inspector-tabs"
        aria-label="API 请求视图"
      >
        <div class="prompt-tab-group">
          <button
            type="button"
            :class="{ active: tab === 'history' }"
            @click="$emit('update:tab', 'history')"
          >
            上次调用
          </button>
          <button
            type="button"
            :class="{ active: tab === 'simulate' }"
            @click="$emit('update:tab', 'simulate')"
          >
            模拟发送
          </button>
        </div>
        <div class="prompt-tab-group prompt-view-mode-tabs">
          <button
            type="button"
            :class="{ active: displayMode === 'pretty' }"
            @click="displayMode = 'pretty'"
          >
            美化显示
          </button>
          <button
            type="button"
            :class="{ active: displayMode === 'raw' }"
            @click="displayMode = 'raw'"
          >
            原始 JSON
          </button>
        </div>
        <div class="prompt-log-search">
          <input
            v-model="searchText"
            type="search"
            placeholder="搜索"
            aria-label="搜索请求日志"
          >
          <button
            type="button"
            aria-label="上一个搜索结果"
            @click="moveSearch('prev')"
          >
            ↑
          </button>
          <button
            type="button"
            aria-label="下一个搜索结果"
            @click="moveSearch('next')"
          >
            ↓
          </button>
          <span>{{ searchInfo }}</span>
        </div>
      </div>

      <div
        ref="bodyRef"
        class="prompt-inspector-body"
      >
        <section class="prompt-inspector-view">
          <div
            v-if="tab === 'simulate'"
            class="prompt-simulate-panel"
          >
            <div>
              <label for="request-simulate-input">模拟本轮发言</label>
              <textarea
                id="request-simulate-input"
                :value="simulateInput"
                rows="5"
                placeholder="写一句要模拟发送的话"
                @input="handleInput"
              />
            </div>
            <button
              type="button"
              @click="$emit('simulate')"
            >
              生成请求
            </button>
          </div>
          <p
            v-if="tab === 'simulate' && simulateStatus"
            class="muted compact"
          >
            {{ simulateStatus }}
          </p>
          <p
            v-if="tab === 'simulate' && simulateError"
            class="error"
          >
            {{ simulateError }}
          </p>
          <template v-if="activeRawJson">
            <div
              v-if="displayMode === 'pretty'"
              class="prompt-request-pretty"
            >
              <section
                v-if="activePreview.chips.length || activePreview.parseError"
                class="prompt-preview-section"
              >
                <div
                  v-if="activePreview.chips.length"
                  class="prompt-preview-chip-row"
                >
                  <span
                    v-for="chip in activePreview.chips"
                    :key="chip"
                  >{{ chip }}</span>
                </div>
                <p
                  v-if="activePreview.parseError"
                  class="prompt-preview-error"
                >
                  JSON 解析失败：{{ activePreview.parseError }}
                </p>
              </section>
              <section
                v-if="activePreview.outerFields.length || activePreview.requestFieldsBeforeMessages.length"
                class="prompt-preview-section"
              >
                <div class="prompt-preview-parameter-panel">
                  <div class="prompt-preview-parameter-head">
                    <span>请求参数</span>
                    <small>{{ activePreview.outerFields.length + activePreview.requestFieldsBeforeMessages.length }}</small>
                  </div>
                  <div class="prompt-preview-fields is-compact">
                    <div
                      v-for="field in activePreview.outerFields"
                      :key="`outer:${field.key}`"
                      class="prompt-preview-field"
                    >
                      <span>{{ field.label }}</span>
                      <code v-if="!isJsonField(field)">{{ field.text }}</code>
                      <button
                        v-else
                        type="button"
                        class="prompt-preview-json-toggle"
                        @click="toggleExpandedField(fieldExpansionKey('outer', field))"
                      >
                        {{ jsonToggleLabel('outer', field) }}
                      </button>
                      <pre
                        v-if="isJsonFieldExpanded('outer', field)"
                      >{{ field.text }}</pre>
                    </div>
                    <div
                      v-for="field in activePreview.requestFieldsBeforeMessages"
                      :key="`before:${field.key}`"
                      class="prompt-preview-field"
                    >
                      <span>{{ field.label }}</span>
                      <code v-if="!isJsonField(field)">{{ field.text }}</code>
                      <button
                        v-else
                        type="button"
                        class="prompt-preview-json-toggle"
                        @click="toggleExpandedField(fieldExpansionKey('before', field))"
                      >
                        {{ jsonToggleLabel('before', field) }}
                      </button>
                      <pre
                        v-if="isJsonFieldExpanded('before', field)"
                      >{{ field.text }}</pre>
                    </div>
                  </div>
                </div>
              </section>
              <section class="prompt-preview-section">
                <div class="prompt-preview-message-rule">
                  <span>API MESSAGES · {{ activePreview.messages.length }}</span>
                </div>
                <div
                  v-if="activePreview.messages.length"
                  class="prompt-preview-messages"
                >
                  <article
                    v-for="message in activePreview.messages"
                    :key="message.index"
                    class="prompt-preview-message"
                    :class="message.roleClass"
                  >
                    <header>
                      <strong>{{ message.roleLabel }}</strong>
                      <span>#{{ message.index + 1 }}</span>
                      <small v-if="message.name">{{ message.name }}</small>
                    </header>
                    <pre><span
                      v-for="(segment, segmentIndex) in message.contentSegments"
                      :key="segmentIndex"
                      :class="{ 'prompt-preview-xml-tag': segment.kind === 'xml-tag' }"
                    >{{ segment.text }}</span></pre>
                    <div
                      v-if="message.metaFields.length"
                      class="prompt-preview-message-meta"
                    >
                      <div class="prompt-preview-meta-heading">
                        meta · {{ message.metaFields.length }}
                      </div>
                      <div class="prompt-preview-fields">
                        <div
                          v-for="field in message.metaFields"
                          :key="field.key"
                          class="prompt-preview-field"
                        >
                          <span>{{ field.label }}</span>
                          <code v-if="!isJsonField(field)">{{ field.text }}</code>
                          <button
                            v-else
                            type="button"
                            class="prompt-preview-json-toggle"
                            @click="toggleExpandedField(fieldExpansionKey('message', field, message.index))"
                          >
                            {{ jsonToggleLabel('message', field, message.index) }}
                          </button>
                          <pre
                            v-if="isJsonFieldExpanded('message', field, message.index)"
                          >{{ field.text }}</pre>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
                <p
                  v-else
                  class="prompt-empty-state"
                >
                  没有解析到 messages。
                </p>
              </section>
              <section
                v-if="activePreview.requestFieldsAfterMessages.length"
                class="prompt-preview-section"
              >
                <h3>附加参数</h3>
                <div class="prompt-preview-fields">
                  <div
                    v-for="field in activePreview.requestFieldsAfterMessages"
                    :key="field.key"
                    class="prompt-preview-field"
                  >
                    <span>{{ field.label }}</span>
                    <code v-if="!isJsonField(field)">{{ field.text }}</code>
                    <button
                      v-else
                      type="button"
                      class="prompt-preview-json-toggle"
                      @click="toggleExpandedField(fieldExpansionKey('after', field))"
                    >
                      {{ jsonToggleLabel('after', field) }}
                    </button>
                    <pre
                      v-if="isJsonFieldExpanded('after', field)"
                    >{{ field.text }}</pre>
                  </div>
                </div>
              </section>
            </div>
            <pre
              v-else
              class="prompt-request-json"
            >{{ activeRawJson }}</pre>
          </template>
          <p
            v-else
            class="prompt-empty-state"
          >
            {{ emptyLogText }}
          </p>
        </section>
      </div>
    </section>
  </div>
</template>
