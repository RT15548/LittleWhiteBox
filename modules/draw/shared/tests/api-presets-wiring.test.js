// API 配置预设的接线层：三个 Provider 的字段白名单、设置规范化 / 存储、“保存”同步与页面挂载点的源码级断言，
// 以及“预设不进入角色库导入导出”。NovelAI 页面的行为测试在 novel-draw-panel.test.js（vm 里跑真实页面脚本）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { mergeNovelDrawProviderSettingsIntoStorageRoot } from '../draw-settings.js';

const read = relative => readFileSync(new URL(relative, import.meta.url), 'utf8');

const NOVEL_JS = read('../../providers/novelai/novel-draw.js');
const NOVEL_HTML = read('../../providers/novelai/novel-draw.html');
const SD_JS = read('../../providers/sd-webui/sd-draw.js');
const SD_HTML = read('../../providers/sd-webui/sd-draw.html');
const COMFY_JS = read('../../providers/comfyui/comfy-draw.js');
const COMFY_HTML = read('../../providers/comfyui/comfy-draw.html');

function fieldList(source, name) {
    const match = source.match(new RegExp(`${name}\\s*=\\s*(?:Object\\.freeze\\()?\\[([^\\]]*)\\]`));
    assert.ok(match, `找不到字段清单 ${name}`);
    return match[1].split(',').map(item => item.trim().replace(/^'|'$/g, '')).filter(Boolean);
}

test('NovelAI keeps one field whitelist in the host and the same one in the page', () => {
    const host = fieldList(NOVEL_JS, 'NOVEL_API_PRESET_FIELDS');
    const page = fieldList(NOVEL_HTML, 'API_PRESET_FIELDS');
    assert.deepEqual(page, host);
    assert.deepEqual(host, ['apiKey', 'apiBaseUrl', 'sendMode', 'useImageBackendJobs', 'insecureTLS', 'timeout', 'requestDelay']);
});

test('SD WebUI and ComfyUI whitelist only their own API page fields', () => {
    assert.deepEqual(fieldList(SD_JS, 'SD_API_PRESET_FIELDS'), ['host', 'auth', 'timeout', 'useImageBackendJobs']);
    assert.deepEqual(fieldList(COMFY_JS, 'COMFY_API_PRESET_FIELDS'), ['connectionMode', 'host', 'auth', 'timeout', 'useImageBackendJobs']);
});

test('each provider normalizes and stores apiPresets / activeApiPresetId with its own whitelist', () => {
    assert.match(NOVEL_JS, /\.\.\.normalizeApiPresetState\(source, NOVEL_API_PRESET_OPTIONS\)/);
    assert.match(SD_JS, /\.\.\.normalizeApiPresetState\(raw, SD_API_PRESET_OPTIONS\)/);
    assert.match(COMFY_JS, /\.\.\.normalizeApiPresetState\(raw, COMFY_API_PRESET_OPTIONS\)/);
    for (const source of [NOVEL_JS, SD_JS, COMFY_JS]) {
        assert.match(source, /apiPresets: \[\],\s*activeApiPresetId: null,/);
    }
});

test('the NovelAI shared storage root keeps apiPresets and activeApiPresetId when a provider or shared save merges', () => {
    const provider = {
        apiKey: 'k', apiPresets: [{ id: 'a', name: 'A', config: { apiKey: 'k' } }], activeApiPresetId: 'a', characterTags: [{ name: 'leak' }],
    };
    const merged = mergeNovelDrawProviderSettingsIntoStorageRoot({ timeout: 90000 }, provider);
    assert.deepEqual(merged.apiPresets, provider.apiPresets);
    assert.equal(merged.activeApiPresetId, 'a');
    assert.equal(merged.timeout, 90000);
});

test('NovelAI Save asks the host to sync the active preset and the host handles preset saves', () => {
    assert.match(NOVEL_HTML, /syncApiPreset: true/);
    assert.match(NOVEL_JS, /data\.syncApiPreset === true/);
    assert.match(NOVEL_JS, /case 'SAVE_API_PRESETS'/);
    assert.match(NOVEL_JS, /apiPresets: settings\.apiPresets \|\| \[\],\s*activeApiPresetId: settings\.activeApiPresetId \|\| null,/);
});

test('SD WebUI and ComfyUI Save sync the active preset, switching applies only the API fields', () => {
    for (const [source, fill] of [[SD_JS, 'fillSdApiConfigForm'], [COMFY_JS, 'fillComfyApiConfigForm']]) {
        assert.match(source, /syncApiPreset: true,/);
        assert.match(source, /syncApiPreset \? withSyncedApiPreset\(readForm\(\)\) : readForm\(\)/);
        assert.match(source, new RegExp(`change\\.reason === 'select'\\) ${fill}\\(`));
        assert.match(source, /Object\.assign\(draft, applied\)/);
    }
});

test('every API config page mounts the shared preset bar at the top of its card', () => {
    assert.match(NOVEL_HTML, /<div class="card">\s*<div id="nd_api_presets" class="preset-bar"><\/div>\s*<div class="form-group">\s*<label class="form-label">NovelAI API Key/);
    assert.match(SD_HTML, /<div class="card">\s*<div id="sd-api-presets" class="preset-bar"><\/div>\s*<div class="form-group">\s*<label class="form-label">SD WebUI 地址/);
    assert.match(COMFY_HTML, /<div class="card">\s*<div id="comfy-api-presets" class="preset-bar"><\/div>\s*<div class="form-group">\s*<label class="form-label">连接方式/);
    assert.match(NOVEL_HTML, /import\('\.\.\/\.\.\/shared\/api-presets-ui\.js'\)/);
    assert.match(SD_JS, /from "\.\.\/\.\.\/shared\/api-presets-ui\.js"/);
    assert.match(COMFY_JS, /from "\.\.\/\.\.\/shared\/api-presets-ui\.js"/);
});

test('API presets never reach the character library import / export, logs or toasts', () => {
    for (const file of ['character-library.js', 'character-library-dialog.js', 'character-library-ui.js']) {
        assert.doesNotMatch(read(`../${file}`), /apiPresets|apiKey|activeApiPresetId/, file);
    }
    for (const file of ['api-presets.js', 'api-presets-ui.js']) {
        const source = read(`../${file}`);
        assert.doesNotMatch(source, /console\.(log|info|debug)\(/, file);
        assert.doesNotMatch(source, /toastr|localStorage|fetch\(/, file);
    }
    assert.doesNotMatch(read('../api-presets.js'), /^import /m, '纯函数模块零依赖');
});
