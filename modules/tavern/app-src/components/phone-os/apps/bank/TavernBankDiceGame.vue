<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useTavernPhoneContext } from '../../../tavern-app-context';
import { TAVERN_PHONE_BANK_APP_ID } from '../../../../features/phone-os/phone-os-types';
import type { TavernBankBidFace, TavernBankDiceBid, TavernBankDiceGameView } from '../../../../../shared/bank/bank-types';
import {
    projectTavernBankActivityRow,
    projectTavernBankDiceBidEvidence,
} from '../../../../features/phone-os/apps/bank/tavern-bank-presentation';
import { TAVERN_BANK_FLOOR_PATH } from './bank-routes';

const phone = useTavernPhoneContext();

const game = computed<TavernBankDiceGameView | null>(() => {
    const active = phone.bank.activeGame.value;
    return active && active.kind === 'dice' ? active : null;
});
const outcome = computed(() => {
    const record = phone.bank.lastGameOutcome.value;
    if (!record || record.detail.kind !== 'dice') {return null;}
    const detail = record.detail;
    const row = projectTavernBankActivityRow(record);
    return {
        won: detail.result === 'player-win',
        netLabel: row.netLabel,
        positive: row.positive,
        negative: row.negative,
        challengerLabel: detail.challenger === 'player' ? '你开牌质疑' : '庄家开牌质疑',
        finalBid: detail.finalBid,
        playerDice: detail.playerDice,
        dealerDice: detail.dealerDice,
    };
});
const lastBid = computed<TavernBankDiceBid | null>(() => {
    const bids = game.value?.bids ?? [];
    return bids.length ? bids[bids.length - 1] : null;
});
const canChallenge = computed(() => !!lastBid.value);
const busy = computed(() => !!phone.bank.busyAction.value);
const blockedReason = computed(() => phone.bank.interactionBlockedReason.value);

const bidCount = ref(1);
const bidFace = ref(2);

function isHigher(count: number, face: number, base: TavernBankDiceBid | null): boolean {
    if (!base) {return count >= 1 && face >= 2;}
    return count > base.count || (count === base.count && face > base.face);
}

function firstLegalBid(base: TavernBankDiceBid | null): { count: number; face: number } {
    if (!base) {return { count: 1, face: 2 };}
    if (base.face < 6) {return { count: base.count, face: base.face + 1 };}
    if (base.count < 10) {return { count: base.count + 1, face: 2 };}
    return { count: 10, face: 6 };
}

watch(lastBid, (bid) => {
    const seed = firstLegalBid(bid);
    bidCount.value = seed.count;
    bidFace.value = seed.face;
}, { immediate: true });

const bidValid = computed(() => (
    !!game.value && isHigher(bidCount.value, bidFace.value, lastBid.value)
    && bidCount.value <= 10 && bidFace.value >= 2 && bidFace.value <= 6
));
const bidEvidence = computed(() => {
    const current = game.value;
    if (!current) {return { knownMatches: 0, dealerMinimum: 0 };}
    return projectTavernBankDiceBidEvidence({
        playerDice: current.playerDice,
        count: bidCount.value,
        face: bidFace.value as TavernBankBidFace,
    });
});

function adjustCount(delta: number) {
    bidCount.value = Math.max(1, Math.min(10, bidCount.value + delta));
}

function adjustFace(delta: number) {
    bidFace.value = Math.max(2, Math.min(6, bidFace.value + delta));
}

async function submitBid() {
    const current = game.value;
    if (!current || !bidValid.value) {return;}
    await phone.bank.bidDice(current.id, bidCount.value, bidFace.value);
}

