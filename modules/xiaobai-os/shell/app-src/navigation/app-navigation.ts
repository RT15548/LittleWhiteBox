import { inject, nextTick, watch, type InjectionKey, type Ref, type ShallowRef } from 'vue';
import type { createBackStack } from './back-stack.js';

export interface AppLayer {
    element: HTMLElement;
    modal: () => boolean;
}
export interface AppNavigation {
    root: Ref<HTMLElement | null>;
    stack: ReturnType<typeof createBackStack>;
    layers: ShallowRef<AppLayer[]>;
}
export const appNavigationKey: InjectionKey<AppNavigation> = Symbol('app-navigation');

export function topModalLayer(navigation: AppNavigation): HTMLElement | undefined {
    const layers = navigation.layers.value;
    for (let index = layers.length - 1; index >= 0; index--) {
        if (layers[index].modal()) { return layers[index].element; }
    }
    return undefined;
}

function available(element: HTMLElement): boolean {
    return element.isConnected && !element.matches(':disabled') && !element.closest('[inert]')
        && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
}

function focusLayer(layer: HTMLElement): void {
    // Selector lists use DOM order, not selector priority. Try autofocus before
    // ordinary controls, and the dialog container only if neither can focus.
    for (const selector of ['[autofocus]', 'button, [href], input, textarea, select, summary, [tabindex]:not([tabindex="-1"])', '[tabindex="-1"]']) {
        for (const target of layer.querySelectorAll<HTMLElement>(selector)) {
            if (!available(target)) { continue; }
            target.focus({ preventScroll: true });
            if (target.ownerDocument.activeElement === target) { return; }
        }
    }
    layer.focus({ preventScroll: true });
}

function restoreFocus(navigation: AppNavigation | null, origin: Element | null = null): void {
    const root = navigation?.root.value;
    // A synchronous Back-registration cleanup can run before Vue queues the
    // page update. Let that update enqueue before waiting for its DOM flush.
    queueMicrotask(() => { void nextTick(() => {
        if (root && (!root.isConnected || navigation?.root.value !== root)) { return; }
        const current = document.activeElement;
        // An APP, a newly opened layer, or the user may already have chosen a
        // focus target. Repair only focus lost with the outgoing UI.
        if (current instanceof HTMLElement && current !== document.body && available(current)) { return; }
        const layer = navigation ? topModalLayer(navigation) : undefined;
        if (origin instanceof HTMLElement && available(origin) && (!root || root.contains(origin)) && (!layer || layer.contains(origin))) {
            origin.focus({ preventScroll: true });
            if (document.activeElement === origin) { return; }
        }
        if (layer) { focusLayer(layer); }
        else { root?.focus({ preventScroll: true }); }
    }); });
}

export function useAppBack(handler: () => boolean, enabled: () => boolean = () => true): () => boolean {
    const navigation = inject(appNavigationKey, null);
    const back = (origin: Element | null = null) => {
        const consumed = handler();
        if (consumed) { restoreFocus(navigation, origin); }
        return consumed;
    };
    watch(enabled, (active, _, cleanup) => {
        if (active && navigation) {
            const origin = document.activeElement;
            const remove = navigation.stack.add(() => back(origin));
            cleanup(() => { remove(); restoreFocus(navigation, origin); });
        }
    }, { immediate: true, flush: 'sync' });
    return () => navigation ? navigation.stack.back() : back();
}

/** APP-local layer; a docked panel keeps Back handling without blocking its neighbours. */
export function useAppLayer(element: Ref<HTMLElement | null>, back: () => void, modal: () => boolean = () => true): void {
    const navigation = inject(appNavigationKey, null);
    useAppBack(() => { back(); return true; }, () => !!element.value);
    // Opening order belongs to the element's lifetime, not to its layout mode.
    watch(element, (layer, _, cleanup) => {
        if (!layer || !navigation) { return; }
        const entry = { element: layer, modal };
        navigation.layers.value = [...navigation.layers.value, entry];
        cleanup(() => { navigation.layers.value = navigation.layers.value.filter(item => item !== entry); });
    }, { flush: 'post' });
    watch(() => modal() ? element.value : null, async (layer, _, cleanup) => {
        if (!layer) { return; }
        const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        cleanup(() => restoreFocus(navigation, origin));
        await nextTick();
        if (!layer.isConnected || !modal() || navigation && topModalLayer(navigation) !== layer) { return; }
        focusLayer(layer);
    }, { flush: 'post' });
}
