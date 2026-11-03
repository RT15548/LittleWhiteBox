async (page) => {
    for (const provider of ['sdwebui', 'comfyui', 'novelai']) {
        await page.evaluate(provider => window.__accept.load(provider), provider);
        for (const streaming of [true, false]) {
            const before = await page.evaluate(() => window.__accept.submissions);
            await page.evaluate(streaming => {
                const f = window.__accept;
                f.streaming = streaming;
                document.querySelector('#chat').style.visibility = streaming ? '' : 'hidden';
                f.operation = f.generate();
            }, streaming);
            await page.evaluate(() => window.__accept.operation);
            await page.waitForFunction(() => !window.__accept.api.isGenerating());
            await page.waitForFunction(() => [...document.querySelectorAll('#chat .mes:last-child .xb-nd-img img')]
                .filter(img => img.complete && img.naturalWidth > 0).length === 2);
            await page.evaluate(async ({ before, provider, streaming }) => {
                const f = window.__accept;
                if (f.submissions - before !== 2) throw new Error('A tag was missed or submitted twice');
                const host = await import('/script.js');
                const id = host.chat.length - 1, message = host.chat[id];
                if (f.api.parseChatImageTags(message.mes).length) throw new Error('Unclaimed tag');
                await host.updateMessageBlock(id, message);
                const root = document.querySelector('#chat .mes:last-child .mes_text');
                root.replaceWith(root.cloneNode(true));
                document.querySelector('#chat').style.visibility = '';
                const chat = document.querySelector('#chat'); chat.scrollTop = 0; chat.scrollTop = chat.scrollHeight;
                f.rows.push({ provider, streaming, submissions: f.submissions - before, images: 2 });
            }, { before, provider, streaming });
            await page.waitForFunction(() => document.querySelectorAll('#chat .mes:last-child .xb-nd-img img').length === 2);
            if (await page.evaluate(() => window.__accept.submissions) !== before + 2) throw new Error('Remount submitted again');
        }
    }
    await page.screenshot({ path: 'output/playwright/img-clean-three-providers.png' });
}
