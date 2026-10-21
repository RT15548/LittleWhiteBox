// 工具说明占位标记：只有调用方显式标记的 system 消息才能控制工具说明的位置。
// U+2063 不可见分隔符不属于空白字符，trim() 之后仍然保留，便于稳定识别。
// 本文件刻意零依赖，供各适配器与调用方共用。
export const TOOL_PROTOCOL_MARKER = '⁣XBDRAW_TOOL_PROTOCOL⁣';

const SEPARATOR = '\n\n';
const MERGEABLE_ROLES = new Set(['system', 'user', 'assistant']);

function hasMarkerText(message) {
    return !!message
        && typeof message === 'object'
        && message.role === 'system'
        && message.toolProtocolMarker === true
        && typeof message.content === 'string'
        && message.content.includes(TOOL_PROTOCOL_MARKER);
}

/** Opt in only at a trusted request-assembly boundary, never on conversation history. */
export function markToolProtocolMessages(messages) {
    return messages.map(message => message.role === 'system'
        && typeof message.content === 'string' && message.content.includes(TOOL_PROTOCOL_MARKER)
        ? { ...message, toolProtocolMarker: true }
        : message);
}

export function hasToolProtocolMarker(messages) {
    return Array.isArray(messages) && messages.some(hasMarkerText);
}

// 移除全部标记，并连带吃掉一侧的段落分隔，避免留下多余空行。
function removeMarkers(text) {
    let out = text;
    let index = out.indexOf(TOOL_PROTOCOL_MARKER);
    while (index !== -1) {
        const end = index + TOOL_PROTOCOL_MARKER.length;
        if (out.startsWith(SEPARATOR, end)) {
            out = out.slice(0, index) + out.slice(end + SEPARATOR.length);
        } else if (index >= SEPARATOR.length && out.slice(index - SEPARATOR.length, index) === SEPARATOR) {
            out = out.slice(0, index - SEPARATOR.length) + out.slice(end);
        } else {
            out = out.slice(0, index) + out.slice(end);
        }
        index = out.indexOf(TOOL_PROTOCOL_MARKER);
    }
    return out;
}

// 首个标记原位替换，其余标记按移除处理。
function replaceFirstMarker(text, replacementText) {
    const index = text.indexOf(TOOL_PROTOCOL_MARKER);
    const end = index + TOOL_PROTOCOL_MARKER.length;
    return text.slice(0, index) + replacementText + removeMarkers(text.slice(end));
}

function canMerge(previous, current) {
    return previous.role === current.role
        && MERGEABLE_ROLES.has(previous.role)
        && typeof previous.content === 'string'
        && typeof current.content === 'string'
        && !previous.tool_calls
        && !current.tool_calls;
}

// replacement：字符串 / 返回字符串的函数（至多调用一次）/ null（仅剔除）。
// 永不修改入参；每次调用都返回新数组与新消息对象。
export function resolveToolProtocolMarker(messages, replacement = null) {
    if (!Array.isArray(messages)) return { messages: [], found: false };
    if (!hasToolProtocolMarker(messages)) return { messages: messages.slice(), found: false };

    let replaced = false;
    const result = [];
    // 只有“因空而被删除的消息”才会让左右邻居相遇，才需要检查合并，其余消息保持原样。
    let droppedSincePush = false;

    messages.forEach((message) => {
        if (!hasMarkerText(message)) {
            pushMessage(message);
            return;
        }

        let content;
        if (!replaced && replacement !== null && replacement !== undefined) {
            const text = typeof replacement === 'function' ? replacement() : replacement;
            const replacementText = typeof text === 'string' ? text : '';
            if (replacementText.trim()) {
                replaced = true;
                content = replaceFirstMarker(message.content, replacementText);
            }
        }
        if (content === undefined) content = removeMarkers(message.content);

        if (!content.trim()) {
            droppedSincePush = true;
            return;
        }
        const plainMessage = { ...message, content };
        delete plainMessage.toolProtocolMarker;
        pushMessage(plainMessage);
    });

    function pushMessage(message) {
        const previous = result[result.length - 1];
        if (droppedSincePush && previous && canMerge(previous, message)) {
            result[result.length - 1] = {
                ...previous,
                content: `${previous.content}${SEPARATOR}${message.content}`,
            };
        } else {
            result.push(message);
        }
        droppedSincePush = false;
    }

    return { messages: result, found: true };
}

export function stripToolProtocolMarker(messages) {
    return resolveToolProtocolMarker(messages, null).messages;
}
