// 在正文里检测“出场的已知角色”，作为场景规划器的角色参考。纯函数，不依赖酒馆宿主模块。
// 只有“有效启用”的角色才会被检测到：角色自己 enabled !== false 且所在分组是开的（见 character-library.js 的嵌套启用模型）。
import { selectEnabledCharacters } from './character-library.js';
import { isCharacterEnabled } from './character-selection.js';

function escapeRegexChars(str) {
    return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeNamedTagList(list = []) {
    return (Array.isArray(list) ? list : [])
        .map(item => ({
            name: String(item?.name || '').trim(),
            tags: String(item?.tags || '').trim(),
        }))
        .filter(item => item.name || item.tags);
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
            present.push({
                name: char.name,
                aliases: char.aliases || [],
                type: char.type || 'girl',
                appearance: char.appearance || '',
                danbooruTag: char.danbooruTag || '',
                negativeTags: char.negativeTags || '',
                outfits: normalizeNamedTagList(char.outfits),
                dynamicStates: normalizeNamedTagList(char.dynamicStates),
            });
        }
    }
    return present;
}
