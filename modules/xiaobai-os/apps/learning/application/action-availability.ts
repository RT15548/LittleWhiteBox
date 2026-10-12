import type { LearningClientState } from '../types.js';

type Activity = Pick<LearningClientState, 'busy' | 'chatBusy' | 'workbenchBusy' | 'preparation'>;
export function learningActionLane(name: string, target: unknown): string {
    return name === 'talk' || name === 'retry-chat' ? target === 'workbench' ? 'workbench-talk' : 'talk' : name;
}
const contextActions = new Set(['language', 'teacher', 'forget-conversation', 'resume', 'rate', 'seek', 'verify-teacher', 'adopt-teacher', 'share-course', 'reset-learning']);
const preparationConcurrentActions = new Set(['submit', 'bookmark', 'say', 'play', 'save-note', 'delete-note']);
const immediateActions = new Set(['approve-operation', 'records', 'export', 'pause', 'stop', 'cancel', 'cancel-chat', 'cancel-companion', 'cancel-preparation',
    'tts-settings', 'research-settings', 'dismiss-source']);
const recoveryActions = new Set(['read', 'verify', 'retry-save', 'adopt-server', 'verify-teacher', 'adopt-teacher', 'verify-workbench', 'adopt-workbench', 'verify-wallet', 'adopt-wallet', 'export']);

/** One activity policy for native controls and Host dispatch. Reading never waits for model work. */
export function learningActionBusy(name: string, state: Activity): boolean {
    if (immediateActions.has(name)) { return false; }
    if (name === 'talk' || name === 'retry-notification') { return state.chatBusy; }
    if (name === 'workbench-talk') { return state.workbenchBusy; }
    if (contextActions.has(name)) { return state.busy || state.chatBusy || state.workbenchBusy || !!state.preparation?.running; }
    return state.busy || !!state.preparation?.running && !preparationConcurrentActions.has(name);
}

export function learningActionAvailable(name: string, state: Activity & Pick<LearningClientState, 'storage' | 'chatStorage' | 'workbenchStorage'>): boolean {
    if (name === 'reset-learning') { return !learningActionBusy(name, state) && state.storage === 'invalid'; }
    if (name === 'talk' || name === 'workbench-talk') {
        return !learningActionBusy(name, state) && (name === 'talk' ? state.chatStorage : state.workbenchStorage) === 'ready';
    }
    return !learningActionBusy(name, state) && (immediateActions.has(name) || recoveryActions.has(name)
        || (name === 'teacher' ? state.chatStorage === 'ready' : state.storage === 'ready'));
}
