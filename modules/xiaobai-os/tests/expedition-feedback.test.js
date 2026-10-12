import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { OrthographicCamera, Vector3 } from 'three';
import { createBattle, tickBattle } from '../apps/game/expedition/combat.ts';
import { RULES } from '../apps/game/expedition/content.ts';
import { hurtPlayer } from '../apps/game/expedition/combat/damage.ts';
import { defeatReason } from '../apps/game/expedition/combat/outcome.ts';
import { validateBattle } from '../apps/game/expedition/battle-validation.ts';
import { createWorldStatus } from '../apps/game/expedition/scene-status.ts';

const gear = { weapon: 'blade', relics: [], oaths: [] };
const makeBattle = (encounter = 'skirmish') => createBattle({ seed: 7, zone: 3, chapter: 0, elite: false, boss: false, bossKind: 'forgemaster', encounter, hp: 50 }, gear);
const idle = { move: 0, dash: false, skill: false };

// Protect the cause/effect boundary: presentation must not report a wound for fully absorbed damage.
test('ward feedback distinguishes absorption, shield break and health damage without changing damage accounting', () => {
    const b = makeBattle(); b.player.invulnerable = 0; b.player.ward = 20;
    hurtPlayer(b, 10, gear);
    assert.equal(b.player.hp, 50); assert.equal(b.player.ward, 12); assert.equal(b.damageTaken, 0);
    assert.equal(b.effects.at(-1).kind, 'ward-hit'); validateBattle(b);
    b.player.invulnerable = 0; hurtPlayer(b, 20, gear);
    assert.equal(b.player.hp, 46); assert.equal(b.player.ward, 0); assert.equal(b.damageTaken, 4);
    assert.equal(b.effects.at(-1).kind, 'ward-break'); validateBattle(b);
    b.player.invulnerable = 0; hurtPlayer(b, 10, gear);
    assert.equal(b.effects.at(-1).kind, 'hit'); assert.equal(b.player.hp, 38);
    b.player.invulnerable = 0; b.player.ward = 1; b.player.hp = 1;
    hurtPlayer(b, 20, { ...gear, relics: [{ id: 'last-stand', rank: 1 }] });
    assert.equal(b.effects.at(-1).kind, 'ward-break'); assert.equal(b.player.rescues, 1); assert.equal(b.player.hp, 23);
});

test('successful blocks and parries report their actual defensive window, not a generic stagger', () => {
    const b = makeBattle(); b.enemies = []; b.player.invulnerable = 0;
    tickBattle(b, { ...idle, skill: true }, gear); hurtPlayer(b, 20, gear);
    assert.equal(b.effects.at(-1).kind, 'parry'); assert.equal(b.player.hp, 50); assert.equal(b.player.resource, 25);
    for (let i = 0; i < 10; i++) tickBattle(b, idle, gear);
    b.player.invulnerable = 0; hurtPlayer(b, 20, gear);
    assert.equal(b.effects.at(-1).kind, 'block'); assert.equal(b.player.resource, 33); assert.equal(b.player.hp, 50);
    validateBattle(b);
});

test('beacon defeat remains distinct from player death and never applies to a boss arena', () => {
    const b = makeBattle('siege'); b.objective.hp = 0;
    assert.equal(defeatReason(b), 'beacon'); tickBattle(b, idle, gear);
    assert.equal(b.status, 'lost'); assert.equal(b.player.hp, 50);
    b.player.hp = 0; assert.equal(defeatReason(b), 'fallen');
    b.player.hp = 50; b.boss = true; assert.equal(defeatReason(b), null);
});

// Real DOM readout boundary; no text snapshots or source-code assertions.
test('ward energy follows the feet without a permanent overhead notice or a duplicate beacon readout', () => {
    const { document } = parseHTML('<div></div>'), previous = globalThis.document;
    globalThis.document = document;
    const host = document.querySelector('div'), camera = new OrthographicCamera(-10, 10, 10, -10, .1, 180);
    camera.position.set(10, 20, 20); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
    const status = createWorldStatus(host), b = makeBattle('siege');
    try {
        status.update(b, camera, 800, 600);
        const bar = host.querySelector('[role=meter]');
        assert.equal(bar.hidden, true);
        assert.equal(host.querySelector('[role=progressbar]'), null);
        b.tick++; b.objective.hp = 24; status.update(b, camera, 800, 600);
        assert.equal(bar.hidden, true); assert.equal(b.player.hp, 50);
        b.player.ward = 20; status.update(b, camera, 800, 600);
        assert.equal(bar.hidden, false); assert.equal(bar.getAttribute('aria-valuenow'), '20');
        assert.equal(Number(bar.getAttribute('aria-valuemax')), RULES.maxHp);
        assert.equal(parseFloat(bar.firstElementChild.style.width), b.player.ward / RULES.maxHp * 100);
        assert.equal(host.querySelector('[data-state]').hidden, true);
        b.player.x += 2; b.player.y -= 1;
        status.update(b, camera, 800, 600);
        const feet = new Vector3(b.player.x, 0, b.player.y).project(camera);
        assert.equal(parseFloat(bar.style.left), (feet.x * .5 + .5) * 800);
        assert.equal(parseFloat(bar.style.top), (-feet.y * .5 + .5) * 600);
        b.player.invulnerable = 0; hurtPlayer(b, 10, gear);
        status.update(b, camera, 800, 600);
        assert.equal(bar.getAttribute('aria-valuenow'), '12');
        assert.equal(parseFloat(bar.firstElementChild.style.width), b.player.ward / RULES.maxHp * 100);
        assert.equal(host.querySelector('[data-state="ward-hit"]').hidden, false);
        b.tick += 28; b.effects = []; status.update(b, camera, 800, 600);
        assert.equal(bar.hidden, false); assert.equal(host.querySelector('[data-state]').hidden, true);
        b.player.shield = 5; status.update(b, camera, 800, 600);
        assert.equal(host.querySelector('[data-state="blocking"]').hidden, false); assert.equal(bar.hidden, false);
        b.player.shield = 0; b.player.invulnerable = 0; hurtPlayer(b, 20, gear);
        status.update(b, camera, 800, 600);
        assert.equal(bar.hidden, true); assert.equal(host.querySelector('[data-state="ward-break"]').hidden, false);
        status.update(makeBattle(), camera, 800, 600);
        assert.equal(bar.hidden, true); assert.equal(host.querySelector('[data-state]').hidden, true);
        b.player.ward = 8; status.update(b, camera, 800, 600);
        assert.equal(bar.hidden, false); assert.equal(bar.getAttribute('aria-valuenow'), '8');
        status.update(null, camera, 800, 600);
        assert.equal(bar.hidden, true); assert.equal(host.querySelector('[data-state]').hidden, true);
        status.dispose(); assert.equal(host.childElementCount, 0);
    } finally { status.dispose(); globalThis.document = previous; }
});
