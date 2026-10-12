import type { MapIconToken } from '../../../domains/map/types.js';

// Local silhouettes are shared by 2D footprints and 2D/3D identity markers.
// Paths use a 0..24 viewBox and require no downloaded font or bitmap.
export const ORGANIC_SYMBOLS = {
    vine: { label: '藤蔓', path: 'M5 22C19 17 4 8 17 2M9 17C2 18 2 11 3 10C9 10 11 13 9 17ZM11 11C18 12 21 7 20 5C13 5 11 7 11 11Z' },
    root: { label: '根', path: 'M11 2H15L13 10L19 14L22 22L16 16L11 14L6 21L2 22L8 12Z' },
    tentacle: { label: '触手', path: 'M3 22C3 10 16 16 17 9C18 4 12 2 11 7C8 4 11 1 15 2C23 4 22 14 14 16C8 18 12 21 12 22Z' },
    pipe: { label: '管道', path: 'M2 17H10V5H22V10H15V22H2ZM18 3H22V12H18M2 15V24' },
    mushroom: { label: '菌菇', path: 'M10 13H14L16 22H8ZM2 12C2 0 22 0 22 12Q12 16 2 12ZM7 9H9M14 7H16' },
    crystal: { label: '晶体', path: 'M12 1L18 7L16 20L12 23L8 20L6 7ZM12 1V23M6 7L12 11L18 7M2 11L6 13L8 20L4 19ZM22 11L18 13L16 20L20 19Z' },
    slime: { label: '史莱姆', path: 'M2 18C3 14 5 13 6 8C7 1 17 1 18 8C19 13 22 13 22 18C22 23 2 23 2 18ZM8 13V15M16 13V15' },
    dragon: { label: '龙', path: 'M12 20L9 15L2 17L4 10L1 4L9 8L11 12V6L9 3L13 4L16 2L15 7L14 12L17 8L23 4L20 11L22 17L15 15L14 20L18 23Z' },
    dwarf: { label: '矮人', path: 'M5 10C4 0 20 0 19 10ZM4 12L8 14L12 12L16 14L20 12L18 19L12 23L6 19ZM8 8H9M15 8H16' },
    elf: { label: '精灵', path: 'M7 6Q12 0 17 6L17 10L23 7L19 15L16 15L15 20L12 23L9 20L8 15L5 15L1 7L7 10ZM9 11H10M14 11H15' },
} as const satisfies Partial<Record<MapIconToken, { label: string; path: string }>>;

export function organicSymbol(icon?: MapIconToken) {
    return icon && Object.hasOwn(ORGANIC_SYMBOLS, icon) ? ORGANIC_SYMBOLS[icon as keyof typeof ORGANIC_SYMBOLS] : undefined;
}
