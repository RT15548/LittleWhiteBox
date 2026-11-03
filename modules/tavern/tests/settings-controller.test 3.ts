import test from 'node:test';
import assert from 'node:assert/strict';
import { computed, nextTick, ref } from 'vue';

import { normalizeTavernDisplaySettings } from '../shared/settings';
import { useTavernSettingsController, type TavernSettingsWorkspaceKey } from '../app-src/components/settings/useTavernSettingsController';

function flushAsyncState() {
    return new Promise((resolve) => {
        setTimeout(async () => {
            await nextTick();
            resolve(undefined);
        }, 0);
    });
}

function regexListPayload(scriptName: string): Record<string, unknown> {
    return {
        result: {
            groups: [{
                key: 'character',
                label: '角色正则',
                scriptType: 1,
                allowed: true,
                scripts: [{
                    id: scriptName,
                    scriptName,
                    findRegex: scriptName,
                    replaceString: '',
                    placement: [],
                }],
            }],
        },
    };
}

function regexListPayloadMany(scriptNames: string[]): Record<string, unknown> {
    return {
        result: {
            groups: [{
                key: 'character',
                label: '角色正则',
                scriptType: 1,
                allowed: true,
                scripts: scriptNames.map((scriptName) => ({
                    id: scriptName,
                    scriptName,
                    findRegex: scriptName,
                    replaceString: '',
                    placement: [] as number[],
                })),
            }],
        },
    };
}

function worldbookEntryPayload(comment: string, content: string, entryHash: string, keys: string[] = [], uid = '1'): Record<string, unknown> {
    return {
        result: {
            worldbookName: 'Book',
            uid,
            comment,
            content,
            key: keys,
            keysecondary: [],
            secondary_keys: [],
            order: 100,
            position: 0,
            role: 0,
            entryHash,
            revision: entryHash,
        },
    };
}

function worldbookPreviewPayload(comment: string, content: string, keys: string[] = [], uid = '1'): Record<string, unknown> {
    return {
        result: {
            name: 'Book',
            entryCount: 1,
            enabledCount: 1,
            constantCount: 0,
            disabledCount: 0,
            keywordCount: keys.length,
            totalChars: content.length,
            entries: [{
                uid,
                name: comment,
                keys,
                secondaryKeys: [],
                contentPreview: content,
                enabled: true,
                constant: false,
                vectorized: false,
                order: 100,
                position: 0,
                role: 0,
                depth: null,
                probability: null,
            }],
        },
    };
}

function chatPresetBundle(name: string, prompt: Record<string, unknown> = {}, activeCharacterId = 'char-1'): Record<string, unknown> {
    const promptRecord = {
        identifier: 'main',
        name: 'Main',
        role: 'system',
        content: `${name} MAIN`,
        ...prompt,
    };
    const activeOrder = [{ identifier: String(promptRecord.identifier || 'main'), enabled: true }];
    return {
        id: name,
        name,
        source: 'sillytavern',
        promptManager: {
            name,
            rawPreset: {
                prompts: [promptRecord],
                prompt_order: [{ character_id: activeCharacterId, order: activeOrder }],
            },
            prompts: [promptRecord],
            promptOrder: [{ character_id: activeCharacterId, order: activeOrder }],
            activeCharacterId,
            activeOrder,
        },
        sections: [],
    };
}

function promptManagerPrompt(bundle: unknown, identifier = 'main'): Record<string, unknown> {
    const source = bundle && typeof bundle === 'object' ? bundle as Record<string, unknown> : {};
    const promptManager = source.promptManager && typeof source.promptManager === 'object'
        ? source.promptManager as Record<string, unknown>
        : {};
    const prompts = Array.isArray(promptManager.prompts) ? promptManager.prompts : [];
    return prompts.find((item) => {
        const prompt = item && typeof item === 'object' ? item as Record<string, unknown> : {};
        return String(prompt.identifier || prompt.id || '') === identifier;
    }) as Record<string, unknown> || {};
}

test('display settings revert to the last committed values when host save fails', async () => {
    const activeView = ref('home');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('base');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({
        hiddenOutsideCount: 5,
        loadBatchSize: 20,
    }));
    let rejectSave: ((reason?: unknown) => void) | null = null;
    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => ''),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: async (type) => {
            if (type !== 'xb-tavern:save-display-settings') {
                return {};
            }
            return await new Promise<Record<string, unknown>>((_resolve, reject) => {
                rejectSave = reject;
            });
        },
        shortText: (value = '') => String(value || ''),
    });

    controller.settingsContext.stepHiddenOutsideCount(1);
    assert.equal(controller.settingsContext.displaySettings.value.hiddenOutsideCount, 6);
    assert.equal(tavernDisplaySettings.value.hiddenOutsideCount, 6);

    rejectSave?.(new Error('save failed'));
    await flushAsyncState();

    assert.equal(controller.settingsContext.displaySettings.value.hiddenOutsideCount, 5);
    assert.equal(tavernDisplaySettings.value.hiddenOutsideCount, 5);
    assert.equal(controller.settingsContext.baseSettingsSaving.value, false);
    assert.equal(controller.settingsContext.baseSettingsStatus.value, 'save failed');
});

