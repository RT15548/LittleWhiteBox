const COMPLETED_REASONS = {
    openai: ['stop', 'tool_calls', 'function_call'],
    anthropic: ['end_turn', 'stop_sequence', 'tool_use'],
    google: ['STOP'],
};

/** A transport closing or an SDK returning a snapshot does not establish normal completion. */
export function requireResponseCompletion(protocol, reason, refused = false) {
    if (!refused && COMPLETED_REASONS[protocol]?.includes(reason)) return reason;
    const truncated = ['length', 'max_tokens', 'max_output_tokens', 'MAX_TOKENS'].includes(reason);
    const error = new Error(truncated ? 'Model response reached its output limit.' : 'Model response did not complete normally.');
    error.code = truncated ? 'AGENT_RESPONSE_TRUNCATED' : 'AGENT_RESPONSE_INCOMPLETE';
    error.reason = reason || 'missing_completion';
    throw error;
}

/** Responses has its own wire-event validation; consumers still share the output-limit category. */
export function isResponseTruncated(error) {
    return error?.code === 'AGENT_RESPONSE_TRUNCATED'
        || error?.code === 'OPENAI_RESPONSES_INCOMPLETE' && error?.reason === 'max_output_tokens';
}
