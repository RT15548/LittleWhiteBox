// Playwright CLI callback. Each injected fault has a fresh page/APP lifetime.
async (page) => {
    const base = 'http://127.0.0.1:8765/output/map-production-check/dist/?scene=';
    const results = [];
    async function check(name, run) {
        const probe = await page.context().newPage();
        try {await run(probe); results.push(name);} finally {await probe.close();}
    }
    async function ready(probe) {
        await probe.locator('canvas').waitFor({ state: 'visible' });
        await probe.waitForLoadState('networkidle');
    }
    async function fallback(probe) {
        await probe.locator('button[aria-pressed="true"]').filter({ hasText: /^二维$/ }).waitFor();
        if (!await probe.getByRole('button', { name: '三维', exact: true }).isDisabled()) throw Error('3D can retry within the failed APP lifetime');
        if (await probe.locator('canvas').count()) throw Error('Fallback left a canvas');
        const original = await probe.evaluate(() => JSON.stringify(window.mapCheck.map()));
        await probe.getByRole('button', { name: '世界地图', exact: true }).click();
        await probe.getByRole('button', { name: '当前场景', exact: true }).click();
        if (!await probe.getByRole('button', { name: '三维', exact: true }).isDisabled()) throw Error('Scene navigation reset a failed lifetime');
        if (await probe.evaluate(() => JSON.stringify(window.mapCheck.map())) !== original) throw Error('Fallback changed map facts');
    }
    for (const kind of ['404', 'decode']) await check('asset-' + kind, async probe => {
        let requests = 0;
        await probe.route('**/*.glb', route => {requests++; return route.fulfill({ status: kind === '404' ? 404 : 200, contentType: 'model/gltf-binary', body: 'not-a-glb' });});
        await probe.goto(base + 'utilities'); await ready(probe);
        const initialRequests = requests;
        if (!initialRequests) throw Error('No asset fault was exercised');
        const original = await probe.evaluate(() => JSON.stringify(window.mapCheck.map()));
        await probe.getByRole('button', { name: '主题', exact: true }).click();
        await probe.evaluate(() => window.mapCheck.push(window.mapCheck.map()));
        await probe.waitForTimeout(300);
        if (requests !== initialRequests || await probe.locator('canvas').count() !== 1) throw Error('Single-model failure looped or disabled all 3D');
        if (await probe.evaluate(() => JSON.stringify(window.mapCheck.map())) !== original) throw Error('Asset failure changed facts');
        await probe.screenshot({ path: 'output/playwright/map-37-asset-' + kind + '.png' });
    });
    await check('late-assets-after-scene-switch-and-unmount', async probe => {
        const pending = [];
        await probe.route('**/*.glb', route => new Promise(resolve => pending.push({ route, resolve })));
        await probe.goto(base + 'guesthouse');
        await probe.locator('canvas').waitFor({ state: 'visible' });
        await probe.waitForTimeout(200);
        if (!pending.length) throw Error('No pending models');
        await probe.evaluate(() => window.mapCheck.push(window.mapCheck.fixture('workshop')));
        await probe.waitForTimeout(100);
        await probe.evaluate(() => window.mapCheck.unmount());
        for (const item of pending) {await item.route.fulfill({ status: 200, body: 'late-invalid-data' }).catch(() => {}); item.resolve();}
        await probe.waitForTimeout(200);
        if (await probe.locator('canvas, .map-3d-label').count()) throw Error('Late model revived an unmounted scene');
        await probe.evaluate(() => window.mapCheck.mount());
        await probe.locator('canvas').waitFor({ state: 'visible' });
        await probe.evaluate(() => window.mapCheck.unmount());
        for (const item of pending) {await item.route.abort().catch(() => {}); item.resolve();}
    });
    await check('webgl-unavailable', async probe => {
        await probe.addInitScript(() => {
            const original = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {return kind === 'webgl2' ? null : original.call(this, kind, ...rest);};
        });
        await probe.goto(base + 'courtyard'); await fallback(probe);
        await probe.setViewportSize({ width: 320, height: 844 });
        await probe.screenshot({ path: 'output/playwright/map-37-webgl-fallback.png' });
    });
    await check('context-loss', async probe => {
        await probe.goto(base + 'workshop'); await ready(probe);
        await probe.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
        await fallback(probe);
        await probe.getByRole('button', { name: '重新打开', exact: true }).click();
        await ready(probe);
    });
    await check('render-exception', async probe => {
        await probe.goto(base + 'guesthouse'); await ready(probe);
        await probe.evaluate(() => {WebGL2RenderingContext.prototype.drawArraysInstanced = () => {throw Error('Injected draw failure');};});
        await probe.getByRole('button', { name: '重置三维视角' }).click();
        await fallback(probe);
    });
    await check('font-fallback-and-2d', async probe => {
        await probe.route('**/*.woff2', route => route.abort());
        await probe.goto(base + 'utilities'); await ready(probe);
        await probe.getByRole('button', { name: '二维', exact: true }).click();
        await probe.setViewportSize({ width: 320, height: 844 });
        const element = probe.locator('[data-element="bathtub"]');
        if (await element.locator('.map-symbol-fallback').textContent() !== '浴缸') throw Error('Missing 2D text fallback');
        await probe.screenshot({ path: 'output/playwright/map-37-font-fallback.png' });
    });
    await page.evaluate(results => {window.mapFailureReport = results;}, results);
}
