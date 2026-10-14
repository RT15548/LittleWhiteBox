<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { XiaobaiOsFrameBridge } from '../../../shell/app-src/frame-bridge.js';
import { useAppBack, useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
import type { NpcId, Operation, Point, WorkTask } from './model.js';
import { CAST } from './content.js';
import { ITEMS, RESOURCE_RULES, SURVIVAL } from './survival-content.js';
import { COPY as c, eventText } from './copy.js';
import { createIslandClient, startsActivity } from './client.js';
import { distance, withinReach } from './space.js';
import { fireAt, terrainAt } from './environment.js';
import { resourceAccessible } from './resources.js';
import IslandField from './presentation/IslandField.vue';
import Workshop from './presentation/Workshop.vue';
import CampSites from './presentation/CampSites.vue';
import Inventory from './presentation/Inventory.vue';
import IncomingOffers from './presentation/IncomingOffers.vue';
import HygieneActions from './presentation/HygieneActions.vue';
import GmFailure from './presentation/GmFailure.vue';
import PlayerComposer from './presentation/PlayerComposer.vue';
import People from './presentation/People.vue';
import Journal from './presentation/Journal.vue';
import Portrait from './presentation/Portrait.vue';
import KnownPlaces from './presentation/KnownPlaces.vue';
import { bodyReadings } from './presentation/body-readings.js';
import { transcriptRows } from './presentation/transcript.js';
import cover from './assets/shore-cover.png?url&no-inline';
import './presentation/island.css';

const props = defineProps<{ bridge: XiaobaiOsFrameBridge; chatIdentity: string; generationActive: boolean }>();
const client = createIslandClient(props.bridge, props.chatIdentity), { view, busy, error, blocked } = client;
const panel = ref<'inventory' | 'craft' | 'build' | 'body' | 'journal' | 'people' | 'places' | null>(null), entered = ref(false), failedScene = ref(false), restart = ref(false);
const panelRoot = ref<HTMLElement | null>(null), endingRoot = ref<HTMLElement | null>(null), transcript = ref<HTMLElement | null>(null), selectedPerson = ref<NpcId | null>(null);
const selectedResource = ref<string | null>(null), amount = ref(250), gatherCount = ref(1), chosenContainer = ref('');
const dragTarget = ref<NpcId | null>(null);
const observation = computed(() => view.value?.player ?? null), self = computed(() => observation.value?.self), needs = computed(() => self.value?.body.kind === 'living' ? self.value.body.needs : null);
const disabled = computed(() => blocked.value || props.generationActive || view.value?.phase !== 'living');
const failedGm = computed(() => !!error.value && client.failedRequest.value === 'think' && !view.value?.pending && !view.value?.memoryPending && !client.uncertain.value);
const inReach = (position: Point) => !!self.value && withinReach(self.value.position, position);
const accessible = computed(() => observation.value?.items.filter(i => i.location.kind === 'ground' ? inReach(i.location.position) : i.location.person === 'player') ?? []);
const containers = computed(() => accessible.value.filter(i => i.water !== null));
const resource = computed(() => observation.value?.resources.find(r => r.id === selectedResource.value));
const fillLimit = computed(() => {
    const container = containers.value.find(i => i.id === chosenContainer.value);
    return container ? Math.floor(Math.min(resource.value?.stock ?? 0, ITEMS[container.kind].capacity - container.water!.millilitres)) : 0;
});
const validAmount = computed(() => Number.isSafeInteger(amount.value) && amount.value > 0);
const sourceAccessible = computed(() => !!resource.value && !!observation.value && resourceAccessible(resource.value.kind, observation.value.weather.tide));
const validGather = computed(() => sourceAccessible.value && Number.isSafeInteger(gatherCount.value) && gatherCount.value > 0 && gatherCount.value <= Math.floor(resource.value?.stock ?? 0));
const activity = computed(() => self.value?.activity);
const hasFire = computed(() => !!observation.value && fireAt({ structures: Object.fromEntries(observation.value.structures.map(s => [s.id, s])) }, observation.value.self.position));
const readings = computed(() => needs.value ? bodyReadings(needs.value) : []);
const hudReadings = computed(() => readings.value.filter(r => r.key === 'thirst' || r.key === 'fatigue'));
const wetClothing = computed(() => accessible.value.some(i => i.location.kind === 'worn' && i.wetness > .25));
const feed = computed(() => transcriptRows(view.value?.recent ?? []).slice(-12));
useAppBack(() => { if (entered.value) { entered.value = false; return true; } return false; });
useAppLayer(panelRoot, () => { panel.value = null; });
useAppLayer(endingRoot, () => { if (restart.value) { restart.value = false; } else { entered.value = false; } });
watch(() => view.value?.recent.at(-1)?.sequence, async () => {
    const element = transcript.value, follow = !element || element.scrollHeight - element.scrollTop - element.clientHeight < 70;
    await nextTick(); if (follow && transcript.value) { transcript.value.scrollTop = transcript.value.scrollHeight; }
});
onMounted(() => { void client.read(); }); onBeforeUnmount(client.dispose);
async function begin() { entered.value = true; if (view.value?.phase === 'unstarted') { await client.start('start'); } }
async function continueAction(operation: Operation) { if (startsActivity(operation)) { await client.advance(3600); } }
async function act(operation: Operation) { if (await client.act(operation)) { await continueAction(operation); } }
function work(task: WorkTask) { return act({ kind: 'work', task }); }
function move(point: Point) {
    if (activity.value) { return; }
    const operation: Operation = dragTarget.value ? { kind: 'drag', subject: dragTarget.value, route: [point] } : { kind: 'travel', route: [point] };
    dragTarget.value = null; void act(operation);
}
function chooseBodyDestination(subject: NpcId) { panel.value = null; dragTarget.value = subject; }
watch(panel, value => { if (value) { dragTarget.value = null; } });
function selectPerson(id: NpcId) { selectedPerson.value = id; panel.value = 'people'; }
async function fresh() { if (await client.start('restart')) { restart.value = false; entered.value = true; panel.value = null; dragTarget.value = null; } }
function selectResource(id: string) { selectedResource.value = id; gatherCount.value = 1; chosenContainer.value = containers.value[0]?.id ?? ''; }
function useResource() {
    if (!resource.value) { return; }
    if (!inReach(resource.value.position)) { move(resource.value.position); return; }
    if (resource.value.kind === 'seep') { void work({ kind: 'fill', source: resource.value.id, container: chosenContainer.value, millilitres: amount.value }); }
    else { void work({ kind: 'gather', source: resource.value.id, units: gatherCount.value }); }
}
</script>

<template>
    <section class="island-room" :class="{ 'island-reviewing-action': !!view?.intent }">
        <div v-if="!entered || !observation" class="island-title" :style="{ backgroundImage: `url(${cover})` }">
            <div class="island-title-content"><h1>{{ c.name }}</h1><p>{{ c.opening }}</p><button class="island-primary" :disabled="busy || !view" @click="begin">{{ view?.phase === 'unstarted' ? c.start : c.resume }}</button></div>
        </div>
        <template v-else>
            <main class="island-world">
                <IslandField v-if="!failedScene" :observation="observation" :disabled="disabled || !!activity || !!panel" @move="move" @person="selectPerson" @error="failedScene = true" />
                <div v-else class="island-render-error" role="alert"><p>{{ c.renderError }}</p><button @click="failedScene = false">{{ c.reloadScene }}</button></div>
                <header class="island-hud"><div><strong>{{ c.terrain[terrainAt(observation.self.position)] }}</strong><span>{{ c.time(observation.clock) }}</span></div><span>{{ observation.weather.rain ? c.storm : observation.weather.daylight ? c.clear : c.night }} · {{ observation.weather.temperature }}°</span><button @click="entered = false">{{ c.back }}</button></header>
                <div v-if="needs" class="island-vitals"><button v-for="row in hudReadings" :key="row.key" :aria-label="`${c[row.key]} · ${row.feeling}`" @click="panel = 'body'"><span>{{ c[row.key] }}</span><meter min="0" max="100" :value="row.percent" :aria-label="c[row.key]" :aria-valuetext="row.feeling" /></button></div>
                <div v-if="dragTarget" class="island-drag-choice" role="status"><span>{{ c.dragDestination(dragTarget) }}</span><button @click="dragTarget=null">{{ c.cancel }}</button></div>
                <aside v-else class="island-nearby">
                    <header><h2>{{ c.nearby }}</h2><button @click="panel = 'places'">{{ c.places }}</button></header><button v-for="r in observation.resources" :key="r.id" :aria-pressed="selectedResource === r.id" @click="selectResource(r.id)">{{ RESOURCE_RULES[r.kind].name }}<small>{{ c.distance(distance(self!.position, r.position)) }}</small></button><div v-if="resource" class="island-resource">
                        <small v-if="resource.kind === 'reef_food'" role="status">{{ sourceAccessible ? c.poolExposed : c.poolFlooded }}</small>
                        <small v-if="resource.kind !== 'seep' && resource.stock < 1">{{ c.sourceDepleted }}</small>
                        <label v-if="resource.kind !== 'seep' && resource.stock >= 1 && sourceAccessible && inReach(resource.position)">{{ c.quantity }}<input v-model.number="gatherCount" type="number" min="1" :max="Math.floor(resource.stock)" :aria-label="c.quantity"><small>{{ c.gatherAvailable(Math.floor(resource.stock)) }} · {{ c.duration(RESOURCE_RULES[resource.kind].seconds * (validGather ? gatherCount : 1)) }}</small></label>
                        <template v-if="resource.kind === 'seep' && inReach(resource.position)"><select v-if="containers.length" v-model="chosenContainer" :aria-label="c.waterContainer"><option v-for="i in containers" :key="i.id" :value="i.id">{{ ITEMS[i.kind].name }}</option></select><input v-model.number="amount" type="number" min="1" :max="Math.min(SURVIVAL.maxSipMl,Math.floor(resource.stock))" :aria-label="c.ml"><button :disabled="disabled || !!activity || !validAmount || amount > Math.min(SURVIVAL.maxSipMl,resource.stock)" @click="work({kind:'sip',source:resource.id,millilitres:amount})">{{ c.sip }}</button><small>{{ c.rawWaterRisk }}</small></template>
                        <button v-if="resource.kind !== 'seep' || !inReach(resource.position) || containers.length" class="island-primary" :disabled="disabled || !!activity || inReach(resource.position) && (resource.kind === 'seep' ? !chosenContainer || !validAmount || amount > fillLimit : !validGather)" @click="useResource">{{ !inReach(resource.position) ? c.approach : resource.kind === 'seep' ? c.fill : c.gather }}</button>
                    </div>
                </aside>
                <div class="island-bottom"><div class="island-clock-action"><span>{{ activity ? view!.step === 'contact' ? c.contactPause : c.active[activity.kind] : c.waiting }}</span><button v-if="activity" :disabled="disabled" @click="client.act({ kind: 'cancel' })">{{ c.pause }}</button><button class="island-primary" :disabled="disabled" @click="client.advance(activity ? 3600 : 60)">{{ activity ? c.continue : c.wait }}</button></div><nav><button v-for="key in (['inventory','craft','build','body','journal'] as const)" :key="key" :aria-pressed="panel === key" @click="panel = panel === key ? null : key">{{ c[key] }}</button></nav></div>
            </main>
            <section class="island-conversation">
                <header><div><strong>{{ view!.scene ? c[view!.scene] : c.dead }}</strong><small>{{ observation.people.length ? `${c.inSight} · ${observation.people.map(p => CAST[p.id].name + (p.body.kind === 'dead' ? ` · ${c.remains}` : '')).join('、')}` : c.nobody }}</small></div><button @click="panel = 'people'">{{ c.people }}</button><button :disabled="disabled || view!.scene === 'alone' && !view!.needsDecision" @click="client.think()">{{ c.continue }}</button></header>
                <div ref="transcript" class="island-transcript" aria-live="polite"><article v-for="{event: e, repetitions} in feed" :key="e.sequence" :class="{ speech: e.payload.kind === 'speech' || e.payload.kind === 'declaration', mine: 'actor' in e.payload && e.payload.actor === 'player' }"><template v-if="e.payload.kind === 'speech' || e.payload.kind === 'declaration'"><Portrait v-if="e.payload.actor !== 'player'" :person="e.payload.actor" /><strong>{{ CAST[e.payload.actor].name }}</strong></template><p>{{ eventText(e.payload, e.shared) }}<small v-if="repetitions > 1"> {{ c.repeated(repetitions) }}</small></p></article><p v-if="!feed.length" class="island-opening">{{ c.opening }}</p></div>
                <IncomingOffers :offers="observation.offers" :disabled="disabled" @accept="from=>act({kind:'accept',from})" />
                <div v-if="view!.thinking" class="island-thinking" role="status"><span>{{ view!.interpreting ? c.interpreting : c.thinking }}</span><button @click="client.cancel()">{{ c.stopGm }}</button></div>
                <GmFailure v-if="failedGm" :error="error" :busy="busy" :disabled="disabled" @retry="client.think()" @settings="client.settings()" />
                <PlayerComposer :client="client" :disabled="disabled" @accepted="continueAction" />
            </section>
            <section v-if="panel" ref="panelRoot" class="island-panel" role="dialog" aria-modal="true" :aria-label="c[panel]" tabindex="-1">
                <header><h2>{{ c[panel] }}</h2><button @click="panel = null">{{ c.close }}</button></header><div class="island-panel-body">
                    <Inventory v-if="panel === 'inventory'" :observation="observation" :disabled="disabled" @act="act" @move="move" />
                    <Workshop v-if="panel === 'craft' || panel === 'build'" :mode="panel" :items="accessible" :has-fire="hasFire" :disabled="disabled || !!activity" @work="work" />
                    <CampSites v-if="panel === 'build'" :sites="observation.structures" :items="accessible" :position="self!.position" :disabled="disabled || !!activity" @act="act" @move="move" />
                    <People v-if="panel === 'people'" :observation="observation" :selected="selectedPerson" :disabled="disabled" @act="act" @move="point => { panel = null; move(point); }" @select="selectedPerson = $event" @drag="chooseBodyDestination" />
                    <KnownPlaces v-if="panel === 'places'" :observation="observation" :disabled="disabled || !!activity" @move="point => { panel = null; move(point); }" />
                    <template v-if="panel === 'body' && needs"><dl class="island-needs"><template v-for="row in readings" :key="row.key"><dt>{{ c[row.key] }}</dt><dd><span>{{ row.feeling }}</span><meter min="0" max="100" :value="row.percent" :aria-label="c[row.key]" :aria-valuetext="row.feeling" /></dd></template></dl><p v-if="wetClothing" class="island-body-feeling">{{ c.wetClothing }}</p><div class="island-body-actions"><button :disabled="disabled || !!activity || needs.bladder < 1" @click="work({kind:'relieve',waste:'urine'})">{{ c.relieveUrine }}</button><button :disabled="disabled || !!activity || needs.bowel < 1" @click="work({kind:'relieve',waste:'feces'})">{{ c.relieveFeces }}</button><button :disabled="disabled || !!activity" @click="act({kind:'rest',seconds:600})">{{ c.rest }}</button></div><HygieneActions :observation="observation" :disabled="disabled || !!activity" @work="work" @move="point => { panel = null; move(point); }" /></template>
                    <template v-if="panel === 'journal'"><Journal :journey="view!.journey!" :recent="view!.recent" :load="client.history" /><button @click="restart = true">{{ c.restart }}</button></template>
                </div>
            </section>
            <div v-if="view!.phase === 'ended' || restart" ref="endingRoot" class="island-ending" role="dialog" aria-modal="true" :aria-label="restart ? c.restart : c.dead" tabindex="-1"><div><h2>{{ restart ? c.restart : c.dead }}</h2><p>{{ restart ? c.restartWarning : c.deadDetail }}</p><button class="island-primary" :disabled="busy" @click="fresh">{{ restart ? c.yes : c.restart }}</button><button v-if="restart" @click="restart = false">{{ c.cancel }}</button></div></div>
        </template>
        <div v-if="!failedGm && (error || view?.pending || view?.memoryPending || client.uncertain.value)" class="island-notice" role="alert">
            <span>{{ error || c.recover }}</span>
            <button :disabled="busy" @click="view?.pending || view?.memoryPending ? client.recover() : client.read()">{{ view?.pending || view?.memoryPending ? c.recover : c.retry }}</button>
        </div>
    </section>
</template>
