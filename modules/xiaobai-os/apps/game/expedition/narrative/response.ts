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

/** Ignore surrounding prose/fences, but never unwrap arrays or choose between operation objects. */
function readControls(source: string): Record<string, unknown> | null {
    let controls: Record<string, unknown> | null = null;
    let start = -1, depth = 0, quoted = false, escaped = false;
    for (let index = 0; index < source.length; index++) {
        const char = source[index];
        if (!depth) {
            if (char === '<' && source.slice(index, index + OPEN.length).toLowerCase() === OPEN) { return null; }
            if (char !== '{' && char !== '[') { continue; }
            if (controls) { return null; }
            start = index;
        }
        if (quoted) {
            if (escaped) { escaped = false; }
            else if (char === '\\') { escaped = true; }
            else if (char === '"') { quoted = false; }
        } else if (char === '"') { quoted = true; }
        else if (char === '{' || char === '[') { depth++; }
        else if (char === '}' || char === ']') {
            depth--;
            if (depth) { continue; }
            try {
                const value: unknown = JSON.parse(source.slice(start, index + 1));
                if (!value || typeof value !== 'object' || Array.isArray(value)) { return null; }
                controls = value as Record<string, unknown>;
            } catch { return null; } // The caller reports invalid controls while preserving the body.
        }
    }
    return depth ? null : controls;
}

/** A complete body survives missing/broken controls; unclosed bodies never carry operations. */
export function decodeNarrativeReply(text: string): NarrativeEnvelope | null {
    const outerFence = /^```[^\r\n`]*\r?\n([\s\S]*?)\r?\n```$/.exec(text.trim());
    const source = outerFence ? outerFence[1] : text.trim();
    const block = BLOCK.exec(source);
    if (block) {
        const reply = block[1].trim();
        if (!reply) { return null; }
        const controls = readControls(source.slice(block.index + block[0].length));
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

本轮回复由两部分组成：XML 正文与 JSON 操作，缺一不可。

第一部分，在 ${OPEN}…${CLOSE} 中用【${name}】的身份第一人称叙事，具体遵循前面的世界设定、人物设定与叙事框架，还原人物。

第二部分，在正文后的 JSON 对象中，逐项核对并提交本轮操作：
- action：人物前往、跟随、留下，以及本轮可用的剧情行动。
- clothing：本轮服饰变化。
- affection：本轮好感变化。
- performance：对应正文的表情与动作表现。

涉及上述可操作项时，必须提交对应字段，不能只停留在正文描述。具体遵循前面的操作规则。

开工：`;
}
