import type { CourtyardFact } from '../content/world-types.js';
import { findStoryPassage } from '../content/story-passages.js';
import type { Interaction } from '../world/exploration.js';

const passageFor = (item: Interaction) => item.kind === 'object' && item.target.kind === 'inspect' ? findStoryPassage(item.target.passage) : null;
const sameSpot = (a: Interaction, b: Interaction) => a.position.x === b.position.x && a.position.y === b.position.y;

/** A shared spot offers its unread event before a past event or a rest action. */
export function orderNearbyInteractions(items: Interaction[], facts: ReadonlySet<CourtyardFact>): Interaction[] {
    const unread = (item: Interaction) => {
        const passage = passageFor(item);
        return passage !== null && !facts.has(passage.fact);
    };
    const groups = new Map<string, Interaction[]>();
    for (const item of items) {
        const key = `${item.position.x}/${item.position.y}`;
        const group = groups.get(key) ?? []; group.push(item); groups.set(key, group);
    }
    for (const group of groups.values()) { group.sort((a, b) => Number(unread(b)) - Number(unread(a))); }
    return items.map(item => groups.get(`${item.position.x}/${item.position.y}`)!.shift()!);
}

/** Advance only after reading the selected event, never merely because distance or other facts changed. */
export function nextInteraction(items: Interaction[], selected: string | null, facts: ReadonlySet<CourtyardFact>, before?: ReadonlySet<CourtyardFact>): string | null {
    const current = items.find(item => item.target.id === selected);
    if (!current) { return items[0]?.target.id ?? null; }
    const completed = passageFor(current);
    if (completed && before && !before.has(completed.fact) && facts.has(completed.fact)) {
        const next = items.find(item => {
            const passage = passageFor(item);
            return sameSpot(current, item) && passage && !facts.has(passage.fact);
        });
        if (next) { return next.target.id; }
    }
    return selected;
}