test('runtime chat preset follows the LittleWhiteBox selected preset state', async () => {
    const activeView = ref('chat');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('chatPreset');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => ''),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: async (type, payload = {}) => {
            if (type === 'xb-tavern:select-chat-preset') {
                const source = payload.payload as Record<string, unknown>;
                const name = String(source.promptManagerName || 'Preset B');
                return {
                    result: {
                        id: name,
                        name,
                        source: 'sillytavern',
                        promptManager: {
                            name,
                            prompts: [{ identifier: 'main', name: 'Main', role: 'system', content: 'B MAIN' }],
                            promptOrder: [{ character_id: '0', order: [{ identifier: 'main', enabled: true }] }],
                            activeCharacterId: '0',
                            activeOrder: [{ identifier: 'main', enabled: true }],
                        },
                        sections: [],
                    },
                };
            }
            return {};
        },
        shortText: (value = '') => String(value || ''),
    });

    await controller.settingsContext.selectChatPresetFromHost('Preset B');

    assert.equal(controller.runtimeChatPreset.value.name, 'Preset B');
    assert.equal(controller.runtimeChatPreset.value.promptManager?.name, 'Preset B');
    assert.equal(
        String((controller.runtimeChatPreset.value.promptManager?.prompts as Array<Record<string, unknown>>)[0]?.content || ''),
        'B MAIN',
    );
});

test('runtime chat preset ignores unsaved editor draft and tracks synced ST active preset', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('chatPreset');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => ''),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: async (type) => {
            if (type === 'xb-tavern:list-chat-presets') {
                return {
                    result: {
                        active: {
                            id: 'Preset B',
                            name: 'Preset B',
                            source: 'sillytavern',
                            promptManager: {
                                name: 'Preset B',
                                prompts: [{ identifier: 'main', name: 'Main', role: 'system', content: 'B MAIN' }],
                                promptOrder: [{ character_id: '0', order: [{ identifier: 'main', enabled: true }] }],
                                activeCharacterId: '0',
                                activeOrder: [{ identifier: 'main', enabled: true }],
                            },
                            sections: [],
                        },
                        components: { promptManager: ['Preset A', 'Preset B'] },
                    },
                };
            }
            return {};
        },
        shortText: (value = '') => String(value || ''),
    });

    controller.applyHostChatPreset({
        chatPreset: {
            id: 'Preset A',
            name: 'Preset A',
            source: 'sillytavern',
            promptManager: {
                name: 'Preset A',
                prompts: [{ identifier: 'main', name: 'Main', role: 'system', content: 'A MAIN' }],
                promptOrder: [{ character_id: '0', order: [{ identifier: 'main', enabled: true }] }],
                activeCharacterId: '0',
                activeOrder: [{ identifier: 'main', enabled: true }],
            },
            sections: [],
        },
    });
    controller.settingsContext.updatePromptByIdentifier('main', { content: 'UNSAVED DRAFT' });

    assert.equal(
        String((controller.runtimeChatPreset.value.promptManager?.prompts as Array<Record<string, unknown>>)[0]?.content || ''),
        'A MAIN',
    );

    await controller.settingsContext.syncChatPresetFromHost();

    assert.equal(controller.runtimeChatPreset.value.name, 'Preset B');
    assert.equal(
        String((controller.runtimeChatPreset.value.promptManager?.prompts as Array<Record<string, unknown>>)[0]?.content || ''),
        'B MAIN',
    );
    assert.equal(
        String((controller.settingsContext.preset.value.promptManager?.prompts as Array<Record<string, unknown>>)[0]?.content || ''),
        'UNSAVED DRAFT',
    );
});

test('chat preset save feedback stays on the save button instead of the status banner', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('chatPreset');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => ''),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: async (type) => {
            if (type === 'xb-tavern:save-chat-preset') {
                return { ok: false, error: 'host refused save' };
            }
            return {};
        },
        shortText: (value = '') => String(value || ''),
    });

    controller.applyHostChatPreset({
        chatPreset: {
            id: 'Preset A',
            name: 'Preset A',
            source: 'sillytavern',
            promptManager: {
                name: 'Preset A',
                rawPreset: {
                    prompts: [{ identifier: 'main', name: 'Main', role: 'system', content: 'A MAIN' }],
                    prompt_order: [{ character_id: 'char-1', order: [{ identifier: 'main', enabled: true }] }],
                },
                prompts: [{ identifier: 'main', name: 'Main', role: 'system', content: 'A MAIN' }],
                promptOrder: [{ character_id: 'char-1', order: [{ identifier: 'main', enabled: true }] }],
                activeCharacterId: 'char-1',
                activeOrder: [{ identifier: 'main', enabled: true }],
            },
            sections: [],
        },
    });
    controller.settingsContext.updatePromptByIdentifier('main', { content: 'A MAIN edited' });

    await controller.settingsContext.saveCurrentPreset();

    assert.equal(controller.settingsContext.presetStatus.value, '');
    assert.equal(controller.settingsContext.presetSaveFeedback.value.status, 'error');
    assert.equal(controller.settingsContext.presetSaveFeedback.value.error, 'host refused save');
});

