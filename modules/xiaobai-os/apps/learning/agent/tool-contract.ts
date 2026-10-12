import { LEARNING_ANNOTATION_CATEGORIES, LEARNING_LIMITS as L, LEARNING_SKILLS } from '../../../domains/learning/types.js';
import type { LearningAction } from './session.js';
import type { LearningActor } from '../domain/conversation.js';
import { learningPreparationTools } from './preparation-tools.js';
import { LEARNING_DELEGATION_LIMITS as D } from '../application/delegation.js';

const text = (maxLength: number, description: string) => ({ type: 'string', maxLength, description });
const nullableText = (maxLength: number, description: string) => ({ anyOf: [text(maxLength, description), { type: 'null' }], description: 'Omit to keep; null clears.' });
const id = (description: string) => text(128, description);
const enumeration = (values: readonly string[], description: string) => ({ type: 'string', enum: values, description });
const list = (items: object, maxItems: number | undefined, description: string) => ({ type: 'array', items, ...(maxItems === undefined ? {} : { maxItems }), description });
const object = (properties: Record<string, unknown>, required: string[] = []) => ({ type: 'object', properties, required, additionalProperties: false });
const option = object({ id: id('Identifier within this exercise.'), text: text(L.prompt, 'Visible option or gap label.') }, ['id', 'text']);
const answer = object({
    kind: enumeration(['choice', 'order', 'match', 'evidence', 'gaps', 'text'], 'The exercise response form.'),
    ids: list(id('Option or paragraph ID. Order uses the complete ordered sequence; choice and evidence use a set.'), L.pairs, 'For choice, order or evidence.'),
    pairs: list(object({ left: id('Left option ID.'), right: id('Right option ID.') }, ['left', 'right']), L.pairs, 'For match: one unique partner for every left option.'),
    values: list(object({ id: id('Gap ID.'), text: text(L.answer, 'Answer text.') }, ['id', 'text']), L.gaps, 'For gaps: every slot once.'),
    text: text(L.answer, 'For free text.'),
}, ['kind']);
const response = object({
    kind: enumeration(['choice', 'order', 'match', 'evidence', 'gaps', 'text'], 'Native answer control; the trained skill is a separate field.'),
    options: list(option, L.pairs, `For choice or order. Choice has 2–${L.options} options; order has 2–${L.pairs}.`),
    multiple: { type: 'boolean', description: 'Required for choice: whether several options may be selected.' },
    left: list(option, L.pairs, 'For match: 2 or more left options.'),
    right: list(option, L.pairs, 'For match: the same number of right options, paired one-to-one.'),
    materialKey: id('For evidence: the lesson material key; learners select its paragraph IDs.'),
    slots: list(option, L.gaps, 'For gaps: 1 or more separately answered slots.'),
}, ['kind']);
const rule = object({
    kind: enumeration(['semantic', 'exact', 'gaps'], 'Semantic evaluates meaning; exact compares option IDs; gaps compares accepted written forms.'),
    answer,
    accepted: list(object({ id: id('Gap ID.'), forms: list(text(L.answer, 'One accepted form.'), L.acceptedForms, 'At least one accepted form.') }, ['id', 'forms']), L.gaps, 'For gaps: accepted forms for every slot.'),
    caseSensitive: { type: 'boolean', description: 'For gaps: whether letter case must match.' },
    punctuationSensitive: { type: 'boolean', description: 'For gaps: whether Unicode punctuation must match. Other characters are retained; surrounding whitespace is ignored.' },
    explanation: text(L.explanation, 'Required for exact and gaps: explanation shown immediately after submission.'),
}, ['kind']);

const mutationResult = [
    'Returns {ok,changed,ids,errors:[{path,message}],status?}. IDs identify affected records; changed:false with ok:true is success.',
    'Each edit is validated and saved before its result returns. confirmed and unchanged are settled results; unconfirmed means check the existing save rather than repeat the edit. Earlier confirmed edits survive a later failure.',
    'A validation error changes nothing. Read the result, then correct the call, choose another approach or explain the obstacle to the learner.',
].join('\n');

