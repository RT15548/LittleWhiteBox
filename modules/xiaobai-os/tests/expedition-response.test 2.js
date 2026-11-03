import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeNarrativeReply } from '../apps/game/expedition/narrative/response.ts';

const fence = (text, language = '') => `\`\`\`${language}\n${text}\n\`\`\``;
const controls = { action: 'follow', clothing: { outer: '带有 "{}[]" 花纹、反斜杠 \\ 和 <dialogue> 字样的外套\n衣角收拢。' },
    affection: 'up', performance: { expression: 'serious', gesture: 'gesture' } };
const json = JSON.stringify(controls);
const body = '<dialogue>我跟你走。</dialogue>';

test('one operation object survives prose and independent or nested code fences', () => {
    for (const wrapBody of [text => text, text => fence(text, 'php-template')]) {
        for (const wrapJson of [text => text, text => fence(text), text => fence(text, 'json')]) {
            const content = `${wrapBody(body)}\n正文后的说明。\n${wrapJson(json)}\n操作后的说明。`;
            for (const wrapAll of [text => text, text => fence(text, 'php-template')]) {
                const text = `开头的说明。\n${wrapAll(content)}\n末尾的说明。`;
                assert.deepEqual(decodeNarrativeReply(text), { reply: '我跟你走。', complete: true, controls });
                assert.deepEqual(decodeNarrativeReply(text.replaceAll('\n', '\r\n')), { reply: '我跟你走。', complete: true, controls });
            }
        }
    }
});

test('objects in the preamble or dialogue are not operations', () => {
    const reply = '她指着纸条：{"action":"stay"}，没有执行。';
    const text = `{"action":"stay"}\n<dialogue>${reply}</dialogue>\n说明。\n${json}`;
    assert.deepEqual(decodeNarrativeReply(text), { reply, complete: true, controls });
    assert.equal(decodeNarrativeReply(`<dialogue>${reply}</dialogue>`).controls, null);
});

test('damaged, nested-only or multiple operation objects cannot be salvaged into actions', () => {
    for (const suffix of [
        `${json}\n${json}`, `${fence(json, 'json')}\n说明。\n${fence('{"action":"stay"}')}`,
        `[${json}]`, `{"outer":${json}`, `{"action":"follow",}`, `${json}\n{"action":`,
        `{"clothing": {"outer": "unfinished}`, `{"action":"stay", "clothing": ${json}]`,
        `<dialogue>第二段正文。</dialogue>\n${json}`, `${json}\n<dialogue>第二段正文。`,
    ]) {
        assert.deepEqual(decodeNarrativeReply(`${body}\n${suffix}`), { reply: '我跟你走。', complete: true, controls: null });
    }
});

test('a missing or unclosed body cannot activate surrounded controls', () => {
    for (const text of [json, `说明。\n${fence(json)}`, `<dialogue>未写完\n${json}`]) {
        assert.equal(decodeNarrativeReply(text)?.controls ?? null, null);
    }
});
