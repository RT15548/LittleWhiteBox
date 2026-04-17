export const TOOL_NAMES = {
    LS: 'LS',
    GLOB: 'Glob',
    GREP: 'Grep',
    READ: 'Read',
    RUN_SLASH_COMMAND: 'RunSlashCommand',
    READ_WORKLOG: 'ReadWorklog',
    WRITE_WORKLOG: 'WriteWorklog',
};

export const TOOL_USAGE_GUIDANCE = [
    '工具使用规则：',
    '- `LS` 只列目录的一级子项，适合看某层有哪些文件夹/文件，不能搜索文件内容。',
    '- `Glob` 只按路径模式匹配文件，适合先缩小文件集合；它不检查文件内容对不对。',
    '- `Grep` 只搜索文件内容里的命中片段；命中片段不是全文，也不代表上下文完整。结果很多时可配合 `offset` 和 `limit` 分页继续看。',
    '- `Read` 返回的是带行号的文件内容；如果返回 `truncated: true`、`hasMoreAfter: true`、`charLimited: true` 或 `nextStartLine`，表示当前只拿到一段，不是全文。',
    '- `RunSlashCommand` 执行的是用户当前真实酒馆实例中的斜杠命令，不是快照；查询类可以直接用，可能改动实例状态的命令要先明确说明并征得用户同意。',
    '- 调用工具时，使用工具定义里的确切名字和参数名，不要自己改名或脑补额外字段。',
    '- 工具如果返回 `ok: false`、`error`、`raw`、`truncated`、`warning` 等字段，必须按字面理解并如实告诉用户，不要把失败、截断、空结果当成成功证据。',
    '- 如果工具返回的是原样 API / 代理错误文本，就直接基于该文本说明问题，不要擅自改写成别的原因。',
    '- 当工具结果不足以支撑结论时，要继续查证，或明确说明当前还不能确认。',
];

