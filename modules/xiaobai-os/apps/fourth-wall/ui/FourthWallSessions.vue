<script setup lang="ts">
import type { FourthWallSessionInfo } from '../types.js';

defineProps<{
    sessions: FourthWallSessionInfo[];
    activeSessionId: string;
    disabled: boolean;
}>();

const emit = defineEmits<{
    switch: [sessionId: string];
    add: [name: string];
    rename: [sessionId: string, name: string];
    delete: [sessionId: string];
}>();

function add(): void {
    const name = window.prompt('新记录名称', '新记录')?.trim();
    if (name) {
        emit('add', name);
    }
}

function rename(sessionId: string, currentName: string): void {
    const name = window.prompt('重命名记录', currentName)?.trim();
    if (name) {
        emit('rename', sessionId, name);
    }
}

function remove(sessionId: string): void {
    if (window.confirm('确定删除当前记录及其皮下记忆吗？')) {
        emit('delete', sessionId);
    }
}
</script>

<template>
    <section class="fourth-wall-settings-section">
        <h3>聊天记录</h3>
        <div class="fourth-wall-session-row">
            <select :value="activeSessionId" :disabled="disabled" @change="emit('switch', ($event.target as HTMLSelectElement).value)">
                <option v-for="session in sessions" :key="session.id" :value="session.id">{{ session.name }}</option>
            </select>
            <button type="button" :disabled="disabled" title="新建记录" @click="add">＋</button>
            <button
                type="button"
                :disabled="disabled"
                title="重命名记录"
                @click="rename(activeSessionId, sessions.find(item => item.id === activeSessionId)?.name || '')"
            >
                改
            </button>
            <button
                type="button"
                :disabled="disabled || sessions.length <= 1"
                title="删除记录"
                class="is-danger"
                @click="remove(activeSessionId)"
            >
                删
            </button>
        </div>
    </section>
</template>
