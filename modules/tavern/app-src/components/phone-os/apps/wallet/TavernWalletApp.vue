<script setup lang="ts">
import { useTavernPhoneContext } from '../../../tavern-app-context';
import TavernWalletBalanceCard from './TavernWalletBalanceCard.vue';
import TavernWalletTransactionList from './TavernWalletTransactionList.vue';

const phone = useTavernPhoneContext();
</script>

<template>
  <section class="tavern-phone-app tavern-wallet-app">
    <header class="tavern-phone-app-head tavern-wallet-head">
      <div>
        <span>剧情资产账本</span>
        <h2>钱包</h2>
      </div>
      <i aria-hidden="true">◈</i>
    </header>
    <div class="tavern-wallet-scroll">
      <TavernWalletBalanceCard
        :balance="phone.wallet.balance.value"
        :error="phone.wallet.balanceError.value"
        :loading="phone.wallet.balanceLoading.value && !phone.wallet.balanceReady.value"
        :ready="phone.wallet.balanceReady.value"
      />
      <section class="tavern-wallet-ledger">
        <header>
          <div>
            <span>Ledger</span>
            <h3>最近流水</h3>
          </div>
          <small>{{ phone.wallet.transactions.value.length }} 笔</small>
        </header>
        <div
          v-if="phone.wallet.error.value"
          class="tavern-wallet-error"
          role="status"
        >
          <p>{{ phone.wallet.error.value }}</p>
          <button
            type="button"
            @click="phone.wallet.refreshWallet"
          >
            重新读取
          </button>
        </div>
        <TavernWalletTransactionList
          v-else
          :transactions="phone.wallet.transactions.value"
          :initial-loading="phone.wallet.ledgerLoading.value"
          :loading-more="phone.wallet.loadingMore.value"
          :load-more-error="phone.wallet.loadMoreError.value"
          :has-more="phone.wallet.hasMore.value"
          @load-more="phone.wallet.loadMore"
        />
      </section>
    </div>
  </section>
</template>
