import { getContext } from '../../../../../../../../extensions.js';
import { createPromptContextAdapter } from '../../../host/prompt-context/adapter.js';
import { selectKnownPeople, type KnownPerson } from '../../../host/prompt-context/known-people.js';
import { projectionMarker, type ChatMessage } from '../application/projection.js';
import { getStorySummaryCharacters } from '../../../../story-summary/story-summary.js';
import type { MessagesChatPort } from '../application/timeline.js';
import type { MessageContact, MessageSegment, PrivateMessage } from '../../../domains/messages/types.js';
import { projectCommunicationChronology } from '../application/communication-chronology.js';
import { privateMessageScan } from '../prompt/world-info-scan.js';
import { applyTextFilterRules } from '../../../../story-summary/vector/utils/text-filter.js';
import { getTextFilterRules } from '../../../../story-summary/data/config.js';

export function createMessagesContext(chat: MessagesChatPort, readSegments: () => readonly MessageSegment[]) {
    function people(name = '', throughMessageIndex = chat.messages().length - 1): KnownPerson[] {
        return getStorySummaryCharacters({ name, throughMessageIndex,
            maxCharacters: name ? 8000 : 12000, maxPeople: 200 }) as KnownPerson[];
    }
    function knownPeople(): KnownPerson[] {
        // name1 identifies the player only for exclusion; it is not a candidate source.
        return selectKnownPeople(people(), getContext().name1);
    }
    async function capture(contact: MessageContact, history: PrivateMessage[], incoming: PrivateMessage) {
        // One live configuration snapshot for this capture, not a config clone per floor.
        const rules = getTextFilterRules();
        const adapter = createPromptContextAdapter({ cleanMessageText: text => applyTextFilterRules(text, rules) });
        const messages = chat.messages();
        const throughMessageIndex = messages.length - 1;
        const chronology = projectCommunicationChronology(readSegments(), messages, history, incoming);
        const excluded = messages.flatMap((message: ChatMessage, index) => projectionMarker(message) ? [index] : []);
        const snapshot = await adapter.capture({ throughMessageIndex, excludeMessageIndices: excluded,
            worldInfoScanMessages: privateMessageScan(contact, history, incoming) });
        return { ...snapshot.contextSnapshot, people: people(contact.name, throughMessageIndex), chronology };
    }
    return { knownPeople, capture };
}

export type MessagesContext = ReturnType<typeof createMessagesContext>;
