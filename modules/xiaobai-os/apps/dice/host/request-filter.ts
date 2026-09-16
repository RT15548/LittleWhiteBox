import { CHECK_MARKER_PATTERN } from '../domain/check-marker.js';

interface TextPart { text?: string; [key: string]: unknown }
interface PromptMessage { content?: string | TextPart[] | null; [key: string]: unknown }
export interface DiceGenerationData {
    prompt?: string | PromptMessage[];
    input?: string;
    negative_prompt?: string;
}

function stripMarkers(text: string): string {
    return text.replace(new RegExp(CHECK_MARKER_PATTERN, 'g'), '');
}

/**
 * ST 1.14+ GENERATE_AFTER_DATA runs after the native continuation prefix is captured.
 * Only replace outgoing context values here; filtering coreChat earlier also changes the saved continuation.
 */
export function filterDiceGenerationData(data: DiceGenerationData): void {
    if (typeof data.input === 'string') { data.input = stripMarkers(data.input); }
    if (typeof data.negative_prompt === 'string') { data.negative_prompt = stripMarkers(data.negative_prompt); }
    if (typeof data.prompt === 'string') {
        data.prompt = stripMarkers(data.prompt);
    } else if (Array.isArray(data.prompt)) {
        data.prompt = data.prompt.map(message => {
            if (typeof message.content === 'string') {
                return { ...message, content: stripMarkers(message.content) };
            }
            if (Array.isArray(message.content)) {
                return { ...message, content: message.content.map(part => typeof part.text === 'string'
                    ? { ...part, text: stripMarkers(part.text) } : part) };
            }
            return message;
        });
    }
}
