<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import {
    useTavernChatContext,
    useTavernPhoneContext,
} from '../tavern-app-context';
import TavernPhoneAppStage from './TavernPhoneAppStage.vue';
import TavernPhoneDeviceFrame from './TavernPhoneDeviceFrame.vue';
import TavernPhoneHome from './TavernPhoneHome.vue';
import TavernPhoneSystemBar from './TavernPhoneSystemBar.vue';
import TavernPhoneSystemNavigation from './TavernPhoneSystemNavigation.vue';

const phone = useTavernPhoneContext();
const chat = useTavernChatContext();
const overlayRef = ref<HTMLElement | null>(null);
let returnFocus: HTMLElement | null = null;

function focusPhoneElement(element: HTMLElement | null | undefined) {
    if (!element) {return;}
    try {
        element.focus({ preventScroll: true });
    } catch {
        element.focus();
    }
}

function getPhoneFocusableElements(): HTMLElement[] {
    if (!overlayRef.value) {return [];}
    return Array.from(overlayRef.value.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.offsetParent !== null);
}

function handleDocumentKeydown(event: KeyboardEvent) {
    if (!phone.os.isOpen.value) {return;}
    if (event.key === 'Escape') {
        event.preventDefault();
        phone.os.backOrClose();
        return;
    }
    if (event.key !== 'Tab' || !overlayRef.value) {return;}
    const focusable = getPhoneFocusableElements();
    if (!focusable.length) {
        event.preventDefault();
        focusPhoneElement(overlayRef.value);
        return;
    }
    const first = focusable[0];
    const last = focusable.at(-1) || first;
    const active = document.activeElement;
    const focusIsInside = active instanceof HTMLElement && focusable.includes(active);
    if (event.shiftKey && (active === first || !focusIsInside)) {
        event.preventDefault();
        focusPhoneElement(last);
    } else if (!event.shiftKey && (active === last || !focusIsInside)) {
        event.preventDefault();
        focusPhoneElement(first);
    }
}

function handleBackdropPointerDown(event: PointerEvent) {
    if (phone.os.presentationMode.value !== 'desktop-device') {return;}
    if (event.target === event.currentTarget) {phone.os.closePhone();}
}

function handleLaunchApp(appId: string) {
    phone.os.launchApp(appId);
}

watch(phone.os.isOpen, async (open) => {
    if (open) {
        returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        await nextTick();
        focusPhoneElement(overlayRef.value);
        return;
    }
    await nextTick();
    if (returnFocus?.isConnected) {focusPhoneElement(returnFocus);}
    returnFocus = null;
});

onMounted(() => document.addEventListener('keydown', handleDocumentKeydown));
onUnmounted(() => document.removeEventListener('keydown', handleDocumentKeydown));
</script>

<template>
  <Transition name="tavern-phone-reveal">
    <div
      v-if="phone.os.isOpen.value"
      ref="overlayRef"
      class="tavern-phone-overlay"
      :class="[`is-${phone.os.presentationMode.value}`]"
      role="dialog"
      aria-modal="true"
      aria-label="小白 Phone OS"
      tabindex="-1"
      @pointerdown="handleBackdropPointerDown"
    >
      <TavernPhoneDeviceFrame
        :mode="phone.os.presentationMode.value"
        :viewport-height="phone.os.viewportHeight.value"
        :viewport-offset-left="phone.os.viewportOffsetLeft.value"
        :viewport-offset-top="phone.os.viewportOffsetTop.value"
        :viewport-width="phone.os.viewportWidth.value"
        @close="phone.os.closePhone"
      >
        <TavernPhoneSystemBar
          :mode="phone.os.presentationMode.value"
          :app-name="phone.os.activeApp.value?.name"
          :is-home="phone.os.isHome.value"
          @close="phone.os.closePhone"
          @home="phone.os.home"
        />
        <main class="tavern-phone-screen">
          <Transition
            :name="`tavern-phone-route-${phone.os.transitionDirection.value}`"
            mode="out-in"
          >
            <TavernPhoneHome
              v-if="phone.os.activeRoute.value.kind === 'home'"
              key="phone-home"
              :apps="phone.os.apps.value"
              :character-avatar="chat.visibleCharacterAvatar.value"
              @launch="handleLaunchApp"
            />
            <TavernPhoneAppStage
              v-else-if="phone.os.activeRoute.value.kind === 'app'"
              :key="phone.os.activeRoute.value.appId"
              :app="phone.os.activeApp.value"
            />
            <section
              v-else
              key="phone-route-missing"
              class="tavern-phone-app tavern-phone-route-missing"
            >
              <strong>这个入口暂时不可用</strong>
              <p>返回手机桌面后再试一次。</p>
              <button
                type="button"
                @click="phone.os.home"
              >
                回到桌面
              </button>
            </section>
          </Transition>
        </main>
        <TavernPhoneSystemNavigation
          :is-home="phone.os.isHome.value"
          @home="phone.os.home"
        />
      </TavernPhoneDeviceFrame>
    </div>
  </Transition>
</template>
