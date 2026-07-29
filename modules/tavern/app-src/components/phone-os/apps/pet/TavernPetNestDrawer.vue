<script setup lang="ts">
import { ref, toRef } from 'vue';
import type { TavernPetView } from '../../../../../shared/pet/pet-types';
import type { TavernPetActivityRow } from '../../../../features/phone-os/apps/pet/tavern-pet-presentation';
import { useTavernPhoneModal } from '../../useTavernPhoneModal';

const props = defineProps<{
    open: boolean;
    view: TavernPetView;
    activities: TavernPetActivityRow[];
    busy: boolean;
    hasCustomName: boolean;
}>();

const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'rename'): void;
    (event: 'toggle-interference', enabled: boolean): void;
}>();

const backdropRef = ref<HTMLElement | null>(null);
const closeRef = ref<HTMLButtonElement | null>(null);

function requestClose(): void {
    if (!props.busy) {emit('close');}
}

useTavernPhoneModal({
    open: toRef(props, 'open'),
    modalRef: backdropRef,
    initialFocus: () => closeRef.value,
    canClose: () => !props.busy,
    close: requestClose,
});

function closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {requestClose();}
}
</script>

<template>
  <Transition name="tavern-pet-drawer">
    <div
      v-if="open"
      ref="backdropRef"
      class="tavern-pet-drawer-backdrop"
      :data-tavern-phone-modal="open ? 'pet-nest' : undefined"
      @click="closeFromBackdrop"
    >
      <aside
        class="tavern-pet-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tavern-pet-nest-title"
      >
        <header>
          <div>
            <small>NEST / LOCAL</small>
            <h3 id="tavern-pet-nest-title">
              它的窝
            </h3>
          </div>
          <button
            ref="closeRef"
            type="button"
            aria-label="关闭它的窝"
            :disabled="busy"
            @click="requestClose"
          >
            ×
          </button>
        </header>

        <div class="tavern-pet-drawer-scroll">
          <section class="tavern-pet-nest-coins">
            <span>压在窝底的小白币</span>
            <strong>{{ view.nest.coins }}</strong>
            <p>看得到。拿不出来。</p>
          </section>

          <section class="tavern-pet-nest-section">
            <h4>捡回来的东西</h4>
            <p
              v-if="!view.nest.curios.length"
              class="tavern-pet-nest-empty"
            >
              它还什么都没捡回来。
            </p>
            <ul
              v-else
              class="tavern-pet-curios"
            >
              <li
                v-for="curio in view.nest.curios"
                :key="curio.id"
              >
                <strong>{{ curio.label }}</strong>
                <p>{{ curio.description }}</p>
              </li>
            </ul>
          </section>

          <section class="tavern-pet-nest-section">
            <div class="tavern-pet-section-head">
              <h4>最近留下的痕迹</h4>
              <small>{{ activities.length }}</small>
            </div>
            <p
              v-if="!activities.length"
              class="tavern-pet-nest-empty"
            >
              这里暂时没有新的痕迹。
            </p>
            <ol
              v-else
              class="tavern-pet-traces"
            >
              <li
                v-for="activity in activities"
                :key="activity.id"
              >
                <div>
                  <strong>{{ activity.label }}</strong>
                  <time v-if="activity.timeLabel">{{ activity.timeLabel }}</time>
                </div>
                <p>{{ activity.text }}</p>
              </li>
            </ol>
          </section>

          <section class="tavern-pet-nest-settings">
            <button
              v-if="view.phase === 'juvenile' || view.phase === 'adult'"
              type="button"
              :disabled="busy"
              @click="emit('rename')"
            >
              <span>{{ hasCustomName ? '改名字' : '给它一个名字' }}</span>
              <i aria-hidden="true">›</i>
            </button>
            <button
              type="button"
              role="switch"
              :aria-checked="view.interferenceEnabled"
              :disabled="busy"
              class="tavern-pet-interference-switch"
              @click="emit('toggle-interference', !view.interferenceEnabled)"
            >
              <span>
                <strong>允许它偶尔碰到外面的世界</strong>
                <small>只会发生很轻的小插曲；关闭后不删除已经发生的痕迹。</small>
              </span>
              <i aria-hidden="true"><b /></i>
            </button>
          </section>
        </div>
      </aside>
    </div>
  </Transition>
</template>
