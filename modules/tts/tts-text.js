// tts-text.js

/**
 * TTS 文本提取与情绪处理
 */

// ============ 文本提取 ============

export function extractSpeakText(rawText, rules = {}) {
    if (!rawText || typeof rawText !== 'string') return '';

    let text = rawText;
    
    const ttsPlaceholders = [];
    text = text.replace(/\[tts:[^\]]*\]/gi, (match) => {
        const placeholder = `__TTS_TAG_${ttsPlaceholders.length}__`;
        ttsPlaceholders.push(match);
        return placeholder;
    });

    const ranges = Array.isArray(rules.skipRanges) ? rules.skipRanges : [];
    for (const range of ranges) {
        const start = String(range?.start ?? '').trim();
        const end = String(range?.end ?? '').trim();
        if (!start && !end) continue;

        if (!start && end) {
            const endIdx = text.indexOf(end);
            if (endIdx !== -1) text = text.slice(endIdx + end.length);
            continue;
        }

        if (start && !end) {
            const startIdx = text.indexOf(start);
            if (startIdx !== -1) text = text.slice(0, startIdx);
            continue;
        }

        let out = '';
        let i = 0;
        while (true) {
            const sIdx = text.indexOf(start, i);
            if (sIdx === -1) {
                out += text.slice(i);
                break;
            }
            out += text.slice(i, sIdx);
            const eIdx = text.indexOf(end, sIdx + start.length);
            if (eIdx === -1) break;
            i = eIdx + end.length;
        }
        text = out;
    }

    const readRanges = Array.isArray(rules.readRanges) ? rules.readRanges : [];
    if (rules.readRangesEnabled && readRanges.length) {
        const keepSpans = [];
        for (const range of readRanges) {
            const start = String(range?.start ?? '').trim();
            const end = String(range?.end ?? '').trim();
            if (!start && !end) {
                keepSpans.push({ start: 0, end: text.length });
                continue;
            }
            if (!start && end) {
                const endIdx = text.indexOf(end);
                if (endIdx !== -1) keepSpans.push({ start: 0, end: endIdx });
                continue;
            }
            if (start && !end) {
                const startIdx = text.indexOf(start);
                if (startIdx !== -1) keepSpans.push({ start: startIdx + start.length, end: text.length });
                continue;
            }
            let i = 0;
            while (true) {
                const sIdx = text.indexOf(start, i);
                if (sIdx === -1) break;
                const eIdx = text.indexOf(end, sIdx + start.length);
                if (eIdx === -1) {
                    keepSpans.push({ start: sIdx + start.length, end: text.length });
                    break;
                }
                keepSpans.push({ start: sIdx + start.length, end: eIdx });
                i = eIdx + end.length;
            }
        }

        if (keepSpans.length) {
            keepSpans.sort((a, b) => a.start - b.start || a.end - b.end);
            const merged = [];
            for (const span of keepSpans) {
                if (!merged.length || span.start > merged[merged.length - 1].end) {
                    merged.push({ start: span.start, end: span.end });
                } else {
                    merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, span.end);
                }
            }
            text = merged.map(span => text.slice(span.start, span.end)).join('');
        } else {
            text = '';
        }
    }

    text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    for (let i = 0; i < ttsPlaceholders.length; i++) {
        text = text.replace(`__TTS_TAG_${i}__`, ttsPlaceholders[i]);
    }

    return text;
}

// ============ 分段解析 ============

