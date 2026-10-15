import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createAdministratorSourceTools, ADMINISTRATOR_SOURCE_PACKAGE, SOURCE_TOOL_NAMES as N } from '../apps/administrator/agent/source-tools.js';
import { OS_SOURCE_ROOT as ROOT, OS_SOURCE_RELATIVE_ROOT, OS_SOURCE_LIMITS as LIMITS } from '../apps/administrator/domain/source-code.js';
import { extensionFolderPath } from '../../../core/constants.js';

// Assertions on content protect source data and numbered output, not human-facing copy.
const publicPath = relative => `${extensionFolderPath}/${relative}`;
const sourceLines = result => result.data.content.split('\n').map(line => line.slice(line.indexOf('\t') + 1));
function fixture(contents = { [`${ROOT}/index.ts`]: 'first\nneedle\nlast', [`${ROOT}/apps/map/module.ts`]: 'map needle' }) {
    const requests = [], abort = new AbortController();
    const state = { contents, current: true, status: 200, failures: new Map(), manifest: { version: 2, files: Object.entries(contents).map(([path, text]) => ({
        source: 'littlewhitebox', publicPath: path, relativePath: path.slice(extensionFolderPath.length + 1), sizeBytes: new TextEncoder().encode(text).length,
    })) } };
    const source = createAdministratorSourceTools({ signal: abort.signal,
        assertCurrent() { if (!state.current) { throw new Error('administrator_context_changed'); } },
        async fetch(url, options) {
            requests.push({ url, options });
            const path = decodeURIComponent(url.slice(1)), status = state.failures.get(path) ?? state.status;
            if (status !== 200) { return new Response('', { status }); }
            if (path === `${extensionFolderPath}/modules/assistant/assistant-file-manifest.json`) { return Response.json(state.manifest); }
            assert.ok(Object.hasOwn(state.contents, path), `Unexpected file read: ${path}`);
            return new Response(state.contents[path]);
        },
    });
    return { source, state, requests, abort, call: (name, args = {}) => source.execute(name, args) };
}

test('LS uses the shared OS allowlist and assistant-style first-level entries with 1-based continuation', async () => {
    const f = fixture();
    f.state.manifest.files.push(
        { source: 'littlewhitebox', relativePath: 'modules/assistant/assistant.js' },
        { source: 'littlewhitebox', relativePath: `${OS_SOURCE_RELATIVE_ROOT}-other/leak.ts` },
        { source: 'sillytavern-public', relativePath: `${OS_SOURCE_RELATIVE_ROOT}/forged.ts` },
    );
    assert.ok(ADMINISTRATOR_SOURCE_PACKAGE.tools.every(tool => tool.effect === 'read'));
    assert.equal(f.requests.length, 0);
    const first = await f.call(N.ls, { path: `${ROOT}/`, limit: 1 });
    assert.equal(first.ok, true);
    assert.deepEqual(first.data.items, [{ publicPath: `${ROOT}/apps/`, source: 'littlewhitebox', type: 'directory', descendantFileCount: 1 }]);
    assert.equal(first.data.offset, 1);
    assert.equal(first.data.nextOffset, 2);
    const second = await f.call(N.ls, { path: ROOT, limit: 1, offset: first.data.nextOffset });
    assert.equal(second.data.items[0].publicPath, `${ROOT}/index.ts`);
    assert.equal(second.data.hasMoreAfter, false);
    assert.equal(second.data.nextOffset, null);
    const failed = await f.call(N.ls, { path: ROOT, offset: 3 });
    assert.equal(failed.code, 'list_offset_out_of_range');
    assert.equal(failed.data.entryCount, 2);
    assert.equal(failed.data.offset, 3);
    assert.ok(failed.data.suggestion);
    assert.equal(f.requests.length, 1);
});

