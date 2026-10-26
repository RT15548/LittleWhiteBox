import { TASK_SAVE_COPY } from './task-save-copy.js';
import { runTaskSave, TASK_SAVE_ERROR } from './task-save-operation.js';

// The popup owns this short-lived state. Persistence remains with the task store.
export function createTaskEditorSaveHandler(editor, save, affirmative) {
    let saving = false;
    const error = document.createElement('div');
    error.className = 'task-save-error';
    error.setAttribute('role', 'alert');
    error.hidden = true;
    editor.append(error);

    return async popup => {
        if (saving) return false;
        if (popup.result !== affirmative) return true;
        saving = true;
        // Keep errors outside the scrollable form, next to the action to retry.
        popup.buttonControls.before(error);
        error.hidden = true;
        const button = popup.okButton;
        const contents = [...button.childNodes];
        const controls = [...editor.querySelectorAll('input, textarea, select, button')];
        const disabled = controls.map(control => control.disabled);
        const active = document.activeElement;
        const buttons = [popup.okButton, popup.cancelButton, popup.closeButton].filter(Boolean);
        const preventInteraction = event => { event.preventDefault(); event.stopImmediatePropagation(); };
        for (const control of controls) control.disabled = true;
        for (const control of buttons) {
            control.setAttribute('aria-disabled', 'true');
            control.addEventListener('click', preventInteraction, true);
        }
        popup.dlg.setAttribute('aria-busy', 'true');
        const spinner = document.createElement('i');
        spinner.className = 'fa-solid fa-spinner fa-spin';
        spinner.setAttribute('aria-hidden', 'true');
        button.replaceChildren(spinner, document.createTextNode(` ${TASK_SAVE_COPY.saving}`));
        try {
            await runTaskSave(save);
            // Escape/Enter can attempt another close while the request is pending.
            // The host clears result/value on a refused close; restore this success.
            popup.result = affirmative;
            popup.value = affirmative;
            return true;
        } catch (cause) {
            error.dataset.saveStatus = cause?.code || TASK_SAVE_ERROR.FAILED;
            const status = cause?.code === TASK_SAVE_ERROR.UNCONFIRMED ? TASK_SAVE_COPY.unconfirmed
                : cause?.code === TASK_SAVE_ERROR.PARTIAL ? TASK_SAVE_COPY.partiallySaved : TASK_SAVE_COPY.failed;
            console.error(`[循环任务] ${status}`, cause);
            error.textContent = `${status}：${cause?.message || TASK_SAVE_COPY.retry}`;
            error.hidden = false;
            return false;
        } finally {
            saving = false;
            button.replaceChildren(...contents);
            popup.dlg.removeAttribute('aria-busy');
            controls.forEach((control, index) => { control.disabled = disabled[index]; });
            for (const control of buttons) {
                control.removeAttribute('aria-disabled');
                control.removeEventListener('click', preventInteraction, true);
            }
            if (!error.hidden) active?.focus();
        }
    };
}
