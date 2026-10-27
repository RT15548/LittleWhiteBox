import { TASK_SAVE_COPY } from './task-save-copy.js';
import { runTaskSave, TASK_SAVE_ERROR } from './task-save-operation.js';

export function createTaskEditorSaveHandler(editor, save, affirmative) {
    let saving = null;
    let detached = false;
    const error = document.createElement('div');
    error.className = 'task-save-error';
    error.setAttribute('role', 'alert');
    error.hidden = true;
    editor.append(error);

    return async popup => {
        if (popup.result !== affirmative) {
            detached = true;
            return true;
        }
        if (saving) return false;
        let editedWhileSaving = false;
        const onEdit = () => { editedWhileSaving = true; };
        editor.addEventListener('input', onEdit);
        editor.addEventListener('change', onEdit);
        popup.buttonControls.before(error);
        error.hidden = true;
        const button = popup.okButton;
        const contents = [...button.childNodes];
        button.setAttribute('aria-disabled', 'true');
        button.textContent = TASK_SAVE_COPY.saving;
        popup.dlg?.setAttribute('aria-busy', 'true');
        const promise = runTaskSave(save);
        saving = promise;
        try {
            await promise;
            if (detached) {
                toastr.success(TASK_SAVE_COPY.saved);
                return false;
            }
            if (editedWhileSaving) return false;
            popup.result = affirmative;
            popup.value = affirmative;
            return true;
        } catch (cause) {
            if (!detached) {
                error.dataset.saveStatus = cause?.code || TASK_SAVE_ERROR.FAILED;
                error.textContent = TASK_SAVE_COPY.failed;
                error.hidden = false;
            } else toastr.error(TASK_SAVE_COPY.failed);
            console.error(`[循环任务] ${TASK_SAVE_COPY.failed}`, cause);
            return false;
        } finally {
            if (saving === promise) saving = null;
            editor.removeEventListener('input', onEdit);
            editor.removeEventListener('change', onEdit);
            button.removeAttribute('aria-disabled');
            button.replaceChildren(...contents);
            popup.dlg?.removeAttribute('aria-busy');
        }
    };
}
