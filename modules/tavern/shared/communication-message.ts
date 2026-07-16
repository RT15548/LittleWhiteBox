import type {
    TavernCommunicationMessagePayload,
    TavernCommunicationMessageRecord,
} from './session-db';

function normalizeText(value: unknown, limit: number): string {
    return String(value || '').replace(/\r\n?/g, '\n').trim().slice(0, limit);
}

function normalizeInlineText(value: unknown, limit: number): string {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

export function normalizeTavernCommunicationMessagePayload(
    value: unknown,
): TavernCommunicationMessagePayload | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {return null;}
    const source = value as Record<string, unknown>;
    if (source.type === 'text') {
        const text = normalizeText(source.text, 4000);
        return text ? { type: 'text', text } : null;
    }
    if (source.type === 'voice') {
        const transcript = normalizeText(source.transcript, 4000);
        const emotion = normalizeInlineText(source.emotion, 80);
        return transcript ? {
            type: 'voice',
            transcript,
            ...(emotion ? { emotion } : {}),
        } : null;
    }
    if (source.type === 'image') {
        const description = normalizeText(source.description, 1200);
        const generationPrompt = normalizeText(source.generationPrompt, 2000);
        const assetRef = normalizeInlineText(source.assetRef, 512);
        return description ? {
            type: 'image',
            description,
            ...(generationPrompt ? { generationPrompt } : {}),
            ...(assetRef ? { assetRef } : {}),
        } : null;
    }
    return null;
}

export function tavernCommunicationPayloadText(payload: TavernCommunicationMessagePayload): string {
    if (payload.type === 'text') {return payload.text;}
    if (payload.type === 'voice') {return payload.transcript;}
    return payload.description;
}

export function tavernCommunicationPayloadFingerprint(payload: TavernCommunicationMessagePayload): string {
    return JSON.stringify(payload);
}

export function tavernCommunicationPayloadTypeLabel(payload: TavernCommunicationMessagePayload): '文字' | '语音' | '图片' {
    if (payload.type === 'voice') {return '语音';}
    if (payload.type === 'image') {return '图片';}
    return '文字';
}

export function tavernCommunicationMessageSearchText(message: TavernCommunicationMessageRecord): string {
    const payload = message.payload;
    return [
        tavernCommunicationPayloadTypeLabel(payload),
        tavernCommunicationPayloadText(payload),
        payload.type === 'voice' ? payload.emotion || '' : '',
        payload.type === 'image' ? payload.generationPrompt || '' : '',
    ].filter(Boolean).join('\n');
}

export function tavernCommunicationMessagePreviewText(message: TavernCommunicationMessageRecord): string {
    if (message.payload.type === 'voice') {return `[语音] ${message.payload.transcript}`;}
    if (message.payload.type === 'image') {return `[图片] ${message.payload.description}`;}
    return message.payload.text;
}