async function challenge() {
    const current = game.value;
    if (!current || !canChallenge.value) {return;}
    await phone.bank.challengeDice(current.id);
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
      <h2>骰局吹牛</h2>
    </header>

    <template v-if="game">
      <section class="tavern-bank-game-stage">
        <div class="tavern-bank-dice-row">
          <span>你的暗骰</span>
          <div class="tavern-bank-dice-pips">
            <b
              v-for="(die, index) in game.playerDice"
              :key="index"
            >{{ die }}</b>
          </div>
        </div>
        <p class="tavern-bank-game-note">
          庄家的骰子始终扣着。1 点为百搭，可充当任意点数。注额 {{ game.bet }} 币。
        </p>
      </section>

      <section class="tavern-bank-dice-history">
        <header>叫注记录</header>
        <ol v-if="game.bids.length">
          <li
            v-for="(bid, index) in game.bids"
            :key="index"
            :class="{ 'is-dealer': bid.by === 'dealer' }"
          >
            <span>{{ bid.by === 'dealer' ? '庄家' : '你' }}</span>
            <strong>{{ bid.count }} 个 {{ bid.face }}</strong>
          </li>
        </ol>
        <p v-else>
          还没有人叫注。由你开第一口。
        </p>
      </section>

      <section class="tavern-bank-dice-controls">
        <div class="tavern-bank-dice-picker">
          <label>
            <span>数量</span>
            <div class="tavern-bank-amount-field">
              <button
                type="button"
                :disabled="busy"
                aria-label="减少数量"
                @click="adjustCount(-1)"
              >
                -
              </button>
              <strong>{{ bidCount }}</strong>
              <button
                type="button"
                :disabled="busy"
                aria-label="增加数量"
                @click="adjustCount(1)"
              >
                +
              </button>
            </div>
          </label>
          <label>
            <span>点数</span>
            <div class="tavern-bank-amount-field">
              <button
                type="button"
                :disabled="busy"
                aria-label="减少点数"
                @click="adjustFace(-1)"
              >
                -
              </button>
              <strong>{{ bidFace }}</strong>
              <button
                type="button"
                :disabled="busy"
                aria-label="增加点数"
                @click="adjustFace(1)"
              >
                +
              </button>
            </div>
          </label>
        </div>

        <div class="tavern-bank-dice-evidence">
          <span>手中已知匹配 <strong>{{ bidEvidence.knownMatches }}</strong> 枚</span>
          <span>庄家至少需要 <strong>{{ bidEvidence.dealerMinimum }}</strong> 枚</span>
        </div>

        <p
          v-if="lastBid"
          class="tavern-bank-dice-floor"
        >
          需高于「{{ lastBid.count }} 个 {{ lastBid.face }}」：先加数量，或同数量抬高点数。
        </p>

        <div class="tavern-bank-dice-actions">
          <button
            type="button"
            class="tavern-bank-dice-bid"
            :disabled="busy || !bidValid || !!blockedReason"
            @click="submitBid"
          >
            叫注 {{ bidCount }} 个 {{ bidFace }}
          </button>
          <button
            type="button"
            class="tavern-bank-dice-challenge"
            :disabled="busy || !canChallenge || !!blockedReason"
            @click="challenge"
          >
            开牌质疑
          </button>
        </div>
      </section>

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
          {{ outcome.won ? '你赢下这局' : '庄家赢了这局' }}
        </strong>
        <p
          class="tavern-bank-outcome-net"
          :class="{ 'is-positive': outcome.positive, 'is-negative': outcome.negative }"
        >
          结算 {{ outcome.netLabel }} 币
        </p>
        <div class="tavern-bank-outcome-dice">
          <div>
            <span>你的骰</span>
            <div class="tavern-bank-dice-pips">
              <b
                v-for="(die, index) in outcome.playerDice"
                :key="'p' + index"
              >{{ die }}</b>
            </div>
          </div>
          <div>
            <span>庄家骰</span>
            <div class="tavern-bank-dice-pips is-dealer">
              <b
                v-for="(die, index) in outcome.dealerDice"
                :key="'d' + index"
              >{{ die }}</b>
            </div>
          </div>
        </div>
        <p class="tavern-bank-outcome-detail">
          {{ outcome.challengerLabel }} · 终注「{{ outcome.finalBid.count }} 个 {{ outcome.finalBid.face }}」
        </p>
      </template>
      <template v-else>
        <strong>这局已经结算</strong>
        <p>结果已记进「记录」。再开一局，或回牌桌换个玩法。</p>
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
