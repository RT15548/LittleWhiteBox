<script setup lang="ts">
import { onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue';
import type { IslandView } from '../service.js';
import type { NpcId, Point } from '../model.js';
import { createIslandScene } from './scene.js';
import { loadCharacters, type CharacterRoster } from './character-loader.js';
import type { PlayerIdentity } from '../characters.js';
import { COPY } from '../copy.js';
const props = defineProps<{ observation: NonNullable<IslandView['player']>; identity: PlayerIdentity; disabled: boolean }>();
const emit = defineEmits<{ move: [point: Point]; person: [person: NpcId]; error: [] }>();
const root = ref<HTMLElement | null>(null), loading = ref(true), controller = new AbortController();
let scene: ReturnType<typeof createIslandScene> | null = null, characters: CharacterRoster | null = null, active = true;
onMounted(async () => {
    try {
        characters = await loadCharacters(props.identity, controller.signal);
        scene = createIslandScene(root.value!, point => { if (!props.disabled) { emit('move', point); } }, person => emit('person', person), () => emit('error'), characters);
        scene.update(props.observation); scene.setActive(active); loading.value = false;
    } catch (error) {
        if (!controller.signal.aborted) { console.error(error); emit('error'); }
    }
});
watch(() => props.observation, value => scene?.update(value));
onBeforeUnmount(() => { controller.abort(); scene?.dispose(); characters?.dispose(); });
onActivated(() => { active = true; scene?.setActive(true); }); onDeactivated(() => { active = false; scene?.setActive(false); });
function changeZoom(by: number) { scene?.changeZoom(by); }
function keyboard(event: KeyboardEvent) {
    if (props.disabled || loading.value) { return; }
    const offset = ({ ArrowUp: [0, -8], ArrowDown: [0, 8], ArrowLeft: [-8, 0], ArrowRight: [8, 0] } as Record<string, number[]>)[event.key];
    if (!offset) { return; } event.preventDefault(); emit('move', { x: props.observation.self.position.x + offset[0], y: props.observation.self.position.y + offset[1] });
}
</script>
<template><div ref="root" class="island-field" tabindex="0" :aria-label="COPY.mapLabel" @keydown.self="keyboard"><p v-if="loading" class="island-field-loading" role="status">{{ COPY.loadingScene }}</p><div v-else class="island-camera"><button :aria-label="COPY.zoomIn" @click="changeZoom(-2)">＋</button><button :aria-label="COPY.zoomOut" @click="changeZoom(2)">−</button></div></div></template>
<style scoped>
.island-field{position:absolute;inset:0;outline:none;touch-action:manipulation}.island-field:focus-visible{outline:3px solid #3b817f;outline-offset:-3px}.island-field :deep(canvas){position:absolute;inset:0;width:100%;height:100%;display:block}
.island-field-loading{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);padding:12px 20px;border-radius:6px;background:#fffdf9ed;color:var(--island-ink);z-index:2;white-space:nowrap;font-size:13px}
.island-camera{position:absolute;z-index:2;left:14px;top:190px;display:flex;flex-direction:column;gap:5px}.island-camera button{width:36px;min-height:36px;padding:0;background:#fffdf9e8;font-size:20px}
</style>
