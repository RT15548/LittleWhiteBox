import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { availableParallelism } from 'node:os';
import { discoverTests, sourceGraph, typescriptTests, selectTests, isHostTest } from './test-selection.mjs';
import { withTestHost } from './host/test-host.mjs';

const root = path.resolve(import.meta.dirname, '..');
export { discoverTests };
const help = `用法：npm test -- [full | changed | standalone | host | 模块名/目录/测试文件 ...] [--list] [--concurrency=N]
  npm test                              全量测试
  npm test -- standalone                不依赖所选酒馆版本的测试
  npm test -- host                      所选酒馆版本的兼容测试
  npm test -- variables/state3          变量 3.0
  npm test -- draw story-summary        多个模块
  npm test -- changed --list            查看未提交改动对应的测试范围
默认最多同时运行 2 个测试文件；--list 只列清单，不执行。`;

export function runTests(args = [], options = {}) {
    if (args.includes('--help')) { console.log(help); return { status: 0 }; }
    const scopes = [];
    let list = false;
    let concurrency = Math.min(2, availableParallelism());
    for (const arg of args) {
        if (arg === '--list') list = true;
        else if (arg.startsWith('--concurrency=')) {
            concurrency = Number(arg.slice('--concurrency='.length));
            if (!Number.isSafeInteger(concurrency) || concurrency < 1) throw new Error('并发数必须为正整数。');
        } else if (arg.startsWith('-')) throw new Error(`未知参数：${arg}\n${help}`);
        else scopes.push(arg);
    }
    const tests = discoverTests(root);
    const graph = sourceGraph(root);
    const { files, reason } = selectTests(root, tests, scopes, { graph });
    const typedFiles = typescriptTests(files, graph);
    console.log(`测试范围：${reason}\n${files.length}/${tests.length} 个文件；${typedFiles.length} 个需要 TypeScript；并发 ${concurrency}`);
    if (list) {
        for (const file of files) console.log(path.relative(root, file));
        return { status: 0 };
    }
    if (!files.length) return { status: 0 };
    const started = performance.now();
    const execute = host => spawnSync(process.execPath, [
        '--import', './scripts/test-preload.mjs', '--test', `--test-concurrency=${concurrency}`,
        '--test-reporter=./scripts/test-reporter.mjs', ...files.map(file => path.relative(root, file)),
    ], {
        cwd: root, stdio: 'inherit', ...options,
        env: { ...process.env, ...options.env, ...(host && { LWB_HOST_ROOT: host }),
            LWB_TEST_TYPESCRIPT: JSON.stringify(typedFiles.map(file => path.relative(root, file))) },
    });
    const result = files.some(isHostTest) ? withTestHost(execute) : execute();
    console.log(`测试运行耗时：${((performance.now() - started) / 1000).toFixed(2)}s`);
    return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const result = runTests(process.argv.slice(2));
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
}