test('Glob follows assistant basename, relative/public path, globstar, brace and character-class matching', async () => {
    const f = fixture();
    const expected = [`${ROOT}/apps/map/module.ts`];
    for (const pattern of ['MODULE.TS', '**/m?dule.ts', '**/{module,index}.{ts,vue}', '**/[!x]odule.ts', `${OS_SOURCE_RELATIVE_ROOT}/apps/**/*.ts`, `${ROOT}/apps/**/*.ts`]) {
        const result = await f.call(N.glob, { pattern, path: `${ROOT}/apps/` });
        assert.equal(result.ok, true);
        assert.deepEqual(result.data.items.map(item => item.publicPath), expected);
    }
    assert.equal(f.requests.length, 1);
    const large = fixture(Object.fromEntries(Array.from({ length: LIMITS.glob + 1 }, (_, i) => [`${ROOT}/${i}.ts`, ''])));
    const result = await large.call(N.glob, { pattern: '*.ts' });
    assert.equal(result.data.total, LIMITS.glob + 1);
    assert.equal(result.data.items.length, LIMITS.glob);
    assert.equal(result.data.truncated, true);
    assert.ok(result.data.suggestion);
});

test('paths cannot escape OS or bypass exact index membership; misses include usable indexed suggestions', async () => {
    const f = fixture();
    for (const filePath of ['modules/assistant/assistant.js', `${ROOT}-other/leak.ts`, `${ROOT}/../assistant/assistant.js`,
        `${ROOT}/apps/../../assistant/assistant.js`, `${ROOT}/%2e%2e/leak.ts`, `${ROOT}/%252e%252e/leak.ts`,
        `${ROOT}/apps\\..\\leak.ts`, `${ROOT}//index.ts`, `${ROOT}/index.ts?raw`, `${ROOT}/index.ts#raw`,
        `${ROOT}/index.ts\0`, `https://example.invalid/${ROOT}/index.ts`, `/${ROOT}/index.ts`, `public/${ROOT}/index.ts`]) {
        for (const [name, args] of [[N.read, { filePath }], [N.ls, { path: filePath }], [N.glob, { pattern: '**', path: filePath }], [N.grep, { pattern: 'needle', path: filePath }]]) {
            const failed = await f.call(name, args);
            assert.equal(failed.code, 'source_path_outside_scope');
            assert.equal(failed.data.path, filePath);
            assert.ok(failed.data.suggestion);
        }
    }
    assert.equal(f.requests.length, 0);
    const missing = await f.call(N.read, { filePath: `${ROOT}/wrong/module.ts` });
    assert.equal(missing.code, 'file_not_found');
    assert.deepEqual(missing.data.suggestions, [`${ROOT}/apps/map/module.ts`]);
    assert.equal((await f.call(N.ls, { path: `${ROOT}/missing` })).code, 'directory_not_found');
    assert.equal(f.requests.length, 1);
    f.state.manifest.files[0].publicPath = 'user/secrets.txt';
    assert.equal((await f.call(N.read, { filePath: `${ROOT}/index.ts` })).ok, true);
    assert.equal(f.requests.at(-1).url, `/${ROOT}/index.ts`);
});

test('schema and pattern failures explain a retry without reading file bodies', async () => {
    const f = fixture();
    for (const [name, args] of [[N.ls, {}], [N.glob, {}], [N.read, { filePath: `${ROOT}/index.ts`, tail: 0 }],
        [N.read, { filePath: `${ROOT}/index.ts`, offset: null }], [N.grep, { pattern: 'needle', useRegex: 'false' }],
        [N.grep, { pattern: ' ' }], [N.ls, { path: ROOT, scope: 'local' }]]) {
        const failed = await f.call(name, args);
        assert.equal(failed.code, 'arguments_invalid');
        assert.ok(failed.data.issues.length);
        assert.ok(failed.data.issues[0].expected);
        assert.ok(failed.data.suggestion);
    }
    for (const [name, args, code] of [[N.grep, { pattern: '[' }, 'invalid_regex'], [N.glob, { pattern: '[z-a]' }, 'invalid_glob']]) {
        const failed = await f.call(name, args);
        assert.equal(failed.code, code);
        assert.ok(failed.data.cause);
        assert.ok(failed.data.suggestion);
    }
    assert.equal((await f.call('Write', { filePath: `${ROOT}/index.ts`, content: 'changed' })).code, 'tool_unavailable');
    assert.equal(f.requests.length, 0);
});

