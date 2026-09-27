export type MapDomainErrorCode =
    | 'map_invalid_domain'
    | 'map_unsupported_version'
    | 'map_collection_limit'
    | 'map_size_limit'
    | 'map_invalid_edit';

export interface MapValidationIssue {
    code: MapDomainErrorCode;
    path: string;
    message: string;
}

export interface MapValidationReport {
    issues: readonly MapValidationIssue[];
    unchecked: readonly string[];
}

export class MapDomainError extends Error {
    constructor(readonly code: MapDomainErrorCode, detail = '', readonly validation?: MapValidationReport) {
        super(detail ? `${code}: ${detail}` : code);
        this.name = 'MapDomainError';
    }
}

/** One inspection owns its errors. Invalid branches are skipped, never filled with invented values. */
export class MapValidation {
    readonly issues: MapValidationIssue[] = [];
    readonly unchecked = new Set<string>();
    readonly #missingPaths = new Set<string>();

    check(valid: boolean, code: MapDomainErrorCode, path: string, message: string): boolean {
        if (!valid && !this.#missingPaths.has(path)) {
            this.issues.push({ code, path, message });
        }
        return valid;
    }

    record(value: unknown, path: string, required: readonly string[], optional: readonly string[] = []): Record<string, unknown> | undefined {
        if (!this.check(!!value && typeof value === 'object' && !Array.isArray(value), 'map_invalid_domain', path, 'must be an object')) {
            this.unchecked.add(path);
            return;
        }
        const record = value as Record<string, unknown>;
        const allowed = new Set([...required, ...optional]);
        for (const key of Object.keys(record)) {
            this.check(allowed.has(key), 'map_invalid_domain', `${path}.${key}`, 'is not allowed');
        }
        for (const key of required) {
            if (!this.check(Object.hasOwn(record, key), 'map_invalid_domain', `${path}.${key}`, 'is required')) {
                this.#missingPaths.add(`${path}.${key}`);
            }
        }
        return record;
    }

    array(value: unknown, path: string, maximum: number, limitCode: MapDomainErrorCode = 'map_collection_limit'): unknown[] | undefined {
        if (!this.check(Array.isArray(value), 'map_invalid_domain', path, 'must be an array')) {
            this.unchecked.add(path);
            return;
        }
        const items = value as unknown[];
        if (!this.check(items.length <= maximum, limitCode, path, `exceeds ${maximum}`)) {
            this.unchecked.add(path);
            return;
        }
        return Array.from(items);
    }

    finish(): void {
        if (!this.issues.length) { return; }
        const first = this.issues[0];
        throw new MapDomainError(first.code, `${first.path} ${first.message}`, {
            issues: this.issues, unchecked: [...this.unchecked],
        });
    }
}
