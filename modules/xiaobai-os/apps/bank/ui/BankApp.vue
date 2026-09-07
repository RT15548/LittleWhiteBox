<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRaw } from 'vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type {
    BankActivityPageView,
    BankClientState,
    BankDepositPositionView,
    BankDepositProductView,
    BankFundProductView,
    BankPage,
} from '../types.js';
import BankActionDialog from './BankActionDialog.vue';
import BankDeposits from './BankDeposits.vue';
import BankFunds from './BankFunds.vue';
import BankPositions from './BankPositions.vue';
import BankRecords from './BankRecords.vue';
import BankVault from './BankVault.vue';
import BankProductIcon from './BankProductIcon.vue';
import './bank.css';

interface PendingAction {
    mode: 'deposit-open' | 'fund-open' | 'withdraw';
    product?: BankDepositProductView | BankFundProductView;
    position?: BankDepositPositionView;
    actionId: string;
}

const REQUEST_TIMEOUT_MS = 35_000;
const props = defineProps<XiaobaiOsAppProps>();
const state = ref(structuredClone(toRaw(props.initialState as BankClientState)));
const page = ref<BankPage>('vault');
const content = ref<HTMLElement | null>(null);
const pending = ref<PendingAction | null>(null);
const refreshing = ref(false);
const actionBusy = ref(false);
const loadingMore = ref(false);
const errorMessage = ref('');
const dialogError = ref('');
const recordsError = ref('');
let claimActionId: string | null = null;
let unsubscribe = () => {};
let requestGeneration = 0;
useAppBack(() => {
    if (pending.value) { closeAction(); return true; }
    if (page.value !== 'vault') { navigate('vault'); return true; }
    return false;
});

const requiresConfirmation = computed(() => state.value.status === 'unconfirmed');
const writeDisabledReason = computed(() => {
    if (actionBusy.value) {return '正在处理上一项银行操作';}
    if (refreshing.value) {return '正在刷新金库状态';}
    if (state.value.status !== 'ready') {return state.value.message || '金库暂时不可写入';}
    if (state.value.generationActive) {return '主剧情正在生成，请等待回复完成';}
    return '';
});
const refreshDisabled = computed(() => refreshing.value || actionBusy.value || requiresConfirmation.value);
const noticeMessage = computed(() => errorMessage.value || state.value.message || (state.value.status !== 'loading' && !pending.value ? writeDisabledReason.value : ''));

