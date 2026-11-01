export interface TtsOptions {
    speaker?: string; resourceId?: string; model?: string; uid?: string;
    format?: 'mp3' | 'wav' | 'pcm' | 'ogg_opus' | 'opus'; sampleRate?: number;
    speed?: number; speechRate?: number; loudnessRate?: number;
    emotion?: string; emotionScale?: number; contextTexts?: string[];
    language?: string; explicitLanguage?: string;
    disableMarkdownFilter?: boolean; disableEmojiFilter?: boolean; enableLanguageDetector?: boolean;
    maxLengthToFilterParenthesis?: number; postProcessPitch?: number;
    cacheConfig?: { text_type?: number; use_cache?: boolean }; signal?: AbortSignal;
    onProgress?: (progress: { state: 'generating' | 'receiving' | 'cached' | 'complete'; receivedBytes?: number }) => void;
}
export interface TtsVoice { id: string; name: string; source: 'free' | 'auth'; available: boolean }
export interface TtsApi {
    synthesize(text: string, options?: TtsOptions): Promise<Blob>;
    getVoices(): { voices: TtsVoice[]; defaultVoice: string };
    isEnabled(): boolean;
}
