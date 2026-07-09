<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useTavernDrawContext, useTavernShellContext } from '../tavern-app-context';

const props = defineProps<{
    mobile?: boolean;
}>();

const draw = useTavernDrawContext();
const shell = useTavernShellContext();
const { homeThemeDark } = shell;
const {
    drawLatestAssistantMessage,
    openTavernDrawSettings,
    refreshTavernDrawQuickSettings,
    tavernDrawCapsuleIcon,
    tavernDrawCapsuleMainDisabled,
    tavernDrawCapsuleStatusClass,
    tavernDrawCapsuleStatusText,
    tavernDrawCapsuleTitle,
    tavernDrawCapsuleVisible,
    tavernDrawQuickSettings,
    tavernDrawQuickSettingsLoading,
    updateTavernDrawQuickSettings,
} = draw;

const menuOpen = ref(false);
const detailPinned = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const menuStyle = ref<Record<string, string>>({});
const detailStyle = ref<Record<string, string>>({});
let popoverFrame = 0;

const activeLayerVisible = computed(() => !!(
    tavernDrawCapsuleStatusText.value
    || tavernDrawCapsuleStatusClass.value
    || tavernDrawCapsuleIcon.value === '■'
));
const quickSettingsAvailable = computed(() => (
    tavernDrawQuickSettings.value.available
    && tavernDrawQuickSettings.value.presets.length > 0
    && tavernDrawQuickSettings.value.sizeOptions.length > 0
));
const autoEnabled = computed(() => tavernDrawQuickSettings.value.auto === true);
const statusText = computed(() => tavernDrawCapsuleStatusText.value || (
    tavernDrawCapsuleIcon.value === '■' ? '绘制中' : tavernDrawCapsuleTitle.value
));
const capsuleStatusText = computed(() => compactCapsuleStatusText(
    statusText.value,
    tavernDrawCapsuleStatusClass.value,
    tavernDrawCapsuleIcon.value,
));
const activeLayerCanCancel = computed(() => (
    tavernDrawCapsuleIcon.value === '■'
    || tavernDrawCapsuleStatusClass.value.includes('running')
));
const detailVisible = computed(() => !menuOpen.value && detailPinned.value && activeLayerVisible.value);
const activeLayerTitle = computed(() => (
    activeLayerCanCancel.value ? tavernDrawCapsuleTitle.value : '查看画图状态'
));
const detailHeading = computed(() => {
    if (activeLayerCanCancel.value) {return '画图进行中';}
    if (tavernDrawCapsuleStatusClass.value.includes('success')) {return '画图完成';}
    if (tavernDrawCapsuleStatusClass.value.includes('error')) {return '画图失败';}
    return '画图状态';
});
const detailSummary = computed(() => {
    const text = statusText.value.trim();
    if (text) {return text;}
    const title = tavernDrawCapsuleTitle.value.trim();
    if (title) {return title;}
    return '暂无可显示的画图状态';
});
const detailNote = computed(() => {
    const title = tavernDrawCapsuleTitle.value.trim();
    const summary = detailSummary.value.trim();
    if (!title || title === summary) {return '';}
    if (activeLayerCanCancel.value || tavernDrawCapsuleStatusClass.value.includes('error')) {
        return title;
    }
    return '';
});
const popoverClass = computed(() => [
    'tavern-draw-popover-layer',
    props.mobile ? 'is-mobile' : 'is-desktop',
    homeThemeDark.value ? 'theme-dark' : 'theme-light',
]);

