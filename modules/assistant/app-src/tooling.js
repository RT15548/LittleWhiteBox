// ============================================================
// 工具名称常量
// ============================================================
export const TOOL_NAMES = {
    LS: 'LS',
    GLOB: 'Glob',
    GREP: 'Grep',
    READ: 'Read',
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
    READ_SKILLS_CATALOG: 'ReadSkillsCatalog',
    READ_SKILL: 'ReadSkill',
    UPDATE_SKILL: 'UpdateSkill',
    GENERATE_SKILL: 'GenerateSkill',
    DELETE_SKILL: 'DeleteSkill',
};

// ============================================================
// 工具定义
// ============================================================
export const TOOL_DEFINITIONS = [
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.LS,
            description: [
                'List files and directories inside a directory path.',
                'Returns first-level entries only; does not recurse and does not read file contents.',
                'Best for directory-level discovery and structural narrowing by path.',
                'Works for indexed directories and `local/` workspace directories.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Public directory path, for example scripts/extensions/third-party/ or scripts/extensions/third-party/LittleWhiteBox/modules/.' },
                    offset: { type: 'number', description: 'Optional 1-based entry offset for paging. Default 1.' },
                    limit: { type: 'number', description: 'Maximum number of first-level entries to return. Default 100, max 300.' },
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
                'Fast file pattern matching tool for indexed files and `local/` workspace files.',
                'Matches file paths only; does not inspect file contents.',
                'Best for file discovery and path-level narrowing when you know a directory, extension, or naming pattern.',
                'Supports a path scope so you can search inside one directory instead of the full workspace.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    pattern: { type: 'string', description: 'Glob path pattern, for example scripts/extensions/third-party/LittleWhiteBox/modules/**/*.js.' },
                    path: { type: 'string', description: 'Optional directory scope. If omitted, search the whole indexed workspace plus `local/`.' },
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
                'Fast content search tool for indexed files and `local/` workspace files.',
                'It first uses indexed paths plus `local/` files as the candidate set, then searches the current live contents of those candidate files.',
                'Uses regex search by default and returns matching files with line-level match details.',
                'Best for content-level narrowing by keyword, symbol name, error text, or regex before reading files.',
                'Supports both directory scope and file-pattern filtering so you can narrow searches before reading files.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    pattern: { type: 'string', description: 'grep/rg-style search pattern. Treated as regex by default.' },
                    path: { type: 'string', description: 'Optional directory scope. If omitted, search the whole indexed workspace plus `local/`.' },
                    include: { type: 'string', description: 'Optional file path glob filter, for example **/*.js or modules/assistant/**/*.js.' },
                    outputMode: {
                        type: 'string',
                        enum: ['content', 'files_with_matches', 'count'],
                        description: 'Output mode. content returns matched lines and context; files_with_matches returns matching files only; count returns match counts per file. Default is content.',
                    },
                    limit: { type: 'number', description: 'Maximum number of results to return. Default 100, max 100. Can be used with offset for paging.' },
                    offset: { type: 'number', description: 'Skip this many results before returning matches. Default 0.' },
                    contextLines: { type: 'number', description: 'How many context lines to show before and after each match. Default 0, max 5.' },
                    useRegex: { type: 'boolean', description: 'Whether to treat pattern as a regex. Default true; use false for literal search.' },
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
                'Read a text file or directory using the current instance\'s live contents.',
                'Supports indexed paths and `local/...` workspace paths.',
                'For some explicit public file paths, direct live reads may still work even if the path is not in the index.',
                'Returns numbered lines for files and plain entry names for directories; large reads include continuation hints.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Public file or directory path, for example scripts/extensions/third-party/LittleWhiteBox/index.js or local/.' },
                    offset: { type: 'number', description: 'Optional line offset (1-based). Default 1.' },
                    limit: { type: 'number', description: 'Optional maximum number of lines or directory entries to return. Default 2000.' },
                },
                required: ['filePath'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.WRITE,
            description: [
                'Write a `local/` text file. Use for new files or whole-file rewrites.',
                'Can only write `local/` paths and never writes back to the user\'s original disk files.',
                'Can directly create a new `local/...` file path, including `local/file.txt` or `local/<root>/file.txt`.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Target `local/...` file path, for example local/README.md or local/my-plugin/README.md.' },
                    content: { type: 'string', description: 'Full text content to write.' },
                },
                required: ['path', 'content'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.APPLY_PATCH,
            description: [
                'Apply a structured patch to `local/` text files.',
                'Use this for targeted edits, multi-file changes, adds, deletes, and renames inside the workspace.',
                'Patch format uses structured headers such as `*** Begin Patch`, `*** Update File: local/example.js`, `@@`, and `*** End Patch`.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    patchText: { type: 'string', description: 'Full apply_patch body, including `*** Begin Patch` and `*** End Patch`.' },
                },
                required: ['patchText'],
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
                'Can only delete `local/` paths and never deletes the user\'s original disk files.',
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
                'Can only operate on `local/` paths and never moves the user\'s original disk files.',
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
                'Execute documented public SillyTavern frontend JavaScript APIs.',
                'Use this when STscript or slash commands do not provide the needed entry point and you need to inspect, read, or operate on public frontend objects and state such as chatMetadata, saveMetadata, or public extension exports.',
                'This is not arbitrary JS execution; only documented public APIs are allowed.',
                'Code can directly use injected `ctx` and `st`; `ctx` comes from getContext(), and `st` only exposes public script / extensions / slash namespaces. Simple destructuring, simple arrow callbacks, `if`, `for...of`, `try/catch`, and constrained read-only inspection are supported.',
                'Request modes: use `inspect` for unknown structures, `read` for known fields, and `effect` only for side-effectful calls.',
                'Typical `inspect` usage: Object.keys(ctx.chatMetadata), typeof ctx.someField, Array.isArray(ctx.chat), or small JSON/stringified samples.',
                'Typical `read` usage: directly return a known field such as ctx.chatMetadata.LittleWhiteBox.summary.',
                'Typical `effect` usage: calls such as ctx.saveMetadata() or other state-changing frontend APIs.',
                '`apiPaths` may be omitted for read-only inspection and precise reads, or kept at container level; side-effect requests must declare exact paths. `safety` is explanatory only, not the security boundary. Code must explicitly return the final result.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'Restricted JS code to execute. Use ctx / st directly and explicitly return the final result.' },
                    purpose: { type: 'string', description: 'What this code is intended to do.' },
                    apiPaths: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Optional public API path declarations. For inspect/read this may be omitted or kept at container level such as ctx.chatMetadata; for effect requests exact paths are required.',
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
            description: 'Read the fixed identity file at user/files/LittleWhiteBox_Assistant_Identity.md. If the file does not exist yet, the result will report that state.',
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
            description: 'Write identity content to user/files/LittleWhiteBox_Assistant_Identity.md. After a successful write, the currently opened assistant session immediately continues with the new identity.',
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
            description: 'Read the fixed worklog file at user/files/LittleWhiteBox_Assistant_Worklog.md. If the file does not exist yet, the result will report that state.',
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
            description: 'Write investigation notes or worklog content into a worklog file under user/files. By default this writes to user/files/LittleWhiteBox_Assistant_Worklog.md; if name is omitted, the default worklog is used.',
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
            name: TOOL_NAMES.READ_SKILLS_CATALOG,
            description: 'Read the skill catalog index at user/files/LittleWhiteBox_Assistant_Skills.json and return registered skill metadata plus the injection-ready catalog summary.',
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
            description: 'Read the full body of one skill. Prefer id; filename is also allowed. At least one of the two must be provided.',
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
            description: 'Update the body or metadata of an existing skill and sync the changes back to the skill file and Skills.json. Prefer id; filename is also allowed. Partial updates are supported and omitted fields keep their current values.',
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
                'You must call `action: "propose"` first to ask for user approval; only after receiving approvalToken may you call `action: "save"` to actually write the skill file and Skills.json.',
                'When using `action: "save"`, explicitly provide all required save fields.',
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
            description: 'Delete an existing skill and remove both the skill body file and the catalog entry from Skills.json. Prefer id; filename is also allowed.',
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

export function describeToolCall(name, args = {}) {
    switch (name) {
        case TOOL_NAMES.LS:
            return `查看目录 ${args.path || ''}${args.offset ? `:${args.offset}` : ''}`.trim();
        case TOOL_NAMES.GLOB:
            return `匹配文件 ${args.pattern || ''}${args.path ? ` @ ${args.path}` : ''}`.trim();
        case TOOL_NAMES.GREP:
            return `搜索内容 ${args.pattern || ''}${args.path ? ` @ ${args.path}` : ''}`.trim();
        case TOOL_NAMES.READ:
            return `读取文件 ${(args.filePath || args.path || '')}${args.offset ? `:${args.offset}` : args.startLine ? `:${args.startLine}` : ''}`.trim();
        case TOOL_NAMES.WRITE:
            return `写入文件 ${args.path || ''}`.trim();
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

export function formatToolResultDisplay(message) {
    const parsed = safeJsonParse(message.content, null);
    if (!parsed || typeof parsed !== 'object') {
        return {
            summary: message.content || '',
            details: '',
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
        } else if (Number(parsed.candidateFiles) > 0 && parsed.glob) {
            lines.push(`本次扫描 ${parsed.scannedFiles || 0}/${parsed.candidateFiles} 个候选文件。`);
            if (Number.isFinite(parsed.total)) {
                lines.push(`总结果数：${parsed.total}`);
            }
        } else if (Number.isFinite(parsed.total)) {
            lines.push(`总结果数：${parsed.total}`);
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
            lines.push(`范围：第 ${parsed.startLine || 1} 行到第 ${parsed.endLine || 0} 行 / 共 ${parsed.totalLines || 0} 行`);
            if (parsed.contentFormat === 'numbered_lines') {
                lines.push('格式：带行号内容');
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
            `补丁已应用：共处理 ${parsed.filesChanged || changes.length || 0} 项变更`,
            Number.isFinite(parsed.hunksApplied) ? `hunk 数：${parsed.hunksApplied}` : '',
            Number.isFinite(parsed.addedCount) && parsed.addedCount > 0 ? `新增：${parsed.addedCount}` : '',
            Number.isFinite(parsed.updatedCount) && parsed.updatedCount > 0 ? `更新：${parsed.updatedCount}` : '',
            Number.isFinite(parsed.deletedCount) && parsed.deletedCount > 0 ? `删除：${parsed.deletedCount}` : '',
            Number.isFinite(parsed.movedCount) && parsed.movedCount > 0 ? `移动：${parsed.movedCount}` : '',
        ].filter(Boolean);
        const detailLines = changes.map((change) => {
            if (change.action === 'move') {
                return `- move ${change.fromPath || ''} -> ${change.toPath || change.path || ''}`;
            }
            const suffix = Number.isFinite(change.hunksApplied) ? ` (${change.hunksApplied} hunks)` : '';
            return `- ${change.action} ${change.path || ''}${suffix}`;
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
                ? '已中止'
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
            `已执行 JS API：${parsed.code || ''}`,
            `请求性质：${requestKind}`,
            `状态：${status}`,
        ];
        if (execution.errorMessage) {
            lines.push(`错误：${execution.errorMessage}`);
        }
        if (Array.isArray(parsed.calledApis) && parsed.calledApis.length) {
            lines.push(`实际调用：${parsed.calledApis.join(', ')}`);
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
                    parsed.filename ? `文件：${parsed.filename}` : '',
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
