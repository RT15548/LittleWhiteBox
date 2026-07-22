<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { captureElementScrollState, restoreElementScrollState, type ElementScrollSnapshot } from '../../scroll-state';
import TavernContractModal from './TavernContractModal.vue';
import {
    useTavernCharacterContext,
    useTavernChatContext,
    useTavernManagerContext,
    useTavernPhoneContext,
    useTavernSessionContext,
    useTavernSettingsContext,
    useTavernShellContext,
    useTavernWorkspaceContext,
    type TavernChatWorkspacePanelKey,
} from '../tavern-app-context';
import TavernCharacterWorkspacePanel from '../TavernCharacterWorkspacePanel.vue';
import TavernAssistantContextButton from './TavernAssistantContextButton.vue';
import TavernAssistantPresetSettingsPanel from '../settings/TavernAssistantPresetSettingsPanel.vue';
import TavernBaseSettingsPanel from '../settings/TavernBaseSettingsPanel.vue';
import TavernChatPresetSettingsPanel from '../settings/TavernChatPresetSettingsPanel.vue';
import TavernConversationPanel from './TavernConversationPanel.vue';
import TavernDrawCapsule from './TavernDrawCapsule.vue';
import TavernManagerPanel from './TavernManagerPanel.vue';
import TavernRegexSettingsPanel from '../settings/TavernRegexSettingsPanel.vue';
import TavernWorkspacePanel from './TavernWorkspacePanel.vue';
import TavernWorldbooksSettingsPanel from '../settings/TavernWorldbooksSettingsPanel.vue';
import {
    normalizeTavernSessionContract,
    type TavernContractPermissionKey,
    type TavernSessionContract,
} from '../../../shared/session-contract';
import {
    DEFAULT_XB_TAVERN_AUTHOR_NOTE,
    XBTavernAuthorNotePosition,
    XBTavernPromptRole,
    normalizeXbTavernAuthorNote,
    type XbTavernAuthorNote,
} from '../../../shared/message-assembler';
import { useTavernMediaQuery } from '../useTavernMediaQuery';
import TavernPhoneOsOverlay from '../phone-os/TavernPhoneOsOverlay.vue';

const shell = useTavernShellContext();
const character = useTavernCharacterContext();
const chat = useTavernChatContext();
const manager = useTavernManagerContext();
const phone = useTavernPhoneContext();
const session = useTavernSessionContext();
const settings = useTavernSettingsContext();
const workspace = useTavernWorkspaceContext();
const {
    activeView,
    chatFocus,
    homeThemeDark,
    rememberBrokenAvatar,
} = shell;
const {
    chatLayout,
    currentAuthorNote,
    displayCharacterName,
    saveCurrentAuthorNote,
    visibleCharacterAvatar,
} = chat;
const {
    selectedSessionId,
} = session;
const {
    openPhone,
} = phone;
const phoneOpen = phone.os.isOpen;
const {
    assistantChatContextLabel,
    assistantChatContextUsage,
    canClearAssistantChat,
    clearAssistantChatHistory,
    isManagerAssistantRunning,
    managerScrollRef,
    updateManagerScrollButtons,
    visibleManagerChatItems,
} = manager;
const {
    chatWorkspacePanel,
    saveSessionContract,
    sessionContract,
} = workspace;
const {
    activeSettingsWorkspace,
    apiSettingsRootRef,
    loadTavernUsers,
    refreshPresets,
    refreshRegexFromHost,
    syncChatPresetFromHost,
    syncGlobalWorldbooksFromHost,
    syncWorldbooksForCurrentCharacter,
} = settings;
const {
    clearSelection: clearCharacterSelection,
    refresh: refreshCharacterList,
} = character;

type ChatQuickWorkspace =
    | 'characters'
    | 'api'
    | 'chatPreset'
    | 'assistantPreset'
    | 'worldbooks'
    | 'regex'
    | 'base';