test('Read returns numbered live contents, directory pages, tail and actionable range errors', async () => {
    const path = `${ROOT}/index.ts`, f = fixture();
    const read = await f.call(N.read, { filePath: path, offset: 2, limit: 1 });
    assert.deepEqual(sourceLines(read), ['needle']);
    assert.equal(read.data.startLine, 2);
    assert.equal(read.data.nextOffset, 3);
    const tail = await f.call(N.read, { filePath: path, tail: 1 });
    assert.deepEqual(sourceLines(tail), ['last']);
    assert.equal(tail.data.hasMoreAfter, false);
    const directory = await f.call(N.read, { filePath: ROOT, limit: 1 });
    assert.equal(directory.data.entryType, 'directory');
    assert.equal(directory.data.content, 'apps/');
    assert.equal(directory.data.nextOffset, 2);
    assert.equal((await f.call(N.read, { filePath: ROOT, offset: directory.data.nextOffset })).data.content, 'index.ts');
    const invalid = await f.call(N.read, { filePath: path, offset: 4 });
    assert.equal(invalid.code, 'read_offset_out_of_range');
    assert.equal(invalid.data.lineCount, 3);
    assert.equal(invalid.data.offset, 4);
    assert.ok(invalid.data.suggestion);
    assert.equal((await f.call(N.read, { filePath: ROOT, offset: 3 })).data.entryCount, 2);
    assert.equal((await f.call(N.read, { filePath: path, tail: 1, offset: 1 })).code, 'read_tail_range_conflict');
    assert.equal((await f.call(N.read, { filePath: ROOT, tail: 1 })).code, 'read_tail_not_supported_for_directory');
    f.state.contents[path] = 'changed';
    assert.deepEqual(sourceLines(await f.call(N.read, { filePath: path })), ['changed']);
    f.state.contents[path] = '';
    const empty = await f.call(N.read, { filePath: path });
    assert.equal(empty.data.content, '');
    assert.equal(empty.data.returnedLines, 0);
    assert.equal(empty.data.nextOffset, null);
    assert.ok(f.requests.every(({ options }) => options.cache === 'no-store' && options.redirect === 'error'));
});

test('large Read pages use nextOffset without losing lines and keep assistant output budgets', async () => {
    const path = `${ROOT}/index.ts`, lines = Array.from({ length: 2400 }, (_, i) => `line ${i} ${'x'.repeat(60)}`);
    const f = fixture({ [path]: lines.join('\n') }), collected = [];
    let offset;
    do {
        const read = await f.call(N.read, { filePath: path, ...(offset ? { offset } : {}) });
        assert.equal(read.ok, true);
        assert.ok(read.data.content.length <= LIMITS.readChars);
        assert.ok(read.data.returnedLines <= LIMITS.lines);
        collected.push(...sourceLines(read));
        offset = read.data.nextOffset;
    } while (offset !== null);
    assert.deepEqual(collected, lines);
    f.state.contents[path] = 'x'.repeat(LIMITS.lineChars + 100);
    const long = await f.call(N.read, { filePath: path, offset: 1 });
    assert.equal(long.data.returnedLines, 1);
    assert.ok(long.data.content.length < LIMITS.lineChars + 100);
    assert.equal(long.data.nextOffset, null);
});

test('streamed head stops network consumption, while tail reads the end and reports unknown absolute line numbers', async () => {
    const path = `${ROOT}/large.ts`, chunks = Array.from({ length: 10 }, (_, i) => `${Array.from({ length: 100 }, (_, j) => `line ${i * 100 + j}`).join('\n')}\n`);
    let pulled = 0, cancelled = false;
    const source = createAdministratorSourceTools({ assertCurrent() {}, async fetch(url) {
        if (url.endsWith('assistant-file-manifest.json')) { return Response.json({ version: 2, files: [{ source: 'littlewhitebox', relativePath: `${OS_SOURCE_RELATIVE_ROOT}/large.ts` }] }); }
        return new Response(new ReadableStream({
            pull(controller) { if (pulled < chunks.length) { controller.enqueue(new TextEncoder().encode(chunks[pulled++])); } else { controller.close(); } },
            cancel() { cancelled = true; },
        }));
    } });
    const head = await source.execute(N.read, { filePath: path, limit: 2 });
    assert.equal(head.data.totalLinesKnown, false);
    assert.equal(head.data.nextOffset, 3);
    assert.deepEqual(sourceLines(head), ['line 0', 'line 1']);
    assert.equal(cancelled, true);
    assert.ok(pulled < chunks.length);
    pulled = 0;
    const tail = await source.execute(N.read, { filePath: path, tail: 2 });
    assert.equal(tail.data.content, 'line 999\n');
    assert.equal(tail.data.startLine, null);
    assert.equal(tail.data.totalLinesKnown, false);
    assert.equal(tail.data.hasMoreAfter, false);
    assert.equal(pulled, chunks.length);
});

