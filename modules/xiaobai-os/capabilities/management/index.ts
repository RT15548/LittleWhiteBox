import { createCapabilityToken, type CapabilityRegistration } from '../../kernel/capability-registry.js';
import type { PendingCommitRecoveryResult } from '../../kernel/contracts.js';

export interface ManagementTool {
    definition: { type: 'function'; function: { name: string; description: string; parameters: Record<string, unknown> } };
    effect: 'read' | 'write';
    label: string;
    target(args: Record<string, unknown>): string;
}

export interface ManagementResult {
    ok: boolean;
    status: 'read' | 'saved' | 'unchanged' | 'partial' | 'failed';
    code?: string;
    data?: unknown;
}

export function managementReadError(error: unknown) {
    const code = error !== null && typeof error === 'object' && 'code' in error ? error.code : undefined;
    return { code: typeof code === 'string' ? code : 'management_read_failed', message: error instanceof Error ? error.message : String(error) };
}
export type ManagementInspection = { status: 'confirmed'; result: ManagementResult }
    | { status: 'unchanged' | 'superseded' }
    | { status: 'unverifiable'; error: unknown };

export interface ManagementSession {
    prompt: string;
    initial: unknown;
    tools: readonly ManagementTool[];
    execute(name: string, args: Record<string, unknown>, guard: () => boolean): Promise<ManagementResult>;
    recover(guard: () => boolean): Promise<ManagementResult | null>;
    confirmSaved(): Promise<ManagementInspection | null>;
}

export interface ManagementParticipant {
    id: string;
    label: string;
    prompt: string;
    tools: readonly ManagementTool[];
    open(): Promise<ManagementSession>;
    confirmPending(): Promise<PendingCommitRecoveryResult>;
}

export function createManagementRegistry() {
    const entries = new Map<string, ManagementParticipant>();
    return {
        register(participant: ManagementParticipant) {
            if (entries.has(participant.id)) { throw new Error('management_duplicate_participant'); }
            entries.set(participant.id, participant);
            return () => { if (entries.get(participant.id) === participant) { entries.delete(participant.id); } };
        },
        list: () => [...entries.values()],
        get: (id: string) => entries.get(id),
    };
}

export type ManagementRegistry = ReturnType<typeof createManagementRegistry>;
export const MANAGEMENT_CAPABILITY = createCapabilityToken<ManagementRegistry>('management.registry');
export function createManagementCapabilityRegistration(): CapabilityRegistration<ManagementRegistry> {
    return { token: MANAGEMENT_CAPABILITY, ownerId: 'management', dependencies: [], install: createManagementRegistry };
}
