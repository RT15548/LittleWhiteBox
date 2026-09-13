export interface MessageImageAttachment { path: string; name: string }

export const MESSAGE_IMAGE_FOLDER = 'xb-os-messages';
export const MESSAGE_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;
export const MAX_MESSAGE_IMAGE_BYTES = 4 * 1024 * 1024;

/** Only images in this APP's host-owned album may be loaded from a message. */
export function parseImageAttachment(value: unknown): MessageImageAttachment {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {throw new Error('messages_invalid_image');}
    const item = value as Record<string, unknown>;
    if (Object.keys(item).some(key => key !== 'path' && key !== 'name')
        || typeof item.path !== 'string' || !/^\/user\/images\/xb-os-messages\/[a-f0-9]{64}\.(?:png|jpeg|webp|gif)$/u.test(item.path)
        || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 120
        || /[\u0000-\u001f\u007f]/u.test(item.name)) {throw new Error('messages_invalid_image');}
    return { path: item.path, name: item.name };
}
