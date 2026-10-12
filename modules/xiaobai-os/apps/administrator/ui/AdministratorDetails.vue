<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { AdministratorOperation } from '../domain/types.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';
import { ADMINISTRATOR_COPY as C, administratorError } from './copy.js';
import { useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
const props = defineProps<{ bridge: XiaobaiOsAppProps['bridge']; chatIdentity: string; turnId: string }>();
const emit = defineEmits<{ close: [] }>();
const items = ref<AdministratorOperation[]>([]), offset = ref(0), total = ref(0), error = ref(''), loading = ref(false);
const evidence = ref<{ text: string; nextOffset: number | null; offset: number; totalChars: number } | null>(null);
const reference = ref('');
const layer = ref<HTMLElement | null>(null);
const modal = ref(true);
let layoutObserver: ResizeObserver | undefined;
function focusLayer() { void nextTick(() => layer.value?.focus({ preventScroll: true })); }
function back() { if (evidence.value) { evidence.value = null; focusLayer(); } else { emit('close'); } }
useAppLayer(layer, back, () => modal.value);
async function page(start: number) {
    loading.value = true; error.value = ''; evidence.value = null;
    try {
        const response = await props.bridge.request('administrator/operations', { chatIdentity: props.chatIdentity, turnId: props.turnId, offset: start }) as { result: { items: AdministratorOperation[]; total: number; offset: number } };
        items.value = response.result.items; total.value = response.result.total; offset.value = response.result.offset;
    } catch (cause) { error.value = administratorError(cause); }
    finally { loading.value = false; }
}
async function read(id: string, start = 0) {
    loading.value = true; error.value = '';
    try {
        const response = await props.bridge.request('administrator/evidence', { chatIdentity: props.chatIdentity, reference: id, offset: start }) as { result: NonNullable<typeof evidence.value> };
        evidence.value = response.result; reference.value = id; focusLayer();
    } catch (cause) { error.value = administratorError(cause); }
    finally { loading.value = false; }
}
onMounted(() => {
    const root = layer.value!.closest<HTMLElement>('.administrator-app')!;
    const syncLayout = () => { modal.value = getComputedStyle(root).getPropertyValue('--admin-details-docked').trim() !== '1'; };
    syncLayout();
    layoutObserver = new ResizeObserver(syncLayout);
    layoutObserver.observe(root);
    focusLayer();
    void page(0);
});
onBeforeUnmount(() => layoutObserver?.disconnect());
</script>

<template>
    <section ref="layer" class="admin-details" :role="modal ? 'dialog' : 'region'" :aria-modal="modal ? true : undefined" tabindex="-1" :aria-label="C.details" @keydown.esc.stop.prevent="back">
        <header><strong>{{ C.details }}</strong><button type="button" :aria-label="C.close" @click="emit('close')">×</button></header>
        <div class="admin-details-body">
            <template v-if="evidence">
                <button type="button" class="admin-text-button" @click="back">‹ {{ C.details }}</button>
                <pre class="admin-evidence">{{ evidence.text }}</pre>
                <button v-if="evidence.nextOffset !== null" type="button" :disabled="loading" @click="read(reference, evidence.nextOffset)">{{ C.moreText }}</button>
            </template>
            <template v-else>
                <ol class="admin-operations">
                    <li v-for="op in items" :key="op.id">
                        <div><i class="admin-operation-dot" :class="`is-${op.status}`" /><strong>{{ op.name }}</strong><span>{{ C.operations[op.status] }}</span><small>{{ (op.elapsedMs / 1000).toFixed(1) }}s</small></div>
                        <p v-if="op.target">{{ op.target }}</p><p class="admin-muted">{{ op.summary }}</p>
                        <button type="button" class="admin-text-button" :disabled="loading" @click="read(op.id)">{{ C.evidence }}</button>
                    </li>
                </ol>
                <nav class="admin-pager"><button type="button" :disabled="!offset || loading" @click="page(Math.max(0, offset - POLICY.pageSize))">{{ C.earlier }}</button><button type="button" :disabled="offset + items.length >= total || loading" @click="page(offset + items.length)">{{ C.later }}</button></nav>
            </template>
            <p v-if="error" class="admin-error" role="status">{{ error }}</p>
        </div>
    </section>
</template>
