import { object, integer, list, member, point } from './validation.js';
import { validateV6Battle } from './migrations/v6-battle.js';
import { fault } from './random.js';

/**
 * Compatibility: the immediately preceding, user-retained chapter-one format (fixture expedition-v6.json).
 * Remove only when importing that saved format is explicitly retired. Never runs inside a game tick.
 * V6's offers/alarmTicks and battle shape are read here, not represented by the current Campaign type.
 */
const V6_REWARDS = [
    ['crossroads_cleared', 'crossroads', 'crossroads'], ['patrol_cleared', 'approach', 'gate'],
    ['alarm_silenced', 'passage', 'beacon'], ['waterway_cleared', 'passage', 'waterway'],
    ['warden_defeated', 'warden', 'hall'], ['roots_cleared', 'roots', 'roots'],
] as const;
export function upgradeExpeditionV6(raw: unknown): unknown {
    const data = object(raw);
    if (data.formatVersion !== 6) { return raw; }
    if (data.active === null) { data.formatVersion = 7; return data; }
    const c = object(data.active), location = object(c.location);
    const facts = list(c.facts, 30, f => { if (typeof f !== 'string') { fault('invalid'); } return f; });
    const offers = list(c.offers, 3, raw => { const o = object(raw); if (typeof o.id !== 'string') { fault('invalid'); } integer(o.rank, 1, 3); return { id: o.id, rank: o.rank }; });
    const phase = member(c.phase, ['exploration', 'reward', 'battle', 'lost']); integer(c.alarmTicks);
    if ((phase === 'reward') !== (offers.length > 0)) { fault('invalid'); }
    if ((c.battle !== null) !== ['battle', 'lost'].includes(phase) || (c.checkpoint !== null) !== (c.battle !== null)) { fault('invalid'); }
    for (const original of [c.battle, c.checkpoint]) {
        if (original === null) { continue; }
        validateV6Battle(original);
    }
    const rewards: Record<string, { scene: unknown; offers: unknown[] }> = {};
    for (const [fact, node, scene] of V6_REWARDS) { if (facts.includes(fact) && !rewards[node]) { rewards[node] = { scene, offers: [] }; } }
    const visited = list(location.visited, 16, value => value);
    // V6 had no forward waterway fight. An already visited passage remains safe on upgrade.
    if (visited.includes('waterway') && !rewards.approach) { rewards.approach = { scene: 'waterway', offers: [] }; }
    if (visited.includes('cells')) { rewards.cells = { scene: 'cells', offers: [] }; }
    let rewardNode: string | null = null;
    if (offers.length) {
        const result = V6_REWARDS.find(([fact, , scene]) => scene === location.scene && facts.includes(fact));
        if (!result) { fault('invalid'); }
        rewardNode = result[1]; rewards[rewardNode] = { scene: location.scene, offers };
    }
    if (c.checkpoint !== null) {
        const battle = object(c.battle), player = object(battle.player), checkpoint = object(c.checkpoint), position = point(location.position);
        if (player.hp !== c.hp || player.x !== position.x || player.y !== position.y
            || battle.status !== (phase === 'lost' ? 'lost' : 'fighting') || checkpoint.status !== 'fighting' || checkpoint.tick !== 0) { fault('invalid'); }
        const entry = point(object(c.checkpoint).player);
        location.position = { x: entry.x, y: entry.y };
        for (const resident of Object.values(object(c.people))) {
            const person = object(resident);
            if (person.mode === 'follow') { person.position = { ...object(location.position) }; }
        }
        c.hp = 100; c.phase = 'exploration';
    }
    c.battle = null; c.checkpoint = null; c.engagement = null;
    c.rewards = rewards; c.rewardNode = rewardNode;
    c.completedSegments = visited.includes('waterway') ? ['waterway_approach'] : [];
    delete c.offers; delete c.alarmTicks;
    data.formatVersion = 7;
    return data;
}
