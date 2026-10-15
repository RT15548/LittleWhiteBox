import { extensionFolderPath } from '../../../../../core/constants.js';

export const OS_SOURCE_RELATIVE_ROOT = 'modules/xiaobai-os';
export const OS_SOURCE_ROOT = `${extensionFolderPath}/${OS_SOURCE_RELATIVE_ROOT}`;
// Same lookup budgets as modules/assistant/assistant.js.
export const OS_SOURCE_LIMITS = Object.freeze({
    entries: 100, maxEntries: 300, glob: 100, matches: 100, contextLines: 5,
    lines: 2000, lineChars: 2000, readChars: 50 * 1024, fileBytes: 100 * 1024,
    suggestions: 3, headExtraLines: 8,
});

export interface SourceFile {
    source: 'littlewhitebox';
    publicPath: string;
    relativePath: string;
    extension: string;
    sizeBytes?: number;
}
export interface SourceDirectoryItem {
    publicPath: string;
    source: SourceFile['source'];
    type: 'directory' | 'file';
    descendantFileCount: number;
}

const SOURCE_ERRORS = {
    source_path_outside_scope: `Source lookup is limited to indexed files under ${OS_SOURCE_ROOT}/.`,
    source_manifest_invalid: 'The shared source index does not have the supported format.',
    source_fetch_failed: 'The source request failed; the path and original failure are included below.',
    directory_not_found: 'Directory not found in the source index.',
    file_not_found: 'Path not found in the source index.',
    list_offset_out_of_range: 'The entry offset is beyond the current directory.',
    read_offset_out_of_range: 'The offset is beyond the current file or directory.',
    read_tail_range_conflict: 'tail reads the end of a file by itself; it cannot be combined with offset or limit.',
    read_tail_not_supported_for_directory: 'tail is only supported for files; use offset/limit to page through a directory.',
    invalid_regex: 'The search regex could not be compiled.',
    invalid_glob: 'The file pattern could not be compiled.',
};

export const SOURCE_HINTS = {
    path: `Use site-root-relative paths without public/, URL encoding or parent segments. Start with LS({"path":"${OS_SOURCE_ROOT}/"}) to discover indexed paths.`,
    missing: 'Use a suggested indexed path, or use LS/Glob to find the directory or file before retrying.',
    range: 'Retry with offset inside the reported lineCount or entryCount, or omit offset to start at 1.',
    tail: 'For the last N lines, keep filePath and tail only. For a forward range, omit tail and use offset/limit.',
    regex: 'Correct the reported regex syntax, or set useRegex to false to search for the pattern literally.',
    glob: 'Correct the reported glob syntax, or narrow the search by path.',
    fetch: 'Check the reported path and HTTP status or cause. A failed read does not establish that the file or search text is absent.',
    manifest: 'Check that the shared assistant-file-manifest.json was shipped with this plugin and contains a version 2 files array.',
    narrowGlob: 'Narrow pattern or path to return the remaining files.',
    arguments: 'Correct the fields identified by issues using their expected type, bounds or accepted fields, then retry.',
};

export class AdministratorSourceError extends Error {
    constructor(readonly code: keyof typeof SOURCE_ERRORS, readonly details: Record<string, unknown> = {}) {
        super(SOURCE_ERRORS[code]);
    }
}
