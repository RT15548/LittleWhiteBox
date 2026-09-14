<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRaw } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { WalletClientState, WalletTransactionPageView, WalletTransactionView } from '../types.js';
import WalletAppHeader from './WalletAppHeader.vue';
import WalletBalanceCard from './WalletBalanceCard.vue';
import WalletNotice, { type WalletNoticeTone } from './WalletNotice.vue';
import WalletTransactionList from './WalletTransactionList.vue';
import WalletTransactionDetail from './WalletTransactionDetail.vue';
import './wallet-ui.css';
import './wallet.css';

const REQUEST_TIMEOUT_MS = 35_000;
const props = defineProps<XiaobaiOsAppProps>();
const state = ref(structuredClone(toRaw(props.initialState as WalletClientState)));
const refreshing = ref(false);
const loadingMore = ref(false);
const errorMessage = ref('');
const loadMoreError = ref('');
const selectedTransaction = ref<WalletTransactionView | null>(null);
let unsubscribe = () => {};
let requestGeneration = 0;

const requiresConfirmation = computed(() => state.value.status === 'unconfirmed');
const actionBusy = computed(() => refreshing.value || state.value.status === 'loading' || state.value.status === 'saving');
const refreshDisabled = computed(() => actionBusy.value || requiresConfirmation.value || state.value.status === 'conflict');
const noticeVisible = computed(() => Boolean(state.value.message || errorMessage.value));

const noticeTone = computed<WalletNoticeTone>(() => {
    if (errorMessage.value || state.value.status === 'conflict' || state.value.status === 'blocked') {return 'danger';}
    if (requiresConfirmation.value) {return 'warning';}
    return 'info';
});

const noticeTitle = computed(() => {
    if (state.value.status === 'conflict') {return '账本有变化';}
    if (state.value.status === 'blocked') {return '钱包暂时无法读取';}
    return '保存情况';
});

function readableError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('聊天已切换')) {return '聊天已切换，请重新打开钱包。';}
    if (message === 'host_request_timeout') {return '暂时没收到结果，请稍后重新加载。';}
    return '钱包数据暂时无法读取，请稍后重试。';
}

function binding(): { chatIdentity: string } {
    return { chatIdentity: state.value.chatIdentity };
}

function applyState(next: WalletClientState): void {
    state.value = structuredClone(next);
    refreshing.value = false;
    loadingMore.value = false;
    errorMessage.value = '';
    loadMoreError.value = '';
}

async function refresh(): Promise<void> {
    if (actionBusy.value || requiresConfirmation.value || state.value.status === 'conflict') {return;}
    const generation = ++requestGeneration;
    refreshing.value = true;
    errorMessage.value = '';
    try {
        const response = await props.bridge.request('wallet/refresh', binding(), REQUEST_TIMEOUT_MS) as {
            result: WalletClientState;
        };
        if (generation === requestGeneration) {applyState(response.result);}
    } catch (error) {
        if (generation === requestGeneration) {errorMessage.value = readableError(error);}
    } finally {
        if (generation === requestGeneration) {refreshing.value = false;}
    }
}

async function confirmSave(): Promise<void> {
    if (actionBusy.value) {return;}
    const generation = ++requestGeneration;
    refreshing.value = true;
    errorMessage.value = '';
    try {
        const response = await props.bridge.request('wallet/confirm-save', binding(), REQUEST_TIMEOUT_MS) as {
            result: { state: WalletClientState };
        };
        if (generation === requestGeneration) {applyState(response.result.state);}
    } catch (error) {
        if (generation === requestGeneration) {errorMessage.value = readableError(error);}
    } finally {
        if (generation === requestGeneration) {refreshing.value = false;}
    }
}

async function loadMore(): Promise<void> {
    const cursor = state.value.nextCursor;
    if (!cursor || loadingMore.value || actionBusy.value) {return;}
    const generation = requestGeneration;
    loadingMore.value = true;
    loadMoreError.value = '';
    try {
        const response = await props.bridge.request('wallet/load-more', {
            ...binding(),
            beforeSequence: cursor,
        }) as { result: WalletTransactionPageView };
        if (generation !== requestGeneration) {return;}
        const known = new Set(state.value.transactions.map(transaction => transaction.id));
        state.value.transactions.push(...response.result.transactions.filter(transaction => !known.has(transaction.id)));
        state.value.nextCursor = response.result.nextCursor;
        state.value.hasMore = response.result.hasMore;
    } catch (error) {
        if (generation === requestGeneration) {loadMoreError.value = '更多流水暂时无法读取，请稍后重试。';}
    } finally {
        if (generation === requestGeneration) {loadingMore.value = false;}
    }
}

onMounted(() => {
    unsubscribe = props.bridge.subscribe((message) => {
        if (message.type === 'wallet/state') {
            requestGeneration += 1;
            applyState((message.payload as { state: WalletClientState }).state);
        }
        if (message.type === 'wallet/error') {
            errorMessage.value = readableError((message.payload as { message?: string })?.message || '');
        }
    });
});

onBeforeUnmount(() => {
    requestGeneration += 1;
    unsubscribe();
});
</script>

<template>
    <main class="wallet-ui-app wallet-app">
        <WalletAppHeader :refreshing="refreshing" :disabled="refreshDisabled" @refresh="refresh" />

        <div class="wallet-ui-scroll">
            <WalletBalanceCard :balance="state.balance" :currency="state.currency" :status="state.status" />

            <WalletNotice
                v-if="noticeVisible"
                class="wallet-notice"
                :tone="noticeTone"
                :title="noticeTitle"
                :message="errorMessage || state.message"
            >
                <button v-if="requiresConfirmation" type="button" class="wallet-ui-text-button" :disabled="refreshing" @click="confirmSave">
                    {{ refreshing ? '正在检查…' : '检查保存' }}
                </button>
                <button v-else-if="state.status === 'blocked' || errorMessage" type="button" class="wallet-ui-text-button" :disabled="refreshDisabled" @click="refresh">
                    {{ refreshing ? '正在读取…' : '重新加载' }}
                </button>
            </WalletNotice>

            <section class="wallet-ledger" aria-labelledby="wallet-ledger-title">
                <div class="wallet-ui-section-title">
                    <h2 id="wallet-ledger-title">收支账单</h2>
                    <small>共 {{ state.transactionCount }} 笔</small>
                </div>
                <WalletTransactionList
                    :transactions="state.transactions"
                    :has-more="state.hasMore"
                    :loading-more="loadingMore"
                    :loading="state.status === 'loading'"
                    :error="loadMoreError"
                    @load-more="loadMore"
                    @open="selectedTransaction = $event"
                />
            </section>
        </div>
        <WalletTransactionDetail v-if="selectedTransaction" :transaction="selectedTransaction" @close="selectedTransaction = null" />
    </main>
</template>
