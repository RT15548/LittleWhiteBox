import { parseLearningUnit } from '../../../domains/learning/data.js';
import { LEARNING_SUMMARY_PROMPT } from '../../../domains/learning/preparation.js';
import { learningRecord, learningText } from '../../../domains/learning/profile.js';
import { learningReviewTier } from '../../../domains/learning/schedule.js';
import { LEARNING_LIMITS as L, type LearningLanguage, type LearningScope, type LearningUnit, type RewardTier } from '../../../domains/learning/types.js';
import { combineLearningScope, learningArray, learningEnum, learningId, learningIds, learningInteger, requireLearning, uniqueLearning } from '../../../domains/learning/validation.js';
import { compileLearningMaterial, type createLearningSourceRegistry } from '../materials/lesson-sources.js';

/** One lesson editor per teacher turn. New local keys are resolved once; saved IDs work directly. */
export function createLearningLessonCompiler(options: {
    osId: string; language: string; scope: LearningScope; prices: Readonly<Record<RewardTier, number>>; createId: () => string;
    sources: Pick<ReturnType<typeof createLearningSourceRegistry>, 'get'>;
}) {
    const ids = new Map<string, string>();
    const prices = { ...options.prices };
    for (const [tier, price] of Object.entries(prices)) { learningInteger(price, `prices.${tier}`, 1); }
    /** A review needs the profile and clock that decide which items are due. */
    return (args: unknown, current: LearningUnit | null = null, published: LearningUnit | null = null,
        context: { profile: LearningLanguage; now: string } | null = null): LearningUnit => {
        const input = learningRecord(args, 'LearningLessonEdit', ['kind', 'title', 'goal', 'tier', 'materials', 'exercises', 'removeMaterials', 'removeExercises', 'explanations']);
        const unitId = current?.id ?? options.createId();
        const kind = learningEnum(input.kind ?? current?.kind ?? 'lesson', 'kind', ['reading-writing', 'review', 'lesson']);
        requireLearning(!current || kind === current.kind, 'kind', 'A unit keeps its kind; start a new unit for another kind of practice');
        const idFor = (kind: 'material' | 'exercise', key: string) => {
            const records = kind === 'material' ? current?.materials : current?.exercises;
            if (records?.some(record => record.id === key)) { return key; }
            const local = `${unitId}:${kind}:${key}`;
            if (!ids.has(local)) { ids.set(local, options.createId()); }
            return ids.get(local)!;
        };
        const removeMaterials = learningIds(input.removeMaterials ?? [], 'removeMaterials');
        const removeExercises = learningIds(input.removeExercises ?? [], 'removeExercises');
        const materials = structuredClone(current?.materials ?? []).filter(material => !removeMaterials.includes(material.id));
        const rawMaterials = learningArray(input.materials ?? [], 'materials', (raw, path) => {
            const item = learningRecord(raw, path, ['key', 'title', 'kind', 'sourceId', 'from', 'through', 'text']);
            return { key: learningId(item.key, `${path}.key`), raw: item };
        });
        uniqueLearning(rawMaterials.map(material => material.key), 'materials.key');
        const materialRefs = new Map(materials.map(material => [material.id, material.id]));
        for (const { key, raw } of rawMaterials) {
            const id = idFor('material', key);
            requireLearning(!removeMaterials.includes(id), 'materials', 'A material cannot be edited and removed in the same call');
            const material = compileLearningMaterial(raw, id, options.sources);
            const index = materials.findIndex(entry => entry.id === id);
            const old = materials[index];
            if (old && JSON.stringify(old.paragraphs) === JSON.stringify(material.paragraphs)) { material.transcriptRevealed = old.transcriptRevealed; }
            if (index >= 0) { materials[index] = material; } else { materials.push(material); }
            materialRefs.set(key, id); materialRefs.set(id, id);
        }
        const materialId = (key: string) => {
            const id = materialRefs.get(key) ?? ids.get(`${unitId}:material:${key}`);
            requireLearning(id && materials.some(material => material.id === id), 'materialKeys', 'Use a current material ID or a local key from this turn');
            return id;
        };
        const exercises: unknown[] = structuredClone(current?.exercises ?? []).filter(exercise => !removeExercises.includes(exercise.id));
        const rawExercises = learningArray(input.exercises ?? [], 'exercises', (raw, path) => {
            const item = learningRecord(raw, path, ['key', 'skill', 'materialKeys', 'prompt', 'response', 'rule', 'hint', 'paragraphId', 'itemId']);
            return { key: learningId(item.key, `${path}.key`), raw: item };
        });
        uniqueLearning(rawExercises.map(exercise => exercise.key), 'exercises.key');
        for (const { key, raw } of rawExercises) {
            const id = idFor('exercise', key);
            requireLearning(!removeExercises.includes(id), 'exercises', 'An exercise cannot be edited and removed in the same call');
            let response = raw.response;
            if (response && typeof response === 'object' && 'kind' in response && response.kind === 'evidence') {
                const selection = learningRecord(response, 'response', ['kind', 'materialKey']);
                response = { kind: 'evidence', materialId: materialId(learningId(selection.materialKey, 'response.materialKey')) };
            }
            const exercise = { id, skill: raw.skill, materialIds: learningIds(raw.materialKeys, 'materialKeys').map(materialId),
                prompt: raw.prompt, response, rule: raw.rule, hint: raw.hint ?? '',
                ...(raw.paragraphId === undefined ? {} : { paragraphId: raw.paragraphId }), ...(raw.itemId === undefined ? {} : { itemId: raw.itemId }) };
            const index = exercises.findIndex(entry => (entry as { id: string }).id === id);
            if (index >= 0) { exercises[index] = exercise; } else { exercises.push(exercise); }
        }
        if (kind === 'reading-writing') {
            for (const material of materials) {
                for (const paragraph of material.paragraphs) {
                    if (exercises.some(entry => (entry as { paragraphId?: string }).paragraphId === paragraph.id)) { continue; }
                    exercises.push({ id: idFor('exercise', `summary:${paragraph.id}`), skill: 'writing', materialIds: [material.id],
                        paragraphId: paragraph.id, prompt: LEARNING_SUMMARY_PROMPT, response: { kind: 'text' }, rule: { kind: 'semantic' }, hint: '' });
                }
            }
        }
        let reviewTier: RewardTier | undefined;
        if (kind === 'review') {
            // The teacher chooses saved learning items; publication fixes the group's reward.
            requireLearning(context, 'kind', "A review is prepared from the learner's saved items");
            const chosen = exercises.map(exercise => (exercise as { itemId?: unknown }).itemId);
            requireLearning(chosen.every(id => context.profile.items.some(item => item.id === id && item.schedule)), 'exercises', 'Review saved vocabulary or grammar items');
            reviewTier = published?.reward.tier ?? learningReviewTier(chosen.length);
        }
        const tier = reviewTier ?? learningEnum(input.tier ?? current?.reward.tier, 'tier', ['short', 'regular', 'deep']);
        requireLearning(!published || tier === published.reward.tier, 'tier', 'A published lesson keeps its reward; adapt the practice within it');
        const explanations = input.explanations === undefined ? current?.explanations : learningArray(input.explanations, 'explanations', (raw, path) => {
            const { materialKey, ...entry } = learningRecord(raw, path, ['materialKey', 'paragraphId', 'explanation', 'terms']);
            return { materialId: materialId(learningId(materialKey, `${path}.materialKey`)), ...entry };
        });
        const writing = kind === 'reading-writing' ? { explanations: explanations ?? [], modelEssay: current?.modelEssay ?? null,
            skippedRevisionAttemptIds: current?.skippedRevisionAttemptIds ?? [] } : {};
        requireLearning(kind === 'reading-writing' || input.explanations === undefined, 'explanations', 'Only reading-writing units explain paragraphs');
        const next = parseLearningUnit({ ...current, ...writing, id: current?.id ?? unitId, kind,
            title: learningText(input.title ?? current?.title, 'title', L.name), goal: input.goal ?? current?.goal,
            originOsId: current?.originOsId ?? options.osId, scope: current?.scope ?? options.scope,
            reward: published?.reward ?? { tier, amount: prices[tier] }, materials, exercises,
            attempts: current?.attempts ?? [], assessments: current?.assessments ?? [],
            revealed: { answers: current?.revealed.answers.filter(id => !removeExercises.includes(id)) ?? [],
                hints: current?.revealed.hints.filter(id => !removeExercises.includes(id)) ?? [] } });
        if (current) {
            const protectedExercises = new Set([...current.attempts.map(attempt => attempt.exerciseId),
                ...(current.listening ?? []).map(record => record.exerciseId), ...(current.notes ?? []).map(note => note.exerciseId)]);
            const protectedMaterials = new Set(current.exercises.filter(exercise => protectedExercises.has(exercise.id)).flatMap(exercise => exercise.materialIds));
            for (const note of current.notes ?? []) { if (note.selection) { protectedMaterials.add(note.selection.materialId); } }
            for (const exercise of current.exercises.filter(exercise => protectedExercises.has(exercise.id))) {
                requireLearning(JSON.stringify(next.exercises.find(entry => entry.id === exercise.id)) === JSON.stringify(exercise),
                    'exercises', 'This exercise has learner evidence. Keep it and add a corrected or alternative exercise with a new key');
            }
            for (const material of current.materials.filter(material => protectedMaterials.has(material.id))) {
                requireLearning(JSON.stringify(next.materials.find(entry => entry.id === material.id)) === JSON.stringify(material),
                    'materials', 'This material has learner evidence. Keep it and add the revised material with a new key');
            }
            requireLearning(!current.attempts.length || next.goal === current.goal, 'goal', 'Keep the objective attached to saved answers; add practice within it or ask the learner to start a new lesson');
        }
        if (current && JSON.stringify(current) !== JSON.stringify(next)) { next.scope = combineLearningScope(current.scope, options.scope); }
        return next;
    };
}
