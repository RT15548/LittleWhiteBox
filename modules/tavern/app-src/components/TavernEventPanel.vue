<script setup lang="ts">
import { computed } from 'vue';
import type { TavernTaskRecord } from '../../shared/session-db';

const props = withDefaults(defineProps<{
  tasks?: TavernTaskRecord[];
  enabled?: boolean;
  assistantFloor?: number;
}>(), {
  tasks: () => [],
  enabled: false,
  assistantFloor: -1,
});

const visibleTasks = computed(() => (Array.isArray(props.tasks) ? props.tasks : [])
    .filter((task) => task.status !== 'abandoned')
    .sort((left, right) => Number(right.updatedOrder) - Number(left.updatedOrder) || Number(right.updatedAt) - Number(left.updatedAt)));
const activeTasks = computed(() => visibleTasks.value.filter((task) => task.status === 'active'));
const completedTasks = computed(() => visibleTasks.value.filter((task) => task.status === 'completed'));
const primaryTask = computed(() => activeTasks.value[0] || null);
const alternateTasks = computed(() => activeTasks.value.slice(1, 4));
const completedPreviewTasks = computed(() => completedTasks.value.slice(0, 3));
const completedHiddenCount = computed(() => Math.max(0, completedTasks.value.length - completedPreviewTasks.value.length));
const emptyTitle = computed(() => {
    if (!props.enabled) {return '事件功能未授权';}
    if (Number(props.assistantFloor) < 5) {return '剧情展开后会出现野望';}
    return '当前没有足够新鲜的野望';
});
const emptyText = computed(() => {
    if (!props.enabled) {return '开启契约里的织线者后，后台会维护可回滚的野望调色盘。';}
    if (Number(props.assistantFloor) < 5) {return '先让人物、地点和关系沉淀几轮，系统不会过早生成野望。';}
    return '后台没有找到对味的新钩子时会保持空白。';
});

function orderLabel(task: TavernTaskRecord): string {
    const order = Number(task.updatedOrder);
    return Number.isFinite(order) && order >= 0 ? `#${order}` : '';
}

function eventTitle(task: TavernTaskRecord): string {
    return String(task.title || task.vision || '未命名野望').trim();
}
</script>

<template>
  <section class="tavern-event-panel">
    <div
      v-if="primaryTask"
      class="tavern-event-current"
    >
      <div class="tavern-event-current-head">
        <span class="tavern-event-kicker">野望调色盘</span>
        <small>{{ orderLabel(primaryTask) }}</small>
      </div>
      <h3>{{ eventTitle(primaryTask) }}</h3>
      <div class="tavern-event-vision-entry">
        {{ primaryTask.vision }}
      </div>
      <div class="tavern-event-done-token">
        <span>达成标志</span>
        <p>{{ primaryTask.doneWhen }}</p>
      </div>
    </div>
    <div
      v-else
      class="tavern-event-empty"
    >
      <strong>{{ emptyTitle }}</strong>
      <p>{{ emptyText }}</p>
    </div>

    <div
      v-if="alternateTasks.length"
      class="tavern-event-section"
    >
      <header>
        <strong>其他野望</strong>
        <span>{{ alternateTasks.length }}</span>
      </header>
      <article
        v-for="task in alternateTasks"
        :key="task.id"
        class="tavern-event-card"
      >
        <div>
          <strong>{{ eventTitle(task) }}</strong>
          <small>{{ orderLabel(task) }}</small>
        </div>
        <p class="tavern-event-vision-text">
          {{ task.vision }}
        </p>
        <p class="tavern-event-done">
          达成：{{ task.doneWhen }}
        </p>
      </article>
    </div>

    <div
      v-if="completedTasks.length"
      class="tavern-event-section"
    >
      <header>
        <strong>已完成 {{ completedTasks.length }}</strong>
      </header>
      <article
        v-for="task in completedPreviewTasks"
        :key="task.id"
        class="tavern-event-card is-completed"
      >
        <div>
          <strong>{{ eventTitle(task) }}</strong>
          <small>{{ orderLabel(task) }}</small>
        </div>
        <p class="tavern-event-vision-text">
          {{ task.vision }}
        </p>
        <p class="tavern-event-done">
          达成：{{ task.doneWhen }}
        </p>
      </article>
      <p
        v-if="completedHiddenCount"
        class="tavern-event-completed-more"
      >
        另有 {{ completedHiddenCount }} 条完成回执已收起
      </p>
    </div>
  </section>
</template>
