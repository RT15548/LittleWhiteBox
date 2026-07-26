<script setup lang="ts">
import { computed } from 'vue';
import { useTavernPhoneContext } from '../../../tavern-app-context';
import { TAVERN_PHONE_BANK_APP_ID } from '../../../../features/phone-os/phone-os-types';
import type { TavernBankLadderChoice, TavernBankLadderGameView } from '../../../../../shared/bank/bank-types';
import {
    projectTavernBankActivityRow,
    projectTavernBankActiveLadderTrack,
    tavernBankLadderChoiceLabel,
    tavernBankProbabilityLabel,
    TAVERN_BANK_LADDER_BET_META,
} from '../../../../features/phone-os/apps/bank/tavern-bank-presentation';
import { TAVERN_BANK_FLOOR_PATH } from './bank-routes';

const phone = useTavernPhoneContext();

const game = computed<TavernBankLadderGameView | null>(() => {
    const active = phone.bank.activeGame.value;
    return active && active.kind === 'ladder' ? active : null;
});
const busy = computed(() => !!phone.bank.busyAction.value);
const blockedReason = computed(() => phone.bank.interactionBlockedReason.value);
const currentFloor = computed(() => (game.value ? game.value.completedFloors + 1 : 0));
const maxFloors = TAVERN_BANK_LADDER_BET_META.maxFloors;
const ladderTrack = computed(() => game.value ? projectTavernBankActiveLadderTrack(game.value) : []);
const outcome = computed(() => {
    const record = phone.bank.lastGameOutcome.value;
    if (!record || record.detail.kind !== 'ladder') {return null;}
    const detail = record.detail;
    const row = projectTavernBankActivityRow(record);
    const floors = Array.from({ length: maxFloors }, (unused, index) => {
        const step = detail.steps.find((entry) => entry.floor === index + 1) || null;
        return {
            floor: index + 1,
            played: !!step,
            success: step ? step.success : null,
            choiceLabel: step ? tavernBankLadderChoiceLabel(step.choice) : '',
            amount: step ? step.amountAfterStep : null,
        };
    });
    return {
        won: detail.outcome !== 'failed',
        headline: detail.outcome === 'failed'
            ? '跌落阶梯 · 清零'
            : detail.outcome === 'capped'
                ? '触顶封顶 · 落袋'
                : detail.outcome === 'cleared'
                    ? '登顶清盘' : '落袋为安',
        netLabel: row.netLabel,
        positive: row.positive,
        negative: row.negative,
        floors,
    };
});

async function step(choice: TavernBankLadderChoice) {
    const current = game.value;
    if (!current) {return;}
    await phone.bank.stepLadder(current.id, choice);
}

async function cashOut() {
    const current = game.value;
    if (!current || !current.canCashOut) {return;}
    await phone.bank.cashOutLadder(current.id);
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
      <h2>风险阶梯</h2>
    </header>

    <template v-if="game">
      <section class="tavern-bank-ladder-stage">
        <div class="tavern-bank-ladder-pot">
          <small>已累积彩池</small>
          <strong>{{ game.cashoutAmount }}</strong>
          <span>币 · 注额 {{ game.bet }} 币</span>
        </div>
        <p class="tavern-bank-ladder-progress">
          第 <b>{{ currentFloor }}</b> / {{ maxFloors }} 层
        </p>
      </section>

      <section class="tavern-bank-ladder-history">
        <header>五层轨迹</header>
        <ol>
          <li
            v-for="stepRow in ladderTrack"
            :key="stepRow.floor"
            :class="`is-${stepRow.status}`"
          >
            <span>第 {{ stepRow.floor }} 层</span>
            <em v-if="stepRow.status === 'completed'">{{ stepRow.choiceLabel }}</em>
            <em v-else-if="stepRow.status === 'current'">当前层</em>
            <em v-else>未登</em>
            <strong v-if="stepRow.status === 'completed'">{{ stepRow.amount }} 币</strong>
            <strong v-else-if="stepRow.status === 'current'">待选择</strong>
            <strong v-else>-</strong>
          </li>
        </ol>
      </section>

      <section class="tavern-bank-ladder-choices">
        <header>这一层怎么走</header>
        <button
          v-for="choice in game.nextChoices"
          :key="choice.choice"
          type="button"
          class="tavern-bank-ladder-choice"
          :class="`is-${choice.choice}`"
          :disabled="busy || !!blockedReason"
          @click="step(choice.choice)"
        >
          <strong>{{ tavernBankLadderChoiceLabel(choice.choice) }}</strong>
          <span>成功率 {{ tavernBankProbabilityLabel(choice.successProbabilityBps) }}</span>
          <em>成功累积至 {{ choice.successAmount }} 币</em>
        </button>
      </section>

      <button
        type="button"
        class="tavern-bank-ladder-cash"
        :disabled="busy || !game.canCashOut || !!blockedReason"
        @click="cashOut"
      >
        落袋为安 · {{ game.cashoutAmount }} 币
      </button>

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
        <ol class="tavern-bank-outcome-ladder">
          <li
            v-for="floor in outcome.floors"
            :key="floor.floor"
            :class="{
              'is-success': floor.played && floor.success,
              'is-fail': floor.played && floor.success === false,
              'is-idle': !floor.played,
            }"
          >
            <span>第 {{ floor.floor }} 层</span>
            <em v-if="floor.played">{{ floor.choiceLabel }}</em>
            <em v-else>未登</em>
            <strong v-if="floor.played && floor.success">累积 {{ floor.amount }} 币</strong>
            <strong v-else-if="floor.played">失守</strong>
            <strong v-else>-</strong>
          </li>
        </ol>
      </template>
      <template v-else>
        <strong>这局已经结算</strong>
        <p>结果已记进「记录」。再起一梯，或回牌桌换个玩法。</p>
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
