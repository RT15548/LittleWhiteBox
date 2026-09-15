import { createModuleEvents, event_types } from '../../../../../core/event-manager.js';
import { encounterLevel, parseEncounterRecords } from '../domain/encounter.js';
import { createEncounterLabel, ENCOUNTER_CSS } from '../ui/encounter-label.js';
import { captureDiceChat } from './sillytavern-port.js';
import { isEncounterUser } from './encounter-records.js';
import { readDiceRecords, type DiceHostMessage } from './message-records.js';
import type { createEncounterRuntime } from './encounter-runtime.js';

const OWN = '.xb-dice-encounter,.xb-dice-encounter-error';

export function createEncounterDisplay(runtime: ReturnType<typeof createEncounterRuntime>) {
    let dispose: (() => void) | null = null;
    let observer: MutationObserver | null = null;
    let style: HTMLStyleElement | null = null;
    let frame: number | null = null;
    const fresh = new WeakSet<DiceHostMessage>();
    const rendered = new WeakMap<HTMLElement, { message: DiceHostMessage; signature: string; nodes: HTMLElement[] }>();
    function observe() { const chat = document.getElementById('chat'); if (observer && chat) { observer.observe(chat, { childList: true, subtree: true }); } }
    function render() {
        frame = null; observer?.disconnect();
        try {
            const source = captureDiceChat();
            const issue = runtime.view();
            for (const root of document.querySelectorAll<HTMLElement>('#chat .mes')) {
                const index = Number(root.getAttribute('mesid'));
                const message = source?.chat[index];
                const body = root.querySelector('.mes_text');
                if (!message || !isEncounterUser(message) || !body) { root.querySelectorAll(OWN).forEach(node => node.remove()); continue; }
                let error = issue?.target.message === message ? issue.error : '';
                let level = null;
                try { const records = readDiceRecords(message); if (records !== undefined) { level = encounterLevel(parseEncounterRecords(records).encounter.outcome); } }
                catch { error = '这条随机遭遇记录暂时无法显示。'; }
                const editing = !!root.querySelector('.edit_textarea');
                const signature = JSON.stringify([level, error, editing]);
                const previous = rendered.get(root);
                if (previous?.message === message && previous.signature === signature
                    && previous.nodes.every((node, index) => node.previousSibling === (previous.nodes[index - 1] ?? body) && node.parentNode === body.parentNode)) { continue; }
                root.querySelectorAll(OWN).forEach(node => node.remove());
                const nodes: HTMLElement[] = [];
                if (!editing && level && !error) { nodes.push(createEncounterLabel(level, fresh.has(message))); fresh.delete(message); }
                if (!editing && error) {
                    fresh.delete(message);
                    const node = document.createElement('div'); node.className = 'xb-dice-encounter-error';
                    const text = document.createElement('span'); text.textContent = error; node.append(text);
                    nodes.push(node);
                }
                body.after(...nodes);
                rendered.set(root, { message, signature, nodes });
            }
        } finally { observe(); }
    }
    function refresh(message?: DiceHostMessage) {
        if (message) { fresh.add(message); }
        if (message && dispose) {
            if (frame !== null) { cancelAnimationFrame(frame); }
            render(); return;
        }
        if (dispose && frame === null) { frame = requestAnimationFrame(render); }
    }
    return {
        refresh,
        start() {
            if (dispose) { return; }
            style = document.createElement('style'); style.textContent = ENCOUNTER_CSS; document.head.append(style);
            observer = new MutationObserver(() => refresh());
            const events = createModuleEvents('xiaobaiOsDiceEncounterDisplay');
            for (const name of [event_types.CHAT_CHANGED, event_types.USER_MESSAGE_RENDERED, event_types.MESSAGE_DELETED, event_types.MESSAGE_EDITED, event_types.MESSAGE_SWIPED]) { events.on(name, () => refresh()); }
            dispose = () => events.cleanup(); observe(); refresh();
        },
        stop() {
            dispose?.(); dispose = null; observer?.disconnect(); observer = null;
            if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
            style?.remove(); style = null; document.querySelectorAll(OWN).forEach(node => node.remove());
        },
    };
}
