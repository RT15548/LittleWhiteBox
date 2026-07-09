import { buildSeedLabelId, isSeedLabelId } from './map-state-seed';
import type { TavernMapDocument, TavernMapElement, TavernMapElementCategory } from './structured-state';

export const TAVERN_MAP_MOODS = [
    'neutral',
    'warm',
    'cold',
    'dark',
    'mystic',
    'danger',
    'calm',
] as const;

export const TAVERN_MAP_MATERIALS = [
    'unknown',
    'wood',
    'stone',
    'tile',
    'carpet',
    'bed-sheet',
    'fabric',
    'tatami',
    'sand',
    'marble',
    'blood',
    'water',
    'grass',
    'dirt',
    'snow',
    'metal',
    'rune',
    'warm-light',
    'cold-light',
    'shadow',
] as const;

export const TAVERN_MAP_CERTAINTIES = [
    'confirmed',
    'inferred',
    'unknown',
] as const;

export type TavernMapMood = typeof TAVERN_MAP_MOODS[number];
export type TavernMapMaterial = typeof TAVERN_MAP_MATERIALS[number];
export type TavernMapCertainty = typeof TAVERN_MAP_CERTAINTIES[number];

export interface TavernMapMaterialEntry {
    paint: string;
    blend?: 'normal' | 'multiply' | 'screen' | 'overlay';
    layer: 'fill' | 'light';
    opacity?: number;
}

const MOOD_SET = new Set<string>(TAVERN_MAP_MOODS);
const MATERIAL_SET = new Set<string>(TAVERN_MAP_MATERIALS);
const CERTAINTY_SET = new Set<string>(TAVERN_MAP_CERTAINTIES);

export function compareMapStableText(left: unknown, right: unknown): number {
    const leftText = String(left || '');
    const rightText = String(right || '');
    if (leftText < rightText) {return -1;}
    if (leftText > rightText) {return 1;}
    return 0;
}

export function isTavernMapMood(value: unknown): value is TavernMapMood {
    return MOOD_SET.has(String(value || '').trim());
}

export function isTavernMapMaterial(value: unknown): value is TavernMapMaterial {
    return MATERIAL_SET.has(String(value || '').trim());
}

export function isTavernMapCertainty(value: unknown): value is TavernMapCertainty {
    return CERTAINTY_SET.has(String(value || '').trim());
}

export function materialEntry(material: unknown): TavernMapMaterialEntry | null {
    const key = String(material || '').trim() as TavernMapMaterial;
    const entries: Partial<Record<TavernMapMaterial, TavernMapMaterialEntry>> = {
        wood: { paint: 'url(#mat-wood)', blend: 'normal', layer: 'fill' },
        stone: { paint: 'url(#mat-stone)', blend: 'normal', layer: 'fill' },
        tile: { paint: 'url(#mat-tile)', blend: 'normal', layer: 'fill' },
        carpet: { paint: 'url(#mat-carpet)', blend: 'normal', layer: 'fill' },
        'bed-sheet': { paint: 'url(#mat-bed-sheet)', blend: 'normal', layer: 'fill' },
        fabric: { paint: 'url(#mat-fabric)', blend: 'normal', layer: 'fill' },
        tatami: { paint: 'url(#mat-tatami)', blend: 'normal', layer: 'fill' },
        sand: { paint: 'url(#mat-sand)', blend: 'normal', layer: 'fill' },
        marble: { paint: 'url(#mat-marble)', blend: 'normal', layer: 'fill' },
        blood: { paint: 'url(#mat-blood)', blend: 'multiply', layer: 'fill', opacity: 0.85 },
        water: { paint: 'url(#mat-water)', blend: 'normal', layer: 'fill', opacity: 0.9 },
        grass: { paint: 'url(#mat-grass)', blend: 'normal', layer: 'fill' },
        dirt: { paint: 'url(#mat-dirt)', blend: 'normal', layer: 'fill' },
        snow: { paint: 'url(#mat-snow)', blend: 'normal', layer: 'fill' },
        metal: { paint: 'url(#mat-metal)', blend: 'normal', layer: 'fill' },
        rune: { paint: 'url(#mat-rune)', blend: 'screen', layer: 'fill', opacity: 0.8 },
        'warm-light': { paint: 'url(#grad-warm)', blend: 'screen', layer: 'light', opacity: 0.7 },
        'cold-light': { paint: 'url(#grad-cold)', blend: 'screen', layer: 'light', opacity: 0.6 },
        shadow: { paint: '#000', blend: 'multiply', layer: 'light', opacity: 0.5 },
    };
    return entries[key] || null;
}

