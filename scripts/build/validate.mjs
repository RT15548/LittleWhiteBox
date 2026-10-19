import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'acorn';
import { root, entries, pages } from './browser-entries.mjs';
import { parseHTML } from 'linkedom';
import { official, referenceFor } from '../host/official.mjs';
import { createHostInterface } from '../host/interface.mjs';

export function validateBuild(directory, hostReference) {
    const references = hostReference ? [hostReference] : Object.keys(official.verificationVersions).map(referenceFor);
    const hosts = references.map(reference => createHostInterface(reference));
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
    for (const id of Object.keys(entries)) if (!manifest.entries[id]) throw new Error(`Missing entry: ${id}`);
    const audit = JSON.parse(fs.readFileSync(path.join(root, 'output/browser-build-audit.json'), 'utf8'));
    if (audit.buildId !== manifest.buildId) throw new Error('Build audit version mismatch');
    const owners = new Map();
    for (const [file, modules] of Object.entries(audit.modules)) for (const module of modules) {
        if (owners.has(module)) throw new Error(`Duplicate module: ${module} in ${file} and ${owners.get(module)}`);
        owners.set(module, file);
    }
    function verify(file) {
        const target = path.resolve(directory, file);
        if (!target.startsWith(directory + path.sep) || !fs.existsSync(target)) throw new Error(`Missing build resource: ${file}`);
    }
    for (const entry of Object.values(manifest.entries)) for (const file of [entry.file, ...entry.css]) verify(file);
    for (const [file, resource] of Object.entries(manifest.resources)) {
        verify(file);
        for (const dependency of [...resource.imports, ...resource.dynamicImports, ...resource.css]) verify(dependency);
    }
    const visited = new Set();
    const checkReference = (from, reference) => {
        if (!reference || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference) || reference.includes('${')) return;
        const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
        const target = clean.startsWith('/') ? path.resolve(root, '../../../../..', 'public', clean.slice(1)) : path.resolve(path.dirname(from), clean);
        if (target !== root && !target.startsWith(root + path.sep)) {
            const hostPath = path.relative(path.resolve(root, '../../../../..'), target).split(path.sep).join('/');
            if (hosts.some(host => !host.hasFile(hostPath))) throw new Error(`${path.relative(root, from)}: missing official host resource ${reference}`);
            return hostPath;
        }
        const relative = path.relative(path.join(root, 'dist'), target);
        const actual = !relative.startsWith('..') && !path.isAbsolute(relative) ? path.join(directory, relative) : target;
        if (!fs.existsSync(actual)) throw new Error(`${path.relative(root, from)}: missing resource ${reference}`);
        if (/\.(?:css|html|m?js)$/.test(actual) && target.startsWith(root + path.sep)) inspect(target, actual);
    };
    const inspectScript = (from, source) => {
        const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
        const visit = node => {
            if (!node || typeof node !== 'object') return;
            const value = node.type === 'ImportExpression' ? node.source?.value : /^(ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration)$/.test(node.type) ? node.source?.value : null;
            if (typeof value === 'string') {
                if (!/^(?:\.|\/|[a-z][a-z\d+.-]*:)/i.test(value)) throw new Error(`${from}: bare import ${value}`);
                const hostFile = checkReference(from, value);
                if (hostFile && node.type === 'ImportDeclaration') for (const host of hosts) host.assertImports(hostFile, node.specifiers);
            }
            if (node.type === 'NewExpression' && node.callee?.name === 'URL' && node.arguments[1]?.type === 'MemberExpression' && node.arguments[1].object?.type === 'MetaProperty') checkReference(from, node.arguments[0]?.value);
            for (const child of Object.values(node)) if (Array.isArray(child)) child.forEach(visit); else if (child && typeof child === 'object') visit(child);
        };
        visit(ast);
    };
    function inspect(from, actual = from) {
        if (visited.has(from)) return;
        visited.add(from);
        const source = fs.readFileSync(actual, 'utf8');
        if (/\.html$/.test(from)) {
            const { document } = parseHTML(source);
            for (const node of document.querySelectorAll('[src], link[href]')) checkReference(from, node.getAttribute('src') || node.getAttribute('href'));
            for (const script of document.querySelectorAll('script[type="module"]:not([src])')) inspectScript(from, script.textContent);
        } else if (/\.css$/.test(from)) {
            for (const match of source.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^'"\s)]+))\s*\)/g)) checkReference(from, match[1] ?? match[2] ?? match[3]);
        } else inspectScript(from, source);
    }
    const outputs = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? outputs(path.join(dir, item.name)) : [path.join(dir, item.name)]);
    for (const file of outputs(directory)) if (/\.(?:js|css)$/.test(file)) inspect(path.join(root, 'dist', path.relative(directory, file)), file);
    // Every file the host may request as the plugin entry must be loadable as served, not only buildable.
    const rootManifest = path.join(root, 'manifest.json');
    for (const file of new Set([JSON.parse(fs.readFileSync(rootManifest, 'utf8')).js, 'index.js'])) checkReference(rootManifest, file);
    for (const page of pages) {
        inspect(path.join(root, page));
        const source = fs.readFileSync(path.join(root, page), 'utf8');
        for (const match of source.matchAll(/loadBuildEntry\('([^']+)'\)/g)) if (!manifest.entries[match[1]]) throw new Error(`${page}: unknown entry ${match[1]}`);
    }
    return { entries: Object.keys(manifest.entries).length, modules: owners.size, chunks: Object.keys(manifest.resources).length, buildId: manifest.buildId };
}
