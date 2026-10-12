<script setup lang="ts">
import { toRef } from 'vue';
import { useLearningUiSession } from './learning-session.js';

const enabled = toRef(useLearningUiSession().companion, 'enabled');
defineProps<{ name?: string }>();
const copy = {
    title: '陪读', on: '陪你学习中', off: '未开启', description: '开启后，你安静阅读时语伴会偶尔搭句话',
    costTitle: '费用说明', cost: '陪读消息和聊天一样，按你所用的 AI 服务计费。',
};
</script>

<template>
    <details class="learning-companion-control">
        <summary><span class="learning-companion-light" :class="{ 'is-on': enabled }" aria-hidden="true" />{{ enabled ? (name ? `${name} · ${copy.on}` : copy.on) : copy.title }}<span v-if="!enabled" class="learning-sr-only">{{ copy.off }}</span></summary>
        <div class="learning-companion-options">
            <label class="learning-companion-switch"><span>{{ copy.description }}</span><input v-model="enabled" type="checkbox" role="switch" :aria-label="copy.title"></label>
            <details class="learning-cost-note"><summary>{{ copy.costTitle }}</summary><small>{{ copy.cost }}</small></details>
        </div>
    </details>
</template>
