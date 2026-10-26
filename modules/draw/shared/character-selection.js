export function isCharacterEnabled(character) {
    return Boolean(character) && character.enabled !== false;
}

function characterMatchesName(character, normalizedName) {
    return String(character?.name || '').toLowerCase() === normalizedName
        // 展开后的形态记录（见 character-forms.js）：原角色名也指向它们，第一形态排在最前，所以回复原名称时命中第一形态。
        || (character?.baseName !== undefined && String(character.baseName).toLowerCase() === normalizedName)
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

/**
 * 智能体的 name + form 解析到角色：name 只认角色的正式名称（多形态角色是 baseName）和别名，不认展开后的 `名称（形态名）`；
 * 多形态角色（已展开，见 character-forms.js）再用 form 选形态：与启用形态的名称相等（去首尾空白、不区分大小写）时取该形态，
 * 缺省、不存在、已停用时取第一个启用形态。单形态角色忽略 form。
 */
export function findEnabledCharacterForm(name, form, characters = []) {
    const nameKey = String(name ?? '').trim().toLowerCase();
    if (!nameKey) return undefined;
    const formKey = String(form ?? '').trim().toLowerCase();
    const matchesName = character => [character.baseName ?? character.name, ...(Array.isArray(character.aliases) ? character.aliases : [])]
        .some(candidate => String(candidate ?? '').toLowerCase() === nameKey);
    const group = (Array.isArray(characters) ? characters : []).filter(character => isCharacterEnabled(character) && matchesName(character));
    // 展开后同一角色的形态相邻排列，第一个启用形态在最前。
    const known = group[0];
    if (!known || known.baseName === undefined) return known;
    return group.find(entry => entry.baseName === known.baseName && String(entry.formName ?? '').toLowerCase() === formKey) || known;
}
