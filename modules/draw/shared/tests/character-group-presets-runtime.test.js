import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// 运行时依赖酒馆的 getContext / 事件系统 / 服务端存储：这里只替换这三个宿主边界，其余（运行时、纯函数、真实 draw-settings 规范化）都是真代码。
const host = { ctx: null, bus: new Map(), root: {}, saves: 0 };
globalThis.__presetRuntimeTest = host;
globalThis.window = {};

const stubs = {
    'extensions.js': 'export const getContext = () => globalThis.__presetRuntimeTest.ctx;',
    'event-manager.js': `
        const host = globalThis.__presetRuntimeTest;
        export const event_types = { CHAT_CHANGED: 'chat_changed', GROUP_UPDATED: 'group_updated' };
        export const createModuleEvents = (moduleId) => {
            const mine = [];
            return {
                on(type, handler) {
                    if (!host.bus.has(type)) host.bus.set(type, new Set());
                    host.bus.get(type).add(handler);
                    mine.push({ type, handler });
                },
                cleanup() {
                    for (const { type, handler } of mine.splice(0)) host.bus.get(type)?.delete(handler);
                },
                moduleId,
            };
        };
    `,
    'server-storage.js': `
        const host = globalThis.__presetRuntimeTest;
        export const NovelDrawStorage = {
            getStrict: async (key, fallback) => (host.root[key] == null ? fallback : structuredClone(host.root[key])),
            updateAndSave: async (updater) => {
                const draft = structuredClone(host.root);
                await updater(draft);
                host.root = draft;
                host.saves += 1;
                return true;
            },
        };
    `,
};
const bundle = await build({
    stdin: {
        contents: `
            export * from './character-group-presets-runtime.js';
            export * as presets from './character-group-presets.js';
            export * as settingsModule from './draw-settings.js';
        `,
        resolveDir: fileURLToPath(new URL('..', import.meta.url)),
    },
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    plugins: [{
        name: 'group-preset-host-boundaries',
        setup(builder) {
            builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
                const name = path.split('/').at(-1);
                return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
            });
            builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
        },
    }],
});
// 只执行本测试现场构建的本地模块，没有外部输入。
// eslint-disable-next-line no-unsanitized/method
const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const { presets: P } = api;

const CARD1 = 'card1.png';
const CARD2 = 'card2.png';
const GROUP_IDS = ['gA', 'gB', 'gC', 'gD'];

function makeSettings({ applied = null } = {}) {
    const characters = [];
    for (const groupId of GROUP_IDS) {
        for (const n of [1, 2]) characters.push({ id: `${groupId}-${n}`, name: `${groupId}${n}`, groupId, appearance: `tags-${groupId}${n}` });
    }
    characters.push({ id: 'u-1', name: 'U1' });
    let list = [];
    let id;
    ({ presets: list, presetId: id } = P.createPreset(list, 'alpha', { makeId: () => 'p-alpha' }));
    list = P.setGroupStates(list, id, { gA: true, gB: true, gC: false, gD: false });
    list = P.addBinding(list, id, { avatar: CARD1, name: '卡一' });
    ({ presets: list, presetId: id } = P.createPreset(list, 'beta', { makeId: () => 'p-beta' }));
    list = P.setGroupStates(list, id, { gA: true, gB: false, gC: true, gD: true });
    list = P.addBinding(list, id, { avatar: CARD2, name: '卡二' });
    return {
        characterTags: characters,
        characterGroups: GROUP_IDS.map(groupId => ({ id: groupId, name: groupId.slice(1) })),
        characterGroupPresets: list,
        characterGroupPresetApplied: applied,
    };
}

// 内存版设置读写：与 updateSharedDrawSettingsPersistent 一样“在保存时的最新数据上”调用 mutator。
function makeMemorySettings(initial, { failSave = false, staleGet = null } = {}) {
    const state = { data: structuredClone(initial), updates: 0, loads: 0 };
    return {
        state,
        load: async () => { state.loads += 1; return state.data; },
        get: () => (staleGet ? structuredClone(staleGet) : structuredClone(state.data)),
        update: async (mutator) => {
            state.updates += 1;
            if (failSave) return false;
            const draft = structuredClone(state.data);
            await mutator(draft);
            state.data = draft;
            return true;
        },
    };
}

