import type {
    XbTavernMessage,
    XbTavernRuntimeDepthEntry,
} from '../message-assembler';
import {
    findTavernShopItem,
} from './shop-catalog';
import {
    isTavernShopActivationActive,
    normalizeTavernShopParameters,
    normalizeTavernShopTurn,
    type TavernShopActivation,
    type TavernShopInventoryState,
    type TavernShopItem,
} from './shop-types';
import {
    getCurrentTavernShopState,
    getTavernShopStateAtAnchor,
} from './shop-service';

export const TAVERN_SHOP_PROMPT_HEADER = '## 生效中的道具';
export const TAVERN_SHOP_PROMPT_LAYER = 'runtime-shop';
/**
 * Must stay above every other Tavern depth-1 state entry (memory -1_000_000,
 * tasks 900_000_000, chance encounter 1_000_000_000) so the merged depth-1
 * system message always ends with the Shop block.
 */
export const TAVERN_SHOP_PROMPT_DEPTH_ORDER = 1_000_000_100;

const SHOP_EFFECTS_OPEN_TAG = '<artifact_effects>';
const SHOP_EFFECTS_CLOSE_TAG = '</artifact_effects>';
const SHOP_BLOCK_PATTERN = /## 生效中的道具[\s\S]*<\/artifact_effects>/;
const SHOP_INPUT_TOKEN_PATTERN = /\[\[([a-zA-Z][a-zA-Z0-9]*)\]\]/g;
const SHOP_PLAYER_NAME_PATTERN = /【玩家】|玩家/g;

export function normalizeTavernShopPlayerName(value: unknown): string {
    return String(value ?? '')
        .normalize('NFKC')
        .replace(/\r\n?/g, '\n')
        .replace(/\s+/g, ' ')
        .replace(/[【】[\]]/g, '')
        .trim()
        .slice(0, 40);
}

function fillTavernShopPlayerNameInTemplate(template: string, playerName: string): string {
    return String(template || '')
        .replace(SHOP_PLAYER_NAME_PATTERN, (token) => (token === '【玩家】' ? `【${playerName}】` : playerName));
}

export interface TavernShopActiveEffect {
    activation: TavernShopActivation;
    item: TavernShopItem;
}

/**
 * Fills the reviewed catalog template slots with the player's plain-text data.
 * Templates are hand-written world rules; parameters are substituted verbatim.
 */
function renderTavernShopTemplate(
    item: TavernShopItem,
    injection: string,
    parameters: Record<string, unknown> = {},
    playerName = '',
): string {
    const normalized = normalizeTavernShopParameters(item, parameters);
    const declaredKeys = new Set<string>(item.inputs.map((definition) => definition.key));
    const source = String(injection || '');
    // Validate the static template only: a residual `[[` after stripping valid
    // slots is a catalog-authoring typo.
    if (source.replace(SHOP_INPUT_TOKEN_PATTERN, '').includes('[[')) {
        throw new Error(`shop_prompt_input_slot_invalid:${item.id}`);
    }
    const name = normalizeTavernShopPlayerName(playerName) || '玩家';
    const template = fillTavernShopPlayerNameInTemplate(source, name);
    return template.replace(SHOP_INPUT_TOKEN_PATTERN, (_slot, key: string) => {
        if (!declaredKeys.has(key)) {
            throw new Error(`shop_prompt_input_undeclared:${item.id}:${key}`);
        }
        return normalized[key] || '';
    });
}

export function renderTavernShopInjection(
    item: TavernShopItem,
    parameters: Record<string, unknown> = {},
    playerName = '',
): string {
    return renderTavernShopTemplate(item, item.injection, parameters, playerName);
}

function renderTavernShopDeactivationInjection(
    item: TavernShopItem,
    parameters: Record<string, unknown> = {},
    playerName = '',
): string {
    const injection = String(item.deactivationInjection || '');
    if (!injection) {return '';}
    return renderTavernShopTemplate(item, injection, parameters, playerName);
}

export function listTavernShopActiveEffects(
    state: TavernShopInventoryState | null | undefined,
    currentTurn: number,
): TavernShopActiveEffect[] {
    const turn = normalizeTavernShopTurn(currentTurn);
    const items = state?.items;
    if (!items || typeof items !== 'object') {return [];}
    const effects: TavernShopActiveEffect[] = [];
    for (const entry of Object.values(items)) {
        const item = findTavernShopItem(entry?.itemId || '');
        if (!item) {continue;}
        for (const activation of entry.activations || []) {
            if (isTavernShopActivationActive(activation, item, turn)) {
                effects.push({ activation, item });
            }
        }
    }
    return effects.sort((left, right) => (
        left.activation.activatedAt - right.activation.activatedAt
        || left.activation.id.localeCompare(right.activation.id)
    ));
}

function buildEffectBlock(effect: TavernShopActiveEffect, playerName: string): string {
    const { activation, item } = effect;
    const parameters = normalizeTavernShopParameters(item, activation.parameters);
    return renderTavernShopInjection(item, parameters, playerName);
}

