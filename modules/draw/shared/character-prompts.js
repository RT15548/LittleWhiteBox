import { findEnabledCharacterByName } from './character-selection.js';
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
    return characters.map((character) => {
        const known = findEnabledCharacterByName(character?.name, knownCharacters);
        const center = normalizeCharacterCenter(character?.center, options);
        if (known) {
            // [K2] 场景 type（可携带方位）非空时打头并顶替库 type；为空（原生合同会清空已录入
            // 角色的场景 type）时回落 buildKnownCharacterPrompt 内的库 type，原生行为不变。
            const sceneType = toSceneCharacterPromptTag(character?.type);
            return {
                name: known.name || character.name,
                prompt: joinTags(
                    sceneType,
                    buildKnownCharacterPrompt(sceneType ? { ...known, type: '' } : known, options),
                    character.costume,
                    character.action,
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
