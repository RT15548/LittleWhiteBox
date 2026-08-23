import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { DEFAULT_PROMPT_CONFIG as NOVEL_SCENE_PROMPTS } from '../../providers/novelai/novel-prompts.js';
import { getNovelScenePlannerContract } from '../../providers/novelai/novel-model-capabilities.js';
import { SD_SCENE_PROMPTS } from '../../providers/sd-webui/sd-prompts.js';
import { COMFY_SCENE_PROMPTS } from '../../providers/comfyui/comfy-prompts.js';
import { getLastDrawAgentDiagnostic } from '../draw-agent.js';
import {
    buildScenePlannerTask,
    executePreparedScenePlanner,
    generateAndParseScenePlan,
    prepareScenePlannerInput,
} from '../scene-planner.js';
import { createSceneSource, stripScenePointMarkers } from '../scene-source.js';

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
    const guideFile = providerDirectory === 'novelai' ? 'TAG编写指南-V4.5.md'
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
        modelContract: providerDirectory === 'novelai'
            ? getNovelScenePlannerContract('nai-diffusion-4-5-full')
            : '',
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

test('NovelAI V5 injects its own guide and normalized coordinate Tool contract', async () => {
    const promptDefaults = await loadPromptConfig('novelai', NOVEL_SCENE_PROMPTS);
    const modelGuide = await readFile(
        new URL('../../providers/novelai/提示词编写指南-V5.md', import.meta.url),
        'utf8',
    );
    const task = await buildScenePlannerTask({
        messageText: '阿璃站在窗前。',
        promptDefaults,
        modelGuide,
        modelContract: getNovelScenePlannerContract('nai-diffusion-5-full'),
        centerMode: 'normalized',
        maxImages: 1,
        maxCharactersPerImage: 30,
        absoluteMaxCharactersPerImage: 22,
        expansionOptions: NOOP_EXPANSION_OPTIONS,
    });
    const text = flattenTaskText(task);
    const center = task.tools[0].function.parameters.properties.images
        .items.properties.characters.items.properties.center;

    assert.match(text, /# NovelAI 图像生成 V5 提示词编写指南/);
    assert.match(text, /归一化坐标对象/);
    assert.doesNotMatch(text, /V4\.5 图像生成 Tag 编写指南/);
    assert.deepEqual(center, {
        type: 'object',
        additionalProperties: false,
        required: ['x', 'y'],
        properties: {
            x: { type: 'number', minimum: 0, maximum: 1 },
            y: { type: 'number', minimum: 0, maximum: 1 },
        },
    });
    assert.equal(
        task.tools[0].function.parameters.properties.images
            .items.properties.characters.maxItems,
        22,
    );
});

test('scene planner clamps an exact image request to the available illustration points', async () => {
    const task = await buildScenePlannerTask({
        messageText: '短句。',
        maxImages: 3,
        promptDefaults: NOVEL_SCENE_PROMPTS,
        expansionOptions: NOOP_EXPANSION_OPTIONS,
    });
    const parameters = task.tools[0].function.parameters;
    const images = parameters.properties.images;
    const moments = parameters.properties.mindful_prelude.properties.visual_plan.properties.moments;
    const text = flattenTaskText(task);

    assert.equal(images.minItems, 1);
    assert.equal(images.maxItems, 1);
    assert.equal(moments.minItems, 1);
    assert.equal(moments.maxItems, 1);
    assert.equal(moments.items.properties.insert_after.maximum, 1);
    assert.match(text, /本次正文共有 1 个可用插图点/);
    assert.match(text, /images 必须恰好包含 1 项/);
});

test('scene planner reports an image-limit adjustment once before the provider request', async () => {
    const sequence = [];
    const adjustments = [];
    await generateAndParseScenePlan({
        messageText: '短句。',
        maxImages: 3,
        promptDefaults: NOVEL_SCENE_PROMPTS,
        expansionOptions: NOOP_EXPANSION_OPTIONS,
        onImageLimitAdjusted(adjustment) {
            sequence.push('adjusted');
            adjustments.push(adjustment);
        },
        agentCaller: async () => {
            sequence.push('provider');
            return {
                providerConfig: { provider: 'openai-compatible', model: 'test-model' },
                result: {
                    toolCalls: [{
                        name: 'submit_scene_plan',
                        arguments: JSON.stringify({
                            mindful_prelude: {
                                user_insight: '短句画面。',
                                therapeutic_commitment: '忠实呈现。',
                                visual_plan: {
                                    reasoning: '唯一可用位置。',
                                    moments: [{
                                        moment: '1',
                                        insert_after: 1,
                                        char_count: '0',
                                        known_chars: [],
                                        unknown_chars: [],
                                        composition: '中景。',
                                    }],
                                },
                            },
                            images: [{ index: 1, scene: 'short scene', characters: [] }],
                        }),
                    }],
                },
            };
        },
    });

    assert.deepEqual(sequence, ['adjusted', 'provider']);
    assert.deepEqual(adjustments, [{
        requested: 3,
        effective: 1,
        insertPointCount: 1,
        message: '本次正文只有 1 个可用插图点，图片数量已从 3 张调整为 1 张。',
    }]);
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
        const unnumberedUserTask = stripScenePointMarkers(userTask);
        assert.equal(countOccurrences(unnumberedUserTask, '雨声停了。阿璃推开门，抱住了旅人。'), 1);
        assert.equal(countOccurrences(userTask, '【插图点 1】'), 1);
        assert.equal(countOccurrences(userTask, '【插图点 2】'), 1);
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
    const userTask = stripScenePointMarkers(task.messages[0].content);
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
                                            insert_after: 1,
                                            char_count: '1 girl',
                                            known_chars: ['阿璃'],
                                            unknown_chars: [],
                                            composition: 'C3 正面中景。',
                                        }],
                                    },
                                },
                                images: [{
                                    index: 1,
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
        const source = createSceneSource('阿璃推开门。');
        assert.deepEqual(tasks, [{
            index: 1,
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
                center: { x: 0.5, y: 0.5 },
            }],
            placement: {
                mode: 'source',
                insertAfter: 1,
                offset: source.points[0].offset,
                sourceHash: source.sourceHash,
            },
        }]);
        const diagnostic = getLastDrawAgentDiagnostic();
        assert.equal(diagnostic.status, 'success');
        assert.equal(diagnostic.stage, 'parse');
    }
});

