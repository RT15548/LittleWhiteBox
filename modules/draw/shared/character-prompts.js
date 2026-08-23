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
    return joinTags(danbooruTag, toSceneCharacterPromptTag(character.type), character.appearance);
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
            return {
                name: known.name || character.name,
                prompt: joinTags(
                    buildKnownCharacterPrompt(known, options),
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
            prompt: joinTags(
                danbooruTag,
                toSceneCharacterPromptTag(character?.type),
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
