import { ACTIVITY_COPY as C } from './activity-copy.js';

export function createToolProcess({ project, renderText }) {
    const node = document.createElement('section');
    node.className = 'xb-assistant-process';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'xb-assistant-process-toggle';
    const body = document.createElement('div');
    body.className = 'xb-assistant-process-body';
    node.append(toggle, body);
    let opened = false, live = false, source = [], mounted = new Map();

    function updateRows(rows) {
        const next = new Map();
        rows.forEach((row, index) => {
            let view = mounted.get(row.key);
            if (!view) {
                const element = document.createElement('div');
                if (row.type === 'text') {
                    element.className = 'xb-assistant-process-text xb-assistant-markdown';
                    view = { element };
                } else {
                    element.className = 'xb-assistant-operation';
                    const dot = document.createElement('i'), label = document.createElement('span');
                    const status = document.createElement('span'), note = document.createElement('small');
                    dot.className = 'xb-assistant-operation-dot';
                    dot.setAttribute('aria-hidden', 'true');
                    label.className = 'xb-assistant-operation-label';
                    status.className = 'xb-assistant-operation-status';
                    note.className = 'xb-assistant-operation-note';
                    element.append(dot, label, status, note);
                    view = { element, label, status, note };
                }
            }
            if (row.type === 'text') {
                if (view.text !== row.text) {
                    view.element.replaceChildren(renderText(row.text));
                    view.text = row.text;
                }
            } else {
                if (view.label.textContent !== row.label) view.label.textContent = row.label;
                if (view.element.dataset.status !== row.status) {
                    view.element.dataset.status = row.status;
                    view.status.textContent = C.statuses[row.status];
                }
                if (view.note.textContent !== row.note) view.note.textContent = row.note;
                view.note.hidden = !row.note;
            }
            if (body.children[index] !== view.element) body.insertBefore(view.element, body.children[index] || null);
            next.set(row.key, view);
        });
        for (const [key, view] of mounted) if (!next.has(key)) view.element.remove();
        mounted = next;
    }

    function refresh() {
        const { rows, counts } = project(source);
        const parts = [C.process(counts.total)];
        if (counts.failed) parts.push(C.failures(counts.failed));
        if (counts.unresolved) parts.push(C.unresolved(counts.unresolved));
        if (counts.total && counts.succeeded === counts.total) parts.push(C.allSucceeded);
        toggle.textContent = parts.join(' · ');
        toggle.hidden = live;
        const expanded = live || opened;
        toggle.setAttribute('aria-expanded', String(expanded));
        node.classList.toggle('is-running', live);
        body.hidden = !expanded;
        if (expanded) updateRows(rows);
        else { body.replaceChildren(); mounted.clear(); }
    }

    toggle.addEventListener('click', () => { opened = !opened; refresh(); });
    return {
        node,
        update(messages, running) {
            if (live !== running) opened = false;
            live = running;
            source = messages;
            refresh();
        },
    };
}
