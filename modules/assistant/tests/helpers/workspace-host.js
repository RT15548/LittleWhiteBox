/* eslint-env node */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { parse } from 'acorn';

// Run the production local handlers with only unrelated ST integrations stubbed.
export async function loadWorkspaceHostTools() {
    const hostPath = fileURLToPath(new URL('../../assistant.js', import.meta.url));
    const code = await readFile(hostPath, 'utf8');
    const real = new Set([
        './shared/local-workspace-kernel.js', '../agent-core/tools/apply-patch.js',
        '../agent-core/tools/apply-patch-execution.js', './shared/workspace-protocol.js',
        './shared/read-window.js', './shared/lookup-scope.js',
        '../../shared/common/async-errors.js',
        '../../shared/common/json-candidate.js',
    ]);
    const imports = new Map(parse(code, { ecmaVersion: 'latest', sourceType: 'module' }).body
        .filter(node => node.type === 'ImportDeclaration').map(node => [node.source.value, node.specifiers]));
    const output = await build({
        stdin: { contents: `${code}\nmanifestCache = { files: [] };\nexport { readFile, writeLocalFile, batchWriteLocalFiles, applyLocalPatch, deleteLocalFile, createLocalDirectoryTool, moveLocalFile };`, sourcefile: hostPath, resolveDir: path.dirname(hostPath) },
        bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
        plugins: [{ name: 'workspace-host-test', setup(builder) {
            builder.onResolve({ filter: /.*/ }, args => real.has(args.path)
                ? { path: pathToFileURL(path.resolve(path.dirname(hostPath), args.path)).href, external: true }
                : { path: args.path, namespace: 'host-stub' });
            builder.onLoad({ filter: /.*/, namespace: 'host-stub' }, args => ({
                contents: (imports.get(args.path) || []).filter(item => item.type === 'ImportSpecifier')
                    .map(item => `export const ${item.imported.name} = ${item.imported.name === 'createPlanLedger' ? '() => ({})' : 'undefined'};`).join('\n'),
            }));
        } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Compiled local production code, no user input.
    const host = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
    const handlers = {
        Read: host.readFile,
        Write: host.writeLocalFile, BatchWriteFiles: host.batchWriteLocalFiles,
        apply_patch: host.applyLocalPatch, Delete: host.deleteLocalFile,
        CreateDirectory: host.createLocalDirectoryTool, Move: host.moveLocalFile,
    };
    return async (name, args, options) => handlers[name](args, options);
}