function makeFakeEvents() {
    const handlers = new Map();
    const counts = { cleanups: 0, created: 0 };
    return {
        counts,
        handlers,
        createEvents: (moduleId) => {
            counts.created += 1;
            const mine = [];
            return {
                moduleId,
                on(type, handler) {
                    if (!handlers.has(type)) handlers.set(type, new Set());
                    handlers.get(type).add(handler);
                    mine.push({ type, handler });
                },
                cleanup() {
                    counts.cleanups += 1;
                    for (const { type, handler } of mine.splice(0)) handlers.get(type)?.delete(handler);
                },
            };
        },
        emit(type) {
            for (const handler of [...(handlers.get(type) || [])]) handler();
        },
        count: type => handlers.get(type)?.size || 0,
    };
}

function singleChatContext(avatar) {
    return { characterId: '0', characters: [{ avatar, name: 'N' }], groupId: null, groups: [] };
}

// 各分组当前的开关；角色自己的 enabled 用 ownOf 看（预设不应该改它）
function switchesOf(settings) {
    return Object.fromEntries(settings.characterGroups.map(g => [g.id, g.enabled !== false]));
}

function ownOf(settings) {
    return Object.fromEntries(settings.characterTags.map(c => [c.id, c.enabled !== false]));
}

function makeRuntime(settings, extra = {}) {
    const events = makeFakeEvents();
    const ctxRef = { ctx: singleChatContext(CARD1) };
    const toasts = [];
    const logs = [];
    const runtime = api.createGroupPresetRuntime({
        getContext: () => ctxRef.ctx,
        createEvents: events.createEvents,
        eventTypes: { CHAT_CHANGED: 'chat_changed', GROUP_UPDATED: 'group_updated' },
        settings,
        now: () => 5000,
        toast: message => toasts.push(message),
        logger: { error: (...args) => logs.push(args) },
        ...extra,
    });
    return { runtime, events, ctxRef, toasts, logs };
}

test('getAvatarsFromContext: single chat reads the current character avatar', () => {
    const ctx = { characterId: 1, characters: [{ avatar: 'a.png' }, { avatar: 'b.png' }], groupId: null };
    assert.deepEqual(api.getAvatarsFromContext(ctx), ['b.png']);
    assert.deepEqual(api.getAvatarsFromContext({ ...ctx, characterId: '0' }), ['a.png']);
    assert.deepEqual(api.getAvatarsFromContext({ ...ctx, characterId: undefined }), []);
    assert.deepEqual(api.getAvatarsFromContext({ ...ctx, characterId: null }), []);
    assert.deepEqual(api.getAvatarsFromContext({ ...ctx, characterId: '' }), []);
    assert.deepEqual(api.getAvatarsFromContext({ ...ctx, characterId: 9 }), []);
    assert.deepEqual(api.getAvatarsFromContext({ ...ctx, characterId: -1 }), []);
    assert.deepEqual(api.getAvatarsFromContext({ ...ctx, characterId: 'x' }), []);
    assert.deepEqual(api.getAvatarsFromContext({ characterId: 0, characters: [{ name: 'no avatar' }] }), []);
    assert.deepEqual(api.getAvatarsFromContext({ characterId: 0 }), []);
    assert.deepEqual(api.getAvatarsFromContext(null), []);
    assert.deepEqual(api.getAvatarsFromContext(undefined), []);
});

test('getAvatarsFromContext: group chat reads the members of the current group only', () => {
    const ctx = {
        characterId: 0,
        characters: [{ avatar: 'lone.png' }],
        groupId: '1700000000',
        groups: [
            { id: '1', members: ['no.png'] },
            { id: 1700000000, members: ['a.png', 'b.png', 'a.png', 7, '', null] },
        ],
    };
    assert.deepEqual(api.getAvatarsFromContext(ctx), ['a.png', 'b.png']);
    assert.deepEqual(api.getAvatarsFromContext({ ...ctx, groupId: 'missing' }), []);
    assert.deepEqual(api.getAvatarsFromContext({ ...ctx, groups: [{ id: '1700000000' }] }), []);
    assert.deepEqual(api.getAvatarsFromContext({ ...ctx, groups: undefined }), []);
});

