import assert from 'node:assert/strict';
import test from 'node:test';

import {
    canMapElementUseAreaFill,
    compareMapStableText,
    materialEntry,
    semanticFingerprint,
    zOf,
} from '../shared/map-semantics';
import type { TavernMapDocument } from '../shared/structured-state';

test('map material entries are deterministic renderer-owned structures', () => {
    assert.deepEqual(materialEntry('wood'), { paint: 'url(#mat-wood)', blend: 'normal', layer: 'fill' });
    assert.deepEqual(materialEntry('bed-sheet'), { paint: 'url(#mat-bed-sheet)', blend: 'normal', layer: 'fill' });
    assert.deepEqual(materialEntry('fabric'), { paint: 'url(#mat-fabric)', blend: 'normal', layer: 'fill' });
    assert.deepEqual(materialEntry('tatami'), { paint: 'url(#mat-tatami)', blend: 'normal', layer: 'fill' });
    assert.deepEqual(materialEntry('sand'), { paint: 'url(#mat-sand)', blend: 'normal', layer: 'fill' });
    assert.deepEqual(materialEntry('marble'), { paint: 'url(#mat-marble)', blend: 'normal', layer: 'fill' });
    assert.deepEqual(materialEntry('warm-light'), { paint: 'url(#grad-warm)', blend: 'screen', layer: 'light', opacity: 0.7 });
    assert.deepEqual(materialEntry('shadow'), { paint: '#000', blend: 'multiply', layer: 'light', opacity: 0.5 });
    assert.equal(materialEntry('oak wood'), null);
});

test('map fill z order is stable and uses id as the renderer tiebreak outside the helper', () => {
    assert.equal(zOf('terrain', 'wood'), 10);
    assert.equal(zOf('water', 'water'), 20);
    assert.equal(zOf('road', 'dirt'), 30);
    assert.equal(zOf('furniture', 'carpet'), 40);
    assert.equal(zOf('danger', 'blood'), 50);
    assert.equal(zOf('magic', 'rune'), 60);
    assert.equal(zOf('terrain', 'warm-light'), 80);
    assert.equal(zOf('actor'), 90);
});

test('map stable text ordering is locale-independent', () => {
    const ids = ['b', 'a', 'z-10', 'z-2'];

    assert.deepEqual([...ids].sort(compareMapStableText), ['a', 'b', 'z-10', 'z-2']);
});

test('map area fill eligibility follows semantic drawing roles', () => {
    assert.equal(canMapElementUseAreaFill('terrain'), true);
    assert.equal(canMapElementUseAreaFill('furniture'), true);
    assert.equal(canMapElementUseAreaFill('door'), true);
    assert.equal(canMapElementUseAreaFill('danger'), true);
    assert.equal(canMapElementUseAreaFill('wall'), false);
    assert.equal(canMapElementUseAreaFill('grid'), false);
    assert.equal(canMapElementUseAreaFill('label'), false);
    assert.equal(canMapElementUseAreaFill('actor'), false);
    assert.equal(canMapElementUseAreaFill('marker'), false);
});

test('map semantic fingerprint ignores ordering and folds derived label text onto the source', () => {
    const left: TavernMapDocument = {
        meta: { name: 'Room', viewBox: [0, 0, 400, 300], theme: 'dark', status: 'active', mood: 'warm' },
        elements: [
            { id: 'rug', cat: 'furniture', at: [100, 120], rect: [80, 40], material: 'carpet' },
            { id: '__label__rug', cat: 'label', at: [140, 102], text: 'Rug' },
            { id: 'ground', cat: 'terrain', at: [0, 0], rect: [400, 300], material: 'wood' },
        ],
    };
    const right: TavernMapDocument = {
        meta: { name: 'Room', viewBox: [0, 0, 400, 300], theme: 'dark', status: 'active', mood: 'warm' },
        elements: [
            { id: 'ground', cat: 'terrain', at: [0, 0], rect: [400, 300], material: 'wood' },
            { id: '__label__rug', cat: 'label', at: [140, 102], text: 'Rug' },
            { id: 'rug', cat: 'furniture', at: [100, 120], rect: [80, 40], material: 'carpet' },
        ],
    };

    assert.deepEqual(semanticFingerprint(left), semanticFingerprint(right));
});

test('map semantic fingerprint treats derived label position as semantic', () => {
    const left: TavernMapDocument = {
        meta: { name: 'Room', viewBox: [0, 0, 400, 300], theme: 'dark', status: 'active', mood: 'warm' },
        elements: [
            { id: 'rug', cat: 'furniture', at: [100, 120], rect: [80, 40], material: 'carpet' },
            { id: '__label__rug', cat: 'label', at: [140, 102], text: 'Rug' },
        ],
    };
    const right: TavernMapDocument = {
        meta: { name: 'Room', viewBox: [0, 0, 400, 300], theme: 'dark', status: 'active', mood: 'warm' },
        elements: [
            { id: 'rug', cat: 'furniture', at: [100, 120], rect: [80, 40], material: 'carpet' },
            { id: '__label__rug', cat: 'label', at: [144, 102], text: 'Rug' },
        ],
    };

    assert.notDeepEqual(semanticFingerprint(left), semanticFingerprint(right));
});

test('map semantic fingerprint keeps icon shape even without explicit visual icon', () => {
    const shaped: TavernMapDocument = {
        meta: { name: 'Room', viewBox: [0, 0, 400, 300], theme: 'dark', status: 'active', mood: 'warm' },
        elements: [
            { id: 'exit', cat: 'door', kind: 'door', at: [100, 120], shape: 'icon' },
        ],
    };
    const unshaped: TavernMapDocument = {
        meta: { name: 'Room', viewBox: [0, 0, 400, 300], theme: 'dark', status: 'active', mood: 'warm' },
        elements: [
            { id: 'exit', cat: 'door', kind: 'door', at: [100, 120] },
        ],
    };

    assert.notDeepEqual(semanticFingerprint(shaped), semanticFingerprint(unshaped));
});
