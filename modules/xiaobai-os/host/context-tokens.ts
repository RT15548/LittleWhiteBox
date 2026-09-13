import { getRequestHeaders } from '../../../../../../../script.js';
import { resolveConversationTokens } from '../../agent-core/runtime/context-tokens.js';

export function countHostContextTokens(options: Parameters<typeof resolveConversationTokens>[0]): ReturnType<typeof resolveConversationTokens> {
    return resolveConversationTokens({ ...options, requestHeaders: getRequestHeaders });
}
