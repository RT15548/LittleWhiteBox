import assert from 'node:assert/strict';
import test from 'node:test';
import { createSubmitScenePlanTool } from '../scene-plan-tool.js';
import { parseSubmittedScenePlan } from '../scene-plan-contract.js';
import { listScenePlanFieldDescriptions } from '../scene-planner-frame.js';
import { getNovelPlannerProfile } from '../../providers/novelai/novel-prompts.js';
import { SD_PLANNER_PROFILE } from '../../providers/sd-webui/sd-prompts.js';
import { COMFY_PLANNER_PROFILE } from '../../providers/comfyui/comfy-prompts.js';

const profiles = [undefined, getNovelPlannerProfile('nai-diffusion-4-5-full'),
    getNovelPlannerProfile('nai-diffusion-5-full'), SD_PLANNER_PROFILE, COMFY_PLANNER_PROFILE];
const sceneSource = { sourceHash: 'source', points: [{ number: 1, offset: 0 }] };

// Model-facing order is intentional: identify the scene and framing before expanding tags.
test('all provider schemas and field previews put title and orientation before drawing tags', () => {
    for (const profile of profiles) {
        const tool = createSubmitScenePlanTool({ profile });
        const item = tool.function.parameters.properties.images.items;
        assert.deepEqual(Object.keys(item.properties), [
            'index', 'insert_after', 'title', 'orientation', 'scene', 'characters',
            ...(profile?.postPrompt === 'append' ? ['post_prompt'] : []),
        ]);
        assert.deepEqual(item.properties.orientation.enum, ['portrait', 'landscape']);
        assert.ok(item.required.includes('title'));
        assert.ok(item.required.includes('orientation'));
        const fields = listScenePlanFieldDescriptions(profile).map(field => field.path);
        assert.ok(fields.indexOf('images[].title') < fields.indexOf('images[].orientation'));
        assert.ok(fields.indexOf('images[].orientation') < fields.indexOf('images[].scene'));
    }
});

test('title asks for a natural scene name, not a character-count exercise', () => {
    const { title } = createSubmitScenePlanTool().function.parameters.properties.images.items.properties;
    assert.equal(title.minLength, 1);
    assert.equal(title.maxLength, 20);
    assert.equal(title.pattern, undefined);
    assert.match(title.description, /20 字以内/);
    assert.match(title.description, /不设最少字数/);
    assert.match(title.description, /雨停、门口的回眸、凌晨两点的便利店/);
    assert.match(title.description, /仅用于图片展示/);
    assert.doesNotMatch(title.description, /\d+\s*[～~–—-]\s*\d+\s*字/);
});

test('short and longer names survive parsing unchanged, and omitted titles remain optional', () => {
    for (const title of [undefined, '雨停', '凌晨两点她终于推开那家便利店的玻璃门', '雨后 Café']) {
        const image = { index: 1, insert_after: 1, scene: 'rain, street', characters: [], orientation: 'landscape',
            ...(title === undefined ? {} : { title }) };
        const { tasks: [task] } = parseSubmittedScenePlan({ toolCalls: [
            { name: 'submit_scene_plan', arguments: { images: [image] } },
        ] }, { sceneSource });
        assert.equal(task.title, title);
        assert.equal(task.scene, image.scene);
        assert.equal(task.orientation, 'landscape');
    }
});

test('overlong optional titles are bounded by Unicode character without rejecting the image plan', () => {
    const title = '🌙雨'.repeat(5000);
    const { tasks: [task] } = parseSubmittedScenePlan({ toolCalls: [
        { name: 'submit_scene_plan', arguments: { images: [
            { insert_after: 1, scene: 'night sky', characters: [], title },
        ] } },
    ] }, { sceneSource });
    assert.equal(task.title, '🌙雨'.repeat(10));
    assert.equal(Array.from(task.title).length, 20);
    assert.equal(task.scene, 'night sky');
});

test('user descriptions still override title and orientation without changing field order', () => {
    const descriptions = { 'images[].title': '自定义名称要求', 'images[].orientation': '自定义画幅要求' };
    const item = createSubmitScenePlanTool({ descriptions }).function.parameters.properties.images.items;
    assert.equal(item.properties.title.description, descriptions['images[].title']);
    assert.equal(item.properties.orientation.description, descriptions['images[].orientation']);
    assert.deepEqual(Object.keys(item.properties).slice(2, 5), ['title', 'orientation', 'scene']);
});