let pendingManagerScrollSnapshot: ElementScrollSnapshot | null = null;
const contractModalOpen = ref(false);
const quickSettingsOpen = ref<ChatQuickWorkspace | null>(null);
const chatAppMenuOpen = ref(false);
const desktopChatAppMenuRef = ref<HTMLElement | null>(null);
const mobileChatAppMenuRef = ref<HTMLElement | null>(null);
const contractSaving = ref(false);
const contractError = ref('');
const contractDraft = ref<TavernSessionContract>(normalizeTavernSessionContract(sessionContract.value));
const authorNoteModalOpen = ref(false);
const authorNoteDraft = ref<XbTavernAuthorNote>(normalizeXbTavernAuthorNote(DEFAULT_XB_TAVERN_AUTHOR_NOTE));
const authorNoteSaving = ref(false);
const authorNoteStatus = ref('');
const mobileChatPanel = ref<'none' | 'workspace'>('none');
const memoryDirectoryOpen = ref(false);
const isMobileChatViewport = useTavernMediaQuery('(max-width: 760px)');

const contractDraftDirty = computed(() => JSON.stringify(contractDraft.value) !== JSON.stringify(sessionContract.value));
const shouldMountChatWorkspace = computed(() => !isMobileChatViewport.value || mobileChatPanel.value === 'workspace');
const managerPaneVisible = computed(() => activeView.value === 'chat' && chatFocus.value === 'manager');
const managerScrollAnchorSignature = computed(() => [
    ...visibleManagerChatItems.value.map((item) => `${item.kind}:${item.key}`),
].join('|'));

const authorNotePositionOptions = [
    { value: XBTavernAuthorNotePosition.AFTER_MAIN, label: '主提示词后' },
    { value: XBTavernAuthorNotePosition.BEFORE_MAIN, label: '主提示词前' },
    { value: XBTavernAuthorNotePosition.IN_CHAT, label: '聊天内 @ Depth' },
];
const authorNoteRoleOptions = [
    { value: XBTavernPromptRole.SYSTEM, label: 'System' },
    { value: XBTavernPromptRole.USER, label: 'User' },
    { value: XBTavernPromptRole.ASSISTANT, label: 'Assistant' },
];
const chatAppMenuItems: Array<{ key: ChatQuickWorkspace; label: string; mobileLabel: string }> = [
    { key: 'characters', label: '角色卡', mobileLabel: '角色卡' },
    { key: 'api', label: 'API 配置', mobileLabel: 'API 配置' },
    { key: 'chatPreset', label: '聊天预设', mobileLabel: '聊天预设' },
    { key: 'assistantPreset', label: '助手预设', mobileLabel: '助手预设' },
    { key: 'worldbooks', label: '世界书', mobileLabel: '世界书' },
    { key: 'regex', label: '正则', mobileLabel: '正则' },
    { key: 'base', label: '基础设置', mobileLabel: '基础设置' },
];

function closeMobileChatPanel() {
    closeChatAppMenu();
    mobileChatPanel.value = 'none';
    memoryDirectoryOpen.value = false;
}

async function clearAssistantChatFromTopbar() {
    closeMobileChatPanel();
    await clearAssistantChatHistory();
}

function toggleMobileWorkspacePanel(panel: TavernChatWorkspacePanelKey) {
    closeChatAppMenu();
    const sameOpenPanel = mobileChatPanel.value === 'workspace' && chatWorkspacePanel.value === panel;
    chatWorkspacePanel.value = panel;
    mobileChatPanel.value = sameOpenPanel ? 'none' : 'workspace';
    memoryDirectoryOpen.value = false;
}

function toggleMemoryDirectory() {
    closeChatAppMenu();
    memoryDirectoryOpen.value = !memoryDirectoryOpen.value;
}

function openContractModal() {
    closeChatAppMenu();
    contractError.value = '';
    contractDraft.value = normalizeTavernSessionContract(sessionContract.value);
    contractModalOpen.value = true;
}

function closeContractModal() {
    contractError.value = '';
    contractModalOpen.value = false;
}

const quickSettingsTitle = computed(() => {
    if (quickSettingsOpen.value === 'characters') {return '角色卡';}
    if (quickSettingsOpen.value === 'worldbooks') {return '世界书';}
    if (quickSettingsOpen.value === 'chatPreset') {return '聊天预设';}
    if (quickSettingsOpen.value === 'assistantPreset') {return '助手预设';}
    if (quickSettingsOpen.value === 'regex') {return '正则';}
    if (quickSettingsOpen.value === 'base') {return '基础设置';}
    return 'API 配置';
});

