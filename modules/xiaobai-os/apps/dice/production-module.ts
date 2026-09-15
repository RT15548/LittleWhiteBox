import type { XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import type { ScopedChatStore } from '../../kernel/contracts.js';
import { createAppRuntimeGroup } from '../../kernel/runtime-group.js';
import { saveSillyTavernChat } from '../../host/sillytavern-chat-save.js';
import { isGenerating, isChatSaving, updateMessageBlock } from '../../../../../../../../script.js';
import { DICE_APP_DESCRIPTOR } from './descriptor.js';
import { DICE_PARTITION, type DicePartition } from './partition.js';
import { createDiceController } from './host/controller.js';
import { createDiceGenerationAdapter } from './host/generation-adapter.js';
import { createDiceMessageDisplay } from './host/message-display.js';
import { captureDiceChat, ensureDiceDisplayRule, isDiceMessageBeingEdited } from './host/sillytavern-port.js';
import { clearDiceMessageData, type DiceHostMessage } from './host/message-records.js';
import { createEncounterRuntime } from './host/encounter-runtime.js';
import { createEncounterDisplay } from './host/encounter-display.js';
import type { EncounterReferences } from './protocol/encounter-prompt.js';

export function createProductionDiceModule(references: (identityKey: string) => Promise<EncounterReferences>,
    isAuxiliaryMessage: (message: DiceHostMessage) => boolean): XiaobaiOsAppModule {
    let cleanup: (() => Promise<void>) | null = null;
    return {
        descriptor: DICE_APP_DESCRIPTOR, partition: DICE_PARTITION, capabilities: [],
        async install(context) {
            const store = context.partition as ScopedChatStore<DicePartition>;
            let running = false;
            const enabled = () => running && store.peekCurrent()?.identityKey === captureDiceChat()?.key
                && (store.peekCurrent()?.value?.actionChecksEnabled ?? false);
            const generation = createDiceGenerationAdapter(enabled, () => display.refresh(),
                (target, candidate, signal) => display.reveal(target, candidate, signal));
            const display = createDiceMessageDisplay(generation, enabled);
            const encountersEnabled = () => running && store.peekCurrent()?.identityKey === captureDiceChat()?.key
                && (store.peekCurrent()?.value?.encountersEnabled ?? false);
            const encounters = createEncounterRuntime({ enabled: encountersEnabled, references, isAuxiliaryMessage,
                changed: message => encounterDisplay.refresh(message) });
            const encounterDisplay = createEncounterDisplay(encounters);
            context.execution.addCleanup(store.subscribe(display.refresh));
            const controller = createDiceController(store, context.files, ensureDiceDisplayRule,
                feature => feature === 'actionChecksEnabled' ? generation.cancel() : encounters.cancel());
            cleanup = async () => {
                if (isGenerating() || isChatSaving) { throw new Error('请等回复和保存结束，再清理 Dice 数据。'); }
                const source = captureDiceChat();
                if (!source) { throw new Error('请先打开要清理的聊天。'); }
                await controller.disable();
                await generation.settled();
                const current = () => captureDiceChat()?.chat === source.chat && captureDiceChat()?.key === source.key;
                if (!current()) { throw new Error('聊天已切换。'); }
                if (source.chat.some((_message, index) => isDiceMessageBeingEdited(index))) { throw new Error('请先结束消息编辑，再清理 Dice 数据。'); }
                const changed = clearDiceMessageData(source.chat);
                // Explicit data removal also removes the displayed slots. Never repaint a user's editor.
                for (const message of changed) { updateMessageBlock(source.chat.indexOf(message), message); }
                const result = await saveSillyTavernChat(current);
                if (result.status !== 'confirmed') { throw new Error('还不确定 Dice 记录是否清理成功，请重新加载聊天后再试。'); }
                if (!current()) { throw new Error('聊天已切换，未继续清理 Dice 数据。'); }
                display.refresh();
                encounterDisplay.refresh();
            };
            // The OS binding lifecycle loads the current chat's partitions.
            // Background listeners also run on the welcome screen, without a chat.
            const background = {
                startBackground() { running = true; generation.start(); display.start(); encounters.start(); encounterDisplay.start(); },
                async stopBackground() { running = false; display.stop(); encounterDisplay.stop(); encounters.stop(); await generation.stop(); },
                handleChatChanged() { generation.cancel(); encounters.cancel(); display.refresh(); encounterDisplay.refresh(); },
                cancelAll() { generation.cancel(); encounters.cancel(); },
            };
            context.execution.addCleanup(background.stopBackground);
            return createAppRuntimeGroup(controller, [background]);
        },
        async dispose(runtime) { await runtime.stopBackground?.(); cleanup = null; },
        async clearData(context) {
            if (!cleanup) { throw new Error('请先启用小白 OS 并打开要清理的聊天。'); }
            await cleanup();
            await context.removePartition(DICE_PARTITION.key);
        },
    };
}
