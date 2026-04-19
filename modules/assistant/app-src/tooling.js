export const TOOL_NAMES = {
    LS: 'LS',
    GLOB: 'Glob',
    GREP: 'Grep',
    READ: 'Read',
    RUN_SLASH_COMMAND: 'RunSlashCommand',
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

export const TOOL_USAGE_GUIDANCE = [
    '工具使用规则：',
    '- `LS` 只列目录的一级子项，适合看某层有哪些文件夹/文件，不能搜索文件内容。',
    '- `Glob` 只按路径模式匹配文件，适合先缩小文件集合；它不检查文件内容对不对。',
    '- `Grep` 只搜索文件内容里的命中片段；命中片段不是全文，也不代表上下文完整。结果很多时可配合 `offset` 和 `limit` 分页继续看。',
    '- `Read` 返回的是带行号的文件内容；如果返回 `truncated: true`、`hasMoreAfter: true`、`charLimited: true` 或 `nextStartLine`，表示当前只拿到一段，不是全文。',
    '- `RunSlashCommand` 执行的是用户当前真实酒馆实例中的斜杠命令，不是快照；是否会先弹审批，由当前权限模式决定。',
    '- `ReadSkillsCatalog` 读取技能目录索引，只看有哪些 skill、摘要和触发词；不要把它当 skill 正文。',
    '- `ReadSkill` 读取某一个 skill 的完整正文；命中目录里某项后，再按需读取对应 skill，不要默认全读。',
    '- `UpdateSkill` 更新已有 skill 的正文或元数据，并同步刷新 Skills.json；它不是新建工具，并且支持局部更新。',
    '- `GenerateSkill` 用于把刚完成的一次大流程、多次试错或值得复用的过程沉淀成 skill；先 `action: "propose"`，用户同意后再 `action: "save"`；save 阶段请显式填写全部保存字段。',
    '- `DeleteSkill` 删除已有 skill，并同时从技能正文文件与 Skills.json 中移除该项。',
    '- 更新或删除 skill 属于持久化修改；只有在用户明确要求修改/删除该 skill 时才调用，不要自己擅自覆盖或清除。',
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
                '用途：读取或操作用户当前真实酒馆实例里的对象与状态，例如角色卡、世界书、聊天、预设、扩展、当前模型与接口等。',
                '这不是读快照，而是直接作用于用户当前打开的实例。',
                '具体是否会先弹审批，由当前权限模式和运行时审批结果决定。',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    command: { type: 'string', description: '要执行的斜杠命令文本，例如 /api、/model、/char-get field=name、/char-create name="Alice"。' },
                },
                required: ['command'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.READ_IDENTITY,
            description: '读取酒馆 user/files/LittleWhiteBox_Assistant_Identity.md 这份固定身份设定文件；如果文件还不存在，也会返回不存在状态。',
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
            description: '将身份设定写入酒馆 user/files/LittleWhiteBox_Assistant_Identity.md。写入成功后，当前已打开的小白助手会立即使用新身份继续后续回合。',
            parameters: {
                type: 'object',
                properties: {
                    content: { type: 'string', description: '完整身份文档内容。' },
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
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.READ_SKILLS_CATALOG,
            description: '读取酒馆 user/files/LittleWhiteBox_Assistant_Skills.json 这份技能目录索引，返回已登记的 skill 元数据和注入用目录摘要。',
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
            description: '读取某一个 skill 的完整正文。优先传 id；也可传 filename。两者二选一，不能都不传。',
            parameters: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: '技能 id，例如 skill-plugin-debugging。' },
                    filename: { type: 'string', description: '技能文件名，例如 LittleWhiteBox_Assistant_Skill_plugin-debugging.md。' },
                },
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: TOOL_NAMES.UPDATE_SKILL,
            description: '更新已有 skill 的正文或元数据，并同步回写对应 skill 文件与 Skills.json。优先传 id；也可传 filename。支持局部更新，未提供的字段会保持原值不变。',
            parameters: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: '技能 id，例如 skill-plugin-debugging。' },
                    filename: { type: 'string', description: '技能文件名，例如 LittleWhiteBox_Assistant_Skill_plugin-debugging.md。' },
                    title: { type: 'string', description: '可选的新标题。' },
                    summary: { type: 'string', description: '可选的新一句话摘要。' },
                    triggers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: '可选的新触发关键词列表。',
                    },
                    slashTriggers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: '可选的新 slash 触发命令列表，例如 /写插件。',
                    },
                    when_to_use: { type: 'string', description: '可选的新 when_to_use。' },
                    content: { type: 'string', description: '可选的新 skill 正文（不含 frontmatter）。' },
                    enabled: { type: 'boolean', description: '可选；是否启用该 skill。' },
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
                '将刚完成的一次大流程、多次试错或值得复用的过程沉淀成 skill。',
                '必须先调用 `action: "propose"` 请求用户同意；只有拿到 approvalToken 后，才能调用 `action: "save"` 真正写入 skill 文件和 Skills.json。',
                '`action: "save"` 时，请显式填写全部保存字段。',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        enum: ['propose', 'save'],
                        description: 'propose 请求用户同意；save 在获得 approvalToken 后真正保存。',
                    },
                    title: { type: 'string', description: '技能标题，例如“长流程插件排错”。' },
                    reason: { type: 'string', description: '为什么值得沉淀成 skill。仅 propose 阶段需要。' },
                    sourceSummary: { type: 'string', description: '本次过程的简要总结。仅 propose 阶段需要。' },
                    approvalToken: { type: 'string', description: 'propose 成功后返回的一次性 token。仅 save 阶段需要。' },
                    id: { type: 'string', description: 'propose 返回的建议 skill id。仅 save 阶段需要。' },
                    summary: { type: 'string', description: '技能一句话摘要。仅 save 阶段需要。' },
                    triggers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: '触发关键词列表。仅 save 阶段需要。',
                    },
                    slashTriggers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'slash 触发命令列表，例如 /写插件。仅 save 阶段需要。',
                    },
                    when_to_use: { type: 'string', description: '什么情况下适合使用这条 skill。仅 save 阶段需要。' },
                    content: { type: 'string', description: 'skill 正文 markdown，不含 frontmatter。仅 save 阶段需要。' },
                    enabled: { type: 'boolean', description: '保存后是否启用。仅 save 阶段需要。' },
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
            description: '删除已有 skill，并同时移除技能正文文件与 Skills.json 中的目录项。优先传 id；也可传 filename。',
            parameters: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: '技能 id，例如 skill-plugin-debugging。' },
                    filename: { type: 'string', description: '技能文件名，例如 LittleWhiteBox_Assistant_Skill_plugin-debugging.md。' },
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
