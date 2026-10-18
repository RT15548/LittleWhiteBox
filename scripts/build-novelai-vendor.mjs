import { build } from 'esbuild';
import { outputRoot } from './build/output-root.mjs';
import { Buffer } from 'node:buffer';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageDirectory = resolve(projectRoot, 'node_modules/@msgpack/msgpack');
const browserOutput = resolve(outputRoot, 'libs/msgpack.mjs');
const browserLicenseOutput = resolve(outputRoot, 'libs/msgpack.LICENSE.txt');
const serverVendorDirectory = resolve(
    outputRoot,
    'server-plugin/littlewhitebox-server/providers/novelai/vendor',
);
const serverOutput = resolve(serverVendorDirectory, 'novel-v5-parser.cjs');
const licensesOutput = resolve(serverVendorDirectory, 'THIRD_PARTY_LICENSES.txt');

const packageMetadata = JSON.parse(await readFile(resolve(packageDirectory, 'package.json'), 'utf8'));
const licenseText = await readFile(resolve(packageDirectory, 'LICENSE'), 'utf8');
const licensesDocument = [
    `@msgpack/msgpack@${packageMetadata.version}`,
    `License: ${packageMetadata.license}`,
    'Source: https://github.com/msgpack/msgpack-javascript',
    '',
    licenseText.trim(),
    '',
].join('\n');

async function bundle({ contents, outfile, format, platform, target }) {
    const result = await build({
        absWorkingDir: projectRoot,
        stdin: {
            contents,
            resolveDir: projectRoot,
            sourcefile: 'msgpack-decode-entry.mjs',
        },
        outfile,
        bundle: true,
        format,
        platform,
        target,
        minify: true,
        legalComments: 'none',
        tsconfigRaw: {},
        write: false,
    });
    const output = result.outputFiles?.find(file => resolve(file.path) === resolve(outfile));
    if (!output) throw new Error(`esbuild did not produce ${outfile}`);
    return output.contents;
}

const [browserBundle, serverBundle] = await Promise.all([
    bundle({
        contents: "export { decode } from './node_modules/@msgpack/msgpack/dist.esm/index.mjs';",
        outfile: browserOutput,
        format: 'esm',
        platform: 'browser',
        target: 'es2020',
    }),
    bundle({
        contents: `
            import { decode } from './node_modules/@msgpack/msgpack/dist.esm/index.mjs';
            import {
                NovelV5StreamError,
                readNovelV5FinalImage as readStream,
            } from './modules/draw/providers/novelai/novel-v5-stream.js';

            export { NovelV5StreamError };
            export function readNovelV5FinalImage(response, options = {}) {
                return readStream(response, { ...options, decode });
            }
        `,
        outfile: serverOutput,
        format: 'cjs',
        platform: 'node',
        target: 'node18',
    }),
]);

const outputs = [
    [browserOutput, browserBundle],
    [browserLicenseOutput, Buffer.from(licensesDocument)],
    [serverOutput, serverBundle],
    [licensesOutput, Buffer.from(licensesDocument)],
];

await Promise.all([
    mkdir(dirname(browserOutput), { recursive: true }),
    mkdir(serverVendorDirectory, { recursive: true }),
]);
await Promise.all(outputs.map(([path, contents]) => writeFile(path, contents)));