test('tail keeps the actual EOF when its requested lines exceed the output budget, for full and streamed reads', async () => {
    const path = `${ROOT}/index.ts`;
    for (const count of [40, 100]) {
        for (const trailingNewline of [false, true]) {
            const lines = Array.from({ length: count }, (_, index) => `${index}: ${'x'.repeat(LIMITS.lineChars - 10)}`);
            if (trailingNewline) { lines.push(''); }
            const f = fixture({ [path]: lines.join('\n') });
            const read = await f.call(N.read, { filePath: path, tail: lines.length });
            assert.equal(read.ok, true);
            const data = read.data;
            const returned = data.totalLinesKnown ? sourceLines(read) : data.content.split('\n');
            assert.deepEqual(returned, lines.slice(-data.returnedLines));
            assert.ok(data.returnedLines > 0 && data.returnedLines < lines.length);
            assert.ok(data.content.length <= LIMITS.readChars);
            assert.equal(data.hasMoreBefore, true);
            assert.equal(data.hasMoreAfter, false);
            assert.equal(data.nextOffset, null);
            assert.equal(data.charLimited, true);
            if (data.totalLinesKnown) {
                assert.equal(data.startLine, lines.length - data.returnedLines + 1);
                assert.equal(data.endLine, lines.length);
            } else {
                assert.equal(data.startLine, null);
                assert.equal(data.endLine, null);
            }
        }
    }
});

test('streamed head continuation rereads the unfinished line instead of skipping its unseen suffix', async () => {
    const path = `${ROOT}/large.ts`, secondLine = `${'p'.repeat(700)}suffix`, lastLine = 'last';
    const longLine = 'x'.repeat(LIMITS.readChars + LIMITS.lineChars * 2 - 700);
    const variants = [
        [`${longLine}\n`, secondLine.slice(0, 700), `${secondLine.slice(700)}\n${lastLine}`],
        [`${longLine}extra${'x'.repeat(700)}\n`, `${secondLine}\n${lastLine}`],
        [`${longLine}${'x'.repeat(700)}`, `extra\n${secondLine}\n${lastLine}`],
    ];
    for (const chunks of variants) {
        let cancelled = false;
        const source = createAdministratorSourceTools({ assertCurrent() {}, async fetch(url) {
            if (url.endsWith('assistant-file-manifest.json')) {
                return Response.json({ version: 2, files: [{ source: 'littlewhitebox', relativePath: `${OS_SOURCE_RELATIVE_ROOT}/large.ts` }] });
            }
            let position = 0;
            return new Response(new ReadableStream({
                pull(controller) {
                    if (position < chunks.length) { controller.enqueue(new TextEncoder().encode(chunks[position++])); }
                    else { controller.close(); }
                },
                cancel() { cancelled = true; },
            }, { highWaterMark: 0 }));
        } });
        const head = await source.execute(N.read, { filePath: path });
        assert.equal(head.ok, true);
        assert.equal(head.data.returnedLines, 1);
        assert.equal(head.data.nextOffset, 2);
        assert.equal(cancelled, true);
        const next = await source.execute(N.read, { filePath: path, offset: head.data.nextOffset });
        assert.equal(next.ok, true);
        assert.deepEqual(sourceLines(next), [secondLine, lastLine]);
        assert.equal(next.data.hasMoreAfter, false);
        assert.equal(next.data.nextOffset, null);
    }
});

