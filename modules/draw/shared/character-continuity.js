/**
 * 沿用角色（On-screen Continuity）：角色的形态（form）与着装（costume）记忆
 *
 * 与角色库（characterTags）的分工：
 * - 角色库是用户维护的权威身份资料，本模块不修改它；
 * - 这里汇总「每个角色最近一次实际入画时的形态/着装（未录入角色还有外貌）」，
 *   下次规划时作为跨楼层画面事实喂给 LLM：默认逐字复用，仅在正文出现明确变化事实时改写。
 *
 * 数据源（刻意保持简单，不单独维护历史系统）：
 * - 直接复用图库图片记录：每张成功图片入库时随存 continuityChars（规划时的原始角色快照）；
 * - 读取时按当前聊天每层的可见图位和选中版本合并，
 *   删楼/切分支/图片删除后锚点自然失效；
 * - 用户可在记忆界面手动修改：改动是按聊天保存的覆盖层（edits），作为“最近的图”插进记录序列，
 *   不改图片记录；界面清单（buildContinuityMemoryView）由两者重建；
 * - 纯数据 + 纯函数，图片记录由宿主查询后注入，便于单测与后台任务复用。
 */
import { isGenericCharacterName } from './generic-char-name.js';
import { removeDuplicateTags } from './character-prompts.js';
import { findEnabledCharacterForm } from './character-selection.js';

// 只有 NovelAI 规划会注入这块，所以说明随数据走，不写进三家共用的材料说明和字段说明。
const CONTINUITY_BLOCK_HEADER = [
    '【前文画面中的角色】',
    '本聊天前面楼层已经画出的图里，每个角色最近一次画成的样子（form 是当时的形态，costume 是当时的持续状态）。',
    '着装优先级：正文写的穿搭 > 这里的 costume > 服装参考、世界书、数据表、角色卡里的穿搭描述。正文没写变化时，这里的 costume 就是本图的起点，照抄它；正文写了变化才按正文改。',
    '只要本图正文出现穿上、换上、系好、套上、戴上、脱下、解开、拉开等着装变化，就必须显式写出这一刻的完整 costume（穿在身上的整套衣物：款式+颜色+状态，加上保留的配饰与身体部件），不得省略。',
    '这里已经包含了服装参考里的衣物，不要再叠加一份参考。世界书、数据表、角色卡里的穿搭描述不是本图发生的变化，不能拿来推翻这里的 costume。',
    'costume 里没有衣服（只剩身体部件、非人特征或配饰，或写“（空＝没穿）”）的，上一张图里就是没穿衣服；这是正常状态，不是空字段：正文没写穿上，就保持没穿，不要自己去挑衣服。',
    '正文没写这个角色这次是什么形态时，form 沿用这里列出的。',
    '本图要画的形态和这里的 form 不同（例如兽形化成人形，男性变成女性），不要照抄这里的 costume：正文写了穿什么就穿什么，没写就按该形态的服装参考自己挑。',
].join('\n');
export const EMPTY_COSTUME_TEXT = '（空＝没穿）';
const CONTINUITY_VERSION = 1;
export const DEFAULT_MAX_FLOORS = 100;
export const DEFAULT_MAX_ENTRIES = 50;
const MAX_EDITS = 200;
/** 正整数设置项（没设或写错就用 fallback）；记忆上限的设置归一化与这里共用。 */
export function positiveInteger(value, fallback) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : fallback;
}

/** 服装记忆的读取范围：从设置里取出并归一化。 */
export function normalizeContinuityLimits(source) {
    return {
        continuityMaxFloors: positiveInteger(source?.continuityMaxFloors, DEFAULT_MAX_FLOORS),
        continuityMaxEntries: positiveInteger(source?.continuityMaxEntries, DEFAULT_MAX_ENTRIES),
    };
}

