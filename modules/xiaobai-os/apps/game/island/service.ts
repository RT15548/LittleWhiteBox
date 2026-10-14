import type { PartitionStore, XiaobaiOsFileControls } from '../../../kernel/contracts.js';
import { ISLAND_FORMAT_VERSION, type IslandData, type Journey, type Operation, type PersonId } from './model.js';
import { sha256 } from 'js-sha256';
import { LANDSCAPE, RULES } from './content.js';
import { emptyIsland, isEnded, newJourney } from './world.js';
import { ISLAND_PARTITION } from './partition.js';
import { fail } from './fault.js';
import { identifier, integer, parseOperation, person, text } from './validation.js';
import { observe, openScene } from './scene.js';
import { operate } from './operations.js';
import { advance, awaitingDecision, type AdvanceResult } from './clock.js';
import { createSceneWork } from './scene-work.js';
import { browse } from './memory.js';
import { knownExperiences } from './experience.js';
import { experienceView } from './cooperation.js';
import { createIntentWork, type IntentClarification, type PlayerIntent } from './intent-work.js';

export interface RequestIdentity { id: string; revision: number }
type SceneWork = ReturnType<typeof createSceneWork>;

export function createIslandService(store: PartitionStore<IslandData>, files: XiaobaiOsFileControls) {
    let running = false;
    let step: AdvanceResult['stop'] | null = null;
    let intent: PlayerIntent | null = null;
    const current = () => store.peekCurrent()?.value ?? emptyIsland();
    function view() {
        const data = current(), world = data.active;
        return { revision: data.revision, phase: !world ? 'unstarted' as const : isEnded(world) ? 'ended' as const : 'living' as const,
            journey: world?.id ?? null, lastRequest: data.last?.id ?? null, player: world ? observe(world, 'player', LANDSCAPE) : null,
            scene: world && !isEnded(world) ? openScene(world, 'player', LANDSCAPE).mode : null,
            needsDecision: !!world && !isEnded(world) && awaitingDecision(world).length > 0,
            recent: world ? knownExperiences(world, ['player']).slice(-60).map(e => experienceView(world, e)) : [], step,
            intent: intent?.revision === data.revision ? structuredClone(intent) : null,
            busy: running, pending: files.hasPendingCommit(ISLAND_PARTITION.key), writeState: files.getFileState() };
    }
    async function execute(request: RequestIdentity, input: string, guard: () => boolean,
        build: (world: Journey | null) => Journey | Promise<Journey>) {
        identifier(request.id); integer(request.revision);
        const fingerprint = sha256(input);
        if (running || files.hasPendingCommit()) { fail('busy'); }
        if (!guard()) { fail('stale'); }
        running = true;
        try {
            await store.read();
            const base = current();
            if (base.last?.id === request.id) { if (base.last.fingerprint !== fingerprint) { fail('identity'); } return; }
            if (base.revision !== request.revision || !guard()) { fail('stale'); }
            // A failed save retains this exact completed candidate inside existing file transactions.
            const world = await build(base.active ? structuredClone(base.active) : null);
            if (!guard()) { fail('stale'); }
            let accepted = false;
            const result = await store.transact(transaction => {
                if (!guard()) { fail('stale'); }
                const data = transaction.currentOrInitial();
                if (data.revision !== base.revision || data.active?.id !== base.active?.id) { fail('stale'); }
                transaction.replace({ formatVersion: ISLAND_FORMAT_VERSION, revision: data.revision + 1, active: world, last: { id: request.id, fingerprint } });
                accepted = true;
            }, { retainFailedCandidate: true, commitGuard: () => accepted || guard() });
            if (result.status === 'failed' || result.status === 'unconfirmed' || result.status === 'conflict') { fail(`save_${result.status}`); }
        } finally { running = false; }
    }
    function requireWorld(world: Journey | null): Journey { if (!world) { fail('missing'); } return world; }
    return {
        view,
        async refresh() { await store.read(); return view(); },
        async start(request: RequestIdentity, mode: 'start' | 'restart', guard: () => boolean) {
            if (mode !== 'start' && mode !== 'restart') { fail('invalid'); }
            await execute(request, JSON.stringify({ kind: mode }), guard, world => {
                if (mode === 'start' ? !!world : !world) { fail('unavailable'); }
                return newJourney(request.id);
            });
            step = null;
            return view();
        },
        async player(request: RequestIdentity, raw: Operation, guard: () => boolean) {
            const operation = parseOperation(raw);
            await execute(request, JSON.stringify({ kind: 'player', operation }), guard,
                world => operate(requireWorld(world), { kind: 'player' }, 'player', operation, LANDSCAPE));
            return view();
        },
        async interpret(request: RequestIdentity, input: string, run: (work: ReturnType<typeof createIntentWork>, input: string, clarifications: IntentClarification[]) => Promise<void>, guard: () => boolean) {
            identifier(request.id); integer(request.revision); input = text(input, RULES.maxSpeechCharacters);
            if (running || files.hasPendingCommit()) { fail('busy'); }
            if (!guard()) { fail('stale'); }
            running = true;
            try {
                await store.read();
                const base = current();
                if (base.revision !== request.revision || !guard()) { fail('stale'); }
                if (intent?.id === request.id) {
                    if (intent.text !== input || intent.revision !== request.revision) { fail('identity'); }
                    return view();
                }
                const clarifications = intent?.result.kind === 'question' && intent.revision === base.revision
                    ? [...intent.clarifications, { input: intent.text, question: intent.result.text }] : [];
                const work = createIntentWork(requireWorld(base.active), LANDSCAPE);
                await run(work, input, structuredClone(clarifications));
                if (!guard() || current().revision !== base.revision) { fail('stale'); }
                intent = { ...request, text: input, clarifications, result: work.finish() };
            } finally { running = false; }
            return view();
        },
        async acceptIntent(request: RequestIdentity, guard: () => boolean) {
            if (!intent || intent.id !== request.id || intent.revision !== request.revision || intent.result.kind !== 'action') { fail('stale'); }
            const operation = intent.result.operation;
            await execute(request, JSON.stringify({ kind: 'player', operation }), guard,
                world => operate(requireWorld(world), { kind: 'player' }, 'player', operation, LANDSCAPE));
            return view();
        },
        dismissIntent(id: string) {
            if (running) { fail('busy'); }
            if (intent?.id === id) { intent = null; }
            return view();
        },
        async elapse(request: RequestIdentity, seconds: number, guard: () => boolean) {
            integer(seconds, 1);
            let candidateStep: AdvanceResult['stop'] | null = null;
            await execute(request, JSON.stringify({ kind: 'elapse', seconds }), guard,
                world => { const result = advance(requireWorld(world), seconds, LANDSCAPE); candidateStep = result.stop; return result.world; });
            step = candidateStep;
            return view();
        },
        // Application-only entrance: the GM adapter gets work methods, never the raw world.
        async scene(request: RequestIdentity, anchor: PersonId, run: (work: SceneWork) => Promise<void>, guard: () => boolean) {
            person(anchor);
            await execute(request, JSON.stringify({ kind: 'scene', anchor }), guard, async world => {
                const work = createSceneWork(requireWorld(world), anchor, LANDSCAPE);
                await run(work);
                return work.finish().world;
            });
            return view();
        },
        async think(request: RequestIdentity, reason: 'response' | 'decision', run: (work: SceneWork) => Promise<void>, guard: () => boolean) {
            await execute(request, JSON.stringify({ kind: 'think', reason }), guard, async raw => {
                const world = requireWorld(raw);
                const anchor = reason === 'response' ? 'player' : awaitingDecision(world)[0];
                if (!anchor) { fail('unavailable'); }
                const work = createSceneWork(world, anchor, LANDSCAPE);
                if (!work.scope().actors.length) { fail('unavailable'); }
                await run(work); return work.finish().world;
            });
            return view();
        },
        history(after: number, limit: number) { return browse(requireWorld(current().active), ['player'], after, limit); },
        async confirm(guard: () => boolean) {
            if (running || !guard() || files.hasPendingCommit() && !files.hasPendingCommit(ISLAND_PARTITION.key)) { fail('busy'); }
            const result = await files.retryPending({ beforeRetry: guard });
            if (result.status === 'failed' || result.status === 'unconfirmed' || result.status === 'conflict') { fail(`save_${result.status}`); }
            await store.read(); return view();
        },
    };
}
export type IslandService = ReturnType<typeof createIslandService>;
export type IslandView = ReturnType<IslandService['view']>;
