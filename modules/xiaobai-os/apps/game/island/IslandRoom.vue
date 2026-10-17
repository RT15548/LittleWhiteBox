<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue';
import type { XiaobaiOsFrameBridge } from '../../../shell/app-src/frame-bridge.js';
import { useAppBack, useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
import type { NpcId, Operation, Point, WorkTask } from './model.js';
import type { PlayerIdentity } from './characters.js';
import { ITEMS, RESOURCE_RULES, SURVIVAL } from './survival-content.js';
import { COPY as c, activityText } from './copy.js';
import { createIslandClient, startsActivity } from './client.js';
import { distance, withinReach } from './space.js';
import { fireAt, terrainAt } from './environment.js';
import { resourceAccessible } from './resources.js';
import IslandField from './presentation/IslandField.vue';
import Workshop from './presentation/Workshop.vue';
import CampSites from './presentation/CampSites.vue';
import Inventory from './presentation/Inventory.vue';
import HygieneActions from './presentation/HygieneActions.vue';
import WoundCare from './presentation/WoundCare.vue';
import Conversation from './presentation/Conversation.vue';
import ChatDock from './presentation/ChatDock.vue';
import FeedbackToasts from './presentation/FeedbackToasts.vue';
import RoomFeedback from './presentation/RoomFeedback.vue';
import GmFailure from './presentation/GmFailure.vue';
import IslandIcon from './presentation/IslandIcon.vue';
import People from './presentation/People.vue';
import Journal from './presentation/Journal.vue';
import KnownPlaces from './presentation/KnownPlaces.vue';
import { bodyReadings } from './presentation/body-readings.js';
import IslandEntry from './presentation/IslandEntry.vue';
import IslandEnding from './presentation/IslandEnding.vue';
import './presentation/island.css';

const props = defineProps<{ bridge: XiaobaiOsFrameBridge; chatIdentity: string; generationActive: boolean }>();
const client = createIslandClient(props.bridge, props.chatIdentity), { view, busy, blocked } = client;
const panel = ref<'inventory' | 'craft' | 'build' | 'body' | 'journal' | 'people' | 'places' | null>(null), entered = ref(false), failedScene = ref(false), sceneReady = ref(false), restart = ref(false);
const entry = ref<InstanceType<typeof IslandEntry> | null>(null), creating = ref(false), pendingStart = ref<{ previous: string | null } | null>(null);
const panelRoot = ref<HTMLElement | null>(null), endingRoot = ref<HTMLElement | null>(null), selectedPerson = ref<NpcId | null>(null);
const root = ref<HTMLElement | null>(null), chatOpen = ref(false), compact = ref(false), short = ref(false), cramped = ref(false), nearbyOpen = ref(false);
let resize: ResizeObserver | null = null;
const selectedResource = ref<string | null>(null), amount = ref(250), gatherCount = ref(1), chosenContainer = ref('');
const dragTarget = ref<NpcId | null>(null);
const observation = computed(() => view.value?.player ?? null), self = computed(() => observation.value?.self), needs = computed(() => self.value?.body.kind === 'living' ? self.value.body.needs : null);
const disabled = computed(() => blocked.value || props.generationActive || view.value?.phase !== 'living');
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
const activityLabel = computed(() => activity.value?.kind === 'contact' ? c.contactWith(activity.value.with, activity.value.form)
    : activity.value ? activityText(activity.value.kind, activity.value.kind === 'work' ? activity.value.task.kind : null) : c.waiting);
const stopLabel = computed(() => activity.value?.kind === 'contact' ? c.releaseContact : activity.value?.kind === 'offer_contact' ? c.withdrawContact : c.pause);
const underThreat = computed(() => observation.value?.threats.some(t => t.to === 'player'));
const hasFire = computed(() => !!observation.value && fireAt({ structures: Object.fromEntries(observation.value.structures.map(s => [s.id, s])) }, observation.value.self.position));
const readings = computed(() => needs.value ? bodyReadings(needs.value) : []);
const hudReadings = computed(() => readings.value.filter(r => r.key === 'thirst' || r.key === 'fatigue'));
const wetClothing = computed(() => accessible.value.some(i => i.location.kind === 'worn' && i.wetness > .25));
const conversationVisible = computed(() => entered.value && !!observation.value && view.value?.phase === 'living' && chatOpen.value && !panel.value && !restart.value);
const fullConversation = computed(() => conversationVisible.value && (compact.value || short.value));
useAppBack(() => { if (entry.value?.back()) { return true; } if (chatOpen.value) { closeConversation(); return true; } if (nearbyOpen.value) { nearbyOpen.value = false; return true; } if (entered.value) { entered.value = false; creating.value = false; return true; } return false; });
watch(() => view.value?.journey, journey => {
    if (!journey || !pendingStart.value || journey === pendingStart.value.previous) { return; }
    pendingStart.value = null; entered.value = true; creating.value = false; restart.value = false; panel.value = null; dragTarget.value = null; nearbyOpen.value = false;
});
useAppLayer(panelRoot, () => { panel.value = null; });
watch(entered, value => { if (!value) { chatOpen.value = false; } });
watch(chatOpen, value => { if (value) { nearbyOpen.value = false; } });
useAppLayer(endingRoot, () => { if (restart.value) { restart.value = false; } else { entered.value = false; } });
// Time runs only while the island is in front of the player with nothing covering the map.
const active = ref(true), hidden = ref(document.hidden), covered = computed(() => !entered.value || !!panel.value || restart.value || failedScene.value || !sceneReady.value);
const running = computed(() => active.value && view.value?.phase === 'living' && !covered.value && !hidden.value);
const visibility = () => { hidden.value = document.hidden; };
watch(running, value => { void client.live(value); }, { immediate: true, flush: 'sync' });
onActivated(() => { visibility(); active.value = true; });
onDeactivated(() => { active.value = false; });
onMounted(() => {
    document.addEventListener('visibilitychange', visibility);
    resize = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        compact.value = width < 900;
        short.value = width >= 600 && height < 500;
        cramped.value = width < 600 && height < 520;
    });
    resize.observe(root.value!);
    void client.read();
});
onBeforeUnmount(() => { active.value = false; document.removeEventListener('visibilitychange', visibility); resize?.disconnect(); client.dispose(); });
async function begin(identity: PlayerIdentity) {
    if (blocked.value) { return; }
    pendingStart.value = { previous: view.value?.journey ?? null };
    const started = await client.start(view.value?.phase === 'unstarted' ? 'start' : 'restart', identity);
    if (!started && !client.uncertain.value) { pendingStart.value = null; }
}
// An action started from a panel closes it: time is paused behind panels, and the action only plays out once the map is back.
function leavePanel(operation: Operation) {
    if (startsActivity(operation) || ['offer_contact', 'accept_contact', 'offer_care'].includes(operation.kind)) { panel.value = null; }
}
function closeConversation() {
    chatOpen.value = false;
    void nextTick(() => { if (entered.value && !panel.value) { root.value?.querySelector<HTMLElement>('.island-field')?.focus({ preventScroll: true }); } });
}
// On a narrow window, return the full map and its controls when an action starts there.
function actionAccepted(operation: Operation) { leavePanel(operation); if (fullConversation.value && startsActivity(operation)) { closeConversation(); } }
async function act(operation: Operation) { if (await client.act(operation)) { actionAccepted(operation); } }
function work(task: WorkTask) { return act({ kind: 'work', task }); }
function move(point: Point) {
    if (activity.value && activity.value.kind !== 'travel') { return; }
    const operation: Operation = dragTarget.value ? { kind: 'drag', subject: dragTarget.value, route: [point] } : { kind: 'travel', route: [point] };
    dragTarget.value = null; void act(operation);
}
function chooseBodyDestination(subject: NpcId) { panel.value = null; dragTarget.value = subject; closeConversation(); }
watch(panel, value => {
    if (value) { dragTarget.value = null; nearbyOpen.value = false; }
    if (value === 'people' && !observation.value?.people.some(p => p.id === selectedPerson.value)) { selectedPerson.value = observation.value?.people[0]?.id as NpcId ?? null; }
});
function selectPerson(id: NpcId) { selectedPerson.value = id; panel.value = 'people'; }
function fresh() { creating.value = true; entered.value = false; restart.value = false; panel.value = null; dragTarget.value = null; }
function selectResource(id: string) { selectedResource.value = id; gatherCount.value = 1; chosenContainer.value = containers.value[0]?.id ?? ''; }
function useResource() {
    if (!resource.value) { return; }
    if (!inReach(resource.value.position)) { move(resource.value.position); return; }
    if (resource.value.kind === 'seep') { void work({ kind: 'fill', source: resource.value.id, container: chosenContainer.value, millilitres: amount.value }); }
    else { void work({ kind: 'gather', source: resource.value.id, units: gatherCount.value }); }
}
</script>

