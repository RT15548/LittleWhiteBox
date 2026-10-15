import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shouldNotifyMemoryFailure } from '../user-feedback.js';
import { entry } from './helpers/story-summary-entry.js';

const noop = () => {};
const complete = () => ({ success: true, repaired: 0 });
const unconfirmed = () => Object.assign(new Error('metadata_save_unconfirmed'), { code: 'metadata_save_unconfirmed', uncertain: true });

function feedbackHost(dependencies = {}) {
    const notices = [], diagnostics = [];
    let refreshed = 0, released = 0;
    const ui = entry(['handleAnchorGenerateNow', 'handleGenerateVectors', 'repairVectorsNow'], {
        MODULE_ID: 'summary', shouldNotifyMemoryFailure,
        getContext: () => ({ chatId: 'chat', chat: [{ mes: 'test' }] }),
        getVectorConfig: () => ({ enabled: true, l0Api: { key: 'test-only' } }),
        isVectorWriteSessionCurrent: () => true, isChatStale: () => false,
        getAnchorStats: async () => ({ incomplete: 1 }),
        getMeta: async () => ({}), getEngineFingerprint: () => 'test',
        postToFrame: noop,
        sendAnchorStatsToFrame: async () => { refreshed++; },
        sendVectorStatsToFrame: async () => { refreshed++; },
        guard: { isAnyRunning: () => false, acquire: () => () => { released++; } },
        VECTOR_WRITE_SCOPES: { EMBEDDING: 'embedding' }, VECTOR_GENERATION_OPERATION: 'vector',
        runVectorGenerationTask: async ({ ready }) => { await ready; },
        xbLog: {
            error: (_module, _message, error) => diagnostics.push(error),
            warn: (_module, _message, error) => diagnostics.push(error),
        },
        executeSlashCommand: async command => {
            // /echo severity is the external host command protocol, not UI copy.
            const match = /^\/echo severity=(\w+) /u.exec(command);
            assert.ok(match);
            notices.push(match[1]);
        },
        ...dependencies,
    });
    return { ui, notices, diagnostics, refreshed: () => refreshed, released: () => released };
}

for (const action of ['anchor', 'vector-rebuild', 'vector-repair']) {
    for (const fields of [
        { code: 'metadata_save_unconfirmed', uncertain: true },
        { code: 'metadata_unconfirmed' },
        { uncertain: true },
        { code: 'metadata_not_saved' },
        { code: 'storage_failed' },
    ]) test(`${action}: feedback preserves the actual save outcome ${JSON.stringify(fields)}`, async () => {
        const failure = Object.assign(new Error('test failure'), fields);
        let attempts = 0;
        const fail = async () => { attempts++; throw failure; };
        const host = feedbackHost({ incrementalExtractAtoms: fail, ensureCurrentSources: fail });
        if (action === 'anchor') await host.ui.handleAnchorGenerateNow('chat', {});
        else await host.ui.handleGenerateVectors(action === 'vector-repair' ? 'repair' : 'rebuild');
        const uncertain = fields.uncertain || fields.code === 'metadata_unconfirmed';
        assert.deepEqual(host.notices, uncertain ? [] : ['error']);
        assert.deepEqual(host.diagnostics, [failure]);
        assert.equal(attempts, 1);
        assert.equal(host.refreshed(), 1);
        assert.equal(host.released(), action === 'anchor' ? 0 : 1);
    });
}

for (const mode of ['throw', 'wrapped', 'code', 'confirmed-failure', 'mixed', 'success']) {
    test(`vector repair does not turn hidden uncertainty into success or hide a real failure: ${mode}`, async () => {
        const failure = unconfirmed(), calls = [], reportedCodes = [];
        const host = feedbackHost({
            repairMissingChunks: async () => {
                calls.push('L1');
                return mode === 'mixed' ? { success: false, code: 'embedding_network_error' } : complete();
            },
            vectorizeMissingStateAtoms: async () => {
                calls.push('L0');
                if (mode === 'throw') throw failure;
                if (mode === 'wrapped' || mode === 'mixed') return { success: false, code: 'state_vector_write_failed', error: failure };
                if (mode === 'code') return { success: false, code: 'metadata_unconfirmed' };
                if (mode === 'confirmed-failure') return { success: false, code: 'state_vector_write_failed', error: new Error('storage failed') };
                return complete();
            },
            repairMissingEventVectorsNow: async () => { calls.push('L2'); return complete(); },
            formatSafeFailure: code => { reportedCodes.push(code); return code; },
        });
        await host.ui.repairVectorsNow({ enabled: true }, 'chat', {});
        assert.deepEqual(calls, ['L1', 'L0', 'L2']);
        assert.deepEqual(host.notices, mode === 'success' ? ['info']
            : ['confirmed-failure', 'mixed'].includes(mode) ? ['warning'] : []);
        assert.deepEqual(reportedCodes, mode === 'mixed' ? ['embedding_network_error']
            : mode === 'confirmed-failure' ? ['state_vector_write_failed'] : []);
        if (mode === 'throw') assert.deepEqual(host.diagnostics, [failure]);
    });
}
