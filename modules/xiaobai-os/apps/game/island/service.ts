import type { PartitionSnapshot, PartitionStore, XiaobaiOsFileControls } from '../../../kernel/contracts.js';
import { createPartitionDocument } from '../../../kernel/partition-document.js';
import { ISLAND_FORMAT_VERSION, type IslandData, type Journey, type Operation, type Point } from './model.js';
import { sha256 } from 'js-sha256';
import { LANDSCAPE, RULES } from './content.js';
import { emptyIsland, isEnded, newJourney } from './world.js';
import { ISLAND_PARTITION } from './partition.js';
import { fail } from './fault.js';
import { replayScene } from './scene-replay.js';
import { identifier, integer, parseOperation, text } from './validation.js';
import { observe, openScene } from './scene.js';
import { operate } from './operations.js';
import { createWorldClock } from './clock.js';
import { steerPlayer } from './steer.js';
import { awaitingDecision } from './attention.js';
import { createSceneWork } from './scene-work.js';
import { browse } from './memory.js';
import { recentKnownExperiences } from './experience.js';
import { experienceView } from './cooperation.js';
import { createIntentWork, type IntentClarification, type PlayerIntent } from './intent-work.js';
import type { PlayerIdentity } from './characters.js';
import { parsePlayerIdentity } from './identity.js';
import { invitationSequence } from './invitation.js';

export interface RequestIdentity { id: string; revision: number }
type SceneWork = ReturnType<typeof createSceneWork>;
// A stalled tab must not turn into a burst of catch-up time.
const MAX_TICK_MILLISECONDS = 1000;
// How many of the player's latest known experiences each pushed view carries; earlier ones are read from the journal.
const RECENT_VIEW = 60;

/**
 * The living journey. While the island is open the world exists here, in memory, and time runs on it.
 * Only a checkpoint writes it to the partition; nothing in this object needs to survive a restart
 * beyond what the last checkpoint saved.
 */
interface Live {
    world: Journey;
    clock: ReturnType<typeof createWorldClock>;
    steering: Point | null;
    owed: number;
    /** Bumped by every change; the saved counter is the version last written by a checkpoint. */
    version: number;
    saved: number;
    /** Partition revision from which this live world was loaded or last confirmed. */
    revision: number;
    lastRequest: string | null;
}

