// 悬浮菜单“数目”数字输入框：三个 Provider（NovelAI / SD WebUI / ComfyUI）的楼层菜单与全局悬浮菜单共用。
// 这里只负责 DOM 构建、值同步与防抖提交；设置的读写由各 Provider 通过回调注入。
// 空值 = 跟随预设；1-20 的整数 = 覆盖（settings.overrideMaxImages）。

import {
    MAX_IMAGES_INVALID_INPUT_MESSAGE,
    MAX_IMAGES_OVERRIDE_MAX,
    MAX_IMAGES_OVERRIDE_MIN,
    buildMaxImagesInputTitle,
    normalizeMaxImagesOverride,
    parseMaxImagesInput,
} from './max-images-override.js';

/** 点步进箭头会连续触发 input/change，防抖后才真正保存，避免每点一次弹一次“已保存”。 */
export const MAX_IMAGES_INPUT_DEBOUNCE_MS = 350;

export const MAX_IMAGES_INPUT_CLASS = 'nd-max-images-input';
export const MAX_IMAGES_RESET_CLASS = 'nd-max-images-reset';

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
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--nd-border-subtle);
    border-radius: 6px;
    color: var(--nd-text-primary);
    color-scheme: dark;
    font-family: inherit;
    font-size: 11px;
    text-align: center;
    outline: none;
    transition: border-color 0.2s;
}
.nd-max-images-input::placeholder { color: var(--nd-text-muted); opacity: 1; }
.nd-max-images-input:hover { border-color: rgba(255, 255, 255, 0.2); }
.nd-max-images-input:focus { border-color: rgba(255, 255, 255, 0.3); }
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
.nd-max-images-reset:hover { color: var(--nd-text-primary); background: rgba(255, 255, 255, 0.1); }
.nd-max-images-reset[hidden] { display: none; }
`;

/** 构建“数目”行：label + 数字输入框 + 小重置按钮。返回的 row 由调用方放进“尺寸”行后面。 */
export function createMaxImagesInputRow(doc = document) {
    const row = doc.createElement('div');
    row.className = 'nd-row';

    const label = doc.createElement('span');
    label.className = 'nd-label';
    label.textContent = '数目';

    const field = doc.createElement('div');
    field.className = 'nd-max-images-field';

    const input = doc.createElement('input');
    input.className = MAX_IMAGES_INPUT_CLASS;
    input.setAttribute('type', 'number');
    input.setAttribute('min', String(MAX_IMAGES_OVERRIDE_MIN));
    input.setAttribute('max', String(MAX_IMAGES_OVERRIDE_MAX));
    input.setAttribute('step', '1');
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('aria-label', '出图数目');
    input.setAttribute('placeholder', '跟随预设');
    input.setAttribute('title', buildMaxImagesInputTitle(0));

    const reset = doc.createElement('button');
    reset.className = MAX_IMAGES_RESET_CLASS;
    reset.setAttribute('type', 'button');
    reset.setAttribute('title', '跟随预设');
    reset.setAttribute('aria-label', '跟随预设');
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
 * 把输入框同步到当前设置。输入框正处于聚焦编辑状态时不覆盖用户正在输入的内容（force 除外：
 * 提交、恢复、重置时需要把输入框落回真实值）。
 */
export function syncMaxImagesInput(input, { override, presetMaxImages, force = false } = {}) {
    if (!input) return;
    const current = normalizeMaxImagesOverride(override);
    input.setAttribute('placeholder', '跟随预设');
    input.setAttribute('title', buildMaxImagesInputTitle(presetMaxImages));

    const editing = input.ownerDocument?.activeElement === input;
    if (force || !editing) {
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
 * - input 事件（键盘输入、点步进箭头）与 change 事件：防抖后提交；input 防抖只提交合法的 1-20，
 *   中途的空值/非法值留到最终提交；
 * - blur / Enter：立即做最终提交（空 = 清除覆盖，非法 = 恢复原值并提示，不写入）；
 * - 重置按钮：立即清除覆盖。
 * 回调：getOverride() 读当前覆盖；save(value) 写入（value 为 null 即清除）并返回是否成功；
 * refresh(input, force) 把单个输入框落回真实值；notify(message) 提示。
 */
export function bindMaxImagesInput(input, { getOverride, save, refresh, notify, delayMs = MAX_IMAGES_INPUT_DEBOUNCE_MS } = {}) {
    if (!input) return { flush() {}, cancel() {} };
    const reset = findResetButton(input);
    let timer = null;
    let queue = Promise.resolve();

    const cancel = () => {
        if (timer != null) globalThis.clearTimeout(timer);
        timer = null;
    };

    // 保存串行执行，并和执行时的最新覆盖值比较，所以 change + blur 重复触发不会重复保存。
    const enqueueSave = (next, { settle }) => {
        queue = queue.then(async () => {
            if (normalizeMaxImagesOverride(getOverride?.()) === next) {
                if (settle) refresh?.(input, true);
                return;
            }
            const ok = await save?.(next);
            if (settle || !ok) refresh?.(input, true);
        }).catch(() => {});
        return queue;
    };

    const commit = ({ final }) => {
        cancel();
        const parsed = parseMaxImagesInput(input.value, { badInput: input.validity?.badInput === true });
        if (parsed.status === 'invalid') {
            if (!final) return queue;
            refresh?.(input, true);
            notify?.(MAX_IMAGES_INVALID_INPUT_MESSAGE);
            return queue;
        }
        if (parsed.status === 'empty' && !final) return queue;
        return enqueueSave(parsed.status === 'empty' ? null : parsed.value, { settle: final });
    };

    const schedule = ({ final }) => {
        cancel();
        timer = globalThis.setTimeout(() => {
            timer = null;
            void commit({ final });
        }, delayMs);
    };

    input.addEventListener('input', () => schedule({ final: false }));
    input.addEventListener('change', () => schedule({ final: true }));
    input.addEventListener('blur', () => { void commit({ final: true }); });
    input.addEventListener('keydown', (event) => {
        // 菜单里的按键不要冒泡成酒馆的全局快捷键。
        event.stopPropagation?.();
        if (event.key === 'Enter') {
            event.preventDefault?.();
            void commit({ final: true });
        }
    });

    reset?.addEventListener('click', (event) => {
        event.stopPropagation?.();
        cancel();
        void enqueueSave(null, { settle: true });
    });

    return {
        flush: () => commit({ final: true }),
        cancel,
    };
}
