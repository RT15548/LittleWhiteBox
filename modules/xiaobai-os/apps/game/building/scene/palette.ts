import { MASCOT_COLORS } from '../../../../brand/mascot/design.js';

/** Milk-coloured surfaces follow Xiaobai; house accents come from the house catalogue. */
export const PALETTE = {
    milk: Number.parseInt(MASCOT_COLORS.fur.slice(1), 16), porcelain: 0xffffff, stone: 0xe2e5db, mint: 0xb9d8cd,
    timber: 0xdbb892, brass: 0xc39966, steel: 0x6b8791, glass: 0x83b8c7,
    windowLight: 0xffdf9e, leaves: 0x8eafa0, rose: 0xe8b9b2,
    sky: 0xc9e5ef, horizon: 0xf2f7f5, cloud: 0xfbfdfb, distantCloud: 0xe1eef0,
    safe: 0x569a8a, risk: 0xd88065,
} as const;
