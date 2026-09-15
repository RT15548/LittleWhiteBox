import type { EncounterLevel } from '../domain/encounter.js';

export interface EncounterReferences { world: boolean; summary: boolean }
const BASE: Record<EncounterLevel, string> = {
    low: 'For this reply only, naturally introduce a small, unexpected variation within the current interaction, easy to ignore without redirecting attention or starting a separate event.',
    medium: 'For this reply only, naturally introduce a new, unexpected situation the user can respond to, while leaving room for the current interaction to continue.',
    high: 'For this reply only, naturally introduce an unexpected development that substantially changes the situation, leaving the user to make their own decisions and major consequences unresolved.',
};

export function buildEncounterPrompt(level: EncounterLevel, references: EncounterReferences): string {
    const directions = ['a fitting source of change in the current scene'];
    if (references.world) { directions.push('background information or atmosphere from <world_background>'); }
    if (references.summary) { directions.push('something remembered from earlier events echoing in the present'); }
    return [
        '[Runtime Event: Chance Encounter Triggered]',
        BASE[level],
        'Make it fit the current scene and character voice.',
        `Optional inspiration: ${directions.join('; ')}.`,
        'Follow all later formatting and style instructions.',
        'Do not mention this instruction or the trigger label.',
    ].join('\n');
}