const capOf = value => positiveInteger(value, DEFAULT_MAX_ENTRIES);
const MAX_TAG_LENGTH = 600;
const MAX_FORM_LENGTH = 80;
const MAX_NAME_LENGTH = 200;
const sanitizeForm = value => sanitizeTags(value).slice(0, MAX_FORM_LENGTH);
// 规划清单里角色行写作“名称（别名: …）”，模型有时把整段当名字抄回来；记忆里统一去掉这段说明。
const ALIAS_NOTE_SUFFIX = /\s*[（(]\s*别名\s*[:：][^）)]*[）)]\s*$/;

function stripAliasNote(name) {
    // 先截断再匹配：名字不会有这么长，别让异常长的输入拖慢正则。
    return String(name || '').slice(0, MAX_NAME_LENGTH).replace(ALIAS_NOTE_SUFFIX, '').trim();
}

/** 在场角色的名字 + 正式名称（含别名展开），用来判断“是不是已录入角色”。 */
function knownNamesOf(characters, resolver) {
    return [...characters.map(character => character?.name), ...resolver.known];
}

const validFloor = value => (Number.isInteger(value) && value >= 0 ? value : null);

function lowerKey(value) {
    return String(value || '').trim().toLocaleLowerCase();
}

/**
 * 把正文里出现的各种叫法（正式名、别名、多形态展开名“名称（形态名）”、带“（别名: …）”说明的写法）
 * 统一成角色库里的正式名称，并给出“已录入角色”的名字集合。characters 是 detectPresentCharacters 的结果。
 */
export function createContinuityNameResolver(characters = []) {
    const canonical = new Map();
    const known = new Set();
    for (const character of Array.isArray(characters) ? characters : []) {
        const base = String(character?.baseName ?? character?.name ?? '').trim();
        if (!base) continue;
        known.add(lowerKey(base));
        for (const name of [character.name, base, ...(Array.isArray(character.aliases) ? character.aliases : [])]) {
            const key = lowerKey(name);
            if (key && !canonical.has(key)) canonical.set(key, base);
        }
    }
    return {
        known,
        canonicalName(name) {
            const clean = stripAliasNote(name);
            return canonical.get(lowerKey(clean)) || clean;
        },
    };
}

function sanitizeTags(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, MAX_TAG_LENGTH);
}

function normalizeEntry(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const name = stripAliasNote(raw.name);
    if (!name) return null;
    const appear = sanitizeTags(raw.appear);
    const costume = sanitizeTags(raw.costume);
    const form = sanitizeForm(raw.form);
    // 条目存在就是“这个角色出现过”，衣着为空也留下：空表示没穿，不是没有记录（没有条目才是新出现的角色）。
    const floor = validFloor(raw.floor);
    return { name, ...(form ? { form } : {}), appear, costume, at: Number(raw.at) || 0, ...(floor === null ? {} : { floor }), ...(raw.edited === true ? { edited: true } : {}) };
}

/** 容忍脏数据/乱序/重复键，产出按时间升序、键唯一的快照集。 */
export function normalizeContinuity(raw) {
    const list = Array.isArray(raw?.entries) ? raw.entries : [];
    const map = new Map();
    for (const item of list) {
        const entry = normalizeEntry(item);
        if (!entry) continue;
        const key = entry.name.toLocaleLowerCase();
        const existing = map.get(key);
        if (!existing || entry.at >= existing.at) map.set(key, entry);
    }
    return {
        version: CONTINUITY_VERSION,
        entries: [...map.values()].sort((a, b) => a.at - b.at),
    };
}

function toNameSet(names) {
    return new Set(
        (Array.isArray(names) ? names : [])
            .map(name => String(name || '').trim().toLocaleLowerCase())
            .filter(Boolean),
    );
}

/**
 * 本次请求只注入相关锚点：已录入角色（presentCharacters 已按本楼正文过滤）全部保留；
 * 未录入角色仅当名字仍出现在本楼正文时保留；通用称呼永远不进锚点。
 */
