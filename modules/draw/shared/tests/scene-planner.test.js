import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { DEFAULT_PROMPT_CONFIG as NOVEL_SCENE_PROMPTS } from '../../providers/novelai/novel-prompts.js';
import { SD_SCENE_PROMPTS } from '../../providers/sd-webui/sd-prompts.js';
import { COMFY_SCENE_PROMPTS } from '../../providers/comfyui/comfy-prompts.js';
import { getLastDrawAgentDiagnostic } from '../draw-agent.js';
import { buildScenePlannerTask, generateAndParseScenePlan } from '../scene-planner.js';

const NOOP_EXPANSION_OPTIONS = {
    runtime: {
        substituteParams: (text) => text,
    },
};

async function loadPromptConfig(providerDirectory, baseConfig, { pov = false } = {}) {
    const promptDirectory = new URL(`../../providers/${providerDirectory}/prompts/`, import.meta.url);
    const [topSystem, topSystemPov, sceneRules] = await Promise.all([
        readFile(new URL('top-system.md', promptDirectory), 'utf8'),
        readFile(new URL('top-system-pov.md', promptDirectory), 'utf8'),
        readFile(new URL('scene-rules.md', promptDirectory), 'utf8'),
    ]);
    const guideFile = providerDirectory === 'novelai' ? 'TAG编写指南.md'
        : providerDirectory === 'sd-webui' ? 'SD_TAG编写指南.md'
            : 'COMFY_TAG编写指南.md';
    const tagGuideContent = await readFile(
        new URL(`../../providers/${providerDirectory}/${guideFile}`, import.meta.url),
        'utf8',
    );
    return {
        ...baseConfig,
        topSystem: pov ? topSystemPov : topSystem,
        topSystemPov,
        sceneRules,
        tagGuideContent,
    };
}

function flattenTaskText(task) {
    return [task.systemPrompt, ...task.messages.map((message) => message.content)].join('\n');
}

function countOccurrences(text, needle) {
    return text.split(needle).length - 1;
}

function assertSingleUserTask(task) {
    assert.equal(task.messages.length, 1, '请求必须只有一条 user 消息');
    assert.equal(task.messages[0].role, 'user');
    assert.equal(typeof task.systemPrompt, 'string');
}

async function buildProviderTask(providerDirectory, baseConfig, options = {}) {
    const promptDefaults = await loadPromptConfig(providerDirectory, baseConfig, options);
    return buildScenePlannerTask({
        messageText: '雨声停了。阿璃推开门，抱住了旅人。',
        presentCharacters: [{
            name: '阿璃',
            aliases: ['小璃'],
            type: 'girl',
            danbooruTag: 'ali_(original)',
            appearance: 'silver hair, blue eyes',
            outfits: [{ name: '白裙', tags: 'white dress' }],
        }],
        useWorldInfo: true,
        worldInfoResolver: async () => ({
            worldInfoBefore: '雨城终年潮湿。',
            worldInfoDepth: [],
            worldInfoAfter: '',
        }),
        worldbookEntries: '旅馆门廊使用暖色灯。',
        promptDefaults,
        maxImages: 2,
        maxCharactersPerImage: 3,
        expansionOptions: NOOP_EXPANSION_OPTIONS,
    });
}

