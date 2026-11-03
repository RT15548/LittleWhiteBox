import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { WORLD_PARTITION } from '../apps/world/partition.js';
import { createEmptyWorld } from '../domains/world/types.js';
import { article, worldHarness } from './world-harness.js';

for (const fixture of ['world-v1-native.json', 'world-v2-published.json']) {
    test(`${fixture} opens with bodies intact and saves only the current format`, async t => {
        const original = JSON.parse(await readFile(new URL(`./fixtures/${fixture}`, import.meta.url), 'utf8'));
        const migrated = { ...createEmptyWorld(), overview: original.overview,
            news: original.news.map(({ id, title, body }) => ({ id, title, body })) };
        const h = await worldHarness(original); t.after(h.dispose);
        assert.deepEqual(h.world.readCurrent().world, migrated);
        assert.equal(h.state.writes.length, 0);
        assert.deepEqual(h.state.persisted.partitions.world, original);
        assert.deepEqual(WORLD_PARTITION.serialize(migrated), migrated);
        const session = await h.session();
        const added = article('ferry');
        await session.executeTool('WorldEdit', { upsert: [added] });
        await session.commit(() => true);
        assert.deepEqual(h.state.persisted.partitions.world, { ...migrated, news: [added, ...migrated.news] });
        const reopened = await worldHarness(h.state.persisted.partitions.world); t.after(reopened.dispose);
        assert.deepEqual(reopened.world.readCurrent().world, h.world.readCurrent().world);
        assert.equal(WORLD_PARTITION.parse({ ...original, subscribed: 'true' }).ok, false);
        assert.throws(() => WORLD_PARTITION.serialize(original));
    });
}

test('v2 migration validates the frozen format rather than treating current articles as old data', async () => {
    const original = JSON.parse(await readFile(new URL('./fixtures/world-v2-published.json', import.meta.url), 'utf8'));
    for (const patch of [{ summary: undefined }, { summary: 'x'.repeat(121) }, { body: '' }, { extra: true }]) {
        assert.equal(WORLD_PARTITION.parse({ ...original, news: [{ ...original.news[0], ...patch }] }).ok, false);
    }
    assert.equal(WORLD_PARTITION.parse({ ...original, news: [...original.news, ...original.news] }).ok, false);
});
