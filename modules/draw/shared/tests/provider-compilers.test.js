import test from 'node:test';
import assert from 'node:assert/strict';

import { compile as compileComfy } from '../../providers/comfyui/compiler.js';
import {
    compile as compileNovel,
    compileNovelImageRequest,
} from '../../providers/novelai/compiler.js';
import { compile as compileSd } from '../../providers/sd-webui/compiler.js';

const SCENE_PLAN = [{
    scene: 'rainy street, reunion',
    chars: [{
        name: '阿璃',
        type: '',
        appear: '',
        costume: 'white_dress',
        action: 'smile',
        interact: '',
        uc: 'bad hands',
        center: { x: 0.3, y: 0.3 },
    }],
    placement: { insertAfter: 1 },
}];

const KNOWN_CHARACTERS = [{
    enabled: true,
    name: '阿璃',
    type: 'girl',
    danbooruTag: 'ali_(original)',
    appearance: 'silver hair',
    negativeTags: 'wrong hair',
}];

test('SD compiler turns a scene plan and recipe into the complete backend image-job payload', () => {
    const compiled = compileSd(SCENE_PLAN, {
        host: 'https://sd.example.test/base',
        auth: 'user:pass',
        timeout: 90000,
        delayMs: 1000,
        params: {
            model: 'checkpoint.safetensors',
            width: 768,
            height: 1024,
            steps: 30,
            cfg_scale: 6.5,
            sampler_name: 'Euler a',
            clip_skip: 2,
            seed: 42,
        },
        positivePrefix: 'masterpiece',
        negativePrefix: 'low quality',
        knownCharacters: KNOWN_CHARACTERS,
    });

    assert.equal(compiled.provider, 'sd-webui');
    assert.deepEqual(compiled.context, { url: 'https://sd.example.test/base', auth: 'user:pass' });
    assert.deepEqual(compiled.delay, { min: 1000, max: 1000 });
    assert.deepEqual(Object.keys(compiled.items[0]).sort(), ['request', 'timeout']);
    assert.equal(compiled.items[0].timeout, 90000);
    assert.match(compiled.items[0].request.payload.prompt, /ali_\(original\)/);
    assert.match(compiled.items[0].request.payload.prompt, /white_dress/);
    assert.match(compiled.items[0].request.payload.negative_prompt, /wrong hair/);
    assert.deepEqual(compiled.items[0].request.payload.override_settings, {
        sd_model_checkpoint: 'checkpoint.safetensors',
        CLIP_stop_at_last_layers: 2,
    });
});

test('Comfy compiler freezes the seed and custom workflow output selection', () => {
    const workflow = {
        p: { class_type: 'CLIPTextEncode', inputs: { text: '' } },
        n: { class_type: 'CLIPTextEncode', inputs: { text: '' } },
        size: { class_type: 'EmptyLatentImage', inputs: { width: 512, height: 512 } },
        sampler: { class_type: 'KSampler', inputs: { seed: 0 } },
        save: { class_type: 'SaveImage', inputs: { images: ['sampler', 0] } },
        preview: { class_type: 'PreviewImage', inputs: { images: ['sampler', 0] } },
    };
    const compiled = compileComfy(SCENE_PLAN, {
        host: 'https://comfy.example.test',
        auth: '',
        timeout: 120000,
        delayMs: 1000,
        workflowMode: 'custom',
        customWorkflow: {
            json: JSON.stringify(workflow),
            nodePositive: 'p',
            nodeNegative: 'n',
            nodeWidth: 'size',
            nodeHeight: 'size',
            nodeSeed: 'sampler',
            nodeSaveImage: 'save',
        },
        params: { width: 832, height: 1216 },
        positivePrefix: 'best quality',
        negativePrefix: 'bad quality',
        knownCharacters: KNOWN_CHARACTERS,
        // Draw Run 在 Planner 前按最大张数冻结种子；实际计划可以少于上限。
        seeds: [123456, 654321],
    });

    const request = compiled.items[0].request;
    assert.deepEqual(Object.keys(compiled.items[0]).sort(), ['request', 'timeout']);
    assert.equal(request.workflow.sampler.inputs.seed, 123456);
    assert.equal(request.workflow.size.inputs.width, 832);
    assert.equal(request.workflow.size.inputs.height, 1216);
    assert.match(request.workflow.p.inputs.text, /rainy street/);
    assert.match(request.workflow.n.inputs.text, /wrong hair/);
    assert.equal(request.preferredSaveImageNodeId, 'save');
    assert.equal(Object.hasOwn(request.workflow, 'preview'), false);
});

