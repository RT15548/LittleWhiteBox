<script setup lang="ts">
import { reactive, ref, toRaw } from 'vue';
import { useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
import FourthWallSessions from './FourthWallSessions.vue';
import type { FourthWallChatState, FourthWallGlobalSettings } from '../types.js';

const props = defineProps<{
    chat: FourthWallChatState;
    global: FourthWallGlobalSettings;
    busy: boolean;
}>();

const emit = defineEmits<{
    close: [];
    updateChat: [patch: FourthWallChatState['settings']];
    updateGlobal: [patch: Partial<FourthWallGlobalSettings>];
    switchSession: [sessionId: string];
    addSession: [name: string];
    renameSession: [sessionId: string, name: string];
    deleteSession: [sessionId: string];
    openPrompts: [];
}>();

const chatDraft = reactive(structuredClone(toRaw(props.chat.settings)));
const layer = ref<HTMLElement | null>(null);
useAppLayer(layer, () => emit('close'));
const globalDraft = reactive(structuredClone(toRaw(props.global)));

function saveChat(): void {
    emit('updateChat', structuredClone(toRaw(chatDraft)));
}

function saveCapabilities(): void {
    emit('updateGlobal', {
        image: structuredClone(toRaw(globalDraft.image)),
        voice: structuredClone(toRaw(globalDraft.voice)),
        commentary: structuredClone(toRaw(globalDraft.commentary)),
    });
}
</script>

<template>
    <aside ref="layer" class="fourth-wall-settings" aria-label="四次元壁设置">
        <header><strong>四次元壁设置</strong><button type="button" @click="emit('close')">关闭</button></header>
        <div class="fourth-wall-settings-scroll">
            <FourthWallSessions
                :sessions="chat.sessions"
                :active-session-id="chat.activeSessionId"
                :disabled="busy"
                @switch="emit('switchSession', $event)"
                @add="emit('addSession', $event)"
                @rename="(id, name) => emit('renameSession', id, name)"
                @delete="emit('deleteSession', $event)"
            />
            <section class="fourth-wall-settings-section">
                <h3>上下文</h3>
                <label>普通聊天层数<input v-model.number="chatDraft.maxChatLayers" type="number" min="1" max="9999"></label>
                <label>皮下聊天轮数<input v-model.number="chatDraft.maxMetaTurns" type="number" min="1" max="9999"></label>
                <label class="is-toggle"><span>流式生成</span><input v-model="chatDraft.stream" type="checkbox"></label>
                <label class="is-toggle"><span>禁用 Assistant Prefill</span><input v-model="chatDraft.disableAssistantPrefill" type="checkbox"></label>
                <button type="button" class="is-primary" :disabled="busy" @click="saveChat">保存上下文设置</button>
            </section>
            <section class="fourth-wall-settings-section">
                <h3>能力</h3>
                <label class="is-toggle"><span>在提示词中允许图片</span><input v-model="globalDraft.image.enablePrompt" type="checkbox"></label>
                <label class="is-toggle"><span>在提示词中允许语音</span><input v-model="globalDraft.voice.enabled" type="checkbox"></label>
                <label class="is-toggle"><span>实时吐槽</span><input v-model="globalDraft.commentary.enabled" type="checkbox"></label>
                <label v-if="globalDraft.commentary.enabled">
                    吐槽概率 {{ globalDraft.commentary.probability }}%
                    <input v-model.number="globalDraft.commentary.probability" type="range" min="1" max="99">
                </label>
                <button type="button" class="is-primary" :disabled="busy" @click="saveCapabilities">保存能力设置</button>
            </section>
            <section class="fourth-wall-settings-section is-actions">
                <button type="button" @click="emit('openPrompts')">提示词模板</button>
            </section>
        </div>
    </aside>
</template>