export function parseTtsSegments(text) {
    if (!text || typeof text !== 'string') return [];

    const segments = [];
    const re = /\[tts:([^\]]*)\]/gi;
    let lastIndex = 0;
    let match = null;
    // 当前块的配置，每遇到新 [tts:] 块都重置
    let current = { emotion: '', context: '', speaker: '' };

    const pushSegment = (segmentText) => {
        const t = String(segmentText || '').trim();
        if (!t) return;
        segments.push({
            text: t,
            emotion: current.emotion || '',
            context: current.context || '',
            speaker: current.speaker || '',  // 空字符串表示使用 UI 默认
        });
    };

    const parseDirective = (raw) => {
        // ★ 关键修改：每个新块都重置为空，不继承上一个块的 speaker
        const next = { emotion: '', context: '', speaker: '' };
        
        const parts = String(raw || '').split(';').map(s => s.trim()).filter(Boolean);
        for (const part of parts) {
            const idx = part.indexOf('=');
            if (idx === -1) continue;
            const key = part.slice(0, idx).trim().toLowerCase();
            let val = part.slice(idx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
                val = val.slice(1, -1).trim();
            }
            if (key === 'emotion') next.emotion = val;
            if (key === 'context') next.context = val;
            if (key === 'speaker') next.speaker = val;
        }
        current = next;
    };

    while ((match = re.exec(text)) !== null) {
        pushSegment(text.slice(lastIndex, match.index));
        parseDirective(match[1]);
        lastIndex = match.index + match[0].length;
    }
    pushSegment(text.slice(lastIndex));

    return segments;
}


// ============ 非鉴权分段切割 ============

const FREE_MAX_TEXT = 1000;
const FREE_MIN_TEXT = 50;
const FREE_SENTENCE_DELIMS = new Set(['。', '！', '？', '!', '?', ';', '；', '…', '.', '，', ',', '、', ':', '：']);

function splitLongTextBySentence(text, maxLength) {
    const sentences = [];
    let buf = '';
    for (const ch of String(text || '')) {
        buf += ch;
        if (FREE_SENTENCE_DELIMS.has(ch)) {
            sentences.push(buf);
            buf = '';
        }
    }
    if (buf) sentences.push(buf);

    const chunks = [];
    let current = '';
    for (const sentence of sentences) {
        if (!sentence) continue;
        if (sentence.length > maxLength) {
            if (current) {
                chunks.push(current);
                current = '';
            }
            for (let i = 0; i < sentence.length; i += maxLength) {
                chunks.push(sentence.slice(i, i + maxLength));
            }
            continue;
        }
        if (!current) {
            current = sentence;
            continue;
        }
        if (current.length + sentence.length > maxLength) {
            chunks.push(current);
            current = sentence;
            continue;
        }
        current += sentence;
    }
    if (current) chunks.push(current);
    return chunks;
}

function splitTextForFree(text, maxLength = FREE_MAX_TEXT) {
    const chunks = [];
    const paragraphs = String(text || '').split(/\n\s*\n/).map(s => s.replace(/\n+/g, '\n').trim()).filter(Boolean);

    let current = '';
    const pushCurrent = () => {
        if (!current) return;
        chunks.push(current);
        current = '';
    };

    for (const para of paragraphs) {
        if (!para) continue;

        if (para.length > maxLength) {
            // Flush buffered short paragraphs before handling a long paragraph.
            pushCurrent();
            const longParts = splitLongTextBySentence(para, maxLength);
            for (const part of longParts) {
                const t = String(part || '').trim();
                if (!t) continue;
                if (!current) {
                    current = t;
                    continue;
                }
                if (current.length + t.length + 2 <= maxLength) {
                    current += `\n\n${t}`;
                    continue;
                }
                pushCurrent();
                current = t;
            }
            continue;
        }

        if (!current) {
            current = para;
            continue;
        }

        // Cross-paragraph merge: keep fewer requests while preserving paragraph boundary.
        if (current.length + para.length + 2 <= maxLength) {
            current += `\n\n${para}`;
            continue;
        }

        pushCurrent();
        current = para;
    }

    pushCurrent();
    return chunks;
}

