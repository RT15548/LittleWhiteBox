import { onBeforeUnmount, ref } from 'vue';

export function useTavernEphemeralDisclosureScope() {
    const openState = ref(new Map<string, boolean>());

    function isOpen(id: string, defaultOpen = false) {
        return openState.value.get(id) ?? defaultOpen;
    }

    function setOpen(id: string, open: boolean) {
        const next = new Map(openState.value);
        next.set(id, open);
        openState.value = next;
    }

    function setOpenFromEvent(id: string, event: Event) {
        setOpen(id, Boolean((event.currentTarget as HTMLDetailsElement | null)?.open));
    }

    function toggleOpen(id: string, defaultOpen = false) {
        setOpen(id, !isOpen(id, defaultOpen));
    }

    function reset() {
        openState.value = new Map();
    }

    onBeforeUnmount(reset);

    return {
        isOpen,
        reset,
        setOpen,
        setOpenFromEvent,
        toggleOpen,
    };
}