export function selectContinuityEntries(entries, { knownNames = [], bodyText = '' } = {}) {
    const known = toNameSet(knownNames);
    const text = String(bodyText || '').toLocaleLowerCase();
    return (Array.isArray(entries) ? entries : []).filter((entry) => {
        const key = String(entry?.name || '').toLocaleLowerCase();
        if (!key) return false;
        if (known.has(key)) return true;
        if (isGenericCharacterName(entry.name)) return false;
        return text.includes(key);
    });
}

/** 渲染给规划 LLM 的【前文画面中的角色】区块；无可用条目时返回空串。 */
export function buildContinuityBlock(entries, { knownNames = [] } = {}) {
    const known = toNameSet(knownNames);
    const lines = [];
    for (const entry of Array.isArray(entries) ? entries : []) {
        if (!entry) continue;
        const isKnown = known.has(String(entry.name || '').toLocaleLowerCase());
        const parts = [];
        if (entry.form) parts.push(`form: ${entry.form}`);
        // 已录入角色的身份外貌来自角色库，这里不重复，避免两处描述漂移后互相打架。
        if (!isKnown && entry.appear) parts.push(`appear: ${entry.appear}`);
        parts.push(`costume: ${entry.costume || EMPTY_COSTUME_TEXT}`);
        lines.push(`- ${entry.name}｜${parts.join('｜')}`);
    }
    if (!lines.length) return '';
    return [CONTINUITY_BLOCK_HEADER, ...lines].join('\n');
}

/**
 * 旧版本改过提示词后存的撤销快照是 { name, appear: '', costume: '' }：没有 action 键，也没有 revoked。
 * 真实规划快照一定带 action；用户修改生成的快照带 edited，空衣着仍表示“没穿”。
 */
function isLegacyRevocation(char, appear, costume) {
    return !Object.hasOwn(char, 'action') && !appear && !costume && char.edited !== true;
}

/**
 * 用一批角色快照更新锚点（时间序调用即按图片顺序生效）。
 * - 每个角色的记忆 = 最近一张图的 form 和 costume，原样覆盖；costume 为空就是空（没穿），对所有角色一样；
 * - 已录入角色的 appear 永不写入；未录入角色的 appear 只在本次写了时才覆盖（漏写不清空长相）；
 * - 角色名按 characters（本楼出场角色）统一成正式名称：别名、多形态展开名、带“（别名: …）”的写法都并入同一条；
 * - 快照带 revoked: true（用户在记忆界面清除）时，删掉这个角色的记忆；
 *   旧版本的撤销快照 { name, appear: '', costume: '' }（没有 action 键）同样视为撤销；
 * - 快照带 costumeOmitted: true 且 costume 为空（模型没写衣着、记忆里也补不上；或在图片卡里编辑过这个角色的提示词，见 continuityAfterTagEdit）时不新建条目，也不改动记忆里的形态和衣着；
 *   只有未录入角色这次写了的外貌会更新到已有条目上（外貌是它唯一的长相来源）；
 * - 快照带 edited: true（用户在记忆界面手改）的条目会记下 edited，之后被真实图覆盖就清掉；
 * - 通用称呼跳过；超过上限淘汰最久未出现的角色；没有条目 = 新出现的角色。
 */
