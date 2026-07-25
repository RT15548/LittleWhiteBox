import type {
    XbTavernMessage,
    XbTavernRuntimeDepthEntry,
} from '../message-assembler';
import {
    findTavernShopItem,
} from './shop-catalog';
import {
    isTavernShopActivationActive,
    normalizeTavernShopTurn,
    tavernShopRemainingRounds,
    type TavernShopActivation,
    type TavernShopInventoryState,
    type TavernShopItem,
} from './shop-types';
import {
    getCurrentTavernShopState,
    getTavernShopStateAtAnchor,
} from './shop-service';

export const TAVERN_SHOP_PROMPT_HEADER = '## 当前生效道具';
export const TAVERN_SHOP_PROMPT_LAYER = 'runtime-shop';
/**
 * Must stay above every other Tavern depth-1 state entry (memory -1_000_000,
 * tasks 900_000_000, chance encounter 1_000_000_000) so the merged depth-1
 * system message always ends with the Shop block.
 */
export const TAVERN_SHOP_PROMPT_DEPTH_ORDER = 1_000_000_100;

const SHOP_EFFECT_CLOSE_TAG = '</shop_effect>';
const SHOP_BLOCK_PATTERN = /## 当前生效道具[\s\S]*<\/shop_effect>/;

export interface TavernShopActiveEffect {
    activation: TavernShopActivation;
    item: TavernShopItem;
}

function escapeEvidence(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function parameterDataLabel(key: string): string {
    return key === 'identity' ? '指定身份' : '作用对象';
}

/**
 * Renders one reviewed injection template. Only catalog-declared input keys
 * are substituted, and every value is escaped so user input can never close
 * prompt markup or be interpreted as an instruction.
 */
export function renderTavernShopInjection(
    item: TavernShopItem,
    parameters: Record<string, string>,
): string {
    let rendered = String(item.injection || '');
    for (const definition of item.inputs) {
        const value = escapeEvidence(parameters[definition.key] || '');
        rendered = rendered.split(`{{${definition.key}}}`).join(value);
    }
    return rendered;
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

function buildEffectBlock(effect: TavernShopActiveEffect, currentTurn: number): string {
    const { activation, item } = effect;
    const lines: string[] = [
        '<shop_effect>',
        `道具：${item.name}`,
    ];
    for (const definition of item.inputs) {
        const value = String(activation.parameters[definition.key] || '');
        lines.push(`${parameterDataLabel(definition.key)}（数据）：${escapeEvidence(JSON.stringify(value))}`);
    }
    lines.push(renderTavernShopInjection(item, activation.parameters));
    if (item.duration.kind === 'turns') {
        const remaining = tavernShopRemainingRounds(activation, item, currentTurn);
        lines.push(`剩余主回合：${Math.max(0, Number(remaining) || 0)}`);
        if (remaining === 1) {
            lines.push('本次回复结束后效果消退；本次回复仍须完整遵守。');
        }
    } else if (item.duration.kind === 'manual') {
        lines.push('持续：直至手动关闭。');
    } else {
        lines.push('持续：永久生效，不可关闭。');
    }
    lines.push(SHOP_EFFECT_CLOSE_TAG);
    return lines.join('\n');
}

/**
 * Pure, read-only projection of the active shop effects into the narrative
 * prompt block. Never writes, decrements or persists anything.
 */
export function buildTavernShopPromptBlock(
    state: TavernShopInventoryState | null | undefined,
    currentTurn: number,
): string {
    const turn = normalizeTavernShopTurn(currentTurn);
    const effects = listTavernShopActiveEffects(state, turn);
    if (!effects.length) {return '';}
    return [
        TAVERN_SHOP_PROMPT_HEADER,
        '以下规则来自玩家已激活的系统道具，优先于角色通常性格、关系惯性和场景概率；',
        '它们只约束当前及后续叙事，不得伪造过去未发生的事实。',
        '',
        effects.map((effect) => buildEffectBlock(effect, turn)).join('\n\n'),
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
}): Promise<XbTavernRuntimeDepthEntry[]> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {return [];}
    const current = input.atAnchorOrder === undefined
        ? await getCurrentTavernShopState(sessionId)
        : await getTavernShopStateAtAnchor(sessionId, input.atAnchorOrder);
    const content = buildTavernShopPromptBlock(current?.state || null, input.currentTurn);
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
): XbTavernMessage[] {
    const content = String(block || '').trim();
    const cleaned: XbTavernMessage[] = [];
    for (const message of Array.isArray(messages) ? messages : []) {
        if (message.role !== 'system' || !String(message.content || '').includes(TAVERN_SHOP_PROMPT_HEADER)) {
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
    let userIndex = -1;
    for (let index = cleaned.length - 1; index >= 0; index -= 1) {
        if (cleaned[index].role === 'user') {userIndex = index; break;}
    }
    if (userIndex < 0) {
        return [...cleaned, { role: 'system', content }];
    }
    const beforeIndex = userIndex - 1;
    if (beforeIndex >= 0 && cleaned[beforeIndex].role === 'system') {
        const target = cleaned[beforeIndex];
        const merged = {
            ...target,
            content: `${String(target.content || '').trimEnd()}\n\n${content}`,
        };
        return [...cleaned.slice(0, beforeIndex), merged, ...cleaned.slice(userIndex)];
    }
    return [
        ...cleaned.slice(0, userIndex),
        { role: 'system', content },
        ...cleaned.slice(userIndex),
    ];
}
