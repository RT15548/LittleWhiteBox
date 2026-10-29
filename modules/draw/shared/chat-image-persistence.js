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
    return owner ? { owner, sourceHash: hashSceneSource(source), swipeIndex, task: { ...task }, order } : null;
}
