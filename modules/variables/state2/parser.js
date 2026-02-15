import jsyaml from '../../../libs/js-yaml.mjs';

/**
 * Robust <state> block matcher (no regex)
 * - Pairs each </state> with the nearest preceding <state ...>
 * - Ignores unclosed <state>
 */

function isValidOpenTagAt(s, i) {
    if (s[i] !== '<') return false;

    const head = s.slice(i, i + 6).toLowerCase();
    if (head !== '<state') return false;

    const next = s[i + 6] ?? '';
    if (next && !(next === '>' || next === '/' || /\s/.test(next))) return false;

    return true;
}

function isValidCloseTagAt(s, i) {
    if (s[i] !== '<') return false;
    if (s[i + 1] !== '/') return false;

    const head = s.slice(i, i + 7).toLowerCase();
    if (head !== '</state') return false;

    let j = i + 7;
    while (j < s.length && /\s/.test(s[j])) j++;
    return s[j] === '>';
}

function findTagEnd(s, openIndex) {
    const end = s.indexOf('>', openIndex);
    return end === -1 ? -1 : end;
}

function findStateBlockSpans(text) {
    const s = String(text ?? '');
    const closes = [];

    for (let i = 0; i < s.length; i++) {
        if (s[i] !== '<') continue;
        if (isValidCloseTagAt(s, i)) closes.push(i);
    }
    if (!closes.length) return [];

    const spans = [];
    let searchEnd = s.length;

    for (let cIdx = closes.length - 1; cIdx >= 0; cIdx--) {
        const closeStart = closes[cIdx];
        if (closeStart >= searchEnd) continue;

        let closeEnd = closeStart + 7;
        while (closeEnd < s.length && s[closeEnd] !== '>') closeEnd++;
        if (s[closeEnd] !== '>') continue;
        closeEnd += 1;

        let openStart = -1;
        for (let i = closeStart - 1; i >= 0; i--) {
            if (s[i] !== '<') continue;
            if (!isValidOpenTagAt(s, i)) continue;

            const tagEnd = findTagEnd(s, i);
            if (tagEnd === -1) continue;
            if (tagEnd >= closeStart) continue;

            openStart = i;
            break;
        }

        if (openStart === -1) continue;

        const openTagEnd = findTagEnd(s, openStart);
        if (openTagEnd === -1) continue;

        spans.push({
            openStart,
            openTagEnd: openTagEnd + 1,
            closeStart,
            closeEnd,
        });

        searchEnd = openStart;
    }

    spans.reverse();
    return spans;
}

export function extractStateBlocks(text) {
    const s = String(text ?? '');
    const spans = findStateBlockSpans(s);
    const out = [];
    for (const sp of spans) {
        const inner = s.slice(sp.openTagEnd, sp.closeStart);
        if (inner.trim()) out.push(inner);
    }
    return out;
}

export function computeStateSignature(text) {
    const s = String(text ?? '');
    const spans = findStateBlockSpans(s);
    if (!spans.length) return '';
    const chunks = spans.map(sp => s.slice(sp.openStart, sp.closeEnd).trim());
    return chunks.join('\n---\n');
}


/**
 * Parse $schema block
 */
function parseSchemaBlock(basePath, schemaLines) {
    const rules = [];

    const nonEmpty = schemaLines.filter(l => l.trim());
    if (!nonEmpty.length) return rules;

    const minIndent = Math.min(...nonEmpty.map(l => l.search(/\S/)));
    const yamlText = schemaLines
        .map(l => (l.trim() ? l.slice(minIndent) : ''))
        .join('\n');

    let schemaObj;
    try {
        schemaObj = jsyaml.load(yamlText);
    } catch (e) {
        console.warn('[parser] $schema YAML parse failed:', e.message);
        return rules;
    }

    if (!schemaObj || typeof schemaObj !== 'object') return rules;

    function walk(obj, curPath) {
        if (obj === null || obj === undefined) return;

        if (Array.isArray(obj)) {
            if (obj.length === 0) {
                rules.push({
                    path: curPath,
                    rule: { typeLock: 'array', arrayGrow: true },
                });
            } else {
                rules.push({
                    path: curPath,
                    rule: { typeLock: 'array', arrayGrow: true },
                });
                walk(obj[0], curPath ? `${curPath}.[*]` : '[*]');
            }
            return;
        }

        if (typeof obj !== 'object') {
            const t = typeof obj;
            if (t === 'string' || t === 'number' || t === 'boolean') {
                rules.push({
                    path: curPath,
                    rule: { typeLock: t },
                });
            }
            return;
        }

        const keys = Object.keys(obj);

        if (keys.length === 0) {
            rules.push({
                path: curPath,
                rule: { typeLock: 'object', objectExt: true },
            });
            return;
        }

        const hasWildcard = keys.includes('*');

        if (hasWildcard) {
            rules.push({
                path: curPath,
                rule: { typeLock: 'object', objectExt: true, hasWildcard: true },
            });

            const wildcardTemplate = obj['*'];
            if (wildcardTemplate !== undefined) {
                walk(wildcardTemplate, curPath ? `${curPath}.*` : '*');
            }

            for (const k of keys) {
                if (k === '*') continue;
                const childPath = curPath ? `${curPath}.${k}` : k;
                walk(obj[k], childPath);
            }
            return;
        }

        rules.push({
            path: curPath,
            rule: { typeLock: 'object', allowedKeys: keys },
        });

        for (const k of keys) {
            const childPath = curPath ? `${curPath}.${k}` : k;
            walk(obj[k], childPath);
        }
    }

    walk(schemaObj, basePath);
    return rules;
}

