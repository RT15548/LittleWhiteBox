import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dbModule = await import('../shared/ebook-db.js');
const toolsModule = await import('../shared/book-tools.js');
const bookTemplatesModule = await import('../shared/book-templates.js');
const bookPackageModule = await import('../shared/book-package.js');
const controllerModule = await import('../app-src/book-controller.js');
const conversationStoreModule = await import('../app-src/conversation-store.js');
const compactionModule = await import('../app-src/history-compaction.js');
const promptsModule = await import('../app-src/prompts.js');
const agentRunnerModule = await import('../app-src/agent-runner.js');
const ebookAppModule = await import('../app-src/ebook-app.js');
const rendererModule = await import('../app-src/renderer.js');
const uiBindingsModule = await import('../app-src/ui-bindings.js');
const messageMarkdownModule = await import('../../agent-core/ui/message-markdown.js');
const lightBrakeModule = await import('../../agent-core/runtime/light-brake.js');
const textEditModule = await import('../../agent-core/tools/text-edit.js');
const openAICompatibleAdapterModule = await import('../../agent-core/adapters/openai-compatible.js');
const looseToolArgumentsModule = await import('../../agent-core/runtime/loose-tool-arguments.js');

const {
    default: db,
    createBook,
    deleteBook,
    deleteBookPath,
    getBook,
    getBookFile,
    getSelectedBookId,
    importBookFromFiles,
    listBookFiles,
    listBooks,
    ebookMessagesTable,
    ebookSessionsTable,
    setSelectedBookId,
    upsertBookFile,
} = dbModule;
const {
    EBOOK_TOOL_NAMES,
    buildEbookToolFailureResult,
    createBookToolRuntime,
    getEbookToolDefinitions,
} = toolsModule;
const { DEFAULT_BOOK_FILES } = bookTemplatesModule;
const {
    buildEbookPackage,
    collectEbookImageSlotIds,
    parseEbookPackage,
} = bookPackageModule;
const { createBookController, formatDrawProgress } = controllerModule;
const { createEbookConversationStore } = conversationStoreModule;
const {
    EBOOK_DEFAULT_PRESERVED_TURNS,
    EBOOK_MAX_CONTEXT_TOKENS,
    EBOOK_MIN_PRESERVED_TURNS,
    EBOOK_SUMMARY_TRIGGER_TOKENS,
    createEbookHistoryCompactionController,
} = compactionModule;
const {
    EBOOK_DELEGATE_PROMPT,
    EBOOK_SYSTEM_PROMPT,
    buildActionPrompt,
    buildBookContextPrompt,
    buildBookTurnContextPrompt,
    buildDelegateBookContextPrompt,
} = promptsModule;
const { buildEbookProviderMessagesFromHistory, createEbookAgentRunner } = agentRunnerModule;
const {
    captureScrollState,
    createEbookApp,
    restoreScrollState,
    shouldForceAgentScrollToBottom,
    shouldResetReaderScrollOnRender,
} = ebookAppModule;
const {
    collectAgentRenderUnits,
    collectStudioFileSectionModels,
    countMessageWindowUnits,
    buildConversationContextMeterStateKey,
    renderEbookShell,
    renderAgentMessages,
    renderConversationContextMeterLabel,
    renderConversationContextMeterTitle,
} = rendererModule;
const { bindEbookEvents } = uiBindingsModule;
const { HTML_PREVIEW_SANDBOX, renderMarkdownToHtml } = messageMarkdownModule;
const { createLightBrakeController } = lightBrakeModule;
const { applyTextEdits } = textEditModule;
const { buildTaggedMessages, extractTaggedToolCalls } = openAICompatibleAdapterModule;
const { repairLooseToolArguments } = looseToolArgumentsModule;

async function resetDb() {
    await db.delete();
    await db.open();
}

