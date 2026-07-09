import {
    canonicalMaterialSymbolName,
    isMaterialSymbolName,
    normalizeMaterialSymbolName,
    type MaterialSymbolName,
} from './material-symbols';

export {
    canonicalMaterialSymbolName,
    isMaterialSymbolName,
    normalizeMaterialSymbolName,
};

export type StatusMaterialSymbolFallbackKind = 'subject' | 'item' | 'ui';

export const STATUS_MATERIAL_SYMBOL_FALLBACKS: Record<StatusMaterialSymbolFallbackKind, MaterialSymbolName> = {
    subject: 'person',
    item: 'inventory_2',
    ui: 'badge',
};

export function resolveStatusIconName(value: unknown, fallbackKind: StatusMaterialSymbolFallbackKind = 'item'): MaterialSymbolName {
    return canonicalMaterialSymbolName(value) || STATUS_MATERIAL_SYMBOL_FALLBACKS[fallbackKind];
}
