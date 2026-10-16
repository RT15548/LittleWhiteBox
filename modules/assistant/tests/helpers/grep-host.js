/* eslint-env node */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { parse } from 'acorn';

const hostPath = fileURLToPath(new URL('../../assistant.js', import.meta.url));
const realImports = new Set([
    '../../core/constants.js', './shared/lookup-scope.js', './shared/local-workspace-kernel.js',
    '../agent-core/runtime/ordered-concurrent-read.js', './shared/workspace-protocol.js', './shared/read-window.js',
]);

// Execute the real private host function, replacing only unrelated SillyTavern
// integrations. No implementation is copied and no source text is asserted.
export async function bundleAssistantGrep(source, browser = false) {
    const code = source ?? await readFile(hostPath, 'utf8');
    const imports = new Map(parse(code, { ecmaVersion: 'latest', sourceType: 'module' }).body
        .filter(node => node.type === 'ImportDeclaration').map(node => [node.source.value, node.specifiers]));
    const result = await build({
        stdin: { contents: `${code}\nexport { grepFiles };`, sourcefile: hostPath, resolveDir: path.dirname(hostPath) },
        bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
        plugins: [{ name: 'grep-host-boundary', setup(builder) {
            builder.onResolve({ filter: /.*/ }, args => {
                if (realImports.has(args.path)) {
                    const fullPath = path.resolve(path.dirname(hostPath), args.path);
                    return { path: browser
                        ? `/scripts/extensions/third-party/LittleWhiteBox/${path.relative(path.resolve(path.dirname(hostPath), '../..'), fullPath).replaceAll('\\', '/')}`
                        : pathToFileURL(fullPath).href, external: true };
                }
                return { path: args.path, namespace: 'host-stub' };
            });
            builder.onLoad({ filter: /.*/, namespace: 'host-stub' }, args => ({
                contents: (imports.get(args.path) ?? []).filter(item => item.type === 'ImportSpecifier')
                    .map(item => `export const ${item.imported.name} = ${item.imported.name === 'createPlanLedger' ? '() => ({})' : 'undefined'};`).join('\n'),
                loader: 'js',
            }));
        } }],
    });
    return `${result.outputFiles[0].text}\n//# sourceURL=assistant-grep-fixture.js`;
}

export async function loadAssistantGrep(source) {
    // A distinct module per fixture keeps the manifest cache isolated.
    const url = `data:text/javascript;base64,${Buffer.from(await bundleAssistantGrep(source)).toString('base64')}#${crypto.randomUUID()}`;
    // eslint-disable-next-line no-unsanitized/method -- Local compiled test module, never user input.
    return (await import(url)).grepFiles;
}
