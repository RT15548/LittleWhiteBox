// Playwright CLI callback; run against this directory's built tavern fixture.
// Observe the on-screen entrance/player anchors, not OrbitControls' internal state.
async (page) => {
    const cdp = await page.context().newCDPSession(page);
    const canvas = page.locator('canvas');
    const original = await page.evaluate(() => JSON.stringify(window.mapCheck.map()));
    const vector = points => [points[1].x - points[0].x, points[1].y - points[0].y];
    const length = v => Math.hypot(...v);
    const difference = (a, b) => length([a[0] - b[0], a[1] - b[1]]);
    async function anchors() {
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        return Promise.all(['入口', '小白'].map(name =>
            page.getByRole('img', { name, exact: true }).locator('.map-3d-anchor').evaluate(node => {
                const rect = node.getBoundingClientRect();
                return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
            })));
    }
    async function reset() { await page.getByRole('button', { name: '重置三维视角' }).click(); return anchors(); }
    async function touch(points, delta) {
        const box = await canvas.boundingBox();
        const start = points.map(([x, y], i) => ({ id: i + 1, x: box.x + box.width / 2 + x, y: box.y + box.height / 2 + y }));
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: start });
        for (let step = 1; step <= 8; step++) {
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: start.map((p, i) =>
                ({ ...p, x: p.x + delta[i][0] * step / 8, y: p.y + delta[i][1] * step / 8 })) });
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        return anchors();
    }
    function expectPan(before, after, name) {
        if (difference(vector(before), vector(after)) > 1 || Math.hypot(after[0].x - before[0].x, after[0].y - before[0].y) < 10) {
            throw Error(name + ': expected translation without changing viewing angle or scale');
        }
    }
    try {
        await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
        for (const width of [390, 320]) {
            await page.setViewportSize({ width, height: 844 });
            let before = await reset();
            expectPan(before, await touch([[0, 0]], [[26, 18]]), width + 'px single-finger drag');
            await page.screenshot({ path: 'output/playwright/map-touch-pan-' + width + '.png' });
            before = await reset();
            const rotated = await touch([[-35, 0], [35, 0]], [[28, 20], [28, 20]]);
            if (difference(vector(before), vector(rotated)) < 3) throw Error(width + 'px two-finger drag did not rotate');
            await page.screenshot({ path: 'output/playwright/map-touch-rotate-' + width + '.png' });
            before = await reset();
            const zoomed = await touch([[-30, 0], [30, 0]], [[-18, 0], [18, 0]]);
            if (length(vector(zoomed)) / length(vector(before)) < 1.15) throw Error(width + 'px pinch did not zoom');
            expectPan(zoomed, await touch([[0, 0]], [[18, 16]]), width + 'px single-finger after pinch');
        }
        await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
        await page.setViewportSize({ width: 1280, height: 900 });
        let before = await reset();
        const box = await canvas.boundingBox();
        for (const shifted of [false, true]) {
            before = await reset();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            if (shifted) await page.keyboard.down('Shift');
            try {
                await page.mouse.down({ button: 'right' });
                await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 30, { steps: 8 });
            } finally {
                await page.mouse.up({ button: 'right' });
                if (shifted) await page.keyboard.up('Shift');
            }
            const after = await anchors();
            if (after.some((point, i) => Math.hypot(point.x - before[i].x, point.y - before[i].y) > 1)) {
                throw Error('PC ' + (shifted ? 'Shift + ' : '') + 'right drag moved the map');
            }
        }
        for (const shifted of [true, false]) {
            before = await reset();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            if (shifted) await page.keyboard.down('Shift');
            try {
                await page.mouse.down();
                await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 30, { steps: 8 });
            } finally {
                await page.mouse.up();
                if (shifted) await page.keyboard.up('Shift');
            }
            const after = await anchors();
            if (shifted) expectPan(before, after, 'PC Shift + left drag');
            else if (difference(vector(before), vector(after)) < 3) throw Error('PC left drag after releasing Shift did not rotate');
        }
        before = await reset();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, -200);
        if (length(vector(await anchors())) <= length(vector(before))) throw Error('PC wheel did not zoom');
        if (await page.evaluate(() => JSON.stringify(window.mapCheck.map())) !== original) throw Error('Gestures changed map facts');
        await reset();
    } finally {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }).catch(() => {});
        await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
        await cdp.detach();
    }
}
