<script setup lang="ts">
defineProps<{ sending?: boolean; error?: string; pendingSave?: boolean; disabled: boolean; discard?: boolean }>();
defineEmits<{ retry: []; discard: [] }>();
</script>
<template>
    <div class="messages-delivery" role="status">
        <span v-if="sending">发送中…</span>
        <template v-else>
            <span>{{ error || (pendingSave ? '尚待保存确认' : '尚未收到回复') }}</span>
            <button :disabled="disabled" @click="$emit('retry')">{{ pendingSave ? '检查并重试' : '重试' }}</button>
            <button v-if="discard && !pendingSave" :disabled="disabled" @click="$emit('discard')">删除</button>
        </template>
    </div>
</template>
