import type { LearningScope } from '../../../domains/learning/types.js';
import { combineLearningScope } from '../../../domains/learning/validation.js';

/** Provenance of projected objects, kept off the model wire and collected only from the returned page. */
export function createLearningReading() {
    const sources = new WeakMap<object, { scope: LearningScope; references: string[] }>();
    return {
        include<T extends object | null>(value: T, scope: LearningScope, references: string[]): T {
            if (value) {
                const previous = sources.get(value);
                sources.set(value, { scope: previous ? combineLearningScope(previous.scope, scope) : scope,
                    references: [...new Set([...previous?.references ?? [], ...references])] });
            }
            return value;
        },
        inspect(value: unknown) {
            let scope: LearningScope = { kind: 'public' };
            const references = new Set<string>();
            function visit(entry: unknown) {
                if (!entry || typeof entry !== 'object') { return; }
                const source = sources.get(entry);
                if (source) {
                    scope = combineLearningScope(scope, source.scope);
                    source.references.forEach(id => references.add(id));
                }
                Object.values(entry).forEach(visit);
            }
            visit(value);
            return { scope, references: [...references] };
        },
    };
}
export type LearningReading = ReturnType<typeof createLearningReading>;
