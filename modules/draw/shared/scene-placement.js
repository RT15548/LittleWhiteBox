import { hashSceneSource } from './scene-source.js';

export class ScenePlacementError extends Error {
    constructor(message, code = 'SCENE_PLACEMENT_INVALID') {
        super(message);
        this.name = 'ScenePlacementError';
        this.code = code;
    }
}

export function assertSceneSourceUnchanged(sourceText, expectedHash) {
    const actualHash = hashSceneSource(sourceText);
    if (!expectedHash || actualHash !== expectedHash) {
        throw new ScenePlacementError('正文已在场景规划后发生变化，已拒绝写入图片占位符。', 'SCENE_SOURCE_CHANGED');
    }
    return actualHash;
}

function resolvePlacementOffset(sourceText, placement, sourceHash) {
    if (placement?.mode === 'tail') return sourceText.length;
    if (placement?.mode !== 'source') {
        throw new ScenePlacementError('图片任务缺少有效 placement。');
    }
    if (placement.sourceHash !== sourceHash) {
        throw new ScenePlacementError('图片任务不属于当前正文。', 'SCENE_SOURCE_CHANGED');
    }
    const offset = Number(placement.offset);
    if (!Number.isInteger(offset) || offset < 0 || offset > sourceText.length) {
        throw new ScenePlacementError('图片任务包含无效正文 offset。');
    }
    return offset;
}

function wrapBlockContent(source, offset, content) {
    let wrapped = content;
    if (offset > 0 && source[offset - 1] !== '\n') wrapped = `\n${wrapped}`;
    if (offset < source.length && source[offset] !== '\n') wrapped = `${wrapped}\n`;
    return wrapped;
}

