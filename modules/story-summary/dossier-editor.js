import { DOSSIER_COPY as C } from './dossier-copy.js';
import { factKey, RELATION_TRENDS, parseRelationTarget, relationPredicate } from './data/fact-predicates.js';
import { createIdentifier } from '../../shared/common/identifier.js';

// A draft lives only in this dialog. Submit a one-record diff through the existing
// section writer; acknowledge the durable save before closing or discarding input.
export function createDossierEditor({ getData, postMsg, setHtml, h }) {
    const dialog = document.createElement('dialog');
    dialog.className = 'dossier-editor';
    dialog.setAttribute('aria-labelledby', 'dossier-editor-title');
    document.body.append(dialog);
    let draft = null;
    let sequence = 0;
    const editorId = createIdentifier();
    let pending = null;
    let restoreFocus;
    const field = (name, label, value, multiline = false) => `<label>${h(label)}${multiline
        ? `<textarea name="${name}" rows="${name === 'o' ? 5 : 4}">${h(value || '')}</textarea>`
        : `<input name="${name}" value="${h(value ?? '')}" ${name === 'progress' ? 'type="number" min="0" max="100" step="1"' : ''}>`}</label>`;

    function close() {
        if (pending) return;
        dialog.close(); draft = null;
        if (restoreFocus?.isConnected) restoreFocus.focus({ preventScroll: true });
    }
    function open({ section = 'facts', record = null, subject = '', relation = false }) {
        restoreFocus = document.activeElement;
        draft = { section, before: record ? structuredClone(record) : null, identity: getData().chatIdentity, subject, relation };
        pending = null;
        const title = section === 'arcs' ? C.arcTitle : relation
            ? (record ? C.relationTitle : C.newRelationTitle) : (record ? C.factTitle : C.newFactTitle);
        let fields;
        if (section === 'arcs') {
            fields = field('trajectory', C.trajectory, record?.trajectory)
                + field('progress', C.progress, Math.round((record?.progress || 0) * 100))
                + field('moments', C.momentInput, (record?.moments || []).map(m => typeof m === 'string' ? m : m.text).join('\n'), true);
        } else {
            fields = (subject || record ? `<p class="dossier-editor-subject">${h(record?.s || subject)}</p>` : field('s', C.subject, ''))
                + field('p', relation ? C.from : C.predicate, relation ? parseRelationTarget(record?.p) : record?.p)
                + field('o', C.value, record?.o, true)
                + (relation ? `<label>${C.trend}<select name="trend"><option value="">—</option>${RELATION_TRENDS.map(trend => `<option ${record?.trend === trend ? 'selected' : ''}>${h(trend)}</option>`).join('')}</select></label>` : '');
        }
        setHtml(dialog, `<form><header><h2 id="dossier-editor-title">${title}</h2><button type="button" data-action="cancel" aria-label="${C.cancel}">×</button></header>
            <fieldset>${fields}</fieldset><p class="dossier-editor-error" role="alert" hidden></p>
            <footer>${record ? `<button type="button" class="dossier-delete" data-action="remove">${C.remove}</button>` : ''}<span></span><button type="button" data-action="cancel">${C.cancel}</button><button type="submit" class="dossier-primary">${C.save}</button></footer></form>`);
        dialog.showModal();
        dialog.querySelector('input, textarea')?.focus();
    }
    function error(message) {
        const element = dialog.querySelector('[role="alert"]');
        element.textContent = message; element.hidden = false;
    }
    function busy(value) {
        dialog.querySelector('fieldset').disabled = value;
        dialog.querySelectorAll('button').forEach(button => { button.disabled = value; });
        dialog.querySelector('[type="submit"]').textContent = value ? C.saving : C.save;
    }
    function submit(remove = false) {
        if (!draft || pending) return;
        if (getData().chatIdentity !== draft.identity) { error(C.changedChat); return; }
        const value = name => dialog.querySelector(`[name="${name}"]`)?.value.trim() || '';
        let edited;
        if (!remove) {
            if (draft.section === 'arcs') {
                const previous = new Map((draft.before?.moments || []).map(m => [typeof m === 'string' ? m : m.text, m]));
                edited = { ...draft.before, name: draft.before?.name || draft.subject,
                    trajectory: value('trajectory'), progress: Math.max(0, Math.min(100, Number(value('progress')))) / 100,
                    moments: value('moments').split('\n').map(text => text.trim()).filter(Boolean).map(text => previous.get(text) || { text }) };
            } else {
                const s = draft.before?.s || draft.subject || value('s');
                const p = draft.relation ? relationPredicate(value('p')) : value('p');
                const o = value('o');
                if (!s || !value('p') || !o) { error(C.required); return; }
                edited = { ...draft.before, s, p, o };
                if (draft.relation) { if (value('trend')) edited.trend = value('trend'); else delete edited.trend; }
                if ((!draft.before || factKey(edited) !== factKey(draft.before))
                    && getData().facts.some(fact => !fact.retracted && factKey(fact) === factKey(edited))) { error(C.duplicate); return; }
            }
        }
        pending = `${editorId}:${++sequence}`;
        busy(true);
        postMsg('UPDATE_SECTION', { section: draft.section, previous: draft.before ? [draft.before] : [],
            data: remove ? [] : [edited], requestId: pending, identity: draft.identity });
    }
    dialog.addEventListener('submit', event => { event.preventDefault(); submit(); });
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (button?.dataset.action === 'cancel') close();
        if (button?.dataset.action === 'remove') {
            button.dataset.action = 'confirm-remove'; button.textContent = C.confirmRemove;
            error(C.removeConfirm);
        } else if (button?.dataset.action === 'confirm-remove') submit(true);
    });
    return {
        open,
        receive(message) {
            if (message.requestId !== pending || !draft || message.identity !== draft.identity) return;
            pending = null; busy(false);
            if (message.error) error(message.error); else close();
        },
        setChat(identity) {
            if (draft && draft.identity !== identity) { pending = null; close(); }
        },
    };
}