test('listCharactersFromContext returns avatar and name once per avatar', () => {
    const ctx = { characters: [{ avatar: 'a.png', name: '甲' }, { avatar: 'a.png', name: '重复' }, { avatar: '', name: 'x' }, null, { avatar: 'b.png' }] };
    assert.deepEqual(api.listCharactersFromContext(ctx), [{ avatar: 'a.png', name: '甲' }, { avatar: 'b.png', name: '' }]);
    assert.deepEqual(api.listCharactersFromContext({}), []);
    assert.deepEqual(api.listCharactersFromContext(null), []);
});

test('CHAT_CHANGED applies the matching preset once and notifies subscribers', async () => {
    const settings = makeMemorySettings(makeSettings());
    const { runtime, events, ctxRef, toasts } = makeRuntime(settings);
    const notices = [];
    runtime.onGroupPresetApplied(notice => notices.push(notice));
    assert.equal(runtime.startGroupPresetWatcher({ immediate: false }), true);
    assert.equal(events.count('chat_changed'), 1);
    assert.equal(settings.state.updates, 0);

    events.emit('chat_changed');
    await runtime.idle();
    assert.deepEqual(switchesOf(settings.state.data), { gA: true, gB: true, gC: false, gD: false });
    assert.deepEqual(settings.state.data.characterTags, makeSettings().characterTags, 'no character is touched');
    assert.deepEqual(settings.state.data.characterGroupPresetApplied, { presetId: 'p-alpha', revision: 3, appliedAt: 5000 });
    assert.equal(settings.state.updates, 1);
    assert.equal(notices.length, 1);
    assert.equal(notices[0].presetId, 'p-alpha');
    assert.equal(notices[0].presetName, 'alpha');
    assert.equal(notices[0].changed, true);
    assert.equal(notices[0].changedCount, 2);
    assert.equal(notices[0].saved, true);
    assert.equal(toasts.length, 1);
    assert.match(toasts[0], /alpha/);
    assert.match(toasts[0], /2 个分组开关变化/);

    // 其它字段、分组名与顺序、预设本身保持原样
    assert.equal(settings.state.data.characterTags.find(c => c.id === 'gC-1').appearance, 'tags-gC1');
    assert.deepEqual(settings.state.data.characterGroups.map(g => [g.id, g.name]), GROUP_IDS.map(id => [id, id.slice(1)]));
    assert.deepEqual(settings.state.data.characterGroups.find(g => g.id === 'gC'), { id: 'gC', name: 'C', enabled: false });
    assert.equal(Object.hasOwn(settings.state.data.characterGroups.find(g => g.id === 'gA'), 'enabled'), false, 'groups left on keep no enabled key');
    assert.deepEqual(settings.state.data.characterGroupPresets, makeSettings().characterGroupPresets);

    // 同一预设：再次切换聊天不重复应用，也不写设置
    events.emit('chat_changed');
    await runtime.idle();
    assert.equal(settings.state.updates, 1);
    assert.equal(notices.length, 1);

    // 换到绑定了另一个预设的角色卡
    ctxRef.ctx = singleChatContext(CARD2);
    events.emit('chat_changed');
    await runtime.idle();
    assert.deepEqual(switchesOf(settings.state.data), { gA: true, gB: false, gC: true, gD: true });
    assert.deepEqual(settings.state.data.characterTags, makeSettings().characterTags);
    assert.equal(settings.state.data.characterGroupPresetApplied.presetId, 'p-beta');
    assert.equal(notices.length, 2);
});

test('a chat with no matching preset (or no character) writes nothing and keeps the applied record', async () => {
    const applied = { presetId: 'p-alpha', revision: 3, appliedAt: 9 };
    const settings = makeMemorySettings(makeSettings({ applied }));
    const { runtime, events, ctxRef, toasts } = makeRuntime(settings);
    const notices = [];
    runtime.onGroupPresetApplied(notice => notices.push(notice));
    runtime.startGroupPresetWatcher({ immediate: false });
    for (const ctx of [singleChatContext('stranger.png'), { characterId: undefined, characters: [], groupId: null }, null]) {
        ctxRef.ctx = ctx;
        events.emit('chat_changed');
        await runtime.idle();
    }
    assert.equal(settings.state.updates, 0);
    assert.equal(notices.length, 0);
    assert.equal(toasts.length, 0);
    assert.deepEqual(settings.state.data.characterGroupPresetApplied, applied);
    assert.deepEqual(settings.state.data.characterTags, makeSettings().characterTags);
    const result = await runtime.applyGroupPresetForCurrentChat();
    assert.equal(result.status, 'no-avatars');
});

