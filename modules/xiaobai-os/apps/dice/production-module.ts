import type { XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import { PROMPT_INJECTION_CAPABILITY } from '../../capabilities/prompt-injection/index.js';
import { DICE_CHECK_PROMPTS, DICE_ENCOUNTER_PROMPTS } from './prompt-registration.js';
import type { XiaobaiOsSettingsRepository } from '../../host/settings-repository.js';
import { createAppRuntimeGroup } from '../../kernel/runtime-group.js';
import { saveSillyTavernChat } from '../../host/sillytavern-chat-save.js';
import { isChatSaving, updateMessageBlock } from '../../../../../../../../script.js';
import { isGenerating } from '../../../../shared/common/sillytavern-generation-state.js';
import { DICE_APP_DESCRIPTOR } from './descriptor.js';
import { createDiceController } from './host/controller.js';
import { createDiceGenerationAdapter } from './host/generation-adapter.js';
import { createDiceMessageDisplay } from './host/message-display.js';
import { captureDiceChat, ensureDiceDisplayRule, isDiceMessageBeingEdited } from './host/sillytavern-port.js';
import { clearDiceMessageData, collectDiceCheckIds, type DiceHostMessage, type DiceTarget } from './host/message-records.js';
import { createEncounterRuntime } from './host/encounter-runtime.js';
import { createEncounterDisplay } from './host/encounter-display.js';
import type { EncounterReferences } from './protocol/encounter-prompt.js';
import { ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY } from '../../capabilities/economy/index.js';
import type { PartitionStore } from '../../kernel/contracts.js';
import { DICE_PARTITION, type DiceData } from './partition.js';
import { createDiceSheetService } from './application/sheet-service.js';
import { createDiceRerollService } from './application/reroll-service.js';
import { createDiceResults } from './application/results.js';
import { DiceOperationError } from './application/operation-error.js';

export function createProductionDiceModule(settings: XiaobaiOsSettingsRepository,
    references: (identityKey: string) => Promise<EncounterReferences>,
    isAuxiliaryMessage: (message: DiceHostMessage) => boolean, upgrade: () => Promise<void>) {
    let cleanup: (() => Promise<void>) | null = null;
    let readReplyPaused: ReturnType<typeof createDiceGenerationAdapter>['isReplyPaused'] | null = null;
    const replyListeners = new Set<() => void>();
    const replyChanged = () => { for (const listener of replyListeners) { listener(); } };
    const replyPause = {
        isPaused: (message: unknown) => readReplyPaused?.(message) ?? false,
        subscribe(listener: () => void) { replyListeners.add(listener); return () => { replyListeners.delete(listener); }; },
    };
    const module: XiaobaiOsAppModule = {
        descriptor: DICE_APP_DESCRIPTOR, partition: DICE_PARTITION, capabilities: [ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY, PROMPT_INJECTION_CAPABILITY],
        async install(context) {
            const prompts = context.useCapability(PROMPT_INJECTION_CAPABILITY);
            const checkPrompts = prompts.register(DICE_CHECK_PROMPTS);
            context.execution.addCleanup(checkPrompts.dispose);
            const encounterPrompts = prompts.register(DICE_ENCOUNTER_PROMPTS);
            context.execution.addCleanup(encounterPrompts.dispose);
            await upgrade();
            const sheets = createDiceSheetService(context.partition as PartitionStore<DiceData>, context.files);
            await sheets.refresh();
            const results = createDiceResults(context.partition as PartitionStore<DiceData>);
            context.execution.addCleanup(results.dispose);
            const rerolls = createDiceRerollService<DiceTarget>(context.partition as PartitionStore<DiceData>, context.files,
                context.useCapability(ECONOMY_READ_CAPABILITY), results, target => generation.current(target), {
                    onError(error) {
                        console.error('[LittleWhiteBox] Dice result save failed', error);
                        (window.toastr as unknown as { error(message: string): void }).error(new DiceOperationError('dice_result_save_failed').message);
                    },
                });
            context.execution.addCleanup(rerolls.dispose);
            let running = false;
            const enabled = () => running && !!captureDiceChat() && settings.read()!.apps.dice.actionChecksEnabled;
            const generation = createDiceGenerationAdapter(enabled, () => settings.read()!.apps.dice.actionCheckFrequency,
                () => { display.refresh(); replyChanged(); },
                (target, candidate, signal) => display.reveal(target, candidate, signal), () => settings.read()!.apps.dice.actionCheckRule,
                sheets.read, rerolls, results, {
                    setRules: content => checkPrompts.set('rules', content),
                    setResult: content => checkPrompts.set('result', content),
                });
            const display = createDiceMessageDisplay(generation, enabled);
            readReplyPaused = generation.isReplyPaused;
            context.execution.addCleanup(() => { readReplyPaused = null; replyChanged(); });
            const encountersEnabled = () => running && !!captureDiceChat() && settings.read()!.apps.dice.encountersEnabled;
            const encounters = createEncounterRuntime({ enabled: encountersEnabled, references, isAuxiliaryMessage,
                setPrompt: content => encounterPrompts.set('context', content),
                changed: message => encounterDisplay.refresh(message) });
            const encounterDisplay = createEncounterDisplay(encounters);
            context.execution.addCleanup(settings.subscribe(display.refresh));
            context.execution.addCleanup(sheets.subscribe(display.refresh));
            context.execution.addCleanup(results.subscribe(display.refresh));
            const controller = createDiceController(settings, () => captureDiceChat()?.key ?? '', ensureDiceDisplayRule,
                feature => feature === 'actionChecksEnabled' ? generation.cancel() : encounters.cancel(), sheets);
            cleanup = async () => {
                const assertIdle = () => {
                    if (isGenerating() || isChatSaving) { throw new Error('请等回复和保存结束，再清理 Dice 数据。'); }
                };
                assertIdle();
                const source = captureDiceChat();
                if (!source) { throw new Error('请先打开要清理的聊天。'); }
                await controller.disable();
                await rerolls.idle();
                const current = () => captureDiceChat()?.chat === source.chat && captureDiceChat()?.key === source.key;
                const assertCurrent = () => {
                    if (!current()) { throw new DiceOperationError('dice_target_changed'); }
                    assertIdle();
                    if (source.chat.some((_message, index) => isDiceMessageBeingEdited(index))) { throw new Error('请先结束消息编辑，再清理 Dice 数据。'); }
                };
                assertCurrent();
                const checkIds = collectDiceCheckIds(source.chat);
                // Keep the chat's IDs intact until their independent results are deleted.
                // A failed user-file write can then be retried without a cleanup journal.
                await rerolls.clearResults(checkIds);
                assertCurrent();
                const remainingIds = collectDiceCheckIds(source.chat);
                if (remainingIds.size !== checkIds.size || [...remainingIds].some(id => !checkIds.has(id))) {
                    throw new DiceOperationError('dice_target_changed');
                }
                const changed = clearDiceMessageData(source.chat);
                // Explicit data removal also removes the displayed slots. Never repaint a user's editor.
                for (const message of changed) { updateMessageBlock(source.chat.indexOf(message), message); }
                const result = await saveSillyTavernChat(current);
                if (result.status !== 'confirmed') { throw new Error('还不确定 Dice 记录是否清理成功，请重新加载聊天后再试。'); }
                if (!current()) { throw new Error('聊天已切换，未继续清理 Dice 数据。'); }
                display.refresh();
                encounterDisplay.refresh();
            };
            // Preferences are global; generation still requires a current chat.
            const background = {
                startBackground() { running = true; generation.start(); display.start(); encounters.start(); encounterDisplay.start(); replyChanged(); },
                stopBackground() { running = false; display.stop(); encounterDisplay.stop(); encounters.stop(); generation.stop(); },
                handleChatChanged() { generation.cancel(); encounters.cancel(); display.refresh(); encounterDisplay.refresh(); },
                cancelAll() { generation.cancel(); encounters.cancel(); },
            };
            context.execution.addCleanup(background.stopBackground);
            return createAppRuntimeGroup(controller, [background]);
        },
        async dispose(runtime) { await runtime.stopBackground?.(); cleanup = null; },
        async clearData() {
            if (!cleanup) { throw new Error('请先启用小白 OS 并打开要清理的聊天。'); }
            await cleanup();
            // Chat record cleanup must not clear the paid, user-owned character sheet.
        },
    };
    return { ...module, replyPause };
}
