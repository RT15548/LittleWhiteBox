import { filterSkillTools } from '../shared/skill-tools.js';
import { COORDINATION_TOOLS, SKILL_MANAGEMENT_TOOLS } from '../skills/contract.js';
import { formatWebSearchResults, WEB_SEARCH_TOOL_NAME, WEB_FETCH_TOOL_NAME, getWebSearchToolDefinition, getWebFetchToolDefinition, isWebConfigured } from '../../agent-core/web/tools.js';
import { ACTIVITY_COPY } from './ui/activity-copy.js';
import { getToolResultReadDefinition, TOOL_RESULT_READ, withPagedToolResult } from '../../agent-core/runtime/tool-result-contract.js';
import { CARD_TOOL, CARD_ASSETS_TOOL, SET_CARD_AVATAR_ACTION } from '../../card-workspace/assistant-contract.js';
import { drawTools, DRAW_IMAGE, DRAW_PRESETS, SAVE_DRAW_IMAGES, DRAW_COPY } from '../../draw/assistant/contract.js';
import { READ_IMAGE, READ_IMAGE_TOOL, IMAGE_COPY, imageResultFiles } from '../shared/image-tools.js';
import { COPY as CARD_COPY } from '../../card-workspace/copy.js';
import { LOOKUP_SCOPES, LOOKUP_SCOPE_PROJECT, LOOKUP_SCOPE_LOCAL } from '../shared/lookup-scope.js';
import { INSPECT_PAGE_TOOL } from '../../live-page-inspection/tool-contract.ts';
import { COPY as INSPECTION_COPY } from '../../live-page-inspection/contract.ts';
import { READ_LOGS_TOOL, LOG_TOOL_COPY } from '../../debug-panel/log-tool-contract.js';

function lookupScopeParameter(pathParameter = 'path') {
    return {
        type: 'string',
        enum: LOOKUP_SCOPES,
        description: `File source; the path itself goes in ${pathParameter}. ${LOOKUP_SCOPE_PROJECT} (default) = project code, with paths that omit \`public/\`, e.g. \`scripts/extensions/third-party/LittleWhiteBox/index.js\`. ${LOOKUP_SCOPE_LOCAL} = the assistant workspace, with paths that keep the \`local/\` prefix, e.g. \`local/notes.md\`.`,
    };
}

// ============================================================
// 工具名称常量
// ============================================================
export const TOOL_NAMES = {
    READ_LOGS: READ_LOGS_TOOL.function.name,
    INSPECT_PAGE: INSPECT_PAGE_TOOL.function.name,
    CARD_FILES: CARD_TOOL.function.name,
    CARD_ASSETS: CARD_ASSETS_TOOL.function.name,
    DRAW_IMAGE, DRAW_PRESETS, SAVE_DRAW_IMAGES, READ_IMAGE,
    LS: 'LS',
    GLOB: 'Glob',
    GREP: 'Grep',
    READ: 'Read',
    WEB_SEARCH: WEB_SEARCH_TOOL_NAME,
    WEB_FETCH: WEB_FETCH_TOOL_NAME,
    TOOL_RESULT_READ,
    WRITE: 'Write',
    APPLY_PATCH: 'apply_patch',
    DELETE: 'Delete',
    MOVE: 'Move',
    RUN_SLASH_COMMAND: 'RunSlashCommand',
    RUN_JAVASCRIPT_API: 'RunJavaScriptApi',
    READ_IDENTITY: 'ReadIdentity',
    WRITE_IDENTITY: 'WriteIdentity',
    READ_WORKLOG: 'ReadWorklog',
    WRITE_WORKLOG: 'WriteWorklog',
    PLAN_CREATE: COORDINATION_TOOLS.PLAN_CREATE,
    PLAN_UPDATE: COORDINATION_TOOLS.PLAN_UPDATE,
    PLAN_LIST: COORDINATION_TOOLS.PLAN_LIST,
    PLAN_GET: COORDINATION_TOOLS.PLAN_GET,
    DELEGATE_RUN: COORDINATION_TOOLS.DELEGATE_RUN,
    READ_SKILLS_CATALOG: 'ReadSkillsCatalog',
    READ_SKILL: 'ReadSkill',
    UPDATE_SKILL: SKILL_MANAGEMENT_TOOLS.UPDATE_SKILL,
    SAVE_SKILL_FILE: 'SaveSkillFile',
    GENERATE_SKILL: SKILL_MANAGEMENT_TOOLS.GENERATE_SKILL,
    DELETE_SKILL: SKILL_MANAGEMENT_TOOLS.DELETE_SKILL,
};

// ============================================================
// 工具定义
// ============================================================
// Image tools depend on whether the run's model preset accepts image input.
const IMAGE_TOOLS_SLOT = Symbol('imageTools');
function imageToolDefinitions(imageInput) {
    return [...(imageInput ? [READ_IMAGE_TOOL] : []), ...drawTools({ imageInput })];
}

