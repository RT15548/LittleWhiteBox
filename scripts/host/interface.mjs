import { parse } from 'acorn';
import path from 'node:path';
import { readOfficialFile } from './official.mjs';

export function createHostInterface(reference, read = file => readOfficialFile(reference, file)) {
    const files = new Set(reference.entries.map(entry => entry.path));
    const cache = new Map();
    function exportsOf(file) {
        if (cache.has(file)) return cache.get(file);
        const names = new Set();
        cache.set(file, names);
        const ast = parse(read(file), { ecmaVersion: 'latest', sourceType: 'module' });
        const binding = node => {
            if (!node) return;
            if (node.type === 'Identifier') names.add(node.name);
            else if (node.type === 'ObjectPattern') node.properties.forEach(property => binding(property.value || property.argument));
            else if (node.type === 'ArrayPattern') node.elements.forEach(binding);
            else if (node.type === 'RestElement') binding(node.argument);
            else if (node.type === 'AssignmentPattern') binding(node.left);
        };
        for (const node of ast.body) {
            if (node.type === 'ExportDefaultDeclaration') names.add('default');
            if (node.type === 'ExportNamedDeclaration') {
                for (const specifier of node.specifiers) names.add(specifier.exported.name ?? specifier.exported.value);
                binding(node.declaration?.id);
                node.declaration?.declarations?.forEach(declaration => binding(declaration.id));
            }
        }
        for (const node of ast.body) if (node.type === 'ExportAllDeclaration') {
            if (node.exported) names.add(node.exported.name ?? node.exported.value);
            else for (const name of exportsOf(path.posix.join(path.posix.dirname(file), node.source.value))) {
                if (name !== 'default') names.add(name);
            }
        }
        return names;
    }
    return {
        hasFile: file => files.has(file),
        assertImports(file, specifiers) {
            for (const specifier of specifiers) {
                const name = specifier.type === 'ImportDefaultSpecifier' ? 'default' : specifier.imported?.name ?? specifier.imported?.value;
                if (name && !exportsOf(file).has(name)) throw Object.assign(new Error(`Official ${reference.version}: ${file} does not export ${name}`), { code: 'HOST_EXPORT_MISSING' });
            }
        },
    };
}
