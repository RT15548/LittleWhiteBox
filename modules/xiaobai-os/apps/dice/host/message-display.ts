import { messageFormatting } from '../../../../../../../../../script.js';
import { createModuleEvents, event_types } from '../../../../../core/event-manager.js';
import { hasValidCheckAnchor, parseDiceRecords, type ActionCheckRecord } from '../domain/check-records.js';
import { captureDiceChat } from './sillytavern-port.js';
import type { createDiceGenerationAdapter } from './generation-adapter.js';
import { DICE_CARD_CSS } from './card-style.js';

type Runtime = ReturnType<typeof createDiceGenerationAdapter>;
const OUTCOMES = { critical_failure: '大失败', failure: '失败', success: '成功', critical_success: '大成功' };
const OWN = '.xb-dice-card';

function span(className: string, text: string): HTMLSpanElement {
    const element = document.createElement('span');
    element.className = className;
    element.textContent = text;
    return element;
}

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

    function card(record: ActionCheckRecord, changed: boolean): HTMLSpanElement {
        const element = span('xb-dice-card', '');
        element.setAttribute('role', 'group'); element.setAttribute('aria-label', '行动检定');
        element.dataset.diceRecord = record.id;
        element.append(span('xb-dice-heading', record.request.stat),
            span('xb-dice-score', `${record.roll} / D20 · DC ${record.dc} · ${OUTCOMES[record.outcome]}`),
            span('xb-dice-detail', `${record.request.character ? `${record.request.character} · ` : ''}${record.request.action}`));
        if (record.request.stakes) { element.append(span('xb-dice-note', record.request.stakes)); }
        if (changed) { element.append(span('xb-dice-note', '原文已变更 · 保留历史骰点')); }
        return element;
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
                content.querySelectorAll(OWN).forEach(node => node.remove());
                if (!message || message.is_user || message.is_system || editing) { continue; }
                if (value !== undefined) {
                    try {
                        const records = parseDiceRecords(value);
                        for (const record of records.checks) {
                            const valid = hasValidCheckAnchor(message.mes, record);
                            const node = card(record, !valid);
                            let placed = false;
                            if (valid) {
                                const template = document.createElement('template');
                                // Host formatter performs the same sanitization and display regex as the actual message.
                                // eslint-disable-next-line no-unsanitized/property
                                template.innerHTML = messageFormatting(message.mes.slice(0, record.offset), message.name ?? '', false, false, index);
                                placed = placeAtPrefix(content, template.content.textContent ?? '', node);
                            }
                            if (!placed) { content.append(node); }
                            if (enabled() && source?.chat.at(-1) === message && record === records.checks.at(-1)
                                && valid && message.mes.length === record.offset && !active) {
                                node.append(retryButton(index, '沿用骰点续写'));
                            }
                        }
                    } catch { content.append(span('xb-dice-card', '检定记录格式无效，未执行任何操作。')); }
                }
                if (active?.target.message === message && active.target.swipe === (message.swipe_id ?? 0)) {
                    const phase = active.phase;
                    if ('error' in phase) {
                        const notice = span('xb-dice-card', '');
                        notice.append(span('xb-dice-note', phase.error));
                        if (enabled() && (phase.kind === 'save-error' || phase.kind === 'continue-error')) {
                            notice.append(retryButton(index, phase.kind === 'save-error' ? '核实并重试保存' : '沿用骰点续写'));
                        }
                        content.append(notice);
                    }
                }
                rendered.set(content, { signature, nodes: [...content.querySelectorAll<HTMLElement>(OWN)] });
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
