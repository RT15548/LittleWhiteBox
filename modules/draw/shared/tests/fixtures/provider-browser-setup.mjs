// playwright-cli run-code --filename=...; only the disposable profile is used.
async (page) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await page.route('**/api/extensions/discover', route => route.fulfill({ json: [] }));
    await page.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:') ? route.fallback() : route.abort());
    await page.route('**/api/sd/**', route => route.abort());
    await page.route('**/api/backends/kobold/generate', route => route.abort());
    await page.route('**/_fixture/provider?*', async route => {
        const provider = route.request().url().split('provider=')[1];
        const response = await route.fetch({ url: `http://127.0.0.1:51962/bundle?provider=${provider}` });
        await route.fulfill({ response });
    });
    await page.goto('http://127.0.0.1:51961/');
    await page.waitForFunction(() => window.SillyTavern?.getContext().chat);
    await page.waitForFunction(async () => Array.isArray((await import('/scripts/world-info.js')).world_names));
    console.log(await page.evaluate(async () => {
        const host = await import('/script.js');
        if (!host.characters.some(item => item.name === 'Image acceptance')) {
            const form = new FormData();
            form.set('ch_name', 'Image acceptance');
            form.set('first_mes', 'A quiet riverside.');
            const headers = host.getRequestHeaders(); delete headers['Content-Type'];
            const response = await fetch('/api/characters/create', { method: 'POST', headers, body: form });
            if (!response.ok) throw new Error('Fixture character creation failed');
            await host.getCharacters();
        }
        await host.selectCharacterById(host.characters.findIndex(item => item.name === 'Image acceptance'));
        return { characters: host.characters.length, character: window.SillyTavern.getContext().characterId,
            chatId: window.SillyTavern.getContext().chatId, api: host.main_api };
    }));
}
