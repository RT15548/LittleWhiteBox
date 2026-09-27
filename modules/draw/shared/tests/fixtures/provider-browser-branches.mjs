// Real host continuation/regeneration and the user-facing swipe control.
async (page) => {
    for (const provider of ['sdwebui', 'comfyui', 'novelai']) {
        await page.evaluate(provider => window.__accept.load(provider), provider);
        for (const type of ['normal', 'continue', 'swipe', 'regenerate']) {
            const before = await page.evaluate(() => window.__accept.submissions);
            await page.evaluate(() => {
                const f = window.__accept; f.streaming = true;
                f.source = 'More riverside scenes. [img: same] and [img: same]';
            });
            if (type === 'swipe') await page.locator('#chat .mes').last().locator('.swipe_right').click();
            else {
                await page.evaluate(type => { const f = window.__accept; f.operation = f.generate(type); }, type);
                await page.evaluate(() => window.__accept.operation);
            }
            await page.waitForFunction(before => window.__accept.submissions >= before + 2, before);
            await page.waitForFunction(() => !window.__accept.api.isGenerating());
            const expected = type === 'continue' ? 4 : 2;
            await page.waitForFunction(expected => [...document.querySelectorAll('#chat .mes:last-child .xb-nd-img img')]
                .filter(img => img.complete && img.naturalWidth > 0).length === expected, expected);
            await page.evaluate(async ({ before, provider, type, expected }) => {
                const f = window.__accept, host = await import('/script.js');
                if (f.submissions !== before + 2 || f.api.parseChatImageTags(host.chat.at(-1).mes).length) {
                    throw new Error('Host branch missed or resubmitted a tag');
                }
                f.rows.push({ provider, type, submissions: 2, images: expected });
            }, { before, provider, type, expected });
        }
    }
}
