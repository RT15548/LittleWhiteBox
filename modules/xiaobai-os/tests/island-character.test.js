import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test, { before, after } from 'node:test';
import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { createCharacterAsset } from '../apps/game/island/presentation/character-asset.ts';
import { disposeGroup } from '../apps/game/island/presentation/meshes.ts';
import { GARMENTS } from '../apps/game/island/clothing.ts';
import { newJourney } from '../apps/game/island/world.ts';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { createItem } from '../apps/game/island/inventory.ts';
import { operate } from '../apps/game/island/operations.ts';
import { observe, openScene } from '../apps/game/island/scene.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';

const styles = ['ivory_blouse', 'charcoal_trousers', 'inner_top', 'inner_shorts'];
const outfit = [...styles, 'lifejacket', 'shoes'].map(kind => ({ kind, wetness: 0 }));
let gltf, asset;
before(async () => {
    const bytes = await readFile(new URL('../apps/game/island/assets/characters/ye.glb', import.meta.url));
    const loader = new GLTFLoader();
    // Only browser image decoding is substituted. All GLB materials, geometry, skins,
    // skeletons, extras and animation tracks still pass through the real GLTFLoader.
    loader.register(parser => ({
        name: 'ISLAND_TEST_IMAGE_DECODER',
        loadTexture(index) {
            const texture = new T.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
            texture.flipY = false; texture.needsUpdate = true;
            parser.associations.set(texture, { textures: index });
            return Promise.resolve(texture);
        },
    }));
    gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
    asset = createCharacterAsset(gltf);
});
after(() => asset?.dispose());

function person(t, worn = outfit, dead = false) {
    const visual = asset.create(worn, dead); t.after(() => visual.dispose()); return visual;
}
function garment(root, shape) {
    let found;
    root.traverse(object => { if (object.userData.garment_id === shape) found = object; });
    assert.ok(found, `Missing physical garment ${shape}`);
    return found;
}
function visibleShapes(root) {
    const result = [];
    root.traverseVisible(object => { if (object.userData.garment_id) result.push(object.userData.garment_id); });
    return result.sort();
}
function materials(root, tintOnly = false) {
    const result = [];
    root.traverse(object => {
        if (!object.isMesh) return;
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            if (!tintOnly || material.userData.garment_tint === true) result.push(material);
        }
    });
    return [...new Set(result)];
}
const fabricState = root => materials(root).map(material => ({ color: material.color.toArray(), roughness: material.roughness }));
function visibleBounds(root) {
    root.updateMatrixWorld(true);
    const bounds = new T.Box3(), point = new T.Vector3();
    root.traverseVisible(object => {
        if (!object.isMesh) return;
        for (let index = 0; index < object.geometry.getAttribute('position').count; index++) {
            object.getVertexPosition(index, point).applyMatrix4(object.matrixWorld); bounds.expandByPoint(point);
        }
    });
    assert.equal(bounds.isEmpty(), false);
    return bounds;
}
function bone(root, name) {
    const found = root.getObjectByName(T.PropertyBinding.sanitizeNodeName(name));
    assert.ok(found?.isBone, `Missing actual GLB bone ${name}`); return found;
}
function bonePose(root) {
    const result = new Map();
    root.traverse(object => {
        if (object.isBone) { object.updateMatrix(); result.set(object.name, [...object.matrix.elements]); }
    });
    assert.ok(result.size > 0); return result;
}
function assertClip(visual, name, seconds) {
    const reference = cloneSkeleton(gltf.scene), mixer = new T.AnimationMixer(reference);
    const clip = gltf.animations.find(animation => animation.name === name); assert.ok(clip);
    mixer.clipAction(clip).play(); mixer.update(seconds);
    const actual = bonePose(visual.root), expected = bonePose(reference);
    assert.equal(actual.size, expected.size);
    for (const [name, matrix] of expected) {
        const value = actual.get(name); assert.ok(value);
        assert.ok(matrix.every((n, index) => Math.abs(n - value[index]) < 1e-5), `Wrong confirmed clip pose at ${name}`);
    }
    mixer.stopAllAction(); mixer.uncacheRoot(reference);
    const skeletons = new Set(); reference.traverse(object => { if (object.isSkinnedMesh) skeletons.add(object.skeleton); });
    skeletons.forEach(skeleton => skeleton.dispose());
}
function replay(visual, { activity = null, work = null, moving = false } = {}, milliseconds = 400) {
    // The public visual phase is elapsed milliseconds / 160, not the survival clock.
    for (let time = 0; time <= milliseconds; time += 40) visual.pose(time / 160, moving, activity, work);
}
function assertGrounded(visual, label) {
    const bounds = visibleBounds(visual.root);
    assert.ok(bounds.min.y >= -.005 && bounds.min.y < .04, `${label}: visible lower edge ${bounds.min.y}m`);
    return bounds;
}