/**
 * Parse rule line ($ro, $range, $step, $enum)
 */
function parseRuleLine(line) {
    const tokens = line.trim().split(/\s+/);
    const directives = [];
    let pathStart = 0;

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].startsWith('$')) {
            directives.push(tokens[i]);
            pathStart = i + 1;
        } else {
            break;
        }
    }

    const path = tokens.slice(pathStart).join(' ').trim();
    if (!path || !directives.length) return null;

    const rule = {};

    for (const tok of directives) {
        if (tok === '$ro') { rule.ro = true; continue; }

        const rangeMatch = tok.match(/^\$range=\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]$/);
        if (rangeMatch) {
            rule.min = Math.min(Number(rangeMatch[1]), Number(rangeMatch[2]));
            rule.max = Math.max(Number(rangeMatch[1]), Number(rangeMatch[2]));
            continue;
        }

        const stepMatch = tok.match(/^\$step=(\d+(?:\.\d+)?)$/);
        if (stepMatch) { rule.step = Math.abs(Number(stepMatch[1])); continue; }

        const enumMatch = tok.match(/^\$enum=\{([^}]+)\}$/);
        if (enumMatch) {
            rule.enum = enumMatch[1].split(/[,、;]/).map(s => s.trim()).filter(Boolean);
            continue;
        }
    }

    return { path, rule };
}

export function parseStateBlock(content) {
    const lines = String(content ?? '').split(/\r?\n/);

    const rules = [];
    const dataLines = [];

    let inSchema = false;
    let schemaPath = '';
    let schemaLines = [];
    let schemaBaseIndent = -1;

    const flushSchema = () => {
        if (schemaLines.length) {
            const parsed = parseSchemaBlock(schemaPath, schemaLines);
            rules.push(...parsed);
        }
        inSchema = false;
        schemaPath = '';
        schemaLines = [];
        schemaBaseIndent = -1;
    };

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const trimmed = raw.trim();
        const indent = raw.search(/\S/);

        if (!trimmed || trimmed.startsWith('#')) {
            if (inSchema && schemaBaseIndent >= 0) schemaLines.push(raw);
            continue;
        }

        // $schema 开始
        if (trimmed.startsWith('$schema')) {
            flushSchema();
            const rest = trimmed.slice(7).trim();
            schemaPath = rest || '';
            inSchema = true;
            schemaBaseIndent = -1;
            continue;
        }

        if (inSchema) {
            if (schemaBaseIndent < 0) {
                schemaBaseIndent = indent;
            }

            // 缩进回退 => schema 结束
            if (indent < schemaBaseIndent && indent >= 0 && trimmed) {
                flushSchema();
                i--;
                continue;
            }

            schemaLines.push(raw);
            continue;
        }

        // 普通 $rule（$ro, $range, $step, $enum）
        if (trimmed.startsWith('$')) {
            const parsed = parseRuleLine(trimmed);
            if (parsed) rules.push(parsed);
            continue;
        }

        dataLines.push(raw);
    }

    flushSchema();

    const ops = parseDataLines(dataLines);
    return { rules, ops };
}

/**
 * 解析数据行
 */
function stripYamlInlineComment(s) {
    const text = String(s ?? '');
    if (!text) return '';
    let inSingle = false;
    let inDouble = false;
    let escaped = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inSingle) {
            if (ch === "'") {
                if (text[i + 1] === "'") { i++; continue; }
                inSingle = false;
            }
            continue;
        }
        if (inDouble) {
            if (escaped) { escaped = false; continue; }
            if (ch === '\\') { escaped = true; continue; }
            if (ch === '"') inDouble = false;
            continue;
        }
        if (ch === "'") { inSingle = true; continue; }
        if (ch === '"') { inDouble = true; continue; }
        if (ch === '#') {
            const prev = i > 0 ? text[i - 1] : '';
            if (i === 0 || /\s/.test(prev)) {
                return text.slice(0, i).trimEnd();
            }
        }
    }
    return text.trimEnd();
}

