import { MapDomainError, type MapValidationReport } from '../../../domains/map/validation.js';
import { errorText } from './intent-common.js';
import { ToolInputError, type collectToolInputIssues } from '../../../../agent-core/runtime/tool-input-validation.js';

export type MapToolStatus = 'updated' | 'unchanged' | 'partial' | 'failed';

export function mapToolFailure(error: unknown): { reason: string; validation?: MapValidationReport; inputIssues?: ReturnType<typeof collectToolInputIssues> } {
    if (error instanceof ToolInputError) { return { reason: 'invalid_arguments', inputIssues: error.issues }; }
    return error instanceof MapDomainError && error.validation
        ? { reason: error.code, validation: error.validation }
        : { reason: errorText(error) };
}

export interface MapToolItemReport {
    readonly index: number;
    readonly id: string;
    readonly collection?: string;
    readonly changed?: boolean;
    readonly reason?: string;
    readonly hint?: string;
    readonly validation?: MapValidationReport;
    readonly inputIssues?: ReturnType<typeof collectToolInputIssues>;
}

export interface MapToolResult {
    readonly ok: boolean;
    readonly status: MapToolStatus;
    readonly changed: boolean;
    readonly applied: readonly MapToolItemReport[];
    readonly skipped: readonly MapToolItemReport[];
    readonly warnings: readonly string[];
    readonly hint?: string;
    readonly data?: unknown;
}

export function mapToolResult(options: {
    changed?: boolean;
    applied?: readonly MapToolItemReport[];
    skipped?: readonly MapToolItemReport[];
    warnings?: readonly string[];
    hint?: string;
    data?: unknown;
}): MapToolResult {
    const applied = Object.freeze([...(options.applied || [])]);
    const skipped = Object.freeze([...(options.skipped || [])]);
    const warnings = Object.freeze([...new Set(options.warnings || [])]);
    const changed = options.changed === true;
    const status: MapToolStatus = skipped.length
        ? (applied.length || changed ? 'partial' : 'failed')
        : changed ? 'updated' : 'unchanged';
    return Object.freeze({
        ok: status !== 'failed',
        status,
        changed,
        applied,
        skipped,
        warnings,
        ...(options.hint ? { hint: options.hint } : {}),
        ...(options.data === undefined ? {} : { data: options.data }),
    });
}
