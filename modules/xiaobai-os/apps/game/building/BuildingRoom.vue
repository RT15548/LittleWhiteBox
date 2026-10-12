<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue';
import type { XiaobaiOsFrameBridge } from '../../../shell/app-src/frame-bridge.js';
import { useAppBack, useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
import { COPY as c, PART_NAMES, ISSUES, SPACE_ISSUES, ACTIVITY_STATUS, MEMORY_COPY, MEMORY_NEEDS } from './copy.js';
import { createBuildingClient } from './client.js';
import { projectBlueprint, projectPlacementIssue, type Command } from './domain.js';
import { BUILDING_POLICY as P, PARTS, PROJECT_TIER, TIER_RULES, ROOM_CHOICES, columnHeight, partKey, type Part, type RoomChoice } from './policy.js';
import { inspect, legalPlaces, refitted } from './rules.js';
import { occupancy } from './layout.js';
import type { LifeMoment } from './scene/life.js';
import { createBuildingScene, type BuildingScene, type CellTarget } from './scene/runtime.js';
import { createBuildingSound, type SceneCue } from './sound.js';
import { createRecoveryJournal } from './recovery.js';
import { nextMemory, type MemoryId } from './memories.js';
import SupplyChoices from './SupplyChoices.vue';
import DeliveryBrief from './DeliveryBrief.vue';
import DeliveryResult from './DeliveryResult.vue';
import { delivery } from './delivery.js';
import { stock, SUPPLY_ROUNDS } from './supply.js';
import HomeWish from './HomeWish.vue';
import MemoryAlbum from './MemoryAlbum.vue';
import PartIcon from './PartIcon.vue';
import HousePortrait from './HousePortrait.vue';
import './building.css';
const props = defineProps<{ bridge: XiaobaiOsFrameBridge; chatIdentity: string; generationActive: boolean }>();
const journal = createRecoveryJournal({ getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value), removeItem: key => localStorage.removeItem(key) });
const client = createBuildingClient(props.bridge, props.chatIdentity, journal);
const { view, busy, blocked, failed, notice, generating, canUndo } = client;
const canvas = ref<HTMLElement | null>(null), dialog = ref<HTMLElement | null>(null);
const modal = ref<'menu' | 'rules' | 'start' | 'abandon' | 'uncollect' | 'collection' | 'memories' | 'brief' | 'deliver' | null>(null);
const page = ref<'desk' | 'house'>('desk');
const delivered = ref(false);
const archived = ref<string | null>(null), kind = ref<RoomChoice>('room');
const target = ref<{ x: number; y: number; z: number } | null>(null), targets = ref<CellTarget[]>([]);
const animation = ref(false), activated = ref(true), graphicsError = ref(false), localError = ref(''), soundBusy = ref(false);
const editing = ref(false), floor = ref<number | null>(null), invitation = ref('');
const celebrated = ref<MemoryId | null>(null);
const moment = ref<LifeMoment | null>(null);
let scene: BuildingScene | null = null, mounted = false;
const sound = createBuildingSound();
const project = computed(() => archived.value ? view.value?.collection.find(p => p.id === archived.value) ?? null : view.value?.active ?? null);
const brief = computed(() => project.value ? projectBlueprint(project.value) : null);
const inspection = computed(() => brief.value && project.value ? inspect(brief.value, project.value.rooms) : null);
const handover = computed(() => brief.value && project.value ? delivery(brief.value, project.value.rooms) : null);
const remaining = computed(() => project.value?.supply ? stock(project.value.supply, project.value.rooms) : null);
const packs = computed(() => project.value?.supply?.offers ?? []);
const showSupplies = computed(() => page.value === 'house' && !archived.value && !!project.value?.supply?.remaining);
const deliveryAward = computed(() => project.value && handover.value?.bonus ? TIER_RULES[project.value.tier].award : P.habitableAward);
const homeWish = computed(() => brief.value && project.value?.state === 'living' ? nextMemory(brief.value, project.value.rooms, project.value.memories) : null);
const occupied = computed(() => occupancy(project.value?.rooms ?? []));
const existing = computed(() => target.value ? occupied.value.get(partKey(target.value)) ?? null : null);
const playing = computed(() => page.value === 'house' && !!project.value && !archived.value && !showSupplies.value && (project.value.state === 'building' || editing.value));
const enabled = computed(() => activated.value && !props.generationActive && !modal.value && !graphicsError.value);
const disabled = computed(() => !enabled.value || blocked.value || animation.value);
const choices = computed(() => ROOM_CHOICES.filter(k => k !== 'terrace' || brief.value?.terraces));
const available = computed(() => brief.value && project.value && kind.value ? new Set(legalPlaces(brief.value, project.value.rooms, kind.value).map(partKey)) : new Set<string>());
const visibleCells = computed(() => targets.value.filter(cell => floor.value !== null && (occupied.value.has(partKey(cell)) || playing.value && cell.y < columnHeight(brief.value!, cell.x, cell.z))));
const selectedSpace = computed(() => inspection.value?.spaces.find(s => existing.value && partKey(s.part) === partKey(existing.value)));
const removeIssue = computed(() => brief.value && project.value && existing.value ? projectPlacementIssue(project.value, project.value.rooms.filter(p => partKey(p) !== partKey(existing.value!))) : null);
const refitChoice = computed(() => {
    if (!existing.value || !project.value || !brief.value) { return null; }
    const next = existing.value.kind === 'room' ? 'study' : 'room';
    const replacement = refitted(project.value.rooms, existing.value, next);
    return replacement ? { kind: next as 'room' | 'study', issue: projectPlacementIssue(project.value, replacement) } : null;
});
const thought = computed(() => homeWish.value ? homeWish.value.need ? MEMORY_NEEDS[homeWish.value.need] : c.memoryReady : c.memoryComplete);
const selectedMarker = computed(() => existing.value ? targets.value.find(cell => partKey(cell) === partKey(existing.value!)) : null);
useAppLayer(dialog, () => { modal.value = null; });
useAppBack(() => {
    if (target.value) { target.value = null; return true; }
    if (archived.value) { returnCurrent(); return true; }
    if (page.value === 'house') { openDesk(); return true; }
    return false;
});
function updateScene() { scene?.set({ project: project.value, enabled: enabled.value, floor: floor.value }); }
function mountScene() {
    scene?.dispose(); scene = null; graphicsError.value = false; animation.value = false;
    try { scene = createBuildingScene(canvas.value!, value => { targets.value = value; }, value => { animation.value = value; }, () => { graphicsError.value = true; void pauseSound(); }, cue, value => { moment.value = value; }); updateScene(); }
    catch { graphicsError.value = true; }
}
function cue(event: SceneCue) { if (view.value?.soundEnabled && enabled.value && !document.hidden) { sound.play(event); } }
async function pauseSound() { try { await sound.pause(); } catch { localError.value = c.soundError; } }
async function unlockSound() { if (view.value?.soundEnabled) { try { await sound.unlock(); } catch { localError.value = c.soundError; } } }
async function toggleSound() {
    if (soundBusy.value || !view.value) { return; } soundBusy.value = true;
    try { const next = !view.value.soundEnabled; if (next) { await sound.unlock(); } await client.setSoundEnabled(next); if (!next) { await sound.pause(); } }
    catch { localError.value = c.soundError; } finally { soundBusy.value = false; }
}
async function act(command: Command) {
    const destination = command.type === 'remember' ? homeWish.value?.part : null;
    void unlockSound(); localError.value = '';
    if (await client.act(command)) {
        target.value = null;
        if (command.type === 'start') { archived.value = null; page.value = 'house'; delivered.value = false; kind.value = 'room'; editing.value = false; floor.value = 0; }
        if (command.type === 'remember' && project.value?.memories.includes(command.memory)) { celebrated.value = command.memory; editing.value = false; floor.value = destination?.y ?? null; }
        if (command.type === 'finish') { editing.value = false; delivered.value = true; floor.value = null; }
        if (command.type === 'reside') { archived.value = null; page.value = 'house'; delivered.value = false; editing.value = true; floor.value = 0; }
        if (command.type === 'collect' && !command.save) { archived.value = null; }
    }
}
function selectCell(cell: CellTarget) {
    if (disabled.value) { return; }
    const room = occupied.value.get(partKey(cell));
    if (room) { target.value = target.value && partKey(target.value) === partKey(room) ? null : { x: room.x, y: room.y, z: room.z }; }
    else if (playing.value && kind.value && brief.value && project.value) {
        const part = { kind: kind.value, x: cell.x, y: cell.y, z: cell.z }, issue = projectPlacementIssue(project.value, [...project.value.rooms, part]);
        if (issue) { localError.value = ISSUES[issue]; return; }
        void act({ type: 'put', part });
    }
}
function remodel() { editing.value = true; floor.value = 0; celebrated.value = null; }
function remember() { if (!disabled.value && homeWish.value?.part) { void act({ type: 'remember', memory: homeWish.value.id }); } }
function selectKind(next: RoomChoice) { kind.value = next; target.value = null; localError.value = ''; }
async function undo() { if (!disabled.value && await client.undo()) { target.value = null; } }
function finish() {
    if (project.value?.state === 'living') { editing.value = false; target.value = null; floor.value = null; }
    else if (handover.value?.ready) { modal.value = 'deliver'; }
}
function openHomes() {
    if (view.value?.active?.state === 'living') { archived.value = null; page.value = 'house'; delivered.value = false; editing.value = false; floor.value = null; target.value = null; }
    else { modal.value = 'collection'; }
}
function openDesk() { page.value = 'desk'; archived.value = null; target.value = null; editing.value = false; celebrated.value = null; delivered.value = false; }
function resume() { page.value = 'house'; delivered.value = false; floor.value = 0; }
function refit() {
    if (!disabled.value && existing.value && refitChoice.value && !refitChoice.value.issue) { void act({ type: 'refit', x: existing.value.x, y: existing.value.y, z: existing.value.z, kind: refitChoice.value.kind }); }
}
async function confirm() {
    const choice = modal.value; modal.value = null;
    if (choice === 'start') { await act({ type: 'start' }); }
    else if (choice === 'deliver') { await act({ type: 'finish' }); }
    else if (choice === 'abandon') { await act({ type: 'abandon' }); }
    else if (choice === 'uncollect' && project.value) { await act({ type: 'collect', runId: project.value.id, save: false }); }
}
function showArchive(id: string) { page.value = 'house'; delivered.value = false; editing.value = false; floor.value = null; archived.value = id; target.value = null; modal.value = null; }
function returnCurrent() { archived.value = null; target.value = null; editing.value = false; delivered.value = false; floor.value = view.value?.active?.state === 'building' ? 0 : null; }
async function exportImage() {
    if (!scene || !project.value) { return; }
    try { const blob = await scene.snapshot(), url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = c.exportName(project.value.tier); link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch { localError.value = c.exportError; }
}
function visibility() { if (document.hidden) { void pauseSound(); } }
function zoom(delta: number) { scene?.zoom(delta); }
function resetView() { scene?.reset(); }
async function focusResident() { if (moment.value) { floor.value = moment.value.space.part.y; await nextTick(); } scene?.focus(); }
async function visit(part: Part) {
    const space = inspection.value?.spaces.find(s => partKey(s.part) === partKey(part));
    if (!space || space.issue) { return; }
    invitation.value = c.invited(space.activity); floor.value = part.y;
    void unlockSound(); await nextTick(); scene?.visit(part); target.value = null;
}
watch([project, enabled, floor], updateScene);
watch(() => project.value?.id, () => { editing.value = false; delivered.value = false; celebrated.value = null; floor.value = project.value?.state === 'building' ? 0 : null; invitation.value = ''; target.value = null; });
watch(() => view.value?.active?.state, (state, before) => { if (state === 'living' && before === 'building') { delivered.value = true; floor.value = null; target.value = null; } });
watch(moment, () => { if (moment.value?.phase === 'using') { invitation.value = ''; } });
watch(enabled, value => { if (!value) { void pauseSound(); } });
onMounted(async () => { mountScene(); document.addEventListener('visibilitychange', visibility); await client.read(); if (view.value?.active?.state === 'building') { page.value = 'house'; } mounted = true; });
onActivated(() => { activated.value = true; scene?.resume(); if (mounted) { void client.read(); } });
onDeactivated(() => { activated.value = false; scene?.suspend(); void pauseSound(); });
onBeforeUnmount(() => { client.dispose(); scene?.dispose(); document.removeEventListener('visibilitychange', visibility); void sound.dispose().catch(error => console.error(c.audioDispose, error)); });
async function reload() { await nextTick(); mountScene(); }
</script>
<template>
    <section class="building-room" :class="{ 'is-desk': page === 'desk' }" :aria-label="c.name" :aria-busy="busy" :data-build-presenting="animation">
        <header v-if="page === 'house'" class="build-topbar">
            <button type="button" class="build-location" data-build-action="desk" @click="openDesk"><small>{{ project?.state === 'building' ? c.construction : c.homeMode }}</small><strong>{{ c.name }}</strong><span aria-hidden="true">⌄</span></button>
            <span v-if="playing && brief && inspection" class="build-budget">{{ c.budget(brief.materials - inspection.materials) }}</span>
            <button type="button" :aria-label="c.menu" @click="modal = 'menu'">•••</button>
        </header>
        <aside v-if="notice || failed || view?.pending || view?.writeState === 'failed'" class="build-notice" role="alert"><span>{{ notice || c.saveProblem }}</span><button type="button" :disabled="busy" @click="client.recover">{{ c.recover }}</button><button type="button" :disabled="busy" @click="client.read">{{ c.refresh }}</button></aside>
        <aside v-if="localError" class="build-notice" role="alert">{{ localError }}<button type="button" :aria-label="c.close" @click="localError = ''">×</button></aside>
        <p v-if="!view" class="build-loading">{{ c.loading }}</p>
        <p v-if="generating" class="build-loading" role="status">{{ c.prepare }}</p>

        <div ref="canvas" class="build-stage" :aria-label="c.scene">
            <p v-if="page === 'house' && (editing && project?.state === 'living' || invitation || celebrated)" class="build-thought" role="status">{{ invitation || (celebrated ? MEMORY_COPY[celebrated].thanks : thought) }}</p>
            <span v-if="brief?.tier === 'sunroom' && playing" class="build-sun" :class="{ 'from-left': brief.sunSide === -1 }" :aria-label="c.sun(brief.sunSide)">{{ brief.sunSide === -1 ? '☀ →' : '← ☀' }}</span>
            <nav v-if="brief && page === 'house'" class="build-floors" :aria-label="c.floors"><button type="button" :aria-pressed="floor === null" @click="floor = null; target = null">{{ c.whole }}</button><button v-for="n in brief.floors" :key="n" type="button" :aria-pressed="floor === n - 1" :data-build-floor="n - 1" @click="floor = n - 1; target = null">{{ c.floor(n - 1) }}</button></nav>
            <div v-if="project && page === 'house' && !graphicsError" class="build-grid">
                <button
                    v-for="cell in visibleCells" :key="partKey(cell)" type="button" class="build-cell"
                    :class="{ 'is-occupied': occupied.has(partKey(cell)), 'is-selected': existing && occupied.get(partKey(cell)) === existing }"
                    :style="{ left: cell.left + '%', top: cell.top + '%', width: cell.width + '%', height: cell.height + '%', clipPath: `polygon(${cell.polygon})` }"
                    :data-build-cell="partKey(cell)" :data-build-place="!occupied.has(partKey(cell))"
                    :aria-label="occupied.has(partKey(cell)) ? PART_NAMES[occupied.get(partKey(cell))!.kind] + '，' + c.cell(cell.x, cell.y, cell.z) : c.place({ kind: kind!, x: cell.x, y: cell.y, z: cell.z })"
                    :disabled="disabled || showSupplies" @click="selectCell(cell)"
                >
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="build-cell-outline" aria-hidden="true"><polygon :points="cell.polygon.replaceAll('%', '').replaceAll(',', ' ')" /></svg>
                    <PartIcon v-if="!occupied.has(partKey(cell)) && kind" :kind="kind" class="build-cell-preview" />
                </button>
            </div>
            <div v-if="existing && selectedMarker" class="build-room-label" :style="{ left: selectedMarker.left + selectedMarker.width / 2 + '%', top: selectedMarker.top + '%' }">{{ c.selected(existing) }}</div>
            <div v-if="moment && project && page === 'house' && !graphicsError" class="build-life-status" :data-build-life="moment.space.activity" :data-life-phase="moment.phase" role="status">{{ moment.phase === 'walking' ? c.walking(moment.space.activity) : ACTIVITY_STATUS[moment.space.activity] }}</div>
            <div v-if="page === 'house'" class="build-camera"><button type="button" :aria-label="c.focus" @click="focusResident">⌕</button><button type="button" :aria-label="c.zoomOut" @click="zoom(.14)">−</button><button type="button" :aria-label="c.zoomIn" @click="zoom(-.14)">＋</button><button type="button" @click="resetView">{{ c.resetView }}</button></div>
            <div v-if="graphicsError" class="build-overlay" role="alert"><p>{{ c.graphics }}</p><button type="button" @click="reload">{{ c.reload }}</button></div>
            <div v-else-if="generationActive" class="build-overlay" role="status">{{ c.storyBusy }}</div>
        </div>
        <footer v-if="view" class="build-controls">
            <section v-if="page === 'desk'" class="build-desk"><h2>{{ c.construction }}</h2><p>{{ c.newBrief }}</p><button v-if="view.active?.state === 'building'" type="button" class="build-primary" data-build-action="resume" :disabled="blocked || generationActive" @click="resume">{{ c.resume }}</button><button v-else type="button" class="build-primary" data-build-action="start" :disabled="blocked || generationActive" @click="modal = 'start'">{{ c.start }}</button><button v-if="view.active?.state === 'living' || view.collection.length" type="button" data-build-action="homes" :disabled="blocked" @click="openHomes">{{ c.homes }}</button></section>
            <template v-else>
                <DeliveryResult v-if="delivered && project && !archived" :award="view.award" :disabled="disabled" @homes="openHomes" @start="modal = 'start'" />
                <DeliveryBrief v-if="project?.state === 'building' && handover" :result="handover" @details="modal = 'brief'" />
                <SupplyChoices v-if="showSupplies && project?.supply" :key="project.supply.remaining" :packs="packs" :round="SUPPLY_ROUNDS - project.supply.remaining" :disabled="disabled" @choose="act({ type: 'choose', choice: $event })" />
                <div v-if="existing && !showSupplies && !delivered" class="build-context">
                    <div><strong>{{ PART_NAMES[existing.kind] }}</strong><button type="button" :aria-label="c.close" @click="target = null">×</button></div>
                    <p v-if="selectedSpace?.issue">{{ SPACE_ISSUES[selectedSpace.issue] }}</p>
                    <div class="build-context-actions">
                        <button v-if="selectedSpace && !selectedSpace.issue" type="button" :disabled="disabled" data-build-action="try" @click="visit(existing)">{{ c.useSpace(selectedSpace.activity) }}</button>
                        <button v-if="playing && refitChoice" type="button" :disabled="disabled || !!refitChoice.issue" data-build-action="refit" @click="refit">{{ c.refit(refitChoice.kind) }}</button>
                        <button v-if="playing" type="button" :disabled="disabled || !!removeIssue" data-build-action="remove" @click="act({ type: 'remove', x: existing.x, y: existing.y, z: existing.z })">{{ c.remove }}</button>
                    </div>
                    <small v-if="playing && (removeIssue || refitChoice?.issue)">{{ ISSUES[(removeIssue || refitChoice!.issue)!] }}</small>
                </div>
                <template v-if="playing && !showSupplies">
                    <div v-if="!existing" class="build-tray" :aria-label="c.parts"><button v-for="k in choices" :key="k" type="button" :data-build-kind="k" :aria-label="c.choice(k, remaining && k !== 'path' ? remaining[k] : null)" :aria-pressed="kind === k" :disabled="disabled || !!remaining && k !== 'path' && remaining[k] <= 0" @click="selectKind(k)"><PartIcon :kind="k" /><span>{{ PART_NAMES[k] }}</span><span class="build-part-cost">{{ PARTS[k].cost ? c.cost(PARTS[k].cost) : c.freePath }}</span><small v-if="remaining && k !== 'path'">{{ c.stock(remaining[k]) }}</small></button></div>
                    <p v-if="!existing && kind && !available.size" class="build-placement-note" role="status">{{ c.noPlace }}</p>
                    <div class="build-footer-actions">
                        <button type="button" :disabled="disabled || !canUndo" data-build-action="undo" @click="undo">{{ c.undo }}</button>
                        <span role="status" :data-build-award="view.award">{{ busy ? c.saving : c.earned(view.award) }}</span>
                        <button type="button" class="build-primary" :disabled="disabled || project?.state === 'building' && !handover?.ready" data-build-action="finish" @click="finish">{{ project?.state === 'living' ? c.done : c.deliver }}</button>
                    </div>
                </template>
                <template v-else-if="!showSupplies && !delivered">
                    <div v-if="project && (archived || project.state === 'abandoned')" class="build-result"><strong>{{ project.state === 'living' ? c.complete : c.abandoned }}</strong><span v-if="!archived" :data-build-award="view.award">{{ c.earned(view.award) }} · {{ c.net(view.award) }}</span></div>
                    <HomeWish v-if="project?.state === 'living' && !archived && !existing" :opportunity="homeWish" :count="project.memories.length" :disabled="disabled" @remodel="remodel" @remember="remember" @album="modal = 'memories'" />
                    <div v-if="archived && project?.state === 'living'" class="build-finished-actions"><button type="button" class="build-primary" :disabled="disabled" data-build-action="reside" @click="act({ type: 'reside', runId: project.id })">{{ c.reside }}</button></div>
                    <button v-if="archived" type="button" class="build-return" data-build-action="return" @click="returnCurrent">{{ c.back }}</button>
                    <button v-if="project?.state === 'abandoned'" type="button" class="build-primary build-start" data-build-action="start" @click="modal = 'start'">{{ c.another }}</button>
                </template>
            </template>
        </footer>
        <div v-if="modal" class="build-backdrop" @click.self="modal = null">
            <section ref="dialog" class="build-dialog" role="dialog" aria-modal="true" aria-labelledby="build-dialog-title" tabindex="-1">
                <header><h2 id="build-dialog-title">{{ modal === 'menu' ? c.name : modal === 'rules' ? c.rules : modal === 'collection' ? c.collection : modal === 'memories' ? c.memories : modal === 'brief' ? c.commission : modal === 'deliver' ? c.deliver : modal === 'start' ? c.newProject : modal === 'uncollect' ? c.uncollectTitle : c.abandonTitle }}</h2><button type="button" :aria-label="c.close" @click="modal = null">×</button></header>
                <div v-if="modal === 'menu'" class="build-menu"><p :data-build-balance="view?.balance">{{ view ? c.balance(view.balance) : c.loading }}</p><button type="button" @click="modal = null; openDesk()">{{ c.workbench }}</button><button type="button" @click="modal = 'collection'">{{ c.collection }}</button><template v-if="project?.state === 'living'"><button v-if="delivered" type="button" @click="modal = null; openHomes()">{{ c.homes }}</button><button v-if="!delivered" type="button" @click="modal = 'memories'">{{ c.memories }}</button><button type="button" :disabled="blocked" data-build-action="collect" @click="project.saved ? modal = 'uncollect' : (modal = null, act({ type: 'collect', runId: project.id, save: true }))">{{ project.saved ? c.uncollect : c.collect }}</button><button type="button" :disabled="blocked" @click="modal = null; exportImage()">{{ c.export }}</button></template><button type="button" :disabled="soundBusy || busy || !view" :aria-pressed="view?.soundEnabled" @click="toggleSound">{{ view?.soundEnabled ? c.soundOn : c.soundOff }}</button><button type="button" @click="modal = 'rules'">{{ c.rules }}</button><button v-if="project?.state === 'building'" type="button" :disabled="blocked" @click="modal = 'abandon'">{{ c.abandon }}</button></div>

                <section v-else-if="modal === 'brief' && handover && brief" class="build-commission-details"><h3>{{ c.minimumTitle }}</h3><p v-for="(met, key) in handover.minimum" :key="key">{{ met ? '✓' : '○' }} {{ c.minimumGoals[key] }}</p><h3>{{ c.bonusTitle }}</h3><p v-for="wish in handover.wishes" :key="wish.id">{{ wish.met ? '✓' : '○' }} {{ c.goal[wish.id] }}</p><p>{{ c.bonusTerms(project!.tier) }}</p><p>{{ c.planningHelp }}</p></section>
                <MemoryAlbum v-else-if="modal === 'memories' && project" :project="project" />
                <ul v-else-if="modal === 'rules'"><li v-for="line in c.ruleItems" :key="line">{{ line }}</li></ul>

                <template v-else-if="modal === 'collection'"><p>{{ c.collectionCount(view?.collection.length ?? 0) }}</p><p v-if="!view?.collection.length">{{ c.emptyCollection }}</p><div class="build-collection"><button v-for="(p, i) in view?.collection" :key="p.id" type="button" @click="showArchive(p.id)"><HousePortrait :brief="projectBlueprint(p)" :rooms="p.rooms" /><strong>{{ c.archiveTitle(p.tier, i) }}</strong></button></div></template>
                <template v-else><p>{{ modal === 'deliver' ? c.deliveryTerms(deliveryAward, !!handover?.bonus) : modal === 'start' ? c.admission(PROJECT_TIER) : modal === 'uncollect' ? c.uncollectBody : c.abandonBody }}</p><p v-if="modal === 'start' && view && view.balance < P.fee" class="build-notice">{{ c.noFunds }}</p><div class="build-dialog-actions"><button type="button" @click="modal = null">{{ c.cancel }}</button><button type="button" class="build-primary" :disabled="blocked || generationActive || modal === 'start' && (!view || view.balance < P.fee)" data-build-action="confirm" @click="confirm">{{ modal === 'start' ? c.start : modal === 'deliver' ? c.deliver : c.confirm }}</button></div></template>
            </section>
        </div>
    </section>
</template>
