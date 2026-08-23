// 小白 X 画图正文槽位的唯一语法定义。调用方需要独立 RegExp，避免共享 global lastIndex。
export const DRAW_IMAGE_SLOT_PATTERN = String.raw`\[image\s*:\s*([a-z0-9_-]+)\]`;

export function createDrawImageSlotRegex(flags = 'gi') {
    return new RegExp(DRAW_IMAGE_SLOT_PATTERN, flags);
}

export function stripDrawImageSlots(sourceText) {
    return String(sourceText ?? '').replace(createDrawImageSlotRegex(), '');
}
