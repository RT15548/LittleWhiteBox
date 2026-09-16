import { isGenerating, updateMessageBlock } from '../../../../../../../../../script.js';
import { createModuleEvents, event_types } from '../../../../../core/event-manager.js';
import { isCheckContinuationPoint, parseDiceRecords } from '../domain/check-records.js';
import { checkMarkerIds } from '../domain/check-marker.js';
import { createCheckCard, diceSpan as span, type CheckCard } from '../ui/check-card.js';
import { revealCheckCard } from '../ui/reveal.js';
import type { DiceCandidate, DiceHostMessage, DiceTarget } from './message-records.js';
import { captureDiceChat } from './sillytavern-port.js';
import type { createDiceGenerationAdapter } from './generation-adapter.js';
import { DICE_CARD_CSS } from './card-style.js';
import { mountCheckCards, restoreCheckMarker } from './check-marker-dom.js';
import { checkDisplayProjection } from './check-display-projection.js';
import { showCheckReveal } from './reveal-visibility.js';

type Runtime = ReturnType<typeof createDiceGenerationAdapter>;
const OWN = '.xb-dice-card';
interface CardEntry { signature: string; view: CheckCard; status: string }

export function createDiceMessageDisplay(runtime: Runtime, enabled: () => boolean) {
    let observer: MutationObserver | null = null;
    let disposeEvents: (() => void) | null = null;
    let frame: number | null = null;
    let style: HTMLStyleElement | null = null;
    // Message/candidate identity, not the host's replaceable formatted DOM, owns a mounted card.
    const cards = new WeakMap<DiceHostMessage, { swipe: number; entries: Map<string, CardEntry> }>();
    // Don't repeatedly repaint a source whose markers are suppressed by host formatting.
    const failedSync = new WeakMap<HTMLElement, string>();

    function retryButton(index: number, label: string): HTMLButtonElement {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = label;
        button.addEventListener('click', () => {
            button.disabled = true;
            void runtime.retry(index).catch(error => {
                console.error('[LittleWhiteBox] Dice retry failed', error);
                const note = span('xb-dice-note', '暂时无法继续，请稍后重试；回复已有变化时，请用酒馆的「继续」。');
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
            // The host owns stream following. Its temporary marker-only layout cannot
            // tell us whether the reader left the bottom; only reveal() positions a new die.
            for (const root of document.querySelectorAll<HTMLElement>('#chat .mes')) {
                const index = Number(root.getAttribute('mesid'));
                const message = source?.chat[index];
                const content = root.querySelector<HTMLElement>('.mes_text');
                if (!content) { continue; }
                const value = message && runtime.readConfirmed(message);
                const phase = active && active.target.message === message && active.target.swipe === (message?.swipe_id ?? 0) ? active.phase : null;
                const editing = !!root.querySelector('.edit_textarea');
                if (editing) {
                    if (phase) { runtime.cancel(); }
                    continue;
                }
                if (!message || message.is_user || message.is_system) {
                    content.querySelectorAll(OWN).forEach(node => node.remove()); continue;
                }
                const wanted = new Set<HTMLElement>();
                const markerIds = checkMarkerIds(message.mes);
                const placements = new Map<string, HTMLElement>();
                let cached = cards.get(message);
                if (!cached || cached.swipe !== (message.swipe_id ?? 0)) {
                    cached = { swipe: message.swipe_id ?? 0, entries: new Map() }; cards.set(message, cached);
                }
                const kept = new Set<string>();
                let errorPlaced = false;
                let projection = message.mes;
                if (value !== undefined) {
                    try {
                        const records = parseDiceRecords(value);
                        projection = checkDisplayProjection(message, records.checks);
                        for (const record of records.checks) {
                            if (!markerIds.has(record.id)) { continue; }
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
                            const node = view.element;
                            placements.set(record.id, node);
                            const failedContinuation = phase?.kind === 'continue-error' && phase.candidate.records.checks.at(-1)?.id === record.id;
                            const waitingForText = phase?.kind === 'continuing'
                                && phase.candidate.records.checks.at(-1)?.id === record.id
                                && message.mes === phase.candidate.body;
                            const error = failedContinuation ? phase.error : waitingForText ? '正在续写…' : '';
                            let retry = '';
                            if (enabled() && (failedContinuation || source?.chat.at(-1) === message && record === records.checks.at(-1)
                                && isCheckContinuationPoint(message.mes, record) && !active)) {
                                retry = '沿用骰点续写';
                            }
                            setStatus(entry, index, error, retry);
                            errorPlaced ||= !!failedContinuation;
                        }
                    } catch {
                        const notice = span('xb-dice-card xb-dice-notice', '这条检定记录暂时无法显示。');
                        wanted.add(notice); content.append(notice);
                    }
                }
                let mounted = mountCheckCards(content, placements);
                if (mounted.size < placements.size && (!isGenerating() || phase?.kind === 'saving' || phase?.kind === 'revealing')) {
                    const sourceSignature = JSON.stringify([message.mes, projection, message.swipe_id ?? 0]);
                    if (failedSync.get(content) !== sourceSignature) {
                        // The display regex hid the former request, or native translation still projects it.
                        // No editor is present. Render a temporary view; neither mes nor display_text is assigned.
                        updateMessageBlock(index, { ...message, extra: { ...message.extra, display_text: projection } });
                        mounted = mountCheckCards(content, placements);
                        if (mounted.size < placements.size) { failedSync.set(content, sourceSignature); }
                    }
                }
                if (mounted.size === placements.size) { failedSync.delete(content); }
                for (const node of mounted) { wanted.add(node); }
                for (const id of cached.entries.keys()) { if (!kept.has(id)) { cached.entries.delete(id); } }
                if (phase && !errorPlaced) {
                    if (phase.kind === 'waiting' || phase.kind === 'settling' || phase.kind === 'saving') {
                        const pending = content.querySelector<HTMLElement>('.xb-dice-pending')
                            ?? span('xb-dice-card xb-dice-pending');
                        pending.setAttribute('role', 'status');
                        pending.setAttribute('aria-live', 'polite');
                        const label = phase.kind === 'saving' ? '正在保存骰点…' : '正在准备检定…';
                        if (pending.textContent !== label) { pending.textContent = label; }
                        wanted.add(pending);
                        if (!pending.isConnected) { content.append(pending); }
                    }
                    if ('error' in phase && phase.error) {
                        const notice = span('xb-dice-card xb-dice-notice', '');
                        notice.setAttribute('role', 'status');
                        notice.append(span('xb-dice-note', phase.error));
                        if (enabled() && (phase.kind === 'save-error' || phase.kind === 'continue-error')) {
                            notice.append(retryButton(index, phase.kind === 'save-error' ? '检查保存' : '沿用骰点续写'));
                        }
                        wanted.add(notice); content.append(notice);
                    }
                }
                content.querySelectorAll<HTMLElement>(OWN).forEach(node => { if (!wanted.has(node)) { node.remove(); } });
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
            if (signal.aborted) { return; }
            if (!card?.element.isConnected || !showCheckReveal(card.element)) { throw new Error('检定卡片暂时不可见。'); }
            await revealCheckCard(card, signal);
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
            document.querySelectorAll<HTMLElement>(`#chat ${OWN}`).forEach(restoreCheckMarker);
        },
    };
}