function clampNumber(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function compactCapsuleStatusText(text = '', statusClass = '', icon = '') {
    const raw = String(text || '').trim();
    const ratio = raw.match(/(\d+)\s*\/\s*(\d+)/);
    if (ratio) {return `${ratio[1]}/${ratio[2]}`;}
    const queueAhead = raw.match(/前方\s*(\d+)/);
    if (queueAhead) {return Number(queueAhead[1]) > 0 ? `排队${queueAhead[1]}` : '排队';}
    const seconds = raw.match(/(\d+(?:\.\d+)?)\s*s/i);
    if (seconds && /冷却|等待/.test(raw)) {return `${seconds[1]}s`;}
    if (/排队/.test(raw)) {return '排队';}
    if (/冷却|等待下一张/.test(raw)) {return '冷却';}
    if (/分析/.test(raw)) {return '分析';}
    if (/准备/.test(raw)) {return '准备';}
    if (/生成|绘制|画图|配图/.test(raw) && icon === '■') {return '绘制';}
    if (/取消/.test(raw)) {return '取消';}
    if (statusClass.includes('success')) {return '完成';}
    if (statusClass.includes('error')) {return '错误';}
    if (icon === '■') {return '绘制';}
    return raw || '状态';
}

function anchoredPopoverStyle(width: number, height: number): Record<string, string> {
    const rect = rootRef.value?.getBoundingClientRect();
    if (!rect) {return { position: 'fixed', top: '0px', left: '0px' };}
    const margin = 8;
    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const left = clampNumber(rect.right - width, margin, Math.max(margin, viewportWidth - width - margin));
    const belowTop = rect.bottom + margin;
    const aboveTop = rect.top - height - margin;
    const top = belowTop + height <= viewportHeight - margin
        ? belowTop
        : clampNumber(aboveTop, margin, Math.max(margin, viewportHeight - height - margin));
    return {
        position: 'fixed',
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
    };
}

function updatePopoverPosition() {
    if (!menuOpen.value && !detailVisible.value) {return;}
    menuStyle.value = anchoredPopoverStyle(198, 156);
    detailStyle.value = anchoredPopoverStyle(244, 96);
}

function schedulePopoverPosition() {
    if (popoverFrame) {return;}
    popoverFrame = window.requestAnimationFrame(() => {
        popoverFrame = 0;
        updatePopoverPosition();
    });
}

function closeMenu() {
    menuOpen.value = false;
}

function closeOverlays() {
    closeMenu();
    detailPinned.value = false;
}

async function toggleMenu() {
    menuOpen.value = !menuOpen.value;
    detailPinned.value = false;
    if (menuOpen.value) {
        await refreshTavernDrawQuickSettings();
        await nextTick();
        updatePopoverPosition();
    }
}

async function handlePresetChange(event: Event) {
    const target = event.target instanceof HTMLSelectElement ? event.target : null;
    if (!target) {return;}
    await updateTavernDrawQuickSettings({ selectedPresetId: target.value });
}

async function handleSizeChange(event: Event) {
    const target = event.target instanceof HTMLSelectElement ? event.target : null;
    if (!target) {return;}
    await updateTavernDrawQuickSettings({ selectedSize: target.value });
}

async function toggleAuto() {
    await updateTavernDrawQuickSettings({ auto: !autoEnabled.value });
}

async function openSettings() {
    closeMenu();
    await openTavernDrawSettings();
}

async function handleActiveLayerClick() {
    if (activeLayerCanCancel.value) {
        await drawLatestAssistantMessage();
        return;
    }
    closeMenu();
    detailPinned.value = !detailPinned.value;
    await nextTick();
    updatePopoverPosition();
}

async function handleActiveLayerKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ') {return;}
    event.preventDefault();
    event.stopPropagation();
    await handleActiveLayerClick();
}

function handleOutsidePointer(event: PointerEvent) {
    const target = event.target instanceof Node ? event.target : null;
    if (!menuOpen.value && !detailPinned.value) {return;}
    if (
        target
        && (
            rootRef.value?.contains(target)
            || (target instanceof Element && target.closest('.tavern-draw-popover-layer'))
        )
    ) {return;}
    closeOverlays();
}

watch([menuOpen, detailVisible], ([open, detail]) => {
    if (open || detail) {
        schedulePopoverPosition();
        document.addEventListener('pointerdown', handleOutsidePointer);
        window.addEventListener('resize', schedulePopoverPosition);
        window.addEventListener('scroll', schedulePopoverPosition, true);
        return;
    }
    document.removeEventListener('pointerdown', handleOutsidePointer);
    window.removeEventListener('resize', schedulePopoverPosition);
    window.removeEventListener('scroll', schedulePopoverPosition, true);
});

watch(tavernDrawCapsuleVisible, (visible) => {
    if (!visible) {
        closeOverlays();
    }
});

watch(activeLayerVisible, (visible) => {
    if (!visible) {
        detailPinned.value = false;
    }
});

onBeforeUnmount(() => {
    if (popoverFrame) {
        window.cancelAnimationFrame(popoverFrame);
        popoverFrame = 0;
    }
    document.removeEventListener('pointerdown', handleOutsidePointer);
    window.removeEventListener('resize', schedulePopoverPosition);
    window.removeEventListener('scroll', schedulePopoverPosition, true);
});
</script>

