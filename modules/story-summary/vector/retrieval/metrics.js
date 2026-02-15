// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - Metrics Collector (v6 - Dense-Gated Lexical)
//
// v5 → v6 变更：
// - lexical: 新增 eventFilteredByDense / floorFilteredByDense
// - event: entityFilter bypass 阈值改为 CONFIG 驱动（0.80）
// - 其余结构不变
//
// v4 → v5 变更：
// - query: 新增 segmentWeights / r2Weights（加权向量诊断）
// - fusion: 新增 denseAggMethod / lexDensityBonus（聚合策略可观测）
// - quality: 新增 rerankRetentionRate（粗排-精排一致性）
// - 移除 timing 中从未写入的死字段（queryBuild/queryRefine/lexicalSearch/fusion）
// - 移除从未写入的 arc 区块
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 创建空的指标对象
 * @returns {object}
 */
export function createMetrics() {
    return {
        // Query Build - 查询构建
        query: {
            buildTime: 0,
            refineTime: 0,
            lengths: {
                v0Chars: 0,
                v1Chars: null,     // null = 无 hints
                rerankChars: 0,
            },
            segmentWeights: [],    // R1 归一化后权重 [context..., focus]
            r2Weights: null,       // R2 归一化后权重 [context..., focus, hints]（null = 无 hints）
        },

        // Anchor (L0 StateAtoms) - 语义锚点
        anchor: {
            needRecall: false,
            focusTerms: [],
            focusCharacters: [],
            focusEntities: [],
            matched: 0,
            floorsHit: 0,
            topHits: [],
        },

        // Lexical (MiniSearch) - 词法检索
        lexical: {
            terms: [],
            atomHits: 0,
            chunkHits: 0,
            eventHits: 0,
            searchTime: 0,
            indexReadyTime: 0,
            eventFilteredByDense: 0,
            floorFilteredByDense: 0,
        },

        // Fusion (W-RRF, floor-level) - 多路融合
        fusion: {
            denseFloors: 0,
            lexFloors: 0,
            totalUnique: 0,
            afterCap: 0,
            time: 0,
            denseAggMethod: '',    // 聚合方法描述（如 "max×0.6+mean×0.4"）
            lexDensityBonus: 0,    // 密度加成系数
        },

        // Constraint (L3 Facts) - 世界约束
        constraint: {
            total: 0,
            filtered: 0,
            injected: 0,
            tokens: 0,
            samples: [],
        },

        // Event (L2 Events) - 事件摘要
        event: {
            inStore: 0,
            considered: 0,
            selected: 0,
            byRecallType: { direct: 0, related: 0, causal: 0, lexical: 0, l0Linked: 0 },
            similarityDistribution: { min: 0, max: 0, mean: 0, median: 0 },
            entityFilter: null,
            causalChainDepth: 0,
            causalCount: 0,
            entitiesUsed: 0,
            focusTermsCount: 0,
            entityNames: [],
        },

        // Evidence (Two-Stage: Floor rerank → L1 pull) - 原文证据
        evidence: {
            // Stage 1: Floor
            floorCandidates: 0,
            floorsSelected: 0,
            l0Collected: 0,
            rerankApplied: false,
            rerankFailed: false,
            beforeRerank: 0,
            afterRerank: 0,
            rerankTime: 0,
            rerankScores: null,
            rerankDocAvgLength: 0,

            // Stage 2: L1
            l1Pulled: 0,
            l1Attached: 0,
            l1CosineTime: 0,

            // 装配
            contextPairsAdded: 0,
            tokens: 0,
            assemblyTime: 0,
        },

        // Diffusion (PPR Spreading Activation) - 图扩散
        diffusion: {
            seedCount: 0,
            graphNodes: 0,
            graphEdges: 0,
            candidatePairs: 0,
            pairsFromWhat: 0,
            pairsFromRSem: 0,
            rSemAvgSim: 0,
            timeWindowFilteredPairs: 0,
            topKPrunedPairs: 0,
            edgeDensity: 0,
            reweightWhoUsed: 0,
            reweightWhereUsed: 0,
            iterations: 0,
            convergenceError: 0,
            pprActivated: 0,
            cosineGatePassed: 0,
            cosineGateFiltered: 0,
            cosineGateNoVector: 0,
            postGatePassRate: 0,
            finalCount: 0,
            scoreDistribution: { min: 0, max: 0, mean: 0 },
            byChannel: { what: 0, where: 0, rSem: 0, who: 0 },
            time: 0,
        },

        // Formatting - 格式化
        formatting: {
            sectionsIncluded: [],
            time: 0,
        },

        // Budget Summary - 预算
        budget: {
            total: 0,
            limit: 0,
            utilization: 0,
            breakdown: {
                constraints: 0,
                events: 0,
                distantEvidence: 0,
                recentEvidence: 0,
                arcs: 0,
            },
        },

        // Timing - 计时（仅包含实际写入的字段）
        timing: {
            anchorSearch: 0,
            constraintFilter: 0,
            eventRetrieval: 0,
            evidenceRetrieval: 0,
            evidenceRerank: 0,
            evidenceAssembly: 0,
            diffusion: 0,
            formatting: 0,
            total: 0,
        },

        // Quality Indicators - 质量指标
        quality: {
            constraintCoverage: 100,
            eventPrecisionProxy: 0,
            l1AttachRate: 0,
            rerankRetentionRate: 0,
            diffusionEffectiveRate: 0,
            potentialIssues: [],
        },
    };
}