const quickSettingsLayoutClass = computed(() => (
    quickSettingsOpen.value ? `is-${quickSettingsOpen.value}-workspace` : ''
));

function closeChatAppMenu() {
    chatAppMenuOpen.value = false;
}

function toggleChatAppMenu() {
    chatAppMenuOpen.value = !chatAppMenuOpen.value;
}

function openChatAppWorkspace(workspace: ChatQuickWorkspace) {
    closeChatAppMenu();
    closeMobileChatPanel();
    activeSettingsWorkspace.value = workspace;
    quickSettingsOpen.value = workspace;
    if (workspace === 'characters') {
        clearCharacterSelection();
        void refreshCharacterList();
    }
    if (workspace === 'chatPreset') {
        void syncChatPresetFromHost();
    }
    if (workspace === 'assistantPreset') {
        void refreshPresets();
    }
    if (workspace === 'worldbooks') {
        void syncWorldbooksForCurrentCharacter();
        void syncGlobalWorldbooksFromHost();
    }
    if (workspace === 'regex') {
        void refreshRegexFromHost();
    }
    if (workspace === 'base') {
        void loadTavernUsers();
    }
}

function closeQuickSettingsModal() {
    quickSettingsOpen.value = null;
}

function openAuthorNoteModal() {
    closeMobileChatPanel();
    quickSettingsOpen.value = null;
    authorNoteDraft.value = normalizeXbTavernAuthorNote(currentAuthorNote.value);
    authorNoteStatus.value = '';
    authorNoteModalOpen.value = true;
}

function closeAuthorNoteModal() {
    authorNoteStatus.value = '';
    authorNoteModalOpen.value = false;
}

function patchAuthorNoteDraft(patch: Partial<XbTavernAuthorNote>) {
    authorNoteDraft.value = normalizeXbTavernAuthorNote({
        ...authorNoteDraft.value,
        ...patch,
    });
}

async function saveAuthorNoteDraft() {
    if (authorNoteSaving.value) {return;}
    authorNoteSaving.value = true;
    authorNoteStatus.value = '';
    try {
        const normalized = normalizeXbTavernAuthorNote(authorNoteDraft.value);
        await saveCurrentAuthorNote(normalized);
        authorNoteDraft.value = normalized;
        authorNoteStatus.value = '已保存';
    } catch (error) {
        authorNoteStatus.value = error instanceof Error ? error.message : String(error || '保存失败');
    } finally {
        authorNoteSaving.value = false;
    }
}

function setChatApiSettingsRootRef(element: Element | null) {
    apiSettingsRootRef.value = element instanceof HTMLElement ? element : null;
}

function handleChatAppMenuOutsidePointer(event: PointerEvent) {
    if (!chatAppMenuOpen.value) {return;}
    const target = event.target instanceof Node ? event.target : null;
    if (
        target
        && (
            desktopChatAppMenuRef.value?.contains(target)
            || mobileChatAppMenuRef.value?.contains(target)
        )
    ) {return;}
    closeChatAppMenu();
}

function handleChatAppMenuKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !chatAppMenuOpen.value) {return;}
    closeChatAppMenu();
}

function toggleContractDraft(key: TavernContractPermissionKey) {
    contractDraft.value = {
        ...contractDraft.value,
        [key]: !contractDraft.value[key],
    };
}

async function sealContract() {
    if (!selectedSessionId.value) {
        contractError.value = '';
        contractModalOpen.value = false;
        return;
    }
    contractError.value = '';
    contractSaving.value = true;
    try {
        const saved = await saveSessionContract(contractDraft.value);
        if (!saved) {
            throw new Error('contract_save_failed');
        }
        contractModalOpen.value = false;
    } catch {
        contractError.value = '契约保存失败，请重试。';
    } finally {
        contractSaving.value = false;
    }
}

watch(() => sessionContract.value, (value) => {
    if (contractModalOpen.value) {return;}
    contractDraft.value = normalizeTavernSessionContract(value);
}, { deep: true });

