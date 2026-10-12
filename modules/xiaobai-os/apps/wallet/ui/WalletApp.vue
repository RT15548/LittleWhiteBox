<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRaw } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { WalletClientState, WalletTransactionPageView, WalletTransactionView } from '../types.js';
import WalletAppHeader from './WalletAppHeader.vue';
import WalletBalanceCard from './WalletBalanceCard.vue';
import WalletNotice, { type WalletNoticeTone } from './WalletNotice.vue';
import WalletTransactionList from './WalletTransactionList.vue';
import WalletTransactionDetail from './WalletTransactionDetail.vue';
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';
import { WALLET_COPY as copy } from '../copy.js';
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
const confirmingAdopt = ref(false);
let unsubscribe = () => {};
let requestGeneration = 0;

const requiresConfirmation = computed(() => ['unconfirmed', 'conflict', 'blocked'].includes(state.value.status));
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
    if (state.value.status === 'blocked') {return copy.blockedTitle;}
    return '保存情况';
});

function readableError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    if (message === 'host_request_timeout') {return '暂时没收到结果，请稍后重新加载。';}
    return copy.unavailable;
}

function binding(): { activationId: string } {
    return { activationId: state.value.activationId };
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

async function confirmSave(adopt = false): Promise<void> {
    if (actionBusy.value) {return;}
    const generation = ++requestGeneration;
    refreshing.value = true;
    errorMessage.value = '';
    try {
        const response = await props.bridge.request(adopt ? 'wallet/adopt-save' : 'wallet/confirm-save', binding(), REQUEST_TIMEOUT_MS) as {
            result: { state: WalletClientState };
        };
        if (generation === requestGeneration) {applyState(response.result.state);}
        confirmingAdopt.value = false;
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
            <div class="wallet-overview">
                <WalletBalanceCard :balance="state.balance" :currency="state.currency" :status="state.status" />

                <WalletNotice
                    v-if="noticeVisible"
                    class="wallet-notice"
                    :tone="noticeTone"
                    :title="noticeTitle"
                    :message="errorMessage || state.message"
                >
                    <button v-if="requiresConfirmation" type="button" class="wallet-ui-text-button" :disabled="refreshing" @click="confirmSave()">
                        {{ refreshing ? copy.checking : copy.checkSave }}
                    </button>
                    <button v-if="requiresConfirmation" type="button" class="wallet-ui-text-button" :disabled="refreshing" @click="confirmingAdopt = true">{{ copy.adopt }}</button>
                    <button v-else-if="errorMessage" type="button" class="wallet-ui-text-button" :disabled="refreshDisabled" @click="refresh">
                        {{ refreshing ? '正在读取…' : '重新加载' }}
                    </button>
                </WalletNotice>
            </div>

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
        <AppDialog v-if="confirmingAdopt" class="wallet-adopt-dialog" :busy="refreshing" aria-labelledby="wallet-adopt-title" @close="confirmingAdopt = false">
            <h2 id="wallet-adopt-title">{{ copy.adoptQuestion }}</h2>
            <p>{{ copy.adoptNotice }}</p>
            <div class="wallet-adopt-actions">
                <button type="button" :disabled="refreshing" @click="confirmingAdopt = false">{{ copy.cancel }}</button>
                <button type="button" :disabled="refreshing" @click="confirmSave(true)">{{ copy.confirm }}</button>
            </div>
        </AppDialog>
    </main>
</template>
