import { messageFormatting } from '../../../../../../../../../script.js';
import { createModuleEvents, event_types } from '../../../../../core/event-manager.js';
import { hasValidCheckAnchor, parseDiceRecords } from '../domain/check-records.js';
import { createCheckCard, diceSpan as span, type CheckCard } from '../ui/check-card.js';
import { revealCheckCard } from '../ui/reveal.js';
import type { DiceCandidate, DiceHostMessage, DiceTarget } from './message-records.js';
import { captureDiceChat } from './sillytavern-port.js';
import type { createDiceGenerationAdapter } from './generation-adapter.js';
import { DICE_CARD_CSS } from './card-style.js';

type Runtime = ReturnType<typeof createDiceGenerationAdapter>;
const OWN = '.xb-dice-card';
interface CardEntry { signature: string; view: CheckCard; status: string }

/** Exact formatted-prefix correspondence, not a search for a similar sentence. */
function placeAtPrefix(root: HTMLElement, prefix: string, node: HTMLElement): boolean {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: value => value.parentElement?.closest(OWN) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    let consumed = 0;
    let current: Node | null;
    while ((current = walker.nextNode())) {
        const value = current.textContent ?? '';
        const count = Math.min(value.length, prefix.length - consumed);
        if (value.slice(0, count) !== prefix.slice(consumed, consumed + count)) { return false; }
        consumed += count;
        if (consumed === prefix.length) {
            const range = document.createRange();
            range.setStart(current, count);
            range.collapse(true);
            range.insertNode(node);
            return true;
        }
    }
    return false;
}

