// 悬浮菜单“数目”数字输入框：三个 Provider（NovelAI / SD WebUI / ComfyUI）的楼层菜单与全局悬浮菜单共用。
// 这里只负责 DOM 构建、值同步与防抖提交；设置的读写由各 Provider 通过回调注入。
// 空值 = 跟随预设；0 = 覆盖为“不指定”；1-20 的整数 = 覆盖（settings.overrideMaxImages）。0 是合法覆盖，不能当作“空”。

import {
    MAX_IMAGES_INPUT_COPY,
    MAX_IMAGES_INVALID_INPUT_MESSAGE,
    MAX_IMAGES_OVERRIDE_MAX,
    MAX_IMAGES_OVERRIDE_MIN,
    buildMaxImagesInputTitle,
    buildMaxImagesSavedMessage,
    normalizeMaxImagesOverride,
    parseMaxImagesInput,
} from './max-images-override.js';

/** 点步进箭头会连续触发 input/change，防抖后才真正保存，避免每点一次弹一次“已保存”。 */
export const MAX_IMAGES_INPUT_DEBOUNCE_MS = 350;

export const MAX_IMAGES_INPUT_CLASS = 'nd-max-images-input';
export const MAX_IMAGES_RESET_CLASS = 'nd-max-images-reset';

// 未提交的输入属于这个控件，其他菜单的保存回执不能把它覆盖掉。
const editedInputs = new WeakSet();

/** 外观与同菜单里“尺寸”下拉（.nd-select）一致；三个 Provider 的样式表各自拼入这一段。 */
export const MAX_IMAGES_INPUT_CSS = `
.nd-max-images-field { position: relative; flex: 1; min-width: 0; display: flex; align-items: center; }
.nd-max-images-input {
    flex: 1;
    width: 100%;
    min-width: 0;
    height: auto;
    min-height: 32px;
    margin: 0;
    padding: 6px 8px;
    box-sizing: border-box;
    background: var(--nd-bg-active);
    border: 1px solid var(--nd-border-subtle);
    border-radius: 6px;
    color: var(--nd-text-primary);
    color-scheme: var(--draw-color-scheme);
    font-family: inherit;
    font-size: 11px;
    text-align: center;
    outline: none;
    transition: border-color 0.2s;
}
.nd-max-images-input::placeholder { color: var(--nd-text-muted); opacity: 1; }
.nd-max-images-input:hover { border-color: var(--nd-border-hover); }
.nd-max-images-input:focus { border-color: var(--nd-border-hover); }
.nd-max-images-reset {
    position: absolute;
    top: 50%;
    right: 22px;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--nd-text-muted);
    font-size: 12px;
    line-height: 18px;
    text-align: center;
    cursor: pointer;
}
.nd-max-images-reset:hover { color: var(--nd-text-primary); background: var(--nd-bg-active); }
.nd-max-images-reset[hidden] { display: none; }
`;

/** 构建“数目”行：label + 数字输入框 + 小重置按钮。返回的 row 由调用方放进“尺寸”行后面。 */
export function createMaxImagesInputRow(doc = document) {
    const row = doc.createElement('div');
    row.className = 'nd-row';

    const label = doc.createElement('span');
    label.className = 'nd-label';
    label.textContent = MAX_IMAGES_INPUT_COPY.label;

    const field = doc.createElement('div');
    field.className = 'nd-max-images-field';

    const input = doc.createElement('input');
    input.className = MAX_IMAGES_INPUT_CLASS;
    input.setAttribute('type', 'number');
    input.setAttribute('min', String(MAX_IMAGES_OVERRIDE_MIN));
    input.setAttribute('max', String(MAX_IMAGES_OVERRIDE_MAX));
    input.setAttribute('step', '1');
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('aria-label', MAX_IMAGES_INPUT_COPY.accessibleLabel);
    input.setAttribute('placeholder', MAX_IMAGES_INPUT_COPY.followPreset);
    input.setAttribute('title', buildMaxImagesInputTitle(0));

    const reset = doc.createElement('button');
    reset.className = MAX_IMAGES_RESET_CLASS;
    reset.setAttribute('type', 'button');
    reset.setAttribute('title', MAX_IMAGES_INPUT_COPY.followPreset);
    reset.setAttribute('aria-label', MAX_IMAGES_INPUT_COPY.followPreset);
    reset.setAttribute('hidden', '');
    reset.textContent = '↺';

    field.append(input, reset);
    row.append(label, field);
    return row;
}

function findResetButton(input) {
    return input?.parentNode?.querySelector?.(`.${MAX_IMAGES_RESET_CLASS}`) || null;
}

/**
 * 把输入框同步到当前设置。只保护真实的未提交编辑，而不是仅仅有焦点的控件；
 * 否则其他菜单保存后，未编辑的旧值会在这个控件失焦时被重新提交。
 */
export function syncMaxImagesInput(input, { override, presetMaxImages, force = false } = {}) {
    if (!input) return;
    const current = normalizeMaxImagesOverride(override);
    input.setAttribute('placeholder', MAX_IMAGES_INPUT_COPY.followPreset);
    input.setAttribute('title', buildMaxImagesInputTitle(presetMaxImages));

    if (force || !editedInputs.has(input)) {
        const text = current == null ? '' : String(current);
        if (input.value !== text) input.value = text;
    }

    const reset = findResetButton(input);
    if (reset) {
        if (current == null) reset.setAttribute('hidden', '');
        else reset.removeAttribute('hidden');
    }
}