<template>
  <div
    v-if="tavernDrawCapsuleVisible"
    ref="rootRef"
    class="tavern-draw-float"
    :class="[
      tavernDrawCapsuleStatusClass,
      {
        'tavern-draw-capsule-mobile': props.mobile,
        'is-expanded': menuOpen,
        'is-auto-on': autoEnabled,
        'is-disabled': tavernDrawCapsuleMainDisabled,
        'is-working': tavernDrawCapsuleIcon === '■',
        'has-active-layer': activeLayerVisible,
      },
    ]"
    role="group"
    aria-label="画图"
    @keydown.esc.stop.prevent="closeOverlays"
  >
    <div
      class="tavern-draw-capsule"
      role="presentation"
    >
      <div class="tavern-draw-inner">
        <div class="tavern-draw-layer tavern-draw-layer-idle">
          <button
            type="button"
            class="tavern-draw-main"
            :disabled="tavernDrawCapsuleMainDisabled"
            :title="tavernDrawCapsuleTitle"
            :aria-label="tavernDrawCapsuleTitle"
            @click="drawLatestAssistantMessage"
          >
            <span aria-hidden="true">{{ tavernDrawCapsuleIcon }}</span>
            <span
              class="tavern-draw-auto-dot"
              aria-hidden="true"
            />
          </button>
          <span
            class="tavern-draw-divider"
            aria-hidden="true"
          />
          <button
            type="button"
            class="tavern-draw-menu-button"
            title="展开画图菜单"
            aria-label="展开画图菜单"
            :aria-expanded="menuOpen ? 'true' : 'false'"
            @click.stop="toggleMenu"
          >
            <span
              class="tavern-draw-arrow"
              aria-hidden="true"
            >▼</span>
          </button>
        </div>
        <div
          class="tavern-draw-layer tavern-draw-layer-active"
          role="button"
          tabindex="0"
          :title="activeLayerTitle"
          :aria-label="activeLayerTitle"
          @click="handleActiveLayerClick"
          @keydown="handleActiveLayerKeydown"
        >
          <span
            class="tavern-draw-status-icon"
            aria-hidden="true"
          >{{ tavernDrawCapsuleIcon }}</span>
          <span class="tavern-draw-status-text">{{ capsuleStatusText }}</span>
        </div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div
      v-if="detailVisible"
      class="tavern-draw-detail"
      :class="popoverClass"
      :style="detailStyle"
      @keydown.esc.stop.prevent="closeOverlays"
    >
      <div class="tavern-draw-detail-header">
        <span class="tavern-draw-detail-heading">{{ detailHeading }}</span>
        <strong
          class="tavern-draw-detail-icon"
          aria-hidden="true"
        >{{ tavernDrawCapsuleIcon }}</strong>
      </div>
      <div class="tavern-draw-detail-summary">
        {{ detailSummary }}
      </div>
      <p
        v-if="detailNote"
        class="tavern-draw-detail-note"
      >
        {{ detailNote }}
      </p>
    </div>
    <div
      v-if="menuOpen"
      class="tavern-draw-menu"
      :class="popoverClass"
      :style="menuStyle"
      role="menu"
      aria-label="画图快捷设置"
      @keydown.esc.stop.prevent="closeOverlays"
      @pointerdown.stop
      @click.stop
    >
      <div class="tavern-draw-menu-card">
        <label class="tavern-draw-menu-row">
          <span>预设</span>
          <select
            :value="tavernDrawQuickSettings.selectedPresetId"
            :disabled="tavernDrawQuickSettingsLoading || !quickSettingsAvailable"
            @change="handlePresetChange"
          >
            <option
              v-if="!tavernDrawQuickSettings.presets.length"
              value=""
            >
              暂无预设
            </option>
            <option
              v-for="preset in tavernDrawQuickSettings.presets"
              :key="preset.value"
              :value="preset.value"
            >
              {{ preset.label }}
            </option>
          </select>
        </label>
        <label class="tavern-draw-menu-row">
          <span>尺寸</span>
          <select
            class="is-size"
            :value="tavernDrawQuickSettings.selectedSize"
            :disabled="tavernDrawQuickSettingsLoading || !quickSettingsAvailable"
            @change="handleSizeChange"
          >
            <option
              v-if="!tavernDrawQuickSettings.sizeOptions.length"
              value=""
            >
              暂无尺寸
            </option>
            <option
              v-for="size in tavernDrawQuickSettings.sizeOptions"
              :key="size.value"
              :value="size.value"
            >
              {{ size.label }}
            </option>
          </select>
        </label>
      </div>
      <div class="tavern-draw-menu-actions">
        <button
          type="button"
          class="tavern-draw-auto-toggle"
          :class="{ 'is-on': autoEnabled }"
          :disabled="tavernDrawQuickSettingsLoading || !tavernDrawQuickSettings.available"
          role="switch"
          :aria-checked="autoEnabled ? 'true' : 'false'"
          @click="toggleAuto"
        >
          <span aria-hidden="true" />
          <strong>自动配图</strong>
        </button>
        <button
          type="button"
          class="tavern-draw-gear"
          title="画图设置"
          aria-label="画图设置"
          @click="openSettings"
        >
          ⚙
        </button>
      </div>
    </div>
  </Teleport>
</template>
