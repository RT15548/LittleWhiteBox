export function isCharacterEnabled(character) {
    return Boolean(character) && character.enabled !== false;
}

function characterMatchesName(character, normalizedName) {
    return String(character?.name || '').toLowerCase() === normalizedName
        || (Array.isArray(character?.aliases) ? character.aliases : [])
            .some(alias => String(alias || '').toLowerCase() === normalizedName);
}

export function findCharacterByName(name, characters = []) {
    const normalizedName = String(name || '').toLowerCase();
    if (!normalizedName) return undefined;

    return (Array.isArray(characters) ? characters : [])
        .find(character => characterMatchesName(character, normalizedName));
}

export function findEnabledCharacterByName(name, characters = []) {
    const normalizedName = String(name || '').toLowerCase();
    if (!normalizedName) return undefined;

    return (Array.isArray(characters) ? characters : []).find(character =>
        isCharacterEnabled(character)
        && characterMatchesName(character, normalizedName)
    );
}
