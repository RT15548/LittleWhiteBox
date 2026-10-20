import { spawnSync } from 'node:child_process';
import { root } from './build/browser-entries.mjs';

// Product runtime checks run after unit tests, independently of private evaluation tools.
for (const args of [
    ['scripts/story-summary-runtime-check.mjs'],
]) {
    const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
}
const node18 = spawnSync(process.execPath, [
    process.env.npm_execpath, 'exec', '--yes', '--package=node@18.20.8', '--',
    'node', 'server-plugin/littlewhitebox-server/tests/agent-core-node18-compatibility.js',
], { cwd: root, stdio: 'inherit' });
if (node18.error) throw node18.error;
process.exitCode = node18.status ?? 1;
