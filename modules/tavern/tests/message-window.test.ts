import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { nextTick, ref } from 'vue';

import {
    AGENT_MESSAGE_WINDOW_DEFAULT,
    expandMessageWindow,
    getMessageWindow,
    normalizeHiddenOutsideCount,
    normalizeMessageLoadBatchSize,
    resetMessageWindow,
    TAVERN_CHAT_MESSAGE_WINDOW_MAX,
} from '../app-src/message-window';
import { useTavernScrollPane } from '../app-src/components/chat/useTavernScrollPane';
import { createTavernSessionState, useTavernSessionController } from '../app-src/features/session/useTavernSessionController';
import db, {
    appendTavernMessage,
    createTavernSession,
    type TavernMessageRecord,
} from '../shared/session-db';

const root = resolve(import.meta.dirname, '../../..');

test('tavern message window matches ebook defaults and expands older messages in chunks', () => {
    const state = { uiMessageWindowLimit: 100 };

    resetMessageWindow(state);
    assert.equal(state.uiMessageWindowLimit, AGENT_MESSAGE_WINDOW_DEFAULT);

    const initial = getMessageWindow(state, 12);
    assert.equal(initial.hiddenBefore, 7);
    assert.equal(initial.visibleCount, 5);

    const expanded = expandMessageWindow(state, 12);
    assert.equal(expanded, true);

    const afterExpand = getMessageWindow(state, 12);
    assert.equal(afterExpand.hiddenBefore, 0);
    assert.equal(afterExpand.visibleCount, 12);
});

test('tavern message window normalizes custom hidden counts and load batch sizes', () => {
    assert.equal(normalizeHiddenOutsideCount(0), 1);
    assert.equal(normalizeHiddenOutsideCount(27), 20);
    assert.equal(normalizeMessageLoadBatchSize(1), 1);
    assert.equal(normalizeMessageLoadBatchSize(18), 18);

    const state = { uiMessageWindowLimit: 1 };
    const windowState = getMessageWindow(state, 12, { defaultLimit: 8 });
    assert.equal(windowState.visibleCount, 8);

    const expanded = expandMessageWindow(state, 40, { defaultLimit: 8, chunk: 15 });
    assert.equal(expanded, true);

    const afterExpand = getMessageWindow(state, 40, { defaultLimit: 8 });
    assert.equal(afterExpand.visibleCount, 23);
});

test('tavern user submit takes scroll ownership and reaches bottom once from detached history', async () => {
    const pane = useTavernScrollPane({ totalItems: () => 12 });
    const node = {
        scrollTop: 180,
        scrollHeight: 960,
        clientHeight: 320,
    } as HTMLElement;
    pane.scrollRef.value = node;
    pane.autoScroll.value = false;

    pane.requestUserMessageBottom();
    assert.equal(pane.autoScroll.value, true);
    await nextTick();

    assert.equal(node.scrollTop, 960);
});

test('tavern user turn compacts the loaded tail before reserving USER and AI slots', () => {
    const state = createTavernSessionState();
    state.selectedSessionId.value = 'session-1';
    state.selectedSessionMessageTotal.value = 7;
    state.loadedSessionMessages.value = Array.from({ length: 7 }, (_, order) => ({
        sessionId: 'session-1',
        order,
        role: order % 2 ? 'user' : 'assistant',
        content: `message-${order}`,
        createdAt: order + 1,
    })) as TavernMessageRecord[];
    state.loadedSessionMessageStartOrder.value = 0;
    state.loadedSessionMessageEndOrder.value = 6;
    state.selectedSessionLatestAssistantOrder.value = 6;

    const controller = useTavernSessionController(state, {
        activeView: ref<'home' | 'chat' | 'settings' | 'about'>('chat'),
        chatFocus: ref<'chat' | 'manager'>('chat'),
        chatMessageWindowLimit: ref(5),
        hiddenOutsideCount: ref(5),
        isRunning: ref(false),
        selectedCharacterPreviewKey: ref(''),
        selectedSessionCharacterError: ref(''),
        abortActiveRun() {},
        applySessionSnapshotContext() {},
        async cancelAndRollbackManagersForSession() {},
        cancelDrawJobsForSession() {},
        async confirmDeleteSession() {return true;},
        describeSessionTitle() {return '';},
        invalidateMemoryFileRecordLoad() {},
        openCharacterSettingsWorkspace() {},
        async refreshManagerRecords() {},
        reportStartupProgress() {},
        resetChatMessageWindowState() {},
        resetSessionPreviewState() {},
        placeChatAtBottomForNewContext() {},
        syncCharacterWorldbookState() {},
        async syncSessionCharacterContextSafely() {},
    });

    assert.equal(controller.compactLoadedSessionMessageWindow(2), 4);
    assert.deepEqual(state.loadedSessionMessages.value.map((message) => message.order), [4, 5, 6]);
    assert.equal(state.selectedSessionMessageTotal.value, 7);
    assert.equal(state.loadedSessionMessageStartOrder.value, 4);
    assert.equal(state.loadedSessionMessageEndOrder.value, 6);
    assert.equal(state.selectedSessionLatestAssistantOrder.value, 6);
    assert.deepEqual(controller.chatMessageWindow.value, {
        startIndex: 4,
        hiddenBefore: 4,
        hiddenAfter: 0,
        visibleCount: 3,
        limit: 5,
        total: 7,
    });

    state.selectedSessionMessageTotal.value = 10;
    state.selectedSessionMessageWindowOffsetFromEnd.value = 3;
    controller.upsertLoadedSessionMessage({
        sessionId: 'session-1',
        order: 10,
        role: 'assistant',
        content: 'new detached tail',
        createdAt: 20,
    });
    assert.deepEqual(state.loadedSessionMessages.value.map((message) => message.order), [4, 5, 6]);
    assert.equal(state.selectedSessionMessageTotal.value, 11);
    assert.equal(state.selectedSessionMessageWindowOffsetFromEnd.value, 4);
    assert.equal(state.loadedSessionMessageStartOrder.value, 4);
    assert.equal(state.loadedSessionMessageEndOrder.value, 6);
    assert.equal(state.selectedSessionLatestAssistantOrder.value, 10);
});

