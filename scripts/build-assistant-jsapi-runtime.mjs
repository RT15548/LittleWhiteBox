import path from 'node:path';
import { build } from 'esbuild';

const pluginRoot = process.cwd();
const entryPath = path.join(pluginRoot, 'modules/assistant/runtime-src/jsapi-runtime.js');
const outPath = path.join(pluginRoot, 'modules/assistant/dist/jsapi-runtime.js');

await build({
    entryPoints: [entryPath],
    outfile: outPath,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    sourcemap: false,
    minify: true,
    logLevel: 'info',
});