test('chat preset server save reports timeout through the save button', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('chatPreset');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    const timers: Array<{ callback: () => void; delay?: number }> = [];
    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;
    let saveSignal: AbortSignal | null = null;
    globalThis.setTimeout = ((callback: TimerHandler, delay?: number) => {
        const entry = {
            callback: () => {
                if (typeof callback === 'function') {
                    callback();
                }
            },
            delay,
        };
        timers.push(entry);
        return timers.length as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout;
    globalThis.clearTimeout = (() => {}) as typeof clearTimeout;
    try {
        const controller = useTavernSettingsController({
            activeView,
            activeSettingsWorkspace,
            agentConfig,
            tavernDisplaySettings,
            effectiveContext: computed(() => ({})),
            currentNativeCharacterId: computed(() => ''),
            regexNativeCharacterId: computed(() => ''),
            homeThemeDark: ref(false),
            isRunning: ref(false),
            confirmDialog: async () => true,
            describeError: (error) => error instanceof Error ? error.message : String(error || ''),
            postToHost: () => {},
            requestHost: async (type, _payload, options = {}) => {
                if (type === 'xb-tavern:save-chat-preset') {
                    saveSignal = options.signal || null;
                    return await new Promise<Record<string, unknown>>((_resolve, reject) => {
                        options.signal?.addEventListener('abort', () => reject(new Error('request_aborted')), { once: true });
                    });
                }
                return {};
            },
            shortText: (value = '') => String(value || ''),
        });

        controller.applyHostChatPreset({
            chatPreset: {
                id: 'Preset A',
                name: 'Preset A',
                source: 'sillytavern',
                promptManager: {
                    name: 'Preset A',
                    rawPreset: {
                        prompts: [{ identifier: 'main', name: 'Main', role: 'system', content: 'A MAIN' }],
                        prompt_order: [{ character_id: 'char-1', order: [{ identifier: 'main', enabled: true }] }],
                    },
                    prompts: [{ identifier: 'main', name: 'Main', role: 'system', content: 'A MAIN' }],
                    promptOrder: [{ character_id: 'char-1', order: [{ identifier: 'main', enabled: true }] }],
                    activeCharacterId: 'char-1',
                    activeOrder: [{ identifier: 'main', enabled: true }],
                },
                sections: [],
            },
        });
        controller.settingsContext.updatePromptByIdentifier('main', { content: 'A MAIN edited' });

        const savePromise = controller.settingsContext.saveCurrentPreset();
        const saveTimeout = timers.find((timer) => timer.delay === 5000);
        assert.ok(saveTimeout);
        saveTimeout.callback();
        await savePromise;

        assert.equal(saveSignal?.aborted, true);
        assert.equal(controller.settingsContext.presetStatus.value, '');
        assert.equal(controller.settingsContext.presetSaveFeedback.value.status, 'error');
        assert.equal(controller.settingsContext.presetSaveFeedback.value.error, '保存超时，请重试');
    } finally {
        globalThis.setTimeout = originalSetTimeout;
        globalThis.clearTimeout = originalClearTimeout;
    }
});

test('chat preset save response does not replace edits made while saving', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('chatPreset');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    let savePayload: Record<string, unknown> | null = null;
    let resolveSave: ((value: Record<string, unknown>) => void) | null = null;
    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => ''),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: async (type, payload = {}) => {
            if (type !== 'xb-tavern:save-chat-preset') {
                return {};
            }
            savePayload = payload.payload as Record<string, unknown>;
            return await new Promise<Record<string, unknown>>((resolve) => {
                resolveSave = resolve;
            });
        },
        shortText: (value = '') => String(value || ''),
    });

    controller.applyHostChatPreset({ chatPreset: chatPresetBundle('Preset A') });
    controller.settingsContext.updatePromptByIdentifier('main', { name: 'First name', content: 'First content' });

    const savePromise = controller.settingsContext.saveCurrentPreset();
    controller.settingsContext.updatePromptByIdentifier('main', { name: 'Second name', content: 'Second content' });

    assert.equal(promptManagerPrompt(savePayload).name, 'First name');
    assert.equal(promptManagerPrompt(savePayload).content, 'First content');

    resolveSave?.({ result: savePayload || chatPresetBundle('Preset A', { name: 'First name', content: 'First content' }) });
    await savePromise;
    await flushAsyncState();

    const draftPrompt = promptManagerPrompt(controller.settingsContext.preset.value);
    assert.equal(draftPrompt.name, 'Second name');
    assert.equal(draftPrompt.content, 'Second content');
    assert.equal(controller.settingsContext.presetDirty.value, true);
});

test('chat preset selection ignores stale out-of-order responses', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('chatPreset');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    const pendingSelections: Record<string, (value: Record<string, unknown>) => void> = {};
    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => ''),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: async (type, payload = {}) => {
            if (type !== 'xb-tavern:select-chat-preset') {
                return {};
            }
            const source = payload.payload as Record<string, unknown>;
            const name = String(source.promptManagerName || '');
            return await new Promise<Record<string, unknown>>((resolve) => {
                pendingSelections[name] = resolve;
            });
        },
        shortText: (value = '') => String(value || ''),
    });

    controller.applyHostChatPreset({ chatPreset: chatPresetBundle('Base') });

    const selectA = controller.settingsContext.selectChatPresetFromHost('Preset A');
    const selectB = controller.settingsContext.selectChatPresetFromHost('Preset B');

    pendingSelections['Preset B']?.({ result: chatPresetBundle('Preset B', { name: 'B name', content: 'B content' }) });
    await selectB;
    await flushAsyncState();

    assert.equal(controller.settingsContext.preset.value.name, 'Preset B');
    assert.equal(promptManagerPrompt(controller.settingsContext.preset.value).content, 'B content');

    pendingSelections['Preset A']?.({ result: chatPresetBundle('Preset A', { name: 'A name', content: 'A content' }) });
    await selectA;
    await flushAsyncState();

    assert.equal(controller.settingsContext.preset.value.name, 'Preset B');
    assert.equal(promptManagerPrompt(controller.settingsContext.preset.value).content, 'B content');
    assert.equal(controller.settingsContext.presetStatus.value, '');
});

