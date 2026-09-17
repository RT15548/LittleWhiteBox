import { createWorldService } from '../apps/world/application/service.js';
import { WORLD_PARTITION } from '../apps/world/partition.js';
import { createWorldMaintenanceParticipant } from '../apps/world/host/maintenance-participant.js';
import { createMaintenanceRegistry } from '../capabilities/maintenance/registry.js';
import { createMaintenanceRunner } from '../capabilities/maintenance/runner.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../kernel/transaction-coordinator.js';
import { createSettingsRepository } from '../host/settings-repository.js';

export const article = (id = 'canal') => ({ id, title: '旧运河重新通航', summary: '修缮后的运河恢复通航，沿岸周末市集也随之重开。',
    body: '清早的第一艘渡船驶过石桥。船主把旧票亭重新刷成了蓝色。\n\n沿岸商户约定周末摆起小摊，卖热汤和二手书。' });
export const tick = () => new Promise(resolve => setTimeout(resolve, 0));
export function deferred() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}
export async function worldHarness(initial = null, { participants = [], captureBackground, chatIdentity, preferences = {} } = {}) {
    const binding = { kind: 'character', ownerLocator: 'world.png', chatId: 'test-world' };
    let id = 0;
    const state = {
        chatIdentity,
        capture: { identityKey: 'world:one', binding, reference: initial ? { formatVersion: 1, osId: 'world-os' } : null },
        persisted: initial ? { formatVersion: 1, osId: 'world-os', binding, revision: 0, commitId: 'initial', partitions: { world: initial } } : null,
        writes: [], replace: null, messages: [{ is_user: false, mes: '港城迎来初夏。', name: '旁白' }],
        requests: [], generate: async () => ({ text: 'Unchanged.' }),
        settingsRoot: {}, savedSettings: null, saveSettings: null, settingsWrites: 0,
    };
    const settings = createSettingsRepository({
        getExtensionSettings: () => state.settingsRoot,
        async saveSettings() {
            state.settingsWrites++;
            if (await state.saveSettings?.() === false) { return false; }
            state.savedSettings = structuredClone(state.settingsRoot);
            return true;
        },
    });
    await settings.prepare();
    for (const [key, value] of Object.entries(preferences)) { await settings.setWorldPreference(key, value); }
    state.settingsWrites = 0;
    const partitions = new XiaobaiOsPartitionRegistry();
    partitions.register(WORLD_PARTITION);
    const coordinator = createTransactionCoordinator({
        partitions, createId: () => `world-${++id}`,
        chatReferences: {
            capture: () => structuredClone(state.capture),
            isCurrent: captured => captured.identityKey === state.capture.identityKey,
            async install(_captured, reference) { state.capture.reference = reference; return { status: 'confirmed' }; },
        },
        storage: {
            async read() { return structuredClone(state.persisted); },
            async replace(input) {
                state.writes.push(structuredClone(input));
                if (state.replace) { return state.replace(input); }
                state.persisted = structuredClone(input.candidate);
                return { status: 'confirmed' };
            },
            async delete() { return 'deleted'; },
        },
    });
    const getChatIdentity = () => state.chatIdentity ?? state.capture.identityKey;
    const world = createWorldService(coordinator.createScopedStore(WORLD_PARTITION), coordinator, getChatIdentity);
    await world.refreshCurrent();
    const participant = createWorldMaintenanceParticipant(world, () => settings.read().apps.world);
    const runner = createMaintenanceRunner({
        registry: createMaintenanceRegistry([participant, ...participants]),
        ...(captureBackground ? { captureBackground } : {}),
        captureSurface: () => ({ identityKey: getChatIdentity(), messages: state.messages, playerName: '玩家' }),
        isGenerationActive: () => false,
        writeGate: { getState: coordinator.getFileState, subscribe: listener => coordinator.subscribeFileState(change => listener(change.state)) },
        gateway: {
            async loadConfig() { return { currentPresetName: 'test', presets: { test: {
                provider: 'sillytavern-openai-compatible', modelConfigs: { 'sillytavern-openai-compatible': { model: 'fixture-model' } },
            } } }; },
            async openSession() { return {
                providerConfig: { provider: 'sillytavern-openai-compatible' }, supportsSessionToolLoop: false,
                async run(request) { state.requests.push(request); return state.generate(request); },
            }; },
        },
    });
    const source = () => ({ chatIdentity: getChatIdentity(), messages: [], messageCount: 1,
        assistantCount: 1, player: { actorKey: 'player', displayName: '玩家' } });
    return { world, settings, participant, coordinator, runner, state, getChatIdentity,
        session: mode => participant.createSession(source(), mode ?? 'rebuild'),
        dispose() { runner.stopBackground(); world.dispose(); },
    };
}
