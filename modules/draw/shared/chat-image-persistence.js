import { getCurrentUserHandle } from '../../../../../../user.js';
import { getChatIdentity } from './chat-identity.js';
import { hashSceneSource } from './scene-source.js';

export function getImageChatIdentity(ctx) {
    const chat = getChatIdentity(ctx);
    return chat === null ? null : JSON.stringify([getCurrentUserHandle(), chat]);
}

// 图位写进正文后由酒馆自己的自动保存落盘。保存前关了页面，重新打开时正文还是放图位之前的原文，
// 按这条记录（原文指纹 + 位置）把图位放回去，不重画。用户编辑删掉图位时才清除。
export function captureImagePlacement(owner, source, swipeIndex, task, order) {
    return owner ? { owner, sourceHash: hashSceneSource(source), sourceLength: source.length, swipeIndex, task: { ...task }, order } : null;
}

// Released placements lack a length and still match their exact original text.
// New receipts identify the unchanged prefix, so appending a continuation does
// not revoke a paid image's original location. Editing that prefix still does.
export function imagePlacementSource(text, placement) {
    const length = Number.isSafeInteger(placement?.sourceLength) ? placement.sourceLength : text.length;
    const prefix = text.slice(0, length);
    return hashSceneSource(prefix) === placement?.sourceHash ? prefix : null;
}
