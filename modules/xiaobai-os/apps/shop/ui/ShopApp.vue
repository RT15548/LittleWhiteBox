<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRaw } from 'vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import { HostRequestError } from '../../../shell/app-src/frame-bridge.js';
import type { ShopActivationView, ShopCatalogItemView, ShopClientState } from '../types.js';
import ShopActionDialog from './ShopActionDialog.vue';
import ShopInventory from './ShopInventory.vue';
import ShopShelf from './ShopShelf.vue';
import ShopEffects from './ShopEffects.vue';
import ShopProductDetail from './ShopProductDetail.vue';
import ShopIcon from './ShopIcon.vue';
import { shopPurchaseReason } from './shop-display.js';
import './shop.css';

interface PendingAction {
    mode: 'purchase' | 'use' | 'deactivate';
    itemId: string;
    activationId?: string;
    actionId: string;
}

const REQUEST_TIMEOUT_MS = 35_000;
const props = defineProps<XiaobaiOsAppProps>();
const state = ref(structuredClone(toRaw(props.initialState as ShopClientState)));
type ShopPage = 'shelf' | 'inventory' | 'effects';
const page = ref<ShopPage>('shelf');
const content = ref<HTMLElement | null>(null);
const selectedItemId = ref<string | null>(null);
const selectedItem = computed(() => state.value.catalog.find(item => item.id === selectedItemId.value));
const quantity = computed(() => state.value.catalog.reduce((sum, item) => sum + item.quantity, 0));
const activeCount = computed(() => state.value.activations.filter(activation => activation.state === 'active').length);
const successMessage = ref('');
let listScrollTop = 0;
const pending = ref<PendingAction | null>(null);
const refreshing = ref(false);
const actionBusy = ref(false);
const errorMessage = ref('');
const dialogError = ref('');
const pendingItem = computed(() => state.value.catalog.find(item => item.id === pending.value?.itemId));
const pendingActivation = computed(() => state.value.activations.find(activation => activation.activationId === pending.value?.activationId));
let unsubscribe = () => {};
let requestGeneration = 0;
useAppBack(() => {
    if (pending.value) { closeAction(); return true; }
    if (selectedItemId.value) { void closeDetail(); return true; }
    if (page.value !== 'shelf') { navigate('shelf'); return true; }
    return false;
});

const requiresConfirmation = computed(() => state.value.status === 'unconfirmed');
const writeDisabledReason = computed(() => {
    if (actionBusy.value) {return '正在处理上一项操作';}
    if (refreshing.value) {return '正在刷新商店状态';}
    if (state.value.status !== 'ready') {return state.value.message || '商店暂时不可写入';}
    return '';
});
const activationDisabledReason = computed(() => writeDisabledReason.value
    || (state.value.generationActive ? '主剧情正在生成，请等待回复完成' : ''));
const refreshDisabled = computed(() => refreshing.value || actionBusy.value || requiresConfirmation.value);
const pendingDisabledReason = computed(() => {
    if (!pending.value || !pendingItem.value) {return '这件奇物暂时不可操作';}
    if (requiresConfirmation.value) {return '保存尚未确认，请返回商店核实保存结果';}
    if (pending.value.mode === 'purchase') {return writeDisabledReason.value || shopPurchaseReason(pendingItem.value, state.value.balance);}
    if (activationDisabledReason.value) {return activationDisabledReason.value;}
    if (pending.value.mode === 'use' && pendingItem.value.quantity < 1) {return '背包中已没有这件奇物，请返回查看最新状态';}
    if (pending.value.mode === 'deactivate' && !pendingActivation.value?.canDeactivate) {return '这份效果已不可关闭，请返回查看最新状态';}
    return '';
});

