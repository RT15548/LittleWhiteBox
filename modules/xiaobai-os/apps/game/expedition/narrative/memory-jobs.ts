import type { XiaobaiOsAgentSession } from '../../../../capabilities/agent/gateway.js';
import type { Campaign, ConversationMemory } from '../campaign/types.js';
import type { Participant } from '../content/participants.js';
import { summarizeConversation, type TokenCounter } from './memory.js';
import { expeditionFailure, type ExpeditionFailure } from '../failure.js';

export type MemoryJobState = { status: 'running' } | ({ status: 'failed' } & ExpeditionFailure);
type Outcome = { error?: unknown };
type Job = { campaignId: string; controller: AbortController; state: MemoryJobState; promise: Promise<Outcome> };

/** Runtime-only jobs. A failed paid request is retried only by an explicit user action. */
export function createMemoryJobs(options: {
    countTokens?: TokenCounter;
    save: (snapshot: Campaign, person: Participant, memory: ConversationMemory, signal: AbortSignal) => Promise<void>;
    changed: () => void;
}) {
    const jobs = new Map<Participant, Job>();
    function start(session: XiaobaiOsAgentSession, campaign: Campaign, person: Participant) {
        const existing = jobs.get(person);
        if (existing?.campaignId === campaign.id) { return existing.promise; }
        existing?.controller.abort();
        const snapshot = structuredClone(campaign), controller = new AbortController();
        const job: Job = { campaignId: campaign.id, controller, state: { status: 'running' }, promise: Promise.resolve({}) };
        jobs.set(person, job);
        job.promise = (async (): Promise<Outcome> => {
            try {
                const memory = await summarizeConversation(session, snapshot, person, controller.signal, options.countTokens);
                await options.save(snapshot, person, memory, controller.signal);
                if (jobs.get(person) === job) { jobs.delete(person); }
                return {};
            } catch (error) {
                if (jobs.get(person) === job) {
                    if (controller.signal.aborted) { jobs.delete(person); }
                    else {
                        job.state = { status: 'failed', ...expeditionFailure(error) };
                        console.warn('[LittleWhiteBox:expedition:memory]', error);
                    }
                }
                return { error };
            } finally { options.changed(); }
        })();
        options.changed();
        return job.promise;
    }
    return { start,
        states(campaignId?: string) {
            return Object.fromEntries([...jobs].filter(([, job]) => job.campaignId === campaignId).map(([person, job]) => [person, job.state])) as Partial<Record<Participant, MemoryJobState>>;
        },
        clearFailure(person: Participant) { if (jobs.get(person)?.state.status === 'failed') { jobs.delete(person); options.changed(); } },
        stop() { for (const job of jobs.values()) { job.controller.abort(); } jobs.clear(); options.changed(); },
    };
}
