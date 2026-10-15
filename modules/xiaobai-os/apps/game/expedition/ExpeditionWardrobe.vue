<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Box3, Color, DirectionalLight, Group, HemisphereLight, NeutralToneMapping, OrthographicCamera, Scene, SRGBColorSpace, Vector3, WebGLRenderer } from 'three';
import { COPY as c, ENEMY_NAMES, OUTFIT_COPY } from './copy.js';
import { BOSS_IDS, OUTFIT_IDS } from './ids.js';
import { BOSS_SPECS } from './content.js';
import { COURTYARD_ENCOUNTERS } from './content/courtyard-encounters.js';
import { CAMPAIGN_COPY } from './content/campaign-copy.js';
import { OUTFITS, ownsOutfit, canChangeOutfit } from './outfits.js';
import { createHero } from './scene-actors.js';
import { createSceneKit } from './scene-kit.js';
import type { Command, ExpeditionData, Outfit, Weapon } from './types.js';
import type { Traveler } from './campaign/traveler.js';

const props = defineProps<{ data: ExpeditionData; traveler: Traveler; balance: number; blocked: boolean; weapon: Weapon }>();
const emit = defineEmits<{ command: [command: Command] }>();
const selected = ref<Outfit>(props.data.equippedOutfit), confirming = ref(false), rotation = ref(0), failed = ref(false), host = ref<HTMLElement | null>(null);
const fitting = ref<HTMLElement | null>(null);
const thumbnails = ref<Partial<Record<Outfit, string>>>({});
const spec = computed(() => OUTFITS[selected.value]), owned = computed(() => ownsOutfit(props.data, selected.value));
const achievementBoss = computed(() => BOSS_IDS.find(id => BOSS_SPECS[id].awardKey === spec.value.achievement));
const rack = computed(() => OUTFIT_IDS.filter(id => ownsOutfit(props.data, id) || OUTFITS[id].achievement === null
    || Object.values(COURTYARD_ENCOUNTERS).some(encounter => encounter.boss && BOSS_SPECS[encounter.boss].awardKey === OUTFITS[id].achievement)));
