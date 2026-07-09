<script setup lang="ts">
import TavernCornerActions from './TavernCornerActions.vue';

defineProps<{
    dark: boolean;
}>();

defineEmits<{
    (event: 'toggle-theme'): void;
    (event: 'back'): void;
}>();
</script>

<template>
  <section class="xb-page tavern-about-page">
    <TavernCornerActions
      compact
      :dark="dark"
      @toggle-theme="$emit('toggle-theme')"
    />
    <button
      type="button"
      class="about-return-inline"
      @click="$emit('back')"
    >
      RETURN TO INDEX
    </button>
    <section class="about-title-block">
      <h1 class="about-title">
        小白酒馆
      </h1>
      <div class="about-sub">
        A CLEANER WAY TO ROLEPLAY
      </div>
    </section>
    <section class="manifesto-body">
      <p class="intro-dropcap">
        当你与角色聊到数十万字，故事不该被界面拖慢。小白酒馆重写了渲染层，长对话里依然顺滑。
      </p>
      <p>但流畅只是基础。我们真正想做的，是给角色扮演多配一位后台帮手。它不替代记忆，而是替你打理那些容易散落的线索。</p>
      <div class="feature-block">
        <h3>I. 幕后代理与双面板</h3>
        <p>舞台前，你与角色保持沉浸的互动；舞台后，一个 Agent 静静旁观对话。需要时翻转面板进入助手聊天，直接找它梳理线索、讨论伏笔设定，不必出戏去打扰剧情里的角色。</p>
      </div>
      <div class="feature-block">
        <h3>II. 自动演进的可视化世界</h3>
        <p>代理在后台帮你整理剧情脉络、归档阶段事件。基于这套结构化数据，系统支撑起了可视化的空间地图与任务线索。你去过的地点、展开的事件，会在台面下慢慢生长。这块还在持续演进。</p>
      </div>
      <div class="feature-block">
        <h3>III. 依然是你的酒馆</h3>
        <p>这套基建扎根在你熟悉的土壤上。角色卡、世界书、聊天预设、正则，全部直连酒馆本体。你可以在这里调取和修改旧设定，也能在请求日志里，清楚看到代理发出的每一条真实记录。</p>
      </div>
      <div class="feature-block quiet">
        <p>放下那些拥挤的参数窗口，选一张卡片，把心思还给故事本身。</p>
      </div>
    </section>
  </section>
</template>