export function createIslandService(store: PartitionStore<IslandData>, files: XiaobaiOsFileControls) {
    let saving: Promise<void> | null = null;
    let live: Live | null = null;
    let generation = 0;
    let intent: PlayerIntent | null = null;
    let unreadable: PartitionSnapshot<unknown> | null = null;
    const document = createPartitionDocument(store, ISLAND_PARTITION);
    const current = () => unreadable ? emptyIsland() : store.peekCurrent()?.value ?? emptyIsland();
    const worldNow = () => unreadable ? null : live?.world ?? current().active;
    function view() {
        const data = current(), world = worldNow(), scope = world && !isEnded(world) ? openScene(world, 'player', LANDSCAPE) : null;
        return { revision: data.revision, generation,
            phase: unreadable ? 'unreadable' as const : !world ? 'unstarted' as const : isEnded(world) ? 'ended' as const : 'living' as const,
            journey: world?.id ?? null, identity: world ? structuredClone(world.playerIdentity) : null, lastRequest: live?.lastRequest ?? data.last?.id ?? null,
            player: world ? observe(world, 'player', LANDSCAPE) : null,
            scene: scope?.mode ?? null,
            // Everyone who can follow the talk around the player right now: the one conversation that is current.
            listeners: scope ? scope.audience.filter(id => id !== 'player') : [],
            needsDecision: !!world && !isEnded(world) && awaitingDecision(world).length > 0,
            recent: world ? recentKnownExperiences(world, ['player'], RECENT_VIEW).map(e => experienceView(world, e)) : [],
            intent: intent?.generation === generation ? structuredClone(intent) : null,
            busy: saving !== null, pending: files.hasPendingCommit(ISLAND_PARTITION.key), writeState: files.getFileState() };
    }
    // Every persistence caller waits for the in-flight write before preparing its own current candidate.
    // Only the original caller reports a failed write; each new write checks retained candidates itself.
    async function save(write: () => Promise<void>) {
        while (saving) {
            try { await saving; }
            catch { /* The previous caller owns this failure; waiting only establishes ordering. */ }
        }
        const pending = write(); saving = pending;
        try { await pending; }
        finally { saving = null; }
    }
    // The Live object keeps its identity for the whole journey; only its world and clock are replaced.
    function replaceWorld(l: Live, world: Journey) {
        l.world = world; l.clock = createWorldClock(world, LANDSCAPE); l.version++;
    }
    // All journey changes, including recovered restarts, invalidate the old journey's temporary intent.
    function syncLive() {
        const data = current(), saved = unreadable ? null : data.active;
        if (live?.world.id === saved?.id && (!live || live.revision === data.revision)) { return; }
        intent = null; generation++;
        const world = saved ? structuredClone(saved) : null;
        live = world ? { world, clock: createWorldClock(world, LANDSCAPE), steering: null, owed: 0, version: 0, saved: 0, revision: data.revision, lastRequest: null } : null;
    }
    function requireLive(): Live {
        if (!live || isEnded(live.world)) { fail(live ? 'ended' : 'missing'); }
        return live;
    }
    async function refresh() {
        try { await store.read(); unreadable = null; }
        catch (error) {
            if ((error as { code?: string })?.code !== 'partition_invalid') { throw error; }
            const raw = await document.read();
            unreadable = raw.validation.valid ? null : raw.snapshot;
        }
        syncLive();
        return view();
    }
    // Journey creation is the one operation that must be durable before it is acknowledged.
    async function persistJourney(request: RequestIdentity, input: string, guard: () => boolean, build: (world: Journey | null) => Journey) {
        identifier(request.id); integer(request.revision);
        const fingerprint = sha256(input);
        await save(async () => {
            if (files.hasPendingCommit()) { fail('busy'); }
            if (!guard()) { fail('stale'); }
            await store.read();
            const base = current();
            if (base.last?.id === request.id) {
                if (base.last.fingerprint !== fingerprint) { fail('identity'); }
                syncLive(); return;
            }
            if (base.revision !== request.revision || !guard()) { fail('stale'); }
            const world = build(base.active ? structuredClone(base.active) : null);
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
            syncLive();
        });
    }
    async function replaceUnreadable(expected: PartitionSnapshot<unknown>, request: RequestIdentity, identity: PlayerIdentity, guard: () => boolean) {
        identifier(request.id); integer(request.revision);
        await save(async () => {
            if (files.hasPendingCommit()) { fail('busy'); }
            if (request.revision !== 0 || !guard()) { fail('stale'); }
            const candidate: IslandData = { formatVersion: ISLAND_FORMAT_VERSION, revision: 1,
                active: newJourney(request.id, identity), last: { id: request.id, fingerprint: sha256(JSON.stringify({ kind: 'restart', identity })) } };
            const result = await document.replace(expected, candidate, guard);
            if (result.status === 'failed') { fail('restart_save_failed'); }
            if (result.status === 'unconfirmed' || result.status === 'conflict') { fail(`save_${result.status}`); }
            unreadable = null;
            await refresh();
        });
    }
    // Player-originated change: applied to the live world at once, never waiting on persistence or a model.
    function applyPlayer(request: { id: string }, guard: () => boolean, change: (world: Journey) => Journey) {
        identifier(request.id);
        if (!guard()) { fail('stale'); }
        const l = requireLive();
        if (l.lastRequest === request.id) { return; }
        replaceWorld(l, change(l.world)); l.lastRequest = request.id; generation++;
    }
    return {
        view, refresh,
        get generation() { return generation; },
        async start(request: RequestIdentity, mode: 'start' | 'restart', rawIdentity: PlayerIdentity, guard: () => boolean) {
            if (mode !== 'start' && mode !== 'restart') { fail('invalid'); }
            const identity = parsePlayerIdentity(rawIdentity);
            if (unreadable) {
                if (mode !== 'restart') { fail('unavailable'); }
                await replaceUnreadable(unreadable, request, identity, guard);
                return view();
            }
            await persistJourney(request, JSON.stringify({ kind: mode, identity }), guard, world => {
                if (mode === 'start' ? !!world : !world) { fail('unavailable'); }
                return newJourney(request.id, identity);
            });
            return view();
        },
        player(request: { id: string }, raw: Operation, guard: () => boolean) {
            const operation = parseOperation(raw);
            applyPlayer(request, guard, world => operate(world, { kind: 'player' }, 'player', operation, LANDSCAPE));
            return view();
        },
        async interpret(request: { id: string; generation: number }, input: string, run: (work: ReturnType<typeof createIntentWork>, input: string, clarifications: IntentClarification[]) => Promise<void>, guard: () => boolean) {
            identifier(request.id); integer(request.generation); input = text(input, RULES.maxSpeechCharacters);
            if (!guard() || request.generation !== generation) { fail('stale'); }
            const l = requireLive();
            if (intent?.id === request.id) {
                if (intent.text !== input || intent.generation !== request.generation) { fail('identity'); }
                return view();
            }
            const clarifications = intent?.result.kind === 'question' && intent.generation === generation
                ? [...intent.clarifications, { input: intent.text, question: intent.result.text }] : [];
            const work = createIntentWork(l.world, LANDSCAPE);
            await run(work, input, structuredClone(clarifications));
            if (!guard() || live !== l || generation !== request.generation) { fail('stale'); }
            intent = { id: request.id, generation: request.generation, text: input, clarifications, result: work.finish() };
            return view();
        },
        acceptIntent(request: { id: string; generation: number }, guard: () => boolean) {
            if (!intent || intent.id !== request.id || intent.generation !== request.generation || generation !== request.generation || intent.result.kind !== 'action') { fail('stale'); }
            const { operation, invitation } = intent.result;
            applyPlayer(request, guard, world => {
                if (invitationSequence(world, 'player', operation) !== invitation) { fail('stale'); }
                return operate(world, { kind: 'player' }, 'player', operation, LANDSCAPE);
            });
            return view();
        },
        dismissIntent(id: string) {
            if (intent?.id === id) { intent = null; }
            return view();
        },
        /** Held direction in world space, or null to stop. Takes effect on the next game second. */
        steer(direction: Point | null) {
            const l = live;
            if (!l || isEnded(l.world)) { return; }
            const wasSteering = !!l.steering;
            l.steering = direction;
            if (!direction && wasSteering && l.world.people.player.activity?.kind === 'travel') { l.world.people.player.activity = null; l.version++; }
        },
        /** Lets `realMilliseconds` of real time pass. Returns whether the world changed. */
        tick(realMilliseconds: number): boolean {
            const l = live;
            // Ordinary loading/saving is asynchronous; only unresolved failures or a superseded baseline pause time.
            if (!l || isEnded(l.world) || ['failed', 'unconfirmed', 'conflict'].includes(files.getFileState()) || current().revision !== l.revision) { return false; }
            l.owed += Math.min(realMilliseconds, MAX_TICK_MILLISECONDS) / 1000 * RULES.timeScale;
            const seconds = Math.floor(l.owed);
            if (seconds < 1) { return false; }
            l.owed -= seconds;
            for (let second = 0; second < seconds; second++) {
                if (l.steering) {
                    const next = steerPlayer(l.world, LANDSCAPE, l.steering);
                    if (next !== l.world) { replaceWorld(l, next); }
                }
                if (!l.clock.tick()) { break; }
            }
            l.version++;
            return true;
        },
        /** Whether anyone in the live world is waiting for a plan. */
        awaitingPlan() { return !!live && !isEnded(live.world) && awaitingDecision(live.world).length > 0; },
        /**
         * A model plan for the people around the player or the next person awaiting a decision.
         * The model reasons over a snapshot while time keeps running; the legal prefix is replayed
         * against the live world. Further decisions come only from the world's current needs.
         */
        async plan(reason: 'response' | 'decision', run: (work: SceneWork) => Promise<void>, guard: () => boolean) {
            if (!guard()) { fail('stale'); }
            const l = requireLive();
            const anchor = reason === 'response' ? 'player' : awaitingDecision(l.world)[0];
            if (!anchor) { fail('unavailable'); }
            const work = createSceneWork(l.world, anchor, LANDSCAPE);
            if (!work.scope().actors.length) { fail('unavailable'); }
            await run(work);
            if (!guard() || live !== l) { fail('stale'); }
            const { operations } = work.finish();
            const { world, applied, dropped } = replayScene(l.world, anchor, operations, LANDSCAPE);
            if (applied) { replaceWorld(l, world); }
            return { applied, dropped };
        },
        /** A snapshot scene around the player for read-only questions to the model. The world is not touched. */
        async scene<T>(run: (work: SceneWork) => Promise<T>) {
            const l = requireLive();
            return run(createSceneWork(l.world, 'player', LANDSCAPE));
        },
        /** Writes the latest live world after any in-flight save. Time keeps running on the live copy meanwhile. */
        async checkpoint(guard: () => boolean) {
            await save(async () => {
                const l = live;
                if (!l || l.version === l.saved || files.hasPendingCommit()) { return; }
                if (!guard()) { fail('stale'); }
                const snapshot = structuredClone(l.world), version = l.version, revision = l.revision;
                await store.read();
                let accepted = false;
                const result = await store.transact(transaction => {
                    if (!guard() || live !== l) { fail('stale'); }
                    const data = transaction.currentOrInitial();
                    if (data.revision !== revision || data.active?.id !== snapshot.id || !data.last) { fail('stale'); }
                    transaction.replace({ formatVersion: ISLAND_FORMAT_VERSION, revision: revision + 1, active: snapshot, last: data.last });
                    accepted = true;
                }, { retainFailedCandidate: true, commitGuard: () => accepted || guard(), onSettled: status => {
                    // Recovery may confirm this exact snapshot later, after the live world has advanced further.
                    if (status === 'confirmed') { l.revision = revision + 1; l.saved = version; }
                } });
                if (result.status === 'failed' || result.status === 'unconfirmed' || result.status === 'conflict') { fail(`save_${result.status}`); }
            });
        },
        history(after: number, limit: number) {
            const world = worldNow();
            if (!world) { fail('missing'); }
            return browse(world, ['player'], after, limit);
        },
        async confirm(guard: () => boolean) {
            await save(async () => {
                if (!guard() || files.hasPendingCommit() && !files.hasPendingCommit(ISLAND_PARTITION.key)) { fail('busy'); }
                const result = await files.retryPending({ beforeRetry: guard });
                if (result.status === 'failed' || result.status === 'unconfirmed' || result.status === 'conflict') { fail(`save_${result.status}`); }
                await refresh();
            });
            return view();
        },
    };
}
export type IslandService = ReturnType<typeof createIslandService>;
export type IslandView = ReturnType<IslandService['view']>;