function createActionId(): string {
    if (typeof globalThis.crypto?.randomUUID === 'function') {return `bank-ui:${globalThis.crypto.randomUUID()}`;}
    return `bank-ui:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

function binding(): { chatIdentity: string } {
    return { chatIdentity: state.value.chatIdentity };
}

function applyState(next: BankClientState): void {
    state.value = structuredClone(next);
    refreshing.value = false;
    loadingMore.value = false;
    errorMessage.value = '';
    recordsError.value = '';
    if (next.claimableCount === 0) {claimActionId = null;}
}

function readableError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('economy_insufficient_funds') || message.includes('cannot be overdrawn')) {return '可用小白币不足，开户未完成。';}
    if (message.includes('bank_amount_out_of_range')) {return '开户金额不在该产品允许范围内。';}
    if (message.includes('bank_amount_invalid')) {return '开户金额必须是正整数。';}
    if (message.includes('bank_revision_conflict') || message.includes('bank_event_id_conflict')) {return '金库状态已变化，请关闭确认框并刷新后重试。';}
    if (message.includes('bank_position_missing') || message.includes('bank_position_state_changed')) {return '该笔资产状态已经变化，请刷新金库。';}
    if (message.includes('bank_no_due_positions')) {return '当前没有可领取的到期资产。';}
    if (message === 'host_request_timeout') {return '等待保存结果超时，请保留当前页面并重试。';}
    return '银行操作未完成，请稍后重试。';
}

async function refresh(): Promise<void> {
    if (refreshDisabled.value) {return;}
    const generation = ++requestGeneration;
    refreshing.value = true;
    errorMessage.value = '';
    try {
        const response = await props.bridge.request('bank/refresh', binding(), REQUEST_TIMEOUT_MS) as {
            result: BankClientState;
        };
        if (generation === requestGeneration) {applyState(response.result);}
    } catch (error) {
        if (generation === requestGeneration) {errorMessage.value = readableError(error);}
    } finally {
        if (generation === requestGeneration) {refreshing.value = false;}
    }
}

async function confirmSave(): Promise<void> {
    if (refreshing.value || actionBusy.value) {return;}
    const generation = ++requestGeneration;
    refreshing.value = true;
    errorMessage.value = '';
    try {
        const response = await props.bridge.request('bank/confirm-save', binding(), REQUEST_TIMEOUT_MS) as {
            result: { state: BankClientState };
        };
        if (generation === requestGeneration) {applyState(response.result.state);}
    } catch (error) {
        if (generation === requestGeneration) {errorMessage.value = readableError(error);}
    } finally {
        if (generation === requestGeneration) {refreshing.value = false;}
    }
}

function navigate(next: BankPage): void {
    page.value = next;
    content.value?.scrollTo(0, 0);
}

function openProduct(product: BankDepositProductView | BankFundProductView, mode: PendingAction['mode']): void {
    if (writeDisabledReason.value) {return;}
    dialogError.value = '';
    pending.value = { mode, product, actionId: createActionId() };
}

function openWithdrawal(position: BankDepositPositionView): void {
    if (writeDisabledReason.value) {return;}
    dialogError.value = '';
    pending.value = { mode: 'withdraw', position, actionId: createActionId() };
}

function closeAction(): void {
    if (actionBusy.value) {return;}
    pending.value = null;
    dialogError.value = '';
}

async function submitAction(amount?: number): Promise<void> {
    const action = pending.value;
    if (!action || writeDisabledReason.value) {return;}
    const generation = requestGeneration;
    actionBusy.value = true;
    dialogError.value = '';
    const endpoint = action.mode === 'deposit-open'
        ? 'bank/deposit/open'
        : action.mode === 'fund-open' ? 'bank/fund/open' : 'bank/deposit/withdraw';
    try {
        const response = await props.bridge.request(endpoint, {
            ...binding(),
            expectedRevision: state.value.revision,
            expectedEventId: state.value.eventId,
            actionId: action.actionId,
            ...(action.product ? { productId: action.product.id, amount } : {}),
            ...(action.position ? { positionId: action.position.id } : {}),
        }, REQUEST_TIMEOUT_MS) as { result: BankClientState };
        if (generation !== requestGeneration || pending.value !== action) {return;}
        applyState(response.result);
        pending.value = null;
        navigate('positions');
    } catch (error) {
        if (generation === requestGeneration && pending.value === action) {dialogError.value = readableError(error);}
    } finally {
        if (generation === requestGeneration) {actionBusy.value = false;}
    }
}

async function settleDue(): Promise<void> {
    if (writeDisabledReason.value || state.value.claimableCount === 0) {return;}
    const generation = requestGeneration;
    claimActionId ||= createActionId();
    const actionId = claimActionId;
    actionBusy.value = true;
    errorMessage.value = '';
    try {
        const response = await props.bridge.request('bank/settle-due', {
            ...binding(),
            expectedRevision: state.value.revision,
            expectedEventId: state.value.eventId,
            actionId,
        }, REQUEST_TIMEOUT_MS) as { result: BankClientState };
        if (generation !== requestGeneration) {return;}
        claimActionId = null;
        applyState(response.result);
    } catch (error) {
        if (generation === requestGeneration) {errorMessage.value = readableError(error);}
    } finally {
        if (generation === requestGeneration) {actionBusy.value = false;}
    }
}

async function loadMore(): Promise<void> {
    if (!state.value.activityPage.hasMore || loadingMore.value || actionBusy.value) {return;}
    const generation = requestGeneration;
    const offset = state.value.activities.length;
    loadingMore.value = true;
    recordsError.value = '';
    try {
        const response = await props.bridge.request('bank/records/load-more', {
            ...binding(),
            offset,
        }, REQUEST_TIMEOUT_MS) as { result: BankActivityPageView };
        if (generation !== requestGeneration) {return;}
        const known = new Set(state.value.activities.map((activity) => activity.id));
        state.value.activities.push(...response.result.activities.filter((activity) => !known.has(activity.id)));
        state.value.activityPage = response.result.activityPage;
    } catch (error) {
        if (generation === requestGeneration) {recordsError.value = readableError(error);}
    } finally {
        if (generation === requestGeneration) {loadingMore.value = false;}
    }
}

onMounted(() => {
    unsubscribe = props.bridge.subscribe((message) => {
        if (message.type === 'bank/state') {
            if (!actionBusy.value) {requestGeneration += 1;}
            applyState((message.payload as { state: BankClientState }).state);
        }
        if (message.type === 'bank/error') {
            errorMessage.value = readableError((message.payload as { message?: string })?.message || '');
        }
    });
});

onBeforeUnmount(() => {
    requestGeneration += 1;
    unsubscribe();
    pending.value = null;
    claimActionId = null;
});
</script>

<template>
    <main class="bank-app">
        <header class="bank-header">
            <h1>银行</h1>
            <div class="bank-header-balance" aria-label="钱包可用余额"><strong>¤ {{ state.status === 'loading' ? '—' : state.balance.toLocaleString('zh-CN') }}</strong></div>
            <button type="button" class="bank-icon-button" :disabled="refreshDisabled" aria-label="刷新银行" @click="refresh"><BankProductIcon kind="refresh" :class="{ 'is-spinning': refreshing }" /></button>
        </header>
        <div v-if="noticeMessage" class="bank-notice-area">
            <aside class="bank-notice" :class="{ 'is-error': Boolean(errorMessage) || state.status === 'blocked' || state.status === 'conflict' }" role="status">
                <p>{{ noticeMessage }}</p>
                <button v-if="requiresConfirmation" type="button" :disabled="refreshing || actionBusy" @click="confirmSave">{{ refreshing ? '正在核实…' : '核实保存结果' }}</button>
                <button v-else-if="state.status === 'blocked' || state.status === 'conflict'" type="button" :disabled="refreshDisabled" @click="refresh">{{ refreshing ? '正在读取…' : '重新读取银行' }}</button>
            </aside>
        </div>
        <div ref="content" class="bank-scroll">
            <div v-if="state.status === 'loading'" class="bank-empty-state" role="status"><BankProductIcon kind="refresh" class="is-spinning" /><h3>正在读取资产…</h3></div>
            <BankVault v-else-if="page === 'vault'" :locked-amount="state.lockedAmount" :current-turn="state.currentTurn" :deposit-count="state.deposits.length" :fund-count="state.investments.length" :claimable-count="state.claimableCount" :write-disabled-reason="writeDisabledReason" @navigate="navigate" @settle="settleDue" />
            <BankDeposits v-else-if="page === 'deposits'" :products="state.products.deposits" :balance="state.balance" :write-disabled-reason="writeDisabledReason" @open="product => openProduct(product, 'deposit-open')" />
            <BankFunds v-else-if="page === 'funds'" :products="state.products.funds" :balance="state.balance" :write-disabled-reason="writeDisabledReason" @open="product => openProduct(product, 'fund-open')" />
            <BankPositions v-else-if="page === 'positions'" :deposits="state.deposits" :investments="state.investments" :claimable-count="state.claimableCount" :write-disabled-reason="writeDisabledReason" @withdraw="openWithdrawal" @settle="settleDue" @browse="navigate('deposits')" />
            <BankRecords v-else :activities="state.activities" :total="state.activityPage.total" :has-more="state.activityPage.hasMore" :loading-more="loadingMore" :error="recordsError" @load-more="loadMore" />
        </div>
        <nav class="bank-navigation" aria-label="银行主导航">
            <button v-for="item in [{ page: 'vault', label: '总览', icon: 'vault' }, { page: 'deposits', label: '存单', icon: 'deposit' }, { page: 'funds', label: '理财', icon: 'fund' }, { page: 'positions', label: '持有', icon: 'positions' }, { page: 'records', label: '记录', icon: 'records' }] as const" :key="item.page" type="button" :aria-label="item.label" :aria-current="page === item.page ? 'page' : undefined" @click="navigate(item.page)"><span><BankProductIcon :kind="item.icon" /><i v-if="item.page === 'positions' && state.claimableCount" /></span>{{ item.label }}</button>
        </nav>
        <BankActionDialog v-if="pending" :mode="pending.mode" :product="pending.product" :position="pending.position" :balance="state.balance" :busy="actionBusy" :error="dialogError" :claimable-count="state.claimableCount" :disabled-reason="writeDisabledReason" @cancel="closeAction" @confirm="submitAction" />
    </main>
</template>
