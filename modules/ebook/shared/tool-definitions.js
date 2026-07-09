import { getTavilySearchToolDefinition, TAVILY_TOOL_NAME } from '../../agent-core/tavily-search.js';

export const EBOOK_TOOL_NAMES = Object.freeze({
    LS: 'LS',
    GLOB: 'Glob',
    GREP: 'Grep',
    READ: 'Read',
    WEB_SEARCH: TAVILY_TOOL_NAME,
    WRITE: 'Write',
    EDIT: 'Edit',
    DELETE: 'Delete',
    MOVE: 'Move',
    PLAN_CREATE: 'PlanCreate',
    PLAN_UPDATE: 'PlanUpdate',
    PLAN_LIST: 'PlanList',
    PLAN_GET: 'PlanGet',
    RENAME_BOOK: 'RenameBook',
    DELEGATE_RUN: 'DelegateRun',
});

export function getEbookToolDefinitions(options = {}) {
    const readOnly = !!options.readOnly;
    const webSearchEnabled = !!options.webSearchEnabled;
    const definitions = [
        {
            type: 'function',
            function: {
                name: EBOOK_TOOL_NAMES.LS,
                description: [
                    'List first-level files and directories under a current-book directory.',
                    'Returns directory entries only. Does not recurse and does not read file contents.',
                    'Use before reading or editing when you need to locate chapters, sources, settings, or review files.',
                    'Directory paths must be `book/.../`, for example `book/` or `book/chapters/`. This is a directory tool, not a file reader.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        path: { type: 'string', description: 'Directory path. Must be `book/.../`, for example `book/`, `book/sources/`, or `book/chapters/`. Do not pass filePath.' },
                        offset: { type: 'number', description: '1-based directory entry offset. Default 1.' },
                        limit: { type: 'number', description: 'Maximum number of entries to return. Default 100, max 300.' },
                    },
                    required: ['path'],
                    additionalProperties: false,
                },
            },
        },
        {
            type: 'function',
            function: {
                name: EBOOK_TOOL_NAMES.GREP,
                description: [
                    'Search text inside current-book files.',
                    'Uses literal text search by default and returns matching files plus line-level snippets.',
                    'Use before reading many files to locate character names, dialogue, settings, foreshadowing, plot points, or review notes.',
                    '`path` can be a search directory or one exact file; `include` limits the file glob/name. For regex search, explicitly pass `useRegex: true`.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        pattern: { type: 'string', description: 'Search pattern. Treated as literal text by default; use `useRegex: true` only when you intentionally need regex.' },
                        path: { type: 'string', description: 'Optional search scope. Can be a directory like `book/chapters/` or one file like `book/chapters/101.md`.' },
                        include: { type: 'string', description: 'Optional file glob/name filter, for example `book/chapters/*.md` or `101.md`.' },
                        outputMode: { type: 'string', enum: ['content', 'files_with_matches', 'count'], description: '`content` returns matched lines, `files_with_matches` returns files only, and `count` returns match counts. Default `content`.' },
                        limit: { type: 'number', description: 'Maximum number of results to return. Default 100, max 100.' },
                        offset: { type: 'number', description: 'Skip this many results before returning matches. Default 0.' },
                        contextLines: { type: 'number', description: 'How many context lines to show before and after each match. Default 0, max 5.' },
                        useRegex: { type: 'boolean', description: 'Whether to treat pattern as a regex. Default false; omit it for literal text search.' },
                    },
                    required: ['pattern'],
                    additionalProperties: false,
                },
            },
        },
        {
            type: 'function',
            function: {
                name: EBOOK_TOOL_NAMES.READ,
                description: [
                    'Read a text file in the current book, or list a directory.',
                    'For files, returns line-numbered content. For directories, returns directory entries. Large files include continuation hints.',
                    'Use `tail` by itself when you need the end of a file.',
                    'The argument name is `filePath`, not `path`. File paths look like `book/outline.md`; directory paths look like `book/chapters/`.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        filePath: { type: 'string', description: 'File or directory path, for example `book/outline.md`, `book/chapters/001.md`, or `book/chapters/`. Do not pass path.' },
                        offset: { type: 'number', description: '1-based line or directory-entry offset. Default 1.' },
                        limit: { type: 'number', description: 'Maximum number of lines or entries to return. Default 1200, max 2000.' },
                        tail: { type: 'number', description: 'Return the final N lines of a file. Use by itself; do not combine with offset/limit.' },
                    },
                    required: ['filePath'],
                    additionalProperties: false,
                },
            },
        },
    ];

    if (webSearchEnabled) {
        definitions.push(getTavilySearchToolDefinition());
    }

    if (!readOnly) {
        definitions.push(
            {
                type: 'function',
                function: {
                    name: EBOOK_TOOL_NAMES.WRITE,
                    description: [
                        'Write a complete text file in the current book.',
                        'Use for creating files, complete file rewrites, whole sections, whole chapters, or rewrites where most content is new.',
                        'Read the target file first. Write overwrites the entire file, so include all original content you want to keep.',
                        'The argument names are `filePath` and `content`. Write replaces the complete target file content.',
                    ].join('\n'),
                    parameters: {
                        type: 'object',
                        properties: {
                            filePath: { type: 'string', description: 'Target file path, for example `book/chapters/001.md` or `book/notes/idea.md`.' },
                            content: { type: 'string', description: 'Full file content to write.' },
                        },
                        required: ['filePath', 'content'],
                        additionalProperties: false,
                    },
                },
            },
            {
                type: 'function',
                function: {
                    name: EBOOK_TOOL_NAMES.EDIT,
                    description: [
                        'Edit one existing current-book file by replacing original text fragments, replacing inclusive line ranges, inserting text at line positions, or removing text with empty replacements.',
                        'One call edits one file.',
                        'Use oldString/newString for local text replacement. Use startLine/endLine/newString for contiguous passage replacement where copying oldString would be fragile. Use insertAtLine/newString to add new text before a line or at the end without replacing existing text. Use Write instead for creating files, complete rewrites, or rewrites where most content is new.',
                        'Read the target file first unless the exact current text is already available in the conversation or a recent tool result. Line-range and insertion edits must use line numbers from the latest Read result.',
                        'Put multiple edits in the edits array. Line-range and insertion items may share one call when they use line numbers from the same Read result. Keep oldString edits separate from line-number edits unless the whole change can be expressed with line numbers.',
                        'The `edits` argument must be a non-empty array value, not a JSON-stringified string. Correct: `"edits":[{"startLine":10,"endLine":50,"newString":"..."}]`. Wrong: `"edits":"[{\\"startLine\\":10,\\"endLine\\":50,\\"newString\\":\\"...\\"}]"`.',
                        'Each edit item should choose exactly one mode. Omit unused mode fields when possible. If the provider/tool channel adds stray optional fields, Edit normalizes by priority: complete startLine/endLine wins, then insertAtLine, then oldString.',
                        'Correct line-range item: `{"startLine":10,"endLine":50,"newString":"..."}`. If a polluted item also contains oldString or insertAtLine, the complete startLine/endLine range is used and stray fields are ignored.',
                        'Do not issue multiple Edit tool calls for the same file in one assistant turn. Combine same-file changes into one Edit call, or wait for the first result before editing that file again.',
                        '',
                        '## Matching Rules',
                        'oldString must be an exact fragment present in the file, including spaces and newlines. To remove the matched word, sentence, or fragment, set newString to an empty string.',
                        'Common punctuation equivalence is supported, such as straight/curly quotes and ASCII/full-width comma or period. Replacements preserve the file punctuation style when possible.',
                        'For long oldString fragments, Edit can also tolerate whitespace-only differences such as indentation, line wrapping, or extra/missing blank lines.',
                        'Each oldString must be unique by default. Multiple matches return line numbers and context.',
                        'Line-range edits use 1-based inclusive startLine/endLine from Read output. A line range replaces the entire inclusive range with any length of newString; use an empty newString to remove the range. Replacement line count does not need to match the original range.',
                        'Insertion edits use 1-based insertAtLine from Read output. insertAtLine inserts before that line; use totalLines + 1 to append to the end of the file.',
                        'Line-range and insertion items in one call are applied by original Read line numbers from bottom to top automatically to avoid line-number shifts; do not adjust later line numbers yourself. If an insertion falls inside a line range being replaced, merge it into that line-range replacement.',
                        'Do not intentionally mix oldString edits with line-number edits in one Edit call. If one item is polluted by stray optional fields, the tool will still choose one mode by priority instead of failing.',
                        '',
                        '## Failure Handling',
                        'Not found: check whether oldString exactly matches the file content.',
                        'Multiple matches: expand oldString with more context to make it unique, or set `replaceAll: true`.',
                        '',
                        '## Notes',
                        'oldString edits execute in order. Line-range and insertion edits execute bottom-to-top by original line numbers. Do not let a later oldString match text just inserted by an earlier newString.',
                        'If two changes overlap, merge them into one replacement for the larger fragment instead of splitting them into separate edits.',
                        'Use Write for complete rewrites, complete new files, or when most of the file should be replaced.',
                    ].join('\n'),
                    parameters: {
                        type: 'object',
                        properties: {
                            filePath: { type: 'string', description: 'Target file path, for example `book/chapters/001.md` or `book/characters.md`.' },
                            edits: {
                                type: 'array',
                                description: 'List of edits as a real, non-empty JSON array, not a quoted JSON string. Each item should use exactly one mode: oldString/newString, startLine/endLine/newString, or insertAtLine/newString. Stray optional fields are ignored by mode priority when possible.',
                                items: {
                                    type: 'object',
                                    properties: {
                                        oldString: { type: 'string', description: 'Original text fragment to replace. Must match exactly, with common punctuation/long-whitespace tolerance. Do not use an empty oldString; use Write to create files.' },
                                        startLine: { type: 'number', description: '1-based inclusive start line from the latest Read result. Use with endLine instead of oldString.' },
                                        endLine: { type: 'number', description: '1-based inclusive end line from the latest Read result. Use with startLine instead of oldString.' },
                                        insertAtLine: { type: 'number', description: '1-based insertion point from the latest Read result. Inserts before this line. Use totalLines + 1 to append to the end of the file.' },
                                        newString: { type: 'string', description: 'Replacement, inserted text, or an empty string to delete the matched fragment or line range.' },
                                        replaceAll: { type: 'boolean', description: 'Whether to replace all matches. Default false.' },
                                    },
                                    required: ['newString'],
                                    additionalProperties: false,
                                },
                            },
                        },
                        required: ['filePath', 'edits'],
                        additionalProperties: false,
                    },
                },
            },
            {
                type: 'function',
                function: {
                    name: EBOOK_TOOL_NAMES.DELETE,
                    description: [
                        'Delete a file or directory in the current book.',
                        'Can delete one file, or a directory and its files.',
                        'Do not delete chapters, sources, settings, or review notes unless necessary. Be careful even when cleaning drafts.',
                        'Directory paths should end with `/`, for example `book/notes/`. File deletion uses the full file path.',
                    ].join('\n'),
                    parameters: {
                        type: 'object',
                        properties: {
                            path: { type: 'string', description: 'Target file or directory path, for example `book/reviews/old.md` or `book/notes/`. Keep the trailing `/` for directory deletion.' },
                        },
                        required: ['path'],
                        additionalProperties: false,
                    },
                },
            },
            {
                type: 'function',
                function: {
                    name: EBOOK_TOOL_NAMES.MOVE,
                    description: [
                        'Move or rename a file or directory in the current book.',
                        'Use to organize chapter, source, setting, or review-note paths and names.',
                        'If the destination already exists, overwriting must be explicit. Do not move a directory into itself.',
                        'The argument names are `fromPath` and `toPath`. For directories, both paths should be `book/.../`.',
                    ].join('\n'),
                    parameters: {
                        type: 'object',
                        properties: {
                            fromPath: { type: 'string', description: 'Source path, for example `book/notes/draft.md` or `book/notes/`.' },
                            toPath: { type: 'string', description: 'Destination path, for example `book/notes/revision-plan.md` or `book/archive/notes/`.' },
                            overwrite: { type: 'boolean', description: 'Whether overwrite is allowed when the destination already exists. Default false.' },
                        },
                        required: ['fromPath', 'toPath'],
                        additionalProperties: false,
                    },
                },
            },
            {
                type: 'function',
                function: {
                    name: EBOOK_TOOL_NAMES.PLAN_CREATE,
                    description: [
                        'Create a writing plan item for the current book.',
                        'Use for multi-step writing, long revisions, blockers, or tasks that need later continuation.',
                        'Plans only record state. They do not automatically review, draft prose, or call other tools.',
                        'Use only when the task needs multi-step tracking. Short direct writing or one-off answers do not need a plan.',
                        'PlanCreate always creates a new item. The returned id is only an internal handle for later PlanUpdate/PlanGet, not evidence that a plan already existed.',
                        'Do not expose plan ids to the user unless they explicitly ask for debugging details.',
                    ].join('\n'),
                    parameters: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', description: 'Short concrete outcome, not a vague category.' },
                            detail: { type: 'string', description: 'Necessary background, done criteria, target files, or checks needed.' },
                            priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], description: 'Priority. Default normal; raise only for real urgency.' },
                            owner: { type: 'string', description: 'Who should move it forward. Default assistant; use user when user input or confirmation is needed.' },
                            blockedBy: { type: 'array', items: { type: 'string' }, description: 'Plan ids that must be completed before this item can start.' },
                            note: { type: 'string', description: 'Optional first progress note or reason this item exists.' },
                        },
                        required: ['title'],
                        additionalProperties: false,
                    },
                },
            },
            {
                type: 'function',
                function: {
                    name: EBOOK_TOOL_NAMES.PLAN_UPDATE,
                    description: [
                        'Update a writing plan item for the current book after real progress.',
                        'Use status for progress, note for short progress notes, and result/error for final outcome or failure reason.',
                        'Mark completed only after the corresponding writing, review, or revision is actually done.',
                        'If dependencies are not complete, the item cannot move to in_progress.',
                        'The `id` must come from PlanCreate or PlanList. Do not invent an id-like value.',
                        'The id is an internal handle for tools. Do not present it to the user as meaningful content.',
                    ].join('\n'),
                    parameters: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'Plan id returned by PlanCreate or PlanList.' },
                            title: { type: 'string', description: 'Optional clearer replacement title.' },
                            detail: { type: 'string', description: 'Optional replacement background or done criteria.' },
                            status: { type: 'string', enum: ['pending', 'in_progress', 'blocked', 'completed', 'failed', 'cancelled'], description: 'New progress state.' },
                            priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], description: 'New priority.' },
                            owner: { type: 'string', description: 'New owner.' },
                            blockedBy: { type: 'array', items: { type: 'string' }, description: 'Replacement blocker id list; pass an empty array to clear blockers.' },
                            note: { type: 'string', description: 'Append one short progress note.' },
                            result: { type: 'string', description: 'Concrete result, usually for completed items.' },
                            error: { type: 'string', description: 'Failure reason or blocking error, usually for failed items.' },
                        },
                        required: ['id'],
                        additionalProperties: false,
                    },
                },
            },
            {
                type: 'function',
                function: {
                    name: EBOOK_TOOL_NAMES.PLAN_LIST,
                    description: [
                        'List writing plans for the current book.',
                        'Use when continuing writing, continuing revisions, avoiding duplicate plans, choosing next steps, or checking blockers.',
                        'Without filters, returns current plans. Use status, priority, or owner only when narrowing the result.',
                        'If you are unsure whether a related plan already exists, use PlanList before creating or updating.',
                        'Plan ids in the result are internal handles for future tool calls. Summarize plans by title/status for the user.',
                    ].join('\n'),
                    parameters: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', enum: ['pending', 'in_progress', 'blocked', 'completed', 'failed', 'cancelled'], description: 'Optional status filter.' },
                            priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], description: 'Optional priority filter.' },
                            owner: { type: 'string', description: 'Optional owner filter.' },
                            limit: { type: 'number', description: 'Maximum items to return. Default 50, max 100.' },
                        },
                        additionalProperties: false,
                    },
                },
            },
            {
                type: 'function',
                function: {
                    name: EBOOK_TOOL_NAMES.PLAN_GET,
                    description: [
                        'Read the full record of one writing plan item for the current book.',
                        'Use when the plan summary is not enough and you need details, blockers, notes, result, or error.',
                        'The `id` must come from PlanCreate or PlanList.',
                        'The id is an internal handle for tools. Do not present it to the user as meaningful content.',
                    ].join('\n'),
                    parameters: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'Plan id returned by PlanCreate or PlanList.' },
                        },
                        required: ['id'],
                        additionalProperties: false,
                    },
                },
            },
            {
                type: 'function',
                function: {
                    name: EBOOK_TOOL_NAMES.RENAME_BOOK,
                    description: [
                        'Rename the current book.',
                        'Changes only the book title. Does not move chapters, sources, or setting files.',
                        'Use when the user asks to change the book name, change the title, or rename the current work.',
                        'The only argument is `title`. Do not use Write on a file to rename the book.',
                    ].join('\n'),
                    parameters: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', description: 'New book title. Leading/trailing whitespace is trimmed; max 120 characters are kept.' },
                        },
                        required: ['title'],
                        additionalProperties: false,
                    },
                },
            },
            {
                type: 'function',
                function: {
                    name: EBOOK_TOOL_NAMES.DELEGATE_RUN,
                    description: [
                        'Ask a read-only reviewer delegate to independently inspect the current book and return findings to you.',
                        'Use for clear, independent, verifiable review tasks, continuity checks, source verification, or issue localization.',
                        'The delegate knows only the task, context, deliverable, automatically injected review context, and any book content it reads.',
                        'The delegate cannot write files, manage plans, or delegate further.',
                        '`task` is required. Put paths, factual background, and scope in `context`; put expected result shape in `deliverable`. Do not use this as a writing or editing tool.',
                    ].join('\n'),
                    parameters: {
                        type: 'object',
                        properties: {
                            task: { type: 'string', description: 'Concrete review or verification task.' },
                            context: { type: 'string', description: 'Necessary background, paths to inspect, known facts, or scope.' },
                            deliverable: { type: 'string', description: 'Expected result format or evidence requirements.' },
                        },
                        required: ['task'],
                        additionalProperties: false,
                    },
                },
            },
        );
    }

    return definitions;
}

