import { joinTags, removeDuplicateTags } from './character-prompts.js';
import { findEnabledCharacterForm } from './character-selection.js';

/**
 * 已录入角色的固定外貌：用 assembleCharacterPrompts 同一个解析（findEnabledCharacterForm）按 name + form 选形态，
 * 保证这里去重用的外貌和最终拼进提示词的外貌是同一份。presentCharacters 的条目已经按形态展开，直接传入即可。
 */
const fixedLookOf = (char, presentCharacters) => findEnabledCharacterForm(char.name, char.form, presentCharacters)?.appearance || '';

/**
 * 一个角色的提示词 = 外貌 + 服装 + 动作，整图还有 scene。同一个词只留优先级最高的一处：
 *   外貌（固定外貌 / appear）> costume > action > scene
 * - 动作里已经在外貌 / 服装里出现过的词去掉；
 * - scene 里已经在任一角色的外貌 / 服装 / 动作里出现过的词去掉（角色自己的东西不写进整图）；
 * - 不同角色之间互不比较：两个角色都写 smile、wet hair 是正常的，一律保留。
 * 比较规则同 removeDuplicateTags：忽略大小写和下划线，只比完全相同的词；带权重的词是有意的写法，保留。
 * costume / appear 原样不动：着装记忆读的就是它们。已录入角色的 costume 对固定外貌的去重仍由拼接时（assembleCharacterPrompts）做。
 */
export function dedupeTaskTags(tasks, { presentCharacters } = {}) {
    if (!Array.isArray(tasks)) return tasks;
    return tasks.map((task) => {
        if (!Array.isArray(task?.chars) || !task.chars.length) return task;
        const kept = [];
        const chars = task.chars.map((char) => {
            if (!char || typeof char !== 'object') return char;
            const above = joinTags(fixedLookOf(char, presentCharacters), char.appear, char.costume);
            const action = char.action && above ? removeDuplicateTags(char.action, above) : char.action;
            kept.push(joinTags(above, action));
            return action === char.action ? char : { ...char, action };
        });
        // 规划合同要求 scene 非空：scene 的词全被角色占了就保持原样，不能清空。
        const deduped = task.scene && kept.length ? removeDuplicateTags(task.scene, joinTags(...kept)) : '';
        const sceneChanged = Boolean(deduped) && deduped !== task.scene;
        const changed = sceneChanged || chars.some((char, index) => char !== task.chars[index]);
        return changed ? { ...task, chars, ...(sceneChanged ? { scene: deduped } : {}) } : task;
    });
}