test('regex refresh ignores stale character responses', async () => {
    const activeView = ref('home');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('base');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    const regexNativeCharacterId = ref('char-old');
    const pendingRequests: Record<string, {
        resolve: (value: Record<string, unknown>) => void;
        promise: Promise<Record<string, unknown>>;
    }> = {};
    const requestedCharacterIds: string[] = [];

    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => regexNativeCharacterId.value),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: (type, payload = {}) => {
            if (type !== 'xb-tavern:list-regex-scripts') {
                return Promise.resolve({});
            }
            const nativeCharacterId = String((payload.payload as Record<string, unknown> | undefined)?.nativeCharacterId || '');
            requestedCharacterIds.push(nativeCharacterId);
            let resolveRequest: (value: Record<string, unknown>) => void = () => {};
            const promise = new Promise<Record<string, unknown>>((resolve) => {
                resolveRequest = resolve;
            });
            pendingRequests[nativeCharacterId] = { resolve: resolveRequest, promise };
            return promise;
        },
        shortText: (value = '') => String(value || ''),
    });

    const oldRefresh = controller.refreshRegexFromHost();
    assert.deepEqual(requestedCharacterIds, ['char-old']);

    regexNativeCharacterId.value = 'char-new';
    const newRefresh = controller.refreshRegexFromHost();
    assert.deepEqual(requestedCharacterIds, ['char-old', 'char-new']);

    pendingRequests['char-new']?.resolve(regexListPayload('NEW SCRIPT'));
    await newRefresh;
    await flushAsyncState();

    assert.equal(controller.settingsContext.regexScriptRows.value[0]?.script.scriptName, 'NEW SCRIPT');
    assert.equal(controller.settingsContext.regexStatus.value, '');

    pendingRequests['char-old']?.resolve(regexListPayload('OLD SCRIPT'));
    await oldRefresh;
    await flushAsyncState();

    assert.equal(controller.settingsContext.regexScriptRows.value[0]?.script.scriptName, 'NEW SCRIPT');
    assert.equal(controller.settingsContext.regexStatus.value, '');
});

test('dirty regex draft saves to the character it was loaded from after target changes', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('regex');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    const regexNativeCharacterId = ref('char-a');
    const savePayloads: Record<string, unknown>[] = [];
    const listPayloads: string[] = [];

    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => regexNativeCharacterId.value),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => false,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: async (type, payload = {}) => {
            const source = payload.payload as Record<string, unknown> | undefined;
            if (type === 'xb-tavern:list-regex-scripts') {
                const nativeCharacterId = String(source?.nativeCharacterId || '');
                listPayloads.push(nativeCharacterId);
                return regexListPayload(`SCRIPT ${nativeCharacterId}`);
            }
            if (type === 'xb-tavern:save-regex-script') {
                savePayloads.push(source || {});
                return regexListPayload('SAVED SCRIPT');
            }
            return {};
        },
        shortText: (value = '') => String(value || ''),
    });

    await controller.refreshRegexFromHost();
    assert.equal(controller.settingsContext.regexScriptRows.value[0]?.script.scriptName, 'SCRIPT char-a');

    controller.settingsContext.updateRegexPatch({ replaceString: 'edited while viewing A' });
    regexNativeCharacterId.value = 'char-b';

    await controller.refreshRegexFromHost();
    assert.deepEqual(listPayloads, ['char-a']);

    await controller.settingsContext.saveCurrentRegexScript();

    assert.equal(String(savePayloads[0]?.nativeCharacterId || ''), 'char-a');
    assert.equal(String((savePayloads[0]?.script as Record<string, unknown> | undefined)?.replaceString || ''), 'edited while viewing A');
});

test('stale regex save response does not restore the previous character list', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('regex');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    const regexNativeCharacterId = ref('char-a');
    const savePayloads: Record<string, unknown>[] = [];
    const pendingSaves: Array<(value: Record<string, unknown>) => void> = [];

    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => regexNativeCharacterId.value),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: (type, payload = {}) => {
            const source = payload.payload as Record<string, unknown> | undefined;
            if (type === 'xb-tavern:list-regex-scripts') {
                return Promise.resolve(regexListPayload(`SCRIPT ${String(source?.nativeCharacterId || '')}`));
            }
            if (type === 'xb-tavern:save-regex-script') {
                savePayloads.push(source || {});
                return new Promise<Record<string, unknown>>((resolve) => {
                    pendingSaves.push(resolve);
                });
            }
            return Promise.resolve({});
        },
        shortText: (value = '') => String(value || ''),
    });

    await controller.refreshRegexFromHost();
    assert.equal(controller.settingsContext.regexScriptRows.value[0]?.script.scriptName, 'SCRIPT char-a');

    controller.settingsContext.updateRegexPatch({ replaceString: 'edited while viewing A' });
    const saveA = controller.settingsContext.saveCurrentRegexScript();
    assert.equal(String(savePayloads[0]?.nativeCharacterId || ''), 'char-a');

    regexNativeCharacterId.value = 'char-b';
    await controller.refreshRegexFromHost();
    assert.equal(controller.settingsContext.regexScriptRows.value[0]?.script.scriptName, 'SCRIPT char-b');

    pendingSaves[0]?.(regexListPayload('SAVED SCRIPT char-a'));
    await saveA;
    await flushAsyncState();

    assert.equal(controller.settingsContext.regexScriptRows.value[0]?.script.scriptName, 'SCRIPT char-b');

    controller.settingsContext.updateRegexPatch({ replaceString: 'edited while viewing B' });
    const saveB = controller.settingsContext.saveCurrentRegexScript();
    assert.equal(String(savePayloads[1]?.nativeCharacterId || ''), 'char-b');
    pendingSaves[1]?.(regexListPayload('SAVED SCRIPT char-b'));
    await saveB;
});