const BASE_TOOL_DEFINITIONS = [
    withPagedToolResult(READ_LOGS_TOOL),
    INSPECT_PAGE_TOOL,
    CARD_TOOL,
    CARD_ASSETS_TOOL,
    IMAGE_TOOLS_SLOT,
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.LS,
            description: [
                'List the first-level files and directories of a directory.',
                'Returns items, total and nextOffset for the following page; nextOffset is null at the end.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Directory to list.' },
                    scope: lookupScopeParameter(),
                    offset: { type: 'number', description: '1-based entry offset. Default 1.' },
                    limit: { type: 'number', description: 'Entries per page. Default 100, max 300.' },
                },
                required: ['path'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.GLOB,
            description: [
                'Find files whose paths match a glob pattern.',
                'Returns up to 100 matching paths with total; when truncated is true, narrow the pattern or path.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    pattern: { type: 'string', description: 'Glob pattern for file paths, e.g. `scripts/extensions/third-party/LittleWhiteBox/modules/**/*.js`.' },
                    path: { type: 'string', description: 'Optional directory or exact file that limits the search.' },
                    scope: lookupScopeParameter(),
                },
                required: ['pattern'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.GREP,
            description: [
                'Search current file contents line by line, case-insensitively, by regular expression or literal text.',
                'Returns items in the chosen outputMode and nextOffset for the following page. searchComplete is false when results were truncated or some files could not be read; totals then cover only the scanned part.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    pattern: { type: 'string', description: 'JavaScript regular expression, or literal text when useRegex is false.' },
                    path: { type: 'string', description: 'Optional directory or exact file that limits the search.' },
                    scope: lookupScopeParameter(),
                    include: { type: 'string', description: 'Optional glob filter for file paths, e.g. `**/*.js`.' },
                    outputMode: {
                        type: 'string',
                        enum: ['content', 'files_with_matches', 'count'],
                        description: 'content = matching lines with optional context; files_with_matches = matching files; count = match count per file. Default content.',
                    },
                    limit: { type: 'number', description: 'Results per page. Default 100, max 100.' },
                    offset: { type: 'number', description: 'Results to skip. Default 0.' },
                    contextLines: { type: 'number', description: 'Lines shown before and after each match in content mode. Default 0, max 5.' },
                    useRegex: { type: 'boolean', description: 'Default true; false searches for the literal text.' },
                },
                required: ['pattern'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.READ,
            description: [
                'Read the current contents of a text file as numbered lines, or list a directory.',
                'Returns up to 2000 lines or entries with nextOffset for the following range; nextOffset is null at the end.',
                'All results in a tool batch share the next model request\'s context budget. Read needed sections with offset and limit; page through large files in successive batches.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'File or directory to read.' },
                    scope: lookupScopeParameter('filePath'),
                    offset: { type: 'number', description: '1-based line or entry offset. Default 1.' },
                    limit: { type: 'number', description: 'Lines or entries to return. Default 2000, max 2000.' },
                    tail: { type: 'number', description: 'Return the last N lines of a file, max 2000. Use alone, without offset or limit.' },
                },
                required: ['filePath'],
                additionalProperties: false,
            },
        },
    },
    withPagedToolResult(getWebSearchToolDefinition()),
    withPagedToolResult(getWebFetchToolDefinition()),
    getToolResultReadDefinition(),
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.WRITE,
            description: [
                'Write a `local/` text file. Use for new files or whole-file rewrites.',
                'On success, returns the saved path, whether it was created or overwritten, and its byte and line counts. Zero lines means the saved file is empty.',
                'Can directly create a new `local/...` file path, including `local/file.txt` or `local/<root>/file.txt`.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Target `local/...` file path, for example local/README.md or local/my-plugin/README.md.' },
                    content: { type: 'string', description: 'Full text content to write.' },
                },
                required: ['filePath', 'content'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.APPLY_PATCH,
            description: [
                'Apply a batch of changes to workspace text files. A batch can edit, create, delete and move multiple files. If any operation fails, none of the changes are saved.',
                'Use line numbers from Read. If a previous edit makes the target line number uncertain, use Read on the target area before editing it by line number.',
                'Group all edits to a file in one entry. Line edits in that entry refer to the same pre-edit content; the tool handles shifts. Use either line positions or oldString for that file.',
                'Returns ok and phase (applied, unchanged or failed). Successful results list changes, with numbered previews for line edits; failed results report the issue or conflicting paths.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    files: {
                        type: 'array', minItems: 1,
                        items: {
                            type: 'object', required: ['path'], additionalProperties: false,
                            description: 'Use content to create, delete: true to remove, or edits and/or moveTo for an existing file.',
                            properties: {
                                path: { type: 'string', description: 'Workspace file path starting with local/.' },
                                content: { type: 'string', description: 'Full content for a new file. The path must not exist.' },
                                delete: { type: 'boolean', description: 'Set true to delete this file.' },
                                moveTo: { type: 'string', description: 'An unused local/ path to move this file to. Can be combined with edits.' },
                                edits: {
                                    type: 'array', minItems: 1,
                                    items: {
                                        type: 'object', required: ['newString'], additionalProperties: false,
                                        properties: {
                                            startLine: { type: 'integer', minimum: 1, description: 'First line to replace, inclusive.' },
                                            endLine: { type: 'integer', minimum: 1, description: 'Last line to replace, inclusive.' },
                                            insertAtLine: { type: 'integer', minimum: 1, description: 'Insert before this line. Use totalLines + 1 to append.' },
                                            oldString: { type: 'string', minLength: 1, description: 'A unique fragment of the current text.' },
                                            newString: { type: 'string', description: 'Replacement or inserted text. Use an empty string to remove the selected lines or fragment.' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                required: ['files'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.DELETE,
            description: [
                'Delete a `local/` file or directory.',
                'On success, returns the removed path, whether it was a file or directory, and how many files were removed. Removing an empty directory reports zero files.',
                'Supports deleting a single file or a directory with all files under it.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Target `local/...` file or directory path, for example local/my-plugin/obsolete.txt or local/my-plugin/old/.' },
                },
                required: ['path'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.MOVE,
            description: [
                'Move or rename a `local/` file or directory.',
                'On success, reports the source and destination paths, whether the destination was overwritten, and how many files moved.',
                'A move to the same location succeeds without changing anything (`noOp: true`). Moving an empty directory also reports zero files, but does change its location.',
                'Supports renaming files, moving files, and moving whole directories; existing destinations require explicit overwrite permission.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    fromPath: { type: 'string', description: 'Source `local/...` file or directory path.' },
                    toPath: { type: 'string', description: 'Destination `local/...` file or directory path.' },
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
            name: TOOL_NAMES.RUN_SLASH_COMMAND,
            description: [
                'Execute a SillyTavern slash command (STscript).',
                'Returns the command output in `pipe` and reports whether execution succeeded, failed, was aborted, or was skipped without running. An empty `pipe` alone does not indicate failure.',
                'If the output does not confirm a requested change, read the affected state before retrying.',
                'Use this for reading or operating on objects and state in the user\'s live SillyTavern instance, such as character cards, lorebooks, chat, presets, extensions, or current model settings.',
                'This operates on the current live instance, not a snapshot.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    command: { type: 'string', description: 'Slash command text to execute, for example /api, /model, /char-get field=name, or /char-create name="Alice".' },
                },
                required: ['command'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.RUN_JAVASCRIPT_API,
            description: [
                'Run JavaScript against the live SillyTavern frontend.',
                'Use this when STscript or slash commands do not provide the needed entry point and you need to inspect, read, or operate on public frontend objects and state such as chatMetadata, saveMetadata, or public extension exports.',
                'Code runs as an async function with normal JavaScript syntax and top-level await. Injected `ctx` and `getContext()` expose the documented context; `st` contains public script / extensions / slash namespaces, `st.state3` (ReadSkill builtin-state3), and `st.iframeRenderer` (ReadSkill builtin-live-page). The API reference lists available entry points; nested data is read from the live instance.',
                'The script itself returns the result; a return inside a callback only returns to that callback. Use return null when there is no data to return.',
                'The tool classifies the code automatically as inspect, read, effect, or unknown. The Permission Mode section describes whether confirmation is required.',
                'Returns ok, output, execution diagnostics, and any truncation flags. usedApis and calledApis describe references found in the code, not an execution trace. Return a focused result rather than an entire chat or metadata tree.',
                'Cancellation stops waiting and checks for cancellation as the script resumes. Already-started saves or network requests are not undone. After a cancellation or execution error, inspect the affected state before retrying a modification.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'Async JavaScript function body, including a return for the final result.' },
                    purpose: { type: 'string', description: 'What this code is intended to do.' },
                    apiPaths: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Optional API references for explaining the request to the user, such as ctx.chatMetadata or ctx.saveMetadata. These do not grant permissions or replace code analysis.',
                    },
                    safety: { type: 'string', description: 'Optional safety note, for example read-only or which objects/state may be modified. Mainly used for explanation and approval copy.' },
                    expectedOutput: { type: 'string', description: 'What result is expected to be returned.' },
                },
                required: ['code', 'purpose', 'expectedOutput'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.READ_IDENTITY,
            description: [
                'Read the fixed identity file at user/files/LittleWhiteBox_Assistant_Identity.md.',
                'Returns the filename, whether it exists, and its contents. If it does not exist, the returned text is empty; an existing file may also be empty.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {},
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.WRITE_IDENTITY,
            description: [
                'Replace the identity document at user/files/LittleWhiteBox_Assistant_Identity.md.',
                'On success, returns the saved filename and path and confirms that the current assistant session has refreshed its identity.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    content: { type: 'string', description: 'Full identity document content.' },
                },
                required: ['content'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.READ_WORKLOG,
            description: [
                'Read the configured worklog file under user/files. The default is LittleWhiteBox_Assistant_Worklog.md.',
                'Returns the filename, whether it exists, and its contents. If it does not exist, the returned text is empty; an existing file may also be empty.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {},
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.WRITE_WORKLOG,
            description: [
                'Replace a worklog document under user/files. Omit name to write to the configured worklog (LittleWhiteBox_Assistant_Worklog.md by default).',
                'On success, returns the filename and path that were saved.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Worklog filename.' },
                    content: { type: 'string', description: 'Full document content.' },
                },
                required: ['content'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.PLAN_CREATE,
            description: [
                'Create one session-scoped checklist item in the current assistant session.',
                'Returns the new item and its unfinished blockers. It starts pending if there are no blockers, or blocked otherwise. Use its id in PlanGet or PlanUpdate.',
                'Use for multi-step work, long investigations, blockers, or resumable follow-up.',
                'This records work state only; it does not execute tools, delegate work, or write long-term memory.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'Short concrete outcome, not a vague category.' },
                    detail: { type: 'string', description: 'Useful context, done criteria, or exact checks needed to finish.' },
                    priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], description: 'Use normal by default; raise only for real urgency.' },
                    owner: { type: 'string', description: 'Who is expected to move it forward. Default assistant; use user only for user-side actions.' },
                    blockedBy: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Plan ids that must be completed before this item can start.',
                    },
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
            name: TOOL_NAMES.PLAN_UPDATE,
            description: [
                'Update one session-scoped checklist item after actual progress, a status change, blocker, or decision.',
                'Returns the saved item and its remaining blockers. An item cannot be saved as in_progress while blockers remain; the result lists the blockers and no update is saved.',
                'Use status for progress state, note for a short progress note, and result/error for final outcome or failure cause.',
                'Only mark completed when the described work is actually done.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Plan id returned by PlanCreate or PlanList.' },
                    title: { type: 'string', description: 'Optional clearer replacement title.' },
                    detail: { type: 'string', description: 'Optional replacement context or done criteria.' },
                    status: {
                        type: 'string',
                        enum: ['pending', 'in_progress', 'blocked', 'completed', 'failed', 'cancelled'],
                        description: 'New progress state.',
                    },
                    priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], description: 'New priority when importance changed.' },
                    owner: { type: 'string', description: 'New owner when responsibility changed.' },
                    blockedBy: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Replacement blocker id list; pass an empty array to clear blockers.',
                    },
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
            name: TOOL_NAMES.PLAN_LIST,
            description: [
                'List session-scoped checklist items for the current assistant session.',
                'Returns matching items, most recently updated first, and the total match count before the limit. An empty list means no items matched; if truncated, narrow the filters.',
                'Use before resuming work, avoiding duplicate plans, choosing the next tracked step, or checking blockers.',
                'Leave filters empty for the current checklist; add status, priority, or owner only when narrowing.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        enum: ['pending', 'in_progress', 'blocked', 'completed', 'failed', 'cancelled'],
                        description: 'Optional status filter, for example pending or blocked.',
                    },
                    priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], description: 'Optional priority filter.' },
                    owner: { type: 'string', description: 'Optional owner filter, for example assistant or user.' },
                    limit: { type: 'number', description: 'Maximum items to return. Default 50, max 100.' },
                },
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.PLAN_GET,
            description: [
                'Read the full record for one session-scoped checklist item.',
                'Returns the item and its currently unfinished blockers. An unknown id returns a not-found error; use PlanList to find ids in this session.',
                'Use when the short current-plan snapshot is not enough and the next action depends on detail, blockers, notes, result, or error.',
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
            name: TOOL_NAMES.DELEGATE_RUN,
            description: [
                'Run one clear, independent subtask in a separate assistant turn and wait for its result.',
                'Returns the subtask status, its conclusion and summary, and recent tool outcomes. A failed run reports why and may have no conclusion even if it already ran tools.',
                'Completed means the delegate returned a conclusion; check its findings and tool outcomes before treating the requested work as done.',
                'Use after you can state the subtask scope and how its result should be merged back into the main answer.',
                'The delegate only knows task/context/deliverable plus its system prompt; include needed paths, facts, constraints, current context, and plan details explicitly.',
                'The delegate can use normal execution tools, but it does not manage plans and cannot delegate again.',
                'Drawing results accompany its conclusion: images are saved workspace files; drawingFailures contain unresolved outcomes. A receiptId can be passed to SaveDrawImages to save an existing batch without generating again.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    task: { type: 'string', description: 'Concrete subtask goal. Include the exact question or work item.' },
                    context: { type: 'string', description: 'Optional necessary background, paths, facts, constraints, current context, plan details, or prior findings.' },
                    deliverable: { type: 'string', description: 'Optional expected result shape, checks, or evidence to return.' },
                },
                required: ['task'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.READ_SKILLS_CATALOG,
            description: [
                'Read the skill catalog at user/files/LittleWhiteBox_Assistant_Skills.json. If the file is missing, an empty catalog for user-created skills is created.',
                'Returns entries for user-created and built-in skills, the total and enabled counts, and a short catalog summary. Use ReadSkill with an entry id to read its instructions.',
                'An unreadable or invalid catalog is reported as an error, not an empty list.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {},
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.READ_SKILL,
            description: 'Read one skill and enable its listed tools for subsequent requests in this conversation. Returns ok, id, content and skill metadata; built-in skills also return builtin and tools. Prefer id; filename is also allowed. Successful reads remain enabled after history summarization and reopening; clearing the conversation resets the selection.',
            parameters: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Skill id, for example skill-plugin-debugging.' },
                    filename: { type: 'string', description: 'Skill filename, for example LittleWhiteBox_Assistant_Skill_plugin-debugging.md.' },
                },
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.UPDATE_SKILL,
            description: [
                'Update the body or metadata of an existing skill and sync the changes back to the skill file and Skills.json. Prefer id; filename is also allowed. Partial updates are supported and omitted fields keep their current values.',
                'On success, returns the saved skill id, title, filename, and whether it is enabled. A disabled skill was still saved.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Skill id, for example skill-plugin-debugging.' },
                    filename: { type: 'string', description: 'Skill filename, for example LittleWhiteBox_Assistant_Skill_plugin-debugging.md.' },
                    title: { type: 'string', description: 'Optional new title.' },
                    summary: { type: 'string', description: 'Optional new one-line summary.' },
                    triggers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Optional new trigger keyword list.',
                    },
                    slashTriggers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Optional new slash trigger command list, for example /写插件.',
                    },
                    when_to_use: { type: 'string', description: 'Optional new when_to_use text.' },
                    content: { type: 'string', description: 'Optional new skill body markdown, without frontmatter.' },
                    enabled: { type: 'boolean', description: 'Optional; whether the skill should be enabled.' },
                },
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.GENERATE_SKILL,
            description: [
                'Turn a just-finished large workflow, repeated trial-and-error process, or other reusable procedure into a skill.',
                'You must call `action: "propose"` first to ask for user approval. An approved proposal returns the skill id, filename, a one-time approvalToken and writing instructions; the skill is not yet saved. If approval is declined, stop without calling `action: "save"`.',
                'Use the returned id and approvalToken with `action: "save"` and explicitly provide all required save fields. A successful save writes the skill file and catalog entry and returns the saved skill details, including whether it is enabled.',
                'If a save reports missing trigger fields, the skill was saved; use UpdateSkill to supply the fields named in the result.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        enum: ['propose', 'save'],
                        description: 'propose asks for user approval; save performs the actual write after approvalToken has been obtained.',
                    },
                    title: { type: 'string', description: 'Skill title, for example “长流程插件排错”.' },
                    reason: { type: 'string', description: 'Why this is worth turning into a skill. Required only for propose.' },
                    sourceSummary: { type: 'string', description: 'Short summary of the process this skill comes from. Required only for propose.' },
                    approvalToken: { type: 'string', description: 'One-time token returned after a successful propose step. Required only for save.' },
                    id: { type: 'string', description: 'Suggested skill id returned by propose. Required only for save.' },
                    summary: { type: 'string', description: 'One-line skill summary. Required only for save.' },
                    triggers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Trigger keyword list. Required only for save.',
                    },
                    slashTriggers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Slash trigger command list, for example /写插件. Required only for save.',
                    },
                    when_to_use: { type: 'string', description: 'When this skill should be used. Required only for save.' },
                    content: { type: 'string', description: 'Skill body markdown without frontmatter. Required only for save.' },
                    enabled: { type: 'boolean', description: 'Whether the skill should be enabled after saving. Required only for save.' },
                },
                required: ['action'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.DELETE_SKILL,
            description: [
                'Delete an existing skill by id or filename; prefer id.',
                'On success, returns the removed skill id, title, and filename. The catalog entry was removed even if `fileDeleted` is false, which means the skill file was already missing.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Skill id, for example skill-plugin-debugging.' },
                    filename: { type: 'string', description: 'Skill filename, for example LittleWhiteBox_Assistant_Skill_plugin-debugging.md.' },
                },
                additionalProperties: false,
            },
        },
    },
];

