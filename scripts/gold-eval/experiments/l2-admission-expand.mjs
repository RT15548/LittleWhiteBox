/* global process */
// Fresh control packing for an expanded, frozen-input sample. No semantic labels.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { parseReplaySample } from '../../story-summary-replay/sample.mjs';
import { loadStudy, saveStudy, auditStudy, writeStudyStatus } from '../study/store.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = async filename => JSON.parse(await fs.readFile(filename, 'utf8'));
const write = (filename, value) => fs.writeFile(filename, JSON.stringify(value, null, 2) + '\n');
const ref = async filename => ({ path: path.resolve(filename), sha256: sha(await fs.readFile(filename)) });

export async function prepareExpansion(output) {
    const root = path.resolve(output, '../..');
    const studyPath = path.join(root, 'STUDY.json');
    const loaded = await loadStudy(studyPath);
    assert.equal((await auditStudy(loaded.study)).ok, true);
    const selection = await read(path.join(output, 'selection.json'));
    const prior = await read(selection.previousPlan);
    const manifest = await read(prior.source.manifest.path);
    assert.equal(sha(await fs.readFile(prior.source.manifest.path)), prior.source.manifest.sha256);
    const sampleBytes = await fs.readFile(prior.source.sample.path);
    assert.equal(sha(sampleBytes), prior.source.sample.sha256);
    const sample = parseReplaySample(sampleBytes.toString('utf8'));
    assert.equal(sha(await fs.readFile(prior.code.bundle.path)), prior.code.bundle.sha256);
    assert.equal(new Set(selection.floors).size, selection.floors.length);
    assert.ok(selection.floors.every(floor => !prior.targets.some(target => target.floor === floor)));
    const runRoot = path.dirname(prior.source.manifest.path);
    const checkpointFiles = await fs.readdir(path.join(runRoot, 'checkpoints'));
    const targets = [];
    for (const floor of selection.floors) {
        const caseId = prior.targets[0].caseId.replace(/\d+$/, String(floor));
        const files = checkpointFiles.filter(name => name.endsWith(`-${caseId}.json`));
        assert.equal(files.length, 1);
        const checkpoint = await ref(path.join(runRoot, 'checkpoints', files[0]));
        const boundary = manifest.boundarySnapshots.find(item => item.caseId === caseId);
        assert.ok(boundary);
        assert.equal(sha(await fs.readFile(boundary.path)), boundary.sha256);
        const cp = await read(checkpoint.path);
        assert.equal(cp.caseId, caseId);
        assert.ok(sample.messages[floor - 1].is_user);
        assert.equal(cp.failure, null);
        targets.push({ floor, caseId, checkpoint, boundary });
    }
    await fs.mkdir(path.join(output, 'controls'), { recursive: true });
    await fs.copyFile(studyPath, path.join(output, 'previous-study.json'), fs.constants.COPYFILE_EXCL);
    // eslint-disable-next-line no-unsanitized/method -- Exact prior frozen product bundle.
    const replay = await import(pathToFileURL(prior.code.bundle.path));
    replay.ensureNodeReplayGlobals();
    const settings = {};
    replay.__setExtensionSettings(settings);
    const modules = await replay.loadReplayModules(settings);
    replay.applyReplayConfig({ panelConfig: manifest.config.effectivePanel,
        vectorConfig: { rerankApi: { key: 'offline-control-only' } } }, modules);
    const nativeFetch = globalThis.fetch;
    globalThis.fetch = () => { throw new Error('No network while preparing expansion controls'); };
    try {
        for (const target of targets) {
            const checkpoint = await read(target.checkpoint.path);
            const snapshot = await read(target.boundary.path);
            const input = checkpoint.promptInput.production;
            const recall = replay.deserializePromptRecallInput(input.recallResult);
            const chat = sample.messages.slice(0, target.floor);
            replay.__setReplayContext({ chat, chatId: snapshot.vector.meta.chatId, name1: 'unused', name2: 'unused' });
            await replay.restoreReplaySnapshot(modules, snapshot.vector.meta.chatId, snapshot);
            const built = await modules.buildVectorPromptForReplay(modules.getSummaryStore(), recall,
                recall.focusCharacters, structuredClone(input.meta), structuredClone(recall.metrics));
            const promptText = [input.wrapperHead, built.promptText, input.wrapperTail].filter(Boolean).join('\n');
            const filename = path.join(output, 'controls', `${target.floor}.json`);
            await write(filename, { floor: target.floor, provenance: 'fresh-current-packing-not-historical-quality',
                arms: { current: { promptText, promptHash: sha(promptText), evidenceTrace: built.evidenceTrace } } });
            target.previousPair = await ref(filename); // Existing screen's verified control-input contract.
            target.controlPromptHash = sha(promptText);
            console.log(JSON.stringify({ controlPrepared: target.floor }));
        }
    } finally { globalThis.fetch = nativeFetch; }
    const sourcePlan = { scoringDecision: selection.scoringDecision, source: prior.source, targets,
        sampling: selection.sampling, frozenRule: prior.rule, priorExperiment: await ref(selection.previousPlan) };
    const sourcePlanPath = path.join(output, 'source-plan.json');
    await write(sourcePlanPath, sourcePlan);
    return registerExpansionControls(output);
}

