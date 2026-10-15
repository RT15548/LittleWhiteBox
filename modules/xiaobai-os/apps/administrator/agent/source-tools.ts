import { collectToolInputIssues } from '../../../../agent-core/runtime/tool-input-validation.js';
import type { ManagementResult, ManagementTool } from '../../../capabilities/management/index.js';
import { ADMINISTRATOR_APP_DESCRIPTOR } from '../descriptor.js';
import { AdministratorSourceError, OS_SOURCE_ROOT as ROOT, OS_SOURCE_RELATIVE_ROOT, OS_SOURCE_LIMITS as LIMITS, SOURCE_HINTS } from '../domain/source-code.js';
import { createAdministratorSourceReader } from '../host/source-reader.js';
import { ADMINISTRATOR_COPY as COPY } from '../ui/copy.js';

export const SOURCE_TOOL_NAMES = Object.freeze({ ls: 'LS', glob: 'Glob', grep: 'Grep', read: 'Read' });
const sourceScope = `Read-only lookup is limited to indexed OS source under ${ROOT}/.`;
const searchPath = { type: 'string', minLength: 1, description: 'Optional directory or exact file path inside the selected lookup scope. Project paths omit `public/`.' };
const pattern = { type: 'string', minLength: 1, pattern: '\\S' };

// Wording and parameters follow modules/assistant/app-src/tooling.js;
// only the lookup scope and examples are restricted to OS source.
export const ADMINISTRATOR_SOURCE_PACKAGE = {
    id: ADMINISTRATOR_APP_DESCRIPTOR.id,
    label: COPY.sourcePackage,
    tools: [
        { effect: 'read', label: COPY.sourceList, target: args => String(args.path ?? ''), definition: { type: 'function', function: {
            name: SOURCE_TOOL_NAMES.ls,
            description: [
                'List files and directories inside a directory path.',
                'Returns first-level entries only; does not recurse and does not read file contents.',
                'Best for directory-level discovery and structural narrowing by path.',
                sourceScope,
                'data contains directoryPath, scope, total, offset, limit, startEntry, endEntry, items (publicPath, source, type, descendantFileCount), returned, hasMoreAfter, nextOffset and truncated. Continue with the same path and offset: nextOffset when hasMoreAfter is true.',
            ].join('\n'),
            parameters: { type: 'object', properties: {
                path: { type: 'string', minLength: 1, description: `Site-root-relative tool path without public/, for example ${ROOT}/ or ${ROOT}/apps/.` },
                offset: { type: 'number', description: 'Optional 1-based entry offset for paging. Default 1.' },
                limit: { type: 'number', description: `Maximum number of first-level entries to return. Default ${LIMITS.entries}, max ${LIMITS.maxEntries}.` },
            }, required: ['path'], additionalProperties: false },
        } } },
        { effect: 'read', label: COPY.sourceGlob, target: args => String(args.pattern ?? ''), definition: { type: 'function', function: {
            name: SOURCE_TOOL_NAMES.glob,
            description: [
                'Fast file pattern matching tool for OS project code.',
                'Matches file paths only; does not inspect file contents.',
                sourceScope,
                'Best for file discovery and path-level narrowing when you know a directory, extension, or naming pattern.',
                'Supports a path scope so you can search inside one directory instead of the full selected scope.',
                `data contains pattern, scope, searchPath, total, items (source, publicPath, relativePath, extension, sizeBytes when known) and truncated. Returns at most ${LIMITS.glob} files; if truncated, narrow pattern or path as indicated by suggestion.`,
            ].join('\n'),
            parameters: { type: 'object', properties: {
                pattern: { ...pattern, description: `Glob path pattern without public/, for example ${ROOT}/apps/**/*.ts.` },
                path: searchPath,
            }, required: ['pattern'], additionalProperties: false },
        } } },
        { effect: 'read', label: COPY.sourceGrep, target: args => String(args.pattern ?? ''), definition: { type: 'function', function: {
            name: SOURCE_TOOL_NAMES.grep,
            description: [
                'Fast content search tool for OS project code.',
                'It first builds a candidate set from the selected scope, then searches the current live contents of those candidate files.',
                sourceScope,
                'Uses regex search by default and returns matching files with line-level match details.',
                'Best for content-level narrowing by keyword, symbol name, error text, or regex before reading files.',
                'Supports both directory scope and file-pattern filtering so you can narrow searches before reading files.',
                'data echoes pattern, scope, useRegex, outputMode, glob/include, searchPath, limit, offset and contextLines. items contain path/source with line/text/context in content mode, or matchCount in file/count mode.',
                'returned, matchesFound and matchedFilesSeen describe the scan so far; scannedFiles, candidateFiles and indexedFiles describe coverage. Continue the same query with offset: nextOffset while truncated. totalMatches and matchedFiles are present when searchComplete is true.',
                `Unreadable files are counted by skippedFiles; skippedPaths and readErrors provide up to ${LIMITS.suggestions} examples (path, error, message, status or cause, suggestion). searchComplete is false when any file could not be read. Narrow path to retry a failed file.`,
            ].join('\n'),
            parameters: { type: 'object', properties: {
                pattern: { ...pattern, description: 'grep/rg-style search pattern. Treated as regex by default.' },
                path: searchPath,
                include: { ...pattern, description: `Optional file path glob filter, for example **/*.ts or ${OS_SOURCE_RELATIVE_ROOT}/apps/administrator/**/*.ts.` },
                outputMode: { type: 'string', enum: ['content', 'files_with_matches', 'count'], description: 'Output mode. content returns matched lines and context; files_with_matches returns matching files only; count returns match counts per file. Default is content.' },
                limit: { type: 'number', description: `Maximum number of results to return. Default ${LIMITS.matches}, max ${LIMITS.matches}. Can be used with offset for paging.` },
                offset: { type: 'number', description: 'Skip this many results before returning matches. Default 0.' },
                contextLines: { type: 'number', description: `How many context lines to show before and after each match. Default 0, max ${LIMITS.contextLines}.` },
                useRegex: { type: 'boolean', description: 'Whether to treat pattern as a regex. Default true; use false for literal search.' },
            }, required: ['pattern'], additionalProperties: false },
        } } },
        { effect: 'read', label: COPY.sourceRead, target: args => String(args.filePath ?? ''), definition: { type: 'function', function: {
            name: SOURCE_TOOL_NAMES.read,
            description: [
                "Read a text file or directory using the current instance's live contents.",
                sourceScope,
                'Returns numbered lines for files and plain entry names for directories; large reads include continuation hints.',
                'Use tail only when you need the last N lines of a file; otherwise omit it entirely.',
                `File data contains path, scope, source, sizeBytes when known, totalLines when known, totalLinesKnown, startLine, endLine, returnedLines, hasMoreBefore, hasMoreAfter, nextOffset, truncated, autoChunked, charLimited, limitReason, contentFormat and content. Lines are truncated at ${LIMITS.lineChars} characters; each response has a ${LIMITS.readChars}-character content budget.`,
                'Directory data contains path, scope, entryType, totalEntries, startEntry, endEntry, returnedEntries, hasMoreAfter, nextOffset, truncated, contentFormat and content. Continue with the same filePath and offset: nextOffset while hasMoreAfter is true.',
                'A streamed tail reports tailLines and leaves startLine/endLine null when absolute line numbers are unknown. Failures include path, message, suggestion, suggested indexed paths where available, and lineCount/entryCount with offset for out-of-range reads.',
            ].join('\n'),
            parameters: { type: 'object', properties: {
                filePath: { type: 'string', minLength: 1, description: `Site-root-relative tool path without public/, for example ${ROOT}/apps/administrator/descriptor.ts or ${ROOT}/apps/.` },
                offset: { type: 'number', description: 'Optional line offset (1-based). Default 1.' },
                limit: { type: 'number', description: `Optional maximum number of lines or directory entries to return. Default ${LIMITS.lines}, max ${LIMITS.lines}.` },
                tail: { type: 'number', exclusiveMinimum: 0, description: `Optional number of final file lines to return, max ${LIMITS.lines}. Use by itself; cannot be combined with offset or limit. Omit the field entirely when unused; do not send tail: 0.` },
            }, required: ['filePath'], additionalProperties: false },
        } } },
    ] satisfies ManagementTool[],
};