/** @param {{ imageInput?: boolean }} [options] */
export function buildToolDefinitions({ imageInput = true } = {}) {
    return BASE_TOOL_DEFINITIONS.flatMap(definition => definition === IMAGE_TOOLS_SLOT ? imageToolDefinitions(imageInput) : [definition]);
}

export const TOOL_DEFINITIONS = buildToolDefinitions();

export function isWebTool(name) {
    return name === TOOL_NAMES.WEB_SEARCH || name === TOOL_NAMES.WEB_FETCH;
}

/** @param {{ providerConfig?: object, jsApiEnabled?: boolean, imageInput?: boolean, skillIds?: string[], role?: string }} options */
export function getAssistantToolDefinitions({ providerConfig = {}, jsApiEnabled = false, imageInput = true, skillIds = [], role = 'main' } = {}) {
    const webEnabled = isWebConfigured(providerConfig);
    return filterSkillTools(buildToolDefinitions({ imageInput }), skillIds, { role }).filter(({ function: { name } }) =>
        (jsApiEnabled || name !== TOOL_NAMES.RUN_JAVASCRIPT_API) && (webEnabled || !isWebTool(name)));
}

function safeJsonParse(text, fallback = null) {
    try {
        return JSON.parse(text || 'null');
    } catch {
        return fallback;
    }
}

