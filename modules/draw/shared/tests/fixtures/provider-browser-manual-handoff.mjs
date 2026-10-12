// Run after provider-browser-setup/flow in the disposable real SillyTavern.
// Hold only the isolated chat's save response; supplier traffic stays simulated.
async (page) => {
    const rows = [];
    for (const provider of ['sdwebui', 'comfyui', 'novelai']) {
        await page.evaluate(provider => window.__accept.load(provider), provider);
        for (const saveMode of ['ok', 'uncertain']) {
            await page.evaluate(async () => {
                const host = await import('/script.js');
                await host.sendMessageAsUser('Before [img: same] and After [img: same]');
            });
            const floor = page.locator('#chat .mes').last();
            await floor.locator('[data-xb-draw-tag-action]').first().waitFor();
            await page.evaluate(() => {
                const f = window.__accept;
                f.hold = true;
                const root = document.querySelector('#chat .mes:last-child .mes_text');
                const check = f.manualCheck = { root, before: f.submissions, frames: 0, leaks: [] };
                check.iframe = document.createElement('iframe');
                check.iframe.style.display = 'none';
                root.append(check.iframe);
                const sample = () => {
                    check.frames++;
                    const cards = root.querySelectorAll('.xb-nd-img').length;
                    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
                    let raw = false;
                    while (walker.nextNode()) {
                        const node = walker.currentNode;
                        if (!node.parentElement.closest('.xb-nd-img, pre, code, textarea')
                            && /\[(?:img|图片|image)\s*:/i.test(node.nodeValue)) raw = true;
                    }
                    if (raw || cards !== 2 || !check.iframe.isConnected) check.leaks.push({ raw, cards });
                    check.frame = requestAnimationFrame(sample);
                };
                check.frame = requestAnimationFrame(sample);
            });
            let releaseSave;
            const saving = new Promise(resolve => { releaseSave = resolve; });
            const saveRoute = async route => {
                await saving;
                if (saveMode === 'uncertain') await route.fulfill({ status: 500, json: { error: 'fixture save rejected' } });
                else await route.continue();
            };
            await page.route('**/api/chats/save', saveRoute);
            try {
                await Promise.all([
                    page.waitForRequest('**/api/chats/save', { timeout: 15000 }),
                    floor.locator('[data-xb-draw-tag-action]').first().click(),
                ]);
                await page.evaluate(() => window.__accept.api.refreshChatMessageImages());
                await page.waitForFunction(() => window.__accept.manualCheck.frames >= 5);
                const earlyRequests = await page.evaluate(() => window.__accept.submissions - window.__accept.manualCheck.before);
                if (earlyRequests) throw new Error('Supplier request preceded save confirmation');
                if (provider === 'sdwebui' && saveMode === 'ok') {
                    await floor.screenshot({ path: 'output/playwright/img-manual-save-pending.png' });
                }
                releaseSave();
                if (saveMode === 'ok') {
                    await page.waitForFunction(() => window.__accept.submissions > window.__accept.manualCheck.before);
                } else {
                    await floor.locator('.xb-nd-img[data-state="failed"]').waitFor();
                    await page.waitForFunction(() => !window.__accept.api.isGenerating());
                    if (await page.evaluate(() => window.__accept.submissions - window.__accept.manualCheck.before)) {
                        throw new Error('Unconfirmed save purchased an image');
                    }
                    // The failed image's retry must retain the same sibling too.
                    await page.unroute('**/api/chats/save', saveRoute);
                    await floor.locator('[data-action="retry-image"]').click();
                    await page.waitForFunction(() => window.__accept.submissions > window.__accept.manualCheck.before);
                }
                await page.evaluate(() => { window.__accept.hold = false; });
                await page.waitForFunction(() => !window.__accept.api.isGenerating());
                await page.waitForFunction(() => {
                    const image = window.__accept.manualCheck.root.querySelector('.xb-nd-img img');
                    return image?.complete && image.naturalWidth > 0;
                });
                const result = await page.evaluate(({ provider, saveMode }) => {
                    const f = window.__accept, check = f.manualCheck;
                    return { provider, saveMode, frames: check.frames, leaks: check.leaks,
                        submissions: f.submissions - check.before, siblingPreserved: check.iframe.isConnected };
                }, { provider, saveMode });
                if (result.leaks.length || result.submissions !== 1 || !result.siblingPreserved) throw new Error(JSON.stringify(result));
                rows.push(result);
            } finally {
                releaseSave();
                await page.unroute('**/api/chats/save', saveRoute);
                await page.evaluate(() => {
                    const f = window.__accept;
                    f.hold = false;
                    cancelAnimationFrame(f.manualCheck.frame);
                    f.manualCheck.iframe.remove();
                });
            }
        }
    }
    return rows;
}
