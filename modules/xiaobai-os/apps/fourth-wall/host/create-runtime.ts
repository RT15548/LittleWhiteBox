import { initAfterAiGate, notifyAfterAiHint, registerAfterAiHandler } from '../../../../../core/after-ai-gate.js';
import { createModuleEvents, event_types } from '../../../../../core/event-manager.js';
import type { XiaobaiOsAppRuntime } from '../../../types.js';
import type { XiaobaiOsSettingsRepository } from '../../../host/settings-repository.js';
import type { XiaobaiOsAgentGateway } from '../../../capabilities/agent/gateway.js';
import {
    captureSillyTavernCommentaryEvent,
    getSillyTavernAfterAiHint,
    getSillyTavernChatSnapshot,
    type CommentaryEventInput,
} from './sillytavern-adapter.js';
import { getSillyTavernChatIdentity } from '../../../host/sillytavern-context.js';
import type { FourthWallChatRepository } from './repository.js';
import { createFourthWallAgentResponse } from './agent-response.js';
import { createCommentaryBubblePresenter } from './commentary-runtime.js';
import { createFourthWallController } from './controller.js';
import { createGatewayContextService } from './context-service.js';
import { createFourthWallImageProtocol } from './image-protocol.js';
import { createFourthWallVoiceProtocol } from './voice-protocol.js';

function subscribeCommentaryEvents(handler: (event: CommentaryEventInput) => unknown): () => void {
    const events = createModuleEvents('xiaobaiOsFourthWallCommentary');
    initAfterAiGate();
    const disposeGate = registerAfterAiHandler(
        'xiaobaiOsFourthWallCommentary',
        ({ chatId, messageId }: { chatId: string; messageId: number }) => {
            void handler({ kind: 'ai_message', chatId, messageId });
        },
    );
    const notify = (data: unknown, source: string) => {
        const hint = getSillyTavernAfterAiHint(data, source);
        if (hint) {notifyAfterAiHint({ ...hint, source, kind: 'xiaobaiOsFourthWallCommentary' });}
    };
    events.on(event_types.MESSAGE_RECEIVED, (data: unknown) => notify(data, 'message_received'));
    events.on(event_types.GENERATION_ENDED, (data: unknown) => notify(data, 'generation_ended'));
    events.on(event_types.MESSAGE_EDITED, (data: unknown) => {
        void handler({ kind: 'edited', data });
    });
    return () => {
        events.cleanup();
        disposeGate();
    };
}

export function createFourthWallRuntime(
    chatRepository: FourthWallChatRepository,
    settingsRepository: XiaobaiOsSettingsRepository,
    agentGateway: XiaobaiOsAgentGateway,
): XiaobaiOsAppRuntime {
    const bubble = createCommentaryBubblePresenter();
    return createFourthWallController({
        chatRepository,
        settingsRepository,
        getChatIdentity: getSillyTavernChatIdentity,
        getChatSnapshot: getSillyTavernChatSnapshot,
        generateResponse: createFourthWallAgentResponse(agentGateway),
        contextService: createGatewayContextService(agentGateway),
        loadAgentConfig: agentGateway.loadConfig,
        imageProtocol: createFourthWallImageProtocol(),
        voiceProtocol: createFourthWallVoiceProtocol(),
        commentary: {
            subscribe: subscribeCommentaryEvents,
            capture: captureSillyTavernCommentaryEvent,
            show: bubble.show,
            hide: bubble.hide,
        },
    });
}
