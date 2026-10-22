import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { after } from 'node:test';

// Keep module addresses and error stacks short without hiding test failures.
// Each module lives only until its node:test scope finishes.
export async function createTestModuleUrl(source) {
    const directory = await mkdtemp(path.join(tmpdir(), 'lwb-summary-test-'));
    after(() => rm(directory, { recursive: true, force: true }));
    const file = path.join(directory, 'bundle.mjs');
    await writeFile(file, source, 'utf8');
    return pathToFileURL(file).href;
}
