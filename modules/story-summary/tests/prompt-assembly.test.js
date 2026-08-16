import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import process from 'node:process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const rootDir = fileURLToPath(new URL('../../../', import.meta.url));
const runnerPath = fileURLToPath(new URL('../../../scripts/story-summary-replay-runner.mjs', import.meta.url));
const resultPrefix = '[story-summary-replay] prompt assembly check: ';

test('final prompt bounds temporal protection and renders ordinary overflow by floor', { timeout: 120_000 }, async () => {
    const { stdout } = await execFileAsync(
        process.execPath,
        [runnerPath, '--check-prompt-assembly'],
        { cwd: rootDir, windowsHide: true, maxBuffer: 1024 * 1024 },
    );
    const resultLine = stdout.split(/\r?\n/).find(line => line.startsWith(resultPrefix));
    assert.ok(resultLine, `missing prompt assembly result in output:\n${stdout}`);
    const result = JSON.parse(resultLine.slice(resultPrefix.length));

    assert.deepEqual(result.externalCalls, []);

    assert.equal(result.event.temporalWinners, 7);
    assert.equal(result.event.temporalProtectionCap, 5);
    assert.ok(result.event.temporalProtected <= 5);
    assert.equal(result.event.temporalProtected, 5);
    assert.equal(result.event.temporalOverflow, 2);
    assert.deepEqual(result.event.overflowRendered, [true, true]);

    assert.equal(result.evidence.summarizedBudgetMax, 3000);
    assert.equal(result.evidence.temporalProtectionBudgetMax, 1200);
    assert.ok(result.evidence.temporalProtectedTokens > 0);
    assert.ok(
        result.evidence.temporalProtectedTokens
            <= Math.floor(result.evidence.summarizedBudgetMax * 0.40),
    );
    assert.equal(result.evidence.temporalProtectedItems, 1);

    assert.equal(result.evidence.enumerated, 4);
    assert.equal(result.evidence.admitted, 3);
    assert.equal(result.evidence.skippedByBudget, 1);
    assert.deepEqual(result.evidence.markerRendered, {
        protected: true,
        ordinaryHigh: true,
        temporalOverflow: true,
        ordinaryLow: false,
    });
    assert.deepEqual(result.evidence.renderedEvidenceFloors, [102, 106, 110]);
});
