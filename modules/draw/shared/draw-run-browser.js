import { submitProviderDrawRun as submit } from './draw-run-production.js';
import { getImageChatIdentity } from './chat-image-persistence.js';
import { requestDrawChatSave } from './draw-chat-save.js';

export function submitProviderDrawRun(options) {
    return submit({ ...options, owner: getImageChatIdentity(options.ctx), requestSave: requestDrawChatSave });
}
