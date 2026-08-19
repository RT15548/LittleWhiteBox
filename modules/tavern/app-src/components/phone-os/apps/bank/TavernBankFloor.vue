<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTavernPhoneContext } from '../../../tavern-app-context';
import { TAVERN_PHONE_BANK_APP_ID } from '../../../../features/phone-os/phone-os-types';
import {
    TAVERN_BANK_DICE_BET_META,
    TAVERN_BANK_LADDER_BET_META,
    TAVERN_BANK_PUSH_BET_META,
    TAVERN_BANK_DICE_PAYOUT_LABEL,
} from '../../../../features/phone-os/apps/bank/tavern-bank-presentation';
import {
    TAVERN_BANK_DICE_PATH,
    TAVERN_BANK_LADDER_PATH,
    TAVERN_BANK_PUSH_PATH,
    tavernBankGamePath,
} from './bank-routes';

const phone = useTavernPhoneContext();

const diceBet = ref<number>(TAVERN_BANK_DICE_BET_META.min);
const ladderBet = ref<number>(TAVERN_BANK_LADDER_BET_META.min);

const activeGame = computed(() => phone.bank.activeGame.value);
const activeGameLabel = computed(() => {
    const game = activeGame.value;
    if (!game) {return '';}
    if (game.kind === 'dice') {return '骰局吹牛';}
    if (game.kind === 'push') {return '翻倍或收手';}
    return '风险阶梯';
});
const blockedReason = computed(() => phone.bank.interactionBlockedReason.value);
const busy = computed(() => !!phone.bank.busyAction.value);
const walletReady = computed(() => phone.wallet.balanceReady.value);
const walletBalance = computed(() => phone.wallet.balance.value);
const canAffordDice = computed(() => walletReady.value && walletBalance.value >= diceBet.value);
const canAffordPush = computed(() => walletReady.value && walletBalance.value >= TAVERN_BANK_PUSH_BET_META.bet);
const canAffordLadder = computed(() => walletReady.value && walletBalance.value >= ladderBet.value);

function wagerButtonLabel(readyLabel: string, affordable: boolean): string {
    if (!walletReady.value) {return '余额读取中';}
    return affordable ? readyLabel : '余额不足';
}

function clampBet(value: number, meta: { min: number; max: number; step: number }): number {
    if (!Number.isFinite(value)) {return meta.min;}
    const stepped = Math.round((value - meta.min) / meta.step) * meta.step + meta.min;
    return Math.max(meta.min, Math.min(meta.max, stepped));
}

function nudgeDice(delta: number) {
    diceBet.value = clampBet(diceBet.value + delta, TAVERN_BANK_DICE_BET_META);
}

function nudgeLadder(delta: number) {
    ladderBet.value = clampBet(ladderBet.value + delta, TAVERN_BANK_LADDER_BET_META);
}

function continueActiveGame() {
    const game = activeGame.value;
    if (!game) {return;}
    phone.os.replaceAppRoute(TAVERN_PHONE_BANK_APP_ID, tavernBankGamePath(game.kind));
}

async function startDice() {
    if (!canAffordDice.value) {return;}
    if (await phone.bank.startDice(diceBet.value)) {
        phone.os.replaceAppRoute(TAVERN_PHONE_BANK_APP_ID, TAVERN_BANK_DICE_PATH);
    }
}

async function startPush() {
    if (!canAffordPush.value) {return;}
    if (await phone.bank.startPush()) {
        phone.os.replaceAppRoute(TAVERN_PHONE_BANK_APP_ID, TAVERN_BANK_PUSH_PATH);
    }
}

async function startLadder() {
    if (!canAffordLadder.value) {return;}
    if (await phone.bank.startLadder(ladderBet.value)) {
        phone.os.replaceAppRoute(TAVERN_PHONE_BANK_APP_ID, TAVERN_BANK_LADDER_PATH);
    }
}
</script>

