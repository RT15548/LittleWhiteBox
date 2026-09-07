import type { ImageUpload } from '../application/image-upload.js';

export interface MessageDraft { text: string; image: ImageUpload | null }
export const emptyDraft = (): MessageDraft => ({ text: '', image: null });
