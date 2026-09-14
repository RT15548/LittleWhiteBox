import { ACTION_CHECK_DISPLAY_PATTERN } from '../protocol/markup.js';

export const DICE_DISPLAY_RULE_ID = 'xiaobai-os-dice-action-check-display';
export const DICE_DISPLAY_RULE = Object.freeze({
    id: DICE_DISPLAY_RULE_ID, scriptName: '小白 OS · 行动检定显示（自动管理）',
    findRegex: `/${ACTION_CHECK_DISPLAY_PATTERN}/gm`, replaceString: '$1', trimStrings: [],
    placement: [2], disabled: false, markdownOnly: true, promptOnly: false,
    runOnEdit: false, substituteRegex: 0, minDepth: null, maxDepth: null,
});

/** null means no change: callers must not save or refresh the host UI in that case. */
export function repairDiceDisplayRules(rules: Record<string, unknown>[]): Record<string, unknown>[] | null {
    const own = rules.filter(rule => rule.id === DICE_DISPLAY_RULE_ID);
    if (own.length === 1 && rules[0] === own[0]
        && Object.entries(DICE_DISPLAY_RULE).every(([key, value]) => JSON.stringify(own[0][key]) === JSON.stringify(value))) {
        return null;
    }
    return [structuredClone(DICE_DISPLAY_RULE), ...rules.filter(rule => rule.id !== DICE_DISPLAY_RULE_ID)];
}