function escapeRegex(value) {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SCENE_SLOT_REGEX = /\[image\s*:\s*([a-z0-9\-_]+)\]/gi;

export function getSceneSlotIds(sourceText) {
    const ids = [];
    const regex = new RegExp(SCENE_SLOT_REGEX.source, 'gi');
    let match;
    while ((match = regex.exec(String(sourceText ?? ''))) !== null) ids.push(match[1]);
    return [...new Set(ids)];
}

export function setActiveMessageText(message, text) {
    const value = String(text ?? '');
    if (!message || typeof message !== 'object') return value;
    message.mes = value;
    const swipe = Number(message.swipe_id);
    if (Array.isArray(message.swipes) && Number.isInteger(swipe) && swipe >= 0 && swipe < message.swipes.length) {
        message.swipes[swipe] = value;
    }
    return value;
}

// 交付前必须逐槽位确认它还在正文里。用户删掉的槽位是他对这张图的最终意见，
// 交付流程重建它就是在跟用户对抗——刷新后的接回流程尤其容易犯这个错，
// 因为它手里的恢复记录是提交那一刻的事实，不知道用户后来删过什么。
export function isSceneSlotAlive(currentText, slotId) {
    const id = String(slotId || '').trim();
    if (!id) return false;
    return new RegExp(`\\[image\\s*:\\s*${escapeRegex(id)}\\]`, 'i').test(String(currentText ?? ''));
}

export function removeSceneSlotPlaceholders(sourceText, slotIds = [], markerName = 'image') {
    const ids = new Set((Array.isArray(slotIds) ? slotIds : [])
        .map((slotId) => String(slotId || '').trim())
        .filter(Boolean));
    if (!ids.size) return String(sourceText ?? '');
    const marker = escapeRegex(markerName);
    const idPattern = [...ids].map(escapeRegex).join('|');
    const regex = new RegExp(`(\\n?)\\[${marker}\\s*:\\s*(?:${idPattern})\\](\\n?)`, 'gi');
    return String(sourceText ?? '').replace(
        regex,
        (_match, before, after) => (before && after ? '\n' : ''),
    );
}

// 后台任务提交前唯一允许写入占位符的入口。CAS 本身保持同步；保存失败时只移除本批槽位，
// 因而不会覆盖保存等待期间发生的用户编辑或其它任务写入。
export async function commitRecoverableScenePlacements({
    getCurrentChatId,
    getCurrentMessage,
    expectedChatId,
    messageId,
    message,
    originalText,
    plannedText,
    slotIds,
    isEditing = () => false,
    persist,
    syncAfterRollback,
} = {}) {
    if (getCurrentChatId?.() !== expectedChatId) return false;
    if (getCurrentMessage?.(messageId) !== message) return false;
    if (isEditing(messageId)) return false;
    if (message?.mes !== originalText) return false;

    setActiveMessageText(message, plannedText);
    try {
        await persist?.();
        return true;
    } catch (error) {
        setActiveMessageText(message, removeSceneSlotPlaceholders(message.mes, slotIds));
        try {
            await syncAfterRollback?.(message.mes);
        } catch (syncError) {
            console.warn('[ScenePlacement] 占位符保存失败后的界面同步未完成:', syncError);
        }
        throw error;
    }
}

export async function commitSceneSlotReplacement({
    message,
    stagedText,
    replacedSlotIds = [],
    persist,
} = {}) {
    setActiveMessageText(message, stagedText);
    await persist?.();

    const replacementText = removeSceneSlotPlaceholders(message?.mes, replacedSlotIds);
    if (replacementText === message?.mes) return replacementText;
    setActiveMessageText(message, replacementText);
    try {
        await persist?.();
        return replacementText;
    } catch (error) {
        // 第二次保存结果未知。内存退回“旧图 + 新图”这一安全超集，绝不因响应丢失而抹掉旧图。
        if (message?.mes === replacementText) setActiveMessageText(message, stagedText);
        throw error;
    }
}

// 三家 provider 共用的槽位交付顺序。后台链路在每个持久化步骤前都通过 guard 续租；
// 用户在任一步期间删除槽位时，只回滚本次刚写入的事实，不重建槽位。
export async function commitSceneSlotDelivery({
    committedEarly,
    resolveTarget,
    guard = async () => {},
    persist,
    rollbackPersisted,
    select,
    rollbackSelection,
} = {}) {
    const getTarget = () => committedEarly ? resolveTarget?.() : null;
    await guard();
    let target = getTarget();
    if (committedEarly && !target) return false;
    await persist(target);
    await guard();
    target = getTarget();
    if (committedEarly && !target) {
        await rollbackPersisted?.();
        return false;
    }
    if (typeof select !== 'function') return true;

    await select();
    await guard();
    target = getTarget();
    if (committedEarly && !target) {
        await rollbackSelection?.();
        await guard();
        await rollbackPersisted?.();
        return false;
    }
    return true;
}

// 本地链路的排版提交：占位符不提前落盘，而是在生成结束时一次性写入正文，
// 所以这里的基准必然是规划文本，只把「什么结果都没有」的槽位剔掉。
//
// 刻意不接受原始正文快照：旧实现在「一张都没成功」时整段回写 originalText，会连带抹掉
// 用户在生成期间做的任何编辑。真正需要表达的只是「没有结果的槽位不要写进去」，
// 一张都没成功时把全部槽位剔掉自然就得到接近原文的结果，不需要回滚这个动作。
//
// 这不是结算。后台链路的占位符在提交前就已经持久化，它的结算发生在当前活着的正文上，
// 用的是 removeSceneSlotPlaceholders，基准绝不能是任何快照。
export function commitSettledScenePlacements(plannedText, { allSlotIds = [], settledSlotIds = [] } = {}) {
    const settled = new Set((Array.isArray(settledSlotIds) ? settledSlotIds : [])
        .map((slotId) => String(slotId || '').trim())
        .filter(Boolean));
    const unsettled = (Array.isArray(allSlotIds) ? allSlotIds : [])
        .filter((slotId) => !settled.has(String(slotId || '').trim()));
    return removeSceneSlotPlaceholders(plannedText, unsettled);
}

export function insertScenePlacements(sourceText, insertions = [], options = {}) {
    const source = String(sourceText ?? '');
    const sourceHash = hashSceneSource(source);
    const ordered = (Array.isArray(insertions) ? insertions : []).map((insertion, order) => {
        const offset = resolvePlacementOffset(source, insertion?.placement, sourceHash);
        const content = String(insertion?.content ?? '');
        return {
            content: options.block ? wrapBlockContent(source, offset, content) : content,
            offset,
            order,
        };
    }).sort((left, right) => right.offset - left.offset || right.order - left.order);

    let result = source;
    for (const insertion of ordered) {
        result = `${result.slice(0, insertion.offset)}${insertion.content}${result.slice(insertion.offset)}`;
    }
    return result;
}

// 新一批占位符先与旧图片槽位共存。旧槽位只有在整批结果完成并成功保存后才会删除，
// 因而保存响应丢失或生成中断都不会先把用户原有图片从持久正文中抹掉。
export function insertScenePlacementsPreservingSlots(sourceText, insertions = [], options = {}) {
    const source = String(sourceText ?? '');
    const markerRanges = [];
    const regex = new RegExp(SCENE_SLOT_REGEX.source, 'gi');
    let match;
    while ((match = regex.exec(source)) !== null) {
        markerRanges.push({ start: match.index, end: match.index + match[0].length });
    }
    if (markerRanges.length === 0) return insertScenePlacements(source, insertions, options);

    const cleanSource = source.replace(new RegExp(SCENE_SLOT_REGEX.source, 'gi'), '');
    const sourceHash = hashSceneSource(cleanSource);
    const mapOffset = (cleanOffset) => {
        let removedLength = 0;
        for (const range of markerRanges) {
            const cleanRangeStart = range.start - removedLength;
            if (cleanOffset <= cleanRangeStart) return cleanOffset + removedLength;
            removedLength += range.end - range.start;
        }
        return cleanOffset + removedLength;
    };
    const ordered = (Array.isArray(insertions) ? insertions : []).map((insertion, order) => {
        const cleanOffset = resolvePlacementOffset(cleanSource, insertion?.placement, sourceHash);
        const content = String(insertion?.content ?? '');
        return {
            content: options.block ? wrapBlockContent(cleanSource, cleanOffset, content) : content,
            offset: mapOffset(cleanOffset),
            order,
        };
    }).sort((left, right) => right.offset - left.offset || right.order - left.order);

    let result = source;
    for (const insertion of ordered) {
        result = `${result.slice(0, insertion.offset)}${insertion.content}${result.slice(insertion.offset)}`;
    }
    return result;
}