<template>
    <section ref="root" class="island-room" :class="{ 'island-compact': compact, 'island-short': short, 'island-cramped': cramped, 'island-chatting': conversationVisible, 'island-chat-full': fullConversation }">
        <IslandEntry v-if="!entered || !observation" ref="entry" :identity="view?.identity ?? null" :replacing="!!view && view.phase !== 'unstarted'" :unreadable="view?.phase === 'unreadable'" :ended="view?.phase === 'ended'" :creating="creating" :ready="!!view" :busy="busy" :blocked="!!blocked || generationActive" @start="begin" @continue="entered = true" />
        <IslandEnding v-else-if="view!.phase === 'ended'" :journey="view!.journey!" :player-name="view!.identity!.name" :clock="observation.clock" :recent="view!.recent" :load="client.history" :blocked="!!blocked || generationActive" @back="entered = false" @restart="fresh" />
        <template v-else>
            <main class="island-world" :inert="fullConversation" :aria-hidden="fullConversation || undefined">
                <IslandField v-if="!failedScene" :observation="observation" :identity="view!.identity!" :paused="!running || fullConversation" :disabled="disabled || !!panel || fullConversation" @ready="sceneReady = $event" @move="move" @steer="client.steer" @person="selectPerson" @error="failedScene = true" />
                <div v-else class="island-render-error" role="alert"><p>{{ c.renderError }}</p><button @click="failedScene = false">{{ c.reloadScene }}</button></div>
                <header class="island-hud"><strong>{{ c.terrain[terrainAt(observation.self.position)] }}</strong><div><span>{{ c.time(observation.clock) }}</span><span class="island-weather">{{ observation.weather.rain ? c.storm : observation.weather.daylight ? c.clear : c.night }} · {{ observation.weather.temperature }}°</span></div></header>
                <div v-if="needs" class="island-vitals"><button v-for="row in hudReadings" :key="row.key" :aria-label="`${c[row.key]} · ${row.feeling}`" @click="panel = 'body'"><span>{{ c[row.key] }}</span><meter min="0" max="100" :value="row.percent" :aria-label="c[row.key]" :aria-valuetext="row.feeling" /></button></div>
                <div v-if="dragTarget" class="island-drag-choice" role="status"><span>{{ c.dragDestination(dragTarget) }}</span><button @click="dragTarget=null">{{ c.cancel }}</button></div>
                <div v-else class="island-look">
                    <button :aria-expanded="nearbyOpen" @click="nearbyOpen = !nearbyOpen"><IslandIcon name="places" />{{ c.surroundings }}<IslandIcon :name="nearbyOpen ? 'up' : 'down'" /></button>
                    <aside v-if="nearbyOpen" class="island-nearby">
                        <p v-if="observation.surroundings.odor !== 'none' || observation.surroundings.flies" role="status">{{ c.odor[observation.surroundings.odor] }} {{ observation.surroundings.flies ? c.flies : '' }}</p>
                        <button v-if="observation.graves.length" @click="panel = 'people'">{{ c.grave }}</button>
                        <header><h2>{{ c.nearby }}</h2><button @click="panel = 'places'">{{ c.places }}</button></header><button v-for="r in observation.resources" :key="r.id" :aria-pressed="selectedResource === r.id" @click="selectResource(r.id)">{{ RESOURCE_RULES[r.kind].name }}<small>{{ c.distance(distance(self!.position, r.position)) }}</small></button><div v-if="resource" class="island-resource">
                            <small v-if="resource.kind === 'reef_food'" role="status">{{ sourceAccessible ? c.poolExposed : c.poolFlooded }}</small>
                            <small v-if="resource.kind !== 'seep' && resource.stock < 1">{{ c.sourceDepleted }}</small>
                            <label v-if="resource.kind !== 'seep' && resource.stock >= 1 && sourceAccessible && inReach(resource.position)">{{ c.quantity }}<input v-model.number="gatherCount" type="number" min="1" :max="Math.floor(resource.stock)" :aria-label="c.quantity"><small>{{ c.gatherAvailable(Math.floor(resource.stock)) }} · {{ c.duration(RESOURCE_RULES[resource.kind].seconds * (validGather ? gatherCount : 1)) }}</small></label>
                            <template v-if="resource.kind === 'seep' && inReach(resource.position)"><select v-if="containers.length" v-model="chosenContainer" :aria-label="c.waterContainer"><option v-for="i in containers" :key="i.id" :value="i.id">{{ ITEMS[i.kind].name }}</option></select><input v-model.number="amount" type="number" min="1" :max="Math.min(SURVIVAL.maxSipMl,Math.floor(resource.stock))" :aria-label="c.ml"><button :disabled="disabled || !!activity || !validAmount || amount > Math.min(SURVIVAL.maxSipMl,resource.stock)" @click="work({kind:'sip',source:resource.id,millilitres:amount})">{{ c.sip }}</button><small>{{ c.rawWaterRisk }}</small></template>
                            <button v-if="resource.kind !== 'seep' || !inReach(resource.position) || containers.length" class="island-primary" :disabled="disabled || !!activity || inReach(resource.position) && (resource.kind === 'seep' ? !chosenContainer || !validAmount || amount > fillLimit : !validGather)" @click="useResource">{{ !inReach(resource.position) ? c.approach : resource.kind === 'seep' ? c.fill : c.gather }}</button>
                        </div>
                    </aside>
                </div>
                <FeedbackToasts :events="view!.recent" :journey="view!.journey" />
                <div class="island-bottom"><div class="island-clock-action"><span v-if="activity">{{ activityLabel }}</span><div><button v-if="activity" :disabled="disabled" @click="client.act({ kind: 'cancel' })"><IslandIcon name="pause" />{{ stopLabel }}</button></div></div><nav><button v-for="key in (['inventory','craft','build','body','journal'] as const)" :key="key" :aria-pressed="panel === key" @click="panel = panel === key ? null : key"><IslandIcon :name="key" /><span>{{ c[key] }}</span></button></nav></div>
                <ChatDock :view="view!" :open="chatOpen || !!panel || restart" @toggle="chatOpen = !chatOpen" />
            </main>
            <div v-if="panel" class="island-panel-backdrop" @click="panel = null" />
            <section v-if="panel" ref="panelRoot" class="island-panel" role="dialog" aria-modal="true" :aria-label="c[panel]" tabindex="-1">
                <header><h2><IslandIcon :name="panel" />{{ c[panel] }}</h2><button :aria-label="c.close" @click="panel = null"><IslandIcon name="close" /></button></header><div class="island-panel-body">
                    <Inventory v-if="panel === 'inventory'" :observation="observation" :disabled="disabled" @act="act" @move="move" />
                    <Workshop v-if="panel === 'craft' || panel === 'build'" :mode="panel" :items="accessible" :has-fire="hasFire" :disabled="disabled || !!activity" @work="work" />
                    <CampSites v-if="panel === 'build'" :sites="observation.structures" :items="accessible" :position="self!.position" :disabled="disabled || !!activity" @act="act" @move="move" />
                    <People v-if="panel === 'people'" :observation="observation" :selected="selectedPerson" :disabled="disabled" @act="act" @move="point => { panel = null; move(point); }" @select="selectedPerson = $event" @drag="chooseBodyDestination" />
                    <KnownPlaces v-if="panel === 'places'" :observation="observation" :disabled="disabled || !!activity" @move="point => { panel = null; move(point); }" />
                    <template v-if="panel === 'body' && needs"><dl class="island-needs"><template v-for="row in readings" :key="row.key"><dt>{{ c[row.key] }}</dt><dd><span>{{ row.feeling }}</span><meter min="0" max="100" :value="row.percent" :aria-label="c[row.key]" :aria-valuetext="row.feeling" /></dd></template></dl><p v-if="wetClothing" class="island-body-feeling">{{ c.wetClothing }}</p><div class="island-body-actions"><button :disabled="disabled || !!activity || needs.bladder < 1" @click="work({kind:'relieve',waste:'urine'})">{{ c.relieveUrine }}</button><button :disabled="disabled || !!activity || needs.bowel < 1" @click="work({kind:'relieve',waste:'feces'})">{{ c.relieveFeces }}</button><button :disabled="disabled || !!activity" @click="act({kind:'rest',seconds:600})">{{ c.rest }}</button></div><HygieneActions :observation="observation" :disabled="disabled || !!activity" @work="work" @move="point => { panel = null; move(point); }" /></template>
                    <template v-if="panel === 'journal'"><Journal :journey="view!.journey!" :player-name="view!.identity!.name" :recent="view!.recent" :load="client.history" /><button @click="restart = true">{{ c.restart }}</button></template>
                    <WoundCare v-if="panel==='body' && needs" :observation="observation" subject="player" :disabled="disabled" @act="act" @move="point => { panel = null; move(point); }" />
                </div>
            </section>
            <div v-if="restart" ref="endingRoot" class="island-ending" role="dialog" aria-modal="true" :aria-label="c.restart" tabindex="-1"><div><h2>{{ c.restart }}</h2><p>{{ c.restartWarning }}</p><button class="island-primary" :disabled="busy" @click="fresh">{{ c.yes }}</button><button @click="restart = false">{{ c.cancel }}</button></div></div>
        </template>
        <KeepAlive :key="view?.journey ?? undefined" :max="1">
            <Conversation v-if="conversationVisible" :view="view!" :client="client" :disabled="disabled" @act="act" @accepted="actionAccepted" @person="selectPerson" @journal="panel = 'journal'" @close="closeConversation">
                <GmFailure v-if="client.gmFailure.value" :error="client.gmFailure.value" :busy="busy" :disabled="disabled" @retry="client.think()" @settings="client.settings()" @dismiss="client.dismissGmFailure()" />
                <RoomFeedback :client="client" />
            </Conversation>
        </KeepAlive>
        <RoomFeedback v-if="!conversationVisible" :client="client" />
    </section>
</template>
