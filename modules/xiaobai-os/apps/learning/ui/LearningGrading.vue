<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { LearningClientState } from '../types.js';
import type { LearningAnnotation } from '../../../domains/learning/types.js';
import { learningAnswerParagraphs } from '../../../domains/learning/facts.js';
import { applyLearningSentenceRevisions, learningAnnotatedSegments } from './workbench.js';
import { useLearningUnitSession } from './learning-session.js';
import { rememberLearningEditor as vRememberEditor } from './learning-editor.js';
import { LEARNING_FLOW_COPY as flow, LEARNING_DIALOGUE_COPY as dialogueCopy } from './learning-copy.js';
import { learningRevisionWork } from './revision-work.js';

type Unit = NonNullable<LearningClientState['unit']>;
const props = defineProps<{ state: LearningClientState; unit: Unit; disabled: boolean; pending: boolean; view: 'feedback' | 'model' }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>]; confirm: [name: string, input: Record<string, unknown>, text: string]; record: [id: string]; ask: [exerciseId: string] }>();
const categories = { content: '内容', grammar: '语法', vocabulary: '词汇', cohesion: '衔接' };
const severities = { error: '需要改', improve: '可以更好', alternative: '另一种说法' };
const books = { grammar: '语法本', vocabulary: '生词本' };
const copy = { title: '看看哪里能写得更好', unplaced: '这处改动还没写进作文。请调整后再提交，或跳过修改。' };
const itemBook = (annotation: LearningAnnotation) => annotation.itemId && (annotation.category === 'grammar' || annotation.category === 'vocabulary') ? books[annotation.category] : null;
const session = useLearningUnitSession(() => props.unit.id);
const edits = computed(() => session.value.edits);

const stage = computed(() => props.unit.stage.stage);
const paragraphNumbers = computed(() => new Map(props.unit.materials.flatMap(material => material.paragraphs).map((paragraph, index) => [paragraph.id, index + 1])));
const text = (attempt: Unit['attempts'][number] | undefined) => attempt?.answer.kind === 'text' ? attempt.answer.text : '';
const rows = computed(() => learningRevisionWork(props.unit).map(work => {
    const { exercise, draft, review, annotations } = work;
    return { ...work,
        label: exercise.paragraphId ? `第 ${paragraphNumbers.value.get(exercise.paragraphId) ?? '?'} 段总结` : exercise.prompt,
        paragraphs: learningAnswerParagraphs(text(draft)).map((paragraph, index) => ({ index,
            segments: learningAnnotatedSegments(paragraph, annotations.filter(entry => entry.paragraphIndex === index)),
            annotations: annotations.filter(entry => entry.paragraphIndex === index) })),
        resolved: new Set(review?.resolvedAnnotationIds ?? []) };
}).sort((left, right) => Number(right.annotations.length > 0) - Number(left.annotations.length > 0)));
const revising = (row: typeof rows.value[number]) => row.row.status === 'revising';
const editable = (row: typeof rows.value[number], annotation: LearningAnnotation) => revising(row) && annotation.severity !== 'alternative';
watch(rows, list => {
    for (const annotation of list.flatMap(row => row.annotations)) { edits.value[annotation.id] ??= { value: annotation.quote, done: false }; }
}, { immediate: true });
function markDone(annotation: LearningAnnotation) {
    const entry = edits.value[annotation.id];
    if (entry?.value.trim() && entry.value !== annotation.quote) { entry.done = true; }
}
/**
 * What each revising draft becomes with the rewrites marked done. Every note goes in, unchanged ones as themselves,
 * so each rewrite lands on the words its mark shows; one whose words cannot be found is reported, not guessed.
 */
const previews = computed(() => new Map(rows.value.filter(revising).map(row => [row.draft.id, applyLearningSentenceRevisions(text(row.draft),
    row.annotations.map(entry => ({ id: entry.id, paragraphIndex: entry.paragraphIndex, quote: entry.quote,
        replacement: edits.value[entry.id]?.done ? edits.value[entry.id].value : entry.quote })))])));
const unplaced = computed(() => new Set([...previews.value.values()].flatMap(preview => preview.missing)));
const doneCount = computed(() => [...previews.value.values()].reduce((sum, preview) => sum + preview.applied.length, 0));
const notice = ref('');
watch(doneCount, () => { notice.value = ''; });
const openCount = computed(() => rows.value.filter(revising).flatMap(row => row.annotations.filter(entry => entry.severity !== 'alternative')).length);
const markClass = (row: typeof rows.value[number], id?: string) => {
    const annotation = row.annotations.find(entry => entry.id === id);
    if (!annotation) { return ''; }
    // These spans always quote the original, never the reviewed revision.
    return ['learning-mark', `is-${annotation.severity}`];
};
function submitRevision() {
    const revisions = rows.value.filter(revising).flatMap(row => {
        const preview = previews.value.get(row.draft.id);
        return !preview || preview.text === text(row.draft) ? [] : [{ attemptId: row.draft.id, text: preview.text }];
    });
    if (revisions.length) { emit('action', 'submit-revision', { unitId: props.unit.id, revisions }); }
    else { notice.value = copy.unplaced; }
}
const working = computed(() => props.state.pending?.unitId === props.unit.id ? props.state.pending.purpose : null);
const pendingFeedback = computed(() => rows.value.some(entry => entry.row.status === 'grading' || entry.row.status === 'reviewing'));
</script>

