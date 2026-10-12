import type { LearningMessage } from '../agent/messages.js';

/** One runtime-only owner of reply visibility; storage confirms facts, not message publication. */
export function createLearningPublication(messages: LearningMessage[], options: {
    transactional: boolean; current: () => boolean;
}) {
    function discard() {
        for (const message of messages) {
            if (message.contentVisibility) { message.contentVisibility = 'private'; }
        }
    }
    return {
        begin(message: LearningMessage) { if (options.transactional) { message.contentVisibility = 'pending-response'; } },
        complete(message: LearningMessage, toolsSucceeded = true) {
            if (message.contentVisibility === 'pending-response') { message.contentVisibility = options.current() && toolsSucceeded ? 'pending-save' : 'private'; }
        },
        discard,
        confirmSave() {
            for (const message of messages) {
                if (message.contentVisibility === 'pending-save') { delete message.contentVisibility; }
            }
        },
    };
}
