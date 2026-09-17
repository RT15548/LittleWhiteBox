import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { WORLD_PARTITION } from '../apps/world/partition.js';
import { article, worldHarness } from './world-harness.js';

test('native upstream v1 world content opens unchanged and the next content save writes only v2', async t => {
    const original = JSON.parse(await readFile(new URL('./fixtures/world-v1-native.json', import.meta.url), 'utf8'));
    const h = await worldHarness(original); t.after(h.dispose);
    assert.deepEqual(h.world.readCurrent().world, { version: 2, overview: original.overview, news: original.news });
    assert.equal(h.state.writes.length, 0);
    const session = await h.session();
    await session.executeTool('WorldEdit', { upsert: [article()] });
    await session.commit(() => true);
    assert.deepEqual(h.state.persisted.partitions.world, { version: 2, overview: original.overview, news: [article()] });
    const reopened = await worldHarness(h.state.persisted.partitions.world); t.after(reopened.dispose);
    assert.deepEqual(reopened.world.readCurrent().world, h.world.readCurrent().world);
    assert.equal(WORLD_PARTITION.parse({ ...original, subscribed: 'true' }).ok, false);
    assert.throws(() => WORLD_PARTITION.serialize(original));
});
