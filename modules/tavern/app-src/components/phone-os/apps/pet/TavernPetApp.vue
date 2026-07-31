<script setup lang="ts">
import { computed } from 'vue';
import { useTavernPhoneContext } from '../../../tavern-app-context';
import TavernPetChatBar from './TavernPetChatBar.vue';
import TavernPetGiftShelf from './TavernPetGiftShelf.vue';
import TavernPetLeaveDialog from './TavernPetLeaveDialog.vue';
import TavernPetNamingDialog from './TavernPetNamingDialog.vue';
import TavernPetNestDrawer from './TavernPetNestDrawer.vue';
import TavernPetStage from './TavernPetStage.vue';

const phone = useTavernPhoneContext();
const pet = phone.pet;

const lureAction = computed(() => pet.view.value.availableActions.find((action) => action.id === 'lure') || null);
const giftActions = computed(() => pet.view.value.availableActions.filter((action) => (
    action.id === 'feed' || action.id === 'toy'
)));
const actionGate = computed(() => {
    if (pet.isModelWaiting.value) {return '它正忙着开口，等它说完。';}
    if (pet.busyAction.value) {return '它还在反应……';}
    return pet.interactionBlockedReason.value;
});
const showChat = computed(() => pet.view.value.existence === 'present');
const showNest = computed(() => pet.view.value.existence === 'present');
const phaseLabel = computed(() => {
    const view = pet.view.value;
    if (view.phase === 'egg') {return '蛋';}
    if (view.phase === 'juvenile') {return '幼体';}
    if (view.phase === 'adult') {return view.persona?.displayName || '成年';}
    return '暗室';
});

async function handleAction(actionId: Parameters<typeof pet.performAction>[0]): Promise<void> {
    await pet.performAction(actionId);
}
</script>

<template>
  <section
    class="tavern-phone-app tavern-pet-app"
    :class="pet.view.value.phase ? `is-${pet.view.value.phase}` : 'is-undiscovered'"
  >
    <div class="tavern-pet-frame">
      <header class="tavern-pet-head">
        <div>
          <small>UNKNOWN RESIDENT</small>
          <h2>{{ pet.view.value.displayName }}</h2>
        </div>
        <div class="tavern-pet-head-actions">
          <span>{{ phaseLabel }}</span>
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

      <div
        v-else
        class="tavern-pet-body"
      >
        <TavernPetStage
          :view="pet.view.value"
          :utterance="pet.utterance.value"
          :waiting="pet.isModelWaiting.value"
          :murmur-visible="pet.murmurVisible.value"
          @touch="pet.touchStage"
        />

        <section
          v-if="pet.view.value.existence === 'undiscovered'"
          class="tavern-pet-arrival"
        >
          <p>放下一点食物。它会自己来。</p>
          <button
            v-if="lureAction"
            type="button"
            class="tavern-pet-arrival-button"
            :disabled="!!actionGate || !lureAction.enabled"
            :title="actionGate || lureAction.reason"
            @click="handleAction('lure')"
          >
            <span>放一点吃的</span>
            <small>10 小白币</small>
          </button>
        </section>

        <template v-else>
          <section
            class="tavern-pet-vitals"
            aria-label="不明物此刻状态"
          >
            <span>肚子 <strong>{{ pet.view.value.appetiteLabel }}</strong></span>
            <i aria-hidden="true" />
            <span>心情 <strong>{{ pet.view.value.emotionLabel }}</strong></span>
          </section>

          <section
            v-if="pet.view.value.pendingMoment"
            class="tavern-pet-moment"
            aria-labelledby="tavern-pet-moment-title"
          >
            <small>相处片段</small>
            <p id="tavern-pet-moment-title">
              {{ pet.view.value.pendingMoment.prompt }}
            </p>
            <div class="tavern-pet-moment-choices">
              <button
                v-for="choice in pet.view.value.pendingMoment.choices"
                :key="choice.id"
                type="button"
                :disabled="!!actionGate"
                @click="pet.resolveMoment(pet.view.value.pendingMoment!.id, choice.id)"
              >
                {{ choice.label }}
              </button>
            </div>
            <button
              type="button"
              class="tavern-pet-moment-skip"
              :disabled="!!actionGate"
              @click="pet.skipMoment(pet.view.value.pendingMoment.id)"
            >
              跳过这次
            </button>
          </section>

          <TavernPetChatBar
            v-if="showChat"
            v-model="pet.chatInput.value"
            :can-submit="pet.canSubmitChat.value"
            :disabled-reason="pet.chatBlockedReason.value"
            :waiting="pet.isChatWaiting.value"
            :egg="pet.view.value.phase === 'egg'"
            @submit="pet.sendChat"
          />

          <TavernPetGiftShelf
            :actions="giftActions"
            :busy-action="pet.busyAction.value"
            :blocked-reason="actionGate"
            @action="handleAction"
          />
        </template>
      </div>

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
        :model-busy="pet.isModelWaiting.value"
        :mutation-busy="Boolean(pet.busyAction.value)"
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
    </div>
  </section>
</template>
