// 角色“形态”：同一个角色的不同样子（如 人形 / 兽形），各自有类型、固定外貌（正向 + 负向）、服装列表、动态标签与 Danbooru 标签。
// 纯函数，只依赖同目录的 named-tag-items.js；NovelAI iframe、SD / ComfyUI 页面、规划器、服务端 Draw Run 运行时都从这里取同一份实现。
//
// 数据模型（旧数据与单形态角色完全不变）：
// - 角色顶层的 type / appearance / negativeTags / danbooruTag / outfits / dynamicStates 就是“第一形态”（默认形态），
//   可选的 formName 是它的形态名称（只有角色有 ≥2 个形态时才用到）。
// - forms 只保存“额外的形态”：[{ id?, name, type, appearance, negativeTags, danbooruTag, outfits, dynamicStates, enabled? }]；没有额外形态时不写该键。
// - 形态可以停用（只属于本机，不导出，导入保留本机的值）：额外形态写 enabled:false（启用时不写该键），第一形态在角色顶层写 formDisabled:true。
//   停用的形态不参与展开 / 发给智能体 / 摘要里的类型列表；第一形态停用时由后面第一个启用的形态顶替“未提及时用第一个”和原名称解析，
//   全部形态都停用时这个角色不会被发出去。没有额外形态的角色没有可停用的形态，formDisabled 不起作用（规范化时也不保留）。
// 因此没有 forms 的角色（所有旧数据、旧文件）行为与以前一致；旧版本读到带 forms 的数据只会用到第一形态。
//
// 展开：角色有 ≥2 个形态时，expandCharacterForms 把它展开成每个形态一条记录，名称为 `名称（形态名）`，别名共用，
// 记录里带 baseName（原角色名）、formName（形态名，未命名的形态是 `形态N`）与 formIndex / formCount（只数启用的形态）；单形态角色原样返回同一个对象。

import {
    applyLocalNamedTagEnabled,
    normalizeNamedTagList,
    stripNamedTagEnabled,
} from './named-tag-items.js';

// 一个角色最多这么多个形态（含第一形态）。
export const MAX_CHARACTER_FORMS = 20;
// 多形态角色的说明：发给场景规划器（每个角色只写一次，接在角色名 / 别名后面）和 Draw 页面文案共用。
export const FORM_EXCLUSIVE_NOTE = '有多个形态：form 写其中一个，同一画面只出现一个，正文未提及时用第一个';

const DEFAULT_TYPE = 'girl';

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function lowerKey(value) {
    return String(value ?? '').trim().toLocaleLowerCase();
}

/** 形态是否完全是空白（没有任何内容，类型也是默认值）：规范化时丢弃，避免点了“添加形态”什么也没填的垃圾条目。 */
export function isBlankForm(form) {
    const type = String(form?.type || '').trim();
    return !String(form?.name || '').trim()
        && (!type || type === DEFAULT_TYPE)
        && !String(form?.appearance || '').trim()
        && !String(form?.negativeTags || '').trim()
        && !String(form?.danbooruTag || '').trim()
        && !normalizeNamedTagList(form?.outfits).length
        && !normalizeNamedTagList(form?.dynamicStates).length;
}

/** 规范化一个额外形态；id 只在给出时保留。 */
export function normalizeForm(raw) {
    const form = isPlainObject(raw) ? raw : {};
    const id = String(form.id ?? '').trim();
    return {
        ...(id ? { id } : {}),
        name: String(form.name || '').trim(),
        type: String(form.type || DEFAULT_TYPE),
        appearance: String(form.appearance || form.tags || ''),
        negativeTags: String(form.negativeTags || ''),
        danbooruTag: String(form.danbooruTag || ''),
        outfits: normalizeNamedTagList(form.outfits || form.costumes || form.clothes || []),
        dynamicStates: normalizeNamedTagList(form.dynamicStates || []),
        ...(form.enabled === false ? { enabled: false } : {}),
    };
}

