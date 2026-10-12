// Run with playwright-cli run-code after opening image-slot-browser-host.mjs.
// Only the local fixture is touched; its supplier boundary cannot use the network.
async (page) => {
    await page.evaluate(() => {
        window.fixture.hold = true;
        window.fixture.pending = window.fixture.generate({ source: '[img: first] a long riverside walk between scenes [img: second]' });
    });
    await page.waitForFunction(() => document.querySelector('[data-xb-draw-tag="streaming"]'));
    await page.screenshot({ path: 'output/playwright/img-flow-streaming.png', fullPage: true });
    await page.evaluate(() => window.fixture.pending);
    await page.waitForFunction(() => window.fixture.release);
    await page.screenshot({ path: 'output/playwright/img-flow-queued.png', fullPage: true });
    await page.evaluate(() => { window.fixture.hold = false; window.fixture.release(); });
    await page.waitForFunction(() => window.fixture.jobsRunning() === 0);
    await page.screenshot({ path: 'output/playwright/img-flow-success.png', fullPage: true });
    await page.evaluate(async () => {
        const f = window.fixture;
        const assert = (value, message) => { if (!value) throw new Error(message); };
        const settle = async () => {
            const deadline = Date.now() + 10000;
            while (f.jobsRunning()) {
                assert(Date.now() < deadline, 'drawing did not settle');
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        };
        const rows = [];
        for (const provider of ['novelai', 'sdwebui', 'comfyui']) {
            f.setProvider(provider);
            for (const streaming of [true, false]) {
                const before = f.calls.length;
                await f.generate({ streaming, hidden: !streaming });
                await settle();
                assert(f.calls.length - before === 2, 'each raw occurrence must submit exactly once');
                assert(document.querySelectorAll('.xb-nd-img img').length === 2, 'both images must render');
                await f.remount();
                window.scrollTo(0, document.body.scrollHeight); window.scrollTo(0, 0);
                await new Promise(resolve => requestAnimationFrame(resolve));
                assert(f.calls.length - before === 2, 'remount/scroll must not resubmit');
                assert(!document.querySelector('[data-state="pending"]'), 'no orphan waiting card');
                rows.push({ provider, streaming, submissions: 2, images: 2 });
            }
        }
        for (const type of ['continue', 'swipe', 'regenerate']) {
            const before = f.calls.length;
            await f.generate({ type, source: '[img: another scene]' });
            await settle();
            assert(f.calls.length - before === 1, 'only the new generation range may submit');
            rows.push({ type, submissions: 1 });
        }
        const beforeFailure = f.calls.length;
        await f.generate({ saveFailure: true, source: '[img: success] [img: failed scene]' });
        await settle();
        assert(f.calls.length - beforeFailure === 2, 'save failure must not block submission');
        assert(document.querySelectorAll('[data-state="failed"]').length === 1, 'supplier rejection needs a failed card');
        assert(document.querySelectorAll('.xb-nd-img img').length === 1, 'partial success stays visible');
        const last = f.states.at(-1);
        assert(last.data.success === 1 && last.data.total === 2, 'floor totals must match image outcomes');
        // Editing source (host repaint) creates a manual historical entry only.
        const beforeEdit = f.calls.length;
        f.ctx.chat[0].mes += ' [img: edited historical]';
        // Fixture-controlled source, formatted by the isolated host.
        // eslint-disable-next-line no-unsanitized/property
        document.querySelector('.mes_text').innerHTML = f.format(f.ctx.chat[0].mes);
        await f.emit('MESSAGE_EDITED', 0); await f.remount();
        await new Promise(resolve => requestAnimationFrame(resolve));
        assert(f.calls.length === beforeEdit, 'editing may not auto-purchase');
        assert(document.querySelector('[data-xb-draw-tag-action]'), 'historical tag needs explicit action');
        f.acceptance = { rows, partial: { success: 1, failed: 1 }, edit: 'manual-only', remount: 'no-resubmit' };
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => document.body.classList.remove('dark'));
    await page.screenshot({ path: 'output/playwright/img-mobile-light.png', fullPage: true });
    await page.evaluate(() => document.body.classList.add('dark'));
    await page.screenshot({ path: 'output/playwright/img-mobile-dark.png', fullPage: true });
    const backgroundTab = await page.context().newPage();
    await backgroundTab.goto('about:blank');
    await backgroundTab.bringToFront();
    await page.evaluate(async () => {
        const f = window.fixture, before = f.calls.length;
        f.backgroundVisibility = document.visibilityState;
        await f.generate({ streaming: false });
        f.backgroundBefore = before;
    });
    await page.waitForFunction(() => window.fixture.jobsRunning() === 0, null, { polling: 50 });
    await page.evaluate(() => {
        const f = window.fixture;
        if (f.calls.length - f.backgroundBefore !== 2) throw new Error('background completion missed a tag');
        f.acceptance.background = { visibility: f.backgroundVisibility, submissions: 2 };
    });
    await backgroundTab.close();
    await page.bringToFront();
    return await page.evaluate(() => window.fixture.acceptance);
}
