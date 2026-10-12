import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

function runtimeAliasPlugin(rootDir) {
    const replayDir = path.join(rootDir, 'scripts', 'story-summary-replay');
    const shims = name => path.join(replayDir, 'shims', name);
    return {
        name: 'story-summary-replay-alias',
        setup(buildApi) {
            buildApi.onResolve({ filter: /metadata-confirmation\.js$/ }, args => {
                if (!args.importer.endsWith(`${path.sep}data${path.sep}memory-commit.js`)) return null;
                return { path: shims('metadata-confirmation.js') };
            });
            for (const name of ['extensions', 'script']) {
                buildApi.onResolve({ filter: new RegExp(`${name}\\.js$`) }, args => {
                    if (!args.importer) return null;
                    return { path: shims(`${name}.js`) };
                });
            }
            buildApi.onResolve({ filter: /openai\.js$/ }, args => {
                if (!args.importer.endsWith(`${path.sep}modules${path.sep}story-summary${path.sep}generate${path.sep}llm.js`)) return null;
                return { path: shims('openai.js') };
            });
            buildApi.onResolve({ filter: /host-llm[\\/]chat-completions[\\/]client\.js$/ }, args => {
                if (!args.importer.endsWith(`${path.sep}modules${path.sep}story-summary${path.sep}generate${path.sep}llm.js`)) return null;
                return { path: shims('host-chat-completions-client.js') };
            });
            buildApi.onResolve({ filter: /utils\.js$/ }, args => {
                if (!args.importer.includes(`${path.sep}core${path.sep}server-storage.js`)) return null;
                return { path: shims('utils.js') };
            });
        },
    };
}

export async function buildReplayBundle(rootDir, bundlePath, { plugins = [] } = {}) {
    await fs.mkdir(path.dirname(bundlePath), { recursive: true });
    return await build({
        entryPoints: [path.join(rootDir, 'scripts', 'story-summary-replay', 'entry.mjs')],
        bundle: true,
        format: 'esm',
        platform: 'node',
        external: ['@google/genai'],
        outfile: bundlePath,
        sourcemap: 'inline',
        metafile: true,
        plugins: [...plugins, runtimeAliasPlugin(rootDir)],
    });
}
