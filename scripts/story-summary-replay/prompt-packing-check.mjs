import { EXT_ID } from '../../core/constants.js';
import { __setChatMetadata } from './shims/script.js';
import { getContext, __setReplayContext } from './shims/extensions.js';
import { getSummaryPanelConfig, applySummaryPanelConfigSnapshot } from '../../modules/story-summary/data/config.js';

// Exercise the final production prompt, with only the replay host boundary.
// Marker strings are fixture content, not assertions about source or wording.
export async function runPromptPackingChecks(buildVectorPrompt, createMetrics, originalStore) {
    const event = (id, summary, causedBy = []) => ({
        event: { id, title: id, summary, participants: ['角色'], causedBy, memoryRole: '具体经历' },
        _recallType: 'DIRECT',
        _evidenceEligible: true,
        similarity: 1,
    });
    const cause = (id, marker, size = 0, causedBy = []) => event(
        id, `${marker}${'甲'.repeat(size)} (#${Number(id.slice(4)) + 1})`, causedBy,
    );
    const build = async (events, causes = [], options = {}) => {
        const store = {
            lastSummarizedMesId: options.lastSummarizedMesId ?? 200,
            json: {
                events: [...events, ...causes].map(item => item.event),
                facts: options.facts || [],
                characters: { main: [] }, arcs: options.arcs || [], keywords: [], characterAliases: [],
            },
        };
        __setChatMetadata({ extensions: { [EXT_ID]: {
            storySummary: store,
            stateAtoms: options.stateAtoms || [],
        } } });
        return buildVectorPrompt(store, {
            events,
            eventTemporalFloors: [],
            l0Selected: options.l0Selected || [],
            l1ByFloor: options.l1ByFloor || new Map(),
            directEvidenceStatus: options.directEvidenceStatus || 'applied',
            directEvidenceL1: options.directEvidenceL1 || [],
        }, options.focusCharacters || ['角色'],
        { lastChunkFloor: options.lastChunkFloor ?? -1 }, createMetrics());
    };
    const evidence = text => [{ chunkId: 'raw', floor: 100, speaker: '角色', text }];
    const causeTrace = result => result.evidenceTrace.prompt.filter(item => item.source === 'causal');
    const anchor = (id, floor, size = 0, rerankScore = 1) => ({
        id: `anchor-${id}`, atomId: id, floor,
        atom: { atomId: id, floor, semantic: `角色 ${id} ${'丙'.repeat(size)}` }, rerankScore,
    });
    const chunk = (chunkId, floor, size = 0, isUser = false) => ({
        chunkId, floor, text: `${chunkId} ${'丁'.repeat(size)}`, isUser, speaker: '角色',
    });
    const budgetSnapshot = result => ({
        injection: result.injectionStats.budget,
        metrics: result.metrics.budget,
        eventEvidenceUsed: result.metrics.evidence.eventEvidenceBudgetUsed,
        eventEvidenceMax: result.metrics.evidence.eventEvidenceBudgetMax,
        distantEvidenceUsed: result.metrics.evidence.distantEvidenceBudgetUsed,
        distantEvidenceMax: result.metrics.evidence.distantEvidenceBudgetMax,
    });

    try {
        const originalPanel = getSummaryPanelConfig();
        const originalChat = getContext().chat;
        const visibility = [];
        try {
            __setReplayContext({ chat: Array.from({ length: 10 }, () => ({ is_user: false, mes: 'fixture' })) });
            for (const ui of [
                { hideSummarized: true, useVectorBoundary: true, keepVisibleCount: 2 },
                { hideSummarized: true, useVectorBoundary: false, keepVisibleCount: 2 },
                { hideSummarized: false, useVectorBoundary: true, keepVisibleCount: 2 },
                { hideSummarized: true, useVectorBoundary: true, keepVisibleCount: 0 },
                { hideSummarized: true, useVectorBoundary: true, keepVisibleCount: 50 },
            ]) {
                applySummaryPanelConfigSnapshot({ ...originalPanel, ui });
                const raw = [chunk('hidden-raw', 2), chunk('boundary-user', 6, 0, true), chunk('visible-ai', 7)];
                const options = { lastSummarizedMesId: 4, lastChunkFloor: 8,
                    directEvidenceL1: raw,
                    l0Selected: [anchor('owned-anchor', 7), anchor('distant-anchor', 3)],
                    l1ByFloor: new Map([[7, { userTop1: raw[1], aiTop1: raw[2] }],
                        [3, { userTop1: raw[0], aiTop1: raw[2] }]]) };
                const owners = [event('evt-7', 'VISIBILITY_OWNER (#8)')];
                const direct = await build(owners, [], options);
                const fallback = await build(owners, [], { ...options, directEvidenceStatus: 'failed', directEvidenceL1: [] });
                const noSummary = await build(owners, [], { ...options, lastSummarizedMesId: -1 });
                const present = result => raw.filter(c => result.promptText.includes(c.text.trim())).map(c => c.floor);
                visibility.push({ ui, direct: present(direct), fallback: present(fallback), noSummary: present(noSummary),
                    eventPreserved: direct.promptText.includes('VISIBILITY_OWNER'),
                    l0Preserved: direct.promptText.includes('owned-anchor') });
            }
        } finally {
            applySummaryPanelConfigSnapshot(originalPanel);
            __setReplayContext({ chat: originalChat });
        }
        const owner = event('evt-100', 'OWNER_BODY (#101)', ['evt-1']);
        const baseline = await build([owner]);
        const ordinary = await build([owner], [cause('evt-1', 'CAUSE_BODY')]);
        const forward = await build([owner], [cause('evt-1', 'FORWARD_CAUSE'),
            cause('evt-101', 'FOLLOWUP_EATEN', 0, ['evt-100']),
            cause('evt-102', 'FOLLOWUP_PLAN', 0, ['evt-101']),
            cause('evt-103', 'UNLINKED_OUTCOME')]);
        const oversized = await build([owner], [cause('evt-1', 'OVERSIZED_CAUSE', 5500)]);
        const full = await build([owner], [cause('evt-1', 'NO_ROOM_CAUSE', 200)], {
            directEvidenceL1: [...evidence(`RAW_KEPT ${'乙'.repeat(3820)}`),
                chunk('SMALL_FITTING_RAW', 100, 3500), chunk('EXTRA_FITTING_RAW', 100, 150)],
            lastSummarizedMesId: 200,
            l0Selected: [anchor('FULL_HISTORY', 50, 600)],
        });
        const mixed = await build([owner], [cause('evt-1', 'MIXED_CAUSE', 100)], {
            directEvidenceL1: evidence(`MIXED_RAW ${'乙'.repeat(100)}`),
            lastSummarizedMesId: 200,
            l0Selected: [anchor('MIXED_ANCHOR', 50, 100)],
        });

        const shared = await build([
            event('evt-100', 'SHARED_OWNER_A (#101)', ['evt-1', 'evt-1']),
            event('evt-200', 'SHARED_OWNER_B (#201)', ['evt-1']),
        ], [cause('evt-1', 'SHARED_CAUSE', 0, ['evt-2']), cause('evt-2', 'GRANDPARENT_NOT_EXPANDED')]);
        const recalledCause = event('evt-1', 'ALREADY_RECALLED_CAUSE (#11)');
        const reused = await build([owner, recalledCause]);
        const withoutEdge = await build([{ ...owner, event: { ...owner.event, causedBy: [] } }, recalledCause]);

        const fair = await build([
            event('evt-100', 'FAIR_OWNER_A (#101)', ['evt-1', 'evt-2']),
            event('evt-200', 'FAIR_OWNER_B (#201)', ['evt-3']),
        ], [cause('evt-1', 'FIRST_A', 175), cause('evt-2', 'SECOND_A', 175), cause('evt-3', 'FIRST_B', 175)], {
            directEvidenceL1: evidence(`FAIR_RAW ${'乙'.repeat(3490)}`),
        });
        const capped = await build(Array.from({ length: 6 }, (_, i) => event(
            `evt-${100 + i}`, `CAP_OWNER_${i} (#${101 + i})`, [`evt-${i * 2 + 1}`, `evt-${i * 2 + 2}`],
        )), Array.from({ length: 12 }, (_, i) => cause(`evt-${i + 1}`, `CAP_CAUSE_${i}_`, 220)));
        const cyclic = await build([
            event('evt-100', 'CYCLE_A (#101)', ['evt-100', 'evt-200', 'evt-999']),
            event('evt-200', 'CYCLE_B (#201)', ['evt-100']),
        ]);

        const facts = await build([event('evt-100', 'FACT_OWNER (#101)')], [], { facts: [
            { id: 'f-1', s: '角色', p: '状态', o: 'FIRST_FACT', since: 3 },
            { id: 'f-2', s: '角色', p: '经历', o: '甲'.repeat(2100), since: 2 },
            { id: 'f-3', s: '角色', p: '约定', o: 'LATER_FACT', since: 1 },
            { id: 'f-4', s: '世界', p: '规则', o: 'WORLD_FACT', since: 0 },
        ] });
        const events = await build([
            event('evt-100', '甲'.repeat(4700)),
            event('evt-200', '乙'.repeat(500)),
            event('evt-300', 'LATER_FITTING_EVENT'),
        ]);
        const droppedOwner = await build([
            event('evt-100', '甲'.repeat(5100)),
            event('evt-200', 'DROPPED_OWNER', ['evt-1']),
        ], [cause('evt-1', 'UNOWNED_CAUSE'), cause('evt-201', 'UNOWNED_CONSEQUENCE', 0, ['evt-200'])]);
        const related = await build([
            ...[1, 2, 3].map(i => ({
                ...event(`evt-${i}`, `RELATED_${i} ${'甲'.repeat(300)}`), _recallType: 'RELATED',
            })),
            event('evt-4', 'DIRECT_AFTER_RELATED'),
        ]);

        // Saturate every independent pool in one final prompt, including the
        // unchanged recent-memory path sourced from chat metadata.
        const allPoolsMarkers = ['POOL_EVENT', 'POOL_CAUSE', 'POOL_RAW', 'POOL_HISTORY', 'POOL_FACT', 'POOL_ARC', 'POOL_RECENT'];
        const allPools = await build([
            event('evt-100', `POOL_EVENT ${'甲'.repeat(4700)} (#101)`, ['evt-1']),
        ], [cause('evt-1', 'POOL_CAUSE', 300)], {
            directEvidenceL1: evidence(`POOL_RAW ${'乙'.repeat(3500)}`),
            lastSummarizedMesId: 200,
            lastChunkFloor: 201,
            l0Selected: [anchor('POOL_HISTORY', 50, 900)],
            facts: [{ id: 'f-pool', s: '角色', p: '状态', o: `POOL_FACT ${'戊'.repeat(1900)}`, since: 1 }],
            arcs: [{ name: '角色', trajectory: `POOL_ARC ${'己'.repeat(1400)}` }],
            stateAtoms: [{ atomId: 'recent-pool', floor: 201, semantic: `POOL_RECENT ${'庚'.repeat(1900)}` }],
        });

        const ownedRaw = chunk('OWNED_RAW', 59, 100, true);
        const history = await build([event('evt-59', 'HISTORY_OWNER (#60)')], [], {
            lastSummarizedMesId: 200,
            directEvidenceL1: [ownedRaw],
            l0Selected: [
                anchor('OWNED_ANCHOR', 59),
                anchor('OVERSIZED_GROUP', 30, 0, 7),
                anchor('HIGH_ANCHOR', 60, 150, 9),
                anchor('LOW_ANCHOR', 20, 400, 3),
                { id: 'anchor-edge', floor: 40, atom: { atomId: 'edge', semantic: `EDGE_MATCH ${'丙'.repeat(150)}`, edges: [{ s: '角色', t: '城镇' }] }, rerankScore: 8 },
                { id: 'anchor-unrelated', floor: 10, atom: { atomId: 'unrelated', semantic: 'OTHER_PERSON' }, rerankScore: 10 },
                anchor('UNSUMMARIZED_ANCHOR', 201, 0, 10),
                anchor('BOUNDARY_ANCHOR', 200, 50, 2),
                anchor('SAME_FLOOR_ANCHOR', 60, 50, 1),
            ],
            l1ByFloor: new Map([
                [30, { aiTop1: chunk('OVERSIZED_RAW', 30, 1100) }],
                [60, { userTop1: ownedRaw, aiTop1: chunk('HIGH_RAW', 60, 250) }],
                [40, { userTop1: chunk('PAIR_USER', 39, 40, true), aiTop1: chunk('PAIR_AI', 40, 40) }],
            ]),
        });
        // Eligibility is unused evidence, not "outside every event range".
        const unusedInEventRange = await build([
            { ...event('evt-70', 'NO_EVIDENCE_OWNER (#71)'), _evidenceEligible: false },
        ], [], { lastSummarizedMesId: 200, l0Selected: [anchor('UNUSED_IN_RANGE', 70)] });
        const noFocus = await build([], [], {
            lastSummarizedMesId: 200,
            focusCharacters: [],
            l0Selected: [{ id: 'anchor-no-focus', floor: 10, atom: { atomId: 'no-focus', semantic: 'NO_FOCUS_HISTORY' } }],
        });
        const empty = await build([]);
        const overlapping = await build([
            event('evt-100', 'OWNER_FIRST (#101)'), event('evt-101', 'OWNER_SECOND (#101)'),
        ], [], {
            l0Selected: [anchor('ANCHOR_FIRST', 100)],
            directEvidenceStatus: 'partial-vectors',
            directEvidenceL1: [chunk('RAW_SECOND', 100)],
        });
        const independentRaw = chunk('INDEPENDENT_RAW', 72, 500);
        const independent = await build([], [], {
            directEvidenceL1: [independentRaw, independentRaw],
            lastSummarizedMesId: 100,
            l0Selected: [anchor('INDEPENDENT_ANCHOR', 72)],
            l1ByFloor: new Map([[72, { aiTop1: independentRaw }]]),
        });
        const parentOverBudget = await build([
            event('evt-full', `${'甲'.repeat(5100)} (#1)`),
            event('evt-parent', 'UNSELECTED_L2 (#73)'),
        ], [], { directEvidenceL1: [independentRaw] });
        const protectedMix = await build([owner], [cause('evt-1', 'PROTECTED_CAUSE', 200)], {
            l0Selected: [anchor('PROTECTED_L0', 100, 750)],
            directEvidenceL1: Array.from({ length: 20 }, (_, i) => ({ ...chunk(`RAW_${i}`, 100, 250), ownerEventId: owner.event.id })),
        });

        // Actual retrieval IDs differ from metadata atom IDs. Exercise both
        // paths together; empty event lists model the unsummarized interval.
        let unsummarized;
        try {
            __setReplayContext({ chat: Array.from({ length: 30 }, (_, floor) => ({
                is_user: floor % 2 === 0, mes: 'fixture',
            })) });
            const ui = { hideSummarized: true, useVectorBoundary: true, keepVisibleCount: 5 };
            applySummaryPanelConfigSnapshot({ ...originalPanel, ui });
            const recalled = anchor('RECALLED_SCENE', 21, 120, 9);
            const fresh = anchor('FRESH_SCENE', 23, 120);
            const visible = anchor('VISIBLE_SCENE', 27, 120);
            const userRaw = chunk('SCENE_USER_DETAIL', 20, 40, true);
            const aiRaw = chunk('SCENE_AI_DETAIL', 21, 40);
            const options = { lastSummarizedMesId: 19, lastChunkFloor: 29,
                l0Selected: [recalled, visible], stateAtoms: [recalled.atom, fresh.atom, visible.atom],
                directEvidenceL1: [userRaw, aiRaw],
                l1ByFloor: new Map([[21, { userTop1: userRaw, aiTop1: aiRaw }]]) };
            const joined = await build([], [], options);
            const bySource = (result, source) => result.evidenceTrace.prompt
                .filter(item => item.source === source).map(item => item.floor).sort((a, b) => a - b);
            const copies = (result, markers) => markers.map(marker => result.promptText.split(marker).length - 1);
            const eligibility = [];
            for (const settings of [
                ui,
                { ...ui, useVectorBoundary: false },
                { ...ui, hideSummarized: false },
                { ...ui, keepVisibleCount: 50 },
            ]) {
                applySummaryPanelConfigSnapshot({ ...originalPanel, ui: settings });
                const result = await build([], [], { ...options, directEvidenceL1: [], l1ByFloor: new Map() });
                eligibility.push({ scene: result.promptText.includes('RECALLED_SCENE'),
                    visible: result.promptText.includes('VISIBLE_SCENE') });
            }
            applySummaryPanelConfigSnapshot({ ...originalPanel, ui });
            const later = anchor('NEXT_SCENE', 23, 120, 8);
            const longRaw = chunk('LONG_SCENE_DETAIL', 21, 2400);
            const anchorFirst = await build([], [], {
                lastSummarizedMesId: 19, lastChunkFloor: 29,
                l0Selected: [recalled, later], stateAtoms: [recalled.atom, later.atom],
                l1ByFloor: new Map([[21, { aiTop1: longRaw }]]),
            });

            // Fill the scattered pool with older relevant scenes. Recent
            // admission must skip those saved IDs, but still accept rejected ones.
            applySummaryPanelConfigSnapshot({ ...originalPanel, ui: { ...ui, keepVisibleCount: 0 } });
            const crowded = Array.from({ length: 5 }, (_, i) => anchor(`CROWDED_SCENE_${i}`, 21 + i * 2, 750, 10 - i));
            const overflow = await build([], [], {
                lastSummarizedMesId: 19, lastChunkFloor: 29,
                l0Selected: crowded, stateAtoms: crowded.map(item => item.atom),
            });
            unsummarized = {
                joined: { copies: copies(joined, ['RECALLED_SCENE', 'FRESH_SCENE', 'VISIBLE_SCENE', 'SCENE_USER_DETAIL', 'SCENE_AI_DETAIL']),
                    positions: ['RECALLED_SCENE', 'SCENE_USER_DETAIL', 'SCENE_AI_DETAIL', 'FRESH_SCENE'].map(marker => joined.promptText.indexOf(marker)),
                    scattered: bySource(joined, 'l0'), recent: bySource(joined, 'recent-l0'), budget: budgetSnapshot(joined),
                    eventCount: joined.injectionStats.event.selected },
                eligibility,
                anchorFirst: { copies: copies(anchorFirst, ['RECALLED_SCENE', 'NEXT_SCENE', 'LONG_SCENE_DETAIL']),
                    completeRaw: anchorFirst.promptText.includes(longRaw.text),
                    scattered: bySource(anchorFirst, 'l0'), recent: bySource(anchorFirst, 'recent-l0'), budget: budgetSnapshot(anchorFirst) },
                overflow: { copies: copies(overflow, crowded.map(item => item.atomId)),
                    scattered: bySource(overflow, 'l0'), recent: bySource(overflow, 'recent-l0'), budget: budgetSnapshot(overflow) },
            };
        } finally {
            applySummaryPanelConfigSnapshot(originalPanel);
            __setReplayContext({ chat: originalChat });
        }

        return {
            unsummarized,
            newEvidence: {
                overlapPositions: ['OWNER_FIRST', 'ANCHOR_FIRST', 'RAW_SECOND', 'OWNER_SECOND'].map(marker => overlapping.promptText.indexOf(marker)),
                overlapCopies: overlapping.promptText.split('RAW_SECOND').length - 1,
                independent: {
                    copies: independent.promptText.split('INDEPENDENT_RAW').length - 1,
                    eventCount: independent.injectionStats.event.selected,
                    admitted: independent.evidenceTrace.eventEvidence,
                    budget: budgetSnapshot(independent),
                    parentOverBudget: {
                        rendered: parentOverBudget.promptText.includes('INDEPENDENT_RAW'),
                        ownerRendered: parentOverBudget.promptText.includes('UNSELECTED_L2'),
                        admitted: parentOverBudget.evidenceTrace.eventEvidence,
                    },
                },
                protectedRendered: ['PROTECTED_L0', 'PROTECTED_CAUSE', 'RAW_0'].map(marker => protectedMix.promptText.includes(marker)),
                protectedTokens: protectedMix.metrics.evidence.l0ProtectedTokens,
                budget: budgetSnapshot(protectedMix),
            },
            visibility,
            charging: {
                baselineEventTokens: baseline.injectionStats.event.tokens,
                eventTokens: ordinary.injectionStats.event.tokens,
                causalTokens: ordinary.injectionStats.causalEvidence.tokens,
                evidenceTokens: ordinary.metrics.evidence.eventEvidenceBudgetUsed,
                breakdown: ordinary.metrics.budget.breakdown,
                causeRendered: ordinary.promptText.includes('CAUSE_BODY'),
                mixed: {
                    tokens: mixed.metrics.evidence.eventEvidenceBudgetUsed,
                    breakdown: mixed.metrics.budget.breakdown,
                    rendered: ['MIXED_RAW', 'MIXED_ANCHOR', 'MIXED_CAUSE'].map(marker => mixed.promptText.includes(marker)),
                },
                oversized: { ownerRendered: oversized.promptText.includes('OWNER_BODY'), links: oversized.injectionStats.causalEvidence.links, trace: causeTrace(oversized) },
                full: { rawRendered: full.promptText.includes('RAW_KEPT'), causeRendered: full.promptText.includes('NO_ROOM_CAUSE'), tokens: full.metrics.evidence.eventEvidenceBudgetUsed, trace: causeTrace(full) },
            },
            shared: {
                bodyCopies: shared.promptText.split('SHARED_CAUSE').length - 1,
                grandparentRendered: shared.promptText.includes('GRANDPARENT_NOT_EXPANDED'),
                stats: shared.injectionStats.causalEvidence,
                ownerUnits: causeTrace(shared).map(item => item.unitId),
                text: shared.promptText,
                references: shared.evidenceTrace.causalEvidence.filter(item => item.admitted),
            },
            reused: {
                bodyCopies: reused.promptText.split('ALREADY_RECALLED_CAUSE').length - 1,
                stats: reused.injectionStats.causalEvidence,
                eventTokens: reused.injectionStats.event.tokens,
                baselineEventTokens: withoutEdge.injectionStats.event.tokens,
                text: reused.promptText,
                references: reused.evidenceTrace.causalEvidence.filter(item => item.admitted),
            },
            forward: {
                rendered: ['FOLLOWUP_EATEN', 'FOLLOWUP_PLAN', 'UNLINKED_OUTCOME']
                    .map(marker => forward.promptText.includes(marker)),
                positions: ['FORWARD_CAUSE', 'FOLLOWUP_EATEN', 'FOLLOWUP_PLAN']
                    .map(marker => forward.promptText.indexOf(marker)),
                admitted: forward.evidenceTrace.causalEvidence.filter(item => item.admitted),
                selectedMainEvents: forward.injectionStats.event.selected,
                eventTokens: forward.injectionStats.event.tokens,
                baselineEventTokens: baseline.injectionStats.event.tokens,
                stats: forward.injectionStats.causalEvidence,
                evidenceTokens: forward.metrics.evidence.eventEvidenceBudgetUsed,
            },
            fair: {
                firstA: fair.promptText.includes('FIRST_A'),
                secondA: fair.promptText.includes('SECOND_A'),
                firstB: fair.promptText.includes('FIRST_B'),
                tokens: fair.metrics.evidence.eventEvidenceBudgetUsed,
            },
            capped: { stats: capped.injectionStats.causalEvidence, perOwnerLinks: causeTrace(capped).map(item => item.unitId) },
            cyclic: { stats: cyclic.injectionStats.causalEvidence },
            packing: {
                factsRendered: ['FIRST_FACT', 'LATER_FACT', 'WORLD_FACT'].map(marker => facts.promptText.includes(marker)),
                injectedFacts: facts.metrics.constraint.injected,
                laterEventRendered: events.promptText.includes('LATER_FITTING_EVENT'),
                boundaryEventRenderedWhole: events.promptText.includes('乙'.repeat(500)),
                boundaryFactRenderedWhole: facts.promptText.includes('甲'.repeat(2100)),
                relatedRendered: ['RELATED_1', 'RELATED_2', 'RELATED_3', 'DIRECT_AFTER_RELATED']
                    .map(marker => related.promptText.includes(marker)),
                droppedOwnerCauseRendered: droppedOwner.promptText.includes('UNOWNED_CAUSE'),
                droppedOwnerConsequenceRendered: droppedOwner.promptText.includes('UNOWNED_CONSEQUENCE'),
                droppedOwnerLinks: droppedOwner.injectionStats.causalEvidence.links,
            },
            independentPools: {
                full: {
                    historyRendered: full.promptText.includes('FULL_HISTORY'),
                    budget: budgetSnapshot(full),
                },
                allPools: {
                    rendered: allPoolsMarkers.map(marker => allPools.promptText.includes(marker)),
                    budget: budgetSnapshot(allPools),
                },
                history: {
                    rendered: Object.fromEntries([
                        'HIGH_ANCHOR', 'SAME_FLOOR_ANCHOR', 'HIGH_RAW', 'EDGE_MATCH', 'PAIR_USER', 'PAIR_AI', 'BOUNDARY_ANCHOR',
                        'OVERSIZED_GROUP', 'OVERSIZED_RAW', 'LOW_ANCHOR', 'OTHER_PERSON', 'UNSUMMARIZED_ANCHOR',
                    ].map(marker => [marker, history.promptText.includes(marker)])),
                    copies: ['OWNED_ANCHOR', 'OWNED_RAW'].map(marker => history.promptText.split(marker).length - 1),
                    positions: ['OVERSIZED_GROUP', 'EDGE_MATCH', 'HIGH_ANCHOR'].map(marker => history.promptText.indexOf(marker)),
                    units: history.injectionStats.distantEvidence.units,
                    dropped: history.metrics.evidence.distantEvidenceDroppedByBudget,
                    budget: budgetSnapshot(history),
                    unusedInEventRange: unusedInEventRange.injectionStats.distantEvidence.units,
                    noFocusRendered: noFocus.promptText.includes('NO_FOCUS_HISTORY'),
                },
                empty: { promptText: empty.promptText, budget: budgetSnapshot(empty) },
            },
        };
    } finally {
        __setChatMetadata({ extensions: { [EXT_ID]: { storySummary: originalStore } } });
    }
}
