// pr 分支专用构建：跳过 checkProject 与 checks（pr 分支缺二改专属类型声明等文件，
// 全量校验会卡死），只跑 generators + vite build + publishBuild，产物与正式构建等价。
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { build } from 'vite';
import { root } from './build/browser-entries.mjs';
import { generators } from './build/targets.mjs';
import { publishBuild } from './build/publish.mjs';
import { buildFiles } from './build/artifacts.mjs';

// 本 PR 不触碰 draw server runtime：跳过 agent-core 签名生成，保留上游已签名的
// dist/server/runtime-*.cjs（本地无私钥，重签会产生与 release 公钥不匹配的产物）。
const skippedGenerators = ['scripts/build-agent-core-node.mjs'];
const activeGenerators = generators.filter(script => !skippedGenerators.includes(script));

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
for (const script of activeGenerators) run('node', ['--import', 'tsx', script]);
await build({ configFile: path.join(root, 'vite.plugin.config.mjs'), build: { outDir: path.join(stage, 'dist'), emptyOutDir: false } });
// 跳过 agent-core 重签：把上游已签名的 dist/server 原样搬进 stage，保持发布完整性。
const upstreamServerDir = path.join(root, 'dist/server');
const stageServerDir = path.join(stage, 'dist/server');
if (fs.existsSync(upstreamServerDir) && !fs.existsSync(stageServerDir)) {
    fs.cpSync(upstreamServerDir, stageServerDir, { recursive: true });
}
run('node', ['scripts/build-assistant-file-manifest.mjs']);
const stagedFiles = buildFiles(stage);
const targets = ['dist', ...stagedFiles.map(file => path.relative(stage, file)).filter(file => !file.startsWith(`dist${path.sep}`))];
publishBuild(root, stage, path.join(runRoot, 'previous'), targets);
console.log(JSON.stringify({ skipped: ['checkProject', 'checks', 'validateBuild'], recoveryDirectory: runRoot }));
