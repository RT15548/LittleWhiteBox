import { fault } from './random.js';
export function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value)) { fault('invalid'); } return value as Record<string, unknown>; }
export function integer(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number { if (!Number.isSafeInteger(value) || Number(value) < min || Number(value) > max) { fault('invalid'); } return value as number; }
export function finite(value: unknown, min: number, max: number): number { if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) { fault('invalid'); } return value; }
export function member<T extends string>(value: unknown, items: readonly T[]): T { if (typeof value !== 'string' || !items.includes(value as T)) { fault('invalid'); } return value as T; }
export function list<T>(value: unknown, max: number, parse: (v: unknown) => T): T[] { if (!Array.isArray(value) || value.length > max) { fault('invalid'); } return value.map(parse); }
export function unique<T>(values: T[]): T[] { if (new Set(values).size !== values.length) { fault('invalid'); } return values; }
// Effects and targets can extend beyond the walkable map. Actor walkability belongs to the scene boundary.
export function point(raw: unknown) { const p = object(raw); finite(p.x, -Number.MAX_VALUE, Number.MAX_VALUE); finite(p.y, -Number.MAX_VALUE, Number.MAX_VALUE); return p; }
export function boolean(value: unknown): asserts value is boolean { if (typeof value !== 'boolean') { fault('invalid'); } }
export function expeditionId(value: unknown): string { if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(value)) { fault('identity'); } return value; }
