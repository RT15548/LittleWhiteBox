import { spawnSync } from 'node:child_process';
import { pluginRoot, installedHostRoot, installedHostReference, assertOfficialHost } from './host/official.mjs';
import path from 'node:path';
import { validateBuild } from './build/validate.mjs';

const host = installedHostRoot();
if (!host) throw new Error('Full acceptance requires an official SillyTavern checkout. Set LWB_HOST_ROOT to select the host under verification.');
const reference = installedHostReference(host);
assertOfficialHost(host, reference);
try {
    for (const args of [
        [process.env.npm_execpath, 'run', 'lint'],
        ['scripts/build.mjs', '--check'],
        ['scripts/test.mjs'],
        ['scripts/check-runtime.mjs'],
    ]) {
        const result = spawnSync(process.execPath, args, { cwd: pluginRoot, stdio: 'inherit' });
        if (result.error) throw result.error;
        if (result.status !== 0) throw new Error(`Acceptance step failed (${result.status}): ${args.join(' ')}`);
        if (args[0] === 'scripts/build.mjs') validateBuild(path.join(pluginRoot, 'dist'), reference);
    }
} finally {
    // A test/build that patches the host must never qualify as a successful acceptance run.
    assertOfficialHost(host, reference);
}
