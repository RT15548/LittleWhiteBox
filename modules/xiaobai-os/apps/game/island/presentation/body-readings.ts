import type { Needs } from '../model.js';
import { SURVIVAL } from '../survival-content.js';
import { COPY } from '../copy.js';

export function bodyReadings(n: Needs) {
    const feeling = COPY.feeling;
    const rows = [
        { key: 'thirst', ratio: n.waterDeficit / SURVIVAL.lethalWaterDeficit, feeling: n.waterDeficit < SURVIVAL.thirstSignal ? feeling.thirst[0] : n.waterDeficit < SURVIVAL.lethalWaterDeficit / 2 ? feeling.thirst[1] : feeling.thirst[2] },
        { key: 'hunger', ratio: 1 - n.energy / SURVIVAL.maxEnergy, feeling: n.energy > SURVIVAL.hungerSignal ? feeling.hunger[0] : n.energy > 0 ? feeling.hunger[1] : feeling.hunger[2] },
        { key: 'fatigue', ratio: n.fatigue / 100, feeling: n.fatigue < SURVIVAL.fatigueSignal / 2 ? feeling.fatigue[0] : n.fatigue < SURVIVAL.fatigueSignal ? feeling.fatigue[1] : feeling.fatigue[2] },
        { key: 'bladder', ratio: n.bladder / SURVIVAL.bladderLimit, feeling: n.bladder < SURVIVAL.bladderSignal ? feeling.relief[0] : feeling.relief[1] },
        { key: 'bowel', ratio: n.bowel / SURVIVAL.bowelLimit, feeling: n.bowel < SURVIVAL.bowelSignal ? feeling.relief[0] : feeling.relief[1] },
        { key: 'wound', ratio: n.footWound, feeling: n.footWound === 0 ? feeling.foot[0] : feeling.foot[1] },
        { key: 'hygiene', ratio: 1 - n.soiling, feeling: n.soiling < .3 ? feeling.clean[0] : feeling.clean[1] },
    ] as const;
    return rows.map(row => ({ ...row, percent: Math.round(Math.min(1, Math.max(0, row.ratio)) * 100) }));
}
