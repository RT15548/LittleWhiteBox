import { escapePromptData } from '../../../capabilities/maintenance/prompt-safety.js';
import type { WorldContent } from '../../../domains/world/types.js';

export const MAX_WORLD_STORY_MESSAGE_CHARS = 2_000;

export function buildWorldStoryPrompt(world: WorldContent | null): string {
    if (!world || (!world.overview && !world.news.length)) { return ''; }
    const sections = [
        ...(world.overview ? [escapePromptData(world.overview)] : []),
        ...world.news.map(item => `• ${escapePromptData(item.summary)}`),
    ];
    const render = (included: string[], partial = false) => [
        '<world_background>',
        'Off-screen world background. It may remain in the background; characters learn it through the story, not automatically.',
        ...(partial ? ['Some background items are omitted to fit the context budget.'] : []),
        ...included,
        '</world_background>',
    ].join('\n');
    const full = render(sections);
    if ([...full].length <= MAX_WORLD_STORY_MESSAGE_CHARS) { return full; }
    const included: string[] = [];
    for (const section of sections) {
        if ([...render([...included, section], true)].length <= MAX_WORLD_STORY_MESSAGE_CHARS) {
            included.push(section);
        }
    }
    return included.length ? render(included, true) : '';
}