test('tavern historical reroll rebases detached window totals to the retained timeline', () => {
    const state = createTavernSessionState();
    state.selectedSessionId.value = 'session-1';
    state.selectedSessionMessageTotal.value = 100;
    state.selectedSessionMessageWindowOffsetFromEnd.value = 60;
    state.loadedSessionMessages.value = Array.from({ length: 20 }, (_, index) => ({
        sessionId: 'session-1',
        order: index + 20,
        role: (index + 20) % 2 ? 'assistant' : 'user',
        content: `message-${index + 20}`,
        createdAt: index + 21,
    })) as TavernMessageRecord[];
    const controller = useTavernSessionController(state, {
        activeView: ref<'home' | 'chat' | 'settings' | 'about'>('chat'),
        chatFocus: ref<'chat' | 'manager'>('chat'),
        chatMessageWindowLimit: ref(20),
        hiddenOutsideCount: ref(20),
        isRunning: ref(false),
        selectedCharacterPreviewKey: ref(''),
        selectedSessionCharacterError: ref(''),
        abortActiveRun() {},
        applySessionSnapshotContext() {},
        async cancelAndRollbackManagersForSession() {},
        cancelDrawJobsForSession() {},
        async confirmDeleteSession() {return true;},
        describeSessionTitle() {return '';},
        invalidateMemoryFileRecordLoad() {},
        openCharacterSettingsWorkspace() {},
        async refreshManagerRecords() {},
        reportStartupProgress() {},
        resetChatMessageWindowState() {},
        resetSessionPreviewState() {},
        placeChatAtBottomForNewContext() {},
        syncCharacterWorldbookState() {},
        async syncSessionCharacterContextSafely() {},
    });

    assert.equal(controller.pruneLoadedSessionMessagesFromOrder('session-1', 26), 14);
    assert.deepEqual(state.loadedSessionMessages.value.map((message) => message.order), [20, 21, 22, 23, 24, 25]);
    assert.equal(state.selectedSessionMessageTotal.value, 26);
    assert.equal(state.selectedSessionMessageWindowOffsetFromEnd.value, 0);
});

test('tavern message loading clamps an offset invalidated by external tail deletion', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Window clamp' });
    for (let order = 0; order < 5; order += 1) {
        await appendTavernMessage(session.id, {
            role: order % 2 ? 'assistant' : 'user',
            content: `message-${order}`,
        });
    }
    const state = createTavernSessionState();
    state.selectedSessionId.value = session.id;
    state.selectedSessionMessageWindowOffsetFromEnd.value = 99;
    const controller = useTavernSessionController(state, {
        activeView: ref<'home' | 'chat' | 'settings' | 'about'>('chat'),
        chatFocus: ref<'chat' | 'manager'>('chat'),
        chatMessageWindowLimit: ref(3),
        hiddenOutsideCount: ref(3),
        isRunning: ref(false),
        selectedCharacterPreviewKey: ref(''),
        selectedSessionCharacterError: ref(''),
        abortActiveRun() {},
        applySessionSnapshotContext() {},
        async cancelAndRollbackManagersForSession() {},
        cancelDrawJobsForSession() {},
        async confirmDeleteSession() {return true;},
        describeSessionTitle() {return '';},
        invalidateMemoryFileRecordLoad() {},
        openCharacterSettingsWorkspace() {},
        async refreshManagerRecords() {},
        reportStartupProgress() {},
        resetChatMessageWindowState() {},
        resetSessionPreviewState() {},
        placeChatAtBottomForNewContext() {},
        syncCharacterWorldbookState() {},
        async syncSessionCharacterContextSafely() {},
    });

    await controller.loadSelectedSessionMessageWindow({ sessionId: session.id });

    assert.equal(state.selectedSessionMessageTotal.value, 5);
    assert.equal(state.selectedSessionMessageWindowOffsetFromEnd.value, 2);
    assert.deepEqual(state.loadedSessionMessages.value.map((message) => message.order), [0, 1, 2]);
});

