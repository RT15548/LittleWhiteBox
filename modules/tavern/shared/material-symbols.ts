import { MATERIAL_SYMBOL_NAMES, type MaterialSymbolName } from './material-symbols-names';

const MATERIAL_SYMBOL_NAME_SET = new Set<string>(MATERIAL_SYMBOL_NAMES);

export type { MaterialSymbolName };

export function normalizeMaterialSymbolName(value: unknown): string {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-z0-9_]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

export function canonicalMaterialSymbolName(value: unknown): MaterialSymbolName | '' {
    const name = normalizeMaterialSymbolName(value);
    if (MATERIAL_SYMBOL_NAME_SET.has(name)) {return name as MaterialSymbolName;}
    return '';
}

export function isMaterialSymbolName(value: unknown): value is MaterialSymbolName {
    return !!canonicalMaterialSymbolName(value);
}
