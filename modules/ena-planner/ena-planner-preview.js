const CSS = `
.ena-planner-preview { box-sizing: border-box; min-width: 0; max-width: 100%; margin: .65em 0; padding: .8em; border: 1px solid currentColor; border-radius: .65em; }
.ena-planner-preview__status { font-weight: 600; }
.ena-planner-preview__text, .ena-planner-preview__error { white-space: pre-wrap; overflow-wrap: anywhere; margin: .6em 0; }
.ena-planner-preview__text { max-height: 50vh; overflow-y: auto; }
.ena-planner-preview__error { color: var(--warning, #e7a35a); }
.ena-planner-preview__actions { display: flex; flex-wrap: wrap; gap: .5em; }
.ena-planner-preview button { min-height: 2.75em; padding: .4em .85em; cursor: pointer; color: inherit; background: var(--SmartThemeBlurTintColor, transparent); border: 1px solid currentColor; border-radius: .35em; }
.ena-planner-preview button:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.ena-planner-preview button:disabled { opacity: .45; cursor: default; }
@media (max-width: 600px) { .ena-planner-preview { padding: .65em; } .ena-planner-preview__actions button { flex: 1 1 auto; } }
`;

const STATUS = {
    preparing: '正在准备规划…', planning: '正在规划…', preview: '规划预览',
    stopped: '规划已停止', error: '规划或发送失败', saving: '正在保存并发送…',
    invalid: '本轮已停止，预览不可操作',
};

/** A single, ephemeral USER-message preview; never writes to chat messages. */
export function createPlannerPreview({ getContext, identity, document = globalThis.document }) {
    let current = null;
    let actions = {};
    let node = null;
    let text = null;
    let status = null;
    let error = null;
    let buttons = null;
    let style = null;
    let observer = null;
    let queued = false;
    let epoch = 0;
    let disposed = false;
    let retainedText = '';
    let actionError = '';
    let pending = null;

    function target() {
        if (!current || !Number.isInteger(current.index) || current.index < 0) return null;
        let context;
        try {
            context = getContext();
            if (current.chatId == null || identity() !== current.chatId) return null;
        } catch { return null; }
        if (context?.chat?.[current.index] !== current.source || current.source?.is_user !== true
            || current.source.is_system === true) return null;
        // Do not trust a stale DOM index alone: identity and the message object
        // above must still belong to this exact run.
        const roots = document?.querySelectorAll(`#chat .mes[mesid="${current.index}"]`);
        if (roots?.length !== 1) return null;
        const root = roots[0];
        if (root.getAttribute('is_user') === 'false' || root.querySelector('.edit_textarea')) return null;
        const body = root.querySelector('.mes_text');
        return body?.closest('.mes') === root ? body : null;
    }

    function sourceUnchanged() {
        const expected = current?.saveState?.applied ? current.saveState.text : current?.sourceText;
        return current?.source?.mes === expected;
    }

    function enabled(name) {
        if (!current || !sourceUnchanged() || typeof actions[name] !== 'function') return false;
        // A replan action may await streaming completion; stopping that stream
        // must remain possible while its promise is outstanding.
        if (pending && !(name === 'stop' && pending.name === 'replan')) return false;
        const phase = current.phase;
        const hasText = Boolean(String(current.previewText ?? '').trim());
        if (name === 'stop') return phase === 'planning';
        if (name === 'replan') return !current.saveState
            && ['error', 'preview', 'stopped'].includes(phase);
        return hasText && ['preview', 'stopped', 'error'].includes(phase);
    }

    async function invoke(name) {
        // Recheck at click time: a chat switch/edit can precede observer delivery.
        if (!target() || !enabled(name)) { refresh(); return; }
        const token = { name };
        const run = current;
        const action = actions[name];
        pending = token;
        actionError = '';
        refresh();
        try { await action(); }
        catch (cause) {
            if (current === run && pending === token) actionError = String(cause?.message || cause || '操作失败，请重试。');
        } finally {
            if (current === run && pending === token) {
                pending = null;
                refresh();
            }
        }
    }

    function createNode() {
        node = document.createElement('section');
        node.className = 'ena-planner-preview';
        node.setAttribute('aria-label', '规划预览');
        status = document.createElement('div');
        status.className = 'ena-planner-preview__status';
        status.setAttribute('role', 'status');
        text = document.createElement('div');
        text.className = 'ena-planner-preview__text';
        error = document.createElement('div');
        error.className = 'ena-planner-preview__error';
        error.setAttribute('role', 'alert');
        const controls = document.createElement('div');
        controls.className = 'ena-planner-preview__actions';
        buttons = {};
        for (const [name, label] of [['stop', '停止'], ['replan', '重新规划'], ['send', '发送']]) {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.action = name;
            button.textContent = label;
            const owner = node;
            button.addEventListener('click', () => {
                if (node !== owner) return;
                invoke(name).catch(cause => console.error('[ena-planner] Preview action failed', cause));
            });
            buttons[name] = button;
            controls.append(button);
        }
        node.append(status, text, error, controls);
    }

    function observe() {
        if (current && observer && document?.documentElement) {
            observer.observe(document.documentElement, {
                childList: true, subtree: true, attributes: true,
                attributeFilter: ['mesid', 'is_user', 'class'],
            });
        }
    }

    function refresh() {
        observer?.disconnect();
        try {
            const body = target();
            if (!body) { node?.remove(); return; }
            if (!style) {
                style = document.createElement('style');
                style.dataset.enaPlannerPreview = '';
                style.textContent = CSS;
            }
            if (!style.isConnected) (document.head || document.documentElement).append(style);
            if (!node) createNode();
            // An invalidation retains the last visible text, even if its caller
            // has already emptied previewText while discarding generation state.
            if (current.phase !== 'invalid') retainedText = String(current.previewText ?? '');
            else if (!retainedText) retainedText = String(current.previewText ?? '');
            text.textContent = retainedText;
            status.textContent = current.saveState?.status === 'uncertain'
                ? '保存结果待确认：已保留尝试文本，重试将先读回核对'
                : STATUS[current.phase] || '规划预览';
            error.textContent = actionError || String(current.error?.message || current.error || '');
            error.hidden = !error.textContent;
            node.dataset.phase = current.phase;
            node.setAttribute('aria-busy', String(Boolean(pending) || ['preparing', 'planning', 'saving'].includes(current.phase)));
            for (const name of ['stop', 'replan', 'send']) buttons[name].disabled = !enabled(name);
            buttons.send.textContent = current.saveState || current.phase === 'error' ? '重试发送' : '发送';
            if (node.previousSibling !== body || node.parentNode !== body.parentNode) body.after(node);
        } finally { observe(); }
    }

    function scheduleRefresh() {
        if (queued || !current || disposed) return;
        queued = true;
        const generation = epoch;
        queueMicrotask(() => {
            if (generation !== epoch) return;
            queued = false;
            if (current && !disposed) refresh();
        });
    }

    function clear() {
        epoch++;
        queued = false;
        observer?.disconnect();
        observer = null;
        node?.remove();
        style?.remove();
        node = text = status = error = buttons = style = null;
        current = pending = null;
        actions = {};
        retainedText = actionError = '';
    }

    return {
        render(run, nextActions = {}) {
            if (disposed) return;
            if (!run || run.phase === 'completed') { clear(); return; }
            if (current !== run) clear();
            current = run;
            actions = nextActions || {};
            const Observer = document?.defaultView?.MutationObserver || globalThis.MutationObserver;
            if (!observer && Observer) observer = new Observer(scheduleRefresh);
            refresh();
        },
        clear,
        cleanup() { clear(); disposed = true; },
    };
}
