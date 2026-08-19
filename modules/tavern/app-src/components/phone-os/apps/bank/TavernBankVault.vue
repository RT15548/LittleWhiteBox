<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    useTavernPhoneContext,
    useTavernSessionContext,
} from '../../../tavern-app-context';
import type { TavernBankDepositView } from '../../../../../shared/bank/bank-types';
import {
    projectTavernBankPositions,
    type TavernBankDepositProductRow,
    type TavernBankFundProductRow,
} from '../../../../features/phone-os/apps/bank/tavern-bank-presentation';
import TavernBankActionDialog, { type TavernBankDialogState } from './TavernBankActionDialog.vue';

const phone = useTavernPhoneContext();
const session = useTavernSessionContext();
const dialog = ref<TavernBankDialogState | null>(null);

const deposits = computed(() => phone.bank.deposits.value);
const investments = computed(() => phone.bank.investments.value);
const positions = computed(() => projectTavernBankPositions(deposits.value, investments.value));
const positionCount = computed(() => positions.value.length);

function openDepositDialog(product: TavernBankDepositProductRow) {
    phone.bank.actionError.value = '';
    dialog.value = { kind: 'deposit', product, amount: product.product.minAmount };
}

function openFundDialog(product: TavernBankFundProductRow) {
    phone.bank.actionError.value = '';
    dialog.value = { kind: 'fund', product, amount: product.product.minAmount };
}

function openWithdrawDialog(deposit: TavernBankDepositView) {
    phone.bank.actionError.value = '';
    dialog.value = { kind: 'withdraw', deposit };
}

function closeDialog() {
    dialog.value = null;
    phone.bank.actionError.value = '';
}

function updateAmount(amount: number) {
    const current = dialog.value;
    if (!current || current.kind === 'withdraw') {return;}
    current.amount = amount;
}

async function confirmDialog() {
    const current = dialog.value;
    if (!current) {return;}
    if (current.kind === 'deposit') {
        if (await phone.bank.openDeposit(current.product.product.id, current.amount)) {closeDialog();}
        return;
    }
    if (current.kind === 'fund') {
        if (await phone.bank.openFund(current.product.product.id, current.amount)) {closeDialog();}
        return;
    }
    if (await phone.bank.withdrawDeposit(current.deposit.id)) {closeDialog();}
}

watch(() => session.selectedSessionId.value, closeDialog);
watch(deposits, (nextDeposits) => {
    const current = dialog.value;
    if (!current || current.kind !== 'withdraw') {return;}
    const next = nextDeposits.find((deposit) => deposit.id === current.deposit.id);
    if (next) {
        dialog.value = { kind: 'withdraw', deposit: next };
    } else {
        closeDialog();
    }
});
</script>

<template>
  <div class="tavern-bank-scroll">
    <div
      v-if="phone.bank.loading.value && !positionCount"
      class="tavern-bank-loading"
    >
      <span />
      <span />
      <span />
    </div>

    <div
      v-else-if="phone.bank.loadError.value"
      class="tavern-bank-notice"
    >
      <strong>金库状态读取失败</strong>
      <p>{{ phone.bank.loadError.value }}</p>
      <button
        type="button"
        @click="phone.bank.refreshBank"
      >
        重试
      </button>
    </div>

    <template v-else>
      <section class="tavern-bank-section">
        <header>
          <span>我的持仓</span>
          <i>{{ positionCount }} 笔</i>
        </header>

        <p
          v-if="!positionCount"
          class="tavern-bank-empty-copy"
        >
          还没有存单或理财。从下方产品开一笔，本金会随主回合推进走向到期。
        </p>

        <div
          v-else
          class="tavern-bank-position-list"
        >
          <template
            v-for="position in positions"
            :key="position.id"
          >
            <article
              v-if="position.kind === 'deposit'"
              class="tavern-bank-position is-deposit"
              :class="{ 'is-matured': position.quote.matured }"
            >
              <header>
                <div>
                  <small>定期存单</small>
                  <h3>{{ position.deposit.name }}</h3>
                </div>
                <strong>{{ position.deposit.principal }} 币</strong>
              </header>
              <dl>
                <div>
                  <dt>到期返还</dt>
                  <dd>{{ position.deposit.maturityAmount }} 币</dd>
                </div>
                <div>
                  <dt>剩余</dt>
                  <dd>{{ position.remainingRounds > 0 ? `${position.remainingRounds} 回合` : '已到期' }}</dd>
                </div>
              </dl>
              <footer>
                <span>{{ position.quote.matured ? '到期可领' : '现取' }} {{ position.quote.amountLabel }}</span>
                <button
                  type="button"
                  :disabled="!!phone.bank.busyAction.value"
                  @click="openWithdrawDialog(position.deposit)"
                >
                  {{ position.quote.actionLabel }}
                </button>
              </footer>
            </article>

            <article
              v-else
              class="tavern-bank-position is-fund"
            >
              <header>
                <div>
                  <small>理财份额</small>
                  <h3>{{ position.fund.name }}</h3>
                </div>
                <strong>{{ position.fund.principal }} 币</strong>
              </header>
              <p>{{ position.fund.description }}</p>
              <dl>
                <div>
                  <dt>剩余</dt>
                  <dd>{{ position.remainingRounds > 0 ? `${position.remainingRounds} 回合` : '待结算' }}</dd>
                </div>
                <div>
                  <dt>状态</dt>
                  <dd>锁定至到期</dd>
                </div>
              </dl>
            </article>
          </template>
        </div>
      </section>

      <section class="tavern-bank-section">
        <header>
          <span>定期存单</span>
          <i>到期计息</i>
        </header>
        <div class="tavern-bank-product-list">
          <article
            v-for="row in phone.bank.depositProducts"
            :key="row.product.id"
            class="tavern-bank-product"
          >
            <header>
              <h3>{{ row.product.name }}</h3>
              <span>{{ row.lockLabel }}</span>
            </header>
            <ul>
              <li>{{ row.interestLabel }}</li>
              <li>{{ row.penaltyLabel }}</li>
              <li>{{ row.amountLabel }}</li>
            </ul>
            <button
              type="button"
              :disabled="!!phone.bank.busyAction.value"
              @click="openDepositDialog(row)"
            >
              存入
            </button>
          </article>
        </div>
      </section>

      <section class="tavern-bank-section">
        <header>
          <span>理财份额</span>
          <i>到期随机结算</i>
        </header>
        <div class="tavern-bank-product-list">
          <article
            v-for="row in phone.bank.fundProducts"
            :key="row.product.id"
            class="tavern-bank-product is-fund"
          >
            <header>
              <h3>{{ row.product.name }}</h3>
              <span>{{ row.riskLabel }}</span>
            </header>
            <p>{{ row.product.description }}</p>
            <ul>
              <li>{{ row.lockLabel }}</li>
              <li>{{ row.returnLabel }}</li>
              <li>{{ row.amountLabel }}</li>
            </ul>
            <button
              type="button"
              :disabled="!!phone.bank.busyAction.value"
              @click="openFundDialog(row)"
            >
              买入
            </button>
          </article>
        </div>
      </section>
    </template>
  </div>

  <TavernBankActionDialog
    v-if="dialog"
    :dialog="dialog"
    :balance="phone.wallet.balance.value"
    :busy="!!phone.bank.busyAction.value"
    :blocked-reason="phone.bank.interactionBlockedReason.value"
    :error="phone.bank.actionError.value"
    @update:amount="updateAmount"
    @cancel="closeDialog"
    @confirm="confirmDialog"
  />
</template>