test('scene placement stays anchored to the unexpanded snapshot while the model sees expanded numbered content', async () => {
    const sourceText = '{{persona}}推开门。夜色涌进来。';
    let seenContent = '';
    const tasks = await generateAndParseScenePlan({
        messageText: sourceText,
        maxImages: 1,
        expansionOptions: {
            runtime: {
                substituteParams: (text) => text.replaceAll('{{persona}}', '主人'),
            },
        },
        agentCaller: async ({ task }) => {
            seenContent = task.messages[0].content;
            return {
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
                                        insert_after: 1,
                                        char_count: '0',
                                        known_chars: [],
                                        unknown_chars: [],
                                        composition: '室内中景。',
                                    }],
                                },
                            },
                            images: [{
                                index: 1,
                                scene: 'opening door, indoor',
                                characters: [],
                            }],
                        }),
                    }],
                },
            };
        },
    });

    assert.match(seenContent, /主人推开门。【插图点 1】夜色涌进来。/);
    const source = createSceneSource(sourceText);
    assert.equal(tasks[0].placement.sourceHash, source.sourceHash);
    assert.equal(tasks[0].placement.offset, source.points[0].offset);
    assert.equal(sourceText.slice(0, tasks[0].placement.offset), '{{persona}}推开门。');
});

test('scene planner rejects illustration point numbers that do not exist in this request', async () => {
    await assert.rejects(() => generateAndParseScenePlan({
        messageText: '阿璃推开门。',
        maxImages: 1,
        expansionOptions: NOOP_EXPANSION_OPTIONS,
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
                                    insert_after: 42,
                                    char_count: '0',
                                    known_chars: [],
                                    unknown_chars: [],
                                    composition: '室内中景。',
                                }],
                            },
                        },
                        images: [{
                            index: 1,
                            scene: 'opening door, indoor',
                            characters: [],
                        }],
                    }),
                }],
            },
        }),
    }), (error) => error.code === 'INSERT_POINT_INVALID'
        && error.message.includes('insert_after'));
});

test('scene planner rejects punctuation-only content before making a provider request', async () => {
    let callCount = 0;
    await assert.rejects(() => generateAndParseScenePlan({
        messageText: '……。！？',
        maxImages: 3,
        expansionOptions: NOOP_EXPANSION_OPTIONS,
        agentCaller: async () => {
            callCount += 1;
            return {};
        },
    }), (error) => error.code === 'NO_INSERT_POINTS');
    assert.equal(callCount, 0);
});

test('prepared scene planner input is serializable and executes without browser preparation dependencies', async () => {
    const providerConfig = { provider: 'openai-compatible', model: 'prepared-model', apiKey: 'secret' };
    const prepared = await prepareScenePlannerInput({
        messageText: '阿璃推开门。',
        maxImages: 1,
        promptDefaults: NOVEL_SCENE_PROMPTS,
        expansionOptions: NOOP_EXPANSION_OPTIONS,
        agentCaller: async () => {},
        agentOptions: { providerConfig },
    });
    const transferred = JSON.parse(JSON.stringify(prepared));
    assert.equal(transferred.version, 1);
    assert.equal(transferred.agent.channel, providerConfig.provider);
    assert.deepEqual(transferred.agent.providerConfig, providerConfig);
    assert.equal(Object.hasOwn(transferred, 'task'), false);
    assert.equal(Object.hasOwn(transferred.planner.prompt, 'tools'), false);
    assert.deepEqual(Object.keys(transferred.planner.validationContext).sort(), [
        'centerMode',
        'effectiveMaxCharactersPerImage',
        'effectiveMaxImages',
        'sceneSource',
    ]);

    const tasks = await executePreparedScenePlanner(transferred, {
        agentCaller: async ({ task, providerConfig: receivedProviderConfig }) => {
            assert.deepEqual(receivedProviderConfig, providerConfig);
            assert.equal(task.tools[0].function.name, 'submit_scene_plan');
            return {
                providerConfig: receivedProviderConfig,
                result: {
                    toolCalls: [{
                        name: 'submit_scene_plan',
                        arguments: JSON.stringify({
                            mindful_prelude: {
                                user_insight: '推门动作。',
                                therapeutic_commitment: '忠实呈现。',
                                visual_plan: {
                                    reasoning: '动作适合定格。',
                                    moments: [{
                                        moment: '1',
                                        insert_after: 1,
                                        char_count: '0',
                                        known_chars: [],
                                        unknown_chars: [],
                                        composition: '室内中景。',
                                    }],
                                },
                            },
                            images: [{ index: 1, scene: 'opening door, indoor', characters: [] }],
                        }),
                    }],
                },
            };
        },
    });
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].scene, 'opening door, indoor');
});
