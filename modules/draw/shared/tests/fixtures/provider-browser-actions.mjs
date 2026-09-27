async (page) => {
    for (const provider of ['sdwebui', 'comfyui', 'novelai']) {
        await page.evaluate(provider => window.__accept.load(provider), provider);
        const before = await page.evaluate(() => window.__accept.submissions);
        await page.evaluate(() => {
            const f = window.__accept; f.hold = true; f.streaming = false;
            f.operation = f.generate();
        });
        await page.evaluate(() => window.__accept.operation);
        await page.waitForFunction(before => window.__accept.submissions > before, before);
        await page.locator('#chat .mes').last().locator('.nd-status-text').click();
        await page.waitForFunction(() => !window.__accept.api.isGenerating());
        await page.evaluate(() => { window.__accept.hold = false; });
        await page.waitForFunction(() => document.querySelectorAll('#chat .mes:last-child .xb-nd-img[data-state="failed"]').length === 2);
        await page.waitForFunction(() => document.querySelector('#chat .mes:last-child .nd-float.error'));
        await page.evaluate(async ({ provider, before }) => {
            const f = window.__accept;
            const cards = [...document.querySelectorAll('#chat .mes:last-child .xb-nd-img')];
            const results = await Promise.all(cards.map(card => f.api.getPreview(card.dataset.imgId)));
            if (f.submissions !== before + 1 || results[0].status !== 'unknown' || results[1].status !== 'failed') {
                throw new Error('Cancel must preserve submitted UNKNOWN and must not submit its queued sibling');
            }
            f.rows.push({ provider, action: 'cancel-button', submissions: 1, statuses: results.map(item => item.status) });
        }, { provider, before });
    }
    const before = await page.evaluate(() => window.__accept.submissions);
    await page.locator('#chat .mes').last().hover();
    await page.locator('#chat .mes').last().locator('.mes_edit').click();
    const editor = page.locator('#chat .mes').last().locator('.edit_textarea');
    await editor.fill(await editor.inputValue() + ' [img: manually edited]');
    await page.locator('#chat .mes').last().locator('.mes_edit_done').click();
    await page.waitForFunction(() => document.querySelector('#chat .mes:last-child [data-action="generate-tag"]'));
    if (await page.evaluate(() => window.__accept.submissions) !== before) throw new Error('Editing submitted a task');
    await page.evaluate(() => window.__accept.rows.push({ action: 'edit-save', submissions: 0 }));
    await page.route('**/api/chats/save', route => route.fulfill({ status: 500, json: { error: 'simulated storage failure' } }));
    await page.evaluate(() => { const f = window.__accept; f.operation = f.generate(); });
    await page.evaluate(() => window.__accept.operation);
    await page.waitForFunction(() => !window.__accept.api.isGenerating());
    await page.waitForFunction(() => [...document.querySelectorAll('#chat .mes:last-child .xb-nd-img img')]
        .filter(img => img.complete && img.naturalWidth > 0).length === 2);
    if (await page.evaluate(() => window.__accept.submissions) !== before + 2) throw new Error('Save failure blocked drawing');
    await page.unroute('**/api/chats/save');
    await page.evaluate(() => window.__accept.rows.push({ action: 'save-failed', submissions: 2, images: 2 }));
    await page.screenshot({ path: 'output/playwright/img-clean-save-failed.png' });
}
