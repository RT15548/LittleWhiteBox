export const MAP_PIXEL_RATIO_LIMIT = 1.8;
export function mapPixelRatio(): number { return Math.min(window.devicePixelRatio || 1, MAP_PIXEL_RATIO_LIMIT); }
