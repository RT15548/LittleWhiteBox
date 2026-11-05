export type DrawProvider = 'novelai' | 'sdwebui' | 'comfyui';
export interface CharacterPrompt { prompt?: string; uc?: string; center?: { x: number; y: number } }
export interface DrawProgress { state: string; ahead?: number; position?: number }
export interface DrawRequestBase {
    provider?: DrawProvider;
    apiPresetId?: string;
    paramsPresetId?: string;
    prompt: string;
    negativePrompt?: string;
    positivePrefix?: string;
    characterPrompts?: CharacterPrompt[];
    overrideSize?: string;
    signal?: AbortSignal;
    onProgress?: (progress: DrawProgress) => void;
}
export interface NovelParams {
    model?: string; sampler?: string; scheduler?: string; steps?: number; scale?: number;
    width?: number; height?: number; seed?: number; qualityToggle?: boolean; autoSmea?: boolean;
    ucPreset?: number; cfg_rescale?: number; variety_boost?: boolean;
    sm?: boolean; sm_dyn?: boolean; decrisper?: boolean;
    v5QualityPresetId?: 'standard' | 'light' | 'none';
    v5UcPresetId?: 'heavy' | 'light' | 'furryFocus' | 'humanFocus' | 'none';
    transparentBackground?: boolean;
}
export interface SdParams {
    model?: string; sampler_name?: string; width?: number; height?: number; steps?: number; cfg_scale?: number;
    seed?: number; batch_size?: number; n_iter?: number; restore_faces?: boolean; tiling?: boolean;
    enable_hr?: boolean; hr_scale?: number; hr_upscaler?: string; denoising_strength?: number;
    clip_skip?: number; positivePrefix?: string; negativePrefix?: string;
}
export interface ComfyParams {
    model?: string; sampler?: string; scheduler?: string; steps?: number; cfg?: number;
    width?: number; height?: number; positivePrefix?: string; negativePrefix?: string;
}
export interface ComfyWorkflow {
    json?: string; nodePositive?: string; nodeNegative?: string;
    nodeWidth?: string; nodeHeight?: string; nodeSeed?: string; nodeSaveImage?: string;
}
export type DrawRequest = DrawRequestBase & (
    { provider?: 'novelai'; params?: NovelParams }
    | { provider?: 'sdwebui'; params?: SdParams }
    | { provider?: 'comfyui'; params?: ComfyParams; seed?: number; workflowPresetId?: string;
        workflowMode?: 'simple' | 'custom'; customWorkflow?: ComfyWorkflow }
);
export interface DrawResult { images: Blob[] }
export interface PresetSummary { id: string; name: string; selected: boolean }
export interface DrawPresets { provider: DrawProvider; api: PresetSummary[]; params: PresetSummary[]; workflows: PresetSummary[] }
export interface DrawApi {
    /** Also collects received images in the starting character/group's local gallery. */
    generate(request: DrawRequest): Promise<DrawResult>;
    getPresets(options?: { provider?: DrawProvider }): Promise<DrawPresets>;
    getStatus(): { provider: DrawProvider | 'disabled'; enabled: boolean; ready: boolean };
}
export interface DrawApiError extends Error {
    code: string; field?: string; status?: number; partialResult?: DrawResult;
}
