import assert from 'node:assert/strict';
import test from 'node:test';
import { DOMParser } from 'linkedom';

import { createHostPromptContextAdapter } from '../host/prompt-context/capture.js';
import { MESSAGE_CONTEXT_LIMITS } from '../apps/messages/host/context-limits.js';
import { buildReplyPrompt } from '../apps/messages/prompt/reply-prompt.js';
import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { CONTEXT_LIMIT } from '../apps/messages/application/context-policy.js';

const user = (mes, name = '玩家') => ({ is_user: true, is_system: false, mes, name });
const assistant = (mes, name = '角色') => ({ is_user: false, is_system: false, mes, name, swipe_id: 0 });

test('host prompt context keeps the accepted boundary out of recent history while scanning it for active world info', async () => {
    const scans = [];
    const storyBoundaries = [];
    const context = {
        chatId: 'chat-a',
        groupId: null,
        characterId: 0,
        name1: '玩家',
        name2: '角色',
        characters: [{ avatar: 'role.png', name: '角色' }],
        maxContext: 131_072,
        worldInfoIncludeNames: true,
        powerUserSettings: { persona_description: '旅人' },
        getCharacterCardFields() {
            return {
                persona: '旅人（已展开）',
                description: '角色描述',
                personality: '角色性格',
                charDepthPrompt: '角色深度提示',
                scenario: '当前场景',
                creatorNotes: '创作者注释',
            };
        },
        chat: [user('旧 U'), assistant('旧 A'), user('接受 U'), assistant('接受 A'), user('触发 U')],
        async getWorldInfoPrompt(messages, budget, dryRun, globalScanData) {
            scans.push({ messages, budget, dryRun, globalScanData });
            return { worldInfoBefore: '激活设定', worldInfoAfter: '', worldInfoDepth: [] };
        },
    };
    const adapter = createHostPromptContextAdapter({
        readContext: () => context,
        readStoryEvents(through) {storyBoundaries.push(through); return 'L2 事件';},
    });
    const captured = await adapter.capture({ throughMessageIndex: 3, recentBeforeIndex: 2 });

    assert.deepEqual(captured.contextSnapshot.recentMessages.map(message => message.text), ['旧 U', '旧 A']);
    assert.deepEqual(scans, [{
        messages: ['角色: 接受 A', '玩家: 接受 U', '角色: 旧 A', '玩家: 旧 U'],
        budget: 131_072,
        dryRun: true,
        globalScanData: {
            personaDescription: '旅人（已展开）',
            characterDescription: '角色描述',
            characterPersonality: '角色性格',
            characterDepthPrompt: '角色深度提示',
            scenario: '当前场景',
            creatorNotes: '创作者注释',
            trigger: 'normal',
        },
    }]);
    assert.deepEqual(storyBoundaries, [3]);
    assert.equal(captured.contextSnapshot.storyEvents, 'L2 事件');
    assert.equal(JSON.stringify(captured.contextSnapshot).includes('触发 U'), false);
});

test('world info and Story Summary failures omit only their optional blocks', async () => {
    const failures = [];
    const context = {
        chatId: 'chat-a', groupId: null, characterId: 0, name1: '玩家', name2: '角色',
        characters: [{ avatar: 'role.png', name: '角色' }], chat: [user('U'), assistant('A')],
        async getWorldInfoPrompt() {throw new Error('world failed');},
    };
    const adapter = createHostPromptContextAdapter({
        readContext: () => context,
        readStoryEvents() {throw new Error('summary failed');},
        report: error => failures.push(error.message),
    });
    const captured = await adapter.capture();
    assert.deepEqual(captured.contextSnapshot.worldInfo, { before: '', after: '', depth: [] });
    assert.equal(captured.contextSnapshot.storyEvents, '');
    assert.deepEqual(failures.sort(), ['summary failed', 'world failed']);
});

