import { DICE_DISPLAY_RULE, DICE_DISPLAY_RULE_ID } from './display-rule.js';

/**
 * ST 1.18's GLOBAL setter saves data but exposes no list-refresh API.
 * Reflect only our managed rule in its native list, without touching other rows or reloading chat.
 * The native list renderer replaces this row normally on its next refresh.
 */
export function showDiceDisplayRule(document: Document): void {
    const list = document.getElementById('saved_regex_scripts');
    if (!list) { return; } // Native initialization will read the saved rules when it mounts.
    const existing = document.getElementById(DICE_DISPLAY_RULE_ID);
    if (existing?.dataset.diceManagedRule === 'true') { return; }
    const row = document.createElement('div');
    row.id = DICE_DISPLAY_RULE_ID;
    row.className = 'regex-script-label flex-container flexnowrap';
    row.dataset.diceManagedRule = 'true';
    const name = document.createElement('div');
    name.className = 'regex_script_name flex1'; name.textContent = DICE_DISPLAY_RULE.scriptName;
    const status = document.createElement('span');
    status.className = 'fa-solid fa-lock'; status.setAttribute('role', 'img');
    status.setAttribute('aria-label', '已启用，由 Dice 自动管理'); status.title = '已启用，由 Dice 自动管理';
    row.append(name, status);
    existing?.remove(); list.prepend(row);
}