test('regex save keeps edits made while the save is pending', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('regex');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    let resolveSave: (value: Record<string, unknown>) => void = () => {};
    const savePayloads: Record<string, unknown>[] = [];

    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => 'char-a'),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: (type, payload = {}) => {
            const source = payload.payload as Record<string, unknown> | undefined;
            if (type === 'xb-tavern:list-regex-scripts') {
                return Promise.resolve(regexListPayload('ORIGINAL'));
            }
            if (type === 'xb-tavern:save-regex-script') {
                savePayloads.push(source || {});
                if (savePayloads.length > 1) {
                    return Promise.resolve(regexListPayload('SERVER CANONICAL'));
                }
                return new Promise<Record<string, unknown>>((resolve) => {
                    resolveSave = resolve;
                });
            }
            return Promise.resolve({});
        },
        shortText: (value = '') => String(value || ''),
    });

    await controller.refreshRegexFromHost();
    controller.settingsContext.updateRegexPatch({
        scriptName: 'REQUEST NAME',
        findRegex: 'request-find',
        replaceString: 'request-replace',
    });
    const savePromise = controller.settingsContext.saveCurrentRegexScript();
    assert.equal(controller.settingsContext.regexSaveFeedback.value.status, 'saving');

    controller.settingsContext.updateRegexPatch({
        scriptName: 'USER KEPT TYPING',
        findRegex: 'user-find',
        replaceString: 'user-replace',
    });
    resolveSave(regexListPayload('SERVER CANONICAL'));
    await savePromise;
    await flushAsyncState();

    assert.equal(controller.settingsContext.regexDraft.value.scriptName, 'USER KEPT TYPING');
    assert.equal(controller.settingsContext.regexDraft.value.findRegex, 'user-find');
    assert.equal(controller.settingsContext.regexDraft.value.replaceString, 'user-replace');
    assert.equal(controller.settingsContext.regexDraft.value.id, 'SERVER CANONICAL');
    assert.equal(controller.settingsContext.regexDirty.value, true);
    assert.equal(controller.settingsContext.regexSaveFeedback.value.status, 'success');

    await controller.settingsContext.saveCurrentRegexScript();
    assert.equal(String((savePayloads[1]?.script as Record<string, unknown> | undefined)?.id || ''), 'SERVER CANONICAL');

    controller.settingsContext.updateRegexPatch({
        id: 'SERVER CANONICAL',
        scriptName: 'SERVER CANONICAL',
        findRegex: 'SERVER CANONICAL',
        replaceString: '',
        placement: [],
    });
    assert.equal(controller.settingsContext.regexDirty.value, false);
});

test('pending regex save cannot merge its id into another selected script', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('regex');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    let resolveSave: (value: Record<string, unknown>) => void = () => {};

    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => 'char-a'),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: (type) => {
            if (type === 'xb-tavern:list-regex-scripts') {
                return Promise.resolve(regexListPayloadMany(['SCRIPT A', 'SCRIPT B']));
            }
            if (type === 'xb-tavern:save-regex-script') {
                return new Promise<Record<string, unknown>>((resolve) => {
                    resolveSave = resolve;
                });
            }
            return Promise.resolve({});
        },
        shortText: (value = '') => String(value || ''),
    });

    await controller.refreshRegexFromHost();
    controller.settingsContext.updateRegexPatch({ replaceString: 'saving A' });
    const savePromise = controller.settingsContext.saveCurrentRegexScript();
    assert.equal(controller.settingsContext.regexSaveFeedback.value.status, 'saving');

    const scriptB = controller.settingsContext.regexScriptRows.value.find((row) => row.script.scriptName === 'SCRIPT B');
    assert.ok(scriptB);
    await controller.settingsContext.selectRegexScript(scriptB);
    assert.equal(controller.settingsContext.regexDraft.value.id, 'SCRIPT B');
    assert.equal(controller.settingsContext.regexSaveFeedback.value.status, 'idle');

    resolveSave(regexListPayload('SCRIPT A SAVED'));
    await savePromise;
    await flushAsyncState();

    assert.equal(controller.settingsContext.selectedRegexKey.value, scriptB.key);
    assert.equal(controller.settingsContext.regexDraft.value.id, 'SCRIPT B');
    assert.equal(controller.settingsContext.regexDraft.value.scriptName, 'SCRIPT B');
});

test('discarding regex changes while save is pending ignores the old save response', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('regex');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    let resolveSave: (value: Record<string, unknown>) => void = () => {};

    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => 'char-a'),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: (type) => {
            if (type === 'xb-tavern:list-regex-scripts') {
                return Promise.resolve(regexListPayload('ORIGINAL'));
            }
            if (type === 'xb-tavern:save-regex-script') {
                return new Promise<Record<string, unknown>>((resolve) => {
                    resolveSave = resolve;
                });
            }
            return Promise.resolve({});
        },
        shortText: (value = '') => String(value || ''),
    });

    await controller.refreshRegexFromHost();
    controller.settingsContext.updateRegexPatch({ replaceString: 'saving draft' });
    const savePromise = controller.settingsContext.saveCurrentRegexScript();
    assert.equal(controller.settingsContext.regexSaveFeedback.value.status, 'saving');

    controller.settingsContext.discardRegexChanges();
    assert.equal(controller.settingsContext.regexSaveFeedback.value.status, 'idle');
    assert.equal(controller.settingsContext.regexDraft.value.scriptName, 'ORIGINAL');
    assert.equal(controller.settingsContext.regexDirty.value, false);

    resolveSave(regexListPayload('SERVER CANONICAL'));
    await savePromise;
    await flushAsyncState();

    assert.equal(controller.settingsContext.regexDraft.value.scriptName, 'ORIGINAL');
    assert.equal(controller.settingsContext.regexDraft.value.replaceString, '');
    assert.equal(controller.settingsContext.regexDirty.value, false);
    assert.equal(controller.settingsContext.regexSaveFeedback.value.status, 'idle');
});

