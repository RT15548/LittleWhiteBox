export const RENDER_BUDGET = { maxPixels: 1600000, maxDpr: 2, shadow: 1024 } as const;
export function pixelRatio(width: number, height: number, device: number): number {
    return Math.min(device, RENDER_BUDGET.maxDpr, Math.sqrt(RENDER_BUDGET.maxPixels / Math.max(1, width * height)));
}