/** 规范化额外形态列表：去掉非对象与完全空白的条目，数量封顶（含第一形态不超过 MAX_CHARACTER_FORMS）。 */
export function normalizeForms(list) {
    return (Array.isArray(list) ? list : [])
        .filter(isPlainObject)
        .map(normalizeForm)
        .filter(form => !isBlankForm(form))
        .slice(0, MAX_CHARACTER_FORMS - 1);
}

/** 角色是否有 ≥2 个形态（即有额外形态）。 */
export function hasMultipleForms(character) {
    return Array.isArray(character?.forms) && character.forms.length > 0;
}

/** 角色的全部形态视图（第一形态 = 顶层字段，其后是 forms）；每项带 index。 */
export function getCharacterForms(character) {
    const first = {
        index: 0,
        name: String(character?.formName || '').trim(),
        type: String(character?.type || DEFAULT_TYPE),
        appearance: String(character?.appearance || ''),
        negativeTags: String(character?.negativeTags || ''),
        danbooruTag: String(character?.danbooruTag || ''),
        outfits: Array.isArray(character?.outfits) ? character.outfits : [],
        dynamicStates: Array.isArray(character?.dynamicStates) ? character.dynamicStates : [],
        enabled: character?.formDisabled !== true,
    };
    const extra = (Array.isArray(character?.forms) ? character.forms : []).map((form, i) => ({
        index: i + 1,
        ...(form?.id ? { id: form.id } : {}),
        name: String(form?.name || '').trim(),
        type: String(form?.type || DEFAULT_TYPE),
        appearance: String(form?.appearance || ''),
        negativeTags: String(form?.negativeTags || ''),
        danbooruTag: String(form?.danbooruTag || ''),
        outfits: Array.isArray(form?.outfits) ? form.outfits : [],
        dynamicStates: Array.isArray(form?.dynamicStates) ? form.dynamicStates : [],
        enabled: form?.enabled !== false,
    }));
    return [first, ...extra];
}

/**
 * 参与出图的形态：多形态角色只留启用的（可能一个都不剩）；没有额外形态时只有第一形态，且不看 formDisabled。
 * 每项仍带原来的 index，所以名称里的“形态N”不会因为别的形态被停用而变。
 */
export function getEnabledCharacterForms(character) {
    const forms = getCharacterForms(character);
    return hasMultipleForms(character) ? forms.filter(form => form.enabled) : forms.slice(0, 1);
}

function expandOne(character, includeDisabled) {
    const forms = getCharacterForms(character);
    const base = String(character.name || '');
    const used = new Set();
    // 名称按全部形态算（停用某个形态不会改变其余形态的名称），再只留启用的。
    const named = forms.map((form, index) => {
        let formName = form.name || `形态${index + 1}`;
        let name = index === 0 && !form.name ? base : `${base}（${formName}）`;
        if (used.has(lowerKey(name))) {
            formName = `${form.name || '形态'}${index + 1}`;
            name = `${base}（${formName}）`;
        }
        used.add(lowerKey(name));
        return { form, name, formName };
    }).filter(({ form }) => includeDisabled || form.enabled);
    return named.map(({ form, name, formName }, index) => ({
        ...(character.id !== undefined ? { id: character.id } : {}),
        ...(character.enabled === false ? { enabled: false } : {}),
        name,
        baseName: base,
        formName,
        aliases: character.aliases || [],
        formIndex: index,
        formCount: named.length,
        type: form.type,
        appearance: form.appearance,
        negativeTags: form.negativeTags,
        danbooruTag: form.danbooruTag,
        outfits: form.outfits,
        dynamicStates: form.dynamicStates,
    }));
}

/**
 * 把有 ≥2 个形态的角色展开成每个形态一条；其余角色原样（同一个对象）保留，顺序不变。
 * 展开后的记录名称为 `名称（形态名）`（第一形态没有形态名时就是原名称），别名共用，
 * 智能体用 name（原名称 / 别名）+ form（形态名）选形态，见 character-selection.js 的 findEnabledCharacterForm；展开后的 `名称（形态名）` 只是内部记录名，不能当 name 回复。
 * 停用的形态不展开（发给智能体的只有启用的形态，全部停用的角色一条也没有）；includeDisabled 供“按名称认人”的场合（自动学习）使用，停用的形态也展开。
 */
