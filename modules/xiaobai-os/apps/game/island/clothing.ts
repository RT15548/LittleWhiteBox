import type { ItemKind } from './model.js';

export type GarmentShape = 'shirt' | 'trousers' | 'inner-top' | 'inner-shorts' | 'lifejacket' | 'shoes' | 'wraps';
export type WearSlot = 'vest' | 'upper' | 'lower' | 'upper_inner' | 'lower_inner' | 'feet';
// Hex values are sRGB; tuples are linear RGB, matching the approved sample's materials.
export type GarmentColor = `#${string}` | readonly [number, number, number];
export interface GarmentSpec {
    name: string;
    shape: GarmentShape;
    slot: WearSlot;
    hemMetres: number;
    color: GarmentColor;
    dryRoughness: number;
    kilograms: number;
    fabricUnits: number;
    footProtection: number;
}

// Weights, fabric yields and contact heights are authored game tuning, not medical data.
// Shape is also the sample GLB garment_id for the four approved Ye styles.
const definitions = {
    lifejacket: { name: '救生衣', shape: 'lifejacket', slot: 'vest', hemMetres: 1, color: '#e48b44', dryRoughness: .94, kilograms: .5, fabricUnits: 0, footProtection: 0 },
    shirt: { name: '衬衫', shape: 'shirt', slot: 'upper', hemMetres: .75, color: '#dcebf0', dryRoughness: .94, kilograms: .2, fabricUnits: 2, footProtection: 0 },
    trousers: { name: '长裤', shape: 'trousers', slot: 'lower', hemMetres: .07, color: '#526c77', dryRoughness: .94, kilograms: .4, fabricUnits: 3, footProtection: 0 },
    shoes: { name: '鞋', shape: 'shoes', slot: 'feet', hemMetres: .025, color: '#485151', dryRoughness: .94, kilograms: .7, fabricUnits: 0, footProtection: 1 },
    wraps: { name: '足部包裹', shape: 'wraps', slot: 'feet', hemMetres: .025, color: '#ded6c2', dryRoughness: .94, kilograms: .2, fabricUnits: 0, footProtection: .6 },
    ivory_blouse: { name: '象牙白上衣', shape: 'shirt', slot: 'upper', hemMetres: .75, color: [.74, .71, .65], dryRoughness: .82, kilograms: .2, fabricUnits: 2, footProtection: 0 },
    charcoal_trousers: { name: '炭灰长裤', shape: 'trousers', slot: 'lower', hemMetres: .07, color: [.021, .025, .029], dryRoughness: .76, kilograms: .4, fabricUnits: 3, footProtection: 0 },
    inner_top: { name: '内搭', shape: 'inner-top', slot: 'upper_inner', hemMetres: .9, color: [.105, .118, .115], dryRoughness: .9, kilograms: .1, fabricUnits: 1, footProtection: 0 },
    inner_shorts: { name: '内裤', shape: 'inner-shorts', slot: 'lower_inner', hemMetres: .68, color: [.105, .118, .115], dryRoughness: .9, kilograms: .06, fabricUnits: .5, footProtection: 0 },
} satisfies Partial<Record<ItemKind, GarmentSpec>>;

export type GarmentKind = keyof typeof definitions;
export const GARMENTS: Readonly<Record<GarmentKind, GarmentSpec>> & Readonly<Partial<Record<ItemKind, GarmentSpec>>> = definitions;
export const GARMENT_KINDS = Object.keys(definitions) as GarmentKind[];
