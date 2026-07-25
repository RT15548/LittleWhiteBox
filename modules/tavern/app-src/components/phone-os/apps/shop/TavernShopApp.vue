<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { TavernShopItem } from '../../../../../shared/shop/shop-types';
import {
    useTavernPhoneContext,
    useTavernSessionContext,
} from '../../../tavern-app-context';
import {
    TAVERN_PHONE_SHOP_APP_ID,
} from '../../../../features/phone-os/phone-os-types';
import type { TavernShopActionIntent } from '../../../../features/phone-os/apps/shop/useTavernShopController';
import type {
    TavernShopActivationRow,
    TavernShopInventoryRow,
    TavernShopShelfRow,
} from '../../../../features/phone-os/apps/shop/tavern-shop-presentation';
import TavernShopActionDialog from './TavernShopActionDialog.vue';
import TavernShopInventory from './TavernShopInventory.vue';
import TavernShopShelf from './TavernShopShelf.vue';

const SHOP_SHELF_PATH = '/shelf';
const SHOP_INVENTORY_PATH = '/inventory';

interface ShopDialogState {
    intent: TavernShopActionIntent;
    item: TavernShopItem;
    parameters: Record<string, string>;
    permanentConfirm: boolean;
}

const phone = useTavernPhoneContext();
const session = useTavernSessionContext();
const dialog = ref<ShopDialogState | null>(null);
const activePath = computed(() => (
    phone.os.activeRoute.value.kind === 'app' ? phone.os.activeRoute.value.path : ''
));
const knownRoute = computed(() => [SHOP_SHELF_PATH, SHOP_INVENTORY_PATH].includes(activePath.value));
const inventoryCount = computed(() => phone.shop.heldItems.value.reduce((sum, row) => sum + row.quantity, 0));
const balanceLabel = computed(() => {
    if (phone.wallet.balanceLoading.value && !phone.wallet.balanceReady.value) {return '清点中';}
    if (!phone.wallet.balanceReady.value) {return '不可用';}
    return String(phone.wallet.balance.value);
});

function showPath(path: string) {
    closeDialog();
    phone.os.replaceAppRoute(TAVERN_PHONE_SHOP_APP_ID, path);
}

function closeDialog() {
    dialog.value = null;
    phone.shop.actionError.value = '';
}

async function openPurchase(row: TavernShopShelfRow) {
    const intent = await phone.shop.preparePurchase(row.item);
    if (!intent) {return;}
    dialog.value = { intent, item: row.item, parameters: {}, permanentConfirm: false };
}

async function openActivation(row: TavernShopInventoryRow) {
    const intent = await phone.shop.prepareActivation(row.item);
    if (!intent) {return;}
    dialog.value = { intent, item: row.item, parameters: {}, permanentConfirm: false };
}

async function openDeactivation(row: TavernShopActivationRow) {
    const intent = await phone.shop.prepareDeactivation(row.item, row.activation);
    if (!intent) {return;}
    dialog.value = { intent, item: row.item, parameters: {}, permanentConfirm: false };
}

async function confirmDialog() {
    const current = dialog.value;
    if (!current) {return;}
    if (current.intent.kind === 'purchase') {
        if (await phone.shop.purchase(current.intent)) {closeDialog();}
        return;
    }
    if (current.intent.kind === 'deactivate') {
        if (await phone.shop.deactivate(current.intent)) {closeDialog();}
        return;
    }
    if (current.item.duration.kind === 'permanent' && !current.permanentConfirm) {
        current.permanentConfirm = true;
        phone.shop.actionError.value = '';
        return;
    }
    if (await phone.shop.activate(current.intent, current.parameters)) {closeDialog();}
}

watch(() => session.selectedSessionId.value, closeDialog);
</script>

<template>
  <section
    v-if="knownRoute"
    class="tavern-phone-app tavern-shop-app"
  >
    <header class="tavern-shop-head">
      <div>
        <small>规则当铺</small>
        <h2>商店</h2>
      </div>
      <button
        type="button"
        class="tavern-shop-balance"
        :title="phone.wallet.balanceError.value || '打开钱包'"
        @click="phone.openWallet"
      >
        <span>小白币</span>
        <strong>{{ balanceLabel }}</strong>
      </button>
    </header>

    <nav
      class="tavern-shop-tabs"
      aria-label="规则当铺页面"
    >
      <button
        type="button"
        :class="{ 'is-active': activePath === SHOP_SHELF_PATH }"
        :aria-current="activePath === SHOP_SHELF_PATH ? 'page' : undefined"
        @click="showPath(SHOP_SHELF_PATH)"
      >
        货架
      </button>
      <button
        type="button"
        :class="{ 'is-active': activePath === SHOP_INVENTORY_PATH }"
        :aria-current="activePath === SHOP_INVENTORY_PATH ? 'page' : undefined"
        @click="showPath(SHOP_INVENTORY_PATH)"
      >
        背包
        <i v-if="inventoryCount">{{ inventoryCount > 99 ? '99+' : inventoryCount }}</i>
      </button>
    </nav>

    <div
      v-if="phone.shop.status.value"
      class="tavern-shop-status"
      role="status"
    >
      {{ phone.shop.status.value }}
    </div>

    <TavernShopShelf
      v-if="activePath === SHOP_SHELF_PATH"
      :rows="phone.shop.shelfItems.value"
      :loading="phone.shop.loading.value"
      :error="phone.shop.loadError.value"
      :busy-action="phone.shop.busyAction.value"
      :purchase-blocked-reason="phone.shop.purchaseBlockedReason"
      @purchase="openPurchase"
      @retry="phone.shop.refreshShop"
    />
    <TavernShopInventory
      v-else
      :active="phone.shop.activeItems.value"
      :held="phone.shop.heldItems.value"
      :exhausted="phone.shop.exhaustedItems.value"
      :loading="phone.shop.loading.value"
      :error="phone.shop.loadError.value"
      :blocked-reason="phone.shop.interactionBlockedReason.value"
      :busy-action="phone.shop.busyAction.value"
      @activate="openActivation"
      @deactivate="openDeactivation"
      @retry="phone.shop.refreshShop"
    />
  </section>

  <section
    v-else
    class="tavern-phone-app tavern-phone-route-missing"
  >
    <strong>规则当铺的门牌不见了</strong>
    <p>返回货架后再试一次。</p>
    <button
      type="button"
      @click="showPath(SHOP_SHELF_PATH)"
    >
      返回货架
    </button>
  </section>

  <TavernShopActionDialog
    v-if="dialog"
    v-model:parameters="dialog.parameters"
    :intent="dialog.intent"
    :item="dialog.item"
    :known-target-names="phone.shop.knownTargetNames.value"
    :permanent-confirm="dialog.permanentConfirm"
    :busy="!!phone.shop.busyAction.value"
    :error="phone.shop.actionError.value"
    @cancel="closeDialog"
    @confirm="confirmDialog"
  />
</template>
