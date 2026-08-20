import test from 'node:test';
import assert from 'node:assert/strict';
import { computed, ref } from 'vue';

import { useTavernDrawController } from '../app-src/features/draw/useTavernDrawController';
import type { TavernMessageRecord } from '../shared/session-db';

test('tavern draw appends already generated images after a source edit without another draw request', async () => {
    const previousWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: {
            setTimeout: () => 0,
            setInterval: () => 0,
            clearInterval() {},
        },
    });

    const original = {
        sessionId: 'session-draw',
        order: 2,
        role: 'assistant',
        content: '原始正文。',
        error: false,
    } as TavernMessageRecord;
    let current = original;
    let drawRequestCount = 0;
    let confirmCount = 0;
    let updateCount = 0;
    let resolveWritten: (() => void) | null = null;
    const written = new Promise<void>((resolve) => {
        resolveWritten = resolve;
    });
    let resolveCompleted: (() => void) | null = null;
    const completed = new Promise<void>((resolve) => {
        resolveCompleted = resolve;
    });

    try {
        const controller = useTavernDrawController({
            selectedSessionId: ref(original.sessionId),
            loadedSessionMessages: ref([original]),
            selectedSession: computed(() => ({ characterName: '阿璃' })),
            effectiveCharacterName: computed(() => '阿璃'),
            isEditingMessage: () => false,
            messageKey: (message) => `${message.sessionId}:${message.order}`,
            roleLabel: () => '角色回复',
            createHostRequestId: () => 'draw-request-1',
            async requestHost(type) {
                if (type === 'xb-tavern:draw-status') {
                    return { provider: 'novelai', enabled: true, ready: true };
                }
                if (type === 'xb-tavern:draw-quick-settings') {return {};}
                if (type === 'xb-tavern:draw-generate') {
                    drawRequestCount += 1;
                    current = { ...current, content: '正文已修改。' };
                    return {
                        result: {
                            success: 1,
                            total: 1,
                            images: [{
                                slotId: 'slot-existing-image',
                                placement: {
                                    mode: 'source',
                                    insertAfter: 1,
                                    offset: original.content.length,
                                    sourceHash: 'original-source-hash',
                                },
                            }],
                        },
                    };
                }
                throw new Error(`unexpected request: ${type}`);
            },
            async getTavernMessage() {
                return current;
            },
            async updateTavernMessageContentIfMatches(_sessionId, _order, expectedContent, nextContent) {
                updateCount += 1;
                assert.equal(expectedContent, '正文已修改。');
                assert.equal(nextContent, '正文已修改。\n[tavern-image:slot-existing-image]');
                current = { ...current, content: nextContent };
                resolveWritten?.();
                return { status: 'updated', message: current };
            },
            async confirmPlacementFallback() {
                confirmCount += 1;
                return true;
            },
            async loadSelectedSessionMessageWindow() {},
            flashMessageAction(_message, _action, ok) {
                if (ok) {resolveCompleted?.();}
            },
            showToast() {},
            describeError: (error) => String(error instanceof Error ? error.message : error),
            markdownSignature: (text = '') => text,
            stripTavernImageMarkers: (text = '') => text,
            enhanceChatMarkdown() {},
            async nextTick(callback) {
                callback?.();
            },
        });

        await controller.drawMessage(original);
        await written;
        await completed;

        assert.equal(drawRequestCount, 1);
        assert.equal(confirmCount, 1);
        assert.equal(updateCount, 1);
        assert.equal(current.content, '正文已修改。\n[tavern-image:slot-existing-image]');
    } finally {
        if (previousWindow === undefined) {
            Reflect.deleteProperty(globalThis, 'window');
        } else {
            Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
        }
    }
});

