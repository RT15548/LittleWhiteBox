<script setup lang="ts">
import { onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue';
import type { IslandView } from '../service.js';
import type { NpcId, Point } from '../model.js';
import { createIslandScene } from './scene.js';
import { loadCharacters, type CharacterRoster } from './character-loader.js';
import type { PlayerIdentity } from '../characters.js';
import { COPY } from '../copy.js';
import { createJoystick } from '../../joystick.js';
import { screenToWorld } from './camera.js';
const props = defineProps<{ observation: NonNullable<IslandView['player']>; identity: PlayerIdentity; disabled: boolean; paused?: boolean }>();
const emit = defineEmits<{ move: [point: Point]; steer: [x: number, y: number]; person: [person: NpcId]; ready: [value: boolean]; error: [] }>();
const root = ref<HTMLElement | null>(null), loading = ref(true), controller = new AbortController();
let scene: ReturnType<typeof createIslandScene> | null = null, characters: CharacterRoster | null = null, active = true;
onMounted(async () => {
    emit('ready', false);
    try {
        const loaded = await loadCharacters(props.identity, controller.signal);
        if (controller.signal.aborted) { loaded.dispose(); return; }
        characters = loaded;
        scene = createIslandScene(root.value!, point => { if (canMove()) { emit('move', point); } }, person => emit('person', person), () => emit('error'), characters);
        scene.update(props.observation); scene.setActive(active && !props.paused); loading.value = false; emit('ready', true);
    } catch (error) {
        if (!controller.signal.aborted) { console.error(error); emit('error'); }
    }
});
watch(() => props.observation, value => scene?.update(value));
onBeforeUnmount(() => { emit('ready', false); controller.abort(); scene?.dispose(); characters?.dispose(); });
onActivated(() => { active = true; scene?.setActive(!props.paused); }); onDeactivated(() => { active = false; stop(); scene?.setActive(false); });
watch(() => props.paused, paused => { if (paused) { stop(); } scene?.setActive(active && !paused); }, { flush: 'sync' });
function changeZoom(by: number) { scene?.changeZoom(by); }
// A held stick or key is one continuous direction. The newest one wins; releasing everything stops.
const KEYS: Record<string, [number, number]> = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
const DEAD_ZONE = .15;
const knob = ref({ x: 0, y: 0 }), held = new Set<string>();
let stick = { x: 0, y: 0 }, sent = { x: 0, y: 0 };
const canMove = () => active && !document.hidden && !loading.value && !props.paused && !props.disabled;
function steer() {
    let x = stick.x, y = stick.y;
    if (Math.hypot(x, y) < DEAD_ZONE) {
        x = y = 0;
        for (const key of held) { x += KEYS[key][0]; y += KEYS[key][1]; }
    }
    const length = Math.hypot(x, y), direction = canMove() && length >= DEAD_ZONE ? screenToWorld(x / length, y / length) : { x: 0, y: 0 };
    if (direction.x === sent.x && direction.y === sent.y) { return; }
    sent = direction; emit('steer', direction.x, direction.y);
}
const joystick = createJoystick((x, y) => { knob.value = { x: x * 26, y: y * 26 }; stick = { x, y }; steer(); }, () => root.value?.focus({ preventScroll: true }));
function stop() { held.clear(); joystick.clear(); }
function visibility() { if (document.hidden) { stop(); } }
function pointerdown(event: PointerEvent) { if (canMove()) { joystick.down(event); } }
function keydown(event: KeyboardEvent) {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (!canMove() || !(key in KEYS) || event.ctrlKey || event.metaKey || event.altKey) { return; }
    event.preventDefault(); held.add(key); steer();
}
function keyup(event: KeyboardEvent) { held.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key); steer(); }
watch(() => props.disabled, disabled => { if (disabled) { stop(); } }, { flush: 'sync' });
onMounted(() => { window.addEventListener('blur', stop); document.addEventListener('visibilitychange', visibility); });
onBeforeUnmount(() => { active = false; stop(); window.removeEventListener('blur', stop); document.removeEventListener('visibilitychange', visibility); });
</script>
<template><div ref="root" class="island-field" tabindex="0" :aria-label="COPY.mapLabel" @keydown.self="keydown" @keyup.self="keyup" @blur="stop"><p v-if="loading" class="island-field-loading" role="status">{{ COPY.loadingScene }}</p><template v-else><div class="island-camera"><button :aria-label="COPY.zoomIn" @click="changeZoom(-2)">＋</button><button :aria-label="COPY.zoomOut" @click="changeZoom(2)">−</button></div><div class="island-stick" role="group" :aria-label="COPY.move" @pointerdown.prevent="pointerdown" @pointermove.prevent="joystick.move" @pointerup="joystick.release" @pointercancel="joystick.release" @lostpointercapture="joystick.release" @contextmenu.prevent><span :style="{ transform: `translate(${knob.x}px, ${knob.y}px)` }" /></div></template></div></template>
<style scoped>
.island-field{position:absolute;inset:0;outline:none;touch-action:manipulation}.island-field:focus-visible{outline:3px solid #3b817f;outline-offset:-3px}.island-field :deep(canvas){position:absolute;inset:0;width:100%;height:100%;display:block}
.island-field-loading{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);padding:12px 20px;border-radius:6px;background:#fffdf9ed;color:var(--island-ink);z-index:2;white-space:nowrap;font-size:13px}
.island-camera{position:absolute;z-index:2;left:14px;top:190px;display:flex;flex-direction:column;gap:5px}.island-camera button{width:36px;min-height:36px;padding:0;background:#fffdf9e8;font-size:20px}
/* Bottom-left, above the action bar, so a thumb on the stick never covers the map centre. */
.island-stick{position:absolute;z-index:2;left:max(18px,env(safe-area-inset-left));bottom:calc(max(18px,env(safe-area-inset-bottom)) + 96px);width:104px;height:104px;border-radius:50%;background:#f5fcfb66;border:1px solid #fffb;box-shadow:inset 0 0 0 14px #8cb4bd1f,0 3px 14px #254b6518;display:grid;place-items:center;touch-action:none}
.island-stick span{width:42px;height:42px;border-radius:50%;background:#f4faf6d9;border:1px solid #fff;box-shadow:0 3px 9px #3255692b;pointer-events:none}
</style>
