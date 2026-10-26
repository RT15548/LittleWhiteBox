import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parse } from 'acorn';
import { observeBackgroundTask } from '../../../../shared/common/async-errors.js';
import { MEMORY_CHAT_MESSAGES } from '../../maintenance/chat-contract.js';

// Execute production entrypoints with explicit boundary dependencies. Never
// assert source spelling: these tests protect observable state and stored data.
const sourceUrl = new URL('../../story-summary.js', import.meta.url);
const source = readFileSync(sourceUrl, 'utf8');
const declarations = parse(source, { sourceType: 'module', ecmaVersion: 'latest' }).body
    .map(node => node.type === 'ExportNamedDeclaration' ? node.declaration : node)
    .filter(Boolean);
export function entry(names, dependencies) {
    const context = vm.createContext({ observeBackgroundTask, MEMORY_CHAT_MESSAGES, ...dependencies });
    vm.runInContext(declarations.filter(node => node.type === 'FunctionDeclaration' ? names.includes(node.id.name)
        : node.type === 'VariableDeclaration' && node.declarations.some(item => names.includes(item.id.name)))
        .map(node => source.slice(node.start, node.end)).join('\n')
        .replaceAll('import.meta.url', JSON.stringify(sourceUrl.href)), context);
    return context;
}

// Run the DOM-ready and summary-toggle wiring without evaluating unrelated UI setup.
export function startupEntry(names, dependencies) {
    const context = entry(names, dependencies);
    const startup = declarations.filter(node => node.type === 'ExpressionStatement'
        && node.expression.type === 'CallExpression'
        && (node.expression.callee.name === 'jQuery'
            || (node.expression.callee.property?.name === 'on'
                && node.expression.arguments[0]?.name === 'STORY_SUMMARY_TOGGLE_EVENT')));
    vm.runInContext(startup.map(node => source.slice(node.start, node.end)).join('\n')
        .replaceAll('import.meta.url', JSON.stringify(sourceUrl.href)), context);
    return context;
}

const uiSource = readFileSync(new URL('../../story-summary-ui.js', import.meta.url), 'utf8');
const uiDeclarations = parse(uiSource, { sourceType: 'module', ecmaVersion: 'latest' }).body
    .find(node => node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression'
        && node.expression.callee.type === 'FunctionExpression').expression.callee.body.body;

export function uiEntry(names, dependencies) {
    const context = vm.createContext({ MEMORY_CHAT_MESSAGES, ...dependencies });
    vm.runInContext(uiDeclarations.filter(node => node.type === 'FunctionDeclaration' && names.includes(node.id.name))
        .map(node => uiSource.slice(node.start, node.end)).join('\n'), context);
    return context;
}
