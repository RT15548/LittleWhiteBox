// Playwright CLI callback; exercises the real components with in-memory map updates only.
async (page) => {
    const report = [];
    const settle = probe => probe.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    async function open(probe, width) {
        await probe.setViewportSize({ width, height: 844 });
        await probe.goto('http://127.0.0.1:8765/output/map-production-check/dist/?scene=world');
        await probe.evaluate(() => {
            const map = window.mapCheck.fixture('utilities');
            const scene = map.scenes.utilities;
            scene.elements = scene.elements.filter(element => ['floor', 'walls', 'player', 'entrance'].includes(element.id));
            const player = scene.elements.find(element => element.id === 'player');
            Object.assign(player, { shape: 'circle', geometry: { x: 380, y: 330, radius: 6 } });
            const entrance = scene.elements.find(element => element.id === 'entrance');
            Object.assign(entrance, { shape: 'rect', geometry: { x: 300, y: 460, width: 40, height: 4 }, rotation: 37 });
            delete entrance.label;
            scene.elements.push({ id: 'wide-cabinet', category: 'furniture', shape: 'rect', icon: 'cabinet', label: '柜子占地', geometry: { x: 100, y: 100, width: 200, height: 200 } });
            window.mapCheck.push(map);
            window.mapCheck.unmount();
        });
        await probe.locator('.map-app').waitFor({ state: 'detached' });
        await probe.evaluate(() => window.mapCheck.mount());
        await probe.locator('canvas').waitFor({ state: 'visible' });
        await probe.waitForLoadState('networkidle');
        await settle(probe);
    }
    for (const width of [1280, 390, 320]) {
        const probe = await page.context().newPage();
        try {
            if (width === 320) await probe.route('**/*.woff2', route => route.abort());
            await open(probe, width);
            const original = await probe.evaluate(() => JSON.stringify(window.mapCheck.map()));
            // Both explicit 2D and emergency fallback must preserve sized semantic markers.
            for (const mode of ['manual', 'context-loss']) {
                if (mode === 'manual') await probe.getByRole('button', { name: '二维', exact: true }).click();
                else await probe.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
                await probe.locator('.map-scene-viewport').waitFor({ state: 'visible' });
                await settle(probe);
                const missing = [];
                for (const id of ['player', 'entrance']) {
                    const glyph = probe.locator(`.map-scene-element[data-element="${id}"] .map-scene-icon`);
                    if (await glyph.count() !== 1 || !await glyph.isVisible()) missing.push(id);
                    else {
                        // DOM geometry excludes the extra 1.5px stroke included by Playwright's SVG box.
                        const circle = await glyph.locator('circle').last().evaluate(node => node.getBoundingClientRect().toJSON());
                        if (Math.abs(circle.width - 22) > 1) missing.push(`${id}: unstable marker size`);
                        if (width === 320 && !await glyph.locator('.map-symbol-fallback').isVisible()) missing.push(`${id}: missing font fallback`);
                    }
                }
                if (await probe.evaluate(() => JSON.stringify(window.mapCheck.map())) !== original) missing.push('map mutated');
                report.push({ check: 'sized-markers', width, mode, missing });
                await probe.screenshot({ path: `output/playwright/map-markers-${width}-${mode}.png` });
                if (mode === 'manual') {
                    await probe.getByRole('button', { name: '三维', exact: true }).click();
                    await probe.locator('canvas').waitFor({ state: 'visible' });
                }
            }
            await open(probe, width);
            const canvas = probe.locator('canvas');
            await canvas.focus();
            await probe.keyboard.press('ArrowRight');
            await probe.keyboard.press('+');
            const box = await canvas.boundingBox();
            await probe.keyboard.down('Shift');
            await probe.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await probe.mouse.down();
            await probe.mouse.move(box.x + box.width / 2 + 15, box.y + box.height / 2 + 10, { steps: 4 });
            await probe.mouse.up();
            await probe.keyboard.up('Shift');
            await settle(probe);
            const anchors = () => probe.locator('.map-3d-anchor').evaluateAll(nodes => nodes.map(node => {
                const box = node.getBoundingClientRect();
                return { id: node.closest('[data-element]').dataset.element, x: box.x, y: box.y };
            }));
            const before = await anchors();
            for (const viewBox of [[0, 0, 1520, 580], [-300, -200, 1700, 1100], [0, 0, 760, 580]]) {
                await probe.evaluate(viewBox => {
                    const map = structuredClone(window.mapCheck.map());
                    map.scenes.utilities.viewBox = viewBox;
                    map.revision++;
                    window.mapCheck.push(map);
                }, viewBox);
                await settle(probe);
                const after = await anchors();
                const drift = Math.max(...before.map(point => {
                    const match = after.find(next => next.id === point.id);
                    return match ? Math.hypot(match.x - point.x, match.y - point.y) : Infinity;
                }));
                report.push({ check: 'expanded-view', width, viewBox, drift });
            }
            await probe.screenshot({ path: `output/playwright/map-occupied-footprint-${width}.png` });
            // Explicit Fit must use the new extents, unlike passive background updates.
            await probe.evaluate(() => {
                const map = structuredClone(window.mapCheck.map());
                map.scenes.utilities.viewBox = [0, 0, 1520, 580];
                map.scenes.utilities.elements.push({ id: 'far-entrance', category: 'door', shape: 'icon', kind: 'entrance', geometry: { x: 1400, y: 330 } });
                map.revision++;
                window.mapCheck.push(map);
            });
            await canvas.focus(); await probe.keyboard.press('Home');
            await settle(probe);
            report.push({ check: 'expanded-fit', width, visible: await probe.locator('.map-3d-label[data-element="far-entrance"]').isVisible() });
        } finally {await probe.close();}
    }
    await page.evaluate(report => {window.mapRegressionReport = report;}, report);
    const failures = report.filter(item => item.missing?.length || item.drift > .5 || item.visible === false);
    if (failures.length) throw Error(JSON.stringify(failures));
}
