import { fault } from '../random.js';

/** Explicit authoring markers identify fields; headings and prose are not keys. */
export function canonFields(block: string) {
    const fields = new Map<string, string>();
    for (const field of block.matchAll(/<!-- field:([a-z]+) -->\s*([^]*?)(?=<!-- field:|$)/g)) {
        if (fields.has(field[1])) { fault('narrative_unavailable'); }
        fields.set(field[1], field[2].trim());
    }
    return fields;
}