export function expandCharacterForms(characters = [], { includeDisabled = false } = {}) {
    const result = [];
    for (const character of Array.isArray(characters) ? characters : []) {
        if (hasMultipleForms(character)) result.push(...expandOne(character, includeDisabled));
        else result.push(character);
    }
    return result;
}

/** 导出 / 导入用：去掉每个形态自己的 enabled 与其中服装、动态标签条目的 enabled（启用状态只属于本机）。 */
export function stripFormsEnabled(forms = []) {
    return (Array.isArray(forms) ? forms : []).map(({ enabled: _enabled, ...form }) => ({
        ...form,
        ...(Array.isArray(form?.outfits) ? { outfits: stripNamedTagEnabled(form.outfits) } : {}),
        ...(Array.isArray(form?.dynamicStates) ? { dynamicStates: stripNamedTagEnabled(form.dynamicStates) } : {}),
    }));
}

/**
 * 导入替换形态列表时保留本机条目的启用状态：文件里的形态按 id、其次按名称对应本机已有的形态，
 * 恢复该形态自己的启用状态，再对其服装 / 动态标签逐条按名称恢复启用状态；对不上的形态全部默认启用。
 */
export function applyLocalFormsEnabled(incoming = [], local = []) {
    const localForms = (Array.isArray(local) ? local : []).filter(isPlainObject);
    const taken = new Set();
    const pick = (form) => {
        const matchers = [
            candidate => form.id && candidate.id === form.id,
            candidate => form.name && String(candidate.name || '').trim() === form.name,
        ];
        for (const matches of matchers) {
            const index = localForms.findIndex((candidate, i) => !taken.has(i) && matches(candidate));
            if (index >= 0) {
                taken.add(index);
                return localForms[index];
            }
        }
        return null;
    };
    return (Array.isArray(incoming) ? incoming : []).map((form) => {
        const match = pick(form);
        const rest = { ...form };
        delete rest.enabled;
        return {
            ...rest,
            ...(match?.enabled === false ? { enabled: false } : {}),
            outfits: applyLocalNamedTagEnabled(form.outfits, match?.outfits),
            dynamicStates: applyLocalNamedTagEnabled(form.dynamicStates, match?.dynamicStates),
        };
    });
}

/** 复制角色时给每个带 id 的形态换新 id（形态没有 id 时保持没有）。 */
export function withFreshFormIds(forms = [], makeId) {
    const used = new Set();
    return (Array.isArray(forms) ? forms : []).map((form) => {
        if (!form?.id) return form;
        let id = '';
        for (let attempt = 0; attempt < 100 && (!id || used.has(id)); attempt += 1) id = String(makeId('form'));
        used.add(id);
        return { ...form, id };
    });
}

/**
 * 角色卡摘要栏里的类型标记：按形态顺序列出每个启用形态的类型（用页面给的 shortLabel 取短标签），英文逗号连接，如 `boy,other`。
 * 单形态角色就是它自己的类型，与以前一致。
 */
export function formatFormTypeSummary(character, shortLabel = type => type) {
    return getEnabledCharacterForms(character).map(form => shortLabel(form.type)).join(',');
}

/** 角色库搜索（SD / ComfyUI 面板）用的字段：名称、别名、每个形态的名称 / 外貌 / Danbooru 标签。单形态角色与以前一致。 */
export function getCharacterSearchFields(character) {
    const extra = (Array.isArray(character?.forms) ? character.forms : []);
    return [
        character?.name,
        ...(character?.aliases || []),
        character?.appearance,
        character?.danbooruTag,
        character?.formName,
        ...extra.flatMap(form => [form?.name, form?.appearance, form?.danbooruTag]),
    ];
}
