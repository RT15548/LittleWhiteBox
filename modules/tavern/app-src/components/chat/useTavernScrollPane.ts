import { nextTick, ref, unref, watch, type Ref } from 'vue';
import {
    AGENT_MESSAGE_WINDOW_CHUNK,
    AGENT_MESSAGE_WINDOW_DEFAULT,
    expandMessageWindow,
    normalizeHiddenOutsideCount,
    normalizeMessageLoadBatchSize,
    resetMessageWindow,
} from '../../message-window';

export interface TavernScrollPaneOptions {
    totalItems: () => number;
    managesMessageWindow?: boolean;
    defaultLimit?: number | Ref<number>;
    loadBatchSize?: number | Ref<number>;
    maxWindowLimit?: number | Ref<number>;
    windowOffsetFromEnd?: Ref<number>;
    isWindowPinned?: () => boolean;
}

export interface TavernScrollToBottomOptions {
    collapseWindow?: boolean;
    revealHelpers?: boolean;
}

interface ViewportPreservationSnapshot {
    scrollTop: number;
    userScrollVersion: number;
    anchor: {
        element: HTMLElement;
        topOffset: number;
    } | null;
}

export function useTavernScrollPane(options: TavernScrollPaneOptions) {
    const scrollRef = ref<HTMLElement | null>(null);
    const contentRef = ref<HTMLElement | null>(null);
    const autoScroll = ref(true);
    const showScrollTop = ref(false);
    const showScrollBottom = ref(false);
    const scrollControlsActive = ref(false);
    const messageWindowLimit = ref(normalizeHiddenOutsideCount(unref(options.defaultLimit), AGENT_MESSAGE_WINDOW_DEFAULT));
    let scrollHideTimer: number | null = null;
    let scrollTicking = false;
    let topRevealAutoBlocked = false;
    let programmaticScroll = false;
    let programmaticScrollTarget: number | null = null;
    let contentResizeObserver: ResizeObserver | null = null;
    let prependCompensation: { scrollHeight: number; scrollTop: number } | null = null;
    let userScrollVersion = 0;
    let viewportPreservationToken = 0;
    let activeViewportPreservation: { token: number; snapshot: ViewportPreservationSnapshot } | null = null;
    let viewportPreservationFrame = 0;
    let viewportPreservationSecondFrame = 0;
    const bottomLockThresholdPx = 48;
    const viewportAnchorSelector = '[data-chat-anchor-key], [data-manager-anchor-key]';

    function windowPinned() {
        return options.isWindowPinned?.() === true;
    }

    function resetWindowState(force = false) {
        if (options.managesMessageWindow === false) {return false;}
        if (!force && windowPinned()) {return false;}
        const state = { uiMessageWindowLimit: messageWindowLimit.value };
        resetMessageWindow(state, { defaultLimit: normalizeHiddenOutsideCount(unref(options.defaultLimit), AGENT_MESSAGE_WINDOW_DEFAULT) });
        messageWindowLimit.value = Number(state.uiMessageWindowLimit || AGENT_MESSAGE_WINDOW_DEFAULT);
        if (options.windowOffsetFromEnd) {
            options.windowOffsetFromEnd.value = 0;
        }
        topRevealAutoBlocked = false;
        return true;
    }

    function clearViewportPreservationFrames() {
        if (typeof window === 'undefined' || typeof window.cancelAnimationFrame !== 'function') {
            viewportPreservationFrame = 0;
            viewportPreservationSecondFrame = 0;
            return;
        }
        if (viewportPreservationFrame) {
            window.cancelAnimationFrame(viewportPreservationFrame);
            viewportPreservationFrame = 0;
        }
        if (viewportPreservationSecondFrame) {
            window.cancelAnimationFrame(viewportPreservationSecondFrame);
            viewportPreservationSecondFrame = 0;
        }
    }

    function requestViewportPreservationFrame(callback: () => void) {
        if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
            callback();
            return 0;
        }
        return window.requestAnimationFrame(callback);
    }

    function runSilently(mutation: () => void) {
        try {
            mutation();
        } finally {
            const node = scrollRef.value;
            programmaticScrollTarget = node ? Number(node.scrollTop || 0) : null;
            programmaticScroll = programmaticScrollTarget !== null;
        }
    }

    function clampScrollTop(node: HTMLElement, scrollTop: number) {
        const maxScrollTop = Math.max(0, Number(node.scrollHeight || 0) - Number(node.clientHeight || 0));
        return Math.min(Math.max(0, scrollTop), maxScrollTop);
    }

    function getViewportAnchorCandidates(contentNode: HTMLElement) {
        const anchors = Array.from(contentNode.querySelectorAll<HTMLElement>(viewportAnchorSelector));
        if (anchors.length) {return anchors;}
        return Array.from(contentNode.children)
            .filter((child): child is HTMLElement => child instanceof HTMLElement);
    }

    function findViewportAnchor(node: HTMLElement): ViewportPreservationSnapshot['anchor'] {
        const contentNode = contentRef.value || node;
        const containerRect = typeof node.getBoundingClientRect === 'function'
            ? node.getBoundingClientRect()
            : null;
        if (!containerRect) {return null;}
        const anchor = getViewportAnchorCandidates(contentNode)
            .map((element) => ({
                element,
                rect: typeof element.getBoundingClientRect === 'function'
                    ? element.getBoundingClientRect()
                    : null,
            }))
            .find((item) => (
                item.rect
                && item.rect.bottom >= containerRect.top + 1
                && item.rect.top <= containerRect.bottom - 1
            ));
        return anchor?.rect
            ? { element: anchor.element, topOffset: anchor.rect.top - containerRect.top }
            : null;
    }

    function captureViewportPreservation(): ViewportPreservationSnapshot | null {
        const node = scrollRef.value;
        if (!node || autoScroll.value !== false) {return null;}
        return {
            scrollTop: Number(node.scrollTop || 0),
            userScrollVersion,
            anchor: findViewportAnchor(node),
        };
    }

    function restoreViewportPreservation(snapshot: ViewportPreservationSnapshot | null) {
        const node = scrollRef.value;
        if (!node || !snapshot || autoScroll.value !== false || snapshot.userScrollVersion !== userScrollVersion) {
            return false;
        }
        const contentNode = contentRef.value || node;
        const containerRect = typeof node.getBoundingClientRect === 'function'
            ? node.getBoundingClientRect()
            : null;
        const anchor = snapshot.anchor;
        if (anchor?.element?.isConnected && contentNode.contains(anchor.element) && containerRect) {
            const anchorRect = typeof anchor.element.getBoundingClientRect === 'function'
                ? anchor.element.getBoundingClientRect()
                : null;
            if (anchorRect) {
                const nextOffset = anchorRect.top - containerRect.top;
                runSilently(() => {
                    node.scrollTop = clampScrollTop(node, Number(node.scrollTop || 0) + nextOffset - anchor.topOffset);
                });
                updateScrollButtons();
                return true;
            }
        }
        runSilently(() => {
            node.scrollTop = clampScrollTop(node, snapshot.scrollTop);
        });
        updateScrollButtons();
        return true;
    }

    function restoreActiveViewportPreservation() {
        const active = activeViewportPreservation;
        if (!active) {return false;}
        const restored = restoreViewportPreservation(active.snapshot);
        if (!restored && activeViewportPreservation?.token === active.token) {
            activeViewportPreservation = null;
        }
        return restored;
    }

    function scheduleViewportPreservation(snapshot: ViewportPreservationSnapshot | null) {
        if (!snapshot) {return;}
        const token = viewportPreservationToken + 1;
        viewportPreservationToken = token;
        activeViewportPreservation = { token, snapshot };
        clearViewportPreservationFrames();
        restoreActiveViewportPreservation();
        void nextTick(() => {
            if (activeViewportPreservation?.token !== token) {return;}
            restoreActiveViewportPreservation();
            viewportPreservationFrame = requestViewportPreservationFrame(() => {
                viewportPreservationFrame = 0;
                if (activeViewportPreservation?.token !== token) {return;}
                restoreActiveViewportPreservation();
                viewportPreservationSecondFrame = requestViewportPreservationFrame(() => {
                    viewportPreservationSecondFrame = 0;
                    if (activeViewportPreservation?.token !== token) {return;}
                    restoreActiveViewportPreservation();
                    if (activeViewportPreservation?.token === token) {
                        activeViewportPreservation = null;
                    }
                });
            });
        });
    }

    function preserveViewportDuringMutation<T>(mutation: () => T): T {
        const snapshot = captureViewportPreservation();
        try {
            return mutation();
        } finally {
            scheduleViewportPreservation(snapshot);
        }
    }

    function preserveNextWindowMutation() {
        const snapshot = captureViewportPreservation();
        if (!snapshot) {return;}
        const token = viewportPreservationToken + 1;
        viewportPreservationToken = token;
        activeViewportPreservation = { token, snapshot };
        clearViewportPreservationFrames();
    }

    function stickToBottom() {
        const node = scrollRef.value;
        if (!node) {return false;}
        runSilently(() => {
            node.scrollTop = node.scrollHeight;
        });
        updateScrollButtons();
        return true;
    }

    function preserveNextPrepend() {
        const node = scrollRef.value;
        if (!node) {return;}
        prependCompensation = {
            scrollHeight: Number(node.scrollHeight || 0),
            scrollTop: Number(node.scrollTop || 0),
        };
    }

    function applyPrependCompensation() {
        const node = scrollRef.value;
        const snapshot = prependCompensation;
        if (!node || !snapshot) {return false;}
        prependCompensation = null;
        const delta = Number(node.scrollHeight || 0) - snapshot.scrollHeight;
        runSilently(() => {
            node.scrollTop = Math.max(0, snapshot.scrollTop + delta);
        });
        updateScrollButtons();
        return true;
    }

    function handleContentChanged() {
        if (applyPrependCompensation()) {return;}
        if (autoScroll.value) {
            stickToBottom();
            return;
        }
        if (restoreActiveViewportPreservation()) {return;}
        updateScrollButtons();
    }

    function disconnectContentResizeObserver() {
        if (!contentResizeObserver) {return;}
        contentResizeObserver.disconnect();
        contentResizeObserver = null;
    }

    watch([scrollRef, contentRef], ([scrollNode, contentNode]) => {
        disconnectContentResizeObserver();
        if (!scrollNode || !contentNode || typeof ResizeObserver === 'undefined') {return;}
        contentResizeObserver = new ResizeObserver(() => {
            handleContentChanged();
        });
        contentResizeObserver.observe(contentNode);
        if (autoScroll.value) {
            void nextTick(stickToBottom);
        }
    }, { flush: 'post' });

    function revealOlderMessages(force = false) {
        if (options.managesMessageWindow === false) {return false;}
        if (windowPinned()) {return false;}
        const node = scrollRef.value;
        if (!force && autoScroll.value !== false) {return false;}
        if (!force && topRevealAutoBlocked) {return false;}
        if (!node || (!force && node.scrollTop > 64)) {return false;}
        const total = Math.max(0, Math.floor(Number(options.totalItems()) || 0));
        const offsetFromEnd = Math.max(0, Math.floor(Number(options.windowOffsetFromEnd?.value) || 0));
        const availableBefore = Math.max(0, total - offsetFromEnd - messageWindowLimit.value);
        if (!availableBefore) {return false;}
        const state = { uiMessageWindowLimit: messageWindowLimit.value };
        const expanded = expandMessageWindow(state, total - offsetFromEnd, {
            defaultLimit: normalizeHiddenOutsideCount(unref(options.defaultLimit), AGENT_MESSAGE_WINDOW_DEFAULT),
            chunk: normalizeMessageLoadBatchSize(unref(options.loadBatchSize), AGENT_MESSAGE_WINDOW_CHUNK),
            maxLimit: unref(options.maxWindowLimit),
        });
        const shifted = !expanded && !!options.windowOffsetFromEnd;
        if (!expanded && !shifted) {return false;}
        if (expanded) {preserveNextPrepend();}
        else {preserveNextWindowMutation();}
        if (expanded) {
            messageWindowLimit.value = Number(state.uiMessageWindowLimit || messageWindowLimit.value);
        } else if (options.windowOffsetFromEnd) {
            options.windowOffsetFromEnd.value = offsetFromEnd + Math.min(
                availableBefore,
                normalizeMessageLoadBatchSize(unref(options.loadBatchSize), AGENT_MESSAGE_WINDOW_CHUNK),
            );
        }
        autoScroll.value = false;
        topRevealAutoBlocked = true;
        return true;
    }

    function revealNewerMessages(force = false) {
        if (options.managesMessageWindow === false) {return false;}
        if (windowPinned()) {return false;}
        const offsetRef = options.windowOffsetFromEnd;
        const offsetFromEnd = Math.max(0, Math.floor(Number(offsetRef?.value) || 0));
        if (!offsetRef || !offsetFromEnd) {return false;}
        const node = scrollRef.value;
        if (!node) {return false;}
        if (!force && node.scrollHeight - node.clientHeight - node.scrollTop > 64) {return false;}
        preserveNextWindowMutation();
        offsetRef.value = Math.max(
            0,
            offsetFromEnd - normalizeMessageLoadBatchSize(unref(options.loadBatchSize), AGENT_MESSAGE_WINDOW_CHUNK),
        );
        autoScroll.value = false;
        topRevealAutoBlocked = false;
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

    function isNearBottom(threshold = bottomLockThresholdPx) {
        const node = scrollRef.value;
        if (!node) {return true;}
        return node.scrollHeight - node.clientHeight - node.scrollTop <= threshold;
    }

    function collapseMessageWindowIfBottom(force = false) {
        if (options.managesMessageWindow === false) {return false;}
        if (windowPinned()) {return false;}
        const defaultLimit = normalizeHiddenOutsideCount(unref(options.defaultLimit), AGENT_MESSAGE_WINDOW_DEFAULT);
        const offsetFromEnd = Math.max(0, Math.floor(Number(options.windowOffsetFromEnd?.value) || 0));
        if (messageWindowLimit.value <= defaultLimit && !offsetFromEnd) {return false;}
        if (!force && offsetFromEnd) {return false;}
        if (!force && !isNearBottom(8)) {return false;}
        resetWindowState();
        return true;
    }

    watch(() => normalizeHiddenOutsideCount(unref(options.defaultLimit), AGENT_MESSAGE_WINDOW_DEFAULT), () => {
        if (options.managesMessageWindow === false) {return;}
        if (autoScroll.value === false || windowPinned()) {return;}
        resetWindowState();
    });

    function scrollToBottom(force = false, scrollOptions: TavernScrollToBottomOptions = {}) {
        if (!force && !autoScroll.value) {return;}
        if (force) {autoScroll.value = true;}
        void nextTick(() => {
            if (!force && autoScroll.value === false) {return;}
            if (!stickToBottom()) {return;}
            if (scrollOptions.collapseWindow) {
                collapseMessageWindowIfBottom(true);
                void nextTick(stickToBottom);
            }
            updateScrollButtons();
            if (scrollOptions.revealHelpers) {
                scheduleHideScrollHelpers();
            }
        });
    }

    function requestUserMessageBottom() {
        scrollToBottom(true);
    }

    function placeAtBottomForNewContext() {
        scrollToBottom(true);
    }

    function jumpToBottom(scrollOptions: TavernScrollToBottomOptions = {}) {
        scrollToBottom(true, scrollOptions);
    }

    function scrollToTop() {
        const node = scrollRef.value;
        if (!node) {return;}
        autoScroll.value = false;
        activeViewportPreservation = null;
        runSilently(() => {
            node.scrollTo?.({ top: 0, behavior: 'auto' });
            node.scrollTop = 0;
        });
        updateScrollButtons();
        scheduleHideScrollHelpers();
    }

    function handleScroll() {
        const node = scrollRef.value;
        if (!node) {return;}
        if (programmaticScroll) {
            const target = programmaticScrollTarget;
            const current = Number(node.scrollTop || 0);
            if (target !== null && Math.abs(current - target) <= 1) {
                programmaticScroll = false;
                programmaticScrollTarget = null;
                updateScrollButtons();
                return;
            }
            programmaticScroll = false;
            programmaticScrollTarget = null;
        }
        userScrollVersion += 1;
        const currentScrollTop = Number(node.scrollTop || 0);
        if (currentScrollTop > 96) {
            topRevealAutoBlocked = false;
        }
        if (revealOlderMessages()) {return;}
        const atBottom = isNearBottom();
        if (atBottom) {
            const offsetFromEnd = Math.max(0, Math.floor(Number(options.windowOffsetFromEnd?.value) || 0));
            if (offsetFromEnd) {
                autoScroll.value = false;
                if (revealNewerMessages()) {return;}
            }
            autoScroll.value = true;
            collapseMessageWindowIfBottom();
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

    function handleTouchStart() {}

    function handleTouchMove() {}

    function cleanup() {
        if (scrollHideTimer) {
            window.clearTimeout(scrollHideTimer);
            scrollHideTimer = null;
        }
        programmaticScroll = false;
        programmaticScrollTarget = null;
        clearViewportPreservationFrames();
        prependCompensation = null;
        activeViewportPreservation = null;
        disconnectContentResizeObserver();
        scrollRef.value?.classList.remove('is-scrolling');
    }

    return {
        scrollRef: scrollRef as Ref<HTMLElement | null>,
        contentRef: contentRef as Ref<HTMLElement | null>,
        autoScroll,
        showScrollTop,
        showScrollBottom,
        scrollControlsActive,
        messageWindowLimit,
        resetWindowState,
        revealOlderMessages,
        revealNewerMessages,
        updateScrollButtons,
        isNearBottom,
        collapseMessageWindowIfBottom,
        runSilently,
        preserveViewportDuringMutation,
        placeAtBottomForNewContext,
        requestUserMessageBottom,
        jumpToBottom,
        scrollToBottom,
        scrollToTop,
        handleScroll,
        handleWheel,
        handleTouchStart,
        handleTouchMove,
        cleanup,
    };
}
