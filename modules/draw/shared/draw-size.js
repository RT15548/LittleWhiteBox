// Current SD WebUI / ComfyUI override range and NovelAI's fixed size presets.
export const DRAW_DIMENSION_BOUNDS = Object.freeze([64, 2048]);
export const NOVEL_FIXED_DRAW_SIZES = Object.freeze(['832x1216', '1216x832', '1024x1024', '768x1280', '1280x768']);
export function isBoundedDrawSize(value) {
    const match = typeof value === 'string' && value.match(/^(\d+)x(\d+)$/i);
    return !!match && match.slice(1).every(item => Number(item) >= DRAW_DIMENSION_BOUNDS[0] && Number(item) <= DRAW_DIMENSION_BOUNDS[1]);
}
export function isNovelFixedDrawSize(value) {
    return typeof value === 'string' && NOVEL_FIXED_DRAW_SIZES.includes(value.trim().toLowerCase());
}
