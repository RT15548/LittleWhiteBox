import assert from 'node:assert/strict';
import test from 'node:test';

import { applyTrustedMapPatchOps } from '../shared/map-state-ops';
import type { TavernMapDocument } from '../shared/structured-state';

test('trusted map patch replay clears old shape fields when modify switches shape', () => {
    const seed: TavernMapDocument = {
        meta: { name: 'Arena', theme: 'parchment', viewBox: [0, 0, 400, 300], status: 'active' },
        elements: [
            { id: 'room', at: [20, 20], cat: 'wall', rect: [120, 80] },
        ],
    };

    const replayed = applyTrustedMapPatchOps(seed, [
        { op: 'modify', id: 'room', set: { circle: 40, at: [80, 90], cat: 'marker' } },
    ]);

    assert.deepEqual(replayed.elements, [
        { id: 'room', at: [80, 90], cat: 'marker', circle: 40 },
    ]);
});

test('trusted map patch replay reaches the same end state as canonical transaction history', () => {
    const seed: TavernMapDocument = {
        meta: { name: null, theme: 'parchment', viewBox: null, status: 'uninitialized', hint: 'seed' },
        elements: [],
    };

    const replayed = applyTrustedMapPatchOps(seed, [
        { op: 'meta', set: { name: 'Hall', status: 'active', viewBox: [0, 0, 400, 300] } },
        { op: 'add', element: { id: 'hall', at: [20, 30], cat: 'wall', rect: [180, 120] } },
        { op: 'add', element: { id: 'token', at: [60, 70], cat: 'marker', shape: 'icon', icon: 'location_on' } },
        { op: 'modify', id: 'token', set: { at: [90, 95] } },
    ]);

    assert.deepEqual(replayed, {
        meta: { name: 'Hall', theme: 'parchment', viewBox: [0, 0, 400, 300], status: 'active' },
        elements: [
            { id: 'hall', at: [20, 30], cat: 'wall', rect: [180, 120] },
            { id: 'token', at: [90, 95], cat: 'marker', shape: 'icon', icon: 'location_on' },
        ],
    });
});

test('trusted map patch replay applies explicit null field deletions', () => {
    const seed: TavernMapDocument = {
        meta: { name: 'Study', theme: 'parchment', viewBox: [0, 0, 400, 300], status: 'active' },
        elements: [
            {
                id: 'desk',
                at: [30, 40],
                cat: 'furniture',
                rect: [90, 40],
                material: 'wood',
                fill: '#ff0000',
                certainty: 'inferred',
                style: { color: '#fff', width: 2 },
            },
        ],
    };

    const replayed = applyTrustedMapPatchOps(seed, [
        { op: 'modify', id: 'desk', set: { fill: null, certainty: null, style: null } },
    ]);

    assert.deepEqual(replayed.elements, [
        {
            id: 'desk',
            at: [30, 40],
            cat: 'furniture',
            rect: [90, 40],
            material: 'wood',
        },
    ]);
});

test('trusted map patch replay keeps icon shape without forcing a visual icon', () => {
    const seed: TavernMapDocument = {
        meta: { name: 'Hall', theme: 'parchment', viewBox: [0, 0, 400, 300], status: 'active' },
        elements: [
            { id: 'exit', at: [20, 20], cat: 'wall', rect: [120, 80] },
        ],
    };

    const replayed = applyTrustedMapPatchOps(seed, [
        { op: 'modify', id: 'exit', set: { at: [80, 90], cat: 'door', kind: 'portal', shape: 'icon' } },
    ]);

    assert.deepEqual(replayed.elements, [
        { id: 'exit', at: [80, 90], cat: 'door', kind: 'portal', shape: 'icon' },
    ]);
});

test('trusted map patch replay does not treat visual icon edits as shape replacement', () => {
    const seed: TavernMapDocument = {
        meta: { name: 'Hall', theme: 'parchment', viewBox: [0, 0, 400, 300], status: 'active' },
        elements: [
            { id: 'room', at: [20, 20], cat: 'wall', rect: [120, 80] },
            { id: 'exit', at: [180, 20], cat: 'door', kind: 'door', shape: 'icon', icon: 'door_open' },
        ],
    };

    const replayed = applyTrustedMapPatchOps(seed, [
        { op: 'modify', id: 'room', set: { icon: 'chair' } },
        { op: 'modify', id: 'exit', set: { icon: null } },
    ]);

    assert.deepEqual(replayed.elements, [
        { id: 'room', at: [20, 20], cat: 'wall', rect: [120, 80] },
        { id: 'exit', at: [180, 20], cat: 'door', kind: 'door', shape: 'icon' },
    ]);
});
