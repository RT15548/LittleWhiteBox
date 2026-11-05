'use strict';
const cloneJson = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
function buildDisplayMetadata(artifact = {}) {
    const promptData = artifact.promptData || {};
    const metadata = {
        tags: String(artifact.tags || artifact.task?.scene || ''),
        positive: String(promptData.positive || promptData.scene || ''),
        characterPrompts: cloneJson(promptData.characterPrompts || []),
        continuityChars: cloneJson(artifact.continuityChars ?? null),
        postPrompt: String(artifact.task?.post_prompt || ''),
        orientation: artifact.task?.orientation ?? null,
        vibeNames: String(artifact.vibeNames || ''),
        negativePrompt: String(promptData.negative || promptData.negativePrompt || ''),
    };
    if (artifact.providerMetadata && typeof artifact.providerMetadata === 'object') {
        metadata.providerMetadata = cloneJson(artifact.providerMetadata);
    }
    return metadata;
}

function createProgressDiagnostic(runId, onUpdate) {
    const record = {
        stage: 'planning',
        attempt: 0,
        maxAttempts: 3,
        validationFailures: [],
        attempts: [],
    };
    const apply = (patch = {}) => {
        if (typeof patch.stage === 'string') record.stage = patch.stage;
        if (Number.isInteger(patch.attemptCount)) record.attempt = patch.attemptCount;
        const retrying = patch.progress?.phase === 'retry';
        // 重试等待阶段的 progress.total 是“最多重试几次”，不是 Agent 的尝试上限，不能写进 maxAttempts。
        if (!retrying && Number.isInteger(patch.progress?.total)) record.maxAttempts = patch.progress.total;
        if (retrying && Number.isInteger(patch.progress.current) && Number.isInteger(patch.progress.total)) {
            record.retry = { current: patch.progress.current, total: patch.progress.total };
        } else if (typeof patch.stage === 'string' && patch.stage !== 'retry') {
            delete record.retry; // 重试结束，回到普通请求阶段
        }
        if (Array.isArray(patch.validationFailures)) {
            record.validationFailures = cloneJson(patch.validationFailures) || [];
        }
        if (Array.isArray(patch.attempts)) record.attempts = cloneJson(patch.attempts) || [];
        if (patch.argumentRepair) record.argumentRepair = cloneJson(patch.argumentRepair);
        onUpdate(cloneJson(record));
    };
    return Object.freeze({
        id: runId,
        update: apply,
        applyProviderConfig(config) {
            record.presetName = String(config.currentPresetName || '');
            record.provider = String(config.provider || '');
            record.model = String(config.model || '');
            apply();
        },
        succeed: apply,
        fail(_error, patch = {}) { apply(patch); },
        snapshot() { return cloneJson(record); },
    });
}
module.exports = { buildDisplayMetadata, createProgressDiagnostic };