watch(() => selectedSessionId.value, () => {
    contractError.value = '';
    contractModalOpen.value = false;
    memoryDirectoryOpen.value = false;
    contractDraft.value = normalizeTavernSessionContract(sessionContract.value);
    if (quickSettingsOpen.value === 'characters') {
        quickSettingsOpen.value = null;
    }
});

watch(() => activeView.value, (view) => {
    closeChatAppMenu();
    if (view !== 'chat') {
        quickSettingsOpen.value = null;
        authorNoteModalOpen.value = false;
    }
});

watch(() => selectedSessionId.value, () => {
    authorNoteStatus.value = '';
    authorNoteModalOpen.value = false;
    authorNoteDraft.value = normalizeXbTavernAuthorNote(currentAuthorNote.value);
});

watch(managerScrollAnchorSignature, () => {
    pendingManagerScrollSnapshot = managerPaneVisible.value
        ? captureElementScrollState(managerScrollRef.value, {
            itemSelector: '[data-manager-anchor-key]',
            datasetKey: 'managerAnchorKey',
        })
        : null;
}, { flush: 'sync' });

watch(managerScrollAnchorSignature, () => {
    if (!pendingManagerScrollSnapshot) {return;}
    restoreElementScrollState(managerScrollRef.value, pendingManagerScrollSnapshot, {
        itemSelector: '[data-manager-anchor-key]',
        datasetKey: 'managerAnchorKey',
    }, {
        preserveScrollTop: true,
    });
    pendingManagerScrollSnapshot = null;
    updateManagerScrollButtons();
}, { flush: 'post' });

onMounted(() => {
    document.addEventListener('pointerdown', handleChatAppMenuOutsidePointer);
    document.addEventListener('keydown', handleChatAppMenuKeydown);
});

onUnmounted(() => {
    document.removeEventListener('pointerdown', handleChatAppMenuOutsidePointer);
    document.removeEventListener('keydown', handleChatAppMenuKeydown);
});

</script>

