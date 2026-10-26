import { expandCharacterForms } from './character-forms.js';
import { findEnabledCharacterForm } from './character-selection.js';
import { toSceneCharacterPromptTag } from './scene-plan-contract.js';

const GRID_COL = Object.freeze({ A: 0.1, B: 0.3, C: 0.5, D: 0.7, E: 0.9 });
const GRID_ROW = Object.freeze({ 1: 0.1, 2: 0.3, 3: 0.5, 4: 0.7, 5: 0.9 });

export function joinTags(...parts) {
    return parts
        .filter(Boolean)
        .map(part => String(part).trim().replace(/[，、]/g, ',').replace(/^,+|,+$/g, ''))
        .filter(part => part.length > 0)
        .join(', ');
}

function formatDanbooruTag(tag, options = {}) {
    const value = String(tag || '').trim();
    return options.preserveDanbooruCanonical ? value : value.replace(/_/g, ' ');
}

export function buildKnownCharacterPrompt(character = {}, options = {}) {
    const danbooruTag = character.danbooruTag ? formatDanbooruTag(character.danbooruTag, options) : '';
    // [K2] type 提到最前：type 是角色的自然语言身份短句（K2 下可携带画面方位），应当作为角色提示词的开头。
    // 上游同步时注意保留此顺序调整。
    return joinTags(toSceneCharacterPromptTag(character.type), danbooruTag, character.appearance);
}

const WEIGHT_SYNTAX = /-?\d*\.?\d+::|::|[(){}[\]]/;

/** 规范化 tag 用于比较：小写、下划线当空格、合并空白。 */
function tagKey(tag) {
    return tag.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

function splitTags(text) {
    return String(text ?? '').split(/[,，、]/).map(tag => tag.trim()).filter(Boolean);
}

/**
 * 去掉 text 里与固定外貌（fixedText）重复的 tag，保持顺序、只留第一次出现。
 * 固定一侧先去掉 NovelAI 权重 / 括号语法（`1.5::x::`、`(x:1.2)`、`{x}`、`[x]`）再比较；
 * text 里自己带权重 / 括号语法的 tag 是有意的写法，一律保留。
 */
export function removeDuplicateTags(text, fixedText) {
    const fixed = new Set(splitTags(String(fixedText ?? '').replace(/-?\d*\.?\d+::|::/g, ''))
        .map(tag => tagKey(tag.replace(/[(){}[\]]/g, '').replace(/:-?\d*\.?\d+$/, ''))));
    const seen = new Set();
    const kept = splitTags(text).filter((tag) => {
        const key = tagKey(tag);
        if (!WEIGHT_SYNTAX.test(tag) && (fixed.has(key) || seen.has(key))) return false;
        seen.add(key);
        return true;
    });
    return kept.join(', ');
}

function normalizeCharacterCenter(center, { acceptGrid = true } = {}) {
    if (center && typeof center === 'object' && !Array.isArray(center)) {
        const x = Number(center.x);
        const y = Number(center.y);
        if (Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 1 && y >= 0 && y <= 1) {
            return { x, y };
        }
    }
    if (acceptGrid && typeof center === 'string') {
        const match = center.trim().toUpperCase().match(/^([A-E])([1-5])$/);
        if (match) return { x: GRID_COL[match[1]], y: GRID_ROW[match[2]] };
    }
    return { x: 0.5, y: 0.5 };
}

export function assembleCharacterPrompts(sceneCharacters = [], knownCharacters = [], options = {}) {
    const characters = Array.isArray(sceneCharacters) ? sceneCharacters : [];
    // 多形态角色在这里展开：name（原名称 / 别名）按 form 选形态，缺省 / 不存在 / 已停用回落第一个启用形态。
    const expandedKnown = expandCharacterForms(knownCharacters);
    return characters.map((character) => {
        const known = findEnabledCharacterForm(character?.name, character?.form, expandedKnown);
        const center = normalizeCharacterCenter(character?.center, options);
        if (known) {
            // [K2] 场景 type（可携带方位）非空时打头并顶替库 type；为空（原生合同会清空已录入
            // 角色的场景 type）时回落 buildKnownCharacterPrompt 内的库 type，原生行为不变。
            const sceneType = toSceneCharacterPromptTag(character?.type);
            const fixed = joinTags(sceneType, buildKnownCharacterPrompt(sceneType ? { ...known, type: '' } : known, options));
            return {
                name: known.name || character.name,
                // 服装 / 动作里与固定外貌重复的 tag 去掉（interact 带 source# 前缀，不处理）。
                prompt: joinTags(
                    fixed,
                    removeDuplicateTags(character.costume, fixed),
                    removeDuplicateTags(character.action, fixed),
                    character.interact,
                ),
                uc: joinTags(known.negativeTags, character.uc),
                center,
            };
        }

        const danbooruTag = character?.danbooru
            ? formatDanbooruTag(character.danbooru, options)
            : '';
        return {
            name: character?.name,
            // [K2] type 提到最前
            prompt: joinTags(
                toSceneCharacterPromptTag(character?.type),
                danbooruTag,
                character?.appear,
                character?.costume,
                character?.action,
                character?.interact,
            ),
            uc: character?.uc || '',
            center,
        };
    });
}
