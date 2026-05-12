import { extension_settings, getContext } from "../../../../extensions.js";
import { saveSettingsDebounced, this_chid, getCurrentChatId } from "../../../../../script.js";
import { selected_group } from "../../../../group-chats.js";
import { EXT_ID } from "../core/constants.js";
import { createModuleEvents, event_types } from "../core/event-manager.js";

const defaultSettings = {
    enabled: false,
    showAllMessages: false,
    autoJumpOnAI: true
};

const SEL = {
    chat: '#chat',
    mes: '#chat .mes',
    ai: '#chat .mes[is_user="false"][is_system="false"]',
    user: '#chat .mes[is_user="true"]'
};

const ALL_MESSAGES_VIRTUAL_KEEP_RECENT = 10;
const ALL_MESSAGES_VIRTUAL_ROOT_MARGIN = '1600px 0px';
const ALL_MESSAGES_VIRTUAL_MIN_HEIGHT = 80;
const ALL_MESSAGES_VIRTUAL_BATCH_SIZE = 80;
const ALL_MESSAGES_VIRTUAL_POST_RENDER_FRAMES = 2;
const ALL_MESSAGES_VIRTUAL_MEDIA_SELECTOR = 'img, video, iframe, details, .xiaobaix-iframe-wrapper, .mes_reasoning_details';
const HISTORY_BACKFILL_SETTLE_MS = 380;
const HISTORY_BACKFILL_TOP_THRESHOLD = 260;
const PROGRAMMATIC_SCROLL_QUIET_MS = 650;

const baseEvents = createModuleEvents('immersiveMode');
const messageEvents = createModuleEvents('immersiveMode:messages');

let state = {
    isActive: false,
    eventsBound: false,
    messageEventsBound: false,
    globalStateHandler: null,
    scrollTicking: false,
    scrollHideTimer: null,
    sendFocusGuardBound: false,
    sendFocusGuardCleanup: null
};

let observer = null;
let resizeObs = null;
let resizeObservedEl = null;
let recalcT = null;
let sendCleanupTimer = null;
let allMessagesVirtualObserver = null;
let allMessagesVirtualRefreshTimer = null;
let allMessagesVirtualBatchTimer = null;
let allMessagesVirtualBatchToken = 0;
let allMessagesVirtualRenderToken = 0;
let allMessagesVirtualNewestId = -1;
let historyBackfillUntil = 0;
let historyBackfillTimer = null;
let historyBackfillPendingDisplay = false;
let historyBackfillPendingVirtualization = false;
let programmaticScrollQuietUntil = 0;

const isGlobalEnabled = () => window.isXiaobaixEnabled ?? true;
const getSettings = () => extension_settings[EXT_ID].immersive;
const isInChat = () => this_chid !== undefined || selected_group || getCurrentChatId() !== undefined;

function initImmersiveMode() {
    initSettings();
    setupEventListeners();
    if (isGlobalEnabled()) {
        state.isActive = getSettings().enabled;
        if (state.isActive) enableImmersiveMode();
        bindSettingsEvents();
    }
}

function initSettings() {
    extension_settings[EXT_ID] ||= {};
    extension_settings[EXT_ID].immersive ||= structuredClone(defaultSettings);
    const settings = extension_settings[EXT_ID].immersive;
    Object.keys(defaultSettings).forEach(k => settings[k] = settings[k] ?? defaultSettings[k]);
    updateControlState();
}

function setupEventListeners() {
    state.globalStateHandler = handleGlobalStateChange;
    baseEvents.on(event_types.CHAT_CHANGED, onChatChanged);
    document.addEventListener('xiaobaixEnabledChanged', state.globalStateHandler);
    if (window.registerModuleCleanup) window.registerModuleCleanup('immersiveMode', cleanup);
}

function setupDOMObserver() {
    if (observer) return;
    const chatContainer = document.getElementById('chat');
    if (!chatContainer) return;

    observer = new MutationObserver((mutations) => {
        if (!state.isActive) return;
        let hasNewAI = false;
        let shouldRefreshVirtualization = false;
        const addedMessages = [];

        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes?.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList?.contains('mes')) {
                        addedMessages.push(node);
                        processSingleMessage(node);
                        shouldRefreshVirtualization = true;
                        if (node.getAttribute('is_user') === 'false' && node.getAttribute('is_system') === 'false') {
                            hasNewAI = true;
                        }
                    }
                });
            }
            if (mutation.type === 'childList' && mutation.removedNodes?.length) {
                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList?.contains('mes')) {
                        shouldRefreshVirtualization = true;
                    }
                });
            }
        }

        const isHistoryBackfill = detectHistoryBackfillMutation(addedMessages);
        if (isHistoryBackfill) {
            beginHistoryBackfillQuietPeriod('mutation');
        }

        if (shouldRefreshVirtualization) {
            if (isHistoryBackfill || isHistoryBackfillActive()) {
                queueHistoryBackfillRefresh({ virtualization: true });
            } else {
                scheduleVirtualizationAfterChatRender('mutation');
            }
        }

        if (hasNewAI) {
            if (recalcT) clearTimeout(recalcT);
            if (isHistoryBackfill || isHistoryBackfillActive()) {
                queueHistoryBackfillRefresh({ display: true });
            } else {
                recalcT = setTimeout(updateMessageDisplay, 20);
            }
        }
    });

    observer.observe(chatContainer, { childList: true, subtree: true, characterData: true });
}

