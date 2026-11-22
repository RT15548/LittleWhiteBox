import { DEFAULT_REQUIREMENTS, supportsResponseDelivery } from './protocol.js';

const COPY = {
    off: '已关闭', standard: '已开启', custom: '已开启 · 自定义要求',
    unsupported: '当前预设不支持交付',
    unsaved: '有未保存的修改', saved: '已保存，下轮生效', unavailable: '设置不可用',
    loadError: reason => `无法读取设置：${reason}。可恢复默认后保存。`,
    saveError: reason => `保存失败：${reason}。修改已保留。`,
};

export function deliveryPanelMarkup() {
    return `<div class="xb-assistant-delivery-entry">
        <button id="xb-assistant-delivery-summary" class="xb-assistant-api-summary" type="button" aria-haspopup="dialog" aria-controls="xb-assistant-delivery-popover" aria-expanded="false">
            <span class="xb-assistant-api-summary-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5h16v12H9l-5 4z"/><path d="m8 11 3 3 5-6"/></svg></span>
            <span class="xb-assistant-api-summary-text"><strong>答复交付</strong><small data-delivery-status></small></span>
        </button>
        <section id="xb-assistant-delivery-popover" class="xb-assistant-api-popover" role="dialog" aria-labelledby="xb-assistant-delivery-title" hidden>
            <header class="xb-assistant-api-popover-header"><strong id="xb-assistant-delivery-title">答复交付</strong><button data-delivery-close class="xb-assistant-text-button" type="button">关闭面板</button></header>
            <div class="xb-assistant-api-popover-body xb-assistant-delivery-form">
                <label><input type="checkbox" data-delivery-enabled> 启用答复交付</label>
                <p>实验性功能。你可以在这里为小白助手添加额外的工作要求，调整它最终给出的答复。</p>
                <p data-delivery-availability role="status" hidden></p>
                <label for="xb-assistant-delivery-requirements">工作要求</label>
                <textarea id="xb-assistant-delivery-requirements" rows="6"></textarea>
                <button data-delivery-default type="button">恢复默认要求</button>
                <p>开启或关闭此功能、修改工作要求，都会改变发给模型的开头提示，影响缓存复用。建议在同一个任务中保持设置不变。</p>
                <div class="xb-assistant-delivery-actions"><button data-delivery-save type="button">保存</button><button data-delivery-discard type="button">放弃修改</button></div>
                <small data-delivery-note role="status" aria-live="polite"></small>
            </div>
        </section>
    </div>`;
}

/** The form owns its draft; only a successful save changes future runs. */
export function bindDeliveryPanel(root, { load, save, getProviderConfig, bindPopover, onSaved }) {
    const entry = root.querySelector('.xb-assistant-delivery-entry');
    const summary = entry.querySelector('#xb-assistant-delivery-summary');
    const panel = entry.querySelector('#xb-assistant-delivery-popover');
    const enabled = panel.querySelector('[data-delivery-enabled]');
    const text = panel.querySelector('textarea');
    const status = entry.querySelector('[data-delivery-status]');
    const note = panel.querySelector('[data-delivery-note]');
    const availability = panel.querySelector('[data-delivery-availability]');
    const commit = panel.querySelector('[data-delivery-save]');
    const discard = panel.querySelector('[data-delivery-discard]');
    let saved, recovering = false;
    const draft = () => ({ enabled: enabled.checked, requirements: text.value });
    const dirty = () => recovering || (saved && (enabled.checked !== saved.enabled || text.value !== saved.requirements));
    const refreshStatus = () => {
        const config = getProviderConfig();
        const supported = supportsResponseDelivery(config);
        const label = !saved ? COPY.unavailable : !saved.enabled ? COPY.off : !supported ? COPY.unsupported
            : saved.requirements === DEFAULT_REQUIREMENTS ? COPY.standard : COPY.custom;
        if (status.textContent !== label) status.textContent = label;
        const help = supported ? '' : COPY.unsupported;
        if (availability.textContent !== help) availability.textContent = help;
        availability.hidden = supported;
    };
    const sync = (message = '') => {
        const changed = dirty();
        refreshStatus();
        commit.disabled = !changed;
        discard.disabled = !changed;
        if (changed || message || saved) note.textContent = message || (changed ? COPY.unsaved : '');
    };
    const fill = value => { enabled.checked = value.enabled; text.value = value.requirements; };
    const reload = () => {
        recovering = false;
        try { saved = load(); fill(saved); enabled.disabled = text.disabled = false; sync(); }
        catch (error) {
            saved = null;
            fill({ enabled: false, requirements: DEFAULT_REQUIREMENTS });
            enabled.disabled = text.disabled = true;
            sync(COPY.loadError(error.message || error));
        }
    };
    reload();
    bindPopover({ entry, trigger: summary, panel, closeButton: panel.querySelector('[data-delivery-close]'),
        beforeOpen: () => { if (!dirty()) reload(); },
        focusOnOpen: () => enabled.disabled ? panel.querySelector('[data-delivery-default]') : enabled });
    enabled.addEventListener('change', () => sync());
    text.addEventListener('input', () => sync());
    panel.querySelector('[data-delivery-default]').addEventListener('click', () => {
        if (!saved) { recovering = true; enabled.disabled = text.disabled = false; }
        text.value = DEFAULT_REQUIREMENTS;
        sync();
    });
    discard.addEventListener('click', reload);
    commit.addEventListener('click', () => {
        const value = draft();
        try { save(value); }
        catch (error) { sync(COPY.saveError(error.message || error)); return; }
        saved = value;
        recovering = false;
        sync(COPY.saved);
        onSaved?.();
    });
    return { refreshStatus, get savedSettings() { return saved; } };
}
