import { getRequestHeaders } from '../../../../../../../script.js';
import { extensionFolderPath } from '../../../core/constants.js';
import { createAgentApiModule } from '../apps/agent-api/module.js';
import { createProductionBankModule } from '../apps/bank/production-module.js';
import { createProductionFourthWallModule } from '../apps/fourth-wall/production-module.js';
import { createProductionGameModule } from '../apps/game/production-module.js';
import { createProductionLearningModule } from '../apps/learning/production-module.js';
import { createLearningRepository } from '../apps/learning/storage/repository.js';
import {
    createMapContextCapabilityRegistration,
    MAP_CONTEXT_CAPABILITY,
} from '../apps/map/context-capability.js';
import { createProductionMapModule } from '../apps/map/production-module.js';
import { createProductionMessagesModule } from '../apps/messages/production-module.js';
import { createMessagesBranchCopy } from '../apps/messages/host/branch-copy.js';
import type { ChatMessage } from '../apps/messages/application/projection.js';
import { createProductionShopModule } from '../apps/shop/production-module.js';
import { createProductionTasksModule } from '../apps/tasks/production-module.js';
import { createWalletModule } from '../apps/wallet/module.js';
import { createProductionWorldModule } from '../apps/world/production-module.js';
import { createWorldContextCapabilityRegistration, WORLD_CONTEXT_CAPABILITY } from '../apps/world/context-capability.js';
import { copyWorldBranch } from '../apps/world/host/branch-copy.js';
import { createFourthWallUpstreamImport } from '../apps/fourth-wall/upgrade/upstream-import.js';
import { createAgentCapabilityRegistration } from '../capabilities/agent/index.js';
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
import { createXiaobaiOsBootstrap, type XiaobaiOsBootstrap } from './bootstrap.js';
import { createKernelComposition } from './kernel-composition.js';
import { createPromptContextAdapter } from './prompt-context/adapter.js';
import { createMaintenanceBackgroundCapture } from './prompt-context/maintenance-background.js';
import type { XiaobaiOsSettingsRepository } from './settings-repository.js';
import {
    getSillyTavernAssistantTurnCount,
    getSillyTavernChatIdentity,
    getSillyTavernChatSurface,
    getSillyTavernShellSnapshot,
} from './sillytavern-context.js';
import {
    createChatBindingEventAdapter,
    createSillyTavernMainGenerationRuntime,
    setSillyTavernPrompt,
    subscribeMaintenanceMessages,
    subscribeMapPromptEvents,
    subscribeShopPromptEvents,
    subscribeTaskPromptEvents,
    subscribeWorldPromptEvents,
    subscribeXiaobaiOsChatChanged,
} from './sillytavern-runtime-adapters.js';

const hostStylesheet = `${extensionFolderPath}/modules/xiaobai-os/host.css`;
const frameSource = `${extensionFolderPath}/modules/xiaobai-os/shell/xiaobai-os.html`;

export function createProductionBootstrap(
    settings: XiaobaiOsSettingsRepository,
): XiaobaiOsBootstrap {
    const storage = createSillyTavernFileStorage({ getRequestHeaders });
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
    const bindingManager = createChatBindingManager({ metadata, references, storage, index,
        prepareClonedPartitions(capture, source, partitions) {
            copyMessagesBranch(capture, source, partitions);
            copyWorldBranch(capture, source, partitions);
        },
    });
    const bindingEvents = createChatBindingEventAdapter();
    const mainGeneration = createSillyTavernMainGenerationRuntime();
    const promptContext = createPromptContextAdapter();
    const learningRepository = createLearningRepository(createSillyTavernUserJsonFilePort({ getRequestHeaders }));
    let composition: ReturnType<typeof createKernelComposition>;

    const capabilities = [
        createAgentCapabilityRegistration(),
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

    const modules = [
        createAgentApiModule(),
        createProductionFourthWallModule(settings, upstreamFourthWall),
        createProductionMessagesModule(mainGeneration),
        createProductionLearningModule(learningRepository, promptContext),
        createWalletModule({ getChatIdentity: getSillyTavernChatIdentity }),
        createProductionShopModule({
            getChatIdentity: getSillyTavernChatIdentity,
            captureChatSurface: getSillyTavernChatSurface,
            mainGeneration,
            setPrompt: value => setSillyTavernPrompt('xiaobai_os_shop_effects', value),
            subscribePrompt: subscribeShopPromptEvents,
        }),
        createProductionBankModule({
            getChatIdentity: getSillyTavernChatIdentity,
            getCurrentAssistantTurn: getSillyTavernAssistantTurnCount,
            mainGeneration,
        }),
        createProductionGameModule({ getChatIdentity: getSillyTavernChatIdentity, mainGeneration }),
        createProductionMapModule({
            settings,
            getChatIdentity: getSillyTavernChatIdentity,
            setPrompt: value => setSillyTavernPrompt('xiaobai_os_map_context', value, 3),
            subscribePrompt: subscribeMapPromptEvents,
        }),
        createProductionTasksModule({
            settings,
            getChatIdentity: getSillyTavernChatIdentity,
            getPlayerDisplayName: () => getSillyTavernChatSurface()?.playerName ?? '玩家',
            getObservedAssistantCount: () => getSillyTavernAssistantTurnCount(),
            mainGeneration,
            setPrompt: value => setSillyTavernPrompt('xiaobai_os_tasks_context', value),
            subscribePrompt: subscribeTaskPromptEvents,
            notifyCompletion: ({ title, message }) => {
                // Same global toast as /echo severity=success, without parsing task text as commands/macros.
                const toastr = window.toastr as unknown as {
                    success?(message: string, title: string, options: { escapeHtml: boolean; timeOut: number }): void;
                } | undefined;
                toastr?.success?.(message, title, { escapeHtml: true, timeOut: 8_000 });
            },
        }),
        createProductionWorldModule({
            getChatIdentity: () => getSillyTavernChatIdentity()?.key ?? '',
            setPrompt: value => setSillyTavernPrompt('xiaobai_os_world_context', value, 4),
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