export async function registerExpansionControls(output) {
    const root = path.resolve(output, '../..');
    const studyPath = path.join(root, 'STUDY.json');
    const loaded = await loadStudy(studyPath);
    const selection = await read(path.join(output, 'selection.json'));
    const prior = await read(selection.previousPlan);
    const sourcePlanPath = path.join(output, 'source-plan.json');
    const sourcePlan = await read(sourcePlanPath);
    const targets = sourcePlan.targets;
    assert.deepEqual(targets.map(target => target.floor), selection.floors);
    assert.deepEqual(sourcePlan.frozenRule, prior.rule);
    assert.equal(sha(await fs.readFile(prior.code.bundle.path)), prior.code.bundle.sha256);
    for (const target of targets) {
        for (const artifact of [target.checkpoint, target.boundary, target.previousPair]) {
            assert.equal(sha(await fs.readFile(artifact.path)), artifact.sha256);
        }
        const control = (await read(target.previousPair.path)).arms.current;
        assert.equal(sha(control.promptText), control.promptHash);
        assert.equal(control.promptHash, target.controlPromptHash);
    }
    loaded.study.inputs.dev.cases = await ref(sourcePlanPath);
    loaded.study.status = 'expanded-fusion-controls-ready-screen-next';
    loaded.study.policy.externalRequests = 0;
    loaded.study.policy.apiAuthorizationDecision = selection.authorizationDecision;
    loaded.study.devMatrix.sources = [{ id: 'expanded-frozen-product', role: 'unchanged-product-code', status: 'frozen',
        artifacts: [{ name: 'bundle', ...prior.code.bundle }, ...prior.code.sources.map((item, index) => ({ name: String(index), ...item }))] },
    { id: 'expanded-inputs', role: 'new-targets-and-fresh-control-packing', status: 'frozen',
        artifacts: await Promise.all([path.join(output, 'selection.json'), sourcePlanPath, prior.source.manifest.path,
            prior.source.needs.path, selection.previousPlan, ...targets.flatMap(t => [t.checkpoint.path, t.boundary.path, t.previousPair.path])]
            .map(async (filename, index) => ({ name: String(index), ...await ref(filename) }))) }];
    loaded.study.active = { hypothesisId: null, step: 'expanded-frozen-admission-screen',
        nextAction: 'Screen the 24 new positions using the unchanged D-291 rule, freeze exact missing rerank identities, execute within D-293, and review both arms fully under D-290.' };
    loaded.study.updatedAt = new Date().toISOString();
    const audit = await auditStudy(loaded.study);
    assert.equal(audit.ok, true, JSON.stringify(audit.checks.filter(item => !item.ok)));
    const saved = await saveStudy(studyPath, loaded.study, { expectedHash: loaded.hash });
    await writeStudyStatus(path.join(root, 'STATUS.md'), saved.study, audit, { studyHash: saved.hash });
    return { positions: targets.length, auditChecks: audit.checks.length };
}

