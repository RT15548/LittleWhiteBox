import test from 'node:test';
import assert from 'node:assert/strict';

import { assessQueryFocusOwnership } from '../experiments/query-focus-construction-screen.mjs';

test('H-Q-FOCUS candidate keeps context-only entities out of focus and initial lexical terms', () => {
    const result = assessQueryFocusOwnership({
        baseline: {
            focusTerms: ['主角', '上下文角色'],
            focusCharacters: ['主角', '上下文角色'],
            lexicalTerms: ['主角', '上下文角色', '上下文关键词'],
        },
        focusOnly: {
            focusTerms: ['主角'],
            focusCharacters: ['主角'],
            lexicalTerms: ['主角', '焦点关键词'],
        },
        usesFocusOnlyCandidate: true,
    });
    assert.equal(result.valid, true);
    assert.deepEqual(result.candidate, {
        focusTerms: ['主角'],
        focusCharacters: ['主角'],
        lexicalTerms: ['主角', '焦点关键词'],
    });
});

test('H-Q-FOCUS rejects a focus-only lexical arm that retains a context-only entity', () => {
    const result = assessQueryFocusOwnership({
        baseline: {
            focusTerms: ['主角', '上下文角色'],
            focusCharacters: ['主角', '上下文角色'],
            lexicalTerms: ['主角', '上下文角色'],
        },
        focusOnly: {
            focusTerms: ['主角'],
            focusCharacters: ['主角'],
            lexicalTerms: ['主角', '上下文角色'],
        },
        usesFocusOnlyCandidate: true,
    });
    assert.equal(result.valid, false);
    assert.deepEqual(result.violations, ['candidate-lexical-contains-context-only-entity']);
});

test('H-Q-FOCUS no-character branch is an exact baseline fallback', () => {
    const value = {
        baseline: {
            focusTerms: ['上下文角色'],
            focusCharacters: ['上下文角色'],
            lexicalTerms: ['上下文角色', '省略主语'],
        },
        focusOnly: {
            focusTerms: [],
            focusCharacters: [],
            lexicalTerms: ['省略主语'],
        },
        usesFocusOnlyCandidate: false,
    };
    const result = assessQueryFocusOwnership(value);
    assert.equal(result.valid, true);
    assert.deepEqual(result.candidate, value.baseline);
});
