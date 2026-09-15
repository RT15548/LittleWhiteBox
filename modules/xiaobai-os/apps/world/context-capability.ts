import { createCapabilityToken, type CapabilityRegistration } from '../../kernel/capability-registry.js';
import type { WorldContent } from '../../domains/world/types.js';

interface WorldContextProvider {
    readCurrent(chatIdentity: string): WorldContent | null;
    isStoryBackgroundEnabled(identityKey: string): boolean;
}

export interface WorldContextCapability {
    readCurrent(chatIdentity: string): WorldContent | null;
    /** Chat binding key; reads only the owner's confirmed preference, not news. */
    isStoryBackgroundEnabled(identityKey: string): boolean;
    registerProvider(provider: WorldContextProvider): () => void;
}

export const WORLD_CONTEXT_CAPABILITY = createCapabilityToken<WorldContextCapability>('world.prompt-context');

export function createWorldContextCapabilityRegistration(): CapabilityRegistration<WorldContextCapability> {
    let provider: WorldContextProvider | null = null;
    return {
        token: WORLD_CONTEXT_CAPABILITY,
        ownerId: 'world',
        dependencies: [],
        install: () => Object.freeze({
            readCurrent(chatIdentity: string) {
                try { return provider?.readCurrent(chatIdentity) ?? null; }
                catch (error) {
                    console.error('[LittleWhiteBox] World 可选资料读取失败，已忽略', error);
                    return null;
                }
            },
            isStoryBackgroundEnabled(identityKey: string) { return !!identityKey && (provider?.isStoryBackgroundEnabled(identityKey) ?? false); },
            registerProvider(next: WorldContextProvider) {
                if (provider) { throw new Error('world_context_provider_already_registered'); }
                provider = next;
                return () => { if (provider === next) { provider = null; } };
            },
        }),
        dispose: () => { provider = null; },
    };
}
