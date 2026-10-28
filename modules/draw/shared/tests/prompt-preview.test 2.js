import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';

import { getPromptChainPreview as getNovelPreview } from '../../providers/novelai/novel-prompts.js';
import * as sdPrompts from '../../providers/sd-webui/sd-prompts.js';
import * as comfyPrompts from '../../providers/comfyui/comfy-prompts.js';
import { buildScenePlannerTask } from '../scene-planner.js';
import { buildScenePlannerSystemPrompt } from '../scene-planner-frame.js';
import { renderScenePlannerChain } from '../scene-planner-chain-view.js';

const getSdPreview = sdPrompts.getPromptChainPreview;
const getComfyPreview = comfyPrompts.getPromptChainPreview;

test('all provider previews expose the real system, user and tool request shape', () => {
    for (const [provider, getPreview, modelName] of [
        ['NovelAI', (prompts) => getNovelPreview(prompts, 'nai-diffusion-4-5-full'), 'NovelAI Diffusion V4.5'],
        ['SD WebUI', getSdPreview, 'Stable Diffusion WebUI'],
        ['ComfyUI', getComfyPreview, 'ComfyUI'],
    ]) {
        const preview = getPreview({ tagGuideContent: 'loaded guide' });
        assert.deepEqual(preview.map(item => item.role), ['system', 'user', 'tools'], `${provider} 顶层必须是 system / user / tools`);

        const [system, user, tools] = preview;
        assert.deepEqual(
            system.sections.map(section => section.key),
            ['topSystem', 'frame', 'tagGuide', 'sceneRules'],
            `${provider} system 段落顺序`,
        );
        assert.deepEqual(
            system.sections.filter(section => section.editable).map(section => section.key),
            ['topSystem', 'tagGuide', 'sceneRules'],
            `${provider} 只有三段可编辑`,
        );
        assert.match(system.sections[1].content, new RegExp(modelName));
        assert.match(system.sections[2].summary, new RegExp(modelName));

        assert.equal(user.key, 'userTask');
        assert.deepEqual(user.sections.map(section => section.key), ['worldInfo', 'content', 'limits']);

        const fieldPaths = tools.fields.map(field => field.path);
        assert.ok(fieldPaths.includes('images[].scene'), `${provider} 工具字段表必须包含 scene`);
        assert.ok(fieldPaths.includes('images[].characters[].interact'));
        assert.equal(fieldPaths.includes('images[].characters[].center'), provider === 'NovelAI', `${provider} center 字段仅 NovelAI 暴露`);
    }
});

test('cleared editable sections stay empty in the preview and prepared request; missing fields use defaults', async (t) => {
    const { document } = parseHTML('<html><body><div id="chain"></div></body></html>');
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    globalThis.document = document;
    t.after(() => {
        if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
        else delete globalThis.document;
    });
    const defaults = {
        topSystem: 'default opening',
        tagGuideContent: 'default guide',
        sceneRules: 'default rules',
    };
    const inputs = Object.fromEntries(['topSystem', 'tagGuide', 'sceneRules'].map(key => [key, document.createElement('textarea')]));
    const build = (customPrompts) => buildScenePlannerTask({
        messageText: '雨停了。',
        promptDefaults: defaults,
        customPrompts,
        expansionOptions: { runtime: { substituteParams: text => text } },
    });
    const expected = (config) => buildScenePlannerSystemPrompt({
        opening: config.topSystem,
        guide: config.tagGuideContent,
        sceneRules: config.sceneRules,
    });
    const container = document.getElementById('chain');
    for (const [key, sectionKey] of [['topSystem', 'topSystem'], ['tagGuideContent', 'tagGuide'], ['sceneRules', 'sceneRules']]) {
        for (const value of ['', ' \n\t ']) {
            const config = { ...defaults, [key]: value };
            for (const [field, section] of [['topSystem', 'topSystem'], ['tagGuideContent', 'tagGuide'], ['sceneRules', 'sceneRules']]) {
                inputs[section].value = config[field];
            }
            renderScenePlannerChain(container, getSdPreview(config), { getEditable: section => inputs[section] });
            const section = container.querySelector(`[data-key="${sectionKey}"]`);
            section.click();
            assert.equal(section.querySelector('.chain-section-content').textContent, '(当前为空，不注入)');
            const task = await build({ [key]: value });
            assert.equal(task.systemPrompt, expected(config));
        }
    }
    for (const customPrompts of [undefined, {}, { topSystem: null, tagGuideContent: null, sceneRules: null }]) {
        assert.equal((await build(customPrompts)).systemPrompt, expected(defaults));
    }
});

test('SD and Comfy guide overrides can be cleared even after their built-in guide is loaded', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => ({ ok: true, text: async () => 'loaded guide' }));
    for (const prompts of [sdPrompts, comfyPrompts]) {
        assert.equal(await prompts.loadTagGuide(), true);
        assert.equal(prompts.getEffectiveTagGuide(undefined), 'loaded guide');
        assert.equal(prompts.getEffectiveTagGuide(null), 'loaded guide');
        for (const customGuide of ['', ' \n ', 'custom guide']) {
            assert.equal(prompts.getEffectiveTagGuide(customGuide), customGuide);
        }
    }
});
