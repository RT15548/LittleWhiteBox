// 自动学习写回：把学习阶段产出的“操作列表”重放到保存时最新的角色库上。
// 学习是在任务开始时的快照上算的，任务期间用户可能整理过角色库；写回若整表覆盖就会冲掉这些改动。
// 本文件只负责“怎么写回”，不含学习规则：匹配规则（resolve）与已有角色补字段规则（fillExisting）由调用方注入。
// 不得 import 任何模块（零宿主依赖，可在 node 下直接单测）。所有函数不修改入参。
//
// 操作类型：
//   create：{ kind:'create', character, groupId, candidate }  新角色（已填好字段与学习时分配的 id，不含 groupId）
//   update：{ kind:'update', id, name, base, changes }        对已有角色补字段；base 为学习时的旧值，changes 为 字段 → 新值

export const AUTO_LEARN_UPDATE_FIELDS = Object.freeze(['appearance', 'type', 'danbooruTag']);

// type 只在外貌仍为空时才会被学习规则改动：外貌被用户改过，type 也不应再写。
const FIELD_DEPENDENCIES = Object.freeze({ type: ['appearance'] });

function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
}

function sameValue(a, b) {
    return (a ?? '') === (b ?? '');
}

/** 取出学习可能改动的字段值（缺省按空串）。 */
export function snapshotAutoLearnFields(character) {
    const snapshot = {};
    for (const field of AUTO_LEARN_UPDATE_FIELDS) snapshot[field] = character?.[field] ?? '';
    return snapshot;
}

/** 新角色操作：character 取副本并去掉 groupId，分组在写回时按最新分组重新判定。 */
export function buildAutoLearnCreateOp(character, { groupId = '', candidate = null } = {}) {
    const learned = cloneJson(character);
    delete learned.groupId;
    return {
        kind: 'create',
        character: learned,
        groupId: String(groupId || ''),
        candidate: candidate
            ? {
                name: candidate.name,
                type: candidate.type,
                appear: candidate.appear,
                danbooru: candidate.danbooru,
            }
            : null,
    };
}

/** 更新操作：比较学习前后的字段，没有变化返回 null。 */
export function buildAutoLearnUpdateOp(character, before) {
    const after = snapshotAutoLearnFields(character);
    const changes = {};
    for (const field of AUTO_LEARN_UPDATE_FIELDS) {
        if (!sameValue(before?.[field], after[field])) changes[field] = after[field];
    }
    if (!Object.keys(changes).length) return null;
    return {
        kind: 'update',
        id: String(character.id ?? ''),
        name: String(character.name ?? ''),
        base: snapshotAutoLearnFields(before),
        changes,
    };
}

// 只对仍保持学习时旧值的字段写入；用户期间改过的字段保留用户的值。
function applyFieldChanges(character, base, changes) {
    const next = { ...character };
    let changed = false;
    for (const [field, to] of Object.entries(changes || {})) {
        if (!AUTO_LEARN_UPDATE_FIELDS.includes(field)) continue;
        if (!sameValue(character[field], base?.[field])) continue;
        const dependencies = FIELD_DEPENDENCIES[field] || [];
        if (dependencies.some(dep => !sameValue(character[dep], base?.[dep]))) continue;
        if (sameValue(character[field], to)) continue;
        next[field] = to;
        changed = true;
    }
    return changed ? next : null;
}

/**
 * 把操作列表重放到最新角色库上。
 * library: { characters, groups }（保存时最新的）
 * options.mode: 'new_only' | 'auto_update'（对已有角色补字段只在 auto_update 生效，与学习规则一致）
 * options.resolve(candidate, characters): 学习规则里的匹配函数，返回 { action: 'create'|'update'|'skip', character }
 * options.fillExisting(character, candidate): 学习规则里“给已有角色补字段”的函数，对传入对象就地修改并返回是否有改动
 * 返回 { characters, created, updated, changed }；created / updated 是实际写入的角色名。
 */
export function mergeAutoLearnOps(library, ops, { mode = 'new_only', resolve, fillExisting } = {}) {
    const groups = Array.isArray(library?.groups) ? library.groups : [];
    const characters = Array.isArray(library?.characters) ? [...library.characters] : [];
    const created = [];
    const updated = [];

    for (const op of Array.isArray(ops) ? ops : []) {
        if (op?.kind === 'update') {
            const index = characters.findIndex(character => character?.id === op.id);
            if (index < 0) continue; // 用户期间删掉了该角色：不复活
            const next = applyFieldChanges(characters[index], op.base, op.changes);
            if (!next) continue;
            characters[index] = next;
            updated.push(next.name);
            continue;
        }
        if (op?.kind !== 'create' || !op.character) continue;

        const learned = op.character;
        if (characters.some(character => character?.id === learned.id)) continue;

        const candidate = op.candidate || { name: learned.name, type: learned.type };
        const match = typeof resolve === 'function'
            ? resolve(candidate, characters)
            : { action: 'create', character: null };

        if (match.action === 'create') {
            const character = cloneJson(learned);
            // 分组须仍存在于最新分组表，否则放未分组。
            if (op.groupId && groups.some(group => group?.id === op.groupId)) character.groupId = op.groupId;
            characters.push(character);
            created.push(character.name);
            continue;
        }

        // 用户期间已经加入 / 导入了同名或同别名角色：按“匹配到已有角色”处理。
        if (match.action !== 'update' || mode !== 'auto_update') continue;
        if (typeof fillExisting !== 'function' || !op.candidate) continue;
        const index = characters.indexOf(match.character);
        if (index < 0) continue;
        const found = characters[index];
        const probe = { ...found };
        if (!fillExisting(probe, op.candidate)) continue;
        const next = { ...found };
        let changed = false;
        for (const field of AUTO_LEARN_UPDATE_FIELDS) {
            if (!sameValue(found[field], probe[field])) {
                next[field] = probe[field];
                changed = true;
            }
        }
        if (!changed) continue;
        characters[index] = next;
        updated.push(next.name);
    }

    return { characters, created, updated, changed: created.length > 0 || updated.length > 0 };
}