export function splitTtsSegmentsForFree(segments, maxLength = FREE_MAX_TEXT) {
    if (!Array.isArray(segments) || !segments.length) return [];
    const normalizedSegments = [];

    // In free mode, only explicit speaker directives are semantic split points.
    // Adjacent segments without speaker= are merged to reduce request count.
    let mergeBuffer = null;
    const flushMergeBuffer = () => {
        if (!mergeBuffer) return;
        normalizedSegments.push(mergeBuffer);
        mergeBuffer = null;
    };

    for (const seg of segments) {
        const hasExplicitSpeaker = !!String(seg?.speaker || '').trim();
        const text = String(seg?.text || '').trim();
        if (!text) continue;

        if (hasExplicitSpeaker) {
            flushMergeBuffer();
            normalizedSegments.push({
                ...seg,
                text,
            });
            continue;
        }

        if (!mergeBuffer) {
            mergeBuffer = {
                ...seg,
                text,
                speaker: '',
            };
            continue;
        }

        mergeBuffer.text += `\n${text}`;
    }
    flushMergeBuffer();

    const out = [];
    for (const seg of normalizedSegments) {
        const parts = splitTextForFree(seg.text, maxLength);
        if (!parts.length) continue;
        let buffer = '';
        for (const part of parts) {
            const t = String(part || '').trim();
            if (!t) continue;
            if (!buffer) {
                buffer = t;
                continue;
            }
            if (buffer.length < FREE_MIN_TEXT && buffer.length + t.length <= maxLength) {
                buffer += `\n${t}`;
                continue;
            }
            out.push({ 
                text: buffer, 
                emotion: seg.emotion || '', 
                context: seg.context || '',
                speaker: seg.speaker || '',
                resolvedSpeaker: seg.resolvedSpeaker || '',
                resolvedSource: seg.resolvedSource || '',
            });
            buffer = t;
        }
        if (buffer) {
            out.push({ 
                text: buffer, 
                emotion: seg.emotion || '', 
                context: seg.context || '',
                speaker: seg.speaker || '',
                resolvedSpeaker: seg.resolvedSpeaker || '',
                resolvedSource: seg.resolvedSource || '',
            });
        }
    }
    return out;
}

// ============ 默认跳过标签 ============

export const DEFAULT_SKIP_TAGS = ['状态栏'];

// ============ 情绪处理 ============

export const TTS_EMOTIONS = new Set([
    'happy', 'sad', 'angry', 'surprised', 'fear', 'hate', 'excited', 'coldness', 'neutral',
    'depressed', 'lovey-dovey', 'shy', 'comfort', 'tension', 'tender', 'storytelling', 'radio',
    'magnetic', 'advertising', 'vocal-fry', 'asmr', 'news', 'entertainment', 'dialect',
    'chat', 'warm', 'affectionate', 'authoritative',
]);

export const EMOTION_CN_MAP = {
    '开心': 'happy', '高兴': 'happy', '愉悦': 'happy',
    '悲伤': 'sad', '难过': 'sad',
    '生气': 'angry', '愤怒': 'angry',
    '惊讶': 'surprised',
    '恐惧': 'fear', '害怕': 'fear',
    '厌恶': 'hate',
    '激动': 'excited', '兴奋': 'excited',
    '冷漠': 'coldness', '中性': 'neutral', '沮丧': 'depressed',
    '撒娇': 'lovey-dovey', '害羞': 'shy',
    '安慰': 'comfort', '鼓励': 'comfort',
    '咆哮': 'tension', '焦急': 'tension',
    '温柔': 'tender',
    '讲故事': 'storytelling', '自然讲述': 'storytelling',
    '情感电台': 'radio', '磁性': 'magnetic',
    '广告营销': 'advertising', '气泡音': 'vocal-fry',
    '低语': 'asmr', '新闻播报': 'news',
    '娱乐八卦': 'entertainment', '方言': 'dialect',
    '对话': 'chat', '闲聊': 'chat',
    '温暖': 'warm', '深情': 'affectionate', '权威': 'authoritative',
};

export function normalizeEmotion(raw) {
    if (!raw) return '';
    let val = String(raw).trim();
    if (!val) return '';
    val = EMOTION_CN_MAP[val] || EMOTION_CN_MAP[val.toLowerCase()] || val.toLowerCase();
    if (val === 'vocal - fry' || val === 'vocal_fry') val = 'vocal-fry';
    if (val === 'surprise') val = 'surprised';
    if (val === 'scare') val = 'fear';
    return TTS_EMOTIONS.has(val) ? val : '';
}
