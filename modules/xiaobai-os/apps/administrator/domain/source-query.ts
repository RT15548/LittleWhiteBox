// Read-only lookup algorithms copied from modules/assistant/assistant.js.
// Local workspace branches are omitted: this package owns only indexed OS source.
import { OS_SOURCE_LIMITS as LIMITS, type SourceFile, type SourceDirectoryItem } from './source-code.js';

export function escapeRegExp(text: string) { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function findMatchingToken(text: string, start: number, open: string, close: string) {
    let depth = 0;
    for (let index = start; index < text.length; index++) {
        const char = text[index];
        if (char === '\\') { index++; continue; }
        if (char === open) { depth++; }
        if (char === close && --depth === 0) { return index; }
    }
    return -1;
}

function splitTopLevel(text: string) {
    const parts: string[] = [];
    let depth = 0, current = '';
    for (let index = 0; index < text.length; index++) {
        const char = text[index];
        if (char === '\\') {
            current += char;
            if (index + 1 < text.length) { current += text[++index]; }
            continue;
        }
        if (char === '{' || char === '[' || char === '(') { depth++; }
        if (char === '}' || char === ']' || char === ')') { depth = Math.max(0, depth - 1); }
        if (char === ',' && depth === 0) { parts.push(current); current = ''; continue; }
        current += char;
    }
    parts.push(current);
    return parts;
}

function globFragmentToRegex(pattern: string): string {
    let expression = '';
    for (let index = 0; index < pattern.length; index++) {
        const char = pattern[index];
        if (char === '\\') {
            expression += index + 1 < pattern.length ? escapeRegExp(pattern[++index]) : '\\\\';
        } else if (char === '*') {
            if (pattern[index + 1] === '*') {
                const directory = pattern[index + 2] === '/';
                expression += directory ? '(?:.*\\/)?' : '.*';
                index += directory ? 2 : 1;
            } else { expression += '[^/]*'; }
        } else if (char === '?') { expression += '[^/]'; }
        else if (char === '[') {
            const closing = pattern.indexOf(']', index + 1);
            if (closing === -1) { expression += '\\['; continue; }
            const raw = pattern.slice(index + 1, closing), negated = raw.startsWith('!');
            const body = (negated ? raw.slice(1) : raw).replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
            expression += `[${negated ? '^' : ''}${body}]`;
            index = closing;
        } else if (char === '{') {
            const closing = findMatchingToken(pattern, index, '{', '}');
            if (closing === -1) { expression += '\\{'; continue; }
            const raw = pattern.slice(index + 1, closing), alternatives = splitTopLevel(raw).filter(Boolean);
            expression += alternatives.length > 1 ? `(?:${alternatives.map(globFragmentToRegex).join('|')})` : `\\{${escapeRegExp(raw)}\\}`;
            index = closing;
        } else { expression += escapeRegExp(char); }
    }
    return expression;
}

export function compileGlobPattern(pattern: string) {
    const normalized = pattern.replace(/\\/g, '/').trim();
    const regex = new RegExp(`^${globFragmentToRegex(normalized)}$`, 'i');
    return (file: SourceFile) => regex.test(file.publicPath) || regex.test(file.relativePath)
        || !normalized.includes('/') && regex.test(file.publicPath.split('/').pop()!);
}

export function filterFilesByPath(files: SourceFile[], path: string) {
    const exact = files.filter(file => file.publicPath === path);
    return exact.length ? exact : files.filter(file => file.publicPath.startsWith(`${path}/`));
}

export function buildDirectoryItems(files: SourceFile[], directoryPath: string) {
    const entries = new Map<string, SourceDirectoryItem>();
    for (const file of files) {
        if (!file.publicPath.toLowerCase().startsWith(directoryPath.toLowerCase())) { continue; }
        const remainder = file.publicPath.slice(directoryPath.length);
        if (!remainder) { continue; }
        const slash = remainder.indexOf('/'), directory = slash !== -1;
        const name = directory ? remainder.slice(0, slash) : remainder;
        const publicPath = `${directoryPath}${name}${directory ? '/' : ''}`;
        const existing = entries.get(publicPath);
        if (existing) { existing.descendantFileCount++; }
        else { entries.set(publicPath, { publicPath, source: file.source, type: directory ? 'directory' : 'file', descendantFileCount: 1 }); }
    }
    return [...entries.values()].sort((a, b) => a.publicPath.localeCompare(b.publicPath, 'zh-CN'));
}

export function directoryContent(items: SourceDirectoryItem[]) {
    return items.map(item => item.type === 'directory' ? `${item.publicPath.split('/').at(-2)}/` : item.publicPath.split('/').at(-1)).join('\n');
}

export function findPathSuggestions(targetPath: string, files: SourceFile[]) {
    const target = targetPath.toLowerCase(), targetBasename = target.split('/').pop()!;
    function rank(file: SourceFile) {
        const path = file.publicPath.toLowerCase(), relative = file.relativePath.toLowerCase(), basename = path.split('/').pop()!;
        if (path === target) { return 100; }
        if (relative === target) { return 95; }
        if (basename === targetBasename) { return 90; }
        if (path.endsWith(`/${target}`) || relative.endsWith(`/${target}`)) { return 80; }
        if (path.includes(target) || relative.includes(target)) { return 70; }
        if (basename && target.includes(basename)) { return 60; }
        if (targetBasename && basename.includes(targetBasename)) { return 50; }
        return 0;
    }
    return files.map(file => ({ file, score: rank(file) })).filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score || a.file.publicPath.localeCompare(b.file.publicPath, 'zh-CN'))
        .slice(0, LIMITS.suggestions).map(item => item.file.publicPath);
}

const LINE_TRUNCATION_SUFFIX = `... (line truncated to ${LIMITS.lineChars} chars)`;
export function truncateReadLine(line: string) {
    return line.length <= LIMITS.lineChars ? line : `${line.slice(0, LIMITS.lineChars)}${LINE_TRUNCATION_SUFFIX}`;
}

export function sliceLinesWithBudget(lines: string[], startLine: number, requestedEndLine: number, options: { numbered?: boolean; fromEnd?: boolean } = {}) {
    const selected: string[] = [], width = String(Math.max(lines.length, startLine)).length;
    const lastLine = Math.min(requestedEndLine, lines.length);
    let totalChars = 0, charLimited = false;
    for (let index = 0; index <= lastLine - startLine; index++) {
        const line = options.fromEnd ? lastLine - index : startLine + index;
        const text = truncateReadLine(lines[line - 1]);
        const formatted = options.numbered === false ? text : `${String(line).padStart(width, ' ')}\t${text}`;
        const addition = formatted.length + (selected.length ? 1 : 0);
        if (selected.length && totalChars + addition > LIMITS.readChars) { charLimited = true; break; }
        selected.push(formatted);
        totalChars += addition;
    }
    if (options.fromEnd) { selected.reverse(); }
    const firstLine = options.fromEnd ? lastLine - selected.length + 1 : startLine;
    return { content: selected.join('\n'), startLine: firstLine, endLine: lines.length ? firstLine + selected.length - 1 : 0,
        returnedLines: selected.length, charLimited };
}
