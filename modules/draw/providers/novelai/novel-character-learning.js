import {
    findCharacterByName,
    findEnabledCharacterByName,
} from '../../shared/character-selection.js';

export function resolveAutoLearnCharacter(candidate, characters = []) {
    const name = candidate.name;
    const enabledCharacter = findEnabledCharacterByName(name, characters);
    if (enabledCharacter) {
        return { action: 'update', character: enabledCharacter };
    }
    if (findCharacterByName(name, characters)) {
        return { action: 'skip', character: null };
    }
    // Drawing may omit a type; creating a library entry must not invent one.
    if (!candidate.type) return { action: 'skip', character: null };
    return { action: 'create', character: null };
}