test('streamed tail preserves the same long-line prefixes as forward Read and never starts inside a line', async () => {
    const path = `${ROOT}/index.ts`;
    for (const lines of [
        ['before', `BEGIN_FINAL:${'x'.repeat(120000)}:END_FINAL`],
        [...Array.from({ length: 70 }, (_, i) => `LINE_${i}:${'x'.repeat(1900)}`), `FINAL:${'y'.repeat(8000)}`],
    ]) {
        const f = fixture({ [path]: lines.join('\n') });
        for (const tail of [1, 100]) {
            const result = await f.call(N.read, { filePath: path, tail });
            assert.equal(result.ok, true);
            const count = result.data.returnedLines;
            const expected = await f.call(N.read, { filePath: path, offset: lines.length - count + 1, limit: count });
            assert.deepEqual(result.data.content.split('\n'), sourceLines(expected));
            assert.equal(result.data.hasMoreAfter, false);
            assert.equal(result.data.nextOffset, null);
        }
    }
});

test('streamed head advertises continuation only for a real next line, including a trailing empty line', async () => {
    const path = `${ROOT}/index.ts`, first = 'x'.repeat(120000);
    for (const ending of ['', '\n', '\nnext']) {
        for (const knownSize of [false, true]) {
            const f = fixture({ [path]: first + ending });
            if (!knownSize) delete f.state.manifest.files[0].sizeBytes;
            const result = await f.call(N.read, { filePath: path });
            assert.equal(result.ok, true);
            assert.equal(result.data.returnedLines, 1);
            assert.equal(result.data.hasMoreAfter, ending !== '');
            assert.equal(result.data.nextOffset, ending ? 2 : null);
            if (ending) {
                const next = await f.call(N.read, { filePath: path, offset: result.data.nextOffset });
                assert.equal(next.ok, true);
                assert.deepEqual(sourceLines(next), [ending.slice(1)]);
                assert.equal(next.data.hasMoreAfter, false);
                assert.equal(next.data.nextOffset, null);
            } else {
                assert.equal(result.data.totalLinesKnown, true);
                assert.equal(result.data.totalLines, 1);
            }
        }
    }
});

test('Grep paginates matching lines or matching files, supports context, regex/literal and include filters', async () => {
    const path = `${ROOT}/apps/map/module.ts`;
    const f = fixture({ [path]: 'NEEDLE\nneedle.*\nno match\nneedle', [`${ROOT}/index.ts`]: 'needle' });
    let offset = 0;
    const results = [];
    for (;;) {
        const result = await f.call(N.grep, { pattern: '^needle', limit: 1, offset });
        assert.equal(result.ok, true);
        results.push(...result.data.items.map(item => [item.path, item.line]));
        if (!result.data.truncated) { assert.equal(result.data.searchComplete, true); break; }
        offset = result.data.nextOffset;
    }
    assert.deepEqual(results, [[path, 1], [path, 2], [path, 4], [`${ROOT}/index.ts`, 1]]);
    const literal = await f.call(N.grep, { pattern: 'needle.*', useRegex: false, path: `${ROOT}/apps`, include: '**/module.ts', contextLines: 1 });
    assert.deepEqual(literal.data.items.map(item => item.line), [2]);
    assert.equal(literal.data.items[0].context, '  1: NEEDLE\n> 2: needle.*\n  3: no match');
    assert.equal(literal.data.candidateFiles, 1);
    for (const outputMode of ['files_with_matches', 'count']) {
        const first = await f.call(N.grep, { pattern: 'needle', outputMode, limit: 1 });
        assert.deepEqual(first.data.items, [{ path, source: 'littlewhitebox', matchCount: 3 }]);
        const second = await f.call(N.grep, { pattern: 'needle', outputMode, offset: first.data.nextOffset, limit: 1 });
        assert.equal(second.data.items[0].path, `${ROOT}/index.ts`);
        assert.equal(second.data.totalMatches, 4);
        assert.equal(second.data.matchedFiles, 2);
        assert.equal(second.data.searchComplete, true);
    }
});

test('a no-match search scans its candidate set; source failures report paths and causes, never complete absence', async () => {
    const path = `${ROOT}/index.ts`, other = `${ROOT}/apps/map/module.ts`, f = fixture();
    const none = await f.call(N.grep, { pattern: 'absent' });
    assert.equal(none.data.searchComplete, true);
    assert.equal(none.data.scannedFiles, 2);
    assert.equal(none.data.totalMatches, 0);
    f.state.failures.set(path, 404);
    const partial = await f.call(N.grep, { pattern: 'needle' });
    assert.equal(partial.data.items[0].path, other);
    assert.equal(partial.data.skippedFiles, 1);
    assert.deepEqual(partial.data.skippedPaths, [path]);
    assert.equal(partial.data.readErrors[0].status, 404);
    assert.equal(partial.data.readErrors[0].path, path);
    assert.ok(partial.data.readErrors[0].suggestion);
    assert.equal(partial.data.searchComplete, false);
    assert.equal(partial.data.totalMatches, undefined);
    const failed = await f.call(N.read, { filePath: path });
    assert.equal(failed.code, 'source_fetch_failed');
    assert.equal(failed.data.status, 404);
    assert.equal(failed.data.path, path);
    assert.ok(failed.data.cause);
});

