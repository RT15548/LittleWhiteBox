// Camera-only Playwright CLI regression: never resets a preview or changes a house.
export async function verifyBuildingCameraDirection(page) {
    if (new URL(page.url()).port !== '18922') throw new Error('wrong-preview');
    const get = async () => (await (await page.request.get(new URL('/__building/view', page.url()).href)).json()).result;
    const original = await get();
    if (original.active?.state !== 'living') throw new Error('camera-test-needs-lived-in-house');
    const check = (ok, code) => { if (!ok) throw new Error(code); };
    const open = async target => {
        await target.goto(page.url()); await target.bringToFront();
        const frame = target.frameLocator('iframe[title="OS"]');
        await frame.getByRole('button', { name: '游戏', exact: true }).click();
        await frame.getByRole('button', { name: /^小白筑家 / }).click();
        await frame.locator('.building-room[aria-busy="false"]').waitFor();
        await frame.locator('[data-build-action="homes"]').click();
        // Edit mode exposes plot positions, but does not itself send a write.
        await frame.locator('[data-build-action="remodel"]').click();
        await frame.getByRole('button', { name: '全屋', exact: true }).click();
        return frame;
    };
    // A front landmark must move right relative to a rear landmark when dragged right,
    // matching Map's orbit interaction. Use projected visible geometry, not source or yaw values.
    const depthOffset = async frame => {
        const front = await frame.locator('[data-build-cell="' + original.active.site.entrance + ':0:' + (original.active.site.depth - 1) + '"]').boundingBox();
        const rear = await frame.locator('[data-build-cell="' + original.active.site.entrance + ':0:0"]').boundingBox();
        return front.x + front.width / 2 - rear.x - rear.width / 2;
    };
    const exercise = async (target, touch) => {
        const frame = await open(target), stage = await frame.locator('.build-stage').boundingBox();
        const x = stage.x + stage.width / 2, y = stage.y + 25;
        const cdp = touch ? await target.context().newCDPSession(target) : null;
        const drag = async dx => {
            if (cdp) {
                await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
                for (let step = 1; step <= 6; step++) {
                    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * step / 6, y }] });
                }
                await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
            } else {
                await target.mouse.move(x, y); await target.mouse.down();
                await target.mouse.move(x + dx, y, { steps: 6 }); await target.mouse.up();
            }
        };
        const baseline = await depthOffset(frame);
        await drag(60);
        const right = await depthOffset(frame);
        check(right > baseline + 3, (touch ? 'touch' : 'mouse') + '-right-drag-reversed');
        await frame.getByRole('button', { name: '全屋', exact: true }).click();
        check(Math.abs(await depthOffset(frame) - baseline) < 1, 'camera-reset');
        await drag(-60);
        const left = await depthOffset(frame);
        check(left < baseline - 3, (touch ? 'touch' : 'mouse') + '-left-drag-reversed');
        await target.screenshot({ path: 'output/playwright/building-random-camera-' + (touch ? 'touch' : 'mouse') + '.png' });
        await frame.getByRole('button', { name: '全屋', exact: true }).click();
        if (cdp) {
            const canvas = await frame.locator('.build-stage').boundingBox(), cy = canvas.y + 25;
            const before = await frame.locator('[data-build-cell="' + original.active.site.entrance + ':0:0"]').boundingBox();
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x - 25, y: cy }, { x: x + 25, y: cy }] });
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 45, y: cy }, { x: x + 45, y: cy }] });
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
            const after = await frame.locator('[data-build-cell="' + original.active.site.entrance + ':0:0"]').boundingBox();
            check(after.width > before.width, 'pinch-regressed');
        }
        return { baseline, right, left };
    };
    const mouse = await exercise(page, false);
    const context = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    let touch;
    try { touch = await exercise(await context.newPage(), true); }
    finally { await context.close(); await page.bringToFront(); }
    const after = await get();
    check(after.revision === original.revision && after.balance === original.balance && JSON.stringify(after.active) === JSON.stringify(original.active), 'camera-mutated-house');
    await page.reload();
    return { mouse, touch, pinch: true, houseUnchanged: true };
}
