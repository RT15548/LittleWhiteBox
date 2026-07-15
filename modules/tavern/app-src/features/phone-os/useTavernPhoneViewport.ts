import { onMounted, onUnmounted, ref } from 'vue';
import type { TavernPhonePresentationMode } from './phone-os-types';

const MOBILE_PHONE_MEDIA = '(max-width: 760px), (pointer: coarse) and (max-height: 760px)';

export function useTavernPhoneViewport() {
    const presentationMode = ref<TavernPhonePresentationMode>('desktop-device');
    const viewportHeight = ref(0);
    const viewportOffsetLeft = ref(0);
    const viewportOffsetTop = ref(0);
    const viewportWidth = ref(0);
    let frame = 0;

    function refreshViewport() {
        if (typeof window === 'undefined') {return;}
        const visualViewport = window.visualViewport;
        viewportWidth.value = Math.round(visualViewport?.width || window.innerWidth || 0);
        viewportHeight.value = Math.round(visualViewport?.height || window.innerHeight || 0);
        viewportOffsetLeft.value = Math.round(visualViewport?.offsetLeft || 0);
        viewportOffsetTop.value = Math.round(visualViewport?.offsetTop || 0);
        presentationMode.value = window.matchMedia(MOBILE_PHONE_MEDIA).matches
            ? 'mobile-fullscreen'
            : 'desktop-device';
    }

    function scheduleRefresh() {
        if (typeof window === 'undefined') {return;}
        if (frame) {window.cancelAnimationFrame(frame);}
        frame = window.requestAnimationFrame(() => {
            frame = 0;
            refreshViewport();
        });
    }

    onMounted(() => {
        refreshViewport();
        window.addEventListener('resize', scheduleRefresh, { passive: true });
        window.addEventListener('orientationchange', scheduleRefresh, { passive: true });
        window.visualViewport?.addEventListener('resize', scheduleRefresh, { passive: true });
        window.visualViewport?.addEventListener('scroll', scheduleRefresh, { passive: true });
    });

    onUnmounted(() => {
        if (frame) {window.cancelAnimationFrame(frame);}
        window.removeEventListener('resize', scheduleRefresh);
        window.removeEventListener('orientationchange', scheduleRefresh);
        window.visualViewport?.removeEventListener('resize', scheduleRefresh);
        window.visualViewport?.removeEventListener('scroll', scheduleRefresh);
    });

    return {
        presentationMode,
        viewportHeight,
        viewportOffsetLeft,
        viewportOffsetTop,
        viewportWidth,
    };
}
