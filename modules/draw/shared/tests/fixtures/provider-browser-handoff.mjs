// Run after provider-browser-setup/flow in the disposable real SillyTavern.
// Sample browser frames, not just the terminal image result. All supplier I/O
// remains on the existing local fixture routes; no user settings are changed.
async (page) => {
    const rows = [];
    for (const provider of ['sdwebui', 'comfyui', 'novelai']) {
        await page.evaluate(provider => window.__accept.load(provider), provider);
        for (const streaming of [true, false]) {
            await page.evaluate(async streaming => {
                const f = window.__accept;
                const host = await import('/script.js');
                const previous = host.chat.at(-1);
                f.hold = true;
                f.streaming = streaming;
                f.source = 'Before [img: 1girl, 1boy, mature female, short black hair, petite body, blue prison uniform, white socks, no shoes, standing in small room, leaning against tall man in dress shirt, holding smartphone up toward him, looking up at him, soft smile, blushing ears, warm lamplight, folding bed in background, intimate atmosphere, indoors] and After [img: close view]';
                const check = f.handoffCheck = { before: f.submissions, frames: 0, leaks: [], phases: [], active: true };
                check.guard = id => {
                    if (id !== host.chat.length - 1 || host.chat[id] === previous) return;
                    const root = document.querySelector(`#chat .mes[mesid="${id}"] .mes_text`);
                    if (!root) return;
                    check.iframe = document.createElement('iframe');
                    check.iframe.style.display = 'none';
                    root.append(check.iframe);
                };
                host.eventSource.makeFirst(host.event_types.MESSAGE_RECEIVED, check.guard);
                const sample = () => {
                    if (!check.active) return;
                    if (host.chat.at(-1) !== previous) {
                        const root = document.querySelector(`#chat .mes[mesid="${host.chat.length - 1}"] .mes_text`);
                        const cards = [...(root?.querySelectorAll('.xb-nd-img') || [])];
                        if (cards.length) check.seenCard = true;
                        if (root && check.seenCard) {
                            check.frames++;
                            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
                            let raw = false;
                            while (walker.nextNode()) {
                                const node = walker.currentNode;
                                if (!node.parentElement.closest('.xb-nd-img, pre, code, textarea')
                                    && /\[(?:img|图片|image)\s*:/i.test(node.nodeValue)) raw = true;
                            }
                            if (raw || !cards.length || cards.length < check.cardCount) check.leaks.push({ raw, cards: cards.length });
                            check.cardCount = cards.length;
                            for (const card of cards) {
                                const phase = card.dataset.xbDrawTag || card.dataset.state;
                                if (!check.phases.includes(phase)) check.phases.push(phase);
                            }
                        }
                    }
                    check.frame = requestAnimationFrame(sample);
                };
                check.frame = requestAnimationFrame(sample);
                f.operation = f.generate();
            }, streaming);
            try {
                await page.evaluate(() => window.__accept.operation);
                await page.waitForFunction(() => window.__accept.submissions > window.__accept.handoffCheck.before);
                await page.locator('#chat .mes').last().scrollIntoViewIfNeeded();
                if (streaming && provider === 'sdwebui') {
                    await page.locator('#chat .mes').last().screenshot({ path: 'output/playwright/img-handoff-pending.png' });
                }
                await page.evaluate(() => { window.__accept.hold = false; });
                await page.waitForFunction(() => !window.__accept.api.isGenerating());
                await page.waitForFunction(() => [...document.querySelectorAll('#chat .mes:last-child .xb-nd-img img')]
                    .filter(image => image.complete && image.naturalWidth > 0).length === 2);
                await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
                const result = await page.evaluate(async ({ provider, streaming }) => {
                    const f = window.__accept, check = f.handoffCheck;
                    const result = { provider, streaming, frames: check.frames, leaks: check.leaks,
                        phases: check.phases, submissions: f.submissions - check.before,
                        siblingPreserved: streaming ? Boolean(check.iframe?.isConnected) : !check.iframe || check.iframe.isConnected };
                    if (!result.frames || result.leaks.length || result.submissions !== 2 || !result.siblingPreserved
                        || streaming && !result.phases.includes('streaming')) {
                        throw new Error(JSON.stringify(result));
                    }
                    return result;
                }, { provider, streaming });
                rows.push(result);
            } finally {
                await page.evaluate(async () => {
                    const f = window.__accept, check = f.handoffCheck;
                    f.hold = false;
                    check.active = false;
                    cancelAnimationFrame(check.frame);
                    const host = await import('/script.js');
                    host.eventSource.removeListener(host.event_types.MESSAGE_RECEIVED, check.guard);
                    check.iframe?.remove();
                });
            }
        }
    }
    return rows;
}
