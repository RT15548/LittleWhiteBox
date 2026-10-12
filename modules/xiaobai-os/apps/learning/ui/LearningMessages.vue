<script setup lang="ts">
import { computed } from 'vue';
import type { LearningDialogueView } from '../application/message-view.js';
import MessageMarkdown from '../../../shell/app-src/components/MessageMarkdown.vue';
import LearningProcess from './LearningProcess.vue';

const props = defineProps<{ turn: LearningDialogueView; disabled: boolean }>();
const emit = defineEmits<{ stop: [] }>();
const replies = computed(() => props.turn.messages.filter(message => message.role === 'assistant' && !message.toolCalls?.length && message.content));
</script>

<template>
    <div class="learning-messages">
        <LearningProcess :turn="turn" stoppable :disabled="disabled" @stop="emit('stop')" />
        <div v-for="(message, index) in replies" :key="index" class="learning-output" :class="{ 'is-streaming': message.streaming }">
            <MessageMarkdown class="learning-markdown" :text="message.content" />
        </div>
    </div>
</template>