test('NovelAI compiler emits deterministic V5 stream requests without browser globals', () => {
    const params = {
        model: 'nai-diffusion-5-full',
        sampler: 'k_euler_ancestral',
        scheduler: 'karras',
        steps: 23,
        scale: 7,
        width: 832,
        height: 1216,
        seed: -1,
        cfg_rescale: 0,
        v5QualityPresetId: 'standard',
        v5UcPresetId: 'heavy',
    };
    const compiled = compileNovel(SCENE_PLAN, {
        apiBaseUrl: 'https://image.novelai.net',
        apiKey: 'secret',
        insecureTLS: false,
        timeout: 60000,
        requestDelay: { min: 15000, max: 30000 },
        params,
        defaultParams: params,
        positivePrefix: 'depthness',
        negativePrefix: 'bad',
        knownCharacters: KNOWN_CHARACTERS,
        autoLearnEnabled: true,
        autoLearnMode: 'auto_update',
        seeds: [987654321, 123456789],
    });

    const item = compiled.items[0];
    assert.deepEqual(Object.keys(item).sort(), ['request', 'timeout']);
    assert.equal(compiled.provider, 'novelai');
    assert.deepEqual(compiled.context, { key: 'secret', insecure: false });
    assert.equal(item.request.transport, 'msgpack-stream');
    assert.equal(item.request.url, 'https://image.novelai.net/ai/generate-image-stream');
    assert.equal(item.request.payload.parameters.seed, 987654321);
    assert.equal(item.request.payload.parameters.params_version, 4);
    assert.match(item.request.payload.input, /depthness/);
    assert.match(item.request.payload.parameters.negative_prompt, /bad/);
    assert.deepEqual(compiled.artifacts[0].providerMetadata.autoLearnCharacters, SCENE_PLAN[0].chars);
    assert.equal(compiled.artifacts[0].providerMetadata.autoLearnMode, 'auto_update');
});

test('NovelAI compiler keeps the released V4.5 JSON payload contract', () => {
    const compiled = compileNovel(SCENE_PLAN, {
        apiBaseUrl: 'https://image.novelai.net',
        apiKey: 'secret',
        requestDelay: { min: 15000, max: 30000 },
        timeout: 60000,
        params: {
            model: 'nai-diffusion-4-5-full',
            sampler: 'k_euler_ancestral',
            scheduler: 'karras',
            steps: 28,
            scale: 5,
            width: 832,
            height: 1216,
            qualityToggle: true,
            ucPreset: 0,
            autoSmea: false,
            cfg_rescale: 0,
        },
        positivePrefix: 'masterpiece',
        negativePrefix: 'bad quality',
        knownCharacters: KNOWN_CHARACTERS,
        autoLearnEnabled: false,
        autoLearnMode: 'new_only',
        seeds: [123456789],
    });

    const item = compiled.items[0];
    assert.equal(item.request.transport, 'legacy-image');
    assert.equal(item.request.url, 'https://image.novelai.net/ai/generate-image');
    assert.equal(item.request.payload.parameters.params_version, 3);
    assert.equal(item.request.payload.parameters.seed, 123456789);
    assert.equal(item.request.payload.parameters.use_coords, true);
    assert.match(item.request.payload.input, /masterpiece/);
    assert.match(item.request.payload.parameters.characterPrompts[0].prompt, /ali \(original\)/);
    assert.match(item.request.payload.parameters.negative_prompt, /bad quality/);
    assert.deepEqual(compiled.artifacts[0].providerMetadata.autoLearnCharacters, []);
});

test('NovelAI single-request compiler resolves transport and payload from the same merged params', () => {
    const compiled = compileNovelImageRequest({
        scene: 'portrait',
        characterPrompts: [],
        negativePrompt: '',
        params: { steps: 30 },
    }, {
        apiBaseUrl: 'https://image.novelai.net',
        defaultParams: {
            model: 'nai-diffusion-5-full',
            width: 832,
            height: 1216,
            scale: 7,
            sampler: 'k_euler_ancestral',
            scheduler: 'karras',
        },
    }, 123);

    assert.equal(compiled.transport, 'msgpack-stream');
    assert.equal(compiled.apiUrl, 'https://image.novelai.net/ai/generate-image-stream');
    assert.equal(compiled.payload.model, 'nai-diffusion-5-full');
    assert.equal(compiled.payload.parameters.steps, 30);
    assert.equal(compiled.payload.parameters.width, 832);
});

test('NovelAI compiler preserves relative URLs for browser-direct delivery', () => {
    const compiled = compileNovel(SCENE_PLAN, {
        apiBaseUrl: '/novelai-proxy',
        resolveForBackend: false,
        timeout: 60000,
        requestDelay: { min: 15000, max: 30000 },
        autoLearnEnabled: false,
        autoLearnMode: 'new_only',
        params: {
            model: 'nai-diffusion-4-5-full',
            width: 832,
            height: 1216,
        },
        seeds: [123],
    });

    assert.equal(compiled.items[0].request.url, '/novelai-proxy/ai/generate-image');
});
