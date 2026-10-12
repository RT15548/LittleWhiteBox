import type { ManagementResult } from '../../../capabilities/management/index.js';
import { MANAGEMENT_READ_CHARS, textPage } from '../../../capabilities/management/read-page.js';
import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';

interface ResultSlice { reference: string; offset: number; length: number }

// Owned by one executor run. Continuations retain a range, never another serialized copy.
export function createAdministratorToolResults() {
    const entries = new Map<string, string | ResultSlice>();
    let chars = 0;
    function source(reference: string): string {
        const value = entries.get(reference);
        if (typeof value !== 'string') { throw new Error('administrator_evidence_expired'); }
        return value;
    }
    function remove(id: string) {
        const old = entries.get(id);
        entries.delete(id);
        if (typeof old === 'string') {
            chars -= old.length;
            for (const [key, value] of entries) {
                if (typeof value !== 'string' && value.reference === id) { entries.delete(key); }
            }
        }
    }
    return {
        project(id: string, result: ManagementResult, options: { sourcePaged?: boolean; boundedSource?: boolean } = {}) {
            const full = safePromptJson(result);
            remove(id);
            // A source-bounded result may occupy the cache alone. Its transport already capped its size;
            // retaining it avoids paying for the same read again just to obtain the remaining pages.
            const budget = options.boundedSource ? Math.max(POLICY.evidenceChars, full.length) : POLICY.evidenceChars;
            if (full.length > budget) { return { ok: result.ok, status: result.status, detailsUnavailable: 'result_exceeds_evidence_budget', totalChars: full.length }; }
            while (chars + full.length > budget) { remove(entries.keys().next().value!); }
            entries.set(id, full); chars += full.length;
            // Source-paged tools return their content and continuation together; the cache still retains the full evidence.
            return options.sourcePaged || full.length <= MANAGEMENT_READ_CHARS ? result : { ok: result.ok, status: result.status, data: { reference: id, ...textPage(full) } };
        },
        page(id: string, reference: string, offset?: unknown) {
            const page = textPage(source(reference), offset);
            entries.set(id, { reference, offset: page.offset, length: page.text.length });
            return { reference, ...page };
        },
        read(id: string, offset?: unknown) {
            const entry = entries.get(id);
            if (entry === undefined) { throw new Error('administrator_evidence_expired'); }
            const text = typeof entry === 'string' ? entry : source(entry.reference).slice(entry.offset, entry.offset + entry.length);
            return textPage(text, offset);
        },
    };
}
