// 场景规划“最近记录”查看器：NovelAI / SD WebUI / ComfyUI 提示词页的「最近一次实际请求」共用。
// 数据来自 draw-agent-runtime 的历史记录（getDrawAgentDiagnosticHistory，新到旧）。
// 默认列出成功（含进行中）的记录；勾选“只看失败”后只列失败的。每条默认折叠，展开后分“模型返回 / 请求 / 原始 JSON”。
// 只用 DOM API + textContent，不拼 HTML：返回内容里有故事文本和供应商原文。

const STATUS_LABELS = { success: '成功', error: '失败', running: '进行中' };

// ───────────── 纯函数（不依赖 DOM，便于测试）─────────────

/** 默认只留成功/进行中的记录；failedOnly 时只留失败的。 */
export function filterRecords(records, { failedOnly = false } = {}) {
    const list = Array.isArray(records) ? records : [];
    return list.filter(record => (record?.status === 'error') === failedOnly);
}

export function formatDuration(ms) {
    const number = Number(ms);
    if (!Number.isFinite(number) || number < 0) return '';
    return number < 1000 ? `${Math.round(number)} 毫秒` : `${(number / 1000).toFixed(1)} 秒`;
}

function formatClock(timestamp) {
    const date = new Date(Number(timestamp));
    if (Number.isNaN(date.getTime())) return '';
    const pad = value => String(value).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** 一条记录在列表里的摘要：状态、标题（时间 + 模型）和若干说明。 */
export function describeRecord(record) {
    const status = record?.status === 'error' ? 'error' : record?.status === 'success' ? 'success' : 'running';
    const model = [record?.provider, record?.model].filter(Boolean).join(' / ') || '未知模型';
    const meta = [];
    const duration = formatDuration(record?.durationMs);
    if (duration) meta.push(duration);
    if (record?.retryCount > 0) meta.push(`重试 ${record.retryCount} 次`);
    if (status === 'success' && Number.isFinite(record?.imageTaskCount)) meta.push(`${record.imageTaskCount} 张图`);
    if (status === 'error') meta.push(record?.errorCode || '失败');
    else if (record?.finishReason) meta.push(`finish: ${record.finishReason}`);
    return { status, statusLabel: STATUS_LABELS[status], time: formatClock(record?.timestamp), model, meta };
}

function parseJson(text) {
    try {
        return { ok: true, value: JSON.parse(text) };
    } catch {
        return { ok: false };
    }
}

function normalizeArguments(value) {
    if (typeof value !== 'string') return { kind: 'json', value };
    const parsed = parseJson(value);
    return parsed.ok ? { kind: 'json', value: parsed.value } : { kind: 'text', text: value };
}

function sectionsFromModelOutput(modelOutput, truncated) {
    const parsed = parseJson(modelOutput);
    if (!parsed.ok) {
        return [{ title: truncated ? '模型返回（已截断，不是完整 JSON）' : '模型返回（原文）', kind: 'text', text: String(modelOutput) }];
    }
    const output = parsed.value && typeof parsed.value === 'object' ? parsed.value : {};
    const sections = [];
    for (const call of Array.isArray(output.toolCalls) ? output.toolCalls : []) {
        sections.push({ title: `工具调用 ${call?.name || ''}`.trim(), ...normalizeArguments(call?.arguments) });
    }
    if (output.text) sections.push({ title: '文本', kind: 'text', text: String(output.text) });
    if (output.thoughts) {
        sections.push(typeof output.thoughts === 'string'
            ? { title: '思考', kind: 'text', text: output.thoughts }
            : { title: '思考', kind: 'json', value: output.thoughts });
    }
    if (output.usage) sections.push({ title: '用量', kind: 'json', value: output.usage });
    if (truncated) sections.push({ title: '提示', kind: 'text', text: '返回内容过长，记录里已截断。' });
    return sections;
}

/**
 * 把记录里的各次请求整理成“每次请求 → 若干段”。tone：ok / warn（返回了但校验没过）/ error（请求失败）。
 * 成功返回在 attempt.modelOutput，校验失败的返回在 validationFailures（按 attempt + retry 对应），
 * 请求失败时只有供应商回复摘要和原始消息。
 */
export function buildReturnAttempts(record) {
    const attempts = Array.isArray(record?.attempts) ? record.attempts : [];
    const failures = Array.isArray(record?.validationFailures) ? record.validationFailures : [];
    return attempts.map((attempt, index) => {
        const failure = failures.find(item => item?.attempt === attempt?.attempt && (item?.retry ?? 0) === (attempt?.retry ?? 0));
        const sections = [];
        if (failure) {
            sections.push({
                title: '校验失败',
                kind: 'json',
                value: {
                    code: failure.errorCode,
                    message: failure.errorMessage,
                    path: failure.errorPath,
                    rule: failure.errorRule,
                    expected: failure.expected,
                    received: failure.received,
                },
            });
        }
        const modelOutput = failure?.modelOutput ?? attempt?.modelOutput;
        if (modelOutput) {
            sections.push(...sectionsFromModelOutput(modelOutput, (failure?.modelOutputTruncated ?? attempt?.modelOutputTruncated) === true));
        }
        if (attempt?.errorCode) {
            sections.push({
                title: '失败原因',
                kind: 'json',
                value: {
                    code: attempt.errorCode,
                    ...(attempt.errorMessage ? { message: attempt.errorMessage } : {}),
                    ...(attempt.finishReason ? { finishReason: attempt.finishReason } : {}),
                    ...(Number.isInteger(attempt.errorOffset) ? { offset: attempt.errorOffset } : {}),
                },
            });
        }
        if (attempt?.responseInfo !== undefined) sections.push({ title: '供应商回复摘要', kind: 'json', value: attempt.responseInfo });
        if (attempt?.partialTextHead) {
            sections.push({
                title: `已收到的文本（前 ${attempt.partialTextHead.length} 字，共 ${attempt.partialTextLength} 字）`,
                kind: 'text',
                text: attempt.partialTextHead,
            });
        }
        if (attempt?.rawAssistantMessage !== undefined) sections.push({ title: '供应商原始消息', kind: 'json', value: attempt.rawAssistantMessage });
        return {
            key: `${attempt?.retry ?? 0}-${attempt?.attempt ?? index + 1}`,
            label: `第 ${attempt?.attempt ?? index + 1} 次请求${attempt?.retry ? `（重试 ${attempt.retry}）` : ''}`,
            tone: attempt?.errorCode ? 'error' : failure ? 'warn' : 'ok',
            meta: [formatDuration(attempt?.durationMs), attempt?.finishReason ? `finish: ${attempt.finishReason}` : ''].filter(Boolean),
            sections,
        };
    });
}

// ───────────── 界面 ─────────────

const STYLE_ID = 'xb-llm-records-style';
// 配色沿用三个设置页共有的变量（--bg-input / --border / --text-secondary / --accent / --success / --danger / --warning）。
export const LLM_RECORDS_CSS = `
.lr-root { margin-top: 10px; display: grid; gap: 8px; }
.lr-toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 12px; color: var(--text-secondary); }
.lr-toolbar label { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
.lr-empty { padding: 12px; font-size: 12px; color: var(--text-secondary); border: 1px dashed var(--border); border-radius: 8px; }
.lr-record { border: 1px solid var(--border); border-radius: 8px; background: var(--bg-input); }
.lr-record > summary, .lr-sec > summary { cursor: pointer; list-style: none; }
.lr-record > summary::-webkit-details-marker, .lr-sec > summary::-webkit-details-marker { display: none; }
.lr-record > summary { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 10px; font-size: 12px; }
.lr-badge { padding: 1px 8px; border-radius: 10px; font-size: 11px; background: var(--accent-soft); color: var(--accent); }
.lr-record[data-status="success"] .lr-badge { background: rgba(63, 185, 80, 0.15); color: var(--success); }
.lr-record[data-status="error"] .lr-badge { background: rgba(248, 81, 73, 0.15); color: var(--danger); }
.lr-time { color: var(--text-secondary); font-family: monospace; }
.lr-meta { color: var(--text-secondary); }
.lr-body { display: grid; gap: 8px; padding: 0 10px 10px; }
.lr-actions { display: flex; align-items: center; gap: 8px; }
.lr-copy-status { font-size: 11px; color: var(--text-secondary); }
.lr-sec { border: 1px solid var(--border); border-radius: 6px; }
.lr-sec > summary { padding: 6px 10px; font-size: 12px; color: var(--text-secondary); }
.lr-sec[open] > summary { border-bottom: 1px solid var(--border); }
.lr-sec-body { display: grid; gap: 8px; padding: 8px 10px; }
.lr-attempt-head { display: flex; gap: 8px; align-items: baseline; font-size: 12px; }
.lr-attempt[data-tone="error"] .lr-attempt-title { color: var(--danger); }
.lr-attempt[data-tone="warn"] .lr-attempt-title { color: var(--warning); }
.lr-block-title { font-size: 11px; color: var(--text-secondary); margin: 6px 0 2px; }
.lr-pre {
    margin: 0; padding: 8px 10px; max-height: 320px; overflow: auto;
    background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px;
    color: var(--text-secondary); font-family: monospace; font-size: 11px; line-height: 1.45;
    white-space: pre-wrap; word-break: break-word;
}
`;

function create(document, tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function ensureStyle(document) {
    if (document.getElementById(STYLE_ID)) return;
    const style = create(document, 'style', '', LLM_RECORDS_CSS);
    style.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(style);
}

function stringify(value) {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

function renderBlocks(document, parent, sections) {
    for (const section of sections) {
        parent.appendChild(create(document, 'div', 'lr-block-title', section.title));
        parent.appendChild(create(document, 'pre', 'lr-pre', section.kind === 'text' ? section.text : stringify(section.value)));
    }
}

function createSection(document, title, open = false) {
    const details = create(document, 'details', 'lr-sec');
    if (open) details.setAttribute('open', '');
    details.appendChild(create(document, 'summary', '', title));
    const body = create(document, 'div', 'lr-sec-body');
    details.appendChild(body);
    return { details, body };
}

async function copyText(document, text) {
    const view = document.defaultView;
    if (view?.navigator?.clipboard?.writeText) {
        await view.navigator.clipboard.writeText(text);
        return;
    }
    const area = create(document, 'textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand?.('copy');
    area.remove();
    if (!ok) throw new Error('copy unsupported');
}

/**
 * 在 container 里建查看器。getRecords() 返回历史记录（新到旧）；render() 按当前勾选重绘。
 * 重绘会保留各条记录的展开状态，“只看失败”的勾选也留在查看器里。
 */
export function createLlmRecordsView({ document, container, getRecords }) {
    if (!document || !container) throw new TypeError('createLlmRecordsView 需要 document 和 container');
    ensureStyle(document);
    container.classList.add('lr-root');
    while (container.firstChild) container.removeChild(container.firstChild);

    const toolbar = create(document, 'div', 'lr-toolbar');
    const label = create(document, 'label');
    const checkbox = create(document, 'input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('aria-label', '只看失败');
    label.append(checkbox, create(document, 'span', '', '只看失败'));
    const count = create(document, 'span');
    toolbar.append(label, count);
    const list = create(document, 'div', 'lr-list');
    list.style.display = 'grid';
    list.style.gap = '8px';
    container.append(toolbar, list);

    const openIds = new Set();

    function renderRecord(record) {
        const info = describeRecord(record);
        const details = create(document, 'details', 'lr-record');
        details.setAttribute('data-status', info.status);
        if (openIds.has(record.id)) details.setAttribute('open', '');
        details.addEventListener('toggle', () => {
            if (details.open) openIds.add(record.id);
            else openIds.delete(record.id);
        });

        const summary = create(document, 'summary');
        summary.append(
            create(document, 'span', 'lr-badge', info.statusLabel),
            create(document, 'span', 'lr-time', info.time),
            create(document, 'span', '', info.model),
            create(document, 'span', 'lr-meta', info.meta.join(' · ')),
        );
        details.appendChild(summary);

        const body = create(document, 'div', 'lr-body');
        const actions = create(document, 'div', 'lr-actions');
        const copy = create(document, 'button', 'btn btn-sm', '复制本条');
        copy.setAttribute('type', 'button');
        const copyStatus = create(document, 'span', 'lr-copy-status');
        copy.addEventListener('click', () => {
            copyText(document, stringify(record))
                .then(() => { copyStatus.textContent = '已复制'; })
                .catch(() => { copyStatus.textContent = '复制失败，请从“原始 JSON”里手动复制'; });
        });
        actions.append(copy, copyStatus);
        body.appendChild(actions);

        const returns = createSection(document, '模型返回');
        const attempts = buildReturnAttempts(record);
        if (!attempts.length) {
            returns.body.appendChild(create(document, 'div', 'lr-meta', '还没有收到模型返回。'));
        }
        for (const attempt of attempts) {
            const box = attempts.length === 1 ? create(document, 'div', 'lr-attempt') : create(document, 'details', 'lr-attempt');
            box.setAttribute('data-tone', attempt.tone);
            const head = create(document, attempts.length === 1 ? 'div' : 'summary', 'lr-attempt-head');
            head.append(create(document, 'strong', 'lr-attempt-title', attempt.label), create(document, 'span', 'lr-meta', attempt.meta.join(' · ')));
            box.appendChild(head);
            if (attempt.sections.length) renderBlocks(document, box, attempt.sections);
            else box.appendChild(create(document, 'div', 'lr-meta', '这次请求没有留下返回内容。'));
            returns.body.appendChild(box);
        }
        body.appendChild(returns.details);

        const request = createSection(document, '请求');
        const notices = Array.isArray(record?.notices) ? record.notices.filter(Boolean) : [];
        if (notices.length) renderBlocks(document, request.body, [{ title: '提示', kind: 'text', text: notices.join('\n') }]);
        renderBlocks(document, request.body, [{ title: '实际发送的请求', kind: record?.request === undefined ? 'text' : 'json', text: '这条记录没有请求内容。', value: record?.request }]);
        body.appendChild(request.details);

        const raw = createSection(document, '原始 JSON');
        raw.body.appendChild(create(document, 'pre', 'lr-pre', stringify(record)));
        body.appendChild(raw.details);

        details.appendChild(body);
        return details;
    }

    function render(records = getRecords?.()) {
        const all = Array.isArray(records) ? records : [];
        const shown = filterRecords(all, { failedOnly: checkbox.checked });
        while (list.firstChild) list.removeChild(list.firstChild);
        count.textContent = `${shown.length} / ${all.length} 条`;
        if (!shown.length) {
            const text = all.length
                ? (checkbox.checked ? '最近没有失败的记录。' : '最近没有成功的记录，勾选“只看失败”查看失败记录。')
                : '暂无请求记录，请先触发一次画图分析。';
            list.appendChild(create(document, 'div', 'lr-empty', text));
            return;
        }
        for (const record of shown) list.appendChild(renderRecord(record));
    }

    const onChange = () => render();
    checkbox.addEventListener('change', onChange);
    render();
    return {
        render,
        isFailedOnly: () => checkbox.checked,
        destroy() {
            checkbox.removeEventListener('change', onChange);
            while (container.firstChild) container.removeChild(container.firstChild);
        },
    };
}