export async function freezeExpansionRequests(output) {
    const root = path.resolve(output, '../..');
    const studyPath = path.join(root, 'STUDY.json');
    const loaded = await loadStudy(studyPath);
    assert.equal((await auditStudy(loaded.study)).ok, true);
    const selection = await read(path.join(output, 'selection.json'));
    const prior = await read(selection.previousPlan);
    const plan = await read(path.join(output, 'plan.json'));
    const screen = await read(path.join(output, 'screen.json'));
    const requests = await read(path.join(output, 'pending-requests.json'));
    assert.deepEqual(plan.rule, prior.rule);
    assert.equal(plan.code.bundle.sha256, prior.code.bundle.sha256);
    assert.deepEqual(plan.targets.map(target => target.floor), selection.floors);
    assert.equal(screen.positions.length, selection.floors.length);
    assert.ok(requests.length <= selection.floors.length * 3);
    const proposal = { authorizationDecision: selection.authorizationDecision, status: 'authorized-not-dispatched',
        provider: 'SiliconFlow', host: 'api.siliconflow.cn', model: 'BAAI/bge-reranker-v2-m3',
        inputClasses: ['unchanged captured query', 'existing adult dev L2 summaries'],
        initialNewRequests: requests.length, hardMaximumAttempts: requests.length * 3, attemptsPerIdentity: 3,
        otherModelRequests: 0, downstreamScope: plan.scope,
        plan: await ref(path.join(output, 'plan.json')), requests: await ref(path.join(output, 'pending-requests.json')) };
    await write(path.join(output, 'live-proposal.json'), proposal);
    await fs.writeFile(path.join(output, 'REPORT.md'), `# 扩展抽样离线入口检查\n\n${selection.floors.length}个新位置入口已核对，待补${requests.length}个精排收据。尚未逐臂判定质量，不发布成绩。\n`);
    loaded.study.inputs.dev.cases = proposal.plan;
    loaded.study.devMatrix.sources.push({ id: 'expanded-screen-and-execution', role: 'bounded-expanded-sample', status: 'frozen',
        artifacts: await Promise.all([path.join(output, 'plan.json'), path.join(output, 'screen.json'),
            path.join(output, 'source-clarifications.json'),
            path.join(output, 'pending-requests.json'), path.join(output, 'live-proposal.json'),
            ...plan.targets.map(target => path.join(output, 'positions', `${target.floor}.json`)),
            ...['l2-admission-expand.mjs', 'l2-admission-fusion.mjs', 'l2-admission-screen.mjs', 'l2-admission-live.mjs', 'l2-admission-report.mjs']
                .map(name => path.resolve('scripts/gold-eval/experiments', name)),
            path.resolve('scripts/story-summary-replay/request-journal.mjs'),
            path.resolve('scripts/story-summary-replay/request-recovery.mjs')]
            .map(async (filename, index) => ({ name: String(index), ...await ref(filename) }))) });
    loaded.study.status = 'expanded-fusion-screen-complete-live-authorized';
    loaded.study.updatedAt = new Date().toISOString();
    loaded.study.active = { hypothesisId: null, step: 'expanded-rerank-then-review',
        nextAction: 'Execute only frozen expanded pending requests, assemble both inputs, complete all 48 semantic observations, then publish separate expanded and cumulative grades. No tuning.' };
    const audit = await auditStudy(loaded.study);
    assert.equal(audit.ok, true, JSON.stringify(audit.checks.filter(item => !item.ok)));
    const saved = await saveStudy(studyPath, loaded.study, { expectedHash: loaded.hash });
    await writeStudyStatus(path.join(root, 'STATUS.md'), saved.study, audit, { studyHash: saved.hash });
    return { positions: plan.targets.length, newRequests: requests.length, maximumAttempts: proposal.hardMaximumAttempts, auditChecks: audit.checks.length };
}

export async function expansionReviewMaterial(output) {
    const plan = await read(path.join(output, 'plan.json'));
    const oldReviewPath = path.resolve(path.dirname(plan.source.needs.path), 'observations.jsonl');
    const oldLines = (await fs.readFile(oldReviewPath, 'utf8')).trim().split(/\r?\n/);
    const normalize = text => text.replace(/^[⭐]?\d+\./, '*').replace(/关联记录\d+/g, '关联记录*').replace(/第\d+条/g, '第*条');
    const sections = text => Object.fromEntries(text.split(/(?=^\[[^\n]+\])/m).map(s => [s.split('\n')[0], s]));
    const diff = (a, b) => {
        const left = a.split('\n'), right = b.split('\n');
        const x = new Set(left.map(normalize)), y = new Set(right.map(normalize));
        return { added: right.filter(t => !x.has(normalize(t))), removed: left.filter(t => !y.has(normalize(t))) };
    };
    const rows = [];
    for (const target of plan.targets) {
        const cp = await read(target.checkpoint.path);
        const pair = await read(path.join(output, 'assembly', `${target.floor}.json`));
        const index = oldLines.findIndex(line => {
            const row = JSON.parse(line);
            return row.floor === target.floor && row.arm === 'baseline';
        });
        assert.ok(index >= 0);
        const old = JSON.parse(oldLines[index]);
        assert.equal(old.promptHash, cp.prompt.promptHash);
        const a = sections(pair.control.promptText), b = sections(pair.fusion.promptText);
        const excerpts = (old.references || []).filter(row => row.excerpt).map(row => row.excerpt);
        rows.push({ floor: target.floor, controlHash: pair.control.promptHash, fusionHash: pair.fusion.promptHash,
            originalObservation: { path: oldReviewPath, line: index + 1, sha256: sha(oldLines[index]) },
            sourceHash: old.sourceHash,
            priorEvidence: Object.fromEntries(Object.entries(old).filter(([key]) => key.endsWith('Evidence') || key === 'issueIds')),
            priorExcerptPresence: excerpts.map(text => ({ text, control: pair.control.promptText.includes(text), fusion: pair.fusion.promptText.includes(text) })),
            sectionEquality: Object.keys(a).map(key => ({ key, equal: a[key] === b[key] })),
            oldToControl: diff(cp.prompt.promptText, pair.control.promptText), controlToFusion: diff(pair.control.promptText, pair.fusion.promptText) });
    }
    await write(path.join(output, 'review-material.json'), rows);
    return { positions: rows.length, semanticFieldsPrefilled: false };
}

