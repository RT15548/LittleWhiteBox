/* global process */
// Publication derives only verified, byte-identical existing semantic judgments.
// Changed prompts remain unreviewed; this does not infer quality from rankings.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { loadStudy, saveStudy, auditStudy, writeStudyStatus } from '../study/store.mjs';

const sha = value => createHash('sha256').update(value).digest('hex');
const read = async filename => JSON.parse(await fs.readFile(filename, 'utf8'));
const write = (filename, value) => fs.writeFile(filename, JSON.stringify(value, null, 2) + '\n');
const ref = async filename => ({ path: path.resolve(filename), sha256: sha(await fs.readFile(filename)) });

export async function publishAdmissionScreen(output) {
    const root = path.resolve(output, '../..');
    const studyPath = path.join(root, 'STUDY.json');
    const loaded = await loadStudy(studyPath);
    assert.equal((await auditStudy(loaded.study)).ok, true);
    const plan = await read(path.join(output, 'plan.json'));
    const screen = await read(path.join(output, 'screen.json'));
    assert.equal(screen.networkRequests, 0);
    assert.deepEqual(screen.positions.map(row => row.floor), plan.targets.map(row => row.floor));
    const reviewPath = path.join(root, 'experiments/current-real800-l0-consequences-20260930/algorithm-observations-v2.jsonl');
    const reviews = (await fs.readFile(reviewPath, 'utf8')).trim().split(/\r?\n/).map(JSON.parse)
        .filter(row => row.arm === 'current');
    const scoringPath = path.join(root, 'experiments/current-real1300-full/review-v2/scoring.mjs');
    // eslint-disable-next-line no-unsanitized/method -- Existing local evaluation contract.
    const { scoreReview, summarize, labels } = await import(pathToFileURL(scoringPath));
    const quality = { control: [], fusion: [], pendingFusionFloors: [] };
    const rows = [];
    const positions = new Map();
    for (const target of plan.targets) {
        const result = await read(path.join(output, 'positions', `${target.floor}.json`));
        positions.set(target.floor, result);
        const original = reviews.find(row => row.floor === target.floor);
        assert.equal(original.promptHash, result.controlPromptHash);
        assert.equal(sha(result.controlPromptText), original.promptHash);
        const current = { ...original, arm: 'control', reuseProof: { path: reviewPath, originalArm: 'current', promptHash: original.promptHash } };
        quality.control.push(current);
        const changed = result.promoted.length !== 0;
        let fusionGrade = '未审';
        if (!changed) {
            assert.deepEqual(result.controlHead, result.fusionHead);
            assert.deepEqual(result.controlTail, result.fusionTail);
            assert.ok(result.requests.fusion.every(request => request.reusable));
            quality.fusion.push({ ...current, arm: 'fusion', equivalenceProof: 'identical head, tail and exact successful rerank request identities; identical assembly input' });
            fusionGrade = labels[scoreReview(current)];
        } else quality.pendingFusionFloors.push(target.floor);
        rows.push(`|${target.floor}|${result.candidateCount}|${result.promoted.length}|${result.displacedInControlPrompt.length}|${labels[scoreReview(current)]}|${fusionGrade}|`);
    }
    quality.summary = {
        control: summarize(quality.control), fusion: summarize(quality.fusion),
        targetPerArm: plan.targets.length, completeQualityPairs: quality.fusion.length,
    };
    await write(path.join(output, 'quality-reuse.json'), quality);
    // Replace only the derived screen counters; no raw position/receipt is changed.
    screen.qualityPairsCompleted = quality.fusion.length;
    screen.unchangedPairsEligibleForReviewReuse = quality.fusion.map(row => row.floor);
    await write(path.join(output, 'screen.json'), screen);
    const pending = await read(path.join(output, 'pending-requests.json'));
    const proposal = {
        status: 'proposed-not-dispatched', provider: 'SiliconFlow', host: 'api.siliconflow.cn',
        model: 'BAAI/bge-reranker-v2-m3',
        inputClasses: ['existing bounded query', 'existing adult dev L2 summaries'],
        changedPositions: quality.pendingFusionFloors,
        initialNewRequests: pending.length, hardMaximumAttempts: pending.length * 3,
        attemptsPerIdentity: 3, otherModelRequests: 0,
        receiptPolicy: 'Exact host/path/method/model/body hash successes reused. Only known complete transient failures may retry; unknown billing outcomes must stop. Never re-buy success.',
        downstreamScope: 'Frozen captured L0/L1 selection, facts, arcs and fresh memory; rerank changed L2 heads then assemble with the current production module. Not fresh complete retrieval or a claim about changed L1 retrieval.',
        plan: await ref(path.join(output, 'plan.json')), requests: await ref(path.join(output, 'pending-requests.json')),
    };
    await write(path.join(output, 'live-proposal.json'), proposal);
    const gapRows = [680, 688].map(floor => {
        const item = positions.get(floor).knownMissingTarget;
        return `|${floor}|${item.eventId}|${item.denseRank}|${item.fusionRank}|${item.treatmentAdmitted ? '是' : '否'}|`;
    });
    const key = positions.get(680);
    const supported = key.knownMissingTarget;
    const controlCounts = quality.summary.control.counts;
    const fusionCounts = quality.summary.fusion.counts;
    const body = `# L2精排入口融合：离线筛选结果\n\n` +
        `仅改变同一L2候选池内哪60条事件获得精排机会。规则在筛选前固定，三路等权RRF、k=60、1起始名次；时间保护仍由向量证据选定，占原60个名额。第二轮、0.60门槛、候选成员和装配预算不变。\n\n` +
        `固定既有上游召回，使用当前词法索引与当前装配器。12位置词法楼层排名及分数均重建吻合，原控制臂事件精排收据精确匹配、完整Prompt逐字复现。不是当前完整检索链重跑。\n\n` +
        `## 两个已知缺口的入口变化\n\n` +
        `|查询楼层|目标L2|向量名次|融合名次|获得精排机会|\n|---:|---|---:|---:|---|\n` +
        gapRows.join('\n') + '\n\n' +
        `680楼：该L2词法第${supported.lexicalRank}；最佳支持楼层是显示#${supported.bestFloor + 1}（内部${supported.bestFloor}），位于原选中楼层列表第${supported.bestFloorPosition}，转换成支持事件排名第${supported.floorSupportEventRank}。显示#165的must-keep不是它的唯一楼层支持。三路贡献分别${Object.values(supported.contributions).map(value => value.toFixed(7)).join('、')}。没有调整权重来强保该事件。\n\n` +
        `**只能确认入口能补漏，不能确认最终记忆变好。**680楼换入${key.promoted.length}条，有${key.displacedInControlPrompt.length}条换出事件出现在原控制Prompt（含因果载体）；它们仍在候选尾部，不等于内容已经丢失。原对话中掌心“明”字这一细节与当前近窗有联系，不能不经精排和内容审阅就把换出项当垃圾。\n\n` +
        `## 全部12位置\n\n|查询楼层|候选L2数|换入／换出数|换出且原Prompt出现数|控制臂档位|融合臂档位|\n|---:|---:|---:|---:|---|---|\n` +
        rows.join('\n') + '\n\n' +
        `控制臂${quality.control.length}/${plan.targets.length}：好${controlCounts.good}、一般${controlCounts.ordinary}、差${controlCounts.bad}、极差${controlCounts.severe}，依据逐字匹配的既有语义审阅复用，不是新完整召回成绩。融合臂${quality.fusion.length}/${plan.targets.length}：好${fusionCounts.good}、一般${fusionCounts.ordinary}；其余${quality.pendingFusionFloors.length}楼未审，不填作一般。全部总结错误仍引用D-290独立清单，不作为算法退步。\n\n` +
        `## 还没完成什么\n\n` +
        `融合臂缺${pending.length}个唯一精排请求的精确收据；成功收据不会重买。需要先补齐，再对实际装配逐楼评价：目标经过是否入场，原来有用的背景是否被挤掉，后果和前因是否仍完整。当前新增API0、未读取密钥、未修改生产召回或正式参数、未commit/push。\n\n` +
        `由于L1选择冻结，这个配对只证明L2精排入口对装配的影响；若进入完整链验证，还必须核对排序变化对L1选择的连带影响。\n\n` +
        `## 验证及复核\n\n` +
        `11项相关测试通过，eslint无报错或警告，语法与diff检查通过。离线准备遇到的依赖解析与词法投影核对错误已本地修正，没有联网或用失败输出评分。\n\n` +
        `规则与源码哈希：[plan.json](plan.json)；逐位置输入/排名/贡献/换出内容：positions/；筛选汇总：[screen.json](screen.json)；仅复用的质量判定：[quality-reuse.json](quality-reuse.json)；未发请求范围：[live-proposal.json](live-proposal.json)。\n`;
    await fs.writeFile(path.join(output, 'REPORT.md'), body);
    const artifactPaths = [path.join(output, 'screen.json'), path.join(output, 'REPORT.md'),
        path.join(output, 'quality-reuse.json'), path.join(output, 'pending-requests.json'), path.join(output, 'live-proposal.json'),
        reviewPath, scoringPath, plan.source.manifest.path, plan.source.needs.path,
        ...plan.targets.flatMap(target => [target.checkpoint.path, target.boundary.path, target.previousPair.path,
            path.join(output, 'positions', `${target.floor}.json`)]),
        ...['l2-admission-fusion.mjs', 'l2-admission-screen.mjs', 'publish-l2-admission-screen.mjs'].map(name => path.join(process.cwd(), 'scripts/gold-eval/experiments', name))];
    const artifacts = await Promise.all([...new Set(artifactPaths)].map(async (filename, index) => ({ name: String(index + 1), ...await ref(filename) })));
    const study = {
        schemaVersion: 1, studyId: 'story-summary-current-800-l2-admission-fusion',
        objective: 'Validate three-channel admission of the same 60 L2 rerank events while preserving the working baseline.',
        phase: 'experiments', status: 'admission-screen-complete-awaiting-bounded-rerank', updatedAt: new Date().toISOString(),
        policy: { productionBehavior: 'frozen', holdout: 'excluded-previously-consumed', externalRequests: 0, algorithmScoringDecision: 'D-290' },
        inputs: { dev: { sample: plan.source.sample, cases: await ref(path.join(output, 'plan.json')), snapshot: null }, holdout: null },
        evidence: {}, hypotheses: [],
        devMatrix: { sources: [{ id: 'fusion-current-code', role: 'current-assembly-verified-frozen-upstream', status: 'frozen',
            artifacts: [plan.code.bundle, ...plan.code.sources].map((item, index) => ({ name: String(index + 1), ...item })) },
        { id: 'fusion-screen-evidence', role: 'admission-screen-not-full-quality', status: 'frozen', artifacts }] },
        active: { hypothesisId: null, step: 'bounded-fusion-event-rerank',
            nextAction: `Confirm the ${pending.length}-identity SiliconFlow rerank scope in live-proposal.json; then rerank fusion L2 heads and finish all 12 semantic assembly judgments without tuning this frozen rule.` },
    };
    assert.equal((await auditStudy(study)).ok, true);
    if (loaded.study.studyId !== study.studyId) {
        await fs.writeFile(path.join(output, 'previous-study.json'), await fs.readFile(studyPath));
    }
    const saved = await saveStudy(studyPath, study, { expectedHash: loaded.hash });
    await writeStudyStatus(path.join(root, 'STATUS.md'), saved.study, await auditStudy(saved.study), { studyHash: saved.hash });
    return { pendingRequests: pending.length, grades: quality.summary, audit: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    assert.ok(process.argv[2], 'Provide experiment directory');
    console.log(JSON.stringify(await publishAdmissionScreen(path.resolve(process.argv[2]))));
}
