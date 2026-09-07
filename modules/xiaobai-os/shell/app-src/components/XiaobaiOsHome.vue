<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { XiaobaiOsAppDefinition } from '../../app-catalog.js';
import { orderApps } from '../../app-order.js';
import { useDesktopDrag } from './use-desktop-drag.js';
import '../styles/desktop-order.css';

const props = defineProps<{
    apps: readonly XiaobaiOsAppDefinition[];
    characterAvatar: string;
    saveAppOrder: (order: readonly string[] | null) => Promise<void>;
}>();
const emit = defineEmits<{ openApp: [app: XiaobaiOsAppDefinition] }>();
const root = ref<HTMLElement | null>(null);
const editing = ref(false);
const draft = ref<string[]>([]);
const saving = ref(false);
const error = ref('');
const announcement = ref('');
const selected = ref('');
let beforeDrag: string[] = [];
let failedOrder: string[] | null = null;
const visibleApps = computed(() => editing.value ? orderApps(props.apps, draft.value) : props.apps);

function focusApp(id: string): void {
    void nextTick(() => root.value?.querySelector<HTMLElement>(`[data-app-id="${id}"]`)?.focus({ preventScroll: true }));
}

function edit(id: string): void {
    if (!editing.value) { draft.value = props.apps.map(app => app.id); }
    editing.value = true;
    selected.value = id;
}

function move(id: string, index: number): void {
    const from = draft.value.indexOf(id);
    if (from < 0 || from === index) { return; }
    const next = [...draft.value];
    next.splice(from, 1);
    next.splice(index, 0, id);
    draft.value = next;
}

async function save(order: string[] | null): Promise<void> {
    saving.value = true;
    error.value = '';
    failedOrder = order;
    try {
        await props.saveAppOrder(order);
        announcement.value = '顺序已保存';
    } catch {
        error.value = '顺序未能保存';
    } finally {
        saving.value = false;
    }
}

const { floating, pointerDown, cancel } = useDesktopDrag({
    root, editing, disabled: () => saving.value || !!error.value,
    start(id) {
        edit(id);
        beforeDrag = [...draft.value];
    },
    move,
    finish(cancelled) {
        if (cancelled) { draft.value = beforeDrag; }
        else if (draft.value.some((id, index) => id !== beforeDrag[index])) { void save([...draft.value]); }
        focusApp(selected.value);
    },
});
const floatingApp = computed(() => props.apps.find(app => app.id === floating.value?.id));

function finishEditing(): void {
    if (saving.value) { return; }
    cancel();
    editing.value = false;
    focusApp(selected.value);
}
defineExpose({ get editing() { return editing.value; }, finishEditing });

async function reset(): Promise<void> {
    cancel();
    draft.value = orderApps(props.apps, []).map(app => app.id);
    await save(null);
}

function clickApp(app: XiaobaiOsAppDefinition): void {
    if (editing.value) { selected.value = app.id; }
    else { emit('openApp', app); }
}

function keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && editing.value) {
        event.preventDefault(); event.stopPropagation();
        if (floating.value) { cancel(); } else { finishEditing(); }
        return;
    }
    const tile = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-app-id]') : null;
    const id = tile?.dataset.appId;
    if (!id || saving.value || error.value) { return; }
    if (event.key === ' ' || event.key === 'F2') {
        event.preventDefault();
        if (editing.value && event.key === ' ') { finishEditing(); }
        else { edit(id); announcement.value = '整理应用，使用方向键移动，空格键完成'; }
        return;
    }
    if (!editing.value) { return; }
    const grid = tile?.parentElement;
    const columns = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 4;
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[event.key];
    if (delta === undefined) { return; }
    event.preventDefault();
    const index = draft.value.indexOf(id);
    const target = Math.max(0, Math.min(draft.value.length - 1, index + delta));
    if (target === index) { return; }
    move(id, target);
    selected.value = id;
    focusApp(id);
    void save([...draft.value]);
}

function keyup(event: KeyboardEvent): void {
    // Space on a tile edits; ordinary toolbar buttons retain their native Space activation.
    if (event.key === ' ' && event.target instanceof Element && event.target.closest('[data-app-id]')) {
        event.preventDefault();
    }
}

// Availability changes cancel an in-flight gesture, without losing the user's saved hidden slots.
watch(() => props.apps.map(app => app.id).sort().join(','), () => {
    cancel();
    draft.value = props.apps.map(app => app.id);
});
</script>

<template>
    <main
        ref="root" class="xiaobai-os-home" :class="{ 'is-editing': editing }"
        @pointerdown="pointerDown" @keydown="keydown" @keyup="keyup" @contextmenu.prevent @dragstart.prevent
    >
        <div class="xiaobai-os-home-background" aria-hidden="true">
            <img v-if="characterAvatar" class="xiaobai-os-wallpaper" :src="characterAvatar" alt="" draggable="false">
            <div class="xiaobai-os-home-wash" />
        </div>
        <div class="xiaobai-os-desktop-toolbar">
            <template v-if="editing">
                <button type="button" :disabled="saving || !!error" @click="reset">恢复默认</button>
                <button class="xiaobai-os-desktop-done" type="button" :disabled="saving" @click="finishEditing">完成</button>
            </template>
        </div>
        <div v-if="error" class="xiaobai-os-order-error" role="alert">
            <span>{{ error }}</span><button type="button" :disabled="saving" @click="save(failedOrder)">重试</button>
        </div>
        <TransitionGroup tag="section" name="xiaobai-os-sort" class="xiaobai-os-app-grid" aria-label="应用">
            <button
                v-for="app in visibleApps"
                :key="app.id"
                type="button"
                class="xiaobai-os-app-tile"
                :class="{ 'is-lifted': floating?.id === app.id }"
                :data-app-id="app.id"
                :aria-label="app.name"
                :aria-keyshortcuts="editing ? 'ArrowUp ArrowDown ArrowLeft ArrowRight Space' : 'F2 Space'"
                :style="{ '--app-accent': app.accent }"
                @click="clickApp(app)"
            >
                <span class="xiaobai-os-app-icon" aria-hidden="true">
                    <img :src="app.icon" alt="" width="64" height="64" draggable="false">
                </span>
                <span class="xiaobai-os-app-name">{{ app.name }}</span>
            </button>
        </TransitionGroup>
        <span class="xiaobai-os-sort-announcement" role="status">{{ announcement }}</span>
        <Teleport to="body">
            <div
                v-if="floating && floatingApp" class="xiaobai-os-dragged-app xiaobai-os-app-tile" aria-hidden="true"
                :style="{ left: `${floating.x}px`, top: `${floating.y}px`, width: `${floating.width}px` }"
            >
                <span class="xiaobai-os-app-icon"><img :src="floatingApp.icon" alt="" draggable="false"></span>
                <span class="xiaobai-os-app-name">{{ floatingApp.name }}</span>
            </div>
        </Teleport>
    </main>
</template>
