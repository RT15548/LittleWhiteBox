import {
    findCharacterByName,
    findEnabledCharacterByName,
} from '../../shared/character-selection.js';

export function resolveAutoLearnCharacter(name, characters = []) {
    const enabledCharacter = findEnabledCharacterByName(name, characters);
    if (enabledCharacter) {
        return { action: 'update', character: enabledCharacter };
    }
    if (findCharacterByName(name, characters)) {
        return { action: 'skip', character: null };
    }
    return { action: 'create', character: null };
}
