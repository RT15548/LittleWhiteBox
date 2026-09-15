// Model output boundary. No store mutation; temporary references live only here.
import { sanitizeCharacterAliasUpdates } from '../data/character-aliases.js';
import { EVENT_MEMORY_ROLES } from '../data/events.js';

const FACT_PREDICATE_ALIASES = new Map([
    ['当前位置', '位置'], ['当前所在地', '位置'], ['所在位置', '位置'],
    ['所在地', '位置'], ['当前状态', '状态'],
]);
const RELATION_TRENDS = ['破裂', '厌恶', '反感', '陌生', '投缘', '亲密', '交融'];

function invalid(path, reason) {
    throw new Error(`${path}：${reason}`);
}

function object(value, path) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(path, '须为对象');
    return value;
}

function text(value, path, allowEmpty = false) {
    if (typeof value !== 'string' || (!allowEmpty && !value.trim())) invalid(path, '须为有效文本');
    return value.trim();
}

function array(value, path) {
    if (!Array.isArray(value)) invalid(path, '须为数组');
    return value;
}

function optionalArray(value, path) {
    return value === undefined ? [] : array(value, path);
}

function names(value, path) {
    return array(value, path).map((name, i) => text(name, `${path}[${i}]`));
}

export function getNextEventId(existingEvents = []) {
    let maxId = 0;
    for (const event of existingEvents) {
        const match = typeof event?.id === 'string' && event.id.match(/^evt-(\d+)$/);
        if (match) maxId = Math.max(maxId, Number(match[1]));
    }
    return maxId + 1;
}

