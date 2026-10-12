import assert from 'node:assert/strict';
import test from 'node:test';
import { readSummaryPackageData, SUMMARY_MEMORY_PACKAGE } from '../data/summary-import.js';

// Current user-facing export protocol, not an internal store snapshot.
const exportedData = {
    keywords: [], events: [], characters: { main: [] }, characterAliases: [], arcs: [],
    facts: [{ 人物名字: '张三', 种类: '职业', 描述: '医生', 核心事实: true }],
};
const exportedPackage = () => ({ ...SUMMARY_MEMORY_PACKAGE, data: structuredClone(exportedData) });

test('normal exported memory packages retain their contents, including an empty facts list', () => {
    for (const facts of [exportedData.facts, []]) {
        const raw = exportedPackage();
        raw.data.facts = structuredClone(facts);
        const before = structuredClone(raw);
        assert.deepEqual(readSummaryPackageData(raw), raw.data);
        assert.deepEqual(raw, before);
    }
});

const internalData = { events: [], facts: [{ s: '张三', p: '职业', o: '医生' }] };
for (const [kind, raw] of [
    ['bare internal data', internalData],
    ['internal store wrapper', { json: internalData }],
    ['chat metadata wrapper', { storySummary: { json: internalData } }],
    ['bare portable data', exportedData],
    ['different package type', { ...exportedPackage(), type: 'OtherMemory' }],
    ['unsupported version', { ...exportedPackage(), version: 2 }],
    ['internal facts in a portable envelope', { ...SUMMARY_MEMORY_PACKAGE, data: internalData }],
    ['missing data', { ...SUMMARY_MEMORY_PACKAGE }],
]) {
    test(`import refuses ${kind} instead of accepting it and discarding facts`, () => {
        const before = structuredClone(raw);
        assert.throws(() => readSummaryPackageData(raw), error => error.code === 'summary_import_unsupported');
        assert.deepEqual(raw, before);
    });
}
