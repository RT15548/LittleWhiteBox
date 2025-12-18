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
 globalStateHandler: null
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

 const refreshOnAI = () => state.isActive && updateMessageDisplay();

 messageEvents.on(event_types.MESSAGE_SENT, () => {});
 messageEvents.on(event_types.MESSAGE_RECEIVED, refreshOnAI);
 messageEvents.on(event_types.MESSAGE_DELETED, () => {});
 messageEvents.on(event_types.MESSAGE_UPDATED, refreshOnAI);
 messageEvents.on(event_types.MESSAGE_SWIPED, refreshOnAI);
 if (event_types.GENERATION_STARTED) {
   messageEvents.on(event_types.GENERATION_STARTED, () => {});
 }
 messageEvents.on(event_types.GENERATION_ENDED, refreshOnAI);

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
}

function moveAvatarWrappers() {
 $(SEL.mes).each(function() { processSingleMessage(this); });
}

function restoreAvatarWrappers() {
 $(SEL.mes).each(function() {
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

   const $prevUser = $targetAI.prevAll('.mes[is_user="true"]').first();
   if ($prevUser.length) {
     $prevUser.show();
   }

   $targetAI.nextAll('.mes').show();

   addNavigationToLastTwoMessages();
 }
}

function addNavigationToLastTwoMessages() {
 hideNavigationButtons();

 const $visibleMessages = $(`${SEL.mes}:visible`);
 const messageCount = $visibleMessages.length;

 if (messageCount >= 2) {
   const $lastTwo = $visibleMessages.slice(-2);
   $lastTwo.each(function() {
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
   } catch {}
 }
 $swipesCounter.html('1&ZeroWidthSpace;/&ZeroWidthSpace;1');
}

function toggleDisplayMode() {
 if (!state.isActive) return;

 const settings = getSettings();
 settings.showAllMessages = !settings.showAllMessages;
 applyModeClasses();
 updateMessageDisplay();
 saveSettingsDebounced();
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
   globalStateHandler: null
 };
}

function attachResizeObserverTo(el) {
 if (!el) return;

 if (!resizeObs) {
   resizeObs = new ResizeObserver(() => {});
 }

 if (resizeObservedEl) detachResizeObserver();
 resizeObservedEl = el;
 resizeObs.observe(el);
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
