import { extensionFolderPath } from '../../../../../core/constants.js';
import { AdministratorSourceError as SourceError, OS_SOURCE_ROOT as ROOT, OS_SOURCE_RELATIVE_ROOT, OS_SOURCE_LIMITS as LIMITS, SOURCE_HINTS as HINTS, type SourceFile } from '../domain/source-code.js';
import { buildDirectoryItems, compileGlobPattern, directoryContent, escapeRegExp, filterFilesByPath, findPathSuggestions, sliceLinesWithBudget, truncateReadLine } from '../domain/source-query.js';
import { sourceTextPreview } from './source-text.js';

const MANIFEST_PATH = `${extensionFolderPath}/modules/assistant/assistant-file-manifest.json`;
const scope = 'project';

function sourcePath(value: string): string {
    const path = value.trim().replace(/\/$/u, '');
    if ((path !== ROOT && !path.startsWith(`${ROOT}/`)) || /[\\%?#:\u0000-\u001f\u007f]/u.test(path)
        || path.split('/').some(part => !part || part === '.' || part === '..')) {
        throw new SourceError('source_path_outside_scope', { path: value, suggestion: HINTS.path });
    }
    return path;
}
function bounded(value: number | undefined, fallback: number, max: number) {
    return Math.max(1, Math.min(Math.trunc(value ?? fallback), max));
}
function globMatcher(pattern: string) {
    try { return compileGlobPattern(pattern); }
    catch (error) { throw new SourceError('invalid_glob', { pattern, cause: String(error), suggestion: HINTS.glob }); }
}

export function createAdministratorSourceReader(options: { signal?: AbortSignal; assertCurrent(): void; fetch?: typeof fetch }) {
    const request = options.fetch ?? globalThis.fetch;
    let index: Promise<SourceFile[]> | undefined;
    function current() { options.signal?.throwIfAborted(); options.assertCurrent(); }
    async function fetchSource<T>(path: string, read: (response: Response) => Promise<T>) {
        current();
        try {
            const response = await request(`/${path.split('/').map(encodeURIComponent).join('/')}`, {
                signal: options.signal, cache: 'no-store', redirect: 'error',
            });
            current();
            if (!response.ok) { throw new SourceError('source_fetch_failed', { path, status: response.status, cause: `file_read_failed:${response.status}`, suggestion: HINTS.fetch }); }
            const data = await read(response);
            current();
            return data;
        } catch (error) {
            current();
            if (error instanceof SourceError) { throw error; }
            throw new SourceError('source_fetch_failed', { path, cause: error instanceof Error ? error.message : String(error), suggestion: HINTS.fetch });
        }
    }
    const text = (path: string) => fetchSource(path, response => response.text());
    async function loadIndex() {
        let manifest: { version?: unknown; files?: unknown };
        const body = await text(MANIFEST_PATH);
        try { manifest = JSON.parse(body); }
        catch { throw new SourceError('source_manifest_invalid', { path: MANIFEST_PATH, suggestion: HINTS.manifest }); }
        if (!manifest || manifest.version !== 2 || !Array.isArray(manifest.files)) {
            throw new SourceError('source_manifest_invalid', { path: MANIFEST_PATH, suggestion: HINTS.manifest });
        }
        const files = new Map<string, SourceFile>();
        for (const entry of manifest.files) {
            if (entry?.source !== 'littlewhitebox' || typeof entry.relativePath !== 'string' || !entry.relativePath.startsWith(`${OS_SOURCE_RELATIVE_ROOT}/`)) { continue; }
            // Derive the public URL from the authorized relative path, not manifest publicPath.
            const publicPath = sourcePath(`${extensionFolderPath}/${entry.relativePath}`);
            if (publicPath !== `${extensionFolderPath}/${entry.relativePath}`) { throw new SourceError('source_manifest_invalid', { path: MANIFEST_PATH, suggestion: HINTS.manifest }); }
            files.set(publicPath, {
                source: 'littlewhitebox', publicPath, relativePath: entry.relativePath,
                extension: entry.relativePath.slice(entry.relativePath.lastIndexOf('.')),
                ...(typeof entry.sizeBytes === 'number' && Number.isFinite(entry.sizeBytes) && entry.sizeBytes >= 0 ? { sizeBytes: entry.sizeBytes } : {}),
            });
        }
        return [...files.values()];
    }
    async function files() {
        current();
        index ??= loadIndex().catch(error => { index = undefined; throw error; });
        const all = await index;
        current();
        return all;
    }
    function missing(code: 'file_not_found' | 'directory_not_found', path: string, all: SourceFile[]) {
        throw new SourceError(code, { path, suggestions: findPathSuggestions(path, all), suggestion: HINTS.missing });
    }
    function range(code: 'read_offset_out_of_range' | 'list_offset_out_of_range', path: string, offset: number, count: { lineCount: number } | { entryCount: number }) {
        throw new SourceError(code, { path, offset, ...count, suggestion: HINTS.range });
    }
    return {
        async ls(args: { path: string; offset?: number; limit?: number }) {
            const directoryPath = `${sourcePath(args.path)}/`, all = await files();
            const items = buildDirectoryItems(all, directoryPath);
            if (!items.length) { missing('directory_not_found', directoryPath, all); }
            const offset = Math.max(1, Math.trunc(args.offset ?? 1)), limit = bounded(args.limit, LIMITS.entries, LIMITS.maxEntries);
            if (offset > items.length) { range('list_offset_out_of_range', directoryPath, offset, { entryCount: items.length }); }
            const endEntry = Math.min(items.length, offset + limit - 1), page = items.slice(offset - 1, endEntry);
            return { directoryPath, scope, total: items.length, offset, limit, startEntry: offset, endEntry,
                items: page, returned: page.length, hasMoreAfter: endEntry < items.length,
                nextOffset: endEntry < items.length ? endEntry + 1 : null, truncated: endEntry < items.length };
        },
        async glob(args: { pattern: string; path?: string }) {
            const searchPath = sourcePath(args.path ?? ROOT), matcher = globMatcher(args.pattern);
            const matched = filterFilesByPath(await files(), searchPath).filter(matcher).sort((a, b) => a.publicPath.localeCompare(b.publicPath, 'zh-CN'));
            const truncated = matched.length > LIMITS.glob;
            return { pattern: args.pattern.trim(), scope, searchPath, total: matched.length, items: matched.slice(0, LIMITS.glob), truncated,
                ...(truncated ? { suggestion: HINTS.narrowGlob } : {}) };
        },
        async read(args: { filePath: string; offset?: number; limit?: number; tail?: number }) {
            const path = sourcePath(args.filePath), all = await files(), entry = all.find(file => file.publicPath === path);
            const offset = Math.max(1, Math.trunc(args.offset ?? 1)), limit = bounded(args.limit, LIMITS.lines, LIMITS.lines);
            const tail = args.tail === undefined ? null : bounded(args.tail, LIMITS.lines, LIMITS.lines);
            if (tail !== null && (args.offset !== undefined || args.limit !== undefined)) {
                throw new SourceError('read_tail_range_conflict', { path, suggestion: HINTS.tail });
            }
            if (!entry) {
                const items = buildDirectoryItems(all, `${path}/`);
                if (!items.length) { missing('file_not_found', path, all); }
                if (tail !== null) { throw new SourceError('read_tail_not_supported_for_directory', { path, suggestion: HINTS.tail }); }
                if (offset > items.length) { range('read_offset_out_of_range', path, offset, { entryCount: items.length }); }
                const endEntry = Math.min(items.length, offset + limit - 1), page = items.slice(offset - 1, endEntry);
                return { path: `${path}/`, scope, entryType: 'directory', totalEntries: items.length, startEntry: offset, endEntry,
                    returnedEntries: page.length, hasMoreAfter: endEntry < items.length, nextOffset: endEntry < items.length ? endEntry + 1 : null,
                    truncated: endEntry < items.length, contentFormat: 'directory_entries', content: directoryContent(page) };
            }
            const lightRead = entry.sizeBytes === undefined || entry.sizeBytes > LIMITS.fileBytes;
            if (lightRead && (tail !== null || args.offset === undefined)) {
                const preview = await fetchSource(path, response => sourceTextPreview(response, current, tail ?? limit, tail !== null));
                const lines = preview.text === '' ? [] : preview.text.split('\n');
                const sizeBytes = entry.sizeBytes ?? preview.sizeBytes;
                const base = { path, scope, source: entry.source, ...(sizeBytes !== null ? { sizeBytes } : {}), contentFormat: 'numbered_lines' };
                if (tail !== null) {
                    const tailLines = lines.slice(-tail), slice = sliceLinesWithBudget(tailLines, 1, tailLines.length, { numbered: false, fromEnd: true });
                    return { ...base, totalLinesKnown: false, tailLines: tail, startLine: null, endLine: null, returnedLines: slice.returnedLines,
                        hasMoreBefore: preview.hasMoreBefore || preview.truncated || slice.charLimited, hasMoreAfter: false, nextOffset: null,
                        truncated: preview.truncated || slice.charLimited, autoChunked: preview.truncated, charLimited: slice.charLimited,
                        limitReason: preview.truncated ? 'tail_window' : slice.charLimited ? 'output_budget' : 'tail', content: slice.content };
                }
                // A cancelled stream may stop inside its last line. Leave that line for nextOffset;
                // a preview containing only one oversized line already exceeds the per-line display cap.
                if (preview.truncated && lines.length > 1) { lines.pop(); }
                const slice = sliceLinesWithBudget(lines, 1, Math.min(lines.length, limit));
                const hasMoreAfter = preview.truncated || slice.endLine < lines.length;
                return { ...base, ...(preview.truncated ? {} : { totalLines: lines.length }), totalLinesKnown: !preview.truncated,
                    startLine: 1, endLine: slice.endLine, returnedLines: slice.returnedLines, hasMoreBefore: false, hasMoreAfter,
                    nextOffset: hasMoreAfter ? slice.endLine + 1 : null, truncated: hasMoreAfter || slice.charLimited,
                    autoChunked: hasMoreAfter, charLimited: slice.charLimited,
                    limitReason: hasMoreAfter ? 'auto_chunked' : slice.charLimited ? 'output_budget' : null, content: slice.content };
            }
            const content = await text(path), lines = content === '' ? [] : content.split('\n'), totalLines = lines.length;
            const sizeBytes = new TextEncoder().encode(content).length;
            if (totalLines && offset > totalLines) { range('read_offset_out_of_range', path, offset, { lineCount: totalLines }); }
            const requestedStartLine = tail === null ? offset : Math.max(1, totalLines - tail + 1);
            const slice = sliceLinesWithBudget(lines, requestedStartLine, tail === null ? Math.min(totalLines, requestedStartLine + limit - 1) : totalLines, { fromEnd: tail !== null });
            const startLine = slice.startLine;
            const hasMoreBefore = totalLines > 0 && startLine > 1, hasMoreAfter = slice.endLine < totalLines;
            const autoChunked = args.offset === undefined && args.limit === undefined && tail === null
                && (sizeBytes > LIMITS.fileBytes || totalLines > LIMITS.lines || slice.charLimited);
            return { path, scope, source: entry.source, sizeBytes, totalLines, totalLinesKnown: true,
                startLine: totalLines ? startLine : 1, endLine: slice.endLine, returnedLines: slice.returnedLines, hasMoreBefore, hasMoreAfter,
                nextOffset: hasMoreAfter ? slice.endLine + 1 : null, truncated: hasMoreBefore || hasMoreAfter || slice.charLimited || autoChunked,
                autoChunked, charLimited: slice.charLimited,
                limitReason: autoChunked ? 'auto_chunked' : slice.charLimited ? 'output_budget' : hasMoreBefore || hasMoreAfter ? 'requested_range' : null,
                contentFormat: 'numbered_lines', content: slice.content };
        },
        async grep(args: { pattern: string; path?: string; include?: string; useRegex?: boolean; limit?: number; offset?: number; outputMode?: 'content' | 'files_with_matches' | 'count'; contextLines?: number }) {
            const searchPath = sourcePath(args.path ?? ROOT), pattern = args.pattern.trim(), useRegex = args.useRegex !== false;
            let regex: RegExp;
            try { regex = new RegExp(useRegex ? pattern : escapeRegExp(pattern), 'i'); }
            catch (error) { throw new SourceError('invalid_regex', { pattern, cause: String(error), suggestion: HINTS.regex }); }
            const matcher = args.include ? globMatcher(args.include) : null, all = await files();
            const candidates = filterFilesByPath(all, searchPath).filter(file => !matcher || matcher(file));
            const outputMode = args.outputMode ?? 'content', limit = bounded(args.limit, LIMITS.matches, LIMITS.matches);
            const offset = Math.max(0, Math.trunc(args.offset ?? 0)), contextLines = Math.max(0, Math.min(Math.trunc(args.contextLines ?? 0), LIMITS.contextLines));
            const items: Record<string, unknown>[] = [], readErrors: Record<string, unknown>[] = [];
            let scannedFiles = 0, matchedFiles = 0, totalMatches = 0, seenContentMatches = 0, skippedFiles = 0, truncated = false;
            for (const entry of candidates) {
                current(); scannedFiles++;
                let content: string;
                try { content = await text(entry.publicPath); }
                catch (error) {
                    if (!(error instanceof SourceError) || error.code !== 'source_fetch_failed') { throw error; }
                    skippedFiles++;
                    if (readErrors.length < LIMITS.suggestions) { readErrors.push({ error: error.code, message: error.message, ...error.details }); }
                    continue;
                }
                const lines = content.split('\n'), matches: { line: number; text: string; context: string | null }[] = [];
                for (let index = 0; index < lines.length; index++) {
                    if (index % 500 === 0) { await new Promise(resolve => setTimeout(resolve, 0)); current(); }
                    if (!regex.test(lines[index])) { continue; }
                    const start = Math.max(0, index - contextLines), end = Math.min(lines.length, index + contextLines + 1);
                    matches.push({ line: index + 1, text: truncateReadLine(lines[index]), context: contextLines ? lines.slice(start, end)
                        .map((line, at) => `${start + at === index ? '>' : ' '} ${start + at + 1}: ${truncateReadLine(line)}`).join('\n') : null });
                }
                if (!matches.length) { continue; }
                matchedFiles++; totalMatches += matches.length;
                if (outputMode !== 'content') {
                    if (matchedFiles > offset) { items.push({ path: entry.publicPath, source: entry.source, matchCount: matches.length }); }
                } else {
                    for (const match of matches) {
                        seenContentMatches++;
                        if (seenContentMatches > offset && items.length < limit) { items.push({ path: entry.publicPath, source: entry.source, ...match }); }
                    }
                }
                if (items.length >= limit) {
                    truncated = (outputMode === 'content' && totalMatches > offset + items.length) || scannedFiles < candidates.length;
                    break;
                }
            }
            const searchComplete = !truncated && scannedFiles >= candidates.length && skippedFiles === 0;
            return { pattern, scope, useRegex, outputMode, glob: args.include ?? '', include: args.include ?? '', searchPath,
                limit, offset, contextLines, matchesFound: totalMatches, returned: items.length, matchedFilesSeen: matchedFiles,
                items, truncated, scannedFiles, skippedFiles, skippedPaths: readErrors.map(error => error.path), readErrors,
                candidateFiles: candidates.length, indexedFiles: all.length, searchComplete, nextOffset: offset + items.length,
                ...(searchComplete ? { totalMatches, matchedFiles } : {}) };
        },
    };
}