test('index failures can retry and malformed indexes fail without fetching source', async () => {
    const f = fixture();
    f.state.status = 503;
    assert.equal((await f.call(N.ls, { path: ROOT })).code, 'source_fetch_failed');
    f.state.status = 200;
    assert.equal((await f.call(N.ls, { path: ROOT })).ok, true);
    for (const manifest of [null, {}, { version: 1, files: [] }, { version: 2, files: {} }]) {
        const invalid = fixture(); invalid.state.manifest = manifest;
        assert.equal((await invalid.call(N.ls, { path: ROOT })).code, 'source_manifest_invalid');
        assert.equal(invalid.requests.length, 1);
    }
    const escaped = fixture();
    escaped.state.manifest.files.push({ source: 'littlewhitebox', relativePath: `${OS_SOURCE_RELATIVE_ROOT}/../secret.ts` });
    assert.equal((await escaped.call(N.ls, { path: ROOT })).code, 'source_path_outside_scope');
    assert.equal(escaped.requests.length, 1);
});

test('cancel and chat switch propagate before IO and after pending response/body instead of becoming skipped files', async () => {
    for (const kind of ['abort', 'chat']) {
        const f = fixture();
        if (kind === 'abort') { f.abort.abort(); } else { f.state.current = false; }
        await assert.rejects(f.call(N.ls, { path: ROOT }), kind === 'abort' ? { name: 'AbortError' } : { message: 'administrator_context_changed' });
        assert.equal(f.requests.length, 0);
        for (const phase of ['response', 'body']) {
            const abort = new AbortController();
            let current = true;
            function stop() { if (kind === 'abort') { abort.abort(); } else { current = false; } }
            const source = createAdministratorSourceTools({ signal: abort.signal, assertCurrent() { if (!current) { throw new Error('administrator_context_changed'); } }, async fetch(url) {
                if (url.endsWith('assistant-file-manifest.json')) { return Response.json(f.state.manifest); }
                if (phase === 'response') { stop(); }
                return { ok: true, async text() { if (phase === 'body') { stop(); } return 'needle'; } };
            } });
            await assert.rejects(source.execute(N.grep, { pattern: 'needle' }), kind === 'abort' ? { name: 'AbortError' } : { message: 'administrator_context_changed' });
        }
    }
});

test('documented OS examples execute against the shipped assistant manifest and current source', async () => {
    const manifest = JSON.parse(await readFile(new URL('../../assistant/assistant-file-manifest.json', import.meta.url), 'utf8'));
    const relative = `${OS_SOURCE_RELATIVE_ROOT}/apps/administrator/descriptor.ts`, path = publicPath(relative);
    const expected = await readFile(new URL('../../../' + relative, import.meta.url), 'utf8');
    const f = fixture({ [path]: expected }); f.state.manifest = manifest;
    for (const directory of [`${ROOT}/`, `${ROOT}/apps/`]) {
        assert.equal((await f.call(N.ls, { path: directory })).ok, true);
        assert.equal((await f.call(N.read, { filePath: directory })).ok, true);
    }
    const glob = await f.call(N.glob, { pattern: `${ROOT}/apps/**/*.ts` });
    assert.ok(glob.data.items.length);
    for (const include of ['**/*.ts', `${OS_SOURCE_RELATIVE_ROOT}/apps/administrator/**/*.ts`]) {
        const grep = await f.call(N.grep, { pattern: 'ADMINISTRATOR_APP_DESCRIPTOR', path, include });
        assert.equal(grep.data.items[0].path, path);
    }
    const result = await f.call(N.read, { filePath: path });
    assert.equal(result.ok, true);
    assert.equal(sourceLines(result).join('\n'), expected);
});
