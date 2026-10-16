<script setup lang="ts">
import { ref, watch } from 'vue';
import type { IslandView } from '../service.js';
import { STRIKE_FORMS, type Operation, type PersonId, type StrikeForm } from '../model.js';
import { GUARD, STRIKES } from '../interaction-content.js';
import { distance } from '../space.js';
import { COPY as c } from '../copy.js';
const props = defineProps<{ observation: NonNullable<IslandView['player']>; subject: PersonId; disabled: boolean }>();
const emit = defineEmits<{ act: [operation: Operation] }>();
const pending = ref<StrikeForm | null>(null);
watch(() => [props.observation.clock, props.subject], () => { pending.value = null; });
function reachable(form: StrikeForm) {
    const other = props.observation.people.find(p => p.id === props.subject);
    return !!other && distance(props.observation.self.position, other.position) <= STRIKES[form].reach;
}
function confirm() {
    if (!pending.value || !reachable(pending.value)) { return; }
    const form = pending.value; pending.value = null;
    emit('act', { kind: 'strike', to: props.subject, form });
}
</script>
<template>
    <details class="island-item">
        <summary>{{ c.conflict }}</summary>
        <div class="island-item-actions">
            <button :disabled="disabled" @click="emit('act', { kind: 'guard', seconds: GUARD.defaultSeconds })">{{ c.guard }}</button>
            <button v-for="form in STRIKE_FORMS" :key="form" :disabled="disabled || !!observation.self.activity || !reachable(form)" @click="pending = form">{{ c.strikeNames[form] }}</button>
        </div>
        <template v-if="pending"><p role="alert">{{ c.strikeWarning }}</p><div class="island-item-actions"><button :disabled="disabled || !!observation.self.activity || !reachable(pending)" @click="confirm">{{ c.confirmStrike }} · {{ c.strikeNames[pending] }}</button><button @click="pending = null">{{ c.cancel }}</button></div></template>
    </details>
</template>