test('real GLB garments follow actual worn kinds, including vest, shoes and wraps, with independent inner-layer wetness', t => {
    const a = person(t), b = person(t);
    assert.deepEqual(visibleShapes(a.root), outfit.map(item => GARMENTS[item.kind].shape).sort());
    for (const kind of styles) {
        const spec = GARMENTS[kind], expected = new T.Color(...spec.color);
        const tinted = materials(garment(a.root, spec.shape), true); assert.ok(tinted.length > 0);
        for (const material of tinted) {
            assert.ok(material.color.toArray().every((value, index) => Math.abs(value - expected.toArray()[index]) < 1e-6));
            assert.equal(material.roughness, spec.dryRoughness);
        }
    }
    const dry = fabricState(a.root), other = fabricState(b.root);
    const innerTop = garment(a.root, 'inner-top'), innerShorts = garment(a.root, 'inner-shorts');
    const lowerDry = fabricState(innerShorts), upperDry = fabricState(innerTop);
    a.wetness(outfit.map(item => ({ ...item, wetness: item.kind === 'inner_top' ? 1 : 0 })));
    assert.notDeepEqual(fabricState(innerTop), upperDry);
    assert.deepEqual(fabricState(innerShorts), lowerDry);
    assert.deepEqual(fabricState(b.root), other);
    a.wetness(outfit); assert.deepEqual(fabricState(a.root), dry);
    for (const kind of [...styles, 'lifejacket', 'shoes', 'wraps']) {
        a.wetness([{ kind, wetness: .5 }]);
        assert.deepEqual(visibleShapes(a.root), [GARMENTS[kind].shape]);
    }
    a.wetness([]); assert.deepEqual(visibleShapes(a.root), []);
    let visibleSkin = 0; a.root.traverseVisible(object => { if (object.isSkinnedMesh) visibleSkin++; });
    assert.ok(visibleSkin > 0);
});

test('off-body garments retain the same style and wet color, and disposing one visual or loose object preserves subsequent instances', t => {
    const disposed = [], shared = new Set();
    gltf.scene.traverse(object => {
        if (!object.isMesh) return;
        shared.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            shared.add(material);
            for (const value of Object.values(material)) if (value?.isTexture) shared.add(value);
        }
    });
    const onDispose = event => disposed.push(event.target);
    for (const resource of shared) resource.addEventListener('dispose', onDispose);
    t.after(() => { for (const resource of shared) resource.removeEventListener('dispose', onDispose); });
    const a = asset.create(outfit, false), b = person(t), unchanged = fabricState(b.root);
    for (const kind of styles) {
        const worn = [{ kind, wetness: .63 }]; a.wetness(worn);
        const loose = asset.garment(worn[0]);
        const onBody = materials(garment(a.root, GARMENTS[kind].shape), true), offBody = materials(loose, true);
        assert.ok(onBody.length > 0 && offBody.length > 0);
        assert.deepEqual(offBody.map(material => [material.color.toArray(), material.roughness]),
            onBody.map(material => [material.color.toArray(), material.roughness]));
        assert.ok(visibleBounds(loose).min.y >= -.005);
        loose.traverseVisible(object => {
            if (!object.isMesh) return;
            // Three submits only geometry groups when materials are an array. Bounds/color tests alone cannot detect an invisible garment.
            const submitted = Array.isArray(object.material)
                ? object.geometry.groups.filter(group => object.material[group.materialIndex]?.visible).reduce((sum, group) => sum + group.count, 0)
                : object.material.visible ? object.geometry.index?.count ?? object.geometry.getAttribute('position').count : 0;
            assert.ok(submitted >= 3, `${kind}: no visible triangles submitted to the renderer`);
        });
        disposeGroup(loose);
    }
    a.dispose();
    assert.deepEqual(disposed, []);
    assert.deepEqual(fabricState(b.root), unchanged);
    const next = person(t); replay(next, { moving: true, activity: 'travel' });
    assert.deepEqual(fabricState(next.root), unchanged);
    assertGrounded(next, 'subsequent instance');
});

