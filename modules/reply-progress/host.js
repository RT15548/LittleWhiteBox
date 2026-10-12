import { getContext } from '../../../../../extensions.js';
import { eventSource, event_types } from '../../../../../events.js';
import { is_send_press, online_status, streamingProcessor } from '../../../../../../script.js';
import { observeHostRequest } from './request-observer.js';
import { createReplyProgressRuntime } from './runtime.js';

export function createReplyProgressHostRuntime() {
    return createReplyProgressRuntime({
        events: eventSource,
        eventTypes: event_types,
        getTextarea: () => document.querySelector('#send_textarea'),
        getChat: () => getContext().chat,
        getGroupId: () => getContext().groupId,
        getStream: () => streamingProcessor,
        isSendPressed: () => is_send_press,
        observeActions: ({ onStop, onReply }) => {
            const clicked = event => {
                if (event.target.closest?.('#mes_stop')) onStop();
                if (event.isTrusted && event.target.closest?.('#send_but, #option_continue, #mes_continue, #option_regenerate, #chat .swipe_left, #chat .swipe_right')) onReply();
            };
            const keydown = event => {
                if (event.isTrusted && event.target.id === 'send_textarea' && event.key === 'Enter'
                    && !event.isComposing && !event.shiftKey && !event.altKey) onReply();
            };
            document.addEventListener('click', clicked, true);
            document.addEventListener('keydown', keydown, true);
            return () => {
                document.removeEventListener('click', clicked, true);
                document.removeEventListener('keydown', keydown, true);
            };
        },
        observeRequest: (generation, onRequest) => {
            const { mainApi } = getContext();
            // Preparation is not proof that fetch has started. Other APIs
            // keep the generic waiting label rather than wrapping fetch.
            if (mainApi !== 'openai') return null;
            return observeHostRequest({
                events: eventSource, eventTypes: event_types,
                ...generation, onRequest,
            });
        },
        isConnected: () => online_status !== 'no_connection',
    });
}
