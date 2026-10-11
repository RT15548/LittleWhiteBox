<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue';
import type { XiaobaiOsFrameBridge } from '../../../shell/app-src/frame-bridge.js';
import { useAppBack, useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
import { createExpeditionClient } from './client.js';
import { createCampaignPlayback } from './presentation/playback.js';
import { CAMPAIGN_RULES, loadoutIssue } from './campaign/rules.js';
import { CAMPAIGN_COPY as c, FACT_COPY, campaignObjective } from './content/campaign-copy.js';
import { WORLD_COPY as w } from './content/world-copy.js';
import { COURTYARD } from './content/courtyard.js';
import type { CourtyardFact, CourtyardScene } from './content/world-types.js';
import { isPerson, participantName, type Participant } from './content/participants.js';
import { parleyInteractions } from './campaign/parley.js';
import { DIALOGUE_COPY as dialogueCopy } from './content/dialogue-copy.js';
import { COPY, ENEMY_NAMES, RELIC_COPY, WEAPON_COPY, skillDetail, errorText } from './copy.js';
import { RULES, isBoss } from './content.js';
import type { Command, JourneySetup } from './types.js';
import { createExpeditionSound } from './sound.js';
import ExplorationField from './presentation/ExplorationField.vue';
import CampaignMap from './presentation/CampaignMap.vue';
import ExpeditionIcon from './ExpeditionIcon.vue';
import ExpeditionWardrobe from './ExpeditionWardrobe.vue';
import ConversationMeters from './presentation/ConversationMeters.vue';
import JourneyEntry from './presentation/JourneyEntry.vue';
import DialogueComposer from './presentation/DialogueComposer.vue';
import DialogueActionFeedback from './presentation/DialogueActionFeedback.vue';
import DialogueBubble from './performance/DialogueBubble.vue';
import { SCENE_ART, STORY_ART } from './artwork.js';
import { JOURNEY_COPY as j } from './content/journey-copy.js';
import { chapterTitle } from './content/chapters.js';
import { campaignInteractions } from './world/people.js';
import { greetingTurn } from './content/greetings.js';
import { latestReply, pendingEnding } from './campaign/reply-checkpoint.js';
import './presentation/campaign.css';

const props = defineProps<{ bridge: XiaobaiOsFrameBridge; chatIdentity: string; generationActive: boolean }>();
const client = createExpeditionClient(props.bridge, props.chatIdentity), playback = createCampaignPlayback(client);
const { view, notice, busy, blocked, talking, outgoing, conversationFailure } = client, { current: run, dirty } = playback;
const paused = ref(true), sound = ref(false), renderingError = ref(false), epoch = ref(0), entered = ref(false);
const performing = ref(false), transition = ref<CourtyardScene | null>(null);
const entry = ref<InstanceType<typeof JourneyEntry> | null>(null);
const panel = ref<'map' | 'journal' | 'build' | 'person' | 'passage' | 'ending' | 'arrival' | 'prologue' | null>(null);
const packTab = ref<'relics' | 'wardrobe'>('relics');
const panelTitle = computed(() => panel.value === 'map' ? c.map : panel.value === 'journal' ? c.journal : panel.value === 'build' ? c.build : panel.value === 'person' ? participantName(person.value) : panel.value === 'passage' ? w.passages[passage.value].title : panel.value === 'arrival' ? w.scenes.camp : panel.value === 'ending' || panel.value === 'prologue' ? chapterTitle : run.value?.phase === 'reward' ? c.reward : run.value?.phase === 'lost' ? c.fallen : c.pause);
const person = ref<Participant>('sanniang'), passage = ref<keyof typeof w.passages>('warning'), dialog = ref<HTMLElement | null>(null);
const drafts = ref<Partial<Record<Participant, string>>>({});
const draft = computed({ get: () => drafts.value[person.value] ?? '', set: value => { drafts.value[person.value] = value; } });
const queued = ref<{ person: Participant; text: string } | null>(null), preparingSend = ref(false);
const reading = new Map<Participant, { top: number; latest: boolean }>();
const transcript = ref<HTMLElement | null>(null);
const noticePanel = ref<HTMLElement | null>(null);
const field = ref<InstanceType<typeof ExplorationField> | null>(null);
const facts = computed<ReadonlySet<CourtyardFact>>(previous => {
    const ids = run.value?.facts ?? [];
    return previous && previous.size === ids.length && ids.every(id => previous.has(id)) ? previous : new Set(ids);
});
const world = computed(() => run.value ? { definition: COURTYARD[run.value.location.scene], location: run.value.location, facts: facts.value, people: run.value.people } : null);
const sceneArtStyle = computed(() => {
    const art = run.value && SCENE_ART[run.value.location.scene];
    return art ? { '--scene-art': `url("${art}")` } : undefined;
});
const outfit = computed(() => run.value?.outfit ?? view.value?.data.equippedOutfit ?? 'traveler');
const endingPerson = computed(() => run.value ? pendingEnding(run.value) : null);
const conclusion = computed(() => run.value?.pendingParley ? run.value.pendingParley.decision === 'attack' ? 'fight' as const : 'continue' as const : endingPerson.value ? 'continue' as const : undefined);
const halted = computed(() => !entered.value || !run.value || !!run.value.pendingParley || !!endingPerson.value || paused.value || !!panel.value || !!notice.value || talking.value || renderingError.value || props.generationActive
    || performing.value || !!transition.value || !['exploration', 'battle'].includes(run.value.phase) || !view.value?.ready || view.value.pending || view.value.writeState !== 'ready');
const boss = computed(() => run.value?.battle?.enemies.find(e => isBoss(e.kind)));
const history = computed(() => run.value?.conversations[person.value] ?? []);
const greeting = computed(() => run.value && !history.value.length ? greetingTurn(run.value, person.value) : null);
const pendingLine = computed(() => queued.value?.person === person.value ? { ...queued.value, status: preparingSend.value ? 'sending' : 'failed' }
    : outgoing.value?.person === person.value && !outgoing.value.regenerating && !history.value.some(t => t.id === outgoing.value?.actionId) ? outgoing.value : null);
const retrying = computed(() => pendingLine.value?.status === 'failed');
const regeneratable = computed(() => run.value && latestReply(run.value)?.person === person.value);
const freshReply = ref<string | null>(null);
const loadoutOptions = computed(() => run.value?.collection.map(relic => {
    const equipped = run.value!.equipped.includes(relic.id) ? run.value!.equipped.filter(id => id !== relic.id) : [...run.value!.equipped, relic.id];
    return { ...relic, equipped, issue: loadoutIssue(run.value!, equipped) };
}) ?? []);
const audio = createExpeditionSound(() => { client.error.value = COPY.presentationError.sound; sound.value = false; });
let mounted = false;
function close() {
    if (panel.value || run.value && ['exploration', 'battle'].includes(run.value.phase)) { void resume(); }
}
async function resolveParley() {
    if (await act({ type: 'resolve_parley' })) { panel.value = null; await nextTick(); field.value?.focus(); }
}
async function continueDialogue() {
    if (endingPerson.value) { await act({ type: 'accept_reply' }); }
    else { await resolveParley(); }
}
useAppLayer(dialog, close);
useAppBack(() => {
    if (!entered.value) { return entry.value?.back() ?? false; }
    if (panel.value) { close(); return true; }
    if (!paused.value) { pause(); return true; }
    return false;
});
useAppLayer(noticePanel, () => {
    if (!busy.value && !renderingError.value && !props.generationActive) { client.dismissError(); }
});
function pause() { paused.value = true; void playback.flush(); }
function menu() { panel.value = null; pause(); }
async function open(next: NonNullable<typeof panel.value>) {
    if (performing.value || transition.value) { return; }
    panel.value = next;
    if (next === 'build') { packTab.value = 'relics'; }
    await playback.flush();
}
async function resume() {
    if (endingPerson.value) { return; }
    if (run.value?.pendingParley) { if (run.value.pendingParley.decision === 'pass') { await resolveParley(); } return; }
    if (!notice.value && !props.generationActive) {
        entered.value = true; panel.value = null; paused.value = false;
        await nextTick(); field.value?.focus();
    }
}
function continueJourney() {
    entered.value = true;
    if (run.value?.pendingParley || endingPerson.value) { person.value = run.value?.pendingParley?.enemy ?? endingPerson.value!; panel.value = 'person'; paused.value = false; }
    else { void resume(); }
}
async function act(command: Command) {
    if (performing.value || transition.value) { return false; }
    performing.value = true;
    if (command.type === 'interact' && run.value) {
        transition.value = COURTYARD[run.value.location.scene].exits.find(exit => exit.id === command.id)?.to ?? null;
    }
    let ok = false;
    try {
        if (!await playback.flush()) { return false; }
        ok = await client.act(command);
        if (ok) {
            playback.sync();
            if (!panel.value && !paused.value) { await nextTick(); field.value?.focus(); }
        }
        return ok;
    } finally {
        performing.value = false;
        if (!ok) { transition.value = null; }
    }
}
function sceneReady(scene: CourtyardScene) { if (scene === transition.value) { transition.value = null; } }
async function start(setup: Omit<JourneySetup, 'outfit'>) {
    if (await act({ type: run.value ? 'restart' : 'start', ...setup, outfit: outfit.value })) { entered.value = true; panel.value = 'prologue'; }
}
function returnToTitle() { paused.value = true; panel.value = null; entered.value = false; void playback.flush(); }
async function interact(id: string) {
    if (!run.value || performing.value || transition.value) { return; }
    const target = [...campaignInteractions(run.value), ...parleyInteractions(run.value.location.scene, run.value.location.position, new Set(run.value.facts))].find(item => item.target.id === id);
    const object = target?.kind === 'object' ? target.target : null;
    if (object?.kind === 'person' || object?.kind === 'enemy') {
        const recipient = object.kind === 'person' ? object.person : object.enemy;
        person.value = recipient; panel.value = 'person';
        if (await playback.flush() && !run.value.conversations[recipient].length && await client.act({ type: 'greet', person: recipient })) { playback.sync(); }
        return;
    }
    if (await act({ type: 'interact', id }) && object?.kind === 'inspect') { passage.value = object.passage; panel.value = 'passage'; }
}
async function send() {
    const recipient = person.value, text = draft.value.trim();
    if (blocked.value || preparingSend.value || !text || conclusion.value) { return; }
    drafts.value[recipient] = ''; queued.value = { person: recipient, text }; preparingSend.value = true;
    reading.delete(recipient);
    try {
        if (!await playback.flush()) { return; }
        const request = client.talk(recipient, text);
        queued.value = null;
        if (await request) { playback.sync(); }
    } finally { preparingSend.value = false; }
}
async function regenerate() {
    if (blocked.value || preparingSend.value || !run.value) { return; }
    reading.delete(person.value);
    if (retrying.value && pendingLine.value) {
        const pending = pendingLine.value;
        const request = client.talk(pending.person, pending.text);
        queued.value = null;
        if (await request) { playback.sync(); }
    } else {
        const latest = latestReply(run.value);
        if (latest?.person === person.value && await client.talk(person.value, latest.turn.player, latest.turn.id)) { playback.sync(); }
    }
}
function rememberReading() {
    const element = transcript.value;
    if (element) { reading.set(person.value, { top: element.scrollTop, latest: element.scrollHeight - element.clientHeight - element.scrollTop < 32 }); }
}
function scrollToReply() {
    const log = transcript.value;
    if (!log || reading.get(person.value)?.latest === false) { return; }
    const latest = freshReply.value ? log.querySelector<HTMLElement>('[data-fresh-reply="true"]') : null;
    log.scrollTop = latest && latest.offsetHeight > log.clientHeight
        ? latest.getBoundingClientRect().top - log.getBoundingClientRect().top + log.scrollTop - 12 : log.scrollHeight;
}
async function recover() { if (await playback.recover()) { paused.value = true; epoch.value++; } }
watch(() => props.generationActive, value => { if (value) { pause(); } });
watch(() => [run.value?.pendingParley, endingPerson.value] as const, ([pending, ending]) => {
    if (pending || ending) { person.value = pending?.enemy ?? ending!; panel.value = 'person'; }
}, { immediate: true });
watch(sound, value => { void audio.enable(value); });
watch(run, value => { if (sound.value && value?.battle) { audio.tick(value.battle); } });
// Every confirmed source (button, model, recovery or reattached window) presents the same transition.
watch(() => view.value?.data, (next, previous) => {
    if (!next?.active || !previous?.active || next.active.id !== previous.active.id) { return; }
    const before = new Set(previous.active.facts), after = new Set(next.active.facts);
    if (!before.has('chapter_completed') && after.has('chapter_completed')) { panel.value = 'ending'; }
    else if (!before.has('captives_arrived') && after.has('captives_arrived')) { panel.value = 'arrival'; }
});
watch(() => run.value?.id, () => { drafts.value = {}; queued.value = null; reading.clear(); });
watch([panel, person], () => { freshReply.value = null; });
watch(notice, value => { if (value) { freshReply.value = null; } });
watch(() => [person.value, history.value] as const, ([recipient, next], [priorRecipient, previous]) => {
    const latest = next.filter(turn => turn.kind === 'dialogue').at(-1);
    if (recipient === priorRecipient && panel.value === 'person' && latest && !previous.some(turn => turn.id === latest.id)) { freshReply.value = latest.id; }
});
watch([transcript, person], ([element, recipient]) => {
    const position = reading.get(recipient);
    if (element) { element.scrollTop = position && !position.latest ? position.top : element.scrollHeight; }
}, { flush: 'post' });
watch(transcript, (element, _previous, onCleanup) => {
    if (!element) { return; }
    const observer = new ResizeObserver(scrollToReply);
    observer.observe(element); onCleanup(() => observer.disconnect());
}, { flush: 'post' });
watch(() => [history.value.length, talking.value, pendingLine.value, freshReply.value], async () => {
    await nextTick(); scrollToReply();
});
onMounted(async () => { await client.read(); mounted = true; });
onActivated(() => { if (mounted && !dirty.value) { void client.read(); } });
onDeactivated(() => { freshReply.value = null; pause(); });
onBeforeUnmount(() => { playback.dispose(); client.dispose(); audio.dispose(); });
</script>

<template>
    <section class="ember-campaign">
        <JourneyEntry v-if="!entered" ref="entry" :campaign="run" :ready="!!view?.ready" :busy="busy" :blocked="blocked || generationActive" @start="start" @continue="continueJourney" />
        <ExplorationField
            v-if="entered && run && world"
            :key="epoch" ref="field" :world="world" :traveler="run.traveler" :paused="halted" :transitioning="!!transition" :weapon="run.weapon" :outfit="outfit" :battle="run.battle"
            @input="playback.input" @interact="interact" @pause="pause" @resume="resume" @error="renderingError = true" @ready="sceneReady"
        >
            <template #status>
                <template v-if="run">
                    <div class="ember-health"><meter :min="0" :max="RULES.maxHp" :value="run.hp" :aria-label="COPY.hp" /><span>{{ Math.ceil(run.hp) }} / {{ RULES.maxHp }}</span></div>
                    <p class="ember-objective">{{ campaignObjective(run) }}</p>
                </template>
            </template>
            <template #overlay><span /></template>
        </ExplorationField>
        <aside v-if="entered && transition && !notice && !renderingError && !panel && !paused" class="ember-transition" role="status">{{ w.transition(w.scenes[transition]) }}</aside>
        <nav v-if="entered && run && !run.pendingParley && !endingPerson" class="ember-tools" :aria-label="c.prepare">
            <button type="button" :disabled="performing || !!transition" :aria-label="c.map" @click="open('map')"><ExpeditionIcon name="map" /><span>{{ c.map }}</span></button>
            <button type="button" :disabled="performing || !!transition" :aria-label="c.build" @click="open('build')"><ExpeditionIcon name="bag" /><span>{{ c.build }}</span></button>
            <button type="button" :disabled="performing || !!transition" :aria-label="c.journal" @click="open('journal')"><ExpeditionIcon name="journal" /><span>{{ c.journal }}</span></button>
            <button type="button" :aria-label="c.pause" @click="menu"><ExpeditionIcon name="pause" /><span>{{ c.pause }}</span></button>
        </nav>
        <div v-if="entered && boss && !panel" class="ember-boss">
            <strong>{{ ENEMY_NAMES[boss.kind] }}</strong><meter min="0" :max="boss.maxHp" :value="boss.hp" :aria-label="ENEMY_NAMES[boss.kind]" />
        </div>
        <div v-if="entered && run?.phase === 'battle' && ['gate', 'beacon'].includes(run.location.scene) && !facts.has('alarm_silenced')" class="ember-alarm">
            {{ facts.has('alarm_raised') ? c.alarmRaised : c.alarmSeconds(Math.ceil((CAMPAIGN_RULES.alarmTicks - run.alarmTicks) / RULES.hz)) }}
        </div>

        <section v-if="notice || renderingError || generationActive" ref="noticePanel" class="ember-notice" role="alertdialog" aria-modal="true" :aria-label="c.noticeTitle" tabindex="-1">
            <p>{{ renderingError ? c.renderError : generationActive ? c.generation : notice }}</p>
            <button v-if="renderingError" type="button" @click="renderingError = false; epoch++">{{ c.reload }}</button>
            <template v-else-if="client.dataInvalid.value && !generationActive">
                <p>{{ c.rebuildWarning }}</p><button type="button" :disabled="busy" @click="client.rebuild">{{ c.rebuild }}</button>
            </template>
            <button v-else-if="!generationActive" type="button" :disabled="busy" @click="client.recoveryRequired.value ? recover() : client.dismissError()">{{ client.recoveryRequired.value ? c.recover : c.acknowledge }}</button>
        </section>

        <aside v-if="conversationFailure && !notice && (panel !== 'person' || person !== conversationFailure.person)" class="ember-conversation-notice" role="status">
            <strong>{{ participantName(conversationFailure.person) }}</strong><p>{{ errorText(conversationFailure) }}</p>
            <details v-if="conversationFailure.text"><summary>{{ c.receivedReply }}</summary><p class="ember-prose">{{ conversationFailure.text }}</p></details>
            <button type="button" @click="client.dismissConversationFailure">{{ c.acknowledge }}</button>
        </aside>

        <div v-if="entered && run && !notice && !renderingError && !generationActive && (panel || paused || run.phase === 'reward' || run.phase === 'lost')" class="ember-curtain" :style="panel === 'person' ? sceneArtStyle : undefined">
            <section ref="dialog" class="ember-panel" :class="{ 'ember-wide': panel === 'map' || panel === 'build' && packTab === 'wardrobe', 'ember-map-panel': panel === 'map', 'ember-wardrobe-panel': panel === 'build' && packTab === 'wardrobe', 'ember-dialogue': panel === 'person' }" role="dialog" aria-modal="true" :aria-label="panelTitle" tabindex="-1">
                <header v-if="panel !== 'map' && panel !== 'person'" class="ember-panel-heading">
                    <h2>{{ panelTitle }}</h2>
                    <nav v-if="panel === 'build'" class="ember-pack-tabs" :aria-label="c.build"><button type="button" :aria-pressed="packTab === 'relics'" @click="packTab = 'relics'">{{ j.equipment }}</button><button type="button" :aria-pressed="packTab === 'wardrobe'" @click="packTab = 'wardrobe'">{{ c.wardrobe }}</button></nav>
                    <button v-if="panel !== 'prologue' && run.pendingParley?.decision !== 'attack' && (panel || run.phase !== 'lost' && run.phase !== 'reward')" type="button" :disabled="!!run.pendingParley && blocked" @click="resume">{{ c.close }}</button>
                </header>
                <template v-if="panel === 'map'"><CampaignMap :campaign="run" @close="resume" /></template>
                <template v-else-if="panel === 'prologue'"><p class="ember-prose ember-prologue">{{ c.opening }}</p><button class="ember-primary" type="button" @click="resume">{{ c.start }}</button></template>
                <template v-else-if="panel === 'journal'">
                    <p class="ember-objective-panel">{{ campaignObjective(run) }}</p>
                    <ol class="ember-journal"><li v-for="fact in run.facts" :key="fact">{{ FACT_COPY[fact] }}</li></ol>
                </template>
                <template v-else-if="panel === 'build'">
                    <ExpeditionWardrobe v-if="packTab === 'wardrobe' && view" :data="view.data" :traveler="run.traveler" :balance="view.balance" :blocked="blocked" :weapon="run.weapon" @command="act" />
                    <template v-else>
                        <div class="ember-pack-heading"><strong>{{ run.traveler.name }}</strong><span>{{ j.genders[run.traveler.gender] }} · {{ j.identityRole }}</span></div>
                        <small>{{ c.slots(run.equipped.length, RULES.relicSlots) }}</small>
                        <p>{{ WEAPON_COPY[run.weapon].name }} · {{ skillDetail(run.weapon) }}</p>
                        <p v-if="!COURTYARD[run.location.scene].safe">{{ c.safeBuild }}</p>
                        <p v-if="!run.collection.length">{{ c.emptyBuild }}</p>
                        <div class="ember-relics">
                            <article v-for="relic in loadoutOptions" :key="relic.id">
                                <ExpeditionIcon :name="relic.id" /><h3>{{ RELIC_COPY[relic.id].name }} <small>{{ COPY.rank(relic.rank) }}</small></h3><p>{{ RELIC_COPY[relic.id].detail }}</p>
                                <small v-if="relic.issue === 'dependency' || relic.issue === 'capacity'">{{ c.loadoutIssue[relic.issue] }}</small>
                                <button type="button" :disabled="blocked || !!relic.issue" @click="act({ type: 'loadout', equipped: relic.equipped })">{{ run.equipped.includes(relic.id) ? c.takeOff : c.putOn }}</button>
                            </article>
                        </div>
                    </template>
                </template>
                <template v-else-if="panel === 'person'">
                    <header class="ember-dialogue-heading">
                        <div class="ember-person-heading"><h2>{{ participantName(person) }}</h2><small>{{ w.scenes[run.location.scene] }}</small></div>
                        <ConversationMeters :key="person" :campaign="run" :person="person" :draft="draft" :memory-state="view?.memories?.[person]" :blocked="blocked" @retry-memory="client.retryMemory(person)" />
                        <button v-if="!endingPerson && run.pendingParley?.decision !== 'attack'" type="button" :disabled="!!run.pendingParley && blocked" @click="resume">{{ c.close }}</button>
                    </header>
                    <div ref="transcript" class="ember-dialogue-scroll" role="log" aria-live="polite" @scroll="rememberReading">
                        <DialogueBubble v-if="greeting" :person="person" :reply="greeting.reply" :performance="greeting.performance" :animate="false" />
                        <template v-for="turn in history" :key="turn.id">
                            <p v-if="turn.kind !== 'greeting'" class="ember-player-line"><small>{{ run.traveler.name }}</small>{{ turn.player }}</p>
                            <p v-if="turn.issue === 'action_rejected' || turn.issue === 'reply_invalid' || turn.issue === 'reply_incomplete'" class="ember-dialogue-issue">{{ dialogueCopy.issues[turn.issue] }}</p>
                            <details v-if="turn.kind === 'receipt' && turn.issue === 'reply_invalid'"><summary>{{ dialogueCopy.rawReply }}</summary><p class="ember-prose">{{ turn.reply }}</p></details>
                            <p v-else-if="turn.kind === 'receipt'" class="ember-prose">{{ turn.reply }}</p>
                            <div v-else class="ember-npc-turn" :data-fresh-reply="freshReply === turn.id">
                                <DialogueBubble :person="person" :reply="turn.reply" :performance="turn.performance" :animate="freshReply === turn.id" />
                                <DialogueActionFeedback :campaign="run" :person="person" :turn="turn" />
                            </div>
                        </template>
                        <template v-if="pendingLine">
                            <p class="ember-player-line" :aria-busy="pendingLine.status === 'sending'"><small>{{ run.traveler.name }}</small>{{ pendingLine.text }}</p>
                            <p v-if="retrying" class="ember-dialogue-issue" role="status">{{ dialogueCopy.sendFailed }}</p>
                        </template>
                        <div v-if="conversationFailure?.person === person && !history.some(turn => turn.id === conversationFailure?.actionId)" class="ember-dialogue-issue" role="status">
                            <p>{{ errorText(conversationFailure) }}</p>
                            <details v-if="conversationFailure.text"><summary>{{ c.receivedReply }}</summary><p class="ember-prose">{{ conversationFailure.text }}</p></details>
                            <button type="button" @click="client.dismissConversationFailure">{{ c.acknowledge }}</button>
                        </div>
                        <p v-if="talking">{{ c.thinking }}</p>
                    </div>
                    <DialogueComposer v-model="draft" :blocked="blocked || preparingSend || generationActive" :talking="talking" :can-regenerate="!!regeneratable || retrying" :retrying="retrying" :conclusion="conclusion" @send="send" @regenerate="regenerate" @continue="continueDialogue" @cancel="client.cancelTalk" />
                </template>
                <template v-else-if="panel === 'passage'"><p class="ember-prose">{{ w.passages[passage].body }}</p></template>
                <template v-else-if="panel === 'arrival'"><img class="ember-story-art" :src="STORY_ART.arrival" alt="" decoding="async"><p class="ember-prose">{{ c.received }}</p><button class="ember-primary" type="button" @click="resume">{{ c.resume }}</button></template>
                <template v-else-if="panel === 'ending'"><img class="ember-story-art" :src="STORY_ART.ending" alt="" decoding="async"><h2>{{ c.endingTitle }}</h2><p class="ember-prose">{{ c.ending }}</p><strong class="ember-continued">{{ c.continued }}</strong><p>{{ c.optional }}</p><button class="ember-primary" type="button" @click="resume">{{ c.remain }}</button></template>
                <template v-else-if="run.phase === 'reward'">
                    <p>{{ c.rewardDetail }}</p>
                    <div class="ember-relics"><button v-for="offer in run.offers" :key="offer.id" type="button" :disabled="blocked" @click="act({ type: 'relic', id: offer.id })"><ExpeditionIcon :name="offer.id" /><h3>{{ RELIC_COPY[offer.id].name }} <small>{{ COPY.rank(offer.rank) }}</small></h3><p>{{ RELIC_COPY[offer.id].detail }}</p></button></div>
                    <button type="button" :disabled="blocked" @click="act({ type: 'leave' })">{{ c.skip }}</button>
                </template>
                <template v-else-if="run.phase === 'lost'"><p class="ember-prose">{{ c.fallenDetail }}</p><button class="ember-primary" type="button" :disabled="blocked" @click="act({ type: 'retry' })">{{ c.retry }}</button><button type="button" :disabled="blocked" @click="act({ type: 'retreat' })">{{ c.retreat }}</button></template>
                <template v-else>
                    <button class="ember-primary" type="button" :disabled="!!notice || generationActive" @click="resume">{{ c.resume }}</button>
                    <div class="ember-pause-actions"><button type="button" :aria-pressed="sound" @click="sound = !sound">{{ c.sound }}</button></div>
                    <details><summary>{{ j.controls }}</summary><p class="ember-help ember-keyboard-help">{{ c.controls }}</p><p class="ember-help ember-touch-help">{{ c.touchControls }}</p></details>
                    <button type="button" @click="returnToTitle">{{ j.title }}</button>
                </template>
            </section>
        </div>
    </section>
</template>
