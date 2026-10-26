// 在正文里检测“出场的已知角色”，作为场景规划器的角色参考。纯函数，不依赖酒馆宿主模块。
// 只有“有效启用”的角色才会被检测到：角色自己 enabled !== false 且所在分组是开的（见 character-library.js 的嵌套启用模型）。
import { selectEnabledCharacters } from './character-library.js';
import { isCharacterEnabled } from './character-selection.js';
import { selectEnabledNamedTags } from './named-tag-items.js';
import { expandCharacterForms } from './character-forms.js';

function escapeRegexChars(str) {
    return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {string} messageText
 * @param {{characters: object[], groups: object[]} | object[]} characterLibrary
 *   角色库 { characters, groups }（推荐：分组开关会生效）。
 *   注意：外部调用方应传 `{ characters, groups }` 库对象，不要直接传 characterTags 数组。
 *   传数组时视为“已经按有效启用过滤过的角色列表”，只再看角色自己的 enabled，**不看分组开关**，
 *   所以把未过滤的 characterTags 数组传进来会静默绕过分组开关（关闭的分组里的角色仍会被识别为在场）。
 */
export function detectPresentCharacters(messageText, characterLibrary) {
    const candidates = Array.isArray(characterLibrary)
        ? characterLibrary
        : selectEnabledCharacters(characterLibrary);
    if (!messageText || !candidates.length) return [];
    const text = messageText.toLowerCase();
    const present = [];

    for (const char of candidates) {
        if (!isCharacterEnabled(char) || !char.name) continue;
        const names = [char.name, ...(char.aliases || [])].filter(Boolean);
        const isPresent = names.some(name => {
            const lowerName = String(name).toLowerCase();
            return text.includes(lowerName) || new RegExp(`\\b${escapeRegexChars(lowerName)}\\b`, 'i').test(text);
        });

        if (isPresent) {
            // 有多个形态的角色按形态展开成多条（名称 `名称（形态名）`、别名共用）；单形态角色展开后就是它自己，输出与以前一致。
            for (const entry of expandCharacterForms([char])) {
                present.push({
                    name: entry.name,
                    aliases: entry.aliases || [],
                    type: entry.type || 'girl',
                    appearance: entry.appearance || '',
                    danbooruTag: entry.danbooruTag || '',
                    negativeTags: entry.negativeTags || '',
                    // 停用的服装 / 动态标签在这里就被剔除：规划器的输入里根本没有它们。
                    outfits: selectEnabledNamedTags(entry.outfits),
                    dynamicStates: selectEnabledNamedTags(entry.dynamicStates),
                    ...(entry.baseName !== undefined
                        ? { baseName: entry.baseName, formName: entry.formName, formIndex: entry.formIndex, formCount: entry.formCount }
                        : {}),
                });
            }
        }
    }
    return present;
}