test('worldbook entry save keeps edits made while the save is pending', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('worldbooks');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    let resolveSave: (value: Record<string, unknown>) => void = () => {};
    const savePayloads: Record<string, unknown>[] = [];

    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => ''),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: (type, payload = {}) => {
            const source = payload.payload as Record<string, unknown> | undefined;
            if (type === 'xb-tavern:get-worldbook-entry') {
                return Promise.resolve(worldbookEntryPayload('Original', 'Original content', 'h1', ['original']));
            }
            if (type === 'xb-tavern:save-worldbook-entry') {
                savePayloads.push(source || {});
                if (savePayloads.length > 1) {
                    return Promise.resolve(worldbookEntryPayload('SERVER CANONICAL NEXT', 'server content next', 'h3', ['server-next']));
                }
                return new Promise<Record<string, unknown>>((resolve) => {
                    resolveSave = resolve;
                });
            }
            if (type === 'xb-tavern:get-worldbook-preview') {
                return Promise.resolve({
                    result: {
                        name: 'Book',
                        entryCount: 1,
                        entries: [],
                    },
                });
            }
            return Promise.resolve({});
        },
        shortText: (value = '') => String(value || ''),
    });

    controller.settingsContext.selectedWorldbookName.value = 'Book';
    await flushAsyncState();
    await controller.settingsContext.startWorldbookEntryEdit({
        uid: '1',
        name: 'Original',
        keys: [],
        secondaryKeys: [],
        contentPreview: '',
        enabled: true,
        constant: false,
        order: 100,
    });
    controller.settingsContext.updateWorldbookEntryDraftPatch({
        comment: 'REQUEST NAME',
        content: 'request content',
        key: ['request'],
    });
    assert.equal(controller.settingsContext.worldbookEntryDirty.value, true);
    const savePromise = controller.settingsContext.saveWorldbookEntryDraft();
    assert.equal(controller.settingsContext.worldbookEntrySaveFeedback.value.status, 'saving');

    controller.settingsContext.updateWorldbookEntryDraftPatch({
        comment: 'USER KEPT TYPING',
        content: 'user content',
        key: ['user'],
    });
    resolveSave(worldbookEntryPayload('SERVER CANONICAL', 'server content', 'h2', ['server']));
    await savePromise;
    await flushAsyncState();

    assert.equal(controller.settingsContext.worldbookEntryDraft.value?.comment, 'USER KEPT TYPING');
    assert.equal(controller.settingsContext.worldbookEntryDraft.value?.content, 'user content');
    assert.deepEqual(controller.settingsContext.worldbookEntryDraft.value?.key, ['user']);
    assert.equal(controller.settingsContext.worldbookEntryDraft.value?.entryHash, 'h2');
    assert.equal(controller.settingsContext.worldbookEntryDraft.value?.revision, 'h2');
    assert.equal(controller.settingsContext.worldbookEntryDirty.value, true);
    assert.equal(controller.settingsContext.worldbookEntrySaveFeedback.value.status, 'success');

    await controller.settingsContext.saveWorldbookEntryDraft();
    assert.equal(String(savePayloads[1]?.entryHash || ''), 'h2');
    assert.equal(String((savePayloads[1]?.draft as Record<string, unknown> | undefined)?.entryHash || ''), 'h2');
    assert.equal(controller.settingsContext.worldbookEntryDraft.value?.comment, 'SERVER CANONICAL NEXT');
    assert.equal(controller.settingsContext.worldbookEntryDraft.value?.entryHash, 'h3');
    assert.equal(controller.settingsContext.worldbookEntryDirty.value, false);
});

