<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch, type Component } from 'vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { GameClientState, GameKind } from '../types.js';
import type { GameAction } from './room-contract.js';
import { createGameClient } from './game-client.js';
import { gameRoom } from './room-catalog.js';
import GameLobby from './GameLobby.vue';
import GameRecords from './GameRecords.vue';
import './game.css';

const props = defineProps<XiaobaiOsAppProps>();
const client = createGameClient(props.bridge, props.initialState as GameClientState);
const {
    state,
    settlement,
    funds,
    inFlight,
    reading,
    loadingMore,
    busy,
    error,
    recordsError,
    failed,
    disabledReason,
    needsSave,
    refreshDisabled,
} = client;
const scroll = ref<HTMLElement | null>(null);
let lobbyScroll = 0;
const page = ref<'lobby' | 'room' | 'records'>(state.value.activeGame ? 'room' : 'lobby');
const selected = ref<GameKind | null>(state.value.activeGame?.kind || null);
const roomComponent = shallowRef<Component | null>(null);
const roomError = ref('');
const roomLoading = ref(false);
let loadGeneration = 0;
const room = computed(() => (selected.value ? gameRoom(selected.value) : null));
async function loadRoom(): Promise<void> {
    const definition = room.value;
    const generation = ++loadGeneration;
    roomComponent.value = null;
    roomError.value = '';
    if (!definition) {
        return;
    }
    roomLoading.value = true;
    try {
        const module = await definition.load();
        if (generation === loadGeneration) {
            roomComponent.value = module.default;
        }
    } catch {
        if (generation === loadGeneration) {
            roomError.value = '这个游戏暂时没能打开，再试一次吧。';
        }
    } finally {
        if (generation === loadGeneration) {
            roomLoading.value = false;
        }
    }
}
watch([page, selected, () => Boolean(state.value.activeGame), () => Boolean(settlement.value)], (_, previous) => {
    if (previous[0] === 'lobby') {
        lobbyScroll = scroll.value?.scrollTop || 0;
    }
    void nextTick(() => {
        scroll.value?.scrollTo({ top: page.value === 'lobby' ? lobbyScroll : 0 });
    });
});
watch(selected, loadRoom, { immediate: true });
watch(settlement, (value) => {
    if (value) {
        selected.value = value.record.game;
    }
});
watch(
    () => state.value.chatIdentity,
    () => {
        lobbyScroll = 0;
        selected.value = state.value.activeGame?.kind || null;
        page.value = selected.value ? 'room' : 'lobby';
        void nextTick(() => {
            lobbyScroll = 0;
            scroll.value?.scrollTo({ top: 0 });
        });
    },
);
function open(kind: GameKind): void {
    selected.value = kind;
    page.value = 'room';
}
function leave(target: 'lobby' | 'records'): void {
    client.dismissSettlement();
    page.value = target;
}
useAppBack(() => {
    if (page.value === 'lobby') { return false; }
    leave('lobby'); return true;
});
function resume(): void {
    if (state.value.activeGame) {
        open(state.value.activeGame.kind);
    }
}
function again(): void {
    client.dismissSettlement();
}
async function act(action: GameAction): Promise<void> {
    await client.act(action);
}
onBeforeUnmount(() => {
    loadGeneration += 1;
    client.dispose();
});
</script>
<template>
    <main class="game-app">
        <header class="game-header">
            <button
                v-if="page === 'room'"
                type="button"
                class="game-back"
                aria-label="返回游戏大厅"
                @click="leave('lobby')"
            >
                ‹
            </button>
            <h1>{{ page === 'room' ? room?.name : '游戏' }}</h1>
            <div class="game-funds" aria-label="可用小白币">
                <strong>¤ {{ funds.balance.toLocaleString('zh-CN') }}</strong>
            </div>
        </header>
        <nav class="game-nav" aria-label="游戏页面">
            <button
                type="button"
                :aria-current="page === 'lobby' ? 'page' : undefined"
                @click="leave('lobby')"
            >
                大厅
            </button>
            <button
                v-if="state.activeGame"
                type="button"
                :aria-current="page === 'room' && selected === state.activeGame.kind ? 'page' : undefined"
                @click="resume"
            >
                继续 <i />
            </button>
            <button
                type="button"
                :aria-current="page === 'records' ? 'page' : undefined"
                @click="leave('records')"
            >
                记录
            </button>
        </nav>
        <aside v-if="state.message || error || state.generationActive" class="game-notice" role="status">
            <p>{{ error || state.message || '故事正在回复，等回复结束就能继续玩。' }}</p>
            <button v-if="needsSave" type="button" :disabled="busy" @click="client.confirmSave">
                {{ reading ? '正在确认…' : state.status === 'save-failed' ? '重试保存' : '核实保存结果' }}
            </button>
            <button
                v-else-if="failed"
                type="button"
                :disabled="busy || state.generationActive"
                @click="client.retry"
            >
                重试这次操作
            </button>
            <button
                v-if="!needsSave && state.status !== 'conflict'"
                type="button"
                :disabled="refreshDisabled"
                @click="client.refresh"
            >
                重新读取
            </button>
        </aside>
        <div ref="scroll" class="game-scroll">
            <GameLobby v-show="page === 'lobby'" :key="state.chatIdentity" :active-game="state.activeGame" @open="open" />
            <GameRecords
                v-if="page === 'records'"
                :records="state.records"
                :total="state.total"
                :has-more="state.hasMore"
                :loading-more="loadingMore"
                :error="recordsError"
                @load-more="client.loadMore"
            />
            <template v-else-if="page === 'room'">
                <div v-if="roomLoading" class="game-empty" role="status"><p>正在摆好桌面…</p></div>
                <div v-else-if="roomError" class="game-empty" role="status">
                    <p>{{ roomError }}</p>
                    <button type="button" @click="loadRoom">重新打开</button>
                </div>
                <component
                    :is="roomComponent"
                    v-else-if="roomComponent"
                    :state="state"
                    :disabled-reason="disabledReason"
                    :in-flight="inFlight"
                    :settlement="settlement?.record.game === selected ? settlement : null"
                    @revealed="client.revealComplete"
                    @action="act"
                    @again="again"
                    @lobby="leave('lobby')"
                    @resume="resume"
                />
            </template>
        </div>
    </main>
</template>
