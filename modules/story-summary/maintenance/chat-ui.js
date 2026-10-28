import { element, button } from './ui-elements.js';
import { MEMORY_CHAT_MESSAGES as messages } from './chat-contract.js';
import { MEMORY_CHAT_COPY as copy, memoryChatErrorText } from './chat-copy.js';
import { createMemoryChatTurn } from './chat-turn-view.js';
import { observeViewport } from '../../../shared/common/viewport.js';
import { createMaintenanceRangeView } from './range-view.js';

const formatTokens = value => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(Math.round(value));

/** UI only: the host owns conversation, work and identity; closing is not cancellation. */
export function createMemoryChatDialog({ send, root = document.body }) {
    let state = null, chatId = null, identity = null, composing = false, ownsDraft = false;
    let draftTimer = null, pendingSend = null, followLatest = true, readingAnchor = null;
    let disposed = false;
    const turns = new Map();
    const dialog = element('dialog', 'memory-chat-dialog');
    dialog.setAttribute('aria-label', copy.title);
    const layout = element('div', 'memory-chat-layout');
    const header = element('header', 'memory-chat-header');
    const heading = element('div', 'memory-chat-heading');
    heading.append(element('strong', '', copy.title));
    const back = iconButton('', copy.back, close, 'back');
    back.replaceChildren(lineIcon('M14 6l-6 6 6 6'));
    const actions = element('div', 'memory-chat-header-actions');
    const contextButton = iconButton('◔', copy.context, () => {
        context.hidden = !context.hidden;
        contextButton.setAttribute('aria-expanded', String(!context.hidden));
    }, 'context');
    contextButton.classList.add('memory-chat-context-ring');
    contextButton.setAttribute('aria-expanded', 'false');
    const clear = iconButton('⌫', copy.clear, () => {
        confirmation.hidden = false;
        confirmTitle.textContent = manualBusy() ? copy.clearRunningTitle : copy.clearTitle;
        confirmDetail.textContent = [copy.clearDetail, manualBusy() ? copy.clearRunningDetail : ''].filter(Boolean).join(' ');
        confirmClear.textContent = manualBusy() ? copy.clearRunning : copy.clear;
        cancelClear.focus();
    }, 'clear');
    // Inline SVG is static presentation, never model content.
    clear.replaceChildren(trashIcon());
    actions.append(contextButton, clear);
    header.append(back, heading, actions);
    const context = element('section', 'memory-chat-context-popover');
    context.hidden = true;
    context.setAttribute('aria-label', copy.context);
    const contextTotal = element('p', 'memory-chat-context-total');
    const contextRows = element('dl');
    const contextHint = element('small');
    const contextValues = new Map(Object.entries(copy.contextSections).map(([key, label]) => {
        const value = element('dd');
        contextRows.append(element('dt', '', label), value);
        return [key, value];
    }));
    context.append(element('strong', '', copy.context), contextTotal, contextRows, contextHint);
    const boundary = element('div', 'memory-chat-boundary');
    const boundaryTitle = element('span');
    const rangeView = createMaintenanceRangeView();
    const rangeDetails = rangeView.element;
    boundary.append(boundaryTitle, rangeDetails);
    const notice = element('section', 'memory-chat-notice');
    const automatic = element('span');
    const takeover = button(copy.takeover, () => act('takeover'), 'memory-chat-takeover');
    takeover.dataset.action = 'takeover';
    notice.append(automatic, takeover);
    const error = element('p', 'memory-chat-error');
    error.setAttribute('role', 'alert');
    const viewport = element('section', 'memory-chat-transcript');
    viewport.setAttribute('role', 'log');
    viewport.setAttribute('aria-live', 'off');
    viewport.tabIndex = 0;
    const empty = element('div', 'memory-chat-empty');
    empty.append(element('strong', '', copy.empty), element('p', '', copy.emptyHint), element('small', '', copy.lifetime));
    const pages = element('nav', 'memory-chat-pages');
    const older = button(copy.older, () => requestPage(state?.page?.older), 'memory-chat-text-button');
    const newer = button(copy.newer, () => requestPage(state?.page?.newer), 'memory-chat-text-button');
    older.dataset.action = 'older'; newer.dataset.action = 'newer';
    const pageLabel = element('small');
    pages.append(older, pageLabel, newer);
    pages.hidden = true;
    viewport.append(pages, empty);
    const latest = button(copy.latest, () => {
        followLatest = true;
        if (state?.page?.offset > 0) requestPage(0);
        else viewport.scrollTop = viewport.scrollHeight;
        latest.hidden = true;
    }, 'memory-chat-latest');
    latest.hidden = true;
    const composer = element('form', 'memory-chat-composer');
    const regenerate = iconButton('↻', copy.regenerate, () => act('regenerate'), 'regenerate');
    regenerate.replaceChildren(lineIcon('M4 10a8 8 0 1 1 1 8M4 4v6h6'));
    regenerate.title = copy.regenerateHint;
    const input = element('textarea');
    input.rows = 1;
    input.placeholder = copy.input;
    input.setAttribute('aria-label', copy.input);
    input.setAttribute('enterkeyhint', 'enter');
    const submit = iconButton('↑', copy.send, () => {
        if (manualBusy()) act('stop');
        else sendQuestion();
    }, 'send');
    composer.append(regenerate, input, submit);
    const confirmation = element('section', 'memory-chat-confirmation');
    confirmation.hidden = true;
    confirmation.setAttribute('role', 'alertdialog');
    confirmation.setAttribute('aria-modal', 'true');
    confirmation.setAttribute('aria-label', copy.clearTitle);
    const confirmBox = element('div', 'memory-chat-confirm-box');
    const confirmTitle = element('strong');
    const confirmDetail = element('p');
    const confirmActions = element('div', 'memory-chat-confirm-actions');
    const cancelClear = button(copy.cancel, () => { confirmation.hidden = true; clear.focus(); }, 'memory-chat-text-button');
    cancelClear.dataset.action = 'cancel-clear';
    const confirmClear = button(copy.clear, () => {
        confirmation.hidden = true;
        if (!identity) return;
        cancelDraftTimer();
        ownsDraft = true;
        input.value = '';
        pendingSend = null;
        fitInput();
        act('clear');
    }, 'memory-chat-text-button is-danger');
    confirmClear.dataset.action = 'confirm-clear';
    confirmActions.append(cancelClear, confirmClear);
    confirmBox.append(confirmTitle, confirmDetail, confirmActions);
    confirmation.append(confirmBox);
    layout.append(header, boundary, notice, error, viewport, latest, composer, context, confirmation);
    dialog.append(layout);
    root.append(dialog);

    function iconButton(symbol, label, action, name) {
        const node = button(symbol, action, 'memory-chat-icon-button');
        node.setAttribute('aria-label', label);
        node.title = label;
        node.dataset.action = name;
        return node;
    }
    function lineIcon(d) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        svg.append(path);
        return svg;
    }
    function trashIcon() { return lineIcon('M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5'); }
    function manualBusy() { return !!state?.busy || !!state?.turns?.some(turn => ['queued', 'running'].includes(turn.status)); }
    const totalTurns = () => state?.page?.total ?? state?.turns?.length ?? 0;
    const queued = () => state?.activeStatus === 'queued' || state?.turns?.some(turn => turn.status === 'queued');
    function act(action, payload = {}) { if (identity) send(messages[action], { identity, ...payload }); }
    function requestPage(offset) {
        if (!identity || offset == null) return;
        older.disabled = newer.disabled = true;
        act('query', { offset });
    }
    function cancelDraftTimer() { clearTimeout(draftTimer); draftTimer = null; }
    function flushDraft() {
        cancelDraftTimer();
        if (ownsDraft && identity) act('draft', { text: input.value });
    }
    function fitInput() {
        const scrollTop = viewport.scrollTop;
        input.style.height = 'auto';
        // The textarea has no border; CSS owns its minimum and maximum height.
        input.style.height = `${input.scrollHeight}px`;
        // Measuring a shorter composer can temporarily clamp the transcript scroll.
        viewport.scrollTop = scrollTop;
        layout.style.setProperty('--memory-chat-composer-height', `${composer.getBoundingClientRect().height}px`);
    }
    function sendQuestion() {
        if (!identity || manualBusy() || !input.value.trim() || pendingSend) return;
        const text = input.value.trim();
        cancelDraftTimer();
        pendingSend = { text, count: totalTurns() };
        ownsDraft = true;
        input.value = '';
        fitInput();
        act('send', { text });
        updateControls();
    }
    input.addEventListener('input', () => {
        ownsDraft = true;
        fitInput();
        cancelDraftTimer();
        draftTimer = setTimeout(flushDraft, 120);
        updateControls();
    });
    input.addEventListener('compositionstart', () => { composing = true; });
    input.addEventListener('compositionend', () => { composing = false; });
    input.addEventListener('keydown', event => {
        const touch = window.matchMedia?.('(pointer: coarse)').matches;
        if (!touch && !composing && !event.isComposing && event.keyCode !== 229 && event.key === 'Enter'
            && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
            event.preventDefault();
            sendQuestion();
        }
    });
    composer.addEventListener('submit', event => { event.preventDefault(); sendQuestion(); });
    dialog.addEventListener('cancel', event => {
        event.preventDefault();
        if (!confirmation.hidden) { confirmation.hidden = true; clear.focus(); }
        else if (!context.hidden) { context.hidden = true; contextButton.setAttribute('aria-expanded', 'false'); }
        else close();
    });
    dialog.addEventListener('close', flushDraft);
    dialog.addEventListener('keydown', event => {
        if (confirmation.hidden || event.key !== 'Tab') return;
        event.preventDefault();
        (document.activeElement === cancelClear ? confirmClear : cancelClear).focus();
    });
    viewport.addEventListener('scroll', () => {
        followLatest = viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop < 48;
        latest.hidden = followLatest;
        readingAnchor = captureAnchor();
    });
    function captureAnchor() {
        const top = viewport.getBoundingClientRect().top;
        const row = [...viewport.querySelectorAll('[data-turn-id]')].find(node => node.getBoundingClientRect().bottom > top);
        return row ? { id: row.dataset.turnId, offset: row.getBoundingClientRect().top - top } : null;
    }
    function restoreScroll(anchor) {
        if (followLatest) viewport.scrollTop = viewport.scrollHeight;
        else if (anchor) {
            const row = turns.get(anchor.id)?.element;
            if (row) viewport.scrollTop += row.getBoundingClientRect().top - viewport.getBoundingClientRect().top - anchor.offset;
        }
        latest.hidden = followLatest;
        readingAnchor = captureAnchor();
    }
    function updateViewport() {
        const view = window.visualViewport;
        dialog.style.setProperty('--memory-chat-view-height', `${view?.height || window.innerHeight}px`);
        dialog.style.setProperty('--memory-chat-view-top', `${view?.offsetTop || 0}px`);
        fitInput();
        restoreScroll(readingAnchor);
    }
    const stopViewport = observeViewport(updateViewport);
    const resize = new ResizeObserver(() => { if (dialog.open) restoreScroll(readingAnchor); });
    resize.observe(viewport);

    const automaticRunning = () => ['running', 'saving', 'indexing'].includes(state?.automatic?.status);
    function updateControls() {
        const busy = manualBusy();
        submit.replaceChildren(lineIcon(busy ? 'M8 8h8v8H8Z' : 'M12 19V5m-6 6 6-6 6 6'));
        submit.setAttribute('aria-label', busy ? copy.stop : copy.send);
        submit.title = busy ? copy.stop : copy.send;
        submit.dataset.action = busy ? 'stop' : 'send';
        submit.classList.toggle('is-stop', busy);
        submit.disabled = !identity || (!busy && (!input.value.trim() || !!pendingSend));
        regenerate.disabled = !identity || busy || !!pendingSend || !totalTurns();
        clear.disabled = !identity || (!totalTurns() && !input.value);
        input.disabled = !identity;
        takeover.hidden = !automaticRunning() || !queued();
    }
    function render(next) {
        if (disposed || !next || (chatId != null && next.chatId !== chatId)) return;
        if (identity != null && next.identity !== identity) reset(next.chatId);
        chatId = next.chatId;
        identity = next.identity;
        const oldOffset = state?.page?.offset;
        if (next.delta) {
            const known = new Map((state?.turns || []).map(turn => [turn.id, turn]));
            for (const turn of next.turns) known.set(turn.id, turn);
            state = { ...next, turns: next.turnIds.map(id => known.get(id)).filter(Boolean) };
        } else state = next;
        if (!ownsDraft) input.value = state.draft || '';
        if (pendingSend) {
            if (totalTurns() > pendingSend.count) pendingSend = null;
            else if (state.error) {
                if (!input.value) input.value = pendingSend.text;
                pendingSend = null;
            }
        }
        updateControls();
        // Closed dialogs keep only the bounded latest state, not a hidden render loop.
        if (!dialog.open) return;
        const pageChanged = oldOffset !== state.page?.offset;
        const anchor = pageChanged ? null : captureAnchor();
        if (pageChanged) { followLatest = !state.page?.offset; viewport.scrollTop = 0; }
        const keep = new Set(state.turns.map(turn => turn.id));
        for (const [id, view] of turns) if (!keep.has(id)) { view.element.remove(); turns.delete(id); }
        for (const turn of state.turns) {
            const existing = turns.get(turn.id);
            if (existing) existing.update(turn);
            else {
                const view = createMemoryChatTurn(turn);
                turns.set(turn.id, view);
                viewport.append(view.element);
            }
        }
        const page = state.page;
        pages.hidden = !page || page.total <= page.limit;
        older.disabled = page?.older == null;
        newer.disabled = page?.newer == null;
        pageLabel.textContent = page?.total ? copy.historyPage(Math.max(1, page.total - page.offset - state.turns.length + 1), page.total - page.offset, page.total) : '';
        empty.hidden = totalTurns() > 0;
        error.textContent = memoryChatErrorText(state.error);
        error.hidden = !error.textContent;
        const ranges = state.ranges;
        boundaryTitle.textContent = ranges?.cutoff > 0 ? copy.summaryBoundary(ranges.cutoff) : copy.noBoundary;
        rangeDetails.hidden = !(ranges?.cutoff > 0);
        rangeView.update(ranges || {});
        const auto = state.automatic;
        const autoRunning = automaticRunning();
        automatic.textContent = queued() ? autoRunning ? copy.queue : copy.waiting
            : autoRunning ? [copy.automatic, copy.phases[auto.progress?.action]].filter(Boolean).join(' · ')
                : auto?.status === 'queued' ? copy.automaticQueued : '';
        notice.hidden = !automatic.textContent;
        renderContext(state.context);
        fitInput();
        restoreScroll(anchor);
    }
    function renderContext(usage) {
        const ready = Number.isFinite(usage?.used) && Number.isFinite(usage?.limit) && usage.limit > 0
            && !['loading', 'unavailable'].includes(usage?.status);
        const used = ready ? usage.used : 0, limit = ready ? usage.limit : 0;
        const ratio = ready ? Math.min(1, used / limit) : 0;
        const pending = usage?.status === 'unavailable' ? copy.contextUnavailable : copy.contextLoading;
        context.dataset.state = ready ? 'ready' : usage?.status || 'loading';
        contextButton.style.setProperty('--memory-chat-context-fill', `${ratio * 360}deg`);
        contextButton.classList.toggle('is-warning', ready && usage.trigger > 0 && used >= usage.trigger);
        contextButton.setAttribute('aria-busy', String(!ready && usage?.status !== 'unavailable'));
        const total = ready ? copy.contextTotal(formatTokens(used), formatTokens(limit), usage.source !== 'tokenizer') : pending;
        contextButton.setAttribute('aria-label', `${copy.context}：${total}`);
        contextTotal.textContent = total;
        for (const [key, value] of contextValues) {
            const text = ready && Number.isFinite(usage.sections?.[key]) ? formatTokens(usage.sections[key]) : '—';
            if (value.textContent !== text) value.textContent = text;
        }
        contextRows.hidden = !ready;
        contextHint.textContent = ready && usage.trigger ? copy.contextTrigger(formatTokens(usage.trigger)) : '';
    }
    function reset(nextChatId) {
        rangeDetails.open = false;
        cancelDraftTimer();
        ownsDraft = false;
        input.value = '';
        pendingSend = null;
        identity = null;
        state = null;
        chatId = nextChatId;
        for (const view of turns.values()) view.element.remove();
        turns.clear();
        pages.hidden = true;
        renderContext({ status: 'loading' });
        empty.hidden = false;
        followLatest = true;
        readingAnchor = null;
        context.hidden = confirmation.hidden = notice.hidden = error.hidden = true;
        contextButton.setAttribute('aria-expanded', 'false');
        if (dialog.open) dialog.close();
        updateControls();
    }
    function close() {
        context.hidden = confirmation.hidden = true;
        contextButton.setAttribute('aria-expanded', 'false');
        if (dialog.open) dialog.close();
    }
    updateControls();
    renderContext({ status: 'loading' });
    notice.hidden = error.hidden = true;
    boundaryTitle.textContent = copy.loading;
    rangeDetails.hidden = true;
    return {
        open() {
            if (disposed) return;
            updateViewport();
            if (!dialog.open) dialog.showModal();
            if (state) render(state);
            fitInput();
            restoreScroll(readingAnchor);
            if (identity && state?.page?.offset) act('query', { offset: state.page.offset });
            else send(messages.query);
            if (identity && !window.matchMedia?.('(pointer: coarse)').matches) input.focus();
        },
        close, render,
        setChat(nextChatId) { if (nextChatId !== chatId) reset(nextChatId); },
        dispose() {
            flushDraft();
            disposed = true;
            resize.disconnect();
            stopViewport();
            dialog.remove();
        },
    };
}