function createActionId(): string {
    if (typeof globalThis.crypto?.randomUUID === 'function') {return `shop-ui:${globalThis.crypto.randomUUID()}`;}
    return `shop-ui:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

function binding(): { chatIdentity: string } {
    return { chatIdentity: state.value.chatIdentity };
}

function applyState(next: ShopClientState): void {
    state.value = structuredClone(next);
    refreshing.value = false;
    errorMessage.value = '';
}

function readableError(error: unknown): string {
    const message = error instanceof HostRequestError ? `${error.code} ${error.message}` : error instanceof Error ? error.message : String(error);
    if (message.includes('cannot be overdrawn') || message.includes('economy_insufficient_funds')) {return '小白币余额不足，未完成购买。';}
    if (message.includes('shop_purchase_limit_reached')) {return '这件奇物已达购买上限。';}
    if (message.includes('shop_quantity_insufficient')) {return '背包里已没有这件奇物，请返回查看。';}
    if (message.includes('shop_activation_duplicate')) {return '这份效果已经启用，本次没有消耗道具。';}
    if (message.includes('shop_parameters_invalid')) {return '请检查填写内容与字数后重试。';}
    if (message.includes('shop_action_conflict')) {return '该次使用已被记录，不能更换参数重试。请返回查看生效状态。';}
    if (message.includes('shop_activation_not_active') || message.includes('shop_activation_missing')) {return '这份效果状态已变化，请返回查看。';}
    if (message.includes('聊天已切换') || message.includes('app_inactive')) {return '聊天或应用已切换，请重新打开商店。';}
    if (message.includes('shop_main_generation_active')) {return '主剧情正在生成，请等待回复完成。';}
    if (message.includes('shop_revision_conflict') || message.includes('shop_event_id_conflict')) {
        return '商店状态已变化，请关闭确认框后重试。';
    }
    if (message === 'host_request_timeout') {return '等待保存结果超时，请使用同一确认框重试。';}
    return '商店操作未完成，请稍后重试。';
}

async function refresh(): Promise<void> {
    if (refreshDisabled.value) {return;}
    const generation = ++requestGeneration;
    refreshing.value = true;
    errorMessage.value = '';
    try {
        const response = await props.bridge.request('shop/refresh', binding(), REQUEST_TIMEOUT_MS) as {
            result: ShopClientState;
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
        const response = await props.bridge.request('shop/confirm-save', binding(), REQUEST_TIMEOUT_MS) as {
            result: { state: ShopClientState };
        };
        if (generation === requestGeneration) {applyState(response.result.state);}
    } catch (error) {
        if (generation === requestGeneration) {errorMessage.value = readableError(error);}
    } finally {
        if (generation === requestGeneration) {refreshing.value = false;}
    }
}

function openAction(mode: PendingAction['mode'], item: ShopCatalogItemView, activation?: ShopActivationView): void {
    const disabledReason = mode === 'purchase' ? writeDisabledReason.value : activationDisabledReason.value;
    if (disabledReason) {return;}
    dialogError.value = '';
    successMessage.value = '';
    pending.value = { mode, itemId: item.id, activationId: activation?.activationId, actionId: createActionId() };
}

function navigate(next: ShopPage): void {
    successMessage.value = '';
    selectedItemId.value = null;
    page.value = next;
    content.value?.scrollTo(0, 0);
}

async function openDetail(item: ShopCatalogItemView): Promise<void> {
    successMessage.value = '';
    listScrollTop = content.value?.scrollTop ?? 0;
    selectedItemId.value = item.id;
    await nextTick();
    if (selectedItemId.value !== item.id) {return;}
    content.value?.scrollTo(0, 0);
    content.value?.querySelector<HTMLButtonElement>('.shop-detail-back')?.focus({ preventScroll: true });
}

async function closeDetail(): Promise<void> {
    const itemId = selectedItemId.value;
    selectedItemId.value = null;
    await nextTick();
    content.value?.scrollTo(0, listScrollTop);
    Array.from(content.value?.querySelectorAll<HTMLButtonElement>('button[data-item-id]') ?? [])
        .find(button => button.dataset.itemId === itemId)?.focus({ preventScroll: true });
}

function openDeactivation(activation: ShopActivationView): void {
    const item = state.value.catalog.find(candidate => candidate.id === activation.itemId);
    if (item) {openAction('deactivate', item, activation);}
}

function closeAction(): void {
    if (actionBusy.value) {return;}
    pending.value = null;
    dialogError.value = '';
}

async function submitAction(parameters: Record<string, string>): Promise<void> {
    const action = pending.value;
    const item = pendingItem.value;
    if (!action || !item || pendingDisabledReason.value) {return;}
    actionBusy.value = true;
    dialogError.value = '';
    const generation = requestGeneration;
    const endpoint = action.mode === 'purchase' ? 'shop/purchase' : action.mode === 'use' ? 'shop/activate' : 'shop/deactivate';
    try {
        const response = await props.bridge.request(endpoint, {
            ...binding(),
            expectedRevision: state.value.revision,
            expectedEventId: state.value.eventId,
            actionId: action.actionId,
            itemId: action.itemId,
            ...(action.mode === 'use' ? { parameters } : {}),
            ...(action.activationId ? { activationId: action.activationId } : {}),
        }, REQUEST_TIMEOUT_MS) as { result: ShopClientState };
        if (generation !== requestGeneration || pending.value !== action) {return;}
        applyState(response.result);
        pending.value = null;
        navigate(action.mode === 'purchase' ? 'inventory' : 'effects');
        successMessage.value = action.mode === 'purchase'
            ? `${item.name}已放入背包 · 已支付 ${item.price.toLocaleString('zh-CN')} 小白币`
            : action.mode === 'use' ? `${item.name}已启用 · 已使用 1 件库存` : `${item.name}的效果已关闭`;
    } catch (error) {
        if (generation === requestGeneration && pending.value === action) {dialogError.value = readableError(error);}
    } finally {
        if (generation === requestGeneration) {actionBusy.value = false;}
    }
}

onMounted(() => {
    unsubscribe = props.bridge.subscribe((message) => {
        if (message.type === 'shop/state') {
            if (!actionBusy.value) {requestGeneration += 1;}
            applyState((message.payload as { state: ShopClientState }).state);
        }
        if (message.type === 'shop/error') {
            errorMessage.value = readableError((message.payload as { message?: string })?.message || '');
        }
    });
});

onBeforeUnmount(() => {
    requestGeneration += 1;
    unsubscribe();
    pending.value = null;
});
</script>

<template>
    <main class="shop-app">
        <header class="shop-header">
            <h1>奇物商店</h1>
            <div class="shop-balance" aria-label="小白币余额"><strong>¤ {{ state.status === 'loading' ? '—' : state.balance.toLocaleString('zh-CN') }}</strong></div>
            <button type="button" class="shop-icon-button" :disabled="refreshDisabled" aria-label="刷新商店" @click="refresh"><ShopIcon name="refresh" :class="{ 'is-spinning': refreshing }" /></button>
        </header>
        <div v-if="state.message || errorMessage || successMessage" class="shop-notice-area">
            <aside v-if="state.message || errorMessage" class="shop-notice" :class="{ 'is-error': errorMessage || state.status === 'blocked' || state.status === 'conflict' }" role="status">
                <p>{{ errorMessage || state.message }}</p>
                <button v-if="requiresConfirmation" type="button" :disabled="refreshing || actionBusy" @click="confirmSave">{{ refreshing ? '正在核实…' : '核实保存结果' }}</button>
                <button v-else-if="state.status === 'blocked' || errorMessage" type="button" :disabled="refreshDisabled" @click="refresh">{{ refreshing ? '正在读取…' : '重新读取商店' }}</button>
            </aside>
            <div v-if="successMessage" class="shop-success" role="status"><ShopIcon name="check" /><span>{{ successMessage }}</span><button type="button" class="shop-icon-button" aria-label="关闭成功提示" @click="successMessage = ''"><ShopIcon name="close" /></button></div>
        </div>
        <div ref="content" class="shop-scroll">
            <div v-if="state.status === 'loading'" class="shop-empty" role="status"><ShopIcon name="shop" /><h3>正在读取商店…</h3></div>
            <template v-else>
                <ShopShelf v-if="page === 'shelf'" v-show="!selectedItem" :catalog="state.catalog" @open="openDetail" />
                <ShopInventory v-else-if="page === 'inventory'" v-show="!selectedItem" :catalog="state.catalog" :write-disabled-reason="activationDisabledReason" @open="openDetail" @use="item => openAction('use', item)" @browse="navigate('shelf')" />
                <ShopEffects v-else v-show="!selectedItem" :activations="state.activations" :write-disabled-reason="activationDisabledReason" @deactivate="openDeactivation" @inventory="navigate('inventory')" />
                <ShopProductDetail v-if="selectedItem" :item="selectedItem" :balance="state.balance" :write-disabled-reason="writeDisabledReason" :activation-disabled-reason="activationDisabledReason" @back="closeDetail" @purchase="openAction('purchase', selectedItem)" @use="openAction('use', selectedItem)" />
            </template>
        </div>
        <nav class="shop-navigation" aria-label="商店主导航">
            <button type="button" :aria-current="page === 'shelf' ? 'page' : undefined" aria-label="逛店" @click="navigate('shelf')"><span><ShopIcon name="shop" /></span>逛店</button>
            <button type="button" :aria-current="page === 'inventory' ? 'page' : undefined" aria-label="背包" @click="navigate('inventory')"><span><ShopIcon name="bag" /><i v-if="quantity">{{ quantity }}</i></span>背包</button>
            <button type="button" :aria-current="page === 'effects' ? 'page' : undefined" aria-label="生效中" @click="navigate('effects')"><span><ShopIcon name="spark" /><i v-if="activeCount">{{ activeCount }}</i></span>生效中</button>
        </nav>
        <ShopActionDialog v-if="pending && pendingItem" :mode="pending.mode" :item="pendingItem" :activation="pendingActivation" :balance="state.balance" :busy="actionBusy" :error="dialogError" :disabled-reason="pendingDisabledReason" @cancel="closeAction" @confirm="submitAction" />
    </main>
</template>
