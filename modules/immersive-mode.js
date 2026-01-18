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

const baseEvents = createModuleEvents('immersiveMode');
const messageEvents = createModuleEvents('immersiveMode:messages');

let state = {
    isActive: false,
    eventsBound: false,
    messageEventsBound: false,
    globalStateHandler: null,
    scrollTicking: false,
    scrollHideTimer: null
};

let observer = null;
let resizeObs = null;
let resizeObservedEl = null;
let recalcT = null;

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

        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes?.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList?.contains('mes')) {
                        processSingleMessage(node);
                        if (node.getAttribute('is_user') === 'false' && node.getAttribute('is_system') === 'false') {
                            hasNewAI = true;
                        }
                    }
                });
            }
        }

        if (hasNewAI) {
            if (recalcT) clearTimeout(recalcT);
            recalcT = setTimeout(updateMessageDisplay, 20);
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
        scrollToBottom();
    };
    const onAIMessage = () => {
        if (!state.isActive) return;
        updateMessageDisplay();
        if (getSettings().autoJumpOnAI) {
            scrollToBottom();
        }
    };
    const onMessageChange = () => {
        if (!state.isActive) return;
        updateMessageDisplay();
    };
    messageEvents.on(event_types.MESSAGE_SENT, onUserMessage);
    messageEvents.on(event_types.MESSAGE_RECEIVED, onAIMessage);
    messageEvents.on(event_types.MESSAGE_DELETED, onMessageChange);
    messageEvents.on(event_types.MESSAGE_UPDATED, onMessageChange);
    messageEvents.on(event_types.MESSAGE_SWIPED, onMessageChange);
    messageEvents.on(event_types.GENERATION_ENDED, onAIMessage);
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
    updateMessageDisplay();
    setupDOMObserver();
    setupScrollHelpers();
}

function disableImmersiveMode() {
    $('body').removeClass('immersive-mode immersive-single immersive-all');
    restoreAvatarWrappers();
    $(SEL.mes).show();
    hideNavigationButtons();
    $('.swipe_left, .swipeRightBlock').show();
    unbindMessageEvents();
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
        if (chat) chat.scrollTo({ top: 0, behavior: 'smooth' });
    });

    container.querySelector('.scroll-to-bottom').addEventListener('click', (e) => {
        e.stopPropagation();
        const chat = document.getElementById('chat');
        if (chat) chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
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
            showScrollHelpers();
            scheduleHideScrollHelpers();
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
    } else {
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

function scrollToBottom() {
    const chatContainer = document.getElementById('chat');
    if (!chatContainer) return;

    chatContainer.scrollTop = chatContainer.scrollHeight;
    requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
}

function toggleDisplayMode() {
    if (!state.isActive) return;
    const settings = getSettings();
    settings.showAllMessages = !settings.showAllMessages;
    applyModeClasses();
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

    state = {
        isActive: false,
        eventsBound: false,
        messageEventsBound: false,
        globalStateHandler: null,
        scrollTicking: false,
        scrollHideTimer: null
    };
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
