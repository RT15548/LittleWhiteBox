<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue';
import { CONTRACT, RULES } from '../content.js';
import { COPY as combatCopy, WEAPON_COPY } from '../copy.js';
import { WORLD_COPY as c } from '../content/world-copy.js';
import { createControls } from '../controls.js';
import { createJoystick } from '../joystick.js';
import { createExpeditionScene, type ExplorationFrame } from '../scene.js';
import type { Battle, InputFrame, Outfit, Weapon } from '../types.js';
import type { Traveler } from '../campaign/traveler.js';
import { reachableInteractions } from '../world/exploration.js';
import { reachablePersonInteractions } from '../world/people.js';
import { parleyInteractions } from '../campaign/parley.js';
import { interactionLabel } from './interaction-copy.js';
import './world-feedback.css';
import type { CourtyardScene } from '../content/world-types.js';

const props = defineProps<{ world: ExplorationFrame; traveler: Traveler; paused: boolean; transitioning?: boolean; weapon: Weapon; outfit: Outfit; battle?: Battle | null }>();
const emit = defineEmits<{ input: [frame: InputFrame]; interact: [id: string]; pause: []; resume: []; ready: [scene: CourtyardScene]; error: [error: unknown] }>();
const root = ref<HTMLElement | null>(null), canvas = ref<HTMLElement | null>(null), knob = ref({ x: 0, y: 0 });
const selection = ref<string | null>(null);
const artwork = ref({ failed: 0, pending: 0 });
const nearby = computed(() => props.battle ? [] : [
    ...parleyInteractions(props.world.definition.id, props.world.location.position, props.world.facts),
    ...reachableInteractions(props.world.definition, props.world.location, props.world.facts).filter(i => i.kind === 'exit' || props.world.objects.has(i.target.id)),
    ...reachablePersonInteractions(props.world.definition, props.world.location.position, props.world.facts, props.world.people),
]);
const selected = computed(() => nearby.value.find(i => i.target.id === selection.value) ?? null);
const resource = computed(() => props.weapon === 'grimoire' ? combatCopy.contractPower : combatCopy.resource);
let scene: ReturnType<typeof createExpeditionScene> | null = null, controls: ReturnType<typeof createControls> | null = null;
let animation = 0, last = 0, accumulator = 0, disposed = false, active = true;
const joystick = createJoystick((x, y) => { knob.value = { x: x * 26, y: y * 26 }; controls?.stick(x, y); }, () => root.value?.focus({ preventScroll: true }));
function clear() { joystick.clear(); controls?.clear(); accumulator = 0; }
function pause() { clear(); emit('pause'); }
function retryArtwork() { scene?.retryArtwork(); }
function visibility() { if (document.hidden) { cancelAnimationFrame(animation); animation = 0; pause(); } else { scene?.invalidate(); schedule(); } }
function schedule() {
    if (!animation && !disposed && active) { last = 0; animation = requestAnimationFrame(render); }
}
function interact() { if (!props.paused && selected.value) { clear(); emit('interact', selected.value.target.id); } }
function dash(event?: MouseEvent) { if (!event || event.detail === 0) { controls?.dash(); } }
function skill(event?: MouseEvent) { if (!event || event.detail === 0) { controls?.skill(); } }
function pointerAction(event: PointerEvent, action: 'dash' | 'skill') {
    if (event.button === 0) { controls?.[action](); }
}
function nextTarget() {
    const index = nearby.value.findIndex(i => i.target.id === selection.value);
    selection.value = nearby.value[(index + 1) % nearby.value.length]?.target.id ?? null;
}
function render(now: number) {
    animation = 0;
    if (disposed || !active) { return; }
    if (!props.paused && !document.hidden) { animation = requestAnimationFrame(render); }
    const elapsed = last ? Math.min(100, now - last) : 0; last = now;
    if (!props.paused && !document.hidden) {
        accumulator += elapsed;
        while (accumulator >= 1000 / RULES.hz && !props.paused) {
            accumulator -= 1000 / RULES.hz;
            const frame = controls!.frame();
            if (frame.skill && !props.battle) { interact(); break; }
            emit('input', frame);
        }
    } else { accumulator = 0; }
    if (!document.hidden) {
        try { scene?.draw(props.battle ?? null, props, 0, 'battle', now, props.world); }
        catch (error) { cancelAnimationFrame(animation); animation = 0; clear(); emit('error', error); }
    }
}
// Keep the chosen object while in reach; distance sorting alone must not change what E does.
watch(nearby, items => { if (!items.some(i => i.target.id === selection.value)) { selection.value = items[0]?.target.id ?? null; } }, { immediate: true });
watch(() => props.world.definition.id, () => { clear(); selection.value = nearby.value[0]?.target.id ?? null; root.value?.focus({ preventScroll: true }); });
watch(() => props.paused, value => { clear(); schedule(); if (!value) { root.value?.focus({ preventScroll: true }); } });
watch(() => [props.world.definition, props.world.facts, props.world.location.position.x, props.world.location.position.y, props.weapon, props.outfit], schedule);
onMounted(() => {
    try { scene = createExpeditionScene(canvas.value!, () => { pause(); emit('error', new Error('expedition_webgl_context_lost')); }, { traveler: props.traveler, world: true, invalidate: schedule, sceneReady: id => emit('ready', id), artworkStatus: (failed, pending) => { artwork.value = { failed, pending }; } }); }
    catch (error) { emit('error', error); return; }
    controls = createControls(root.value!, pause, () => {});
    document.addEventListener('visibilitychange', visibility);
    schedule(); root.value?.focus({ preventScroll: true });
});
onDeactivated(() => { active = false; cancelAnimationFrame(animation); animation = 0; pause(); });
onActivated(() => { active = true; schedule(); });
onBeforeUnmount(() => {
    disposed = true; cancelAnimationFrame(animation); clear(); controls?.dispose();
    document.removeEventListener('visibilitychange', visibility); scene?.dispose();
});
defineExpose({ stats: () => scene?.stats(), focus: () => root.value?.focus({ preventScroll: true }) });
</script>

