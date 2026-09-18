import fs from 'node:fs/promises';
import { sha256File } from '../gold-eval/lib/run-store.mjs';
import { createRequestRecovery, validateRequestRecovery } from './request-recovery.mjs';
import { loadResponseArchive } from './response-archive.mjs';

// An executable, credential-free replay config. No progress or API results live here.
export function selectPreparedJob(profile, jobId) {
    const { jobs, ...common } = profile;
    if (!Array.isArray(jobs) || !jobs.length) throw new Error('Prepared config needs jobs');
    const selected = jobs.filter(job => job.id === jobId);
    if (selected.length !== 1) throw new Error(`Unknown or duplicate prepared job: ${jobId}`);
    const { id, ...job } = selected[0];
    return { ...common, ...job, preparedJobId: id, goldEval: { ...common.goldEval, ...job.goldEval } };
}

export function assertCredentialFree(value) {
    for (const [key, child] of Object.entries(value || {})) {
        if (key === 'key' && child) throw new Error('Prepared config must not contain API keys');
        if (child && typeof child === 'object') assertCredentialFree(child);
    }
}

// A prepared run executes its reviewed profile, not ad-hoc CLI model/mode overrides.
export function assertPreparedArguments(argv) {
    for (const arg of argv) {
        if (arg === '--preflight' || arg === '--allow-api' || arg === '--resume-prepared'
            || arg === '--apply-transition' || arg === '--check-prepared-resume'
            || /^--(?:config|job|retry-unknown|retry-journal-sha256|retry-source-manifest|retry-source-sha256)=.+$/.test(arg)) continue;
        throw new Error('Prepared runs accept only --config, --job, --preflight, --resume-prepared and --allow-api; edit the profile and repeat preflight');
    }
}

export function verifyPreparedCode(config, code) {
    if (!code.complete || !/^[a-f0-9]{64}$/.test(config.prepared?.productionSourceHash || '')
        || config.prepared.productionSourceHash !== code.productionSourceHash) {
        throw new Error('Prepared production source changed or unavailable; review the profile and repeat preflight');
    }
}

export async function verifyPreparedInputs(config) {
    const expected = config.prepared;
    if (!expected) throw new Error('Missing prepared input fingerprints');
    for (const [file, hash] of [
        [config.samplePath, expected.sampleSha256],
        [config.goldEval.casesPath, expected.casesSha256],
    ]) {
        if (!/^[a-f0-9]{64}$/.test(hash || '') || await sha256File(file) !== hash) {
            throw new Error(`Prepared input changed: ${file}`);
        }
    }
    if (!Number.isSafeInteger(expected.maxRequests) || expected.maxRequests < 1) {
        throw new Error('Prepared run requires a positive maxRequests');
    }
    if (config.requestRecovery) validateRequestRecovery(config.requestRecovery);
}

export async function assertPreparedJobNotStarted(config) {
    try { await fs.stat(config.outputPath); }
    catch (error) {
        if (error?.code === 'ENOENT') return;
        throw error;
    }
    throw new Error('Prepared job already started; preserve its results and inspect recovery gaps, do not restart the batch');
}

function apiPairs(config) {
    return [
        ['summaryApi', config.summaryApi],
        ...['l0Api', 'embeddingApi', 'rerankApi'].map(key => [key, config.vectorConfig?.[key]]),
    ];
}

export function verifyPreparedApiIdentity(config, effective) {
    for (const [name, api] of apiPairs(config)) {
        const actual = apiPairs(effective).find(([key]) => key === name)?.[1];
        if (!api?.model || !actual || actual.model !== api.model
            || String(actual.url).replace(/\/+$/, '') !== String(api.url).replace(/\/+$/, '')) {
            throw new Error(`Prepared API changed during product normalization: ${name}`);
        }
        const url = new URL(api.url);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search) {
            throw new Error(`Prepared API requires a credential-free HTTP(S) URL: ${name}`);
        }
    }
}

// Called only by the explicit live path, never during preflight.
export async function loadPreparedCredentials(config, env) {
    const source = JSON.parse(await fs.readFile(config.credentialsPath, 'utf8'));
    for (const [name, api] of apiPairs(config)) {
        if (!api) throw new Error(`Missing prepared API: ${name}`);
        if (api.keyEnv) {
            if (!env[api.keyEnv]) throw new Error(`Missing credential environment variable: ${api.keyEnv}`);
            api.key = env[api.keyEnv];
            continue;
        }
        const credential = name === 'summaryApi' ? source.summaryApi : source.vectorConfig?.[name];
        if (!credential?.key || credential.model !== api.model
            || new URL(credential.url).origin !== new URL(api.url).origin) {
            throw new Error(`Credential source missing or API identity differs: ${name}`);
        }
        api.key = credential.key;
    }
}

export async function withPreparedRequestBudget(config, operation, { journal = null } = {}) {
    const originalFetch = globalThis.fetch;
    const archive = await loadResponseArchive(config.responseArchive);
    const allowed = new Set(apiPairs(config).map(([, api]) => new URL(api.url).origin));
    const recovery = config.requestRecovery ? createRequestRecovery(config.requestRecovery, {
        onRetry: ({ host, status, attempt, delayMs }) => console.log(
            `[prepared-recovery] ${host} status=${status} failedAttempt=${attempt} waitMs=${delayMs}; retry only this request`,
        ),
    }) : null;
    let requests = 0;
    const reject = (message, kind) => {
        const error = new Error(message);
        error.goldFailure = { stage: 'request-guard', kind, transmitted: false };
        throw error;
    };
    globalThis.fetch = async (input, init) => {
        const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
        if (!allowed.has(url.origin)) reject('Prepared run rejected an unapproved API origin', 'unapproved-origin');
        const saved = archive.match(input, init);
        if (saved) return saved;
        if (journal) return journal.dispatch(input, init, originalFetch);
        if (requests >= config.prepared.maxRequests) reject('Prepared request budget exhausted', 'request-budget');
        requests++;
        return originalFetch(input, { ...init, redirect: 'error' });
    };
    if (recovery) globalThis.fetch.recoverTransientRequest = recovery;
    if (journal) {
        globalThis.fetch.runPreparedScope = (name, callback) => journal.runScope(name, callback);
        globalThis.fetch.preparedReplayPending = () => journal.replaying;
    }
    try { return await operation(); }
    finally { globalThis.fetch = originalFetch; }
}
