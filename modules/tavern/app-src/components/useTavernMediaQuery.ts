import { onBeforeUnmount, ref } from 'vue';

export function useTavernMediaQuery(query: string) {
    const matches = ref(false);

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return matches;
    }

    const media = window.matchMedia(query);
    const update = () => {
        matches.value = media.matches;
    };

    update();
    if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', update);
        onBeforeUnmount(() => media.removeEventListener('change', update));
    } else {
        media.addListener(update);
        onBeforeUnmount(() => media.removeListener(update));
    }

    return matches;
}