<template>
    <section ref="root" class="journey-field" tabindex="0" :aria-label="battle ? combatCopy.controls : c.actions.controls">
        <div ref="canvas" class="journey-canvas" />
        <div class="journey-hud">
            <header class="journey-heading"><h1>{{ c.scenes[world.definition.id] }}</h1><slot name="status" /></header>
            <div class="journey-threat"><slot name="threat" /></div>
        </div>
        <div v-if="artwork.failed" class="journey-artwork-issue" role="status"><span>{{ c.artwork.unavailable }}</span><button type="button" :disabled="artwork.pending > 0" @click="retryArtwork">{{ artwork.pending ? c.artwork.loading : c.artwork.retry }}</button></div>
        <div v-if="!paused" class="journey-controls">
            <div class="journey-stick" role="group" :aria-label="c.actions.move" @pointerdown.prevent="joystick.down" @pointermove.prevent="joystick.move" @pointerup="joystick.release" @pointercancel="joystick.release" @lostpointercapture="joystick.release" @contextmenu.prevent>
                <span :style="{ transform: `translate(${knob.x}px, ${knob.y}px)` }" />
            </div>
            <div v-if="selected" class="journey-interaction">
                <button type="button" class="journey-act" @click="interact"><kbd>E</kbd>{{ interactionLabel(selected) }}</button>
                <button v-if="nearby.length > 1" type="button" class="journey-switch" @click="nextTarget">{{ c.actions.next }}</button>
            </div>
            <div v-if="battle" class="journey-interaction journey-battle-actions">
                <div v-if="['blade', 'staff', 'grimoire'].includes(weapon)" class="journey-resource">
                    <span>{{ battle.player.resonance > 0 ? combatCopy.resonanceActive : resource }}</span>
                    <meter min="0" :max="CONTRACT.maxPower" :value="battle.player.resource" :aria-label="resource" />
                    <small>{{ battle.player.resonance > 0 ? combatCopy.secondsLeft(battle.player.resonance) : Math.floor(battle.player.resource) }}</small>
                </div>
                <button class="journey-act" type="button" :disabled="battle.player.dash > 0" @pointerdown.prevent="pointerAction($event, 'dash')" @click="dash"><kbd>{{ combatCopy.dashKey }}</kbd>{{ combatCopy.dash }}<small>{{ battle.player.dash > 0 ? combatCopy.secondsLeft(battle.player.dash) : combatCopy.ready }}</small></button>
                <button class="journey-act" type="button" :disabled="battle.player.skill > 0" @pointerdown.prevent="pointerAction($event, 'skill')" @click="skill"><kbd>{{ combatCopy.skillKey }}</kbd>{{ WEAPON_COPY[weapon].action }}<small>{{ battle.player.skill > 0 ? combatCopy.secondsLeft(battle.player.skill) : combatCopy.ready }}</small></button>
            </div>
        </div>
        <div v-if="paused && !transitioning" class="journey-overlay"><slot name="overlay"><button class="journey-act" type="button" @click="emit('resume')">{{ c.actions.resume }}</button></slot></div>
    </section>
</template>