function processSingleMessage(mesElement) {
    const $mes = $(mesElement);
    const $avatarWrapper = $mes.find('.mesAvatarWrapper');
    const $chName = $mes.find('.ch_name.flex-container.justifySpaceBetween');
    const $targetSibling = $chName.find('.flex-container.flex1.alignitemscenter');
    const $nameText = $mes.find('.name_text');

    if ($avatarWrapper.length && $chName.length && $targetSibling.length &&
        !$chName.find('.mesAvatarWrapper').length) {
        $targetSibling.before($avatarWrapper);

        if ($nameText.length && !$nameText.parent().hasClass('xiaobaix-vertical-wrapper')) {
            const $verticalWrapper = $('<div class="xiaobaix-vertical-wrapper" style="display: flex; flex-direction: column; flex: 1; margin-top: 5px; align-self: stretch; justify-content: space-between;"></div>');
            const $topGroup = $('<div class="xiaobaix-top-group"></div>');
            $topGroup.append($nameText.detach(), $targetSibling.detach());
            $verticalWrapper.append($topGroup);
            $avatarWrapper.after($verticalWrapper);
        }
    }
}

function getMessageId(mesElement) {
    const id = Number(mesElement?.getAttribute?.('mesid'));
    return Number.isFinite(id) ? id : null;
}

function getNextExistingMessageId(mesElement, addedSet) {
    let node = mesElement?.nextElementSibling;
    while (node) {
        if (node.classList?.contains('mes') && !addedSet.has(node)) {
            return getMessageId(node);
        }
        node = node.nextElementSibling;
    }
    return null;
}

function detectHistoryBackfillMutation(addedMessages) {
    if (!isAllMessagesVirtualizationEnabled() || !addedMessages?.length) return false;

    const addedSet = new Set(addedMessages);
    const addedIds = addedMessages.map(getMessageId).filter(id => id !== null);
    if (!addedIds.length) return false;

    let oldestExistingId = Infinity;
    let newestExistingId = -1;
    document.querySelectorAll(SEL.mes).forEach((mesElement) => {
        if (addedSet.has(mesElement)) return;
        const id = getMessageId(mesElement);
        if (id === null) return;
        oldestExistingId = Math.min(oldestExistingId, id);
        newestExistingId = Math.max(newestExistingId, id);
    });

    const minAddedId = Math.min(...addedIds);
    const maxAddedId = Math.max(...addedIds);
    if (Number.isFinite(oldestExistingId) && minAddedId < oldestExistingId) return true;

    const insertedBeforeExistingMessage = addedMessages.some((mesElement) => {
        const id = getMessageId(mesElement);
        const nextId = getNextExistingMessageId(mesElement, addedSet);
        return id !== null && nextId !== null && id < nextId;
    });
    if (insertedBeforeExistingMessage) return true;

    const chat = document.getElementById('chat');
    const nearTop = chat instanceof HTMLElement && chat.scrollTop <= HISTORY_BACKFILL_TOP_THRESHOLD;
    return nearTop &&
        addedMessages.length >= 3 &&
        newestExistingId >= 0 &&
        maxAddedId < newestExistingId - 1;
}

function isHistoryBackfillActive() {
    return Date.now() < historyBackfillUntil;
}

function isProgrammaticScrollQuiet() {
    return Date.now() < programmaticScrollQuietUntil;
}

function beginProgrammaticScrollQuietPeriod() {
    programmaticScrollQuietUntil = Date.now() + PROGRAMMATIC_SCROLL_QUIET_MS;
}

function beginHistoryBackfillQuietPeriod(_reason = 'history-backfill') {
    if (!isAllMessagesVirtualizationEnabled()) return false;
    historyBackfillUntil = Math.max(historyBackfillUntil, Date.now() + HISTORY_BACKFILL_SETTLE_MS);
    cancelAllMessagesVirtualBatch();
    scheduleHistoryBackfillFlush();
    return true;
}

function queueHistoryBackfillRefresh({ display = false, virtualization = false } = {}) {
    if (!beginHistoryBackfillQuietPeriod('queued-refresh')) return false;
    historyBackfillPendingDisplay = historyBackfillPendingDisplay || display;
    historyBackfillPendingVirtualization = historyBackfillPendingVirtualization || virtualization;
    return true;
}

function scheduleHistoryBackfillFlush() {
    if (historyBackfillTimer) clearTimeout(historyBackfillTimer);
    const delay = Math.max(0, historyBackfillUntil - Date.now());
    historyBackfillTimer = window.setTimeout(flushHistoryBackfillRefresh, delay);
}