let dispose: (() => void) | null = null, dirty = true, actionUntil = 0;
let requestDraw = () => {};
watch([selected, rotation, () => props.weapon], () => { dirty = true; requestDraw(); confirming.value = false; });
function select(id: Outfit) { selected.value = id; fitting.value?.scrollTo({ top: 0 }); }
function previewAction() { actionUntil = performance.now() + 1100; dirty = true; requestDraw(); }
function purchase() { confirming.value = false; emit('command', { type: 'purchase', id: selected.value }); }
function setupPreview() {
    dirty = true;
    let renderer: WebGLRenderer;
    try { renderer = new WebGLRenderer({ antialias: true, alpha: false }); }
    catch { failed.value = true; return; }
    renderer.outputColorSpace = SRGBColorSpace; renderer.toneMapping = NeutralToneMapping; renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
    const scene = new Scene(), kit = createSceneKit(), root = new Group(), hero = createHero(kit, root, props.traveler.gender);
    scene.background = new Color('#d1e0e1'); scene.add(root, new HemisphereLight('#fff6e3', '#627c93', 2.7));
    const sun = new DirectionalLight('#fff6e0', 3); sun.position.set(-3, 5, 6); scene.add(sun);
    const camera = new OrthographicCamera(-2.35, 2.35, 2.35, -2.35, .1, 30), bounds = new Box3();
    function posePreview(id: Outfit) {
        hero.update({ x: 0, y: 0, facing: Math.PI / 2, dashTime: 0, swing: 0, shield: 0, guard: 0, resonance: 0 }, props.weapon, id, 0, 0, true, false);
        hero.root.position.set(0, .1, 0); hero.root.rotation.y = -.2; hero.root.scale.setScalar(1.35);
    }
    for (const id of rack.value) { posePreview(id); bounds.union(new Box3().setFromObject(root)); }
    const size = bounds.getSize(new Vector3()), center = bounds.getCenter(new Vector3());
    const halfHeight = size.y * .5 + size.z * .1 + .2, halfWidth = Math.hypot(size.x, size.z) * .5 + .2;
    camera.position.set(0, center.y + .8, 7); camera.lookAt(0, center.y, 0);
    function fitCamera(aspect: number) {
        const span = Math.max(halfHeight, halfWidth / aspect);
        camera.left = -span * aspect; camera.right = -camera.left; camera.top = span; camera.bottom = -span; camera.updateProjectionMatrix();
    }
    fitCamera(1);
    // The rack and fitting view share the actual outfit geometry, not a second icon catalog.
    renderer.setSize(144, 144, false);
    try {
        for (const id of rack.value) {
            posePreview(id);
            renderer.render(scene, camera); thumbnails.value[id] = renderer.domElement.toDataURL('image/png');
        }
    } catch {
        failed.value = true; hero.dispose(); kit.dispose(); scene.clear(); renderer.dispose(); renderer.forceContextLoss(); return;
    }
    host.value!.append(renderer.domElement);
    let frame = 0, width = 1, height = 1;
    const observer = new ResizeObserver(() => {
        const box = host.value!.getBoundingClientRect(); width = Math.max(1, box.width); height = Math.max(1, box.height);
        renderer.setSize(width, height, false); fitCamera(width / height); dirty = true; requestDraw();
    }); observer.observe(host.value!);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    function lost(event: Event) { event.preventDefault(); failed.value = true; cancelAnimationFrame(frame); frame = 0; }
    renderer.domElement.addEventListener('webglcontextlost', lost);
    function draw(now: number) {
        frame = 0;
        if (failed.value || document.hidden) { return; }
        if (!dirty && (now > actionUntil || reduced.matches) && !hero.animating) { return; }
        const playing = now < actionUntil && !reduced.matches, tick = now * .03;
        hero.update({ x: playing ? Math.sin(tick * .4) * .03 : 0, y: 0, facing: Math.PI / 2, dashTime: 0, swing: playing ? 8 - tick % 8 : 0, shield: 0, guard: 0, resonance: 0 }, props.weapon, selected.value, tick, now / 1000, reduced.matches, false);
        hero.root.position.set(0, .1, 0); hero.root.rotation.y = Number(rotation.value) * Math.PI / 180; hero.root.scale.setScalar(1.35);
        try { renderer.render(scene, camera); dirty = false; }
        catch { failed.value = true; }
        if ((playing || hero.animating) && !failed.value) { requestDraw(); }
    }
    requestDraw = () => { if (!frame && !failed.value && !document.hidden) { frame = requestAnimationFrame(draw); } };
    function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else { dirty = true; requestDraw(); } }
    document.addEventListener('visibilitychange', visibility); requestDraw();
    dispose = () => { requestDraw = () => {}; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); renderer.domElement.removeEventListener('webglcontextlost', lost); hero.dispose(); kit.dispose(); scene.clear(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); };
}
function retryPreview() { dispose?.(); dispose = null; failed.value = false; setupPreview(); }
onMounted(setupPreview);
onBeforeUnmount(() => dispose?.());
</script>
<template>
    <div class="exp-wardrobe">
        <section ref="fitting" class="exp-fitting">
            <div class="exp-fitting-body">
                <div class="exp-preview-stage">
                    <div ref="host" class="exp-outfit-preview" :aria-label="OUTFIT_COPY[selected].name"><div v-if="failed" class="exp-preview-error" role="alert"><p>{{ c.presentationError.rendering }}</p><button type="button" @click="retryPreview">{{ CAMPAIGN_COPY.reload }}</button></div></div>
                    <div class="exp-preview-tools"><label>{{ c.rotate }}<input v-model="rotation" type="range" min="-180" max="180" step="5" :aria-label="c.rotate"></label><button type="button" :disabled="failed" @click="previewAction">{{ c.previewAction }}</button></div>
                </div>
                <div class="exp-outfit-info"><h3>{{ OUTFIT_COPY[selected].name }}</h3><p>{{ OUTFIT_COPY[selected].detail }}</p><p class="exp-muted">{{ c.wardrobeNote }}</p></div>
            </div>
            <div class="exp-fitting-actions">
                <p v-if="!canChangeOutfit(data.active)" class="exp-muted">{{ CAMPAIGN_COPY.safeWardrobe }}</p>
                <template v-if="owned"><button type="button" class="exp-primary" :disabled="blocked || !canChangeOutfit(data.active) || data.equippedOutfit === selected" @click="emit('command', { type: 'equip', id: selected })">{{ data.equippedOutfit === selected ? c.equipped : c.equip }}</button></template>
                <p v-else-if="achievementBoss">{{ c.unlockWeapon(ENEMY_NAMES[achievementBoss]) }}</p>
                <template v-else-if="confirming"><p>{{ c.buyOutfit(OUTFIT_COPY[selected].name, spec.price) }}</p><div class="exp-purchase-confirm"><button type="button" class="exp-primary" :disabled="blocked || balance < spec.price" @click="purchase">{{ c.confirm }}</button><button type="button" @click="confirming = false">{{ c.cancel }}</button></div></template>
                <button v-else type="button" class="exp-primary" :disabled="blocked || balance < spec.price" @click="confirming = true">{{ balance < spec.price ? c.noCoins : c.purchase }} · {{ c.coins(spec.price) }}</button>
            </div>
        </section>
        <div class="exp-outfit-rack" :aria-label="c.tryOn">
            <button v-for="id in rack" :key="id" type="button" :aria-pressed="selected === id" @click="select(id)">
                <img v-if="thumbnails[id]" class="exp-outfit-swatch" :src="thumbnails[id]" alt="">
                <strong>{{ OUTFIT_COPY[id].name }}</strong><small>{{ data.equippedOutfit === id ? c.equipped : ownsOutfit(data, id) ? c.owned : OUTFITS[id].price ? c.coins(OUTFITS[id].price) : c.achievement }}</small>
            </button>
        </div>
    </div>
</template>
