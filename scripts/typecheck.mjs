import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { collectSourceFiles } from './workspace-files.mjs';

const root = path.resolve(import.meta.dirname, '..');
export function checkTypes(directory = root, options = {}) {
    const files = collectSourceFiles(directory, new Set(['.ts', '.vue', '.mts', '.cts']));
    if (!files.length) throw new Error('No typed source discovered.');
    fs.mkdirSync(path.join(root, 'output'), { recursive: true });
    const temporary = fs.mkdtempSync(path.join(root, 'output/typecheck-'));
    const config = path.join(temporary, 'tsconfig.json');
    fs.writeFileSync(config, JSON.stringify({ extends: path.join(root, 'tsconfig.json'), files, include: [], exclude: [] }));
    try {
        return spawnSync(process.execPath, ['node_modules/vue-tsc/bin/vue-tsc.js', '--noEmit', '-p', config], {
            cwd: root, stdio: 'inherit', ...options,
        });
    } finally {
        fs.rmSync(temporary, { recursive: true });
    }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const result = checkTypes();
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
}
