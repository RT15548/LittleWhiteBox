'use strict';

const { createHash } = require('node:crypto');

const MAX_DRAW_RUNS_GLOBAL = 50;
const MAX_DRAW_RUNS_PER_OWNER = 8;
const MAX_CONCURRENT_PLANNERS_PER_OWNER = 1;
const MAX_CONCURRENT_PLANNERS_GLOBAL = 4;
const MAX_TOTAL_ENVELOPE_BYTES = 32 * 1024 * 1024;
const RUN_ERROR_RETENTION_MS = 60 * 60 * 1000;
const CHILD_SWEEP_INTERVAL_MS = 30 * 1000;
const MAX_RETAINED_ERROR_CHARS = 2048;
const TERMINAL_STATES = new Set(['failed', 'cancelled', 'child_expired']);

function managerError(message, code, status) {
    const error = new Error(message);
    error.code = code;
    error.status = status;
    return error;
}

function cloneJson(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function storageKey(owner, runId) {
    return `${owner}\0${runId}`;
}

function requestSignature(envelope) {
    return createHash('sha256').update(JSON.stringify(envelope)).digest('hex');
}

function collectSecrets(value, output = new Set()) {
    const addSecret = (secret) => {
        const normalized = typeof secret === 'string' ? secret.trim() : '';
        if (normalized) output.add(normalized);
    };
    const addUrlSecret = (secret) => {
        addSecret(secret);
        try {
            addSecret(decodeURIComponent(secret));
        } catch {
            // Keep the original URL-encoded credential when it is not valid percent encoding.
        }
    };
    if (!value || typeof value !== 'object') return output;
    Object.entries(value).forEach(([key, child]) => {
        if (/api[-_]?key|authorization|password|token|secret|auth$/i.test(key)) {
            addSecret(child);
            return;
        }
        if (typeof child === 'string' && /(?:base)?url|host/i.test(key)) {
            addSecret(child);
            try {
                const url = new URL(child);
                addSecret(url.href);
                addUrlSecret(url.username);
                addUrlSecret(url.password);
                url.searchParams.forEach((entry, name) => {
                    if (/key|token|password|secret|auth/i.test(name)) addSecret(entry);
                });
            } catch {
                // Non-URL host strings remain valid provider input and contain no extractable credentials.
            }
        }
        if (child && typeof child === 'object') collectSecrets(child, output);
    });
    return output;
}

function redactText(value, secrets) {
    let text = String(value || '');
    for (const secret of [...secrets].sort((left, right) => right.length - left.length)) {
        text = text.split(secret).join('[redacted]');
    }
    return text
        .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [redacted]')
        .replace(/\bBasic\s+[A-Za-z0-9+/=]+/gi, 'Basic [redacted]')
        .replace(/([?&](?:key|token|api_key|apikey)=)[^&\s]+/gi, '$1[redacted]');
}

function redactError(error, secrets) {
    const message = redactText(error?.message || error || 'Draw Run failed', secrets);
    const code = redactText(error?.code || 'draw_run_failed', secrets);
    return {
        code: code.slice(0, 128),
        message: message.slice(0, MAX_RETAINED_ERROR_CHARS),
    };
}

function buildDisplayMetadata(artifact = {}) {
    const promptData = artifact.promptData || {};
    return {
        tags: String(artifact.tags || artifact.task?.scene || ''),
        positive: String(promptData.positive || promptData.scene || ''),
        characterPrompts: cloneJson(promptData.characterPrompts || []),
        negativePrompt: String(promptData.negative || promptData.negativePrompt || ''),
    };
}

function createProgressDiagnostic(onUpdate) {
    const record = { stage: 'planning', attempt: 0, maxAttempts: 3 };
    const apply = (patch = {}) => {
        if (typeof patch.stage === 'string') record.stage = patch.stage;
        if (Number.isInteger(patch.attemptCount)) record.attempt = patch.attemptCount;
        if (Number.isInteger(patch.progress?.total)) record.maxAttempts = patch.progress.total;
        onUpdate({ ...record });
    };
    return Object.freeze({
        update: apply,
        applyProviderConfig() {},
        succeed: apply,
        fail(_error, patch = {}) { apply(patch); },
        snapshot() { return { ...record }; },
    });
}

class DrawRunManager {
    constructor({
        runtime,
        agentCore,
        envelopeValidator,
        imageJobService,
        createHostClient,
        now = Date.now,
        maxRuns = MAX_DRAW_RUNS_GLOBAL,
        maxRunsPerOwner = MAX_DRAW_RUNS_PER_OWNER,
        maxConcurrentPlanners = MAX_CONCURRENT_PLANNERS_GLOBAL,
        maxConcurrentPlannersPerOwner = MAX_CONCURRENT_PLANNERS_PER_OWNER,
        maxTotalEnvelopeBytes = MAX_TOTAL_ENVELOPE_BYTES,
        errorRetentionMs = RUN_ERROR_RETENTION_MS,
        childSweepIntervalMs = CHILD_SWEEP_INTERVAL_MS,
    } = {}) {
        if (!runtime || typeof runtime.executePreparedScenePlanner !== 'function'
            || typeof runtime.compileDrawRunImages !== 'function') {
            throw new TypeError('Draw Run manager requires the Draw Run runtime');
        }
        if (!agentCore || typeof agentCore.createAgentAdapter !== 'function') {
            throw new TypeError('Draw Run manager requires Agent Core');
        }
        if (typeof envelopeValidator !== 'function') {
            throw new TypeError('Draw Run manager requires an envelope validator');
        }
        if (!imageJobService || typeof imageJobService.create !== 'function'
            || typeof imageJobService.get !== 'function' || typeof imageJobService.cancel !== 'function') {
            throw new TypeError('Draw Run manager requires the Image Job service');
        }
        if (typeof createHostClient !== 'function') {
            throw new TypeError('Draw Run manager requires a per-run Host Client factory');
        }
        this.runtime = runtime;
        this.agentCore = agentCore;
        this.envelopeValidator = envelopeValidator;
        this.imageJobService = imageJobService;
        this.createHostClient = createHostClient;
        this.now = now;
        this.maxRuns = maxRuns;
        this.maxRunsPerOwner = maxRunsPerOwner;
        this.maxConcurrentPlanners = maxConcurrentPlanners;
        this.maxConcurrentPlannersPerOwner = maxConcurrentPlannersPerOwner;
        this.maxTotalEnvelopeBytes = maxTotalEnvelopeBytes;
        this.errorRetentionMs = errorRetentionMs;
        this.runs = new Map();
        this.queue = [];
        this.activeOwners = new Map();
        this.activePlanners = 0;
        this.storedEnvelopeBytes = 0;
        this.closed = false;
        this.childSweepTimer = Number(childSweepIntervalMs) > 0
            ? setInterval(() => this.#sweepChildren(), Number(childSweepIntervalMs))
            : null;
        this.childSweepTimer?.unref?.();
    }

    create(owner, rawEnvelope, requestContext) {
        if (this.closed) throw managerError('Draw Run manager is closed', 'draw_run_closed', 503);
        this.#sweepChildren();
        const { envelope, inputBytes } = this.envelopeValidator(rawEnvelope);
        const key = storageKey(owner, envelope.runId);
        const signature = requestSignature(envelope);
        const existing = this.runs.get(key);
        if (existing) {
            if (existing.requestSignature !== signature) {
                throw managerError(
                    'runId was already used for a different Draw Run',
                    'draw_run_id_conflict',
                    409,
                );
            }
            this.#refreshChild(existing);
            return this.#snapshot(existing);
        }
        if (this.runs.size >= this.maxRuns || this.#ownerRuns(owner).length >= this.maxRunsPerOwner) {
            throw managerError('Too many retained Draw Runs', 'draw_run_limit', 429);
        }
        if (this.storedEnvelopeBytes + inputBytes > this.maxTotalEnvelopeBytes) {
            throw managerError('Draw Run input storage limit reached', 'draw_run_input_limit', 429);
        }

        let hostSession = null;
        if (String(envelope.agent.channel).startsWith('sillytavern-')) {
            try {
                hostSession = this.createHostClient(requestContext);
            } catch (error) {
                throw managerError(
                    String(error?.message || 'Unable to create the Draw Run Host Client'),
                    String(error?.code || 'draw_run_host_client_failed'),
                    Number.isInteger(error?.status) ? error.status : 503,
                );
            }
        }

        const timestamp = this.now();
        const run = {
            id: envelope.runId,
            key,
            owner,
            requestSignature: signature,
            state: 'queued',
            sourceHash: envelope.sourceHash,
            provider: envelope.imageProvider,
            progress: { stage: 'queued', attempt: 0, maxAttempts: 3 },
            plannerInput: {
                version: 1,
                planner: envelope.planner,
                agent: envelope.agent,
            },
            generationRecipe: envelope.generationRecipe,
            inputBytes,
            secrets: collectSecrets(envelope),
            hostSession,
            abortController: null,
            childJobId: null,
            handoffManifest: null,
            cancelRequestedAt: null,
            error: null,
            createdAt: timestamp,
            updatedAt: timestamp,
            finishedAt: null,
            expiryTimer: null,
        };
        this.runs.set(key, run);
        this.storedEnvelopeBytes += inputBytes;
        this.queue.push(key);
        queueMicrotask(() => this.#pump());
        return this.#snapshot(run);
    }

    list(owner) {
        this.#sweepChildren();
        return this.#ownerRuns(owner)
            .sort((left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id))
            .map(run => this.#snapshot(run));
    }

    get(owner, runId) {
        const run = this.runs.get(storageKey(owner, runId)) || null;
        if (run) this.#refreshChild(run);
        return run ? this.#snapshot(run) : null;
    }

    cancel(owner, runId) {
        const run = this.runs.get(storageKey(owner, runId)) || null;
        if (!run) return null;
        if (run.state === 'dispatched') {
            if (run.cancelRequestedAt === null) run.cancelRequestedAt = this.now();
            run.updatedAt = this.now();
            this.imageJobService.cancel(owner, run.childJobId);
            this.#refreshChild(run);
            return this.#snapshot(run);
        }
        if (TERMINAL_STATES.has(run.state)) return this.#snapshot(run);
        if (run.cancelRequestedAt === null) run.cancelRequestedAt = this.now();
        run.state = 'cancelling';
        run.updatedAt = this.now();
        run.abortController?.abort();
        if (!run.abortController) {
            this.queue = this.queue.filter(key => key !== run.key);
            this.#finishTerminal(run, 'cancelled');
        }
        return this.#snapshot(run);
    }

    acknowledge(owner, runId) {
        const run = this.runs.get(storageKey(owner, runId)) || null;
        if (!run) return null;
        if (!TERMINAL_STATES.has(run.state) && run.state !== 'dispatched') {
            return { ok: false, state: run.state };
        }
        this.#deleteRun(run);
        return { ok: true };
    }

    close() {
        if (this.closed) return;
        this.closed = true;
        if (this.childSweepTimer) clearInterval(this.childSweepTimer);
        this.childSweepTimer = null;
        this.queue.length = 0;
        for (const run of this.runs.values()) {
            run.abortController?.abort();
            this.#releaseSensitiveInput(run);
            if (run.expiryTimer) clearTimeout(run.expiryTimer);
        }
        this.runs.clear();
        this.activeOwners.clear();
        this.activePlanners = 0;
        this.storedEnvelopeBytes = 0;
    }

    #ownerRuns(owner) {
        return [...this.runs.values()].filter(run => run.owner === owner);
    }

    #pump() {
        if (this.closed) return;
        while (this.activePlanners < this.maxConcurrentPlanners) {
            const index = this.queue.findIndex((key) => {
                const run = this.runs.get(key);
                return run?.state === 'queued'
                    && (this.activeOwners.get(run.owner) || 0) < this.maxConcurrentPlannersPerOwner;
            });
            if (index < 0) return;
            const [key] = this.queue.splice(index, 1);
            const run = this.runs.get(key);
            if (!run) continue;
            this.activePlanners += 1;
            this.activeOwners.set(run.owner, (this.activeOwners.get(run.owner) || 0) + 1);
            void this.#execute(run).finally(() => {
                this.activePlanners = Math.max(0, this.activePlanners - 1);
                const ownerActive = Math.max(0, (this.activeOwners.get(run.owner) || 1) - 1);
                if (ownerActive) this.activeOwners.set(run.owner, ownerActive);
                else this.activeOwners.delete(run.owner);
                queueMicrotask(() => this.#pump());
            });
        }
    }

    async #execute(run) {
        const controller = new AbortController();
        run.abortController = controller;
        run.state = 'planning';
        run.progress = { stage: 'planning', attempt: 0, maxAttempts: 3 };
        run.updatedAt = this.now();
        const diagnostic = createProgressDiagnostic((progress) => {
            if (!this.runs.has(run.key)) return;
            run.progress = progress;
            run.updatedAt = this.now();
        });

        try {
            const scenePoints = run.plannerInput.planner.validationContext.sceneSource.points;
            const scenePlan = await this.runtime.executePreparedScenePlanner(run.plannerInput, {
                timeout: run.plannerInput.agent.providerConfig.timeoutMs,
                signal: controller.signal,
                diagnostic,
                agentCore: this.agentCore,
                ...(run.hostSession ? { hostClient: run.hostSession.client } : {}),
            });
            this.#releasePlannerInput(run);
            if (this.closed || !this.runs.has(run.key)) return;
            if (run.cancelRequestedAt !== null) {
                this.#finishTerminal(run, 'cancelled');
                return;
            }

            run.state = 'compiling';
            run.progress = { ...run.progress, stage: 'compiling' };
            run.updatedAt = this.now();
            const compiled = this.runtime.compileDrawRunImages(
                run.provider,
                scenePlan,
                run.generationRecipe,
            );
            if (!Array.isArray(compiled.items) || !Array.isArray(compiled.artifacts)
                || compiled.items.length === 0 || compiled.items.length !== compiled.artifacts.length) {
                throw new Error('Draw Run compiler returned misaligned image items and artifacts');
            }
            if (run.cancelRequestedAt !== null) {
                this.#finishTerminal(run, 'cancelled');
                return;
            }

            const childJobId = this.runtime.deriveDrawRunChildJobId(run.id);
            const manifestItems = compiled.artifacts.map((artifact, index) => {
                const ids = this.runtime.deriveDrawRunItemIds(run.id, index);
                const insertAfter = Number(artifact.task?.placement?.insertAfter);
                const point = Array.isArray(scenePoints) ? scenePoints[insertAfter - 1] : null;
                if (!point || !Number.isInteger(point.offset)) {
                    throw new Error(`Draw Run compiler artifact ${index + 1} has an invalid placement`);
                }
                return {
                    index,
                    ...ids,
                    insertOffset: point.offset,
                    displayMetadata: buildDisplayMetadata(artifact),
                };
            });
            this.imageJobService.create(run.owner, {
                provider: compiled.provider,
                requestId: childJobId,
                context: compiled.context,
                delay: compiled.delay,
                items: compiled.items,
            });
            run.childJobId = childJobId;
            run.handoffManifest = {
                childJobId,
                provider: run.provider,
                sourceHash: run.sourceHash,
                placementContract: 1,
                items: manifestItems,
            };
            run.state = 'dispatched';
            run.progress = { ...run.progress, stage: 'dispatched' };
            run.updatedAt = this.now();
            this.#releaseSensitiveInput(run);
        } catch (error) {
            if (!this.runs.has(run.key)) return;
            if (run.cancelRequestedAt !== null && !run.childJobId) {
                this.#finishTerminal(run, 'cancelled');
            } else {
                run.error = redactError(error, run.secrets);
                this.#finishTerminal(run, 'failed');
            }
        } finally {
            run.abortController = null;
        }
    }

    #releasePlannerInput(run) {
        run.hostSession?.dispose?.();
        run.hostSession = null;
        if (run.plannerInput) {
            run.plannerInput = null;
        }
    }

    #releaseSensitiveInput(run) {
        this.#releasePlannerInput(run);
        run.generationRecipe = null;
        run.secrets.clear();
        if (run.inputBytes) {
            this.storedEnvelopeBytes = Math.max(0, this.storedEnvelopeBytes - run.inputBytes);
            run.inputBytes = 0;
        }
    }

    #finishTerminal(run, state) {
        run.state = state;
        run.progress = { ...run.progress, stage: state };
        run.updatedAt = this.now();
        run.finishedAt ??= run.updatedAt;
        this.#releaseSensitiveInput(run);
        if (run.expiryTimer || this.errorRetentionMs < 0) return;
        run.expiryTimer = setTimeout(() => this.#deleteRun(run), this.errorRetentionMs);
        run.expiryTimer.unref?.();
    }

    #refreshChild(run) {
        if (run.state !== 'dispatched' || !run.childJobId) return;
        if (!this.imageJobService.get(run.owner, run.childJobId)) {
            run.error = { code: 'child_job_expired', message: '后台图片任务已失效' };
            this.#finishTerminal(run, 'child_expired');
        }
    }

    #sweepChildren() {
        for (const run of this.runs.values()) this.#refreshChild(run);
    }

    #deleteRun(run) {
        if (!this.runs.has(run.key)) return;
        if (run.expiryTimer) clearTimeout(run.expiryTimer);
        this.queue = this.queue.filter(key => key !== run.key);
        this.#releaseSensitiveInput(run);
        this.runs.delete(run.key);
    }

    #snapshot(run) {
        return {
            id: run.id,
            state: run.state,
            sourceHash: run.sourceHash,
            provider: run.provider,
            progress: { ...run.progress },
            childJobId: run.childJobId,
            handoffManifest: cloneJson(run.handoffManifest),
            createdAt: run.createdAt,
            updatedAt: run.updatedAt,
            ...(run.cancelRequestedAt !== null ? { cancelRequestedAt: run.cancelRequestedAt } : {}),
            ...(run.error ? { error: { ...run.error } } : {}),
        };
    }
}

function createDrawRunManager(options) {
    return new DrawRunManager(options);
}

module.exports = {
    CHILD_SWEEP_INTERVAL_MS,
    MAX_CONCURRENT_PLANNERS_GLOBAL,
    MAX_CONCURRENT_PLANNERS_PER_OWNER,
    MAX_DRAW_RUNS_GLOBAL,
    MAX_DRAW_RUNS_PER_OWNER,
    MAX_TOTAL_ENVELOPE_BYTES,
    RUN_ERROR_RETENTION_MS,
    createDrawRunManager,
};