test('tavern draw writes unchanged source placements with one conditional update', async () => {
    const sceneSourceModule = await import('../../draw/shared/scene-source.js') as unknown as {
        hashSceneSource: (sourceText: string) => string;
    };
    const previousWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: {
            setTimeout: () => 0,
            setInterval: () => 0,
            clearInterval() {},
        },
    });

    const original = {
        sessionId: 'session-source-placement',
        order: 3,
        role: 'assistant',
        content: '第一句。第二句。',
        error: false,
    } as TavernMessageRecord;
    let current = original;
    let confirmCount = 0;
    let updateCount = 0;
    let resolveCompleted: (() => void) | null = null;
    const completed = new Promise<void>((resolve) => {
        resolveCompleted = resolve;
    });

    try {
        const controller = useTavernDrawController({
            selectedSessionId: ref(original.sessionId),
            loadedSessionMessages: ref([original]),
            selectedSession: computed(() => ({ characterName: '阿璃' })),
            effectiveCharacterName: computed(() => '阿璃'),
            isEditingMessage: () => false,
            messageKey: (message) => `${message.sessionId}:${message.order}`,
            roleLabel: () => '角色回复',
            createHostRequestId: () => 'draw-request-source-placement',
            async requestHost(type) {
                if (type === 'xb-tavern:draw-status') {
                    return { provider: 'novelai', enabled: true, ready: true };
                }
                if (type === 'xb-tavern:draw-quick-settings') {return {};}
                if (type === 'xb-tavern:draw-generate') {
                    return {
                        result: {
                            success: 1,
                            total: 1,
                            images: [{
                                slotId: 'slot-source',
                                placement: {
                                    mode: 'source',
                                    insertAfter: 1,
                                    offset: '第一句。'.length,
                                    sourceHash: sceneSourceModule.hashSceneSource(original.content),
                                },
                            }],
                        },
                    };
                }
                throw new Error(`unexpected request: ${type}`);
            },
            async getTavernMessage() {
                return current;
            },
            async updateTavernMessageContentIfMatches(_sessionId, _order, expectedContent, nextContent) {
                updateCount += 1;
                assert.equal(expectedContent, original.content);
                assert.equal(nextContent, '第一句。\n[tavern-image:slot-source]\n第二句。');
                current = { ...current, content: nextContent };
                return { status: 'updated', message: current };
            },
            async confirmPlacementFallback() {
                confirmCount += 1;
                return true;
            },
            async loadSelectedSessionMessageWindow() {},
            flashMessageAction(_message, _action, ok) {
                if (ok) {resolveCompleted?.();}
            },
            showToast() {},
            describeError: (error) => String(error instanceof Error ? error.message : error),
            markdownSignature: (text = '') => text,
            stripTavernImageMarkers: (text = '') => text,
            enhanceChatMarkdown() {},
            async nextTick(callback) {
                callback?.();
            },
        });

        await controller.drawMessage(original);
        await completed;

        assert.equal(confirmCount, 0);
        assert.equal(updateCount, 1);
        assert.equal(current.content, '第一句。\n[tavern-image:slot-source]\n第二句。');
    } finally {
        if (previousWindow === undefined) {
            Reflect.deleteProperty(globalThis, 'window');
        } else {
            Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
        }
    }
});

test('tavern draw releases the generation queue while placement confirmation is pending', async () => {
    const previousWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: {
            setTimeout: () => 0,
            setInterval: () => 0,
            clearInterval() {},
        },
    });

    const first = {
        sessionId: 'session-queue', order: 1, role: 'assistant', content: '第一条。', error: false,
    } as TavernMessageRecord;
    const second = {
        sessionId: 'session-queue', order: 2, role: 'assistant', content: '第二条。', error: false,
    } as TavernMessageRecord;
    const messages = new Map<number, TavernMessageRecord>([[1, first], [2, second]]);
    let requestSerial = 0;
    let resolveConfirmation: ((accepted: boolean) => void) | null = null;
    const confirmation = new Promise<boolean>((resolve) => {
        resolveConfirmation = resolve;
    });
    let resolveSecondStarted: (() => void) | null = null;
    const secondStarted = new Promise<void>((resolve) => {
        resolveSecondStarted = resolve;
    });
    let resolveFirstFinished: (() => void) | null = null;
    const firstFinished = new Promise<void>((resolve) => {
        resolveFirstFinished = resolve;
    });

    try {
        const controller = useTavernDrawController({
            selectedSessionId: ref(first.sessionId),
            loadedSessionMessages: ref([first, second]),
            selectedSession: computed(() => ({ characterName: '阿璃' })),
            effectiveCharacterName: computed(() => '阿璃'),
            isEditingMessage: () => false,
            messageKey: (message) => `${message.sessionId}:${message.order}`,
            roleLabel: () => '角色回复',
            createHostRequestId: () => `draw-request-${requestSerial += 1}`,
            async requestHost(type, payload) {
                if (type === 'xb-tavern:draw-status') {
                    return { provider: 'novelai', enabled: true, ready: true };
                }
                if (type === 'xb-tavern:draw-quick-settings') {return {};}
                if (type === 'xb-tavern:draw-generate') {
                    const order = Number((payload?.payload as Record<string, unknown>)?.messageOrder);
                    if (order === 1) {
                        messages.set(1, { ...first, content: '第一条已修改。' });
                        return {
                            result: {
                                success: 1,
                                total: 1,
                                images: [{ slotId: 'slot-first', success: true }],
                            },
                        };
                    }
                    resolveSecondStarted?.();
                    return { result: { success: 0, total: 0, images: [] } };
                }
                throw new Error(`unexpected request: ${type}`);
            },
            async getTavernMessage(_sessionId, order) {
                return messages.get(Number(order));
            },
            async updateTavernMessageContentIfMatches() {
                throw new Error('unexpected update');
            },
            async confirmPlacementFallback() {
                return await confirmation;
            },
            async loadSelectedSessionMessageWindow() {},
            flashMessageAction(message) {
                if (message.order === first.order) {resolveFirstFinished?.();}
            },
            showToast() {},
            describeError: (error) => String(error instanceof Error ? error.message : error),
            markdownSignature: (text = '') => text,
            stripTavernImageMarkers: (text = '') => text,
            enhanceChatMarkdown() {},
            async nextTick(callback) {callback?.();},
        });

        await controller.drawMessage(first);
        await controller.drawMessage(second);
        await secondStarted;
        assert.equal(controller.drawMessageStatusText(first), '图片已生成，等待确认插入位置');
        resolveConfirmation?.(false);
        await firstFinished;
    } finally {
        if (previousWindow === undefined) {
            Reflect.deleteProperty(globalThis, 'window');
        } else {
            Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
        }
    }
});