// Only bind and validate judgments already written by the reviewer; never infer them.
export async function bindExpansionControlReview(output) {
    const root = path.resolve(output, '../..');
    const plan = await read(path.join(output, 'plan.json'));
    const filename = path.join(output, 'control-observations.jsonl');
    const lines = (await fs.readFile(filename, 'utf8')).trim().split(/\r?\n/);
    const observations = lines.map(JSON.parse);
    assert.deepEqual(observations.map(row => row.floor), plan.targets.map(row => row.floor));
    const sourceLines = (await fs.readFile(plan.source.needs.path, 'utf8')).trim().split(/\r?\n/);
    const scorePath = path.join(root, 'experiments/current-real1300-full/review-v2/scoring.mjs');
    // eslint-disable-next-line no-unsanitized/method -- The existing, unchanged scoring contract.
    const { scoreReview } = await import(pathToFileURL(scorePath));
    const control = [];
    for (const [index, observation] of observations.entries()) {
        const pair = await read(path.join(output, 'assembly', `${observation.floor}.json`));
        assert.equal(observation.arm, 'control');
        assert.equal(observation.promptHash, pair.control.promptHash);
        assert.equal(sha(pair.control.promptText), observation.promptHash);
        const sourceLine = sourceLines.find(line => Number(line.split('\t')[0]) === observation.floor);
        assert.ok(sourceLine);
        assert.equal(observation.sourceHash, sha(sourceLine));
        assert.notEqual(scoreReview(observation), 'pending');
        for (const excerpt of observation.promptExcerpts) assert.ok(pair.control.promptText.includes(excerpt));
        control.push({ ...observation, semanticObservation: { path: filename, line: index + 1, sha256: sha(lines[index]) } });
    }
    await write(path.join(output, 'quality-reuse.json'), { control, provenance: 'new-expansion-control-semantic-review',
        observations: await ref(filename), sourceClarifications: await ref(path.join(output, 'source-clarifications.json')) });
    return { controlsBound: control.length, semanticFieldsInferred: false };
}

