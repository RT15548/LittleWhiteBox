<script setup lang="ts">
import { computed } from 'vue';
import { useTavernPhoneContext } from '../../../tavern-app-context';
import TavernPetActions from './TavernPetActions.vue';
import TavernPetChatBar from './TavernPetChatBar.vue';
import TavernPetLeaveDialog from './TavernPetLeaveDialog.vue';
import TavernPetNamingDialog from './TavernPetNamingDialog.vue';
import TavernPetNestDrawer from './TavernPetNestDrawer.vue';
import TavernPetStage from './TavernPetStage.vue';
import { tavernPetWaitHint } from '../../../../features/phone-os/apps/pet/tavern-pet-presentation';

const phone = useTavernPhoneContext();
const pet = phone.pet;

const waitHint = computed(() => tavernPetWaitHint(pet.view.value));

const visibleActions = computed(() => pet.view.value.availableActions.filter((action) => action.id !== 'chat'));
const actionGate = computed(() => {
    if (pet.isChatWaiting.value) {return '它还在反应……';}
    if (pet.busyAction.value) {return '它还在反应……';}
    return pet.interactionBlockedReason.value;
});
const showChat = computed(() => (
    !pet.view.value.dormant
    && (pet.view.value.phase === 'juvenile' || pet.view.value.phase === 'adult')
));
const showNest = computed(() => (
    pet.view.value.existence === 'present' && pet.view.value.phase !== 'luring'
));
const phaseLabel = computed(() => {
    const view = pet.view.value;
    if (view.dormant) {return '休眠';}
    if (view.phase === 'egg') {return '蛋';}
    if (view.phase === 'juvenile') {return '幼体';}
    if (view.phase === 'adult') {return view.persona?.displayName || '轮廓未定';}
    return '';
});

async function handleAction(actionId: Parameters<typeof pet.performAction>[0]): Promise<void> {
    await pet.performAction(actionId);
}
</script>

<template>
  <section
    class="tavern-phone-app tavern-pet-app"
    :class="[
      pet.view.value.phase ? `is-${pet.view.value.phase}` : 'is-undiscovered',
      { 'is-dormant': pet.view.value.dormant },
    ]"
  >
    <header class="tavern-pet-head">
      <div>
        <small>不明物</small>
        <h2>{{ pet.view.value.displayName }}</h2>
      </div>
      <div class="tavern-pet-head-actions">
        <span v-if="pet.view.value.storageMb">占用 {{ pet.view.value.storageMb }}MB</span>
        <button
          v-if="showNest"
          type="button"
          @click="pet.openNest"
        >
          它的窝
        </button>
      </div>
    </header>

    <div
      v-if="pet.loadError.value"
      class="tavern-pet-load-error"
      role="alert"
    >
      <p>{{ pet.loadError.value }}</p>
      <button
        type="button"
        @click="pet.preparePet"
      >
        重新读取
      </button>
    </div>

    <template v-else>
      <TavernPetStage
        :view="pet.view.value"
        :utterance="pet.utterance.value"
        :waiting="pet.isModelWaiting.value"
        :murmur-visible="pet.murmurVisible.value"
      />

      <p
        v-if="waitHint"
        class="tavern-pet-wait-hint"
      >
        {{ waitHint }}
      </p>

      <section
        v-if="pet.view.value.satietyPercent !== undefined"
        class="tavern-pet-vitals"
        aria-label="不明物状态"
      >
        <div class="tavern-pet-satiety">
          <span>饱食</span>
          <i aria-hidden="true"><b :style="{ width: `${pet.view.value.satietyPercent}%` }" /></i>
          <strong>{{ pet.view.value.satietyPercent }}</strong>
        </div>
        <div class="tavern-pet-state-line">
          <span>情绪 <strong>{{ pet.view.value.emotionLabel }}</strong></span>
          <span>形态 <strong>{{ phaseLabel }}</strong></span>
        </div>
      </section>

      <div class="tavern-pet-controls">
        <TavernPetActions
          :actions="visibleActions"
          :blocked-reason="actionGate"
          :busy-action="pet.busyAction.value"
          @action="handleAction"
        />
        <TavernPetChatBar
          v-if="showChat"
          v-model="pet.chatInput.value"
          :can-submit="pet.canSubmitChat.value"
          :disabled-reason="pet.chatBlockedReason.value"
          :waiting="pet.isChatWaiting.value"
          @submit="pet.sendChat"
        />
      </div>
    </template>

    <div
      class="tavern-pet-live-region"
      aria-live="polite"
      aria-atomic="true"
    >
      <p v-if="pet.actionError.value">
        {{ pet.actionError.value }}
      </p>
      <p v-if="pet.chatError.value">
        {{ pet.chatError.value }}
      </p>
      <p v-if="pet.status.value">
        {{ pet.status.value }}
      </p>
    </div>

    <div
      v-if="pet.loading.value"
      class="tavern-pet-loading"
      role="status"
    >
      <span aria-hidden="true">· · ·</span>
      <p>暗室正在显影</p>
    </div>

    <TavernPetNestDrawer
      :open="pet.nestOpen.value"
      :view="pet.view.value"
      :journal="pet.journal.value"
      :busy="!!pet.busyAction.value || pet.isChatWaiting.value"
      :has-custom-name="pet.hasCustomName.value"
      @close="pet.closeNest"
      @rename="pet.openNaming"
      @toggle-interference="pet.setInterferenceEnabled"
      @leave="pet.openLeaveConfirmation"
    />
    <TavernPetNamingDialog
      v-model="pet.nameDraft.value"
      :open="pet.namingOpen.value"
      :specimen-label="pet.view.value.specimenLabel || '实验体编号'"
      :has-custom-name="pet.hasCustomName.value"
      :busy="pet.busyAction.value === 'rename'"
      :error="pet.actionError.value"
      @close="pet.closeNaming"
      @submit="pet.submitName()"
      @restore="pet.restoreSpecimenName"
    />
    <TavernPetLeaveDialog
      :open="pet.leaveConfirmOpen.value"
      :busy="pet.busyAction.value === 'leave'"
      :error="pet.actionError.value"
      @close="pet.closeLeaveConfirmation"
      @confirm="pet.confirmPetLeave"
    />
  </section>
</template>
