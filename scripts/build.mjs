import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { build } from 'vite';
import { root } from './build/browser-entries.mjs';
import { generators, checks } from './build/targets.mjs';
import { validateBuild } from './build/validate.mjs';
import { publishBuild } from './build/publish.mjs';
import { buildFiles, compareBuild } from './build/artifacts.mjs';
import { checkProject } from './check-project.mjs';

const checkOnly = process.argv.includes('--check');
checkProject();
fs.mkdirSync(path.join(root, 'output'), { recursive: true });
const runRoot = fs.mkdtempSync(path.join(root, 'output/plugin-build-'));
const stage = path.join(runRoot, 'stage');
fs.mkdirSync(stage);
process.env.LWB_BUILD_STAGE = stage;
process.env.TEMP = runRoot;
process.env.TMP = runRoot;
function run(command, args) {
    const result = spawnSync(command === 'node' ? process.execPath : command, args, { cwd: root, env: process.env, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Build target failed: ${args.join(' ')}`);
}
for (const [command, args] of checks) run(command, args);
for (const script of generators) run('node', ['--import', 'tsx', script]);
await build({ configFile: path.join(root, 'vite.plugin.config.mjs'), build: { outDir: path.join(stage, 'dist') } });
const summary = validateBuild(path.join(stage, 'dist'));
run('node', ['scripts/build-assistant-file-manifest.mjs']);
if (checkOnly) {
    compareBuild(root, stage);
} else {
    const stagedFiles = buildFiles(stage);
    const targets = ['dist', ...stagedFiles.map(file => path.relative(stage, file)).filter(file => !file.startsWith(`dist${path.sep}`))];
    publishBuild(root, stage, path.join(runRoot, 'previous'), targets);
}
console.log(JSON.stringify({ ...summary, checkOnly, recoveryDirectory: runRoot }));
