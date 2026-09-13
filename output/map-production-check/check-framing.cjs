// Playwright CLI callback: hold the real GLB response while observing the initial camera.
async (page) => {
    const results = [];
    for (const [width, height, moved] of [[1280, 720, false], [1280, 720, true], [390, 844, false], [320, 844, false]]) {
        const probe = await page.context().newPage();
        let heldRoute;
        try {
            await probe.setViewportSize({ width, height });
            let received;
            const requested = new Promise(resolve => {received = resolve;});
            await probe.route('**/lampRoundFloor-*.glb', route => {heldRoute = route; received();});
            await probe.goto('http://127.0.0.1:8765/output/map-production-check/dist/?scene=world');
            await probe.evaluate(() => {
                const map = window.mapCheck.fixture('utilities');
                const scene = map.scenes.utilities;
                scene.elements = scene.elements.filter(element => ['floor', 'player', 'entrance'].includes(element.id));
                scene.elements.push({ id: 'corner-lamp', category: 'decoration', shape: 'circle', icon: 'light', label: '角落落地灯', geometry: { x: 65, y: 75, radius: 14 } });
                window.mapCheck.push(map);
                window.mapCheck.unmount();
            });
            await probe.locator('.map-app').waitFor({ state: 'detached' });
            await probe.evaluate(() => window.mapCheck.mount());
            const canvas = probe.locator('canvas');
            await canvas.waitFor({ state: 'visible' });
            await Promise.race([requested, probe.waitForTimeout(5000).then(() => {throw Error('The scene did not request its lamp model');})]);
            const original = await probe.evaluate(() => JSON.stringify(window.mapCheck.map()));
            const settle = () => probe.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            await settle();
            if (moved) {
                await canvas.focus();
                await probe.keyboard.press('ArrowRight');
                await probe.keyboard.press('+');
                const box = await canvas.boundingBox();
                await probe.keyboard.down('Shift');
                await probe.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await probe.mouse.down();
                await probe.mouse.move(box.x + box.width / 2 + 35, box.y + box.height / 2 + 20, { steps: 4 });
                await probe.mouse.up();
                await probe.keyboard.up('Shift');
                await settle();
            }
            const anchors = () => probe.locator('.map-3d-anchor').evaluateAll(nodes => nodes.map(node => {
                const rect = node.getBoundingClientRect();
                return { x: rect.x, y: rect.y };
            }));
            const before = await anchors();
            if (before.length !== 2) throw Error('Player and entrance anchors are required to observe the view');
            const lamp = probe.locator('.map-3d-label[data-element="corner-lamp"]');
            const beforeLamp = await lamp.boundingBox();
            await heldRoute.continue(); heldRoute = undefined;
            await probe.waitForLoadState('networkidle');
            await settle();
            const after = await anchors();
            if (after.length !== before.length || after.some((point, index) => Math.hypot(point.x - before[index].x, point.y - before[index].y) > .5)) {
                throw Error(`Model arrival moved the ${moved ? 'user-adjusted' : 'initial'} view`);
            }
            if (!moved) {
                if (!await lamp.isVisible()) throw Error(`Loaded lamp label was clipped at ${width}px without pressing Fit`);
                const bounds = await canvas.boundingBox(), label = await lamp.boundingBox();
                if (label.y < bounds.y || label.y + label.height > bounds.y + bounds.height || label.x < bounds.x || label.x + label.width > bounds.x + bounds.width) {
                    throw Error('Lamp label escaped the initial viewport');
                }
                if (beforeLamp.y - label.y < 8) throw Error('The real tall model did not replace its low placeholder');
            }
            if (await probe.evaluate(() => JSON.stringify(window.mapCheck.map())) !== original) throw Error('Framing changed map facts');
            await probe.screenshot({ path: `output/playwright/map-framing-${width}-${moved ? 'user-view' : 'initial'}.png` });
            results.push({ width, height, moved, unchangedView: true });
        } finally {
            if (heldRoute) await heldRoute.abort().catch(() => {});
            await probe.close();
        }
    }
    await page.evaluate(results => {window.mapFramingReport = results;}, results);
}
