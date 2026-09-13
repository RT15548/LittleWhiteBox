// Playwright CLI callback; real MapApp fixtures, no production diagnostics API.
async (page) => {
    const errors = [], downloads = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {if (response.url().endsWith('.glb')) downloads.push({ url: response.url(), status: response.status() });});
    await page.addInitScript(() => {
        const stats = { draws: 0, triangles: 0, buffers: 0, textures: 0, programs: 0, vaos: 0, lost: 0 };
        window.mapGpuCheck = stats;
        window.mapFrameCheck = [];
        const schedule = window.requestAnimationFrame;
        window.requestAnimationFrame = callback => schedule(time => {
            const before = stats.draws, start = performance.now();
            callback(time);
            if (stats.draws > before) window.mapFrameCheck.push({ ms: performance.now() - start, draws: stats.draws - before });
        });
        const proto = WebGL2RenderingContext.prototype, contexts = new WeakMap();
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (...args) {
            const context = getContext.apply(this, args);
            if (args[0] === 'webgl2' && context && !contexts.has(context)) {
                const ledger = { buffers: new Set(), textures: new Set(), programs: new Set(), vaos: new Set() };
                contexts.set(context, ledger);
                this.addEventListener('webglcontextlost', () => {
                    if (!context.isContextLost()) throw Error('Expected actual lost GPU context');
                    stats.lost++;
                    for (const key of Object.keys(ledger)) {stats[key] -= ledger[key].size; ledger[key].clear();}
                });
            }
            return context;
        };
        for (const [suffix, key] of [['Buffer', 'buffers'], ['Texture', 'textures'], ['Program', 'programs'], ['VertexArray', 'vaos']]) {
            const create = proto['create' + suffix], remove = proto['delete' + suffix];
            proto['create' + suffix] = function (...args) { const result = create.apply(this, args); if (result) {contexts.get(this)[key].add(result); stats[key]++;} return result; };
            proto['delete' + suffix] = function (value) {if (value && contexts.get(this)[key].delete(value)) stats[key]--; return remove.call(this, value);};
        }
        for (const method of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
            const original = proto[method];
            proto[method] = function (...args) {
                stats.draws++;
                if (args[0] === this.TRIANGLES) stats.triangles += (method.includes('Arrays') ? args[2] : args[1]) / 3 * (method.endsWith('Instanced') ? args.at(-1) : 1);
                return original.apply(this, args);
            };
        }
    });
    await page.goto('http://127.0.0.1:8765/output/map-production-check/dist/?scene=world');
    await page.getByRole('button', { name: '世界地图', exact: true }).waitFor();
    await page.waitForTimeout(250);
    if (downloads.length || await page.locator('canvas').count()) throw Error('World view downloaded models or opened WebGL');
    const settle = async () => {
        await page.locator('canvas').waitFor({ state: 'visible' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(150);
    };
    const stats = () => page.evaluate(() => ({ ...window.mapGpuCheck }));
    const reports = [];
    for (const key of ['tavern', 'valley', 'cabin', 'guesthouse', 'utilities', 'workshop', 'courtyard']) {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.getByRole('combobox', { name: '测试场景' }).selectOption(key);
        await settle();
        const lowWalls = page.getByRole('button', { name: '低墙', exact: true });
        if (await lowWalls.getAttribute('aria-pressed') !== 'false') throw Error(`${key} opened with low walls enabled`);
        const original = await page.evaluate(() => JSON.stringify(window.mapCheck.map()));
        const before = await stats();
        await page.getByRole('button', { name: '重置三维视角' }).click();
        await page.waitForTimeout(100);
        const frame = await stats();
        await page.screenshot({ path: `output/playwright/map-37-${key}-desktop.png` });
        await page.getByRole('button', { name: '名称', exact: true }).click();
        if (!await page.getByRole('img', { name: '小白', exact: true }).isVisible()) throw Error('Hiding captions removed the player marker');
        if (key === 'courtyard') await page.screenshot({ path: 'output/playwright/map-37-courtyard-no-labels.png' });
        await page.getByRole('button', { name: '名称', exact: true }).click();
        if (key === 'utilities') await page.screenshot({ path: 'output/playwright/map-37-utilities-full-walls.png' });
        await lowWalls.click();
        if (await lowWalls.getAttribute('aria-pressed') !== 'true') throw Error('Low walls did not enable');
        if (key === 'utilities') await page.screenshot({ path: 'output/playwright/map-37-utilities-low-walls.png' });
        await lowWalls.click();
        if (await lowWalls.getAttribute('aria-pressed') !== 'false') throw Error('Full walls did not restore');
        for (const width of [390, 320]) {
            await page.setViewportSize({ width, height: 844 });
            await page.waitForTimeout(100);
            if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`${key} overflows at ${width}px`);
            await page.screenshot({ path: `output/playwright/map-37-${key}-${width}.png` });
        }
        await page.getByRole('button', { name: '主题', exact: true }).click();
        await page.waitForTimeout(100);
        await page.screenshot({ path: `output/playwright/map-37-${key}-320-dark.png` });
        const requestCount = downloads.length;
        await page.getByRole('button', { name: '二维', exact: true }).click();
        await page.locator('canvas').waitFor({ state: 'detached' });
        await page.waitForTimeout(100);
        await page.screenshot({ path: `output/playwright/map-37-${key}-2d.png` });
        if (downloads.length !== requestCount) throw Error('2D requested a model');
        const released = await stats();
        if (released.buffers || released.textures || released.programs || released.vaos) throw Error('GPU resources survived 2D switch: ' + JSON.stringify(released));
        if (await page.evaluate(() => JSON.stringify(window.mapCheck.map())) !== original) throw Error('View changes modified map facts');
        reports.push({ scene: key, drawsPerFrame: frame.draws - before.draws, trianglesPerFrame: frame.triangles - before.triangles, released });
        await page.getByRole('button', { name: '主题', exact: true }).click();
    }
    // Real maximum-size scene: 128 repeated chairs, then varied objects and a 64-point open fence.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('combobox', { name: '测试场景' }).selectOption('guesthouse');
    await settle();
    for (const mixed of [false, true]) {
        await page.evaluate(mixed => {
            const map = window.mapCheck.fixture('guesthouse'), scene = map.scenes.guesthouse;
            const fixtures = ['guesthouse', 'utilities', 'workshop', 'courtyard'].flatMap(key => window.mapCheck.fixture(key).scenes[key].elements);
            const pool = fixtures.filter(e => e.shape === 'rect' && e.icon && (mixed || e.icon === 'chair') && e.category !== 'door');
            scene.viewBox = [0, 0, 1000, 1000];
            scene.elements = Array.from({ length: mixed ? 127 : 128 }, (_, i) => {
                const element = pool[i % pool.length], scale = 55 / Math.max(element.geometry.width, element.geometry.height);
                return { ...element, id: 'stress-' + i, label: '物件-' + i, geometry: { x: (i % 12) * 80 + 20, y: Math.floor(i / 12) * 80 + 20, width: element.geometry.width * scale, height: element.geometry.height * scale } };
            });
            if (mixed) scene.elements.push({ id: 'long-fence', shape: 'path', category: 'decoration', icon: 'fence', closed: false, geometry: { points: Array.from({ length: 64 }, (_, i) => [10 + i * 15, 970 - (i % 2) * 20]) } });
            window.mapCheck.push(map);
        }, mixed);
        await settle();
        // Network idle can precede the final GLB decode and scene replacement.
        let idle;
        for (let attempt = 0; attempt < 20; attempt++) {
            idle = await stats();
            await page.waitForTimeout(300);
            if ((await stats()).draws === idle.draws) break;
            if (attempt === 19) throw Error('Stationary scene is drawing continuously');
        }
        await page.waitForTimeout(400);
        if ((await stats()).draws !== idle.draws) throw Error('Stationary scene resumed drawing');
        await page.evaluate(() => {window.mapFrameCheck = [];});
        const start = Date.now();
        await page.locator('canvas').focus();
        for (let i = 0; i < 20; i++) {
            await page.keyboard.press('ArrowRight');
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        }
        await page.waitForTimeout(100);
        const moved = await stats();
        reports.push({ stress: mixed ? 'mixed-127-plus-fence64' : 'chairs-128', totalDrawsDuring20Keys: moved.draws - idle.draws, elapsedMs: Date.now() - start, frameCallbacks: await page.evaluate(() => window.mapFrameCheck), live: moved });
        await page.screenshot({ path: `output/playwright/map-37-stress-${mixed ? 'mixed' : 'chairs'}.png` });
    }
    await page.evaluate(() => window.mapCheck.unmount());
    await page.locator('canvas').waitFor({ state: 'detached' });
    await page.waitForTimeout(100);
    const final = await stats();
    if (final.buffers || final.textures || final.programs || final.vaos) throw Error('Resources survived unmount: ' + JSON.stringify(final));
    if (errors.length || downloads.some(row => row.status !== 200)) throw Error(JSON.stringify({ errors, downloads }));
    await page.evaluate(report => {window.mapObjectReport = report;}, { reports, uniqueAssets: new Set(downloads.map(row => row.url)).size, downloads: downloads.length, final });
}
