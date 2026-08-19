<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import {
    projectTavernBankDepositWithdrawalQuote,
    type TavernBankDepositProductRow,
    type TavernBankFundProductRow,
} from '../../../../features/phone-os/apps/bank/tavern-bank-presentation';
import type { TavernBankDepositView } from '../../../../../shared/bank/bank-types';

export type TavernBankDialogState =
    | { kind: 'deposit'; product: TavernBankDepositProductRow; amount: number }
    | { kind: 'fund'; product: TavernBankFundProductRow; amount: number }
    | { kind: 'withdraw'; deposit: TavernBankDepositView };

const props = defineProps<{
    dialog: TavernBankDialogState;
    balance: number;
    busy: boolean;
    blockedReason: string;
    error: string;
}>();

const emit = defineEmits<{
    (event: 'update:amount', amount: number): void;
    (event: 'confirm'): void;
    (event: 'cancel'): void;
}>();

const cancelRef = ref<HTMLButtonElement | null>(null);
let returnFocus: HTMLElement | null = null;

const amountBounds = computed(() => {
    if (props.dialog.kind === 'withdraw') {return null;}
    return {
        min: props.dialog.product.product.minAmount,
        max: props.dialog.product.product.maxAmount,
    };
});

const withdrawalQuote = computed(() => (
    props.dialog.kind === 'withdraw'
        ? projectTavernBankDepositWithdrawalQuote(props.dialog.deposit)
        : null
));

const title = computed(() => {
    if (props.dialog.kind === 'deposit') {return `存入「${props.dialog.product.product.name}」`;}
    if (props.dialog.kind === 'fund') {return `买入「${props.dialog.product.product.name}」`;}
    return withdrawalQuote.value?.matured
        ? `领取「${props.dialog.deposit.name}」到期本息`
        : `提前支取「${props.dialog.deposit.name}」？`;
});

const eyebrow = computed(() => {
    if (props.dialog.kind === 'deposit') {return '定期存单';}
    if (props.dialog.kind === 'fund') {return '理财份额';}
    return withdrawalQuote.value?.matured ? '到期领取' : '提前支取';
});

const message = computed(() => {
    if (props.dialog.kind === 'deposit') {
        return '存入后本金锁定到期，主回合推进即视作时间流逝。提前支取会扣除罚息。';
    }
    if (props.dialog.kind === 'fund') {
        return '买入后份额锁定到期，回报在到期时按区间随机结算，过程不可提前赎回。';
    }
    return withdrawalQuote.value?.matured
        ? '存单已经到期，本次会按到期本息结算并直接入账。'
        : '提前支取会立即结算，按当前折损返还，且不再计息。';
});

const confirmText = computed(() => {
    if (props.busy) {return '正在落账';}
    if (props.blockedReason) {return '暂不可提交';}
    if (props.dialog.kind === 'withdraw') {
        return `${withdrawalQuote.value?.matured ? '领取' : '支取'} ${withdrawalQuote.value?.amount ?? 0} 币`;
    }
    return `支付 ${props.dialog.amount} 币`;
});

const overBalance = computed(() => (
    props.dialog.kind !== 'withdraw' && props.dialog.amount > props.balance
));

function clampAmount(next: number): number {
    const bounds = amountBounds.value;
    if (!bounds) {return next;}
    if (!Number.isFinite(next)) {return bounds.min;}
    return Math.max(bounds.min, Math.min(bounds.max, Math.floor(next)));
}

function updateAmount(raw: string) {
    emit('update:amount', clampAmount(Number(raw)));
}

function nudgeAmount(delta: number) {
    if (props.dialog.kind === 'withdraw') {return;}
    emit('update:amount', clampAmount(props.dialog.amount + delta));
}

function confirm(): void {
    if (props.busy || props.blockedReason || overBalance.value) {return;}
    emit('confirm');
}

function handleEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || props.busy) {return;}
    event.preventDefault();
    event.stopImmediatePropagation();
    emit('cancel');
}