test('group chat: any member bound to a preset triggers it, earlier presets win', async () => {
    const settings = makeMemorySettings(makeSettings());
    const { runtime, events, ctxRef } = makeRuntime(settings);
    ctxRef.ctx = {
        characterId: undefined,
        characters: [],
        groupId: 'g1',
        groups: [{ id: 'g1', members: ['x.png', CARD2, CARD1] }],
    };
    runtime.startGroupPresetWatcher({ immediate: false });
    events.emit('chat_changed');
    await runtime.idle();
    assert.equal(settings.state.data.characterGroupPresetApplied.presetId, 'p-alpha');

    ctxRef.ctx = { ...ctxRef.ctx, groups: [{ id: 'g1', members: ['x.png', CARD2] }] };
    events.emit('chat_changed');
    await runtime.idle();
    assert.equal(settings.state.data.characterGroupPresetApplied.presetId, 'p-beta');
});

test('immediate start applies for the current chat; start is idempotent; GROUP_UPDATED also triggers', async () => {
    const settings = makeMemorySettings(makeSettings());
    const { runtime, events, ctxRef } = makeRuntime(settings);
    assert.equal(runtime.startGroupPresetWatcher(), true);
    assert.equal(runtime.startGroupPresetWatcher(), false);
    assert.equal(events.counts.created, 1);
    assert.equal(runtime.isWatching(), true);
    await runtime.idle();
    assert.equal(settings.state.data.characterGroupPresetApplied.presetId, 'p-alpha');

    ctxRef.ctx = singleChatContext(CARD2);
    assert.equal(events.count('group_updated'), 1);
    events.emit('group_updated');
    await runtime.idle();
    assert.equal(settings.state.data.characterGroupPresetApplied.presetId, 'p-beta');
});

test('stopping removes every listener, ignores late events and allows a clean restart', async () => {
    const settings = makeMemorySettings(makeSettings());
    const { runtime, events } = makeRuntime(settings);
    runtime.startGroupPresetWatcher({ immediate: false });
    const lateHandler = [...events.handlers.get('chat_changed')][0];
    assert.equal(runtime.stopGroupPresetWatcher(), true);
    assert.equal(runtime.stopGroupPresetWatcher(), false);
    assert.equal(events.counts.cleanups, 1);
    assert.equal(events.count('chat_changed'), 0);
    assert.equal(events.count('group_updated'), 0);
    assert.equal(runtime.isWatching(), false);

    events.emit('chat_changed');
    lateHandler();
    await runtime.idle();
    assert.equal(settings.state.updates, 0);

    assert.equal(runtime.startGroupPresetWatcher({ immediate: false }), true);
    assert.equal(events.count('chat_changed'), 1);
    events.emit('chat_changed');
    await runtime.idle();
    assert.equal(settings.state.updates, 1);
    // 旧一代的处理器即使被重新调用也不会再触发
    lateHandler();
    await runtime.idle();
    assert.equal(settings.state.updates, 1);
});

test('stopping while an apply is queued cancels the queued watcher task', async () => {
    const settings = makeMemorySettings(makeSettings());
    const { runtime, events } = makeRuntime(settings);
    runtime.startGroupPresetWatcher({ immediate: false });
    events.emit('chat_changed');
    runtime.stopGroupPresetWatcher();
    await runtime.idle();
    assert.equal(settings.state.updates, 0);
    assert.equal(settings.state.data.characterGroupPresetApplied, null);
});

