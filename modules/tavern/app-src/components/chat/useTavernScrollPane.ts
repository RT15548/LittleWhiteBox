import { nextTick, ref, unref, watch, type Ref } from 'vue';
import {
    AGENT_MESSAGE_WINDOW_CHUNK,
    AGENT_MESSAGE_WINDOW_DEFAULT,
    expandMessageWindow,
    normalizeHiddenOutsideCount,
    normalizeMessageLoadBatchSize,
    resetMessageWindow,
} from '../../message-window';
import {
    captureElementScrollState,
    restoreElementScrollState,
    type AnchorConfig,
    type ElementScrollSnapshot,
} from '../../scroll-state';

export interface TavernScrollPaneOptions {
    totalItems: () => number;
    defaultLimit?: number | Ref<number>;
    loadBatchSize?: number | Ref<number>;
    revealAnchorConfig?: AnchorConfig;
}

export interface TavernScrollToBottomOptions {
    collapseWindow?: boolean;
    revealHelpers?: boolean;
}

export function useTavernScrollPane(options: TavernScrollPaneOptions) {
    const scrollRef = ref<HTMLElement | null>(null);
    const autoScroll = ref(true);
    const showScrollTop = ref(false);
    const showScrollBottom = ref(false);
    const scrollControlsActive = ref(false);
    const messageWindowLimit = ref(normalizeHiddenOutsideCount(unref(options.defaultLimit), AGENT_MESSAGE_WINDOW_DEFAULT));
    let scrollHideTimer: number | null = null;
    let scrollTicking = false;
    let touchStartY: number | null = null;
    let lastScrollTop = 0;

    function restoreRevealScrollSnapshot(snapshot: ElementScrollSnapshot | null) {
        if (!snapshot || !options.revealAnchorConfig) {return false;}
        const node = scrollRef.value;
        if (!node) {return false;}
        restoreElementScrollState(node, snapshot, options.revealAnchorConfig, {
            preserveScrollTop: true,
        });
        lastScrollTop = Number(node.scrollTop || 0);
        updateScrollButtons();
        return true;
    }

    function scheduleRevealScrollRestore(snapshot: ElementScrollSnapshot | null) {
        if (!snapshot || !options.revealAnchorConfig) {return;}
        void nextTick(() => {
            restoreRevealScrollSnapshot(snapshot);
            requestAnimationFrame(() => {
                restoreRevealScrollSnapshot(snapshot);
                requestAnimationFrame(() => {
                    restoreRevealScrollSnapshot(snapshot);
                });
            });
        });
    }

    function resetWindowState() {
        const state = { uiMessageWindowLimit: messageWindowLimit.value };
        resetMessageWindow(state, { defaultLimit: normalizeHiddenOutsideCount(unref(options.defaultLimit), AGENT_MESSAGE_WINDOW_DEFAULT) });
        messageWindowLimit.value = Number(state.uiMessageWindowLimit || AGENT_MESSAGE_WINDOW_DEFAULT);
    }

    function revealOlderMessages(force = false) {
        const node = scrollRef.value;
        if (!force && autoScroll.value !== false) {return false;}
        if (!node || (!force && node.scrollTop > 64)) {return false;}
        const snapshot = options.revealAnchorConfig
            ? captureElementScrollState(node, options.revealAnchorConfig)
            : null;
        const state = { uiMessageWindowLimit: messageWindowLimit.value };
        if (!expandMessageWindow(state, options.totalItems(), {
            defaultLimit: normalizeHiddenOutsideCount(unref(options.defaultLimit), AGENT_MESSAGE_WINDOW_DEFAULT),
            chunk: normalizeMessageLoadBatchSize(unref(options.loadBatchSize), AGENT_MESSAGE_WINDOW_CHUNK),
        })) {return false;}
        messageWindowLimit.value = Number(state.uiMessageWindowLimit || messageWindowLimit.value);
        autoScroll.value = false;
        scheduleRevealScrollRestore(snapshot);
        return true;
    }

    function updateScrollButtons() {
        const node = scrollRef.value;
        if (!node) {
            showScrollTop.value = false;
            showScrollBottom.value = false;
            return;
        }
        const threshold = 80;
        showScrollTop.value = node.scrollTop > threshold;
        showScrollBottom.value = node.scrollHeight - node.scrollTop - node.clientHeight > threshold;
    }

    function scheduleHideScrollHelpers() {
        scrollControlsActive.value = true;
        scrollRef.value?.classList.add('is-scrolling');
        if (scrollHideTimer) {
            window.clearTimeout(scrollHideTimer);
        }
        scrollHideTimer = window.setTimeout(() => {
            scrollControlsActive.value = false;
            scrollRef.value?.classList.remove('is-scrolling');
            scrollHideTimer = null;
        }, 1500);
    }

    function isNearBottom(threshold = 56) {
        const node = scrollRef.value;
        if (!node) {return true;}
        return node.scrollHeight - node.scrollTop - node.clientHeight <= threshold;
    }

    function collapseMessageWindowIfBottom(force = false) {
        const defaultLimit = normalizeHiddenOutsideCount(unref(options.defaultLimit), AGENT_MESSAGE_WINDOW_DEFAULT);
        if (messageWindowLimit.value <= defaultLimit) {return false;}
        if (!force && !isNearBottom(8)) {return false;}
        resetWindowState();
        return true;
    }

    watch(() => normalizeHiddenOutsideCount(unref(options.defaultLimit), AGENT_MESSAGE_WINDOW_DEFAULT), () => {
        if (autoScroll.value === false) {return;}
        resetWindowState();
    });

    function scrollToBottom(force = false, scrollOptions: TavernScrollToBottomOptions = {}) {
        if (!force && !autoScroll.value) {return;}
        if (force) {autoScroll.value = true;}
        void nextTick(() => {
            const apply = () => {
                if (!force && autoScroll.value === false) {return false;}
                const node = scrollRef.value;
                if (!node) {return false;}
                node.scrollTop = node.scrollHeight;
                lastScrollTop = Number(node.scrollTop || 0);
                return true;
            };
            if (!apply()) {return;}
            requestAnimationFrame(() => {
                if (!apply()) {return;}
                requestAnimationFrame(() => {
                    if (!apply()) {return;}
                    if (scrollOptions.collapseWindow) {
                        collapseMessageWindowIfBottom(true);
                        void nextTick(() => {
                            if (!apply()) {return;}
                            requestAnimationFrame(apply);
                        });
                    }
                    updateScrollButtons();
                    if (scrollOptions.revealHelpers) {
                        scheduleHideScrollHelpers();
                    }
                });
            });
        });
    }

    function scrollToTop() {
        const node = scrollRef.value;
        if (!node) {return;}
        autoScroll.value = false;
        lastScrollTop = 0;
        node.scrollTo?.({ top: 0, behavior: 'smooth' });
        node.scrollTop = 0;
        updateScrollButtons();
        scheduleHideScrollHelpers();
    }

    function handleScroll() {
        const node = scrollRef.value;
        if (!node) {return;}
        if (revealOlderMessages()) {return;}
        const previousScrollTop = lastScrollTop;
        const currentScrollTop = Number(node.scrollTop || 0);
        const scrollingTowardBottom = currentScrollTop > previousScrollTop;
        lastScrollTop = currentScrollTop;
        const nearBottom = isNearBottom();
        if (nearBottom) {
            if (autoScroll.value !== false || scrollingTowardBottom) {
                autoScroll.value = true;
                collapseMessageWindowIfBottom();
            }
        } else {
            autoScroll.value = false;
        }
        if (scrollTicking) {return;}
        scrollTicking = true;
        requestAnimationFrame(() => {
            updateScrollButtons();
            scheduleHideScrollHelpers();
            scrollTicking = false;
        });
    }

    function getWheelTarget(event: WheelEvent) {
        const target = event.target;
        if (target instanceof HTMLElement) {return target;}
        if (target instanceof Node && target.parentElement instanceof HTMLElement) {
            return target.parentElement;
        }
        return null;
    }

    function hasWheelScrollableOverflow(element: HTMLElement) {
        if (element instanceof HTMLTextAreaElement) {return true;}
        const view = element.ownerDocument?.defaultView || window;
        const style = view.getComputedStyle?.(element);
        return /^(auto|scroll|overlay)$/i.test(String(style?.overflowY || ''));
    }

    function normalizeWheelDeltaY(event: WheelEvent, target: HTMLElement) {
        const raw = Number(event.deltaY || 0);
        if (!Number.isFinite(raw) || raw === 0) {return 0;}
        if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {return raw * 16;}
        if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {return raw * Math.max(1, target.clientHeight || 1);}
        return raw;
    }

    function canWheelScroll(element: HTMLElement, deltaY: number) {
        if (!hasWheelScrollableOverflow(element)) {return false;}
        const maxScrollTop = Math.max(0, Number(element.scrollHeight || 0) - Number(element.clientHeight || 0));
        if (maxScrollTop <= 1) {return false;}
        const current = Number(element.scrollTop || 0);
        return deltaY < 0
            ? current > 0
            : current < maxScrollTop - 1;
    }

    function findWheelScrollTarget(event: WheelEvent, root: HTMLElement, deltaY: number) {
        let current: HTMLElement | null = getWheelTarget(event);
        while (current && current !== root) {
            if (canWheelScroll(current, deltaY)) {return current;}
            current = current.parentElement;
        }
        return canWheelScroll(root, deltaY) ? root : null;
    }

    function applyWheelFallback(target: HTMLElement, deltaY: number) {
        const maxScrollTop = Math.max(0, Number(target.scrollHeight || 0) - Number(target.clientHeight || 0));
        target.scrollTop = Math.min(Math.max(0, Number(target.scrollTop || 0) + deltaY), maxScrollTop);
    }

    function handleWheel(event: WheelEvent) {
        const root = scrollRef.value;
        if (!root) {return;}
        const deltaY = normalizeWheelDeltaY(event, root);
        if (!deltaY) {return;}
        const target = findWheelScrollTarget(event, root, deltaY);
        if (!target) {return;}
        if (deltaY < 0 && target === root) {
            autoScroll.value = false;
        }
        const previousScrollTop = Number(target.scrollTop || 0);
        requestAnimationFrame(() => {
            if (!target.isConnected) {return;}
            if (Math.abs(Number(target.scrollTop || 0) - previousScrollTop) > 0.5) {return;}
            applyWheelFallback(target, deltaY);
            if (target === root) {
                handleScroll();
            }
        });
    }

    function handleTouchStart(event: TouchEvent) {
        touchStartY = Number(event.touches?.[0]?.clientY);
    }

    function handleTouchMove(event: TouchEvent) {
        const currentY = Number(event.touches?.[0]?.clientY);
        if (!Number.isFinite(Number(touchStartY)) || !Number.isFinite(currentY)) {
            autoScroll.value = false;
            return;
        }
        if (touchStartY !== null && (currentY > touchStartY + 4 || !isNearBottom())) {
            autoScroll.value = false;
        }
    }

    function resetPositionState() {
        lastScrollTop = 0;
    }

    function cleanup() {
        if (scrollHideTimer) {
            window.clearTimeout(scrollHideTimer);
            scrollHideTimer = null;
        }
        scrollRef.value?.classList.remove('is-scrolling');
    }

    return {
        scrollRef: scrollRef as Ref<HTMLElement | null>,
        autoScroll,
        showScrollTop,
        showScrollBottom,
        scrollControlsActive,
        messageWindowLimit,
        resetWindowState,
        revealOlderMessages,
        updateScrollButtons,
        isNearBottom,
        collapseMessageWindowIfBottom,
        scrollToBottom,
        scrollToTop,
        handleScroll,
        handleWheel,
        handleTouchStart,
        handleTouchMove,
        resetPositionState,
        cleanup,
    };
}
