import type { TavernMapDocument, TavernMapDocumentMeta, TavernMapElement, TavernMapElementPatchSet, TavernMapStyle } from './structured-state';

type MapShapeKey = 'rect' | 'circle' | 'path' | 'curve' | 'icon' | 'text';

const MAP_SHAPE_KEYS: MapShapeKey[] = ['rect', 'circle', 'path', 'curve', 'icon', 'text'];

function cloneJson<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function mergeMapRecord(target: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
    const next = { ...target };
    Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            delete next[key];
            return;
        }
        if (isPlainObject(value) && isPlainObject(next[key])) {
            next[key] = mergeMapRecord(next[key] as Record<string, unknown>, value);
            return;
        }
        next[key] = cloneJson(value);
    });
    return next;
}

function shapeKeysFromPartial(value: TavernMapElementPatchSet): MapShapeKey[] {
    return MAP_SHAPE_KEYS.filter((key) => {
        if (key === 'icon' && value.shape === 'icon') {return true;}
        if (key === 'icon') {return false;}
        if (key === 'circle') {return typeof value.circle === 'number';}
        if (key === 'text') {return typeof value.text === 'string' && !!value.text.trim();}
        return Array.isArray(value[key]) || (typeof value[key] === 'string' && !!value[key]);
    });
}

function isIconShapeElement(element: Partial<TavernMapElement>): boolean {
    if (element.shape === 'icon') {return true;}
    if (!element.icon) {return false;}
    return !element.rect
        && typeof element.circle !== 'number'
        && !element.path
        && !element.curve
        && !element.text;
}

function mergeStyle(base: TavernMapStyle | undefined, set: TavernMapStyle | null | undefined): TavernMapStyle | undefined {
    if (set === null) {return undefined;}
    if (set === undefined) {return base ? cloneJson(base) : undefined;}
    return Object.keys(set).length ? { ...(base || {}), ...set } : undefined;
}

export function mergeMapElementPatch(current: TavernMapElement, set: TavernMapElementPatchSet): TavernMapElement {
    const shapeReplacement = shapeKeysFromPartial(set).length > 0;
    const currentIconShape = isIconShapeElement(current);
    const next: Partial<TavernMapElement> = cloneJson(current);
    if (shapeReplacement) {
        MAP_SHAPE_KEYS.forEach((key) => { delete next[key]; });
        delete next.shape;
        delete next.style;
        delete next.fill;
        delete next.closed;
    }
    Object.entries(set).forEach(([key, value]) => {
        if (key === 'style') {return;}
        if (key === 'icon' && !shapeReplacement && !currentIconShape) {
            delete next.icon;
            return;
        }
        if (value === null || value === undefined) {
            delete next[key as keyof TavernMapElement];
            return;
        }
        next[key as keyof TavernMapElement] = cloneJson(value) as never;
    });
    if ('style' in set) {
        const nextStyle = shapeReplacement
            ? (set.style === null || set.style === undefined ? undefined : cloneJson(set.style))
            : mergeStyle(current.style, set.style);
        if (nextStyle === undefined) {
            delete next.style;
        } else {
            next.style = nextStyle;
        }
    }
    return next as TavernMapElement;
}

export function applyTrustedMapPatchOps(
    source: TavernMapDocument,
    ops: Array<Record<string, unknown>>,
): TavernMapDocument {
    let document = cloneJson(source);
    ops.forEach((op) => {
        const opName = String(op.op || '').trim();
        if (opName === 'meta') {
            const set = op.set && isPlainObject(op.set)
                ? op.set
                : op.changes && isPlainObject(op.changes)
                    ? op.changes
                    : null;
            if (set) {
                document.meta = mergeMapRecord(
                    document.meta as unknown as Record<string, unknown>,
                    set,
                ) as unknown as TavernMapDocumentMeta;
                if (document.meta.status !== 'uninitialized') {
                    delete document.meta.hint;
                }
            }
            return;
        }
        if (opName === 'add') {
            const element = op.element;
            if (!element || !isPlainObject(element) || typeof element.id !== 'string') {return;}
            const nextElement = cloneJson(element as unknown as TavernMapElement);
            const index = document.elements.findIndex((item) => item.id === nextElement.id);
            if (index >= 0) {
                document.elements[index] = nextElement;
                return;
            }
            document.elements.push(nextElement);
            return;
        }
        if (opName === 'remove') {
            const id = String(op.id || '').trim();
            if (!id) {return;}
            document.elements = document.elements.filter((item) => item.id !== id);
            return;
        }
        if (opName === 'modify') {
            const id = String(op.id || '').trim();
            const set = op.set && isPlainObject(op.set)
                ? op.set
                : op.changes && isPlainObject(op.changes)
                    ? op.changes
                    : null;
            if (!id || !set) {return;}
            document.elements = document.elements.map((element) => element.id === id
                ? mergeMapElementPatch(element, set as TavernMapElementPatchSet)
                : element);
            return;
        }
        if (opName === 'init' || opName === 'reset') {
            const next = op.document;
            if (next && isPlainObject(next)) {
                document = cloneJson(next as unknown as TavernMapDocument);
            }
            return;
        }
        if (opName === 'replace') {
            const id = String(op.id || '').trim();
            const element = op.element;
            if (!id || !element || !isPlainObject(element)) {return;}
            document.elements = document.elements.map((item) => item.id === id ? cloneJson(element as unknown as TavernMapElement) : item);
        }
    });
    return document;
}