function formatToolOutput(value) {
    if (value === undefined || value === '') return '';
    return typeof value === 'string'
        ? value
        : JSON.stringify(value, null, 2);
}

function formatPreviewList(items = [], formatter) {
    const previewItems = items.slice(0, 3);
    const lines = [];
    previewItems.forEach((item) => lines.push(formatter(item)));
    if (items.length > previewItems.length) {
        lines.push(`……其余 ${items.length - previewItems.length} 项见详细结果`);
    }
    return lines;
}

function truncateInlineText(value = '', limit = 220) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

export function describeToolCall(name, args = {}) {
    switch (name) {
        case TOOL_NAMES.DRAW_IMAGE: return DRAW_COPY.generate;
        case TOOL_NAMES.DRAW_PRESETS: return DRAW_COPY.presets;
        case TOOL_NAMES.SAVE_DRAW_IMAGES: return args.receiptId ? DRAW_COPY.save : DRAW_COPY.pending;
        case TOOL_NAMES.READ_IMAGE: return IMAGE_COPY.read;
        case TOOL_NAMES.CARD_ASSETS: return CARD_COPY.assetActions[args.action] || CARD_COPY.assets;
        case TOOL_NAMES.READ_LOGS:
            return LOG_TOOL_COPY.label;
        case TOOL_NAMES.INSPECT_PAGE:
            return INSPECTION_COPY.label;
        case TOOL_NAMES.CARD_FILES:
            if (args.action === SET_CARD_AVATAR_ACTION) return CARD_COPY.setAvatar;
            return args.action === 'save' ? CARD_COPY.save : CARD_COPY.open;
        case TOOL_NAMES.LS:
            return `查看目录 ${args.path || ''}${args.offset ? `:${args.offset}` : ''}`.trim();
        case TOOL_NAMES.GLOB:
            return `匹配文件 ${args.pattern || ''}${args.path ? ` @ ${args.path}` : ''}`.trim();
        case TOOL_NAMES.GREP:
            return `搜索内容 ${args.pattern || ''}${args.path ? ` @ ${args.path}` : ''}`.trim();
        case TOOL_NAMES.READ:
            return `读取文件 ${(args.filePath || args.path || '')}${args.tail ? ` tail:${args.tail}` : args.offset ? `:${args.offset}` : args.startLine ? `:${args.startLine}` : ''}`.trim();
        case TOOL_NAMES.WEB_SEARCH:
            return `联网搜索 ${args.query || ''}`.trim();
        case TOOL_NAMES.WEB_FETCH:
            return ACTIVITY_COPY.webFetch(Array.isArray(args.urls) ? args.urls : []);
        case TOOL_NAMES.TOOL_RESULT_READ:
            return ACTIVITY_COPY.readResultPage;
        case TOOL_NAMES.WRITE:
            return `写入文件 ${args.filePath || args.path || ''}`.trim();
        case TOOL_NAMES.APPLY_PATCH:
            return '应用补丁';
        case TOOL_NAMES.DELETE:
            return `删除文件 ${args.path || ''}`.trim();
        case TOOL_NAMES.MOVE:
            return `移动文件 ${(args.fromPath || '')}${args.toPath ? ` -> ${args.toPath}` : ''}`.trim();
        case TOOL_NAMES.RUN_SLASH_COMMAND:
            return `执行斜杠命令 ${args.command || ''}`.trim();
        case TOOL_NAMES.RUN_JAVASCRIPT_API:
            return `执行 JS API ${args.purpose || args.code || ''}`.trim();
        case TOOL_NAMES.READ_IDENTITY:
            return '读取身份设定';
        case TOOL_NAMES.WRITE_IDENTITY:
            return '写入身份设定';
        case TOOL_NAMES.READ_WORKLOG:
            return '读取工作记录';
        case TOOL_NAMES.WRITE_WORKLOG:
            return `写入工作记录 ${args.name || ''}`.trim();
        case TOOL_NAMES.PLAN_CREATE:
            return `创建计划 ${args.title || ''}`.trim();
        case TOOL_NAMES.PLAN_UPDATE:
            return `更新计划 ${args.id || args.title || ''}`.trim();
        case TOOL_NAMES.PLAN_LIST:
            return '查看计划列表';
        case TOOL_NAMES.PLAN_GET:
            return `查看计划 ${args.id || ''}`.trim();
        case TOOL_NAMES.DELEGATE_RUN:
            return `委托子任务 ${args.task || ''}`.trim();
        case TOOL_NAMES.READ_SKILLS_CATALOG:
            return '读取技能目录';
        case TOOL_NAMES.READ_SKILL:
            return `读取技能 ${args.id || args.filename || ''}`.trim();
        case TOOL_NAMES.UPDATE_SKILL:
            return `更新技能 ${args.id || args.filename || args.title || ''}`.trim();
        case TOOL_NAMES.GENERATE_SKILL:
            return args.action === 'save'
                ? `保存技能 ${args.title || args.id || ''}`.trim()
                : `申请生成技能 ${args.title || ''}`.trim();
        case TOOL_NAMES.DELETE_SKILL:
            return `删除技能 ${args.id || args.filename || ''}`.trim();
        default:
            return `调用工具 ${name}`;
    }
}

function formatPlanLine(plan = {}) {
    const title = String(plan.title || plan.id || '').trim();
    const meta = [
        plan.status ? `状态：${plan.status}` : '',
        plan.priority ? `优先级：${plan.priority}` : '',
        plan.owner ? `owner：${plan.owner}` : '',
    ].filter(Boolean).join('，');
    return `- ${title}${plan.id ? ` (${plan.id})` : ''}${meta ? `：${meta}` : ''}`;
}

function formatPlanStatusLabel(status = '') {
    switch (String(status || '').trim()) {
        case 'pending':
            return '待办';
        case 'in_progress':
            return '进行中';
        case 'blocked':
            return '阻塞';
        case 'completed':
            return '已完成';
        case 'failed':
            return '失败';
        case 'cancelled':
            return '已取消';
        default:
            return status || '未知';
    }
}

function formatPlanCheckbox(status = '') {
    const normalized = String(status || '').trim();
    if (normalized === 'completed') return '☑';
    if (normalized === 'failed' || normalized === 'cancelled') return '☒';
    return '☐';
}

function formatPlanChecklistItem(plan = {}) {
    const title = String(plan.title || plan.id || '未命名计划').trim();
    const status = String(plan.status || '').trim();
    const meta = [
        status ? `状态：${formatPlanStatusLabel(status)}` : '',
        plan.priority ? `优先级：${plan.priority}` : '',
        plan.owner ? `负责人：${plan.owner}` : '',
        Array.isArray(plan.blockedBy) && plan.blockedBy.length ? `依赖：${plan.blockedBy.join('、')}` : '',
    ].filter(Boolean).join('，');
    const lines = [`${formatPlanCheckbox(status)} ${title}${plan.id ? ` (${plan.id})` : ''}`];
    if (meta) lines.push(`   ${meta}`);
    if (plan.detail) lines.push(`   说明：${truncateInlineText(plan.detail, 220)}`);
    if (Array.isArray(plan.notes) && plan.notes.length) {
        lines.push(`   备注：${plan.notes.map((item) => truncateInlineText(item, 120)).filter(Boolean).join('；')}`);
    }
    if (plan.result) lines.push(`   结果：${truncateInlineText(plan.result, 220)}`);
    if (plan.error) lines.push(`   错误：${truncateInlineText(plan.error, 220)}`);
    return lines.join('\n');
}

function formatPlanChecklist(plans = []) {
    return (Array.isArray(plans) ? plans : [])
        .filter((plan) => plan && typeof plan === 'object')
        .map(formatPlanChecklistItem)
        .join('\n\n');
}

