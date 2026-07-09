import { ref } from 'vue';
import type { TavernSaveFeedback } from '../tavern-app-context';

export const TAVERN_SAVE_FEEDBACK_RESET_MS = 1800;

export function useTavernSaveFeedback() {
    const feedback = ref<TavernSaveFeedback>({ status: 'idle', error: '' });
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    function resetSaveFeedback() {
        if (resetTimer !== null) {
            clearTimeout(resetTimer);
            resetTimer = null;
        }
        feedback.value = { status: 'idle', error: '' };
    }

    function beginSaveFeedback() {
        resetSaveFeedback();
        feedback.value = { status: 'saving', error: '' };
    }

    function completeSaveFeedback(result: { ok: boolean; error?: string }) {
        if (resetTimer !== null) {
            clearTimeout(resetTimer);
        }
        const status = result.ok ? 'success' : 'error';
        feedback.value = { status, error: result.error || '' };
        resetTimer = setTimeout(() => {
            if (feedback.value.status !== status) {return;}
            feedback.value = { status: 'idle', error: '' };
            resetTimer = null;
        }, TAVERN_SAVE_FEEDBACK_RESET_MS);
        (resetTimer as { unref?: () => void }).unref?.();
    }

    return {
        feedback,
        resetSaveFeedback,
        beginSaveFeedback,
        completeSaveFeedback,
    };
}
