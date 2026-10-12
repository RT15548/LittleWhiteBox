import { stripDrawImageSlots } from '../../../draw/shared/image-marker-syntax.js';
import { parseChatImageTags } from '../../../draw/shared/chat-message-image-markup.js';
import { CHECK_MARKER_PATTERN } from '../../../xiaobai-os/apps/dice/domain/check-marker-syntax.js';
import { createTtsDirectiveRegex, replaceMessageVoiceMarkers } from '../../../tts/tts-message-markup.js';

// Functional markup is not story content. Keep spoken words, and leave unknown
// bracket syntax alone. Image requests use draw's parser (including exclusions).
export function projectMessageProse(value) {
    let text = String(value ?? '');
    for (const tag of parseChatImageTags(text).reverse()) {
        text = text.slice(0, tag.start) + text.slice(tag.end);
    }
    text = stripDrawImageSlots(text).replace(new RegExp(CHECK_MARKER_PATTERN, 'g'), '')
        .replace(createTtsDirectiveRegex(), '');
    text = replaceMessageVoiceMarkers(text, spoken => spoken);
    // Whitespace is part of the saved Embedding input. Only remove the owned
    // markup; normalizing unrelated prose would invalidate existing packages.
    return text;
}
