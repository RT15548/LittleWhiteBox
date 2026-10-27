import { resolveConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { dropInvalidatedThinkingFromMessage } from '../../agent-core/runtime/protocol.js';
import { recentTurnArchiveCounts, hasChatAnswer } from '../../agent-core/runtime/recent-turns.js';
import { DEFAULT_MAX_TOKENS } from '../../agent-core/config.js';
import { MEMORY_COMPACTION_PROMPT, getMemoryMaintenancePrompt } from './prompt.js';
import { MEMORY_TOOLS } from './tools.js';
import { requireMemory } from './errors.js';

function splitAtRole(messages, role) {
    const groups = [];
    for (const message of messages) {
        if (message.role === role || !groups.length) groups.push([]);
        groups.at(-1).push(message);
    }
    return groups;
}

export function createMemoryContext({ config, signal, limits, countTokens = resolveConversationTokens, summarize,
    systemPrompt = getMemoryMaintenancePrompt(), tools = MEMORY_TOOLS }) {
    const count = (messages, prompt = typeof systemPrompt === 'function' ? systemPrompt() : systemPrompt, definitions = tools) => countTokens({
        messages: [{ role: 'system', content: prompt }, ...messages], tools: definitions, providerConfig: config, signal,
    });
    const summaryTokens = Math.min(config.maxTokens || DEFAULT_MAX_TOKENS, limits.summaryTokens);

    async function summarizeText(text, notes = '') {
        let offset = 0;
        while (offset < text.length) {
            signal?.throwIfAborted();
            const message = end => [{ role: 'user', content: JSON.stringify({ workingNotes: notes,
                workFragment: { from: offset, to: end, total: text.length, text: text.slice(offset, end) } }) }];
            let low = offset, high = text.length;
            if ((await count(message(high), MEMORY_COMPACTION_PROMPT, [])).tokens <= limits.inputTokens) low = high;
            while (low < high) {
                const mid = Math.ceil((low + high) / 2);
                if ((await count(message(mid), MEMORY_COMPACTION_PROMPT, [])).tokens <= limits.inputTokens) low = mid;
                else high = mid - 1;
            }
            requireMemory(low > offset, 'input_limit');
            const input = message(low), measured = await count(input, MEMORY_COMPACTION_PROMPT, []);
            const result = await summarize({ messages: input, systemPrompt: MEMORY_COMPACTION_PROMPT,
                tools: [], toolChoice: 'none', maxTokens: summaryTokens }, measured);
            signal?.throwIfAborted();
            requireMemory(typeof result.text === 'string' && result.text.trim() && !result.toolCalls?.length, 'compaction_failed');
            requireMemory((await count([{ role: 'user', content: result.text }], '', [])).tokens <= summaryTokens, 'compaction_failed');
            notes = result.text.trim(); offset = low;
        }
        return notes;
    }

    async function compact(messages, task, callsRemaining) {
        const cycles = splitAtRole(messages.slice(1), 'assistant');
        // Only the automatic entry owns this JSON envelope, never an arbitrary user message.
        const old = JSON.parse(messages[0].content);
        let notes = old.workingNotes || '', archived = 0;
        const opening = () => ({ role: 'user', content: JSON.stringify({ task, workingNotes: notes, callsRemaining }) });
        for (const keep of [2, 1]) {
            const boundary = Math.max(0, cycles.length - keep);
            const older = cycles.slice(archived, boundary);
            if (older.length) notes = await summarizeText(JSON.stringify(older), notes);
            archived = boundary;
            const candidate = [opening(), ...cycles.slice(boundary).flat().map(dropInvalidatedThinkingFromMessage)];
            const measured = await count(candidate);
            if (measured.tokens < limits.compactTokens && measured.tokens <= limits.inputTokens) return { messages: candidate, measured };
        }
        requireMemory(false, 'input_limit');
    }

    async function compactChat(messages) {
        const questionIndex = messages.findLastIndex(message => message.role === 'user');
        requireMemory(questionIndex >= 0, 'invalid_arguments');
        const previous = messages.slice(0, questionIndex);
        let notes = previous.filter(message => message.memoryWorkingNotes === true).map(message => message.content).join('\n');
        const currentMaterial = previous.filter(message => message.memoryRegeneration === true);
        const turns = splitAtRole(previous.filter(message => message.memoryWorkingNotes !== true && message.memoryRegeneration !== true), 'user');
        const question = messages[questionIndex];
        const cycles = splitAtRole(messages.slice(questionIndex + 1), 'assistant');
        let oldTurns = 0, oldCycles = 0;
        // Any prior exchange may become notes; only the current request and
        // latest tool group are required to continue this execution.
        const boundaries = recentTurnArchiveCounts(turns, hasChatAnswer);
        const minimum = [...currentMaterial, question, ...cycles.slice(-1).flat()]
            .map(dropInvalidatedThinkingFromMessage);
        requireMemory((await count(minimum)).tokens <= limits.inputTokens, 'input_limit');
        const candidates = boundaries.map(boundary => ({ turns: turns.length - boundary, cycles: cycles.length }));
        for (const keep of [2, 1]) {
            if (keep < cycles.length) candidates.push({ turns: 0, cycles: keep });
        }
        let withinLimit;
        for (const keep of candidates) {
            const turnBoundary = turns.length - keep.turns, cycleBoundary = cycles.length - keep.cycles;
            const older = [...turns.slice(oldTurns, turnBoundary), ...cycles.slice(oldCycles, cycleBoundary)];
            if (older.length) notes = await summarizeText(JSON.stringify(older), notes);
            oldTurns = turnBoundary; oldCycles = cycleBoundary;
            const candidate = [
                ...(notes ? [{ role: 'system', content: notes, memoryWorkingNotes: true }] : []),
                ...turns.slice(turnBoundary).flat(), ...currentMaterial, question, ...cycles.slice(cycleBoundary).flat(),
            ].map(dropInvalidatedThinkingFromMessage);
            const measured = await count(candidate);
            if (measured.tokens < limits.compactTokens && measured.tokens <= limits.inputTokens) return { messages: candidate, measured };
            if (measured.tokens <= limits.inputTokens) withinLimit = { messages: candidate, measured };
        }
        if (withinLimit) return withinLimit;
        requireMemory(false, 'input_limit');
    }
    return { count, compact, compactChat };
}
