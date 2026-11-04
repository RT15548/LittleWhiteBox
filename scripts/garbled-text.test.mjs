import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { scanGarbledText, VERIFIED_REPLACEMENT_CHARACTERS } from './garbled-text.mjs';

const root = path.resolve(import.meta.dirname, '..');
const reviewed = VERIFIED_REPLACEMENT_CHARACTERS;
const artifact = fs.readFileSync(path.join(root, reviewed.file));

// 契约：只豁免已人工核实的依赖占位字符，不能放过别处的相同字符；代价是损坏内容被静默发布。
test('only the reviewed artifact and character positions are exempt', () => {
    assert.deepEqual(scanGarbledText(reviewed.file, artifact), []);
    const sourceHits = scanGarbledText('modules/example.js', artifact);
    assert.deepEqual(sourceHits.map(hit => hit.offset), [...reviewed.offsets]);
    assert.equal(scanGarbledText('dist/other.js', artifact).length, reviewed.offsets.length);
});

// 契约：同一产物、同一行或其他行出现的新乱码必须报错，内容变化也必须撤销旧豁免；代价同上。
test('new corruption on the same line or another line is still reported', () => {
    const broken = `const broken="\uFFFD${'?'.repeat(3)}";`;
    for (const [prefix, suffix] of [[broken, ''], ['', `\n${broken}`]]) {
        const bytes = Buffer.concat([Buffer.from(prefix), artifact, Buffer.from(suffix)]);
        const content = bytes.toString('utf8');
        const addedAt = prefix ? 0 : artifact.toString('utf8').length + 1;
        const hits = scanGarbledText(reviewed.file, bytes);
        const expectedOffsets = [...content.matchAll(/\uFFFD|\?{3}/g)].map(match => match.index);
        assert.deepEqual(hits.map(hit => hit.offset).sort((a, b) => a - b), expectedOffsets);
        const added = hits.find(hit => hit.offset === addedAt + broken.indexOf('\uFFFD'));
        assert.ok(added);
        assert.ok(added.preview.includes(broken));
    }
});

// 契约：UTF-8 字节损坏即便解码后看起来相同也不能沿用豁免；代价是编码损坏漏检。
test('the review fingerprint checks bytes rather than already decoded text', () => {
    const content = artifact.toString('utf8');
    const byteOffset = Buffer.byteLength(content.slice(0, reviewed.offsets[0]));
    const corrupted = Buffer.concat([
        artifact.subarray(0, byteOffset), Buffer.from([0xff]),
        artifact.subarray(byteOffset + Buffer.byteLength('\uFFFD')),
    ]);
    assert.equal(corrupted.toString('utf8'), content);
    assert.equal(scanGarbledText(reviewed.file, corrupted).length, reviewed.offsets.length);
});

// 契约：真实检查入口必须继续扫描源码和构建产物，不能由文件收集阶段绕过；代价是检查覆盖缺失。
test('the CLI still scans source, other outputs and changes to the reviewed output', t => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lwb-garbled-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    fs.writeFileSync(path.join(directory, '.gitignore'), '');
    const target = path.join(directory, reviewed.file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, artifact);
    const run = () => spawnSync(process.execPath, [path.join(root, 'scripts/check-garbled.js')], { cwd: directory });
    assert.equal(run().status, 0);
    for (const file of ['modules/example.js', 'dist/other.js', 'dist/view.html', 'dist/style.css']) {
        const fixture = path.join(directory, file);
        fs.mkdirSync(path.dirname(fixture), { recursive: true });
        fs.writeFileSync(fixture, '\uFFFD');
        assert.equal(run().status, 1, file);
        fs.unlinkSync(fixture);
    }
    fs.appendFileSync(target, '\nconst broken="\uFFFD";');
    assert.equal(run().status, 1);
});
