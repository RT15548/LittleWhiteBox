<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { TavernPetMomentChoiceId } from '../../../../../shared/pet/pet-types';
import { useTavernPhoneContext } from '../../../tavern-app-context';
import TavernPetChatBar from './TavernPetChatBar.vue';
import TavernPetGiftShelf from './TavernPetGiftShelf.vue';
import TavernPetLeaveDialog from './TavernPetLeaveDialog.vue';
import TavernPetMomentSheet from './TavernPetMomentSheet.vue';
import TavernPetNamingDialog from './TavernPetNamingDialog.vue';
import TavernPetNestDrawer from './TavernPetNestDrawer.vue';
import TavernPetStage from './TavernPetStage.vue';

const phone = useTavernPhoneContext();
const pet = phone.pet;
const momentOpen = ref(false);

const lureAction = computed(() => pet.view.value.availableActions.find((action) => action.id === 'lure') || null);
const giftActions = computed(() => pet.view.value.availableActions.filter((action) => (
    action.id === 'feed' || action.id === 'toy'
)));
const actionGate = computed(() => {
    if (pet.isChatWaiting.value) {return '它正在想怎么回答你。';}
    if (pet.busyAction.value) {return '它正把东西收好。';}
    return pet.interactionBlockedReason.value;
});
const showChat = computed(() => pet.view.value.existence === 'present');
const showNest = computed(() => pet.view.value.existence === 'present');
const showProviderGate = computed(() => (
    pet.view.value.existence === 'present'
    && pet.view.value.phase !== 'egg'
    && !pet.delegateModelReady.value
));
const chatReason = computed(() => showProviderGate.value ? '' : pet.chatBlockedReason.value);
const showChatErrorToast = computed(() => (
    Boolean(pet.chatError.value)
    && pet.chatError.value !== pet.utterance.value.text
));
const phaseLabel = computed(() => {
    const view = pet.view.value;
    if (view.phase === 'egg') {return '蛋';}
    if (view.phase === 'juvenile') {return '幼体';}
    if (view.phase === 'adult') {return view.persona?.displayName || '成年';}
    return '暗室';
});

watch(() => pet.view.value.pendingMoment?.id, (momentId) => {
    if (!momentId) {closeMoment();}
});

async function handleAction(actionId: Parameters<typeof pet.performAction>[0]): Promise<void> {
    await pet.performAction(actionId);
}

function openMoment(): void {
    pet.actionError.value = '';
    momentOpen.value = true;
}

function closeMoment(): void {
    momentOpen.value = false;
    pet.actionError.value = '';
}

async function chooseMoment(choiceId: TavernPetMomentChoiceId): Promise<void> {
    const moment = pet.view.value.pendingMoment;
    if (!moment) {return;}
    const result = await pet.resolveMoment(moment.id, choiceId);
    if (result) {closeMoment();}
}

async function skipMoment(): Promise<void> {
    const moment = pet.view.value.pendingMoment;
    if (!moment) {return;}
    const result = await pet.skipMoment(moment.id);
    if (result) {closeMoment();}
}
</script>

<template>
  <section
    class="tavern-phone-app tavern-pet-app"
    :class="pet.view.value.phase ? `is-${pet.view.value.phase}` : 'is-undiscovered'"
  >
    <div class="tavern-pet-frame">
      <header class="tavern-pet-head">
        <div class="tavern-pet-identity">
          <small>UNKNOWN RESIDENT</small>
          <h2>{{ pet.view.value.displayName }}</h2>
          <p>
            <span>{{ phaseLabel }}</span>
            <template v-if="pet.view.value.existence === 'present'">
              <i aria-hidden="true" />
              <span>肚子 {{ pet.view.value.appetiteLabel }}</span>
              <i aria-hidden="true" />
              <span>心情 {{ pet.view.value.emotionLabel }}</span>
            </template>
          </p>
        </div>
        <button
          v-if="showNest"
          type="button"
          class="tavern-pet-nest-button"
          @click="pet.openNest"
        >
          <span>它的窝</span>
          <i aria-hidden="true">›</i>
        </button>
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
        <div class="tavern-pet-scene">
          <TavernPetStage
            :view="pet.view.value"
            :utterance="pet.utterance.value"
            :waiting="pet.isChatWaiting.value"
            :murmur-visible="pet.murmurVisible.value"
            @touch="pet.touchStage"
          />

          <div
            v-if="pet.view.value.guidance"
            class="tavern-pet-guidance"
            :class="`is-${pet.view.value.guidance.kind}`"
          >
            <button
              v-if="pet.view.value.guidance.kind === 'moment'"
              type="button"
              :disabled="!!actionGate"
              @click="openMoment"
            >
              <span>{{ pet.view.value.guidance.text }}</span>
              <i aria-hidden="true">看看它怎么了 ›</i>
            </button>
            <p v-else>
              {{ pet.view.value.guidance.text }}
            </p>
          </div>

          <section
            v-if="pet.view.value.existence === 'undiscovered'"
            class="tavern-pet-arrival"
          >
            <button
              v-if="lureAction"
              type="button"
              class="tavern-pet-arrival-button"
              :disabled="!!actionGate || !lureAction.enabled"
              :title="actionGate || lureAction.reason"
              @click="handleAction('lure')"
            >
              <span>在碟里放一点吃的</span>
              <small>10 小白币</small>
            </button>
          </section>
        </div>

        <footer
          v-if="showChat"
          class="tavern-pet-dock"
        >
          <div
            v-if="showProviderGate"
            class="tavern-pet-provider-gate"
            role="status"
          >
            <span>还没有配置分身模型</span>
            <button
              type="button"
              @click="pet.openApiSettings"
            >
              去配置
            </button>
          </div>

          <TavernPetChatBar
            v-model="pet.chatInput.value"
            :can-submit="pet.canSubmitChat.value"
            :disabled-reason="chatReason"
            :waiting="pet.isChatWaiting.value"
            :egg="pet.view.value.phase === 'egg'"
            @submit="pet.sendChat"
            @cancel="pet.cancelChat"
          />

          <div class="tavern-pet-dock-tools">
            <TavernPetGiftShelf
              :actions="giftActions"
              :busy-action="pet.busyAction.value"
              :blocked-reason="actionGate"
              @action="handleAction"
            />
            <button
              v-if="pet.view.value.pendingMoment"
              type="button"
              class="tavern-pet-moment-open"
              :disabled="!!actionGate"
              @click="openMoment"
            >
              它有件事没说
            </button>
          </div>
        </footer>
      </div>

      <div
        class="tavern-pet-live-region"
        aria-live="polite"
        aria-atomic="true"
      >
        <p v-if="pet.actionError.value && !momentOpen">
          {{ pet.actionError.value }}
        </p>
        <p v-if="showChatErrorToast">
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

      <TavernPetMomentSheet
        :open="momentOpen"
        :moment="pet.view.value.pendingMoment"
        :busy="pet.busyAction.value === 'resolve-moment' || pet.busyAction.value === 'skip-moment'"
        :error="pet.actionError.value"
        @close="closeMoment"
        @choose="chooseMoment"
        @skip="skipMoment"
      />
      <TavernPetNestDrawer
        :open="pet.nestOpen.value"
        :view="pet.view.value"
        :journal="pet.journal.value"
        :model-busy="pet.isChatWaiting.value"
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
