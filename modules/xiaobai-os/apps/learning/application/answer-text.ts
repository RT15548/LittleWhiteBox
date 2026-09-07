import type { LearningAnswer, LearningResponse } from '../../../domains/learning/types.js';

export function learningAnswerText(answer: LearningAnswer, response: LearningResponse, paragraphs: { id: string; text: string }[] = []): string {
    const label = (id: string) => response.kind === 'choice' || response.kind === 'order' ? response.options.find(option => option.id === id)?.text ?? id
        : paragraphs.find(paragraph => paragraph.id === id)?.text ?? id;
    if (answer.kind === 'text') { return answer.text; }
    if (answer.kind === 'gaps') { return answer.values.map(value => `${response.kind === 'gaps' ? response.slots.find(slot => slot.id === value.id)?.text ?? '' : ''} ${value.text}`).join('\n'); }
    if (answer.kind === 'match') { return answer.pairs.map(pair => response.kind === 'match'
        ? `${response.left.find(option => option.id === pair.left)?.text} → ${response.right.find(option => option.id === pair.right)?.text}` : '').join('\n'); }
    return answer.ids.map(label).join(answer.kind === 'order' ? ' → ' : '\n');
}