test('Messages request retains the last complete floors, full character card, and dialogue examples within budget', async () => {
    const context = {
        chatId: 'chat-a', characterId: 0, name1: '玩家', name2: '角色',
        characters: [{ avatar: 'role.png', name: '角色', data: {
            description: '旧描述', personality: '旧性格', scenario: '旧教室', mes_example: '原卡旧示例',
        } }],
        getCharacterCardFields() { return {
            description: `${'设定'.repeat(2500)}设定末尾`, personality: `${'性格'.repeat(1100)}性格末尾`,
            scenario: '教室', persona: '玩家设定已展开', charDepthPrompt: '角色补充设定',
            mesExamples: `${'口吻'.repeat(2500)}口吻末尾已展开`,
        }; },
        chat: Array.from({ length: 14 }, (_, index) => index % 2
            ? assistant(`${'对白'.repeat(2400)}楼末尾${index}`)
            : user(`楼${index}`)),
        async getWorldInfoPrompt() { return { worldInfoBefore: `${'世界'.repeat(4100)}设定终点`, worldInfoAfter: '',
            worldInfoDepth: [{ entries: [`${'环境'.repeat(1100)}深度终点`] }] }; },
    };
    const adapter = createHostPromptContextAdapter({
        readContext: () => context, readStoryEvents: () => '',
        normalizationLimits: MESSAGE_CONTEXT_LIMITS, includeActiveStoryDetails: true,
    });
    const captured = await adapter.capture();
    const contact = { id: 'c', name: '角色', note: '', summary: null };
    const incoming = { id: 'm', seq: 1, sender: 'user', from: '玩家', to: '角色', payload: { type: 'text', text: '怎么了？' } };
    const request = buildReplyPrompt({ contact, incoming, history: [], settings: { imagePrompt: false, voicePrompt: false },
        context: { ...captured.contextSnapshot, people: [], chronology: [{ firstSeq: 1, throughSeq: 1, afterStoryFloor: 13, breakBefore: null }] },
    });
    const setting = request.messages[0].content;
    const currentState = new DOMParser().parseFromString(request.messages.at(-1).content, 'text/xml').querySelector('recent_story').textContent;
    assert.deepEqual(captured.contextSnapshot.recentMessages.map(message => message.index), Array.from({ length: 12 }, (_, index) => index + 2));
    assert.equal(captured.contextSnapshot.exampleDialogue, `${'口吻'.repeat(2500)}口吻末尾已展开`);
    assert.equal(captured.contextSnapshot.characterNote, '角色补充设定');
    assert.equal(captured.contextSnapshot.player.persona, '玩家设定已展开');
    assert.equal(captured.contextSnapshot.characters[0].scenario, '教室');
    assert.equal(Object.hasOwn(captured.contextSnapshot.characters[0], 'example'), false);
    assert.ok(setting.includes('设定末尾') && setting.includes('性格末尾') && setting.includes('口吻末尾'));
    assert.equal(setting.includes('旧描述') || setting.includes('旧性格') || setting.includes('旧教室'), false);
    assert.equal(setting.includes('原卡旧示例'), false);
    assert.ok(setting.includes('设定终点') && setting.includes('深度终点'));
    assert.ok(currentState.includes('楼末尾13') && currentState.includes('楼末尾11'));
    assert.ok(estimateConversationTokens({ messages: [{ role: 'system', content: request.systemPrompt }, ...request.messages] }) < CONTEXT_LIMIT);
});