test('worldbook entry save patches preview immediately without waiting for preview reload', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('worldbooks');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    let previewRequestCount = 0;
    let resolvePreviewReload: (value: Record<string, unknown>) => void = () => {};

    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => ''),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: (type) => {
            if (type === 'xb-tavern:get-worldbook-entry') {
                return Promise.resolve(worldbookEntryPayload('Original', 'Original content', 'h1', ['original']));
            }
            if (type === 'xb-tavern:save-worldbook-entry') {
                return Promise.resolve(worldbookEntryPayload('Saved', 'Saved content', 'h2', ['saved']));
            }
            if (type === 'xb-tavern:get-worldbook-preview') {
                previewRequestCount += 1;
                if (previewRequestCount === 1) {
                    return Promise.resolve({
                        result: {
                            name: 'Book',
                            entryCount: 1,
                            enabledCount: 1,
                            constantCount: 0,
                            disabledCount: 0,
                            keywordCount: 1,
                            totalChars: 'Original content'.length,
                            entries: [{
                                uid: '1',
                                name: 'Original',
                                keys: ['original'],
                                secondaryKeys: [],
                                contentPreview: 'Original content',
                                enabled: true,
                                constant: false,
                                vectorized: false,
                                order: 100,
                                position: 0,
                                role: 0,
                                depth: null,
                                probability: null,
                            }],
                        },
                    });
                }
                return new Promise<Record<string, unknown>>((resolve) => {
                    resolvePreviewReload = resolve;
                });
            }
            return Promise.resolve({});
        },
        shortText: (value = '') => String(value || ''),
    });

    controller.settingsContext.selectedWorldbookName.value = 'Book';
    await flushAsyncState();
    assert.equal(controller.settingsContext.worldbookPreview.value?.entries[0]?.name, 'Original');

    await controller.settingsContext.startWorldbookEntryEdit({
        uid: '1',
        name: 'Original',
        keys: ['original'],
        secondaryKeys: [],
        contentPreview: 'Original content',
        enabled: true,
        constant: false,
        order: 100,
    });
    controller.settingsContext.updateWorldbookEntryDraftPatch({
        comment: 'Saved',
        content: 'Saved content',
        key: ['saved'],
    });

    await controller.settingsContext.saveWorldbookEntryDraft();

    assert.equal(previewRequestCount, 2);
    assert.equal(controller.settingsContext.worldbookEntrySaveFeedback.value.status, 'success');
    assert.equal(controller.settingsContext.worldbookPreviewStatus.value, '正在读取预览');
    assert.equal(controller.settingsContext.worldbookPreview.value?.entries[0]?.name, 'Saved');
    assert.deepEqual(controller.settingsContext.worldbookPreview.value?.entries[0]?.keys, ['saved']);
    assert.equal(controller.settingsContext.worldbookPreview.value?.entries[0]?.contentPreview, 'Saved content');
    assert.equal(controller.settingsContext.worldbookPreview.value?.keywordCount, 1);
    assert.equal(controller.settingsContext.worldbookPreview.value?.totalChars, 'Saved content'.length);

    resolvePreviewReload({
        result: {
            name: 'Book',
            entryCount: 1,
            entries: [],
        },
    });
    await flushAsyncState();
});

test('worldbook preview reload ignores stale responses after newer saves', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('worldbooks');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    let previewRequestCount = 0;
    let saveRequestCount = 0;
    let resolveStalePreview: (value: Record<string, unknown>) => void = () => {};
    let resolveLatestPreview: (value: Record<string, unknown>) => void = () => {};

    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => ''),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: (type) => {
            if (type === 'xb-tavern:get-worldbook-entry') {
                return Promise.resolve(worldbookEntryPayload('Original', 'Original content', 'h1', ['original']));
            }
            if (type === 'xb-tavern:save-worldbook-entry') {
                saveRequestCount += 1;
                return Promise.resolve(saveRequestCount === 1
                    ? worldbookEntryPayload('Saved A', 'Saved content A', 'h2', ['saved-a'])
                    : worldbookEntryPayload('Saved B', 'Saved content B', 'h3', ['saved-b']));
            }
            if (type === 'xb-tavern:get-worldbook-preview') {
                previewRequestCount += 1;
                if (previewRequestCount === 1) {
                    return Promise.resolve(worldbookPreviewPayload('Original', 'Original content', ['original']));
                }
                if (previewRequestCount === 2) {
                    return new Promise<Record<string, unknown>>((resolve) => {
                        resolveStalePreview = resolve;
                    });
                }
                return new Promise<Record<string, unknown>>((resolve) => {
                    resolveLatestPreview = resolve;
                });
            }
            return Promise.resolve({});
        },
        shortText: (value = '') => String(value || ''),
    });

    controller.settingsContext.selectedWorldbookName.value = 'Book';
    await flushAsyncState();
    await controller.settingsContext.startWorldbookEntryEdit({
        uid: '1',
        name: 'Original',
        keys: ['original'],
        secondaryKeys: [],
        contentPreview: 'Original content',
        enabled: true,
        constant: false,
        order: 100,
    });

    controller.settingsContext.updateWorldbookEntryDraftPatch({
        comment: 'Saved A',
        content: 'Saved content A',
        key: ['saved-a'],
    });
    await controller.settingsContext.saveWorldbookEntryDraft();
    assert.equal(controller.settingsContext.worldbookPreview.value?.entries[0]?.name, 'Saved A');

    controller.settingsContext.updateWorldbookEntryDraftPatch({
        comment: 'Saved B',
        content: 'Saved content B',
        key: ['saved-b'],
    });
    await controller.settingsContext.saveWorldbookEntryDraft();
    assert.equal(controller.settingsContext.worldbookPreview.value?.entries[0]?.name, 'Saved B');

    resolveStalePreview(worldbookPreviewPayload('STALE A', 'stale content', ['stale']));
    await flushAsyncState();
    assert.equal(controller.settingsContext.worldbookPreview.value?.entries[0]?.name, 'Saved B');
    assert.deepEqual(controller.settingsContext.worldbookPreview.value?.entries[0]?.keys, ['saved-b']);

    resolveLatestPreview(worldbookPreviewPayload('Fresh B', 'fresh content', ['fresh']));
    await flushAsyncState();
    assert.equal(controller.settingsContext.worldbookPreview.value?.entries[0]?.name, 'Fresh B');
    assert.deepEqual(controller.settingsContext.worldbookPreview.value?.entries[0]?.keys, ['fresh']);
    assert.equal(controller.settingsContext.worldbookPreviewStatus.value, '');
});

