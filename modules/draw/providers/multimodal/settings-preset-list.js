import { createIdentifier } from '../../../../shared/common/identifier.js';
import { observeAsyncCallback } from '../../../../shared/common/async-errors.js';
import { createPresetListKit } from '../../shared/preset-list-kit.js';
import { pickNeighborAfterRemoval, reorderPresetsByIds } from '../../shared/preset-order.js';
import { MULTIMODAL_COPY as COPY } from './copy.js';

export function bindSettingsPresetList({ root, label, getState, persist, listKey, selectionKey, readFields, fillFields, fieldset,
    validateFields = () => {}, onDraftPreserved = () => {} }) {
    const document = root.ownerDocument;
    const view = document.defaultView;
    root.classList.add('card', 'preset-list-card');
    const list = document.createElement('div');
    list.className = 'preset-list';
    list.setAttribute('role', 'list');
    const header = document.createElement('div');
    header.className = 'preset-list-header';
    const heading = document.createElement('div');
    heading.className = 'preset-list-title';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'preset-list-toggle';
    toggle.title = COPY.collapseList;
    toggle.setAttribute('aria-label', `${COPY.collapseList}${label}`);
    const chevron = document.createElement('i');
    chevron.className = 'fa-solid fa-chevron-down';
    chevron.setAttribute('aria-hidden', 'true');
    toggle.append(chevron);
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = label;
    heading.append(toggle, title);
    const actions = document.createElement('div');
    actions.className = 'btn-group';
    const status = document.createElement('div');
    status.className = 'status-text inline-status';
    status.setAttribute('role', 'status');
    let current;
    let busy = false;
    const buttons = [];

    const report = (kind, text) => { status.className = `status-text inline-status ${kind}`; status.textContent = text; };
    const fieldsOf = ({ id, name, ...fields }) => fields;
    const { confirm, prompt } = { confirm: view.confirm.bind(view), prompt: view.prompt.bind(view) };
    const isDirty = () => current && JSON.stringify(readFields()) !== JSON.stringify(fieldsOf(current));
    function render({ force = false, preserveDraft = false } = {}) {
        const state = getState();
        const items = state[listKey];
        const next = items.find(item => item.id === state[selectionKey]);
        const preserve = !force && isDirty();
        if (preserveDraft && next.id === current.id) {
            current = next;
            onDraftPreserved();
        } else if (!preserve && (force || JSON.stringify(next) !== JSON.stringify(current))) {
            current = next;
            fillFields(fieldsOf(next), next.id);
        }
        if (!busy) listView.render();
        list.inert = busy;
        if (fieldset) fieldset.disabled = busy;
        for (const button of buttons) button.disabled = busy;
    }

    async function apply(mutator, success, { keepFields = false } = {}) {
        if (busy) return false;
        busy = true;
        render();
        const initialFields = JSON.stringify(readFields());
        report('pending', COPY.saving);
        try {
            await persist(mutator);
            render({ force: !keepFields, preserveDraft: JSON.stringify(readFields()) !== initialFields });
            report('success', success);
            return true;
        } catch (error) {
            report('error', error.message || COPY.saveFailed);
            return false;
        } finally {
            busy = false;
            render();
        }
    }
    function askName(initial = '') {
        const answer = prompt(COPY.presetName, initial);
        if (answer === null) return null;
        if (!answer.trim()) { report('error', COPY.presetNameRequired); return null; }
        return answer.trim();
    }
    function button(action, icon, text, task, classes = '') {
        const node = document.createElement('button');
        node.type = 'button';
        node.dataset.presetAction = action;
        node.className = `btn ${classes}`.trim();
        node.title = text;
        node.setAttribute('aria-label', text);
        const symbol = document.createElement('i');
        symbol.className = `fa-solid ${icon}`;
        symbol.setAttribute('aria-hidden', 'true');
        node.append(symbol, ` ${text}`);
        node.addEventListener('click', observeAsyncCallback(task, { source: import.meta.url, operation: action }));
        actions.append(node);
        buttons.push(node);
    }
    function saveAs(name, fields) {
        const id = createIdentifier();
        return apply(draft => {
            validateFields(fields);
            draft[listKey].push({ id, name, ...fields });
            draft[selectionKey] = id;
        }, COPY.saved);
    }
    button('add', 'fa-plus', COPY.add, () => {
        const name = askName();
        if (name !== null) return saveAs(name, readFields());
    });
    button('save', 'fa-floppy-disk', COPY.savePreset, () => {
        const { id } = current;
        const fields = readFields();
        return apply(draft => {
            validateFields(fields);
            Object.assign(draft[listKey].find(item => item.id === id), fields);
        }, COPY.saved);
    }, 'btn-primary');
    const kit = createPresetListKit();
    const listView = kit.createPresetListView({
        document, noun: label, getList: () => list, getToggle: () => toggle, listId: `multimodal-${listKey}`,
        getPresets: () => getState()[listKey], getCurrentId: () => current.id,
        menuItems: [
            { action: 'duplicate', label: COPY.duplicate, icon: 'fa-clone' },
            { action: 'delete', label: COPY.remove, icon: 'fa-trash', danger: true },
        ],
        onSelect: observeAsyncCallback((id, preset) => {
            if (id === current.id || (isDirty() && !confirm(COPY.discardConfirm))) return;
            return apply(draft => { draft[selectionKey] = id; }, COPY.presetSelected(preset.name));
        }, { source: import.meta.url, operation: 'selectPreset' }),
        onRename: (id, name) => apply(draft => { draft[listKey].find(item => item.id === id).name = name; },
            COPY.presetRenamed, { keepFields: true }),
        onReorder: observeAsyncCallback(ids => apply(draft => {
            draft[listKey] = reorderPresetsByIds(draft[listKey], ids);
        }, COPY.saved, { keepFields: true }), { source: import.meta.url, operation: 'reorderPresets' }),
        onAction: observeAsyncCallback((action, id, preset) => {
            if (action === 'duplicate') {
                if (isDirty() && !confirm(COPY.discardConfirm)) return;
                const name = askName(COPY.copyName(preset.name));
                if (name !== null) return saveAs(name, fieldsOf(preset));
            }
            if (action !== 'delete') return;
            if (getState()[listKey].length < 2) { report('error', COPY.lastPreset); return; }
            if (!confirm(COPY.deleteConfirm)) return;
            return apply(draft => {
                const ids = draft[listKey].map(item => item.id);
                const next = pickNeighborAfterRemoval(ids, id);
                if (!next) throw new Error(COPY.lastPreset);
                draft[listKey] = draft[listKey].filter(item => item.id !== id);
                if (draft[selectionKey] === id) draft[selectionKey] = next;
            }, COPY.presetDeleted, { keepFields: id !== current.id });
        }, { source: import.meta.url, operation: 'presetAction' }),
    });
    header.append(heading, actions);
    root.append(header, list, status);
    render({ force: true });
    return { render: () => { if (!busy) render(); }, isDirty, saveAs, report,
        currentName: () => current.name,
        destroy() { listView.destroy(); kit.destroy(); },
    };
}
