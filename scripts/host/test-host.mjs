import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { exportTestHost, installedHostRoot, official, referenceFor } from './official.mjs';

// Only *.host.test.* suites use real SillyTavern source. Outside an installation,
// materialize their inputs from the same pinned Git objects used by the build.
export function withTestHost(run) {
    const installed = installedHostRoot();
    if (installed) return run(installed);
    if (process.env.LWB_HOST_ROOT) throw new Error(`LWB_HOST_ROOT 不是酒馆目录：${process.env.LWB_HOST_ROOT}`);

    const reference = referenceFor(official.indexVersion);
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lwb-test-host-'));
    try {
        exportTestHost(reference, directory);
        return run(directory);
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
}