/**
 * 绑定输入框与重置按钮的交互。
 * - input 事件（键盘输入、点步进箭头）与 change 事件：防抖后提交；input 防抖只提交合法的 0-20，
 *   中途的空值/非法值留到最终提交；
 * - blur / Enter：立即做最终提交（空 = 清除覆盖，非法 = 恢复原值并提示，不写入）；
 * - 重置按钮：立即清除覆盖。
 * 回调：getOverride() 读当前覆盖；save(value) 写入（value 为 null 即清除）并返回是否成功；
 * refresh(input, force) 把单个输入框落回真实值；notify(message) 提示。
 */
export function bindMaxImagesInput(input, { getOverride, save, refresh, notify, delayMs = MAX_IMAGES_INPUT_DEBOUNCE_MS } = {}) {
    if (!input) return { flush() {}, cancel() {}, destroy() {} };
    const reset = findResetButton(input);
    let timer = null;
    let pendingSave = Promise.resolve();
    let submittedRevision = -1;
    let revision = 0;
    let active = true;

    const cancel = () => {
        if (timer != null) globalThis.clearTimeout(timer);
        timer = null;
    };
    const markEdited = () => {
        revision += 1;
        editedInputs.add(input);
    };
    const reportFailure = (error) => {
        console.warn('[DrawMaxImages] Save failed:', error);
        if (active) notify?.(MAX_IMAGES_INPUT_COPY.saveFailed);
    };
    const settle = (savedRevision) => {
        if (!active || savedRevision !== revision) return;
        editedInputs.delete(input);
        refresh?.(input, true);
    };

    // Provider 的设置队列是唯一排序者：提交时立即入队，不等待本控件上一次保存。
    // 同一编辑版本的 Enter / blur 只提交一次；回执仍只结算自己的输入版本。
    const submitSave = (next) => {
        if (submittedRevision === revision) return pendingSave;
        const savedRevision = revision;
        submittedRevision = savedRevision;
        pendingSave = (async () => {
            try {
                // 编辑值即使等于当前设置也必须提交：Provider 队列里可能还有更早的改动。
                if (editedInputs.has(input) || normalizeMaxImagesOverride(getOverride?.()) !== next) await save(next);
                settle(savedRevision);
            } catch (error) {
                reportFailure(error);
                settle(savedRevision);
            }
        })();
        return pendingSave;
    };

    const commit = ({ final }) => {
        cancel();
        if (!active) return pendingSave;
        const parsed = parseMaxImagesInput(input.value, { badInput: input.validity?.badInput === true });
        if (parsed.status === 'invalid') {
            if (!final) return pendingSave;
            settle(revision);
            notify?.(MAX_IMAGES_INVALID_INPUT_MESSAGE);
            return pendingSave;
        }
        if (parsed.status === 'empty' && !final) return pendingSave;
        return submitSave(parsed.status === 'empty' ? null : parsed.value);
    };

    const schedule = ({ final }) => {
        markEdited();
        cancel();
        timer = globalThis.setTimeout(() => {
            timer = null;
            commit({ final }).catch(reportFailure);
        }, delayMs);
    };
    const onInput = () => schedule({ final: false });
    const onChange = () => schedule({ final: true });
    const onBlur = () => { commit({ final: true }).catch(reportFailure); };
    const onKeyDown = (event) => {
        event.stopPropagation?.();
        if (event.key === 'Enter') {
            event.preventDefault?.();
            commit({ final: true }).catch(reportFailure);
        }
    };
    const onReset = (event) => {
        event.stopPropagation?.();
        cancel();
        markEdited();
        input.value = '';
        submitSave(null).catch(reportFailure);
    };
    input.addEventListener('input', onInput);
    input.addEventListener('change', onChange);
    input.addEventListener('blur', onBlur);
    input.addEventListener('keydown', onKeyDown);
    reset?.addEventListener('click', onReset);

    return {
        flush: () => commit({ final: true }),
        cancel,
        destroy() {
            active = false;
            cancel();
            editedInputs.delete(input);
            input.removeEventListener('input', onInput);
            input.removeEventListener('change', onChange);
            input.removeEventListener('blur', onBlur);
            input.removeEventListener('keydown', onKeyDown);
            reset?.removeEventListener('click', onReset);
        },
    };
}

/**
 * 三个 Provider 的悬浮菜单共用的“数目”控制器：建行、同步、绑定、保存、刷新全部输入框都在这里，
 * Provider 只注入自己的设置读写。
 * - getOverride() 读当前覆盖；getPresetMaxImages() 读当前预设的要求出图数；
 * - persistOverride(next, { okText }) 只负责持久化并返回是否成功；本控制器统一同步保存后的输入值；
 * - listInputs() 返回所有已创建的“数目”输入框（楼层菜单 + 全局悬浮菜单）；notify(message) 提示。
 */
export function createMaxImagesController({ getOverride, getPresetMaxImages, persistOverride, listInputs, notify }) {
    const fill = (input, force = false) => {
        syncMaxImagesInput(input, { override: getOverride(), presetMaxImages: getPresetMaxImages(), force });
    };
    const updateAll = () => {
        for (const input of listInputs()) fill(input);
    };
    // value 已由数字输入框校验：0 = 覆盖为不指定，1-20 的整数 = 覆盖，null = 清除覆盖（跟随预设）。
    const save = async (value) => {
        const next = normalizeMaxImagesOverride(value);
        const ok = await persistOverride(next, { okText: buildMaxImagesSavedMessage(next) });
        updateAll();
        return ok;
    };
    return {
        fill,
        updateAll,
        createRow() {
            const row = createMaxImagesInputRow(document);
            fill(row.querySelector(`.${MAX_IMAGES_INPUT_CLASS}`));
            return row;
        },
        bind(input) {
            return bindMaxImagesInput(input, { getOverride, save, refresh: fill, notify });
        },
    };
}
