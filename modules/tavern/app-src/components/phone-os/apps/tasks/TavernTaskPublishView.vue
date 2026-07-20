<script setup lang="ts">
import { computed } from 'vue';
import { resolveTavernTaskPublishAvailability } from '../../../../features/phone-os/apps/tasks/tavern-task-publish-state';
import type { TavernTaskPublishDraft } from '../../../../features/phone-os/apps/tasks/useTavernTasksController';

const props = defineProps<{
    balance: number;
    balanceError: string;
    balanceLoading: boolean;
    balanceReady: boolean;
    blockedReason: string;
    busy: boolean;
    error: string;
}>();

const draft = defineModel<TavernTaskPublishDraft>('draft', { required: true });
const emit = defineEmits<{
    (event: 'back'): void;
    (event: 'submit'): void;
}>();

const availability = computed(() => resolveTavernTaskPublishAvailability({
    balance: props.balance,
    balanceError: props.balanceError,
    balanceLoading: props.balanceLoading,
    balanceReady: props.balanceReady,
    blockedReason: props.blockedReason,
    busy: props.busy,
    reward: draft.value.reward,
}));
const escrowAmount = computed(() => availability.value.escrowAmount);
const insufficientFunds = computed(() => availability.value.insufficientFunds);
const balanceAfterPayment = computed(() => props.balance - escrowAmount.value);
const canSubmit = computed(() => availability.value.canSubmit);
const missingBalance = computed(() => Math.max(0, escrowAmount.value - props.balance));

function formatCoins(value: number): string {
    return Number(value || 0).toLocaleString('zh-CN');
}

function submit(): void {
    if (canSubmit.value) {emit('submit');}
}
</script>

<template>
  <section class="tavern-phone-app tavern-task-publish-page">
    <header class="tavern-task-detail-head">
      <button
        type="button"
        class="tavern-phone-back-button"
        aria-label="返回我发布的任务"
        @click="emit('back')"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="m15 4-8 8 8 8" /></svg>
      </button>
      <div>
        <span>发布委托</span>
        <strong>发布委托</strong>
      </div>
      <b>自定义</b>
    </header>
    <form
      class="tavern-task-publish-form"
      @submit.prevent="submit"
    >
      <div
        class="tavern-task-publish-balance"
        :class="{ 'is-insufficient': insufficientFunds }"
      >
        <header>
          <span>报酬托管</span>
          <small>发布即冻结</small>
        </header>
        <dl>
          <div>
            <dt>可用余额</dt>
            <dd>{{ balanceReady ? formatCoins(balance) : '—' }} <i>◈</i></dd>
          </div>
          <div>
            <dt>托管金额</dt>
            <dd>{{ escrowAmount ? `− ${formatCoins(escrowAmount)}` : '—' }} <i>◈</i></dd>
          </div>
          <div class="is-total">
            <dt>支付后余额</dt>
            <dd>{{ balanceReady ? formatCoins(balanceAfterPayment) : '—' }} <i>◈</i></dd>
          </div>
        </dl>
        <p v-if="balanceLoading">
          正在与钱包核对可用余额…
        </p>
        <p v-else-if="balanceError">
          {{ balanceError }}
        </p>
        <p v-else-if="insufficientFunds">
          余额不足，还差 {{ formatCoins(missingBalance) }} 小白币。
        </p>
        <p v-else>
          托管资金会在撤回、失败或结算时按任务规则原路处理。
        </p>
      </div>
      <label>
        <span>任务标题 *</span>
        <input
          v-model="draft.title"
          type="text"
          maxlength="180"
          autocomplete="off"
          placeholder="一句话说明要做什么"
          required
        >
      </label>
      <label>
        <span>目标 *</span>
        <textarea
          v-model="draft.objective"
          rows="4"
          maxlength="8000"
          placeholder="写清楚完成条件与交付结果"
          required
        />
      </label>
      <label>
        <span>要求</span>
        <textarea
          v-model="draft.requirements"
          rows="3"
          maxlength="8000"
          placeholder="能力、身份、时间或保密要求"
        />
      </label>
      <div class="tavern-task-publish-two-column">
        <label>
          <span>地点 *</span>
          <input
            v-model="draft.location"
            type="text"
            maxlength="600"
            autocomplete="off"
            placeholder="行动地点"
            required
          >
        </label>
        <label>
          <span>托管报酬 *</span>
          <input
            v-model="draft.reward"
            type="number"
            min="1"
            step="1"
            inputmode="numeric"
            placeholder="100"
            required
          >
        </label>
      </div>
      <label>
        <span>风险说明</span>
        <textarea
          v-model="draft.risk"
          rows="3"
          maxlength="2000"
          placeholder="已知风险、禁区与潜在代价"
        />
      </label>
      <label>
        <span>标签</span>
        <input
          v-model="draft.tags"
          type="text"
          maxlength="320"
          autocomplete="off"
          placeholder="调查、护送、采购（逗号分隔）"
        >
      </label>
      <div
        v-if="error || blockedReason"
        class="tavern-task-inline-alert"
        role="status"
      >
        <strong>{{ blockedReason ? '终端锁定' : '无法发布' }}</strong>
        <p>{{ blockedReason || error }}</p>
      </div>
      <button
        type="submit"
        class="tavern-task-publish-submit"
        :disabled="!canSubmit"
      >
        {{ busy ? '正在封存委托' : insufficientFunds ? '余额不足' : !balanceReady ? '等待钱包' : !escrowAmount ? '填写托管报酬' : '核对并发布' }}
      </button>
    </form>
  </section>
</template>
