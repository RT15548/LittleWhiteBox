import assert from 'node:assert/strict';

// Read the model-facing JSON data, independent of instruction wording and section order.
export function readDicePromptResults(prompt) {
    const blocks = [...prompt.matchAll(/^```json\r?\n([\s\S]*?)\r?\n```$/gm)];
    assert.equal(blocks.length, 1);
    const results = JSON.parse(blocks[0][1]);
    assert.ok(Array.isArray(results));
    return results;
}
