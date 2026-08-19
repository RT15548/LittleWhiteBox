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
