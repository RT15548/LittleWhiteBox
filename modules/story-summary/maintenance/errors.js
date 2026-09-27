// Stable error identifiers are the contract; their explanation lives here.
const explanations = {
    invalid_operation: 'The operation does not match the editable record fields.',
    invalid_arguments: 'The argument has an invalid type, value or range.',
    invalid_field: 'This field is not editable.',
    unknown_tool: 'This tool is not available.',
    source_marker_missing: 'The event summary needs a source-floor marker (#X-Y).',
    record_missing: 'The selected memory record does not exist.',
    invalid_record: 'The edited record has invalid or missing business fields.',
    fact_conflict: 'Two facts have the same subject and predicate. Keep their complete intended value in one record and delete the duplicate in the same edit list.',
    invalid_reference: 'Event causes must reference existing events, without self references or cycles.',
    invalid_alias: 'Identity aliases must have distinct names, unique sources and no cycles.',
    source_boundary: 'Source floors must be between 1 and this review’s cutoff.',
    conflict: 'Source or memory changed after review began. This draft was not saved.',
    cancelled: 'The uncommitted review was cancelled.',
    not_configured: 'The shared Agent main preset needs a model and a provider endpoint.',
    no_boundary: 'There is no valid summary boundary to review.',
    empty_response: 'The model returned neither a tool request nor a visible reply.',
    pending_edit: 'The previous edit needs confirmed persistence before another tool can run.',
    save_unavailable: 'Confirmed memory persistence is unavailable.',
    input_limit: 'The complete input exceeds this run’s context limit.',
    memory_updated: 'The listed records have changed and are outside this run\'s remaining work. Leave them unchanged in this run and continue with other memories. No changes in this request were saved; unrelated edits from the same list can be submitted separately.',
    completion_memory_updated: 'The listed records changed during this run, so completion was not recorded and this range stays pending for the next run. Continue with other ranges.',
    edit_failed: 'Completion was not recorded because an edit in this response failed. Handle the returned edit result before declaring completion.',
    compaction_failed: 'Working history could not be summarized. The original conversation and confirmed saves are retained.',
    turn_limit: 'The run has reached its model request limit, including summaries.',
    invalid_history: 'The maintenance history cannot be safely restored.',
};

export class MemoryMaintenanceError extends Error {
    constructor(code, detail = '', field) {
        super([explanations[code] || code, detail].filter(Boolean).join(' '));
        this.name = 'MemoryMaintenanceError';
        this.code = code;
        if (field) this.field = field;
    }

    static batch(errors, unchecked = []) {
        const error = errors[0];
        error.rejected = errors.flatMap(item => item.rejected || [{
            entry: item.entry || item.field?.match(/^edits\[\d+\]/u)?.[0] || 'arguments',
            field: item.field || 'arguments', code: item.code, message: item.message,
            ...(item.expected ? { expected: item.expected } : {}),
        }]);
        error.unchecked = unchecked;
        return error;
    }
}

export function requireMemory(condition, code, detail, field) {
    if (!condition) throw new MemoryMaintenanceError(code, detail, field);
}

export function memoryUpdated(records, { completion = false } = {}) {
    const error = new MemoryMaintenanceError('memory_updated');
    if (completion) error.message = explanations.completion_memory_updated;
    error.records = [...new Map(records.map(({ collection, key }) => [`${collection}:${key}`, { collection, key }])).values()];
    return error;
}

export function memoryFailureCode(error) {
    if (error?.status === 401) return 'agent_auth';
    if (['insufficient_user_quota', 'insufficient_quota'].includes(error?.code)) return 'agent_balance';
    if (error?.status === 429) return 'agent_rate';
    if (error?.code === 'model_not_found') return 'agent_model';
    return error?.code || 'agent_failed';
}