<template>
  <section
    v-if="activeView === 'chat'"
    class="tavern-chat xb-page"
    :class="[
      `chat-focus-${chatFocus}`,
      `chat-layout-${chatLayout}`,
      {
        'is-mobile-workspace-open': mobileChatPanel === 'workspace',
      },
    ]"
  >
    <div
      ref="desktopChatAppMenuRef"
      class="home-corner-actions page-corner-actions chat-app-menu-shell"
    >
      <button
        type="button"
        class="home-icon-button tavern-phone-launch-button"
        :class="{ 'is-active': phoneOpen }"
        title="打开手机"
        aria-label="打开手机"
        :disabled="!selectedSessionId"
        @click="openPhone"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect
            x="7"
            y="2.5"
            width="10"
            height="19"
            rx="2.5"
          />
          <path d="M10 5h4" />
          <path d="M11 18.5h2" />
        </svg>
      </button>
      <button
        type="button"
        class="home-icon-button home-theme-button"
        :title="homeThemeDark ? '切换到白天' : '切换到夜间'"
        :aria-label="homeThemeDark ? '切换到白天' : '切换到夜间'"
        @click="homeThemeDark = !homeThemeDark"
      >
        <svg
          v-if="homeThemeDark"
          class="xb-theme-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="4"
          />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
        <span
          v-else
          class="xb-theme-glyph"
          aria-hidden="true"
        >☾</span>
      </button>
      <button
        type="button"
        class="home-icon-button page-home-button"
        title="首页"
        aria-label="首页"
        @click="activeView = 'home'"
      >
        <svg
          class="xb-home-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10.5V20h13v-9.5" />
          <path d="M9.5 20v-5.5h5V20" />
        </svg>
      </button>
      <button
        type="button"
        class="home-icon-button chat-app-menu-button chat-app-menu-button-desktop"
        title="酒馆操作菜单"
        aria-label="酒馆操作菜单"
        :aria-expanded="chatAppMenuOpen"
        @click="toggleChatAppMenu"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M5 7h14" />
          <path d="M5 12h14" />
          <path d="M5 17h14" />
        </svg>
      </button>
      <div
        v-if="chatAppMenuOpen"
        class="chat-app-menu-popover chat-app-menu-popover-desktop"
        role="menu"
        aria-label="酒馆操作"
      >
        <button
          v-for="item in chatAppMenuItems"
          :key="item.key"
          type="button"
          class="chat-app-menu-item"
          role="menuitem"
          @click="openChatAppWorkspace(item.key)"
        >
          <span class="chat-app-menu-label-full">{{ item.label }}</span>
          <span class="chat-app-menu-label-mobile">{{ item.mobileLabel }}</span>
        </button>
      </div>
    </div>
    <header
      v-if="isMobileChatViewport"
      class="chat-mobile-topbar"
    >
      <div class="chat-mobile-primary-row">
        <div
          class="chat-mobile-segment"
          role="tablist"
          aria-label="聊天视图"
        >
          <span aria-hidden="true" />
          <button
            type="button"
            role="tab"
            :aria-selected="chatFocus === 'chat'"
            :class="{ active: chatFocus === 'chat' }"
            @click="chatFocus = 'chat'; closeMobileChatPanel()"
          >
            角色
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="chatFocus === 'manager'"
            :class="{ active: chatFocus === 'manager' }"
            @click="chatFocus = 'manager'; closeMobileChatPanel()"
          >
            助手
          </button>
        </div>
        <div class="chat-mobile-action-group">
          <TavernDrawCapsule
            v-if="chatFocus === 'chat'"
            mobile
          />
          <TavernAssistantContextButton
            v-else
            :label="assistantChatContextLabel"
            :usage="assistantChatContextUsage"
            :can-clear="canClearAssistantChat"
            :busy="isManagerAssistantRunning"
            mobile
            @clear="clearAssistantChatFromTopbar"
          />
          <button
            type="button"
            class="chat-mobile-icon-button chat-mobile-utility-button"
            title="契约"
            aria-label="契约"
            @click="closeMobileChatPanel(); openContractModal()"
          >
            <span
              class="chat-mobile-emoji"
              aria-hidden="true"
            >📜</span>
          </button>
          <button
            type="button"
            class="chat-mobile-icon-button chat-mobile-utility-button tavern-phone-launch-button"
            :class="{ 'is-active': phoneOpen }"
            title="打开手机"
            aria-label="打开手机"
            :disabled="!selectedSessionId"
            @click="closeMobileChatPanel(); openPhone()"
          >
            <svg
              class="chat-mobile-svg"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="7"
                y="2.5"
                width="10"
                height="19"
                rx="2.5"
              />
              <path d="M10 5h4" />
              <path d="M11 18.5h2" />
            </svg>
          </button>
          <div
            ref="mobileChatAppMenuRef"
            class="chat-app-menu-shell chat-app-menu-shell-mobile"
          >
            <button
              type="button"
              class="chat-mobile-icon-button chat-mobile-utility-button chat-app-menu-button"
              title="酒馆操作菜单"
              aria-label="酒馆操作菜单"
              :aria-expanded="chatAppMenuOpen"
              @click="toggleChatAppMenu"
            >
              <svg
                class="chat-mobile-svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 7h14" />
                <path d="M5 12h14" />
                <path d="M5 17h14" />
              </svg>
            </button>
            <div
              v-if="chatAppMenuOpen"
              class="chat-app-menu-popover"
              role="menu"
              aria-label="酒馆操作"
            >
              <button
                v-for="item in chatAppMenuItems"
                :key="item.key"
                type="button"
                class="chat-app-menu-item"
                role="menuitem"
                @click="openChatAppWorkspace(item.key)"
              >
                <span class="chat-app-menu-label-full">{{ item.label }}</span>
                <span class="chat-app-menu-label-mobile">{{ item.mobileLabel }}</span>
              </button>
              <button
                type="button"
                class="chat-app-menu-item"
                role="menuitem"
                @click="homeThemeDark = !homeThemeDark; closeChatAppMenu()"
              >
                <span class="chat-app-menu-label-full">{{ homeThemeDark ? '切换到白天' : '切换到夜间' }}</span>
                <span class="chat-app-menu-label-mobile">{{ homeThemeDark ? '白天模式' : '夜间模式' }}</span>
              </button>
              <button
                type="button"
                class="chat-app-menu-item chat-app-menu-return-home"
                role="menuitem"
                @click="activeView = 'home'; closeMobileChatPanel()"
              >
                <span class="chat-app-menu-label-full">返回首页</span>
                <span class="chat-app-menu-label-mobile">返回首页</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-mobile-context-row">
        <button
          type="button"
          class="chat-mobile-context-button"
          :class="{ 'is-active': mobileChatPanel === 'workspace' && chatWorkspacePanel === 'map' }"
          title="地图"
          aria-label="地图"
          @click="toggleMobileWorkspacePanel('map')"
        >
          地图
        </button>
        <button
          type="button"
          class="chat-mobile-context-button"
          :class="{ 'is-active': mobileChatPanel === 'workspace' && chatWorkspacePanel === 'memory' }"
          title="记忆"
          aria-label="记忆"
          @click="toggleMobileWorkspacePanel('memory')"
        >
          记忆
        </button>
        <button
          type="button"
          class="chat-mobile-context-button"
          :class="{ 'is-active': mobileChatPanel === 'workspace' && chatWorkspacePanel === 'status' }"
          title="档案"
          aria-label="档案"
          @click="toggleMobileWorkspacePanel('status')"
        >
          档案
        </button>
      </div>
    </header>
    <button
      v-if="isMobileChatViewport && mobileChatPanel !== 'none'"
      type="button"
      class="chat-mobile-sheet-scrim"
      title="收起面板"
      aria-label="收起面板"
      @click="closeMobileChatPanel"
    />
    <aside
      v-if="!isMobileChatViewport"
      class="xb-sidebar settings-sidebar chat-character-sidebar"
    >
      <div class="panel guide-card chat-character-guide">
        <button
          type="button"
          class="chat-character-card"
          :class="{ active: quickSettingsOpen === 'characters' }"
          title="角色卡"
          aria-label="角色卡"
          @click="openChatAppWorkspace('characters')"
        >
          <span class="chat-character-avatar">
            <img
              v-if="visibleCharacterAvatar"
              :src="visibleCharacterAvatar"
              alt=""
              @error="rememberBrokenAvatar(visibleCharacterAvatar)"
            >
            <span v-else>{{ String(displayCharacterName || 'C').slice(0, 1) }}</span>
          </span>
          <span class="chat-character-card-text">
            <strong>{{ displayCharacterName }}</strong>
          </span>
        </button>
        <div class="guide-steps chat-character-steps">
          <button
            v-for="item in chatAppMenuItems"
            :key="item.key"
            type="button"
            class="guide-step"
            :class="{ active: quickSettingsOpen === item.key }"
            @click="openChatAppWorkspace(item.key)"
          >
            <strong>
              <span class="guide-label-full">{{ item.label }}</span>
              <span class="guide-label-mobile">{{ item.mobileLabel }}</span>
            </strong>
          </button>
        </div>
      </div>
    </aside>
    <section
      class="chat-workbench"
      :class="{ 'is-manager': chatFocus === 'manager' }"
    >
      <div class="chat-flip-card">
        <TavernConversationPanel
          @open-contract="openContractModal"
          @open-author-note="openAuthorNoteModal"
        />
        <TavernManagerPanel @open-contract="openContractModal" />
      </div>
    </section>

    <TavernWorkspacePanel
      v-if="shouldMountChatWorkspace"
      :memory-directory-open="memoryDirectoryOpen"
      @close="closeMobileChatPanel"
      @close-memory-directory="memoryDirectoryOpen = false"
      @toggle-memory-directory="toggleMemoryDirectory"
    />
    <TavernContractModal
      v-if="contractModalOpen"
      :draft-contract="contractDraft"
      :dirty="contractDraftDirty"
      :saving="contractSaving"
      :can-save="!!selectedSessionId"
      :error-text="contractError"
      @close="closeContractModal"
      @toggle="toggleContractDraft"
      @save="sealContract"
    />
    <div
      v-if="authorNoteModalOpen"
      class="compose-author-note-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compose-author-note-title"
      @keydown.esc="closeAuthorNoteModal"
    >
      <form
        class="compose-author-note-dialog compose-author-note-panel"
        @submit.prevent="saveAuthorNoteDraft"
      >
        <header class="compose-author-note-head">
          <div>
            <strong id="compose-author-note-title">玩家便签</strong>
            <span>只对当前会话生效。</span>
          </div>
          <button
            type="button"
            class="compose-author-note-back"
            aria-label="关闭玩家便签"
            @click="closeAuthorNoteModal"
          />
        </header>
        <div class="compose-author-note-body">
          <label class="compose-author-note-field">
            <span>便签内容</span>
            <textarea
              v-model="authorNoteDraft.prompt"
              rows="6"
            />
          </label>
          <div class="compose-author-note-field">
            <span>插入位置</span>
            <div class="compose-author-note-segments">
              <button
                v-for="item in authorNotePositionOptions"
                :key="item.value"
                type="button"
                :class="{ selected: Number(authorNoteDraft.position) === item.value }"
                @click="patchAuthorNoteDraft({ position: item.value })"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
          <div class="compose-author-note-grid">
            <label class="compose-author-note-field">
              <span>Depth</span>
              <input
                v-model.number="authorNoteDraft.depth"
                type="number"
                min="0"
                max="9999"
              >
            </label>
            <label class="compose-author-note-field">
              <span>插入频率</span>
              <input
                v-model.number="authorNoteDraft.interval"
                type="number"
                min="0"
                max="9999"
              >
            </label>
          </div>
          <div class="compose-author-note-field">
            <span>Role</span>
            <div class="compose-author-note-segments">
              <button
                v-for="item in authorNoteRoleOptions"
                :key="item.value"
                type="button"
                :class="{ selected: Number(authorNoteDraft.role) === item.value }"
                @click="patchAuthorNoteDraft({ role: item.value })"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
          <label class="compose-author-note-check">
            <input
              v-model="authorNoteDraft.scan"
              type="checkbox"
            >
            <span>参与世界书扫描</span>
          </label>
        </div>
        <footer class="compose-author-note-actions">
          <span>{{ authorNoteStatus || '0 禁用，1 每次，N 每 N 次用户输入' }}</span>
          <button
            type="submit"
            :disabled="authorNoteSaving"
          >
            {{ authorNoteSaving ? '保存中...' : '保存' }}
          </button>
        </footer>
      </form>
    </div>
    <div
      v-if="quickSettingsOpen"
      class="chat-quick-settings-overlay"
      :class="quickSettingsLayoutClass"
      role="presentation"
    >
      <section
        class="chat-quick-settings-dialog"
        :class="quickSettingsLayoutClass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-quick-settings-title"
      >
        <header class="chat-quick-settings-head">
          <h2 id="chat-quick-settings-title">
            {{ quickSettingsTitle }}
          </h2>
          <button
            type="button"
            class="chat-quick-settings-close"
            title="关闭"
            aria-label="关闭"
            @click="closeQuickSettingsModal"
          >
            ×
          </button>
        </header>
        <div
          class="chat-quick-settings-body"
          :class="quickSettingsLayoutClass"
        >
          <div
            v-if="quickSettingsOpen === 'api'"
            :ref="setChatApiSettingsRootRef"
            class="tavern-api-settings chat-quick-api-root"
          />
          <div
            v-else
            class="settings-layout chat-quick-settings-layout"
            :class="quickSettingsLayoutClass"
          >
            <section class="xb-main">
              <TavernCharacterWorkspacePanel
                v-if="quickSettingsOpen === 'characters'"
              />
              <TavernChatPresetSettingsPanel
                v-else-if="quickSettingsOpen === 'chatPreset'"
              />
              <TavernAssistantPresetSettingsPanel
                v-else-if="quickSettingsOpen === 'assistantPreset'"
              />
              <TavernWorldbooksSettingsPanel
                v-else-if="quickSettingsOpen === 'worldbooks'"
              />
              <TavernRegexSettingsPanel
                v-else-if="quickSettingsOpen === 'regex'"
              />
              <TavernBaseSettingsPanel
                v-else-if="quickSettingsOpen === 'base'"
              />
            </section>
          </div>
        </div>
      </section>
    </div>
    <TavernPhoneOsOverlay />
  </section>
</template>