export function mergePlanIntoContinuity(entries, tasks, {
    knownNames = [],
    characters = [],
    resolver = createContinuityNameResolver(characters),
    now = Date.now(),
    floor = null,
    maxEntries = DEFAULT_MAX_ENTRIES,
} = {}) {
    const canonicalKey = name => lowerKey(resolver.canonicalName(name));
    const map = new Map();
    for (const entry of Array.isArray(entries) ? entries : []) {
        const name = resolver.canonicalName(entry.name);
        if (name) map.set(lowerKey(name), { ...entry, name });
    }
    const known = new Set([...toNameSet(knownNames), ...resolver.known]);
    const timestamp = Number.isFinite(Number(now)) ? Number(now) : Date.now();

    for (const task of Array.isArray(tasks) ? tasks : []) {
        for (const char of Array.isArray(task?.chars) ? task.chars : []) {
            const name = resolver.canonicalName(char?.name);
            if (!name || isGenericCharacterName(name)) continue;
            const key = canonicalKey(name);
            const isKnown = known.has(key);
            const appear = sanitizeTags(char.appear);
            const costume = sanitizeTags(char.costume);
            const form = sanitizeForm(char.form);
            // 用户在记忆界面清除（revoked），或旧版本改提示词后存下的撤销快照：删掉这个角色的记忆。
            if (char.revoked === true || isLegacyRevocation(char, appear, costume)) {
                map.delete(key);
                continue;
            }
            const previous = map.get(key);
            // 模型没写衣着又补不上：既不是“没穿”也不是新事实，形态和衣着保持原样（外貌不受影响，照常更新）。
            if (char.costumeOmitted === true && !costume) {
                if (previous && !isKnown && appear) map.set(key, { ...previous, appear });
                continue;
            }
            // 最近一张图整个覆盖旧的（形态和衣着一起）；衣着为空也是一个值，表示没穿。
            // 外貌只有未录入角色才记，而且写了才覆盖：它是这个角色唯一的长相来源，不能被漏写清掉。
            map.set(key, {
                name: previous?.name || name,
                ...(form ? { form } : {}),
                appear: isKnown ? (previous?.appear || '') : (appear || previous?.appear || ''),
                costume,
                at: timestamp,
                ...(validFloor(floor) === null ? {} : { floor }),
                ...(char.edited === true ? { edited: true } : {}),
            });
        }
    }

    const merged = [...map.values()].sort((a, b) => a.at - b.at);
    return normalizeContinuity({
        version: CONTINUITY_VERSION,
        entries: merged.slice(-capOf(maxEntries)),
    });
}

/**
 * 从图片记录重建锚点状态：记录需按（楼层、时间）升序传入，
 * 每条记录的 continuityChars 视作该图入画时的角色快照。
 */
export function buildContinuityFromImageRecords(records, { knownNames = [], characters = [], maxEntries = DEFAULT_MAX_ENTRIES } = {}) {
    let state = normalizeContinuity(null);
    const resolver = createContinuityNameResolver(characters);
    for (const record of Array.isArray(records) ? records : []) {
        const chars = Array.isArray(record?.continuityChars) ? record.continuityChars : [];
        if (!chars.length) continue;
        state = mergePlanIntoContinuity(state.entries, [{ chars }], {
            knownNames,
            resolver,
            now: Number(record?.timestamp) || 0,
            floor: record?.messageId,
            maxEntries,
        });
    }
    return state;
}

/** 在场角色当前被记住的形态和衣着（页面算好后随规划数据一起送出，补没写的衣着时用）。 */
export function buildContinuityEntries({ records = [], presentCharacters = [], maxEntries = DEFAULT_MAX_ENTRIES } = {}) {
    const characters = Array.isArray(presentCharacters) ? presentCharacters : [];
    const knownNames = knownNamesOf(characters, createContinuityNameResolver(characters));
    return buildContinuityFromImageRecords(records, { knownNames, characters, maxEntries }).entries;
}

/**
 * 展示给规划 LLM 的 costume 去掉已经在固定外貌里的词：记忆里存的是原样，这里只改展示，
 * 免得 LLM 看到记忆里重复的词又原样抄回来（它会被告知“这里的 costume 就是本图的起点”）。
 * 只对已录入角色（有固定外貌）生效；去完为空表示只剩固定外貌里的东西，按“没有衣服”展示。
 */
