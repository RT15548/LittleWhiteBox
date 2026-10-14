<script setup lang="ts">
import { computed } from 'vue';
import type { IslandView } from '../service.js';
import type { NpcId, Operation, Point } from '../model.js';
import { COPY as c } from '../copy.js';
import { CAST, RULES } from '../content.js';
import { distance, withinReach } from '../space.js';
import Portrait from './Portrait.vue';
import Agreements from './Agreements.vue';
import Remains from './Remains.vue';
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
        <h3>{{ c.ownChoices }}</h3>
        <div class="island-item"><strong>{{ c.residence }}</strong><p>{{ home ? c.distance(distance(observation.self.position, home)) : c.noResidence }}</p><div class="island-item-actions"><button :disabled="disabled" @click="emit('act', { kind: 'declare', text: c.declareResidence, choice: { kind: 'residence', position: observation.self.position } })">{{ c.settleHere }}</button><button v-if="home" :disabled="disabled || !!observation.self.activity" @click="emit('move', home)">{{ c.returnHome }}</button></div></div>
        <h3>{{ c.visiblePeople }}</h3>
        <nav class="island-person-tabs"><button v-for="person in observation.people" :key="person.id" :aria-pressed="selected === person.id" @click="emit('select', person.id as NpcId)">{{ CAST[person.id].name }}</button></nav>
        <article v-if="subject" class="island-item"><div class="island-person-profile"><Portrait :person="subject.id as NpcId" /><div><strong>{{ CAST[subject.id].name }}</strong><p>{{ subject.body.kind === 'dead' ? c.remains : subject.activity ? c.active[subject.activity] : c.idle }} · {{ c.distance(distance(observation.self.position, subject.position)) }}</p></div></div><div class="island-item-actions"><button v-if="!withinReach(observation.self.position,subject.position)" :disabled="disabled || !!observation.self.activity" @click="approach">{{ c.approach }}</button><template v-if="subject.body.kind === 'living'"><button v-for="key in (['with', 'neutral', 'against'] as const)" :key="key" :disabled="disabled" @click="support(key)">{{ c.stance[key] }}</button></template></div></article>
        <Remains v-if="subject?.body.kind === 'dead'" :observation="observation" :subject="subject.id as NpcId" :disabled="disabled" @act="emit('act',$event)" @drag="emit('drag',$event)" />
        <small v-if="subject?.body.kind !== 'dead'">{{ c.declarationNote }}</small>
        <Agreements :agreements="observation.agreements" :disabled="disabled" @act="emit('act', $event)" />
        <h3>{{ c.knownChoices }}</h3><p v-if="!observation.declarations.length">{{ c.noChoices }}</p>
        <article v-for="event in observation.declarations" :key="event.sequence" class="island-log"><template v-if="event.payload.kind === 'declaration'"><small>{{ CAST[event.payload.actor].name }} · {{ c.time(event.at) }}</small><p>{{ event.payload.text }}</p></template></article>
    </section>
</template>
<style scoped>
.island-person-profile{display:flex;align-items:center;gap:15px;padding:8px 0}.island-person-profile :deep(.island-portrait){width:96px;border-radius:5px}.island-person-profile strong{font-size:17px}
</style>