export function createAdministratorSourceTools(options: Parameters<typeof createAdministratorSourceReader>[0]) {
    const reader = createAdministratorSourceReader(options);
    const tools = ADMINISTRATOR_SOURCE_PACKAGE.tools;
    return {
        package: ADMINISTRATOR_SOURCE_PACKAGE,
        owns: (name: string) => tools.some(tool => tool.definition.function.name === name),
        async execute(name: string, args: Record<string, unknown>): Promise<ManagementResult> {
            const tool = tools.find(tool => tool.definition.function.name === name);
            if (!tool) { return { ok: false, status: 'failed', code: 'tool_unavailable' }; }
            const issues = collectToolInputIssues(args, tool.definition.function.parameters);
            if (issues.length) { return { ok: false, status: 'failed', code: 'arguments_invalid', data: { issues, suggestion: SOURCE_HINTS.arguments } }; }
            try {
                const data = name === SOURCE_TOOL_NAMES.ls ? await reader.ls(args as Parameters<typeof reader.ls>[0])
                    : name === SOURCE_TOOL_NAMES.glob ? await reader.glob(args as Parameters<typeof reader.glob>[0])
                    : name === SOURCE_TOOL_NAMES.grep ? await reader.grep(args as Parameters<typeof reader.grep>[0])
                    : await reader.read(args as Parameters<typeof reader.read>[0]);
                return { ok: true, status: 'read', data };
            } catch (error) {
                if (!(error instanceof AdministratorSourceError)) { throw error; }
                return { ok: false, status: 'failed', code: error.code, data: { error: error.code, message: error.message, ...error.details } };
            }
        },
    };
}
