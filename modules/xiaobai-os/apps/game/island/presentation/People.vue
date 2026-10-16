<script setup lang="ts">
import { computed } from 'vue';
import type { IslandView } from '../service.js';
import { CONTACT_FORMS, type NpcId, type Operation, type Point } from '../model.js';
import { COPY as c, activityText, personName } from '../copy.js';
import { RULES } from '../content.js';
import { distance, withinReach } from '../space.js';
import Portrait from './Portrait.vue';
import Agreements from './Agreements.vue';
import Remains from './Remains.vue';
import WoundCare from './WoundCare.vue';
import Graves from './Graves.vue';
import ConflictControls from './ConflictControls.vue';
const props = defineProps<{ observation: NonNullable<IslandView['player']>; selected: NpcId | null; disabled: boolean }>();
const emit = defineEmits<{ act: [operation: Operation]; move: [point: Point]; select: [person: NpcId]; drag: [person: NpcId] }>();
const residence = computed(() => props.observation.declarations.find(e => e.payload.kind === 'declaration' && e.payload.actor === 'player' && e.payload.choice.kind === 'residence'));
const home = computed(() => residence.value?.payload.kind === 'declaration' && residence.value.payload.choice.kind === 'residence' ? residence.value.payload.choice.position : null);
const subject = computed(() => props.observation.people.find(p => p.id === props.selected));
function support(stance: 'with' | 'against' | 'neutral') {
    if (props.selected) { emit('act', { kind: 'declare', text: c.declaration(props.selected, stance), choice: { kind: 'support', person: props.selected, stance } }); }
}
function approach() {
    if (!subject.value) { return; }
    const from = props.observation.self.position, to = subject.value.position, span = distance(from, to);
    if (withinReach(from,to)) { return; }
    const fraction = (span - RULES.reachMetres * .8) / span;
    emit('move', { x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction });
}
</script>
<template>
    <section class="island-social">
        <h3>{{ c.visiblePeople }}</h3>
        <nav class="island-person-tabs"><button v-for="person in observation.people" :key="person.id" :aria-pressed="selected === person.id" @click="emit('select', person.id as NpcId)">{{ person.identity.name }}</button></nav>
        <article v-if="subject" class="island-item"><div class="island-person-profile"><Portrait :person="subject.id as NpcId" /><div><strong>{{ subject.identity.name }}</strong><p>{{ subject.body.kind === 'dead' ? c.remains : activityText(subject.activity, subject.work) }} · {{ c.distance(distance(observation.self.position, subject.position)) }}</p></div></div><div class="island-item-actions"><button v-if="!withinReach(observation.self.position,subject.position)" :disabled="disabled || !!observation.self.activity" @click="approach">{{ c.approach }}</button><template v-if="subject.body.kind === 'living'"><button v-for="key in (['with', 'neutral', 'against'] as const)" :key="key" :disabled="disabled" @click="support(key)">{{ c.stance[key] }}</button></template></div></article>
        <Remains v-if="subject?.body.kind === 'dead'" :observation="observation" :subject="subject.id as NpcId" :disabled="disabled" @act="emit('act',$event)" @drag="emit('drag',$event)" />
        <div v-if="subject?.body.kind === 'living' && withinReach(observation.self.position, subject.position)" class="island-item-actions">
            <button v-if="observation.self.activity?.kind === 'contact' && observation.self.activity.with === subject.id" :disabled="disabled" @click="emit('act', { kind: 'cancel' })">{{ c.releaseContact }}</button>
            <button v-else-if="observation.self.activity?.kind === 'offer_contact' && observation.self.activity.to === subject.id" :disabled="disabled" @click="emit('act', { kind: 'cancel' })">{{ c.withdrawContact }}</button>
            <template v-else><button v-for="form in CONTACT_FORMS" :key="form" :disabled="disabled || !!observation.self.activity" @click="emit('act', { kind: 'offer_contact', to: subject.id, form })">{{ c.contactNames[form] }}</button></template>
        </div>
        <ConflictControls v-if="subject?.body.kind === 'living'" :key="subject.id" :observation="observation" :subject="subject.id" :disabled="disabled" @act="emit('act', $event)" />
        <p v-if="subject?.body.condition">{{ c.remainsCondition[subject.body.condition] }}</p>
        <Graves :observation="observation" :disabled="disabled" @act="emit('act', $event)" @move="emit('move', $event)" />
        <WoundCare v-if="subject?.body.kind==='living' && withinReach(observation.self.position,subject.position)" :observation="observation" :subject="subject.id" :disabled="disabled" @act="emit('act',$event)" @move="emit('move',$event)" />
        <small v-if="subject?.body.kind !== 'dead'">{{ c.declarationNote }}</small>
        <h3>{{ c.ownChoices }}</h3>
        <div class="island-item"><strong>{{ c.residence }}</strong><p>{{ home ? c.distance(distance(observation.self.position, home)) : c.noResidence }}</p><div class="island-item-actions"><button :disabled="disabled" @click="emit('act', { kind: 'declare', text: c.declareResidence, choice: { kind: 'residence', position: observation.self.position } })">{{ c.settleHere }}</button><button v-if="home" :disabled="disabled || !!observation.self.activity" @click="emit('move', home)">{{ c.returnHome }}</button></div></div>
        <Agreements :agreements="observation.agreements" :player-name="observation.self.identity.name" :disabled="disabled" @act="emit('act', $event)" />
        <h3>{{ c.knownChoices }}</h3><p v-if="!observation.declarations.length">{{ c.noChoices }}</p>
        <article v-for="event in observation.declarations" :key="event.sequence" class="island-log"><template v-if="event.payload.kind === 'declaration'"><small>{{ personName(event.payload.actor, observation.self.identity.name) }} · {{ c.time(event.at) }}</small><p>{{ event.payload.text }}</p></template></article>
    </section>
</template>
<style scoped>
.island-person-profile{display:flex;align-items:center;gap:15px;padding:8px 0}.island-person-profile :deep(.island-portrait){width:96px;border-radius:5px}.island-person-profile strong{font-size:17px}
</style>
