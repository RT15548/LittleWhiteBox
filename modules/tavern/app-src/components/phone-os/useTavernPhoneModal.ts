import {
    nextTick,
    onScopeDispose,
    watch,
    type Ref,
} from 'vue';

interface TavernPhoneModalOptions {
    open: Ref<boolean>;
    modalRef: Ref<HTMLElement | null>;
    initialFocus: () => HTMLElement | null;
    canClose: () => boolean;
    close: () => void;
}

function focusPhoneModalElement(element: HTMLElement | null | undefined): void {
    if (!element) {return;}
    try {
        element.focus({ preventScroll: true });
    } catch {
        element.focus();
    }
}

function isTopPhoneModal(modal: HTMLElement): boolean {
    const modals = Array.from(document.querySelectorAll<HTMLElement>('[data-tavern-phone-modal]'))
        .filter((element) => element.getClientRects().length > 0);
    return modals.at(-1) === modal;
}

export function useTavernPhoneModal(options: TavernPhoneModalOptions): void {
    let returnFocus: HTMLElement | null = null;
    let listening = false;
    let stateEpoch = 0;

    function removeEscapeListener(): void {
        if (!listening) {return;}
        document.removeEventListener('keydown', handleEscape, true);
        listening = false;
    }

    function restoreFocus(): void {
        if (returnFocus?.isConnected) {focusPhoneModalElement(returnFocus);}
        returnFocus = null;
    }

    function handleEscape(event: KeyboardEvent): void {
        const modal = options.modalRef.value;
        if (event.key !== 'Escape'
            || !options.open.value
            || !modal
            || !isTopPhoneModal(modal)
            || !options.canClose()
        ) {
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        options.close();
    }

    const stop = watch(options.open, async (open) => {
        const epoch = ++stateEpoch;
        if (open) {
            returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            await nextTick();
            if (epoch !== stateEpoch || !options.open.value) {return;}
            document.addEventListener('keydown', handleEscape, true);
            listening = true;
            focusPhoneModalElement(options.initialFocus() || options.modalRef.value);
            return;
        }
        removeEscapeListener();
        await nextTick();
        if (epoch !== stateEpoch) {return;}
        restoreFocus();
    }, { flush: 'post', immediate: true });

    onScopeDispose(() => {
        stateEpoch += 1;
        stop();
        removeEscapeListener();
        restoreFocus();
    });
}
