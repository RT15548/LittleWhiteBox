import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
    AGENT_MESSAGE_WINDOW_DEFAULT,
    expandMessageWindow,
    getMessageWindow,
    normalizeHiddenOutsideCount,
    normalizeMessageLoadBatchSize,
    resetMessageWindow,
} from '../app-src/message-window';

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
    assert.match(scrollPaneSource, /topRevealAutoBlocked = true;[\s\S]*scheduleRevealScrollRestore\(snapshot\);/);
    assert.match(scrollPaneSource, /if \(currentScrollTop > 96\) \{[\s\S]*topRevealAutoBlocked = false;/);
    assert.match(scrollPaneSource, /const bottomLockThresholdPx = 5;/);
    assert.match(scrollPaneSource, /return Math\.abs\(node\.scrollHeight - node\.clientHeight - node\.scrollTop\) < threshold;/);
    assert.doesNotMatch(scrollPaneSource, /scrollingTowardBottom|currentScrollTop > previousScrollTop/);
    assert.match(scrollPaneSource, /const atBottom = isNearBottom\(\);[\s\S]*if \(atBottom\) \{[\s\S]*autoScroll\.value = true;[\s\S]*\} else \{[\s\S]*autoScroll\.value = false;/);
    assert.match(scrollPaneSource, /node\.scrollTop = node\.scrollHeight;\s*lastScrollTop = Number\(node\.scrollTop \|\| 0\);/);
    assert.doesNotMatch(scrollPaneSource, /else if \(currentScrollTop < previousScrollTop\) \{[\s\S]*autoScroll\.value = false;/);
    assert.match(scrollPaneSource, /function findWheelScrollTarget\(event: WheelEvent, root: HTMLElement, deltaY: number\)/);
    assert.doesNotMatch(scrollPaneSource, /deltaY < 0[\s\S]{0,120}autoScroll\.value = false/);
    assert.match(scrollPaneSource, /requestAnimationFrame\(\(\) => \{[\s\S]*applyWheelFallback\(target, deltaY\);[\s\S]*if \(target === root\) \{[\s\S]*handleScroll\(\);/);
    assert.doesNotMatch(scrollPaneSource, /onReturnToBottom|notifyReturnToBottom/);
    assert.match(scrollPaneSource, /function placeAtBottomForNewContext\(\) \{[\s\S]*scrollToBottom\(true\);[\s\S]*\}/);
    assert.match(scrollPaneSource, /function followStreamToBottomIfAtBottom\(\) \{[\s\S]*if \(!isNearBottom\(\)\) \{[\s\S]*autoScroll\.value = false;[\s\S]*return;[\s\S]*\}[\s\S]*scrollToBottom\(\);[\s\S]*\}/);
    assert.match(scrollPaneSource, /function jumpToBottom\(scrollOptions: TavernScrollToBottomOptions = \{\}\) \{[\s\S]*scrollToBottom\(true, scrollOptions\);[\s\S]*\}/);
    assert.match(scrollPaneSource, /function scrollToBottom\([\s\S]*if \(scrollOptions\.collapseWindow\) \{[\s\S]*collapseMessageWindowIfBottom\(true\);/);
    assert.match(scrollPaneSource, /const apply = \(\) => \{[\s\S]*if \(!force && autoScroll\.value === false\) \{return false;\}[\s\S]*node\.scrollTop = node\.scrollHeight;[\s\S]*return true;/);
    assert.doesNotMatch(scrollPaneSource, /scrollOptions\.collapseWindow \|\| autoScroll\.value/);
    assert.match(scrollPaneSource, /watch\(\(\) => normalizeHiddenOutsideCount[\s\S]*if \(autoScroll\.value === false\) \{return;\}[\s\S]*resetWindowState\(\);/);
});

test('tavern reveal older messages preserves the first visible message anchor', () => {
    const appSource = readFileSync(resolve(root, 'modules/tavern/app-src/App.vue'), 'utf8');
    const scrollPaneSource = readFileSync(resolve(root, 'modules/tavern/app-src/components/chat/useTavernScrollPane.ts'), 'utf8');
    assert.match(scrollPaneSource, /revealAnchorConfig\?: AnchorConfig/);
    assert.match(scrollPaneSource, /const snapshot = options\.revealAnchorConfig[\s\S]*captureElementScrollState\(node, options\.revealAnchorConfig\)/);
    assert.match(scrollPaneSource, /messageWindowLimit\.value = Number\(state\.uiMessageWindowLimit \|\| messageWindowLimit\.value\);[\s\S]*autoScroll\.value = false;[\s\S]*scheduleRevealScrollRestore\(snapshot\);/);
    assert.match(scrollPaneSource, /restoreElementScrollState\(node, snapshot, options\.revealAnchorConfig, \{[\s\S]*preserveScrollTop: true/);
    assert.match(appSource, /revealAnchorConfig: \{\s*itemSelector: '\.chat-bubble\[data-chat-anchor-key\]'/);
    assert.match(appSource, /revealAnchorConfig: \{\s*itemSelector: '\.manager-card\[data-manager-anchor-key\]'/);
    assert.doesNotMatch(appSource, /revealAnchorConfig: \{[\s\S]{0,120}chat-history-gate/);
});
