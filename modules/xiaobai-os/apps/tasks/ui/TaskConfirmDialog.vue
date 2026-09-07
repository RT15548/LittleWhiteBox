<script setup lang="ts">
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';

defineProps<{ title: string; confirmLabel: string; busy: boolean; disabledReason: string; error: string }>();
const emit = defineEmits<{ close: []; confirm: [] }>();

</script>
<template>
    <AppDialog class="tasks-dialog" :aria-label="title" :busy="busy" @close="emit('close')">
        <h2 id="tasks-confirm-title">{{ title }}</h2>
        <div class="tasks-dialog-copy"><slot /></div>
        <p v-if="error" class="tasks-dialog-error" role="alert">{{ error }}</p>
        <p v-if="disabledReason && !busy" class="tasks-hint">{{ disabledReason }}</p>
        <footer><button type="button" class="tasks-secondary-button" :disabled="busy" autofocus @click="emit('close')">返回</button><button type="button" class="tasks-primary-button" :disabled="busy || Boolean(disabledReason)" @click="emit('confirm')">{{ busy ? '正在保存…' : confirmLabel }}</button></footer>
    </AppDialog>
</template>
