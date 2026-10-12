import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectMessageProse } from '../vector/utils/message-prose.js';

test('functional image/dice/TTS markers do not contribute to story prose', () => {
    const prose = '她走进屋内。\n窗外下着雨。';
    for (const marker of ['[image:slot-1]', '[IMAGE : slot_2]', '[img:rain, house]', '[图片 : 雨天]', '[dice:check_1]', '[tts:emotion=happy]']) {
        assert.equal(projectMessageProse(`她走进屋内。\n${marker}\n\n窗外下着雨。`), '她走进屋内。\n\n\n窗外下着雨。');
        assert.equal(projectMessageProse(prose + '\n' + marker), prose + '\n');
        assert.equal(projectMessageProse(marker), '');
    }
});

test('prose without owned markers keeps whitespace byte for byte', () => {
    for (const prose of ['甲。\n\n乙。', 'a  b\t c', '甲。\r\n\r\n乙。', '\t first\rsecond \n']) {
        assert.equal(projectMessageProse(prose), prose);
    }
});

test('voice controls retain speech, including adjacent plain and emotional voice markers', () => {
    for (const name of ['voice', '语音']) {
        assert.equal(projectMessageProse(`[${name}:你好] [${name}:happy:欢迎回来]`), '你好 欢迎回来');
        assert.equal(projectMessageProse(`[${name}:sad:欢迎回来]`), '欢迎回来');
        assert.equal(projectMessageProse(`[${name}:happy:time: 10:00]`), 'time: 10:00');
    }
});

test('unknown brackets and image request examples are not silently erased', () => {
    for (const text of ['[inventory:sword]', '[image:not a slot]', '`[img:example]`', '\\[img:example]', '<code>[img:example]</code>']) {
        assert.equal(projectMessageProse(text), text);
    }
    assert.equal(projectMessageProse('red door'), 'red door');
    assert.notEqual(projectMessageProse('red door'), projectMessageProse('reddoor'));
});
