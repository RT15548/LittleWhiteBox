// CLI flow on the disposable procurement preview after manual delivery.
export async function exerciseBuildingMemories(page) {
    if (new URL(page.url()).port !== '18922') throw new Error('wrong-preview');
    const frame = page.frameLocator('iframe[title="OS"]');
    const get = async endpoint => (await (await page.request.get(new URL('/__building/' + endpoint, page.url()).href)).json()).result;
    const check = (ok, code) => { if (!ok) throw new Error(code); };
    const idle = () => frame.locator('.building-room[aria-busy="false"][data-build-presenting="false"]').waitFor();
    const open = async () => {
        await page.reload(); await page.bringToFront();
        await frame.getByRole('button', { name: '游戏', exact: true }).click();
        await frame.getByRole('button', { name: /^小白筑家 / }).click(); await idle();
        await frame.locator('[data-build-action="homes"]').click();
    };
    await page.setViewportSize({ width: 390, height: 844 }); await open();
    const initial = await get('view'), x = initial.active.site.entrance;
    check(initial.active.state === 'living' && initial.active.tier === 'sunroom', 'needs-delivered-home');
    // Fixture preparation through the real host transaction, no fabricated receipt or wallet.
    const prepared = await (await page.request.post(new URL('/__building/action', page.url()).href, { data: {
        type: 'game/building/act', payload: { chatIdentity: 'building-preview', actionId: 'memory-browser-remodel', revision: initial.revision,
            command: { type: 'restore', rooms: [{ kind: 'hall', x, y: 0, z: 2 }, { kind: 'room', x: x - 1, y: 0, z: 2 }] } }
    } })).json();
    check(prepared.ok, 'memory-fixture-remodel'); await open();
    const put = async (kind, dx, z) => {
        await frame.locator('[data-build-kind="' + kind + '"]').click();
        await frame.locator('[data-build-cell="' + (x + dx) + ':0:' + z + '"]').click(); await idle();
    };
    const rememberReady = async () => {
        const exit = frame.locator('[data-build-action="finish"]');
        if (await exit.count()) { await exit.click(); await idle(); }
        for (;;) {
            const ready = frame.locator('[data-memory-ready="true"]');
            if (!await ready.count()) break;
            await frame.locator('[data-build-action="remember"]').click(); await idle();
        }
    };
    await frame.locator('[data-build-action="remodel"]').click();
    await put('path', 1, 2); await put('path', 1, 1); await put('garden', 0, 1);
    await rememberReady();
    check((await get('view')).active.memories.includes('gardenWalk'), 'garden-walk');
    await frame.locator('[data-build-action="remodel"]').click();
    await put('study', -1, 1); await put('wide', -1, 0); await rememberReady();
    check((await get('view')).active.memories.length === 3, 'reading-tea');
    await frame.locator('[data-build-action="remodel"]').click();
    await put('room', 1, 0); await rememberReady();
    const completed = await get('view');
    check(completed.active.memories.length === 5 && completed.balance === initial.balance, 'five-memories-no-coins');
    check(await frame.locator('[data-build-memory="complete"]').isVisible(), 'home-arc-complete');
    await frame.locator('[data-build-action="memories"]').click();
    check(await frame.locator('[data-memory-earned="true"]').count() === 5, 'album-five');
    await page.screenshot({ path: 'output/playwright/building-random-memory-album.png' });
    await frame.getByRole('button', { name: '关闭', exact: true }).first().click();
    await get('reload'); await open();
    check(JSON.stringify((await get('view')).active) === JSON.stringify(completed.active), 'home-memory-reload');
    await frame.locator('[data-build-action="remodel"]').click();
    await frame.locator('[data-build-cell="' + (x - 1) + ':0:1"]').click();
    await frame.locator('[data-build-action="remove"]').click(); await idle();
    await frame.getByRole('button', { name: '更多', exact: true }).click();
    await frame.getByRole('button', { name: '小家回忆', exact: true }).click();
    check(await frame.locator('[data-build-memory-id="gardenReading"][data-memory-earned="true"][data-memory-displayed="false"]').isVisible(), 'keepsake-stored');
    await frame.getByRole('button', { name: '关闭', exact: true }).first().click();
    await frame.locator('[data-build-action="undo"]').click(); await idle();
    await frame.locator('[data-build-action="finish"]').click();
    await frame.locator('[data-build-action="memories"]').click();
    check(await frame.locator('[data-build-memory-id="gardenReading"][data-memory-displayed="true"]').isVisible(), 'keepsake-restored');
    await frame.getByRole('button', { name: '关闭', exact: true }).first().click();
    for (const [width, height] of [[390, 844], [320, 568], [844, 390]]) {
        await page.setViewportSize({ width, height });
        const box = await frame.locator('[data-build-action="remodel"]').boundingBox();
        check(box && box.y + box.height <= height, 'remodel-visible-' + width);
        await page.screenshot({ path: 'output/playwright/building-random-home-' + width + '.png' });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    return { memories: completed.active.memories, noExtraCoins: true, reload: true, storedAndRestoredKeepsake: true };
}