onMounted(async () => {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.addEventListener('keydown', handleEscape, true);
    await nextTick();
    const firstInput = document.querySelector<HTMLInputElement>('[data-tavern-phone-modal="bank-action"] input');
    (firstInput || cancelRef.value)?.focus({ preventScroll: true });
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscape, true);
    if (returnFocus?.isConnected) {
        try {returnFocus.focus({ preventScroll: true });} catch {returnFocus.focus();}
    }
});
</script>

<template>
  <Teleport to="body">
    <div
      class="tavern-bank-dialog-backdrop"
      data-tavern-phone-modal="bank-action"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="tavern-bank-dialog-title"
      @click.self="!busy && emit('cancel')"
    >
      <form
        class="tavern-bank-dialog"
        :class="{ 'is-withdraw': dialog.kind === 'withdraw' }"
        @submit.prevent="confirm"
      >
        <header>
          <span>{{ eyebrow }}</span>
          <strong id="tavern-bank-dialog-title">{{ title }}</strong>
        </header>
        <p>{{ message }}</p>

        <div
          v-if="dialog.kind !== 'withdraw'"
          class="tavern-bank-dialog-amount"
        >
          <label>
            <span>存入金额</span>
            <div class="tavern-bank-amount-field">
              <button
                type="button"
                :disabled="busy"
                aria-label="减少金额"
                @click="nudgeAmount(-dialog.product.product.minAmount)"
              >
                -
              </button>
              <input
                :value="dialog.amount"
                type="number"
                inputmode="numeric"
                :min="dialog.product.product.minAmount"
                :max="dialog.product.product.maxAmount"
                step="1"
                @input="updateAmount(($event.target as HTMLInputElement).value)"
              >
              <button
                type="button"
                :disabled="busy"
                aria-label="增加金额"
                @click="nudgeAmount(dialog.product.product.minAmount)"
              >
                +
              </button>
            </div>
          </label>
          <small>{{ dialog.product.amountLabel }}</small>
        </div>

        <dl class="tavern-bank-dialog-receipt">
          <div v-if="dialog.kind === 'deposit'">
            <dt>锁定</dt>
            <dd>{{ dialog.product.lockLabel }}</dd>
          </div>
          <div v-if="dialog.kind === 'deposit'">
            <dt>利息</dt>
            <dd>{{ dialog.product.interestLabel }}</dd>
          </div>
          <div v-if="dialog.kind === 'deposit'">
            <dt>罚息</dt>
            <dd>{{ dialog.product.penaltyLabel }}</dd>
          </div>
          <div v-if="dialog.kind === 'fund'">
            <dt>锁定</dt>
            <dd>{{ dialog.product.lockLabel }}</dd>
          </div>
          <div v-if="dialog.kind === 'fund'">
            <dt>波动</dt>
            <dd>{{ dialog.product.riskLabel }}</dd>
          </div>
          <div v-if="dialog.kind === 'fund'">
            <dt>回报</dt>
            <dd>{{ dialog.product.returnLabel }}</dd>
          </div>
          <div v-if="dialog.kind === 'withdraw'">
            <dt>本金</dt>
            <dd>{{ dialog.deposit.principal }} 币</dd>
          </div>
          <div v-if="dialog.kind === 'withdraw'">
            <dt>到期</dt>
            <dd>{{ dialog.deposit.maturityAmount }} 币</dd>
          </div>
          <div v-if="dialog.kind === 'withdraw'">
            <dt>{{ withdrawalQuote?.matured ? '到期领取' : '现取' }}</dt>
            <dd>{{ withdrawalQuote?.amountLabel }}</dd>
          </div>
        </dl>

        <div
          v-if="blockedReason || error || overBalance"
          class="tavern-bank-dialog-error"
          role="status"
        >
          {{ blockedReason || error || '余额不足以支付这笔存入。' }}
        </div>

        <footer>
          <button
            ref="cancelRef"
            type="button"
            :disabled="busy"
            @click="emit('cancel')"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="busy || !!blockedReason || overBalance"
          >
            {{ confirmText }}
          </button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>
