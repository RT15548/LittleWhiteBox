import { parseLearningAnswer } from './exercise.js';
import { parseLearningHeardParts } from './speech.js';
import { learningRecord, learningText } from './profile.js';
import { LEARNING_ANNOTATION_CATEGORIES, LEARNING_LIMITS as L, type LearningAnnotation, type LearningAssessment, type LearningAttempt, type LearningExercise, type LearningHelp, type LearningMaterial } from './types.js';
import { learningArray, learningBoolean, learningEnum, learningId, learningIds, learningInteger, learningTimestamp, parseLearningScope, requireLearning, uniqueLearning } from './validation.js';

export function parseLearningMaterial(value: unknown, path = 'material'): LearningMaterial {
    const item = learningRecord(value, path, ['id', 'title', 'paragraphs', 'provenance', 'transcriptRevealed']);
    const paragraphs = learningArray(item.paragraphs, `${path}.paragraphs`, (raw, p) => {
        const paragraph = learningRecord(raw, p, ['id', 'text']);
        return { id: learningId(paragraph.id, `${p}.id`), text: learningText(paragraph.text, `${p}.text`, L.materialText) };
    }, L.materialText);
    uniqueLearning(paragraphs.map(paragraph => paragraph.id), path);
    requireLearning(paragraphs.length > 0 && [...paragraphs.map(paragraph => paragraph.text).join('\n\n')].length <= L.materialText,
        `${path}.paragraphs`, `Material must contain text, at most ${L.materialText} code points`);
    const source = learningRecord(item.provenance, `${path}.provenance`, ['kind', 'url', 'title', 'retrievedAt']);
    let provenance: LearningMaterial['provenance'];
    if (source.kind === 'authored') {
        learningRecord(source, `${path}.provenance`, ['kind']);
        provenance = { kind: 'authored' };
    } else {
        const kind = learningEnum(source.kind, `${path}.provenance.kind`, ['original', 'adapted']);
        const url = learningText(source.url, `${path}.provenance.url`, 2048);
        let parsed: URL | undefined;
        try { parsed = new URL(url); } catch { /* Report the field, not browser parser internals. */ }
        requireLearning(parsed && ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password, `${path}.provenance.url`, 'Expected an HTTP(S) source URL without credentials');
        provenance = { kind, url, title: learningText(source.title, `${path}.provenance.title`, L.prompt),
            retrievedAt: learningTimestamp(source.retrievedAt, `${path}.provenance.retrievedAt`) };
    }
    return { id: learningId(item.id, `${path}.id`), title: learningText(item.title, `${path}.title`, L.name), paragraphs, provenance,
        transcriptRevealed: learningBoolean(item.transcriptRevealed, `${path}.transcriptRevealed`) };
}

export function parseLearningHelp(value: unknown, path = 'help'): LearningHelp {
    const item = learningRecord(value, path, ['answer', 'hint', 'feedback', 'transcript', 'replays', 'slowPlayback']);
    return { answer: learningBoolean(item.answer, `${path}.answer`), hint: learningBoolean(item.hint, `${path}.hint`),
        feedback: learningBoolean(item.feedback, `${path}.feedback`),
        transcript: learningBoolean(item.transcript, `${path}.transcript`), replays: learningInteger(item.replays, `${path}.replays`),
        slowPlayback: learningBoolean(item.slowPlayback, `${path}.slowPlayback`) };
}

export function parseLearningAttempt(value: unknown, exercises: LearningExercise[], materials: LearningMaterial[], path = 'attempt'): LearningAttempt {
    const item = learningRecord(value, path, ['id', 'exerciseId', 'answer', 'submittedAt', 'help', 'scope', 'listening', 'revisesAttemptId']);
    const exerciseId = learningId(item.exerciseId, `${path}.exerciseId`);
    const exercise = exercises.find(exercise => exercise.id === exerciseId);
    requireLearning(exercise, `${path}.exerciseId`, 'Attempt must reference an existing exercise');
    return { id: learningId(item.id, `${path}.id`), exerciseId,
        answer: parseLearningAnswer(item.answer, exercise.response, materials, `${path}.answer`),
        submittedAt: learningTimestamp(item.submittedAt, `${path}.submittedAt`), help: parseLearningHelp(item.help, `${path}.help`),
        scope: parseLearningScope(item.scope, `${path}.scope`),
        ...(item.listening === undefined ? {} : { listening: parseLearningHeardParts(item.listening, exercise, materials, `${path}.listening`) }),
        ...(item.revisesAttemptId === undefined ? {} : { revisesAttemptId: learningId(item.revisesAttemptId, `${path}.revisesAttemptId`) }) };
}

