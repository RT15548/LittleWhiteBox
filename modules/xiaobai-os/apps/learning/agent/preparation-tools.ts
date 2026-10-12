import { LEARNING_LIMITS as L } from '../../../domains/learning/types.js';


const text = (maxLength: number, description: string) => ({ type: 'string', maxLength, description });
const object = (properties: Record<string, unknown>, required = Object.keys(properties)) => ({ type: 'object', properties, required, additionalProperties: false });
const result = 'Returns {ok,changed,ids,errors:[{path,message}],status?} after validation and saving. confirmed and unchanged are settled results; unconfirmed needs the existing save checked. A validation failure changes nothing.';
export const learningPreparationTools = [
    { type: 'function', function: { name: 'LearningArticle', description: `Publish a new reading-writing article. The app supplies a summary box for each paragraph. Replacing unfinished work waits for confirmation; declining returns {ok:true,status:declined,changed:false,ids:[]} and keeps the current article. ${result}`,
        parameters: object({ title: text(L.name, 'Article title.'), goal: text(L.goal, 'One achievable learning objective.'),
            tier: { type: 'string', enum: ['short', 'regular', 'deep'], description: 'Workload relative to the learner.' },
            kind: { type: 'string', enum: ['adapted', 'authored'], description: 'Adapted uses an extracted source; authored is original teaching material.' },
            sourceId: text(128, 'Required for adapted: the extracted source ID.'),
            text: text(L.materialText, 'Complete reading text, a little above the learner’s level, with blank lines between paragraphs.') }, ['title', 'goal', 'tier', 'kind', 'text']) } },
    { type: 'function', function: { name: 'LearningReadingNotes', description: `Add or update selected paragraph explanations. Omitted paragraphs retain their notes. Choose what to explain for this learner and their request. ${result}`,
        parameters: object({ unitId: text(128, 'Reading unit ID; omit for the focused article.'), explanations: { type: 'array', items: object({ paragraphId: text(128, 'Article paragraph ID.'),
            explanation: text(L.explanation, 'Meaning, writing structures, grammar and coherence in the explanation language.'),
            terms: { type: 'array', maxItems: L.terms, items: object({ text: text(L.name, 'Word or phrase in this paragraph.'), note: text(L.explanation, 'Meaning and usage here.') }) } }) } }, ['explanations']) } },
    { type: 'function', function: { name: 'LearningEssayTask', description: `Add the article’s final essay question: a viewpoint, reflection or reasoned response grounded in the article, around 300 words (characters for Chinese or Japanese). State the length unit in the question. ${result}`,
        parameters: object({ unitId: text(128, 'Reading unit ID; omit for the focused article.'), exerciseId: text(128, 'Existing writing question to update; omit for the article’s essay.'), prompt: text(L.prompt, 'Essay question and response requirements.') }, ['prompt']) } },
];