function formatPlanBlockers(blockers = []) {
    const items = (Array.isArray(blockers) ? blockers : [])
        .filter((item) => item && typeof item === 'object');
    if (!items.length) return '';
    return [
        '阻塞项：',
        ...items.map((item) => formatPlanChecklistItem({
            id: item.id,
            title: item.title || item.id,
            status: item.status || 'blocked',
        })),
    ].join('\n');
}

function formatPlanToolResult(message, parsed = {}) {
    if (![
        TOOL_NAMES.PLAN_CREATE,
        TOOL_NAMES.PLAN_UPDATE,
        TOOL_NAMES.PLAN_LIST,
        TOOL_NAMES.PLAN_GET,
    ].includes(message.toolName)) {
        return null;
    }
    const plan = parsed.plan && typeof parsed.plan === 'object' ? parsed.plan : null;
    const blockers = Array.isArray(parsed.blockers) ? parsed.blockers : [];
    if (parsed.ok === false) {
        const lines = [
            `计划工具失败：${parsed.error || 'unknown_error'}`,
            parsed.id ? `计划：${parsed.id}` : '',
        ];
        if (blockers.length) {
            lines.push(`阻塞项：${blockers.map((item) => `${item.title || item.id || ''}(${item.status || 'unknown'})`).join('、')}`);
        }
        return {
            summary: lines.filter(Boolean).join('\n'),
            details: formatPlanBlockers(blockers) || parsed.message || '',
        };
    }
    if (message.toolName === TOOL_NAMES.PLAN_CREATE) {
        return {
            summary: [
                `计划已创建：${plan?.title || ''}`,
                plan?.id ? `id：${plan.id}` : '',
                plan?.status ? `状态：${plan.status}` : '',
                blockers.length ? `阻塞项：${blockers.map((item) => item.title || item.id).filter(Boolean).join('、')}` : '',
            ].filter(Boolean).join('\n'),
            details: [plan ? formatPlanChecklistItem(plan) : '', formatPlanBlockers(blockers)].filter(Boolean).join('\n\n'),
        };
    }
    if (message.toolName === TOOL_NAMES.PLAN_UPDATE) {
        return {
            summary: [
                `计划已更新：${plan?.title || plan?.id || ''}`.trim(),
                plan?.status ? `状态：${plan.status}` : '',
                blockers.length ? `阻塞项：${blockers.map((item) => item.title || item.id).filter(Boolean).join('、')}` : '',
            ].filter(Boolean).join('\n'),
            details: [plan ? formatPlanChecklistItem(plan) : '', formatPlanBlockers(blockers)].filter(Boolean).join('\n\n'),
        };
    }
    if (message.toolName === TOOL_NAMES.PLAN_LIST) {
        const plans = Array.isArray(parsed.plans) ? parsed.plans : [];
        const lines = [`当前会话计划：${Number(parsed.count) || 0} 项，展示 ${plans.length} 项。`];
        if (plans.length) {
            lines.push('');
            lines.push(...formatPreviewList(plans, formatPlanLine));
        }
        if (parsed.truncated) {
            lines.push('结果已截断，可以用 status、priority 或 owner 缩小范围。');
        }
        return {
            summary: lines.join('\n'),
            details: formatPlanChecklist(plans),
        };
    }
    if (message.toolName === TOOL_NAMES.PLAN_GET) {
        return {
            summary: plan ? formatPlanLine(plan).replace(/^- /, '') : '计划不存在',
            details: plan ? formatPlanChecklistItem(plan) : '',
        };
    }
    return null;
}

function formatDelegateToolResult(message, parsed = {}) {
    if (message.toolName !== TOOL_NAMES.DELEGATE_RUN) return null;
    const trace = Array.isArray(parsed.toolTrace) ? parsed.toolTrace : [];
    const lines = [
        parsed.status ? `子任务状态：${parsed.status}` : '子任务已返回',
        parsed.summary ? `摘要：${parsed.summary}` : '',
        Number.isFinite(Number(parsed.rounds)) ? `轮次：${Number(parsed.rounds)}` : '',
        Number.isFinite(Number(parsed.toolCallCount)) ? `工具调用：${Number(parsed.toolCallCount)}` : '',
        parsed.error ? `错误：${parsed.error}` : '',
    ].filter(Boolean);
    const traceLines = trace.map((item) => [
        `- ${item.name || 'tool'}`,
        item.ok === false ? '失败' : '成功',
        item.args ? `参数：${item.args}` : '',
        item.error ? `错误：${item.error}` : '',
        item.summary ? `摘要：${item.summary}` : '',
    ].filter(Boolean).join('；'));
    return {
        summary: lines.join('\n'),
        details: [
            parsed.result ? `结果：\n${parsed.result}` : '',
            traceLines.length ? `工具轨迹：\n${traceLines.join('\n')}` : '',
        ].filter(Boolean).join('\n\n'),
    };
}