/** A learner's own paragraphs: every non-blank line, so a single Enter already starts a paragraph. */
export function learningAnswerParagraphs(text: string): string[] {
    return text.split(/\r?\n/u).filter(line => line.trim());
}

function parseAnnotation(value: unknown, path: string): LearningAnnotation {
    const item = learningRecord(value, path, ['id', 'category', 'severity', 'paragraphIndex', 'quote', 'explanation', 'suggestion', 'itemId']);
    const category = learningEnum(item.category, `${path}.category`, LEARNING_ANNOTATION_CATEGORIES);
    requireLearning(item.itemId === undefined || category === 'grammar' || category === 'vocabulary', `${path}.itemId`, 'Only grammar and vocabulary annotations link a learning item');
    return { id: learningId(item.id, `${path}.id`), category,
        severity: learningEnum(item.severity, `${path}.severity`, ['error', 'improve', 'alternative']),
        paragraphIndex: learningInteger(item.paragraphIndex, `${path}.paragraphIndex`),
        quote: learningText(item.quote, `${path}.quote`, L.quote), explanation: learningText(item.explanation, `${path}.explanation`, L.explanation),
        suggestion: learningText(item.suggestion, `${path}.suggestion`, L.explanation, true),
        ...(item.itemId === undefined ? {} : { itemId: learningId(item.itemId, `${path}.itemId`) }) };
}

/** Annotations point at the learner's actual words, never at text the model imagined. */
export function checkLearningAnnotations(assessment: LearningAssessment, attempt: LearningAttempt, path = 'assessment'): void {
    if (!assessment.annotations?.length) { return; }
    requireLearning(attempt.answer.kind === 'text', `${path}.annotations`, 'Annotations mark a written answer');
    const paragraphs = learningAnswerParagraphs(attempt.answer.text);
    for (const annotation of assessment.annotations) {
        requireLearning(paragraphs[annotation.paragraphIndex]?.includes(annotation.quote), `${path}.annotations`,
            "Quote the learner's exact words and the index of their paragraph that contains them");
    }
}

export function parseLearningAssessment(value: unknown, path = 'assessment'): LearningAssessment {
    const item = learningRecord(value, path, ['attemptId', 'verdict', 'understanding', 'expression', 'guidance', 'scope', 'annotations', 'resolvedAnnotationIds', 'signal']);
    const annotations = item.annotations === undefined ? undefined : learningArray(item.annotations, `${path}.annotations`, parseAnnotation, L.annotations);
    if (annotations) { uniqueLearning(annotations.map(annotation => annotation.id), `${path}.annotations`); }
    return { attemptId: learningId(item.attemptId, `${path}.attemptId`),
        verdict: learningEnum(item.verdict, `${path}.verdict`, ['correct', 'partial', 'incorrect', 'disputed']),
        understanding: learningText(item.understanding, `${path}.understanding`, L.explanation, true),
        expression: learningText(item.expression, `${path}.expression`, L.explanation, true),
        guidance: learningText(item.guidance, `${path}.guidance`, L.explanation), scope: parseLearningScope(item.scope, `${path}.scope`),
        ...(annotations ? { annotations } : {}),
        ...(item.resolvedAnnotationIds === undefined ? {} : { resolvedAnnotationIds: learningIds(item.resolvedAnnotationIds, `${path}.resolvedAnnotationIds`, L.annotations) }),
        ...(item.signal === undefined ? {} : { signal: learningEnum(item.signal, `${path}.signal`, ['clean', 'hesitant', 'blank']) }) };
}
