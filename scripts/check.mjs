import { spawnSync } from 'node:child_process';
import { pluginRoot, installedHostRoot, installedHostReference, assertOfficialHost } from './host/official.mjs';
import path from 'node:path';
import { validateBuild } from './build/validate.mjs';

const host = installedHostRoot();
const mode = process.argv[2] ?? 'full';
if (!['full', 'build', 'host'].includes(mode) || process.argv.length > 3) throw new Error('用法：npm run check -- [full | build | host]');
if (!host) throw new Error('Full acceptance requires an official SillyTavern checkout. Set LWB_HOST_ROOT to select the host under verification.');
const reference = installedHostReference(host);
assertOfficialHost(host, reference);
try {
    const steps = [];
    if (mode !== 'host') steps.push([process.env.npm_execpath, 'run', 'lint'], ['scripts/build.mjs', '--check']);
    if (mode !== 'build') steps.push(['scripts/test.mjs', ...(mode === 'host' ? ['host'] : [])]);
    if (mode !== 'host') steps.push(['scripts/check-runtime.mjs']);
    for (const args of steps) {
        const result = spawnSync(process.execPath, args, { cwd: pluginRoot, stdio: 'inherit' });
        if (result.error) throw result.error;
        if (result.status !== 0) throw new Error(`Acceptance step failed (${result.status}): ${args.join(' ')}`);
        if (args[0] === 'scripts/build.mjs') validateBuild(path.join(pluginRoot, 'dist'), reference);
    }
} finally {
    // A test/build that patches the host must never qualify as a successful acceptance run.
    assertOfficialHost(host, reference);
}