function withoutFixedLook(entry, characters) {
    const fixed = findEnabledCharacterForm(entry?.name, entry?.form, characters)?.appearance;
    if (!fixed || !entry.costume) return entry;
    const costume = removeDuplicateTags(entry.costume, fixed);
    return costume === entry.costume ? entry : { ...entry, costume };
}

/**
 * 规划前调用：由宿主注入过滤后的图片记录，选出本楼相关锚点并渲染成区块。
 */
export function buildContinuityBlockForRequest({
    records = [],
    presentCharacters = [],
    bodyText = '',
    maxEntries = DEFAULT_MAX_ENTRIES,
} = {}) {
    const characters = Array.isArray(presentCharacters) ? presentCharacters : [];
    // 已录入角色的名字集合含正式名称：多形态角色在清单里是“名称（形态名）”，记忆里存的是正式名称，别名在正文里出现也算在场。
    const knownNames = knownNamesOf(characters, createContinuityNameResolver(characters));
    const state = buildContinuityFromImageRecords(records, { knownNames, characters, maxEntries });
    // Filter after reconstruction: an unavailable latest form must not revive an older outfit.
    const selected = selectContinuityEntries(state.entries, {
        knownNames,
        bodyText: String(bodyText || ''),
    }).filter(entry => !entry.form || characters.some(character => (
        lowerKey(character.baseName ?? character.name) === lowerKey(entry.name)
        && lowerKey(character.formName) === lowerKey(entry.form)
    )));
    return buildContinuityBlock(selected.map(entry => withoutFixedLook(entry, characters)), { knownNames });
}

/**
 * 看模型原始提交的参数：每张图的每个角色有没有写 costume 这个字段（没写或 null 算没写，写了空字符串不算）。
 * 返回 [图片][角色] 的布尔表；参数解析不了就返回 null（那就不补，和以前一样）。
 */
export function findOmittedCostumes(rawArguments) {
    let args = rawArguments;
    if (typeof args === 'string') {
        try { args = JSON.parse(args); } catch { return null; }
    }
    if (!args || typeof args !== 'object' || !Array.isArray(args.images)) return null;
    return args.images.map(image => (Array.isArray(image?.characters)
        ? image.characters.map(char => !char || typeof char !== 'object' || !Object.hasOwn(char, 'costume') || char.costume === null)
        : []));
}

/** 去掉 costume 里被模型照抄的“（空＝没穿）”提示文字，以及留下的首尾逗号/空格。 */
export function stripEmptyCostumeText(value) {
    const text = String(value || '');
    if (!text.includes(EMPTY_COSTUME_TEXT)) return text;
    // 衣着文字最终只保留 MAX_TAG_LENGTH 以内；先截断，空白很长的异常输入不会拖慢下面的正则。
    return text.split(EMPTY_COSTUME_TEXT).join('').slice(0, MAX_TAG_LENGTH * 4)
        .replace(/\s*[,，、]\s*(?:[,，、]\s*)+/g, ', ')
        .replace(/^[\s,，、]+|[\s,，、]+$/g, '');
}

function stripEmptyCostumeTextFromTasks(tasks) {
    if (!Array.isArray(tasks)) return tasks;
    const mapped = tasks.map((task) => {
        if (!Array.isArray(task?.chars)) return task;
        let changed = false;
        const chars = task.chars.map((char) => {
            if (typeof char?.costume !== 'string' || !char.costume.includes(EMPTY_COSTUME_TEXT)) return char;
            changed = true;
            return { ...char, costume: stripEmptyCostumeText(char.costume) };
        });
        return changed ? { ...task, chars } : task;
    });
    return mapped.every((task, index) => task === tasks[index]) ? tasks : mapped;
}