export function createDiceMessageDisplay(runtime: Runtime, enabled: () => boolean) {
    let observer: MutationObserver | null = null;
    let disposeEvents: (() => void) | null = null;
    let frame: number | null = null;
    let style: HTMLStyleElement | null = null;
    const rendered = new WeakMap<HTMLElement, { signature: string; nodes: HTMLElement[] }>();
    // Message/candidate identity, not the host's replaceable formatted DOM, owns a mounted card.
    const cards = new WeakMap<DiceHostMessage, { swipe: number; entries: Map<string, CardEntry> }>();

    function retryButton(index: number, label: string): HTMLButtonElement {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = label;
        button.addEventListener('click', () => {
            button.disabled = true;
            void runtime.retry(index).catch(error => {
                const note = span('xb-dice-note', error instanceof Error ? error.message : String(error));
                note.setAttribute('role', 'alert'); button.after(note);
            }).finally(() => { button.disabled = false; refresh(); });
        });
        return button;
    }

    function setStatus(entry: CardEntry, index: number, error: string, retry: string): void {
        const signature = JSON.stringify([index, error, retry]);
        if (entry.status === signature) { return; }
        entry.status = signature;
        entry.view.status.replaceChildren();
        entry.view.status.hidden = !error && !retry;
        if (error) { entry.view.status.append(span('xb-dice-note', error)); }
        if (retry) { entry.view.status.append(retryButton(index, retry)); }
    }

    function render(): void {
        frame = null;
        observer?.disconnect();
        try {
            const source = captureDiceChat();
            const active = runtime.view();
            for (const root of document.querySelectorAll<HTMLElement>('#chat .mes')) {
                const index = Number(root.getAttribute('mesid'));
                const message = source?.chat[index];
                const content = root.querySelector<HTMLElement>('.mes_text');
                if (!content) { continue; }
                const value = message && runtime.readConfirmed(message);
                const phase = active && active.target.message === message && active.target.swipe === (message?.swipe_id ?? 0) ? active.phase : null;
                const editing = !!root.querySelector('.edit_textarea');
                const signature = JSON.stringify([message?.mes, value, phase, enabled(), editing, source?.chat.at(-1) === message]);
                const previous = rendered.get(content);
                if (previous?.signature === signature && previous.nodes.every(node => content.contains(node))) { continue; }
                if (!message || message.is_user || message.is_system || editing) {
                    content.querySelectorAll(OWN).forEach(node => node.remove()); continue;
                }
                const wanted = new Set<HTMLElement>();
                let cached = cards.get(message);
                if (!cached || cached.swipe !== (message.swipe_id ?? 0)) {
                    cached = { swipe: message.swipe_id ?? 0, entries: new Map() }; cards.set(message, cached);
                }
                const kept = new Set<string>();
                let errorPlaced = false;
                if (value !== undefined) {
                    try {
                        const records = parseDiceRecords(value);
                        for (const record of records.checks) {
                            const valid = hasValidCheckAnchor(message.mes, record);
                            const pending = phase && (phase.kind === 'saving' || phase.kind === 'revealing')
                                && phase.candidate.records.checks.at(-1)?.id === record.id;
                            const signature = JSON.stringify(record);
                            let entry = cached.entries.get(record.id);
                            if (!entry || entry.signature !== signature) {
                                entry = { signature, view: createCheckCard(record, !!pending), status: '' };
                                cached.entries.set(record.id, entry);
                            }
                            kept.add(record.id);
                            const { view } = entry;
                            if (!pending && view.element.dataset.state === 'rolling') { view.settle(); }
                            view.changed(!valid);
                            const node = view.element;
                            wanted.add(node);
                            let placed = valid && content.contains(node);
                            if (valid && !placed) {
                                const template = document.createElement('template');
                                // Host formatter performs the same sanitization and display regex as the actual message.
                                // eslint-disable-next-line no-unsanitized/property
                                template.innerHTML = messageFormatting(message.mes.slice(0, record.offset), message.name ?? '', false, false, index);
                                placed = placeAtPrefix(content, template.content.textContent ?? '', node);
                            }
                            if (!placed) { content.append(node); }
                            const error = phase?.kind === 'continue-error' && phase.candidate.records.checks.at(-1)?.id === record.id
                                ? phase.error : '';
                            let retry = '';
                            if (enabled() && (error || source?.chat.at(-1) === message && record === records.checks.at(-1)
                                && valid && message.mes.length === record.offset && !active)) {
                                retry = '沿用骰点续写';
                            }
                            setStatus(entry, index, error, retry);
                            errorPlaced ||= !!error;
                        }
                    } catch {
                        const notice = span('xb-dice-card xb-dice-notice', '检定记录格式无效，未执行任何操作。');
                        wanted.add(notice); content.append(notice);
                    }
                }
                for (const id of cached.entries.keys()) { if (!kept.has(id)) { cached.entries.delete(id); } }
                if (phase && !errorPlaced) {
                    if ('error' in phase) {
                        const notice = span('xb-dice-card xb-dice-notice', '');
                        notice.setAttribute('role', 'status');
                        notice.append(span('xb-dice-note', phase.error));
                        if (enabled() && (phase.kind === 'save-error' || phase.kind === 'continue-error')) {
                            notice.append(retryButton(index, phase.kind === 'save-error' ? '核实并重试保存' : '沿用骰点续写'));
                        }
                        wanted.add(notice); content.append(notice);
                    }
                }
                content.querySelectorAll<HTMLElement>(OWN).forEach(node => { if (!wanted.has(node)) { node.remove(); } });
                rendered.set(content, { signature, nodes: [...wanted] });
            }
        } finally { observe(); }
    }
    function observe(): void {
        const chat = document.getElementById('chat');
        if (observer && chat) { observer.observe(chat, { childList: true, subtree: true, characterData: true }); }
    }
    function refresh(): void { if (observer && frame === null) { frame = requestAnimationFrame(render); } }
    return {
        refresh,
        async reveal(target: DiceTarget, candidate: DiceCandidate, signal: AbortSignal) {
            if (!observer || signal.aborted) { return; }
            if (frame !== null) { cancelAnimationFrame(frame); }
            render();
            const id = candidate.records.checks.at(-1)?.id;
            const cached = cards.get(target.message);
            const card = id && cached?.swipe === target.swipe ? cached.entries.get(id)?.view : undefined;
            if (card?.element.isConnected) { await revealCheckCard(card, signal); }
        },
        start() {
            if (observer) { return; }
            style = document.createElement('style'); style.textContent = DICE_CARD_CSS; document.head.append(style);
            observer = new MutationObserver(refresh); observe();
            const events = createModuleEvents('xiaobaiOsDiceDisplay');
            for (const name of [event_types.CHAT_CHANGED, event_types.MESSAGE_SWIPED, event_types.MESSAGE_UPDATED, event_types.MORE_MESSAGES_LOADED]) {
                events.on(name, refresh);
            }
            disposeEvents = () => events.cleanup(); refresh();
        },
        stop() {
            observer?.disconnect(); observer = null;
            if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
            disposeEvents?.(); disposeEvents = null; style?.remove(); style = null;
            document.querySelectorAll(`#chat ${OWN}`).forEach(node => node.remove());
        },
    };
}
