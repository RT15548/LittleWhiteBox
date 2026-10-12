<script setup lang="ts">
import type { FourthWallSessionInfo } from '../types.js';
import { FOURTH_WALL_SESSION_COPY as C } from './session-copy.js';

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
    const name = window.prompt(C.namePrompt, C.newName)?.trim();
    if (name) {
        emit('add', name);
    }
}

function rename(sessionId: string, currentName: string): void {
    const name = window.prompt(C.renamePrompt, currentName)?.trim();
    if (name) {
        emit('rename', sessionId, name);
    }
}

function remove(sessionId: string): void {
    if (window.confirm(C.removePrompt)) {
        emit('delete', sessionId);
    }
}
</script>

<template>
    <section class="fourth-wall-settings-section fourth-wall-sessions" :aria-label="C.title">
        <header><h3>{{ C.title }}</h3><button type="button" :disabled="disabled" :aria-label="C.add" :title="C.add" @click="add">＋</button></header>
        <div class="fourth-wall-session-list">
            <button v-for="session in sessions" :key="session.id" type="button" :disabled="disabled" :aria-current="session.id === activeSessionId ? 'true' : undefined" @click="session.id !== activeSessionId && emit('switch', session.id)">{{ session.name }}</button>
        </div>
        <div class="fourth-wall-session-actions">
            <button type="button" :disabled="disabled" @click="rename(activeSessionId, sessions.find(item => item.id === activeSessionId)!.name)">{{ C.rename }}</button>
            <button type="button" :disabled="disabled || sessions.length <= 1" class="is-danger" @click="remove(activeSessionId)">{{ C.remove }}</button>
        </div>
    </section>
</template>