test('confirmed activities use the real authored clips while hand/head attachments follow bones and the world root stays fixed', t => {
    const cases = [
        { activity: null, clip: 'idle' },
        { activity: 'travel', moving: true, clip: 'walk' },
        { activity: 'rest', clip: 'rest' },
        { activity: 'work', work: 'craft', clip: 'work' },
        { activity: 'construct', clip: 'construct' },
        { activity: 'offer', clip: 'offer' },
        { activity: 'drag', moving: true, clip: 'drag' },
    ];
    for (const mode of cases) {
        const visual = person(t); replay(visual, mode);
        assertClip(visual, mode.clip, .4);
        assertGrounded(visual, mode.clip);
        const head = bone(visual.root, 'head').getWorldPosition(new T.Vector3());
        const anchor = visual.headAnchor.getWorldPosition(new T.Vector3());
        assert.ok(anchor.distanceTo(head) > 0 && anchor.distanceTo(head) < .3);
        const wrist = bone(visual.root, 'wrist.R').getWorldPosition(new T.Vector3());
        const fingers = bone(visual.root, 'finger3-1.R').getWorldPosition(new T.Vector3());
        const hand = visual.hand.getWorldPosition(new T.Vector3());
        assert.ok(new T.Line3(wrist, fingers).closestPointToPoint(hand, true, new T.Vector3()).distanceTo(hand) < .005);
        const held = new T.Object3D(); visual.hand.add(held);
        assert.ok(held.getWorldPosition(new T.Vector3()).distanceTo(hand) < 1e-6);
        visual.root.position.set(17, 3, -29); visual.root.rotation.y = .8;
        const expectedHand = hand.clone().applyMatrix4(new T.Matrix4().compose(visual.root.position, visual.root.quaternion, visual.root.scale));
        visual.pose(400 / 160, mode.moving ?? false, mode.activity, mode.work ?? null);
        assert.deepEqual(visual.root.position.toArray(), [17, 3, -29]); assert.equal(visual.root.rotation.y, .8);
        assert.ok(held.getWorldPosition(new T.Vector3()).distanceTo(expectedHand) < 1e-5);
        const movedHead = bone(visual.root, 'head').getWorldPosition(new T.Vector3());
        assert.ok(visual.headAnchor.getWorldPosition(new T.Vector3()).distanceTo(movedHead) < .3);
    }
});

test('visible body contact is grounded with shoes, wraps or bare feet, and resting lowers the person without including hidden clothes', t => {
    for (const footwear of ['shoes', 'wraps', null]) {
        const worn = outfit.filter(item => GARMENTS[item.kind].slot !== 'feet');
        if (footwear) worn.push({ kind: footwear, wetness: 0 });
        const visual = person(t, worn);
        const standingHead = visual.headAnchor.getWorldPosition(new T.Vector3()).y;
        for (const mode of [{}, { activity: 'travel', moving: true }]) {
            replay(visual, mode, 800); assertGrounded(visual, `${footwear}/${mode.activity ?? 'idle'}`);
        }
        replay(visual, { activity: 'rest' });
        assertGrounded(visual, `${footwear}/rest`);
        assert.ok(visual.headAnchor.getWorldPosition(new T.Vector3()).y < standingHead - .25);
    }
});

test('dead GLB bodies stay prone through stale activities and movement replay, including hand, head and covering attachment transforms', t => {
    const body = person(t, outfit, true);
    for (const mode of [{}, { activity: 'travel', moving: true }, { activity: 'rest' }, { activity: 'work', work: 'drink' }, { activity: 'offer' }]) {
        replay(body, mode); assertClip(body, 'dead', .4);
        const bounds = assertGrounded(body, `dead/${mode.activity}`), size = bounds.getSize(new T.Vector3());
        assert.ok(size.y < .6 && Math.max(size.x, size.z) > size.y * 2);
        assert.ok(body.headAnchor.getWorldPosition(new T.Vector3()).y < .6);
    }
    const cover = new T.Object3D(); body.covering.add(cover);
    const local = cover.getWorldPosition(new T.Vector3());
    body.root.position.set(-4, 2, 11); body.root.rotation.y = .6;
    body.pose(400 / 160, true, 'travel');
    assert.deepEqual(body.root.position.toArray(), [-4, 2, 11]);
    assert.ok(cover.getWorldPosition(new T.Vector3()).distanceTo(local.applyMatrix4(body.root.matrixWorld)) < 1e-6);
});

test('saved confirmed drinking and washing expose only observable work kind and drive the corresponding GLB animation without elapsing time', t => {
    for (const kind of ['drink', 'wash']) {
        let w = newJourney(`character-${kind}`);
        const container = createItem(w, 'ye', 'bottle', 1); w.items[container].water.millilitres = 250;
        const task = kind === 'drink' ? { kind, container, millilitres: 100 }
            : { kind, supply: { kind: 'container', id: container }, millilitres: 100 };
        w = operate(w, { kind: 'gm', scene: openScene(w, 'ye', LANDSCAPE) }, 'ye', { kind: 'work', task }, LANDSCAPE);
        const parsed = ISLAND_PARTITION.parse(JSON.parse(JSON.stringify({ formatVersion: 1, revision: 1, active: w,
            last: { id: 'character-save', fingerprint: '0'.repeat(64) } })));
        assert.equal(parsed.ok, true); w = parsed.value.active;
        const before = structuredClone(w), view = observe(w, 'player', LANDSCAPE), seen = view.people.find(person => person.id === 'ye');
        // Exact public observation shape protects the privacy boundary: no task target,
        // source/container ID, remaining work or private bodily state of the other person.
        assert.deepEqual(seen, { id: 'ye', position: w.people.ye.position, body: { kind: 'living' }, activity: 'work', work: kind });
        assert.equal(view.items.some(item => item.id === container), false);
        const worn = view.items.filter(item => item.location.kind === 'worn' && item.location.person === 'ye');
        const visual = person(t, worn); replay(visual, { activity: seen.activity, work: seen.work });
        assertClip(visual, kind, .4); assertGrounded(visual, kind);
        assert.deepEqual(w, before); assert.equal(w.clock, 0);
    }
});
