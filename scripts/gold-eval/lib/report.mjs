// ═══════════════════════════════════════════════════════════════════════════
// Gold Eval - 运行产物落盘（runs/<run-id>/）
//
// 按 EVALUATION_PROTOCOL.md §10 保存：
//   manifest / cases / full prompts / prompt inputs / transport trace /
//   stage trace / metrics / failures / report / exact code archive.
// ═══════════════════════════════════════════════════════════════════════════

import path from 'node:path';
import fs from 'node:fs/promises';

function toPosix(input) {
    return String(input || '').replace(/\\/g, '/');
}

function jsonl(rows) {
    return (rows || []).map(row => JSON.stringify(row)).join('\n') + '\n';
}

export function normalizeRunName(name = 'run') {
    return String(name || 'run').replace(/[^\w一-龥-]+/g, '-').slice(0, 60);
}

export function buildRunId(name = 'run', now = new Date()) {
    const stamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', 'Z');
    return `${stamp}-${normalizeRunName(name)}`;
}

/**
 * @param {object} params
 * @param {string} params.runsRoot 运行产物根目录（私有评测工作区）
 * @param {string} params.runId
 * @param {object} params.manifest 数据/代码/模型/配置指纹（不含 Key）
 * @param {object[]} params.cases 本次实际运行的冻结用例
 * @param {object[]} params.stageTraces 每题 stage trace 行
 * @param {object} params.metrics 汇总指标
 * @param {object[]} params.failures 失败案例
 * @param {string} params.reportMarkdown 可读报告
 */
