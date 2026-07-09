import { substituteParams } from '../../../../../../../script.js';
import type {
    TavernSubstituteParamsItem,
    TavernSubstituteParamsOptions,
    TavernSubstituteParamsResult,
} from '../shared/substitute-params';

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
    return String(value || '');
}

function normalizeOptions(value: unknown): TavernSubstituteParamsOptions {
    const source = asRecord(value);
    const options: TavernSubstituteParamsOptions = {};
    const name1Override = text(source.name1Override).trim();
    const name2Override = text(source.name2Override).trim();
    if (name1Override) {options.name1Override = name1Override;}
    if (name2Override) {options.name2Override = name2Override;}
    if (source.original !== undefined) {options.original = text(source.original);}
    if (source.replaceCharacterCard !== undefined) {options.replaceCharacterCard = source.replaceCharacterCard !== false;}
    return options;
}

export function applyTavernSubstituteParams(input: unknown): TavernSubstituteParamsResult {
    const source = asRecord(input);
    const rawItems = Array.isArray(source.items) ? source.items : [];
    let changedCount = 0;
    const items = rawItems.map((rawItem, index) => {
        const item = asRecord(rawItem) as unknown as TavernSubstituteParamsItem;
        const id = text(item.id).trim() || `item-${index}`;
        const original = text(item.text);
        const textValue = substituteParams(original, normalizeOptions(item.options) as Record<string, unknown>);
        const changed = textValue !== original;
        if (changed) {changedCount += 1;}
        return {
            id,
            text: textValue,
            changed,
        };
    });
    return {
        items,
        changedCount,
    };
}
