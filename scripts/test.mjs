import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { collectSourceFiles } from './workspace-files.mjs';

const root = path.resolve(import.meta.dirname, '..');
export function discoverTests(directory) {
    return collectSourceFiles(directory, new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts']))
        .filter(file => /\.test\.[cm]?[jt]s$/.test(file));
}
export function runTests(directory = root, options = {}) {
    const files = discoverTests(directory);
    if (!files.length) throw new Error('No tests discovered.');
    return spawnSync(process.execPath, ['--import', 'tsx', '--test', ...files.map(file => path.relative(root, file))], {
        cwd: root, stdio: 'inherit', ...options,
    });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const result = runTests();
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
}
