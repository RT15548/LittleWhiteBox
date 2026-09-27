// CLI callback: real MapApp + in-memory bridge; assertions target scope, navigation and data safety.
async (page) => {
    const report = [];
    const base = 'http://127.0.0.1:8765/output/map-production-check/dist/?scene=regions';
    const check = (condition, detail) => { if (!condition) throw new Error(detail); };
    const same = (actual, expected, detail) => check(JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort()), detail + ': ' + JSON.stringify(actual));
    const names = (map, keys) => keys.map(key => map.atlas.locations.find(place => place.key === key).name);
    const markers = () => page.locator('.map-place .map-place-name').allTextContents();
    const results = () => page.locator('.map-search-result strong').allTextContents();
    const tab = index => page.locator('.map-view-switch button').nth(index);
    const back = async () => { await page.evaluate(() => window.mapCheck.back()); };
    const pressed = async index => check(await tab(index).getAttribute('aria-pressed') === 'true', `wrong active map level: expected ${index}; ` + await page.locator('.map-view-switch').innerText());
    const openBanner = async () => { await page.locator('.map-region-card').click(); await page.locator('.map-search-dialog').waitFor(); };
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    for (const width of [1280, 390, 320]) {
        for (const dark of [false, true]) {
            await page.setViewportSize({ width, height: 844 });
            await page.goto(base);
            if (dark) await page.locator('.check-controls button').nth(0).click();
            const map = await page.evaluate(() => window.mapCheck.map());
            const original = JSON.stringify(map);
            const worldNames = names(map, ['harbor', 'mountains', 'islands']);
            const sceneNames = names(map, Array.from({ length: 10 }, (_, i) => `harbor-${i}`));
            await pressed(0);
            same(await markers(), worldNames, 'world leaked scenes');
            const worldBanner = await page.locator('.map-region-summary').innerText();
            if (width !== 1280) await page.screenshot({ path: `output/playwright/map-regions-${width}-${dark ? 'dark' : 'light'}-world.png` });
            await openBanner();
            same(await results(), names(map, ['mountains', 'islands']), 'world banner opened a different set');
            check(await page.locator('.map-search-filters button').nth(1).getAttribute('aria-pressed') === 'true', 'banner did not carry its filter');
            await page.locator('.map-search-filters button').nth(0).click();
            same(await results(), worldNames, 'world all-filter crossed levels');
            await page.locator('.map-search-input input').fill(sceneNames[0]);
            check(await page.locator('.map-search-result').count() === 0, 'world search found a scene');
            await back();
            await page.locator('.map-search-dialog').waitFor({ state: 'detached' });

            await tab(1).click();
            await pressed(1);
            same(await markers(), sceneNames, 'current region has the wrong scenes');
            const regionBanner = await page.locator('.map-region-summary').innerText();
            await openBanner();
            same(await results(), sceneNames.slice(5), 'region banner opened a different set');
            if (width !== 1280) await page.screenshot({ path: `output/playwright/map-regions-${width}-${dark ? 'dark' : 'light'}-list.png` });
            await page.locator('.map-search-filters button').nth(0).click();
            same(await results(), sceneNames, 'region all-filter crossed regions');
            await page.locator('.map-search-input input').fill(worldNames[1]);
            check(await page.locator('.map-search-result').count() === 0, 'region search found another region');
            await back();
            await page.locator('.map-search-dialog').waitFor({ state: 'detached' });
            if (width === 390 && !dark) await page.screenshot({ path: 'output/playwright/map-regions-390-region.png' });

            // Select a recorded scene without a layout, then return to its owning region.
            await page.locator('.map-search-entry').click();
            same(await results(), sceneNames, 'header search did not start with the whole local scope');
            await page.locator('.map-search-result').filter({ hasText: sceneNames[5] }).click();
            await page.locator('.map-place-actions button').click();
            await pressed(2);
            check(await page.locator('.map-empty').isVisible(), 'unpainted scene has no empty state');
            const remote = await page.locator('.map-empty').innerText();
            check(await page.locator('.map-empty button').count() === 1, 'remote empty scene has ambiguous actions');
            await page.locator('.map-empty button').click();
            await pressed(1);
            same(await markers(), sceneNames, 'remote empty action did not return to its region');
            await tab(2).click();
            check(await page.locator('.map-empty button').isEnabled(), 'current empty scene lost its explicit update action');
            check(await page.locator('.map-empty').innerText() !== remote, 'current and remote empty scenes promise the same action');
            await back();
            await pressed(1);
            same(await markers(), sceneNames, 'scene back lost its region');

            // An empty region has a usable entry and never inherits the current region's scenes.
            await tab(0).click();
            await pressed(0);
            await page.getByRole('button', { name: `查看${worldNames[1]}`, exact: true }).click();
            await page.locator('.map-place-actions button').click();
            await pressed(1);
            check(await page.locator('.map-empty').isVisible(), 'empty region was not opened');
            await openBanner();
            check(await page.locator('.map-search-result').count() === 0, 'empty region borrowed scenes');
            await back();
            await tab(1).click();
            same(await markers(), sceneNames, 'current region shortcut kept another region');
            await back();
            await pressed(0);
            await tab(2).click();
            await pressed(2);
            await back();
            await pressed(1);

            const bounds = await page.locator('.map-app').evaluate(root => ({
                overflow: root.scrollWidth - root.clientWidth,
                tabs: [...root.querySelectorAll('.map-view-switch button')].map(node => ({ top: node.getBoundingClientRect().top, width: node.clientWidth, height: node.clientHeight })),
            }));
            check(bounds.overflow <= 1, 'map overflowed its viewport');
            check(bounds.tabs.every(rect => rect.width >= 75 && rect.height >= 36 && rect.top === bounds.tabs[0].top), 'three-level tabs are clipped or split');
            check(await page.evaluate(() => JSON.stringify(window.mapCheck.map())) === original, 'navigation mutated the map');
            check(await page.evaluate(() => window.mapCheck.requests.length) === 0, 'navigation called the host');

            // Region-only positions must locate the region itself, even if it has no child scenes.
            for (const locationKey of ['harbor', 'islands']) {
                await page.evaluate(key => {
                    const next = window.mapCheck.map();
                    next.atlas.actors.find(actor => actor.actorKey === 'player').locationKey = key;
                    window.mapCheck.push(next);
                }, locationKey);
                const positioned = await page.evaluate(() => JSON.stringify(window.mapCheck.map()));
                for (const from of [0, 1]) {
                    await tab(from).click();
                    await page.getByRole('button', { name: '回到我的位置', exact: true }).click();
                    await settle();
                    await pressed(0);
                    same(await page.locator('.map-place.is-current.is-selected .map-place-name').allTextContents(), names(map, [locationKey]), 'region-level locate lost its selected current marker');
                    const visible = await page.locator('.map-place.is-current').evaluate(node => {
                        const point = new DOMPoint(0, 0).matrixTransform(node.getScreenCTM());
                        const viewport = node.ownerSVGElement.getBoundingClientRect();
                        return point.x > viewport.left && point.x < viewport.right && point.y > viewport.top && point.y < viewport.bottom;
                    });
                    check(visible, 'located region was outside the visible viewport');
                    check(await page.evaluate(() => JSON.stringify(window.mapCheck.map())) === positioned, 'locating a region moved the player or changed the map');
                }
                if (width === 390 && locationKey === 'harbor') await page.screenshot({ path: `output/playwright/map-regions-locate-${dark ? 'dark' : 'light'}.png` });
            }
            await page.evaluate(initial => window.mapCheck.push(initial), map);
            await tab(0).click();
            await page.getByRole('button', { name: '回到我的位置', exact: true }).click();
            await pressed(1);
            same(await page.locator('.map-place.is-current.is-selected .map-place-name').allTextContents(), names(map, ['harbor-0']), 'concrete-place locate did not enter its region');
            check(await page.evaluate(() => JSON.stringify(window.mapCheck.map())) === original, 'locating a concrete place changed the map');
            check(await page.evaluate(() => window.mapCheck.requests.length) === 0, 'locating called the host');
            report.push({ width, dark, worldBanner, regionBanner, bounds, regionAndPlaceLocate: true, passed: true });
        }
    }

    // Same-name scenes elsewhere must remain outside local search; player-following updates its scope.
    await page.goto(base);
    await tab(1).click();
    await page.evaluate(() => {
        const map = window.mapCheck.map();
        map.atlas.locations.push({ key: 'other-scene', name: map.atlas.locations.find(place => place.key === 'harbor-0').name, scale: 'building', status: 'visited', parent: 'mountains' });
        window.mapCheck.push(map);
    });
    await page.locator('.map-search-entry').click();
    await page.locator('.map-search-input input').fill((await page.evaluate(() => window.mapCheck.map().atlas.locations.find(place => place.key === 'harbor-0').name)));
    check(await page.locator('.map-search-result').count() === 1, 'same-name scene from another region leaked');
    await page.evaluate(() => {
        const map = window.mapCheck.map(); map.atlas.actors[0].locationKey = 'other-scene'; window.mapCheck.push(map);
    });
    await page.locator('.map-search-dialog').waitFor({ state: 'detached' });
    check(await page.locator('.map-place').count() === 1, 'current region did not follow player movement');
    await openBanner();
    check(await page.locator('.map-search-result').count() === 1, 'all-visited region did not open its local list');
    await back();

    // Active scenes and chats without region data keep their explicit scene/unknown-region boundaries.
    // A different chat is activated by remounting; foreign pushed states are deliberately ignored by the bridge.
    await page.locator('.check-controls select').selectOption('tavern');
    await pressed(2);
    await page.locator('canvas').waitFor();
    await settle();
    await page.evaluate(() => {
        const map = window.mapCheck.map();
        map.atlas.locations = map.atlas.locations.filter(place => place.scale !== 'region');
        for (const place of map.atlas.locations) delete place.parent;
        window.mapCheck.push(map);
    });
    await tab(0).click();
    check(await page.locator('.map-place').count() === 0, 'standalone scene appeared as a world region');
    await tab(1).click();
    check(await page.locator('.map-empty').isVisible(), 'missing region had no explicit empty state');
    await openBanner();
    check(await page.locator('.map-search-result').count() === 0, 'unknown region fell back to global scenes');
    await back();
    await page.locator('.check-controls select').selectOption('regions');
    await pressed(0);
    check(await page.locator('.map-place').count() === 3, 'chat switch retained an old browse target');
    check(await page.evaluate(() => window.mapCheck.requests.length) === 0, 'browse lifecycle called the host');
    report.push({ lifecycle: 'same-name isolation, player movement, missing region, active scene, chat switch', passed: true });

    // Long names, keyboard dismissal, live scope updates and failure notices use the same list boundary.
    await page.setViewportSize({ width: 320, height: 640 });
    await page.evaluate(() => {
        const map = window.mapCheck.map();
        map.atlas.locations.find(place => place.key === 'harbor').name = '旧港沿海地区'.repeat(20);
        window.mapCheck.push(map);
    });
    await tab(1).click();
    const longBounds = await page.locator('.map-app').evaluate(root => ({
        overflow: root.scrollWidth - root.clientWidth,
        top: root.querySelector('.map-top').getBoundingClientRect().bottom,
        canvas: root.querySelector('.map-canvas').getBoundingClientRect().top,
        canvasHeight: root.querySelector('.map-canvas').clientHeight,
    }));
    check(longBounds.overflow <= 1 && longBounds.canvasHeight >= 180, 'long region name crowded out its map');
    await page.locator('.map-region-card').focus();
    await page.keyboard.press('Enter');
    await page.locator('.map-search-dialog').waitFor();
    check(await page.locator('.map-search-result').count() === 5, 'keyboard banner action lost scope');
    await page.evaluate(() => window.mapCheck.push(window.mapCheck.map(), { maintenanceStatus: 'maintaining' }));
    await page.evaluate(() => {
        const map = window.mapCheck.map(); map.atlas.locations.find(place => place.key === 'harbor-5').status = 'visited';
        window.mapCheck.push(map, { maintenanceStatus: 'error', maintenanceMessage: 'fixture-maintenance-failure' });
    });
    check(await page.locator('.map-search-result').count() === 4, 'live visit change widened or froze the list');
    check(await page.locator('.map-search-results').evaluate(node => node.clientHeight) >= 100, 'long scope name hid the results');
    await page.keyboard.press('Escape');
    await page.locator('.map-search-dialog').waitFor({ state: 'detached' });
    check(await page.locator('.map-region-card').evaluate(node => node === document.activeElement), 'dialog did not return keyboard focus');
    check(await page.locator('.map-notice.is-error').isVisible(), 'maintenance failure disappeared during browsing');
    check(await page.evaluate(() => window.mapCheck.requests.length) === 0, 'keyboard browsing called the host');
    report.push({ longNamesAndLiveUpdates: true, longBounds, passed: true });

    // A legal region key matching the world level must still enter its own coordinate frame.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    await page.evaluate(() => {
        const map = window.mapCheck.map();
        map.atlas.locations = map.atlas.locations.filter(place => place.scale !== 'world');
        for (const place of map.atlas.locations) {
            if (place.scale === 'region') {
                delete place.parent;
                place.position = [place.position[0] + 6000, place.position[1] + 5000];
            } else if (place.parent === 'harbor') { place.parent = 'world'; }
            if (place.key === 'harbor') place.key = 'world';
        }
        window.mapCheck.push(map);
    });
    await page.locator('.map-fit').click();
    const worldBox = await page.locator('.map-viewport-svg').getAttribute('viewBox');
    await tab(1).click();
    const localBox = await page.locator('.map-viewport-svg').getAttribute('viewBox');
    check(worldBox !== localBox, 'world-named region retained the world viewport');
    const visibleNodes = await page.locator('.map-viewport-svg').evaluate(svg => {
        const box = svg.viewBox.baseVal;
        return [...svg.querySelectorAll('.map-place')].filter(node => {
            const matrix = node.transform.baseVal.consolidate().matrix;
            return matrix.e >= box.x && matrix.e <= box.x + box.width && matrix.f >= box.y && matrix.f <= box.y + box.height;
        }).length;
    });
    check(visibleNodes === 10, 'region scene coordinates were left outside the viewport');
    await page.screenshot({ path: 'output/playwright/map-regions-fixed-world-key.png' });
    await tab(0).click();
    const positions = await page.locator('.map-place').evaluateAll(nodes => nodes.map(node => ({
        name: node.querySelector('.map-place-name').textContent,
        x: node.transform.baseVal.consolidate().matrix.e,
        y: node.transform.baseVal.consolidate().matrix.f,
    })));
    await page.evaluate(() => {
        const map = window.mapCheck.map();
        map.atlas.locations.push({ key: 'inner-region', name: 'Inner', scale: 'region', status: 'mentioned', parent: 'world', position: [10, 20] });
        window.mapCheck.push(map);
    });
    const nestedPositions = await page.locator('.map-place').evaluateAll(nodes => nodes.map(node => ({
        name: node.querySelector('.map-place-name').textContent,
        x: node.transform.baseVal.consolidate().matrix.e,
        y: node.transform.baseVal.consolidate().matrix.f,
    })));
    check(positions.every(position => nestedPositions.some(next => JSON.stringify(next) === JSON.stringify(position))), 'nested region moved authored outer coordinates');
    check(await page.evaluate(() => window.mapCheck.requests.length) === 0, 'boundary navigation called the host');
    report.push({ worldKeyRegion: true, visibleNodes, nestedCoordinatesStable: true, passed: true });
    await page.evaluate(result => { window.mapRegionReport = result; }, report);
    return report;
}
