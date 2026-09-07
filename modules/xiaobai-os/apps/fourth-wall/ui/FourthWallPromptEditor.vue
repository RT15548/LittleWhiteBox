<script setup lang="ts">
import { reactive, ref, toRaw } from 'vue';
import { useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
import type { FourthWallGlobalSettings } from '../types.js';

const props = defineProps<{
    templates: FourthWallGlobalSettings['promptTemplates'];
}>();

const emit = defineEmits<{
    close: [];
    save: [templates: FourthWallGlobalSettings['promptTemplates']];
    restore: [];
}>();

const draft = reactive(structuredClone(toRaw(props.templates)));
const layer = ref<HTMLElement | null>(null);
useAppLayer(layer, () => emit('close'));

function save(): void {
    emit('save', structuredClone(toRaw(draft)));
}
</script>

<template>
    <div ref="layer" class="fourth-wall-modal-backdrop" @click.self="emit('close')">
        <section class="fourth-wall-modal" role="dialog" aria-label="四次元壁提示词">
            <header><strong>提示词模板</strong><button type="button" @click="emit('close')">关闭</button></header>
            <div class="fourth-wall-prompt-fields">
                <label>Top User<textarea v-model="draft.topuser" rows="5" /></label>
                <label>Confirm<textarea v-model="draft.confirm" rows="3" /></label>
                <label>Meta Protocol<textarea v-model="draft.metaProtocol" rows="12" /></label>
                <label>Bottom<textarea v-model="draft.bottom" rows="5" /></label>
            </div>
            <footer>
                <button type="button" class="is-danger" @click="emit('restore')">恢复默认</button>
                <button type="button" class="is-primary" @click="save">保存</button>
            </footer>
        </section>
    </div>
</template>
