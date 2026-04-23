const MAX_DIFF_MATRIX_CELLS = 250000;
const MAX_DIFF_PREVIEW_LINES = 160;

export function buildCodeRows(text = '') {
    const lines = String(text || '').split('\n');
    return lines.map((line, index) => ({
        lineNumber: index + 1,
        text: line,
    }));
}

export function buildDiffRows(originalText = '', currentText = '') {
    const left = String(originalText || '').split('\n');
    const right = String(currentText || '').split('\n');
    const rowCount = left.length + 1;
    const colCount = right.length + 1;
    if ((rowCount * colCount) > MAX_DIFF_MATRIX_CELLS) {
        const previewRows = [];
        previewRows.push({
            kind: 'context',
            leftLineNumber: '',
            rightLineNumber: '',
            text: `Diff 已降级显示：文件较大（${left.length} -> ${right.length} 行），为避免界面卡顿仅展示前 ${MAX_DIFF_PREVIEW_LINES} 行预览。`,
        });

        const previewOriginal = left.slice(0, MAX_DIFF_PREVIEW_LINES);
        const previewCurrent = right.slice(0, MAX_DIFF_PREVIEW_LINES);
        const previewCount = Math.max(previewOriginal.length, previewCurrent.length);
        for (let index = 0; index < previewCount; index += 1) {
            const originalLine = previewOriginal[index];
            const currentLine = previewCurrent[index];
            if (originalLine === currentLine) {
                previewRows.push({
                    kind: 'context',
                    leftLineNumber: originalLine === undefined ? '' : index + 1,
                    rightLineNumber: currentLine === undefined ? '' : index + 1,
                    text: originalLine || currentLine || '',
                });
                continue;
            }
            if (originalLine !== undefined) {
                previewRows.push({
                    kind: 'remove',
                    leftLineNumber: index + 1,
                    rightLineNumber: '',
                    text: originalLine,
                });
            }
            if (currentLine !== undefined) {
                previewRows.push({
                    kind: 'add',
                    leftLineNumber: '',
                    rightLineNumber: index + 1,
                    text: currentLine,
                });
            }
        }

        if (left.length > MAX_DIFF_PREVIEW_LINES || right.length > MAX_DIFF_PREVIEW_LINES) {
            previewRows.push({
                kind: 'context',
                leftLineNumber: '',
                rightLineNumber: '',
                text: '其余内容已省略。可切换到“当前”或“原始”继续查看全文。',
            });
        }
        return previewRows;
    }

    const table = Array.from({ length: rowCount }, () => new Uint16Array(colCount));

    for (let i = 1; i < rowCount; i += 1) {
        for (let j = 1; j < colCount; j += 1) {
            table[i][j] = left[i - 1] === right[j - 1]
                ? table[i - 1][j - 1] + 1
                : Math.max(table[i - 1][j], table[i][j - 1]);
        }
    }

    const rows = [];
    let i = left.length;
    let j = right.length;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && left[i - 1] === right[j - 1]) {
            rows.push({
                kind: 'context',
                leftLineNumber: i,
                rightLineNumber: j,
                text: left[i - 1],
            });
            i -= 1;
            j -= 1;
            continue;
        }

        if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
            rows.push({
                kind: 'add',
                leftLineNumber: '',
                rightLineNumber: j,
                text: right[j - 1],
            });
            j -= 1;
            continue;
        }

        if (i > 0) {
            rows.push({
                kind: 'remove',
                leftLineNumber: i,
                rightLineNumber: '',
                text: left[i - 1],
            });
            i -= 1;
        }
    }

    rows.reverse();
    return rows;
}
