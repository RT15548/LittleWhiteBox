<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, shallowRef, watch } from 'vue';
import { useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
import type { MovingRun, challengeProgress } from './domain.js';
import type { MovingAction, MovingState } from './types.js';
import { MOVING_COPY as c, ITEM_NAMES, ROOM_NAMES, MOVING_ERRORS, CHALLENGE_NAMES } from './copy.js';
import { canPick, MATCH_SIZE, movingStatus, packedCount, TRAY_CAPACITY } from './rules.js';
import { createMovingSound } from './sound.js';
import { CHAPTER_LEVELS } from './levels.js';
import { createMovingScene, type MovingScene } from './scene/runtime.js';
import ItemIcon from './ItemIcon.vue';

const props = defineProps<{ active: MovingRun; board: MovingState; disabled: boolean; award: number;
    challenge: ReturnType<typeof challengeProgress>; soundEnabled: boolean; setSoundEnabled: (enabled: boolean) => Promise<boolean> }>();
const emit = defineEmits<{ pick: [id: string]; undo: []; restart: []; abandon: []; chapters: []; next: []; animation: [value: boolean] }>();
const level = computed(() => props.active.level);
const paid = computed(() => props.active.stage === null);
const status = computed(() => props.active.abandoned ? 'abandoned' : movingStatus(props.board));
const packed = computed(() => packedCount(level.value, props.board));
const animating = ref(false), soundBusy = ref(false);
const sound = createMovingSound();
const soundOn = computed(() => props.soundEnabled && sound.available);
const notice = ref<string>(c.description), graphicsError = ref('');
const host = ref<HTMLElement | null>(null), dialog = ref<HTMLElement | null>(null);
const modal = ref<'rules' | 'items' | null>(null);
const visibleItems = shallowRef<readonly string[]>([]);
const tray = computed(() => Array.from({ length: TRAY_CAPACITY }, (_, index) => level.value.items.find(item => item.id === props.board.tray[index])));
const stacks = computed(() => level.value.stacks.map(stack => stack.map(id => level.value.items.find(item => item.id === id)!).filter(item => props.board.remaining.includes(item.id))));
let scene: MovingScene | undefined;
let mounted = false, isActive = true, generation = 0;
let soundStarting: Promise<boolean> | null = null;
useAppLayer(dialog, () => { modal.value = null; });
function animation(value: boolean) { animating.value = value; emit('animation', value); }
function mountScene() {
    scene?.dispose(); scene = undefined; graphicsError.value = '';
    if (!host.value) { return; }
    try {
        scene = createMovingScene(host.value, level.value, props.board, {
            action: act,
            error: (kind, cause) => { graphicsError.value = c[kind]; animation(false); if (cause) { console.error(c[kind], cause); } },
        });
        scene.active(isActive);
    } catch (cause) { graphicsError.value = c.graphicsFailed; console.error(c.graphicsFailed, cause); }
}
function act(action: MovingAction) {
    if (props.disabled || animating.value || graphicsError.value || !isActive) { return; }
    const item = level.value.items.find(entry => entry.id === action.id);
    if (!item || !canPick(props.board, item)) {
        notice.value = MOVING_ERRORS.blocked;
        if (item?.above) { scene?.focus(item.above); }
        return;
    }
    modal.value = null;
    soundStarting = soundOn.value ? sound.setEnabled(true).catch(cause => {
        notice.value = c.soundFailed; console.error(c.soundFailed, cause); return false;
    }) : null;
    emit('pick', action.id);
}
watch(() => props.active.id, async () => { generation++; soundStarting = null; animation(false); notice.value = c.description; await nextTick(); mountScene(); });
watch(() => props.board, async (board, before) => {
    if (!mounted || !before || before === board) { return; }
    const current = ++generation;
    const removed = before.remaining.filter(id => !board.remaining.includes(id));
    const picked = removed.length === 1 && board.remaining.length === before.remaining.length - 1;
    const item = picked ? level.value.items.find(entry => entry.id === removed[0]) : undefined;
    const matched = picked && before.tray.length + 1 - board.tray.length === MATCH_SIZE;
    if (item) {
        notice.value = matched ? c.packed(ITEM_NAMES[item.kind]) : c.selected(ITEM_NAMES[item.kind]);
        if (isActive) {
            const opening = soundStarting;
            soundStarting = null;
            if (opening) {
                void opening.then(started => { if (started && isActive && current === generation) { sound.play(matched); } })
                    .catch(cause => { notice.value = c.soundFailed; console.error(c.soundFailed, cause); });
            } else { sound.play(matched); }
        }
    } else { notice.value = c.description; }
    animation(true);
    await scene?.update(board, item ? { type: 'pick', id: item.id } : undefined, matched);
    if (current === generation) { animation(false); }
});
async function toggleSound() {
    if (soundBusy.value) { return; }
    soundBusy.value = true;
    const next = !soundOn.value;
    let saving = false;
    try {
        if (next && !await sound.setEnabled(true)) { return; }
        saving = true;
        if (await props.setSoundEnabled(next)) {
            if (next) { sound.play(true); }
            else { await sound.setEnabled(false); }
        } else if (next) { await sound.setEnabled(false); }
    }
    catch (cause) {
        if (next) { await sound.setEnabled(false).catch(error => console.error(c.soundFailed, error)); }
        const message = saving ? c.soundSaveFailed : c.soundFailed;
        notice.value = message; console.error(message, cause);
    }
    finally { soundBusy.value = false; }
}
async function quiet() {
    try { await sound.setEnabled(false); }
    catch (cause) { notice.value = c.soundFailed; console.error(c.soundFailed, cause); }
}
function showItems() { visibleItems.value = scene?.visibleItems() ?? []; modal.value = 'items'; }
onMounted(() => { mounted = true; mountScene(); });
onActivated(() => { isActive = true; scene?.active(true); });
onDeactivated(() => { isActive = false; soundStarting = null; modal.value = null; scene?.active(false); void quiet(); });
onBeforeUnmount(() => { generation++; mounted = false; scene?.dispose(); animation(false); void sound.dispose().catch(cause => console.error(c.soundFailed, cause)); });
</script>
<template>
    <section class="moving-room" :class="`moving-${level.id}`" :aria-label="c.name" :data-status="status" :data-tier="challenge.activeTier" :data-level="level.key" :data-run="active.id" :aria-busy="disabled || animating">
        <header class="moving-heading">
            <button type="button" class="moving-location" :aria-label="c.backChapters" @click="emit('chapters')">
                <span class="moving-room-number">{{ paid ? 'Ⅱ' : String(active.stage! + 1).padStart(2, '0') }}</span>
                <span><strong>{{ ROOM_NAMES[level.id] }}<span v-if="paid" class="moving-tier">{{ CHALLENGE_NAMES[challenge.activeTier!] }}</span></strong><small><template v-if="!paid">{{ c.stage(active.stage!) }} · </template>{{ c.progress(packed, level.items.length / MATCH_SIZE) }}</small></span>
                <span aria-hidden="true">⌄</span>
            </button>
            <button type="button" class="moving-icon-button" :aria-label="c.rules" @click="modal = 'rules'">?</button>
        </header>
        <div class="moving-stage">
            <div ref="host" class="moving-canvas" />
            <div v-if="!graphicsError" class="moving-view-tools">
                <div class="moving-rotate">
                    <button type="button" :aria-label="c.zoomOut" @click="scene?.zoom(1 / 1.2)">−</button>
                    <button type="button" :aria-label="c.rotateLeft" @click="scene?.rotate(-.18)">↶</button>
                    <button type="button" :aria-label="c.resetView" @click="scene?.resetView()">⌂</button>
                    <button type="button" :aria-label="c.rotateRight" @click="scene?.rotate(.18)">↷</button>
                    <button type="button" :aria-label="c.zoomIn" @click="scene?.zoom(1.2)">+</button>
                </div>
                <span v-if="status === 'playing'" class="moving-gesture-hint">{{ c.rotateHint }}</span>
            </div>
            <section v-if="graphicsError" class="moving-scene-error" role="alert">
                <p>{{ graphicsError }}</p><button type="button" class="moving-primary" @click="mountScene">{{ c.retryGraphics }}</button>
                <button type="button" class="moving-plain" @click="emit('chapters')">{{ c.backChapters }}</button>
            </section>
            <section v-else-if="status !== 'playing' && !animating && !disabled" class="moving-result" aria-live="polite">
                <span class="moving-result-mark" aria-hidden="true">{{ status === 'won' ? '✓' : '…' }}</span>
                <h2>{{ status === 'won' ? c.won : status === 'lost' ? c.lost : c.abandoned }}</h2>
                <p>{{ status === 'won' ? award ? c.reward(award) : c.earned : paid ? c.paidLost : c.lostBody }}</p>
                <p v-if="paid" :data-next-tier="challenge.tier">{{ c.nextTier(challenge.tier) }}</p>
                <button v-if="status === 'won'" type="button" class="moving-primary" @click="emit('next')">{{ paid ? c.admission : active.stage! < CHAPTER_LEVELS.length - 1 ? c.next : c.chapterComplete }}</button>
                <button v-else-if="!paid" type="button" class="moving-primary" @click="emit('undo')">{{ c.undo }}</button>
                <button v-else type="button" class="moving-primary" @click="emit('next')">{{ c.admission }}</button>
                <button type="button" class="moving-plain" @click="emit('chapters')">{{ c.backChapters }}</button>
            </section>
        </div>
        <footer class="moving-dock">
            <div class="moving-dock-label"><strong>{{ c.tray }} <small>{{ c.slots(board.tray.length, TRAY_CAPACITY) }}</small></strong><p role="status" aria-live="polite">{{ notice }}</p></div>
            <ol class="moving-tray" :aria-label="c.tray" :class="{ 'is-full': status === 'lost' }" :style="{ '--moving-capacity': TRAY_CAPACITY }">
                <li v-for="(item, index) in tray" :key="index" :aria-label="c.slot(item ? ITEM_NAMES[item.kind] : c.emptySlot, index)" :class="{ 'is-filled': item }"><ItemIcon v-if="item" :kind="item.kind" /><span v-else aria-hidden="true">·</span></li>
            </ol>
            <div class="moving-tools">
                <button v-if="!paid" type="button" :disabled="disabled || animating || !active.moves.length" @click="emit('undo')">↩ {{ c.undo }}</button>
                <button type="button" :disabled="disabled || animating || !!graphicsError || status !== 'playing'" @click="showItems">⌕ {{ c.pickList }}</button>
                <button v-if="!paid" type="button" :disabled="disabled || animating" @click="emit('restart')">↻ {{ c.restart }}</button>
                <button v-else type="button" :disabled="disabled || animating || status !== 'playing'" @click="emit('abandon')">{{ c.abandon }}</button>
                <button type="button" :disabled="disabled || soundBusy || !sound.available" :aria-pressed="soundOn" @click="toggleSound">{{ soundOn ? c.soundOn : c.soundOff }}</button>
            </div>
        </footer>
        <div v-if="modal" class="moving-modal-backdrop" @click.self="modal = null">
            <section ref="dialog" class="moving-modal" role="dialog" aria-modal="true" aria-labelledby="moving-board-dialog" tabindex="-1">
                <header><h2 id="moving-board-dialog">{{ modal === 'rules' ? c.rules : c.pickListTitle }}</h2><button type="button" :aria-label="c.close" @click="modal = null">×</button></header>
                <template v-if="modal === 'rules'"><ol class="moving-rules"><li v-for="line in c.instructions" :key="line">{{ line }}</li></ol><p v-if="paid" class="moving-session-note">{{ c.admissionBody }}</p><p class="moving-session-note">{{ c.sessionNote }}</p></template>
                <div v-else class="moving-stack-overview" :style="{ '--stack-count': stacks.length }">
                    <section v-for="(stack, index) in stacks" :key="index">
                        <h3>{{ c.shelf(index) }}</h3>
                        <template v-for="(item, depth) in stack" :key="item.id">
                            <button v-if="depth === 0" type="button" :data-item-id="item.id" :disabled="!visibleItems.includes(item.id)" :aria-label="c.item(ITEM_NAMES[item.kind], index + 1)" @focus="scene?.focus(item.id)" @blur="scene?.focus(null)" @click="act({ type: 'pick', id: item.id })"><ItemIcon :kind="item.kind" /><span>{{ c.available }}</span></button>
                            <div v-else :aria-label="`${ITEM_NAMES[item.kind]} · ${c.underneath}`"><ItemIcon :kind="item.kind" /></div>
                        </template>
                    </section>
                </div>
            </section>
        </div>
    </section>
</template>
