import { build } from 'esbuild';
import { outputRoot } from './build/output-root.mjs';
import { Buffer } from 'node:buffer';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageDirectory = resolve(projectRoot, 'node_modules/js-sha256');
const outputPath = resolve(outputRoot, 'libs/js-sha256.mjs');
const licensePath = resolve(outputRoot, 'libs/js-sha256.LICENSE.txt');
const metadata = JSON.parse(await readFile(resolve(packageDirectory, 'package.json'), 'utf8'));
const license = await readFile(resolve(packageDirectory, 'LICENSE.txt'), 'utf8');

const result = await build({
    absWorkingDir: projectRoot,
    stdin: {
        contents: "export { sha256 } from 'js-sha256';",
        resolveDir: projectRoot,
        sourcefile: 'sha256-entry.mjs',
    },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    // Keep the browser implementation in both the plugin and Node replay/tests.
    // It needs neither Node crypto nor Web Crypto's secure-context requirement.
    define: { 'process': 'undefined' },
    minify: true,
    legalComments: 'none',
    tsconfigRaw: {},
    write: false,
});

const outputs = [
    [outputPath, result.outputFiles[0].contents],
    [licensePath, Buffer.from([
        `${metadata.name}@${metadata.version}`,
        `License: ${metadata.license}`,
        `Source: ${metadata.homepage}`,
        '',
        license.trim(),
        '',
    ].join('\n'))],
];

for (const [path, contents] of outputs) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, contents);
}
