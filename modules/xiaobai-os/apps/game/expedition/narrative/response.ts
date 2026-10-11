import type { ConversationTurn } from '../campaign/types.js';

const DIALOGUE_TAG = 'dialogue';
const OPEN = `<${DIALOGUE_TAG}>`, CLOSE = `</${DIALOGUE_TAG}>`;
const BLOCK = new RegExp(`${OPEN}([\\s\\S]*?)${CLOSE}`, 'i');
const START = new RegExp(OPEN, 'i');

export interface NarrativeEnvelope {
    reply: string;
    complete: boolean;
    controls: Record<string, unknown> | null;
}

/** The only transport framing. The body is plain text, not XML/HTML or a JSON string. */
export function encodeNarrativeReply(turn: Pick<ConversationTurn, 'reply' | 'action' | 'performance' | 'affectionDelta' | 'clothing'>): string {
    const affection = turn.affectionDelta ? turn.affectionDelta > 0 ? 'up' : 'down' : null;
    return `${OPEN}\n${turn.reply}\n${CLOSE}\n${JSON.stringify({ action: turn.action, affection, performance: turn.performance ?? null, clothing: turn.clothing ?? null })}`;
}

/** A complete body survives missing/broken controls; unclosed bodies never carry operations. */
export function decodeNarrativeReply(text: string): NarrativeEnvelope | null {
    const outerFence = /^```[^\r\n`]*\r?\n([\s\S]*?)\r?\n```$/.exec(text.trim());
    const source = outerFence ? outerFence[1] : text.trim();
    const block = BLOCK.exec(source);
    if (block) {
        const reply = block[1].trim();
        if (!reply) { return null; }
        const suffix = source.slice(block.index + block[0].length).trim();
        const jsonFence = /^```(?:json)?\s*\n([\s\S]*?)\n```$/i.exec(suffix);
        let controls: Record<string, unknown> | null = null;
        try {
            const value: unknown = JSON.parse(jsonFence ? jsonFence[1] : suffix);
            if (value && typeof value === 'object' && !Array.isArray(value)) { controls = value as Record<string, unknown>; }
        } catch { /* The body remains usable; the caller reports the missing controls. */ }
        return { reply, complete: true, controls };
    }
    const opening = START.exec(source);
    if (opening) {
        const reply = source.slice(opening.index + opening[0].length).trim();
        return reply ? { reply, complete: false, controls: null } : null;
    }
    // Complete prose from the provider remains readable. Structured/partial transport
    // without a body boundary stays a raw receipt; it cannot create game changes.
    if (!source || /^(?:[[{]|```|<)/.test(source)) { return null; }
    return { reply: source, complete: true, controls: null };
}

export function responseInstruction(name: string) {
    return `［开工强调］：

每次输出均由两部分组成：XML 正文与 JSON 操作，缺一不可。

在${OPEN}…${CLOSE}中用【${name}】的身份第一人称叙事。在JSON 对象中提交操作。
开工：`;
}