export async function publishExpansionCumulative(output) {
    const root = path.resolve(output, '../..');
    const loaded = await loadStudy(path.join(root, 'STUDY.json'));
    assert.equal((await auditStudy(loaded.study)).ok, true);
    const selection = await read(path.join(output, 'selection.json'));
    const priorPath = path.join(path.dirname(selection.previousPlan), 'quality-observations.json');
    const currentPath = path.join(output, 'quality-observations.json');
    const prior = await read(priorPath), current = await read(currentPath);
    const scorePath = path.join(root, 'experiments/current-real1300-full/review-v2/scoring.mjs');
    // eslint-disable-next-line no-unsanitized/method -- One unchanged scoring implementation for both batches.
    const { scoreReview, summarize, labels } = await import(pathToFileURL(scorePath));
    const control = [...prior.control, ...current.control].sort((a, b) => a.floor - b.floor);
    const fusion = [...prior.fusion, ...current.fusion].sort((a, b) => a.floor - b.floor);
    assert.equal(new Set(control.map(row => row.floor)).size, control.length);
    assert.deepEqual(control.map(row => row.floor), fusion.map(row => row.floor));
    const rank = { severe: 0, bad: 1, ordinary: 2, good: 3 };
    const rows = control.map((row, index) => ({ floor: row.floor, control: scoreReview(row), fusion: scoreReview(fusion[index]) }));
    assert.ok(rows.every(row => row.control !== 'pending' && row.fusion !== 'pending'));
    const summary = { scope: 'Same adult dev conversation; earlier and expanded disjoint samples, no tuning or independent-chat claim.',
        scoringDecision: selection.scoringDecision, targetPerArm: control.length,
        sources: [await ref(priorPath), await ref(currentPath)],
        control: summarize(control), fusion: summarize(fusion),
        expanded: { control: summarize(current.control), fusion: summarize(current.fusion) },
        paired: { improved: rows.filter(row => rank[row.fusion] > rank[row.control]).map(row => row.floor),
            regressed: rows.filter(row => rank[row.fusion] < rank[row.control]).map(row => row.floor),
            unchanged: rows.filter(row => row.fusion === row.control).map(row => row.floor) }, rows };
    await write(path.join(output, 'cumulative-summary.json'), summary);
    const count = x => [x.counts.good, x.counts.ordinary, x.counts.bad, x.counts.severe].join('|');
    await fs.writeFile(path.join(output, 'CUMULATIVE_REPORT.md'), `# 同池L2前60：累计${control.length}楼\n\n` +
        `新增${current.control.length}楼完成两臂独立判定，原${prior.control.length}楼不重跑、不回改。按D-290排除既存总结错误，评分器与融合规则未调。\n\n` +
        `|范围／方案|好|一般|差|极差|\n|---|---:|---:|---:|---:|\n` +
        `|新增／向量|${count(summary.expanded.control)}|\n|新增／融合|${count(summary.expanded.fusion)}|\n` +
        `|累计／向量|${count(summary.control)}|\n|累计／融合|${count(summary.fusion)}|\n\n` +
        `累计升档：${summary.paired.improved.join('、') || '无'}；降档：${summary.paired.regressed.join('、') || '无'}。\n\n` +
        `|楼层|向量|融合|\n|---:|---|---|\n${rows.map(row => `|${row.floor}|${labels[row.control]}|${labels[row.fusion]}|`).join('\n')}\n\n` +
        `新增逐楼证据和API收据见[REPORT.md](REPORT.md)，累计结果绑定见[cumulative-summary.json](cumulative-summary.json)。这是同一聊天的抽样，不是跨聊天泛化或角色回答正确率。生产算法仍不采用该候选。\n`);
    loaded.study.devMatrix.sources.push({ id: 'expanded-cumulative-quality', role: 'disjoint-batches-derived-from-reviewed-observations',
        status: 'frozen', artifacts: await Promise.all([priorPath, currentPath, path.join(output, 'cumulative-summary.json'),
            path.join(output, 'CUMULATIVE_REPORT.md'), path.join(output, 'quality-reuse.json'),
            path.join(output, 'review-material.json')].map(async (filename, index) => ({ name: String(index), ...await ref(filename) }))) });
    loaded.study.status = 'expanded-and-cumulative-fusion-quality-complete-not-adopted';
    loaded.study.updatedAt = new Date().toISOString();
    loaded.study.active = { hypothesisId: null, step: 'review-expanded-fusion-tradeoffs',
        nextAction: 'Present expanded and cumulative separate arm grades, coverage changes and shared gaps. Production remains unchanged; no tuning or additional live experiment without a new task.' };
    const audit = await auditStudy(loaded.study);
    assert.equal(audit.ok, true);
    const saved = await saveStudy(path.join(root, 'STUDY.json'), loaded.study, { expectedHash: loaded.hash });
    await writeStudyStatus(path.join(root, 'STATUS.md'), saved.study, audit, { studyHash: saved.hash });
    return { summary, auditChecks: audit.checks.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    const [mode, output] = process.argv.slice(2);
    if (mode === 'prepare') console.log(JSON.stringify(await prepareExpansion(path.resolve(output))));
    else if (mode === 'register-controls') console.log(JSON.stringify(await registerExpansionControls(path.resolve(output))));
    else if (mode === 'freeze-live') console.log(JSON.stringify(await freezeExpansionRequests(path.resolve(output))));
    else if (mode === 'review-material') console.log(JSON.stringify(await expansionReviewMaterial(path.resolve(output))));
    else if (mode === 'bind-controls') console.log(JSON.stringify(await bindExpansionControlReview(path.resolve(output))));
    else if (mode === 'publish-cumulative') console.log(JSON.stringify(await publishExpansionCumulative(path.resolve(output))));
    else throw new Error('Use prepare, freeze-live or review-material with an experiment directory');
}