function eventSummary(value, path, startFloor, endFloor) {
    const summary = text(value, path);
    const ranges = [...summary.matchAll(/\(#(\d+)(?:-(\d+))?\)/g)];
    const range = ranges[0];
    // Retrieval reads the first marker; generation requires one unambiguous suffix.
    if (ranges.length !== 1 || range.index + range[0].length !== summary.length) {
        invalid(path, '须以唯一的来源楼层标注 (#X-Y) 或 (#X) 结尾');
    }
    if (!summary.slice(0, range.index).trim()) invalid(path, '楼层标注前须有正文');
    const start = Number(range[1]);
    const end = Number(range[2] ?? range[1]);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)
        || start < startFloor || end > endFloor || start > end) {
        invalid(path, `来源楼层须按顺序落在本批 #${startFloor}-#${endFloor} 内`);
    }
    return summary;
}

function resolveCauses(value, path, selfId, existingIds, newIds) {
    const refs = names(optionalArray(value, path), path);
    const resolved = refs.map((ref, i) => {
        const position = ref.match(/^new-([1-9]\d*)$/);
        const id = position ? newIds[Number(position[1]) - 1]
            : /^evt-\d+$/.test(ref) && existingIds.has(ref) ? ref : undefined;
        if (!id) invalid(`${path}[${i}]`, `引用 ${ref} 不存在；旧事件使用真实 evt-N，本批使用 new-N`);
        if (id === selfId) invalid(`${path}[${i}]`, '事件不能引用自身为前因');
        return id;
    });
    const unique = [...new Set(resolved)];
    if (unique.length > 2) invalid(path, '直接前因最多为 2 个');
    return unique;
}

function prepareArc(update, path) {
    object(update, path);
    const name = text(update.name, `${path}.name`);
    const trajectory = text(update.trajectory, `${path}.trajectory`);
    if (typeof update.progress !== 'number' || !Number.isFinite(update.progress)
        || update.progress < 0 || update.progress > 1) {
        invalid(`${path}.progress`, '须为 0 到 1 之间的数字');
    }
    return {
        name, trajectory, progress: update.progress,
        ...(update.newMoment === undefined ? {} : { newMoment: text(update.newMoment, `${path}.newMoment`, true) }),
    };
}

function prepareFact(update, path) {
    object(update, path);
    const s = text(update.s, `${path}.s`);
    const predicate = text(update.p, `${path}.p`);
    const p = FACT_PREDICATE_ALIASES.get(predicate) || predicate;
    if (update.retracted !== undefined && typeof update.retracted !== 'boolean') {
        invalid(`${path}.retracted`, '须为布尔值');
    }
    if (update.retracted === true) return { s, p, retracted: true };
    const o = text(update.o, `${path}.o`);
    if (typeof update.isState !== 'boolean') invalid(`${path}.isState`, '须为布尔值');
    const fact = { s, p, o, isState: update.isState };
    if (/^对.+的看法$/.test(p) || /^与.+的关系$/.test(p)) {
        if (!RELATION_TRENDS.includes(update.trend)) invalid(`${path}.trend`, '须为规定的关系趋势');
        fact.trend = update.trend;
    }
    return fact;
}

/** Validate and project one generated batch before any merge or persistence. */
export function prepareSummaryResult(parsed, { existingEvents = [], startFloor, endFloor }) {
    object(parsed, 'summary');
    const rawEvents = array(parsed.events, 'events');
    const nextId = getNextEventId(existingEvents);
    if (rawEvents.length && (!Number.isSafeInteger(nextId)
        || rawEvents.length - 1 > Number.MAX_SAFE_INTEGER - nextId)) {
        invalid('events', '事件编号超出安全整数范围');
    }
    const newIds = rawEvents.map((_, i) => `evt-${nextId + i}`);
    const existingIds = new Set(existingEvents.map(event => event.id));
    const events = rawEvents.map((event, i) => {
        const path = `events[${i}]`;
        object(event, path);
        const memoryRole = event.memoryRole === undefined ? '' : text(event.memoryRole, `${path}.memoryRole`, true);
        if (memoryRole && !EVENT_MEMORY_ROLES.includes(memoryRole)) invalid(`${path}.memoryRole`, '须为规定的记忆类型');
        return {
            id: newIds[i],
            title: text(event.title, `${path}.title`),
            summary: eventSummary(event.summary, `${path}.summary`, startFloor, endFloor),
            ...(event.timeLabel === undefined ? {} : { timeLabel: text(event.timeLabel, `${path}.timeLabel`, true) }),
            participants: names(optionalArray(event.participants, `${path}.participants`), `${path}.participants`),
            memoryRole,
            causedBy: resolveCauses(event.causedBy, `${path}.causedBy`, newIds[i], existingIds, newIds),
        };
    });
    const arcUpdates = optionalArray(parsed.arcUpdates, 'arcUpdates').map((update, i) => prepareArc(update, `arcUpdates[${i}]`));
    const factUpdates = optionalArray(parsed.factUpdates, 'factUpdates').map((update, i) => prepareFact(update, `factUpdates[${i}]`));
    const keywords = optionalArray(parsed.keywords, 'keywords').map((keyword, i) => {
        const path = `keywords[${i}]`;
        object(keyword, path);
        if (!['核心', '重要', '一般'].includes(keyword.weight)) invalid(`${path}.weight`, '须为核心、重要或一般');
        return { text: text(keyword.text, `${path}.text`), weight: keyword.weight };
    });
    const newCharacters = names(optionalArray(parsed.newCharacters, 'newCharacters'), 'newCharacters');
    const aliasUpdates = optionalArray(parsed.characterAliasUpdates, 'characterAliasUpdates').map((update, i) => {
        const path = `characterAliasUpdates[${i}]`;
        object(update, path);
        const from = names(update.from, `${path}.from`);
        if (!from.length) invalid(`${path}.from`, '须包含旧称呼');
        return { to: text(update.to, `${path}.to`), from, evidence: text(update.evidence, `${path}.evidence`) };
    });
    return {
        events, arcUpdates, factUpdates, keywords, newCharacters,
        characterAliasUpdates: sanitizeCharacterAliasUpdates(aliasUpdates),
    };
}
