<script setup lang="ts">
import type { TavernTaskListing } from '../../../../../shared/tasks/task-types';
import { tavernTaskRewardLabel } from '../../../../features/phone-os/apps/tasks/tavern-task-presentation';

defineProps<{
    listing: TavernTaskListing | null;
    accepted: boolean;
    busy: boolean;
    error: string;
}>();

const emit = defineEmits<{
    (event: 'back'): void;
    (event: 'accept', listing: TavernTaskListing): void;
}>();
</script>

<template>
  <section class="tavern-phone-app tavern-task-detail-page">
    <header class="tavern-task-detail-head">
      <button
        type="button"
        class="tavern-phone-back-button"
        aria-label="返回委托板"
        @click="emit('back')"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="m15 4-8 8 8 8" /></svg>
      </button>
      <div>
        <span>BOARD TICKET</span>
        <strong>委托详情</strong>
      </div>
      <b v-if="listing">{{ listing.grade }}</b>
      <span v-else />
    </header>
    <div
      v-if="listing"
      class="tavern-task-detail-scroll"
    >
      <article class="tavern-task-dossier">
        <header>
          <span>{{ listing.issuer.name }}</span>
          <small>{{ listing.id.slice(-8).toUpperCase() }}</small>
          <h2>{{ listing.title }}</h2>
          <p>{{ listing.hook }}</p>
        </header>
        <div class="tavern-task-dossier-grid">
          <section>
            <span>OBJECTIVE</span>
            <p>{{ listing.objective }}</p>
          </section>
          <section v-if="listing.requirements">
            <span>REQUIREMENTS</span>
            <p>{{ listing.requirements }}</p>
          </section>
          <section>
            <span>LOCATION</span>
            <p>{{ listing.location }}</p>
          </section>
          <section>
            <span>RISK NOTE</span>
            <p>{{ listing.risk }}</p>
          </section>
          <section>
            <span>发布者</span>
            <p>{{ listing.issuer.description }}</p>
          </section>
        </div>
        <div class="tavern-task-dossier-tags">
          <i
            v-for="tag in listing.tags"
            :key="tag"
          >{{ tag }}</i>
        </div>
        <footer>
          <span>托管报酬</span>
          <strong>{{ tavernTaskRewardLabel(listing.reward) }} <small>◈</small></strong>
        </footer>
      </article>
      <div
        v-if="error"
        class="tavern-task-inline-alert"
        role="status"
      >
        <strong>操作未完成</strong>
        <p>{{ error }}</p>
      </div>
    </div>
    <div
      v-else
      class="tavern-task-empty"
    >
      <strong>这张委托票据已经失效</strong>
      <p>返回委托板，读取当前仍有效的内容。</p>
    </div>
    <footer
      v-if="listing"
      class="tavern-task-action-dock"
    >
      <button
        type="button"
        :disabled="accepted || busy"
        @click="emit('accept', listing)"
      >
        {{ accepted ? '已经接取' : busy ? '正在提交' : '接取这份委托' }}
      </button>
      <small>{{ accepted ? '这份委托已进入进行中。' : '接取后，发布者的报酬会进入任务托管。' }}</small>
    </footer>
  </section>
</template>
