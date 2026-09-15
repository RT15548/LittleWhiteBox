export type EncounterLevel = 'low' | 'medium' | 'high';
export type EncounterOutcome = EncounterLevel | 'none' | 'cooldown';
export interface EncounterRecords { schemaVersion: 1; encounter: { outcome: EncounterOutcome } }

export function encounterLevel(outcome: EncounterOutcome): EncounterLevel | null {
    return outcome === 'low' || outcome === 'medium' || outcome === 'high' ? outcome : null;
}

export function parseEncounterRecords(value: unknown): EncounterRecords {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('随机遭遇记录格式无效。'); }
    const input = value as Record<string, unknown>;
    const encounter = input.encounter as Record<string, unknown> | undefined;
    if (input.schemaVersion !== 1 || Object.keys(input).length !== 2 || !encounter || typeof encounter !== 'object'
        || Array.isArray(encounter) || Object.keys(encounter).length !== 1
        || typeof encounter.outcome !== 'string' || !['low', 'medium', 'high', 'none', 'cooldown'].includes(encounter.outcome)) {
        throw new TypeError('随机遭遇记录格式无效。');
    }
    return { schemaVersion: 1, encounter: { outcome: encounter.outcome as EncounterOutcome } };
}

/** Recent entries represent real user turns, including turns with Dice disabled. */
export function decideEncounter(recent: readonly (EncounterOutcome | undefined)[], random: () => number): EncounterRecords {
    if (recent.slice(-2).some(outcome => outcome !== undefined && encounterLevel(outcome))) {
        return { schemaVersion: 1, encounter: { outcome: 'cooldown' } };
    }
    const roll = random();
    if (!Number.isFinite(roll) || roll < 0 || roll >= 1) { throw new RangeError('随机源返回了无效值。'); }
    const outcome = roll < 0.01 ? 'high' : roll < 0.04 ? 'medium' : roll < 0.09 ? 'low' : 'none';
    return { schemaVersion: 1, encounter: { outcome } };
}
