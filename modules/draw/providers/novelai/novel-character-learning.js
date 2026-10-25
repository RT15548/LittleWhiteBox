import { expandCharacterForms } from '../../shared/character-forms.js';
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
    // 智能体回复的是 `名称（形态名）`：它属于库里已有的多形态角色，不能当成新角色创建。
    // 学习只写第一形态（角色顶层字段）：命中第一形态时更新原角色，命中其他形态时跳过。
    // includeDisabled：停用的形态也算这个角色的形态，回复它的名称同样不能当成新角色创建。
    const form = findCharacterByName(name, expandCharacterForms(characters, { includeDisabled: true }).filter(entry => entry.baseName !== undefined));
    if (form) {
        const source = form.formIndex === 0 && form.enabled !== false
            ? characters.find(character => character.id === form.id)
            : null;
        return source ? { action: 'update', character: source } : { action: 'skip', character: null };
    }
    if (findCharacterByName(name, characters)) {
        return { action: 'skip', character: null };
    }
    // Drawing may omit a type; creating a library entry must not invent one.
    if (!candidate.type) return { action: 'skip', character: null };
    return { action: 'create', character: null };
}