function flushHistoryBackfillRefresh() {
    historyBackfillTimer = null;
    if (isHistoryBackfillActive()) {
        scheduleHistoryBackfillFlush();
        return;
    }

    const shouldDisplay = historyBackfillPendingDisplay;
    const shouldVirtualize = historyBackfillPendingVirtualization;
    historyBackfillPendingDisplay = false;
    historyBackfillPendingVirtualization = false;
    historyBackfillUntil = 0;

    if (!state.isActive) return;
    if (shouldDisplay) {
        moveAvatarWrappers();
        updateMessageDisplay();
    } else if (shouldVirtualize) {
        scheduleVirtualizationAfterChatRender('history-backfill-settled');
    }
    updateScrollButtonsVisibility();
}

function clearHistoryBackfillState() {
    historyBackfillUntil = 0;
    historyBackfillPendingDisplay = false;
    historyBackfillPendingVirtualization = false;
    if (historyBackfillTimer) {
        clearTimeout(historyBackfillTimer);
        historyBackfillTimer = null;
    }
}

function updateControlState() {
    const enabled = isGlobalEnabled();
    $('#xiaobaix_immersive_enabled').prop('disabled', !enabled).toggleClass('disabled-control', !enabled);
}

function bindSettingsEvents() {
    if (state.eventsBound) return;
    setTimeout(() => {
        const checkbox = document.getElementById('xiaobaix_immersive_enabled');
        if (checkbox && !state.eventsBound) {
            checkbox.checked = getSettings().enabled;
            checkbox.addEventListener('change', () => setImmersiveMode(checkbox.checked));
            state.eventsBound = true;
        }
    }, 500);
}

function unbindSettingsEvents() {
    const checkbox = document.getElementById('xiaobaix_immersive_enabled');
    if (checkbox) {
        const newCheckbox = checkbox.cloneNode(true);
        checkbox.parentNode.replaceChild(newCheckbox, checkbox);
    }
    state.eventsBound = false;
}

function setImmersiveMode(enabled) {
    const settings = getSettings();
    settings.enabled = enabled;
    state.isActive = enabled;

    const checkbox = document.getElementById('xiaobaix_immersive_enabled');
    if (checkbox) checkbox.checked = enabled;

    enabled ? enableImmersiveMode() : disableImmersiveMode();
    if (!enabled) cleanup();
    saveSettingsDebounced();
}

function toggleImmersiveMode() {
    if (!isGlobalEnabled()) return;
    setImmersiveMode(!getSettings().enabled);
}

function bindMessageEvents() {
    if (state.messageEventsBound) return;
    const onUserMessage = () => {
        if (!state.isActive) return;
        updateMessageDisplay();
        scrollToBottom(true);
    };
    const onAIMessage = () => {
        if (!state.isActive) return;
        updateMessageDisplay();
        if (getSettings().autoJumpOnAI) {
            scrollToBottom(true);
        }
    };
    const onMessageChange = () => {
        if (!state.isActive) return;
        if (isHistoryBackfillActive()) {
            queueHistoryBackfillRefresh({ display: true, virtualization: true });
            return;
        }
        updateMessageDisplay();
    };
    const onMoreMessagesLoaded = () => {
        if (!state.isActive) return;
        queueHistoryBackfillRefresh({ display: true, virtualization: true });
    };
    messageEvents.on(event_types.MESSAGE_SENT, onUserMessage);
    messageEvents.on(event_types.MESSAGE_RECEIVED, onAIMessage);
    messageEvents.on(event_types.MESSAGE_DELETED, onMessageChange);
    messageEvents.on(event_types.MESSAGE_UPDATED, onMessageChange);
    messageEvents.on(event_types.MESSAGE_SWIPED, onMessageChange);
    messageEvents.on(event_types.GENERATION_ENDED, onAIMessage);
    messageEvents.on(event_types.MORE_MESSAGES_LOADED, onMoreMessagesLoaded);
    state.messageEventsBound = true;
}

function unbindMessageEvents() {
    if (!state.messageEventsBound) return;
    messageEvents.cleanup();
    state.messageEventsBound = false;
}

function injectImmersiveStyles() {
    let style = document.getElementById('immersive-style-tag');
    if (!style) {
        style = document.createElement('style');
        style.id = 'immersive-style-tag';
        document.head.appendChild(style);
    }
    style.textContent = `
        body.immersive-mode.immersive-single #show_more_messages { display: none !important; }
        
        .immersive-scroll-helpers {
            position: fixed;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            z-index: 150;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.25s ease;
        }
        
        .immersive-scroll-helpers.active {
            opacity: 1;
        }
        
        .immersive-scroll-btn {
            width: 32px;
            height: 32px;
            background: var(--SmartThemeBlurTintColor, rgba(20, 20, 20, 0.7));
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--SmartThemeBorderColor, rgba(255, 255, 255, 0.1));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--SmartThemeBodyColor, rgba(255, 255, 255, 0.85));
            font-size: 12px;
            cursor: pointer;
            pointer-events: none;
            opacity: 0;
            transform: scale(0.8) translateX(8px);
            transition: all 0.2s ease;
        }
        
        .immersive-scroll-btn.visible {
            opacity: 1;
            pointer-events: auto;
            transform: scale(1) translateX(0);
        }
        
        .immersive-scroll-btn:hover {
            background: var(--SmartThemeBlurTintColor, rgba(50, 50, 50, 0.9));
            transform: scale(1.1) translateX(0);
        }
        
        .immersive-scroll-btn:active {
            transform: scale(0.95) translateX(0);
        }
        
        @media screen and (max-width: 1000px) {
            .immersive-scroll-btn {
                width: 28px;
                height: 28px;
                font-size: 11px;
            }
        }
    `;
}

