import { COURTYARD } from '../../apps/game/expedition/content/courtyard.ts';
import { sceneSpace, walkWorld } from '../../apps/game/expedition/world/exploration.ts';
import { findWorldPath } from '../../apps/game/expedition/world/navigation.ts';
import { tickCampaign, campaignField, CAMPAIGN_RULES } from '../../apps/game/expedition/campaign/rules.ts';
import { appendInput } from '../../apps/game/expedition/combat.ts';
import { pilot } from './expedition-pilot.mjs';
import { RULES } from '../../apps/game/expedition/content.ts';
const check = (value, detail = 'campaign action failed') => { if (!value) { throw new Error(detail); } };

/** Real authored navigation and fixed input only. No health, coordinates, rewards or victories are patched. */
export function campaignDriver(get, act) {
    async function combatTicks(ticks) {
        const c = structuredClone(get()), spans = [], field = campaignField(c);
        for (let t = 0; t < ticks && c.phase === 'battle'; t++) {
            const input = pilot(c.battle, c.weapon, field); appendInput(spans, input); tickCampaign(c, input);
        }
        if (spans.length) { await act({ type: 'input', spans }); }
    }
    async function battle() {
        for (let batch = 0; get().phase === 'battle' && batch < 80; batch++) {
            await combatTicks(180);
        }
        check(get().phase !== 'battle', 'encounter must terminate');
        check(get().phase !== 'lost', `pilot lost at ${get().location.scene}`);
        if (get().phase === 'reward') {
            const priority = ['cinder', 'frost', 'siphon', 'orbit', 'echo', 'piercing', 'aegis', 'renewal'];
            const offer = [...get().offers].sort((a, b) => (priority.indexOf(a.id) < 0 ? 99 : priority.indexOf(a.id)) - (priority.indexOf(b.id) < 0 ? 99 : priority.indexOf(b.id)))[0];
            await act(offer ? { type: 'relic', id: offer.id } : { type: 'leave' });
        }
    }
    async function walk(anchor, fight = true) {
        for (let batch = 0; batch < 240; batch++) {
            if (!fight && (get().phase === 'battle' || get().phase === 'reward')) { return; }
            if (get().phase === 'battle' || get().phase === 'reward') { await battle(); }
            const c = structuredClone(get()), scene = COURTYARD[c.location.scene], target = scene.anchors[anchor];
            check(target, `${scene.id}/${anchor}`);
            if (Math.hypot(c.location.position.x - target.x, c.location.position.y - target.y) < 1.5) { return; }
            const path = findWorldPath(sceneSpace(scene, new Set(c.facts)), c.location.position, target, RULES.playerRadius);
            check(path, `route ${scene.id}/${anchor}`);
            const spans = [];
            for (let t = 0; t < 30 && c.phase === 'exploration'; t++) {
                while (path.length > 1 && Math.hypot(c.location.position.x - path[0].x, c.location.position.y - path[0].y) < .14) { path.shift(); }
                const p = path[0];
                if (Math.hypot(c.location.position.x - target.x, c.location.position.y - target.y) < 1.5) { break; }
                let chosen = 0, score = Infinity;
                for (let move = 1; move <= 8; move++) {
                    const location = structuredClone(c.location); walkWorld(location, move, sceneSpace(scene, new Set(c.facts)), CAMPAIGN_RULES.explorationSpeed);
                    const distance = Math.hypot(location.position.x - p.x, location.position.y - p.y);
                    if (distance < score) { score = distance; chosen = move; }
                }
                const input = { move: chosen, dash: false, skill: false };
                appendInput(spans, input); tickCampaign(c, input);
            }
            if (spans.length) { await act({ type: 'input', spans }); }
        }
        check(false, `navigation stuck ${get().location.scene}/${anchor} ${JSON.stringify(get().location.position)}`);
    }
    async function interact(id) {
        const scene = COURTYARD[get().location.scene], target = [...scene.exits, ...scene.objects].find(o => o.id === id);
        check(target); await walk(target.anchor); await act({ type: 'interact', id });
    }
    async function complete(route = 'gate') {
        if (!get().facts.includes('briefed')) { await walk('clinic'); await act({ type: 'choice', id: 'briefing', person: 'sanniang' }); }
        if (!get().facts.includes('receiving_arranged')) { await walk('guard'); await act({ type: 'choice', id: 'receiving', person: 'laobai' }); }
        await interact('road');
        await interact(route);
        if (route === 'gate') { await interact('beacon'); await interact('hall'); await interact('cells'); }
        else { await interact('sluice'); await interact('cells'); }
        await interact('release'); await interact('postern_latch'); await interact('postern');
        await interact('rest');
        if (!get().facts.includes('warden_defeated')) { await interact('postern'); await interact('hall'); await walk('encounter'); await battle(); await interact('cells'); await interact('postern'); }
        await interact('cargo'); await walk('clinic'); await act({ type: 'choice', id: 'finish', person: 'sanniang' });
        return get();
    }
    return { walk, battle, combatTicks, interact, complete };
}
