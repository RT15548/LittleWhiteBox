import type { LearningMessage } from '../agent/messages.js';

/** One runtime-only owner of reply visibility; storage confirms facts, not message publication. */
export function createLearningPublication(messages: LearningMessage[], options: {
    declared: () => boolean; helpIsPublished: () => boolean; current: () => boolean;
}) {
    function discard() {
        for (const message of messages) {
            if (message.contentVisibility) { message.contentVisibility = 'private'; }
        }
    }
    return {
        begin(message: LearningMessage) { message.contentVisibility = 'pending-response'; },
        complete(message: LearningMessage) {
            const declared = options.declared();
            if (message.contentVisibility === 'pending-response' && options.current()) {
                message.contentVisibility = !declared ? 'private' : options.helpIsPublished() ? undefined : 'pending-save';
            }
            return declared;
        },
        discard,
        confirmSave() {
            for (const message of messages) {
                if (message.contentVisibility === 'pending-save') { delete message.contentVisibility; }
            }
        },
    };
}