test('manual apply: force reapplies the matched preset, manual applies do not toast', async () => {
    const settings = makeMemorySettings(makeSettings());
    const { runtime, toasts } = makeRuntime(settings);
    const first = await runtime.applyGroupPresetForCurrentChat();
    assert.equal(first.status, 'applied');
    assert.equal(toasts.length, 1);

    // 用户手动调整后，普通触发不覆盖，force 才覆盖
    settings.state.data.characterGroups = settings.state.data.characterGroups.map(g => (g.id === 'gC' ? { id: g.id, name: g.name } : g));
    const plain = await runtime.applyGroupPresetForCurrentChat();
    assert.equal(plain.status, 'already-applied');
    assert.equal(switchesOf(settings.state.data).gC, true);
    const forced = await runtime.applyGroupPresetForCurrentChat({ force: true });
    assert.equal(forced.status, 'applied');
    assert.equal(forced.forced, true);
    assert.equal(forced.changedCount, 1);
    assert.equal(switchesOf(settings.state.data).gC, false);

    // 指定预设：当前聊天（卡一）并未绑定 beta，也照样应用并记录
    const manual = await runtime.applyGroupPresetForCurrentChat({ presetId: 'p-beta' });
    assert.equal(manual.status, 'applied');
    assert.equal(manual.manual, true);
    assert.equal(settings.state.data.characterGroupPresetApplied.presetId, 'p-beta');
    assert.equal(switchesOf(settings.state.data).gB, false);
    assert.equal(toasts.length, 1);

    const missing = await runtime.applyGroupPresetForCurrentChat({ presetId: 'ghost' });
    assert.equal(missing.status, 'preset-missing');
});

test('forcing an already consistent state changes nothing and does not save', async () => {
    const settings = makeMemorySettings(makeSettings());
    const { runtime } = makeRuntime(settings);
    await runtime.applyGroupPresetForCurrentChat();
    assert.equal(settings.state.updates, 1);
    const notices = [];
    runtime.onGroupPresetApplied(notice => notices.push(notice));
    const again = await runtime.applyGroupPresetForCurrentChat({ force: true });
    assert.equal(again.status, 'applied');
    assert.equal(again.changed, false);
    assert.equal(again.recordChanged, false);
    assert.equal(again.saved, false);
    assert.equal(settings.state.updates, 1);
    assert.equal(notices.length, 0);
});

test('when only the applied record changes it is saved but the library is untouched', async () => {
    const initial = makeSettings();
    initial.characterGroups = initial.characterGroups.map(g => (['gC', 'gD'].includes(g.id) ? { ...g, enabled: false } : g));
    const settings = makeMemorySettings(initial);
    const { runtime, toasts } = makeRuntime(settings);
    const notices = [];
    runtime.onGroupPresetApplied(notice => notices.push(notice));
    const result = await runtime.applyGroupPresetForCurrentChat();
    assert.equal(result.status, 'applied');
    assert.equal(result.changed, false);
    assert.equal(result.recordChanged, true);
    assert.equal(settings.state.updates, 1);
    assert.equal(settings.state.data.characterGroupPresetApplied.presetId, 'p-alpha');
    assert.deepEqual(settings.state.data.characterTags, initial.characterTags);
    assert.deepEqual(settings.state.data.characterGroups, initial.characterGroups);
    assert.equal(toasts.length, 0);
    assert.equal(notices.length, 1);
    await runtime.applyGroupPresetForCurrentChat();
    assert.equal(settings.state.updates, 1);
});

test('the preset is planned again on the freshest data at save time and only writes characterGroups', async () => {
    const stale = makeSettings();
    const live = makeSettings();
    // 保存前面板刚把 C 关掉、新增了一个关着的 E 组、并新增了角色
    live.characterGroups = [
        ...live.characterGroups.map(g => (g.id === 'gC' ? { ...g, enabled: false } : g)),
        { id: 'gE', name: 'E', enabled: false },
    ];
    live.characterTags = [...live.characterTags, { id: 'fresh', name: '新来的', groupId: 'gC' }];
    const settings = makeMemorySettings(live, { staleGet: stale });
    const { runtime } = makeRuntime(settings);
    const result = await runtime.applyGroupPresetForCurrentChat();
    assert.equal(result.status, 'applied');
    assert.equal(result.changedCount, 1, 'planned on live data: C was already off, only D flips');
    assert.deepEqual(result.affected, [{ key: 'gD', enabled: false }]);
    assert.deepEqual(switchesOf(settings.state.data), { gA: true, gB: true, gC: false, gD: false, gE: false });
    assert.deepEqual(settings.state.data.characterTags, live.characterTags, 'characterTags is not rewritten');
    assert.equal(ownOf(settings.state.data).fresh, true);
});

