<script setup lang="ts">
import { computed } from 'vue';
import { useTavernPhoneContext } from '../../../tavern-app-context';
import { TAVERN_PHONE_BANK_APP_ID } from '../../../../features/phone-os/phone-os-types';
import {
    TAVERN_BANK_FLOOR_PATH,
    TAVERN_BANK_RECORDS_PATH,
    TAVERN_BANK_VAULT_PATH,
    TAVERN_BANK_DICE_PATH,
    TAVERN_BANK_PUSH_PATH,
    TAVERN_BANK_LADDER_PATH,
    TAVERN_BANK_KNOWN_PATHS,
} from './bank-routes';
import TavernBankVault from './TavernBankVault.vue';
import TavernBankFloor from './TavernBankFloor.vue';
import TavernBankRecords from './TavernBankRecords.vue';
import TavernBankDiceGame from './TavernBankDiceGame.vue';
import TavernBankPushGame from './TavernBankPushGame.vue';
import TavernBankLadderGame from './TavernBankLadderGame.vue';

const phone = useTavernPhoneContext();

const activePath = computed(() => (
    phone.os.activeRoute.value.kind === 'app' ? phone.os.activeRoute.value.path : ''
));
const knownRoute = computed(() => TAVERN_BANK_KNOWN_PATHS.includes(activePath.value));
const onFloorRoute = computed(() => activePath.value.startsWith(TAVERN_BANK_FLOOR_PATH));
const balanceLabel = computed(() => {
    if (phone.wallet.balanceLoading.value && !phone.wallet.balanceReady.value) {return '清点中';}
    if (!phone.wallet.balanceReady.value) {return '不可用';}
    return String(phone.wallet.balance.value);
});

function showPath(path: string) {
    phone.os.replaceAppRoute(TAVERN_PHONE_BANK_APP_ID, path);
}
</script>

<template>
  <section
    v-if="knownRoute"
    class="tavern-phone-app tavern-bank-app"
  >
    <header class="tavern-bank-head">
      <h2>银行</h2>
      <button
        type="button"
        class="tavern-bank-balance"
        :title="phone.wallet.balanceError.value || '打开钱包'"
        @click="phone.openWallet"
      >
        <span>小白币</span>
        <strong>{{ balanceLabel }}</strong>
      </button>
    </header>

    <nav
      class="tavern-bank-tabs"
      aria-label="银行页面"
    >
      <button
        type="button"
        :class="{ 'is-active': activePath === TAVERN_BANK_VAULT_PATH }"
        :aria-current="activePath === TAVERN_BANK_VAULT_PATH ? 'page' : undefined"
        @click="showPath(TAVERN_BANK_VAULT_PATH)"
      >
        金库
      </button>
      <button
        type="button"
        :class="{ 'is-active': onFloorRoute }"
        :aria-current="onFloorRoute ? 'page' : undefined"
        @click="showPath(TAVERN_BANK_FLOOR_PATH)"
      >
        牌局
      </button>
      <button
        type="button"
        :class="{ 'is-active': activePath === TAVERN_BANK_RECORDS_PATH }"
        :aria-current="activePath === TAVERN_BANK_RECORDS_PATH ? 'page' : undefined"
        @click="showPath(TAVERN_BANK_RECORDS_PATH)"
      >
        记录
      </button>
    </nav>

    <div
      v-if="phone.bank.status.value"
      class="tavern-bank-status"
      role="status"
    >
      {{ phone.bank.status.value }}
    </div>

    <TavernBankVault v-if="activePath === TAVERN_BANK_VAULT_PATH" />
    <TavernBankFloor v-else-if="activePath === TAVERN_BANK_FLOOR_PATH" />
    <TavernBankRecords v-else-if="activePath === TAVERN_BANK_RECORDS_PATH" />
    <TavernBankDiceGame v-else-if="activePath === TAVERN_BANK_DICE_PATH" />
    <TavernBankPushGame v-else-if="activePath === TAVERN_BANK_PUSH_PATH" />
    <TavernBankLadderGame v-else-if="activePath === TAVERN_BANK_LADDER_PATH" />
  </section>

  <section
    v-else
    class="tavern-phone-app tavern-phone-route-missing"
  >
    <strong>银行的门牌不见了</strong>
    <p>回到金库后再试一次。</p>
    <button
      type="button"
      @click="showPath(TAVERN_BANK_VAULT_PATH)"
    >
      返回金库
    </button>
  </section>
</template>
