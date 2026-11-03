import test from 'node:test';
import assert from 'node:assert/strict';

import { inferResourceIdBySpeaker, isTts2Voice, TTS2_VOICE_INFO, VOICE_DATA } from '../tts-voices.js';

test('内置音色使用目录声明的模型资源', () => {
    const tts2Ids = new Set(TTS2_VOICE_INFO.map(voice => voice.value));
    for (const voice of VOICE_DATA) {
        const expected = tts2Ids.has(voice.value) ? 'seed-tts-2.0' : 'seed-tts-1.0';
        assert.equal(inferResourceIdBySpeaker(voice.value), expected, voice.value);
        assert.equal(isTts2Voice(voice.value), expected === 'seed-tts-2.0', voice.value);
    }
});

test('自定义音色保留显式资源类型并兼容标准 2.0 ID', () => {
    assert.equal(inferResourceIdBySpeaker('custom_voice', 'seed-tts-2.0'), 'seed-tts-2.0');
    assert.equal(inferResourceIdBySpeaker('S_custom_voice', 'seed-icl-1.0'), 'seed-icl-1.0');
    assert.equal(inferResourceIdBySpeaker('icl_custom_voice'), 'seed-icl-2.0');
    assert.equal(inferResourceIdBySpeaker('zh_female_custom_uranus_bigtts'), 'seed-tts-2.0');
    assert.equal(inferResourceIdBySpeaker('zh_female_custom_moon_bigtts'), 'seed-tts-1.0');
});

test('代表性新旧内置音色映射到正确资源', () => {
    assert.equal(inferResourceIdBySpeaker('zh_female_wanqudashu_moon_bigtts'), 'seed-tts-1.0');
    assert.equal(inferResourceIdBySpeaker('zh_female_cancan_mars_bigtts'), 'seed-tts-1.0');
    assert.equal(inferResourceIdBySpeaker('zh_female_vv_uranus_bigtts'), 'seed-tts-2.0');
    assert.equal(inferResourceIdBySpeaker('zh_female_sophie_uranus_bigtts'), 'seed-tts-2.0');
    assert.equal(inferResourceIdBySpeaker('zh_female_mizai_saturn_bigtts'), 'seed-tts-2.0');
    assert.equal(isTts2Voice('zh_female_sophie_uranus_bigtts'), true);
});
