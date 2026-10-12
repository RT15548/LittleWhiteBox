/* global process */
// Mechanical evidence preparation and publication of explicit semantic decisions.
import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadStudy, saveStudy, auditStudy, writeStudyStatus } from '../study/store.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = async filename => JSON.parse(await fs.readFile(filename, 'utf8'));
const write = (filename, value) => fs.writeFile(filename, JSON.stringify(value, null, 2) + '\n');
const ref = async filename => ({ path: path.resolve(filename), sha256: sha(await fs.readFile(filename)) });
const sections = text => Object.fromEntries(text.split(/(?=^\[[^\n]+\])/m).map(s => [s.split('\n')[0], s]));
const normalizeDisplay = text => text.replace(/^[⭐]?\d+\./, '*')
    .replace(/关联记录\d+/g, '关联记录*').replace(/第\d+条/g, '第*条');

export async function prepareReviewEvidence(output) {
    const plan = await read(path.join(output, 'plan.json'));
    const reused = await read(path.join(output, 'quality-reuse.json'));
    const results = [];
    for (const target of plan.targets) {
        const pair = await read(path.join(output, 'assembly', `${target.floor}.json`));
        assert.equal(sha(pair.control.promptText), pair.control.promptHash);
        assert.equal(sha(pair.fusion.promptText), pair.fusion.promptHash);
        const old = reused.control.find(row => row.floor === target.floor);
        assert.equal(pair.control.promptHash, old.promptHash);
        const semantic = (await fs.readFile(old.semanticObservation.path, 'utf8')).trim().split(/\r?\n/)[old.semanticObservation.line - 1];
        assert.equal(sha(semantic), old.semanticObservation.sha256);
        const observation = JSON.parse(semantic);
        const a = pair.control.promptText.split('\n'), b = pair.fusion.promptText.split('\n');
        const sa = new Set(a.map(normalizeDisplay)), sb = new Set(b.map(normalizeDisplay));
        const first = sections(pair.control.promptText), second = sections(pair.fusion.promptText);
        results.push({ floor: target.floor, sourceHash: old.sourceHash,
            controlPromptHash: pair.control.promptHash, fusionPromptHash: pair.fusion.promptHash,
            sections: Object.keys(first).map(key => ({ key, equal: first[key] === second[key] })),
            oldObservation: observation,
            oldExcerptPresence: (observation.references?.promptExcerpts || []).map(text => ({ text,
                inControl: pair.control.promptText.includes(text), inFusion: pair.fusion.promptText.includes(text) })),
            added: b.filter(line => !sa.has(normalizeDisplay(line))),
            removed: a.filter(line => !sb.has(normalizeDisplay(line))),
        });
    }
    await write(path.join(output, 'review-evidence.json'), results);
    return { positions: results.length };
}

