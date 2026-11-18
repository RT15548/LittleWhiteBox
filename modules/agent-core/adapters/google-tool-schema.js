import { indexSchemaResources } from '../../../shared/json-schema-resources.js';

// Native schema parsers can reject valid deep references. Expand finite references
// exactly; recursive targets stay in declaration-level definitions.
export function prepareGoogleToolParameters(schema) {
    const resources = indexSchemaResources(schema);
    const targets = new Map(), converted = new Map();
    const bundled = resources.rewrite((node, entry) => {
        if (typeof node.$ref === 'string') {
            const target = resources.resolve(node.$ref, entry.schema);
            if (target) {
                if (!targets.has(target.path)) {
                    let name = `lwb_ref_${targets.size}`;
                    while (Object.hasOwn(schema.$defs || {}, name)) name += '_';
                    targets.set(target.path, { name, schema: target.schema });
                }
                node.$ref = '#/$defs/' + targets.get(target.path).name;
            } else node.$ref = new URL(node.$ref, entry.base).href;
        }
        delete node.$id;
        delete node.$anchor;
        converted.set(entry.path, node);
        return node;
    });
    if (!targets.size) return schema;
    const canonical = { ...bundled, $defs: { ...bundled.$defs, ...Object.fromEntries([...targets].map(([path, target]) =>
        [target.name, converted.get(path) ?? target.schema])) } };
    const indexed = indexSchemaResources(canonical);
    function expand(source, seen) {
        return indexed.rewrite((node, entry) => {
            if (typeof node.$ref !== 'string') return node;
            const target = indexed.resolve(node.$ref, entry.schema);
            if (!target || seen.has(target.schema)) return node;
            const value = expand(target.schema, new Set([...seen, target.schema]));
            const siblings = { ...node };
            delete siblings.$ref;
            return Object.keys(siblings).length ? { ...siblings, allOf: [...(siblings.allOf || []), value] } : value;
        }, source);
    }
    return expand(canonical, new Set([canonical]));
}
