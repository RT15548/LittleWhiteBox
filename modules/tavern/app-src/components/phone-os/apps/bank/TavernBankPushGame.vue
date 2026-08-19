<script setup lang="ts">
import { computed } from 'vue';
import { useTavernPhoneContext } from '../../../tavern-app-context';
import { TAVERN_PHONE_BANK_APP_ID } from '../../../../features/phone-os/phone-os-types';
import type { TavernBankPushGameView } from '../../../../../shared/bank/bank-types';
import {
    projectTavernBankActivityRow,
    tavernBankProbabilityLabel,
} from '../../../../features/phone-os/apps/bank/tavern-bank-presentation';
import { TAVERN_BANK_FLOOR_PATH } from './bank-routes';

const phone = useTavernPhoneContext();

const game = computed<TavernBankPushGameView | null>(() => {
    const active = phone.bank.activeGame.value;
    return active && active.kind === 'push' ? active : null;
});
const outcome = computed(() => {
    const record = phone.bank.lastGameOutcome.value;
    if (!record || record.detail.kind !== 'push') {return null;}
    const detail = record.detail;
    const row = projectTavernBankActivityRow(record);
    const won = detail.outcome !== 'busted';
    return {
        won,
        headline: detail.outcome === 'busted'
            ? '踩雷 · 彩池归零'
            : detail.outcome === 'cleared'
                ? '清盘 · 全揭开' : '收手落袋',
        revealedCoins: detail.revealedCoins,
        netLabel: row.netLabel,
        positive: row.positive,
        negative: row.negative,
    };
});
const busy = computed(() => !!phone.bank.busyAction.value);
const blockedReason = computed(() => phone.bank.interactionBlockedReason.value);
const canDraw = computed(() => !!game.value && game.value.remainingCards > 0);
const canCashOut = computed(() => !!game.value && game.value.cashoutAmount > 0);
const bombLabel = computed(() => (
    game.value ? tavernBankProbabilityLabel(game.value.nextBombProbabilityBps) : '0%'
));

async function draw() {
    const current = game.value;
    if (!current || !canDraw.value) {return;}
    await phone.bank.drawPush(current.id);
}

async function cashOut() {
    const current = game.value;
    if (!current || !canCashOut.value) {return;}
    await phone.bank.cashOutPush(current.id);
}

function backToFloor() {
    phone.bank.clearGameOutcome();
    phone.os.replaceAppRoute(TAVERN_PHONE_BANK_APP_ID, TAVERN_BANK_FLOOR_PATH);
}
</script>

<template>
  <div class="tavern-bank-scroll tavern-bank-game">
    <header class="tavern-bank-game-head">
      <button
        type="button"
        class="tavern-bank-game-back"
        @click="backToFloor"
      >
        返回牌桌
      </button>
      <h2>翻倍或收手</h2>
    </header>

    <template v-if="game">
      <section class="tavern-bank-push-stage">
        <div class="tavern-bank-push-pot">
          <small>当前彩池</small>
          <strong>{{ game.cashoutAmount }}</strong>
          <span>币 · 已揭开 {{ game.revealedCoins }} 张金币</span>
        </div>
        <dl class="tavern-bank-push-meta">
          <div>
            <dt>牌堆剩余</dt>
            <dd>{{ game.remainingCards }} 张</dd>
          </div>
          <div>
            <dt>其中炸雷</dt>
            <dd>{{ game.remainingBombs }} 张</dd>
          </div>
          <div :class="{ 'is-hot': game.nextBombProbabilityBps >= 5000 }">
            <dt>下一张踩雷</dt>
            <dd>{{ bombLabel }}</dd>
          </div>
        </dl>
        <p class="tavern-bank-game-note">
          入场 {{ game.bet }} 币。再翻一张金币就把彩池垫高；翻到雷，彩池归零。
        </p>
      </section>

      <div class="tavern-bank-push-actions">
        <button
          type="button"
          class="tavern-bank-push-draw"
          :disabled="busy || !canDraw || !!blockedReason"
          @click="draw"
        >
          再翻一张
        </button>
        <button
          type="button"
          class="tavern-bank-push-cash"
          :disabled="busy || !canCashOut || !!blockedReason"
          @click="cashOut"
        >
          收手 · 落袋 {{ game.cashoutAmount }} 币
        </button>
      </div>

      <div
        v-if="phone.bank.actionError.value"
        class="tavern-bank-floor-error"
        role="status"
      >
        {{ phone.bank.actionError.value }}
      </div>
    </template>

    <section
      v-else
      class="tavern-bank-game-settled"
    >
      <template v-if="outcome">
        <strong :class="outcome.won ? 'is-win' : 'is-loss'">
          {{ outcome.headline }}
        </strong>
        <p
          class="tavern-bank-outcome-net"
          :class="{ 'is-positive': outcome.positive, 'is-negative': outcome.negative }"
        >
          结算 {{ outcome.netLabel }} 币
        </p>
        <p class="tavern-bank-outcome-detail">
          共揭开 {{ outcome.revealedCoins }} 张金币。
        </p>
      </template>
      <template v-else>
        <strong>这局已经结算</strong>
        <p>结果已记进「记录」。再入一场，或回牌桌换个玩法。</p>
      </template>
      <button
        type="button"
        @click="backToFloor"
      >
        返回牌桌
      </button>
    </section>
  </div>
</template>