<template>
  <div class="tavern-bank-scroll">
    <div
      v-if="phone.bank.loadError.value"
      class="tavern-bank-notice"
    >
      <strong>牌桌暂时打不开</strong>
      <p>{{ phone.bank.loadError.value }}</p>
      <button
        type="button"
        @click="phone.bank.refreshBank"
      >
        重试
      </button>
    </div>

    <template v-else>
      <section
        v-if="activeGame"
        class="tavern-bank-floor-resume"
      >
        <div>
          <small>牌局进行中</small>
          <strong>{{ activeGameLabel }}</strong>
          <p>同一时间只能有一桌。先回到牌桌把这局收尾，才能另起一局。</p>
        </div>
        <button
          type="button"
          @click="continueActiveGame"
        >
          回到牌桌
        </button>
      </section>

      <p
        v-else-if="blockedReason"
        class="tavern-bank-floor-hint"
      >
        {{ blockedReason }}
      </p>

      <section class="tavern-bank-floor-games">
        <article class="tavern-bank-floor-game">
          <div
            class="tavern-bank-floor-art is-dice"
            aria-hidden="true"
          >
            <span class="tavern-bank-art-die is-left"><i /><i /><i /></span>
            <span class="tavern-bank-art-die is-right"><i /><i /><i /><i /></span>
          </div>
          <header>
            <h3>骰局吹牛</h3>
            <span>庄家暗骰 · 赔率 {{ TAVERN_BANK_DICE_PAYOUT_LABEL }}</span>
          </header>
          <p>各持五枚暗骰，轮流叫注，觉得对方吹牛就开牌。1 点为百搭。</p>
          <div class="tavern-bank-floor-bet">
            <span>注额</span>
            <div class="tavern-bank-amount-field">
              <button
                type="button"
                :disabled="busy || !!activeGame"
                aria-label="减少注额"
                @click="nudgeDice(-TAVERN_BANK_DICE_BET_META.step)"
              >
                -
              </button>
              <strong>{{ diceBet }}</strong>
              <button
                type="button"
                :disabled="busy || !!activeGame"
                aria-label="增加注额"
                @click="nudgeDice(TAVERN_BANK_DICE_BET_META.step)"
              >
                +
              </button>
            </div>
            <small>{{ TAVERN_BANK_DICE_BET_META.min }} ~ {{ TAVERN_BANK_DICE_BET_META.max }} 小白币</small>
          </div>
          <button
            type="button"
            class="tavern-bank-floor-start"
            :disabled="busy || !!activeGame || !!blockedReason || !canAffordDice"
            @click="startDice"
          >
            {{ wagerButtonLabel('开桌', canAffordDice) }}
          </button>
        </article>

        <article class="tavern-bank-floor-game">
          <div
            class="tavern-bank-floor-art is-push"
            aria-hidden="true"
          >
            <span class="tavern-bank-art-card is-back" />
            <span class="tavern-bank-art-card is-coin"><i /></span>
            <span class="tavern-bank-art-card is-bomb"><i /></span>
          </div>
          <header>
            <h3>翻倍或收手</h3>
            <span>固定 {{ TAVERN_BANK_PUSH_BET_META.bet }} 币入场</span>
          </header>
          <p>牌堆里七金三雷，每翻一张金币就把彩池垫高。见好就收，翻到雷全没。</p>
          <div class="tavern-bank-floor-bet is-fixed">
            <span>注额</span>
            <strong>{{ TAVERN_BANK_PUSH_BET_META.bet }}</strong>
            <small>入场即锁定，翻牌途中不可加注</small>
          </div>
          <button
            type="button"
            class="tavern-bank-floor-start"
            :disabled="busy || !!activeGame || !!blockedReason || !canAffordPush"
            @click="startPush"
          >
            {{ wagerButtonLabel('入场', canAffordPush) }}
          </button>
        </article>

        <article class="tavern-bank-floor-game">
          <div
            class="tavern-bank-floor-art is-ladder"
            aria-hidden="true"
          >
            <span
              v-for="floor in 5"
              :key="floor"
              :style="{ '--bank-floor': floor }"
            />
            <i />
          </div>
          <header>
            <h3>风险阶梯</h3>
            <span>{{ TAVERN_BANK_LADDER_BET_META.maxFloors }} 层 · 越高越险</span>
          </header>
          <p>每层三选一：稳健、进取、搏命。成功累积彩池，失败跌落清零，随时可落袋。</p>
          <div class="tavern-bank-floor-bet">
            <span>注额</span>
            <div class="tavern-bank-amount-field">
              <button
                type="button"
                :disabled="busy || !!activeGame"
                aria-label="减少注额"
                @click="nudgeLadder(-TAVERN_BANK_LADDER_BET_META.step)"
              >
                -
              </button>
              <strong>{{ ladderBet }}</strong>
              <button
                type="button"
                :disabled="busy || !!activeGame"
                aria-label="增加注额"
                @click="nudgeLadder(TAVERN_BANK_LADDER_BET_META.step)"
              >
                +
              </button>
            </div>
            <small>{{ TAVERN_BANK_LADDER_BET_META.min }} ~ {{ TAVERN_BANK_LADDER_BET_META.max }} 小白币</small>
          </div>
          <button
            type="button"
            class="tavern-bank-floor-start"
            :disabled="busy || !!activeGame || !!blockedReason || !canAffordLadder"
            @click="startLadder"
          >
            {{ wagerButtonLabel('起步', canAffordLadder) }}
          </button>
        </article>
      </section>

      <div
        v-if="phone.bank.actionError.value"
        class="tavern-bank-floor-error"
        role="status"
      >
        {{ phone.bank.actionError.value }}
      </div>
    </template>
  </div>
</template>
