import assert from "node:assert/strict";
import test from "node:test";

import {
    getChatStorySummaryEnabled,
    resolveStorySummaryEnabled,
    setChatStorySummaryEnabled,
    STORY_SUMMARY_CHAT_ENABLED_KEY,
} from "../data/chat-toggle.js";

const EXT_ID = "LittleWhiteBox";

test("new chats inherit the enabled default without mutating metadata", () => {
    const metadata = {};

    assert.equal(getChatStorySummaryEnabled(metadata, EXT_ID), true);
    assert.deepEqual(metadata, {});
});

test("chat-level disabled state is persisted under extension metadata", () => {
    const metadata = {};

    assert.equal(setChatStorySummaryEnabled(metadata, EXT_ID, false), false);
    assert.equal(
        metadata.extensions[EXT_ID][STORY_SUMMARY_CHAT_ENABLED_KEY],
        false,
    );
    assert.equal(getChatStorySummaryEnabled(metadata, EXT_ID), false);
});

test("global switch remains the master switch", () => {
    assert.equal(resolveStorySummaryEnabled(false, true), false);
    assert.equal(resolveStorySummaryEnabled(true, false), false);
    assert.equal(resolveStorySummaryEnabled(true, true), true);
});