test('Messages sends one expanded single-chat character and each activated native world-info section', async () => {
    let fieldReads = 0;
    let scan;
    const context = {
        chatId: 'chat-a', characterId: 0, name1: '玩家', name2: '林月',
        characters: [{ avatar: 'role.png', name: '林月', description: '{{char}}住在旧址',
            personality: '对{{user}}很生疏', scenario: '旧教室' }],
        powerUserSettings: { persona_description: '{{user}}的旧人设' },
        chat: [assistant('上楼！', '林月')],
        getCharacterCardFields() {fieldReads++; return {
            description: '林月住在车站旁', personality: '对玩家直来直去', scenario: '当前车站',
            persona: '玩家是熟人', mesExamples: '林月：少废话，快来。', charDepthPrompt: '说话有点冲。',
        }; },
        async getWorldInfoPrompt(messages, _budget, dryRun, fields) {
            scan = { messages, dryRun, fields };
            return { worldInfoString: '不应重复加入的汇总', worldInfoBefore: '雨城', worldInfoAfter: '夜间禁行',
                worldInfoDepth: [{ depth: 0, role: 0, entries: ['街上很安静'] }],
                worldInfoExamples: [{ position: 0, content: '例子前' }, { position: 1, content: '例子后' }],
                anBefore: ['便签前'], anAfter: ['便签后'], outletEntries: { special: ['没有被调用的出口'] } };
        },
    };
    const adapter = createHostPromptContextAdapter({ readContext: () => context, readStoryEvents: () => '',
        includeActiveStoryDetails: true, strictBackgroundRead: true, normalizationLimits: MESSAGE_CONTEXT_LIMITS });
    const { contextSnapshot } = await adapter.capture({ worldInfoScanMessages: ['玩家: 钥匙拿到了'] });
    assert.equal(fieldReads, 1);
    assert.equal(scan.dryRun, true);
    assert.equal(scan.messages[0], '玩家: 钥匙拿到了');
    assert.equal(scan.fields.characterPersonality, '对玩家直来直去');
    assert.deepEqual(contextSnapshot.characters.map(character => ({
        name: character.displayName, description: character.description,
        personality: character.personality, scenario: character.scenario,
    })), [{ name: '林月', description: '林月住在车站旁', personality: '对玩家直来直去', scenario: '当前车站' }]);
    assert.equal(contextSnapshot.player.persona, '玩家是熟人');
    assert.equal(contextSnapshot.characterNote, '说话有点冲。');
    assert.deepEqual(contextSnapshot.worldInfo.extras, {
        exampleBefore: ['例子前'], exampleAfter: ['例子后'],
        authorNoteBefore: ['便签前'], authorNoteAfter: ['便签后'],
    });
    const incoming = { id: 'm', seq: 1, sender: 'user', from: '玩家', to: '林月', payload: { type: 'text', text: '快到车站了吗？' } };
    const request = buildReplyPrompt({ contact: { id: 'c', name: '林月', note: '', summary: null }, incoming,
        history: [], settings: { imagePrompt: false, voicePrompt: false },
        context: { ...contextSnapshot, people: [], chronology: [{ firstSeq: 1, throughSeq: 1, afterStoryFloor: 1, breakBefore: null }] },
    });
    const setting = request.messages[0].content;
    for (const text of ['林月住在车站旁', '对玩家直来直去', '当前车站', '玩家是熟人',
        '说话有点冲。', '雨城', '夜间禁行', '街上很安静', '例子前', '例子后', '便签前', '便签后']) {
        assert.equal(setting.split(text).length - 1, 1, text);
    }
    for (const text of ['旧教室', '对{{user}}很生疏', '不应重复加入的汇总', '没有被调用的出口']) {
        assert.equal(setting.includes(text), false, text);
    }
});

test('Messages distinguishes a failed native world-info scan or story read from an empty result', async () => {
    const emptyWorldInfo = { worldInfoBefore: '', worldInfoAfter: '', worldInfoDepth: [],
        worldInfoExamples: [], anBefore: [], anAfter: [], outletEntries: {} };
    const context = { chatId: 'chat-a', characterId: 0,
        characters: [{ avatar: 'role.png', name: '角色' }], chat: [assistant('剧情已发生')],
        getCharacterCardFields: () => ({ mesExamples: '' }),
        getWorldInfoPrompt: async () => emptyWorldInfo };
    const createAdapter = readStoryEvents => createHostPromptContextAdapter({ readContext: () => context,
        readStoryEvents, includeActiveStoryDetails: true, strictBackgroundRead: true });
    const adapter = createAdapter(() => '');
    assert.deepEqual((await adapter.capture()).contextSnapshot.worldInfo, {
        before: '', after: '', depth: [], extras: {
            exampleBefore: [], exampleAfter: [], authorNoteBefore: [], authorNoteAfter: [],
        },
    });
    context.getWorldInfoPrompt = async () => {throw new Error('offline');};
    await assert.rejects(adapter.capture(), error => error.message === 'prompt_context_world_info_failed'
        && error.cause?.message === 'offline');
    context.getWorldInfoPrompt = async () => ({});
    await assert.rejects(adapter.capture(), error => error.message === 'prompt_context_world_info_failed'
        && error.cause?.message === 'prompt_context_world_info_invalid');
    for (const invalid of [
        { worldInfoDepth: [{ entries: [42] }] },
        { worldInfoExamples: [{ position: 0, content: null }] },
        { worldInfoExamples: [{ position: 2, content: '未知锚点' }] },
        { anBefore: [null] },
        { anAfter: [null] },
    ]) {
        context.getWorldInfoPrompt = async () => ({ ...emptyWorldInfo, ...invalid });
        await assert.rejects(adapter.capture(), error => error.message === 'prompt_context_world_info_failed'
            && error.cause?.message === 'prompt_context_world_info_invalid');
    }
    context.getWorldInfoPrompt = async () => emptyWorldInfo;
    await assert.rejects(createAdapter(() => {throw new Error('memory read failed');}).capture(),
        error => error.message === 'prompt_context_story_events_failed' && error.cause?.message === 'memory read failed');
    await assert.rejects(createAdapter(() => undefined).capture(),
        error => error.message === 'prompt_context_story_events_failed'
            && error.cause?.message === 'prompt_context_story_events_invalid');
});