export async function publishAdmissionQuality(output) {
    const root = path.resolve(output, '../..');
    const loaded = await loadStudy(path.join(root, 'STUDY.json'));
    assert.equal((await auditStudy(loaded.study)).ok, true);
    const plan = await read(path.join(output, 'plan.json'));
    const live = await read(path.join(output, 'live-results.json'));
    const decisions = await read(path.join(output, 'review-decisions.json'));
    const proofs = await read(path.join(output, 'review-evidence.json'));
    const reused = await read(path.join(output, 'quality-reuse.json'));
    const assembly = await read(path.join(output, 'assembly-results.json'));
    const scorePath = path.join(root, 'experiments/current-real1300-full/review-v2/scoring.mjs');
    // eslint-disable-next-line no-unsanitized/method -- Existing local scoring contract, no new model judgment.
    const { scoreReview, summarize, labels } = await import(pathToFileURL(scorePath));
    assert.equal(live.status, 'complete');
    assert.deepEqual(decisions.fusion.map(row => row.floor), plan.targets.map(row => row.floor));
    const control = reused.control;
    const fusion = [];
    const table = [];
    for (const decision of decisions.fusion) {
        const pair = await read(path.join(output, 'assembly', `${decision.floor}.json`));
        const original = control.find(row => row.floor === decision.floor);
        const proof = proofs.find(row => row.floor === decision.floor);
        assert.equal(proof.fusionPromptHash, pair.fusion.promptHash);
        assert.equal(proof.controlPromptHash, original.promptHash);
        assert.equal(pair.fusion.promptHash, sha(pair.fusion.promptText));
        assert.equal(decision.promptHash, pair.fusion.promptHash, 'Semantic judgment must bind reviewed prompt');
        for (const text of decision.promptExcerpts) assert.ok(pair.fusion.promptText.includes(text), `${decision.floor}: excerpt absent`);
        const observation = { ...decision, arm: 'fusion', sourceHash: original.sourceHash,
            priorSourceJudgment: original.semanticObservation, proof: await ref(path.join(output, 'review-evidence.json')) };
        assert.notEqual(scoreReview(observation), 'pending');
        fusion.push(observation);
        table.push({ floor: decision.floor, control: scoreReview(original), fusion: scoreReview(observation),
            finding: decision.finding });
    }
    const rank = { severe: 0, bad: 1, ordinary: 2, good: 3 };
    const summary = { scope: plan.scope, scoringDecision: plan.scoringDecision,
        targetPerArm: plan.targets.length, control: summarize(control), fusion: summarize(fusion),
        paired: { improved: table.filter(row => rank[row.fusion] > rank[row.control]).map(row => row.floor),
            regressed: table.filter(row => rank[row.fusion] < rank[row.control]).map(row => row.floor),
            unchanged: table.filter(row => row.fusion === row.control).map(row => row.floor) },
        execution: { newRequests: live.attempts, completeResponses: live.requests.length,
            retries: live.attempts - live.requests.length, unknown: 0, monetaryCost: null },
        rows: table, limitations: decisions.limitations };
    await write(path.join(output, 'quality-observations.json'), { control, fusion });
    await write(path.join(output, 'quality-summary.json'), summary);
    const textRows = table.map(row => `|${row.floor}|${labels[row.control]}|${labels[row.fusion]}|${row.finding}|`);
    const counts = value => `好${value.counts.good}、一般${value.counts.ordinary}、差${value.counts.bad}、极差${value.counts.severe}`;
    const report = `# L2精排入口融合：${plan.targets.length}楼配对验证\n\n` +
        `只改变同一L2池里哪60条事件获得精排机会；Q2、0.60门槛、候选成员、预算、模型和时间保护不变。三路等权RRF、k=60在执行前冻结。\n\n` +
        `## 两臂各自成绩\n\n` +
        `- 向量入口：${control.length}/${plan.targets.length}，${counts(summary.control)}。\n` +
        `- 融合入口：${fusion.length}/${plan.targets.length}，${counts(summary.fusion)}。\n` +
        `- 升档：${summary.paired.improved.join('、') || '无'}；降档：${summary.paired.regressed.join('、') || '无'}；其余${summary.paired.unchanged.length}楼档位不变。\n\n` +
        `|楼层|向量入口|融合入口|逐楼结论|\n|---:|---|---|---|\n${textRows.join('\n')}\n\n` +
        `## 入口与装配\n\n` +
        decisions.findings.map(item => `- ${item}`).join('\n') + '\n\n' +
        `## 成绩口径与限制\n\n` + decisions.limitations.map(item => `- ${item}`).join('\n') + '\n\n' +
        `总结数据错误另见[summary-findings.json](summary-findings.json)，不扣算法分。两臂B类联想分别${summary.control.association.hits}/${summary.control.association.opportunities}、${summary.fusion.association.hits}/${summary.fusion.association.opportunities}；无联想机会分别${summary.control.association.noTrigger}、${summary.fusion.association.noTrigger}。\n\n` +
        `## 执行与验证\n\n` +
        `${live.attempts}笔新增请求、${live.requests.length}份完整成功响应，${summary.execution.retries}笔恢复尝试、零未知计费；金额未知。没有其他模型调用。协议与记录完整性不代替语义判定。\n\n` +
        `原始收据：[live-journal/request-journal.jsonl](live-journal/request-journal.jsonl)；请求/完整返回：[live-results.json](live-results.json)；两臂完整输入：assembly/；逐楼语义判定：[quality-observations.json](quality-observations.json)；派生成绩：[quality-summary.json](quality-summary.json)；全部差异与原观测绑定：[review-evidence.json](review-evidence.json)。原离线报告保留为[SCREEN_REPORT.md](SCREEN_REPORT.md)。\n`;
    const previousQuality = loaded.study.devMatrix.sources.find(source => source.id === 'fusion-complete-quality');
    // An already-published archive was validated above; never replace its bytes.
    if (!previousQuality) {
        await fs.copyFile(path.join(output, 'REPORT.md'), path.join(output, 'SCREEN_REPORT.md'), constants.COPYFILE_EXCL);
    }
    await fs.writeFile(path.join(output, 'REPORT.md'), report);
    const files = ['REPORT.md', 'SCREEN_REPORT.md', 'quality-summary.json', 'quality-observations.json', 'review-decisions.json',
        'review-evidence.json', 'summary-findings.json', 'live-results.json', 'assembly-results.json',
        'live-journal/request-journal.jsonl', ...plan.targets.map(row => `assembly/${row.floor}.json`)];
    const refs = await Promise.all(files.map(async name => ({ name, ...await ref(path.join(output, name)) })));
    refs.push({ name: 'quality-publisher', ...await ref(fileURLToPath(import.meta.url)) },
        { name: 'scoring-contract', ...await ref(scorePath) },
        { name: 'scoring-protocol', ...await ref(path.join(path.dirname(scorePath), 'PROTOCOL.md')) });
    const summaryFindings = await read(path.join(output, 'summary-findings.json'));
    const existingIssues = await read(summaryFindings.existingDefinitions.path);
    const upstreamEvidence = new Set([summaryFindings.existingDefinitions.path,
        ...Object.values(existingIssues).map(item => item.definition.path),
        ...control.map(item => item.semanticObservation.path)]);
    for (const filename of upstreamEvidence) refs.push({ name: `upstream-evidence-${refs.length}`, ...await ref(filename) });
    for (const source of loaded.study.devMatrix.sources) for (const artifact of source.artifacts) {
        // Current report is a generated view; raw offline results and their bindings remain frozen.
        if (path.resolve(artifact.path) === path.resolve(output, 'REPORT.md')) {
            Object.assign(artifact, await ref(path.join(output, 'REPORT.md')));
        }
    }
    const qualitySource = { id: 'fusion-complete-quality', role: 'paired-semantic-results',
        status: 'frozen', artifacts: refs };
    if (previousQuality) Object.assign(previousQuality, qualitySource);
    else loaded.study.devMatrix.sources.push(qualitySource);
    loaded.study.policy.externalRequests = live.attempts;
    loaded.study.status = 'bounded-fusion-validation-complete-not-adopted';
    loaded.study.updatedAt = new Date().toISOString();
    loaded.study.active = { hypothesisId: null, step: 'review-fusion-tradeoffs',
        nextAction: 'Present both complete algorithm grade distributions and regressions; production remains frozen. Further candidate changes require a separately frozen experiment, not tuning this completed sample.' };
    const audit = await auditStudy(loaded.study);
    assert.equal(audit.ok, true, JSON.stringify(audit.checks.filter(row => !row.ok)));
    const saved = await saveStudy(path.join(root, 'STUDY.json'), loaded.study, { expectedHash: loaded.hash });
    await writeStudyStatus(path.join(root, 'STATUS.md'), saved.study, audit, { studyHash: saved.hash });
    return { summary, auditChecks: audit.checks.length, assemblyPositions: assembly.positions.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    const [mode, output] = process.argv.slice(2);
    if (mode === 'prepare-review') console.log(JSON.stringify(await prepareReviewEvidence(path.resolve(output))));
    else if (mode === 'publish') console.log(JSON.stringify(await publishAdmissionQuality(path.resolve(output))));
    else throw new Error('Use prepare-review or publish with the experiment directory');
}