export async function writeRunArtifacts({
    runsRoot,
    runId,
    manifest,
    cases = [],
    stageTraces = [],
    metrics = {},
    failures = [],
    reportMarkdown = '',
}) {
    const runDir = path.join(runsRoot, runId);
    await fs.mkdir(runDir, { recursive: true });

    const files = {
        manifest: path.join(runDir, 'manifest.json'),
        cases: path.join(runDir, 'cases.jsonl'),
        stageTrace: path.join(runDir, 'stage-trace.jsonl'),
        metrics: path.join(runDir, 'metrics.json'),
        failures: path.join(runDir, 'failures.jsonl'),
        report: path.join(runDir, 'report.md'),
    };

    await fs.writeFile(files.manifest, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    await fs.writeFile(files.cases, jsonl(cases), 'utf8');
    await fs.writeFile(files.stageTrace, jsonl(stageTraces), 'utf8');
    await fs.writeFile(files.metrics, JSON.stringify(metrics, null, 2) + '\n', 'utf8');
    await fs.writeFile(files.failures, jsonl(failures), 'utf8');
    await fs.writeFile(files.report, reportMarkdown, 'utf8');

    return {
        runDir: toPosix(runDir),
        files: Object.fromEntries(Object.entries(files).map(([k, v]) => [k, toPosix(v)])),
    };
}

/**
 * 生成可读 Markdown 报告。
 * @param {object} params
 * @param {object} params.manifest
 * @param {object} params.aggregated aggregateMetrics 的输出
 * @param {object[]} params.failures
 * @param {object[]} params.stageTraces
 * @param {string[]} [params.limitations]
 */
export function renderGoldEvalReport({
    manifest,
    aggregated,
    failures = [],
    stageTraces = [],
    limitations = [],
}) {
    const lines = [];
    lines.push(`# Gold Eval 报告 — ${manifest?.runId || ''}`);
    lines.push('');
    lines.push(`- 生成时间: ${manifest?.generatedAt || ''}`);
    lines.push(`- 模式: ${manifest?.mode || ''}`);
    lines.push(`- 状态: ${manifest?.status || 'unknown'}`);
    lines.push(`- 源码 commit: ${manifest?.code?.commit || 'unknown'}${manifest?.code?.dirty ? ' (dirty)' : ''}`);
    lines.push(`- 样本: ${manifest?.data?.samplePath || ''} (${manifest?.data?.messageCount ?? '?'} 条消息)`);
    lines.push(`- 用例集: ${manifest?.data?.casesPath || ''} (运行 ${aggregated?.overall?.cases ?? 0} 题)`);
    lines.push(`- snapshot: ${manifest?.data?.snapshotPath || 'n/a'}`);
    lines.push('');

    const overall = aggregated?.overall || {};
    lines.push('## 总体指标');
    lines.push('');
    lines.push('| 指标 | 值 |');
    lines.push('|---|---|');
    lines.push(`| Recall@5 | ${fmt(overall.recallAt5)} |`);
    lines.push(`| Recall@10 | ${fmt(overall.recallAt10)} |`);
    lines.push(`| Precision@5 | ${fmt(overall.precisionAt5)} |`);
    lines.push(`| Precision@10 | ${fmt(overall.precisionAt10)} |`);
    lines.push(`| MRR | ${fmt(overall.mrr)} |`);
    lines.push(`| Required-all coverage | ${fmt(overall.requiredAllCoverage)} |`);
    lines.push(`| Forbidden@top10 | ${fmt(overall.forbiddenEvidenceRate?.top10)} |`);
    lines.push(`| Forbidden@prompt | ${fmt(overall.forbiddenEvidenceRate?.prompt)} |`);
    lines.push(`| Answer accuracy | ${fmt(overall.answerAccuracy)} (${overall.answersScored ?? 0} scored, ${overall.answersPending ?? 0} pending) |`);
    lines.push(`| Answer surface in Prompt | ${fmt(overall.answerSurfaceInPromptRate)} |`);
    lines.push(`| Recall p50 / p95 | ${overall.latency?.recallP50 ?? 'n/a'}ms / ${overall.latency?.recallP95 ?? 'n/a'}ms |`);
    lines.push(`| Reader p50 / p95 | ${overall.latency?.readerP50 ?? 'n/a'}ms / ${overall.latency?.readerP95 ?? 'n/a'}ms |`);
    lines.push('');

    const byCategory = aggregated?.byCategory || {};
    if (Object.keys(byCategory).length) {
        lines.push('## 分类指标');
        lines.push('');
        lines.push('| 类别 | 题数 | R@5 | R@10 | MRR | coverage | forbidden@top10 | answer |');
        lines.push('|---|---|---|---|---|---|---|---|');
        for (const [category, stats] of Object.entries(byCategory)) {
            lines.push(`| ${category} | ${stats.cases} | ${fmt(stats.recallAt5)} | ${fmt(stats.recallAt10)} | ${fmt(stats.mrr)} | ${fmt(stats.requiredAllCoverage)} | ${fmt(stats.forbiddenEvidenceRate?.top10)} | ${fmt(stats.answerAccuracy)} |`);
        }
        lines.push('');
    }

    lines.push('## 失败归因（最早失真阶段）');
    lines.push('');
    const failureCounts = overall.failures || {};
    if (Object.keys(failureCounts).length) {
        for (const [stage, count] of Object.entries(failureCounts).sort((a, b) => b[1] - a[1])) {
            lines.push(`- ${stage}: ${count} 题`);
        }
    } else {
        lines.push('- 无失败（或阅读阶段未运行）');
    }
    lines.push('');

    if (failures.length) {
        lines.push('## 失败用例明细');
        lines.push('');
        for (const f of failures.slice(0, 50)) {
            lines.push(`- \`${f.id}\` [${f.category}] 最早失真: **${f.earliestFailure}** — ${f.queryPreview || ''}`);
        }
        if (failures.length > 50) lines.push(`- … 共 ${failures.length} 条，见 failures.jsonl`);
        lines.push('');
    }

    if (limitations.length) {
        lines.push('## 限制');
        lines.push('');
        for (const item of limitations) lines.push(`- ${item}`);
        lines.push('');
    }

    lines.push('## 复现');
    lines.push('');
    if (manifest?.code?.bundleHash) {
        lines.push('run 内保存实际执行 bundle、Gold tooling、依赖锁文件及其 hash；结合冻结输入可校验本次执行，不依赖会话口头信息。');
    } else {
        lines.push('本 run 缺少实际执行 bundle hash，只能作为观察记录，不能宣称可完整复现。');
    }
    lines.push(`stage-trace 行数: ${stageTraces.length}`);
    lines.push('');

    return lines.join('\n');
}

function fmt(value) {
    if (value == null) return 'n/a';
    return typeof value === 'number' ? String(value) : String(value);
}
