import { getContext } from '../../../../../../extensions.js';
import { saveChatDebounced } from '../../../../../../../script.js';

// Chat text belongs to the host. Drawing's durable receipt is its local job
// journal, not a second save/readback protocol around the entire chat file.
export function requestDrawChatSave(ctx) {
    const live = getContext();
    if (live?.chat === ctx?.chat && live?.chatId === ctx?.chatId) saveChatDebounced();
}
