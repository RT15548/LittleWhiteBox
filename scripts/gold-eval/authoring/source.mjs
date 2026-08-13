import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

function sha256(bytes) {
    return createHash('sha256').update(bytes).digest('hex');
}

function messageRole(message) {
    if (message?.is_system) return 'system';
    if (message?.is_user === true) return 'user';
    if (message?.is_user === false) return 'assistant';
    return 'unknown';
}

export async function loadSourceChat(filePath) {
    const bytes = await fs.readFile(filePath);
    const text = bytes.toString('utf8');
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) throw new Error('聊天 JSONL 至少需要一行 metadata 和一条消息');

    const parsed = lines.map((line, index) => {
        try {
            return JSON.parse(line);
        } catch (error) {
            throw new Error(`聊天 JSONL 第 ${index + 1} 行解析失败: ${error?.message || error}`);
        }
    });
    const [metadata, ...rawMessages] = parsed;
    const messages = rawMessages.map((message, floor) => {
        if (!message || typeof message !== 'object' || Array.isArray(message)) {
            throw new Error(`楼层 ${floor} 不是消息对象`);
        }
        if (typeof message.mes !== 'string') {
            throw new Error(`楼层 ${floor} 缺少字符串 mes`);
        }
        return {
            floor,
            role: messageRole(message),
            name: String(message.name || ''),
            text: message.mes,
        };
    });

    return {
        metadata,
        messages,
        messageCount: messages.length,
        lastFloor: messages.length - 1,
        sha256: sha256(bytes),
        byteLength: bytes.length,
    };
}

export function planSourceWindows(messageCount, { windowSize, overlap }) {
    if (!Number.isInteger(messageCount) || messageCount < 1) {
        throw new Error('messageCount 必须是正整数');
    }
    if (!Number.isInteger(windowSize) || windowSize < 2) {
        throw new Error('windowSize 必须是至少 2 的整数');
    }
    if (!Number.isInteger(overlap) || overlap < 0 || overlap >= windowSize) {
        throw new Error('overlap 必须是 0 到 windowSize-1 的整数');
    }

    const actualSize = Math.min(windowSize, messageCount);
    const step = windowSize - overlap;
    const windows = [];
    let startFloor = 0;

    while (true) {
        const endFloor = Math.min(messageCount - 1, startFloor + actualSize - 1);
        windows.push({ startFloor, endFloor });
        if (endFloor === messageCount - 1) break;

        let nextStart = startFloor + step;
        if (nextStart + actualSize > messageCount) {
            nextStart = messageCount - actualSize;
        }
        if (nextStart <= startFloor) break;
        startFloor = nextStart;
    }

    return windows;
}

export function assertFloor(chat, floor) {
    if (!Number.isInteger(floor) || floor < 0 || floor > chat.lastFloor) {
        throw new Error(`楼层越界: ${JSON.stringify(floor)}，有效范围 0-${chat.lastFloor}`);
    }
}

export function renderSourceRange(chat, startFloor, endFloor) {
    assertFloor(chat, startFloor);
    assertFloor(chat, endFloor);
    if (startFloor > endFloor) throw new Error('startFloor 不能大于 endFloor');

    return chat.messages
        .slice(startFloor, endFloor + 1)
        .map(message => JSON.stringify({
            floor: message.floor,
            role: message.role,
            name: message.name,
            text: message.text,
        }))
        .join('\n');
}

export function selectCitedSource(chat, evidence) {
    const roles = ['requiredAll', 'requiredAny', 'supporting', 'forbiddenAsCurrent'];
    const citations = [];
    for (const evidenceRole of roles) {
        for (const floor of evidence?.[evidenceRole] || []) {
            assertFloor(chat, floor);
            const message = chat.messages[floor];
            citations.push({
                floor,
                evidenceRole,
                speakerRole: message.role,
                name: message.name,
                text: message.text,
            });
        }
    }
    return citations.sort((a, b) => a.floor - b.floor || a.evidenceRole.localeCompare(b.evidenceRole));
}