const tools = [
    { type: 'function', function: {
        name: 'LearningRequest',
        description: [
            'Delegate work to the workbench teacher. Write the task in your own words, with the background and expected outcome they need. The app separately supplies the learner’s original message and selected learning objects.',
            'Use for requested changes, preparation, formal assessment or review. An explanation you can give directly needs no handoff.',
            'Returns immediately with {ok:true,status:"accepted",taskId}, or {ok:false,status:"busy"|"cancelled"}. An accepted task runs independently while you continue chatting; stopping your reply does not stop it. Its result starts a separate conversation turn when you are free, even while the learner views the workbench.',
            'LearningTaskGet checks accepted work without starting it again. Replacement decisions are asked on the workbench while that task runs.',
            'Follow-up work from a result notification keeps that task’s lesson or review target. Coursework written from your story context stays in this story; the learner can share it with their other stories on the workbench.',
        ].join('\n'),
        parameters: object({ task: text(D.task, 'Concrete work to do, in natural language.'),
            context: text(D.context, 'Optional background, constraints and prior discussion needed for this work.'),
            deliverable: text(D.deliverable, 'Optional expected outcome and what to report back.') }, ['task']),
    } },
    { type: 'function', function: {
        name: 'LearningTaskGet',
        description: 'Check work delegated during this learning session. Omit taskId to list {ok,tasks:[{taskId,task,status,notification}]}, also supplied in learning_request.workbench.tasks. With taskId, each entry additionally has context?, deliverable?, target, result and notificationError. target identifies the lesson or review in unitKey, with unitId, exerciseId and selection when available; it follows replacements saved by that task. status is running, awaiting-approval, or the returned workbench status; result contains status and, when finished, text, changed, appliedTools and historySaved. notification describes result delivery, not work completion. An unknown taskId returns {ok:false,status:"not-found"}. This only reads tasks; it does not repeat work.',
        parameters: object({ taskId: id('Task ID returned by LearningRequest. Omit to list tasks.') }),
    } },
    { type: 'function', function: {
        name: 'LearningPresent',
        description: [
            'Open a material reader or exercise window alongside your reply. Choose an ID returned by LearningRead after preparing it.',
            'Use when the learner is ready to read a passage, hear audio or answer a question. Choose one useful activity at a time and continue from its result in conversation; saved content can remain available without opening a window.',
            'The last successful presentation in this turn selects one window. It opens only after the teaching turn is saved; closing it returns to the conversation, and its link can reopen it.',
            mutationResult,
        ].join('\n'),
        parameters: object({ unitId: id('Lesson or review ID. Omit for the focused unit.'), kind: enumeration(['material', 'exercise'], 'What the learner will open.'), id: id('Existing material or exercise ID in the selected lesson.') }, ['kind', 'id']),
    } },
    { type: 'function', function: {
        name: 'LearningRead',
        description: [
            'Read saved learning facts, including earlier successful operations in this conversation.',
            'unitId selects a lesson or review; omission uses the initial focus. overview.units lists available units, so one task can read both the lesson and review.',
            'Returns {section,data,nextOffset,omitted}. overview gives the profile, current unit references, item count and progress across all retained items: counts by skill/state, due counts, completed lesson count and latest readable completion. training gives the complete published reading surface also supplied in learning_request.training; unit adds saved attempts and notes when it fits. Other sections return arrays.',
            'Use materials for paragraph pages, exercises for questions, attempts for real answers with feedback, items for progress, evidence for retained practice, and completions for past wrap-ups. The workbench can read teaching references including answer rules; the companion sees the published learning surface.',
            'review gives items due at the current request time, oldest first, with the same progress fields as items. It also returns asOf and total; follow nextOffset for the rest of the due items.',
            'notes gives saved explanations; listening gives actual playback facts. Filter either by exercise ID. Exercises include their answer/hint exposure, and materials include transcriptRevealed; these describe the conditions of future practice.',
            'sources lists articles extracted in this classroom as {id,title,url,paragraphs}; LearningExtract reads them by sourceId. This runtime catalog is separate from saved lesson materials.',
            'Material pages include textOffset in Unicode code points and textComplete. Long paragraphs span several page entries with the same paragraph ID; concatenate them in offset order. A material ID from retained evidence can also be read.',
            'Cross-story items expose only structured skill conclusions when their label or practice is private. A blocked current unit remains in its original story.',
            `Default section overview, offset 0, limit ${L.readDefault}; maximum limit ${L.readMax}. Follow nextOffset until null. An oversized unit can be read through its separate sections.`,
        ].join('\n'),
        parameters: object({ unitId: id('Optional lesson or review ID from overview.units.'), section: enumeration(['overview', 'training', 'unit', 'materials', 'exercises', 'attempts', 'notes', 'listening', 'items', 'review', 'evidence', 'completions', 'sources'], 'Reading section.'),
            id: id('Optional filter: material, exercise, attempt, item or completed unit ID. In evidence, use the item ID.'),
            offset: { type: 'integer', minimum: 0 }, limit: { type: 'integer', minimum: 1, maximum: L.readMax } }),
    } },
    { type: 'function', function: {
        name: 'LearningProfileEdit',
        description: [
            'Change the learner’s saved preferences or goal when they ask for it in this conversation: a different explanation language, interests for choosing articles, or a newly stated goal or self-assessment.',
            'The learner picks the language and companion in the app. Level, target, exam and dates are stated preferences; practice-based conclusions are recorded by LearningAssess.',
            'Omitted fields keep their values; null clears a nullable field.', mutationResult,
        ].join('\n'),
        parameters: object({ explanationLanguage: text(80, 'Language tag for explanations.'), selfAssessment: text(L.goal, 'The learner’s own account, including uncertainty.'), level: nullableText(80, 'The learner’s stated current level.'),
            interests: { anyOf: [text(L.goal, 'Topics the learner enjoys reading about.'), { type: 'null' }], description: 'Omit to keep; null clears.' },
            goal: object({ description: text(L.goal, 'What the learner wants to become able to do.'),
                exam: { anyOf: [text(80, 'Exam name.'), { type: 'null' }], description: 'Omit to keep; null clears.' },
                targetLevel: { anyOf: [text(80, 'Level in the learner’s chosen framework.'), { type: 'null' }], description: 'Omit to keep; null clears.' },
                targetDate: { anyOf: [text(10, 'Calendar date YYYY-MM-DD.'), { type: 'null' }], description: 'Omit to keep; null clears.' } }) }),
    } },
    { type: 'function', function: {
        name: 'LearningLessonEdit',
        description: [
            'Create or incrementally adapt the current unit when the learner requests concrete practice or materials, agrees to a proposed activity, or is continuing that activity. Discussing their level, goals or possible approaches does not by itself call for a lesson.',
            'kind is chosen when a unit is created and stays with it. lesson is focused practice that you wrap up with LearningComplete.',
            'reading-writing is one article read paragraph by paragraph. The app supplies a summary exercise for each paragraph. Explanations and the final essay may be added after the article is published.',
            'Each paragraph explanation covers useful vocabulary, reusable writing phrases and structures, grammar and coherence at this learner’s level. The final essay asks for a viewpoint, reflection or reasoned response grounded in the article, around 300 words (characters for Chinese or Japanese); state the unit in its prompt.',
            'review asks questions about saved grammar and vocabulary items, each naming its itemId. The app sets a new review’s reward from its item count.',
            'Paragraph IDs are p1, p2, … following the blank-line-separated paragraphs of the material text.',
            'Create only what the current activity needs. A short explanation or conversational example can stay in your reply without becoming saved reading material.',
            'A first unit needs title, goal, tier (except review) and at least one complete exercise; reading-writing receives its summary exercises from the app. Materials may be empty for a lesson or review. After that, omitted fields and unmentioned materials/exercises stay unchanged.',
            'Each supplied material or exercise is a complete upsert. Use its saved ID as key to update it, or a new local key to add it. Local keys remain usable through this teacher turn; later turns use the IDs returned by LearningRead.',
            'Answered exercises, played listening exercises and materials supporting learner evidence keep their original content. Add a corrected or easier alternative with a new key. Unused content can be removed by ID; every remaining exercise must retain its required materials.',
            'newLesson:true begins a fresh unit, waiting for confirmation if it replaces unfinished work. Declining returns {ok:true,status:declined,changed:false,ids:[]}; the current unit stays. Otherwise the call adapts the selected unit. Published rewards and objectives attached to saved answers stay fixed.',
            'The app fixes the reward from tier when publishing. Short focuses on a small objective; regular combines understanding and use; deep is more substantial integrated practice relative to this learner.',
            'Original material is copied from extracted source paragraphs. Adapted text is labelled teaching adaptation; authored text is labelled original teaching material.',
            'Returns IDs in unit, material, exercise order. Read the updated draft for their full relationships.', mutationResult,
        ].join('\n'),
        parameters: object({ unitId: id('Lesson or review to edit. Omit for the focused unit; kind:review selects the review slot when creating one.'), newLesson: { type: 'boolean', description: 'Default false. Start a fresh unit; replacing unfinished work waits for learner confirmation. Include all first-unit fields.' },
            kind: enumeration(['lesson', 'reading-writing', 'review'], 'Unit type, chosen when the unit is created. Default lesson.'),
            title: text(L.name, 'Lesson title.'), goal: text(L.goal, 'One concrete learning objective.'),
            tier: enumeration(['short', 'regular', 'deep'], 'Lesson workload relative to the learner. A review takes its tier from its item count.'),
            explanations: list(object({ materialKey: id('The article’s material ID or local key.'), paragraphId: id('Paragraph ID, such as p1.'),
                explanation: text(L.explanation, 'What the paragraph says and how its language works, in the explanation language.'),
                terms: list(object({ text: text(L.name, 'A word or phrase as it appears in the paragraph.'), note: text(L.explanation, 'Meaning and usage in this context.') }, ['text', 'note']),
                    L.terms, 'Terms worth learning here; the learner can bookmark each one for review.') },
            ['materialKey', 'paragraphId', 'explanation', 'terms']), undefined, 'Reading-writing only: the complete list of paragraph notes, in any order. Omit to keep saved explanations; LearningReadingNotes updates selected paragraphs.'),
            removeMaterials: list(id('Saved material ID.'), undefined, 'Remove unused materials. Missing IDs are already removed.'),
            removeExercises: list(id('Saved exercise ID.'), undefined, 'Remove unused exercises. Missing IDs are already removed.'),
            materials: list(object({ key: id('Saved material ID to update, or a new local key to create.'), title: text(L.name, 'Material title.'),
                kind: enumeration(['original', 'adapted', 'authored'], 'Source relationship.'), sourceId: id('For original or adapted: an extracted source ID.'),
                from: { type: 'integer', minimum: 1, description: 'Original excerpt: first paragraph, 1-based.' },
                through: { type: 'integer', minimum: 1, description: 'Original excerpt: inclusive last paragraph.' },
                text: text(L.materialText, 'For adapted or authored: complete text with blank lines between paragraphs. Original uses source ranges.') }, ['key', 'title', 'kind']), undefined, 'Materials to add or update. Unmentioned materials stay unchanged.'),
            exercises: list(object({ key: id('Saved exercise ID to update, or a new local key to create.'), skill: enumeration(LEARNING_SKILLS, 'Skill actually trained by the response.'),
                materialKeys: list(id('A current material ID or local key from this turn.'), undefined, 'Materials required to answer; may be empty.'),
                prompt: text(L.prompt, 'Question and response requirements.'), response, rule, hint: text(L.explanation, 'Optional hint, revealed only on request; omission gives no hint.'),
                paragraphId: id('Reading-writing summary: the paragraph it summarises. Omit for the essay and in other units.'),
                itemId: id('Review: the due item this question reviews. Omit in other units.') },
            ['key', 'skill', 'materialKeys', 'prompt', 'response', 'rule']), undefined, 'Exercises to add or update. Text and ambiguous answers use semantic evaluation.') }),
    } },
    { type: 'function', function: {
        name: 'LearningAssess',
        description: [
            'Evaluate an actual saved learner attempt from the request or LearningRead. Supply attemptId, verdict, understanding, expression and guidance; items may be omitted.',
            'Understanding and expression are separate: a sound idea with weak language is not a failure to understand. Disputed feedback is excluded from progress conclusions until reviewed.',
            'Annotations mark the learner’s written answer. Each quotes words that appear in one paragraph of that answer; paragraphIndex counts its non-blank lines from 0. error and improve ask for a revision; alternative only offers another wording. A grammar or vocabulary annotation can link a learning item, which is then scheduled for review.',
            'Feedback on a revision lists in resolvedAnnotationIds the draft annotations the revision has fixed. Feedback on a review answer includes signal: clean, hesitant (a small slip or visible hesitation) or blank (no real attempt). The app derives the review schedule from verdict, signal and the help used.',
            'Existing feedback changes only in an explicit review, including retained practice from earlier units. Items attach this actual attempt as evidence; the app derives independence and review timing from the saved conditions.',
            'To attach learning items to existing feedback without changing its judgment, send only attemptId and items during the assessment request for that answer.',
            'A review group completes when all its questions have answered work with feedback. Reading-writing completion also checks its drafts, revision choice and model essay.',
            `At most ${L.itemChanges} item changes and ${L.annotations} annotations per call. A new item needs a focused label; existing itemId retains its label unless a replacement is supplied.`, mutationResult,
        ].join('\n'),
        parameters: object({ attemptId: id('An available saved attempt ID from the current request or LearningRead.'),
            review: { type: 'boolean', description: 'Default false. Use true when reconsidering saved feedback at the learner’s request.' },
            verdict: enumeration(['correct', 'partial', 'incorrect', 'disputed'], 'Judgment against the published objective; disputed means the answer or question still needs review.'),
            understanding: text(L.explanation, 'Feedback on meaning; empty when not applicable.'), expression: text(L.explanation, 'Feedback on language use; empty when not applicable.'),
            guidance: text(L.explanation, 'Specific explanation and a useful next step.'),
            annotations: list(object({ category: enumeration(LEARNING_ANNOTATION_CATEGORIES, 'What the note concerns.'),
                severity: enumeration(['error', 'improve', 'alternative'], 'error is wrong; improve works but can be better; alternative is an optional other wording.'),
                paragraphIndex: { type: 'integer', minimum: 0, description: 'Paragraph of the learner’s answer, counting non-blank lines from 0.' },
                quote: text(L.quote, 'The learner’s exact words in that paragraph.'), explanation: text(L.explanation, 'Why, in the explanation language.'),
                suggestion: text(L.explanation, 'Better wording; may be empty for a content note.'),
                item: object({ itemId: id('Existing grammar or vocabulary item.'), label: text(L.goal, 'Label for a new item, or a replacement label.') }) },
            ['category', 'severity', 'paragraphIndex', 'quote', 'explanation', 'suggestion']), L.annotations, 'Marks on a written answer.'),
            resolvedAnnotationIds: list(id('Annotation ID from the draft’s feedback.'), L.annotations, 'Revision feedback: draft annotations the revision has fixed.'),
            signal: enumeration(['clean', 'hesitant', 'blank'], 'Review-answer feedback: how the answer came.'),
            items: list(object({ itemId: id('Existing learning item; omit to create or reuse this label in the same scope and skill.'), label: text(L.goal, 'One expression, rule or strategy that can be practised again.') }), L.itemChanges, 'Evidence-based learning items, not a list extracted from every word in the text.') }),
    } },
    { type: 'function', function: {
        name: 'LearningComplete',
        description: [
            'Wrap up the selected lesson or review when actual practice and feedback have sufficiently served its objective. Supply unitId, attemptIds and summary. This also allows an agreed shorter stopping point in a reading-writing unit.',
            'One substantive exercise may be enough. Incorrect answers and help do not remove completion eligibility; completion is separate from independent mastery.',
            'Each cited attempt needs resolved, available feedback; valid feedback from LearningAssess in this action can be used. Completion and related feedback are saved together before reward settlement.',
            'An already completed unit keeps its original completion and reward. This tool does not change the published reward or make a payment.', mutationResult,
        ].join('\n'),
        parameters: object({ unitId: id('Current unit ID.'), attemptIds: list(id('Actual attempt with resolved feedback in this unit.'), undefined, 'Evidence for this wrap-up, at least one attempt.'),
            summary: text(L.explanation, 'A learner-facing account of what was practised, what improved and what to revisit.') }),
    } },
    { type: 'function', function: {
        name: 'LearningReveal',
        description: `Show a saved answer, hint or listening transcript when the learner wants that help. The exposure is saved so later practice does not pretend to be unaided. Use LearningRead for its content after this succeeds. ${mutationResult}`,
        parameters: object({ unitId: id('Lesson or review ID.'), kind: enumeration(['answers', 'hints', 'transcripts'], 'Help to show.'), id: id('Exercise ID for an answer or hint; material ID for a transcript.') }, ['unitId', 'kind', 'id']),
    } },
    { type: 'function', function: {
        name: 'LearningSubmit',
        description: 'Save a text answer the learner explicitly submits in their current message. text is their exact wording, not a teacher-written answer; omit it to use the whole message. Help is recorded from when their message arrived. Returns {ok,status,attemptId? ,unitId?}; a confirmed original answer can then be assessed. revisesAttemptId submits a revision of that saved answer.',
        parameters: object({ unitId: id('Lesson or review ID.'), exerciseId: id('Published text question ID.'), text: text(L.answer, 'Exact answer text from the learner’s current message.'), revisesAttemptId: id('For a revision: the existing answer it revises.') }, ['unitId', 'exerciseId']),
    } },
    { type: 'function', function: {
        name: 'LearningModelEssay',
        description: [
            'Save a model essay for the reading-writing unit. Usually this follows the learner’s writing and feedback; an explicit request for an earlier example can also be served.',
            'Answer the same question at a learnable next level, stated in level. A model essay does not by itself complete unfinished practice; the app checks the saved work. Payment depends on the completion and save result.',
            mutationResult,
        ].join('\n'),
        parameters: object({ unitId: id('Current reading-writing unit ID.'), text: text(L.materialText, 'The model essay, paragraphs separated by blank lines.'),
            level: text(L.name, 'The level it is written at, in the learner’s framework, such as B2.') }, ['unitId', 'text', 'level']),
    } },
];

const ALL_TOOLS = [...tools, ...learningPreparationTools].map(tool => tool.function.name);

/** The same allowlist is used in the provider request and at execution. */
export function learningToolNamesFor(action?: LearningAction, actor: LearningActor = 'workbench'): string[] {
    if (action?.kind === 'companion') { return ['LearningRead']; }
    return actor === 'companion' ? ['LearningRead', 'LearningPresent', 'LearningRequest', 'LearningTaskGet']
        : ALL_TOOLS.filter(name => name !== 'LearningRequest' && name !== 'LearningTaskGet');
}

export function learningTools(action?: LearningAction, actor: LearningActor = 'workbench') {
    const names = learningToolNamesFor(action, actor);
    return structuredClone([...tools, ...learningPreparationTools].filter(tool => names.includes(tool.function.name)));
}
