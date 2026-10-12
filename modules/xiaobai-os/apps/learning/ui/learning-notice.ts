import type { LearningDialogueView } from '../application/message-view.js';

/** File recovery has one visible owner above the panes; other notices stay with their turn. */
export function learningTurnNotice(turn: LearningDialogueView, historyStorage: string, learningStorage: string): string {
    if (turn.notice === 'history-save' && historyStorage !== 'ready') { return ''; }
    if (turn.notice === 'learning-save' && learningStorage !== 'ready') { return ''; }
    return turn.message;
}