function parseDataLines(lines) {
    const results = [];

    let pendingPath = null;
    let pendingLines = [];

    const flushPending = () => {
        if (!pendingPath) return;

        if (!pendingLines.length) {
            results.push({ path: pendingPath, op: 'set', value: '' });
            pendingPath = null;
            pendingLines = [];
            return;
        }

        try {
            const nonEmpty = pendingLines.filter(l => l.trim());
            const minIndent = nonEmpty.length
                ? Math.min(...nonEmpty.map(l => l.search(/\S/)))
                : 0;

            const yamlText = pendingLines
                .map(l => (l.trim() ? l.slice(minIndent) : ''))
                .join('\n');

            const obj = jsyaml.load(yamlText);
            results.push({ path: pendingPath, op: 'set', value: obj });
        } catch (e) {
            results.push({ path: pendingPath, op: 'set', value: null, warning: `YAML 解析失败: ${e.message}` });
        } finally {
            pendingPath = null;
            pendingLines = [];
        }
    };

    for (const raw of lines) {
        const trimmed = raw.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const indent = raw.search(/\S/);

        if (indent === 0) {
            flushPending();
            const colonIdx = findTopLevelColon(trimmed);
            if (colonIdx === -1) continue;

            const path = trimmed.slice(0, colonIdx).trim();
            let rhs = trimmed.slice(colonIdx + 1).trim();
            rhs = stripYamlInlineComment(rhs);
            if (!path) continue;

            if (!rhs) {
                pendingPath = path;
                pendingLines = [];
            } else {
                results.push({ path, ...parseInlineValue(rhs) });
            }
        } else if (pendingPath) {
            pendingLines.push(raw);
        }
    }

    flushPending();
    return results;
}

function findTopLevelColon(line) {
    let inQuote = false;
    let q = '';
    let esc = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (!inQuote && (ch === '"' || ch === "'")) { inQuote = true; q = ch; continue; }
        if (inQuote && ch === q) { inQuote = false; q = ''; continue; }
        if (!inQuote && ch === ':') return i;
    }
    return -1;
}

function unescapeString(s) {
    return String(s ?? '')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\');
}

export function parseInlineValue(raw) {
    const t = String(raw ?? '').trim();

    if (t === 'null') return { op: 'del' };

    const parenNum = t.match(/^\((-?\d+(?:\.\d+)?)\)$/);
    if (parenNum) return { op: 'set', value: Number(parenNum[1]) };

    if (/^\+\d/.test(t) || /^-\d/.test(t)) {
        const n = Number(t);
        if (Number.isFinite(n)) return { op: 'inc', delta: n };
    }

    const pushD = t.match(/^\+"((?:[^"\\]|\\.)*)"\s*$/);
    if (pushD) return { op: 'push', value: unescapeString(pushD[1]) };
    const pushS = t.match(/^\+'((?:[^'\\]|\\.)*)'\s*$/);
    if (pushS) return { op: 'push', value: unescapeString(pushS[1]) };

    if (t.startsWith('+[')) {
        try {
            const arr = JSON.parse(t.slice(1));
            if (Array.isArray(arr)) return { op: 'push', value: arr };
        } catch {}
        return { op: 'set', value: t, warning: '+[] 解析失败' };
    }

    const popD = t.match(/^-"((?:[^"\\]|\\.)*)"\s*$/);
    if (popD) return { op: 'pop', value: unescapeString(popD[1]) };
    const popS = t.match(/^-'((?:[^'\\]|\\.)*)'\s*$/);
    if (popS) return { op: 'pop', value: unescapeString(popS[1]) };

    if (t.startsWith('-[')) {
        try {
            const arr = JSON.parse(t.slice(1));
            if (Array.isArray(arr)) return { op: 'pop', value: arr };
        } catch {}
        return { op: 'set', value: t, warning: '-[] 解析失败' };
    }

    if (/^-?\d+(?:\.\d+)?$/.test(t)) return { op: 'set', value: Number(t) };

    const strD = t.match(/^"((?:[^"\\]|\\.)*)"\s*$/);
    if (strD) return { op: 'set', value: unescapeString(strD[1]) };
    const strS = t.match(/^'((?:[^'\\]|\\.)*)'\s*$/);
    if (strS) return { op: 'set', value: unescapeString(strS[1]) };

    if (t === 'true') return { op: 'set', value: true };
    if (t === 'false') return { op: 'set', value: false };

    if (t.startsWith('{') || t.startsWith('[')) {
        try { return { op: 'set', value: JSON.parse(t) }; }
        catch { return { op: 'set', value: t, warning: 'JSON 解析失败' }; }
    }

    return { op: 'set', value: t };
}