<style scoped>
.journey-field { position: relative; width: 100%; height: 100%; overflow: hidden; outline: none; color: #203e4c; background: #bfe3e8; font-family: inherit; container: moving-frame / inline-size; }
.journey-canvas { position: absolute; inset: 0; }
.journey-canvas :deep(canvas) { display: block; width: 100%; height: 100%; }
.journey-hud { position:absolute; top:max(22px, env(safe-area-inset-top)); left:max(24px, env(safe-area-inset-left)); right:max(24px, env(safe-area-inset-right)); display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); align-items:start; gap:16px; pointer-events:none; }
.journey-heading { justify-self:start; min-width:0; padding:10px 12px; border-left:2px solid #afbed4; border-radius:3px; background:#f5f7fde8; color:var(--ember-ink); }
.journey-threat { min-width:0; }
.journey-heading h1 { margin: 0; font-size: 20px; font-weight: 650; letter-spacing: .07em; }
.journey-artwork-issue { position:absolute; bottom:140px; left:18px; right:18px; display:flex; align-items:center; gap:10px; width:fit-content; max-width:calc(100% - 36px); padding:8px 12px; border:1px solid #c3c9da; border-radius:6px; background:#f8f9fded; color:#344361; font-size:12px; }
.journey-artwork-issue button { flex-shrink:0; }
.journey-controls { position: absolute; inset: auto max(24px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left)); display: flex; align-items: flex-end; justify-content: space-between; pointer-events: none; gap: 16px; }
.journey-stick { width: 104px; height: 104px; flex: 0 0 104px; border-radius: 50%; background: #f5fcfb4d; border: 1px solid #fff9; box-shadow: inset 0 0 0 14px #8cb4bd14; display: grid; place-items: center; touch-action: none; pointer-events: auto; }
.journey-stick span { width: 42px; height: 42px; border-radius: 50%; background: #f4faf6c9; border: 1px solid #fff; box-shadow: 0 3px 9px #3255692b; }
.journey-interaction { display: grid; justify-items: end; gap: 6px; pointer-events: auto; max-width: min(60%, 310px); }
.journey-battle-actions { grid-template-columns: auto auto; max-width: 70%; }
.journey-battle-actions small { display:block; font-size:11px; font-variant-numeric:tabular-nums; font-weight:400; }
.journey-battle-actions button:disabled { opacity:.75; background:#506c76; color:#e3e9df; }
.journey-resource { grid-column:1/-1; display:flex; align-items:center; gap:7px; font-size:12px; padding:4px 9px; color:#244955; background:#f4f7efef; border-radius:5px; }
.journey-resource meter { width:70px; height:12px; accent-color:#608a95; }
.journey-act { border: 1px solid #e4eeee; padding: 12px 17px; min-height: 46px; font: inherit; font-size: 15px; font-weight: 550; line-height: 1.4; color: #f6f6e5; background: #315665; border-radius: 9px; box-shadow: 0 4px 18px #274b5629; cursor: pointer; }
.journey-act kbd { display: inline-grid; place-items: center; border: 1px solid #bed4d6; margin-right: 10px; min-width: 22px; padding-inline: 3px; height: 23px; white-space: nowrap; font: inherit; font-size: 12px; border-radius: 4px; }
.journey-switch { min-height: 40px; border: 0; background: #e9f4edeb; color: #315665; padding: 5px 12px; border-radius: 7px; font: inherit; font-size: 13px; cursor: pointer; }
.journey-overlay { position: absolute; inset: 0; display: grid; place-items: center; background: #42667829; padding: 20px; }
button:focus-visible { outline: 3px solid #fce5a5; outline-offset: 3px; }
@media (pointer: fine) { .journey-stick { opacity: .6; width: 80px; height: 80px; flex-basis: 80px; } }
@container moving-frame (max-width: 720px) { .journey-hud { top:18px; left:18px; right:104px; display:flex; flex-direction:column; gap:8px; } .journey-heading,.journey-threat { width:100%; } }
@container moving-frame (max-width: 599px) { .journey-heading h1 { font-size: 18px; } .journey-controls { inset-inline: 16px; bottom: max(18px, env(safe-area-inset-bottom)); } .journey-act { padding: 10px 13px; font-size: 14px; } .journey-act kbd { display: none; } }
@media (max-height: 450px) { .journey-hud { top:12px; } @container moving-frame (min-width: 500px) { .journey-hud { right:max(24px, env(safe-area-inset-right)); display:grid; gap:16px; } .journey-threat { padding-top:72px; } } }
@media (max-height: 420px) { .journey-stick { width: 76px; height: 76px; flex-basis: 76px; } .journey-controls { bottom: 12px; } }
</style>