function applyModeClasses() {
    const settings = getSettings();
    $('body')
        .toggleClass('immersive-single', !settings.showAllMessages)
        .toggleClass('immersive-all', settings.showAllMessages);
}

function enableImmersiveMode() {
    if (!isGlobalEnabled()) return;

    injectImmersiveStyles();
    $('body').addClass('immersive-mode');
    applyModeClasses();
    moveAvatarWrappers();
    bindMessageEvents();
    bindSendFocusGuard();
    updateMessageDisplay();
    setupDOMObserver();
    setupScrollHelpers();
}

function disableImmersiveMode() {
    $('body').removeClass('immersive-mode immersive-single immersive-all');
    clearAllMessagesVirtualization();
    restoreAvatarWrappers();
    $(SEL.mes).show();
    hideNavigationButtons();
    $('.swipe_left, .swipeRightBlock').show();
    unbindMessageEvents();
    unbindSendFocusGuard();
    detachResizeObserver();
    destroyDOMObserver();
    removeScrollHelpers();
}

// ==================== 滚动辅助功能 ====================

function setupScrollHelpers() {
    if (document.getElementById('immersive-scroll-helpers')) return;

    const container = document.createElement('div');
    container.id = 'immersive-scroll-helpers';
    container.className = 'immersive-scroll-helpers';
    container.innerHTML = `
        <div class="immersive-scroll-btn scroll-to-top" title="回到顶部">
            <i class="fa-solid fa-chevron-up"></i>
        </div>
        <div class="immersive-scroll-btn scroll-to-bottom" title="回到底部">
            <i class="fa-solid fa-chevron-down"></i>
        </div>
    `;

    document.body.appendChild(container);

    container.querySelector('.scroll-to-top').addEventListener('click', (e) => {
        e.stopPropagation();
        const chat = document.getElementById('chat');
        if (chat) {
            beginProgrammaticScrollQuietPeriod();
            chat.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    container.querySelector('.scroll-to-bottom').addEventListener('click', (e) => {
        e.stopPropagation();
        const chat = document.getElementById('chat');
        if (chat) {
            beginProgrammaticScrollQuietPeriod();
            chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
        }
    });

    const chat = document.getElementById('chat');
    if (chat) {
        chat.addEventListener('scroll', onChatScroll, { passive: true });
    }

    updateScrollHelpersPosition();
    window.addEventListener('resize', updateScrollHelpersPosition);
}

function updateScrollHelpersPosition() {
    const container = document.getElementById('immersive-scroll-helpers');
    const chat = document.getElementById('chat');
    if (!container || !chat) return;

    const rect = chat.getBoundingClientRect();
    const padding = rect.height * 0.12;

    container.style.right = `${window.innerWidth - rect.right + 8}px`;
    container.style.top = `${rect.top + padding}px`;
    container.style.height = `${rect.height - padding * 2}px`;
}

function removeScrollHelpers() {
    if (state.scrollHideTimer) {
        clearTimeout(state.scrollHideTimer);
        state.scrollHideTimer = null;
    }

    const container = document.getElementById('immersive-scroll-helpers');
    if (container) container.remove();

    const chat = document.getElementById('chat');
    if (chat) {
        chat.removeEventListener('scroll', onChatScroll);
    }

    window.removeEventListener('resize', updateScrollHelpersPosition);
    state.scrollTicking = false;
}

function onChatScroll() {
    if (!state.scrollTicking) {
        requestAnimationFrame(() => {
            updateScrollButtonsVisibility();
            hydrateMessagesNearViewport();
            if (!isHistoryBackfillActive() && !isProgrammaticScrollQuiet()) {
                showScrollHelpers();
                scheduleHideScrollHelpers();
            }
            state.scrollTicking = false;
        });
        state.scrollTicking = true;
    }
}

function updateScrollButtonsVisibility() {
    const chat = document.getElementById('chat');
    const topBtn = document.querySelector('.immersive-scroll-btn.scroll-to-top');
    const btmBtn = document.querySelector('.immersive-scroll-btn.scroll-to-bottom');

    if (!chat || !topBtn || !btmBtn) return;

    const scrollTop = chat.scrollTop;
    const scrollHeight = chat.scrollHeight;
    const clientHeight = chat.clientHeight;
    const threshold = 80;

    topBtn.classList.toggle('visible', scrollTop > threshold);
    btmBtn.classList.toggle('visible', scrollHeight - scrollTop - clientHeight > threshold);
}

function showScrollHelpers() {
    const container = document.getElementById('immersive-scroll-helpers');
    if (container) container.classList.add('active');
}

function hideScrollHelpers() {
    const container = document.getElementById('immersive-scroll-helpers');
    if (container) container.classList.remove('active');
}

function scheduleHideScrollHelpers() {
    if (state.scrollHideTimer) clearTimeout(state.scrollHideTimer);
    state.scrollHideTimer = setTimeout(() => {
        hideScrollHelpers();
        state.scrollHideTimer = null;
    }, 1500);
}

// ==================== 多楼层轻量渲染 ====================

function supportsAllMessagesVirtualization() {
    return typeof CSS !== 'undefined' &&
        typeof CSS.supports === 'function' &&
        typeof IntersectionObserver !== 'undefined' &&
        CSS.supports('content-visibility', 'auto');
}

function isAllMessagesVirtualizationEnabled() {
    if (!state.isActive || !supportsAllMessagesVirtualization()) return false;
    const settings = getSettings();
    return !!settings.showAllMessages;
}

function getNewestMessageId() {
    const messages = document.querySelectorAll(SEL.mes);
    let newest = -1;
    messages.forEach((mes) => {
        const id = Number(mes.getAttribute('mesid'));
        if (Number.isFinite(id) && id > newest) newest = id;
    });
    return newest;
}

function isProtectedMessage(mesElement) {
    if (!mesElement || !(mesElement instanceof HTMLElement)) return true;
    const mesId = Number(mesElement.getAttribute('mesid'));
    const newestId = allMessagesVirtualNewestId >= 0 ? allMessagesVirtualNewestId : getNewestMessageId();
    if (!Number.isFinite(mesId) || newestId < 0) return true;
    if (mesId >= newestId - ALL_MESSAGES_VIRTUAL_KEEP_RECENT + 1) return true;
    if (mesElement.classList.contains('last_mes')) return true;
    if (mesElement.classList.contains('editing')) return true;
    if (mesElement.querySelector('.immersive-navigation')) return true;
    if (document.activeElement && mesElement.contains(document.activeElement)) return true;
    return !!mesElement.querySelector(
        'textarea.edit_textarea, textarea.reasoning_edit_textarea, .mes_edit_buttons:focus-within, .mes_edit:focus-within'
    );
}

function hasUnstableMediaContent(mesElement) {
    return !!mesElement?.querySelector?.(ALL_MESSAGES_VIRTUAL_MEDIA_SELECTOR);
}

function isMessageNearViewport(mesElement, chatRect = null) {
    const chat = document.getElementById('chat');
    if (!chat || !mesElement) return true;
    const rootRect = chatRect || chat.getBoundingClientRect();
    const rect = mesElement.getBoundingClientRect();
    const margin = parseInt(ALL_MESSAGES_VIRTUAL_ROOT_MARGIN, 10) || 1600;
    return rect.bottom >= rootRect.top - margin && rect.top <= rootRect.bottom + margin;
}

function hydrateMessage(mesElement) {
    if (!mesElement) return;
    mesElement.classList.remove('immersive-virtualized-message');
    mesElement.style.removeProperty('--immersive-message-height');
}

function virtualizeMessage(mesElement, options = {}) {
    const { forceRemeasure = false } = options;
    if (!isAllMessagesVirtualizationEnabled() || isProtectedMessage(mesElement) || hasUnstableMediaContent(mesElement)) {
        hydrateMessage(mesElement);
        return;
    }
    if (isHistoryBackfillActive()) return;

    if (forceRemeasure && mesElement.classList.contains('immersive-virtualized-message')) {
        hydrateMessage(mesElement);
    }

    if (!mesElement.classList.contains('immersive-virtualized-message')) {
        const height = Math.max(
            Math.ceil(mesElement.getBoundingClientRect().height || mesElement.offsetHeight || 0),
            ALL_MESSAGES_VIRTUAL_MIN_HEIGHT
        );
        mesElement.style.setProperty('--immersive-message-height', `${height}px`);
        mesElement.classList.add('immersive-virtualized-message');
    }
}

function handleAllMessagesVirtualEntries(entries) {
    if (!isAllMessagesVirtualizationEnabled()) {
        clearAllMessagesVirtualization();
        return;
    }

    allMessagesVirtualNewestId = getNewestMessageId();
    entries.forEach((entry) => {
        const mesElement = entry.target;
        if (entry.isIntersecting || isProtectedMessage(mesElement) || hasUnstableMediaContent(mesElement)) {
            hydrateMessage(mesElement);
        } else {
            virtualizeMessage(mesElement);
        }
    });
}

function hydrateMessagesNearViewport() {
    if (!isAllMessagesVirtualizationEnabled()) return;
    const chat = document.getElementById('chat');
    if (!chat) return;
    const chatRect = chat.getBoundingClientRect();
    document.querySelectorAll(`${SEL.mes}.immersive-virtualized-message`).forEach((mesElement) => {
        if (isMessageNearViewport(mesElement, chatRect) || isProtectedMessage(mesElement) || hasUnstableMediaContent(mesElement)) {
            hydrateMessage(mesElement);
        }
    });
}

function cancelAllMessagesVirtualBatch() {
    allMessagesVirtualBatchToken++;
    if (allMessagesVirtualBatchTimer) {
        cancelAnimationFrame(allMessagesVirtualBatchTimer);
        allMessagesVirtualBatchTimer = null;
    }
}

function runVirtualizationBatch(queue, token) {
    if (token !== allMessagesVirtualBatchToken || !isAllMessagesVirtualizationEnabled()) return;
    const chat = document.getElementById('chat');
    if (!chat) return;
    const chatRect = chat.getBoundingClientRect();
    let processed = 0;

    while (queue.length && processed < ALL_MESSAGES_VIRTUAL_BATCH_SIZE) {
        const mesElement = queue.shift();
        if (!mesElement?.isConnected) continue;
        if (isProtectedMessage(mesElement) || hasUnstableMediaContent(mesElement) || isMessageNearViewport(mesElement, chatRect)) {
            hydrateMessage(mesElement);
        } else {
            virtualizeMessage(mesElement, { forceRemeasure: true });
        }
        processed++;
    }

    if (queue.length) {
        allMessagesVirtualBatchTimer = requestAnimationFrame(() => runVirtualizationBatch(queue, token));
    } else {
        allMessagesVirtualBatchTimer = null;
    }
}

function startVirtualizationBatch(messageElements) {
    cancelAllMessagesVirtualBatch();
    const queue = Array.from(messageElements);
    const token = allMessagesVirtualBatchToken;
    allMessagesVirtualBatchTimer = requestAnimationFrame(() => runVirtualizationBatch(queue, token));
}

function refreshAllMessagesVirtualization() {
    allMessagesVirtualRefreshTimer = null;
    if (isHistoryBackfillActive()) {
        queueHistoryBackfillRefresh({ virtualization: true });
        return;
    }
    if (!isAllMessagesVirtualizationEnabled()) {
        clearAllMessagesVirtualization();
        return;
    }

    const chat = document.getElementById('chat');
    if (!chat) {
        clearAllMessagesVirtualization();
        return;
    }
    allMessagesVirtualNewestId = getNewestMessageId();

    if (!allMessagesVirtualObserver) {
        allMessagesVirtualObserver = new IntersectionObserver(handleAllMessagesVirtualEntries, {
            root: chat,
            rootMargin: ALL_MESSAGES_VIRTUAL_ROOT_MARGIN,
            threshold: 0,
        });
    } else {
        allMessagesVirtualObserver.disconnect();
    }

    const messageElements = document.querySelectorAll(SEL.mes);
    document.querySelectorAll(`${SEL.mes}.immersive-virtualized-message`).forEach((mesElement) => {
        if (hasUnstableMediaContent(mesElement)) hydrateMessage(mesElement);
    });

    messageElements.forEach((mesElement) => {
        if (isProtectedMessage(mesElement) || hasUnstableMediaContent(mesElement)) {
            hydrateMessage(mesElement);
            return;
        }
        allMessagesVirtualObserver.observe(mesElement);
    });

    startVirtualizationBatch(messageElements);
}

function scheduleAllMessagesVirtualRefresh(delayMs = 0) {
    if (!isAllMessagesVirtualizationEnabled()) return;
    if (isHistoryBackfillActive()) {
        queueHistoryBackfillRefresh({ virtualization: true });
        return;
    }
    if (allMessagesVirtualRefreshTimer) clearTimeout(allMessagesVirtualRefreshTimer);
    allMessagesVirtualRefreshTimer = window.setTimeout(refreshAllMessagesVirtualization, delayMs);
}

function clearAllMessagesVirtualization() {
    clearHistoryBackfillState();
    allMessagesVirtualRenderToken++;
    if (allMessagesVirtualRefreshTimer) {
        clearTimeout(allMessagesVirtualRefreshTimer);
        allMessagesVirtualRefreshTimer = null;
    }
    cancelAllMessagesVirtualBatch();

    if (allMessagesVirtualObserver) {
        allMessagesVirtualObserver.disconnect();
        allMessagesVirtualObserver = null;
    }
    allMessagesVirtualNewestId = -1;

    document.querySelectorAll(`${SEL.mes}.immersive-virtualized-message`).forEach(hydrateMessage);
}

function scheduleVirtualizationAfterChatRender(_reason = 'update') {
    if (!isAllMessagesVirtualizationEnabled()) return;
    if (isHistoryBackfillActive()) {
        queueHistoryBackfillRefresh({ virtualization: true });
        return;
    }
    const token = ++allMessagesVirtualRenderToken;
    let remainingFrames = ALL_MESSAGES_VIRTUAL_POST_RENDER_FRAMES;
    const waitForStableFrame = () => {
        if (token !== allMessagesVirtualRenderToken) return;
        if (!isAllMessagesVirtualizationEnabled()) return;
        if (remainingFrames > 0) {
            remainingFrames--;
            requestAnimationFrame(waitForStableFrame);
            return;
        }
        scheduleAllMessagesVirtualRefresh(0);
    };
    requestAnimationFrame(waitForStableFrame);
}

// ==================== 消息显示逻辑 ====================

function moveAvatarWrappers() {
    $(SEL.mes).each(function () { processSingleMessage(this); });
}

function restoreAvatarWrappers() {
    $(SEL.mes).each(function () {
        const $mes = $(this);
        const $avatarWrapper = $mes.find('.mesAvatarWrapper');
        const $verticalWrapper = $mes.find('.xiaobaix-vertical-wrapper');

        if ($avatarWrapper.length && !$avatarWrapper.parent().hasClass('mes')) {
            $mes.prepend($avatarWrapper);
        }

        if ($verticalWrapper.length) {
            const $chName = $mes.find('.ch_name.flex-container.justifySpaceBetween');
            const $flexContainer = $mes.find('.flex-container.flex1.alignitemscenter');
            const $nameText = $mes.find('.name_text');

            if ($flexContainer.length && $chName.length) $chName.prepend($flexContainer);
            if ($nameText.length) {
                const $originalContainer = $mes.find('.flex-container.alignItemsBaseline');
                if ($originalContainer.length) $originalContainer.prepend($nameText);
            }
            $verticalWrapper.remove();
        }
    });
}

function findLastAIMessage() {
    const $aiMessages = $(SEL.ai);
    return $aiMessages.length ? $($aiMessages.last()) : null;
}

function showSingleModeMessages() {
    const $messages = $(SEL.mes);
    if (!$messages.length) return;

    $messages.hide();

    const $targetAI = findLastAIMessage();
    if ($targetAI?.length) {
        $targetAI.show();

        const $prevMessage = $targetAI.prevAll('.mes').first();
        if ($prevMessage.length) {
            const isUserMessage = $prevMessage.attr('is_user') === 'true';
            if (isUserMessage) {
                $prevMessage.show();
            }
        }

        $targetAI.nextAll('.mes').show();
        addNavigationToLastTwoMessages();
    } else {
        const $lastMessages = $messages.slice(-2);
        if ($lastMessages.length) {
            $lastMessages.show();
            addNavigationToLastTwoMessages();
        }
    }
}

function addNavigationToLastTwoMessages() {
    hideNavigationButtons();

    const $visibleMessages = $(`${SEL.mes}:visible`);
    const messageCount = $visibleMessages.length;

    if (messageCount >= 2) {
        const $lastTwo = $visibleMessages.slice(-2);
        $lastTwo.each(function () {
            showNavigationButtons($(this));
            updateSwipesCounter($(this));
        });
    } else if (messageCount === 1) {
        const $single = $visibleMessages.last();
        showNavigationButtons($single);
        updateSwipesCounter($single);
    }
}

function updateMessageDisplay() {
    if (!state.isActive) return;

    const $messages = $(SEL.mes);
    if (!$messages.length) return;

    const settings = getSettings();
    if (settings.showAllMessages) {
        $messages.show();
        addNavigationToLastTwoMessages();
        scheduleVirtualizationAfterChatRender('display');
    } else {
        clearAllMessagesVirtualization();
        showSingleModeMessages();
    }
}

function showNavigationButtons($targetMes) {
    if (!isInChat()) return;

    $targetMes.find('.immersive-navigation').remove();

    const $verticalWrapper = $targetMes.find('.xiaobaix-vertical-wrapper');
    if (!$verticalWrapper.length) return;

    const settings = getSettings();
    const buttonText = settings.showAllMessages ? '切换：锁定单回合' : '切换：传统多楼层';
    const navigationHtml = `
        <div class="immersive-navigation">
            <button class="immersive-nav-btn immersive-swipe-left" title="左滑消息">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button class="immersive-nav-btn immersive-toggle" title="切换显示模式">
                |${buttonText}|
            </button>
            <button class="immersive-nav-btn immersive-swipe-right" title="右滑消息"
                    style="display: flex; align-items: center; gap: 1px;">
                <div class="swipes-counter" style="opacity: 0.7; justify-content: flex-end; margin-bottom: 0 !important;">
                    1&ZeroWidthSpace;/&ZeroWidthSpace;1
                </div>
                <span><i class="fa-solid fa-chevron-right"></i></span>
            </button>
        </div>
    `;

    $verticalWrapper.append(navigationHtml);

    $targetMes.find('.immersive-swipe-left').on('click', () => handleSwipe('.swipe_left', $targetMes));
    $targetMes.find('.immersive-toggle').on('click', toggleDisplayMode);
    $targetMes.find('.immersive-swipe-right').on('click', () => handleSwipe('.swipe_right', $targetMes));
}

const hideNavigationButtons = () => $('.immersive-navigation').remove();

function updateSwipesCounter($targetMes) {
    if (!state.isActive) return;

    const $swipesCounter = $targetMes.find('.swipes-counter');
    if (!$swipesCounter.length) return;

    const mesId = $targetMes.attr('mesid');

    if (mesId !== undefined) {
        try {
            const chat = getContext().chat;
            const mesIndex = parseInt(mesId);
            const message = chat?.[mesIndex];
            if (message?.swipes) {
                const currentSwipeIndex = message.swipe_id || 0;
                $swipesCounter.html(`${currentSwipeIndex + 1}&ZeroWidthSpace;/&ZeroWidthSpace;${message.swipes.length}`);
                return;
            }
        } catch (e) { /* ignore */ }
    }
    $swipesCounter.html('1&ZeroWidthSpace;/&ZeroWidthSpace;1');
}

function scheduleScrollToBottom(delayMs = 0) {
    window.setTimeout(() => {
        const chatContainer = document.getElementById('chat');
        if (!chatContainer) return;

        requestAnimationFrame(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
            requestAnimationFrame(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            });
        });
    }, delayMs);
}

function scrollToBottom(forceDelayed = false) {
    if (forceDelayed) {
        scheduleScrollToBottom(80);
        return;
    }

    const chatContainer = document.getElementById('chat');
    if (!chatContainer) return;

    chatContainer.scrollTop = chatContainer.scrollHeight;
    requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
}

function scheduleStableScrollToBottom() {
    [80, 260, 520].forEach(delay => scheduleScrollToBottom(delay));
}

function bindSendFocusGuard() {
    if (!state.isActive || state.sendFocusGuardBound) return;

    const sendControls = [
        document.getElementById('send_but') || document.getElementById('send_button'),
        document.getElementById('option_regenerate'),
        document.getElementById('option_continue'),
        document.getElementById('mes_continue'),
        document.getElementById('mes_impersonate'),
    ].filter(Boolean);

    if (!document.getElementById('send_textarea') || !sendControls.length) {
        window.setTimeout(() => {
            if (state.isActive) bindSendFocusGuard();
        }, 200);
        return;
    }

    const runPostSendCleanup = () => {
        if (!state.isActive) return;
        const textarea = document.getElementById('send_textarea');
        if (textarea && document.activeElement === textarea) {
            textarea.blur();
        }
        scheduleStableScrollToBottom();
    };

    const onSendClick = () => {
        clearTimeout(sendCleanupTimer);
        sendCleanupTimer = window.setTimeout(runPostSendCleanup, 0);
    };

    sendControls.forEach(control => control.addEventListener('click', onSendClick, true));

    state.sendFocusGuardBound = true;
    state.sendFocusGuardCleanup = () => {
        sendControls.forEach(control => control.removeEventListener('click', onSendClick, true));
        clearTimeout(sendCleanupTimer);
        sendCleanupTimer = null;
        state.sendFocusGuardBound = false;
        state.sendFocusGuardCleanup = null;
    };
}

function unbindSendFocusGuard() {
    state.sendFocusGuardCleanup?.();
}

function toggleDisplayMode() {
    if (!state.isActive) return;
    const settings = getSettings();
    settings.showAllMessages = !settings.showAllMessages;
    applyModeClasses();
    if (!settings.showAllMessages) {
        clearAllMessagesVirtualization();
    }
    updateMessageDisplay();
    saveSettingsDebounced();
    scrollToBottom();
}

function handleSwipe(swipeSelector, $targetMes) {
    if (!state.isActive) return;

    const $btn = $targetMes.find(swipeSelector);
    if ($btn.length) {
        $btn.click();
        setTimeout(() => {
            updateSwipesCounter($targetMes);
        }, 100);
    }
}

// ==================== 生命周期 ====================

function handleGlobalStateChange(event) {
    const enabled = event.detail.enabled;
    updateControlState();

    if (enabled) {
        const settings = getSettings();
        state.isActive = settings.enabled;
        if (state.isActive) enableImmersiveMode();
        bindSettingsEvents();
        setTimeout(() => {
            const checkbox = document.getElementById('xiaobaix_immersive_enabled');
            if (checkbox) checkbox.checked = settings.enabled;
        }, 100);
    } else {
        if (state.isActive) disableImmersiveMode();
        state.isActive = false;
        unbindSettingsEvents();
    }
}

function onChatChanged() {
    if (!isGlobalEnabled() || !state.isActive) return;

    setTimeout(() => {
        clearAllMessagesVirtualization();
        moveAvatarWrappers();
        updateMessageDisplay();
        updateScrollHelpersPosition();
    }, 100);
}

function cleanup() {
    if (state.isActive) disableImmersiveMode();
    destroyDOMObserver();

    baseEvents.cleanup();

    if (state.globalStateHandler) {
        document.removeEventListener('xiaobaixEnabledChanged', state.globalStateHandler);
    }

    unbindMessageEvents();
    detachResizeObserver();
    clearAllMessagesVirtualization();

    state = {
        isActive: false,
        eventsBound: false,
        messageEventsBound: false,
        globalStateHandler: null,
        scrollTicking: false,
        scrollHideTimer: null,
        sendFocusGuardBound: false,
        sendFocusGuardCleanup: null
    };
    sendCleanupTimer = null;
}

function detachResizeObserver() {
    if (resizeObs && resizeObservedEl) {
        resizeObs.unobserve(resizeObservedEl);
    }
    resizeObservedEl = null;
}

function destroyDOMObserver() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}

export { initImmersiveMode, toggleImmersiveMode };
