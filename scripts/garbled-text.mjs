import { createHash } from 'node:crypto';

// 已核实：mdurl/lib/decode.mjs 用替换字符表示非法 UTF-8；markdown-it 的 normalize 用它替换 NUL。
// 只豁免该产物中这些 UTF-16 字符偏移，不豁免文件/行。原始字节指纹变化后全部失效，须重新核验。
export const VERIFIED_REPLACEMENT_CHARACTERS = Object.freeze({
    file: 'dist/shared/message-markdown-B5pdvOqZ.js',
    sha256: '9b4c3291e0fec29b38c12ca795426002b9d6917dd898e720b699705cd8dd15c0',
    offsets: Object.freeze([632, 633, 871, 872, 873, 1165, 1166, 1167, 1168, 1254, 57715]),
});

const patterns = [
    { name: 'question-marks', regex: /\?\?\?/g },
    { name: 'replacement-char', regex: /\uFFFD/g },
];

export function scanGarbledText(relativePath, bytes) {
    const reviewed = VERIFIED_REPLACEMENT_CHARACTERS;
    const approved = relativePath === reviewed.file
        && createHash('sha256').update(bytes).digest('hex') === reviewed.sha256;
    const allowedOffsets = new Set(approved ? reviewed.offsets : []);
    const lines = bytes.toString('utf8').split('\n');
    const hits = [];
    let lineOffset = 0;
    for (const [index, line] of lines.entries()) {
        for (const { name, regex } of patterns) {
            for (const match of line.matchAll(regex)) {
                const offset = lineOffset + match.index;
                if (match[0] === '\uFFFD' && allowedOffsets.has(offset)) continue;
                hits.push({
                    line: index + 1,
                    column: match.index + 1,
                    offset,
                    name,
                    preview: line.slice(Math.max(0, match.index - 60), match.index + 140).replace(/\t/g, '\\t').replace(/\r$/, ''),
                });
            }
        }
        lineOffset += line.length + 1;
    }
    return hits;
}
