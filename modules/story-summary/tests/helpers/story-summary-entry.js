import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parse } from 'acorn';

// Execute production entrypoints with explicit boundary dependencies. Never
// assert source spelling: these tests protect observable state and stored data.
const source = readFileSync(new URL('../../story-summary.js', import.meta.url), 'utf8');
const declarations = parse(source, { sourceType: 'module', ecmaVersion: 'latest' }).body
    .map(node => node.type === 'ExportNamedDeclaration' ? node.declaration : node)
    .filter(Boolean);
export function entry(names, dependencies) {
    const context = vm.createContext({ ...dependencies });
    vm.runInContext(declarations.filter(node => node.type === 'FunctionDeclaration' ? names.includes(node.id.name)
        : node.type === 'VariableDeclaration' && node.declarations.some(item => names.includes(item.id.name)))
        .map(node => source.slice(node.start, node.end)).join('\n'), context);
    return context;
}