test('ebook startup posts frame-ready before shelf hydration and host config is prewarmed', () => {
    const appSource = readFileSync(new URL('../app-src/ebook-app.js', import.meta.url), 'utf8');
    const stateSource = readFileSync(new URL('../app-src/state.js', import.meta.url), 'utf8');
    const rendererSource = readFileSync(new URL('../app-src/renderer.js', import.meta.url), 'utf8');
    const hostSource = readFileSync(new URL('../ebook.js', import.meta.url), 'utf8');
    const startIndex = appSource.indexOf('function start() {');
    const readyIndex = appSource.indexOf("hostBridge.postToHost('xb-ebook:frame-ready');", startIndex);
    assert.notEqual(startIndex, -1);
    assert.notEqual(readyIndex, -1);
    const beforeReady = appSource.slice(startIndex, readyIndex);
    assert.doesNotMatch(beforeReady, /initializeBook\(\)|refreshDrawStatus\(|refreshTtsStatus\(/);
    assert.match(appSource, /function start\(\) \{[\s\S]*render\(\);\s*hostBridge\.postToHost\('xb-ebook:frame-ready'\);\s*void hydrateEbookStartup\(\{ renderInitial: false \}\);/);
    assert.match(appSource, /async function hydrateEbookStartup\(options = \{\}\) \{[\s\S]*if \(options\.renderInitial !== false\) \{[\s\S]*render\(\);[\s\S]*\}/);
    assert.match(appSource, /async function hydrateEbookStartup\(options = \{\}\) \{[\s\S]*await bookController\.initializeBook\(\);[\s\S]*refreshDrawStatus\(\{ renderAfter: true \}\);[\s\S]*refreshTtsStatus\(\{ renderAfter: true \}\);/);
    assert.match(appSource, /catch \(error\) \{[\s\S]*state\.shelfLoadError = error\?\.message \|\| String\(error \|\| 'shelf_load_failed'\);[\s\S]*state\.status = `书架加载失败：\$\{state\.shelfLoadError\}`;[\s\S]*render\(\);/);
    assert.match(stateSource, /isShelfLoading: true,/);
    assert.match(stateSource, /shelfLoadError: '',/);
    assert.match(rendererSource, /id="xb-library-retry-shelf"/);
    assert.match(rendererSource, /state\.isBusy \|\| state\.isShelfLoading \|\| state\.shelfLoadError/);
    assert.match(hostSource, /let initialConfigPromise = null;/);
    assert.match(hostSource, /function prepareInitialConfig\(\) \{[\s\S]*initialConfigPromise = promise;/);
    assert.match(hostSource, /async function sendInitialConfigToFrame\(\) \{[\s\S]*const promise = initialConfigPromise \|\| buildEbookFrameConfig\(\);[\s\S]*postToFrame\('xb-ebook:config', await promise\);/);
    assert.match(hostSource, /async function openEbook\(\) \{[\s\S]*prepareInitialConfig\(\);[\s\S]*await createOverlay\(\);/);
    assert.match(hostSource, /case 'xb-ebook:frame-ready':[\s\S]*void sendInitialConfigToFrame\(\)\.catch\(\(error\) => \{[\s\S]*\}\)\.finally\(\(\) => \{[\s\S]*flushPendingMessages\(\);/);
});

test('Ebook package helpers collect referenced image slots and normalize files', () => {
    const files = [
        { path: 'book/chapters/002.md', content: '正文\n[ebook-image:slot-a]\n[ebook-image:slot-b]' },
        { path: 'book/chapters/001.md', content: '旧图 [ebook-image:slot-a]' },
        { path: '../bad.md', content: '无效路径不会进入作品包' },
    ];

    assert.deepEqual(collectEbookImageSlotIds(files), ['slot-a', 'slot-b']);

    const pkg = buildEbookPackage({
        book: { title: '测试书' },
        files,
        images: {
            slots: ['slot-a'],
            previews: [{ slotId: 'slot-a', imgId: 'img-a', base64: 'data:image/png;base64,AAAA' }],
            selections: [{ slotId: 'slot-a', selectedImgId: 'img-a' }],
            skipped: [],
        },
    });

    assert.equal(pkg.type, 'littlewhitebox-ebook-package');
    assert.equal(pkg.version, 1);
    assert.deepEqual(pkg.files.map((file) => file.path), ['book/chapters/001.md', 'book/chapters/002.md']);
    assert.deepEqual(pkg.images.slots, ['slot-a']);
    assert.equal(pkg.images.previews[0].imgId, 'img-a');
});

test('Ebook package parser rejects invalid packages and returns portable files', () => {
    assert.throws(() => parseEbookPackage({ type: 'bad', version: 1, files: [] }), /不是小白电纸书作品包/);
    assert.throws(() => parseEbookPackage({ type: 'littlewhitebox-ebook-package', version: 999, files: [] }), /作品包版本不支持/);
    assert.throws(() => parseEbookPackage({ type: 'littlewhitebox-ebook-package', version: 1, files: [] }), /作品包没有书稿文件/);

    const parsed = parseEbookPackage({
        type: 'littlewhitebox-ebook-package',
        version: 1,
        book: { title: '导入标题' },
        files: [{ path: 'book/outline.md', content: '# 大纲' }],
        images: { slots: ['slot-a'], previews: [], selections: [] },
    });

    assert.equal(parsed.title, '导入标题');
    assert.deepEqual(parsed.files, [{ path: 'book/outline.md', content: '# 大纲', createdAt: 0, updatedAt: 0 }]);
    assert.deepEqual(parsed.images.slots, ['slot-a']);
});

test('Importing ebook files creates a new shelf book without changing selected book', async () => {
    await resetDb();
    const existing = await createBook('原书');
    await importBookFromFiles('导入书', [
        { path: 'book/outline.md', content: '# 导入大纲' },
        { path: 'book/chapters/001.md', content: '导入正文' },
    ]);

    assert.equal(await getSelectedBookId(), existing.id);
    const books = await listBooks();
    assert.equal(books.length, 2);
    assert.ok(books.some((book) => book.title === '导入书'));
});

test('Library book list reports drafted chapter counts without counting the starter placeholder', async () => {
    await resetDb();
    const book = await createBook('章节统计书');
    assert.equal((await listBooks())[0]?.chapterCount, 0);

    await upsertBookFile(book.id, 'book/chapters/001.md', '# 第 1 章\n\n正文。');
    await upsertBookFile(book.id, 'book/chapters/002.md', '第二章正文。');
    await upsertBookFile(book.id, 'book/notes/revision-plan.md', '不是正文。');

    const [listed] = await listBooks();
    assert.equal(listed.title, '章节统计书');
    assert.equal(listed.chapterCount, 2);
});

test('Library book list counts chapter 001 and high chapter numbers without off-by-one', async () => {
    await resetDb();
    const book = await createBook('高章节统计书');
    const writes = [];
    for (let index = 1; index <= 276; index += 1) {
        const path = `book/chapters/${String(index).padStart(3, '0')}.md`;
        writes.push(upsertBookFile(book.id, path, `# 第 ${index} 章\n\n第 ${index} 章正文。`));
    }
    await Promise.all(writes);

    const [listed] = await listBooks();
    assert.equal(listed.title, '高章节统计书');
    assert.equal(listed.chapterCount, 276);

    const turnPrompt = buildBookTurnContextPrompt({
        book,
        files: await listBookFiles(book.id),
    });
    assert.match(turnPrompt, /已实际创作章节：276 章/);
});

test('Shared applyTextEdits replaces short and multiline text fragments', () => {
    const result = applyTextEdits('她低头看杯子。\n杯沿还有水痕。\n她笑了。', [
        { oldString: '低头看', newString: '慢慢低头看' },
        { oldString: '杯沿还有水痕。\n她笑了。', newString: '杯沿那点水痕还没干。\n她笑了一下。' },
    ]);

    assert.equal(result.ok, true);
    assert.equal(result.content, '她慢慢低头看杯子。\n杯沿那点水痕还没干。\n她笑了一下。');
    assert.deepEqual(result.results.map((item) => item.replacements), [1, 1]);
});

test('Shared applyTextEdits reports multiple matches with line contexts unless replaceAll is set', () => {
    const content = [
        '他看着窗外那些珍稀动物，心里发沉。',
        '园里养着几只珍稀动物，每天有人喂食。',
        '保护这些珍稀动物是他们的职责。',
    ].join('\n');
    const failed = applyTextEdits(content, [
        { oldString: '珍稀动物', newString: '怪物' },
    ]);

    assert.equal(failed.ok, false);
    assert.equal(failed.results[0].error, 'multiple_matches');
    assert.match(failed.results[0].suggestion, /expand oldString/);
    assert.equal(failed.results[0].matches.length, 3);
    assert.equal(failed.results[0].matches[0].line, 1);
    assert.match(failed.results[0].matches[1].context, /园里养着/);

    const replaced = applyTextEdits(content, [
        { oldString: '珍稀动物', newString: '怪物', replaceAll: true },
    ]);
    assert.equal(replaced.ok, true);
    assert.equal((replaced.content.match(/怪物/g) || []).length, 3);
});

test('Shared applyTextEdits tolerates whitespace differences for long fragments', () => {
    const content = [
        '开头。',
        '第一段看见了光。',
        '',
        '  第二段，停在门口。',
        '第三段才慢慢回头。',
        '结尾。',
    ].join('\n');
    const result = applyTextEdits(content, [
        {
            oldString: '第一段看见了光。\n第二段,停在门口。\n\n第三段才慢慢回头。',
            newString: '第一段没有立刻说话。\n第二段把手收回去。',
        },
    ]);

    assert.equal(result.ok, true);
    assert.equal(result.results[0].matchedBy, 'flexible_whitespace');
    assert.equal(result.content, [
        '开头。',
        '第一段没有立刻说话。',
        '第二段把手收回去。',
        '结尾。',
    ].join('\n'));
});

test('Shared applyTextEdits replaces line ranges in descending order automatically', () => {
    const content = ['一', '二', '三', '四', '五', '六', '七', '八'].join('\n');
    const result = applyTextEdits(content, [
        { startLine: 2, endLine: 3, newString: '二三合并' },
        { startLine: 6, endLine: 7, newString: '6: 六改\n7: 七改\n8: 七后新增' },
    ]);

    assert.equal(result.ok, true);
    assert.equal(result.results[0].matchedBy, 'line_range');
    assert.match(result.results[1].oldPreview, /6: 六/);
    assert.match(result.results[1].newPreview, /6: 六改/);
    assert.equal(result.content, ['一', '二三合并', '四', '五', '六改', '七改', '七后新增', '八'].join('\n'));
});

test('Shared applyTextEdits ignores stray optional mode fields from model tool arguments', () => {
    const content = ['一', '二', '三', '四'].join('\n');
    const lineRange = applyTextEdits(content, [
        {
            oldString: '二',
            startLine: 2,
            endLine: 3,
            insertAtLine: 2,
            newString: '二三合并',
        },
    ]);
    assert.equal(lineRange.ok, true);
    assert.equal(lineRange.results[0].matchedBy, 'line_range');
    assert.equal(lineRange.content, ['一', '二三合并', '四'].join('\n'));

    const insertion = applyTextEdits(content, [
        {
            oldString: '三',
            startLine: null,
            endLine: null,
            insertAtLine: 3,
            newString: '插入行',
        },
    ]);
    assert.equal(insertion.ok, true);
    assert.equal(insertion.results[0].matchedBy, 'line_insert');
    assert.equal(insertion.content, ['一', '二', '插入行', '三', '四'].join('\n'));

    const oldString = applyTextEdits(content, [
        {
            oldString: '二',
            startLine: null,
            endLine: null,
            insertAtLine: '',
            newString: '二三合并',
        },
    ]);
    assert.equal(oldString.ok, true);
    assert.equal(oldString.results[0].matchedBy, 'exact');
    assert.equal(oldString.content, ['一', '二三合并', '三', '四'].join('\n'));
});

test('Shared applyTextEdits accepts JSON-stringified edits with a warning and rejects invalid edit types', () => {
    const content = ['一', '二', '三'].join('\n');
    const parsed = applyTextEdits(content, JSON.stringify([
        { startLine: 2, endLine: 3, newString: '二三合并成一行' },
    ]));

    assert.equal(parsed.ok, true);
    assert.match(parsed.warning, /模型把 edits 发成了字符串/);
    assert.equal(parsed.content, ['一', '二三合并成一行'].join('\n'));

    const invalidString = applyTextEdits(content, '[{]');
    assert.equal(invalidString.ok, false);
    assert.equal(invalidString.results[0].error, 'invalid_edits_json_string');
    assert.match(invalidString.results[0].message, /received a string/);
    assert.match(invalidString.results[0].suggestion, /Do not JSON-stringify edits/);

    const objectValue = applyTextEdits(content, { startLine: 1, endLine: 1, newString: '甲' });
    assert.equal(objectValue.ok, false);
    assert.equal(objectValue.results[0].error, 'edits_must_be_array');
    assert.match(objectValue.results[0].message, /received object/);

    const missingValue = applyTextEdits(content);
    assert.equal(missingValue.ok, false);
    assert.equal(missingValue.results[0].error, 'missing_edits_array');
    assert.match(missingValue.results[0].message, /it was missing/);
});

test('Shared applyTextEdits repairs malformed JSON-like stringified line edits', () => {
    const content = ['一', '二', '三', '四'].join('\n');
    const malformed = '[{"startLine":2,"endLine":3,"newString":"她说："回来。"\n三也留下"}]';
    const result = applyTextEdits(content, malformed);

    assert.equal(result.ok, true);
    assert.match(result.warning, /不是标准 JSON/);
    assert.equal(result.content, ['一', '她说："回来。"', '三也留下', '四'].join('\n'));

    const multi = applyTextEdits(content, '[{"startLine":2,"endLine":2,"newString":"二："改""},{"insertAtLine":4,"newString":"四之前"}]');
    assert.equal(multi.ok, true);
    assert.equal(multi.content, ['一', '二："改"', '三', '四之前', '四'].join('\n'));

    const keyLikeText = applyTextEdits(content, '[{"startLine":2,"endLine":2,"newString":"正文里写着 "startLine":999，但这只是内容"}]');
    assert.equal(keyLikeText.ok, true);
    assert.equal(keyLikeText.content, ['一', '正文里写着 "startLine":999，但这只是内容', '三', '四'].join('\n'));

    const newStringFirst = applyTextEdits(content, '[{"newString":"二三合并成一行","startLine":2,"endLine":3}]');
    assert.equal(newStringFirst.ok, true);
    assert.equal(newStringFirst.content, ['一', '二三合并成一行', '四'].join('\n'));

    const newStringFirstWithKeyLikeText = applyTextEdits(content, '[{"newString":"正文里写着 "startLine":999，但这只是内容","startLine":2,"endLine":2}]');
    assert.equal(newStringFirstWithKeyLikeText.ok, true);
    assert.equal(newStringFirstWithKeyLikeText.content, ['一', '正文里写着 "startLine":999，但这只是内容', '三', '四'].join('\n'));

    const oldStringKeyLikeText = applyTextEdits(content, '[{"startLine":2,"endLine":2,"newString":"正文里写着 "oldString":假字段，但这只是内容"}]');
    assert.equal(oldStringKeyLikeText.ok, true);
    assert.equal(oldStringKeyLikeText.content, ['一', '正文里写着 "oldString":假字段，但这只是内容', '三', '四'].join('\n'));

    const braceSplitLikeText = applyTextEdits(content, '[{"startLine":2,"endLine":2,"newString":"文本 },{ "startLine":999 还在正文"}]');
    assert.equal(braceSplitLikeText.ok, true);
    assert.equal(braceSplitLikeText.content, ['一', '文本 },{ "startLine":999 还在正文', '三', '四'].join('\n'));
});

test('Shared applyTextEdits inserts text before, inside, and after line-numbered content', () => {
    const content = ['一', '二', '三'].join('\n');
    const result = applyTextEdits(content, [
        { insertAtLine: 1, newString: '开头' },
        { insertAtLine: 3, newString: '3: 中间甲\n4: 中间乙' },
        { insertAtLine: 4, newString: '结尾' },
    ]);

    assert.equal(result.ok, true);
    assert.equal(result.results[0].matchedBy, 'line_insert');
    assert.match(result.results[1].newPreview, /3: 中间甲/);
    assert.equal(result.content, ['开头', '一', '二', '中间甲', '中间乙', '三', '结尾'].join('\n'));

    const empty = applyTextEdits('', [
        { insertAtLine: 1, newString: '第一行' },
    ]);
    assert.equal(empty.ok, true);
    assert.equal(empty.content, '第一行');
});

test('Shared applyTextEdits deletes words, sentences, and line ranges with empty newString', () => {
    const oldStringDelete = applyTextEdits('她慢慢抬头。她没有说话。', [
        { oldString: '慢慢', newString: '' },
        { oldString: '她没有说话。', newString: '' },
    ]);

    assert.equal(oldStringDelete.ok, true);
    assert.equal(oldStringDelete.content, '她抬头。');

    const lineRangeDelete = applyTextEdits(['一', '二', '三', '四'].join('\n'), [
        { startLine: 2, endLine: 3, newString: '' },
    ]);

    assert.equal(lineRangeDelete.ok, true);
    assert.equal(lineRangeDelete.results[0].matchedBy, 'line_range');
    assert.equal(lineRangeDelete.content, ['一', '四'].join('\n'));
});

test('Shared applyTextEdits rejects oldString mixed with line-number modes and partially applies valid line ranges', () => {
    const content = ['一', '二', '三', '四', '五'].join('\n');
    const dirtyLineRangeItem = applyTextEdits(content, [
        { oldString: '一', startLine: 1, endLine: 1, newString: '一改' },
    ]);
    assert.equal(dirtyLineRangeItem.ok, true);
    assert.equal(dirtyLineRangeItem.content, ['一改', '二', '三', '四', '五'].join('\n'));
    assert.equal(dirtyLineRangeItem.results[0].matchedBy, 'line_range');

    const mixed = applyTextEdits(content, [
        { startLine: 1, endLine: 1, newString: '一改' },
        { oldString: '二', newString: '二改' },
    ]);
    assert.equal(mixed.ok, false);
    assert.equal(mixed.content, content);
    assert.equal(mixed.results[0].error, 'mixed_edit_modes');

    const overlapping = applyTextEdits(content, [
        { startLine: 2, endLine: 4, newString: '中段' },
        { startLine: 3, endLine: 5, newString: '后段' },
    ]);
    assert.equal(overlapping.ok, false);
    assert.equal(overlapping.content, content);
    assert.equal(overlapping.results[1].error, 'overlapping_line_ranges');

    const partial = applyTextEdits(content, [
        { startLine: 1, endLine: 1, newString: '一改' },
        { startLine: 9, endLine: 9, newString: '越界' },
        { startLine: 5, endLine: 5, newString: '五改' },
    ]);
    assert.equal(partial.ok, false);
    assert.equal(partial.partial, true);
    assert.equal(partial.results[1].index, 1);
    assert.equal(partial.results[1].mode, 'line_range');
    assert.equal(partial.results[1].startLine, 9);
    assert.equal(partial.results[1].endLine, 9);
    assert.equal(partial.results[1].error, 'line_range_out_of_bounds');
    assert.equal(partial.content, ['一改', '二', '三', '四', '五改'].join('\n'));
});

test('Shared applyTextEdits mixes line ranges and insertions using original Read line numbers', () => {
    const content = ['一', '二', '三', '四', '五'].join('\n');
    const result = applyTextEdits(content, [
        { insertAtLine: 5, newString: '五之前' },
        { startLine: 2, endLine: 3, newString: '二三合并' },
        { insertAtLine: 2, newString: '二之前' },
    ]);

    assert.equal(result.ok, true);
    assert.equal(result.results[0].matchedBy, 'line_insert');
    assert.equal(result.results[1].matchedBy, 'line_range');
    assert.equal(result.results[2].matchedBy, 'line_insert');
    assert.equal(result.content, ['一', '二之前', '二三合并', '四', '五之前', '五'].join('\n'));

    const ambiguous = applyTextEdits(content, [
        { startLine: 2, endLine: 4, newString: '中段' },
        { insertAtLine: 3, newString: '插在被替换范围内部' },
        { insertAtLine: 5, newString: '五之前' },
    ]);

    assert.equal(ambiguous.ok, false);
    assert.equal(ambiguous.partial, true);
    assert.equal(ambiguous.results[0].error, 'insert_inside_line_range');
    assert.equal(ambiguous.results[1].error, 'insert_inside_line_range');
    assert.equal(ambiguous.results[2].matchedBy, 'line_insert');
    assert.equal(ambiguous.content, ['一', '二', '三', '四', '五之前', '五'].join('\n'));
});

test('Shared applyTextEdits protects later edits from matching newly inserted text', () => {
    const result = applyTextEdits('他走过来。', [
        { oldString: '他', newString: '他慢慢' },
        { oldString: '慢慢', newString: '缓缓' },
    ]);

    assert.equal(result.ok, false);
    assert.equal(result.partial, true);
    assert.equal(result.content, '他慢慢走过来。');
    assert.equal(result.results[1].error, 'old_string_matches_previous_new_string');
    assert.match(result.results[1].suggestion, /Merge overlapping changes/);
});

test('Shared applyTextEdits reports not found, no changes, and adapts common punctuation', () => {
    const missing = applyTextEdits('她说：“回来，快点。”', [
        { oldString: '不存在', newString: '存在' },
    ]);
    assert.equal(missing.results[0].error, 'not_found');
    assert.equal(missing.results[0].index, 0);
    assert.equal(missing.results[0].mode, 'old_string');
    assert.equal(missing.results[0].oldPreview, '不存在');
    assert.match(missing.results[0].suggestion, /Read the current file/);

    const noChange = applyTextEdits('原文', [
        { oldString: '原文', newString: '原文' },
    ]);
    assert.equal(noChange.results[0].error, 'no_changes');
    assert.match(noChange.results[0].suggestion, /remove this edit/);

    const smart = applyTextEdits('她说：“回来，快点。”', [
        { oldString: '"回来,快点."', newString: '"别走,等我."' },
    ]);
    assert.equal(smart.ok, true);
    assert.equal(smart.content, '她说：“别走，等我。”');
});

test('Shared applyTextEdits guards against matching style-adapted inserted text', () => {
    const result = applyTextEdits('她说：“回来，快点。”', [
        { oldString: '"回来,快点."', newString: '"别走,等我."' },
        { oldString: '别走，', newString: '留下，' },
    ]);

    assert.equal(result.ok, false);
    assert.equal(result.partial, true);
    assert.equal(result.content, '她说：“别走，等我。”');
    assert.equal(result.results[1].error, 'old_string_matches_previous_new_string');
});

test('Shared applyTextEdits guards against equivalent punctuation in edit chains', () => {
    const result = applyTextEdits('她说：“回来，快点。”', [
        { oldString: '"回来,快点."', newString: '"别走,等我."' },
        { oldString: '别走,', newString: '留下,' },
    ]);

    assert.equal(result.ok, false);
    assert.equal(result.partial, true);
    assert.equal(result.content, '她说：“别走，等我。”');
    assert.equal(result.results[1].error, 'old_string_matches_previous_new_string');
});

test('Shared applyTextEdits treats oldString edits covered by a previous replacement as successful', () => {
    const oldFragment = '旧句A要替换并保留足够上下文。';
    const newFragment = '新的长句已经到位，并且带有足够具体的目标文本。';
    const overlapped = applyTextEdits(`开头。\n${oldFragment}\n结尾。`, [
        {
            oldString: `开头。\n${oldFragment}\n结尾。`,
            newString: `开头。\n${newFragment}\n结尾。`,
        },
        {
            oldString: oldFragment,
            newString: newFragment,
        },
    ]);

    assert.equal(overlapped.ok, true);
    assert.equal(overlapped.content, `开头。\n${newFragment}\n结尾。`);
    assert.equal(overlapped.results[1].matchedBy, 'already_satisfied');
    assert.equal(overlapped.results[1].satisfied, true);
    assert.equal(overlapped.results[1].previousError, 'not_found');

    const idempotent = applyTextEdits(`开头。\n${newFragment}\n结尾。`, [
        {
            oldString: oldFragment,
            newString: newFragment,
        },
    ]);

    assert.equal(idempotent.ok, false);
    assert.equal(idempotent.content, `开头。\n${newFragment}\n结尾。`);
    assert.equal(idempotent.results[0].error, 'not_found');
    assert.equal(idempotent.results[0].uncertain, true);
    assert.equal(idempotent.results[0].possibleAlreadyApplied, true);

    const exactShortDuplicate = applyTextEdits('甲', [
        { oldString: '甲', newString: '乙' },
        { oldString: '甲', newString: '乙' },
    ]);

    assert.equal(exactShortDuplicate.ok, true);
    assert.equal(exactShortDuplicate.content, '乙');
    assert.equal(exactShortDuplicate.results[1].matchedBy, 'already_satisfied');
});

test('Shared applyTextEdits does not let later replacements satisfy earlier failures', () => {
    const result = applyTextEdits('marker\nreal old-to-change text here', [
        {
            oldString: 'marker',
            newString: 'marker old-to-change text',
        },
        {
            oldString: 'old-to-change text',
            newString: 'desired text',
        },
        {
            oldString: 'real old-to-change text here',
            newString: 'real desired text here',
        },
    ]);

    assert.equal(result.ok, false);
    assert.equal(result.partial, true);
    assert.equal(result.content, 'marker old-to-change text\nreal desired text here');
    assert.equal(result.results[1].error, 'old_string_matches_previous_new_string');
    assert.notEqual(result.results[1].matchedBy, 'already_satisfied');
});

test('Shared applyTextEdits does not treat failed line edits as successful just because target text exists elsewhere', () => {
    const target = '这一整段目标文本已经非常具体，足够判断它不是偶然重复。';
    const result = applyTextEdits(['一', '旧段落', '三'].join('\n'), [
        { startLine: 2, endLine: 2, newString: target },
        { startLine: 9, endLine: 9, newString: target },
    ]);

    assert.equal(result.ok, false);
    assert.equal(result.partial, true);
    assert.equal(result.content, ['一', target, '三'].join('\n'));
    assert.equal(result.results[1].error, 'line_range_out_of_bounds');
});

test('Shared applyTextEdits returns original content for empty edits', () => {
    const result = applyTextEdits('原文', []);

    assert.equal(result.ok, false);
    assert.equal(result.content, '原文');
    assert.equal(result.results[0].error, 'invalid_edits');
    assert.match(result.results[0].suggestion, /non-empty edits array/);
});

test('Book tools reject paths outside the current book namespace', async () => {
    await resetDb();
    const book = await createBook('安全边界测试');
    const runtime = createBookToolRuntime({ bookId: book.id });

    await assert.rejects(
        () => runtime.execute(EBOOK_TOOL_NAMES.READ, { filePath: 'local/a.md' }),
        /book_path_required/,
    );
    await assert.rejects(
        () => runtime.execute(EBOOK_TOOL_NAMES.READ, { filePath: '../x.md' }),
        /book_path_required/,
    );
    await assert.rejects(
        () => runtime.execute(EBOOK_TOOL_NAMES.WRITE, { path: 'scripts/x.md', content: 'bad' }),
        /book_path_required/,
    );

    const ok = await runtime.execute(EBOOK_TOOL_NAMES.READ, { filePath: 'book/outline.md', limit: 5 });
    assert.equal(ok.ok, true);
    assert.match(ok.content, /大纲/);

    const root = await runtime.execute(EBOOK_TOOL_NAMES.LS, { path: 'book/' });
    assert.equal(root.entries.some((entry) => entry.path === 'book/sources/'), true);
    assert.equal(root.entries.some((entry) => entry.path === 'book/reviews/'), true);
});

test('Book Grep defaults to literal text search and only uses regex when requested', async () => {
    await resetDb();
    const book = await createBook('Grep 字面搜索测试');
    await upsertBookFile(book.id, 'book/notes/grep.md', [
        '她问：[A+B]真的会出现吗？',
        '普通章节文本。',
        'CDDD 可以被正则命中。',
    ].join('\n'));
    const runtime = createBookToolRuntime({ bookId: book.id });

    const literal = await runtime.execute(EBOOK_TOOL_NAMES.GREP, {
        pattern: '[A+B]',
        path: 'book/notes/',
    });
    assert.equal(literal.ok, true);
    assert.equal(literal.count, 1);
    assert.equal(literal.results[0].lineNumber, 1);

    const defaultPlainPattern = await runtime.execute(EBOOK_TOOL_NAMES.GREP, {
        pattern: 'C.*D',
        path: 'book/notes/',
    });
    assert.equal(defaultPlainPattern.count, 0);

    const regex = await runtime.execute(EBOOK_TOOL_NAMES.GREP, {
        pattern: 'C.*D',
        path: 'book/notes/',
        useRegex: true,
    });
    assert.equal(regex.count, 1);
    assert.equal(regex.results[0].lineNumber, 3);
});

test('Book Grep works after loose JSON argument repair decodes unicode escapes', async () => {
    await resetDb();
    const book = await createBook('Grep Unicode 修复测试');
    await upsertBookFile(book.id, 'book/state.md', [
        '# 状态追踪',
        '第99章：当前进度已经写到这里。',
        '**下一步应写**：第二三场结构。',
    ].join('\n'));
    const runtime = createBookToolRuntime({ bookId: book.id });
    const repaired = repairLooseToolArguments(
        '{pattern:"\\u7b2c99\\u7ae0", path:"book/"}',
        EBOOK_TOOL_NAMES.GREP,
    );
    const args = JSON.parse(repaired);
    assert.equal(args.pattern, '第99章');

    const result = await runtime.execute(EBOOK_TOOL_NAMES.GREP, args);
    assert.equal(result.ok, true);
    assert.equal(result.count, 1);
    assert.equal(result.results[0].path, 'book/state.md');
    assert.equal(result.results[0].lineNumber, 2);

    const nextStepArgs = JSON.parse(repairLooseToolArguments(
        '{pattern:"\\u4e0b\\u4e00\\u6b65", path:"book/"}',
        EBOOK_TOOL_NAMES.GREP,
    ));
    const nextStepResult = await runtime.execute(EBOOK_TOOL_NAMES.GREP, nextStepArgs);
    assert.equal(nextStepResult.count, 1);
    assert.equal(nextStepResult.results[0].lineNumber, 3);
});

test('Book Grep keeps optional fields after loose JSON compatibility repair', async () => {
    await resetDb();
    const book = await createBook('Grep 兼容参数测试');
    await upsertBookFile(book.id, 'book/state.md', [
        '# 状态追踪',
        '第99章：当前进度已经写到这里。',
        '**下一步应写**：第二三场结构。',
    ].join('\n'));
    await upsertBookFile(book.id, 'book/chapters/099.md', '第99章 正文不应该被 include 命中。');
    const runtime = createBookToolRuntime({ bookId: book.id });

    const repaired = repairLooseToolArguments(
        '{pattern:"第99章", path:"book/", include:"state.md", outputMode:"content", limit:2, offset:0, contextLines:1, useRegex:false}',
        EBOOK_TOOL_NAMES.GREP,
    );
    const args = JSON.parse(repaired);
    assert.equal(args.pattern, '第99章');
    assert.equal(args.path, 'book/');
    assert.equal(args.include, 'state.md');
    assert.equal(args.outputMode, 'content');
    assert.equal(args.limit, 2);
    assert.equal(args.offset, 0);
    assert.equal(args.contextLines, 1);
    assert.equal(args.useRegex, false);

    const result = await runtime.execute(EBOOK_TOOL_NAMES.GREP, args);
    assert.equal(result.ok, true);
    assert.equal(result.count, 1);
    assert.equal(result.results[0].path, 'book/state.md');
    assert.match(result.results[0].context, /下一步应写/);
});

test('Book Grep accepts query and scope aliases from JSON compatibility protocol', async () => {
    await resetDb();
    const book = await createBook('Grep 别名兼容测试');
    await upsertBookFile(book.id, 'book/state.md', '下一步应写：继续第二三场结构。');
    const runtime = createBookToolRuntime({ bookId: book.id });
    const result = await runtime.execute(EBOOK_TOOL_NAMES.GREP, {
        query: '下一步',
        scope: 'book/',
    });
    assert.equal(result.ok, true);
    assert.equal(result.count, 1);
    assert.equal(result.pattern, '下一步');
    assert.equal(result.results[0].path, 'book/state.md');
});

test('Book Grep can search one exact file path after files_with_matches discovery', async () => {
    await resetDb();
    const book = await createBook('Grep 文件路径测试');
    await upsertBookFile(book.id, 'book/chapters/100.md', '小满在这一章只是被提到。');
    await upsertBookFile(book.id, 'book/chapters/101.md', [
        '# 第一百零一章',
        '小满把话说得很轻，像怕惊动岁月。',
        '她停了停，又把那句没说完的话咽回去。',
    ].join('\n'));
    const runtime = createBookToolRuntime({ bookId: book.id });

    const files = await runtime.execute(EBOOK_TOOL_NAMES.GREP, {
        pattern: '小满',
        path: 'book/chapters/',
        outputMode: 'files_with_matches',
    });
    assert.equal(files.ok, true);
    assert.equal(files.count, 2);

    const content = await runtime.execute(EBOOK_TOOL_NAMES.GREP, {
        pattern: '小满',
        path: 'book/chapters/101.md',
        outputMode: 'content',
        contextLines: 1,
    });
    assert.equal(content.ok, true);
    assert.equal(content.count, 1);
    assert.equal(content.searchedFileCount, 1);
    assert.equal(content.results[0].path, 'book/chapters/101.md');
    assert.match(content.results[0].context, /岁月/);
});

test('Book Grep normalizes common outputMode spellings and bare include filenames', async () => {
    await resetDb();
    const book = await createBook('Grep 输出模式测试');
    await upsertBookFile(book.id, 'book/chapters/101.md', '小满在这里出现。');
    await upsertBookFile(book.id, 'book/chapters/102.md', '小满在这里也出现。');
    const runtime = createBookToolRuntime({ bookId: book.id });

    const files = await runtime.execute(EBOOK_TOOL_NAMES.GREP, {
        pattern: '小满',
        path: 'book/chapters/',
        include: '101.md',
        outputMode: 'filesWithMatches',
    });
    assert.equal(files.ok, true);
    assert.equal(files.outputMode, 'files_with_matches');
    assert.equal(files.count, 1);
    assert.equal(files.results[0].path, 'book/chapters/101.md');
});

test('Tagged loose Grep tool calls preserve repaired optional fields', () => {
    const calls = extractTaggedToolCalls(
        '<tool_call>{name:"Grep", arguments:{pattern:"第99章", path:"book/", include:"state.md", limit:3, contextLines:1, useRegex:false}}</tool_call>',
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, 'Grep');
    const args = JSON.parse(calls[0].arguments);
    assert.equal(args.pattern, '第99章');
    assert.equal(args.path, 'book/');
    assert.equal(args.include, 'state.md');
    assert.equal(args.limit, 3);
    assert.equal(args.contextLines, 1);
    assert.equal(args.useRegex, false);
});

test('Loose JSON repair keeps deliberately escaped unicode literals', () => {
    const repaired = repairLooseToolArguments(
        String.raw`{filePath:"book/notes/escape.md", content:"literal \\u7b2c99\\u7ae0"}`,
        EBOOK_TOOL_NAMES.WRITE,
    );
    const args = JSON.parse(repaired);
    assert.equal(args.content, 'literal \\u7b2c99\\u7ae0');
});

test('Book runtime exposes Tavily web search only when configured', async () => {
    await resetDb();
    const book = await createBook('联网资料测试');
    const runtimeWithoutSearch = createBookToolRuntime({ bookId: book.id });
    assert.equal(
        runtimeWithoutSearch.getToolDefinitions().some((definition) => definition.function?.name === EBOOK_TOOL_NAMES.WEB_SEARCH),
        false,
    );

    const originalFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            body: options.body,
        });
        return {
            ok: true,
            status: 200,
            async json() {
                return {
                    results: [
                        {
                            title: 'Kyoto Machiya Guide',
                            url: 'https://example.com/machiya',
                            content: 'Traditional machiya usually have a narrow frontage and deep plan.',
                            score: 0.91,
                        },
                    ],
                };
            },
        };
    };

    try {
        const runtime = createBookToolRuntime({
            bookId: book.id,
            searchConfig: {
                tavilyApiKey: 'ebook-tavily-key',
                tavilyBaseUrl: 'https://api.tavily.com/',
            },
        });
        assert.equal(
            runtime.getToolDefinitions().some((definition) => definition.function?.name === EBOOK_TOOL_NAMES.WEB_SEARCH),
            true,
        );

        const result = await runtime.execute(EBOOK_TOOL_NAMES.WEB_SEARCH, {
            query: 'Kyoto machiya layout',
            maxResults: 3,
        });

        assert.equal(result.ok, true);
        assert.equal(result.query, 'Kyoto machiya layout');
        assert.equal(result.count, 1);
        assert.equal(requests.length, 1);
        assert.equal(requests[0].url, 'https://api.tavily.com/search');

        const requestBody = JSON.parse(requests[0].body);
        assert.equal(requestBody.api_key, 'ebook-tavily-key');
        assert.equal(requestBody.query, 'Kyoto machiya layout');
        assert.equal(requestBody.max_results, 3);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('Book context budget defaults stay aligned with assistant', () => {
    assert.equal(EBOOK_MAX_CONTEXT_TOKENS, 188000);
    assert.equal(EBOOK_SUMMARY_TRIGGER_TOKENS, 158000);
    assert.equal(EBOOK_DEFAULT_PRESERVED_TURNS, 2);
    assert.equal(EBOOK_MIN_PRESERVED_TURNS, 1);
});

test('Default outline template keeps drafting user-directed without chapter outlines', () => {
    const outline = DEFAULT_BOOK_FILES.find((file) => file.path === 'book/outline.md')?.content || '';
    const volume = DEFAULT_BOOK_FILES.find((file) => file.path === 'book/volumes/001.md')?.content || '';

    assert.match(outline, /第一轮：开书定位（读者承诺）/);
    assert.match(outline, /类型\/题材承诺/);
    assert.match(outline, /读者体验承诺/);
    assert.match(outline, /核心看点\/张力源/);
    assert.match(outline, /尺度与边界/);
    assert.match(outline, /文风、节奏、尺度、冲突密度、日常比例、性场景功能和审稿优先级/);
    assert.match(outline, /## 开书定位/);
    assert.match(outline, /## 故事脊柱/);
    assert.match(outline, /## 欲望链 \/ 目标层级/);
    assert(
        outline.indexOf('## 开书定位') < outline.indexOf('## 故事脊柱'),
        '开书定位 should appear before 故事脊柱',
    );
    assert.match(outline, /怎么写好这本书（执行方案确认）/);
    assert.match(outline, /必须先向用户说明“我准备怎样写好这本书”/);
    assert.match(outline, /这一步是卷结构和事件集团的前置条件/);
    assert.match(outline, /终极欲望牵引全书/);
    assert.match(outline, /长期欲望牵引卷/);
    assert.match(outline, /中期欲望牵引事件集团/);
    assert.match(outline, /短期欲望分布在章节和场景/);
    assert.match(outline, /大纲推进原则/);
    assert.match(outline, /大概有几卷/);
    assert.match(outline, /当前可写方向/);
    assert.match(outline, /不做章纲/);
    assert.match(outline, /book\/volumes\/001\.md/);
    assert.match(outline, /## 卷规划索引/);
    assert.doesNotMatch(outline, /## 当前卷推进草图/);
    assert.match(volume, /# 第一卷规划/);
    assert.match(volume, /卷内事件集团骨架/);
    assert.match(volume, /中期欲望/);
    assert.match(volume, /当前可写方向/);
    assert.match(volume, /当前欲望\/压力/);
    assert.match(volume, /当前用户指挥记录/);
    assert.match(volume, /停止点/);
    assert.match(volume, /禁止偏离/);
    assert.match(volume, /写后复盘/);
    assert.match(volume, /不要在动笔前把它变成章节任务表/);
    assert.doesNotMatch(volume, /本轮 3-5 章章纲|主角渴望 -> 主角障碍 -> 主角行动 -> 行动结果|正负倾向|积极约 3/);
    assert.doesNotMatch(volume, /第 1 章写到：主角第一次注意到女主那个下午/);
    const style = DEFAULT_BOOK_FILES.find((file) => file.path === 'book/style.md')?.content || '';
    assert.match(style, /## 怎么写好这本书/);
    assert.match(style, /执行方案确认/);
    assert.match(style, /动笔阶段不做章纲，具体章节由用户逐章指挥/);
    assert.match(style, /慢写不是把一场戏写长/);
    assert.match(style, /章节是连续流里的呼吸点/);
    assert.match(style, /章节不是任务/);
    assert.match(style, /一章里不需要“完成”任何事/);

    const reviewRules = DEFAULT_BOOK_FILES.find((file) => file.path === 'book/review-rules.md')?.content || '';
    assert.match(reviewRules, /## 章节审稿/);
    assert.match(reviewRules, /欲望链是否在引领结构/);
    assert.match(reviewRules, /是否服从用户给出的起点、场景、核心事件、禁止偏离和停止点/);
    assert.match(reviewRules, /用户没说的事件是否被擅自加入/);
    assert.match(reviewRules, /人物是否在具体时空中观察、误读、犹豫、反应、选择/);
    assert.doesNotMatch(reviewRules, /每 5 章内是否有 1-3 个实质进展|积极约 3、阻碍\/落空\/误解\/代价约 7/);

    const firstChapter = DEFAULT_BOOK_FILES.find((file) => file.path === 'book/chapters/001.md')?.content || '';
    assert.equal(firstChapter, '从这里开始写正文。\n');
    assert.doesNotMatch(firstChapter, /^#\s*第\s*1\s*章/m);
});

test('Book context prompt keeps stable files separate from volatile turn context', () => {
    const files = [
        {
            path: 'book/outline.md',
            content: '# 大纲\n\n这是一个关于失忆侦探的悬疑故事。',
        },
        {
            path: 'book/style.md',
            content: '# 文风规则\n\n这里记录“怎么写”，供写作助手续写和修订时参考。\n\n- 叙事视角：\n- 语气节奏：\n- 句子长度：\n- 禁忌与边界：\n- 想保留的例句：\n',
        },
        {
            path: 'book/characters.md',
            content: '# 角色设定\n\n- 林栖：调查记者。\n- 沈照：前刑警。',
        },
        {
            path: 'book/world.md',
            content: '# 世界设定\n\n故事发生在海边旧城。',
        },
        {
            path: 'book/review-rules.md',
            content: '# 审稿规则\n\n- 检查伏笔是否兑现。',
        },
        {
            path: 'book/state.md',
            content: '# 状态追踪\n\n## 当前进度\n\n**已写到**：第一章末尾，林栖第一次看到旧信。',
        },
        {
            path: 'book/chapters/001.md',
            content: '# 第 1 章\n\n雨下了一整夜。',
        },
        {
            path: 'book/sources/chat.md',
            content: '这是导入的聊天资料。',
        },
    ];
    const stablePrompt = buildBookContextPrompt({
        book: { id: 'book-test', title: '提示词书稿' },
        files,
    });
    const turnPrompt = buildBookTurnContextPrompt({
        book: { id: 'book-test', title: '提示词书稿' },
        files,
        selectedPath: 'book/chapters/001.md',
        historySummary: '第一章已经起草。',
    });

    assert.doesNotMatch(stablePrompt, /\[作品概况\]|正文章节|已导入资料|chat\.md/);
    assert.match(stablePrompt, /\[作品核心设定\]/);
    assert.match(stablePrompt, /## 大纲 \(book\/outline\.md\)/);
    assert.match(stablePrompt, /这是一个关于失忆侦探的悬疑故事/);
    assert.match(stablePrompt, /## 文风规则 \(book\/style\.md\)/);
    assert.match(stablePrompt, /这里记录“怎么写”/);
    assert.match(stablePrompt, /\[审稿规则\]/);
    assert.match(stablePrompt, /检查伏笔是否兑现/);
    assert.doesNotMatch(stablePrompt, /\[状态追踪\]|林栖第一次看到旧信|\[Current file\]|\[创作记录\]/);

    assert.match(turnPrompt, /\[本轮作品上下文\]/);
    assert.match(turnPrompt, /title: 提示词书稿/);
    assert.match(turnPrompt, /\[创作进度\]/);
    assert.match(turnPrompt, /已实际创作章节：1 章/);
    assert.match(turnPrompt, /\[状态追踪\]/);
    assert.match(turnPrompt, /林栖第一次看到旧信/);
    assert.doesNotMatch(turnPrompt, /\[Current file\]|book\/chapters\/001\.md/);
    assert.doesNotMatch(turnPrompt, /\[创作记录\]|第一章已经起草/);
    assert.doesNotMatch(turnPrompt, /\[作品概况\]|正文章节|已导入资料|chat\.md/);
    assert.doesNotMatch(stablePrompt, /\[Book readiness\]|\[Core file digests\]/);

    const defaultTurnPrompt = buildBookTurnContextPrompt({
        book: { id: 'book-default', title: '默认书稿' },
        files: DEFAULT_BOOK_FILES,
    });
    assert.match(defaultTurnPrompt, /\[创作进度\]/);
    assert.match(defaultTurnPrompt, /已实际创作章节：0 章/);
});

test('Delegate book context injects review rules and core story files', () => {
    const prompt = buildDelegateBookContextPrompt({
        book: { id: 'book-test', title: '审稿测试书' },
        files: [
            {
                path: 'book/outline.md',
                content: '# 大纲\n\n主线是调查海边旧城的失踪案。',
            },
            {
                path: 'book/review-rules.md',
                content: '# 审稿规则\n\n- 特别检查伏笔是否兑现。\n',
            },
            {
                path: 'book/state.md',
                content: '# 状态追踪\n\n## 伏笔与回收\n\n- 旧信已经露面，但还没人知道寄信人。',
            },
            {
                path: 'book/chapters/001.md',
                content: '# 第 1 章\n\n雨下了一整夜。',
            },
        ],
    });

    assert.match(prompt, /\[Reviewer Delegate Auto Context\]/);
    assert.match(prompt, /title: 审稿测试书/);
    assert.match(prompt, /\[作品核心设定\]/);
    assert.match(prompt, /主线是调查海边旧城的失踪案/);
    assert.match(prompt, /\[状态追踪\]/);
    assert.match(prompt, /旧信已经露面/);
    assert.match(prompt, /\[审稿规则\]/);
    assert.match(prompt, /特别检查伏笔是否兑现/);
    assert.doesNotMatch(prompt, /\[创作记录\]|第一章已经起草/);
});

test('Delegate book context keeps full injected review rules and core files', () => {
    const outlineTail = 'OUTLINE_FULL_CONTEXT_TAIL';
    const stateTail = 'STORY_STATE_FULL_CONTEXT_TAIL';
    const rulesTail = 'REVIEW_RULES_FULL_CONTEXT_TAIL';
    const prompt = buildDelegateBookContextPrompt({
        book: { id: 'book-long-context', title: '长上下文测试书' },
        files: [
            {
                path: 'book/outline.md',
                content: `# 大纲\n\n${'大纲内容'.repeat(1200)}\n${outlineTail}`,
            },
            {
                path: 'book/review-rules.md',
                content: `# 审稿规则\n\n${'审稿规则'.repeat(1200)}\n${rulesTail}`,
            },
            {
                path: 'book/state.md',
                content: `# 状态追踪\n\n${'状态追踪'.repeat(1200)}\n${stateTail}`,
            },
        ],
    });

    assert.match(prompt, new RegExp(outlineTail));
    assert.match(prompt, new RegExp(stateTail));
    assert.match(prompt, new RegExp(rulesTail));
    assert.doesNotMatch(prompt, /内容较长，这里只放前/);
});

test('Delegate prompt gives the reviewer a stable book-specific tool model', () => {
    assert.match(EBOOK_DELEGATE_PROMPT, /小白电纸书/);
    assert.match(EBOOK_DELEGATE_PROMPT, /SillyTavern/);
    assert.match(EBOOK_DELEGATE_PROMPT, /# Reviewer Delegate/);
    assert.match(EBOOK_DELEGATE_PROMPT, /## Role And Boundary/);
    assert.match(EBOOK_DELEGATE_PROMPT, /independent reviewer/);
    assert.match(EBOOK_DELEGATE_PROMPT, /not someone looking for excuses to pass a chapter/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Protect this book's vitality/);
    assert.match(EBOOK_DELEGATE_PROMPT, /currently opened book is your only work scope/);
    assert.match(EBOOK_DELEGATE_PROMPT, /book\/chapters\//);
    assert.match(EBOOK_DELEGATE_PROMPT, /\[ebook-image:slotId\]/);
    assert.match(EBOOK_DELEGATE_PROMPT, /## Information Sources/);
    assert.match(EBOOK_DELEGATE_PROMPT, /### Automatically Injected Context/);
    assert.match(EBOOK_DELEGATE_PROMPT, /\[Reviewer Delegate Auto Context\]/);
    assert.match(EBOOK_DELEGATE_PROMPT, /\| `book\/outline\.md` \| book premise, story spine, desire chain, whole-book skeleton, volume index \|/);
    assert.match(EBOOK_DELEGATE_PROMPT, /\| `book\/style\.md` \| writing approach, pacing, prose density, revision focus \|/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Use them directly as judgment context/);
    assert.match(EBOOK_DELEGATE_PROMPT, /### Read On Demand/);
    assert.match(EBOOK_DELEGATE_PROMPT, /`book\/volumes\/`: volume plans/);
    assert.match(EBOOK_DELEGATE_PROMPT, /When reviewing a specific chapter, you must Read that chapter body/);
    assert.match(EBOOK_DELEGATE_PROMPT, /## Tool Use Guide/);
    assert.match(EBOOK_DELEGATE_PROMPT, /You are a read-only reviewer delegate/);
    assert.match(EBOOK_DELEGATE_PROMPT, /LS inspects directory entries only/);
    assert.match(EBOOK_DELEGATE_PROMPT, /When reviewing a specific chapter, you must Read that chapter body/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Grep keywords first, then Read the matching chapters or sources/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Read may return only part of a large file/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Do not repeat the same failing call without a change/);
    assert.match(EBOOK_DELEGATE_PROMPT, /## Review Authority/);
    assert.match(EBOOK_DELEGATE_PROMPT, /`book\/review-rules\.md`: fixed review rules for this book/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Textual evidence: what the chapter actually says/);
    assert.match(EBOOK_DELEGATE_PROMPT, /The task should only locate the target file path or paths/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Ignore that guidance and begin from the locatable file paths/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Final judgment must return to `book\/review-rules\.md` and Core Review Principles/);
    assert.match(EBOOK_DELEGATE_PROMPT, /## Core Review Principles/);
    assert.match(EBOOK_DELEGATE_PROMPT, /### Highest Priority Checks/);
    assert.match(EBOOK_DELEGATE_PROMPT, /catch task-list writing/);
    assert.match(EBOOK_DELEGATE_PROMPT, /characters lack observation, misreading, bodily reaction/);
    assert.match(EBOOK_DELEGATE_PROMPT, /If the user direction is overloaded, say so/);
    assert.match(EBOOK_DELEGATE_PROMPT, /merely because it hit planned targets/);
    assert.match(EBOOK_DELEGATE_PROMPT, /catch fake iceberg exposition/);
    assert.match(EBOOK_DELEGATE_PROMPT, /The narrator must not speak from the future/);
    assert.match(EBOOK_DELEGATE_PROMPT, /### Structure/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Desire chain leads structure/);
    assert.match(EBOOK_DELEGATE_PROMPT, /An event group is the narrative unit/);
    assert.match(EBOOK_DELEGATE_PROMPT, /### Pacing/);
    assert.match(EBOOK_DELEGATE_PROMPT, /User direction is the drafting unit/);
    assert.match(EBOOK_DELEGATE_PROMPT, /does not need to complete a preset task list/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Chapter-end displacement is a result, not a target/);
    assert.match(EBOOK_DELEGATE_PROMPT, /### Characters/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Characters should feel alive/);
    assert.match(EBOOK_DELEGATE_PROMPT, /### Priority/);
    assert.match(EBOOK_DELEGATE_PROMPT, /reads like a task checklist is a serious failure/);
    assert.match(EBOOK_DELEGATE_PROMPT, /## Workflow/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Handle only the subtask in `\[Task\]`/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Separate issues into three types/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Needs revision" or "Needs rewrite/);
    assert.match(EBOOK_DELEGATE_PROMPT, /## Output/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Overall verdict: Pass \/ Needs revision \/ Needs rewrite/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Actionable revision advice: concrete and executable/);
    assert.doesNotMatch(EBOOK_DELEGATE_PROMPT, /# 审稿分身系统提示词|## 身份与边界|## 审稿标准层级/);
    assert.doesNotMatch(EBOOK_DELEGATE_PROMPT, /web_search|Tavily|联网查资料/);
    assert.doesNotMatch(EBOOK_DELEGATE_PROMPT, /重点检查结构、人物动机、关系连续性、节奏、设定一致性、时间线、伏笔、视角和文风/);
});

test('Book action prompts rely on injected core story files', () => {
    const startBookPrompt = buildActionPrompt('start-book');
    const spinePrompt = buildActionPrompt('spine');
    const stylePlanPrompt = buildActionPrompt('style-plan');
    const outlinePrompt = buildActionPrompt('outline');
    const volumePlanPrompt = buildActionPrompt('volume-plan');
    const nextChapterPrompt = buildActionPrompt('next-chapter');
    const openingOptionsPrompt = buildActionPrompt('opening-options');
    const organizePrompt = buildActionPrompt('organize');

    assert.match(startBookPrompt, /我想试试写一本书/);
    assert.match(startBookPrompt, /不要立刻写正文/);
    assert.match(startBookPrompt, /只问最核心的 3 到 5 个问题/);
    assert.match(startBookPrompt, /开书定位/);
    assert.match(startBookPrompt, /类型\/题材承诺/);
    assert.match(startBookPrompt, /尺度与边界/);
    assert.match(startBookPrompt, /文风、节奏、尺度、冲突密度、日常比例、性场景功能/);
    assert.match(startBookPrompt, /这一动作只处理开书定位/);
    assert.doesNotMatch(startBookPrompt, /故事脊柱和欲望链|我准备怎样写好这本书|卷结构/);
    assert.match(spinePrompt, /故事脊柱/);
    assert.match(spinePrompt, /欲望链/);
    assert.match(spinePrompt, /不要直接写完整大纲/);
    assert.match(spinePrompt, /定位不足时先补定位/);
    assert.match(spinePrompt, /只做故事脊柱和欲望链/);
    assert.doesNotMatch(spinePrompt, /等待用户修正或确认后再写入 `book\/style\.md`|把结果整理进 `book\/style\.md`|当前卷规划写入 `book\/volumes\/NNN\.md`/);
    assert.match(stylePlanPrompt, /我准备怎样写好这本书/);
    assert.match(stylePlanPrompt, /这一动作只处理执行方案/);
    assert.match(stylePlanPrompt, /阅读体验落地、叙事视角、场景推进/);
    assert.match(stylePlanPrompt, /把结果整理进 `book\/style\.md`/);
    assert.doesNotMatch(stylePlanPrompt, /全书大纲先定骨架|当前情节轮还没有本轮 3-5 章章纲|连续起草本轮 3-5 章/);
    assert.match(EBOOK_SYSTEM_PROMPT, /# 创作流程/);
    assert.match(EBOOK_SYSTEM_PROMPT, /不要把作者知道的后续剧情提前解释给读者/);
    assert.match(EBOOK_SYSTEM_PROMPT, /让潜台词从动作、停顿、视线和后果里长出来/);
    assert.match(EBOOK_SYSTEM_PROMPT, /## 阶段与顺序/);
    assert.match(EBOOK_SYSTEM_PROMPT, /动笔阶段没有章纲，完全由用户逐章指挥/);
    assert.match(EBOOK_SYSTEM_PROMPT, /### 规划阶段（线性，不可跳步）/);
    assert.match(EBOOK_SYSTEM_PROMPT, /\| 1\. 开书定位 \| 确定读者承诺、类型边界、核心卖点 \| `book\/outline\.md`/);
    assert.match(EBOOK_SYSTEM_PROMPT, /\| 3\. 写法方案 \| 确定节奏、场景密度、慢写位置、审稿重点 \| `book\/style\.md`/);
    assert.match(EBOOK_SYSTEM_PROMPT, /\| 5\. 当前卷规划 \| 当前卷的事件集团、情节走向 \| `book\/volumes\/NNN\.md`/);
    assert.match(EBOOK_SYSTEM_PROMPT, /### 动笔阶段（用户驱动，无章纲）/);
    assert.match(EBOOK_SYSTEM_PROMPT, /\| 6\. 用户指挥 \| 用户说这一章\/这一段写什么、从哪开始、到哪停、核心发生什么 \| - \|/);
    assert.match(EBOOK_SYSTEM_PROMPT, /\| 7\. 动笔 \| AI 按用户指挥写正文 \| `book\/chapters\/NNN\.md` \|/);
    assert.match(EBOOK_SYSTEM_PROMPT, /\| 9\. 复盘 \| 记录实际变化、伏笔、关系、进度 \| `book\/state\.md` \+ `book\/volumes\/NNN\.md`/);
    assert.match(EBOOK_SYSTEM_PROMPT, /## 铁律/);
    assert.match(EBOOK_SYSTEM_PROMPT, /没有开书定位 -> 不做故事脊柱/);
    assert.match(EBOOK_SYSTEM_PROMPT, /没有故事脊柱和欲望链 -> 不做写法方案/);
    assert.match(EBOOK_SYSTEM_PROMPT, /没有写法方案 -> 不拆卷/);
    assert.match(EBOOK_SYSTEM_PROMPT, /没有当前卷规划 -> 不动笔/);
    assert.match(EBOOK_SYSTEM_PROMPT, /### 动笔铁律/);
    assert.match(EBOOK_SYSTEM_PROMPT, /不做章纲/);
    assert.match(EBOOK_SYSTEM_PROMPT, /用户是导演，你是写手/);
    assert.match(EBOOK_SYSTEM_PROMPT, /用户没说的事件，不发生/);
    assert.match(EBOOK_SYSTEM_PROMPT, /可以建议，不可以擅动/);
    assert.match(EBOOK_SYSTEM_PROMPT, /用户指挥已经足够清楚时，直接动笔/);
    assert.match(EBOOK_SYSTEM_PROMPT, /写完一章就停/);
    assert.match(EBOOK_SYSTEM_PROMPT, /## 关于提问/);
    assert.match(EBOOK_SYSTEM_PROMPT, /问用户只问影响当前判断的问题/);
    assert.match(EBOOK_SYSTEM_PROMPT, /不是为了填满模板/);
    assert.match(EBOOK_SYSTEM_PROMPT, /## 关于复盘/);
    assert.match(EBOOK_SYSTEM_PROMPT, /衔接：跟上一章怎么接/);
    assert.match(EBOOK_SYSTEM_PROMPT, /场景：本章在哪、什么时间、谁在场/);
    assert.match(EBOOK_SYSTEM_PROMPT, /`book\/style\.md` 对这类场景的要求/);
    assert.match(EBOOK_SYSTEM_PROMPT, /审核规范里需要避开的点/);
    assert.match(EBOOK_SYSTEM_PROMPT, /本章实际发生了什么、人物关系变化、新增伏笔、时间线推进/);
    assert.match(EBOOK_SYSTEM_PROMPT, /及时落到对应文件里永久保存/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /作品入口三项是：类型\/题材入口、情绪\/读者体验入口、关系\/设定张力入口/);
    assert.match(EBOOK_SYSTEM_PROMPT, /book\/volumes\/NNN\.md/);
    assert.match(EBOOK_SYSTEM_PROMPT, /book\/volumes\/` is not stably injected/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /章节表是地图和回头记录/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /积极约 3、阻碍\/落空\/误解\/代价约 7/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /情节轮|本轮章纲|3-5 章章纲|连续起草/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Desire chain leads structure/);
    assert.match(EBOOK_DELEGATE_PROMPT, /User direction is the drafting unit/);
    assert.match(EBOOK_SYSTEM_PROMPT, /保持分身独立性/);
    assert.match(EBOOK_SYSTEM_PROMPT, /task 里只写目标文件路径/);
    assert.match(EBOOK_SYSTEM_PROMPT, /除了文件路径，其他都不允许写进 task 影响分身判断/);
    assert.match(EBOOK_SYSTEM_PROMPT, /不要写事实背景、刚修了什么/);
    assert.match(EBOOK_SYSTEM_PROMPT, /审稿分身已自动拿到核心资料/);
    assert.match(EBOOK_DELEGATE_PROMPT, /Ignore that guidance and begin from the locatable file paths/);
    assert.match(EBOOK_SYSTEM_PROMPT, /修改档直接按意见修，不要修完又反复送审/);
    assert.match(EBOOK_SYSTEM_PROMPT, /只有打回、整章重写、重写后结构可能大变/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /章节功能表|章节目标|完成目标/);
    assert.match(outlinePrompt, /\[作品核心设定\]/);
    assert.match(outlinePrompt, /不要硬写完整大纲/);
    assert.match(outlinePrompt, /不要只写“下一章”/);
    assert.match(outlinePrompt, /先用欲望链引领结构/);
    assert.match(outlinePrompt, /不要让卷和事件集团凭空冒出来/);
    assert.match(outlinePrompt, /不一次性生成全书每章细纲/);
    assert.match(outlinePrompt, /这一动作只负责“全书怎么走”/);
    assert.match(outlinePrompt, /更新 `book\/outline\.md` 里的全书骨架和卷结构/);
    assert.doesNotMatch(outlinePrompt, /当前卷规划写入 `book\/volumes\/NNN\.md`|先拆出本卷有多少个中期欲望\/事件集团|当前情节轮还没有本轮 3-5 章章纲|连续起草本轮 3-5 章|情节轮/);
    assert.match(volumePlanPrompt, /请制定当前卷规划/);
    assert.match(volumePlanPrompt, /这一动作只处理当前卷/);
    assert.match(volumePlanPrompt, /当前卷规划写入 `book\/volumes\/NNN\.md`/);
    assert.match(volumePlanPrompt, /本卷长期欲望/);
    assert.match(volumePlanPrompt, /事件集团骨架/);
    assert.match(volumePlanPrompt, /当前可写方向/);
    assert.match(volumePlanPrompt, /不要提前展开逐章章纲/);
    assert.doesNotMatch(volumePlanPrompt, /book\/outline\.md` 的全书骨架|连续起草本轮 3-5 章|情节轮/);
    assert.match(nextChapterPrompt, /\[作品核心设定\]/);
    assert.match(nextChapterPrompt, /不要直接硬写长正文/);
    assert.match(nextChapterPrompt, /先要求完成 `volume-plan`/);
    assert.match(nextChapterPrompt, /不要补章纲/);
    assert.match(nextChapterPrompt, /当前可写方向/);
    assert.match(nextChapterPrompt, /先从 `\[用户本轮请求\]` 里提炼本次明确指挥/);
    assert.match(nextChapterPrompt, /如果用户没有明确本章范围、核心内容或停止点/);
    assert.match(nextChapterPrompt, /只写用户这次明确要求的这一章或这一段/);
    assert.match(nextChapterPrompt, /不要因为系统里存在空章节或下一编号就自动开写/);
    assert.match(nextChapterPrompt, /不是授权你抢跑后续剧情/);
    assert.match(nextChapterPrompt, /不要把章节当任务清单，也不要把大纲当工单执行/);
    assert.match(nextChapterPrompt, /只读取目标章节或相邻章节/);
    assert.match(nextChapterPrompt, /写完这次用户明确要求的部分就停/);
    assert.doesNotMatch(nextChapterPrompt, /本轮 3-5 章章纲|情节轮/);
    assert.match(openingOptionsPrompt, /不要直接写入文件/);
    assert.match(openingOptionsPrompt, /给 2 到 3 个不同开场方案/);
    assert.match(organizePrompt, /材料太少/);
    assert.doesNotMatch(outlinePrompt, /\[Book readiness\]|\[Core file digests\]|不要机械/);
});

test('Delegate book tool profile is read-only and excludes orchestration tools', async () => {
    const definitions = getEbookToolDefinitions({ readOnly: true });
    const names = definitions.map((definition) => definition.function.name);

    assert.equal(names.includes(EBOOK_TOOL_NAMES.READ), true);
    assert.equal(names.includes(EBOOK_TOOL_NAMES.GREP), true);
    assert.equal(names.includes(EBOOK_TOOL_NAMES.WRITE), false);
    assert.equal(names.includes(EBOOK_TOOL_NAMES.EDIT), false);
    assert.equal(names.includes('apply_patch'), false);
    assert.equal(names.includes(EBOOK_TOOL_NAMES.PLAN_CREATE), false);
    assert.equal(names.includes(EBOOK_TOOL_NAMES.DELEGATE_RUN), false);
});

test('Book tool definitions expose filePath consistently for Read, Write, and Edit', () => {
    const definitions = getEbookToolDefinitions();
    const readDefinition = definitions.find((definition) => definition.function.name === EBOOK_TOOL_NAMES.READ);
    const writeDefinition = definitions.find((definition) => definition.function.name === EBOOK_TOOL_NAMES.WRITE);
    const editDefinition = definitions.find((definition) => definition.function.name === EBOOK_TOOL_NAMES.EDIT);

    assert.equal(Object.hasOwn(readDefinition.function.parameters.properties, 'filePath'), true);
    assert.equal(Object.hasOwn(readDefinition.function.parameters.properties, 'path'), false);
    assert.equal(Object.hasOwn(writeDefinition.function.parameters.properties, 'filePath'), true);
    assert.equal(Object.hasOwn(writeDefinition.function.parameters.properties, 'path'), false);
    assert.deepEqual(writeDefinition.function.parameters.required, ['filePath', 'content']);
    assert.equal(Object.hasOwn(editDefinition.function.parameters.properties, 'filePath'), true);
    assert.equal(Object.hasOwn(editDefinition.function.parameters.properties, 'path'), false);
    assert.deepEqual(editDefinition.function.parameters.required, ['filePath', 'edits']);
});

test('Book agent cancel is immediate before provider request starts', async () => {
    let releaseRefresh;
    const refreshGate = new Promise((resolve) => {
        releaseRefresh = resolve;
    });
    const state = {
        book: { id: 'book-cancel-preflight', title: '取消窗口测试' },
        files: [],
        selectedPath: 'book/chapters/001.md',
        editorContent: '',
        messages: [],
        toolTrace: [],
        openToolTurnKeys: [],
        activeTurnStartIndex: -1,
        openThoughtKeys: [],
        isBusy: false,
        isCancellingRun: false,
        activeController: null,
        status: '就绪',
    };
    let adapterCalled = false;
    let renderCount = 0;
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            await refreshGate;
        },
        render() {
            renderCount += 1;
        },
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            adapterCalled = true;
            return {
                async chat() {
                    return { text: '不应该请求模型。', toolCalls: [] };
                },
            };
        },
    });

    const runPromise = runner.runAgent('写一段。');
    await new Promise((resolve) => setTimeout(resolve, 0));
    const activeController = state.activeController;

    assert.ok(activeController);
    assert.equal(activeController.signal.aborted, false);
    assert.equal(runner.cancelActiveRun(), true);
    assert.equal(activeController.signal.aborted, true);
    assert.equal(state.isCancellingRun, true);
    assert.equal(state.status, '正在停止...');

    releaseRefresh();
    await runPromise;

    assert.equal(adapterCalled, false);
    assert.equal(state.isBusy, false);
    assert.equal(state.isCancellingRun, false);
    assert.equal(state.activeController, null);
    assert.match(state.messages.at(-1)?.content || '', /已取消本次操作/);
    assert.ok(renderCount >= 2);
});

test('Book agent automatically passes review context into DelegateRun', async () => {
    const state = {
        book: { id: 'book-delegate-context', title: '分身上下文测试' },
        files: [
            {
                path: 'book/outline.md',
                content: '# 大纲\n\n主线是找回失踪的旧信。',
            },
            {
                path: 'book/review-rules.md',
                content: '# 审稿规则\n\n- 检查人物动机是否前后一致。\n',
            },
            {
                path: 'book/state.md',
                content: '# 状态追踪\n\n## 人物关系变化\n\n- 林栖和沈照暂时建立合作，但仍互相试探。',
            },
        ],
        historySummary: '已经写完第一章草稿。',
    };
    let seenUserPrompt = '';
    const runner = createEbookAgentRunner({
        state,
        refreshBooksAndFiles() {},
        render() {},
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    seenUserPrompt = task.messages[1].content;
                    return {
                        text: '审稿完成。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    const result = await runner.runDelegate({
        task: '审第一章。',
        context: '章节路径：book/chapters/001.md。本次重点看节奏、人物动机和性场景功能。',
        deliverable: '列出问题和建议。',
    }, { controller: new AbortController(), bookId: state.book.id });

    assert.equal(result.ok, true);
    assert.match(seenUserPrompt, /\[Reviewer Delegate Auto Context\]/);
    assert.match(seenUserPrompt, /主线是找回失踪的旧信/);
    assert.match(seenUserPrompt, /\[状态追踪\]/);
    assert.match(seenUserPrompt, /暂时建立合作/);
    assert.match(seenUserPrompt, /\[审稿规则\]/);
    assert.match(seenUserPrompt, /人物动机是否前后一致/);
    assert.doesNotMatch(seenUserPrompt, /\[创作记录\]|已经写完第一章草稿/);
    assert.match(seenUserPrompt, /\[主助手本次补充\]/);
    assert.match(seenUserPrompt, /book\/chapters\/001\.md/);
    assert.match(seenUserPrompt, /本次重点看节奏、人物动机和性场景功能/);
    assert.match(seenUserPrompt, /\[Task\]\n审第一章。/);
    assert.match(seenUserPrompt, /\[Expected deliverable\]\n列出问题和建议。/);
    assert.doesNotMatch(seenUserPrompt, /\[审稿标准锁定\]/);
});

test('Book agent shows DelegateRun dispatch before result and keeps task in history', async () => {
    await resetDb();
    const book = await createBook('分身发起显示测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        openToolTurnKeys: [],
        activeTurnStartIndex: -1,
        openThoughtKeys: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let chatCount = 0;
    let pendingHtml = '';
    let releaseDelegate;
    const delegateGate = new Promise((resolve) => {
        releaseDelegate = resolve;
    });

    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {
            const pendingDelegate = state.toolTrace.find((item) => (
                item.name === EBOOK_TOOL_NAMES.DELEGATE_RUN
                && item.status === 'running'
            ));
            if (!pendingHtml && pendingDelegate) {
                pendingHtml = renderEbookShell({
                    state,
                    providerConfig: { provider: 'test', model: 'demo' },
                    dirty: false,
                });
                releaseDelegate();
            }
        },
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat() {
                    chatCount += 1;
                    if (chatCount === 1) {
                        return {
                            text: '第 1 章还是空壳，先让分身核对设定一致性。',
                            toolCalls: [{
                                id: 'delegate-review-1',
                                name: EBOOK_TOOL_NAMES.DELEGATE_RUN,
                                arguments: JSON.stringify({
                                    task: '审第一章节奏',
                                    context: '只看 book/chapters/001.md。',
                                    deliverable: '给通过/修改/打回结论。',
                                }),
                            }],
                        };
                    }
                    if (chatCount === 2) {
                        await delegateGate;
                        return {
                            text: '分身认为第一章节奏正常。',
                            toolCalls: [],
                        };
                    }
                    return {
                        text: '已收到分身意见。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    await runner.runAgent('请分身审第一章。');

    assert.match(pendingHtml, /审稿分身工作中，等待返回/);
    assert.match(pendingHtml, /第 1 章还是空壳，先让分身核对设定一致性/);
    assert.match(pendingHtml, /审第一章节奏/);
    assert.match(pendingHtml, /只看 book\/chapters\/001\.md/);
    assert.match(pendingHtml, /给通过\/修改\/打回结论/);
    assert.ok(
        pendingHtml.indexOf('给通过/修改/打回结论') < pendingHtml.indexOf('审稿分身工作中，等待返回'),
        'running delegate card should show dispatch payload before running status',
    );
    assert.ok(
        pendingHtml.indexOf('xb-agent-log') < pendingHtml.indexOf('审稿分身工作中，等待返回'),
        'running DelegateRun should render inside the chat log instead of above it',
    );
    assert.ok(
        pendingHtml.indexOf('第 1 章还是空壳，先让分身核对设定一致性') < pendingHtml.indexOf('审稿分身工作中，等待返回'),
        'assistant preface should stay visible before the running delegate block',
    );
    assert.equal(state.messages.find((message) => message.role === 'tool')?.toolDisplay?.payload?.length, 3);

    const finalHtml = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });
    assert.match(finalHtml, /已返回/);
    assert.match(finalHtml, /第 1 章还是空壳，先让分身核对设定一致性/);
    assert.match(finalHtml, /审第一章节奏/);
    assert.match(finalHtml, /分身认为第一章节奏正常/);
    assert.ok(
        finalHtml.indexOf('给通过/修改/打回结论') < finalHtml.indexOf('已返回'),
        'resolved delegate card should show dispatch payload before returned status',
    );
});

test('Book Glob supports recursive patterns from book root', async () => {
    await resetDb();
    const book = await createBook('匹配测试');
    const runtime = createBookToolRuntime({ bookId: book.id });

    const result = await runtime.execute(EBOOK_TOOL_NAMES.GLOB, {
        pattern: 'book/**/*.md',
    });

    assert.equal(result.ok, true);
    assert.equal(result.files.includes('book/outline.md'), true);
    assert.equal(result.files.includes('book/chapters/001.md'), true);
});

test('Book plans are isolated by book id', async () => {
    await resetDb();
    const first = await createBook('第一本');
    const second = await createBook('第二本');
    const firstRuntime = createBookToolRuntime({ bookId: first.id });
    const secondRuntime = createBookToolRuntime({ bookId: second.id });

    const created = await firstRuntime.execute(EBOOK_TOOL_NAMES.PLAN_CREATE, {
        title: '只属于第一本',
    });
    assert.equal(created.ok, true);

    const firstList = await firstRuntime.execute(EBOOK_TOOL_NAMES.PLAN_LIST, {});
    const secondList = await secondRuntime.execute(EBOOK_TOOL_NAMES.PLAN_LIST, {});

    assert.equal(firstList.count, 1);
    assert.equal(firstList.plans[0].title, '只属于第一本');
    assert.equal(secondList.count, 0);
});

test('Book Edit edits only book files', async () => {
    await resetDb();
    const book = await createBook('文本编辑测试');
    await upsertBookFile(book.id, 'book/chapters/001.md', '# 第 1 章\n\n旧内容一\n旧内容二\n');
    const runtime = createBookToolRuntime({ bookId: book.id });

    const result = await runtime.execute(EBOOK_TOOL_NAMES.EDIT, {
        filePath: 'book/chapters/001.md',
        edits: [
            { oldString: '旧内容一', newString: '新内容一' },
            { oldString: '旧内容二', newString: '新内容二' },
        ],
    });

    assert.equal(result.ok, true);
    assert.equal(result.appliedCount, 2);
    const read = await runtime.execute(EBOOK_TOOL_NAMES.READ, { filePath: 'book/chapters/001.md' });
    assert.match(read.content, /新内容一/);
    assert.match(read.content, /新内容二/);
});

test('Book Edit inserts into existing files by line number', async () => {
    await resetDb();
    const book = await createBook('文本插入测试');
    await upsertBookFile(book.id, 'book/chapters/001.md', '第一行\n第二行');
    const runtime = createBookToolRuntime({ bookId: book.id });

    const result = await runtime.execute(EBOOK_TOOL_NAMES.EDIT, {
        filePath: 'book/chapters/001.md',
        edits: [
            { insertAtLine: 1, newString: '开头' },
            { insertAtLine: 3, newString: '结尾' },
        ],
    });

    assert.equal(result.ok, true);
    assert.equal(result.appliedCount, 2);
    assert.equal((await getBookFile(book.id, 'book/chapters/001.md')).content, '开头\n第一行\n第二行\n结尾');
});

test('Book Edit never creates missing files', async () => {
    await resetDb();
    const book = await createBook('文本编辑新建测试');
    const runtime = createBookToolRuntime({ bookId: book.id });

    const missing = await runtime.execute(EBOOK_TOOL_NAMES.EDIT, {
        filePath: 'book/notes/missing.md',
        edits: [{ oldString: '旧内容', newString: '新内容' }],
    });
    assert.equal(missing.ok, false);
    assert.equal(missing.error, 'file_not_found');

    const implicitCreate = await runtime.execute(EBOOK_TOOL_NAMES.EDIT, {
        filePath: 'book/notes/implicit.md',
        edits: [{ newString: '# 不应创建\n' }],
    });
    assert.equal(implicitCreate.ok, false);
    assert.equal(implicitCreate.error, 'file_not_found');
    assert.equal(await getBookFile(book.id, 'book/notes/implicit.md'), null);

    const lineCreate = await runtime.execute(EBOOK_TOOL_NAMES.EDIT, {
        filePath: 'book/notes/line-create.md',
        edits: [{ startLine: 1, endLine: 1, newString: '# 不应创建\n' }],
    });
    assert.equal(lineCreate.ok, false);
    assert.equal(lineCreate.error, 'file_not_found');
    assert.equal(await getBookFile(book.id, 'book/notes/line-create.md'), null);

    const oldCreate = await runtime.execute(EBOOK_TOOL_NAMES.EDIT, {
        filePath: 'book/notes/new.md',
        edits: [{ oldString: '', newString: '# 新文件\n' }],
    });
    assert.equal(oldCreate.ok, false);
    assert.equal(oldCreate.error, 'file_not_found');
    assert.equal(await getBookFile(book.id, 'book/notes/new.md'), null);

    await upsertBookFile(book.id, 'book/notes/empty.md', '');
    const emptyOldString = await runtime.execute(EBOOK_TOOL_NAMES.EDIT, {
        filePath: 'book/notes/empty.md',
        edits: [{ oldString: '', newString: '# 仍不应写入\n' }],
    });
    assert.equal(emptyOldString.ok, false);
    assert.equal(emptyOldString.error, 'empty_old_string');
    assert.equal((await getBookFile(book.id, 'book/notes/empty.md')).content, '');
});

test('Book Edit persists partial successes and reports failed edits', async () => {
    await resetDb();
    const book = await createBook('文本编辑部分成功测试');
    await upsertBookFile(book.id, 'book/chapters/001.md', '甲乙丙');
    const runtime = createBookToolRuntime({ bookId: book.id });

    const result = await runtime.execute(EBOOK_TOOL_NAMES.EDIT, {
        filePath: 'book/chapters/001.md',
        edits: [
            { oldString: '甲', newString: '甲甲' },
            { oldString: '不存在', newString: '存在' },
        ],
    });

    assert.equal(result.ok, false);
    assert.equal(result.partial, true);
    assert.equal(result.appliedCount, 1);
    assert.equal(result.failedCount, 1);
    assert.equal(result.results[1].error, 'not_found');
    assert.equal((await getBookFile(book.id, 'book/chapters/001.md')).content, '甲甲乙丙');
});

test('Book Edit reports success when an oldString edit is covered by a previous replacement', async () => {
    await resetDb();
    const book = await createBook('文本编辑已满足测试');
    const oldFragment = '旧句A要替换并保留足够上下文。';
    const newFragment = '新的长句已经到位，并且带有足够具体的目标文本。';
    await upsertBookFile(book.id, 'book/chapters/001.md', `开头。\n${oldFragment}\n结尾。`);
    const runtime = createBookToolRuntime({ bookId: book.id });

    const overlapped = await runtime.execute(EBOOK_TOOL_NAMES.EDIT, {
        filePath: 'book/chapters/001.md',
        edits: [
            {
                oldString: `开头。\n${oldFragment}\n结尾。`,
                newString: `开头。\n${newFragment}\n结尾。`,
            },
            {
                oldString: oldFragment,
                newString: newFragment,
            },
        ],
    });

    assert.equal(overlapped.ok, true);
    assert.equal(overlapped.appliedCount, 1);
    assert.equal(overlapped.satisfiedCount, 1);
    assert.equal(overlapped.successCount, 2);
    assert.equal(overlapped.failedCount, 0);
    assert.equal(overlapped.changed, true);
    assert.match(overlapped.summary, /已是目标状态/);
    assert.equal((await getBookFile(book.id, 'book/chapters/001.md')).content, `开头。\n${newFragment}\n结尾。`);

    const idempotent = await runtime.execute(EBOOK_TOOL_NAMES.EDIT, {
        filePath: 'book/chapters/001.md',
        edits: [
            {
                oldString: oldFragment,
                newString: newFragment,
            },
        ],
    });

    assert.equal(idempotent.ok, false);
    assert.equal(idempotent.appliedCount, 0);
    assert.equal(idempotent.satisfiedCount, undefined);
    assert.equal(idempotent.successCount, 0);
    assert.equal(idempotent.failedCount, 1);
    assert.equal(idempotent.definiteFailedCount, 0);
    assert.equal(idempotent.uncertainCount, 1);
    assert.equal(idempotent.changed, false);
    assert.equal(idempotent.error, 'not_found');
    assert.match(idempotent.summary, /目标文本已存在/);
});

test('Book Edit keeps failed line edits failed even when target text exists elsewhere', async () => {
    await resetDb();
    const book = await createBook('文本编辑行号已满足测试');
    const target = '这一整段目标文本已经非常具体，足够判断它不是偶然重复。';
    await upsertBookFile(book.id, 'book/chapters/001.md', ['一', '旧段落', '三'].join('\n'));
    const runtime = createBookToolRuntime({ bookId: book.id });

    const result = await runtime.execute(EBOOK_TOOL_NAMES.EDIT, {
        filePath: 'book/chapters/001.md',
        edits: [
            { startLine: 2, endLine: 2, newString: target },
            { startLine: 9, endLine: 9, newString: target },
        ],
    });

    assert.equal(result.ok, false);
    assert.equal(result.partial, true);
    assert.equal(result.appliedCount, 1);
    assert.equal(result.satisfiedCount, undefined);
    assert.equal(result.successCount, 1);
    assert.equal(result.failedCount, 1);
    assert.equal(result.changed, true);
    assert.equal(result.error, 'line_range_out_of_bounds');
    assert.equal((await getBookFile(book.id, 'book/chapters/001.md')).content, ['一', target, '三'].join('\n'));
});

test('Book Edit reports refresh warnings without hiding persisted edits', async () => {
    await resetDb();
    const book = await createBook('文本编辑刷新失败测试');
    await upsertBookFile(book.id, 'book/chapters/001.md', '旧句子。');
    const runtime = createBookToolRuntime({
        bookId: book.id,
        onFilesChanged() {
            throw new Error('refresh exploded');
        },
    });

    const result = await runtime.execute(EBOOK_TOOL_NAMES.EDIT, {
        filePath: 'book/chapters/001.md',
        edits: [{ oldString: '旧句子', newString: '新句子' }],
    });

    assert.equal(result.ok, true);
    assert.equal(result.warning, 'files_refresh_failed');
    assert.match(result.refreshError, /refresh exploded/);
    assert.equal((await getBookFile(book.id, 'book/chapters/001.md')).content, '新句子。');
});

test('Book Delete removes a single file and returns a deleted count', async () => {
    await resetDb();
    const book = await createBook('删除单文件测试');
    await upsertBookFile(book.id, 'book/notes/temp.md', '待删内容');
    const runtime = createBookToolRuntime({ bookId: book.id });

    const result = await runtime.execute(EBOOK_TOOL_NAMES.DELETE, { path: 'book/notes/temp.md' });

    assert.equal(result.ok, true);
    assert.equal(result.path, 'book/notes/temp.md');
    assert.equal(result.deletedCount, 1);
    assert.equal(await getBookFile(book.id, 'book/notes/temp.md'), null);
    assert.notEqual(await getBookFile(book.id, 'book/outline.md'), null);
});

test('Book Delete removes a directory tree and returns a deleted count', async () => {
    await resetDb();
    const book = await createBook('删除目录测试');
    await upsertBookFile(book.id, 'book/reviews/001.md', '第一条意见');
    await upsertBookFile(book.id, 'book/reviews/archive/002.md', '第二条意见');
    const runtime = createBookToolRuntime({ bookId: book.id });

    const result = await runtime.execute(EBOOK_TOOL_NAMES.DELETE, { path: 'book/reviews/' });

    assert.equal(result.ok, true);
    assert.equal(result.path, 'book/reviews/');
    assert.equal(result.deletedCount, 2);
    assert.equal(await getBookFile(book.id, 'book/reviews/001.md'), null);
    assert.equal(await getBookFile(book.id, 'book/reviews/archive/002.md'), null);
    assert.notEqual(await getBookFile(book.id, 'book/outline.md'), null);
});

test('Book Read rejects path while Write uses filePath and still tolerates hidden path calls', async () => {
    await resetDb();
    const book = await createBook('工具字段测试');
    const runtime = createBookToolRuntime({ bookId: book.id });

    await assert.rejects(
        () => runtime.execute(EBOOK_TOOL_NAMES.READ, { path: 'book/outline.md' }),
        /book_path_required/,
    );
    const written = await runtime.execute(EBOOK_TOOL_NAMES.WRITE, { filePath: 'book/notes/temp.md', content: 'x' });
    assert.equal(written.ok, true);
    assert.equal(written.path, 'book/notes/temp.md');
    assert.equal((await getBookFile(book.id, 'book/notes/temp.md')).content, 'x');

    const hiddenAlias = await runtime.execute(EBOOK_TOOL_NAMES.WRITE, { path: 'book/notes/path-alias.md', content: 'y' });
    assert.equal(hiddenAlias.ok, true);
    assert.equal(hiddenAlias.path, 'book/notes/path-alias.md');
    assert.equal((await getBookFile(book.id, 'book/notes/path-alias.md')).content, 'y');
});

test('Book Move rejects moving the book root or a directory into itself', async () => {
    await resetDb();
    const book = await createBook('移动边界测试');
    const runtime = createBookToolRuntime({ bookId: book.id });

    await assert.rejects(
        () => runtime.execute(EBOOK_TOOL_NAMES.MOVE, {
            fromPath: 'book/',
            toPath: 'book/archive/',
        }),
        /book_root_move_forbidden/,
    );

    await assert.rejects(
        () => runtime.execute(EBOOK_TOOL_NAMES.MOVE, {
            fromPath: 'book/chapters/',
            toPath: 'book/chapters/archive/',
        }),
        /book_move_into_self_forbidden/,
    );
});

test('Book tool failures can be returned to the model as structured results', () => {
    const result = buildEbookToolFailureResult(EBOOK_TOOL_NAMES.READ, {
        filePath: 'book/missing.md',
    }, new Error('book_file_not_found'));

    assert.equal(result.ok, false);
    assert.equal(result.toolName, EBOOK_TOOL_NAMES.READ);
    assert.equal(result.path, 'book/missing.md');
    assert.equal(result.error, 'book_file_not_found');
    assert.match(result.message, /book_file_not_found/);
});

test('New chapter action does not overwrite dirty editor state or existing chapters', async () => {
    await resetDb();
    const book = await createBook('新章节保护测试');
    await upsertBookFile(book.id, 'book/chapters/002.md', '# 已有第二章\n');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '未保存内容',
        savedContent: '已保存内容',
        isBusy: false,
        toast: '',
    };
    const previousConfirm = globalThis.confirm;
    const previousPrompt = globalThis.prompt;
    const toasts = [];
    try {
        globalThis.confirm = () => false;
        globalThis.prompt = () => 'book/chapters/003.md';
        const controller = createBookController({
            state,
            render() {},
            requestHost() {},
            showToast(message) {
                toasts.push(message);
            },
        });
        await controller.createNewFile();
        assert.equal(await getBookFile(book.id, 'book/chapters/003.md'), null);

        state.savedContent = state.editorContent;
        globalThis.confirm = () => true;
        globalThis.prompt = () => 'book/chapters/002.md';
        await controller.createNewFile();
        const existing = await getBookFile(book.id, 'book/chapters/002.md');
        assert.match(existing.content, /已有第二章/);
        assert.match(toasts.at(-1), /chapter_already_exists/);
    } finally {
        globalThis.confirm = previousConfirm;
        globalThis.prompt = previousPrompt;
    }
});

test('Import material does not discard dirty editor content without confirmation', async () => {
    await resetDb();
    const book = await createBook('导入保护测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '还没保存的章节内容',
        savedContent: '已保存的章节内容',
        isBusy: false,
        status: '就绪',
        toast: '',
    };
    const previousConfirm = globalThis.confirm;
    let requested = false;
    try {
        globalThis.confirm = () => false;
        const controller = createBookController({
            state,
            render() {},
            requestHost() {
                requested = true;
                throw new Error('should_not_import');
            },
            showToast() {},
        });

        await controller.importMaterial('chat');

        assert.equal(requested, false);
        assert.equal(state.editorContent, '还没保存的章节内容');
        assert.equal(state.selectedPath, 'book/chapters/001.md');
    } finally {
        globalThis.confirm = previousConfirm;
    }
});

test('Book controller can rename the current book', async () => {
    await resetDb();
    const book = await createBook('旧书名');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        toast: '',
    };
    const previousPrompt = globalThis.prompt;
    const toasts = [];
    try {
        globalThis.prompt = () => '新书名';
        const controller = createBookController({
            state,
            render() {},
            requestHost() {},
            showToast(message) {
                toasts.push(message);
            },
        });

        await controller.renameCurrentBook();

        assert.equal(state.book.title, '新书名');
        assert.equal((await getBook(book.id)).title, '新书名');
        assert.equal(state.books.some((item) => item.title === '新书名'), true);
        assert.equal(toasts.at(-1), '书名已更新');
    } finally {
        globalThis.prompt = previousPrompt;
    }
});

test('Deleting a non-current book keeps the active book and conversation state intact', async () => {
    await resetDb();
    const first = await createBook('第一本');
    const second = await createBook('第二本');
    const state = {
        book: second,
        books: await listBooks(),
        files: await listBookFiles(second.id),
        selectedPath: 'book/outline.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'library',
        editorContent: '',
        savedContent: '',
        messages: [{ role: 'assistant', content: '第二本的当前对话' }],
        historySummary: '第二本的创作记录',
        isBusy: false,
        toast: '',
        isDeleteBookOpen: true,
    };
    const previousConfirm = globalThis.confirm;
    const restored = [];
    let cleared = 0;
    try {
        globalThis.confirm = () => true;
        const controller = createBookController({
            state,
            render() {},
            requestHost() {},
            showToast() {},
            conversationStore: {
                clearConversation() {
                    cleared += 1;
                },
                async restoreConversation(bookId) {
                    restored.push(bookId);
                },
            },
        });

        await controller.removeBook(first.id);

        assert.equal(await getBook(first.id), null);
        assert.equal(state.book?.id, second.id);
        assert.equal(await getSelectedBookId(), second.id);
        assert.equal(state.messages[0].content, '第二本的当前对话');
        assert.equal(state.historySummary, '第二本的创作记录');
        assert.equal(state.isDeleteBookOpen, false);
        assert.equal(cleared, 0);
        assert.deepEqual(restored, []);
    } finally {
        globalThis.confirm = previousConfirm;
    }
});

test('Deleting the current book selects another remaining book without recreating a default one', async () => {
    await resetDb();
    const first = await createBook('第一本');
    const second = await createBook('第二本');
    await setSelectedBookId(first.id);
    const state = {
        book: first,
        books: await listBooks(),
        files: await listBookFiles(first.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'library',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        toast: '',
        isDeleteBookOpen: true,
    };
    const previousConfirm = globalThis.confirm;
    const restored = [];
    const toasts = [];
    let cleared = 0;
    try {
        globalThis.confirm = () => true;
        const controller = createBookController({
            state,
            render() {},
            requestHost() {},
            showToast(message) {
                toasts.push(message);
            },
            conversationStore: {
                clearConversation() {
                    cleared += 1;
                },
                async restoreConversation(bookId) {
                    restored.push(bookId);
                },
            },
        });

        await controller.removeBook(first.id);

        assert.equal(await getBook(first.id), null);
        assert.equal(state.book?.id, second.id);
        assert.equal(await getSelectedBookId(), second.id);
        assert.equal(state.viewMode, 'library');
        assert.equal(state.isDeleteBookOpen, false);
        assert.equal(cleared, 0);
        assert.deepEqual(restored, [second.id]);
        assert.equal(toasts.at(-1), '书籍已删除');
    } finally {
        globalThis.confirm = previousConfirm;
    }
});

test('Deleting the last book leaves the shelf empty instead of recreating a default book', async () => {
    await resetDb();
    const book = await createBook('最后一本');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'library',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        toast: '',
        isDeleteBookOpen: true,
    };
    const previousConfirm = globalThis.confirm;
    const restored = [];
    try {
        globalThis.confirm = () => true;
        const controller = createBookController({
            state,
            render() {},
            requestHost() {},
            showToast() {},
            conversationStore: {
                async restoreConversation(bookId) {
                    restored.push(bookId);
                },
            },
        });

        await controller.removeBook(book.id);

        assert.deepEqual(await listBooks(), []);
        assert.equal(await getSelectedBookId(), '');
        assert.equal(state.book, null);
        assert.deepEqual(state.books, []);
        assert.deepEqual(state.files, []);
        assert.equal(state.selectedPath, '');
        assert.equal(state.readerPath, '');
        assert.equal(state.viewMode, 'library');
        assert.equal(state.isDeleteBookOpen, false);
        assert.deepEqual(restored, ['']);

        await controller.refreshBooksAndFiles();

        assert.deepEqual(await listBooks(), []);
        assert.equal(state.book, null);
    } finally {
        globalThis.confirm = previousConfirm;
    }
});

test('Initializing on an empty database keeps the shelf empty', async () => {
    await resetDb();
    const state = {
        book: null,
        books: [],
        files: [{ path: 'book/outline.md', content: '旧内容' }],
        selectedPath: 'book/outline.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'library',
        editorContent: '旧内容',
        savedContent: '旧内容',
        isBusy: false,
        toast: '',
        isDeleteBookOpen: true,
    };
    const restored = [];
    const controller = createBookController({
        state,
        render() {},
        requestHost() {},
        showToast() {},
        conversationStore: {
            async restoreConversation(bookId) {
                restored.push(bookId);
            },
        },
    });

    await controller.initializeBook();

    assert.deepEqual(await listBooks(), []);
    assert.equal(state.book, null);
    assert.deepEqual(state.books, []);
    assert.deepEqual(state.files, []);
    assert.equal(state.selectedPath, '');
    assert.equal(state.readerPath, '');
    assert.equal(state.editorContent, '');
    assert.equal(state.savedContent, '');
    assert.equal(state.isDeleteBookOpen, false);
    assert.deepEqual(restored, [undefined]);

    const html = renderEbookShell({ state });
    assert.match(html, /xb-library-grid is-empty/);
    assert.match(html, /xb-library-empty/);
    assert.match(html, /Agent 沉浸式创作与阅读平台/);
    assert.match(html, /class="xb-shelf-actions"/);
    assert.match(html, /id="xb-library-new-book"/);
    assert.match(html, /id="xb-library-transfer-book"/);
    assert.match(html, /id="xb-library-delete-book"[^>]*disabled/);
    const headerHtml = html.slice(html.indexOf('<header'), html.indexOf('<main'));
    assert.doesNotMatch(headerHtml, /xb-library-new-book|xb-library-delete-book|xb-delete-book-close/);
});

test('Library shelf actions stay inside the shelf after the rendered books', () => {
    const state = {
        book: { id: 'book-1', title: '测试书', updatedAt: 1716039600000 },
        books: [
            { id: 'book-1', title: '测试书', updatedAt: 1716039600000 },
        ],
        files: [],
        selectedPath: '',
        readerPath: '',
        viewMode: 'library',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        toast: '',
        isDeleteBookOpen: false,
        colorTheme: 'dark',
    };

    const html = renderEbookShell({ state });
    const bookIndex = html.indexOf('data-book-id="book-1"');
    const shelfActionIndex = html.indexOf('class="xb-shelf-actions"');
    const headerHtml = html.slice(html.indexOf('<header'), html.indexOf('<main'));
    assert.ok(bookIndex >= 0);
    assert.ok(shelfActionIndex > bookIndex);
    assert.match(headerHtml, /class="xb-archive-subtitle">Agent 沉浸式创作与阅读平台/);
    assert.match(html, /id="xb-library-new-book"/);
    assert.match(html, /id="xb-library-delete-book"/);
    assert.match(headerHtml, /id="xb-library-transfer-book"/);
    assert.doesNotMatch(headerHtml, /id="xb-library-import-book"|id="xb-library-export-book"/);
    assert.match(html, /xb-shelf-action-ring/);
    assert.match(headerHtml, /id="xb-close"[^>]*aria-label="退出电纸书"/);
    assert.match(headerHtml, /class="xb-exit-icon"/);
    assert.match(html, /已创作 0 章/);
    assert.match(html, />0章<\/em>/);
    assert.doesNotMatch(html, /打开后选择创作或阅读/);
    assert.doesNotMatch(headerHtml, /xb-library-new-book|xb-library-delete-book|xb-delete-book-close/);
});

test('Library transfer menu groups download and upload actions behind one header button', () => {
    const state = {
        book: null,
        books: [
            { id: 'book-transfer-a', title: '可传输书', updatedAt: 1716039600000 },
        ],
        files: [],
        selectedPath: '',
        readerPath: '',
        viewMode: 'library',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        toast: '',
        isDeleteBookOpen: false,
        isBookTransferMenuOpen: true,
        colorTheme: 'dark',
    };

    const html = renderEbookShell({ state });
    const headerHtml = html.slice(html.indexOf('<header'), html.indexOf('<main'));
    assert.match(headerHtml, /id="xb-library-transfer-book"/);
    assert.match(headerHtml, /class="xb-theme-icon xb-transfer-tray-icon"/);
    assert.doesNotMatch(headerHtml, /📥/);
    assert.match(html, /id="xb-book-transfer-menu-overlay"/);
    assert.match(html, /id="xb-book-transfer-menu-title">书籍传输/);
    assert.match(html, /id="xb-book-transfer-download"[\s\S]*下载书籍/);
    assert.match(html, /id="xb-book-transfer-upload"[\s\S]*上传书籍/);
});

test('Library export dialog lists books without selecting one from the shelf', () => {
    const state = {
        book: null,
        books: [
            { id: 'book-export-a', title: '可导出书', updatedAt: 1716039600000 },
        ],
        files: [],
        selectedPath: '',
        readerPath: '',
        viewMode: 'library',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        toast: '',
        isDeleteBookOpen: false,
        isBookExportOpen: true,
        colorTheme: 'dark',
    };

    const html = renderEbookShell({ state });
    assert.match(html, /id="xb-book-export-overlay"/);
    assert.match(html, /id="xb-book-export-title">导出作品包/);
    assert.match(html, /data-export-book-id="book-export-a"/);
    assert.match(html, /选择一本书，导出书稿文件和已引用的阅读器配图。/);
});

test('Library shows an animated transfer overlay while importing or exporting packages', () => {
    const state = {
        book: null,
        books: [
            { id: 'book-transfer-a', title: '处理中书稿', updatedAt: 1716039600000 },
        ],
        files: [],
        selectedPath: '',
        readerPath: '',
        viewMode: 'library',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        toast: '',
        isDeleteBookOpen: false,
        isBookExportOpen: true,
        bookTransferProgress: {
            mode: 'export',
            title: '处理中书稿',
            detail: '正在打包 3 个阅读器配图...',
        },
        colorTheme: 'dark',
    };

    const html = renderEbookShell({ state });
    assert.match(html, /class="xb-ebook-transfer-overlay"/);
    assert.match(html, /导出作品包/);
    assert.match(html, /正在打包 3 个阅读器配图/);
    assert.match(html, /id="xb-library-transfer-book"[^>]*disabled/);
    assert.match(html, /data-export-book-id="book-transfer-a"[^>]*disabled/);
});

test('Ebook controller export packages selected shelf book and referenced images', async () => {
    await resetDb();
    const book = await createBook('导出书');
    await upsertBookFile(book.id, 'book/chapters/001.md', '正文\n[ebook-image:slot-export]');
    const state = {
        book,
        books: await listBooks(),
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'library',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        isBookExportOpen: true,
        status: '就绪',
    };
    const hostRequests = [];
    let downloaded = false;
    const previousConfirm = globalThis.confirm;
    const previousDocument = globalThis.document;
    const previousUrlCreate = globalThis.URL?.createObjectURL;
    const previousUrlRevoke = globalThis.URL?.revokeObjectURL;
    globalThis.confirm = () => true;
    globalThis.document = {
        body: {
            appendChild() {},
        },
        createElement(tagName) {
            assert.equal(tagName, 'a');
            return {
                style: {},
                click() {
                    downloaded = true;
                },
                remove() {},
            };
        },
    };
    globalThis.URL.createObjectURL = () => 'blob:ebook-export';
    globalThis.URL.revokeObjectURL = () => {};
    try {
        const controller = createBookController({
            state,
            render() {},
            async requestHost(type, payload) {
                hostRequests.push({ type, payload });
                return {
                    images: {
                        slots: payload.slotIds,
                        previews: [{ slotId: 'slot-export', imgId: 'img-export', base64: 'data:image/png;base64,AAAA' }],
                        selections: [],
                        skipped: [],
                    },
                };
            },
            showToast() {},
        });

        await controller.exportBookPackage(book.id);

        assert.deepEqual(hostRequests, [{ type: 'xb-ebook:export-images', payload: { slotIds: ['slot-export'] } }]);
        assert.equal(downloaded, true);
        assert.equal(state.isBookExportOpen, false);
        assert.equal(state.viewMode, 'library');
    } finally {
        globalThis.confirm = previousConfirm;
        globalThis.document = previousDocument;
        globalThis.URL.createObjectURL = previousUrlCreate;
        globalThis.URL.revokeObjectURL = previousUrlRevoke;
    }
});

test('Ebook controller import creates a shelf book and stays on library', async () => {
    await resetDb();
    const existing = await createBook('原书');
    const pkg = buildEbookPackage({
        book: { title: '导入书' },
        files: [{ path: 'book/outline.md', content: '# 导入大纲' }],
        images: {
            slots: ['slot-import'],
            previews: [{ slotId: 'slot-import', imgId: 'img-import', base64: 'data:image/png;base64,AAAA' }],
            selections: [{ slotId: 'slot-import', selectedImgId: 'img-import' }],
        },
    });
    const state = {
        book: existing,
        books: await listBooks(),
        files: await listBookFiles(existing.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'library',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        isBookExportOpen: false,
        status: '就绪',
    };
    const hostRequests = [];
    const previousFileReader = globalThis.FileReader;
    globalThis.FileReader = class {
        readAsText() {
            this.result = JSON.stringify(pkg);
            this.onload?.();
        }
    };
    try {
        const controller = createBookController({
            state,
            render() {},
            async requestHost(type, payload) {
                hostRequests.push({ type, payload });
                return { ok: true };
            },
            showToast() {},
        });

        await controller.importBookPackageFile({ name: 'import.xbebook.json' });

        assert.equal(await getSelectedBookId(), existing.id);
        assert.equal(state.viewMode, 'library');
        assert.equal(state.book.id, existing.id);
        assert.equal(state.books.length, 2);
        assert.ok(state.books.some((book) => book.title === '导入书'));
        assert.deepEqual(hostRequests.map((request) => request.type), ['xb-ebook:import-images']);
        assert.equal(hostRequests[0].payload.images.previews[0].slotId, 'slot-import');
        assert.equal(hostRequests[0].payload.bookTitle, '导入书');
        assert.match(hostRequests[0].payload.bookId, /^book-/);
    } finally {
        globalThis.FileReader = previousFileReader;
    }
});

test('Ebook controller keeps imported book when image import fails', async () => {
    await resetDb();
    const existing = await createBook('原书');
    const pkg = buildEbookPackage({
        book: { title: '图片失败书' },
        files: [{ path: 'book/outline.md', content: '# 导入大纲' }],
        images: {
            slots: ['slot-missing'],
            previews: [{ slotId: 'slot-missing', imgId: 'img-missing', base64: 'data:image/png;base64,AAAA' }],
            selections: [],
        },
    });
    const state = {
        book: existing,
        books: await listBooks(),
        files: await listBookFiles(existing.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'library',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        isBookExportOpen: false,
        status: '就绪',
    };
    const toasts = [];
    const previousFileReader = globalThis.FileReader;
    globalThis.FileReader = class {
        readAsText() {
            this.result = JSON.stringify(pkg);
            this.onload?.();
        }
    };
    try {
        const controller = createBookController({
            state,
            render() {},
            async requestHost() {
                throw new Error('image_store_failed');
            },
            showToast(message) {
                toasts.push(message);
            },
        });

        await controller.importBookPackageFile({ name: 'import.xbebook.json' });

        assert.equal(await getSelectedBookId(), existing.id);
        assert.equal(state.viewMode, 'library');
        assert.equal(state.books.length, 2);
        assert.ok(state.books.some((book) => book.title === '图片失败书'));
        assert.match(toasts.at(-1), /^已导入：图片失败书，但图片导入失败：image_store_failed$/);
    } finally {
        globalThis.FileReader = previousFileReader;
    }
});

test('Studio renders mobile workspace switching and file drawer hooks', () => {
    const state = {
        book: { id: 'book-mobile-studio', title: '移动工作台' },
        books: [],
        files: [
            { path: 'book/chapters/001.md', content: '# 第 1 章\n\n正文' },
            { path: 'book/outline.md', content: '# 大纲' },
        ],
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'studio',
        editorContent: '# 第 1 章\n\n正文',
        savedContent: '# 第 1 章\n\n正文',
        messages: [],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        drawStatus: { provider: 'novelai', enabled: true, ready: true },
        colorTheme: 'dark',
        status: '就绪',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });

    assert.match(html, /class="xb-mobile-studio-topbar"/);
    assert.match(html, /class="xb-mobile-segment"/);
    assert.match(html, /data-studio-layout="focus-editor"/);
    assert.match(html, /data-studio-layout="focus-agent"/);
    assert.match(html, /id="xb-mobile-file-picker"/);
    assert.match(html, /class="xb-mobile-file-drawer-scrim"/);
    assert.match(html, /data-mobile-file-drawer-close/);
    assert.match(html, /id="xb-save"[^>]*>保存<\/button>/);
    assert.match(html, /这里是写作助手记录。可以先导入资料，也可以直接说“我想试试写一本书”。/);
    assert.match(html, /<summary>创作入口<\/summary>/);
    assert.match(html, />聊新书<\/button>/);
    assert.match(html, />建书脊<\/button>/);
    assert.match(html, />定写法<\/button>/);
    assert.match(html, />搭大纲<\/button>/);
    assert.match(html, />定当前卷<\/button>/);
    assert.match(html, />按指挥写<\/button>/);
    assert.match(html, />试写开场<\/button>/);
    assert.doesNotMatch(html, /续写草稿|审一遍|按意见改稿/);
    assert.doesNotMatch(html, /保存稿纸/);
});

test('Studio file section models keep unchanged file signatures reusable', () => {
    const files = [
        { path: 'book/chapters/001.md', content: '第一章' },
        { path: 'book/chapters/002.md', content: '第二章' },
        { path: 'book/outline.md', content: '大纲' },
        { path: 'book/notes/revision-plan.md', content: '修订计划' },
        { path: 'book/volumes/001.md', content: '第一卷' },
        { path: 'book/volumes/archive/old.md', content: '旧卷' },
    ];
    const firstModel = collectStudioFileSectionModels({
        files,
        selectedPath: 'book/chapters/001.md',
    });
    const nextModel = collectStudioFileSectionModels({
        files,
        selectedPath: 'book/chapters/002.md',
    });
    const descendingModel = collectStudioFileSectionModels({
        files,
        selectedPath: 'book/chapters/001.md',
        chapterSortDescending: true,
    });
    const firstChapters = firstModel.groups.find((group) => group.key === 'chapters');
    const nextChapters = nextModel.groups.find((group) => group.key === 'chapters');
    const descendingChapters = descendingModel.groups.find((group) => group.key === 'chapters');
    const settingsGroup = firstModel.groups.find((group) => group.key === 'settings');
    const firstOutline = settingsGroup.files[0];
    const nextOutline = nextModel.groups.find((group) => group.key === 'settings').files[0];

    assert.deepEqual(firstChapters.files.map((file) => file.path), ['book/chapters/001.md', 'book/chapters/002.md']);
    assert.deepEqual(descendingChapters.files.map((file) => file.path), ['book/chapters/002.md', 'book/chapters/001.md']);
    // Signatures are structural only (path + title) — they must NOT change when the active
    // selection moves, otherwise the whole .xb-file-tree would be rebuilt and scroll reset.
    assert.equal(firstChapters.files[0].signature, nextChapters.files[0].signature);
    assert.equal(firstChapters.files[1].signature, nextChapters.files[1].signature);
    assert.equal(firstOutline.signature, nextOutline.signature);
    // Active/selected state is exposed on the model and synced as a class toggle instead.
    assert.equal(firstChapters.files[0].active, true);
    assert.equal(firstChapters.files[1].active, false);
    assert.equal(nextChapters.files[0].active, false);
    assert.equal(nextChapters.files[1].active, true);
    assert.equal(firstModel.groups.some((group) => group.key === 'volumes'), false);
    assert.match(firstChapters.scaffoldHtml, /data-file-group-key="chapters"/);
    assert.match(firstChapters.html, /data-file-group-key="chapters"/);
    assert.match(firstChapters.html, /data-chapter-sort-toggle[^>]*>倒序<\/button>/);
    assert.match(descendingChapters.html, /data-chapter-sort-toggle[^>]*>正序<\/button>/);
    assert.match(firstChapters.html, /data-file-static-signature="chapters:/);
    assert.match(firstChapters.html, /data-file-signature="book\/chapters\/001\.md:第 1 章"/);
    assert.match(firstChapters.html, /data-file-signature="book\/chapters\/002\.md:第 2 章"/);
    assert.match(settingsGroup.html, /第 1 卷规划/);
    assert.match(settingsGroup.html, /xb-file-directory/);
    assert.match(settingsGroup.html, />volumes</);
    assert.match(settingsGroup.html, />volumes\/archive</);
    assert.match(settingsGroup.html, /old 规划/);
    assert(
        settingsGroup.html.indexOf('修订计划') < settingsGroup.html.indexOf('第 1 卷规划'),
        'volume outlines should stay after notes inside settings drafts',
    );

    const sourcesGroup = firstModel.groups.find((group) => group.key === 'sources');
    assert.match(sourcesGroup.html, /data-file-group-empty="true"/);
});

test('Chapter sort toggle refreshes file surface without rebuilding the shell', () => {
    const state = {
        chapterSortDescending: false,
    };
    let fullRenders = 0;
    let fileSurfaces = 0;
    const controller = createBookController({
        state,
        render() {
            fullRenders += 1;
        },
        renderFilesSurface() {
            fileSurfaces += 1;
            return true;
        },
        requestHost() {},
        showToast() {},
    });

    controller.toggleChapterSortOrder();

    assert.equal(state.chapterSortDescending, true);
    assert.equal(fileSurfaces, 1);
    assert.equal(fullRenders, 0);
});

test('selectFile from studio patches surfaces without rebuilding the shell', async () => {
    const state = {
        files: [
            { path: 'book/chapters/001.md', content: '第一章' },
            { path: 'book/chapters/002.md', content: '第二章' },
        ],
        selectedPath: 'book/chapters/001.md',
        editorContent: '第一章',
        savedContent: '第一章',
        viewMode: 'studio',
    };
    let fullRenders = 0;
    let fileSurfaces = 0;
    let studioSurfaces = 0;
    const controller = createBookController({
        state,
        render() { fullRenders += 1; },
        renderFilesSurface() { fileSurfaces += 1; return true; },
        renderStudioSurface() { studioSurfaces += 1; return true; },
        requestHost() { return Promise.resolve({}); },
        showToast() {},
    });

    await controller.selectFile('book/chapters/002.md');

    assert.equal(state.selectedPath, 'book/chapters/002.md');
    assert.equal(state.editorContent, '第二章');
    assert.equal(state.savedContent, '第二章');
    assert.equal(fileSurfaces, 1, 'files surface patches active state');
    assert.equal(studioSurfaces, 1, 'studio surface patches the editor');
    assert.equal(fullRenders, 0, 'no full shell rebuild — sidebar scroll survives');
});

test('selectFile entering studio from another view does a full render', async () => {
    const state = {
        files: [{ path: 'book/chapters/001.md', content: '第一章' }],
        selectedPath: '',
        editorContent: '',
        savedContent: '',
        viewMode: 'book-entry',
    };
    let fullRenders = 0;
    let fileSurfaces = 0;
    let studioSurfaces = 0;
    const controller = createBookController({
        state,
        render() { fullRenders += 1; },
        renderFilesSurface() { fileSurfaces += 1; return true; },
        renderStudioSurface() { studioSurfaces += 1; return true; },
        requestHost() { return Promise.resolve({}); },
        showToast() {},
    });

    await controller.selectFile('book/chapters/001.md');

    assert.equal(state.viewMode, 'studio');
    assert.equal(fullRenders, 1, 'entering studio mounts the shell');
    assert.equal(fileSurfaces, 0);
    assert.equal(studioSurfaces, 0);
});

test('selectFile falls back to a full render when a studio surface cannot patch', async () => {
    const state = {
        files: [
            { path: 'book/chapters/001.md', content: '第一章' },
            { path: 'book/chapters/002.md', content: '第二章' },
        ],
        selectedPath: 'book/chapters/001.md',
        editorContent: '第一章',
        savedContent: '第一章',
        viewMode: 'studio',
    };
    let fullRenders = 0;
    const controller = createBookController({
        state,
        render() { fullRenders += 1; },
        renderFilesSurface() { return true; },
        renderStudioSurface() { return false; }, // e.g. shell node unexpectedly missing
        requestHost() { return Promise.resolve({}); },
        showToast() {},
    });

    await controller.selectFile('book/chapters/002.md');

    assert.equal(state.selectedPath, 'book/chapters/002.md');
    assert.equal(fullRenders, 1, 'a failed surface patch must not leave the view stale');
});

test('Chapter sort toggle uses delegated binding after the file group is replaced', () => {
    const state = {};
    let toggles = 0;
    let prevented = 0;
    const listeners = {};
    const sortButton = {
        closest(selector) {
            return selector === '[data-chapter-sort-toggle]' ? this : null;
        },
    };
    const root = {
        querySelectorAll() {
            return [];
        },
        querySelector() {
            return null;
        },
        contains(node) {
            return node === sortButton;
        },
        addEventListener(eventName, handler) {
            listeners[eventName] = handler;
        },
        removeEventListener() {},
    };

    bindEbookEvents({
        root,
        state,
        render() {},
        postToHost() {},
        bookController: {
            toggleChapterSortOrder() {
                toggles += 1;
            },
        },
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    listeners.click({
        target: sortButton,
        preventDefault() {
            prevented += 1;
        },
    });
    listeners.click({
        target: sortButton,
        preventDefault() {
            prevented += 1;
        },
    });

    assert.equal(toggles, 2);
    assert.equal(prevented, 2);
});

test('Reader renders a mobile table-of-contents drawer', () => {
    const state = {
        book: { id: 'book-reader-toc', title: '目录测试' },
        books: [],
        files: [
            { path: 'book/chapters/001.md', content: '# 第 1 章\n\n第一章正文' },
            { path: 'book/chapters/002.md', content: '# 第 2 章\n\n第二章正文' },
        ],
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'reader',
        editorContent: '',
        savedContent: '',
        messages: [],
        isBusy: false,
        colorTheme: 'dark',
        toast: '',
    };

    const html = renderEbookShell({ state });
    const actionsHtml = html.match(/<div class="xb-reader-edge-actions">([\s\S]*?)<\/div>/)?.[1] || '';
    assert.match(html, /id="xb-reader-index-toggle"/);
    assert.match(html, /id="xb-reader-tts-toggle"/);
    assert.match(html, /id="xb-reader-tts-toggle"[^>]*disabled/);
    assert.match(html, /id="xb-reader-index-scrim"/);
    assert.match(html, /class="xb-reader-toc-sheet"/);
    assert.match(html, /id="xb-reader-index-close"/);
    assert.doesNotMatch(actionsHtml, /id="xb-studio-link"/);
    assert(
        actionsHtml.indexOf('id="xb-entry-link"') < actionsHtml.indexOf('id="xb-reader-index-toggle"'),
        'reader entry button should stay before the toc button',
    );
    assert(
        actionsHtml.indexOf('id="xb-reader-index-toggle"') < actionsHtml.indexOf('id="xb-reader-tts-toggle"'),
        'reader toc button should stay before the tts button',
    );
    assert(
        actionsHtml.indexOf('id="xb-reader-tts-toggle"') < actionsHtml.indexOf('id="xb-theme-toggle"'),
        'reader tts button should stay before the theme button',
    );
    assert.equal((html.match(/data-reader-path="book\/chapters\/001\.md"/g) || []).length, 2);

    const readyHtml = renderEbookShell({
        state: {
            ...state,
            readerTtsStatus: { enabled: true, ready: true },
        },
    });
    assert.match(readyHtml, /id="xb-reader-tts-toggle"[^>]*>▶<\/button>/);
    assert.doesNotMatch(readyHtml, /id="xb-reader-tts-toggle"[^>]*disabled/);

    const activeHtml = renderEbookShell({
        state: {
            ...state,
            readerTtsStatus: { enabled: true, ready: true },
            readerTtsPlayback: {
                status: 'playing',
                playbackId: 'reader-playback-1',
                chapterPath: 'book/chapters/001.md',
                error: '',
            },
        },
    });
    assert.match(activeHtml, /class="[^"]*xb-reader-tts-toggle[^"]*is-active[^"]*" id="xb-reader-tts-toggle"/);
    assert.match(activeHtml, /id="xb-reader-tts-toggle"[^>]*>■<\/button>/);
    assert.doesNotMatch(activeHtml, /id="xb-reader-tts-toggle"[^>]*disabled/);

    const activeDisabledStatusHtml = renderEbookShell({
        state: {
            ...state,
            readerTtsStatus: { enabled: false, ready: false },
            readerTtsPlayback: {
                status: 'playing',
                playbackId: 'reader-playback-2',
                chapterPath: 'book/chapters/001.md',
                error: '',
            },
        },
    });
    assert.match(activeDisabledStatusHtml, /id="xb-reader-tts-toggle"[^>]*>■<\/button>/);
    assert.doesNotMatch(activeDisabledStatusHtml, /id="xb-reader-tts-toggle"[^>]*disabled/);
});

test('Book entry uses concise studio and reader descriptions', () => {
    const html = renderEbookShell({
        state: {
            book: { id: 'book-entry-copy', title: '入口文案测试' },
            books: [],
            files: [],
            viewMode: 'book-entry',
            colorTheme: 'dark',
            toast: '',
        },
    });

    assert.match(html, /agent写作平台/);
    assert.match(html, /沉浸式阅读器/);
    assert.doesNotMatch(html, /这里不放 AI/);
});

test('Book entry keeps desktop portal actions hover-highlight only', () => {
    const styles = readFileSync(new URL('../app-src/styles.js', import.meta.url), 'utf8');

    assert.doesNotMatch(
        styles,
        /\.theme-dark\s+\.xb-library-book,\s*\.theme-dark\s+\.xb-entry-action\s*\{/,
        'entry actions must not inherit the always-lit book-card background on desktop',
    );
    assert.match(
        styles,
        /\.theme-dark\s+\.xb-entry-action\s*\{[^}]*background:\s*transparent;/s,
        'dark desktop entry actions should stay muted until hover',
    );
    assert.match(
        styles,
        /\.theme-light\s+\.xb-entry-action\s*\{[^}]*background:\s*transparent;/s,
        'light desktop entry actions should stay muted until hover',
    );
    assert.doesNotMatch(
        styles,
        /@media\s*\(hover:\s*none\),\s*\(pointer:\s*coarse\)\s*\{[\s\S]*\.xb-entry-action/,
        'touch-only active styling should not be broad enough to hit desktop touch hardware',
    );
    assert.match(
        styles,
        /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*\.theme-dark\s+\.xb-entry-action\.is-studio\s*\{[\s\S]*#2b3040/,
        'small-screen entry actions should remain visibly active for touch users',
    );
});

test('Book controller initialization does not request draw status before frame ready', async () => {
    await resetDb();
    const state = {
        book: null,
        books: [],
        files: [],
        selectedPath: '',
        readerPath: '',
        viewMode: 'library',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        toast: '',
    };
    const requests = [];
    const controller = createBookController({
        state,
        render() {},
        requestHost(type) {
            requests.push(type);
        },
        showToast() {},
    });

    await controller.initializeBook();

    assert.deepEqual(requests, []);
});

test('Studio draw button is only active for drawable chapters', () => {
    const baseState = {
        book: { id: 'book-draw-render', title: '配图按钮测试' },
        books: [],
        files: [],
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '她推开门。',
        savedContent: '她推开门。',
        messages: [],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        isDrawingChapter: false,
        drawStatus: { provider: 'novelai', enabled: true, ready: true },
        colorTheme: 'dark',
        status: '就绪',
        toast: '',
    };

    const enabledHtml = renderEbookShell({
        state: baseState,
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });
    assert.match(enabledHtml, /id="xb-draw-chapter"[^>]*>配图<\/button>/);
    assert.doesNotMatch(enabledHtml, /id="xb-draw-chapter"[^>]*disabled/);

    const drawingHtml = renderEbookShell({
        state: { ...baseState, isDrawingChapter: true, editorContent: '' },
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });
    assert.match(drawingHtml, /id="xb-draw-chapter"[^>]*>停止<\/button>/);
    assert.doesNotMatch(drawingHtml, /id="xb-draw-chapter"[^>]*disabled/);

    const nonChapterHtml = renderEbookShell({
        state: { ...baseState, selectedPath: 'book/outline.md' },
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });
    assert.match(nonChapterHtml, /id="xb-draw-chapter"[^>]*disabled/);

    const disabledBackendHtml = renderEbookShell({
        state: { ...baseState, drawStatus: { provider: 'disabled', enabled: false, ready: false } },
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });
    assert.match(disabledBackendHtml, /id="xb-draw-chapter"[^>]*disabled/);
});

test('Book draw cooldown progress includes a countdown', () => {
    assert.equal(
        formatDrawProgress('cooldown', { duration: 18500, nextIndex: 3, total: 4 }),
        '等待下一张配图 3/4，剩余 18.5s',
    );
});

test('Book draw progress patches the studio surface without full rerender', () => {
    const state = {
        isDrawingChapter: true,
        drawProgressText: '',
    };
    let renderCount = 0;
    let surfaceCount = 0;
    const controller = createBookController({
        state,
        render() {
            renderCount += 1;
        },
        renderStudioSurface() {
            surfaceCount += 1;
            return true;
        },
        requestHost() {},
        showToast() {},
    });

    controller.handleDrawProgress({ state: 'llm' });

    assert.equal(state.drawProgressText, '正在分析章节画面...');
    assert.equal(surfaceCount, 1);
    assert.equal(renderCount, 0);
});

test('Book editor surface keeps focused textarea draft while patching progress', () => {
    const previousDocument = globalThis.document;
    const editor = {
        value: '用户正在输入的未保存内容',
        disabled: false,
    };
    const saveButton = { disabled: false };
    const drawButton = {
        disabled: false,
        textContent: '',
        title: '',
        setAttribute(name, value) {
            this[name] = value;
        },
    };
    const editorMeta = { textContent: '' };
    const mobileTitle = { textContent: '' };
    const pathNode = { textContent: '' };
    let fullRenderCount = 0;
    const root = {
        set innerHTML(_value) {
            fullRenderCount += 1;
        },
        get innerHTML() {
            return '';
        },
        querySelector(selector) {
            if (selector === '.xb-studio-shell') return {};
            if (selector === '#xb-editor-text') return editor;
            if (selector === '#xb-save') return saveButton;
            if (selector === '#xb-draw-chapter') return drawButton;
            if (selector === '#xb-editor-meta') return editorMeta;
            if (selector === '#xb-mobile-file-picker strong') return mobileTitle;
            if (selector === '.xb-path') return pathNode;
            return null;
        },
    };
    globalThis.document = {
        activeElement: editor,
        getElementById(id) {
            return id === 'ebook-root' ? root : null;
        },
    };

    try {
        const app = createEbookApp({
            rootId: 'ebook-root',
            hostBridge: {
                postToHost() {},
                requestHost() {},
            },
        });
        Object.assign(app.state, {
            book: { id: 'book-editor-surface', title: '编辑器 surface 测试' },
            viewMode: 'studio',
            selectedPath: 'book/chapters/001.md',
            editorContent: '数据库里的正文',
            savedContent: '数据库里的正文',
            isBusy: false,
            isDrawingChapter: true,
            drawStatus: { enabled: true, ready: true },
            drawProgressText: '',
        });

        app.handleDrawProgress({ state: 'llm' });

        assert.equal(editor.value, '用户正在输入的未保存内容');
        assert.match(editorMeta.textContent, /正在分析章节画面/);
        assert.equal(fullRenderCount, 0);
    } finally {
        globalThis.document = previousDocument;
    }
});

test('Book controller draws current chapter and inserts ebook image markers by anchor', async () => {
    await resetDb();
    const book = await createBook('章节配图测试');
    const originalContent = '她推开门。\n\n夜色涌进来。';
    await upsertBookFile(book.id, 'book/chapters/001.md', originalContent);
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'studio',
        editorContent: originalContent,
        savedContent: originalContent,
        isBusy: false,
        isDrawingChapter: false,
        drawStatus: { provider: 'novelai', enabled: true, ready: true },
        drawProgressText: '',
        toast: '',
    };
    const seenRequests = [];
    const controller = createBookController({
        state,
        render() {},
        async requestHost(type, payload) {
            seenRequests.push({ type, payload });
            if (type === 'xb-ebook:draw-status') {
                return { ok: true, provider: 'novelai', enabled: true, ready: true };
            }
            if (type === 'xb-ebook:draw-generate') {
                return {
                    ok: true,
                    success: 2,
                    total: 2,
                    images: [
                        { slotId: 'slot-anchor', anchor: '她推开门', success: true },
                        { slotId: 'slot-tail', anchor: '不存在的锚点', success: true },
                    ],
                };
            }
            throw new Error('unexpected_request');
        },
        showToast() {},
    });

    await controller.drawCurrentChapter();

    const updated = await getBookFile(book.id, 'book/chapters/001.md');
    assert.match(updated.content, /她推开门。\n\[ebook-image:slot-anchor\]/);
    assert.match(updated.content, /夜色涌进来。\n\[ebook-image:slot-tail\]$/);
    assert.equal(state.savedContent, updated.content);
    assert.equal(seenRequests.some((item) => item.type === 'xb-ebook:draw-generate'), true);
    const drawPayload = seenRequests.find((item) => item.type === 'xb-ebook:draw-generate')?.payload || {};
    assert.equal(drawPayload.source, 'ebook');
    assert.equal(drawPayload.bookId, book.id);
    assert.equal(drawPayload.chapterPath, 'book/chapters/001.md');
    assert.equal(state.drawProgressText, '占位符已插入，请去阅读器查看');
});

test('Book drawing can be cancelled by clicking the chapter draw button again', async () => {
    await resetDb();
    const book = await createBook('取消配图测试');
    const originalContent = '她推开门。';
    await upsertBookFile(book.id, 'book/chapters/001.md', originalContent);
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'studio',
        editorContent: originalContent,
        savedContent: originalContent,
        isBusy: false,
        isDrawingChapter: false,
        drawStatus: { provider: 'novelai', enabled: true, ready: true },
        drawProgressText: '',
        toast: '',
    };
    const toasts = [];
    let drawSignal = null;
    let startDraw = null;
    const drawStarted = new Promise((resolve) => {
        startDraw = resolve;
    });
    const controller = createBookController({
        state,
        render() {},
        async requestHost(type, _payload, options = {}) {
            if (type === 'xb-ebook:draw-status') {
                return { ok: true, provider: 'novelai', enabled: true, ready: true };
            }
            if (type === 'xb-ebook:draw-generate') {
                drawSignal = options.signal;
                startDraw();
                return new Promise((resolve, reject) => {
                    options.signal?.addEventListener('abort', () => reject(new Error('已取消')), { once: true });
                    setTimeout(() => resolve({
                        ok: true,
                        success: 1,
                        total: 1,
                        images: [{ slotId: 'slot-should-not-write', anchor: '她推开门', success: true }],
                    }), 1000).unref?.();
                });
            }
            throw new Error('unexpected_request');
        },
        showToast(message) {
            toasts.push(message);
        },
    });

    const runningDraw = controller.drawCurrentChapter();
    await drawStarted;
    assert.equal(state.isDrawingChapter, true);
    assert.equal(drawSignal?.aborted, false);

    await controller.drawCurrentChapter();
    assert.equal(drawSignal.aborted, true);
    assert.equal(state.drawProgressText, '正在停止配图...');

    await runningDraw;
    assert.equal(state.isDrawingChapter, false);
    assert.equal(toasts.at(-1), '配图已取消');
    const updated = await getBookFile(book.id, 'book/chapters/001.md');
    assert.equal(updated.content, originalContent);
});

test('Book drawing saves the original chapter if the user switches files while generation runs', async () => {
    await resetDb();
    const book = await createBook('切换文件配图测试');
    const chapterContent = '她推开门。';
    await upsertBookFile(book.id, 'book/chapters/001.md', chapterContent);
    await upsertBookFile(book.id, 'book/outline.md', '旧大纲');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'studio',
        editorContent: chapterContent,
        savedContent: chapterContent,
        isBusy: false,
        isDrawingChapter: false,
        drawStatus: { provider: 'novelai', enabled: true, ready: true },
        drawProgressText: '',
        toast: '',
    };
    const controller = createBookController({
        state,
        render() {},
        async requestHost(type) {
            if (type === 'xb-ebook:draw-status') {
                return { ok: true, provider: 'novelai', enabled: true, ready: true };
            }
            if (type === 'xb-ebook:draw-generate') {
                state.selectedPath = 'book/outline.md';
                state.editorContent = '未保存的新大纲';
                state.savedContent = '旧大纲';
                return {
                    ok: true,
                    success: 1,
                    total: 1,
                    images: [{ slotId: 'slot-switch', anchor: '她推开门', success: true }],
                };
            }
            throw new Error('unexpected_request');
        },
        showToast() {},
    });

    await controller.drawCurrentChapter();

    const updatedChapter = await getBookFile(book.id, 'book/chapters/001.md');
    assert.match(updatedChapter.content, /她推开门。\n\[ebook-image:slot-switch\]/);
    assert.equal(state.selectedPath, 'book/outline.md');
    assert.equal(state.editorContent, '未保存的新大纲');
    assert.equal(state.savedContent, '旧大纲');
});

test('Book drawing does not recreate files when the original book is deleted mid-generation', async () => {
    await resetDb();
    const book = await createBook('删除中配图测试');
    await upsertBookFile(book.id, 'book/chapters/001.md', '她推开门。');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'studio',
        editorContent: '她推开门。',
        savedContent: '她推开门。',
        isBusy: false,
        isDrawingChapter: false,
        drawStatus: { provider: 'novelai', enabled: true, ready: true },
        drawProgressText: '',
        toast: '',
    };
    const toasts = [];
    const controller = createBookController({
        state,
        render() {},
        async requestHost(type) {
            if (type === 'xb-ebook:draw-status') {
                return { ok: true, provider: 'novelai', enabled: true, ready: true };
            }
            if (type === 'xb-ebook:draw-generate') {
                await deleteBook(book.id);
                state.book = null;
                return {
                    ok: true,
                    success: 1,
                    total: 1,
                    images: [{ slotId: 'slot-deleted-book', anchor: '她推开门', success: true }],
                };
            }
            throw new Error('unexpected_request');
        },
        showToast(message) {
            toasts.push(message);
        },
    });

    await controller.drawCurrentChapter();

    assert.equal(await getBook(book.id), null);
    assert.equal(await getBookFile(book.id, 'book/chapters/001.md'), null);
    assert.match(toasts.at(-1), /原书已删除/);
});

test('Reader renders ebook image markers as loadable image slots', () => {
    const state = {
        book: { id: 'book-reader-image', title: '阅读配图测试' },
        books: [],
        files: [{
            path: 'book/chapters/001.md',
            content: '第一段。\n\n[ebook-image:slot-reader]\n\n第二段。',
        }],
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'reader',
        messages: [],
        toolTrace: [],
        isBusy: false,
        colorTheme: 'dark',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });

    assert.match(html, /data-ebook-image-slot="slot-reader"/);
    assert.match(html, /配图加载中/);
    assert.doesNotMatch(html, /\[ebook-image:slot-reader\]/);
});

test('Reader renders chapter markdown while preserving image markers', () => {
    const state = {
        book: { id: 'book-reader-markdown', title: '阅读 Markdown 测试' },
        books: [],
        files: [{
            path: 'book/chapters/001.md',
            content: '# 目录\n\n*内心*\n\n“对话”\n\n[ebook-image:slot-md]',
        }],
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'reader',
        messages: [],
        toolTrace: [],
        isBusy: false,
        colorTheme: 'dark',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });

    assert.match(html, /<h1[^>]*>目录<\/h1>/);
    assert.match(html, /<em>内心<\/em>/);
    assert.match(html, /“对话”/);
    assert.match(html, /data-ebook-image-slot="slot-md"/);
    assert.doesNotMatch(html, /\*内心\*/);
    assert.doesNotMatch(html, /\[ebook-image:slot-md\]/);
});

test('Reader skips a duplicated first chapter heading without suppressing body headings', () => {
    const state = {
        book: { id: 'book-reader-heading', title: '章节标题测试' },
        books: [],
        files: [{
            path: 'book/chapters/001.md',
            content: '# 第 001 章。\n\n正文第一段。\n\n## 正文小标题',
        }],
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'reader',
        messages: [],
        toolTrace: [],
        isBusy: false,
        colorTheme: 'dark',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });

    assert.match(html, /<h2>第 1 章<\/h2>/);
    assert.doesNotMatch(html, /<h1[^>]*>第 001 章。<\/h1>/);
    assert.match(html, /正文第一段。/);
    assert.match(html, /<h2[^>]*>正文小标题<\/h2>/);
});

test('Reader TTS plays the active chapter text and stops when switching chapters', async () => {
    await resetDb();
    const book = await createBook('朗读测试');
    await upsertBookFile(
        book.id,
        'book/chapters/001.md',
        '# 第 1 章\n\n第一段。\n\n[ebook-image:slot-voice]\n\n第二段。',
    );
    await upsertBookFile(book.id, 'book/chapters/002.md', '下一章。');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'reader',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        readerTtsStatus: { enabled: true, ready: true },
        readerTtsPlayback: { status: 'idle', playbackId: '', chapterPath: '', error: '' },
        toast: '',
    };
    const requests = [];
    const controller = createBookController({
        state,
        render() {},
        async requestHost(type, payload = {}) {
            requests.push({ type, payload });
            if (type === 'xb-ebook:tts-status') return { ok: true, enabled: true, ready: true };
            if (type === 'xb-ebook:tts-play') return { ok: true, playbackId: payload.playbackId };
            if (type === 'xb-ebook:tts-stop') return { ok: true };
            throw new Error(`unexpected_request:${type}`);
        },
        showToast() {},
    });

    await controller.toggleReaderTts();

    const playRequest = requests.find((item) => item.type === 'xb-ebook:tts-play');
    assert.ok(playRequest);
    assert.equal(playRequest.payload.chapterPath, 'book/chapters/001.md');
    assert.match(playRequest.payload.text, /第一段。/);
    assert.match(playRequest.payload.text, /第二段。/);
    assert.doesNotMatch(playRequest.payload.text, /第 1 章/);
    assert.doesNotMatch(playRequest.payload.text, /\[ebook-image:/);
    assert.doesNotMatch(playRequest.payload.text, /^#/m);
    assert.equal(state.readerTtsPlayback.status, 'loading');

    controller.handleTtsState({ playbackId: playRequest.payload.playbackId, state: 'playing' });
    assert.equal(state.readerTtsPlayback.status, 'playing');

    await controller.selectReaderChapter('book/chapters/002.md');

    const stopRequest = requests.find((item) => item.type === 'xb-ebook:tts-stop');
    assert.ok(stopRequest);
    assert.equal(stopRequest.payload.playbackId, playRequest.payload.playbackId);
    assert.equal(state.readerPath, 'book/chapters/002.md');
    assert.equal(state.readerTtsPlayback.status, 'idle');
});

test('Reader chapter switching does not wait for the host stop request before navigating', async () => {
    await resetDb();
    const book = await createBook('朗读切章不卡顿测试');
    await upsertBookFile(book.id, 'book/chapters/001.md', '第一章。');
    await upsertBookFile(book.id, 'book/chapters/002.md', '第二章。');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'reader',
        editorContent: '',
        savedContent: '',
        isBusy: false,
        readerTtsStatus: { enabled: true, ready: true },
        readerTtsPlayback: {
            status: 'playing',
            playbackId: 'reader-playback-slow-stop',
            chapterPath: 'book/chapters/001.md',
            error: '',
        },
        toast: '',
    };
    let releaseStop = null;
    const stopPending = new Promise((resolve) => {
        releaseStop = resolve;
    });
    const controller = createBookController({
        state,
        render() {},
        async requestHost(type) {
            if (type === 'xb-ebook:tts-stop') return stopPending;
            throw new Error(`unexpected_request:${type}`);
        },
        showToast() {},
    });

    const switchPromise = controller.selectReaderChapter('book/chapters/002.md');

    assert.equal(state.readerPath, 'book/chapters/002.md');
    assert.equal(state.viewMode, 'reader');
    assert.equal(state.readerTtsPlayback.status, 'idle');

    releaseStop({ ok: true });
    await switchPromise;
});

test('Deleting a book removes persisted conversation rows and stale selection metadata', async () => {
    await resetDb();
    const book = await createBook('删除会话测试');
    const state = {
        book,
        messages: [
            { role: 'user', content: '写第一章' },
            { role: 'assistant', content: '已经起草。' },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        editingMessageIndex: -1,
        messageActionFeedback: {},
        historySummary: '删除前的摘要',
        archivedTurnCount: 0,
    };
    const store = createEbookConversationStore({ state });

    await store.persistConversation(book.id);
    await deleteBook(book.id);

    assert.equal(await ebookSessionsTable.get(book.id), undefined);
    assert.equal(await ebookMessagesTable.where('bookId').equals(book.id).count(), 0);
    assert.equal(await getSelectedBookId(), '');
});

test('Book tool runtime can rename the current book', async () => {
    await resetDb();
    const book = await createBook('旧书名');
    let filesChanged = 0;
    const runtime = createBookToolRuntime({
        bookId: book.id,
        onFilesChanged() {
            filesChanged += 1;
        },
    });

    const result = await runtime.execute(EBOOK_TOOL_NAMES.RENAME_BOOK, { title: ' 新标题 ' });

    assert.equal(result.ok, true);
    assert.equal(result.title, '新标题');
    assert.equal((await getBook(book.id)).title, '新标题');
    assert.equal(filesChanged, 1);
});

test('Book conversation history is restored per book', async () => {
    await resetDb();
    const first = await createBook('第一本');
    const second = await createBook('第二本');
    const state = {
        book: first,
        messages: [
            { role: 'user', content: '写第一章开头' },
            { role: 'assistant', content: '已经写入 book/chapters/001.md' },
        ],
        toolTrace: [{ name: 'Read' }],
        openToolTurnKeys: ['tool-turn:call-read'],
        openThoughtKeys: ['thought-message:1'],
        editingMessageIndex: 1,
        messageActionFeedback: { 'copy:1': 'success' },
        historySummary: '第一本的创作记录',
        archivedTurnCount: 0,
    };
    const store = createEbookConversationStore({ state });

    await store.persistConversation(first.id);
    state.book = second;
    await store.restoreConversation(second.id);
    assert.equal(state.messages.length, 0);
    assert.equal(state.historySummary, '');
    assert.equal(state.toolTrace.length, 0);
    assert.deepEqual(state.openToolTurnKeys, []);
    assert.deepEqual(state.openThoughtKeys, []);
    assert.equal(state.editingMessageIndex, -1);
    assert.deepEqual(state.messageActionFeedback, {});

    state.book = first;
    await store.restoreConversation(first.id);
    assert.equal(state.messages.length, 2);
    assert.equal(state.messages[0].content, '写第一章开头');
    assert.equal(state.historySummary, '');
    assert.equal(state.toolTrace.length, 0);
    assert.deepEqual(state.openToolTurnKeys, []);
    assert.deepEqual(state.openThoughtKeys, []);
    assert.equal(state.editingMessageIndex, -1);
    assert.deepEqual(state.messageActionFeedback, {});
});

test('Book conversation preserves tool context separately from UI folding', async () => {
    await resetDb();
    const book = await createBook('工具上下文测试');
    const state = {
        book,
        messages: [
            { role: 'user', content: '读取第一章并修订。' },
            {
                role: 'assistant',
                content: '',
                thoughts: [{ label: '思考块', text: '先读取第一章。' }],
                toolCalls: [{
                    id: 'call-read',
                    name: EBOOK_TOOL_NAMES.READ,
                    arguments: '{"filePath":"book/chapters/001.md"}',
                }],
            },
            {
                role: 'tool',
                toolCallId: 'call-read',
                toolName: EBOOK_TOOL_NAMES.READ,
                content: '{"ok":true,"content":"1: # 第 1 章"}',
            },
            { role: 'assistant', content: '已读取第一章，准备修订。' },
        ],
        toolTrace: [{ name: 'Read' }],
        historySummary: '',
        archivedTurnCount: 0,
    };
    const store = createEbookConversationStore({ state });

    await store.persistConversation(book.id);
    state.messages = [];
    state.toolTrace = [];
    await store.restoreConversation(book.id);

    assert.equal(state.messages.length, 4);
    assert.equal(state.messages[1].thoughts[0].text, '先读取第一章。');
    assert.equal(state.messages[1].toolCalls[0].name, EBOOK_TOOL_NAMES.READ);
    assert.equal(state.messages[2].role, 'tool');
    assert.equal(state.messages[2].toolCallId, 'call-read');

    const providerMessages = buildEbookProviderMessagesFromHistory(state.messages);
    assert.equal(providerMessages[1].tool_calls[0].function.name, EBOOK_TOOL_NAMES.READ);
    assert.equal(providerMessages[2].role, 'tool');
    assert.equal(providerMessages[2].tool_call_id, 'call-read');
    assert.equal(providerMessages[2].toolName, EBOOK_TOOL_NAMES.READ);
});

test('Book renderer shows thoughts while keeping tool batches folded', async () => {
    await resetDb();
    const book = await createBook('渲染思考测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '审一下第一章。' },
            {
                role: 'assistant',
                content: '',
                thoughts: [{ label: '思考块', text: '先查大纲和正文。' }],
                toolCalls: [{
                    id: 'call-read',
                    name: EBOOK_TOOL_NAMES.READ,
                    arguments: '{"filePath":"book/chapters/001.md"}',
                }],
            },
            {
                role: 'tool',
                toolCallId: 'call-read',
                toolName: EBOOK_TOOL_NAMES.READ,
                content: '{"ok":true,"summary":"读取第一章。"}',
            },
            {
                role: 'assistant',
                content: '第一章节奏正常。',
                thoughts: [{ label: '推理摘要', text: '结论来自正文和大纲。' }],
            },
        ],
        toolTrace: [],
        openToolTurnKeys: ['tool-turn:call-read'],
        openThoughtKeys: ['tool-turn:call-read:thought:1', 'thought-message:3'],
        historySummary: '',
        isBusy: false,
        status: '就绪',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(html, /已创作 1 轮/);
    assert.match(html, /<details class="xb-tool-trace xb-tool-turn" data-tool-turn-key="tool-turn:call-read" open>/);
    assert.match(html, /data-thought-key="tool-turn:call-read:thought:1" open/);
    assert.match(html, /data-thought-key="thought-message:3" open/);
    assert.match(html, /data-message-action="copy" data-message-index="0"/);
    assert.match(html, /data-message-action="edit" data-message-index="0"/);
    assert.match(html, /data-message-action="reroll" data-message-index="0"/);
    assert.match(html, /data-message-action="delete" data-message-index="0"/);
    assert.match(html, /data-message-action="copy" data-message-index="3"/);
    assert.match(html, /data-message-action="edit" data-message-index="3"/);
    assert.match(html, /data-message-action="reroll" data-message-index="3"/);
    assert.match(html, /data-message-action="delete" data-message-index="3"/);
    assert.match(html, /展开思考块/);
    assert.match(html, /先查大纲和正文/);
    assert.match(html, /第一章节奏正常/);
});

test('Book renderer keeps only the recent agent history mounted by default', async () => {
    await resetDb();
    const book = await createBook('UI窗口测试');
    const messages = Array.from({ length: 9 }, (_, index) => ({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: `窗口消息_${index}`,
    }));
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages,
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        status: '就绪',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(html, /较早记录 4 条/);
    assert.doesNotMatch(html, /窗口消息_0/);
    assert.doesNotMatch(html, /窗口消息_3/);
    assert.match(html, /窗口消息_4/);
    assert.match(html, /窗口消息_8/);
    assert.equal(state.messages.length, 9);
});

test('Book message window counts consecutive tool rounds as one mounted unit', () => {
    const messages = [
        { role: 'user', content: '跑工具。' },
        { role: 'assistant', toolCalls: [{ id: 'a', name: EBOOK_TOOL_NAMES.READ, arguments: '{}' }] },
        { role: 'tool', toolCallId: 'a', toolName: EBOOK_TOOL_NAMES.READ, content: '{}' },
        { role: 'assistant', toolCalls: [{ id: 'b', name: EBOOK_TOOL_NAMES.GREP, arguments: '{}' }] },
        { role: 'tool', toolCallId: 'b', toolName: EBOOK_TOOL_NAMES.GREP, content: '{}' },
        { role: 'assistant', content: '完成。' },
    ];

    assert.equal(countMessageWindowUnits(messages), 3);
});

test('Book renderer keeps the active tool turn expanded while the run is still in progress', async () => {
    await resetDb();
    const book = await createBook('运行中展开测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '继续检查第一章。' },
            {
                role: 'assistant',
                content: '',
                thoughts: [{ label: '思考块', text: '先读取正文。' }],
                toolCalls: [{
                    id: 'call-read-live',
                    name: EBOOK_TOOL_NAMES.READ,
                    arguments: '{"filePath":"book/chapters/001.md"}',
                }],
            },
            {
                role: 'tool',
                toolCallId: 'call-read-live',
                toolName: EBOOK_TOOL_NAMES.READ,
                content: '{"ok":true,"summary":"读取第一章。"}',
            },
        ],
        toolTrace: [{
            round: 1,
            ok: true,
            title: '读取第一章',
            name: EBOOK_TOOL_NAMES.READ,
            summary: '读取第一章。',
        }],
        openToolTurnKeys: [],
        activeTurnStartIndex: 0,
        openThoughtKeys: [],
        historySummary: '',
        isBusy: true,
        status: 'AI 正在处理工具结果（1/48）...',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(html, /<details class="xb-tool-trace xb-tool-turn" data-tool-turn-key="tool-turn:call-read-live" data-auto-open-tool-turn="true" open>/);
    assert.match(html, /xb-tool-turn-live/);
    assert.match(html, /正在创作 1 轮/);
    assert.doesNotMatch(html, /<details class="xb-tool-trace" open>/);
    assert.ok(
        html.indexOf('xb-agent-log') < html.indexOf('xb-tool-turn-live'),
        'live tool turn should render inside the chat log',
    );
    assert.match(html, /读取第一章/);
});

test('Book renderer folds the active tool turn after the final assistant message is delivered', async () => {
    await resetDb();
    const book = await createBook('交付后折叠测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '继续检查第一章。' },
            {
                role: 'assistant',
                content: '',
                toolCalls: [{
                    id: 'call-read-done',
                    name: EBOOK_TOOL_NAMES.READ,
                    arguments: '{"filePath":"book/chapters/001.md"}',
                }],
            },
            {
                role: 'tool',
                toolCallId: 'call-read-done',
                toolName: EBOOK_TOOL_NAMES.READ,
                content: '{"ok":true,"summary":"读取第一章。"}',
            },
            { role: 'assistant', content: '检查完成。' },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        activeTurnStartIndex: -1,
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        status: '就绪',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(html, /data-tool-turn-key="tool-turn:call-read-done"/);
    assert.doesNotMatch(html, /data-tool-turn-key="tool-turn:call-read-done"[^>]* open/);
    assert.doesNotMatch(html, /data-auto-open-tool-turn/);
});

test('Book renderer defers stored tool round details while keeping folded previews', async () => {
    await resetDb();
    const book = await createBook('折叠工具懒渲染测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '检查章节。' },
            {
                role: 'assistant',
                content: 'UNIQUE-LAZY-PREFACE',
                thoughts: [{ label: 'thinking', text: 'UNIQUE-LAZY-THOUGHT' }],
                toolCalls: [{
                    id: 'call-lazy-tool',
                    name: EBOOK_TOOL_NAMES.READ,
                    arguments: '{"filePath":"book/chapters/001.md"}',
                }],
            },
            {
                role: 'tool',
                toolCallId: 'call-lazy-tool',
                toolName: EBOOK_TOOL_NAMES.READ,
                content: '{"ok":true,"summary":"UNIQUE-LAZY-TOOL-DETAIL"}',
            },
            { role: 'assistant', content: '检查完成。' },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        activeTurnStartIndex: -1,
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        status: '就绪',
        toast: '',
    };

    const foldedHtml = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(foldedHtml, /data-lazy-tool-turn="true"/);
    assert.match(foldedHtml, /data-tool-detail-mode="preview"/);
    assert.match(foldedHtml, /展开查看思考、说明和完整工具轮次/);
    assert.match(foldedHtml, /UNIQUE-LAZY-TOOL-DETAIL/);
    assert.match(foldedHtml, /UNIQUE-LAZY-PREFACE/);
    assert.doesNotMatch(foldedHtml, /UNIQUE-LAZY-THOUGHT/);

    const storedMessagesBeforeToggle = JSON.stringify(state.messages);
    const providerMessagesBeforeToggle = JSON.stringify(buildEbookProviderMessagesFromHistory(state.messages));
    state.openToolTurnKeys = ['tool-turn:call-lazy-tool'];
    const openHtml = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.doesNotMatch(openHtml, /data-lazy-tool-turn="true"/);
    assert.match(openHtml, /data-tool-detail-mode="full"/);
    assert.match(openHtml, /UNIQUE-LAZY-TOOL-DETAIL/);
    assert.match(openHtml, /UNIQUE-LAZY-PREFACE/);
    assert.match(openHtml, /UNIQUE-LAZY-THOUGHT/);

    state.openToolTurnKeys = [];
    const closedAgainHtml = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(closedAgainHtml, /data-lazy-tool-turn="true"/);
    assert.match(closedAgainHtml, /data-tool-detail-mode="preview"/);
    assert.doesNotMatch(closedAgainHtml, /UNIQUE-LAZY-THOUGHT/);
    assert.equal(JSON.stringify(state.messages), storedMessagesBeforeToggle);
    assert.equal(JSON.stringify(buildEbookProviderMessagesFromHistory(state.messages)), providerMessagesBeforeToggle);
});

test('Book renderer keeps large folded tool previews lightweight until opened', async () => {
    await resetDb();
    const book = await createBook('大型工具折叠测试');
    const largePayload = `{"ok":true,"summary":"LARGE_TOOL_SUMMARY","content":"${'x'.repeat(30000)}UNIQUE_LARGE_TOOL_DETAIL"}`;
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '读取长文件。' },
            {
                role: 'assistant',
                content: '',
                toolCalls: [{
                    id: 'call-large-tool',
                    name: EBOOK_TOOL_NAMES.READ,
                    arguments: '{"filePath":"book/chapters/001.md"}',
                }],
            },
            {
                role: 'tool',
                toolCallId: 'call-large-tool',
                toolName: EBOOK_TOOL_NAMES.READ,
                content: largePayload,
            },
            { role: 'assistant', content: '读取完成。' },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        activeTurnStartIndex: -1,
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        status: '就绪',
        toast: '',
    };

    const foldedHtml = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(foldedHtml, /LARGE_TOOL_SUMMARY/);
    assert.doesNotMatch(foldedHtml, /UNIQUE_LARGE_TOOL_DETAIL/);

    state.openToolTurnKeys = ['tool-turn:call-large-tool'];
    const openHtml = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(openHtml, /第 1 轮 · 1 个工具/);
    assert.match(openHtml, /LARGE_TOOL_SUMMARY/);
    assert.doesNotMatch(openHtml, /data-lazy-tool-turn="true"/);
});

test('Book renderer shows plan update results as checklist items', async () => {
    await resetDb();
    const book = await createBook('计划工具显示测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '继续完成计划。' },
            {
                role: 'assistant',
                content: '',
                toolCalls: [{
                    id: 'call-plan-update',
                    name: EBOOK_TOOL_NAMES.PLAN_UPDATE,
                    arguments: '{"id":"plan-1","status":"completed"}',
                }],
            },
            {
                role: 'tool',
                toolCallId: 'call-plan-update',
                toolName: EBOOK_TOOL_NAMES.PLAN_UPDATE,
                content: JSON.stringify({
                    ok: true,
                    plan: {
                        id: 'plan-1',
                        title: '完成第一章细纲',
                        status: 'completed',
                        priority: 'high',
                        owner: 'assistant',
                        result: '已完成。',
                    },
                    blockers: [],
                }),
            },
            { role: 'assistant', content: '计划已更新。' },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        activeTurnStartIndex: -1,
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        status: '就绪',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(html, /xb-tool-plan-item/);
    assert.match(html, /完成第一章细纲/);
    assert.match(html, /状态：已完成/);
    assert.match(html, /✓/);
    assert.doesNotMatch(html, /完成第一章细纲\s*<em>plan-1<\/em>/);
    assert.doesNotMatch(html, /&quot;plan&quot;/);
});

test('Book renderer hides internal plan ids in visible plan checklist', async () => {
    await resetDb();
    const book = await createBook('计划 ID 隐藏测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '测试计划显示。' },
            {
                role: 'assistant',
                content: '',
                toolCalls: [{
                    id: 'call-plan-create',
                    name: EBOOK_TOOL_NAMES.PLAN_CREATE,
                    arguments: '{"title":"完成新书开书定位"}',
                }],
            },
            {
                role: 'tool',
                toolCallId: 'call-plan-create',
                toolName: EBOOK_TOOL_NAMES.PLAN_CREATE,
                content: JSON.stringify({
                    ok: true,
                    plan: {
                        id: 'plan-1779809298711-xr8w6z',
                        title: '完成新书开书定位',
                        status: 'pending',
                        priority: 'normal',
                        owner: 'assistant',
                        blockedBy: ['plan-hidden-a', 'plan-hidden-b'],
                    },
                    blockers: [],
                }),
            },
            { role: 'assistant', content: '计划已创建。' },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        activeTurnStartIndex: -1,
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        status: '就绪',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(html, /计划已创建：完成新书开书定位/);
    assert.match(html, /完成新书开书定位/);
    assert.match(html, /状态：待办，优先级：normal，依赖：2 项/);
    assert.doesNotMatch(html, /<em>plan-1779809298711-xr8w6z<\/em>/);
    assert.doesNotMatch(html, /依赖：plan-hidden-a/);
});

test('Book renderer falls back for malformed plan tool results', async () => {
    await resetDb();
    const book = await createBook('计划工具异常显示测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '更新计划。' },
            {
                role: 'assistant',
                content: '',
                toolCalls: [{
                    id: 'call-plan-malformed',
                    name: EBOOK_TOOL_NAMES.PLAN_UPDATE,
                    arguments: '{"id":"plan-1","status":"completed"}',
                }],
            },
            {
                role: 'tool',
                toolCallId: 'call-plan-malformed',
                toolName: EBOOK_TOOL_NAMES.PLAN_UPDATE,
                content: 'not-json-plan-result',
            },
            { role: 'assistant', content: '继续。' },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        activeTurnStartIndex: -1,
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        status: '就绪',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(html, /not-json-plan-result/);
    assert.doesNotMatch(html, /xb-tool-plan-item/);
    assert.doesNotMatch(html, /计划已更新：/);
});

test('Book tool turn auto-open does not persist as a manual fold state', () => {
    const state = {
        isBusy: true,
        openToolTurnKeys: [],
    };
    const details = {
        dataset: {
            toolTurnKey: 'tool-turn:call-read-live',
            autoOpenToolTurn: 'true',
        },
        open: true,
        matches(selector) {
            return selector.includes('.xb-tool-turn');
        },
    };
    const listeners = {};
    const root = {
        querySelectorAll(selector) {
            return selector === '.xb-tool-turn[data-tool-turn-key]' ? [details] : [];
        },
        querySelector() {
            return null;
        },
        addEventListener(eventName, handler) {
            listeners[eventName] = handler;
        },
    };

    bindEbookEvents({
        root,
        state,
        render() {},
        postToHost() {},
        bookController: {},
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    listeners.toggle({ target: details });

    assert.deepEqual(state.openToolTurnKeys, []);
});

test('Book lazy tool turns request rerender when opened or closed', () => {
    const state = {
        isBusy: false,
        openToolTurnKeys: [],
    };
    let renderCount = 0;
    const details = {
        dataset: {
            toolTurnKey: 'tool-turn:call-read-lazy',
            lazyToolTurn: 'true',
        },
        open: true,
        matches(selector) {
            return selector.includes('.xb-tool-turn');
        },
    };
    const listeners = {};
    const root = {
        querySelectorAll(selector) {
            return selector === '.xb-tool-turn[data-tool-turn-key]' ? [details] : [];
        },
        querySelector() {
            return null;
        },
        addEventListener(eventName, handler) {
            listeners[eventName] = handler;
        },
    };

    bindEbookEvents({
        root,
        state,
        render() {
            renderCount += 1;
        },
        postToHost() {},
        bookController: {},
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    listeners.toggle({ target: details });

    assert.deepEqual(state.openToolTurnKeys, ['tool-turn:call-read-lazy']);
    assert.equal(renderCount, 1);

    details.dataset.lazyToolTurn = '';
    details.open = false;
    listeners.toggle({ target: details });

    assert.deepEqual(state.openToolTurnKeys, []);
    assert.equal(renderCount, 2);
});

test('Book file and import actions use delegated clicks after local file rerenders', () => {
    const listeners = {};
    const selectedPaths = [];
    const importedKinds = [];
    const shell = {
        removedClasses: [],
        classList: {
            remove(value) {
                shell.removedClasses.push(value);
            },
        },
    };
    const fileButton = {
        dataset: { path: 'book/chapters/002.md' },
        disabled: false,
    };
    const importButton = {
        dataset: { import: 'summary' },
        disabled: false,
    };
    const root = {
        contains(node) {
            return node === fileButton || node === importButton;
        },
        querySelector(selector) {
            if (selector === '.xb-studio-shell') return shell;
            return null;
        },
        querySelectorAll() {
            return [];
        },
        addEventListener(eventName, handler) {
            listeners[eventName] = handler;
        },
    };

    bindEbookEvents({
        root,
        state: {},
        render() {},
        postToHost() {},
        bookController: {
            selectFile(path) {
                selectedPaths.push(path);
            },
            importMaterial(kind) {
                importedKinds.push(kind);
            },
        },
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    listeners.click({
        target: {
            closest(selector) {
                return selector === '.xb-file[data-path]' ? fileButton : null;
            },
        },
        preventDefault() {},
    });
    listeners.click({
        target: {
            closest(selector) {
                return selector === '[data-import]' ? importButton : null;
            },
        },
        preventDefault() {},
    });

    assert.deepEqual(selectedPaths, ['book/chapters/002.md']);
    assert.deepEqual(shell.removedClasses, ['is-file-drawer-open']);
    assert.deepEqual(importedKinds, ['summary']);
});

test('Book delegated root actions are not duplicated across full rerenders', () => {
    const listeners = {
        click: [],
        toggle: [],
    };
    const importedKinds = [];
    const importButton = {
        dataset: { import: 'summary' },
        disabled: false,
    };
    const root = {
        contains(node) {
            return node === importButton;
        },
        querySelector() {
            return null;
        },
        querySelectorAll() {
            return [];
        },
        addEventListener(eventName, handler) {
            listeners[eventName].push(handler);
        },
        removeEventListener(eventName, handler) {
            listeners[eventName] = listeners[eventName].filter((item) => item !== handler);
        },
    };
    const bindOptions = {
        root,
        state: {},
        render() {},
        postToHost() {},
        bookController: {
            importMaterial(kind) {
                importedKinds.push(kind);
            },
        },
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    };

    bindEbookEvents(bindOptions);
    bindEbookEvents(bindOptions);

    assert.equal(listeners.click.length, 1);
    assert.equal(listeners.toggle.length, 1);

    listeners.click[0]({
        target: {
            closest(selector) {
                return selector === '[data-import]' ? importButton : null;
            },
        },
        preventDefault() {},
    });

    assert.deepEqual(importedKinds, ['summary']);
});

test('Book reader image hydration ignores stale chapter figures', async () => {
    let replaceCount = 0;
    let imageRequests = 0;
    const staleFigure = {
        isConnected: false,
        dataset: { ebookImageSlot: 'slot-old' },
        classList: { add() {} },
        replaceChildren() {
            replaceCount += 1;
        },
    };
    const root = {
        contains() {
            return false;
        },
        querySelector() {
            return null;
        },
        querySelectorAll(selector) {
            return selector === '[data-ebook-image-slot]' ? [staleFigure] : [];
        },
        addEventListener() {},
        removeEventListener() {},
    };

    bindEbookEvents({
        root,
        state: {},
        render() {},
        postToHost() {},
        bookController: {
            async getDrawImage(slotId) {
                imageRequests += 1;
                return {
                    hasData: true,
                    url: `blob:${slotId}`,
                    tags: '测试',
                };
            },
        },
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.equal(imageRequests, 1);
    assert.equal(replaceCount, 0);
});

test('Book thought auto-open does not persist as a manual fold state', () => {
    const state = {
        isBusy: true,
        openThoughtKeys: [],
    };
    const details = {
        dataset: {
            thoughtKey: 'thought-message:live',
            autoOpenThought: 'true',
        },
        open: true,
        matches(selector) {
            return selector.includes('.xb-thought-details');
        },
    };
    const listeners = {};
    const root = {
        querySelectorAll(selector) {
            return selector === '.xb-thought-details[data-thought-key]' ? [details] : [];
        },
        querySelector() {
            return null;
        },
        addEventListener(eventName, handler) {
            listeners[eventName] = handler;
        },
    };

    bindEbookEvents({
        root,
        state,
        render() {},
        postToHost() {},
        bookController: {},
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    listeners.toggle({ target: details });

    assert.deepEqual(state.openThoughtKeys, []);
});

test('Book bind events wires both desktop and mobile agent close buttons', () => {
    const closeEvents = [];
    const desktopClose = {
        addEventListener(eventName, handler) {
            closeEvents.push({ target: 'desktop', eventName, handler });
        },
    };
    const mobileClose = {
        addEventListener(eventName, handler) {
            closeEvents.push({ target: 'mobile', eventName, handler });
        },
    };
    const root = {
        querySelector() {
            return null;
        },
        querySelectorAll(selector) {
            if (selector === '#xb-agent-close, #xb-agent-close-mobile') return [desktopClose, mobileClose];
            return [];
        },
    };
    const postedTypes = [];

    bindEbookEvents({
        root,
        state: {},
        render() {},
        postToHost(type) {
            postedTypes.push(type);
        },
        bookController: {},
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    assert.equal(closeEvents.length, 2);
    assert.deepEqual(closeEvents.map((item) => item.target), ['desktop', 'mobile']);

    closeEvents[0].handler();
    closeEvents[1].handler();

    assert.deepEqual(postedTypes, ['xb-ebook:close', 'xb-ebook:close']);
});

test('Book settings panel closes only from its close button', () => {
    const listeners = [];
    const state = { isSettingsOpen: true };
    const closeButton = {
        addEventListener(eventName, handler) {
            listeners.push({ target: 'close', eventName, handler });
        },
    };
    const overlay = {
        addEventListener(eventName, handler) {
            listeners.push({ target: 'overlay', eventName, handler });
        },
    };
    let renderCount = 0;
    const root = {
        querySelector(selector) {
            if (selector === '#xb-agent-settings-close') return closeButton;
            if (selector === '#xb-agent-settings-overlay') return overlay;
            return null;
        },
        querySelectorAll() {
            return [];
        },
    };

    bindEbookEvents({
        root,
        state,
        render() {
            renderCount += 1;
        },
        postToHost() {},
        bookController: {},
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    assert.deepEqual(listeners.map((item) => item.target), ['close']);

    listeners[0].handler();

    assert.equal(state.isSettingsOpen, false);
    assert.equal(renderCount, 1);
});

test('Book agent composer keeps Enter as newline on mobile and send on desktop', () => {
    const previousMatchMedia = globalThis.matchMedia;
    const previousBowser = globalThis.Bowser;
    const listeners = {};
    const input = {
        addEventListener(eventName, handler) {
            listeners[`input:${eventName}`] = handler;
        },
        value: '',
    };
    const hint = {
        textContent: '',
    };
    let submitCount = 0;
    const form = {
        addEventListener(eventName, handler) {
            listeners[`form:${eventName}`] = handler;
        },
        requestSubmit() {
            submitCount += 1;
        },
    };
    const root = {
        querySelector(selector) {
            if (selector === '#xb-agent-input') return input;
            if (selector === '#xb-agent-form') return form;
            if (selector === '#xb-compose-hint') return hint;
            return null;
        },
        querySelectorAll() {
            return [];
        },
    };

    try {
        globalThis.Bowser = undefined;
        globalThis.matchMedia = (query) => ({
            matches: String(query).includes('pointer: coarse') || String(query).includes('max-width: 900px'),
        });
        bindEbookEvents({
            root,
            state: { isBusy: false },
            render() {},
            postToHost() {},
            bookController: {},
            agentRunner: {
                cancelActiveRun() {},
                runAgent() {},
            },
            persistConversation() {},
            clearConversation() {},
            showToast() {},
        });

        let prevented = false;
        listeners['input:keydown']({
            key: 'Enter',
            isComposing: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault() {
                prevented = true;
            },
        });

        assert.equal(prevented, false);
        assert.equal(submitCount, 0);
        assert.equal(hint.textContent, 'Enter 换行 · 点击发送');

        globalThis.matchMedia = () => ({ matches: false });
        submitCount = 0;
        prevented = false;
        listeners['input:keydown']({
            key: 'Enter',
            isComposing: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault() {
                prevented = true;
            },
        });

        assert.equal(prevented, true);
        assert.equal(submitCount, 1);
    } finally {
        globalThis.matchMedia = previousMatchMedia;
        globalThis.Bowser = previousBowser;
    }
});

test('Book agent composer preserves draft through renderer and submit clears it', () => {
    const previousGetComputedStyle = globalThis.getComputedStyle;
    const state = {
        book: { id: 'book-compose-draft', title: '输入草稿测试' },
        books: [],
        files: [{ path: 'book/chapters/001.md', content: '# 第 1 章' }],
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'studio',
        editorContent: '# 第 1 章',
        savedContent: '# 第 1 章',
        messages: [],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        agentInputDraft: '先别丢这段草稿 <draft>',
        drawStatus: { enabled: false, ready: false },
        colorTheme: 'dark',
        toast: '',
    };
    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });

    assert.match(html, /先别丢这段草稿 &lt;draft&gt;/);

    const listeners = {};
    const input = {
        value: '流式过程中输入的新指令',
        scrollHeight: 96,
        style: {},
        addEventListener(eventName, handler) {
            listeners[`input:${eventName}`] = handler;
        },
    };
    const form = {
        addEventListener(eventName, handler) {
            listeners[`form:${eventName}`] = handler;
        },
    };
    let runText = '';
    const root = {
        querySelector(selector) {
            if (selector === '#xb-agent-input') return input;
            if (selector === '#xb-agent-form') return form;
            if (selector === '#xb-compose-hint') return { textContent: '' };
            return null;
        },
        querySelectorAll() {
            return [];
        },
    };

    try {
        globalThis.getComputedStyle = () => ({
            minHeight: '46px',
            maxHeight: '68px',
        });

        bindEbookEvents({
            root,
            state,
            render() {},
            postToHost() {},
            bookController: {},
            agentRunner: {
                cancelActiveRun() {},
                runAgent(text) {
                    runText = text;
                },
            },
            persistConversation() {},
            clearConversation() {},
            showToast() {},
        });

        listeners['input:input']();
        assert.equal(state.agentInputDraft, '流式过程中输入的新指令');
        assert.equal(input.style.height, '68px');
        assert.equal(input.style.overflowY, 'auto');

        input.scrollHeight = 46;
        listeners['form:submit']({ preventDefault() {} });
        assert.match(runText, /流式过程中输入的新指令/);
        assert.equal(state.agentInputDraft, '');
        assert.equal(input.value, '');
        assert.equal(input.style.height, '46px');
        assert.equal(input.style.overflowY, 'hidden');
    } finally {
        globalThis.getComputedStyle = previousGetComputedStyle;
    }
});

test('Book agent chat scroll toggles auto-scroll like assistant', () => {
    const listeners = {};
    const makeClassList = () => ({
        values: new Set(),
        add(name) {
            this.values.add(name);
        },
        remove(name) {
            this.values.delete(name);
        },
        toggle(name, force) {
            if (force) this.values.add(name);
            else this.values.delete(name);
        },
    });
    const agentMain = {
        scrollTop: 680,
        scrollHeight: 1000,
        clientHeight: 300,
        addEventListener(eventName, handler) {
            listeners[`main:${eventName}`] = handler;
        },
        scrollTo({ top }) {
            this.scrollTop = top;
        },
    };
    const topButton = {
        classList: makeClassList(),
        addEventListener(eventName, handler) {
            listeners[`top:${eventName}`] = handler;
        },
    };
    const bottomButton = {
        classList: makeClassList(),
        addEventListener(eventName, handler) {
            listeners[`bottom:${eventName}`] = handler;
        },
    };
    const helpers = {
        classList: makeClassList(),
    };
    const state = { agentAutoScroll: true };
    const root = {
        querySelector(selector) {
            if (selector === '.xb-agent-main') return agentMain;
            if (selector === '#xb-agent-scroll-top') return topButton;
            if (selector === '#xb-agent-scroll-bottom') return bottomButton;
            if (selector === '#xb-agent-scroll-helpers') return helpers;
            return null;
        },
        querySelectorAll() {
            return [];
        },
    };

    bindEbookEvents({
        root,
        state,
        render() {},
        postToHost() {},
        bookController: {},
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    listeners['main:scroll']();
    assert.equal(state.agentAutoScroll, true);

    agentMain.scrollTop = 120;
    listeners['main:scroll']();
    assert.equal(state.agentAutoScroll, false);

    listeners['top:click']();
    assert.equal(state.agentAutoScroll, false);
    assert.equal(agentMain.scrollTop, 0);

    listeners['bottom:click']();
    assert.equal(state.agentAutoScroll, true);
    assert.equal(agentMain.scrollTop, agentMain.scrollHeight);
});

test('Book agent chat disables streaming auto-scroll on manual upward intent', () => {
    const listeners = {};
    const agentMain = {
        scrollTop: 680,
        scrollHeight: 1000,
        clientHeight: 300,
        addEventListener(eventName, handler) {
            listeners[`main:${eventName}`] = handler;
        },
    };
    const inertButton = {
        classList: { toggle() {} },
        addEventListener() {},
    };
    const state = { agentAutoScroll: true };
    const root = {
        querySelector(selector) {
            if (selector === '.xb-agent-main') return agentMain;
            if (selector === '#xb-agent-scroll-top') return inertButton;
            if (selector === '#xb-agent-scroll-bottom') return inertButton;
            if (selector === '#xb-agent-scroll-helpers') return { classList: { add() {}, remove() {} } };
            return null;
        },
        querySelectorAll() {
            return [];
        },
    };

    bindEbookEvents({
        root,
        state,
        render() {},
        postToHost() {},
        bookController: {},
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    listeners['main:wheel']({ deltaY: -24 });
    assert.equal(state.agentAutoScroll, false);

    agentMain.scrollTop = 656;
    listeners['main:scroll']();
    assert.equal(state.agentAutoScroll, false);

    agentMain.scrollTop = 700;
    listeners['main:scroll']();
    assert.equal(state.agentAutoScroll, true);

    state.agentAutoScroll = true;
    listeners['main:wheel']({ deltaY: 24 });
    assert.equal(state.agentAutoScroll, true);

    listeners['main:touchstart']({ touches: [{ clientY: 120 }] });
    listeners['main:touchmove']({ touches: [{ clientY: 136 }] });
    assert.equal(state.agentAutoScroll, false);
});

test('Book agent chat loads older mounted history when scrolled to the top', () => {
    const listeners = {};
    const agentMain = {
        scrollTop: 0,
        scrollHeight: 1000,
        clientHeight: 300,
        addEventListener(eventName, handler) {
            listeners[`main:${eventName}`] = handler;
        },
    };
    const inertButton = {
        classList: { toggle() {} },
        addEventListener() {},
    };
    const state = {
        agentAutoScroll: true,
        uiMessageWindowLimit: 5,
        messages: Array.from({ length: 9 }, (_, index) => ({
            role: index % 2 === 0 ? 'user' : 'assistant',
            content: `消息_${index}`,
        })),
    };
    let renderCount = 0;
    const root = {
        querySelector(selector) {
            if (selector === '.xb-agent-main') return agentMain;
            if (selector === '#xb-agent-scroll-top') return inertButton;
            if (selector === '#xb-agent-scroll-bottom') return inertButton;
            if (selector === '#xb-agent-scroll-helpers') return { classList: { add() {}, remove() {} } };
            return null;
        },
        querySelectorAll() {
            return [];
        },
    };

    bindEbookEvents({
        root,
        state,
        render() {
            renderCount += 1;
            agentMain.scrollHeight = 1800;
        },
        postToHost() {},
        bookController: {},
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    listeners['main:scroll']();

    assert.equal(state.uiMessageWindowLimit, 9);
    assert.equal(state.agentAutoScroll, false);
    assert.equal(renderCount, 1);
    assert.equal(agentMain.scrollTop, 800);
});

test('Book agent message window keeps the mounted start stable while reading history', () => {
    const state = {
        agentAutoScroll: true,
        uiMessageWindowLimit: 5,
        messages: Array.from({ length: 10 }, (_, index) => ({
            role: index % 2 === 0 ? 'user' : 'assistant',
            content: `消息_${index}`,
        })),
    };

    let units = collectAgentRenderUnits(state);
    assert.equal(units[0].key, 'history-gate:5');
    assert.equal(state.uiMessageWindowLimit, 5);
    assert.equal(state.uiMessageWindowTotal, 10);

    state.agentAutoScroll = false;
    state.messages.push(
        { role: 'user', content: '下方新增请求。' },
        { role: 'assistant', content: '下方新增回复。' },
    );

    units = collectAgentRenderUnits(state);
    assert.equal(units[0].key, 'history-gate:5');
    assert.equal(state.uiMessageWindowLimit, 7);
    assert.equal(state.uiMessageWindowTotal, 12);
});

test('Book agent message window follows the bottom only during auto-scroll', () => {
    const state = {
        agentAutoScroll: true,
        uiMessageWindowLimit: 5,
        messages: Array.from({ length: 10 }, (_, index) => ({
            role: index % 2 === 0 ? 'user' : 'assistant',
            content: `消息_${index}`,
        })),
    };

    let units = collectAgentRenderUnits(state);
    assert.equal(units[0].key, 'history-gate:5');

    state.messages.push(
        { role: 'user', content: '下方新增请求。' },
        { role: 'assistant', content: '下方新增回复。' },
    );

    units = collectAgentRenderUnits(state);
    assert.equal(units[0].key, 'history-gate:7');
    assert.equal(state.uiMessageWindowLimit, 5);
    assert.equal(state.uiMessageWindowTotal, 12);
});

test('Book agent chat collapses expanded mounted history after returning to bottom', () => {
    const listeners = {};
    const agentMain = {
        scrollTop: 1500,
        scrollHeight: 1800,
        clientHeight: 300,
        addEventListener(eventName, handler) {
            listeners[`main:${eventName}`] = handler;
        },
        scrollTo({ top }) {
            this.scrollTop = top;
        },
    };
    const inertButton = {
        classList: { toggle() {} },
        addEventListener() {},
    };
    const bottomButton = {
        classList: { toggle() {} },
        addEventListener(eventName, handler) {
            listeners[`bottom:${eventName}`] = handler;
        },
    };
    const state = {
        agentAutoScroll: false,
        uiMessageWindowLimit: 25,
        uiMessageWindowTotal: 25,
        messages: Array.from({ length: 25 }, (_, index) => ({
            role: index % 2 === 0 ? 'user' : 'assistant',
            content: `消息_${index}`,
        })),
    };
    let renderCount = 0;
    const root = {
        querySelector(selector) {
            if (selector === '.xb-agent-main') return agentMain;
            if (selector === '#xb-agent-scroll-top') return inertButton;
            if (selector === '#xb-agent-scroll-bottom') return bottomButton;
            if (selector === '#xb-agent-scroll-helpers') return { classList: { add() {}, remove() {} } };
            return null;
        },
        querySelectorAll() {
            return [];
        },
    };

    bindEbookEvents({
        root,
        state,
        render() {
            renderCount += 1;
            agentMain.scrollHeight = 900;
        },
        postToHost() {},
        bookController: {},
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    listeners['bottom:click']();

    assert.equal(state.agentAutoScroll, true);
    assert.equal(state.uiMessageWindowLimit, 5);
    assert.equal(state.uiMessageWindowTotal, undefined);
    assert.equal(renderCount, 1);
    assert.equal(agentMain.scrollTop, 900);
});

test('Book app preserves manual agent scroll even when previous position was near bottom', () => {
    const agentMain = {
        scrollTop: 680,
        scrollHeight: 1000,
        clientHeight: 300,
    };
    const root = {
        querySelector(selector) {
            return selector === '.xb-agent-main' ? agentMain : null;
        },
    };
    const snapshot = captureScrollState(root, '.xb-agent-main');
    assert.equal(snapshot.nearBottom, true);

    agentMain.scrollTop = 0;
    agentMain.scrollHeight = 1200;
    restoreScrollState(root, snapshot, '.xb-agent-main', {
        defaultToBottom: false,
        preserveScrollTop: true,
    });
    assert.equal(agentMain.scrollTop, 680);

    restoreScrollState(root, snapshot, '.xb-agent-main', {
        forceBottom: true,
    });
    assert.equal(agentMain.scrollTop, 1200);
});

test('Book app anchors manual agent scroll across lower render changes', () => {
    let anchorDocumentTop = 560;
    const anchor = {
        dataset: { agentUnitKey: 'message:3' },
        getBoundingClientRect() {
            return {
                top: anchorDocumentTop - agentMain.scrollTop,
                bottom: anchorDocumentTop - agentMain.scrollTop + 80,
            };
        },
    };
    const agentMain = {
        scrollTop: 500,
        scrollHeight: 2000,
        clientHeight: 400,
        getBoundingClientRect() {
            return { top: 0, bottom: 400 };
        },
        querySelectorAll(selector) {
            return selector === '[data-agent-unit-key]' ? [anchor] : [];
        },
    };
    const root = {
        querySelector(selector) {
            return selector === '.xb-agent-main' ? agentMain : null;
        },
    };
    const snapshot = captureScrollState(root, '.xb-agent-main');
    assert.equal(snapshot.anchorKey, 'message:3');
    assert.equal(snapshot.anchorTopOffset, 60);

    anchorDocumentTop = 680;
    agentMain.scrollTop = 0;
    restoreScrollState(root, snapshot, '.xb-agent-main', {
        defaultToBottom: false,
        preserveScrollTop: true,
    });
    assert.equal(agentMain.scrollTop, 620);
});

test('Book app can preserve manual agent scroll without re-anchoring lower streaming changes', () => {
    let anchorDocumentTop = 560;
    const anchor = {
        dataset: { agentUnitKey: 'message:3' },
        getBoundingClientRect() {
            return {
                top: anchorDocumentTop - agentMain.scrollTop,
                bottom: anchorDocumentTop - agentMain.scrollTop + 80,
            };
        },
    };
    const agentMain = {
        scrollTop: 500,
        scrollHeight: 2000,
        clientHeight: 400,
        getBoundingClientRect() {
            return { top: 0, bottom: 400 };
        },
        querySelectorAll(selector) {
            return selector === '[data-agent-unit-key]' ? [anchor] : [];
        },
    };
    const root = {
        querySelector(selector) {
            return selector === '.xb-agent-main' ? agentMain : null;
        },
    };
    const snapshot = captureScrollState(root, '.xb-agent-main');

    anchorDocumentTop = 680;
    agentMain.scrollTop = 500;
    restoreScrollState(root, snapshot, '.xb-agent-main', {
        defaultToBottom: false,
        preserveScrollTop: true,
        preserveAnchor: false,
    });

    assert.equal(agentMain.scrollTop, 500);
});

test('Book app uses stable message anchors instead of the history gate', () => {
    const historyGate = {
        dataset: { agentUnitKey: 'history-gate:12' },
        getBoundingClientRect() {
            return { top: 0, bottom: 24 };
        },
    };
    const messageAnchor = {
        dataset: { agentUnitKey: 'message:7' },
        getBoundingClientRect() {
            return { top: 28, bottom: 128 };
        },
    };
    const agentMain = {
        scrollTop: 0,
        scrollHeight: 1400,
        clientHeight: 420,
        getBoundingClientRect() {
            return { top: 0, bottom: 420 };
        },
        querySelectorAll(selector) {
            return selector === '[data-agent-unit-key]' ? [historyGate, messageAnchor] : [];
        },
    };
    const root = {
        querySelector(selector) {
            return selector === '.xb-agent-main' ? agentMain : null;
        },
    };

    const snapshot = captureScrollState(root, '.xb-agent-main');

    assert.equal(snapshot.anchorKey, 'message:7');
    assert.equal(snapshot.anchorTopOffset, 28);
    assert.deepEqual(snapshot.anchors.map((anchor) => anchor.key), ['message:7', 'history-gate:12']);
});

test('Book app restores manual agent scroll by the next visible anchor when the top anchor disappears', () => {
    let messageThreeDocumentTop = 500;
    let messageFourDocumentTop = 620;
    const messageThree = {
        dataset: { agentUnitKey: 'message:3' },
        getBoundingClientRect() {
            return {
                top: messageThreeDocumentTop - agentMain.scrollTop,
                bottom: messageThreeDocumentTop - agentMain.scrollTop + 80,
            };
        },
    };
    const messageFour = {
        dataset: { agentUnitKey: 'message:4' },
        getBoundingClientRect() {
            return {
                top: messageFourDocumentTop - agentMain.scrollTop,
                bottom: messageFourDocumentTop - agentMain.scrollTop + 90,
            };
        },
    };
    let anchors = [messageThree, messageFour];
    const agentMain = {
        scrollTop: 500,
        scrollHeight: 2000,
        clientHeight: 400,
        getBoundingClientRect() {
            return { top: 0, bottom: 400 };
        },
        querySelectorAll(selector) {
            return selector === '[data-agent-unit-key]' ? anchors : [];
        },
    };
    const root = {
        querySelector(selector) {
            return selector === '.xb-agent-main' ? agentMain : null;
        },
    };

    const snapshot = captureScrollState(root, '.xb-agent-main');

    assert.equal(snapshot.anchorKey, 'message:3');
    assert.deepEqual(snapshot.anchors.map((anchor) => anchor.key), ['message:3', 'message:4']);
    assert.equal(snapshot.anchors[1].topOffset, 120);

    anchors = [messageFour];
    messageFourDocumentTop = 500;
    agentMain.scrollTop = 0;
    restoreScrollState(root, snapshot, '.xb-agent-main', {
        defaultToBottom: false,
        preserveScrollTop: true,
    });

    assert.equal(agentMain.scrollTop, 380);
});

test('Book agent partial render keeps anchor restoration enabled for detached markdown reflow', () => {
    const appSource = readFileSync(new URL('../app-src/ebook-app.js', import.meta.url), 'utf8');
    const renderAgentStart = appSource.indexOf('function renderAgentSurface()');
    const renderToolStart = appSource.indexOf('function renderToolTraceSurface()', renderAgentStart);
    const renderAgentSource = appSource.slice(renderAgentStart, renderToolStart);

    assert.match(renderAgentSource, /restoreScrollState\(root, agentScroll, '\.xb-agent-main'/);
    assert.doesNotMatch(renderAgentSource, /preserveAnchor:\s*false/);
});

test('Book app does not force bottom when auto-scroll state is stale but the viewport is not near bottom', () => {
    assert.equal(
        shouldForceAgentScrollToBottom(
            { agentAutoScroll: true, agentForceScrollBottomOnce: false },
            { nearBottom: false },
        ),
        false,
    );
    assert.equal(
        shouldForceAgentScrollToBottom(
            { agentAutoScroll: true, agentForceScrollBottomOnce: true },
            { nearBottom: false },
        ),
        true,
    );
    assert.equal(
        shouldForceAgentScrollToBottom(
            { agentAutoScroll: true, agentForceScrollBottomOnce: false },
            { nearBottom: true },
        ),
        true,
    );
    assert.equal(
        shouldForceAgentScrollToBottom(
            { agentAutoScroll: false, agentForceScrollBottomOnce: false },
            { nearBottom: true },
        ),
        false,
    );
});

test('Book app anchors reader scroll across unrelated renders', () => {
    let anchorDocumentTop = 740;
    const anchor = {
        dataset: { readerBlockKey: 'reader-block:12' },
        getBoundingClientRect() {
            return {
                top: anchorDocumentTop - readerPaper.scrollTop,
                bottom: anchorDocumentTop - readerPaper.scrollTop + 120,
            };
        },
    };
    const readerPaper = {
        scrollTop: 660,
        scrollHeight: 3600,
        clientHeight: 620,
        getBoundingClientRect() {
            return { top: 0, bottom: 620 };
        },
        querySelectorAll(selector) {
            return selector === '[data-reader-block-key]' ? [anchor] : [];
        },
    };
    const root = {
        querySelector(selector) {
            return selector === '.xb-reader-paper' ? readerPaper : null;
        },
    };
    const snapshot = captureScrollState(root, '.xb-reader-paper');
    assert.equal(snapshot.anchorKey, 'reader-block:12');
    assert.equal(snapshot.anchorTopOffset, 80);

    anchorDocumentTop = 910;
    readerPaper.scrollTop = 0;
    restoreScrollState(root, snapshot, '.xb-reader-paper', {
        defaultToBottom: false,
        preserveScrollTop: true,
    });
    assert.equal(readerPaper.scrollTop, 830);
});

test('Book app resets reader scroll only when switching to a different chapter', () => {
    assert.equal(
        shouldResetReaderScrollOnRender('book/chapters/001.md', 'reader', 'book/chapters/002.md'),
        true,
    );
    assert.equal(
        shouldResetReaderScrollOnRender('book/chapters/001.md', 'reader', 'book/chapters/001.md'),
        false,
    );
    assert.equal(
        shouldResetReaderScrollOnRender('book/chapters/001.md', 'studio', 'book/chapters/002.md'),
        false,
    );
    assert.equal(
        shouldResetReaderScrollOnRender('book/chapters/001.md', 'reader', 'book/state.md'),
        false,
    );
});

test('Book renderer includes scroll anchor keys in full agent message markup', () => {
    const html = renderAgentMessages({
        messages: [
            { role: 'user', content: '上面的消息' },
            { role: 'assistant', content: '下面的消息' },
        ],
    });

    assert.match(html, /data-agent-unit-key="message:0"/);
    assert.match(html, /data-agent-unit-key="message:1"/);
});

test('Book renderer includes reader scroll anchor keys in chapter prose', () => {
    const state = {
        book: { id: 'book-reader-anchor', title: '阅读锚点测试' },
        books: [],
        files: [{
            path: 'book/chapters/001.md',
            content: '第一段。\n\n第二段。',
        }],
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'reader',
        messages: [],
        toolTrace: [],
        isBusy: false,
        colorTheme: 'dark',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });

    assert.match(html, /data-reader-block-key="reader-block:0"/);
    assert.match(html, /data-reader-block-key="reader-block:1"/);
});

test('Book renderer keeps streaming assistant thoughts expanded before final delivery', async () => {
    await resetDb();
    const book = await createBook('流式思考展开测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '继续。' },
            {
                role: 'assistant',
                content: '正在整理结论...',
                thoughts: [{ label: '思考块', text: '先判断这一段怎么收。' }],
                streaming: true,
            },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        activeTurnStartIndex: 0,
        openThoughtKeys: [],
        historySummary: '',
        isBusy: true,
        status: 'AI 正在思考...',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(html, /<details class="xb-thought-details" data-thought-key="thought-message:1" data-auto-open-thought="true" open>/);
});

test('Book renderer keeps recent conversation mounted before compaction without dropping history', async () => {
    await resetDb();
    const book = await createBook('聊天显示窗口测试');
    const messages = Array.from({ length: 10 }, (_, index) => ({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: `第 ${index + 1} 条创作对话`,
    }));
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages,
        toolTrace: [],
        openToolTurnKeys: [],
        historySummary: '',
        isBusy: false,
        status: '就绪',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(html, /较早记录 5 条/);
    assert.doesNotMatch(html, /第 1 条创作对话/);
    assert.match(html, /第 6 条创作对话/);
    assert.match(html, /第 10 条创作对话/);
    assert.equal(state.messages.length, 10);
});

test('Book agent render units keep stable messages reusable while streaming changes', () => {
    const state = {
        messages: [
            { role: 'user', content: '写第一章。' },
            { role: 'assistant', content: '正在写第一段。', streaming: true },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        isBusy: true,
    };

    const firstUnits = collectAgentRenderUnits(state);
    state.messages[1] = {
        ...state.messages[1],
        content: '正在写第一段。第二句出来了。',
    };
    const nextUnits = collectAgentRenderUnits(state);

    assert.equal(firstUnits.length, 2);
    assert.equal(nextUnits.length, 2);
    assert.equal(firstUnits[0].signature, nextUnits[0].signature);
    assert.notEqual(firstUnits[1].signature, nextUnits[1].signature);
    assert.match(nextUnits[1].html, /第二句出来了/);
});

test('Book renderer keeps assistant actions on error bubbles so failed turns can reroll', async () => {
    await resetDb();
    const book = await createBook('失败气泡操作测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/outline.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            {
                role: 'user',
                content: '继续写第一章',
            },
            {
                role: 'assistant',
                content: 'AI 操作失败：Connection error.',
                error: true,
            },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        status: '就绪',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });

    assert.match(html, /AI 操作失败：Connection error\./);
    assert.match(html, /data-message-action="copy" data-message-index="1"/);
    assert.match(html, /data-message-action="edit" data-message-index="1"/);
    assert.match(html, /data-message-action="reroll" data-message-index="1"/);
    assert.match(html, /data-message-action="delete" data-message-index="1"/);
});

test('Book message actions handle error bubbles instead of dropping the click', async () => {
    const state = {
        book: { id: 'book-error-action' },
        isBusy: false,
        messages: [
            { role: 'user', content: '继续写第一章' },
            {
                role: 'assistant',
                content: 'AI 操作失败：Connection error.',
                error: true,
            },
        ],
    };
    const button = {
        dataset: {
            messageAction: 'reroll',
            messageIndex: '1',
        },
        closest(selector) {
            return selector === '[data-message-action][data-message-index]' ? this : null;
        },
    };
    const listeners = {};
    const root = {
        querySelectorAll(selector) {
            return selector === '[data-message-action][data-message-index]' ? [button] : [];
        },
        querySelector() {
            return null;
        },
        addEventListener(eventName, handler) {
            listeners[eventName] = handler;
        },
    };
    let rerunIndex = -1;

    bindEbookEvents({
        root,
        state,
        render() {},
        postToHost() {},
        bookController: {},
        agentRunner: {
            async rerunFromMessageIndex(messageIndex) {
                rerunIndex = messageIndex;
                return { ok: true };
            },
            cancelActiveRun() {},
            runAgent() {},
        },
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    listeners.click({
        target: button,
        preventDefault() {},
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.equal(rerunIndex, 1);
});

test('Book message actions allow rerunning from a user message', async () => {
    const state = {
        book: { id: 'book-user-action' },
        isBusy: false,
        messages: [
            { role: 'user', content: '继续写第一章' },
            { role: 'assistant', content: '旧回复。' },
        ],
    };
    const button = {
        dataset: {
            messageAction: 'reroll',
            messageIndex: '0',
        },
        closest(selector) {
            return selector === '[data-message-action][data-message-index]' ? this : null;
        },
    };
    const listeners = {};
    const root = {
        querySelectorAll(selector) {
            return selector === '[data-message-action][data-message-index]' ? [button] : [];
        },
        querySelector() {
            return null;
        },
        addEventListener(eventName, handler) {
            listeners[eventName] = handler;
        },
    };
    let rerunIndex = -1;

    bindEbookEvents({
        root,
        state,
        render() {},
        postToHost() {},
        bookController: {},
        agentRunner: {
            async rerunFromMessageIndex(messageIndex) {
                rerunIndex = messageIndex;
                return { ok: true };
            },
            cancelActiveRun() {},
            runAgent() {},
        },
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    listeners.click({
        target: button,
        preventDefault() {},
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.equal(rerunIndex, 0);
});

test('Book message actions delete a user turn with its following assistant work', async () => {
    const state = {
        book: { id: 'book-user-delete' },
        isBusy: false,
        messages: [
            { role: 'user', content: '第一轮用户' },
            { role: 'assistant', content: '第一轮工具前言', toolCalls: [{ id: 'call-read', name: EBOOK_TOOL_NAMES.READ, arguments: '{}' }] },
            { role: 'tool', toolCallId: 'call-read', toolName: EBOOK_TOOL_NAMES.READ, content: '{"ok":true}' },
            { role: 'assistant', content: '第一轮回复。' },
            { role: 'user', content: '第二轮用户' },
            { role: 'assistant', content: '第二轮回复。' },
        ],
    };
    const button = {
        dataset: {
            messageAction: 'delete',
            messageIndex: '0',
        },
        closest(selector) {
            return selector === '[data-message-action][data-message-index]' ? this : null;
        },
    };
    const listeners = {};
    const root = {
        querySelectorAll(selector) {
            return selector === '[data-message-action][data-message-index]' ? [button] : [];
        },
        querySelector() {
            return null;
        },
        addEventListener(eventName, handler) {
            listeners[eventName] = handler;
        },
    };
    let persisted = false;

    bindEbookEvents({
        root,
        state,
        render() {},
        postToHost() {},
        bookController: {},
        agentRunner: {
            async rerunFromMessageIndex() {
                return { ok: true };
            },
            cancelActiveRun() {},
            runAgent() {},
        },
        persistConversation() {
            persisted = true;
        },
        clearConversation() {},
        showToast() {},
    });

    listeners.click({
        target: button,
        preventDefault() {},
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.equal(persisted, true);
    assert.deepEqual(state.messages.map((message) => message.content), ['第二轮用户', '第二轮回复。']);
});

test('Book renderer uses a compact agent toolbar with shared config actions', async () => {
    await resetDb();
    const book = await createBook('顶部工具条测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '请继续写第一章。' },
            { role: 'assistant', content: '我先检查一下大纲和章节内容。' },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '已整理较早创作记录。',
        isBusy: false,
        status: '就绪',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });

    assert.match(html, /class="xb-agent-context-meter" title="当前估算送模上下文 \/ 188k"/);
    assert.match(html, /id="xb-agent-clear"/);
    assert.match(html, /id="xb-agent-open-settings"/);
    assert.match(html, /id="xb-agent-close"/);
    assert.match(html, /class="xb-agent-head-main"/);
    assert.match(html, /class="xb-agent-global-actions"/);
    assert.match(html, /data-entry-link title="返回书本入口"/);
    assert.match(html, /id="xb-agent-close"[^>]*aria-label="退出电纸书"/);
    assert.match(html, /class="xb-exit-icon"/);
    const globalActionsHtml = html.match(/<div class="xb-agent-global-actions">([\s\S]*?)<\/div>/)?.[1] || '';
    assert(
        globalActionsHtml.indexOf('id="xb-theme-toggle"') < globalActionsHtml.indexOf('data-entry-link'),
        'entry button should sit after the theme toggle in the agent global actions',
    );
    assert(
        globalActionsHtml.indexOf('data-entry-link') < globalActionsHtml.indexOf('id="xb-agent-close"'),
        'entry button should sit before exit in the agent global actions',
    );
    assert.match(html, /\/188k/);
    assert.doesNotMatch(html, /模型：/);
    assert.doesNotMatch(html, /创作对话：约/);
});

test('Book context meter ignores resolved token stats when conversation state changes', async () => {
    await resetDb();
    const book = await createBook('计数缓存签名测试');
    const providerConfig = { provider: 'anthropic', model: 'claude-sonnet-4' };
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [{ role: 'user', content: '继续写第一章。' }],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        status: '就绪',
        toast: '',
    };
    state.contextStats = {
        usedTokens: 777000,
        budgetTokens: EBOOK_MAX_CONTEXT_TOKENS,
        source: 'resolved',
        stateKey: buildConversationContextMeterStateKey(state, providerConfig),
        updatedAt: Date.now(),
    };

    assert.equal(renderConversationContextMeterLabel(state, providerConfig), '777k/188k');
    assert.equal(renderConversationContextMeterTitle(state, providerConfig), '最近一次发模上下文 / 188k');

    state.selectedPath = 'book/chapters/002.md';
    assert.equal(renderConversationContextMeterLabel(state, providerConfig), '777k/188k');

    state.messages.push({ role: 'assistant', content: '新增回复让缓存失效。' });

    assert.notEqual(renderConversationContextMeterLabel(state, providerConfig), '777k/188k');
    assert.equal(renderConversationContextMeterTitle(state, providerConfig), '当前估算送模上下文 / 188k');
});

test('Book context meter keeps last resolved request count while agent is busy', async () => {
    await resetDb();
    const book = await createBook('计数运行中稳定测试');
    const providerConfig = { provider: 'anthropic', model: 'claude-sonnet-4' };
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        messages: [{ role: 'user', content: '继续写第一章。' }],
        isBusy: true,
        status: 'AI 正在思考...',
        toast: '',
    };
    state.contextStats = {
        usedTokens: 150000,
        budgetTokens: EBOOK_MAX_CONTEXT_TOKENS,
        source: 'resolved',
        stateKey: buildConversationContextMeterStateKey(state, providerConfig),
        updatedAt: Date.now(),
    };
    state.messages.push({ role: 'assistant', content: '流式回复正在变化。', streaming: true });

    assert.equal(renderConversationContextMeterLabel(state, providerConfig), '150k/188k');
    assert.equal(renderConversationContextMeterTitle(state, providerConfig), '最近一次发模上下文 / 188k');

    state.isBusy = false;
    assert.notEqual(renderConversationContextMeterLabel(state, providerConfig), '150k/188k');
});

test('Book renderer shows context distillation overlay during history compaction', async () => {
    await resetDb();
    const book = await createBook('压缩动画测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        compactionOverlay: {
            active: true,
            resolved: true,
            currentTokens: 158000,
            yieldTokens: 9000,
            status: '已只保留最近 2 轮创作上下文。',
        },
        isBusy: true,
        status: '正在释放较早对话...',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });

    assert.match(html, /xb-distillation-layer resolved/);
    assert.match(html, /CONTEXT DISTILLATION/);
    assert.match(html, /已只保留最近 2 轮创作上下文。/);
    assert.match(html, />158k<\/strong>/);
    assert.match(html, />9k<\/strong>/);
    const chatWrapStart = html.indexOf('class="xb-agent-chat-wrap"');
    const overlayIndex = html.indexOf('class="xb-distillation-layer resolved"');
    const formIndex = html.indexOf('id="xb-agent-form"');
    assert(chatWrapStart >= 0, 'agent chat wrap should render');
    assert(overlayIndex > chatWrapStart, 'distillation overlay should be inside the agent chat area');
    assert(formIndex > overlayIndex, 'distillation overlay should not cover the compose form or other studio regions');
});

test('Book renderer shows transient protocol notice inside agent chat area', async () => {
    await resetDb();
    const book = await createBook('协议提示测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        compactionOverlay: null,
        protocolNotice: {
            message: '工具协议异常，正在切换兼容模式重试…',
        },
        isBusy: true,
        status: 'AI 正在思考...',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });

    assert.match(html, /class="xb-protocol-notice"/);
    assert.match(html, /工具协议异常，正在切换兼容模式重试/);
    const chatWrapStart = html.indexOf('class="xb-agent-chat-wrap"');
    const noticeIndex = html.indexOf('class="xb-protocol-notice"');
    const formIndex = html.indexOf('id="xb-agent-form"');
    assert(chatWrapStart >= 0, 'agent chat wrap should render');
    assert(noticeIndex > chatWrapStart, 'protocol notice should render inside the agent chat area');
    assert(formIndex > noticeIndex, 'protocol notice should not cover the compose form or other studio regions');
});

test('Ebook settings open as an in-app shared config panel instead of jumping to assistant window', async () => {
    await resetDb();
    const book = await createBook('配置面板测试');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        isSettingsOpen: true,
        config: {
            currentPresetName: '默认',
            presetNames: ['默认'],
        },
        configSave: {
            status: 'idle',
            requestId: '',
            error: '',
        },
        status: '就绪',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'openai-compatible', model: '' },
        dirty: false,
    });

    assert.match(html, /id="xb-agent-settings-overlay"/);
    assert.match(html, /id="xb-agent-settings-title">API配置<\/h2>/);
    assert.match(html, /主助手 API/);
    assert.match(html, /分身 API/);
    assert.match(html, /id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"/);
    assert.match(html, /id="xb-assistant-new-preset"/);
    assert.match(html, /id="xb-assistant-rename-preset"/);
    assert.match(html, /id="xb-assistant-save"[\s\S]*<svg/);
    assert.match(html, /id="xb-assistant-delete-preset"[\s\S]*<svg/);
    assert.match(html, /id="xb-assistant-delegate-save"[\s\S]*<svg/);
    assert.doesNotMatch(html, /<span>已存预设<\/span>/);
    assert.doesNotMatch(html, />(?:➕|✏|💾|🗑)/u);
    assert.match(html, /id="xb-assistant-provider"/);
    assert.match(html, /id="xb-assistant-temperature"/);
    assert.match(html, /id="xb-assistant-send-temperature"/);
    assert.match(html, /id="xb-assistant-tavily-api-key"/);
    assert.match(html, /id="xb-assistant-delegate-preset-select"/);
    assert.match(html, /id="xb-assistant-delegate-provider"/);
    assert.match(html, /id="xb-assistant-delegate-base-url"/);
    assert.match(html, /id="xb-assistant-delegate-model"/);
    assert.match(html, /id="xb-assistant-delegate-temperature"/);
    assert.match(html, /id="xb-assistant-delegate-send-temperature"/);
    assert.match(html, /id="xb-assistant-delegate-tool-mode"/);
    assert.match(html, /id="xb-assistant-delegate-pull-models"/);
    assert.doesNotMatch(html, /<span>预设名称<\/span>/);
    assert.doesNotMatch(html, /class="xb-assistant-actions"/);
    assert.match(html, /Tavily API Key（全局）/);
    assert.doesNotMatch(html, /id="xb-assistant-tavily-base-url"/);
    assert.doesNotMatch(html, /id="xb-assistant-delegate-tavily-api-key"/);
    assert.doesNotMatch(html, /id="xb-assistant-delegate-tavily-base-url"/);
    assert.doesNotMatch(html, /斜杠命令权限/);
    assert.doesNotMatch(html, /JavaScript API 权限/);
    assert.doesNotMatch(html, /先到小白助手配置当前模型预设/);
    assert.doesNotMatch(html, /请先到小白助手补好/);
});

test('Book settings button opens the config overlay without rerendering the studio', () => {
    const state = {
        isSettingsOpen: false,
        configFormSyncPending: false,
    };
    const listeners = {};
    const settingsButton = {
        addEventListener(eventName, handler) {
            listeners[eventName] = handler;
        },
    };
    const root = {
        querySelector(selector) {
            return selector === '#xb-agent-open-settings' ? settingsButton : null;
        },
        querySelectorAll() {
            return [];
        },
        addEventListener() {},
    };
    let renderCount = 0;
    let settingsSurfaceCount = 0;

    bindEbookEvents({
        root,
        state,
        render() {
            renderCount += 1;
        },
        renderSettingsSurface() {
            settingsSurfaceCount += 1;
            return true;
        },
        postToHost() {},
        bookController: {},
        agentRunner: {},
        persistConversation() {},
        clearConversation() {},
        showToast() {},
    });

    listeners.click();

    assert.equal(state.isSettingsOpen, true);
    assert.equal(state.configFormSyncPending, true);
    assert.equal(settingsSurfaceCount, 1);
    assert.equal(renderCount, 0);
});

test('Book renderer reuses assistant markdown rendering for tables', async () => {
    await resetDb();
    const book = await createBook('Markdown 对齐测试');
    const previousShowdown = globalThis.showdown;
    const previousDOMPurify = globalThis.DOMPurify;
    globalThis.showdown = {
        Converter: class {
            makeHtml(text) {
                if (String(text).includes('| 列1 | 列2 |')) {
                    return '<table><thead><tr><th>列1</th><th>列2</th></tr></thead><tbody><tr><td>A</td><td>B</td></tr></tbody></table>';
                }
                return `<p>${String(text)}</p>`;
            }
        },
    };
    globalThis.DOMPurify = {
        sanitize(html) {
            return html;
        },
    };

    try {
        const state = {
            book,
            books: [book],
            files: await listBookFiles(book.id),
            selectedPath: 'book/chapters/001.md',
            readerPath: '',
            viewMode: 'studio',
            editorContent: '',
            savedContent: '',
            messages: [
                {
                    role: 'assistant',
                    content: '| 列1 | 列2 |\n| --- | --- |\n| A | B |',
                },
            ],
            toolTrace: [],
            openToolTurnKeys: [],
            openThoughtKeys: [],
            historySummary: '',
            isBusy: false,
            status: '就绪',
            toast: '',
        };

        const html = renderEbookShell({
            state,
            providerConfig: { provider: 'test', model: 'demo' },
            dirty: false,
        });

        assert.match(html, /<table>/);
        assert.match(html, /<th>列1<\/th>/);
        assert.match(html, /xb-assistant-markdown/);
    } finally {
        globalThis.showdown = previousShowdown;
        globalThis.DOMPurify = previousDOMPurify;
    }
});

test('Shared markdown renderer lets raw HTML reach the message sanitizer', () => {
    const previousShowdown = globalThis.showdown;
    const previousDOMPurify = globalThis.DOMPurify;
    const calls = [];
    globalThis.showdown = {
        Converter: class {
            makeHtml(text) {
                return `<p>${String(text)}</p>`;
            }
        },
    };
    globalThis.DOMPurify = {
        sanitize(html, config) {
            calls.push({ html, config });
            return html;
        },
    };

    try {
        const html = renderMarkdownToHtml('<div class="demo">Hello</div>');
        assert.match(html, /<div class="demo">Hello<\/div>/);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].config.MESSAGE_SANITIZE, true);
        assert.deepEqual(calls[0].config.ADD_TAGS, ['custom-style']);
    } finally {
        globalThis.showdown = previousShowdown;
        globalThis.DOMPurify = previousDOMPurify;
    }
});

test('Shared markdown renderer does not fold non-document raw tags into HTML preview blocks', () => {
    const previousShowdown = globalThis.showdown;
    const previousDOMPurify = globalThis.DOMPurify;
    globalThis.showdown = {
        Converter: class {
            makeHtml(text) {
                return `<p>${String(text).replace(/\n/g, '<br>')}</p>`;
            }
        },
    };
    globalThis.DOMPurify = {
        sanitize(html) {
            return html;
        },
    };

    try {
        const html = renderMarkdownToHtml([
            '<note>',
            'Keep this as ordinary prose.',
            '<marker>inline marker</marker>',
            '</note>',
            '<details><summary>[角色状态]</summary>',
            '```',
            '- status text',
            '```',
            '</details>',
        ].join('\n'));
        assert.doesNotMatch(html, /xb-markdown-html-placeholder/);
        assert.doesNotMatch(html, /@@XBHTMLBLOCK/);
        assert.match(html, /<note>/);
        assert.match(html, /Keep this as ordinary prose/);
        assert.match(html, /<marker>inline marker<\/marker>/);
        assert.match(html, /<details>/);
        assert.match(html, /<summary>\[角色状态\]<\/summary>/);
    } finally {
        globalThis.showdown = previousShowdown;
        globalThis.DOMPurify = previousDOMPurify;
    }
});

test('Shared markdown renderer folds fenced HTML into a lightweight placeholder', () => {
    const previousShowdown = globalThis.showdown;
    const previousDOMPurify = globalThis.DOMPurify;
    globalThis.showdown = {
        Converter: class {
            makeHtml(text) {
                return `<p>${String(text)}</p>`;
            }
        },
    };
    globalThis.DOMPurify = {
        sanitize(html) {
            return html;
        },
    };

    try {
        const html = renderMarkdownToHtml([
            '```html',
            '<main><h1>Heavy UI</h1><section>...</section></main>',
            '```',
        ].join('\n'));
        assert.match(html, /xb-markdown-html-placeholder/);
        assert.doesNotMatch(html, /<main>/);
        assert.doesNotMatch(html, /Heavy UI/);
    } finally {
        globalThis.showdown = previousShowdown;
        globalThis.DOMPurify = previousDOMPurify;
    }
});

test('Shared markdown renderer keeps HTML placeholders inert through Markdown emphasis parsing', () => {
    const previousShowdown = globalThis.showdown;
    const previousDOMPurify = globalThis.DOMPurify;
    globalThis.showdown = {
        Converter: class {
            makeHtml(text) {
                const emphasized = String(text).replace(/_([^_]+)_/g, '<em>$1</em>');
                return `<p>${emphasized}</p>`;
            }
        },
    };
    globalThis.DOMPurify = {
        sanitize(html) {
            return html;
        },
    };

    try {
        const html = renderMarkdownToHtml([
            '```html',
            '<main><h1>Heavy UI</h1><section>...</section></main>',
            '```',
        ].join('\n'));
        assert.match(html, /xb-markdown-html-placeholder/);
        assert.doesNotMatch(html, /@@XBHTMLBLOCK/);
        assert.doesNotMatch(html, /@@XB_HTML_BLOCK_/);
        assert.doesNotMatch(html, /<main>/);
    } finally {
        globalThis.showdown = previousShowdown;
        globalThis.DOMPurify = previousDOMPurify;
    }
});

test('Shared HTML preview sandbox allows scripts while staying isolated from the host', () => {
    assert.equal(HTML_PREVIEW_SANDBOX, 'allow-scripts');
});

test('HTML preview placeholders stay in UI only and do not alter stored conversation text', async () => {
    await resetDb();
    const book = await createBook('HTML 上下文边界测试');
    const originalContent = [
        '```html',
        '<main><h1>Hello</h1><script>console.log("preview")</script></main>',
        '```',
    ].join('\n');
    const state = {
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            {
                role: 'assistant',
                content: originalContent,
            },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        isBusy: false,
        status: '就绪',
        toast: '',
    };

    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        dirty: false,
    });
    assert.match(html, /xb-markdown-html-placeholder/);
    assert.equal(state.messages[0].content, originalContent);

    const store = createEbookConversationStore({ state });
    await store.persistConversation(book.id);
    state.messages = [];
    await store.restoreConversation(book.id);
    assert.equal(state.messages[0].content, originalContent);

    const providerMessages = buildEbookProviderMessagesFromHistory(state.messages);
    assert.equal(providerMessages[0].content, originalContent);
});

test('Book agent stores a multi-tool batch only after all tool results exist', async () => {
    await resetDb();
    const book = await createBook('工具批次测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let round = 0;
    let persisted = 0;
    let sawUnsafePartialHistory = false;
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {
            if (
                state.toolTrace.length === 1
                && state.messages.some((message) => Array.isArray(message.toolCalls) && message.toolCalls.length)
            ) {
                sawUnsafePartialHistory = true;
            }
        },
        showToast() {},
        persistConversation() {
            persisted += 1;
        },
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    round += 1;
                    if (round === 1) {
                        return {
                            text: '',
                            thoughts: [{ label: '思考块', text: '同时读取两个文件。' }],
                            toolCalls: [
                                {
                                    id: 'call-read-1',
                                    name: EBOOK_TOOL_NAMES.READ,
                                    arguments: '{"filePath":"book/outline.md","limit":2}',
                                },
                                {
                                    id: 'call-read-2',
                                    name: EBOOK_TOOL_NAMES.READ,
                                    arguments: '{"filePath":"book/chapters/001.md","limit":2}',
                                },
                            ],
                        };
                    }
                    assert.equal(task.messages.filter((message) => message.role === 'tool').length, 2);
                    return {
                        text: '两个读取都完成。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    await runner.runAgent('同时读取大纲和第一章。');

    assert.equal(sawUnsafePartialHistory, false);
    assert.equal(persisted >= 2, true);
    assert.deepEqual(state.messages.map((message) => message.role), ['user', 'assistant', 'tool', 'tool', 'assistant']);
    assert.equal(state.messages[1].toolCalls.length, 2);
    assert.equal(state.messages[1].thoughts[0].text, '同时读取两个文件。');
    assert.equal(state.messages.filter((message) => message.role === 'tool').length, 2);
    assert.equal(state.toolTrace.length, 0);
    assert.equal(state.activeTurnStartIndex, -1);
});

test('Book agent refreshes file snapshot before first model request', async () => {
    await resetDb();
    const book = await createBook('首轮注入刷新测试');
    await upsertBookFile(book.id, 'book/state.md', '# 状态追踪\n\n旧状态。');
    const staleFiles = await listBookFiles(book.id);
    await upsertBookFile(book.id, 'book/state.md', '# 状态追踪\n\n新状态。');
    await upsertBookFile(book.id, 'book/chapters/001.md', '# 第 1 章\n\n已经正式写完。');
    const state = {
        config: {},
        book,
        books: [book],
        files: staleFiles,
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let firstUserPrompt = '';
    let refreshCount = 0;
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            refreshCount += 1;
            state.files = await listBookFiles(book.id);
        },
        render() {},
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    const userMessage = task.messages.find((message) => message.role === 'user');
                    firstUserPrompt = String(userMessage?.content || '');
                    return {
                        text: '已确认状态。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    await runner.runAgent('看一下状态。');

    assert.equal(refreshCount >= 2, true);
    assert.match(firstUserPrompt, /新状态/);
    assert.doesNotMatch(firstUserPrompt, /旧状态/);
    assert.match(firstUserPrompt, /已实际创作章节：1 章/);
    assert.doesNotMatch(firstUserPrompt, /已实际创作章节：0 章/);
});

test('Book agent refreshes drafted chapter progress after chapter deletion', async () => {
    await resetDb();
    const book = await createBook('章节删减刷新测试');
    await upsertBookFile(book.id, 'book/chapters/001.md', '# 第 1 章\n\n第一章正文。');
    await upsertBookFile(book.id, 'book/chapters/002.md', '# 第 2 章\n\n第二章正文。');
    const staleFiles = await listBookFiles(book.id);
    await deleteBookPath(book.id, 'book/chapters/002.md');
    const state = {
        config: {},
        book,
        books: [book],
        files: staleFiles,
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let firstUserPrompt = '';
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {},
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    const userMessage = task.messages.find((message) => message.role === 'user');
                    firstUserPrompt = String(userMessage?.content || '');
                    return {
                        text: '已确认章节数。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    await runner.runAgent('看一下创作进度。');

    assert.match(firstUserPrompt, /已实际创作章节：1 章/);
    assert.doesNotMatch(firstUserPrompt, /已实际创作章节：2 章/);
});

test('Book agent keeps the user message if first snapshot refresh fails', async () => {
    await resetDb();
    const book = await createBook('首轮刷新失败保留用户消息');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let persistedBookId = '';
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            throw new Error('refresh_failed_for_test');
        },
        render() {},
        showToast() {},
        persistConversation(bookId) {
            persistedBookId = bookId;
        },
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            throw new Error('adapter_should_not_be_created');
        },
    });

    await runner.runAgent('这句话不能丢。');

    assert.deepEqual(state.messages.map((message) => message.role), ['user', 'assistant']);
    assert.equal(state.messages[0].content, '这句话不能丢。');
    assert.match(state.messages[1].content, /refresh_failed_for_test/);
    assert.equal(state.isBusy, false);
    assert.equal(persistedBookId, book.id);
});

test('Book agent renders read-only tool progress through local surfaces', async () => {
    await resetDb();
    const book = await createBook('只读工具局部刷新测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let round = 0;
    let fullRenders = 0;
    let agentSurfaces = 0;
    let toolSurfaces = 0;
    let fileSurfaces = 0;
    let editorSurfaces = 0;
    let secondRoundMessages = [];
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {
            fullRenders += 1;
        },
        renderAgentSurface() {
            agentSurfaces += 1;
            return true;
        },
        renderToolTraceSurface() {
            toolSurfaces += 1;
            return true;
        },
        renderFilesSurface() {
            fileSurfaces += 1;
            return true;
        },
        renderEditorFileSurface() {
            editorSurfaces += 1;
            return true;
        },
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    round += 1;
                    if (round === 1) {
                        return {
                            text: '',
                            toolCalls: [{
                                id: 'call-read-outline',
                                name: EBOOK_TOOL_NAMES.READ,
                                arguments: '{"filePath":"book/outline.md","limit":2}',
                            }],
                        };
                    }
                    secondRoundMessages = task.messages;
                    return {
                        text: '已读取大纲。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    await runner.runAgent('读取大纲。');

    assert.equal(fullRenders, 2);
    assert.equal(agentSurfaces >= 2, true);
    assert.equal(toolSurfaces >= 2, true);
    assert.equal(fileSurfaces, 0);
    assert.equal(editorSurfaces, 0);
    assert.deepEqual(state.messages.map((message) => message.role), ['user', 'assistant', 'tool', 'assistant']);
    assert.equal(state.messages[2].toolName, EBOOK_TOOL_NAMES.READ);
    assert.match(state.messages[2].content, /book\/outline\.md/);
    assert.equal(secondRoundMessages.filter((message) => message.role === 'tool').length, 1);
    assert.equal(secondRoundMessages.find((message) => message.role === 'tool')?.content, state.messages[2].content);
});

test('Book agent streaming updates do not full-render the reader screen', async () => {
    await resetDb();
    const book = await createBook('阅读器流式刷新测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: 'book/chapters/001.md',
        viewMode: 'reader',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let fullRenders = 0;
    let agentSurfaces = 0;
    let passiveSurfaces = 0;
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {
            fullRenders += 1;
        },
        renderAgentSurface() {
            agentSurfaces += 1;
            return false;
        },
        renderPassiveSurface() {
            passiveSurfaces += 1;
            return true;
        },
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    task.onStreamProgress?.({ text: '半句' });
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    return {
                        text: '完整回复。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    await runner.runAgent('继续写。');

    assert.equal(fullRenders, 2);
    assert.equal(agentSurfaces >= 2, true);
    assert.equal(passiveSurfaces >= 2, true);
    assert.deepEqual(state.messages.map((message) => message.role), ['user', 'assistant']);
    assert.equal(state.messages[1].content, '完整回复。');
});

test('Book agent refreshes file surfaces for write tools without extra full renders', async () => {
    await resetDb();
    const book = await createBook('写入工具局部刷新测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let round = 0;
    let fullRenders = 0;
    let toolSurfaces = 0;
    let fileSurfaces = 0;
    let editorSurfaces = 0;
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {
            fullRenders += 1;
        },
        renderAgentSurface() {
            return true;
        },
        renderToolTraceSurface() {
            toolSurfaces += 1;
            return true;
        },
        renderFilesSurface() {
            fileSurfaces += 1;
            return true;
        },
        renderEditorFileSurface() {
            editorSurfaces += 1;
            return true;
        },
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat() {
                    round += 1;
                    if (round === 1) {
                        return {
                            text: '',
                            toolCalls: [{
                                id: 'call-write-chapter',
                                name: EBOOK_TOOL_NAMES.WRITE,
                                arguments: JSON.stringify({
                                    filePath: 'book/chapters/001.md',
                                    content: '# 第 1 章\n\n新的正文。',
                                }),
                            }],
                        };
                    }
                    return {
                        text: '已写入第一章。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    await runner.runAgent('写第一章。');

    assert.equal(fullRenders, 2);
    assert.equal(toolSurfaces >= 2, true);
    assert.equal(fileSurfaces, 1);
    assert.equal(editorSurfaces, 1);
    assert.deepEqual(state.messages.map((message) => message.role), ['user', 'assistant', 'tool', 'assistant']);
    assert.equal(JSON.parse(state.messages[2].content).ok, true);
    assert.equal((await getBookFile(book.id, 'book/chapters/001.md')).content, '# 第 1 章\n\n新的正文。');
});

test('Book agent replays repaired tagged-json Write content after executing malformed arguments', async () => {
    await resetDb();
    const book = await createBook('兼容工具 Write 回放测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    const targetPath = 'book/chapters/001.md';
    const repairedContent = '她说："回来。"\n第二行';
    const malformedArguments = [
        `{"filePath":"${targetPath}","content":"她说："回来。"`,
        '第二行"}',
    ].join('\n');
    let round = 0;
    let secondRoundMessages = [];
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {},
        renderAgentSurface() {
            return true;
        },
        renderToolTraceSurface() {
            return true;
        },
        renderFilesSurface() {
            return true;
        },
        renderEditorFileSurface() {
            return true;
        },
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'openai-compatible',
                toolMode: 'tagged-json',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    round += 1;
                    if (round === 1) {
                        return {
                            text: '',
                            provider: 'openai-compatible',
                            providerPayload: {
                                openaiCompatibleMessage: {
                                    role: 'assistant',
                                    content: '',
                                    tool_calls: [{
                                        id: 'call-write-compat',
                                        type: 'function',
                                        function: {
                                            name: EBOOK_TOOL_NAMES.WRITE,
                                            arguments: '{}',
                                        },
                                    }],
                                },
                            },
                            toolCalls: [{
                                id: 'call-write-compat',
                                name: EBOOK_TOOL_NAMES.WRITE,
                                arguments: malformedArguments,
                            }],
                        };
                    }
                    secondRoundMessages = task.messages;
                    return {
                        text: '已写入。上一轮 Write 参数可以回放。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    await runner.runAgent('写一段含引号的正文。');

    assert.equal((await getBookFile(book.id, targetPath)).content, repairedContent);
    const storedArguments = JSON.parse(state.messages[1].toolCalls[0].arguments);
    assert.deepEqual(storedArguments, {
        filePath: targetPath,
        content: repairedContent,
    });

    const taggedMessages = buildTaggedMessages({
        systemPrompt: EBOOK_SYSTEM_PROMPT,
        tools: getEbookToolDefinitions({ includeDelegateTool: false }),
        messages: secondRoundMessages,
    });
    const taggedAssistant = taggedMessages.find((message) => (
        message.role === 'assistant' && String(message.content || '').includes('<tool_call>')
    ));
    assert.ok(taggedAssistant);
    const taggedPayloadText = String(taggedAssistant.content).match(/<tool_call>([\s\S]*?)<\/tool_call>/)?.[1] || '';
    const taggedPayload = JSON.parse(taggedPayloadText);
    assert.equal(taggedPayload.name, EBOOK_TOOL_NAMES.WRITE);
    assert.deepEqual(taggedPayload.arguments, storedArguments);
    assert.notDeepEqual(taggedPayload.arguments, {});
});

test('Book agent reports invalid tool arguments without executing Edit', async () => {
    await resetDb();
    const book = await createBook('工具参数坏 JSON 测试');
    const originalOutline = (await getBookFile(book.id, 'book/outline.md')).content;
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/outline.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let round = 0;
    let secondRoundMessages = [];
    const malformedArguments = '{"filePath":"book/outline.md","edits":[{"oldString":"# 大纲","newString":"# 新大纲"}';
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {},
        renderAgentSurface() {
            return true;
        },
        renderToolTraceSurface() {
            return true;
        },
        renderFilesSurface() {
            return true;
        },
        renderEditorFileSurface() {
            return true;
        },
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    round += 1;
                    if (round === 1) {
                        return {
                            text: '',
                            toolCalls: [{
                                id: 'call-edit-malformed',
                                name: EBOOK_TOOL_NAMES.EDIT,
                                arguments: malformedArguments,
                            }],
                        };
                    }
                    secondRoundMessages = task.messages;
                    return {
                        text: 'Edit 参数不是合法 JSON，已经停止执行。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    await runner.runAgent('尝试坏参数 Edit。');

    const toolResult = JSON.parse(state.messages.find((message) => message.role === 'tool').content);
    assert.equal(toolResult.ok, false);
    assert.equal(toolResult.error, 'invalid_edits_json_string');
    assert.equal(toolResult.path, 'book/outline.md');
    assert.notEqual(toolResult.error, 'book_path_required');
    assert.equal((await getBookFile(book.id, 'book/outline.md')).content, originalOutline);

    const storedArguments = JSON.parse(state.messages[1].toolCalls[0].arguments);
    assert.equal(storedArguments.filePath, 'book/outline.md');
    assert.equal(typeof storedArguments.edits, 'string');

    const replayToolCall = secondRoundMessages.find((message) => message.role === 'assistant')?.tool_calls?.[0];
    assert.deepEqual(JSON.parse(replayToolCall.function.arguments), storedArguments);
});

test('Book agent uses Google-style session tool loop without rebuilding replay history', async () => {
    await resetDb();
    const book = await createBook('Google 会话工具测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        openToolTurnKeys: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let round = 0;
    const seenTasks = [];
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {},
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'google',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: true,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                supportsSessionToolLoop: true,
                async chat(task) {
                    seenTasks.push(task);
                    round += 1;
                    if (round === 1) {
                        task.onStreamProgress?.({
                            thoughts: [{ label: '思考块', text: '先读大纲。' }],
                        });
                        return {
                            text: '',
                            provider: 'google',
                            providerPayload: {
                                googleContent: {
                                    role: 'model',
                                    parts: [{
                                        functionCall: {
                                            id: 'google-read-outline',
                                            name: EBOOK_TOOL_NAMES.READ,
                                            args: {
                                                filePath: 'book/outline.md',
                                                limit: 2,
                                            },
                                        },
                                    }],
                                },
                            },
                        };
                    }
                    if (round === 2) {
                        assert.equal(Object.hasOwn(task, 'messages'), false);
                        assert.deepEqual(task.toolResponses.map((item) => ({
                            id: item.id,
                            name: item.name,
                            ok: item.response.ok,
                        })), [{
                            id: 'google-read-outline',
                            name: EBOOK_TOOL_NAMES.READ,
                            ok: true,
                        }]);
                        return {
                            text: '',
                            toolCalls: [],
                        };
                    }
                    assert.equal(Object.hasOwn(task, 'messages'), false);
                    assert.match(task.finalAnswerReminderText, /直接给出电纸书操作结论/);
                    return {
                        text: '已经读取大纲并整合。',
                        thoughts: [
                            { label: '思考块', text: '先读大纲。' },
                            { label: '推理摘要', text: '大纲可用。' },
                        ],
                        toolCalls: [],
                        provider: 'google',
                    };
                },
            };
        },
    });

    await runner.runAgent('读取大纲后给我结论。');

    assert.equal(seenTasks.length, 3);
    assert.deepEqual(state.messages.map((message) => message.role), ['user', 'assistant', 'tool', 'assistant']);
    assert.equal(state.messages[1].toolCalls[0].id, 'google-read-outline');
    assert.equal(state.messages[1].thoughts.length, 1);
    assert.equal(state.messages[3].thoughts.length, 1);
    assert.equal(state.messages[3].thoughts[0].text, '大纲可用。');
    assert.equal(state.toolTrace.length, 0);
});

test('Book agent keeps streamed thoughts in the final assistant message', async () => {
    await resetDb();
    const book = await createBook('流式思考测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {},
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    task.onStreamProgress?.({
                        text: '正在整理结论...',
                        thoughts: [{ label: '思考块', text: '先判断是否需要工具。' }],
                    });
                    return {
                        text: '可以直接回答。',
                        thoughts: [{ label: '推理摘要', text: '无需读取文件。' }],
                        toolCalls: [],
                    };
                },
            };
        },
    });

    await runner.runAgent('简单判断一下。');

    assert.deepEqual(state.messages.map((message) => message.role), ['user', 'assistant']);
    assert.equal(state.messages[1].streaming, false);
    assert.equal(state.messages[1].thoughts.length, 2);
    assert.equal(state.messages[1].thoughts[0].text, '先判断是否需要工具。');
    assert.equal(state.messages[1].thoughts[1].text, '无需读取文件。');
    const html = renderEbookShell({
        state,
        providerConfig: { provider: 'test', model: 'demo' },
        providerLabel: '测试',
        dirty: false,
    });
    assert.match(html, /data-thought-key="thought-message:1"/);
    assert.doesNotMatch(html, /data-thought-key="thought-message:1"[^>]* open/);
});

test('Book agent keeps streamed text when a model request fails', async () => {
    await resetDb();
    const book = await createBook('流式错误测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {},
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'openai-compatible',
                model: 'test-model',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    task.onStreamProgress?.({
                        text: '已经流出来的半截内容。',
                        thoughts: [{ label: '思考块', text: '先组织答案。' }],
                    });
                    throw new Error('Connection error.');
                },
            };
        },
    });

    await runner.runAgent('开始聊一个会报错的问题。');

    assert.deepEqual(state.messages.map((message) => message.role), ['user', 'assistant', 'assistant']);
    assert.equal(state.messages[1].streaming, false);
    assert.equal(state.messages[1].content, '已经流出来的半截内容。');
    assert.equal(state.messages[1].thoughts[0].text, '先组织答案。');
    assert.equal(state.messages[2].error, true);
    assert.match(state.messages[2].content, /AI 操作失败：Connection error\./);
});

test('Book agent injects a light brake after repeated tool failures', async () => {
    await resetDb();
    const book = await createBook('工具刹车测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let round = 0;
    let sawLightBrake = false;
    let lightBrakeMessageIndex = -1;
    let lightBrakeMessageCount = 0;
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {},
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    round += 1;
                    if (round <= 3) {
                        return {
                            text: '',
                            toolCalls: [{
                                id: `read-missing-${round}`,
                                name: EBOOK_TOOL_NAMES.READ,
                                arguments: '{"filePath":"book/chapters/missing.md","limit":2}',
                            }],
                        };
                    }
                    sawLightBrake = task.messages.some((message) => (
                        message.role === 'system'
                        && /工具失败提示/.test(message.content)
                        && /Read/.test(message.content)
                        && /book_file_not_found/.test(message.content)
                    ));
                    assert.equal(task.messages[0]?.content, EBOOK_SYSTEM_PROMPT);
                    assert.equal(task.messages[1]?.content, buildBookContextPrompt({ files: state.files }));
                    lightBrakeMessageCount = task.messages.length;
                    lightBrakeMessageIndex = task.messages.findIndex((message) => (
                        message.role === 'system'
                        && /工具失败提示/.test(message.content)
                    ));
                    return {
                        text: '已停止重复读取不存在的章节。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    await runner.runAgent('故意连续读不存在的章节。');

    assert.equal(sawLightBrake, true);
    assert.equal(lightBrakeMessageIndex >= 2, true);
    assert.equal(lightBrakeMessageIndex, lightBrakeMessageCount - 1);
    assert.equal(state.messages.at(-1).content, '已停止重复读取不存在的章节。');
    assert.equal(state.messages.filter((message) => message.role === 'tool' && /book_file_not_found/.test(message.content)).length, 3);
});

test('Book agent places non-session final answer reminder after history and before current user', async () => {
    await resetDb();
    const book = await createBook('结论提醒顺序测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let round = 0;
    let reminderMessageIndex = -1;
    let messageCountAtReminder = 0;
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {},
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    round += 1;
                    if (round === 1) {
                        return {
                            text: '',
                            toolCalls: [{
                                id: 'read-outline',
                                name: EBOOK_TOOL_NAMES.READ,
                                arguments: '{"filePath":"book/outline.md","limit":2}',
                            }],
                        };
                    }
                    if (round === 2) {
                        return {
                            text: '',
                            toolCalls: [],
                        };
                    }
                    if (round === 3) {
                        assert.equal(task.messages[0]?.content, EBOOK_SYSTEM_PROMPT);
                        assert.equal(task.messages[1]?.content, buildBookContextPrompt({ files: state.files }));
                        messageCountAtReminder = task.messages.length;
                        reminderMessageIndex = task.messages.findIndex((message) => (
                            message.role === 'system'
                            && /你已经拿到了本轮全部工具结果/.test(message.content)
                        ));
                        return {
                            text: '已经读取大纲并给出结论。',
                            toolCalls: [],
                        };
                    }
                    throw new Error(`unexpected round ${round}`);
                },
            };
        },
    });

    await runner.runAgent('读取大纲后直接告诉我。');

    assert.equal(reminderMessageIndex >= 2, true);
    assert.equal(reminderMessageIndex, messageCountAtReminder - 1);
    assert.equal(state.messages.at(-1).content, '已经读取大纲并给出结论。');
});

test('Light brake can fire again for the same failure pattern after reset', () => {
    const lightBrake = createLightBrakeController();

    lightBrake.record('Read', 'book_file_not_found');
    lightBrake.record('Read', 'book_file_not_found');
    lightBrake.record('Read', 'book_file_not_found');
    assert.match(lightBrake.getMessage(), /Read/);
    assert.match(lightBrake.getMessage(), /book_file_not_found/);

    lightBrake.reset();
    assert.equal(lightBrake.getMessage(), '');

    lightBrake.record('Read', 'book_file_not_found');
    lightBrake.record('Read', 'book_file_not_found');
    assert.equal(lightBrake.getMessage(), '');

    lightBrake.record('Read', 'book_file_not_found');
    assert.match(lightBrake.getMessage(), /Read/);
    assert.match(lightBrake.getMessage(), /book_file_not_found/);
    assert.match(lightBrake.getMessage(), /LS \/ Grep \/ Read/);
    assert.doesNotMatch(lightBrake.getMessage(), /Glob/);
});

test('Book agent reroll trims to the previous user message without duplicating it', async () => {
    await resetDb();
    const book = await createBook('重生成测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '重写第一章。' },
            { role: 'assistant', content: '旧版本。' },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let requestMessages = [];
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {},
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    requestMessages = task.messages;
                    return {
                        text: '新版本。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    const result = await runner.rerunFromMessageIndex(1);

    assert.equal(result.ok, true);
    assert.deepEqual(state.messages.map((message) => message.role), ['user', 'assistant']);
    assert.equal(state.messages[0].content, '重写第一章。');
    assert.equal(state.messages[1].content, '新版本。');
    const userRequests = requestMessages.filter((message) => message.role === 'user');
    assert.equal(userRequests.length, 1);
    assert.match(userRequests[0].content, /^\[用户本轮请求\]\n\n重写第一章。\n\n\[本轮作品上下文\]/);
    assert.match(userRequests[0].content, /\[本轮作品上下文\]/);
});

test('Book agent reroll can start directly from an edited user message', async () => {
    await resetDb();
    const book = await createBook('用户消息重生成测试');
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '修正后的第一章要求。' },
            { role: 'assistant', content: '旧回复。' },
        ],
        toolTrace: [],
        openToolTurnKeys: [],
        openThoughtKeys: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let requestMessages = [];
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {},
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.2,
                maxTokens: 1000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    requestMessages = task.messages;
                    return {
                        text: '新回复。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    const result = await runner.rerunFromMessageIndex(0);

    assert.equal(result.ok, true);
    assert.deepEqual(state.messages.map((message) => message.role), ['user', 'assistant']);
    assert.equal(state.messages[0].content, '修正后的第一章要求。');
    assert.equal(state.messages[1].content, '新回复。');
    const userRequests = requestMessages.filter((message) => message.role === 'user');
    assert.equal(userRequests.length, 1);
    assert.match(userRequests[0].content, /^\[用户本轮请求\]\n\n修正后的第一章要求。\n\n\[本轮作品上下文\]/);
});

test('Book history compaction releases archived turns without writing creative record', async () => {
    const state = {
        messages: [
            { role: 'user', content: '设定女主叫林栖。' },
            {
                role: 'assistant',
                content: '',
                toolCalls: [{
                    id: 'call-read-settings',
                    name: EBOOK_TOOL_NAMES.READ,
                    arguments: '{"filePath":"book/characters.md"}',
                }],
            },
            {
                role: 'tool',
                toolCallId: 'call-read-settings',
                toolName: EBOOK_TOOL_NAMES.READ,
                content: '{"ok":true,"content":"1: # 角色设定"}',
            },
            { role: 'assistant', content: '已记录林栖。' },
            { role: 'user', content: '继续写下一章。' },
            { role: 'assistant', content: '已写到 book/chapters/002.md。' },
        ],
        historySummary: '旧记录：男主叫沈照。',
        status: '就绪',
        archivedTurnCount: 0,
        uiMessageWindowLimit: 100,
    };
    let persisted = false;
    let completed = false;
    const controller = createEbookHistoryCompactionController({
        state,
        render() {},
        showToast() {},
        persistConversation() {
            persisted = true;
        },
        getActiveProviderConfig() {
            return { temperature: 0.7, maxTokens: 12000 };
        },
        buildProviderMessages() {
            return [{ role: 'system', content: state.historySummary }, ...state.messages];
        },
        onCompactionComplete() {
            completed = true;
        },
        summaryTriggerTokens: 1,
        defaultPreservedTurns: 1,
        minPreservedTurns: 1,
    });

    await controller.ensureContextBudget({}, new AbortController().signal);

    assert.equal(persisted, true);
    assert.equal(completed, false);
    assert.equal(state.historySummary, '');
    assert.equal(state.messages.length, 2);
    assert.equal(state.messages[0].content, '继续写下一章。');
    assert.equal(state.uiMessageWindowLimit, 5);
});

test('Book history compaction stops before pruning when aborted', async () => {
    const state = {
        messages: [
            { role: 'user', content: '旧请求。' },
            { role: 'assistant', content: '旧回复。' },
            { role: 'user', content: '新请求。' },
            { role: 'assistant', content: '新回复。' },
        ],
        historySummary: '',
        status: '就绪',
        archivedTurnCount: 0,
        uiMessageWindowLimit: 100,
    };
    let persisted = false;
    const controller = createEbookHistoryCompactionController({
        state,
        render() {},
        showToast() {},
        persistConversation() {
            persisted = true;
        },
        buildProviderMessages() {
            return state.messages;
        },
        summaryTriggerTokens: 1,
        defaultPreservedTurns: 1,
        minPreservedTurns: 1,
    });
    const abortController = new AbortController();
    abortController.abort();

    await assert.rejects(
        () => controller.ensureContextBudget({}, abortController.signal),
        /Context compaction aborted/,
    );
    assert.equal(persisted, false);
    assert.equal(state.messages.length, 4);
    assert.equal(state.archivedTurnCount, 0);
});

test('Book agent compaction prunes old turns and does not inject creative record into replay', async () => {
    await resetDb();
    const book = await createBook('上下文释放链路测试');
    const longOldDraft = `夜里，棚屋里只点了一盏灯。\n${'OLD_CHAPTER_29_TEXT '.repeat(140000)}`;
    const state = {
        config: {},
        book,
        books: [book],
        files: await listBookFiles(book.id),
        selectedPath: 'book/chapters/001.md',
        readerPath: '',
        viewMode: 'studio',
        editorContent: '',
        savedContent: '',
        messages: [
            { role: 'user', content: '写第29章旧版。' },
            { role: 'assistant', content: longOldDraft },
            { role: 'user', content: '先停一下。' },
            { role: 'assistant', content: '收到。' },
        ],
        toolTrace: [],
        historySummary: '',
        archivedTurnCount: 0,
        isBusy: false,
        activeController: null,
        status: '就绪',
        toast: '',
    };
    let replayMessages = [];
    const runner = createEbookAgentRunner({
        state,
        async refreshBooksAndFiles() {
            state.files = await listBookFiles(book.id);
        },
        render() {},
        showToast() {},
        persistConversation() {},
        isEditorDirty() {
            return false;
        },
        getActiveProviderConfig() {
            return {
                provider: 'test',
                temperature: 0.7,
                maxTokens: 12000,
                reasoningEnabled: false,
                reasoningEffort: 'medium',
            };
        },
        createAdapter() {
            return {
                async chat(task) {
                    assert.notEqual(task.toolChoice, 'none');
                    replayMessages = task.messages;
                    return {
                        text: '我会依据当前书稿文件继续。',
                        toolCalls: [],
                    };
                },
            };
        },
    });

    await runner.runAgent('继续写，但不要沿用旧版问题。');

    assert.equal(state.historySummary, '');
    const latestUserMessage = replayMessages.filter((message) => message.role === 'user').at(-1);
    assert.doesNotMatch(latestUserMessage?.content || '', /\[创作记录\]/);
    assert.doesNotMatch(latestUserMessage?.content || '', /OLD_CHAPTER_29_TEXT OLD_CHAPTER_29_TEXT/);
});

test('Book history compaction drops old prose instead of summarizing it', async () => {
    const leakedChapterText = `夜里，棚屋里只点了一盏灯。\n${'旧版正文。'.repeat(1200)}\nUNIQUE_OLD_CHAPTER_SHOULD_NOT_APPEAR`;
    const state = {
        messages: [
            { role: 'user', content: '写第29章。' },
            { role: 'assistant', content: leakedChapterText },
            {
                role: 'assistant',
                content: '',
                toolCalls: [{
                    id: 'call-write-chapter',
                    name: EBOOK_TOOL_NAMES.WRITE,
                    arguments: JSON.stringify({
                        filePath: 'book/chapters/029.md',
                        content: leakedChapterText,
                    }),
                }],
            },
            {
                role: 'tool',
                toolCallId: 'call-write-chapter',
                toolName: EBOOK_TOOL_NAMES.WRITE,
                content: JSON.stringify({
                    ok: true,
                    path: 'book/chapters/029.md',
                    bytes: leakedChapterText.length,
                    content: leakedChapterText,
                    summary: '已写入 book/chapters/029.md。',
                }),
            },
            { role: 'user', content: '下一步继续。' },
            { role: 'assistant', content: '准备继续。' },
        ],
        historySummary: '',
        status: '就绪',
        archivedTurnCount: 0,
        uiMessageWindowLimit: 100,
    };
    const controller = createEbookHistoryCompactionController({
        state,
        render() {},
        showToast() {},
        persistConversation() {},
        getActiveProviderConfig() {
            return { temperature: 0.7, maxTokens: 12000 };
        },
        buildProviderMessages() {
            return state.messages;
        },
        summaryTriggerTokens: 1,
        defaultPreservedTurns: 1,
        minPreservedTurns: 1,
    });

    await controller.ensureContextBudget({}, new AbortController().signal);

    assert.equal(state.historySummary, '');
    assert.equal(state.messages.length, 2);
    assert.equal(state.messages[0].content, '下一步继续。');
    assert.doesNotMatch(JSON.stringify(state.messages), /UNIQUE_OLD_CHAPTER_SHOULD_NOT_APPEAR/);
    assert.doesNotMatch(JSON.stringify(state.messages), /旧版正文。旧版正文。旧版正文。/);
});

test('Book history compaction reports when one preserved turn is still too large', async () => {
    const leakedChapterText = `${'泥地旧稿。'.repeat(1200)}\nUNIQUE_FALLBACK_OLD_CHAPTER_SHOULD_NOT_APPEAR`;
    const state = {
        messages: [
            { role: 'user', content: `这一轮本身太长。\n${leakedChapterText}` },
            { role: 'assistant', content: '收到。' },
        ],
        historySummary: '',
        status: '就绪',
        archivedTurnCount: 0,
        uiMessageWindowLimit: 100,
    };
    const toastMessages = [];
    const unableEvents = [];
    const controller = createEbookHistoryCompactionController({
        state,
        render() {},
        showToast(message) {
            toastMessages.push(message);
        },
        persistConversation() {},
        buildProviderMessages() {
            return state.messages;
        },
        onCompactionUnable(event = {}) {
            unableEvents.push(event);
        },
        summaryTriggerTokens: 1,
        defaultPreservedTurns: 1,
        minPreservedTurns: 1,
    });

    await controller.ensureContextBudget({}, new AbortController().signal);

    assert.equal(state.historySummary, '');
    assert.equal(unableEvents.length, 1);
    assert.match(unableEvents[0].status, /当前这一轮过长/);
    assert.equal(toastMessages.some((message) => /结束、拆分任务或重新开始/.test(message)), true);
});

test('Book history compaction counts real tool schemas through the shared tokenizer path', async () => {
    const state = {
        messages: [
            { role: 'user', content: '继续写下一章。' },
            { role: 'assistant', content: '先看下当前设定。' },
        ],
        historySummary: '',
        status: '就绪',
        archivedTurnCount: 0,
        uiMessageWindowLimit: 100,
    };
    const tokenizerRequests = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options = {}) => {
        tokenizerRequests.push({
            url: String(url),
            body: JSON.parse(String(options.body || '{}')),
        });
        return {
            ok: true,
            async json() {
                return { count: 4321 };
            },
        };
    };

    try {
        const controller = createEbookHistoryCompactionController({
            state,
            render() {},
            persistConversation() {},
            showToast() {},
            getActiveProviderConfig() {
                return {
                    provider: 'anthropic',
                    model: 'claude-sonnet-4',
                    temperature: 0.7,
                    maxTokens: 12000,
                };
            },
            buildProviderMessages() {
                return [{ role: 'system', content: '作品上下文' }, ...state.messages];
            },
            getToolDefinitions() {
                return [{
                    type: 'function',
                    function: {
                        name: 'Read',
                        description: 'Read a book file.',
                        parameters: {
                            type: 'object',
                            properties: {
                                filePath: { type: 'string' },
                            },
                        },
                    },
                }];
            },
        });

        const tokenCount = await controller.estimateCurrentTokens();

        assert.equal(tokenCount, 4321);
        assert.equal(tokenizerRequests.length, 1);
        assert.equal(tokenizerRequests[0].url, '/api/tokenizers/claude/encode');
        const tokenizerPayload = JSON.parse(tokenizerRequests[0].body.text);
        const toolsMessage = tokenizerPayload.at(-1);
        assert.match(String(toolsMessage?.content || ''), /TOOLS/);
        assert.match(String(toolsMessage?.content || ''), /"name":"Read"/);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('Book prompt keeps assistant-style tool layers and recovery rules', () => {
    assert.match(EBOOK_SYSTEM_PROMPT, /# Tool Use Guide/);
    assert.match(EBOOK_SYSTEM_PROMPT, /# Role/);
    assert.match(EBOOK_SYSTEM_PROMPT, /# Current Book/);
    assert.match(EBOOK_SYSTEM_PROMPT, /# Injected Context/);
    assert.match(EBOOK_SYSTEM_PROMPT, /# File Discipline/);
    assert.match(EBOOK_SYSTEM_PROMPT, /## Tool Layers/);
    assert.match(EBOOK_SYSTEM_PROMPT, /## Selection Strategy/);
    assert.match(EBOOK_SYSTEM_PROMPT, /## 阶段与顺序/);
    assert.match(EBOOK_SYSTEM_PROMPT, /## 铁律/);
    assert.match(EBOOK_SYSTEM_PROMPT, /## 关于提问/);
    assert.match(EBOOK_SYSTEM_PROMPT, /## 关于复盘/);
    assert.match(EBOOK_SYSTEM_PROMPT, /If a tool returns an error/);
    assert.match(EBOOK_SYSTEM_PROMPT, /Edit changes text inside existing files/);
    assert.match(EBOOK_SYSTEM_PROMPT, /Write creates files or rewrites complete files\/sections\/chapters/);
    assert.match(EBOOK_SYSTEM_PROMPT, /读章节与对应审稿意见/);
    assert.match(EBOOK_SYSTEM_PROMPT, /连续中段替换用 Edit startLine\/endLine/);
    assert.match(EBOOK_SYSTEM_PROMPT, /新增插入用 Edit insertAtLine/);
    assert.match(EBOOK_SYSTEM_PROMPT, /rewrites where most content is new/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /Edit `edits` must be a real, non-empty JSON array/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /Wrong: `"edits":"\[/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /Line-range and insertion items may share one Edit call/);
    assert.match(EBOOK_SYSTEM_PROMPT, /RenameBook/);
    assert.match(EBOOK_SYSTEM_PROMPT, /DelegateRun/);
    assert.match(EBOOK_SYSTEM_PROMPT, /写作伙伴/);
    assert.match(EBOOK_SYSTEM_PROMPT, /让故事更有生命/);
    assert.match(EBOOK_SYSTEM_PROMPT, /用人类的五感演绎场景/);
    assert.match(EBOOK_SYSTEM_PROMPT, /不要让人物只为完成任务而说话或行动/);
    assert.match(EBOOK_SYSTEM_PROMPT, /用户是导演，你是写手/);
    assert.match(EBOOK_SYSTEM_PROMPT, /展现你对创作的热情和天赋/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /先说结论或动作，再说理由/);
    assert.match(EBOOK_SYSTEM_PROMPT, /\[ebook-image:slotId\]/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /apply_patch|## 工具参数速记|## apply_patch 格式/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /system-reminder/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /\*\*\* Update File: book\/example\.md/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /web_search|Tavily|联网查资料/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /不要尝试 `local/);
    assert.doesNotMatch(EBOOK_SYSTEM_PROMPT, /插件源码|JS API|斜杠命令/);

    const delegateDefinition = getEbookToolDefinitions()
        .find((definition) => definition.function?.name === EBOOK_TOOL_NAMES.DELEGATE_RUN);
    assert.match(String(delegateDefinition.function.description), /`task` is required/);
    assert.match(String(delegateDefinition.function.parameters.properties.context.description), /known facts/);
    assert.doesNotMatch(String(delegateDefinition.function.description), /constraints/);
    assert.match(String(delegateDefinition.function.description), /Do not use this as a writing or editing tool/);

    const planCreate = getEbookToolDefinitions()
        .find((definition) => definition.function?.name === EBOOK_TOOL_NAMES.PLAN_CREATE);
    assert.equal(planCreate.function.parameters.properties.blockedBy.type, 'array');

    const definitions = getEbookToolDefinitions();
    const edit = definitions.find((definition) => definition.function?.name === EBOOK_TOOL_NAMES.EDIT);
    assert.match(String(edit.function.description), /oldString\/newString for local text replacement/);
    assert.match(String(edit.function.description), /replaceAll/);
    assert.match(String(edit.function.description), /Do not issue multiple Edit tool calls for the same file/);
    assert.match(String(edit.function.description), /must be a non-empty array value, not a JSON-stringified string/);
    assert.match(String(edit.function.description), /Line-range and insertion items may share one call/);
    assert.match(String(edit.function.description), /Keep oldString edits separate from line-number edits/);
    assert.match(String(edit.function.description), /Wrong: `"edits":"\[/);
    assert.match(String(edit.function.description), /Omit unused mode fields when possible/);
    assert.match(String(edit.function.description), /Correct line-range item/);
    assert.match(String(edit.function.description), /stray fields are ignored/);
    assert.match(String(edit.function.description), /If two changes overlap, merge them into one replacement/);
    assert.match(String(edit.function.description), /startLine\/endLine\/newString/);
    assert.match(String(edit.function.description), /insertAtLine\/newString/);
    assert.match(String(edit.function.description), /contiguous passage replacement/);
    assert.match(String(edit.function.description), /Read the target file first unless the exact current text is already available/);
    assert.match(String(edit.function.description), /bottom to top automatically to avoid line-number shifts/);
    assert.match(String(edit.function.description), /insertion falls inside a line range being replaced/);
    assert.match(String(edit.function.description), /Replacement line count does not need to match/);
    assert.match(String(edit.function.description), /insertAtLine inserts before that line/);
    assert.match(String(edit.function.description), /choose one mode by priority instead of failing/);
    assert.equal(Object.hasOwn(edit.function.parameters.properties, 'filePath'), true);
    assert.equal(Object.hasOwn(edit.function.parameters.properties, 'edits'), true);
    assert.equal(
        definitions.some((definition) => definition.function?.name === 'apply_patch'),
        false,
    );

    const webSearchDefinitions = getEbookToolDefinitions({ webSearchEnabled: true });
    const webSearch = webSearchDefinitions.find((definition) => definition.function?.name === EBOOK_TOOL_NAMES.WEB_SEARCH);
    assert.match(String(webSearch.function.description), /not available in the current book or imported sources/);
    assert.match(String(webSearch.function.description), /prefer LS \/ Grep \/ Read/);
    assert.equal(
        getEbookToolDefinitions({ webSearchEnabled: false })
            .some((definition) => definition.function?.name === EBOOK_TOOL_NAMES.WEB_SEARCH),
        false,
    );
});

test('Book tool definitions teach exact parameters like assistant tools', () => {
    const definitions = new Map(
        getEbookToolDefinitions({ webSearchEnabled: true })
            .map((definition) => [definition.function?.name, definition.function]),
    );

    const ls = definitions.get(EBOOK_TOOL_NAMES.LS);
    assert.match(String(ls.description), /Directory paths must be `book\/\.\.\.\/`/);
    assert.match(String(ls.parameters.properties.path.description), /Do not pass filePath/);

    assert.equal(definitions.has(EBOOK_TOOL_NAMES.GLOB), false);

    const grep = definitions.get(EBOOK_TOOL_NAMES.GREP);
    assert.match(String(grep.description), /literal text search by default/);
    assert.match(String(grep.description), /useRegex: true/);
    assert.match(String(grep.parameters.properties.outputMode.description), /files_with_matches/);

    const read = definitions.get(EBOOK_TOOL_NAMES.READ);
    assert.match(String(read.description), /argument name is `filePath`, not `path`/);
    assert.match(String(read.parameters.properties.filePath.description), /Do not pass path/);

    const write = definitions.get(EBOOK_TOOL_NAMES.WRITE);
    assert.match(String(write.description), /argument names are `filePath` and `content`/);
    assert.match(String(write.description), /complete file rewrites, whole sections, whole chapters/);
    assert.match(String(write.description), /include all original content you want to keep/);
    assert.equal(Object.hasOwn(write.parameters.properties, 'path'), false);
    assert.match(String(write.parameters.properties.filePath.description), /Target file path/);

    const edit = definitions.get(EBOOK_TOOL_NAMES.EDIT);
    assert.match(String(edit.description), /One call edits one file/);
    assert.match(String(edit.description), /edits array/);
    assert.match(String(edit.parameters.properties.edits.description), /real, non-empty JSON array, not a quoted JSON string/);
    assert.match(String(edit.parameters.properties.edits.description), /Stray optional fields are ignored by mode priority/);
    assert.match(String(edit.description), /Combine same-file changes into one Edit call/);
    assert.equal(edit.parameters.properties.edits.items.required.includes('newString'), true);
    assert.equal(edit.parameters.properties.edits.items.required.includes('oldString'), false);
    assert.equal(Object.hasOwn(edit.parameters.properties.edits.items.properties, 'startLine'), true);
    assert.equal(Object.hasOwn(edit.parameters.properties.edits.items.properties, 'insertAtLine'), true);
    assert.equal(Object.hasOwn(edit.parameters.properties, 'path'), false);
    assert.match(String(edit.parameters.properties.filePath.description), /Target file path/);

    const deleteTool = definitions.get(EBOOK_TOOL_NAMES.DELETE);
    assert.match(String(deleteTool.description), /Directory paths should end with `\/`/);

    const move = definitions.get(EBOOK_TOOL_NAMES.MOVE);
    assert.match(String(move.description), /argument names are `fromPath` and `toPath`/);

    const planUpdate = definitions.get(EBOOK_TOOL_NAMES.PLAN_UPDATE);
    assert.match(String(planUpdate.description), /Do not invent an id-like value/);

    const renameBook = definitions.get(EBOOK_TOOL_NAMES.RENAME_BOOK);
    assert.match(String(renameBook.description), /only argument is `title`/);

    const delegateRun = definitions.get(EBOOK_TOOL_NAMES.DELEGATE_RUN);
    assert.match(String(delegateRun.description), /`task` is required/);
    assert.match(String(delegateRun.description), /Do not use this as a writing or editing tool/);
});
