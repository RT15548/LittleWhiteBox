import {
    MAX_MAP_COORDINATE,
    MAX_MAP_DIMENSION,
    MAX_MAP_ID_LENGTH,
    MAX_MAP_NAME_LENGTH,
    MAX_MAP_POINTS,
    parseMapDomain,
} from '../../../domains/map/invariants.js';
import { applyMapDomainEdits, type MapDomainEdit } from '../../../domains/map/edit.js';
import type { MapDomainV1 } from '../../../domains/map/types.js';

export interface AppliedIntentEdits {
    readonly domain: MapDomainV1;
    readonly changed: boolean;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function intentText(value: unknown, fallback = '', maximum = MAX_MAP_NAME_LENGTH): string {
    if (typeof value !== 'string') {return fallback;}
    const normalized = value
        .normalize('NFKC')
        .replace(/[\u0000-\u001f\u007f-\u009f]/gu, ' ')
        .replace(/\s+/gu, ' ')
        .trim();
    return normalized && Array.from(normalized).length <= maximum ? normalized : fallback;
}

export function intentId(value: unknown, fallback = ''): string {
    const id = intentText(value, fallback, MAX_MAP_ID_LENGTH);
    return ['__proto__', 'constructor', 'prototype'].includes(id) ? fallback : id;
}

export function finiteNumber(value: unknown): number | null {
    const result = typeof value === 'number' ? value : Number.NaN;
    return Number.isFinite(result) && Math.abs(result) <= MAX_MAP_COORDINATE ? result : null;
}

export function positiveNumber(value: unknown): number | null {
    const result = typeof value === 'number' ? value : Number.NaN;
    return Number.isFinite(result) && result > 0 && result <= MAX_MAP_DIMENSION ? result : null;
}

export function point(value: unknown): [number, number] | null {
    if (!Array.isArray(value) || value.length !== 2) {return null;}
    const x = finiteNumber(value[0]);
    const y = finiteNumber(value[1]);
    return x === null || y === null ? null : [x, y];
}

export function positivePair(value: unknown): [number, number] | null {
    if (!Array.isArray(value) || value.length !== 2) {return null;}
    const width = positiveNumber(value[0]);
    const height = positiveNumber(value[1]);
    return width === null || height === null ? null : [width, height];
}

export function points(value: unknown): Array<[number, number]> | null {
    if (!Array.isArray(value) || value.length < 2 || value.length > MAX_MAP_POINTS) {return null;}
    const result = value.map(point);
    return result.every((entry): entry is [number, number] => entry !== null) ? result : null;
}

export function enumToken<T extends string>(value: unknown, allowed: readonly T[]): T | null {
    const token = String(value || '').trim().toLowerCase() as T;
    return allowed.includes(token) ? token : null;
}

export function applyIntentEdits(
    current: MapDomainV1,
    edits: readonly MapDomainEdit[],
): AppliedIntentEdits {
    if (!edits.length) {return { domain: current, changed: false };}
    const next = applyMapDomainEdits(current, edits);
    const changed = next.revision !== current.revision;
    return {
        domain: parseMapDomain({ ...next, revision: current.revision }),
        changed,
    };
}

export function errorText(error: unknown): string {
    return error instanceof Error ? error.message : String(error || 'map_intent_failed');
}