export function zOf(cat: unknown, material?: unknown): number {
    const category = String(cat || '').trim();
    const entry = materialEntry(material);
    if (entry?.layer === 'light') {return 80;}
    if (category === 'terrain') {return 10;}
    if (category === 'water') {return 20;}
    if (category === 'road') {return 30;}
    if (category === 'furniture' || category === 'decoration') {return 40;}
    if (category === 'danger' || category === 'secret') {return 50;}
    if (category === 'magic') {return 60;}
    return 90;
}

export function canMapElementUseAreaFill(cat: unknown): boolean {
    return !['wall', 'grid', 'label', 'actor', 'marker'].includes(String(cat || '').trim());
}

function roundValue(value: unknown): unknown {
    if (typeof value === 'number') {return Number(value.toFixed(4));}
    if (Array.isArray(value)) {return value.map(roundValue);}
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .sort(([left], [right]) => compareMapStableText(left, right))
                .map(([key, item]) => [key, roundValue(item)]),
        );
    }
    return value;
}

function semanticElementShape(element: TavernMapElement): Record<string, unknown> {
    const next: Record<string, unknown> = {};
    ([
        'at',
        'rect',
        'circle',
        'path',
        'curve',
        'shape',
        'icon',
        'closed',
    ] as const).forEach((key) => {
        if (element[key] !== undefined) {next[key] = roundValue(element[key]);}
    });
    return next;
}

export function semanticFingerprint(document: TavernMapDocument): unknown {
    const labelsByBaseId = new Map<string, TavernMapElement>();
    document.elements.forEach((element) => {
        if (!isSeedLabelId(element.id)) {return;}
        const baseId = element.id.slice(buildSeedLabelId('').length);
        if (baseId) {labelsByBaseId.set(baseId, element);}
    });
    const elements = document.elements
        .filter((element) => !isSeedLabelId(element.id))
        .map((element) => {
            const label = labelsByBaseId.get(element.id);
            const next: Record<string, unknown> = {
                id: element.id,
                cat: element.cat,
                ...semanticElementShape(element),
            };
            if (element.material) {next.material = element.material;}
            if (element.certainty) {next.certainty = element.certainty;}
            if (element.actorKey) {next.actorKey = element.actorKey;}
            if (element.kind) {next.kind = element.kind;}
            if (element.fill) {next.fill = element.fill;}
            if (element.style) {next.style = roundValue(element.style);}
            if (element.text) {next.text = element.text;}
            if (label?.at) {next.labelAt = roundValue(label.at);}
            if (label?.text) {next.labelText = label.text;}
            if (label?.style) {next.labelStyle = roundValue(label.style);}
            return roundValue(next);
        })
        .sort((left, right) => compareMapStableText((left as { id?: unknown }).id, (right as { id?: unknown }).id));
    return roundValue({
        meta: {
            name: document.meta.name ?? null,
            mood: document.meta.mood || 'neutral',
            viewBox: document.meta.viewBox,
            theme: document.meta.theme,
            status: document.meta.status,
            hint: document.meta.hint,
        },
        elements,
    });
}

export function canMapElementHaveDerivedLabel(cat: TavernMapElementCategory | string): boolean {
    return !['terrain', 'light', 'grid', 'label'].includes(String(cat || '').trim());
}