test('a failed save reports save-failed and does not notify; errors never escape', async () => {
    const failing = makeMemorySettings(makeSettings(), { failSave: true });
    const { runtime, toasts } = makeRuntime(failing);
    const notices = [];
    runtime.onGroupPresetApplied(notice => notices.push(notice));
    const result = await runtime.applyGroupPresetForCurrentChat();
    assert.equal(result.status, 'save-failed');
    assert.equal(result.saved, false);
    assert.equal(notices.length, 0);
    assert.equal(toasts.length, 0);
    assert.equal(failing.state.data.characterGroupPresetApplied, null);

    const broken = makeRuntime(makeMemorySettings(makeSettings()), { getContext: () => { throw new Error('boom'); } });
    const errored = await broken.runtime.applyGroupPresetForCurrentChat();
    assert.equal(errored.status, 'error');
    assert.equal(errored.message, 'boom');
    assert.equal(broken.logs.length, 1);

    const loadFails = makeMemorySettings(makeSettings());
    loadFails.load = async () => { throw new Error('offline'); };
    const offline = makeRuntime(loadFails);
    assert.equal((await offline.runtime.applyGroupPresetForCurrentChat()).status, 'error');
    assert.equal(loadFails.state.updates, 0);
});

test('subscribers can unsubscribe and a throwing subscriber does not break others', async () => {
    const settings = makeMemorySettings(makeSettings());
    const { runtime, logs } = makeRuntime(settings);
    const seen = [];
    runtime.onGroupPresetApplied(() => { throw new Error('bad subscriber'); });
    const off = runtime.onGroupPresetApplied(notice => seen.push(notice.presetId));
    runtime.onGroupPresetApplied('not a function')();
    await runtime.applyGroupPresetForCurrentChat();
    assert.deepEqual(seen, ['p-alpha']);
    assert.equal(logs.length, 1);
    off();
    await runtime.applyGroupPresetForCurrentChat({ force: true, presetId: 'p-beta' });
    assert.deepEqual(seen, ['p-alpha']);
});

test('overlapping applies are serialized so the second sees the first result', async () => {
    const settings = makeMemorySettings(makeSettings());
    const { runtime } = makeRuntime(settings);
    const [a, b] = await Promise.all([
        runtime.applyGroupPresetForCurrentChat(),
        runtime.applyGroupPresetForCurrentChat(),
    ]);
    assert.equal(a.status, 'applied');
    assert.equal(b.status, 'already-applied');
    assert.equal(settings.state.updates, 1);
});

test('no presets: nothing is read from the chat beyond the check and nothing is saved', async () => {
    const initial = makeSettings();
    initial.characterGroupPresets = [];
    const settings = makeMemorySettings(initial);
    const { runtime } = makeRuntime(settings);
    assert.equal((await runtime.applyGroupPresetForCurrentChat()).status, 'no-presets');
    assert.equal(settings.state.updates, 0);
});

test('runtime helpers read the injected context', () => {
    const { runtime, ctxRef } = makeRuntime(makeMemorySettings(makeSettings()));
    ctxRef.ctx = { characterId: 0, characters: [{ avatar: 'z.png', name: 'Z' }], groupId: null };
    assert.deepEqual(runtime.getActiveCharacterAvatars(), ['z.png']);
    assert.deepEqual(runtime.listHostCharacters(), [{ avatar: 'z.png', name: 'Z' }]);
});

// ─── 默认接线：真实 draw-settings + 默认事件通道（仅宿主边界被替换）───
test('default wiring persists through the shared settings root and keeps presets and unrelated settings', async () => {
    host.bus.clear();
    host.saves = 0;
    host.root = {
        settings: {
            apiKey: 'provider-key',
            cacheDays: 7,
            ...makeSettings(),
        },
    };
    host.ctx = singleChatContext(CARD1);
    const runtime = api.createGroupPresetRuntime({ toast: () => {} });
    await api.settingsModule.loadSharedDrawSettings();
    assert.equal(runtime.startGroupPresetWatcher({ immediate: false }), true);
    assert.equal(host.bus.get('chat_changed').size, 1);

    for (const handler of [...host.bus.get('chat_changed')]) handler();
    await runtime.idle();
    assert.equal(host.saves, 1);
    const saved = host.root.settings;
    assert.equal(saved.apiKey, 'provider-key');
    assert.equal(saved.cacheDays, 7);
    assert.deepEqual(saved.characterGroups.map(g => [g.id, g.enabled !== false]), [['gA', true], ['gB', true], ['gC', false], ['gD', false]]);
    assert.deepEqual(ownOf(saved), ownOf(makeSettings()));
    assert.equal(saved.characterGroupPresets.length, 2);
    assert.equal(saved.characterGroupPresetApplied.presetId, 'p-alpha');
    assert.equal(api.settingsModule.getSharedDrawSettings().characterGroupPresetApplied.presetId, 'p-alpha');

    for (const handler of [...host.bus.get('chat_changed')]) handler();
    await runtime.idle();
    assert.equal(host.saves, 1);

    runtime.stopGroupPresetWatcher();
    assert.equal(host.bus.get('chat_changed').size, 0);
});

