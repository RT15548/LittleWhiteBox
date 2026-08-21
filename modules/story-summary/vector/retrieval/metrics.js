// Story Summary per-run recall diagnostics.
// Every collected field must have a runtime log, issue detector, or replay/gold consumer.

/**
 * 创建空的指标对象
 * @returns {object}
 */
export function createMetrics() {
    return {
        external: {
            failures: [],
        },

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
            matched: 0,
            floorsHit: 0,
        },

        // Lexical (MiniSearch) - 词法检索
        lexical: {
            terms: [],
            atomHits: 0,
            chunkHits: 0,
            eventHits: 0,
            searchTime: 0,
            indexReadyTime: 0,
            idfEnabled: false,
            idfDocCount: 0,
            topIdfTerms: [],
            termSearches: 0,
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
            byOwnership: null,
            similarityDistribution: { min: 0, max: 0, mean: 0, median: 0 },
            entityFilter: null,
            causalChainDepth: 0,
            causalCount: 0,
            entitiesUsed: 0,
            focusTermsCount: 0,
            entityNames: [],
            temporalFloorsProtected: 0,
            temporalProtected: 0,
            temporalDropped: 0,
            temporalWinners: 0,
            temporalProtectionCap: 0,
            temporalOverflow: 0,
            candidateVectorsMissing: 0,
            rerank: {
                status: '',
                sourceCandidates: 0,
                candidates: 0,
                tailCandidates: 0,
                exactTime: {
                    marker: '',
                    floors: 0,
                    candidates: 0,
                    winners: 0,
                    reserved: 0,
                    overflow: 0,
                    forced: 0,
                },
                batchTotal: 0,
                batchFailed: 0,
            },
            budgetTruncated: null,
        },

        // Evidence (Two-Stage: Floor rerank → L1 pull) - 原文证据
        evidence: {
            // Stage 1: Floor
            floorCandidates: 0,
            floorsSelected: 0,
            l0Collected: 0,
            mustKeepTermsCount: 0,
            mustKeepFloorsCount: 0,
            mustKeepFloors: [],
            droppedByRerankCount: 0,
            lexHitButNotSelected: 0,
            rerankApplied: false,
            rerankFailed: false,
            rerankBatchTotal: 0,
            rerankBatchFailed: 0,
            beforeRerank: 0,
            afterRerank: 0,
            rerankScores: null,
            rerankDocAvgLength: 0,

            // Stage 2: L1
            l1PrefetchAiFloors: 0,
            l1PrefetchWithContextFloors: 0,
            l1Pulled: 0,
            l1Attached: 0,
            l1CosineTime: 0,
            l1ChunkFetchTime: 0,
            l1VectorFetchTime: 0,
            l1DeserializeTime: 0,
            l1ScoreTime: 0,
            l1SortTime: 0,
            l1VectorHits: 0,
            l1MissingVectors: 0,
            l1ChunkCacheHits: 0,
            l1ChunkCacheMisses: 0,
            l1VectorCacheHits: 0,
            l1VectorCacheMisses: 0,
            l1CacheWarm: false,
            l1CacheFallbackDbTime: 0,

            // Selected DIRECT events → expanded and reranked L1 evidence
            directEvidenceStatus: '',
            directEvidenceParents: 0,
            directEvidenceFloors: 0,
            directEvidenceSourceCandidates: 0,
            directEvidenceCandidates: 0,
            directEvidenceRelevantItems: 0,
            directEvidenceTemporalCandidates: 0,
            directEvidenceTemporalFloorWinners: 0,
            directEvidenceTemporalProtectionCap: 0,
            directEvidenceTemporalProtectedCandidates: 0,
            directEvidenceTemporalForced: 0,
            directEvidenceTemporalOverflow: 0,
            directEvidenceTemporalSameFloorNonWinners: 0,
            directEvidenceVectorHits: 0,
            directEvidenceMissingVectors: 0,
            directEvidenceItems: 0,
            directEvidencePromptGroups: 0,
            directEvidencePromptItems: 0,
            directEvidencePromptTokens: 0,
            directEvidenceEnumerated: 0,
            directEvidenceAdmitted: 0,
            directEvidenceSkippedByBudget: 0,
            directEvidenceTemporalProtectedItems: 0,
            directEvidenceTemporalProtectedTokens: 0,
            directEvidenceTemporalProtectionBudgetMax: 0,
            summarizedBudgetUsedByDirectEvidence: 0,
            summarizedBudgetUsedFinal: 0,
            summarizedBudgetMax: 0,
            distantEvidenceStarved: false,
            distantEvidenceStarvedByTemporalProtection: false,
            distantEvidenceDroppedByBudget: 0,
            directEvidenceRerankBatchTotal: 0,
            directEvidenceRerankBatchFailed: 0,

            // 装配
            contextPairsAdded: 0,
            tokens: 0,
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
            indexTime: 0,
            buildTime: 0,
            seedVectorTime: 0,
            normalizeTime: 0,
            pprTime: 0,
            vectorMapTime: 0,
            postVerifyTime: 0,
            time: 0,
        },

        // Formatting - 格式化
        formatting: {
            sectionsIncluded: [],
        },

        // Budget Summary - 预算
        budget: {
            total: 0,
            limit: 0,
            utilization: 0,
            breakdown: {
                constraints: 0,
                events: 0,
                directEvidence: 0,
                distantEvidence: 0,
                recentEvidence: 0,
                arcs: 0,
            },
        },

        // Timing - 计时（仅包含实际写入的字段）
        timing: {
            runtimeBeginSession: 0,
            runtimeLoadFromDB: 0,
            runtimeBuildEntry: 0,
            runtimeScoreAnchors: 0,
            runtimeScoreEvents: 0,
            runtimeGetEventVectors: 0,
            runtimeScoreL1: 0,
            runtimeDiffuseL0: 0,
            runtimeEndSession: 0,
            round1Embed: 0,
            round1EmbedRetryWait: 0,
            round1AnchorSearch: 0,
            round1EventRetrieval: 0,
            round2Embed: 0,
            anchorSearch: 0,
            constraintFilter: 0,
            eventRetrieval: 0,
            eventRerank: 0,
            evidenceRetrieval: 0,
            evidenceRerank: 0,
            directEvidenceVectorScore: 0,
            directEvidenceRerank: 0,
            directEvidenceRetrieval: 0,
            evidenceAssembly: 0,
            diffusion: 0,
            formatting: 0,
            externalTotal: 0,
            localKnownTotal: 0,
            unattributed: 0,
            total: 0,
        },

        // Quality Indicators - 质量指标
        quality: {
            constraintCoverage: 100,
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
    lines.push('          Recall Metrics Report         ');
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
        lines.push(`├─ focus_terms: [${(m.anchor.focusTerms || []).join(', ')}]`);
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
    lines.push(`├─ idf_enabled: ${!!m.lexical.idfEnabled}`);
    if (m.lexical.idfDocCount > 0) {
        lines.push(`├─ idf_doc_count: ${m.lexical.idfDocCount}`);
    }
    if ((m.lexical.topIdfTerms || []).length > 0) {
        const topIdfText = m.lexical.topIdfTerms
            .slice(0, 5)
            .map(x => `${x.term}:${x.idf}`)
            .join(', ');
        lines.push(`├─ top_idf_terms: [${topIdfText}]`);
    }
    if (m.lexical.termSearches > 0) {
        lines.push(`├─ term_searches: ${m.lexical.termSearches}`);
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

    // Fusion Guard (must-keep lexical floors)
    lines.push('[Fusion Guard] Lexical Must-Keep');
    lines.push(`├─ must_keep_terms: ${m.evidence.mustKeepTermsCount || 0}`);
    lines.push(`├─ must_keep_floors: ${m.evidence.mustKeepFloorsCount || 0}`);
    if ((m.evidence.mustKeepFloors || []).length > 0) {
        lines.push(`│   └─ floors: [${m.evidence.mustKeepFloors.slice(0, 10).join(', ')}]`);
    }
    if ((m.evidence.lexHitButNotSelected || 0) > 0) {
        lines.push(`└─ lex_hit_but_not_selected: ${m.evidence.lexHitButNotSelected}`);
    } else {
        lines.push(`└─ lex_hit_but_not_selected: 0`);
    }
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
    if ((m.event.candidateVectorsMissing || 0) > 0) {
        lines.push(`├─ candidate_vectors_missing: ${m.event.candidateVectorsMissing}`);
    }

    if (m.event.entityFilter) {
        const ef = m.event.entityFilter;
        lines.push(`├─ entity_filter:`);
        lines.push(`│   ├─ focus_characters: [${(ef.focusCharacters || []).join(', ')}]`);
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

    if (m.event.rerank.status) {
        const rerank = m.event.rerank;
        const exactTime = rerank.exactTime;
        lines.push(`├─ event_rerank: ${rerank.status}`);
        lines.push(`│   ├─ candidates: ${rerank.candidates || 0}/${rerank.sourceCandidates || 0}`);
        lines.push(`│   ├─ tail: ${rerank.tailCandidates || 0}`);
        if (exactTime.marker) {
            lines.push(`│   ├─ exact_time: ${exactTime.marker}, floors=${exactTime.floors || 0}, candidates=${exactTime.candidates || 0}, winners=${exactTime.winners || 0}, reserved=${exactTime.reserved || 0}, forced=${exactTime.forced || 0}, overflow=${exactTime.overflow || 0}`);
        }
        lines.push(`│   └─ batches: ${rerank.batchTotal || 0}, failed=${rerank.batchFailed || 0}`);
    }

    lines.push(`├─ causal_chain: depth=${m.event.causalChainDepth}, count=${m.event.causalCount}`);
    if (m.event.byOwnership) {
        const bo = m.event.byOwnership;
        lines.push(`├─ by_ownership: focus=${bo.focus || 0}, other=${bo.other || 0}, unknown=${bo.unknown || 0}`);
    }
    if (m.event.budgetTruncated) {
        const bt = m.event.budgetTruncated;
        lines.push(`├─ budget_truncation: selected=${bt.selected}/${bt.candidates}, dropped=${bt.dropped}, event_budget=${bt.budgetRejected || 0}, related_budget=${bt.relatedBudgetRejected || 0}`);
    }
    if ((m.event.temporalFloorsProtected || 0) > 0) {
        lines.push(`├─ temporal_protection: floors=${m.event.temporalFloorsProtected}, winners=${m.event.temporalWinners || 0}, protected=${m.event.temporalProtected || 0}, overflow=${m.event.temporalOverflow || 0}, dropped=${m.event.temporalDropped || 0}, cap=${m.event.temporalProtectionCap || 0}`);
    }
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
        lines.push(`│   │   ├─ batches: ${m.evidence.rerankBatchTotal || 0}, failed=${m.evidence.rerankBatchFailed || 0}`);
        lines.push(`│   │   └─ time: ${m.timing.evidenceRerank || 0}ms`);
        if ((m.evidence.droppedByRerankCount || 0) > 0) {
            lines.push(`│   ├─ dropped_normal: ${m.evidence.droppedByRerankCount}`);
        }
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
    lines.push(`│   ├─ prefetched_ai_floors: ${m.evidence.l1PrefetchAiFloors}`);
    lines.push(`│   ├─ prefetched_total_floors: ${m.evidence.l1PrefetchWithContextFloors}`);
    lines.push(`│   ├─ pulled: ${m.evidence.l1Pulled}`);
    lines.push(`│   ├─ vector_hits: ${m.evidence.l1VectorHits}`);
    if ((m.evidence.l1MissingVectors || 0) > 0) {
        lines.push(`│   ├─ missing_vectors: ${m.evidence.l1MissingVectors}`);
    }
    lines.push(`│   ├─ attached: ${m.evidence.l1Attached}`);
    lines.push(`│   ├─ cosine_time: ${m.evidence.l1CosineTime}ms`);
    lines.push(`│   ├─ cache: warm=${!!m.evidence.l1CacheWarm}, chunk=${m.evidence.l1ChunkCacheHits || 0}/${m.evidence.l1ChunkCacheMisses || 0}, vector=${m.evidence.l1VectorCacheHits || 0}/${m.evidence.l1VectorCacheMisses || 0}`);
    lines.push(`│   ├─ fallback_db_time: ${m.evidence.l1CacheFallbackDbTime || 0}ms`);
    lines.push(`│   └─ breakdown: chunk_db=${m.evidence.l1ChunkFetchTime}ms, vector_db=${m.evidence.l1VectorFetchTime}ms, deserialize=${m.evidence.l1DeserializeTime}ms, score=${m.evidence.l1ScoreTime}ms, sort=${m.evidence.l1SortTime}ms`);
    if (m.evidence.directEvidenceStatus) {
        lines.push(`├─ DIRECT evidence: ${m.evidence.directEvidenceStatus}`);
        lines.push(`│   ├─ parents/floors: ${m.evidence.directEvidenceParents || 0}/${m.evidence.directEvidenceFloors || 0}`);
        lines.push(`│   ├─ candidates: ${m.evidence.directEvidenceSourceCandidates || 0} → ${m.evidence.directEvidenceCandidates || 0} → relevant=${m.evidence.directEvidenceRelevantItems || 0}`);
        lines.push(`│   ├─ enumerated/admitted: ${m.evidence.directEvidenceEnumerated || 0}/${m.evidence.directEvidenceAdmitted || 0}, skipped_by_budget=${m.evidence.directEvidenceSkippedByBudget || 0}`);
        if ((m.evidence.directEvidenceTemporalProtectedItems || 0) > 0) {
            lines.push(`│   ├─ temporal_protected_in_prompt: items=${m.evidence.directEvidenceTemporalProtectedItems}, tokens=${m.evidence.directEvidenceTemporalProtectedTokens || 0}`);
        }
        lines.push(`│   ├─ rerank_batches: ${m.evidence.directEvidenceRerankBatchTotal || 0}, failed=${m.evidence.directEvidenceRerankBatchFailed || 0}`);
        lines.push(`│   ├─ vector_coverage: hits=${m.evidence.directEvidenceVectorHits || 0}, missing=${m.evidence.directEvidenceMissingVectors || 0}`);
        lines.push(`│   ├─ temporal_candidate_protection: candidates=${m.evidence.directEvidenceTemporalCandidates || 0}, floor_winners=${m.evidence.directEvidenceTemporalFloorWinners || 0}, protected=${m.evidence.directEvidenceTemporalProtectedCandidates || 0}, forced=${m.evidence.directEvidenceTemporalForced || 0}, overflow=${m.evidence.directEvidenceTemporalOverflow || 0}, same_floor_non_winners=${m.evidence.directEvidenceTemporalSameFloorNonWinners || 0}, cap=${m.evidence.directEvidenceTemporalProtectionCap || 0}`);
        lines.push(`│   ├─ ranked/prompt: ${m.evidence.directEvidenceItems || 0}/${m.evidence.directEvidencePromptItems || 0} in ${m.evidence.directEvidencePromptGroups || 0} groups`);
        lines.push(`│   ├─ prompt_tokens: ${m.evidence.directEvidencePromptTokens || 0}`);
        lines.push(`│   └─ summarized_budget: direct=${m.evidence.summarizedBudgetUsedByDirectEvidence || 0}, final=${m.evidence.summarizedBudgetUsedFinal || 0}/${m.evidence.summarizedBudgetMax || 0}, distant_dropped=${m.evidence.distantEvidenceDroppedByBudget || 0}${m.evidence.distantEvidenceStarved ? ' ⚠ distant starved' : ''}${m.evidence.distantEvidenceStarvedByTemporalProtection ? ' (temporal protection)' : ''}`);
    }
    lines.push(`├─ tokens: ${m.evidence.tokens}`);
    lines.push(`└─ assembly_time: ${m.timing.evidenceAssembly || 0}ms`);
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
    lines.push(`├─ breakdown: index=${m.diffusion.indexTime || 0}ms, graph=${m.diffusion.buildTime || 0}ms, seed=${m.diffusion.seedVectorTime || 0}ms, normalize=${m.diffusion.normalizeTime || 0}ms, ppr=${m.diffusion.pprTime || 0}ms, vector_map=${m.diffusion.vectorMapTime || 0}ms, post=${m.diffusion.postVerifyTime || 0}ms`);
    lines.push(`└─ time: ${m.diffusion.time}ms`);
    lines.push('');

    // Formatting
    lines.push('[Formatting] 格式化');
    lines.push(`├─ sections: [${(m.formatting.sectionsIncluded || []).join(', ')}]`);
    lines.push(`└─ time: ${m.timing.formatting || 0}ms`);
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
    lines.push(`    ├─ direct_evidence: ${bd.directEvidence || 0}`);
    lines.push(`    ├─ distant_evidence: ${bd.distantEvidence || 0}`);
    lines.push(`    ├─ recent_evidence: ${bd.recentEvidence || 0}`);
    lines.push(`    └─ arcs: ${bd.arcs || 0}`);
    lines.push('');

    // Timing
    lines.push('[Timing] 计时');
    lines.push(`├─ query_build: ${m.query.buildTime}ms`);
    lines.push(`├─ query_refine: ${m.query.refineTime}ms`);
    lines.push(`├─ round1_embed: ${m.timing.round1Embed || 0}ms`);
    if ((m.timing.round1EmbedRetryWait || 0) > 0) {
        lines.push(`│   └─ retry_wait: ${m.timing.round1EmbedRetryWait}ms`);
    }
    lines.push(`├─ round1_anchor_search: ${m.timing.round1AnchorSearch || 0}ms`);
    lines.push(`├─ round1_event_retrieval: ${m.timing.round1EventRetrieval || 0}ms`);
    lines.push(`├─ round2_embed: ${m.timing.round2Embed || 0}ms`);
    lines.push(`├─ runtime_begin_session: ${m.timing.runtimeBeginSession || 0}ms`);
    lines.push(`│   ├─ runtime_load_db: ${m.timing.runtimeLoadFromDB || 0}ms`);
    lines.push(`│   └─ runtime_build_entry: ${m.timing.runtimeBuildEntry || 0}ms`);
    lines.push(`├─ anchor_search: ${m.timing.anchorSearch}ms`);
    lines.push(`│   └─ runtime_score_anchors: ${m.timing.runtimeScoreAnchors || 0}ms`);
    const lexicalTotal = (m.lexical.searchTime || 0) + (m.lexical.indexReadyTime || 0);
    lines.push(`├─ lexical_search: ${lexicalTotal}ms (query=${m.lexical.searchTime || 0}ms, index_ready=${m.lexical.indexReadyTime || 0}ms)`);
    lines.push(`├─ fusion: ${m.fusion.time}ms`);
    lines.push(`├─ constraint_filter: ${m.timing.constraintFilter}ms`);
    lines.push(`├─ event_retrieval: ${m.timing.eventRetrieval}ms`);
    lines.push(`│   ├─ runtime_score_events: ${m.timing.runtimeScoreEvents || 0}ms`);
    lines.push(`│   └─ runtime_get_event_vectors: ${m.timing.runtimeGetEventVectors || 0}ms`);
    lines.push(`├─ evidence_retrieval: ${m.timing.evidenceRetrieval}ms`);
    lines.push(`├─ floor_rerank: ${m.timing.evidenceRerank || 0}ms`);
    if (m.event.rerank.status) {
        lines.push(`├─ event_rerank: ${m.timing.eventRerank || 0}ms`);
    }
    if (m.evidence.directEvidenceStatus) {
        lines.push(`├─ direct_evidence_retrieval: ${m.timing.directEvidenceRetrieval || 0}ms`);
        lines.push(`│   ├─ vector_score: ${m.timing.directEvidenceVectorScore || 0}ms`);
        lines.push(`│   └─ rerank: ${m.timing.directEvidenceRerank || 0}ms`);
    }
    lines.push(`├─ l1_cosine: ${m.evidence.l1CosineTime}ms`);
    lines.push(`│   ├─ l1_chunk_db: ${m.evidence.l1ChunkFetchTime}ms`);
    lines.push(`│   ├─ l1_vector_db: ${m.evidence.l1VectorFetchTime}ms`);
    lines.push(`│   ├─ l1_cache: warm=${!!m.evidence.l1CacheWarm}, chunk=${m.evidence.l1ChunkCacheHits || 0}/${m.evidence.l1ChunkCacheMisses || 0}, vector=${m.evidence.l1VectorCacheHits || 0}/${m.evidence.l1VectorCacheMisses || 0}`);
    lines.push(`│   ├─ l1_cache_fallback_db: ${m.evidence.l1CacheFallbackDbTime || 0}ms`);
    lines.push(`│   ├─ l1_deserialize: ${m.evidence.l1DeserializeTime}ms`);
    lines.push(`│   ├─ l1_score: ${m.evidence.l1ScoreTime}ms`);
    lines.push(`│   ├─ l1_sort: ${m.evidence.l1SortTime}ms`);
    lines.push(`│   └─ runtime_score_l1: ${m.timing.runtimeScoreL1 || 0}ms`);
    lines.push(`├─ diffusion: ${m.timing.diffusion}ms`);
    lines.push(`│   ├─ graph_build: ${m.diffusion.buildTime || 0}ms`);
    lines.push(`│   ├─ ppr: ${m.diffusion.pprTime || 0}ms`);
    lines.push(`│   ├─ post_verify: ${m.diffusion.postVerifyTime || 0}ms`);
    lines.push(`│   ├─ vector_map: ${m.diffusion.vectorMapTime || 0}ms`);
    lines.push(`│   └─ runtime_diffuse_l0: ${m.timing.runtimeDiffuseL0 || 0}ms`);
    lines.push(`├─ evidence_assembly: ${m.timing.evidenceAssembly}ms`);
    lines.push(`├─ formatting: ${m.timing.formatting}ms`);
    lines.push(`├─ external_total: ${m.timing.externalTotal || 0}ms (embed+rerank)`);
    lines.push(`├─ local_known_total: ${m.timing.localKnownTotal || 0}ms`);
    lines.push(`├─ unattributed: ${m.timing.unattributed || 0}ms`);
    lines.push(`├─ runtime_end_session: ${m.timing.runtimeEndSession || 0}ms`);
    lines.push(`└─ total: ${m.timing.total}ms`);
    lines.push('');

    // Quality Indicators
    lines.push('[Quality] 质量指标');
    lines.push(`├─ constraint_coverage: ${m.quality.constraintCoverage}%`);
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

    if ((m.anchor.focusTerms || []).length === 0) {
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

        if ((m.timing.evidenceRerank || 0) > 3000) {
            issues.push(`Slow floor rerank (${m.timing.evidenceRerank}ms) - may affect response time`);
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

    if (m.evidence.distantEvidenceStarved) {
        issues.push(m.evidence.distantEvidenceStarvedByTemporalProtection
            ? 'Distant evidence starved - protected temporal DIRECT evidence consumed the summarized budget'
            : 'Distant evidence starved - DIRECT evidence consumed the summarized budget');
    }

    if ((m.event.temporalDropped || 0) > 0) {
        issues.push(`${m.event.temporalDropped} temporal event(s) still dropped - single event may exceed the event budget`);
    }

    if ((m.evidence.directEvidenceSkippedByBudget || 0) > 0
        && (m.evidence.directEvidenceEnumerated || 0) > 0
        && (m.evidence.directEvidenceAdmitted || 0) / m.evidence.directEvidenceEnumerated < 0.5) {
        issues.push(`Most DIRECT evidence skipped by budget (${m.evidence.directEvidenceSkippedByBudget}/${m.evidence.directEvidenceEnumerated}) - candidate face may be too wide`);
    }

    if ((m.event.budgetTruncated?.dropped || 0) > 0 && m.budget.utilization > 90) {
        issues.push(`Event packing truncated ${m.event.budgetTruncated.dropped} candidate(s) at budget limit`);
    }

    // ─────────────────────────────────────────────────────────────────
    // 性能问题
    // ─────────────────────────────────────────────────────────────────

    if (m.timing.total > 8000) {
        issues.push(`Slow recall (${m.timing.total}ms) - consider optimization`);
    }

    if ((m.timing.localKnownTotal || 0) > 1000) {
        issues.push(`Local recall work spike (${m.timing.localKnownTotal}ms) - inspect lexical/L1/diffusion breakdown`);
    }

    if ((m.timing.externalTotal || 0) > 5000) {
        issues.push(`External recall requests slow (${m.timing.externalTotal}ms) - inspect embed/rerank timings`);
    }

    if ((m.timing.unattributed || 0) > 500) {
        issues.push(`Unattributed recall time high (${m.timing.unattributed}ms) - add more timing probes around new work`);
    }

    if (m.query.buildTime > 100) {
        issues.push(`Slow query build (${m.query.buildTime}ms) - entity lexicon may be too large`);
    }

    if (m.evidence.l1CosineTime > 1000) {
        const dominantStage = [
            ['chunk DB', m.evidence.l1ChunkFetchTime || 0],
            ['vector DB', m.evidence.l1VectorFetchTime || 0],
            ['deserialize', m.evidence.l1DeserializeTime || 0],
            ['score', m.evidence.l1ScoreTime || 0],
            ['sort', m.evidence.l1SortTime || 0],
        ].sort((a, b) => b[1] - a[1])[0];
        issues.push(`Slow L1 scoring (${m.evidence.l1CosineTime}ms) - dominant stage: ${dominantStage[0]} ${dominantStage[1]}ms`);
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