export function describeEbookToolCall(name = '', args = {}) {
    switch (name) {
        case EBOOK_TOOL_NAMES.LS:
            return `查看作品目录 ${args.path || ''}`.trim();
        case EBOOK_TOOL_NAMES.GLOB:
            return `匹配作品文件 ${args.pattern || ''}`.trim();
        case EBOOK_TOOL_NAMES.GREP:
            return `搜索作品 ${args.pattern || ''}`.trim();
        case EBOOK_TOOL_NAMES.READ:
            return `读取 ${args.filePath || ''}`.trim();
        case EBOOK_TOOL_NAMES.WEB_SEARCH:
            return `联网查资料 ${args.query || ''}`.trim();
        case EBOOK_TOOL_NAMES.WRITE:
            return `写入 ${args.filePath || args.path || ''}`.trim();
        case EBOOK_TOOL_NAMES.EDIT:
            return `修订 ${args.filePath || ''}`.trim();
        case EBOOK_TOOL_NAMES.DELETE:
            return `删除 ${args.path || ''}`.trim();
        case EBOOK_TOOL_NAMES.MOVE:
            return `移动 ${args.fromPath || ''}${args.toPath ? ` -> ${args.toPath}` : ''}`.trim();
        case EBOOK_TOOL_NAMES.PLAN_CREATE:
            return `创建计划 ${args.title || ''}`.trim();
        case EBOOK_TOOL_NAMES.PLAN_UPDATE:
            return `更新计划 ${args.id || ''}`.trim();
        case EBOOK_TOOL_NAMES.PLAN_LIST:
            return '查看书籍计划';
        case EBOOK_TOOL_NAMES.PLAN_GET:
            return `查看计划 ${args.id || ''}`.trim();
        case EBOOK_TOOL_NAMES.RENAME_BOOK:
            return `修改书名 ${args.title || ''}`.trim();
        case EBOOK_TOOL_NAMES.DELEGATE_RUN:
            return `审稿分身 ${args.task || ''}`.trim();
        default:
            return `调用工具 ${name}`;
    }
}
