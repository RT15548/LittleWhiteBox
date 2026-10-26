import { PLANNER_COPY } from './ena-planner-copy.js';

function measured(value) {
    if (!Number.isFinite(value) || value < 0) throw new Error(PLANNER_COPY.budgetUnknown);
    return value;
}

// Count a request, not the text-only projection sent to the planner. IO is
// supplied by the host adapter so media accounting uses the installed host.
export async function checkPlannerBudget(data, { field, companionFields = [], contextSize }, io) {
    let limit = measured(contextSize);
    if (limit === 0) throw new Error(PLANNER_COPY.budgetUnknown);
    if (field !== 'messages') {
        const context = data.max_context_length ?? data.truncation_length;
        const output = data.max_length ?? data.max_new_tokens;
        if (context != null) limit = Math.min(limit, measured(Number(context) - Number(output)));
        const textCosts = [];
        for (const name of [field, ...companionFields]) {
            if (data[name] == null) continue;
            if (typeof data[name] !== 'string') throw new Error(PLANNER_COPY.budgetUnknown);
            textCosts.push(measured(await io.text(data[name])));
        }
        // CFG sends the positive and negative branches separately; the host
        // reserves the larger branch, not their sum.
        if (Math.max(0, ...textCosts) > limit) throw new Error(PLANNER_COPY.budget);
        return;
    }
    if (!Array.isArray(data.messages)) throw new Error(PLANNER_COPY.budgetUnknown);
    let messageTokens = 0;
    let mediaTokens = 0;
    for (const original of data.messages) {
        if (!original || typeof original !== 'object') throw new Error(PLANNER_COPY.budgetUnknown);
        const message = { role: original.role };
        // Message.setName/setToolCalls count these fields. Transport metadata
        // (tool_call_id and signature) is attached later, without a token cost.
        for (const key of ['name', 'reasoning']) {
            if (typeof original[key] === 'string') message[key] = original[key];
        }
        if (original.tool_calls != null) message.tool_calls = JSON.stringify(original.tool_calls);
        if (typeof original.content === 'string') message.content = original.content;
        else if (Array.isArray(original.content)) {
            const text = [];
            for (const part of original.content) {
                if (part.type === 'text' && typeof part.text === 'string') text.push(part.text);
                else mediaTokens += measured(await io.media(part));
            }
            message.content = text.join('\n');
        } else if (original.content != null) throw new Error(PLANNER_COPY.budgetUnknown);
        // The host counts each Message separately with full=false. Its tokenizer
        // subtracts per-call padding, so counting the whole array duplicates it.
        // Empty media-only messages start at zero; media costs are added above.
        if (message.content || message.name || message.tool_calls || message.reasoning) {
            messageTokens += measured(await io.messages([message]));
        }
    }
    // Match the host's separate tool-schema reserve; never execute/register
    // tools a second time just to count them.
    const tools = {};
    for (const key of ['tools', 'tool_choice', 'functions', 'function_call']) {
        if (data[key] != null) tools[key] = data[key];
    }
    const toolTokens = Object.keys(tools).length
        ? measured(await io.messages([{ role: 'user', content: JSON.stringify(tools) }])) : 0;
    // The host reserves three tokens for the assistant reply prefix.
    const total = messageTokens + mediaTokens + toolTokens + 3;
    if (total > limit) throw new Error(PLANNER_COPY.budget);
}
