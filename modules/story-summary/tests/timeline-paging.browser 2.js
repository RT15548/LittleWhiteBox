// Start ui-preview.mjs, then run with Playwright CLI:
// playwright-cli -s=summary open http://127.0.0.1:18893 --browser=msedge
// playwright-cli -s=summary run-code --filename modules/story-summary/tests/timeline-paging.browser.js
// Browser regression: actual DOM/scroll, persistence and the parent-message protocol.
async (page) => {
    await page.goto('http://127.0.0.1:18893');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    let frame = page.frames().find(f => f.url().includes('story-summary.html'));
    await frame.waitForFunction(() => document.getElementById('tl-paging-toggle')?.onclick != null);
    await page.setViewportSize({width: 1280, height: 900});
    const check = (condition, contract) => { if (!condition) throw new Error(contract); };
    const state = () => frame.evaluate(() => ({
        page: Number(document.getElementById('tl-pg-num').value),
        scroll: document.getElementById('timeline-list').scrollTop,
        count: document.querySelectorAll('#timeline-list .tl-item').length,
        selected: Number(document.querySelector('[aria-current="page"]')?.dataset.page),
        focused: document.activeElement === document.querySelector('[aria-current="page"]'),
    }));
    const post = async (chatId, count) => {
        await page.evaluate(({chatId, count}) => {
            const events = Array.from({length: count}, (_, i) => ({
                title: String(i), summary: '河岸上的同行者商议下一步行动。'.repeat(5),
                participants: ['甲', '乙'], memoryRole: '回忆',
            }));
            document.querySelector('#summary').contentWindow.postMessage({
                source: 'LittleWhiteBox', type: 'SUMMARY_FULL_DATA', payload: {chatId, events},
            }, location.origin);
        }, {chatId, count});
        await frame.waitForFunction(n => document.getElementById('stat-events').textContent === String(n), count);
        await frame.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    };
    const jump = async n => {
        await frame.locator('#tl-pg-num').fill(String(n));
        await frame.locator('#tl-pg-num').press('Enter');
    };
    await post('a', 100);
    check((await state()).count === 100, 'Default view must include every event');
    await frame.locator('#tl-paging-toggle').click();
    check((await state()).page === 5 && (await state()).count === 20, 'First paged view must open the latest page');
    await frame.locator('#timeline-list').evaluate(el => {el.scrollTop = 650;});
    await post('a', 100);
    check((await state()).scroll === 650, 'Same-page refresh must preserve reading position');
    await frame.locator('[data-section="events"]').click();
    check(await frame.locator('.event-title').count() === 100, 'Editor must include all events');
    await page.evaluate(() => {
        window.savedSections = [];
        const isTrustedMessage = event => event.origin === location.origin
            && event.source === document.querySelector('#summary').contentWindow;
        // eslint-disable-next-line no-restricted-syntax -- Isolated fixture validates both origin and iframe source below.
        window.addEventListener('message', event => {
            if (!isTrustedMessage(event)) return;
            if (event.data?.type === 'UPDATE_SECTION') window.savedSections.push(event.data);
        });
    });
    await frame.locator('#editor-save').click();
    await page.waitForFunction(() => window.savedSections.length > 0);
    check(await page.evaluate(() => window.savedSections[0].data.length === 100), 'Saving while paged must not truncate event data');
    check((await state()).scroll === 650, 'Saving an unchanged event list must preserve reading position');
    await jump(5);
    await post('a', 30);
    check((await state()).page === 2 && (await state()).selected === 1, 'Automatic clamp must synchronize the focused page input');
    await post('a', 100);
    await post('b', 61);
    await post('a', 100);
    check((await state()).page === 2, 'Returning after data regrows must keep the clamped page');
    await frame.locator('#tl-pg-strip button').nth(2).press('Enter');
    check((await state()).focused && (await state()).page === 3, 'Keyboard page selection must retain focus');
    await post('a', 30);
    check((await state()).focused && (await state()).page === 2, 'Removing the focused page must move focus to the surviving current page');
    await jump(2147483648);
    check((await state()).page === 2, 'Large page input must clamp instead of wrapping to the first page');
    await post('a', 2000);
    await frame.locator('#tl-pg-last').click();
    await page.setViewportSize({width: 320, height: 844});
    await frame.waitForFunction(() => {
        const cur = document.querySelector('[aria-current="page"]').getBoundingClientRect();
        const strip = document.getElementById('tl-pg-strip').getBoundingClientRect();
        return cur.left >= strip.left && cur.right <= strip.right;
    });
    const geometry = await frame.evaluate(() => ({
        width: document.documentElement.scrollWidth, viewport: innerWidth,
        height: document.getElementById('tl-pg-next').getBoundingClientRect().height,
    }));
    check(geometry.width === geometry.viewport && geometry.height >= 44, 'Mobile pager must fit and provide touch-sized controls');
    await jump(2);
    await page.reload();
    frame = page.frames().find(f => f.url().includes('story-summary.html'));
    await frame.waitForFunction(() => document.getElementById('tl-paging-toggle')?.onclick != null);
    await post('a', 100);
    check((await state()).page === 2, 'Reload must restore the selected page');
    await post('a', 0);
    check(!await frame.locator('#tl-pager').isVisible(), 'Empty timeline must hide the pager');
    await post('a', 21);
    check((await state()).count === 1, 'Partial last page must not duplicate events');
    return {passed: true};
}