/**
 * 计算相似度分布统计
 * @param {number[]} similarities
 * @returns {{min: number, max: number, mean: number, median: number}}
 */
export function calcSimilarityStats(similarities) {
    if (!similarities?.length) {
        return { min: 0, max: 0, mean: 0, median: 0 };
    }

    const sorted = [...similarities].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
        min: Number(sorted[0].toFixed(3)),
        max: Number(sorted[sorted.length - 1].toFixed(3)),
        mean: Number((sum / sorted.length).toFixed(3)),
        median: Number(sorted[Math.floor(sorted.length / 2)].toFixed(3)),
    };
}

/**
 * 格式化权重数组为紧凑字符串
 * @param {number[]|null} weights
 * @returns {string}
 */
function fmtWeights(weights) {
    if (!weights?.length) return 'N/A';
    return '[' + weights.map(w => (typeof w === 'number' ? w.toFixed(3) : String(w))).join(', ') + ']';
}

/**
 * 格式化指标为可读日志
 * @param {object} metrics
 * @returns {string}
 */
export function formatMetricsLog(metrics) {
    const m = metrics;
    const lines = [];

    lines.push('');
    lines.push('════════════════════════════════════════');
    lines.push('        Recall Metrics Report (v5)      ');
    lines.push('════════════════════════════════════════');
    lines.push('');

    // Query Length
    lines.push('[Query Length] 查询长度');
    lines.push(`├─ query_v0_chars: ${m.query?.lengths?.v0Chars ?? 0}`);
    lines.push(`├─ query_v1_chars: ${m.query?.lengths?.v1Chars == null ? 'N/A' : m.query.lengths.v1Chars}`);
    lines.push(`└─ rerank_query_chars: ${m.query?.lengths?.rerankChars ?? 0}`);
    lines.push('');

    // Query Build
    lines.push('[Query] 查询构建');
    lines.push(`├─ build_time: ${m.query.buildTime}ms`);
    lines.push(`├─ refine_time: ${m.query.refineTime}ms`);
    lines.push(`├─ r1_weights: ${fmtWeights(m.query.segmentWeights)}`);
    if (m.query.r2Weights) {
        lines.push(`└─ r2_weights: ${fmtWeights(m.query.r2Weights)}`);
    } else {
        lines.push(`└─ r2_weights: N/A (no hints)`);
    }
    lines.push('');

    // Anchor (L0 StateAtoms)
    lines.push('[Anchor] L0 StateAtoms - 语义锚点');
    lines.push(`├─ need_recall: ${m.anchor.needRecall}`);
    if (m.anchor.needRecall) {
        lines.push(`├─ focus_terms: [${(m.anchor.focusTerms || m.anchor.focusEntities || []).join(', ')}]`);
        lines.push(`├─ focus_characters: [${(m.anchor.focusCharacters || []).join(', ')}]`);
        lines.push(`├─ matched: ${m.anchor.matched || 0}`);
        lines.push(`└─ floors_hit: ${m.anchor.floorsHit || 0}`);
    }
    lines.push('');

    // Lexical (MiniSearch)
    lines.push('[Lexical] MiniSearch - 词法检索');
    lines.push(`├─ terms: [${(m.lexical.terms || []).slice(0, 8).join(', ')}]`);
    lines.push(`├─ atom_hits: ${m.lexical.atomHits}`);
    lines.push(`├─ chunk_hits: ${m.lexical.chunkHits}`);
    lines.push(`├─ event_hits: ${m.lexical.eventHits}`);
    lines.push(`├─ search_time: ${m.lexical.searchTime}ms`);
    if (m.lexical.indexReadyTime > 0) {
        lines.push(`├─ index_ready_time: ${m.lexical.indexReadyTime}ms`);
    }
    if (m.lexical.eventFilteredByDense > 0) {
        lines.push(`├─ event_filtered_by_dense: ${m.lexical.eventFilteredByDense}`);
    }
    if (m.lexical.floorFilteredByDense > 0) {
        lines.push(`├─ floor_filtered_by_dense: ${m.lexical.floorFilteredByDense}`);
    }
    lines.push(`└─ dense_gate_threshold: 0.50`);
    lines.push('');

    // Fusion (W-RRF, floor-level)
    lines.push('[Fusion] W-RRF (floor-level) - 多路融合');
    lines.push(`├─ dense_floors: ${m.fusion.denseFloors}`);
    lines.push(`├─ lex_floors: ${m.fusion.lexFloors}`);
    if (m.fusion.lexDensityBonus > 0) {
        lines.push(`│   └─ density_bonus: ${m.fusion.lexDensityBonus}`);
    }
    lines.push(`├─ total_unique: ${m.fusion.totalUnique}`);
    lines.push(`├─ after_cap: ${m.fusion.afterCap}`);
    lines.push(`└─ time: ${m.fusion.time}ms`);
    lines.push('');

    // Constraint (L3 Facts)
    lines.push('[Constraint] L3 Facts - 世界约束');
    lines.push(`├─ total: ${m.constraint.total}`);
    lines.push(`├─ filtered: ${m.constraint.filtered || 0}`);
    lines.push(`├─ injected: ${m.constraint.injected}`);
    lines.push(`├─ tokens: ${m.constraint.tokens}`);
    if (m.constraint.samples && m.constraint.samples.length > 0) {
        lines.push(`└─ samples: "${m.constraint.samples.slice(0, 2).join('", "')}"`);
    }
    lines.push('');

    // Event (L2 Events)
    lines.push('[Event] L2 Events - 事件摘要');
    lines.push(`├─ in_store: ${m.event.inStore}`);
    lines.push(`├─ considered: ${m.event.considered}`);

    if (m.event.entityFilter) {
        const ef = m.event.entityFilter;
        lines.push(`├─ entity_filter:`);
        lines.push(`│   ├─ focus_characters: [${(ef.focusCharacters || ef.focusEntities || []).join(', ')}]`);
        lines.push(`│   ├─ before: ${ef.before}`);
        lines.push(`│   ├─ after: ${ef.after}`);
        lines.push(`│   └─ filtered: ${ef.filtered}`);
    }

    lines.push(`├─ selected: ${m.event.selected}`);
    lines.push(`├─ by_recall_type:`);
    lines.push(`│   ├─ direct: ${m.event.byRecallType.direct}`);
    lines.push(`│   ├─ related: ${m.event.byRecallType.related}`);
    lines.push(`│   ├─ causal: ${m.event.byRecallType.causal}`);
    if (m.event.byRecallType.l0Linked) {
        lines.push(`│   ├─ lexical: ${m.event.byRecallType.lexical}`);
        lines.push(`│   └─ l0_linked: ${m.event.byRecallType.l0Linked}`);
    } else {
        lines.push(`│   └─ lexical: ${m.event.byRecallType.lexical}`);
    }

    const sim = m.event.similarityDistribution;
    if (sim && sim.max > 0) {
        lines.push(`├─ similarity_distribution:`);
        lines.push(`│   ├─ min: ${sim.min}`);
        lines.push(`│   ├─ max: ${sim.max}`);
        lines.push(`│   ├─ mean: ${sim.mean}`);
        lines.push(`│   └─ median: ${sim.median}`);
    }

    lines.push(`├─ causal_chain: depth=${m.event.causalChainDepth}, count=${m.event.causalCount}`);
    lines.push(`└─ focus_characters_used: ${m.event.entitiesUsed} [${(m.event.entityNames || []).join(', ')}], focus_terms_count=${m.event.focusTermsCount || 0}`);
    lines.push('');

    // Evidence (Two-Stage: Floor Rerank → L1 Pull)
    lines.push('[Evidence] Two-Stage: Floor Rerank → L1 Pull');
    lines.push(`├─ Stage 1 (Floor Rerank):`);
    lines.push(`│   ├─ floor_candidates (post-fusion): ${m.evidence.floorCandidates}`);

    if (m.evidence.rerankApplied) {
        lines.push(`│   ├─ rerank_applied: true`);
        if (m.evidence.rerankFailed) {
            lines.push(`│   │   ⚠ rerank_failed: using fusion order`);
        }
        lines.push(`│   │   ├─ before: ${m.evidence.beforeRerank} floors`);
        lines.push(`│   │   ├─ after: ${m.evidence.afterRerank} floors`);
        lines.push(`│   │   └─ time: ${m.evidence.rerankTime}ms`);
        if (m.evidence.rerankScores) {
            const rs = m.evidence.rerankScores;
            lines.push(`│   ├─ rerank_scores: min=${rs.min}, max=${rs.max}, mean=${rs.mean}`);
        }
        if (m.evidence.rerankDocAvgLength > 0) {
            lines.push(`│   ├─ rerank_doc_avg_length: ${m.evidence.rerankDocAvgLength} chars`);
        }
    } else {
        lines.push(`│   ├─ rerank_applied: false`);
    }

    lines.push(`│   ├─ floors_selected: ${m.evidence.floorsSelected}`);
    lines.push(`│   └─ l0_atoms_collected: ${m.evidence.l0Collected}`);
    lines.push(`├─ Stage 2 (L1):`);
    lines.push(`│   ├─ pulled: ${m.evidence.l1Pulled}`);
    lines.push(`│   ├─ attached: ${m.evidence.l1Attached}`);
    lines.push(`│   └─ cosine_time: ${m.evidence.l1CosineTime}ms`);
    lines.push(`├─ tokens: ${m.evidence.tokens}`);
    lines.push(`└─ assembly_time: ${m.evidence.assemblyTime}ms`);
    lines.push('');

    // Diffusion (PPR)
    lines.push('[Diffusion] PPR Spreading Activation');
    lines.push(`├─ seeds: ${m.diffusion.seedCount}`);
    lines.push(`├─ graph: ${m.diffusion.graphNodes} nodes, ${m.diffusion.graphEdges} edges`);
    lines.push(`├─ candidate_pairs: ${m.diffusion.candidatePairs || 0} (what=${m.diffusion.pairsFromWhat || 0}, r_sem=${m.diffusion.pairsFromRSem || 0})`);
    lines.push(`├─ r_sem_avg_sim: ${m.diffusion.rSemAvgSim || 0}`);
    lines.push(`├─ pair_filters: time_window=${m.diffusion.timeWindowFilteredPairs || 0}, topk_pruned=${m.diffusion.topKPrunedPairs || 0}`);
    lines.push(`├─ edge_density: ${m.diffusion.edgeDensity || 0}%`);
    if (m.diffusion.graphEdges > 0) {
        const ch = m.diffusion.byChannel || {};
        lines.push(`│   ├─ by_channel: what=${ch.what || 0}, r_sem=${ch.rSem || 0}, who=${ch.who || 0}, where=${ch.where || 0}`);
        lines.push(`│   └─ reweight_used: who=${m.diffusion.reweightWhoUsed || 0}, where=${m.diffusion.reweightWhereUsed || 0}`);
    }
    if (m.diffusion.iterations > 0) {
        lines.push(`├─ ppr: ${m.diffusion.iterations} iterations, ε=${Number(m.diffusion.convergenceError).toExponential(1)}`);
    }
    lines.push(`├─ activated (excl seeds): ${m.diffusion.pprActivated}`);
    if (m.diffusion.pprActivated > 0) {
        lines.push(`├─ cosine_gate: ${m.diffusion.cosineGatePassed} passed, ${m.diffusion.cosineGateFiltered} filtered`);
        const passPrefix = m.diffusion.cosineGateNoVector > 0 ? '│   ├─' : '│   └─';
        lines.push(`${passPrefix} pass_rate: ${m.diffusion.postGatePassRate || 0}%`);
        if (m.diffusion.cosineGateNoVector > 0) {
            lines.push(`│   ├─ no_vector: ${m.diffusion.cosineGateNoVector}`);
        }
    }
    lines.push(`├─ final_injected: ${m.diffusion.finalCount}`);
    if (m.diffusion.finalCount > 0) {
        const ds = m.diffusion.scoreDistribution;
        lines.push(`├─ scores: min=${ds.min}, max=${ds.max}, mean=${ds.mean}`);
    }
    lines.push(`└─ time: ${m.diffusion.time}ms`);
    lines.push('');

    // Formatting
    lines.push('[Formatting] 格式化');
    lines.push(`├─ sections: [${(m.formatting.sectionsIncluded || []).join(', ')}]`);
    lines.push(`└─ time: ${m.formatting.time}ms`);
    lines.push('');

    // Budget Summary
    lines.push('[Budget] 预算');
    lines.push(`├─ total_tokens: ${m.budget.total}`);
    lines.push(`├─ limit: ${m.budget.limit}`);
    lines.push(`├─ utilization: ${m.budget.utilization}%`);
    lines.push(`└─ breakdown:`);
    const bd = m.budget.breakdown || {};
    lines.push(`    ├─ constraints: ${bd.constraints || 0}`);
    lines.push(`    ├─ events: ${bd.events || 0}`);
    lines.push(`    ├─ distant_evidence: ${bd.distantEvidence || 0}`);
    lines.push(`    ├─ recent_evidence: ${bd.recentEvidence || 0}`);
    lines.push(`    └─ arcs: ${bd.arcs || 0}`);
    lines.push('');

    // Timing
    lines.push('[Timing] 计时');
    lines.push(`├─ query_build: ${m.query.buildTime}ms`);
    lines.push(`├─ query_refine: ${m.query.refineTime}ms`);
    lines.push(`├─ anchor_search: ${m.timing.anchorSearch}ms`);
    const lexicalTotal = (m.lexical.searchTime || 0) + (m.lexical.indexReadyTime || 0);
    lines.push(`├─ lexical_search: ${lexicalTotal}ms (query=${m.lexical.searchTime || 0}ms, index_ready=${m.lexical.indexReadyTime || 0}ms)`);
    lines.push(`├─ fusion: ${m.fusion.time}ms`);
    lines.push(`├─ constraint_filter: ${m.timing.constraintFilter}ms`);
    lines.push(`├─ event_retrieval: ${m.timing.eventRetrieval}ms`);
    lines.push(`├─ evidence_retrieval: ${m.timing.evidenceRetrieval}ms`);
    lines.push(`├─ floor_rerank: ${m.timing.evidenceRerank || 0}ms`);
    lines.push(`├─ l1_cosine: ${m.evidence.l1CosineTime}ms`);
    lines.push(`├─ diffusion: ${m.timing.diffusion}ms`);
    lines.push(`├─ evidence_assembly: ${m.timing.evidenceAssembly}ms`);
    lines.push(`├─ formatting: ${m.timing.formatting}ms`);
    lines.push(`└─ total: ${m.timing.total}ms`);
    lines.push('');

    // Quality Indicators
    lines.push('[Quality] 质量指标');
    lines.push(`├─ constraint_coverage: ${m.quality.constraintCoverage}%`);
    lines.push(`├─ event_precision_proxy: ${m.quality.eventPrecisionProxy}`);
    lines.push(`├─ l1_attach_rate: ${m.quality.l1AttachRate}%`);
    lines.push(`├─ rerank_retention_rate: ${m.quality.rerankRetentionRate}%`);
    lines.push(`├─ diffusion_effective_rate: ${m.quality.diffusionEffectiveRate}%`);

    if (m.quality.potentialIssues && m.quality.potentialIssues.length > 0) {
        lines.push(`└─ potential_issues:`);
        m.quality.potentialIssues.forEach((issue, i) => {
            const prefix = i === m.quality.potentialIssues.length - 1 ? '   └─' : '   ├─';
            lines.push(`${prefix} ⚠ ${issue}`);
        });
    } else {
        lines.push(`└─ potential_issues: none`);
    }

    lines.push('');
    lines.push('════════════════════════════════════════');
    lines.push('');

    return lines.join('\n');
}

