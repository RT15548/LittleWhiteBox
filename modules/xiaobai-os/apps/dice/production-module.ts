import type { XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import type { ScopedChatStore } from '../../kernel/contracts.js';
import { createAppRuntimeGroup } from '../../kernel/runtime-group.js';
import { saveSillyTavernChat } from '../../host/sillytavern-chat-save.js';
import { isGenerating, isChatSaving } from '../../../../../../../../script.js';
import { DICE_APP_DESCRIPTOR } from './descriptor.js';
import { DICE_PARTITION, type DicePartition } from './partition.js';
import { createDiceController } from './host/controller.js';
import { createDiceGenerationAdapter } from './host/generation-adapter.js';
import { createDiceMessageDisplay } from './host/message-display.js';
import { captureDiceChat, ensureDiceDisplayRule } from './host/sillytavern-port.js';
import { clearDiceMessageData } from './host/message-records.js';

export function createProductionDiceModule(): XiaobaiOsAppModule {
    let cleanup: (() => Promise<void>) | null = null;
    return {
        descriptor: DICE_APP_DESCRIPTOR, partition: DICE_PARTITION, capabilities: [],
        async install(context) {
            const store = context.partition as ScopedChatStore<DicePartition>;
            let running = false;
            const enabled = () => running && store.peekCurrent()?.identityKey === captureDiceChat()?.key
                && (store.peekCurrent()?.value?.actionChecksEnabled ?? false);
            const generation = createDiceGenerationAdapter(enabled, () => display.refresh());
            const display = createDiceMessageDisplay(generation, enabled);
            const controller = createDiceController(store, context.files, ensureDiceDisplayRule, generation.cancel);
            cleanup = async () => {
                if (isGenerating() || isChatSaving) { throw new Error('请先结束生成和保存，再清理 Dice 数据。'); }
                const source = captureDiceChat();
                if (!source) { throw new Error('请先打开要清理的聊天。'); }
                await controller.disable();
                await generation.settled();
                const current = () => captureDiceChat()?.chat === source.chat && captureDiceChat()?.key === source.key;
                if (!current()) { throw new Error('聊天已切换。'); }
                clearDiceMessageData(source.chat);
                const result = await saveSillyTavernChat(current);
                if (result.status !== 'confirmed') { throw new Error('聊天清理未确认，请重新加载核实后再清理分区。'); }
                if (!current()) { throw new Error('聊天已切换，未清理分区。'); }
                display.refresh();
            };
            const background = {
                async startBackground() { running = true; await store.read(); generation.start(); display.start(); },
                async stopBackground() { running = false; display.stop(); await generation.stop(); },
                async handleChatChanged() { generation.cancel(); await store.read(); display.refresh(); },
                cancelAll() { generation.cancel(); },
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
