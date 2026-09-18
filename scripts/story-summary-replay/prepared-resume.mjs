// Explicit operator approval boundary. No credentials, requests or receipt edits.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { preparedJournalBinding } from './request-journal.mjs';
import { assertCredentialFree, selectPreparedJob } from './prepared-config.mjs';
import { validateSummaryRequestOverride } from './summary-request.mjs';

export async function prepareReviewedContinuation(config, code) {
    const approval = config.continuation;
    if (!approval || !/^[a-f0-9]{64}$/.test(approval.journalSha256 || '')) throw new Error('Missing reviewed continuation');
    const readBound = async ref => {
        const bytes = await fs.readFile(ref.path);
        if (createHash('sha256').update(bytes).digest('hex') !== ref.sha256) throw new Error('Continuation source hash changed');
        return JSON.parse(bytes);
    };
    const source = await readBound(approval.sourceManifest);
    const profile = await readBound(approval.sourceProfile);
    assertCredentialFree(profile);
    const oldConfig = selectPreparedJob(profile, config.preparedJobId);
    const oldCode = source.code || {};
    for (const key of ['packageLockHash', 'nodeVersion', 'platform', 'arch']) {
        if (!oldCode[key] || oldCode[key] !== code[key]) throw new Error(`Continuation changed ${key}`);
    }
    const previousBinding = preparedJournalBinding(oldConfig, oldCode);
    const sourceJournal = source.capture?.requestJournal;
    const current = Object.fromEntries(Object.entries(config).filter(([key]) => !key.startsWith('__')));
    delete current.continuation;
    delete current.evaluationSummaryRequest;
    const previous = { ...oldConfig };
    delete previous.continuation;
    delete previous.evaluationSummaryRequest;
    current.prepared = { ...current.prepared, productionSourceHash: oldConfig.prepared.productionSourceHash };
    if (!isDeepStrictEqual(current, previous) || source.status !== 'invalid'
        || source.mode !== 'story-summary-replay-natural-capture' || source.invalidReason?.stage !== 'summary'
        || sourceJournal?.binding !== previousBinding
        || path.resolve(sourceJournal.journalPath) !== path.resolve(config.outputPath, 'request-journal.jsonl')
        || sourceJournal.maxRequests !== config.prepared.maxRequests
        || source.data?.sampleHash !== config.prepared.sampleSha256 || source.data?.casesHash !== config.prepared.casesSha256
        || oldCode.productionSourceHash !== oldConfig.prepared.productionSourceHash
        || code.productionSourceHash !== config.prepared.productionSourceHash) {
        throw new Error('Continuation source/config/input binding changed');
    }
    validateSummaryRequestOverride(config.evaluationSummaryRequest);
    // Recovery scope is independent of the generation setting's activation floor.
    // Existing request settings stay byte-identical; only a new override may start
    // immediately after the failed Summary, preserving its already-paid request.
    if (!Number.isSafeInteger(approval.summaryFromFloor) || approval.summaryFromFloor < 1) {
        throw new Error('Continuation requires an explicit recovery Summary boundary');
    }
    if (!isDeepStrictEqual(config.evaluationSummaryRequest, oldConfig.evaluationSummaryRequest)
        && (oldConfig.evaluationSummaryRequest || !config.evaluationSummaryRequest
            || config.evaluationSummaryRequest.fromFloor !== approval.summaryFromFloor)) {
        throw new Error('Continuation cannot change saved Summary request settings');
    }
    return { previousBinding, journalSha256: approval.journalSha256,
        sourceManifestSha256: approval.sourceManifest.sha256, sourceProfileSha256: approval.sourceProfile.sha256,
        fromProductionHash: oldCode.productionSourceHash, toProductionHash: code.productionSourceHash,
        summaryFromFloor: approval.summaryFromFloor };
}

export async function prepareUnknownRetry(config, code, approval) {
    const { requestId, journalSha256, sourceManifestPath, sourceManifestSha256 } = approval;
    if (!Number.isSafeInteger(requestId) || requestId < 1
        || !/^[a-f0-9]{64}$/.test(journalSha256 || '')
        || !/^[a-f0-9]{64}$/.test(sourceManifestSha256 || '') || !sourceManifestPath) {
        throw new Error('Unknown retry requires exact request id, journal hash and source manifest/hash');
    }
    const bytes = await fs.readFile(sourceManifestPath);
    if (createHash('sha256').update(bytes).digest('hex') !== sourceManifestSha256) {
        throw new Error('Unknown retry source manifest hash changed');
    }
    const source = JSON.parse(bytes);
    const oldCode = source.code || {};
    // Tooling changes are explicitly recorded by the journal's binding transition.
    // The product, dependency/runtime, raw config and data cannot change here.
    for (const key of ['productionSourceHash', 'packageLockHash', 'nodeVersion', 'platform', 'arch']) {
        if (!oldCode[key] || oldCode[key] !== code[key]) throw new Error(`Unknown retry changed ${key}`);
    }
    const previousBinding = preparedJournalBinding(config, oldCode);
    const sourceJournal = source.capture?.requestJournal;
    if (source.status !== 'invalid' || source.mode !== 'story-summary-replay-natural-capture'
        || sourceJournal?.binding !== previousBinding
        || path.resolve(sourceJournal.journalPath) !== path.resolve(config.outputPath, 'request-journal.jsonl')
        || sourceJournal.maxRequests !== config.prepared.maxRequests
        || source.data?.sampleHash !== config.prepared.sampleSha256
        || source.data?.casesHash !== config.prepared.casesSha256) {
        throw new Error('Unknown retry source/config/input binding changed');
    }
    return { id: requestId, journalSha256, previousBinding, sourceManifestSha256 };
}
