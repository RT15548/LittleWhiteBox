import { build } from 'esbuild';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

await build({
    absWorkingDir: projectRoot,
    entryPoints: [resolve(projectRoot, 'node_modules/@msgpack/msgpack/dist.esm/index.mjs')],
    outfile: resolve(projectRoot, 'libs/msgpack.mjs'),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    legalComments: 'eof',
    tsconfigRaw: {},
});