/**
 * 检测潜在问题
 * @param {object} metrics
 * @returns {string[]}
 */
export function detectIssues(metrics) {
    const issues = [];
    const m = metrics;

    // ─────────────────────────────────────────────────────────────────
    // 查询构建问题
    // ─────────────────────────────────────────────────────────────────

    if ((m.anchor.focusTerms || m.anchor.focusEntities || []).length === 0) {
        issues.push('No focus entities extracted - entity lexicon may be empty or messages too short');
    }

    // 权重极端退化检测
    const segWeights = m.query.segmentWeights || [];
    if (segWeights.length > 0) {
        const focusWeight = segWeights[segWeights.length - 1] || 0;
        if (focusWeight < 0.15) {
            issues.push(`Focus segment weight very low (${(focusWeight * 100).toFixed(0)}%) - focus message may be too short`);
        }
        const allLow = segWeights.every(w => w < 0.1);
        if (allLow) {
            issues.push('All segment weights below 10% - all messages may be extremely short');
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 锚点匹配问题
    // ─────────────────────────────────────────────────────────────────

    if ((m.anchor.matched || 0) === 0 && m.anchor.needRecall) {
        issues.push('No anchors matched - may need to generate anchors');
    }

    // ─────────────────────────────────────────────────────────────────
    // 词法检索问题
    // ─────────────────────────────────────────────────────────────────

    if ((m.lexical.terms || []).length > 0 && m.lexical.chunkHits === 0 && m.lexical.eventHits === 0) {
        issues.push('Lexical search returned zero hits - terms may not match any indexed content');
    }

    // ─────────────────────────────────────────────────────────────────
    // 融合问题（floor-level）
    // ─────────────────────────────────────────────────────────────────

    if (m.fusion.lexFloors === 0 && m.fusion.denseFloors > 0) {
        issues.push('No lexical floors in fusion - hybrid retrieval not contributing');
    }

    if (m.fusion.afterCap === 0) {
        issues.push('Fusion produced zero floor candidates - all retrieval paths may have failed');
    }

    // ─────────────────────────────────────────────────────────────────
    // 事件召回问题
    // ─────────────────────────────────────────────────────────────────

    if (m.event.considered > 0) {
        const denseSelected =
            (m.event.byRecallType?.direct || 0) +
            (m.event.byRecallType?.related || 0);

        const denseSelectRatio = denseSelected / m.event.considered;

        if (denseSelectRatio < 0.1) {
            issues.push(`Dense event selection ratio too low (${(denseSelectRatio * 100).toFixed(1)}%) - threshold may be too high`);
        }
        if (denseSelectRatio > 0.6 && m.event.considered > 10) {
            issues.push(`Dense event selection ratio high (${(denseSelectRatio * 100).toFixed(1)}%) - may include noise`);
        }
    }

    // 实体过滤问题
    if (m.event.entityFilter) {
        const ef = m.event.entityFilter;
        if (ef.filtered === 0 && ef.before > 10) {
            issues.push('No events filtered by entity - focus entities may be too broad or missing');
        }
        if (ef.before > 0 && ef.filtered > ef.before * 0.8) {
            issues.push(`Too many events filtered (${ef.filtered}/${ef.before}) - focus may be too narrow`);
        }
    }

    // 相似度问题
    if (m.event.similarityDistribution && m.event.similarityDistribution.min > 0 && m.event.similarityDistribution.min < 0.5) {
        issues.push(`Low similarity events included (min=${m.event.similarityDistribution.min})`);
    }

    // 因果链问题
    if (m.event.selected > 0 && m.event.causalCount === 0 && m.event.byRecallType.direct === 0) {
        issues.push('No direct or causal events - query may not align with stored events');
    }

    // ─────────────────────────────────────────────────────────────────
    // Floor Rerank 问题
    // ─────────────────────────────────────────────────────────────────

    if (m.evidence.rerankFailed) {
        issues.push('Rerank API failed — using fusion rank order as fallback, relevance scores are zero');
    }

    if (m.evidence.rerankApplied && !m.evidence.rerankFailed) {
        if (m.evidence.rerankScores) {
            const rs = m.evidence.rerankScores;
            if (rs.max < 0.3) {
                issues.push(`Low floor rerank scores (max=${rs.max}) - query-document domain mismatch`);
            }
            if (rs.mean < 0.2) {
                issues.push(`Very low average floor rerank score (mean=${rs.mean}) - context may be weak`);
            }
        }

        if (m.evidence.rerankTime > 3000) {
            issues.push(`Slow floor rerank (${m.evidence.rerankTime}ms) - may affect response time`);
        }

        if (m.evidence.rerankDocAvgLength > 3000) {
            issues.push(`Large rerank documents (avg ${m.evidence.rerankDocAvgLength} chars) - may reduce rerank precision`);
        }
    }

    // Rerank 保留率
    const retentionRate = m.evidence.floorCandidates > 0
        ? Math.round(m.evidence.floorsSelected / m.evidence.floorCandidates * 100)
        : 0;
    m.quality.rerankRetentionRate = retentionRate;

    if (m.evidence.floorCandidates > 0 && retentionRate < 25) {
        issues.push(`Low rerank retention rate (${retentionRate}%) - fusion ranking poorly aligned with reranker`);
    }

    // ─────────────────────────────────────────────────────────────────
    // L1 挂载问题
    // ─────────────────────────────────────────────────────────────────

    if (m.evidence.floorsSelected > 0 && m.evidence.l1Pulled === 0) {
        issues.push('Zero L1 chunks pulled - L1 vectors may not exist or DB read failed');
    }

    if (m.evidence.floorsSelected > 0 && m.evidence.l1Attached === 0 && m.evidence.l1Pulled > 0) {
        issues.push('L1 chunks pulled but none attached - cosine scores may be too low');
    }

    const l1AttachRate = m.quality.l1AttachRate || 0;
    if (m.evidence.floorsSelected > 3 && l1AttachRate < 50) {
        issues.push(`Low L1 attach rate (${l1AttachRate}%) - selected floors lack L1 chunks`);
    }

    // ─────────────────────────────────────────────────────────────────
    // 预算问题
    // ─────────────────────────────────────────────────────────────────

    if (m.budget.utilization > 90) {
        issues.push(`High budget utilization (${m.budget.utilization}%) - may be truncating content`);
    }

    // ─────────────────────────────────────────────────────────────────
    // 性能问题
    // ─────────────────────────────────────────────────────────────────

    if (m.timing.total > 8000) {
        issues.push(`Slow recall (${m.timing.total}ms) - consider optimization`);
    }

    if (m.query.buildTime > 100) {
        issues.push(`Slow query build (${m.query.buildTime}ms) - entity lexicon may be too large`);
    }

    if (m.evidence.l1CosineTime > 1000) {
        issues.push(`Slow L1 cosine scoring (${m.evidence.l1CosineTime}ms) - too many chunks pulled`);
    }

    // ─────────────────────────────────────────────────────────────────
    // Diffusion 问题
    // ─────────────────────────────────────────────────────────────────

    if (m.diffusion.graphEdges === 0 && m.diffusion.seedCount > 0) {
        issues.push('No diffusion graph edges - atoms may lack edges fields');
    }

    if (m.diffusion.pprActivated > 0 && m.diffusion.cosineGatePassed === 0) {
        issues.push('All PPR-activated nodes failed cosine gate - graph structure diverged from query semantics');
    }

    m.quality.diffusionEffectiveRate = m.diffusion.pprActivated > 0
        ? Math.round((m.diffusion.finalCount / m.diffusion.pprActivated) * 100)
        : 0;

    if (m.diffusion.cosineGateNoVector > 5) {
        issues.push(`${m.diffusion.cosineGateNoVector} PPR nodes missing vectors - L0 vectorization may be incomplete`);
    }

    if (m.diffusion.time > 50) {
        issues.push(`Slow diffusion (${m.diffusion.time}ms) - graph may be too dense`);
    }

    if (m.diffusion.pprActivated > 0 && (m.diffusion.postGatePassRate < 20 || m.diffusion.postGatePassRate > 60)) {
        issues.push(`Diffusion post-gate pass rate out of target (${m.diffusion.postGatePassRate}%)`);
    }

    return issues;
}