/**
 * 规划返回后调用：模型整个没写 costume 字段的角色（omitted 里标出），沿用记忆里的衣着；
 * 写了空字符串的不动（空＝没穿）。按图片顺序处理，同一份计划里后一张图沿用前一张图写的。
 * 没有记忆（新角色）、或形态和记忆里的不同，就不补（和以前一样），但给这个角色打上 costumeOmitted: true，
 * 存下来之后重放记忆时跳过它，不会把“没写”当成“没穿”。记忆里没有形态（旧图没记形态、手改时形态留空）
 * 不算“不同”：那时无从比较，和记忆块里“形态相同就沿用”的说法保持一致，照常沿用。
 * 返回新数组，不改入参。
 * 无论 omitted 是否可用，都先去掉模型照抄进 costume 的“（空＝没穿）”提示文字。
 */
export function fillOmittedCostumes(tasks, { records = [], entries: knownEntries = null, presentCharacters = [], maxEntries = DEFAULT_MAX_ENTRIES, omitted = null } = {}) {
    const cleaned = stripEmptyCostumeTextFromTasks(tasks);
    if (!Array.isArray(omitted)) return cleaned;
    const characters = Array.isArray(presentCharacters) ? presentCharacters : [];
    const resolver = createContinuityNameResolver(characters);
    const knownNames = knownNamesOf(characters, resolver);
    // entries：页面已经算好的记忆（随规划数据送到后台），没有就从图片记录重建。
    let entries = Array.isArray(knownEntries)
        ? normalizeContinuity({ version: CONTINUITY_VERSION, entries: knownEntries }).entries
        : buildContinuityFromImageRecords(records, { knownNames, characters, maxEntries }).entries;
    return (Array.isArray(cleaned) ? cleaned : []).map((task) => {
        const chars = (Array.isArray(task?.chars) ? task.chars : []).map((char, charIndex) => {
            if (!omitted[task.index - 1]?.[charIndex]) return char;
            const key = lowerKey(resolver.canonicalName(char.name));
            const entry = key ? entries.find(item => lowerKey(item.name) === key) : null;
            const form = sanitizeForm(char.form);
            // 记忆里没有形态时无从比较（旧图没记形态、手改时形态留空），按同一形态沿用。
            return entry && (!entry.form || entry.form === form) ? { ...char, costume: entry.costume } : { ...char, costumeOmitted: true };
        });
        entries = mergePlanIntoContinuity(entries, [{ chars }], { knownNames, resolver, maxEntries }).entries;
        return { ...task, chars };
    });
}

export function continuityAfterTagEdit(record, characterPrompts) {
    const previous = record?.characterPrompts || [];
    return (record?.continuityChars || []).map((char, index) => {
        if (previous[index]?.prompt === characterPrompts[index]?.prompt) return char;
        // 编辑过这个角色的提示词（清空或改写都一样）：这张图里他的衣着不再可信，
        // 所以这张图不贡献他的记忆，但不动他更早楼层的记忆。
        // action 键必须带上：没有 action 又没有别的内容的快照会被当成旧版本的撤销快照而删掉记忆。
        return { name: char.name, costume: '', costumeOmitted: true, tagEdited: true, action: '' };
    });
}

// ── 用户对记忆的手动修改（按聊天保存的覆盖层）─────────────────────────────
// 记忆仍由图片记录重建；用户的改动只是一条条“插在某个楼层之后”的快照：
// at = 修改时已有图片的最大楼层 + 1，所以只对之后新画的图生效，之后画出的新图仍然会盖过它。

/**
 * 整理手动修改：脏数据一律丢弃；同一角色（按正式名）后写的替换先写的；最多 MAX_EDITS 条（留最新的）。
 * 传入 resolver 时名字先统一成角色库的正式名称。
 */
export function normalizeContinuityEdits(raw, { resolver = createContinuityNameResolver([]) } = {}) {
    const map = new Map();
    for (const item of Array.isArray(raw) ? raw : []) {
        if (!item || typeof item !== 'object' || typeof item.name !== 'string') continue;
        const name = resolver.canonicalName(item.name);
        if (!name) continue;
        const key = lowerKey(name);
        map.delete(key);
        map.set(key, {
            name,
            form: sanitizeForm(item.form),
            appear: sanitizeTags(item.appear),
            costume: sanitizeTags(item.costume),
            at: Math.max(0, Math.floor(Number(item.at) || 0)),
            ...(item.removed === true ? { removed: true } : {}),
        });
    }
    return [...map.values()].slice(-MAX_EDITS);
}

