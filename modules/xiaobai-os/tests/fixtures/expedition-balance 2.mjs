// Diagnostic only: legal route inputs and earned equipment. Idle/circle comparisons clone real checkpoints.
import process from 'node:process';
import { advanceExpedition, emptyExpedition } from '../../apps/game/expedition/domain.ts';
import { campaignField, campaignLoadout } from '../../apps/game/expedition/campaign/rules.ts';
import { tickBattle } from '../../apps/game/expedition/combat.ts';
import { WEAPON_IDS } from '../../apps/game/expedition/ids.ts';
import { journey } from './expedition-traveler.js';
import { campaignDriver } from './campaign-driver.mjs';
const idle = { move: 0, dash: false, skill: false };
let failures = 0;
for (const seed of (process.argv.slice(2).length ? process.argv.slice(2).map(Number) : [7, 29])) {
    for (const weapon of WEAPON_IDS) for (const route of ['gate', 'waterway']) {
        let state = advanceExpedition(emptyExpedition(), { type: 'start', weapon, outfit: 'traveler', ...journey }, 'balance', seed), serial = 0;
        const stats = [];
        const driver = campaignDriver(() => state.active, command => { state = advanceExpedition(state, command, `input-${++serial}`, 0); }, {
            started(c) {
                const field = campaignField(c), loadout = campaignLoadout(c), row = { segment: c.engagement.id, gear: loadout.relics };
                for (const mode of ['idle', 'circle']) {
                    const b = structuredClone(c.checkpoint);
                    for (let t = 0; t < 12000 && b.status === 'fighting'; t++) tickBattle(b, mode === 'idle' ? idle : { ...idle, move: Math.floor(t / 30) % 8 + 1 }, loadout, field);
                    row[mode] = { status: b.status, seconds: Math.round(b.tick / 30), hp: Math.round(b.player.hp) };
                }
                stats.push(row);
            },
            finished(id, b) { Object.assign(stats.at(-1), { status: b.status, seconds: Math.round(b.tick / 30), hp: Math.round(b.player.hp), kills: b.kills }); },
        });
        let error;
        try {
            await driver.complete(route); await driver.interact('road'); await driver.interact('roots'); await driver.walk('encounter'); await driver.battle();
        } catch (failure) { error = failure.message; failures++; }
        console.log(JSON.stringify({ seed, weapon, route, stats, ...(error ? { error } : {}) }));
    }
}
process.exitCode = failures ? 1 : 0;
