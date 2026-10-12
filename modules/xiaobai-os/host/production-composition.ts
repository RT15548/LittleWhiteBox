import { getRequestHeaders } from '../../../../../../../script.js';
import { saveBase64AsFile } from '../../../../../../utils.js';
import { createAdministratorModule } from '../apps/administrator/module.js';
import { createAdministratorEnvironmentReader } from '../apps/administrator/host/environment.js';
import { createAdministratorImages } from '../apps/administrator/storage/images.js';
import { extensionFolderPath } from '../../../core/constants.js';
import { createAgentApiModule } from '../apps/agent-api/module.js';
import { createProductionBankModule } from '../apps/bank/production-module.js';
import { createProductionDiceModule } from '../apps/dice/production-module.js';
import { upgradeDiceUserFile } from '../apps/dice/upgrade/partition-v1.js';
import { createProductionFourthWallModule } from '../apps/fourth-wall/production-module.js';
import { createProductionGameModule } from '../apps/game/production-module.js';
import { createProductionLearningModule } from '../apps/learning/production-module.js';
import { createLearningRepository } from '../apps/learning/storage/repository.js';
import {
    createMapContextCapabilityRegistration,
    MAP_CONTEXT_CAPABILITY,
} from '../apps/map/context-capability.js';
import { createProductionMapModule } from '../apps/map/production-module.js';
import { createMapProjectionRuntime } from '../apps/map/host/projection-runtime.js';
import { createProductionMessagesModule } from '../apps/messages/production-module.js';
import { createMessagesBranchCopy } from '../apps/messages/host/branch-copy.js';
import { projectionMarker, type ChatMessage } from '../apps/messages/application/projection.js';
import { createProductionShopModule } from '../apps/shop/production-module.js';
import { createProductionTasksModule } from '../apps/tasks/production-module.js';
import { createWalletModule } from '../apps/wallet/module.js';
import { createProductionWorldModule } from '../apps/world/production-module.js';
import { createWorldContextCapabilityRegistration, WORLD_CONTEXT_CAPABILITY } from '../apps/world/context-capability.js';
import { copyWorldBranch } from '../apps/world/host/branch-copy.js';
import { createFourthWallUpstreamImport } from '../apps/fourth-wall/upgrade/upstream-import.js';
import { createAgentCapabilityRegistration } from '../capabilities/agent/index.js';
import { createManagementCapabilityRegistration } from '../capabilities/management/index.js';
import { createEconomyCapabilityRegistrations } from '../capabilities/economy/index.js';
import {
    createMaintenanceCapabilityRegistration,
    MAINTENANCE_CAPABILITY,
} from '../capabilities/maintenance/index.js';
import { createChatBindingManager } from '../storage/chat-binding.js';
import { createChatBindingLifecycle } from '../storage/chat-binding-lifecycle.js';
import { createChatReferencePort } from '../storage/chat-reference.js';
import {
    createSillyTavernFileStorage,
    createSillyTavernUserJsonFilePort,
} from '../storage/sillytavern-file-storage.js';
import { createSillyTavernChatMetadataAdapter } from '../storage/sillytavern-chat-metadata.js';
import { createSidecarIndex } from '../storage/sidecar-index.js';
import { resetLegacyChatEconomy } from '../storage/reset-chat-economy.js';
import { initialUserPartitions } from './user-initial-partitions.js';
import { createUserStoryResolver } from './user-story.js';
import { createXiaobaiOsBootstrap, type XiaobaiOsBootstrap } from './bootstrap.js';
import { createKernelComposition } from './kernel-composition.js';
import { createPromptContextAdapter } from './prompt-context/adapter.js';
import { createMaintenanceBackgroundCapture } from './prompt-context/maintenance-background.js';
import { createPromptInjectionCapabilityRegistration } from '../capabilities/prompt-injection/index.js';
import { PROMPT_INJECTION_POLICY } from './prompt-injection-policy.js';
import { createSillyTavernPromptInjectionHost } from './sillytavern-prompt-injection.js';
import type { XiaobaiOsSettingsRepository } from './settings-repository.js';
import {
    getSillyTavernChatIdentity,
    getSillyTavernChatSurface,
    getSillyTavernShellSnapshot,
} from './sillytavern-context.js';
import {
    createChatBindingEventAdapter,
    createSillyTavernMainGenerationRuntime,
    subscribeMaintenanceMessages,
    subscribeMapPromptEvents,
    subscribeShopPromptEvents,
    subscribeTaskPromptEvents,
    subscribeWorldPromptEvents,
    subscribeXiaobaiOsChatChanged,
} from './sillytavern-runtime-adapters.js';
import { notifySillyTavernSuccess } from './notifications.js';

const hostStylesheet = `${extensionFolderPath}/modules/xiaobai-os/host.css`;
const frameSource = `${extensionFolderPath}/modules/xiaobai-os/shell/xiaobai-os.html`;