/** 新的修改应该插在哪：已有图片的最大楼层 + 1（没有图片时为 0）。 */
export function nextContinuityEditPosition(records) {
    const ids = (Array.isArray(records) ? records : []).map(record => Number(record?.messageId)).filter(Number.isFinite);
    return ids.length ? Math.max(...ids) + 1 : 0;
}

/**
 * 增删改一条修改：op 为 set（整条替换该角色的记忆）/ remove（让该角色的记忆消失）/ reset（清空全部修改）。
 * 其它 op 或空名字不改动。
 */
export function updateContinuityEdits(edits, { op, name, form, appear, costume, at } = {}, { resolver } = {}) {
    if (op === 'reset') return [];
    const current = normalizeContinuityEdits(edits, { resolver });
    if (op !== 'set' && op !== 'remove') return current;
    return normalizeContinuityEdits([...current, { name, form, appear, costume, at, removed: op === 'remove' }], { resolver });
}

/**
 * 把修改作为快照记录插进图片记录：排在所有 messageId < at 的真实记录之后、其余记录之前。
 * at > beforeMessageId 的修改（还没轮到的楼层）忽略。修改是一张“最近的图”：set 整条覆盖该角色，remove 让该角色的记忆消失；清空衣着再保存就是没穿。
 * 返回新数组，不改入参。
 */
export function applyContinuityEdits(records, edits, { beforeMessageId = Infinity } = {}) {
    const real = Array.isArray(records) ? records : [];
    const list = normalizeContinuityEdits(edits).filter(edit => edit.at <= beforeMessageId);
    if (!list.length) return real;
    const merged = [...real];
    list.forEach((edit, index) => {
        const at = merged.findIndex(record => Number(record?.messageId) >= edit.at);
        const position = at < 0 ? merged.length : at;
        const previous = merged[position - 1];
        merged.splice(position, 0, {
            messageId: edit.at - 0.5,
            timestamp: (Number(previous?.timestamp) || 0) + 0.0001 * (index + 1),
            // 快照没有 action 键：edited 标记让它不被当成旧版撤销快照，空 costume 仍是“没穿”。
            continuityChars: [edit.removed
                ? { name: edit.name, revoked: true }
                : { name: edit.name, form: edit.form, appear: edit.appear, costume: edit.costume, edited: true }],
        });
    });
    return merged;
}

/**
 * 给界面用的记忆清单：图片记录 + 手动修改重建后的每个角色一行，最近出现的在最前（越接近最新楼层越靠上，手动修改视为刚发生）。
 * characters 是角色库展开后的全部角色（用来把别名统一成正式名并判断是否已录入）；edited 表示这一行现在的值来自手动修改（条目上的 edited 标记，被之后的真实图覆盖就没了）。
 */
export function buildContinuityMemoryView(records, edits, { characters = [], beforeMessageId = Infinity, maxEntries = DEFAULT_MAX_ENTRIES } = {}) {
    const resolver = createContinuityNameResolver(characters);
    const merged = applyContinuityEdits(records, normalizeContinuityEdits(edits, { resolver }), { beforeMessageId });
    const state = buildContinuityFromImageRecords(merged, { knownNames: [...resolver.known], characters, maxEntries });
    return [...state.entries].reverse().map(entry => ({
        name: entry.name,
        form: entry.form || '',
        appear: entry.appear || '',
        costume: entry.costume || '',
        known: resolver.known.has(lowerKey(entry.name)),
        edited: entry.edited === true,
        floor: Number.isInteger(entry.floor) ? entry.floor : null,
    }));
}
