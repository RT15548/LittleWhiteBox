import { onMounted, onUnmounted, ref } from 'vue';
import type { TavernPhonePresentationMode } from './phone-os-types';

const MOBILE_PHONE_MEDIA = '(max-width: 760px), (pointer: coarse) and (max-height: 760px)';

export function useTavernPhoneViewport() {
    const presentationMode = ref<TavernPhonePresentationMode>('desktop-device');
    let frame = 0;

    function refreshViewport() {
        if (typeof window === 'undefined') {return;}
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
    });

    onUnmounted(() => {
        if (frame) {window.cancelAnimationFrame(frame);}
        window.removeEventListener('resize', scheduleRefresh);
        window.removeEventListener('orientationchange', scheduleRefresh);
    });

    return {
        presentationMode,
    };
}
