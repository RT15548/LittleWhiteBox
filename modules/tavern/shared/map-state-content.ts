import type { TavernMapDocument, TavernMapElement } from './structured-state';

export function hasSpatialMapContent(elements: TavernMapElement[] = []): boolean {
    return elements.some((element) => (
        !!element.rect
        || typeof element.circle === 'number'
        || Array.isArray(element.path)
        || Array.isArray(element.curve)
        || element.shape === 'icon'
        || !!element.icon
    ));
}

export function isRenderableMapDocument(document: TavernMapDocument | null | undefined): boolean {
    if (!document) {return false;}
    return document.meta.status === 'active' && hasSpatialMapContent(document.elements);
}
