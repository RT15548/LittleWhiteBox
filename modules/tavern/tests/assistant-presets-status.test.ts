import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildDefaultStatusPanelPrompt,
    buildTavernManagerSystemPrompt,
    createDefaultTavernAssistantPreset,
    normalizeTavernAssistantPreset,
} from '../shared/assistant-presets';

test('default assistant preset carries an editable status panel section', () => {
    const preset = createDefaultTavernAssistantPreset();
    assert.match(preset.statusPrompt, /^状态栏设定/);
    assert.match(preset.statusPrompt, /数值可标范围，0-100。标签动态增删。物品可带数量和来历。/);
    assert.match(preset.statusPrompt, /—— 第一页【概览】——/);
    assert.match(preset.statusPrompt, /身体（数值，0-100）/);
    assert.match(preset.statusPrompt, /重要NPC对"我"的好感度，每个NPC一条/);
    assert.match(preset.statusPrompt, /持有的物品、线索、钥匙、消耗品等/);
    assert.match(buildDefaultStatusPanelPrompt(), /新NPC出现时加在这里/);
    assert.doesNotMatch(preset.statusPrompt, /Material Symbols/);
    assert.doesNotMatch(preset.statusPrompt, /\bicon\b/);
    assert.doesNotMatch(preset.statusPrompt, /\bblock\b/);

    const normalized = normalizeTavernAssistantPreset({
        id: 'custom',
        name: 'Custom',
        statusPrompt: '',
    });
    assert.match(normalized.statusPrompt, /^状态栏设定/);
});

test('manager system prompt includes status rules only when status is authorized', () => {
    const preset = {
        statePrompt: 'STATE_RULE',
        characterPrompt: 'CHAR_RULE',
        statusPrompt: 'STATUS_RULE',
    };
    const withStatus = buildTavernManagerSystemPrompt(preset, {
        includeMemory: true,
        includeCartography: false,
        includeStatus: true,
        includeQuestOrchestration: false,
    });
    assert.match(withStatus, /## Status Panel/);
    assert.match(withStatus, /StatusRead reads the full status panel/);
    assert.match(withStatus, /StatusInit \*\*once\*\* to build the full skeleton/);
    assert.match(withStatus, /Gauge display mapping/);
    assert.match(withStatus, /"百分比" \/ "percent", set `display: "percent"`/);
    assert.match(withStatus, /"点阵" \/ "dots", set `display: "dots"`/);
    assert.match(withStatus, /Ongoing maintenance uses StatusPatch only/);
    assert.match(withStatus, /<状态栏设定>\s*STATUS_RULE\s*<\/状态栏设定>/);
    assert.match(withStatus, /STATUS_RULE/);

    const withoutStatus = buildTavernManagerSystemPrompt(preset, {
        includeMemory: true,
        includeCartography: false,
        includeStatus: false,
        includeQuestOrchestration: false,
    });
    assert.doesNotMatch(withoutStatus, /## Status Panel/);
    assert.doesNotMatch(withoutStatus, /<状态栏设定>/);
    assert.doesNotMatch(withoutStatus, /STATUS_RULE/);
    assert.match(withoutStatus, /STATE_RULE/);
    assert.match(withoutStatus, /CHAR_RULE/);
});
