import type { ActionCheckRecord } from '../domain/check-records.js';
import { createD20 } from './d20.js';

const OUTCOMES = { critical_failure: '大失败', failure: '失败', success: '成功', critical_success: '大成功' };

export function diceSpan(className: string, text = ''): HTMLSpanElement {
    const element = document.createElement('span');
    element.className = className; element.textContent = text;
    return element;
}

/** A saved check's view. It never rolls, saves, or starts generation. */
export function createCheckCard(record: ActionCheckRecord, pending: boolean) {
    const element = diceSpan('xb-dice-card');
    // ST's streaming fade-in uses morphdom's ID keys. Without a key it can turn this
    // retained span into an ordinary text segment, destroying the cached component.
    element.id = `xb-dice-check-${record.id}`;
    element.dataset.diceRecord = record.id;
    element.setAttribute('role', 'group');
    const hero = diceSpan('xb-dice-hero');
    const die = diceSpan('xb-dice-die');
    const solid = createD20(record.roll);
    die.append(solid.element, diceSpan('xb-dice-system', 'D20'));
    const verdict = diceSpan('xb-dice-verdict');
    const outcome = diceSpan('xb-dice-outcome');
    const name = [record.request.character, record.request.stat].filter(Boolean).join(' · ');
    const identity = diceSpan('xb-dice-identity', name);
    const comparison = diceSpan('xb-dice-comparison');
    const roll = diceSpan('xb-dice-score');
    roll.append(diceSpan('xb-dice-score-label', '掷骰'), diceSpan('xb-dice-score-value', String(record.roll)));
    const difficulty = diceSpan('xb-dice-score');
    difficulty.append(diceSpan('xb-dice-score-label', '难度'), diceSpan('xb-dice-score-value', String(record.dc)));
    comparison.append(roll, difficulty);
    verdict.append(outcome, comparison);
    const rolling = diceSpan('xb-dice-rolling-label', '正在掷骰');
    hero.append(die, verdict, rolling);
    const copy = diceSpan('xb-dice-copy');
    copy.append(diceSpan('xb-dice-action', record.request.action));
    if (record.request.stakes) {
        const text = diceSpan('xb-dice-stakes-text', record.request.stakes);
        if (record.request.stakes.length > 96) {
            const details = document.createElement('details'); details.className = 'xb-dice-stakes';
            const summary = document.createElement('summary'); summary.textContent = '风险与后果';
            details.append(summary, text); copy.append(details);
        } else {
            const stakes = diceSpan('xb-dice-stakes');
            stakes.append(diceSpan('xb-dice-stakes-label', '风险'), text); copy.append(stakes);
        }
    }
    const status = diceSpan('xb-dice-status'); status.hidden = true;
    status.setAttribute('role', 'status');
    element.append(identity, hero, copy, status);
    function settle(): void {
        if (element.dataset.state === 'settled') { return; }
        if (element.dataset.state === 'rolling') { element.dataset.revealed = 'true'; }
        element.dataset.state = 'settled'; element.dataset.outcome = record.outcome;
        element.setAttribute('aria-label', `${name}检定：${OUTCOMES[record.outcome]}，掷骰 ${record.roll}，难度 ${record.dc}`);
        outcome.textContent = OUTCOMES[record.outcome];
        verdict.hidden = false; copy.hidden = false; rolling.hidden = true;
        solid.draw(1, true);
    }
    if (pending) {
        element.dataset.state = 'rolling';
        element.setAttribute('aria-label', `${name}检定，正在掷骰`);
        verdict.hidden = true; copy.hidden = true;
        solid.draw(0);
    } else { settle(); }
    return { element, status, settle, draw: solid.draw };
}

export type CheckCard = ReturnType<typeof createCheckCard>;
