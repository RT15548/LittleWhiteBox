import type { ActionCheckRecord } from '../domain/check-records.js';
import { createD20Result } from './d20-result.js';
import { createCoc7Result } from './coc7-result.js';
import { diceSpan } from './card-elements.js';
import { createCardTexture } from './card-texture.js';
import { DICE_SESSION_COPY as labels } from './session-copy.js';

/** A saved check's view. It never rolls, saves, or starts generation. */
export function createCheckCard(record: ActionCheckRecord, pending: boolean) {
    const element = diceSpan('xb-dice-card');
    // ST's streaming fade-in uses morphdom's ID keys. Without a key it can turn this
    // retained span into an ordinary text segment, destroying the cached component.
    element.id = `xb-dice-check-${record.id}`;
    element.dataset.diceRecord = record.id;
    element.dataset.rule = record.rule;
    element.setAttribute('role', 'group');
    let result = record.rule === 'coc7' ? createCoc7Result(record) : createD20Result(record);
    const name = record.rule === 'coc7' ? record.request.stat : [record.request.character, record.request.stat].filter(Boolean).join(' · ');
    const identity = diceSpan('xb-dice-identity', name);
    identity.hidden = record.rule === 'coc7';
    const rolling = diceSpan('xb-dice-rolling-label', labels.rolling);
    result.rollingSlot.append(rolling);
    const copy = diceSpan('xb-dice-copy');
    function renderCopy(settled: boolean): void {
        copy.replaceChildren(diceSpan('xb-dice-action', record.request.action));
        for (const branch of ['success', 'failure'] as const) {
            const text = record.request[branch];
            if (!text) { continue; }
            const row = diceSpan('xb-dice-consequence-row');
            row.dataset.branch = branch;
            row.append(diceSpan('xb-dice-consequence-label', labels.consequences[branch]),
                diceSpan('xb-dice-consequence', text));
            copy.append(row);
        }
        if (!settled) { return; }
        if (record.context) {
            const details = document.createElement('details'); details.className = 'xb-dice-context';
            const summary = document.createElement('summary'); summary.textContent = labels.context;
            details.append(summary, diceSpan('xb-dice-context-text', record.context)); copy.append(details);
        }
    }
    const status = diceSpan('xb-dice-status'); status.hidden = true;
    status.setAttribute('role', 'status');
    element.append(createCardTexture(), identity, result.element, copy, status);
    function settle(): void {
        if (element.dataset.state === 'settled') { return; }
        if (element.dataset.state === 'rolling') { element.dataset.revealed = 'true'; }
        element.dataset.state = 'settled'; element.dataset.outcome = result.tone;
        if (record.rule === 'coc7') { element.dataset.verdict = record.result.verdict; }
        identity.hidden = record.rule === 'coc7';
        element.setAttribute('aria-label', record.rule === 'coc7' ? result.label : `${name}检定：${result.label}`);
        renderCopy(true);
        rolling.hidden = true;
        result.settle();
    }
    function present(isPending: boolean): void {
        delete element.dataset.state;
        delete element.dataset.revealed;
        delete element.dataset.outcome;
        delete element.dataset.verdict;
        rolling.hidden = false;
        if (isPending) {
            element.dataset.state = 'rolling';
            element.setAttribute('aria-label', `${name}检定，${labels.rolling}`);
            renderCopy(false);
            result.draw(0);
        } else { settle(); }
    }
    function update(next: ActionCheckRecord, isPending: boolean): void {
        record = next;
        const replacement = record.rule === 'coc7' ? createCoc7Result(record) : createD20Result(record);
        result.element.replaceWith(replacement.element);
        result = replacement;
        result.rollingSlot.append(rolling);
        present(isPending);
    }
    present(pending);
    return { element, status, settle, update, draw: (progress: number) => result.draw(progress) };
}

export type CheckCard = ReturnType<typeof createCheckCard>;
