<script setup lang="ts">
import { computed, ref } from 'vue';
import type { GameKind } from '../types.js';
import { gameRoom } from './room-catalog.js';
const COPY = { balance: (amount: number) => `可用 ${amount.toLocaleString('zh-CN')} 小白币` };
const props = defineProps<{
    kind: GameKind;
    minimum: number;
    maximum: number;
    step: number;
    initial: number;
    chips: number[];
    rules: string[];
    balance: number;
    disabledReason: string;
    otherGame: string;
}>();
defineEmits<{ start: [bet: number]; resume: [] }>();
const bet = ref(props.initial);
const room = computed(() => gameRoom(props.kind));
const reason = computed(
    () =>
        props.disabledReason ||
        (!Number.isSafeInteger(bet.value) ||
        bet.value < props.minimum ||
        bet.value > props.maximum ||
        bet.value % props.step !== 0
            ? `请选择 ${props.minimum}–${props.maximum}，每次 ${props.step} 小白币。`
            : props.balance < bet.value
              ? '小白币不够，换个小一点的筹码吧。'
              : ''),
);
</script>
<template>
    <section class="game-entry" :class="'is-' + room.tone">
        <div class="game-entry-art">
            <img :src="room.artwork" alt="">
        </div>
        <ol class="game-entry-rules">
            <li v-for="rule in rules" :key="rule">{{ rule }}</li>
        </ol>
        <div v-if="otherGame" class="game-entry-blocked">
            <p>还有一局{{ otherGame }}没结束，可以先逛逛，玩完再来。</p>
            <button type="button" class="game-primary-action" @click="$emit('resume')">继续那一局</button>
        </div>
        <div v-else class="game-entry-stake">
            <h3>{{ minimum === maximum ? '本局入场' : '本局筹码' }}</h3>
            <div v-if="minimum !== maximum" class="game-stake-chips" aria-label="选择下注">
                <button
                    v-for="chip in chips"
                    :key="chip"
                    type="button"
                    :aria-pressed="bet === chip"
                    @click="bet = chip"
                >
                    <span>{{ chip }}</span>
                </button>
            </div>
            <label v-if="minimum !== maximum" class="game-stake-input"><span>自选</span><input
                v-model.number="bet"
                type="number"
                :min="minimum"
                :max="maximum"
                :step="step"
                aria-label="本局下注"
            ><span>小白币</span></label>
            <p class="game-entry-balance">{{ COPY.balance(balance) }}</p>
            <button
                type="button"
                class="game-primary-action game-start"
                :disabled="Boolean(reason)"
                @click="$emit('start', bet)"
            >
                下注 {{ bet || '—' }} · 开始
            </button>
            <p v-if="reason" class="game-inline-note" role="status">{{ reason }}</p>
        </div>
    </section>
</template>
