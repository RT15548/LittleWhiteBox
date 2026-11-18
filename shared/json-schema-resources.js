// Index schema positions, never literal data in enum/default/examples. Resolution is
// document-local: external resources are left for the original-schema description.
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const MAPS = new Set(['properties', 'patternProperties', '$defs', 'definitions', 'dependentSchemas', 'dependencies']);
const LISTS = new Set(['allOf', 'anyOf', 'oneOf', 'prefixItems']);
const VALUES = new Set(['items', 'additionalProperties', 'additionalItems', 'contains', 'propertyNames',
    'unevaluatedProperties', 'unevaluatedItems', 'not', 'if', 'then', 'else']);
const pointer = key => key.replace(/~/g, '~0').replace(/\//g, '~1');
const absolute = (ref, base) => new URL(ref, base).href.replace(/#$/, '');

export function indexSchemaResources(schema) {
    const paths = new Map(), names = new Map(), nodes = new Map();
    function visit(value, path, inherited) {
        if (!object(value) && typeof value !== 'boolean') return;
        const base = typeof value?.$id === 'string' ? absolute(value.$id, inherited) : inherited;
        const entry = { schema: value, path, base };
        paths.set(path, entry);
        if (object(value)) nodes.set(value, entry);
        if (path === '' || typeof value?.$id === 'string') names.set(base, entry);
        if (path === '') names.set(base.split('#')[0], entry);
        if (typeof value?.$anchor === 'string') names.set(absolute('#' + value.$anchor, base), entry);
        for (const [key, child] of Object.entries(value || {})) {
            const childPath = path + '/' + pointer(key);
            if (MAPS.has(key) && object(child)) {
                for (const [name, item] of Object.entries(child)) visit(item, childPath + '/' + pointer(name), base);
            } else if (LISTS.has(key) && Array.isArray(child) || key === 'items' && Array.isArray(child)) {
                child.forEach((item, index) => visit(item, childPath + '/' + index, base));
            } else if (VALUES.has(key)) visit(child, childPath, base);
        }
    }
    visit(schema, '', 'https://schema.invalid/root');
    return {
        resolve(ref, from) {
            const uri = absolute(ref, nodes.get(from).base);
            if (names.has(uri)) return names.get(uri);
            const hash = uri.indexOf('#');
            const resource = names.get(hash < 0 ? uri : uri.slice(0, hash));
            if (!resource) return undefined;
            const fragment = hash < 0 ? '' : decodeURIComponent(uri.slice(hash + 1));
            return !fragment || fragment.startsWith('/') ? paths.get(resource.path + fragment) : undefined;
        },
        // Rewrite only indexed schema nodes. Literal data remains data even when
        // it contains $ref, $id or a property named definitions.
        rewrite(replace, source = schema) {
            function copy(value, path) {
                if (!value || typeof value !== 'object') return value;
                const result = Array.isArray(value) ? value.map((item, index) => copy(item, path + '/' + index))
                    : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, copy(item, path + '/' + pointer(key))]));
                return paths.has(path) ? replace(result, paths.get(path)) : result;
            }
            return copy(source, nodes.get(source)?.path || '');
        },
    };
}
