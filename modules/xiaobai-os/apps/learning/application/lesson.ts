import { parseLearningUnit } from '../../../domains/learning/data.js';
import { learningRecord, learningText } from '../../../domains/learning/profile.js';
import { LEARNING_LIMITS as L, type LearningScope, type LearningUnit, type RewardTier } from '../../../domains/learning/types.js';
import { learningArray, learningEnum, learningId, learningIds, learningInteger, requireLearning, uniqueLearning } from '../../../domains/learning/validation.js';
import { compileLearningMaterial, type createLearningSourceRegistry } from '../materials/lesson-sources.js';

/** One lesson editor per teacher turn. New local keys are resolved once; saved IDs work directly. */
export function createLearningLessonCompiler(options: {
    osId: string; scope: LearningScope; prices: Readonly<Record<RewardTier, number>>; createId: () => string;
    sources: Pick<ReturnType<typeof createLearningSourceRegistry>, 'get'>;
}) {
    const unitId = options.createId();
    const ids = new Map<string, string>();
    const prices = { ...options.prices };
    for (const [tier, price] of Object.entries(prices)) { learningInteger(price, `prices.${tier}`, 1); }
    return (args: unknown, current: LearningUnit | null = null, published: LearningUnit | null = null): LearningUnit => {
        const input = learningRecord(args, 'LearningLessonEdit', ['title', 'goal', 'tier', 'materials', 'exercises', 'removeMaterials', 'removeExercises']);
        const idFor = (kind: 'material' | 'exercise', key: string) => {
            const records = kind === 'material' ? current?.materials : current?.exercises;
            if (records?.some(record => record.id === key)) { return key; }
            const local = `${kind}:${key}`;
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
            const id = materialRefs.get(key) ?? ids.get(`material:${key}`);
            requireLearning(id && materials.some(material => material.id === id), 'materialKeys', 'Use a current material ID or a local key from this turn');
            return id;
        };
        const exercises: unknown[] = structuredClone(current?.exercises ?? []).filter(exercise => !removeExercises.includes(exercise.id));
        const rawExercises = learningArray(input.exercises ?? [], 'exercises', (raw, path) => {
            const item = learningRecord(raw, path, ['key', 'skill', 'materialKeys', 'prompt', 'response', 'rule', 'hint']);
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
                prompt: raw.prompt, response, rule: raw.rule, hint: raw.hint ?? '' };
            const index = exercises.findIndex(entry => (entry as { id: string }).id === id);
            if (index >= 0) { exercises[index] = exercise; } else { exercises.push(exercise); }
        }
        const tier = learningEnum(input.tier ?? current?.reward.tier, 'tier', ['short', 'regular', 'deep']);
        requireLearning(!published || tier === published.reward.tier, 'tier', 'A published lesson keeps its reward; adapt the practice within it');
        const next = parseLearningUnit({ ...current, id: current?.id ?? unitId,
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
        return next;
    };
}