test('worldbook background preview failure preserves locally patched preview', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('worldbooks');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    let previewRequestCount = 0;
    let rejectPreviewReload: (error: Error) => void = () => {};

    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => ''),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: (type) => {
            if (type === 'xb-tavern:get-worldbook-entry') {
                return Promise.resolve(worldbookEntryPayload('Original', 'Original content', 'h1', ['original']));
            }
            if (type === 'xb-tavern:save-worldbook-entry') {
                return Promise.resolve(worldbookEntryPayload('Saved', 'Saved content', 'h2', ['saved']));
            }
            if (type === 'xb-tavern:get-worldbook-preview') {
                previewRequestCount += 1;
                if (previewRequestCount === 1) {
                    return Promise.resolve(worldbookPreviewPayload('Original', 'Original content', ['original']));
                }
                return new Promise<Record<string, unknown>>((_resolve, reject) => {
                    rejectPreviewReload = reject;
                });
            }
            return Promise.resolve({});
        },
        shortText: (value = '') => String(value || ''),
    });

    controller.settingsContext.selectedWorldbookName.value = 'Book';
    await flushAsyncState();
    await controller.settingsContext.startWorldbookEntryEdit({
        uid: '1',
        name: 'Original',
        keys: ['original'],
        secondaryKeys: [],
        contentPreview: 'Original content',
        enabled: true,
        constant: false,
        order: 100,
    });
    controller.settingsContext.updateWorldbookEntryDraftPatch({
        comment: 'Saved',
        content: 'Saved content',
        key: ['saved'],
    });

    await controller.settingsContext.saveWorldbookEntryDraft();
    rejectPreviewReload(new Error('preview failed'));
    await flushAsyncState();

    assert.equal(controller.settingsContext.worldbookEntrySaveFeedback.value.status, 'success');
    assert.equal(controller.settingsContext.worldbookPreview.value?.entries[0]?.name, 'Saved');
    assert.deepEqual(controller.settingsContext.worldbookPreview.value?.entries[0]?.keys, ['saved']);
    assert.equal(controller.settingsContext.worldbookPreviewStatus.value, 'preview failed');
});

test('pending worldbook save cannot merge its hash into another edited entry', async () => {
    const activeView = ref('settings');
    const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>('worldbooks');
    const agentConfig = ref<Record<string, unknown>>({});
    const tavernDisplaySettings = ref(normalizeTavernDisplaySettings({}));
    let resolveSave: (value: Record<string, unknown>) => void = () => {};

    const controller = useTavernSettingsController({
        activeView,
        activeSettingsWorkspace,
        agentConfig,
        tavernDisplaySettings,
        effectiveContext: computed(() => ({})),
        currentNativeCharacterId: computed(() => ''),
        regexNativeCharacterId: computed(() => ''),
        homeThemeDark: ref(false),
        isRunning: ref(false),
        confirmDialog: async () => true,
        describeError: (error) => error instanceof Error ? error.message : String(error || ''),
        postToHost: () => {},
        requestHost: (type, payload = {}) => {
            const source = payload.payload as Record<string, unknown> | undefined;
            const uid = String(source?.uid || '');
            if (type === 'xb-tavern:get-worldbook-entry') {
                if (uid === '2') {
                    return Promise.resolve(worldbookEntryPayload('Entry B', 'B content', 'hB', ['b'], '2'));
                }
                return Promise.resolve(worldbookEntryPayload('Entry A', 'A content', 'hA', ['a']));
            }
            if (type === 'xb-tavern:save-worldbook-entry') {
                return new Promise<Record<string, unknown>>((resolve) => {
                    resolveSave = resolve;
                });
            }
            if (type === 'xb-tavern:get-worldbook-preview') {
                return Promise.resolve({ result: { name: 'Book', entryCount: 2, entries: [] } });
            }
            return Promise.resolve({});
        },
        shortText: (value = '') => String(value || ''),
    });

    controller.settingsContext.selectedWorldbookName.value = 'Book';
    await flushAsyncState();
    await controller.settingsContext.startWorldbookEntryEdit({
        uid: '1',
        name: 'Entry A',
        keys: [],
        secondaryKeys: [],
        contentPreview: '',
        enabled: true,
        constant: false,
        order: 100,
    });
    controller.settingsContext.updateWorldbookEntryDraftPatch({ content: 'saving A' });
    const savePromise = controller.settingsContext.saveWorldbookEntryDraft();
    assert.equal(controller.settingsContext.worldbookEntrySaveFeedback.value.status, 'saving');

    await controller.settingsContext.startWorldbookEntryEdit({
        uid: '2',
        name: 'Entry B',
        keys: [],
        secondaryKeys: [],
        contentPreview: '',
        enabled: true,
        constant: false,
        order: 200,
    });
    assert.equal(controller.settingsContext.worldbookEntryDraft.value?.uid, '2');
    assert.equal(controller.settingsContext.worldbookEntryDraft.value?.entryHash, 'hB');
    assert.equal(controller.settingsContext.worldbookEntrySaveFeedback.value.status, 'idle');

    resolveSave(worldbookEntryPayload('Entry A Saved', 'A saved content', 'hA2', ['a2']));
    await savePromise;
    await flushAsyncState();

    assert.equal(controller.settingsContext.worldbookEntryDraft.value?.uid, '2');
    assert.equal(controller.settingsContext.worldbookEntryDraft.value?.comment, 'Entry B');
    assert.equal(controller.settingsContext.worldbookEntryDraft.value?.entryHash, 'hB');
});
