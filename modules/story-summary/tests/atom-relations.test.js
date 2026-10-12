import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { build } from 'esbuild';
import { ANCHOR_GENERATION_EXAMPLES } from '../data/generation-rules.js';
import { buildRAggregateText } from '../vector/pipeline/state-vector-input.js';

// Exercise the public extractor with a controlled model response. Only host
// logging, configured text filtering and the network boundary are substituted.
const bundled = await build({
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'extraction-boundaries', setup(api) {
        api.onResolve({ filter: /(?:llm-service|text-filter|debug-core)\.js$/ }, args => ({ path: path.basename(args.path), namespace: 'boundary' }));
        api.onLoad({ filter: /.*/, namespace: 'boundary' }, args => ({ contents:
            args.path.endsWith('llm-service.js')
                ? `let response, request;
                    export function setResponse(value) { response = value; }
                    export function getRequest() { return request; }
                    export async function callLLM(messages, options) {
                        request = { messages, options };
                        return JSON.stringify(response);
                    }`
                : args.path.endsWith('text-filter.js') ? 'export const filterText = text => text;'
                    : 'export const xbLog = { info() {}, warn() {}, error() {} };',
        }));
    } }],
    stdin: { contents: [
        "export { extractAtomsForRound } from './modules/story-summary/vector/llm/atom-extraction.js';",
        "export { setResponse, getRequest } from './modules/story-summary/vector/llm/llm-service.js';",
    ].join('\n'), resolveDir: process.cwd() },
});
// eslint-disable-next-line no-unsanitized/method -- Locally compiled product code and fixed test stubs.
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const scene = '甲在会议室再次拒绝乙提出的交易，并明确说明保留原有协议的理由。';
async function extract(edges) {
    mod.setResponse({ anchors: [{ scene, edges, where: '会议室' }] });
    return mod.extractAtomsForRound(null, { mes: scene }, 8);
}

test('model relations retain recurrence, aspect, objects and word boundaries through extraction and vector input', async () => {
    const relations = [
        '再次拒绝交易', '继续等待答复', '开始调查原因', '正在核查证据',
        '提出非常规交易', '说明与对方继续合作必须满足的具体条件', '确认交易已经通过',
        'refuses to sign again', '拒绝交易，但继续协商',
    ];
    for (const relation of relations) {
        const [atom] = await extract([{ s: '甲', t: '乙', r: relation }]);
        assert.deepEqual(atom.edges, [{ s: '甲', t: '乙', r: relation.normalize('NFKC') }]);
        assert.equal(atom.semantic, scene);
        assert.equal(atom.where, '会议室');
        assert.equal(buildRAggregateText(atom), relation.normalize('NFKC'));
    }
});

test('relation preservation retains empty-edge rejection, edge limit and harmless text cleanup', async () => {
    const [atom] = await extract([null, {}, { s: '甲', t: '', r: '再次拒绝交易' },
        { s: '甲', t: '乙', r: '\u200b ' }, { s: '甲', t: '乙', r: '好' },
        { s: '甲', t: '乙', r: ' ， 。 ' }, { s: '甲', t: '乙', r: '好。' },
        { s: ' 甲 ', t: '乙 ', r: ' \u200b再次拒绝交易\ufeff ' },
        { s: '乙', t: '甲', r: '继续请求协商' }, { s: '甲', t: '乙', r: '开始说明原因' },
        { s: '乙', t: '甲', r: '正在记下条件' }]);
    assert.deepEqual(atom.edges, [
        { s: '甲', t: '乙', r: '再次拒绝交易' },
        { s: '乙', t: '甲', r: '继续请求协商' },
        { s: '甲', t: '乙', r: '开始说明原因' },
    ]);
    const [empty] = await extract(null);
    assert.deepEqual(empty.edges, []);
    assert.equal(buildRAggregateText(empty), scene);
});

test('extraction budgets the complete response and preserves both detailed and short scene cards', async () => {
    // Controlled model output checks the request/data boundary, not model quality.
    const anchors = [
        {
            scene: '6月1日，林舟在档案室把蓝色文件袋交给陈宁，说明袋内有三份借阅单，缺少的第四份仍在核对，不能据此认定资料遗失。陈宁核对封口上的编号后收下文件袋，答应6月3日上午带原始登记簿到会议室逐项复核；林舟随后锁好档案柜，把钥匙留在自己口袋里。',
            edges: [{ s: '林舟', t: '陈宁', r: '交付文件并约定复核' }],
            where: '档案室',
        },
        { scene, edges: [{ s: '甲', t: '乙', r: '再次拒绝交易' }], where: '会议室' },
    ];
    mod.setResponse({ anchors });
    const atoms = await mod.extractAtomsForRound(null, { mes: anchors.map(anchor => anchor.scene).join('\n') }, 8);
    assert.equal(mod.getRequest().options.max_tokens, 1200);
    assert.deepEqual(atoms.map(atom => ({ scene: atom.semantic, edges: atom.edges, where: atom.where })), anchors);
    assert.ok(atoms.every(atom => atom.floor === 8));
});

test('L0 prompt example responses preserve their scene, relations and location through extraction', async () => {
    // Execute the model-facing examples through the actual response boundary.
    // A controlled response verifies protocol validity, not model generation quality.
    for (const { anchor } of ANCHOR_GENERATION_EXAMPLES) {
        mod.setResponse({ anchors: [anchor] });
        const atoms = await mod.extractAtomsForRound(null, { mes: anchor.scene }, 30);
        assert.deepEqual(atoms.map(atom => ({ scene: atom.semantic, edges: atom.edges, where: atom.where })), [anchor]);
    }
});
