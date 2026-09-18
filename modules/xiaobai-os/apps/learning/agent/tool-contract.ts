import { LEARNING_LIMITS as L, LEARNING_SKILLS } from '../../../domains/learning/types.js';

const text = (maxLength: number, description: string) => ({ type: 'string', maxLength, description });
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
    'Returns {ok,changed,ids,errors:[{path,message}]}. IDs identify the affected draft entities; changed:false with ok:true is success.',
    'Each call is atomic. Successful changes remain in the current draft until this teaching action is saved.',
    'A failed call returns only its own errors and changes nothing. Read the result, then correct the call, choose another approach or explain the obstacle to the learner.',
].join('\n');

const tools = [
    { type: 'function', function: {
        name: 'LearningPresent',
        description: [
            'Open a material reader, exercise window or lesson-replacement confirmation alongside your reply. For teaching content, choose an ID returned by LearningRead after preparing it.',
            'Use when the learner is ready to read a passage, hear audio or answer a question. Choose one useful activity at a time and continue from its result in conversation; saved content can remain available without opening a window.',
            'For a learner who wants a different lesson, kind:replacement asks them to confirm putting the current lesson aside. It needs no id and can also replace a lesson from another story without reading it. Confirmation starts preparation from this learner message; the current lesson stays until the new one is saved.',
            'The last successful presentation in this turn selects one window. It opens only after the teaching turn is saved; closing it returns to the conversation, and its link can reopen it.',
            mutationResult,
        ].join('\n'),
        parameters: object({ kind: enumeration(['material', 'exercise', 'replacement'], 'What the learner will open.'), id: id('Required for material or exercise: its existing ID in the current lesson. Omit for replacement.') }),
    } },
    { type: 'function', function: {
        name: 'LearningAnswer',
        description: [
            'Record the learner’s current typed message as their answer to a previously published text-response exercise. The app supplies the exact message and its original help/listening conditions.',
            'Use when the learner answers a question in conversation, not when they ask for help or discuss goals. Native exercise-window submissions are already recorded and arrive with their attempt ID.',
            'Returns the attempt ID in ids for LearningAssess. One message can answer one exercise; repeating the same call returns the same attempt. An answer without feedback remains available for later assessment.',
            mutationResult,
        ].join('\n'),
        parameters: object({ exerciseId: id('Text-response exercise ID published before the current learner message.') }),
    } },
    { type: 'function', function: {
        name: 'LearningHelp',
        description: [
            'Declare the assistance in this turn’s learner-facing text: questions receiving help and listening transcripts shown, quoted or translated. Send both arrays before speaking; empty arrays explicitly declare that a greeting or goal discussion gives no exercise help.',
            'Future attempts on the named exercises count as helped; earlier submitted answers keep their original conditions. The focused explanation button already records its question’s hint; include any listening text your reply reveals.',
            'Returns {ok,changed,ids,errors:[{path,message}]}. Published-content help is confirmed before text is displayed and survives interruption. Text helping with new or changed draft content waits for the lesson save.',
            'A changed lesson discards unpublished text generated before or alongside that edit. Read the edit result, declare the resulting assistance scope and then reply. A failed declaration requires a corrected declaration before replying.',
        ].join('\n'),
        parameters: object({
            exerciseIds: list(id('Current exercise ID.'), undefined, 'Questions receiving a hint, explanation or worked answer in this reply.'),
            materialIds: list(id('Current material ID.'), undefined, 'Listening text being shown, quoted or translated in this reply.') }, ['exerciseIds', 'materialIds']),
    } },
    { type: 'function', function: {
        name: 'LearningRead',
        description: [
            'Read the current learning draft within this action’s permitted sources, including successful changes.',
            'Returns {section,data,nextOffset,omitted}. overview gives the profile, current unit references, item count and progress across all retained items: counts by skill/state, due counts, completed lesson count and latest readable completion. unit gives the full current lesson when it fits. Other sections return arrays.',
            'Use materials for paragraph pages, exercises for full questions and answer rules, attempts for current real answers with available feedback, items for progress, evidence for retained practice, and completions for past wrap-ups.',
            'review gives items due at the current request time, oldest first, with the same progress fields as items. It also returns asOf and total; follow nextOffset for the rest of the due items.',
            'notes gives saved explanations; listening gives actual playback facts. Filter either by exercise ID. Exercises include their answer/hint exposure, and materials include transcriptRevealed; these describe the conditions of future practice.',
            'sources lists articles extracted in this classroom as {id,title,url,paragraphs}; LearningExtract reads them by sourceId. This runtime catalog is separate from saved lesson materials.',
            'Material pages include textOffset in Unicode code points and textComplete. Long paragraphs span several page entries with the same paragraph ID; concatenate them in offset order. A material ID from retained evidence can also be read.',
            'Cross-story items expose only structured skill conclusions when their label or practice is private. A blocked current unit remains in its original story.',
            `Default section overview, offset 0, limit ${L.readDefault}; maximum limit ${L.readMax}. Follow nextOffset until null. An oversized unit can be read through its separate sections.`,
        ].join('\n'),
        parameters: object({ section: enumeration(['overview', 'unit', 'materials', 'exercises', 'attempts', 'notes', 'listening', 'items', 'review', 'evidence', 'completions', 'sources'], 'Reading section.'),
            id: id('Optional filter: material, exercise, attempt, item or completed unit ID. In evidence, use the item ID.'),
            offset: { type: 'integer', minimum: 0 }, limit: { type: 'integer', minimum: 1, maximum: L.readMax } }),
    } },
    { type: 'function', function: {
        name: 'LearningProfileEdit',
        description: `Update the learner’s stated goal or self-assessment once they have supplied it. Omitted fields keep their values. A first profile needs explanationLanguage, selfAssessment and goal.description; ask about missing information when needed to take the learner’s chosen next step. Practice-based conclusions belong in LearningAssess, not selfAssessment.\n${mutationResult}`,
        parameters: object({ explanationLanguage: text(80, 'Language tag for explanations.'), selfAssessment: text(L.goal, 'The learner’s own account, including uncertainty.'),
            goal: object({ description: text(L.goal, 'What the learner wants to become able to do.'),
                exam: { anyOf: [text(80, 'Exam name.'), { type: 'null' }], description: 'Omit to keep; null clears.' },
                targetLevel: { anyOf: [text(80, 'Level in the learner’s chosen framework.'), { type: 'null' }], description: 'Omit to keep; null clears.' },
                targetDate: { anyOf: [text(10, 'Calendar date YYYY-MM-DD.'), { type: 'null' }], description: 'Omit to keep; null clears.' } }) }),
    } },
    { type: 'function', function: {
        name: 'LearningLessonEdit',
        description: [
            'Create or incrementally adapt the current lesson when the learner requests concrete practice or materials, agrees to a proposed activity, or is continuing that activity. Discussing their level, goals or possible approaches does not by itself call for a lesson.',
            'Create only what the current activity needs. A short explanation or conversational example can stay in your reply without becoming saved reading material.',
            'A first lesson needs title, goal, tier and at least one complete exercise; materials may be empty. After that, omitted fields and unmentioned materials/exercises stay unchanged.',
            'Each supplied material or exercise is a complete upsert. Use its saved ID as key to update it, or a new local key to add it. Local keys remain usable through this teacher turn; later turns use the IDs returned by LearningRead.',
            'Answered exercises, played listening exercises and materials supporting learner evidence keep their original content. Add a corrected or easier alternative with a new key. Unused content can be removed by ID; every remaining exercise must retain its required materials.',
            'Use newLesson:true to begin another lesson after the previous completion has been saved in an earlier turn. For an unfinished lesson, LearningPresent with kind:replacement requests learner confirmation; a prepare action with replaceCurrent:true then authorizes a fresh lesson. Otherwise adapt the current lesson; published rewards and objectives attached to saved answers stay fixed.',
            'The app fixes the reward from tier when publishing. Short focuses on a small objective; regular combines understanding and use; deep is more substantial integrated practice relative to this learner.',
            'Original material is copied from extracted source paragraphs. Adapted text is labelled teaching adaptation; authored text is labelled original teaching material.',
            'Returns IDs in unit, material, exercise order. Read the updated draft for their full relationships.', mutationResult,
        ].join('\n'),
        parameters: object({ newLesson: { type: 'boolean', description: 'Default false. Start a fresh lesson after a previously saved completion; include all first-lesson fields.' }, title: text(L.name, 'Lesson title.'), goal: text(L.goal, 'One concrete learning objective.'),
            tier: enumeration(['short', 'regular', 'deep'], 'Lesson workload relative to the learner.'),
            removeMaterials: list(id('Saved material ID.'), undefined, 'Remove unused materials. Missing IDs are already removed.'),
            removeExercises: list(id('Saved exercise ID.'), undefined, 'Remove unused exercises. Missing IDs are already removed.'),
            materials: list(object({ key: id('Saved material ID to update, or a new local key to create.'), title: text(L.name, 'Material title.'),
                kind: enumeration(['original', 'adapted', 'authored'], 'Source relationship.'), sourceId: id('For original or adapted: an extracted source ID.'),
                from: { type: 'integer', minimum: 1, description: 'Original excerpt: first paragraph, 1-based.' },
                through: { type: 'integer', minimum: 1, description: 'Original excerpt: inclusive last paragraph.' },
                text: text(L.materialText, 'For adapted or authored: complete text with blank lines between paragraphs. Original uses source ranges.') }, ['key', 'title', 'kind']), undefined, 'Materials to add or update. Unmentioned materials stay unchanged.'),
            exercises: list(object({ key: id('Saved exercise ID to update, or a new local key to create.'), skill: enumeration(LEARNING_SKILLS, 'Skill actually trained by the response.'),
                materialKeys: list(id('A current material ID or local key from this turn.'), undefined, 'Materials required to answer; may be empty.'),
                prompt: text(L.prompt, 'Question and response requirements.'), response, rule, hint: text(L.explanation, 'Optional hint, revealed only on request; omission gives no hint.') },
            ['key', 'skill', 'materialKeys', 'prompt', 'response', 'rule']), undefined, 'Exercises to add or update. Text and ambiguous answers use semantic evaluation.') }),
    } },
    { type: 'function', function: {
        name: 'LearningAssess',
        description: [
            'Evaluate an actual recorded learner attempt, including one returned by LearningAnswer in this turn. Supply attemptId, verdict, understanding, expression and guidance; items may be omitted.',
            'Understanding and expression are separate: a sound idea with weak language is not a failure to understand. Disputed feedback is excluded from progress conclusions until reviewed.',
            'Existing feedback changes only in an explicit review, including retained practice from earlier units. Items attach this actual attempt as evidence; the app derives independence and review timing from the saved conditions.',
            'To attach learning items to existing feedback without changing its judgment, send only attemptId and items. This is also available during wrap-up after locally checked exercises.',
            `At most ${L.itemChanges} item changes per call. A new item needs a focused label; existing itemId retains its label unless a replacement is supplied.`, mutationResult,
        ].join('\n'),
        parameters: object({ attemptId: id('An available saved attempt ID from the current request or LearningRead.'),
            review: { type: 'boolean', description: 'True when the learner has asked to reconsider existing feedback. Default false; the explicit review button also enables review for its named attempt.' },
            verdict: enumeration(['correct', 'partial', 'incorrect', 'disputed'], 'Judgment against the published objective; disputed means the answer or question still needs review.'),
            understanding: text(L.explanation, 'Feedback on meaning; empty when not applicable.'), expression: text(L.explanation, 'Feedback on language use; empty when not applicable.'),
            guidance: text(L.explanation, 'Specific explanation and a useful next step.'),
            items: list(object({ itemId: id('Existing learning item; omit to create or reuse this label in the same scope and skill.'), label: text(L.goal, 'One expression, rule or strategy that can be practised again.') }), L.itemChanges, 'Evidence-based learning items, not a list extracted from every word in the text.') }),
    } },
    { type: 'function', function: {
        name: 'LearningComplete',
        description: [
            'Wrap up the current unit when actual practice and feedback have sufficiently served its objective. Supply unitId, attemptIds and summary.',
            'One substantive exercise may be enough. Incorrect answers and help do not remove completion eligibility; completion is separate from independent mastery.',
            'Each cited attempt needs resolved, available feedback; valid feedback from LearningAssess in this action can be used. Completion and related feedback are saved together before reward settlement.',
            'An already completed unit keeps its original completion and reward. This tool does not change the published reward or make a payment.', mutationResult,
        ].join('\n'),
        parameters: object({ unitId: id('Current unit ID.'), attemptIds: list(id('Actual attempt with resolved feedback in this unit.'), undefined, 'Evidence for this wrap-up, at least one attempt.'),
            summary: text(L.explanation, 'A learner-facing account of what was practised, what improved and what to revisit.') }),
    } },
];

export function learningTools() {
    return structuredClone(tools);
}
