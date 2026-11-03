// Actual SillyTavern Generate/event/save pipeline and production drawing UI.
// Only model/image HTTP responses and provider settings are simulated.
async (page) => {
    await page.route('**/api/backends/kobold/generate', async route => {
        const state = await page.evaluate(() => ({ source: window.__accept.source, streaming: window.__accept.streaming }));
        if (state.streaming) await route.continue({ url: 'http://127.0.0.1:51962/text?text=' + encodeURIComponent(state.source) });
        else await route.fulfill({ json: { results: [{ text: state.source }] } });
    });
    const imageResponse = async route => {
        const state = await page.evaluate(() => {
            window.__accept.submissions++;
            return { provider: window.__accept.provider, hold: window.__accept.hold };
        });
        if (state.hold) {
            try { await page.waitForFunction(() => !window.__accept.hold); }
            catch { await route.abort(); return; }
        }
        const path = route.request().url().split('supplier.invalid')[1] || '/generate';
        const response = await route.fetch({ url: `http://127.0.0.1:51962/supplier?provider=${state.provider}&path=${encodeURIComponent(path)}`,
            method: 'GET', postData: undefined });
        await route.fulfill({ response });
    };
    await page.route('**/api/sd/generate', imageResponse);
    await page.route('https://supplier.invalid/**', async route => {
        if (route.request().method() === 'POST') return imageResponse(route);
        const state = await page.evaluate(() => window.__accept.provider);
        const response = await route.fetch({ url: `http://127.0.0.1:51962/supplier?provider=${state}&path=${encodeURIComponent(route.request().url())}` });
        await route.fulfill({ response });
    });
    await page.evaluate(async () => {
        const host = await import('/script.js');
        const kai = await import('/scripts/kai-settings.js');
        const acceptance = window.__accept = { provider: 'sdwebui', submissions: 0, hold: true, streaming: true,
            source: '日光下的河岸。 [img: riverside] and 花朵的近景。 [img: flowers]', rows: [], events: [] };
        acceptance.load = async provider => {
            if (acceptance.api) {
                acceptance.api.cleanupChatMessageImages();
                await acceptance.api[acceptance.cleanup]();
            }
            acceptance.provider = provider;
            // eslint-disable-next-line no-unsanitized/method -- Local fixture enumerates the three bundled production adapters.
            const api = acceptance.api = await import('/_fixture/provider?provider=' + provider);
            const title = { sdwebui: 'Sd', comfyui: 'Comfy', novelai: 'Novel' }[provider];
            acceptance.cleanup = 'cleanup' + title + 'Draw';
            const settings = await (await fetch('http://127.0.0.1:51962/settings?provider=' + provider)).json();
            api.configureFixtureSettings(settings);
            window.xiaobaixDraw = { getStatus: () => ({ enabled: true, ready: true }), getProvider: () => provider };
            if (!await api['init' + title + 'Draw']()) throw new Error('Provider initialization failed');
            api.initChatMessageImages();
        };
        for (const key of ['GENERATION_STARTED', 'GENERATION_AFTER_COMMANDS', 'GENERATE_AFTER_DATA', 'MESSAGE_RECEIVED']) {
            host.eventSource.on(host.event_types[key], (...args) => acceptance.events.push({ key, type: args[1] ?? args[0] }));
        }
        host.changeMainAPI('kobold');
        kai.kai_flags.can_use_streaming = true;
        acceptance.generate = async (type = 'normal') => {
            host.setOnlineStatus('fixture');
            kai.kai_settings.streaming_kobold = acceptance.streaming;
            await host.Generate(type);
        };
        await acceptance.load('sdwebui');
        acceptance.operation = acceptance.generate();
    });
    await page.waitForFunction(() => document.querySelector('[data-xb-draw-tag="streaming"]'));
    await page.screenshot({ path: 'output/playwright/img-clean-real-streaming.png' });
    await page.evaluate(() => window.__accept.operation);
    await page.waitForFunction(() => window.__accept.submissions > 0);
    await page.screenshot({ path: 'output/playwright/img-clean-real-pending.png' });
    await page.evaluate(() => { window.__accept.hold = false; });
    await page.waitForFunction(() => !window.__accept.api.isGenerating());
    await page.waitForFunction(() => [...document.querySelectorAll('#chat .mes:last-child .xb-nd-img img')]
        .filter(img => img.complete && img.naturalWidth > 0).length === 2);
    await page.screenshot({ path: 'output/playwright/img-clean-real-success.png' });
    await page.evaluate(() => window.__accept.rows.push({ provider: 'sdwebui', streaming: true,
        submissions: window.__accept.submissions, images: document.querySelectorAll('#chat .mes:last-child .xb-nd-img img').length }));
}