test('group examples use the single active host composition instead of duplicating raw character examples', async () => {
    const adapter = createHostPromptContextAdapter({
        readContext: () => ({ chatId: 'group-chat', groupId: 'party',
            characters: [{ avatar: 'a.png', name: '甲', mes_example: '原卡甲' },
                { avatar: 'b.png', name: '乙', mes_example: '原卡乙' }],
            groups: [{ id: 'party', members: ['a.png', 'b.png'] }], chat: [],
            getCharacterCardFields: () => ({ mesExamples: '合并的当前聊天示例' }),
        }),
        readStoryEvents: () => '', includeActiveStoryDetails: true,
    });
    const snapshot = (await adapter.capture()).contextSnapshot;
    assert.equal(snapshot.characters.length, 2);
    assert.equal(snapshot.exampleDialogue, '合并的当前聊天示例');
    assert.equal(snapshot.characters.some(character => Object.hasOwn(character, 'example')), false);
    const { buildPromptSettingBlock } = await import('../host/prompt-context/format.js');
    const setting = buildPromptSettingBlock(snapshot);
    assert.equal(setting.split('合并的当前聊天示例').length - 1, 1);
    assert.equal(setting.includes('原卡甲') || setting.includes('原卡乙'), false);
});

test('Messages does not silently use the raw card when the active host example field is unavailable', async () => {
    const adapter = createHostPromptContextAdapter({
        readContext: () => ({ chatId: 'chat-a', characterId: 0,
            characters: [{ avatar: 'a.png', mes_example: '过期原卡示例' }], chat: [], }),
        readStoryEvents: () => '', includeActiveStoryDetails: true,
    });
    await assert.rejects(adapter.capture(), /prompt_context_character_fields_unavailable/);
});

test('Messages rejects malformed active character fields rather than silently omitting them', async () => {
    const adapter = createHostPromptContextAdapter({
        readContext: () => ({ chatId: 'chat-a', characterId: 0,
            characters: [{ avatar: 'a.png', name: '角色', personality: '旧性格' }], chat: [],
            getCharacterCardFields: () => ({ mesExamples: '', personality: 42 }),
        }),
        readStoryEvents: () => '', includeActiveStoryDetails: true, strictBackgroundRead: true,
    });
    await assert.rejects(adapter.capture(), /prompt_context_character_fields_unavailable/);
});

test('Messages retains every active group character rather than dropping members after the shared cap', async () => {
    const characters = Array.from({ length: 17 }, (_, index) => ({ avatar: `character-${index}.png`, name: `角色${index}` }));
    const adapter = createHostPromptContextAdapter({
        readContext: () => ({ chatId: 'group-chat', groupId: 'party', characters,
            groups: [{ id: 'party', members: characters.map(character => character.avatar) }], chat: [] }),
        readStoryEvents: () => '', normalizationLimits: MESSAGE_CONTEXT_LIMITS,
    });
    const captured = await adapter.capture();
    assert.equal(captured.contextSnapshot.characters.length, characters.length);
    assert.equal(captured.contextSnapshot.characters.at(-1).displayName, '角色16');
});