// ─── 保存通道与上下文订阅（面板接线用）───
test('saveGroupPresets normalizes against the latest groups, writes only the presets, then applies once without forcing', async () => {
    const initial = makeSettings({ applied: { presetId: 'p-alpha', revision: 3, appliedAt: 1 } });
    const settings = makeMemorySettings(initial);
    // 保存时 gD 已经被删掉：预设里对它的引用要被清理
    settings.state.data.characterGroups = settings.state.data.characterGroups.filter(group => group.id !== 'gD');
    const { runtime } = makeRuntime(settings);
    const edited = structuredClone(initial.characterGroupPresets);
    edited[0] = { ...edited[0], revision: 4, groupStates: { gA: false, gD: true } };

    const result = await runtime.saveGroupPresets(edited);
    assert.equal(result.status, 'saved');
    assert.deepEqual(settings.state.data.characterGroupPresets[0].groupStates, { gA: false });
    assert.deepEqual(settings.state.data.characterTags, initial.characterTags, 'characters are untouched');
    // 预设的开关刚变（revision 3 → 4）：保存之后的非强制应用会重新应用
    assert.equal(result.apply.status, 'applied');
    assert.equal(result.apply.forced, false);
    assert.deepEqual(settings.state.data.characterGroupPresetApplied, { presetId: 'p-alpha', revision: 4, appliedAt: 5000 });
    assert.equal(switchesOf(settings.state.data).gA, false);

    // 内容没变再保存一次：不再应用
    const again = await runtime.saveGroupPresets(settings.state.data.characterGroupPresets);
    assert.equal(again.status, 'saved');
    assert.equal(again.apply.status, 'already-applied');
});

test('saveGroupPresets rejects non-array input without touching settings, and a failed save does not apply', async () => {
    const settings = makeMemorySettings(makeSettings());
    const { runtime } = makeRuntime(settings);
    assert.equal((await runtime.saveGroupPresets('nope')).status, 'invalid');
    assert.equal(settings.state.updates, 0);

    const failing = makeMemorySettings(makeSettings(), { failSave: true });
    const failed = await makeRuntime(failing).runtime.saveGroupPresets(makeSettings().characterGroupPresets);
    assert.equal(failed.status, 'save-failed');
    assert.equal(failed.saved, false);
    assert.equal(failed.apply, undefined);
    assert.equal(failing.state.updates, 1, 'only the save was attempted');
});

test('onGroupPresetContextChanged fires after every chat event, matched or not, and can be cancelled', async () => {
    const settings = makeMemorySettings(makeSettings());
    const { runtime, events, ctxRef } = makeRuntime(settings);
    const seen = [];
    const off = runtime.onGroupPresetContextChanged(context => seen.push(context.activeAvatars));
    runtime.startGroupPresetWatcher({ immediate: false });

    ctxRef.ctx = singleChatContext('nobody.png');
    events.emit('chat_changed');
    await runtime.idle();
    assert.deepEqual(seen, [['nobody.png']]);
    assert.equal(settings.state.updates, 0, 'no match: nothing written');

    ctxRef.ctx = singleChatContext(CARD1);
    events.emit('group_updated');
    await runtime.idle();
    assert.deepEqual(seen.at(-1), [CARD1]);
    assert.equal(seen.length, 2);

    off();
    events.emit('chat_changed');
    await runtime.idle();
    assert.equal(seen.length, 2);
    runtime.stopGroupPresetWatcher();
});