test('final NovelAI scene-planner task preserves the complete domain prompt and Tool boundary', async () => {
    const task = await buildProviderTask('novelai', NOVEL_SCENE_PROMPTS);
    const text = flattenTaskText(task);
    const imagesSchema = task.tools[0].function.parameters.properties.images;

    assertSingleUserTask(task);
    assert.equal(task.toolChoice, 'required');
    assert.equal(task.tools.length, 1);
    assert.equal(task.tools[0].function.name, 'submit_scene_plan');
    assert.equal(imagesSchema.minItems, 2);
    assert.equal(imagesSchema.maxItems, 2);
    assert.equal(imagesSchema.items.properties.characters.maxItems, 3);
    assert.match(text, /FICTIONAL_CREATIVE_WORK/);
    assert.match(text, /mindful_prelude/);
    assert.match(text, /source#/);
    assert.match(text, /target#/);
    assert.match(text, /mutual#/);
    assert.match(text, /A1/);
    assert.match(text, /E5/);
    assert.match(text, /<worldInfo>/);
    assert.match(text, /<content>/);
    assert.match(text, /n::Tag::/);
    assert.match(text, /破损/);
    assert.match(text, /敞开/);
    assert.match(text, /滑落/);
    assert.match(text, /湿透/);
    assert.match(text, /阿璃/);
    assert.match(text, /小璃/);
    assert.match(text, /white dress/);
    assert.match(text, /images 必须恰好包含 2 项/);
    assert.match(text, /characters 最多 3 人/);
    assert.doesNotMatch(text, /YAML|<meta_protocol>|assistant prefill/i);
});

test('every provider request is user-first and injects each key marker exactly once', async () => {
    const providers = [
        ['novelai', NOVEL_SCENE_PROMPTS],
        ['sd-webui', SD_SCENE_PROMPTS],
        ['comfyui', COMFY_SCENE_PROMPTS],
    ];

    for (const [providerDirectory, baseConfig] of providers) {
        const task = await buildProviderTask(providerDirectory, baseConfig);
        assertSingleUserTask(task);
        assert.ok(task.systemPrompt.length > 0, `${providerDirectory}: system prompt 不能为空`);
        const userTask = task.messages[0].content;

        // Structural containers are injected exactly once; the prompt bodies may still discuss
        // `<content>` / `<worldInfo>` as documentation.
        for (const marker of ['Content Provider:\n<worldInfo>', '</worldInfo>', 'Content Provider:\n<content>', '</content>']) {
            assert.equal(countOccurrences(userTask, marker), 1, `${providerDirectory}: ${marker} 必须只出现一次`);
        }
        assert.equal(
            countOccurrences(userTask, 'FICTIONAL_CREATIVE_WORK'),
            1,
            `${providerDirectory}: 合规确认段必须只出现一次`,
        );
        assert.equal(
            countOccurrences(userTask, '必须且只能调用一次 submit_scene_plan'),
            1,
            `${providerDirectory}: Tool 强制指令必须只出现一次`,
        );
        assert.equal(countOccurrences(userTask, '雨声停了。阿璃推开门，抱住了旅人。'), 1);
        assert.equal(countOccurrences(userTask, '旅馆门廊使用暖色灯。'), 1);
        // Placeholders must be consumed, never leaked into the request.
        assert.equal(userTask.includes('{{lastMessage}}'), false);
        assert.equal(userTask.includes('{{characterInfo}}'), false);
        assert.equal(userTask.includes('{$worldInfo}'), false);
        assert.equal(userTask.includes('{$tagGuide}'), false);
        assert.equal(/XBDRAWSLOT_/.test(userTask), false, '内部占位符不得泄漏');
        assert.match(userTask, /girl \/ boy \/ woman \/ man \/ other \/ no_humans/);
        assert.equal(userTask.includes('→no humans'), false);
    }
});

test('narrative replacement tokens survive verbatim and side-effecting macros run once per value', async () => {
    const source = '她低声说：$& 与 $` 与 $\' 与 $1 与 $$，然后离开。';
    let macroCalls = 0;
    const task = await buildScenePlannerTask({
        messageText: source,
        worldbookEntries: '暗巷里有 $& 记号。',
        maxImages: 1,
        expansionOptions: {
            runtime: {
                substituteParams: (text) => {
                    macroCalls += 1;
                    return text;
                },
            },
        },
    });

    assertSingleUserTask(task);
    const userTask = task.messages[0].content;
    assert.equal(countOccurrences(userTask, source), 1);
    assert.equal(countOccurrences(userTask, '暗巷里有 $& 记号。'), 1);
    // messageText, worldInfo, characterInfo, tagGuide, systemPrompt, userTask template.
    assert.equal(macroCalls, 6);
});

test('prompt macro failures surface as PROMPT_EXPANSION_FAILED', async () => {
    await assert.rejects(() => buildScenePlannerTask({
        messageText: '阿璃推开门。',
        maxImages: 1,
        expansionOptions: {
            runtime: {
                substituteParams: () => {
                    throw new Error('宏解析炸了');
                },
            },
        },
    }), (error) => error.code === 'PROMPT_EXPANSION_FAILED');
});

test('SD and Comfy tasks retain weighted-tag rules while POV uses the dedicated system prompt', async () => {
    const [sdTask, comfyTask, povTask] = await Promise.all([
        buildProviderTask('sd-webui', SD_SCENE_PROMPTS),
        buildProviderTask('comfyui', COMFY_SCENE_PROMPTS),
        buildProviderTask('sd-webui', SD_SCENE_PROMPTS, { pov: true }),
    ]);

    assert.match(flattenTaskText(sdTask), /\(tag:1\.2\)/);
    assert.match(flattenTaskText(comfyTask), /\(tag:1\.2\)/);
    assertSingleUserTask(povTask);
    assert.match(povTask.systemPrompt, /First-Person POV Core Rule/);
    assert.match(povTask.systemPrompt, /Do NOT create a Character entry for <user>/);
    assert.equal(povTask.toolChoice, 'required');
});

test('NovelAI, SD, and Comfy each submit one Tool call and receive the same image-task contract', async () => {
    const providers = [
        ['novelai', NOVEL_SCENE_PROMPTS],
        ['sd-webui', SD_SCENE_PROMPTS],
        ['comfyui', COMFY_SCENE_PROMPTS],
    ];

    for (const [providerDirectory, baseConfig] of providers) {
        const promptDefaults = await loadPromptConfig(providerDirectory, baseConfig);
        let callCount = 0;
        const tasks = await generateAndParseScenePlan({
            messageText: '阿璃推开门。',
            presentCharacters: [{ name: '阿璃', aliases: ['小璃'] }],
            promptDefaults,
            maxImages: 1,
            maxCharactersPerImage: 1,
            expansionOptions: NOOP_EXPANSION_OPTIONS,
            agentCaller: async ({ task }) => {
                callCount += 1;
                assert.equal(task.toolChoice, 'required');
                assert.equal(task.tools[0].function.name, 'submit_scene_plan');
                return {
                    providerConfig: { provider: providerDirectory, model: 'test-model' },
                    result: {
                        toolCalls: [{
                            name: 'submit_scene_plan',
                            arguments: JSON.stringify({
                                mindful_prelude: {
                                    user_insight: '重逢前的动作。',
                                    therapeutic_commitment: '忠实呈现可见内容。',
                                    visual_plan: {
                                        reasoning: '开门动作适合定格。',
                                        moments: [{
                                            moment: '1',
                                            anchor_target: '阿璃推开门。',
                                            char_count: '1 girl',
                                            known_chars: ['阿璃'],
                                            unknown_chars: [],
                                            composition: 'C3 正面中景。',
                                        }],
                                    },
                                },
                                images: [{
                                    index: 1,
                                    anchor: '阿璃推开门。',
                                    scene: 'solo, opening door, indoor',
                                    characters: [{
                                        name: '小璃',
                                        danbooru: '',
                                        type: '',
                                        appear: '',
                                        costume: 'white dress',
                                        action: 'opening door',
                                        interact: '',
                                        uc: '',
                                        center: 'C3',
                                    }],
                                }],
                            }),
                        }],
                    },
                };
            },
        });

        assert.equal(callCount, 1);
        assert.deepEqual(tasks, [{
            index: 1,
            anchor: '阿璃推开门。',
            scene: 'solo, opening door, indoor',
            chars: [{
                name: '阿璃',
                danbooru: '',
                type: '',
                appear: '',
                costume: 'white dress',
                action: 'opening door',
                interact: '',
                uc: '',
                center: 'C3',
            }],
        }]);
        const diagnostic = getLastDrawAgentDiagnostic();
        assert.equal(diagnostic.status, 'success');
        assert.equal(diagnostic.stage, 'parse');
    }
});

test('scene-plan anchor validation follows the same expanded content seen by the model', async () => {
    const tasks = await generateAndParseScenePlan({
        messageText: '{{persona}}推开门。',
        maxImages: 1,
        expansionOptions: {
            runtime: {
                substituteParams: (text) => text.replaceAll('{{persona}}', '主人'),
            },
        },
        agentCaller: async () => ({
            providerConfig: { provider: 'openai-compatible', model: 'test-model' },
            result: {
                toolCalls: [{
                    name: 'submit_scene_plan',
                    arguments: JSON.stringify({
                        mindful_prelude: {
                            user_insight: '开门动作。',
                            therapeutic_commitment: '忠实呈现。',
                            visual_plan: {
                                reasoning: '选择动作瞬间。',
                                moments: [{
                                    moment: '1',
                                    anchor_target: '主人推开门。',
                                    char_count: '0',
                                    known_chars: [],
                                    unknown_chars: [],
                                    composition: '室内中景。',
                                }],
                            },
                        },
                        images: [{
                            index: 1,
                            anchor: '主人推开门。',
                            scene: 'opening door, indoor',
                            characters: [],
                        }],
                    }),
                }],
            },
        }),
    });

    assert.equal(tasks[0].anchor, '主人推开门。');
});
