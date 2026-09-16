import { EXT_ID } from '../../core/constants.js';
import { __setChatMetadata } from './shims/script.js';

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
            lastSummarizedMesId: options.lastSummarizedMesId ?? -1,
            json: {
                events: events.map(item => item.event),
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
        }, new Map(causes.map(item => [item.event.id, item])), options.focusCharacters || ['角色'],
        { lastChunkFloor: options.lastChunkFloor ?? -1 }, createMetrics());
    };
    const evidence = text => [{ chunkId: 'raw', floor: 100, speaker: '角色', text }];
    const causeTrace = result => result.evidenceTrace.prompt.filter(item => item.source === 'causal');
    const anchor = (id, floor, size = 0, rerankScore = 1) => ({
        id, floor, atom: { semantic: `角色 ${id} ${'丙'.repeat(size)}` }, rerankScore,
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
        const owner = event('evt-100', 'OWNER_BODY (#101)', ['evt-1']);
        const baseline = await build([owner]);
        const ordinary = await build([owner], [cause('evt-1', 'CAUSE_BODY')]);
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
            l0Selected: [{ id: 'distant-anchor', floor: 50, atom: { semantic: `角色 MIXED_ANCHOR ${'丙'.repeat(100)}` }, rerankScore: 1 }],
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
            event('evt-100', '甲'.repeat(5100), ['evt-1']),
            event('evt-200', 'KEPT_OWNER'),
        ], [cause('evt-1', 'UNOWNED_CAUSE')]);

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
                anchor('OVERSIZED_GROUP', 30, 0, 10),
                anchor('HIGH_ANCHOR', 60, 150, 9),
                anchor('LOW_ANCHOR', 20, 400, 3),
                { id: 'edge', floor: 40, atom: { semantic: `EDGE_MATCH ${'丙'.repeat(150)}`, edges: [{ s: '角色', t: '城镇' }] }, rerankScore: 8 },
                { id: 'unrelated', floor: 10, atom: { semantic: 'OTHER_PERSON' }, rerankScore: 10 },
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
            l0Selected: [{ id: 'no-focus', floor: 10, atom: { semantic: 'NO_FOCUS_HISTORY' } }],
        });
        const empty = await build([]);
        const overlapping = await build([
            event('evt-100', 'OWNER_FIRST (#101)'), event('evt-101', 'OWNER_SECOND (#101)'),
        ], [], {
            l0Selected: [anchor('ANCHOR_FIRST', 100)],
            directEvidenceStatus: 'partial-vectors',
            directEvidenceL1: [{ ...chunk('RAW_SECOND', 100), ownerEventId: 'evt-101' }],
        });
        const protectedMix = await build([owner], [cause('evt-1', 'PROTECTED_CAUSE', 200)], {
            l0Selected: [anchor('PROTECTED_L0', 100, 750)],
            directEvidenceL1: Array.from({ length: 20 }, (_, i) => ({ ...chunk(`RAW_${i}`, 100, 250), ownerEventId: owner.event.id })),
        });

        return {
            newEvidence: {
                overlapPositions: ['OWNER_FIRST', 'ANCHOR_FIRST', 'OWNER_SECOND', 'RAW_SECOND'].map(marker => overlapping.promptText.indexOf(marker)),
                overlapCopies: overlapping.promptText.split('RAW_SECOND').length - 1,
                protectedRendered: ['PROTECTED_L0', 'PROTECTED_CAUSE', 'RAW_0'].map(marker => protectedMix.promptText.includes(marker)),
                protectedTokens: protectedMix.metrics.evidence.l0ProtectedTokens,
                budget: budgetSnapshot(protectedMix),
            },
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
            },
            reused: {
                bodyCopies: reused.promptText.split('ALREADY_RECALLED_CAUSE').length - 1,
                stats: reused.injectionStats.causalEvidence,
                eventTokens: reused.injectionStats.event.tokens,
                baselineEventTokens: withoutEdge.injectionStats.event.tokens,
                text: reused.promptText,
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
                droppedOwnerCauseRendered: droppedOwner.promptText.includes('UNOWNED_CAUSE'),
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
                    positions: ['EDGE_MATCH', 'HIGH_ANCHOR', 'BOUNDARY_ANCHOR'].map(marker => history.promptText.indexOf(marker)),
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