export function createProductionBootstrap(
    settings: XiaobaiOsSettingsRepository,
): XiaobaiOsBootstrap {
    const storage = resetLegacyChatEconomy(createSillyTavernFileStorage({ getRequestHeaders }));
    const userFiles = createSillyTavernUserJsonFilePort({ getRequestHeaders });
    const metadata = createSillyTavernChatMetadataAdapter();
    const index = createSidecarIndex(createSillyTavernUserJsonFilePort({ getRequestHeaders }));
    const upstreamFourthWall = createFourthWallUpstreamImport(metadata);
    const references = createChatReferencePort(metadata, {
        createInstallEffect: upstreamFourthWall.createReferenceInstallEffect,
        recordOrphan: index.remember,
        recordReference: index.remember,
    });
    const copyMessagesBranch = createMessagesBranchCopy(() => {
        const capture = metadata.capture();
        const surface = getSillyTavernChatSurface();
        return capture && surface ? { identityKey: capture.identityKey, messages: surface.messages as ChatMessage[] } : null;
    });
    const administratorImages = createAdministratorImages({ upload: saveBase64AsFile, headers: getRequestHeaders });
    const bindingManager = createChatBindingManager({ metadata, references, storage, index,
        prepareInitialPartitions: upstreamFourthWall.prepareInitialPartitions,
        async prepareClonedPartitions(capture, source, partitions, ids) {
            copyMessagesBranch(capture, source, partitions);
            copyWorldBranch(capture, source, partitions);
            if (partitions.administrator !== undefined) { partitions.administrator = await administratorImages.clonePartition(ids.source, ids.target, partitions.administrator); }
        },
        cleanupAttachments: administratorImages.clear,
    });
    const bindingEvents = createChatBindingEventAdapter();
    const mainGeneration = createSillyTavernMainGenerationRuntime();
    const promptContext = createPromptContextAdapter();
    const learningRepository = createLearningRepository(createSillyTavernUserJsonFilePort({ getRequestHeaders }));
    let composition: ReturnType<typeof createKernelComposition>;

    const capabilities = [
        createPromptInjectionCapabilityRegistration(PROMPT_INJECTION_POLICY, createSillyTavernPromptInjectionHost),
        createAgentCapabilityRegistration(),
        createManagementCapabilityRegistration(),
        ...createEconomyCapabilityRegistrations(),
        createMapContextCapabilityRegistration(),
        createWorldContextCapabilityRegistration(),
        createMaintenanceCapabilityRegistration({
            captureSurface: getSillyTavernChatSurface,
            isGenerationActive: mainGeneration.isActive,
            writeGate: {
                getState: () => composition.transactions.getFileState(),
                subscribe: listener => composition.transactions.subscribeFileState(change => listener(change.state)),
            },
            captureBackground: createMaintenanceBackgroundCapture({
                promptContext,
                readMapContext: () => composition.capabilities.require(MAP_CONTEXT_CAPABILITY).readPromptContext(),
                readWorldContext: identity => composition.capabilities.require(WORLD_CONTEXT_CAPABILITY).readCurrent(identity),
            }),
            onError: error => console.error('[LittleWhiteBox] 小白 OS 后台维护失败', error),
        }),
    ];

    const dice = createProductionDiceModule(settings, async identityKey => {
        const summary = await import('../../story-summary/story-summary.js') as { isStorySummaryEnabledForCurrentChat(): boolean };
        return { world: composition.capabilities.require(WORLD_CONTEXT_CAPABILITY).isStoryBackgroundEnabled(identityKey),
            summary: summary.isStorySummaryEnabledForCurrentChat() };
    }, message => !!projectionMarker(message), () => upgradeDiceUserFile(composition.userTransactions!));
    const modules = [
        createAdministratorModule({ images: administratorImages, capture: getSillyTavernChatSurface,
            readEnvironment: createAdministratorEnvironmentReader({
                captureIdentity: () => getSillyTavernChatIdentity()?.key ?? null,
                descriptors: () => composition.apps.descriptors(),
                appStatus: id => composition.apps.status(id),
                maintenance: identity => {
                    const { registry, runner } = composition.capabilities.require(MAINTENANCE_CAPABILITY);
                    return registry.participants.map(participant => ({ id: participant.id, automaticEnabled: participant.isEnabled('automatic'), status: runner.getStatus(participant.id, identity) }));
                },
                mainChatGenerating: mainGeneration.isActive,
                chatFile: { getFileState: () => composition.transactions.getFileState(), hasPendingCommit: () => composition.transactions.hasPendingCommit() },
                userFile: { getFileState: () => composition.userTransactions!.getFileState(), hasPendingCommit: () => composition.userTransactions!.hasPendingCommit() },
            }),
        }),
        dice,
        createAgentApiModule(),
        createProductionFourthWallModule(settings, upstreamFourthWall),
        createProductionMessagesModule(mainGeneration, settings),
        createProductionLearningModule(learningRepository, promptContext),
        createWalletModule(),
        createProductionShopModule({
            getChatIdentity: getSillyTavernChatIdentity,
            captureChatSurface: getSillyTavernChatSurface,
            mainGeneration,
            subscribePrompt: subscribeShopPromptEvents,
        }),
        createProductionBankModule({
            userTransactions: () => composition.userTransactions,
            notifyMaturity: notifySillyTavernSuccess,
        }),
        createProductionGameModule({ getChatIdentity: getSillyTavernChatIdentity, mainGeneration, settings }),
        createProductionMapModule({
            settings,
            mainGeneration,
            replyPause: dice.replyPause,
            getPlayerDisplayName: () => getSillyTavernChatSurface()?.playerName ?? '玩家',
            getChatIdentity: getSillyTavernChatIdentity,
            subscribePrompt: subscribeMapPromptEvents,
            createProjectionRuntime: createMapProjectionRuntime,
        }),
        createProductionTasksModule({
            settings,
            getChatIdentity: getSillyTavernChatIdentity,
            getPlayerDisplayName: () => getSillyTavernChatSurface()?.playerName ?? '玩家',
            userTransactions: () => composition.userTransactions,
            mainGeneration,
            subscribePrompt: subscribeTaskPromptEvents,
            notifyCompletion: notifySillyTavernSuccess,
        }),
        createProductionWorldModule({
            settings,
            getChatIdentity: () => getSillyTavernChatIdentity()?.key ?? '',
            subscribePrompt: subscribeWorldPromptEvents,
        }),
    ];

    composition = createKernelComposition({
        storage,
        chatReferences: references,
        capabilities,
        modules,
        beforeRead: () => bindingLifecycle.ready(),
        prepareInitialPartitions: upstreamFourthWall.prepareInitialPartitions,
        user: {
            storage: userFiles,
            initialPartitions: () => initialUserPartitions(settings.readLegacyDiceSheet(), learningRepository),
            resolveStory: createUserStoryResolver({
                ready: () => bindingLifecycle.ready(), references, manager: bindingManager,
                install: envelope => composition.transactions.installResolvedEnvelope(envelope),
            }),
        },
    });
    const bindingLifecycle = createChatBindingLifecycle({
        manager: bindingManager,
        installResolvedSidecar: composition.transactions.installResolvedEnvelope,
        invalidateSidecar: composition.transactions.invalidateCurrent,
        events: bindingEvents.source,
        eventNames: bindingEvents.names,
    });
    let productionInstalled = false;

    const productionApps = Object.freeze({
        ...composition.apps,
        async handleWindowOpened() {
            await bindingLifecycle.ready();
            await composition.apps.handleWindowOpened();
        },
    });
    const productionComposition = {
        apps: productionApps,
        async install() {
            if (productionInstalled) { return; }
            mainGeneration.startBackground?.();
            try {
                bindingLifecycle.start();
                await bindingLifecycle.ready();
                await composition.install();
                // Only remove the old sheet after the user document has acknowledged its copy.
                // App installation is isolated: an unavailable user file must not disable chat-only APPs.
                if (composition.userTransactions?.getFileState() === 'ready') {
                    await composition.userTransactions.prepare();
                    await settings.finishDiceSheetMigration();
                }
                const maintenance = composition.capabilities.require(MAINTENANCE_CAPABILITY);
                maintenance.runner.startBackground(subscribeMaintenanceMessages);
                productionInstalled = true;
            } catch (error) {
                await bindingLifecycle.stop();
                mainGeneration.stopBackground?.();
                await composition.dispose().catch(() => undefined);
                throw error;
            }
        },
        async dispose() {
            if (!productionInstalled) { return; }
            productionInstalled = false;
            await bindingLifecycle.stop();
            bindingEvents.dispose();
            mainGeneration.stopBackground?.();
            await composition.dispose();
        },
    };

    return createXiaobaiOsBootstrap({
        composition: productionComposition,
        stylesheetHref: hostStylesheet,
        frameSrc: frameSource,
        subscribeChatChanged: subscribeXiaobaiOsChatChanged,
        getInitSnapshot: getSillyTavernShellSnapshot,
        getAppOrder: () => settings.read()?.appOrder ?? [],
        saveAppOrder: async order => { await settings.setAppOrder(order); },
        subscribeAppOrderChanged: handler => {
            let previous = JSON.stringify(settings.read()?.appOrder ?? []);
            return settings.subscribe(value => {
                const next = JSON.stringify(value.appOrder);
                if (next === previous) { return; }
                previous = next;
                handler();
            });
        },
        captureChatBinding: references.capture,
        isChatBindingCurrent: references.isCurrent,
        onChatRequired: () => (window.toastr as unknown as { info?(message: string): void } | undefined)?.info?.('请先进入聊天，再打开小白 OS。'),
    });
}