<template>
    <section class="learning-grading" :aria-labelledby="view === 'feedback' ? 'learning-grading-title' : undefined">
        <template v-if="view === 'feedback'">
            <h2 id="learning-grading-title">{{ copy.title }}</h2>
            <div v-if="rows.some(revising)" class="learning-grading-actions">
                <small>已改 {{ doneCount }} / {{ openCount }} 处</small>
                <small v-if="notice" class="learning-annotation-missing" role="status">{{ notice }}</small>
                <button type="button" :disabled="disabled" @click="emit('confirm', 'skip-revision', { unitId: unit.id }, '跳过这次修改？批注会保留，直接进入范文。')">跳过修改</button>
                <button type="button" class="learning-primary" :disabled="disabled || !doneCount" @click="submitRevision">提交修改</button>
            </div>
            <details v-for="entry in rows" :key="entry.exercise.id" class="learning-graded" :open="session.expanded[`grading:${entry.draft.id}`] ?? entry.annotations.length > 0" @toggle="session.expanded[`grading:${entry.draft.id}`] = ($event.target as HTMLDetailsElement).open">
                <summary><h3>{{ entry.label }}</h3></summary>
                <section v-if="entry.revision" class="learning-revised-text">
                    <h4>{{ flow.revision }}</h4><p class="learning-write-saved">{{ text(entry.revision) }}</p>
                    <p v-if="entry.review?.guidance">{{ entry.review.guidance }}</p>
                </section>
                <p v-if="entry.assessment?.guidance" class="learning-graded-guidance">{{ entry.assessment.guidance }}</p>
                <button v-if="entry.assessment" type="button" @click="emit('ask', entry.exercise.id)">{{ dialogueCopy.askAssessment }}</button>
                <details v-if="entry.assessment && (entry.assessment.understanding || entry.assessment.expression)" class="learning-graded-more" :open="session.expanded[`feedback:${entry.draft.id}`]" @toggle="session.expanded[`feedback:${entry.draft.id}`] = ($event.target as HTMLDetailsElement).open">
                    <summary>理解与表达点评</summary>
                    <p v-if="entry.assessment.understanding"><b>理解</b>{{ entry.assessment.understanding }}</p>
                    <p v-if="entry.assessment.expression"><b>表达</b>{{ entry.assessment.expression }}</p>
                </details>
                <h4 v-if="entry.revision">{{ flow.original }}</h4>
                <div v-for="paragraph in entry.paragraphs" :key="paragraph.index" class="learning-graded-paragraph">
                    <p class="learning-graded-text"><template v-for="(segment, index) in paragraph.segments" :key="index"><mark v-if="segment.id" :class="markClass(entry, segment.id)">{{ segment.text }}</mark><template v-else>{{ segment.text }}</template></template></p>
                    <div v-for="annotation in paragraph.annotations" :key="annotation.id" class="learning-annotation" :class="[`is-${annotation.severity}`, { 'is-fixed': entry.resolved.has(annotation.id), 'is-edited': edits[annotation.id]?.done && revising(entry) }]">
                        <template v-if="entry.resolved.has(annotation.id)">
                            <p class="learning-annotation-fixed">✓ {{ flow.resolved }}</p>
                            <p>{{ annotation.explanation }}</p>
                        </template>
                        <template v-else-if="edits[annotation.id]?.done && revising(entry)">
                            <p v-if="unplaced.has(annotation.id)" class="learning-annotation-missing">原文里找不到“{{ annotation.quote }}”，这处改动不会写进修改稿。</p>
                            <p v-else class="learning-annotation-fixed">✓ 改为“{{ edits[annotation.id].value }}”</p>
                            <button type="button" @click="edits[annotation.id].done = false">再改</button>
                        </template>
                        <template v-else>
                            <p class="learning-annotation-tag"><span>{{ severities[annotation.severity] }}</span>{{ categories[annotation.category] }}</p>
                            <p>{{ annotation.explanation }}</p>
                            <p v-if="annotation.suggestion" class="learning-annotation-suggestion">可以写成：{{ annotation.suggestion }}</p>
                            <form v-if="editable(entry, annotation) && edits[annotation.id]" class="learning-annotation-edit" @submit.prevent="markDone(annotation)">
                                <textarea v-model="edits[annotation.id].value" v-remember-editor="edits[annotation.id]" rows="2" :aria-label="`改写：${annotation.quote}`" maxlength="600" />
                                <button type="submit" :disabled="!edits[annotation.id].value.trim() || edits[annotation.id].value === annotation.quote">改好了</button>
                            </form>
                            <small v-else-if="entry.review && annotation.severity !== 'alternative'">复核时这里还没改到</small>
                        </template>
                        <button v-if="itemBook(annotation)" type="button" class="learning-annotation-book" @click="emit('record', annotation.itemId!)">{{ itemBook(annotation) }} ↗</button>
                    </div>
                </div>
            </details>
        </template>
        <div v-if="pendingFeedback || stage === 'model'" class="learning-working" role="status">
            <template v-if="working"><span class="learning-working-dot" aria-hidden="true" /><span>{{ working === 'grade' ? flow.grading : working === 'revision-review' ? flow.reviewing : flow.modelling }}</span><button type="button" :disabled="pending" @click="emit('action', 'cancel')">{{ flow.stop }}</button></template>
            <template v-else><button type="button" class="learning-primary" :disabled="disabled" @click="emit('action', 'grade', { unitId: unit.id })">{{ stage === 'grading' ? flow.grade : flow.continue }}</button></template>
        </div>
        <section v-if="view === 'model' && unit.modelEssay" class="learning-model-essay">
            <h3>范文<small>{{ unit.modelEssay.level }}</small></h3>
            <p v-for="(line, index) in learningAnswerParagraphs(unit.modelEssay.text)" :key="index">{{ line }}</p>
        </section>
    </section>
</template>
