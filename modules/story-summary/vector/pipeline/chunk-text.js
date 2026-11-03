import { makeChunkId, hashText, CHUNK_MAX_TOKENS } from '../storage/chunk-store.js';
import { cleanRecallMessageText } from '../utils/text-filter.js';
import { isUserHidden } from '../../data/message-visibility.js';

// ═══════════════════════════════════════════════════════════════════════════
// Token 估算
// ═══════════════════════════════════════════════════════════════════════════

function estimateTokens(text) {
    if (!text) return 0;
    const chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const other = text.length - chinese;
    return Math.ceil(chinese + other / 4);
}

function splitSentences(text) {
    if (!text) return [];
    const parts = text.split(/(?<=[。！？\n])|(?<=[.!?]\s)/);
    return parts.map(s => s.trim()).filter(s => s.length > 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// Chunk 切分
// ═══════════════════════════════════════════════════════════════════════════

export function chunkMessage(floor, message, maxTokens = CHUNK_MAX_TOKENS) {
    if (isUserHidden(message)) return [];
    const text = message.mes || '';
    const speaker = message.name || (message.is_user ? '用户' : '角色');
    const isUser = !!message.is_user;

    const cleanText = cleanRecallMessageText(text);

    if (!cleanText) return [];

    const totalTokens = estimateTokens(cleanText);

    if (totalTokens <= maxTokens) {
        return [{
            chunkId: makeChunkId(floor, 0),
            floor,
            chunkIdx: 0,
            speaker,
            isUser,
            text: cleanText,
            textHash: hashText(cleanText),
        }];
    }

    const sentences = splitSentences(cleanText);
    const chunks = [];
    let currentSentences = [];
    let currentTokens = 0;

    for (const sent of sentences) {
        const sentTokens = estimateTokens(sent);

        if (sentTokens > maxTokens) {
            if (currentSentences.length > 0) {
                const chunkText = currentSentences.join('');
                chunks.push({
                    chunkId: makeChunkId(floor, chunks.length),
                    floor,
                    chunkIdx: chunks.length,
                    speaker,
                    isUser,
                    text: chunkText,
                    textHash: hashText(chunkText),
                });
                currentSentences = [];
                currentTokens = 0;
            }

            const sliceSize = maxTokens * 2;
            for (let i = 0; i < sent.length; i += sliceSize) {
                const slice = sent.slice(i, i + sliceSize);
                chunks.push({
                    chunkId: makeChunkId(floor, chunks.length),
                    floor,
                    chunkIdx: chunks.length,
                    speaker,
                    isUser,
                    text: slice,
                    textHash: hashText(slice),
                });
            }
            continue;
        }

        if (currentTokens + sentTokens > maxTokens && currentSentences.length > 0) {
            const chunkText = currentSentences.join('');
            chunks.push({
                chunkId: makeChunkId(floor, chunks.length),
                floor,
                chunkIdx: chunks.length,
                speaker,
                isUser,
                text: chunkText,
                textHash: hashText(chunkText),
            });
            currentSentences = [];
            currentTokens = 0;
        }

        currentSentences.push(sent);
        currentTokens += sentTokens;
    }

    if (currentSentences.length > 0) {
        const chunkText = currentSentences.join('');
        chunks.push({
            chunkId: makeChunkId(floor, chunks.length),
            floor,
            chunkIdx: chunks.length,
            speaker,
            isUser,
            text: chunkText,
            textHash: hashText(chunkText),
        });
    }

    return chunks;
}