export function formatToolResultDisplay(message) {
    const parsed = safeJsonParse(message.content, null);
    if (!parsed || typeof parsed !== 'object') {
        return {
            summary: message.content || '',
            details: '',
        };
    }

    if (message.toolName === TOOL_NAMES.CARD_FILES && parsed.ok === true && parsed.sourcePath) {
        return { summary: CARD_COPY.avatarSaved(parsed.name), details: parsed.sourcePath };
    }

    if (message.toolName === TOOL_NAMES.CARD_ASSETS) {
        if (Array.isArray(parsed.tasks) && Array.isArray(parsed.errors)) return {
            summary: CARD_COPY.assetListSummary(parsed.tasks.length, parsed.errors.length),
            details: [
                ...parsed.tasks.map(task => `${task.name || task.taskPath} · ${task.taskPath}\n${task.assets.map(asset => asset.key).join('、')}`),
                ...parsed.errors.map(item => `${item.taskPath}\n${item.error}`),
            ].join('\n\n'),
        };
        if (parsed.ok === true && parsed.draft && parsed.requiresWriteback) return {
            summary: parsed.unchanged ? CARD_COPY.assetDraftUnchanged : CARD_COPY.assetDraftNote,
            details: [parsed.asset?.key, parsed.taskPath].filter(Boolean).join('\n'),
        };
    }

    const delegateToolResult = formatDelegateToolResult(message, parsed);
    if (delegateToolResult) return delegateToolResult;

    const images = imageResultFiles(parsed);
    if (images.length) return { summary: [[TOOL_NAMES.DRAW_IMAGE, TOOL_NAMES.SAVE_DRAW_IMAGES].includes(message.toolName) ? DRAW_COPY.saved(images.length) : IMAGE_COPY.result(images.length), parsed.ok === false ? parsed.message || parsed.error : ''].filter(Boolean).join(' · '), details: images.map(file => `[${file.name}](<${file.path}>)`).join('\n') };

    if (message.toolName === TOOL_NAMES.INSPECT_PAGE) {
        return {
            summary: parsed.ok === false ? parsed.message : [INSPECTION_COPY.result, parsed.next ? INSPECTION_COPY.continued : ''].filter(Boolean).join(' · '),
            details: [parsed.frame ? JSON.stringify(parsed.frame, null, 2) : '', parsed.content || ''].filter(Boolean).join('\n\n'),
        };
    }

    const planToolResult = formatPlanToolResult(message, parsed);
    if (planToolResult) return planToolResult;

    if (message.toolName === TOOL_NAMES.APPLY_PATCH && parsed.ok === false) {
        const issue = parsed.issue;
        const location = [issue?.path, Number.isInteger(issue?.editIndex) ? `第 ${issue.editIndex + 1} 处修改` : ''].filter(Boolean).join(' · ');
        return {
            summary: parsed.summary || '补丁未提交，没有修改任何文件。',
            details: [
                location,
                issue?.message || parsed.message || parsed.error,
                issue?.suggestion,
                ...(Array.isArray(parsed.conflictPaths) ? parsed.conflictPaths : []),
            ].filter(Boolean).join('\n'),
        };
    }

    if ((isWebTool(message.toolName) || message.toolName === TOOL_NAMES.READ_LOGS || message.toolName === TOOL_NAMES.TOOL_RESULT_READ)
        && parsed.data?.reference && typeof parsed.data.text === 'string') {
        return { summary: ACTIVITY_COPY.resultPage(parsed.data.offset, parsed.data.totalChars), details: parsed.data.text };
    }

    if (message.toolName === TOOL_NAMES.READ_LOGS && parsed.ok === true && Array.isArray(parsed.logs)) {
        return { summary: LOG_TOOL_COPY.result, details: JSON.stringify(parsed, null, 2) };
    }

    if (message.toolName === TOOL_NAMES.WEB_FETCH) {
        const results = Array.isArray(parsed.results) ? parsed.results : [];
        const failures = Array.isArray(parsed.failures) ? parsed.failures : [];
        return {
            summary: [
                results.length ? ACTIVITY_COPY.webFetched(results.length) : '',
                failures.length ? ACTIVITY_COPY.webFetchFailed(failures.length) : '',
                parsed.ok === false ? parsed.message || parsed.error : '',
            ].filter(Boolean).join('\n'),
            details: [
                ...results.map(item => [item.title, item.url, item.text].filter(Boolean).join('\n')),
                ...failures.map(item => [item.url, item.code, item.httpStatus, item.message].filter(Boolean).join(' · ')),
            ].join('\n\n'),
        };
    }

    if (parsed.ok === false && parsed.error) {
        const lines = [
            `工具返回错误：${parsed.error}`,
            parsed.message ? `说明：${parsed.message}` : '',
            parsed.suggestion ? `建议：${parsed.suggestion}` : '',
        ].filter(Boolean);
        const detailLines = [];
        if (parsed.path) detailLines.push(`路径：${parsed.path}`);
        if (Number.isFinite(parsed.sizeBytes) && parsed.sizeBytes > 0) {
            detailLines.push(`大小：${Math.round(parsed.sizeBytes / 1024)} KB`);
        }
        if (Number.isFinite(parsed.lineCount) && parsed.lineCount >= 0) {
            detailLines.push(`行数：${parsed.lineCount}`);
        }
        if (Number.isFinite(parsed.entryCount) && parsed.entryCount >= 0) {
            detailLines.push(`目录项：${parsed.entryCount}`);
        }
        if (Number.isFinite(parsed.offset) && parsed.offset > 0) {
            detailLines.push(`offset：${parsed.offset}`);
        }
        if (Array.isArray(parsed.suggestions) && parsed.suggestions.length) {
            detailLines.push(`候选路径：${parsed.suggestions.join('、')}`);
        }
        if (parsed.raw && parsed.raw !== parsed.error) {
            detailLines.push(`原始错误：${parsed.raw}`);
        }
        return {
            summary: lines.join('\n'),
            details: detailLines.join('\n'),
        };
    }

    if (message.toolName === TOOL_NAMES.WEB_SEARCH) {
        const results = Array.isArray(parsed.results) ? parsed.results : [];
        const lines = [
            `已联网搜索：${parsed.query || ''}`,
            `结果数：${Number(parsed.count) || results.length || 0}`,
        ];
        if (Number(parsed.maxResults) > 0) {
            lines.push(`请求上限：${Number(parsed.maxResults)}`);
        }
        return {
            summary: lines.filter(Boolean).join('\n'),
            details: formatWebSearchResults(results),
        };
    }

    if (message.toolName === TOOL_NAMES.GLOB) {
        const items = Array.isArray(parsed.items) ? parsed.items : [];
        const lines = [`glob“${parsed.pattern || ''}”命中 ${parsed.total || 0} 个文件，当前展示 ${items.length} 个。`];
        if (parsed.searchPath) {
            lines.push(`范围：${parsed.searchPath}`);
        }
        if (parsed.truncated) {
            lines.push('结果已截断，可以把模式或路径范围再收窄一点。');
        }
        if (items.length) {
            lines.push('');
            lines.push(...formatPreviewList(items, (item) => `- ${item.publicPath}${item.source ? ` [${item.source}]` : ''}`));
        }
        const detailLines = items.map((item) => `- ${item.publicPath}${item.source ? ` [${item.source}]` : ''}`);
        return {
            summary: lines.join('\n'),
            details: detailLines.join('\n'),
        };
    }

    if (message.toolName === TOOL_NAMES.LS) {
        const items = Array.isArray(parsed.items) ? parsed.items : [];
        const lines = [`目录 ${parsed.directoryPath || ''} 下找到 ${parsed.total || 0} 个一级子项，当前展示 ${items.length} 个。`];
        if (Number(parsed.startEntry) > 0 || Number(parsed.endEntry) > 0) {
            lines.push(`范围：第 ${parsed.startEntry || 0} 项到第 ${parsed.endEntry || 0} 项`);
        }
        if (parsed.truncated) {
            lines.push(`还有更多结果；如需继续，可把 offset 设为 ${Number(parsed.nextOffset) || ((Number(parsed.offset) || 1) + items.length)}。`);
        }
        if (items.length) {
            lines.push('');
            lines.push(...formatPreviewList(items, (item) => `- ${item.publicPath}${item.type === 'directory' ? ' [目录]' : ''}`));
        }

        const detailLines = items.map((item) => {
            const meta = [];
            if (item.type === 'directory') meta.push('目录');
            if (item.source) meta.push(item.source);
            if (item.type === 'directory' && Number(item.descendantFileCount) > 0) {
                meta.push(`包含 ${item.descendantFileCount} 个已索引文件`);
            }
            return `- ${item.publicPath}${meta.length ? ` [${meta.join(' | ')}]` : ''}`;
        });
        return {
            summary: lines.join('\n'),
            details: detailLines.join('\n'),
        };
    }

    if (message.toolName === TOOL_NAMES.GREP) {
        const items = Array.isArray(parsed.items) ? parsed.items : [];
        const outputMode = parsed.outputMode || 'content';
        const lines = [`grep“${parsed.pattern || ''}”模式：${outputMode}。当前展示 ${items.length} 个结果。`];
        if (parsed.searchPath) {
            lines.push(`范围：${parsed.searchPath}`);
        }
        if (parsed.include) {
            lines.push(`include 限定：${parsed.include}`);
        }
        if (parsed.glob && !parsed.include) {
            lines.push(`glob 限定：${parsed.glob}`);
        }
        if (Number(parsed.offset) > 0) {
            lines.push(`偏移：已跳过前 ${parsed.offset} 个结果`);
        }
        if (outputMode === 'content' && Number(parsed.contextLines) > 0) {
            lines.push(`上下文：前后 ${parsed.contextLines} 行`);
        }
        if (parsed.truncated) {
            lines.push(`结果仍有剩余；本次已扫描 ${parsed.scannedFiles || 0}/${parsed.candidateFiles || parsed.indexedFiles || 0} 个候选文件。`);
            lines.push(`如需继续，可把 offset 设为 ${Number(parsed.nextOffset) || ((Number(parsed.offset) || 0) + items.length)}。`);
        } else if (parsed.searchComplete === false) {
            if (Number.isFinite(parsed.matchesFound)) {
                lines.push(`已找到 ${parsed.matchesFound} 条，搜索仍在继续。`);
            }
        } else if (Number(parsed.candidateFiles) > 0 && parsed.glob) {
            lines.push(`本次扫描 ${parsed.scannedFiles || 0}/${parsed.candidateFiles} 个候选文件。`);
            if (Number.isFinite(parsed.totalMatches)) {
                lines.push(`总结果数：${parsed.totalMatches}`);
            }
        } else if (Number.isFinite(parsed.totalMatches)) {
            lines.push(`总结果数：${parsed.totalMatches}`);
        }
        if (Number(parsed.skippedFiles) > 0) {
            lines.push(`有 ${parsed.skippedFiles} 个文件读取失败并已跳过。`);
            if (Array.isArray(parsed.skippedPaths) && parsed.skippedPaths.length) {
                lines.push(`跳过示例：${parsed.skippedPaths.join('、')}`);
            }
        }
        const detailLines = [];
        if (items.length) {
            lines.push('');
            items.forEach((item) => {
                if (outputMode === 'count') {
                    lines.push(`- ${item.path}${Number.isFinite(item.matchCount) ? `（${item.matchCount} 处）` : ''}`);
                    detailLines.push(`${item.path}${Number.isFinite(item.matchCount) ? `: ${item.matchCount}` : ''}`);
                } else if (outputMode === 'files_with_matches') {
                    lines.push(`- ${item.path}${Number.isFinite(item.matchCount) ? `（${item.matchCount} 处）` : ''}`);
                    detailLines.push(item.path);
                } else {
                    const lineInfo = item.line ? `:${item.line}` : '';
                    lines.push(`- ${item.path}${lineInfo}`);
                    detailLines.push(`${item.path}${lineInfo}: ${item.text || ''}`);
                    if (item.context) {
                        detailLines.push(item.context);
                    }
                    detailLines.push('');
                }
            });
        }
        return {
            summary: lines.join('\n'),
            details: detailLines.join('\n').trim(),
        };
    }

    if (message.toolName === TOOL_NAMES.READ) {
        const isDirectory = parsed.entryType === 'directory' || parsed.contentFormat === 'directory_entries';
        const totalLinesLabel = Number.isFinite(parsed.totalLines)
            ? `共 ${parsed.totalLines} 行`
            : parsed.totalLinesKnown === false
                ? '总行数未知（当前为首段预览）'
                : '总行数未知';
        const lines = [
            `${isDirectory ? '已读取目录' : '已读取文件'}：${parsed.path || ''}`,
            parsed.source ? `来源：${parsed.source}` : '',
        ];
        if (isDirectory) {
            lines.push(`范围：第 ${parsed.startEntry || 1} 项到第 ${parsed.endEntry || 0} 项 / 共 ${parsed.totalEntries || 0} 项`);
            lines.push('格式：目录项列表');
            if (parsed.hasMoreAfter) {
                lines.push(`后面还有内容；如需继续，可从第 ${parsed.nextOffset} 项继续读。`);
            } else {
                lines.push('当前已是完整读取结果。');
            }
        } else {
            if (Number.isFinite(Number(parsed.tailLines)) && parsed.tailLines > 0) {
                lines.push(`范围：末尾 ${Number(parsed.tailLines)} 行 / ${totalLinesLabel}`);
            } else {
                lines.push(`范围：第 ${parsed.startLine || 1} 行到第 ${parsed.endLine || 0} 行 / ${totalLinesLabel}`);
            }
            if (parsed.contentFormat === 'numbered_lines') {
                lines.push(Number.isFinite(Number(parsed.tailLines)) && parsed.tailLines > 0
                    ? '格式：末尾内容'
                    : '格式：带行号内容');
            }
            if (parsed.autoChunked) {
                lines.push('文件较大，当前自动返回首段。');
            }
            if (parsed.charLimited) {
                lines.push('当前结果还受输出预算限制，继续读取时请按 nextOffset 往后读。');
            }
            if (parsed.hasMoreBefore) {
                lines.push('前面还有内容。');
            }
            if (parsed.hasMoreAfter) {
                lines.push(`后面还有内容；如需继续，可从第 ${parsed.nextOffset} 行继续读。`);
            }
            if (!parsed.hasMoreBefore && !parsed.hasMoreAfter) {
                lines.push('当前已是完整读取结果。');
            }
        }
        return {
            summary: lines.filter(Boolean).join('\n'),
            details: String(parsed.content || ''),
        };
    }

    if (message.toolName === TOOL_NAMES.WRITE) {
        return {
            summary: [
                `已写入文件：${parsed.path || ''}`,
                parsed.source ? `来源：${parsed.source}` : '',
                parsed.mode === 'create' ? '模式：新建' : parsed.mode === 'overwrite' ? '模式：覆盖' : '',
                Number.isFinite(parsed.totalLines) ? `总行数：${parsed.totalLines}` : '',
                Number.isFinite(parsed.sizeBytes) ? `大小：${parsed.sizeBytes} bytes` : '',
            ].filter(Boolean).join('\n'),
            details: '',
        };
    }

    if (message.toolName === TOOL_NAMES.APPLY_PATCH) {
        const changes = Array.isArray(parsed.changes) ? parsed.changes : [];
        const lines = [
            parsed.phase === 'unchanged' ? '补丁未产生文件变更。' : `补丁已应用，涉及 ${parsed.filesChanged || changes.length || 0} 个路径`,
            parsed.editsApplied > 0 ? `内容修改：${parsed.editsApplied} 处` : '',
            Number.isFinite(parsed.addedCount) && parsed.addedCount > 0 ? `新增：${parsed.addedCount}` : '',
            Number.isFinite(parsed.updatedCount) && parsed.updatedCount > 0 ? `更新：${parsed.updatedCount}` : '',
            Number.isFinite(parsed.deletedCount) && parsed.deletedCount > 0 ? `删除：${parsed.deletedCount}` : '',
            Number.isFinite(parsed.movedCount) && parsed.movedCount > 0 ? `移动：${parsed.movedCount}` : '',
        ].filter(Boolean);
        const labels = { add: '新增', update: '更新', delete: '删除' };
        const detailLines = changes.map((change) => {
            if (change.action === 'move') return `- 移动 ${change.fromPath} → ${change.toPath}`;
            const editCount = change.edits?.length;
            return `- ${labels[change.action] || change.action} ${change.path || ''}${editCount ? `（${editCount} 处）` : ''}`;
        });
        return {
            summary: lines.join('\n'),
            details: detailLines.join('\n'),
        };
    }

    if (message.toolName === TOOL_NAMES.DELETE) {
        return {
            summary: [
                parsed.mode === 'directory' ? `已删除目录：${parsed.path || ''}` : `已删除文件：${parsed.path || ''}`,
                parsed.source ? `来源：${parsed.source}` : '',
                Number.isFinite(parsed.removedCount) && parsed.removedCount > 1 ? `删除数量：${parsed.removedCount}` : '',
            ].filter(Boolean).join('\n'),
            details: '',
        };
    }

    if (message.toolName === TOOL_NAMES.MOVE) {
        return {
            summary: [
                parsed.mode === 'directory' ? `已移动目录：${parsed.fromPath || ''}` : `已移动文件：${parsed.fromPath || ''}`,
                parsed.toPath ? `目标：${parsed.toPath}` : '',
                parsed.source ? `来源：${parsed.source}` : '',
                parsed.overwritten ? '模式：覆盖目标' : '模式：移动/重命名',
                Number.isFinite(parsed.movedCount) && parsed.movedCount > 1 ? `移动数量：${parsed.movedCount}` : '',
            ].filter(Boolean).join('\n'),
            details: '',
        };
    }

    if (message.toolName === TOOL_NAMES.RUN_SLASH_COMMAND) {
        const execution = parsed.execution && typeof parsed.execution === 'object'
            ? parsed.execution
            : {};
        const status = parsed.skipped === true
            ? '已跳过'
            : execution.isAborted === true
                ? '已中止'
                : parsed.ok === false
                    ? '失败'
                    : '成功';
        const lines = [
            `已执行斜杠命令：${parsed.command || ''}`,
            `状态：${status}`,
        ];
        if (execution.errorMessage) {
            lines.push(`错误：${execution.errorMessage}`);
        }
        if (execution.abortReason) {
            lines.push(`中止原因：${execution.abortReason}`);
        }
        if (parsed.note) {
            lines.push(`说明：${parsed.note}`);
        }

        let details = '';
        if (parsed.pipe !== undefined) {
            details = typeof parsed.pipe === 'string'
                ? parsed.pipe
                : JSON.stringify(parsed.pipe, null, 2);
        }

        return {
            summary: lines.filter(Boolean).join('\n'),
            details,
        };
    }

    if (message.toolName === TOOL_NAMES.RUN_JAVASCRIPT_API) {
        const execution = parsed.execution && typeof parsed.execution === 'object'
            ? parsed.execution
            : {};
        const status = parsed.skipped === true
            ? '已跳过'
            : execution.isAborted === true
                ? ACTIVITY_COPY.statuses.unconfirmed
                : parsed.ok === false
                    ? '失败'
                    : '成功';
        const requestKind = parsed.requestKind === 'inspect'
            ? '探索只读'
            : parsed.requestKind === 'read'
                ? '精确只读'
                : parsed.requestKind === 'effect'
                    ? '执行操作'
                    : '未知';
        const lines = [
            `JS API 请求：${parsed.code || ''}`,
            `请求性质：${requestKind}`,
            `状态：${status}`,
        ];
        if (execution.errorMessage) {
            lines.push(`错误：${execution.errorMessage}`);
        }
        if (Array.isArray(parsed.calledApis) && parsed.calledApis.length) {
            lines.push(`代码涉及的调用：${parsed.calledApis.join(', ')}`);
        } else if (Array.isArray(parsed.usedApis) && parsed.usedApis.length) {
            lines.push(`使用 API：${parsed.usedApis.join(', ')}`);
        }
        if (parsed.calledApiSemantics && typeof parsed.calledApiSemantics === 'object') {
            const semanticEntries = Object.entries(parsed.calledApiSemantics)
                .map(([apiPath, semantic]) => `${apiPath}(${semantic})`)
                .filter(Boolean);
            if (semanticEntries.length) {
                lines.push(`判定依据：${semanticEntries.join(', ')}`);
            }
        }
        if (Array.isArray(execution.unavailableApis) && execution.unavailableApis.length) {
            lines.push(`不可用 API：${execution.unavailableApis.join(', ')}`);
        }
        if (Array.isArray(execution.validationErrors) && execution.validationErrors.length) {
            lines.push(`校验：${execution.validationErrors.join('；')}`);
        }
        if (execution.abortReason) {
            lines.push(`中止原因：${execution.abortReason}`);
        }
        if (parsed.charLimited) {
            lines.push('当前结果还受输出预算限制；如需继续分析，请先缩小返回内容。');
        } else if (parsed.truncated) {
            lines.push('当前结果已截断。');
        }
        if (parsed.preflightWarning) {
            lines.push(`预分析：${parsed.preflightWarning}`);
        }
        if (parsed.note) {
            lines.push(`说明：${parsed.note}`);
        }
        return {
            summary: lines.filter(Boolean).join('\n'),
            details: formatToolOutput(parsed.output),
        };
    }

    if (message.toolName === TOOL_NAMES.WRITE_IDENTITY) {
        return {
            summary: [
                `身份设定已写入 ${parsed.name || 'LittleWhiteBox_Assistant_Identity.md'}`.trim(),
                parsed.hotUpdated ? '当前会话身份已同步刷新。' : '',
            ].filter(Boolean).join('\n'),
            details: '',
        };
    }

    if (message.toolName === TOOL_NAMES.READ_IDENTITY) {
        return {
            summary: parsed.exists
                ? `已读取身份设定：${parsed.name || 'LittleWhiteBox_Assistant_Identity.md'}`
                : `身份设定还不存在：${parsed.name || 'LittleWhiteBox_Assistant_Identity.md'}`,
            details: parsed.exists ? String(parsed.content || '') : '',
        };
    }

    if (message.toolName === TOOL_NAMES.WRITE_WORKLOG) {
        return {
            summary: `工作记录已写入 ${parsed.name || ''}`.trim(),
            details: '',
        };
    }

    if (message.toolName === TOOL_NAMES.READ_WORKLOG) {
        return {
            summary: parsed.exists
                ? `已读取工作记录：${parsed.name || 'LittleWhiteBox_Assistant_Worklog.md'}`
                : `工作记录还不存在：${parsed.name || 'LittleWhiteBox_Assistant_Worklog.md'}`,
            details: parsed.exists ? String(parsed.content || '') : '',
        };
    }

    if (message.toolName === TOOL_NAMES.READ_SKILLS_CATALOG) {
        const lines = [
            `已读取技能目录：${parsed.name || 'LittleWhiteBox_Assistant_Skills.json'}`,
            `总技能数：${Number(parsed.total) || 0}`,
            `启用技能：${Number(parsed.enabledCount) || 0}`,
        ];
        return {
            summary: lines.join('\n'),
            details: String(parsed.content || parsed.summaryText || ''),
        };
    }

    if (message.toolName === TOOL_NAMES.READ_SKILL) {
        if (parsed.ok === false && parsed.error) {
            return {
                summary: [
                    `读取技能失败：${parsed.error}`,
                    parsed.message ? `说明：${parsed.message}` : '',
                ].filter(Boolean).join('\n'),
                details: '',
            };
        }
        return {
            summary: [
                `已读取技能：${parsed.title || parsed.id || parsed.filename || ''}`.trim(),
                parsed.filename ? `文件：${parsed.filename}` : '',
                parsed.summary ? `摘要：${parsed.summary}` : '',
                Array.isArray(parsed.slashTriggers) && parsed.slashTriggers.length ? `Slash：${parsed.slashTriggers.join(', ')}` : '',
            ].filter(Boolean).join('\n'),
            details: String(parsed.content || ''),
        };
    }

    if (message.toolName === TOOL_NAMES.UPDATE_SKILL) {
        if (parsed.ok === false && parsed.error) {
            return {
                summary: [
                    `更新技能失败：${parsed.error}`,
                    parsed.message ? `说明：${parsed.message}` : '',
                ].filter(Boolean).join('\n'),
                details: '',
            };
        }
        return {
            summary: [
                `技能已更新：${parsed.title || parsed.id || parsed.filename || ''}`.trim(),
                parsed.filename ? `文件：${parsed.filename}` : '',
                parsed.enabled === false ? '状态：已保存但未启用' : '状态：已启用',
            ].filter(Boolean).join('\n'),
            details: parsed.note ? String(parsed.note) : '',
        };
    }

    if (message.toolName === TOOL_NAMES.GENERATE_SKILL) {
        if (parsed.ok === false && parsed.error) {
            return {
                summary: [
                    `技能处理失败：${parsed.error}`,
                    parsed.message ? `说明：${parsed.message}` : '',
                ].filter(Boolean).join('\n'),
                details: parsed.details ? String(parsed.details) : '',
            };
        }
        if (parsed.action === 'propose') {
            return {
                summary: parsed.approved === false
                    ? `本次未生成技能：${parsed.title || ''}`.trim()
                    : `技能生成已获同意：${parsed.title || parsed.id || ''}`.trim(),
                details: [
                    parsed.id ? `id: ${parsed.id}` : '',
                    parsed.filename ? `filename: ${parsed.filename}` : '',
                    parsed.instructions ? String(parsed.instructions) : '',
                ].filter(Boolean).join('\n\n'),
            };
        }
        if (parsed.action === 'save') {
            return {
                summary: [
                    `技能已保存：${parsed.title || parsed.id || ''}`.trim(),
                    parsed.summary ? `摘要：${parsed.summary}` : '',
                    parsed.filename ? `文件：${parsed.filename}` : '',
                    Array.isArray(parsed.triggers) && parsed.triggers.length ? `触发词：${parsed.triggers.join(', ')}` : '',
                    Array.isArray(parsed.slashTriggers) && parsed.slashTriggers.length ? `Slash：${parsed.slashTriggers.join(', ')}` : '',
                    parsed.when_to_use ? `适用时机：${parsed.when_to_use}` : '',
                    parsed.enabled === false ? '状态：已保存但未启用' : '状态：已启用',
                    parsed.warning ? `提醒：${parsed.warning}` : '',
                ].filter(Boolean).join('\n'),
                details: [
                    parsed.note ? String(parsed.note) : '',
                    Array.isArray(parsed.missingFields) && parsed.missingFields.length
                        ? `missingFields: ${parsed.missingFields.join(', ')}`
                        : '',
                    parsed.followUpRequired && parsed.followUpTool
                        ? `followUpTool: ${parsed.followUpTool}`
                        : '',
                ].filter(Boolean).join('\n\n'),
            };
        }
    }

    if (message.toolName === TOOL_NAMES.DELETE_SKILL) {
        if (parsed.ok === false && parsed.error) {
            return {
                summary: [
                    `删除技能失败：${parsed.error}`,
                    parsed.message ? `说明：${parsed.message}` : '',
                ].filter(Boolean).join('\n'),
                details: '',
            };
        }
        return {
            summary: [
                `技能已删除：${parsed.title || parsed.id || parsed.filename || ''}`.trim(),
                parsed.filename ? `文件：${parsed.filename}` : '',
                parsed.fileDeleted === false ? '正文文件原本不存在，已仅清理目录项' : '正文文件与目录项均已删除',
            ].filter(Boolean).join('\n'),
            details: parsed.note ? String(parsed.note) : '',
        };
    }

    return {
        summary: JSON.stringify(parsed, null, 2),
        details: '',
    };
}