test('tavern draw reports an existing marker accurately after a conditional-write conflict', async () => {
    const { hashSceneSource } = await import('../../draw/shared/scene-source.js') as unknown as {
        hashSceneSource: (sourceText: string) => string;
    };
    const previousWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: {
            setTimeout: () => 0,
            setInterval: () => 0,
            clearInterval() {},
        },
    });

    const original = {
        sessionId: 'session-conflict', order: 4, role: 'assistant', content: '正文。', error: false,
    } as TavernMessageRecord;
    let current = original;
    let updateCount = 0;
    let progressAtCompletion = '';
    let resolveCompleted: (() => void) | null = null;
    const completed = new Promise<void>((resolve) => {
        resolveCompleted = resolve;
    });

    try {
        let controller: ReturnType<typeof useTavernDrawController>;
        controller = useTavernDrawController({
            selectedSessionId: ref(original.sessionId),
            loadedSessionMessages: ref([original]),
            selectedSession: computed(() => ({ characterName: '阿璃' })),
            effectiveCharacterName: computed(() => '阿璃'),
            isEditingMessage: () => false,
            messageKey: (message) => `${message.sessionId}:${message.order}`,
            roleLabel: () => '角色回复',
            createHostRequestId: () => 'draw-request-conflict',
            async requestHost(type) {
                if (type === 'xb-tavern:draw-status') {
                    return { provider: 'novelai', enabled: true, ready: true };
                }
                if (type === 'xb-tavern:draw-quick-settings') {return {};}
                if (type === 'xb-tavern:draw-generate') {
                    return {
                        result: {
                            success: 1,
                            total: 1,
                            images: [{
                                slotId: 'slot-already-present',
                                success: true,
                                placement: {
                                    mode: 'source',
                                    insertAfter: 1,
                                    offset: original.content.length,
                                    sourceHash: hashSceneSource(original.content),
                                },
                            }],
                        },
                    };
                }
                throw new Error(`unexpected request: ${type}`);
            },
            async getTavernMessage() {return current;},
            async updateTavernMessageContentIfMatches() {
                updateCount += 1;
                current = { ...current, content: '正文。\n[tavern-image:slot-already-present]' };
                return { status: 'conflict', message: current };
            },
            async confirmPlacementFallback() {return true;},
            async loadSelectedSessionMessageWindow() {},
            flashMessageAction(_message, _action, ok) {
                if (!ok) {return;}
                progressAtCompletion = controller.drawMessageStatusText(original);
                resolveCompleted?.();
            },
            showToast() {},
            describeError: (error) => String(error instanceof Error ? error.message : error),
            markdownSignature: (text = '') => text,
            stripTavernImageMarkers: (text = '') => text,
            enhanceChatMarkdown() {},
            async nextTick(callback) {callback?.();},
        });

        await controller.drawMessage(original);
        await completed;
        assert.equal(updateCount, 1);
        assert.equal(progressAtCompletion, '本次图片已经在正文中');
    } finally {
        if (previousWindow === undefined) {
            Reflect.deleteProperty(globalThis, 'window');
        } else {
            Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
        }
    }
});