test('tavern scroll handlers collapse expanded message windows when returning to bottom', () => {
    const appSource = readFileSync(resolve(root, 'modules/tavern/app-src/App.vue'), 'utf8');
    const scrollPaneSource = readFileSync(resolve(root, 'modules/tavern/app-src/components/chat/useTavernScrollPane.ts'), 'utf8');
    assert.match(appSource, /const chatScrollPane = useTavernScrollPane/);
    assert.match(appSource, /const managerScrollPane = useTavernScrollPane/);
    assert.doesNotMatch(appSource, /function handleChatScroll\(\)/);
    assert.doesNotMatch(appSource, /function handleManagerScroll\(\)/);
    assert.match(scrollPaneSource, /function handleScroll\(\)[\s\S]*collapseMessageWindowIfBottom\(\);/);
    assert.match(scrollPaneSource, /let topRevealAutoBlocked = false;/);
    assert.match(scrollPaneSource, /if \(!force && topRevealAutoBlocked\) \{return false;\}/);
    assert.match(scrollPaneSource, /preserveNextPrepend\(\);[\s\S]*messageWindowLimit\.value = Number\(state\.uiMessageWindowLimit \|\| messageWindowLimit\.value\);[\s\S]*autoScroll\.value = false;[\s\S]*topRevealAutoBlocked = true;/);
    assert.match(scrollPaneSource, /if \(currentScrollTop > 96\) \{[\s\S]*topRevealAutoBlocked = false;/);
    assert.match(scrollPaneSource, /const bottomLockThresholdPx = 48;/);
    assert.match(scrollPaneSource, /return node\.scrollHeight - node\.clientHeight - node\.scrollTop <= threshold;/);
    assert.doesNotMatch(scrollPaneSource, /scrollingTowardBottom|currentScrollTop > previousScrollTop/);
    assert.match(scrollPaneSource, /if \(programmaticScroll\) \{[\s\S]*updateScrollButtons\(\);[\s\S]*return;/);
    assert.match(scrollPaneSource, /const atBottom = isNearBottom\(\);[\s\S]*if \(atBottom\) \{[\s\S]*autoScroll\.value = true;[\s\S]*\} else \{[\s\S]*autoScroll\.value = false;/);
    assert.match(scrollPaneSource, /function stickToBottom\(\)[\s\S]*node\.scrollTop = node\.scrollHeight;/);
    assert.doesNotMatch(scrollPaneSource, /else if \(currentScrollTop < previousScrollTop\) \{[\s\S]*autoScroll\.value = false;/);
    assert.match(scrollPaneSource, /function findWheelScrollTarget\(event: WheelEvent, root: HTMLElement, deltaY: number\)/);
    assert.doesNotMatch(scrollPaneSource, /deltaY < 0[\s\S]{0,120}autoScroll\.value = false/);
    assert.match(scrollPaneSource, /requestAnimationFrame\(\(\) => \{[\s\S]*applyWheelFallback\(target, deltaY\);[\s\S]*if \(target === root\) \{[\s\S]*handleScroll\(\);/);
    assert.doesNotMatch(scrollPaneSource, /onReturnToBottom|notifyReturnToBottom/);
    assert.match(scrollPaneSource, /function placeAtBottomForNewContext\(\) \{[\s\S]*scrollToBottom\(true\);[\s\S]*\}/);
    assert.match(scrollPaneSource, /function requestUserMessageBottom\(\)[\s\S]*scrollToBottom\(true\);/);
    assert.doesNotMatch(scrollPaneSource, /function followStreamToBottomIfAtBottom/);
    assert.match(scrollPaneSource, /function jumpToBottom\(scrollOptions: TavernScrollToBottomOptions = \{\}\) \{[\s\S]*scrollToBottom\(true, scrollOptions\);[\s\S]*\}/);
    assert.match(scrollPaneSource, /function scrollToBottom\([\s\S]*if \(scrollOptions\.collapseWindow\) \{[\s\S]*collapseMessageWindowIfBottom\(true\);/);
    assert.match(scrollPaneSource, /function stickToBottom\(\) \{[\s\S]*runSilently\(\(\) => \{[\s\S]*node\.scrollTop = node\.scrollHeight;[\s\S]*\}\);/);
    assert.doesNotMatch(scrollPaneSource, /scrollOptions\.collapseWindow \|\| autoScroll\.value/);
});

test('tavern chat window stays bounded and slides in both directions', () => {
    const offsetFromEnd = ref(0);
    const pane = useTavernScrollPane({
        totalItems: () => 200,
        loadBatchSize: 20,
        maxWindowLimit: TAVERN_CHAT_MESSAGE_WINDOW_MAX,
        windowOffsetFromEnd: offsetFromEnd,
    });
    pane.scrollRef.value = {
        scrollTop: 0,
        scrollHeight: 1000,
        clientHeight: 300,
    } as HTMLElement;

    pane.revealOlderMessages(true);
    pane.autoScroll.value = true;
    pane.revealOlderMessages(true);
    pane.autoScroll.value = true;
    pane.revealOlderMessages(true);
    assert.equal(pane.messageWindowLimit.value, TAVERN_CHAT_MESSAGE_WINDOW_MAX);
    assert.equal(offsetFromEnd.value, 0);

    pane.autoScroll.value = true;
    pane.revealOlderMessages(true);
    assert.equal(pane.messageWindowLimit.value, TAVERN_CHAT_MESSAGE_WINDOW_MAX);
    assert.equal(offsetFromEnd.value, 20);

    pane.autoScroll.value = true;
    pane.revealNewerMessages(true);
    assert.equal(offsetFromEnd.value, 0);
});

test('tavern message editing pins the current window until save or cancel', async () => {
    const defaultLimit = ref(5);
    const offsetFromEnd = ref(20);
    const pinned = ref(true);
    const pane = useTavernScrollPane({
        totalItems: () => 200,
        defaultLimit,
        windowOffsetFromEnd: offsetFromEnd,
        isWindowPinned: () => pinned.value,
    });
    pane.messageWindowLimit.value = 60;

    assert.equal(pane.resetWindowState(), false);
    assert.equal(pane.revealOlderMessages(true), false);
    assert.equal(pane.revealNewerMessages(true), false);
    defaultLimit.value = 8;
    await nextTick();
    assert.equal(pane.messageWindowLimit.value, 60);
    assert.equal(offsetFromEnd.value, 20);

    pinned.value = false;
    assert.equal(pane.resetWindowState(), true);
    assert.equal(pane.messageWindowLimit.value, 8);
    assert.equal(offsetFromEnd.value, 0);
});

test('tavern reveal older messages uses isolated delta compensation instead of anchor watchers', () => {
    const appSource = readFileSync(resolve(root, 'modules/tavern/app-src/App.vue'), 'utf8');
    const scrollPaneSource = readFileSync(resolve(root, 'modules/tavern/app-src/components/chat/useTavernScrollPane.ts'), 'utf8');
    assert.match(scrollPaneSource, /const contentRef = ref<HTMLElement \| null>\(null\);/);
    assert.match(scrollPaneSource, /let contentResizeObserver: ResizeObserver \| null = null;/);
    assert.match(scrollPaneSource, /contentResizeObserver = new ResizeObserver\(\(\) => \{[\s\S]*handleContentChanged\(\);[\s\S]*\}\);/);
    assert.match(scrollPaneSource, /function preserveNextPrepend\(\) \{[\s\S]*scrollHeight: Number\(node\.scrollHeight \|\| 0\),[\s\S]*scrollTop: Number\(node\.scrollTop \|\| 0\),/);
    assert.match(scrollPaneSource, /function applyPrependCompensation\(\) \{[\s\S]*const delta = Number\(node\.scrollHeight \|\| 0\) - snapshot\.scrollHeight;[\s\S]*node\.scrollTop = Math\.max\(0, snapshot\.scrollTop \+ delta\);/);
    assert.match(scrollPaneSource, /function handleContentChanged\(\) \{[\s\S]*if \(applyPrependCompensation\(\)\) \{return;\}[\s\S]*if \(autoScroll\.value\) \{[\s\S]*stickToBottom\(\);[\s\S]*return;[\s\S]*\}[\s\S]*updateScrollButtons\(\);/);
    assert.match(scrollPaneSource, /return \{[\s\S]*contentRef: contentRef as Ref<HTMLElement \| null>,/);
    assert.doesNotMatch(scrollPaneSource, /revealAnchorConfig|captureElementScrollState|restoreElementScrollState|scheduleRevealScrollRestore/);
    assert.doesNotMatch(appSource, /revealAnchorConfig:/);
});
