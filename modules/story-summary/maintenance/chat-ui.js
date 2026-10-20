import { element, button } from './ui-elements.js';
import { MEMORY_CHAT_MESSAGES as messages } from './chat-contract.js';
import { MEMORY_CHAT_COPY as copy, memoryChatErrorText } from './chat-copy.js';
import { createMemoryChatTurn } from './chat-turn-view.js';
import { observeViewport } from '../../../shared/common/viewport.js';

const formatTokens = value => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(Math.round(value));
const formatRanges = ranges => ranges.map(range => copy.floorRange(range.from, range.to)).join('、') || copy.none;

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
    const subtitle = element('small', '', copy.currentChat);
    heading.append(element('strong', '', copy.title), subtitle);
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
    const closeButton = iconButton('×', copy.close, close, 'close');
    actions.append(contextButton, clear, closeButton);
    header.append(heading, actions);
    const context = element('section', 'memory-chat-context-popover');
    context.hidden = true;
    context.setAttribute('aria-label', copy.context);
    const contextTotal = element('p', 'memory-chat-context-total');
    const contextRows = element('dl');
    const contextHint = element('small');
    context.append(element('strong', '', copy.context), contextTotal, contextRows, contextHint);
    const boundary = element('div', 'memory-chat-boundary');
    const boundaryTitle = element('span');
    const rangeDetails = element('details');
    const rangeSummary = element('summary');
    const rangeText = element('p');
    rangeDetails.append(rangeSummary, rangeText);
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
    viewport.append(empty);
    const latest = button(copy.latest, () => {
        followLatest = true;
        viewport.scrollTop = viewport.scrollHeight;
        latest.hidden = true;
    }, 'memory-chat-latest');
    latest.hidden = true;
    const composer = element('form', 'memory-chat-composer');
    const regenerate = iconButton('↻', copy.regenerate, () => act('regenerate'), 'regenerate');
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
    function trashIcon() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5');
        svg.append(path);
        return svg;
    }
    function manualBusy() { return !!state?.turns?.some(turn => ['queued', 'running'].includes(turn.status)); }
    function act(action, payload = {}) { if (identity) send(messages[action], { identity, ...payload }); }
    function cancelDraftTimer() { clearTimeout(draftTimer); draftTimer = null; }
    function flushDraft() {
        cancelDraftTimer();
        if (ownsDraft && identity) act('draft', { text: input.value });
    }
    function fitInput() {
        input.style.height = '44px';
        input.style.height = `${Math.min(132, Math.max(44, input.scrollHeight + 2))}px`;
        layout.style.setProperty('--memory-chat-composer-height', `${composer.getBoundingClientRect().height}px`);
    }
    function sendQuestion() {
        if (!identity || manualBusy() || !input.value.trim() || pendingSend) return;
        const text = input.value.trim();
        cancelDraftTimer();
        pendingSend = { text, count: state?.turns?.length || 0 };
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
        submit.textContent = busy ? '■' : '↑';
        submit.setAttribute('aria-label', busy ? copy.stop : copy.send);
        submit.title = busy ? copy.stop : copy.send;
        submit.dataset.action = busy ? 'stop' : 'send';
        submit.classList.toggle('is-stop', busy);
        submit.disabled = !identity || (!busy && (!input.value.trim() || !!pendingSend));
        regenerate.disabled = !identity || busy || !!pendingSend || !state?.turns?.length;
        clear.disabled = !identity || (!state?.turns?.length && !input.value);
        input.disabled = !identity;
        takeover.hidden = !automaticRunning() || !state?.turns?.some(turn => turn.status === 'queued');
    }
    function render(next) {
        if (disposed || !next || (chatId != null && next.chatId !== chatId)) return;
        if (identity != null && next.identity !== identity) reset(next.chatId);
        chatId = next.chatId;
        identity = next.identity;
        state = next;
        subtitle.textContent = next.chatId || copy.currentChat;
        const anchor = captureAnchor();
        if (!ownsDraft) input.value = next.draft || '';
        if (pendingSend) {
            if (next.turns.length > pendingSend.count) pendingSend = null;
            else if (next.error) {
                if (!input.value) input.value = pendingSend.text;
                pendingSend = null;
            }
        }
        const keep = new Set(next.turns.map(turn => turn.id));
        for (const [id, view] of turns) if (!keep.has(id)) { view.element.remove(); turns.delete(id); }
        for (const turn of next.turns) {
            const existing = turns.get(turn.id);
            if (existing) existing.update(turn);
            else {
                const view = createMemoryChatTurn(turn);
                turns.set(turn.id, view);
                viewport.append(view.element);
            }
        }
        empty.hidden = next.turns.length > 0;
        error.textContent = memoryChatErrorText(next.error);
        error.hidden = !error.textContent;
        const ranges = next.ranges;
        boundaryTitle.textContent = ranges?.cutoff > 0 ? copy.summaryBoundary(ranges.cutoff) : copy.noBoundary;
        rangeDetails.hidden = !(ranges?.cutoff > 0);
        rangeSummary.textContent = copy.maintained(formatRanges(ranges?.completed || []));
        rangeText.textContent = copy.pending(formatRanges(ranges?.pending || []));
        const auto = next.automatic;
        const autoRunning = automaticRunning();
        automatic.textContent = next.turns.some(turn => turn.status === 'queued') ? autoRunning ? copy.queue : copy.waiting
            : autoRunning ? [copy.automatic, copy.phases[auto.progress?.action]].filter(Boolean).join(' · ')
                : auto?.status === 'queued' ? copy.automaticQueued : '';
        notice.hidden = !automatic.textContent;
        renderContext(next.context);
        fitInput();
        updateControls();
        restoreScroll(anchor);
    }
    function renderContext(usage) {
        const used = usage?.used || 0, limit = usage?.limit || 0;
        const ratio = limit > 0 ? Math.min(1, used / limit) : 0;
        contextButton.style.setProperty('--memory-chat-context-fill', `${ratio * 360}deg`);
        contextButton.classList.toggle('is-warning', usage?.trigger > 0 && used >= usage.trigger);
        contextButton.setAttribute('aria-label', limit ? `${copy.context}：${copy.contextTotal(formatTokens(used), formatTokens(limit), usage.source !== 'tokenizer')}` : copy.context);
        contextTotal.textContent = limit ? copy.contextTotal(formatTokens(used), formatTokens(limit), usage.source !== 'tokenizer') : copy.contextEmpty;
        contextRows.replaceChildren();
        for (const [key, label] of Object.entries(copy.contextSections)) contextRows.append(element('dt', '', label), element('dd', '', formatTokens(usage?.sections?.[key] || 0)));
        contextRows.hidden = !limit;
        contextHint.textContent = usage?.trigger ? copy.contextTrigger(formatTokens(usage.trigger)) : '';
    }
    function reset(nextChatId) {
        cancelDraftTimer();
        ownsDraft = false;
        input.value = '';
        pendingSend = null;
        identity = null;
        state = null;
        chatId = nextChatId;
        for (const view of turns.values()) view.element.remove();
        turns.clear();
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
    notice.hidden = error.hidden = true;
    boundaryTitle.textContent = copy.loading;
    rangeDetails.hidden = true;
    return {
        open() {
            if (disposed) return;
            updateViewport();
            if (!dialog.open) dialog.showModal();
            fitInput();
            restoreScroll(readingAnchor);
            send(messages.query);
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
