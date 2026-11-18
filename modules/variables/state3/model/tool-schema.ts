import type { Schema } from '../types.js';
import { indexSchemaResources } from '../../../../shared/json-schema-resources.js';

/**
 * Resolve action-local resources before embedding. Local pointers and names become
 * pointers into the write declaration; resource IDs can then be removed without
 * collisions between independent actions. No external resource is fetched.
 */
export function embedSchema(schema: Schema, location: string): Schema {
    const resources = indexSchemaResources(schema);
    return resources.rewrite((node: Record<string, unknown>, entry: { schema: Schema; base: string }) => {
        if (typeof node.$ref === 'string') {
            const target = resources.resolve(node.$ref, entry.schema);
            node.$ref = target ? location + target.path.split('/').map(encodeURIComponent).join('/') : new URL(node.$ref, entry.base).href;
        }
        delete node.$id;
        delete node.$anchor;
        return node;
    }) as Schema;
}