export const TOOL_DEFINITIONS = [
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.LS,
            description: [
                '列出某个目录下的一级子项。',
                '用途：查看项目结构、确认某层有哪些目录/文件、数插件目录或模块目录。',
                '限制：只看一级子项，不读文件内容，不递归搜索。',
                '当你想知道“这一层有什么”时优先用它。',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: '目录公开路径，例如 scripts/extensions/third-party/ 或 scripts/extensions/third-party/LittleWhiteBox/modules/。' },
                    limit: { type: 'number', description: '最多返回多少个一级子项。默认 50，最大 100。' },
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
                '按 glob 模式匹配文件路径。',
                '用途：先按路径模式缩小文件集合，例如 **/*.js、modules/assistant/**/*.js、story-summary/**/vector*.js。',
                '限制：只匹配文件路径，不检查文件内容。',
                '当你已经大致知道目录范围、想找某类文件时优先用它。',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    pattern: { type: 'string', description: 'glob 路径模式，例如 scripts/extensions/third-party/LittleWhiteBox/modules/**/*.js。' },
                    limit: { type: 'number', description: '最多返回多少个文件。默认 50，最大 100。' },
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
                '在文件内容中按 grep/rg 风格搜索。',
                '用途：搜索明确关键词、函数名、变量名、报错文本、配置项名或正则模式。',
                '默认按正则表达式处理；可用 glob 限定文件范围。',
                '输出模式：content 返回命中片段；files_with_matches 只返回命中文件；count 返回每个文件的命中次数。',
                '结果很多时，用 offset 跳过前 N 个结果，再配合 limit 查看下一页。',
                '不要用它做“熟悉整个项目”的宽泛扫射；开放式探索应先 LS / Glob，再针对性 Grep。',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    pattern: { type: 'string', description: 'grep/rg 风格的搜索模式。默认按正则处理。' },
                    glob: { type: 'string', description: '可选的文件路径 glob，例如 **/*.js 或 modules/assistant/**/*.js。' },
                    outputMode: {
                        type: 'string',
                        enum: ['content', 'files_with_matches', 'count'],
                        description: '输出模式。content 返回命中行和上下文；files_with_matches 只返回命中文件；count 返回每个文件的命中次数。默认 files_with_matches。',
                    },
                    limit: { type: 'number', description: '最多返回多少个结果。默认 10，最大 50。可与 offset 一起用于分页。' },
                    offset: { type: 'number', description: '跳过前多少个结果后再返回。默认 0。适合结果很多时继续看下一页。' },
                    contextLines: { type: 'number', description: '每个匹配前后显示多少行上下文。默认 0，最大 5。' },
                    useRegex: { type: 'boolean', description: '是否按正则表达式处理。默认 true；需要字面量搜索时传 false。' },
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
                '读取某个已索引公开文本文件。',
                '用途：查看具体实现、配置、样式、注释和文档内容。',
                '默认会尽量读取整文件；文件过大时会自动返回首段，并给出 nextStartLine / nextEndLine 供继续读取。',
                '可选 startLine / endLine 按行读取；当你已经知道大致位置时，优先定向读取需要的片段。',
                '结果使用带行号的文本格式返回，便于直接引用具体行。',
                '如果返回 truncated、hasMoreAfter、charLimited 或 nextStartLine，表示当前只拿到一段，不是全文。',
                '目录不能用 Read；目录结构请用 LS，文件集合请用 Glob，内容搜索请用 Grep。',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: '文件公开路径，例如 scripts/extensions/third-party/LittleWhiteBox/index.js。' },
                    startLine: { type: 'number', description: '可选起始行号（从 1 开始）。用于大文件分段读取。' },
                    endLine: { type: 'number', description: '可选结束行号。不填时会自动给出一个合适范围。' },
                },
                required: ['path'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.RUN_SLASH_COMMAND,
            description: [
                '执行 SillyTavern 斜杠命令（STscript）。',
                '用途：查询用户当前真实酒馆实例里的 API、模型、角色、聊天、扩展状态，或在用户明确同意后执行角色创建等操作。',
                '这不是读快照，而是直接作用于用户当前打开的实例。',
                '调用前要先想清楚命令会不会改动实例状态；查询类命令可直接执行，创建/修改/删除/发送消息/切换状态类命令要先征得用户同意。',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    command: { type: 'string', description: '要执行的斜杠命令文本，例如 /api、/model、/char-get field=name、/char-create name=\"Alice\"。' },
                },
                required: ['command'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.READ_WORKLOG,
            description: '读取酒馆 user/files/LittleWhiteBox_Assistant_Worklog.md 这份固定工作记录；如果文件还不存在，也会返回不存在状态。',
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
            description: '将排查结果或工作记录写入酒馆 user/files 下的工作记录文件。默认写入 user/files/LittleWhiteBox_Assistant_Worklog.md；如果未指定 name，就写默认工作记录。',
            parameters: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: '工作区文件名。' },
                    content: { type: 'string', description: '完整文档内容。' },
                },
                required: ['content'],
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
            return `查看目录 ${args.path || ''}`.trim();
        case TOOL_NAMES.GLOB:
            return `匹配文件 ${args.pattern || ''}`.trim();
        case TOOL_NAMES.GREP:
            return `搜索内容 ${args.pattern || ''}`.trim();
        case TOOL_NAMES.READ:
            return `读取文件 ${args.path || ''}${args.startLine ? `:${args.startLine}` : ''}${args.endLine ? `-${args.endLine}` : ''}`.trim();
        case TOOL_NAMES.RUN_SLASH_COMMAND:
            return `执行斜杠命令 ${args.command || ''}`.trim();
        case TOOL_NAMES.READ_WORKLOG:
            return '读取工作记录';
        case TOOL_NAMES.WRITE_WORKLOG:
            return `写入工作记录 ${args.name || ''}`.trim();
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
        if (parsed.truncated) {
            lines.push('结果已截断，可以把目录范围再收窄一点。');
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
        const outputMode = parsed.outputMode || 'files_with_matches';
        const lines = [`grep“${parsed.pattern || ''}”模式：${outputMode}。当前展示 ${items.length} 个结果。`];
        if (parsed.glob) {
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
                lines.push(`总命中文件数：${parsed.total}`);
            }
        } else if (Number.isFinite(parsed.total)) {
            lines.push(`总命中文件数：${parsed.total}`);
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
                    const firstMatch = Array.isArray(item.matches) ? item.matches[0] : null;
                    const lineInfo = firstMatch?.line ? `:${firstMatch.line}` : '';
                    lines.push(`- ${item.path}${lineInfo}${item.matchCount ? `（${item.matchCount} 处）` : ''}`);

                    if (Array.isArray(item.matches) && item.matches.length) {
                        detailLines.push(item.path);
                        item.matches.forEach((match, index) => {
                            detailLines.push(`  [${index + 1}] 第 ${match.line || '?'} 行: ${match.text || ''}`);
                            if (match.context) {
                                detailLines.push(match.context);
                            }
                        });
                        detailLines.push('');
                    }
                }
            });
        }
        return {
            summary: lines.join('\n'),
            details: detailLines.join('\n').trim(),
        };
    }

    if (message.toolName === TOOL_NAMES.READ) {
        const lines = [
            `已读取文件：${parsed.path || ''}`,
            parsed.source ? `来源：${parsed.source}` : '',
            `范围：第 ${parsed.startLine || 1} 行到第 ${parsed.endLine || 0} 行 / 共 ${parsed.totalLines || 0} 行`,
            parsed.contentFormat === 'numbered_lines' ? '格式：带行号内容' : '',
        ];
        if (parsed.autoChunked) {
            lines.push('文件较大，当前自动返回首段。');
        }
        if (parsed.charLimited) {
            lines.push('当前结果还受输出预算限制，继续读取时请按 nextStartLine / nextEndLine 往后读。');
        }
        if (parsed.hasMoreBefore) {
            lines.push('前面还有内容。');
        }
        if (parsed.hasMoreAfter) {
            lines.push(`后面还有内容；如需继续，可从第 ${parsed.nextStartLine} 行读到第 ${parsed.nextEndLine} 行。`);
        }
        if (!parsed.hasMoreBefore && !parsed.hasMoreAfter) {
            lines.push('当前已是完整读取结果。');
        }
        return {
            summary: lines.filter(Boolean).join('\n'),
            details: String(parsed.content || ''),
        };
    }

    if (message.toolName === TOOL_NAMES.RUN_SLASH_COMMAND) {
        const lines = [
            `已执行斜杠命令：${parsed.command || ''}`,
            parsed.ok === false ? '状态：失败' : '状态：成功',
        ];
        if (parsed.error) {
            lines.push(`错误：${parsed.error}`);
        }
        if (parsed.note) {
            lines.push(`说明：${parsed.note}`);
        }

        let details = '';
        if (parsed.result !== undefined) {
            details = typeof parsed.result === 'string'
                ? parsed.result
                : JSON.stringify(parsed.result, null, 2);
        } else if (parsed.raw) {
            details = typeof parsed.raw === 'string'
                ? parsed.raw
                : JSON.stringify(parsed.raw, null, 2);
        }

        return {
            summary: lines.filter(Boolean).join('\n'),
            details,
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

    return {
        summary: JSON.stringify(parsed, null, 2),
        details: '',
    };
}
