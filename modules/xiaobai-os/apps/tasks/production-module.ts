import type { XiaobaiOsSettingsRepository } from '../../host/settings-repository.js';
import type { MainGenerationRuntime } from '../../host/main-generation-runtime.js';
import type { XiaobaiOsChatIdentity } from '../../types.js';
import type { UserTransactions } from '../../kernel/user-transactions.js';
import { getSillyTavernChatSurface } from '../../host/sillytavern-context.js';
import { latestTaskEvidenceDigest } from '../../capabilities/maintenance/accepted-turn-source.js';
import { createAppRuntimeGroup } from '../../kernel/runtime-group.js';
import { createTaskGenerationRequests } from './generation/request.js';
import { createTaskGenerationContextAdapter } from './host/context-adapter.js';
import { createTaskController } from './host/controller.js';
import { createTaskCompletionRuntime, type TaskCompletionNotice } from './host/completion-runtime.js';
import { createTaskMaintenanceParticipant } from './host/maintenance-participant.js';
import { createTaskPromptRuntime, type TaskPromptEventHandlers } from './host/prompt-runtime.js';
import { createTaskSettingsRuntime } from './host/settings-runtime.js';
import { createTasksModule } from './module.js';
import { TASK_PROMPTS } from './prompt-registration.js';
import { createTasksManagement } from './management/participant.js';
import { createTasksService } from './application/service.js';
import type { PartitionStore } from '../../kernel/contracts.js';
import type { TaskDomainV1 } from '../../domains/tasks/types.js';
import type { XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import { MANAGEMENT_CAPABILITY } from '../../capabilities/management/index.js';
import { ECONOMY_READ_CAPABILITY } from '../../capabilities/economy/index.js';

export interface ProductionTasksModuleDependencies {
    settings: XiaobaiOsSettingsRepository;
    getChatIdentity: () => XiaobaiOsChatIdentity | null;
    getPlayerDisplayName: () => string;
    userTransactions: () => UserTransactions | null;
    mainGeneration: MainGenerationRuntime;
    subscribePrompt(handlers: TaskPromptEventHandlers): () => void;
    notifyCompletion(notice: TaskCompletionNotice): void;
}

export function createProductionTasksModule(dependencies: ProductionTasksModuleDependencies): XiaobaiOsAppModule {
    const service = {
        getPlayerDisplayName: dependencies.getPlayerDisplayName,
        getEvidenceDigest: () => latestTaskEvidenceDigest(getSillyTavernChatSurface()),
        getStoryLabel: () => getSillyTavernChatSurface()?.assistantName ?? '',
    };
    const module = createTasksModule({
        ...service,
        userTransactions: dependencies.userTransactions,
        async install({ tasks, store, economy, agent, maintenance, mapContext, worldContext, prompts, execution }) {
            const injection = prompts.register(TASK_PROMPTS);
            execution.addCleanup(injection.dispose);
            const unregisterParticipant = maintenance.registerParticipant(createTaskMaintenanceParticipant({
                tasks,
                readSettings: () => dependencies.settings.read()?.apps.tasks ?? null,
                captureSurface: getSillyTavernChatSurface,
            }));
            execution.addCleanup(unregisterParticipant);
            const generation = createTaskGenerationRequests({
                gateway: agent,
                tasks,
                context: createTaskGenerationContextAdapter({
                    readMapContext: mapContext.readPromptContext,
                    readWorldContext: worldContext.readCurrent,
                }),
                isMainGenerationActive: dependencies.mainGeneration.isActive,
            });
            const controller = createTaskController({
                tasks,
                economy,
                generation,
                settings: dependencies.settings,
                maintenance: maintenance.runner,
                getChatIdentity: dependencies.getChatIdentity,
                isMainGenerationActive: dependencies.mainGeneration.isActive,
                subscribeGeneration: dependencies.mainGeneration.subscribe,
                execution,
            });
            const prompt = createTaskPromptRuntime({
                tasks,
                setPrompt: value => injection.set('context', value),
                subscribe: dependencies.subscribePrompt,
            });
            const settings = createTaskSettingsRuntime({
                settings: dependencies.settings,
                maintenance: maintenance.runner,
            });
            const completion = createTaskCompletionRuntime({ store, notify: dependencies.notifyCompletion });
            const runtime = createAppRuntimeGroup(controller, [prompt, settings, completion]);
            const currentEvidence = () => {
                const identity = dependencies.getChatIdentity()?.key;
                const surface = getSillyTavernChatSurface();
                return identity && surface?.identityKey === identity
                    ? { identity, digest: latestTaskEvidenceDigest(surface) } : null;
            };
            const initializeCurrent = () => {
                const evidence = currentEvidence();
                if (!evidence) {return;}
                void tasks.ensureReady(evidence.digest, evidence.identity).catch(error => {
                    console.error('[LittleWhiteBox] 任务剧情基线初始化失败', error);
                });
            };
            return {
                ...runtime,
                activate(context) {
                    initializeCurrent();
                    return runtime.activate?.(context);
                },
                startBackground() {void runtime.startBackground?.(); initializeCurrent();},
                handleChatChanged() {void runtime.handleChatChanged?.(); initializeCurrent();},
            };
        },
    });
    return { ...module, register(context) {
        const registry = context.useCapability(MANAGEMENT_CAPABILITY);
        const tasks = createTasksService(context.partition as PartitionStore<TaskDomainV1>, context.files,
            context.useCapability(ECONOMY_READ_CAPABILITY), { ...service, userTransactions: dependencies.userTransactions() ?? undefined });
        try {
            const unregister = registry.register(createTasksManagement(tasks));
            return () => { unregister(); tasks.dispose(); };
        } catch (error) { tasks.dispose(); throw error; }
    } };
}
