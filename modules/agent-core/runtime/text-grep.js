function normalizeOutputMode(value = '') {
    const text = String(value || 'content').trim();
    const key = text
        .replace(/[\s-]/g, '_')
        .replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
    if (key === 'files_with_matches' || key === 'fileswithmatches') return 'files_with_matches';
    if (key === 'count') return 'count';
    return 'content';
}

function normalizeRegexFlags(value = '') {
    const raw = String(value || 'i');
    let flags = '';
    for (const char of raw) {
        if ('imsuy'.includes(char) && !flags.includes(char)) flags += char;
    }
    return flags || 'i';
}

function buildSearchRegExp(pattern = '', useRegex = false, regexFlags = 'i') {
    const text = String(pattern || '');
    if (!text) throw new Error('grep_pattern_required');
    // The default keeps the conservative shared dialect. Callers opt into
    // their own legacy dialect (for example Tavern's `iu`) via regexFlags;
    // adding `u` here would change which legacy patterns compile for every
    // caller, even ones that never opted in to a new regex mode.
    const flags = normalizeRegexFlags(regexFlags);
    if (useRegex === true) return new RegExp(text, flags);
    return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
}

function splitLines(content = '') {
    return String(content ?? '').replace(/\r\n?/g, '\n').split('\n');
}

function numberLines(lines = [], startLine = 1) {
    return lines.map((line, index) => `${startLine + index}: ${line}`).join('\n');
}

function createAbortError(message = 'grep_aborted') {
    const error = new Error(String(message || 'grep_aborted'));
    error.name = 'AbortError';
    return error;
}

function throwIfAborted(signal, abortMessage) {
    if (signal?.aborted) throw createAbortError(abortMessage);
}

function now() {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
}

function yieldToEventLoop() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Searches an iterable of text files without retaining matches outside the
 * requested page. `count` is still exact: every source is scanned.
 */
export async function grepTextSources(options = {}) {
    const pattern = String(options.pattern ?? options.query ?? '');
    const regexp = buildSearchRegExp(pattern, options.useRegex === true || options.regex === true, options.regexFlags);
    const outputMode = normalizeOutputMode(options.outputMode);
    const requestedLimit = Math.floor(Number(options.limit) || 100);
    const limit = Math.max(1, requestedLimit);
    const offset = Math.max(0, Math.floor(Number(options.offset) || 0));
    const contextLines = Math.max(0, Math.floor(Number(options.contextLines) || 0));
    const signal = options.signal;
    const abortMessage = String(options.abortMessage || 'grep_aborted');
    const timeSliceMs = Math.max(1, Number(options.timeSliceMs) || 8);
    const sources = options.sources || [];
    const results = [];
    let count = 0;
    let searchedFileCount = 0;
    let lastYieldAt = now();

    async function yieldIfNeeded() {
        if (now() - lastYieldAt < timeSliceMs) return;
        await yieldToEventLoop();
        throwIfAborted(signal, abortMessage);
        lastYieldAt = now();
    }

    for await (const rawSource of sources) {
        throwIfAborted(signal, abortMessage);
        const path = String(rawSource?.path || '');
        if (!path) continue;
        const lines = splitLines(rawSource?.content || '');
        searchedFileCount += 1;
        let fileMatchCount = 0;

        for (let index = 0; index < lines.length; index += 1) {
            if ((index & 127) === 0) {
                throwIfAborted(signal, abortMessage);
                await yieldIfNeeded();
            }
            const line = lines[index];
            regexp.lastIndex = 0;
            if (!regexp.test(line)) continue;
            fileMatchCount += 1;
            if (outputMode === 'content') {
                if (count >= offset && results.length < limit) {
                    const row = {
                        path,
                        lineNumber: index + 1,
                        line,
                    };
                    if (contextLines > 0) {
                        const start = Math.max(0, index - contextLines);
                        const end = Math.min(lines.length, index + contextLines + 1);
                        row.context = numberLines(lines.slice(start, end), start + 1);
                    }
                    results.push(row);
                }
                count += 1;
            }
        }

        if (outputMode === 'files_with_matches' && fileMatchCount > 0) {
            if (count >= offset && results.length < limit) results.push({ path });
            count += 1;
        } else if (outputMode === 'count' && fileMatchCount > 0) {
            if (count >= offset && results.length < limit) results.push({ path, count: fileMatchCount });
            count += 1;
        }
        await yieldIfNeeded();
    }

    // Even a fast scan may be part of a repeated tool loop. Give a pending UI
    // cancellation one deterministic task turn before reporting success, so a
    // fast machine cannot starve the abort event until the round limit.
    if (signal) {
        await yieldToEventLoop();
        throwIfAborted(signal, abortMessage);
    }

    return {
        pattern,
        outputMode,
        searchedFileCount,
        count,
        results,
        truncated: offset + results.length < count,
        nextOffset: offset + results.length < count ? offset + results.length : 0,
    };
}
