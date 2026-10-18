import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { parse } from 'acorn';
import { collectSourceFiles } from './workspace-files.mjs';
import { root, entries, discoverPages } from './build/browser-entries.mjs';

const rootConfigurations = new Set(['.eslintrc.cjs', '.eslintignore', 'vite.plugin.config.mjs', 'tsconfig.json']);
const qualityCommands = new Set(['build', 'check', 'lint', 'lint:fix', 'test']);

export function checkProject(directory = root, browserEntries = entries) {
    const files = collectSourceFiles(directory, new Set(['', '.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.json', '.jsonc', '.yaml', '.yml', '.css', '.html']));
    for (const file of files) {
        const relative = path.relative(directory, file).split(path.sep).join('/');
        const name = path.basename(file);
        const configuration = /^(?:\.eslint(?:rc.*|ignore)|eslint\.config\..+|tsconfig(?:\..+)?\.json|(?:vite|rollup|webpack)(?:\..+)?\.config\..+)$/.test(name);
        if (configuration && !rootConfigurations.has(relative)) throw new Error(`Independent project configuration: ${relative}`);
        if (relative.split('/').slice(0, -1).includes('dist')) throw new Error(`Module-owned build output: ${relative}`);
        if (name === 'package.json') {
            const scripts = JSON.parse(fs.readFileSync(file, 'utf8')).scripts || {};
            for (const command of Object.keys(scripts)) {
                if (/^(?:build|check|lint|test)(?::|$)/.test(command)
                    && (relative !== 'package.json' || !qualityCommands.has(command))) {
                    throw new Error(`Independent quality command: ${relative}#${command}`);
                }
            }
        }
    }
    for (const [id, relative] of Object.entries(browserEntries)) {
        if (!fs.existsSync(path.join(directory, relative))) throw new Error(`Missing browser entry: ${id}`);
    }
    for (const page of discoverPages(directory)) {
        const { document } = parseHTML(fs.readFileSync(path.join(directory, page), 'utf8'));
        for (const script of document.querySelectorAll('script[type="module"]')) {
            if (script.hasAttribute('src')) throw new Error(`Unmanaged module script: ${page}; use loadBuildEntry.`);
            const ast = parse(script.textContent, { ecmaVersion: 'latest', sourceType: 'module' });
            function visit(node) {
                if (!node || typeof node !== 'object') return;
                if (node.type === 'CallExpression' && ['loadBuildEntry', 'loadBuildStyles'].includes(node.callee?.name)) {
                    const id = node.arguments[0]?.value;
                    if (typeof id !== 'string' || !Object.hasOwn(browserEntries, id)) throw new Error(`Unknown browser entry in ${page}: ${id}`);
                }
                const imported = node.type === 'ImportDeclaration' || node.type === 'ImportExpression' ? node.source?.value : null;
                if (typeof imported === 'string' && !imported.endsWith('/core/build-assets.js')) throw new Error(`Unmanaged page import: ${page}: ${imported}`);
                for (const child of Object.values(node)) {
                    if (Array.isArray(child)) child.forEach(visit);
                    else if (child && typeof child === 'object') visit(child);
                }
            }
            visit(ast);
        }
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    checkProject();
    console.log('Unified project boundaries passed.');
}