function listTavernShopDeactivationEffects(
    state: TavernShopInventoryState | null | undefined,
    atAnchorOrder: number | undefined,
): TavernShopActiveEffect[] {
    if (!Number.isSafeInteger(atAnchorOrder) || atAnchorOrder === undefined || atAnchorOrder < -1) {return [];}
    const items = state?.items;
    if (!items || typeof items !== 'object') {return [];}
    const effects: TavernShopActiveEffect[] = [];
    for (const entry of Object.values(items)) {
        const item = findTavernShopItem(entry?.itemId || '');
        if (!item?.deactivationInjection) {continue;}
        for (const activation of entry.activations || []) {
            if (activation.endReason === 'manual' && activation.endedAtOrder === atAnchorOrder) {
                effects.push({ activation, item });
            }
        }
    }
    return effects.sort((left, right) => (
        (left.activation.endedAt || 0) - (right.activation.endedAt || 0)
        || left.activation.id.localeCompare(right.activation.id)
    ));
}

/**
 * Pure, read-only projection of the active shop effects into the narrative
 * prompt block. Never writes, decrements or persists anything.
 */
export function buildTavernShopPromptBlock(
    state: TavernShopInventoryState | null | undefined,
    currentTurn: number,
    playerName = '',
    atAnchorOrder?: number,
): string {
    const turn = normalizeTavernShopTurn(currentTurn);
    const name = normalizeTavernShopPlayerName(playerName) || '玩家';
    const activeEffects = listTavernShopActiveEffects(state, turn);
    const deactivationEffects = listTavernShopDeactivationEffects(state, atAnchorOrder);
    if (!activeEffects.length && !deactivationEffects.length) {return '';}
    const header = deactivationEffects.length
        ? activeEffects.length
            ? '以下道具正在生效，或刚刚带来了不可忽略的变化。道具描述的内容即为世界的事实。'
            : '以下道具刚刚带来了不可忽略的变化。道具描述的内容即为世界的事实。'
        : '以下道具正在生效。道具描述的内容即为世界的事实。';
    return [
        TAVERN_SHOP_PROMPT_HEADER,
        header,
        '',
        SHOP_EFFECTS_OPEN_TAG,
        [
            ...deactivationEffects.map((effect) => renderTavernShopDeactivationInjection(
                effect.item,
                effect.activation.parameters,
                name,
            )),
            ...activeEffects.map((effect) => buildEffectBlock(effect, name)),
        ].filter(Boolean).join('\n\n'),
        SHOP_EFFECTS_CLOSE_TAG,
    ].join('\n');
}

/**
 * Loads the current shop state and projects it as one depth-1 system entry.
 * The same entry list feeds both the local Brain build and the SillyTavern
 * native prompt build, so there is exactly one injection generator.
 */
export async function buildTavernShopRuntimeDepthEntries(input: {
    sessionId: string;
    currentTurn: number;
    atAnchorOrder?: number;
    playerName?: string;
}): Promise<XbTavernRuntimeDepthEntry[]> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {return [];}
    const current = input.atAnchorOrder === undefined
        ? await getCurrentTavernShopState(sessionId)
        : await getTavernShopStateAtAnchor(sessionId, input.atAnchorOrder);
    const content = buildTavernShopPromptBlock(
        current?.state || null,
        input.currentTurn,
        input.playerName,
        input.atAnchorOrder,
    );
    if (!content) {return [];}
    return [{
        content,
        depth: 1,
        role: 'system',
        order: TAVERN_SHOP_PROMPT_DEPTH_ORDER,
        label: 'active shop effects',
        layer: TAVERN_SHOP_PROMPT_LAYER,
    }];
}

/**
 * Guarantees the observable ordering of the final request: the Shop block is
 * the last block of the system message immediately before the current USER
 * message. The SillyTavern native build cannot rely on extension-prompt key
 * ordering, so the final message array is repaired here deterministically.
 * Idempotent: an already well-placed block is left byte-identical.
 */
export function placeTavernShopPromptBlockBeforeCurrentUser(
    messages: XbTavernMessage[] = [],
    block: string,
    currentUserMessageIndex: number | null | undefined,
): XbTavernMessage[] {
    const content = String(block || '').trim();
    const cleaned: XbTavernMessage[] = [];
    let currentUserIndex = -1;
    for (const [sourceIndex, message] of (Array.isArray(messages) ? messages : []).entries()) {
        if (message.role !== 'system' || !String(message.content || '').includes(TAVERN_SHOP_PROMPT_HEADER)) {
            if (sourceIndex === currentUserMessageIndex && message.role === 'user') {
                currentUserIndex = cleaned.length;
            }
            cleaned.push(message);
            continue;
        }
        const stripped = String(message.content || '')
            .replace(SHOP_BLOCK_PATTERN, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        if (stripped) {cleaned.push({ ...message, content: stripped });}
    }
    if (!content) {return cleaned;}
    if (currentUserIndex < 0) {
        throw new Error('shop_prompt_current_user_boundary_missing');
    }
    const beforeIndex = currentUserIndex - 1;
    if (beforeIndex >= 0 && cleaned[beforeIndex].role === 'system') {
        const target = cleaned[beforeIndex];
        const merged = {
            ...target,
            content: `${String(target.content || '').trimEnd()}\n\n${content}`,
        };
        return [...cleaned.slice(0, beforeIndex), merged, ...cleaned.slice(currentUserIndex)];
    }
    return [
        ...cleaned.slice(0, currentUserIndex),
        { role: 'system', content },
        ...cleaned.slice(currentUserIndex),
    ];
}
