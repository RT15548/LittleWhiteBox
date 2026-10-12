<script setup lang="ts">
import { ref } from 'vue';
import type { LearningClassView } from '../application/projection.js';
import { LEARNING_SELECTION_LIMIT, type LearningSelection } from '../../../domains/learning/notes.js';
import LearningIcon from './LearningIcon.vue';
import { LEARNING_SELECTION_COPY as copy, useLearningTextSelection } from './reading-selection.js';
type Material = NonNullable<LearningClassView['unit']>['materials'][number];
const props = defineProps<{ material: Material; disabled: boolean; exerciseId?: string }>();
const emit = defineEmits<{ action: [name: string, input: Record<string, unknown>]; select: [selection: LearningSelection] }>();
const root = ref<HTMLElement | null>(null);
useLearningTextSelection(root, () => [props.material], value => emit('select', value));
function selectParagraph(paragraph: { id: string; text: string }) {
    emit('select', { materialId: props.material.id, paragraphId: paragraph.id, start: 0, end: paragraph.text.length, quote: paragraph.text });
}
</script>

<template>
    <article ref="root" class="learning-material">
        <h2>{{ material.title }}</h2>
        <div class="learning-source">
            <span v-if="material.provenance.kind === 'authored'">语伴自编练习</span>
            <a v-else :href="material.provenance.url" target="_blank" rel="noopener noreferrer">{{ material.provenance.kind === 'original' ? '原文节选' : '改编自' }} · {{ material.provenance.title }} ↗</a>
        </div>
        <div v-if="material.hidden" class="learning-listening-cover">
            <svg viewBox="0 0 140 60" aria-hidden="true"><path d="M8 27v6m10-14v22m10-31v40m10-26v12m10-35v58m10-47v36m10-27v18m10-37v56m10-36v16m10-29v42m10-31v20m10-16v12m10-8v4" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" /></svg>
            <button type="button" :disabled="disabled" @click="emit('action', 'reveal', { kind: 'transcripts', id: material.id })">看文稿</button>
        </div>
        <div v-else class="learning-material-body">
            <div v-for="paragraph in material.paragraphs" :key="paragraph.id" class="learning-paragraph">
                <p tabindex="0" data-learning-text :data-material-id="material.id" :data-paragraph-id="paragraph.id">{{ paragraph.text }}</p>
                <button type="button" :disabled="[...paragraph.text].length > LEARNING_SELECTION_LIMIT" @click="selectParagraph(paragraph)">{{ copy.select }}</button>
            </div>
        </div>
        <div class="learning-audio-parts" aria-label="材料朗读分段">
            <button
                v-for="part in material.parts" :key="part.key" type="button" :disabled="disabled"
                @click="emit('action', 'play', { materialId: material.id, partKey: part.key, exerciseId })"
            >
                <LearningIcon name="play" />{{ material.parts.length > 1 ? `听第 ${part.number} 段` : '播放朗读' }}
            </button>
        </div>
        <small v-if="material.parts.length">TTS 合成朗读</small>
    </article>
</template>
