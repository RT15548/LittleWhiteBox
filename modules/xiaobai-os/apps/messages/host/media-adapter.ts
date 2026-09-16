import type { PrivateMessage } from '../../../domains/messages/types.js';
import type { SharedImageProgress } from '../../../../draw/shared/generated-image-runtime.js';

interface DrawFacade {
    getStatus(): { enabled?: boolean; ready?: boolean };
    checkGeneratedImageCache(options: { prompt: string; cacheNamespace: string }): Promise<unknown>;
    generateSharedImage(options: { prompt: string; cacheNamespace: string; signal: AbortSignal; onProgress: SharedImageProgress }): Promise<string>;
}
interface TtsFacade {
    isEnabled(): boolean;
    playTransient(text: string, emotion: string, options: { requestId: string; onState: (state: string) => void }): { stop?: () => void };
}

export function createMessagesMedia(getFacades = () => window as Window & { xiaobaixDraw?: DrawFacade; xiaobaixTts?: TtsFacade }) {
    const images = new Map<string, AbortController>();
    let voice: { stop?: () => void } | null = null;
    let voiceState: ((state: string) => void) | null = null;
    let voiceToken = 0;
    function capabilities() {
        let image = false; let voice = false;
        try {const draw = getFacades().xiaobaixDraw?.getStatus(); image = draw?.enabled === true && draw.ready === true;} catch { /* Optional media must not take down the APP. */ }
        try {voice = getFacades().xiaobaixTts?.isEnabled() === true;} catch { /* The transcript remains available. */ }
        return { image, voice };
    }
    function imageData(value: unknown): string | null {
        if (typeof value !== 'string') {return null;}
        const source = value.trim();
        if (/^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=\r\n]+$/u.test(source)) {return source;}
        // The draw runtime returns bare Base64 for PNG, and a data URL for other raster formats.
        return /^[A-Za-z0-9+/\r\n]+={0,2}$/u.test(source) ? `data:image/png;base64,${source}` : null;
    }
    async function image(message: PrivateMessage, options: { requestId: string; onProgress?: SharedImageProgress }): Promise<string | null> {
        if (message.payload.type !== 'image') {throw new Error('messages_not_image');}
        if (message.payload.attachment) {return message.payload.attachment.path;}
        const draw = getFacades().xiaobaixDraw;
        if (!draw || !capabilities().image) {return null;}
        const prompt = message.payload.generationPrompt || message.payload.description;
        const request = { prompt, cacheNamespace: 'os-messages' };
        if (images.has(options.requestId)) {throw new Error('messages_image_busy');}
        const controller = new AbortController(); images.set(options.requestId, controller);
        try {
            const cached = await draw.checkGeneratedImageCache(request);
            if (controller.signal.aborted) {throw new Error('messages_media_cancelled');}
            const cachedData = imageData(cached);
            if (cachedData) {return cachedData;}
            options.onProgress?.('generating');
            const result = await draw.generateSharedImage({ ...request, signal: controller.signal,
                onProgress(status, ahead, delay) {if (!controller.signal.aborted) {options.onProgress?.(status, ahead, delay);}},
            });
            if (controller.signal.aborted) {throw new Error('messages_media_cancelled');}
            const data = imageData(result);
            if (!data) {throw new Error('messages_image_invalid');}
            return data;
        } finally {if (images.get(options.requestId) === controller) {images.delete(options.requestId);}}
    }
    function cancelImage(requestId: string) {
        images.get(requestId)?.abort(); images.delete(requestId);
    }
    function stop() {
        voiceToken++;
        const previous = voice; const notify = voiceState;
        voice = null; voiceState = null;
        try {previous?.stop?.();} finally {notify?.('stopped');}
    }
    function play(message: PrivateMessage, onState: (state: string) => void): void {
        if (message.payload.type !== 'voice') {throw new Error('messages_not_voice');}
        stop();
        const tts = getFacades().xiaobaixTts;
        if (!tts || !capabilities().voice) {throw new Error('messages_voice_unavailable');}
        const token = voiceToken;
        voiceState = onState;
        voice = tts.playTransient(message.payload.transcript, message.payload.emotion ?? '', {
            requestId: `messages:${message.id}`, onState(state) {if (token === voiceToken) {onState(state);}},
        });
    }
    function cancelAll() {images.forEach(controller => controller.abort()); images.clear(); stop();}
    return { capabilities, image, cancelImage, play, stop, cancelAll };
}

export type MessagesMedia = ReturnType<typeof createMessagesMedia>;
