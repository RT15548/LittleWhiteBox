// Run with playwright-cli run-code --filename after opening image-slot-browser-host.mjs.
// CSS geometry needs a real layout engine; DOM-only tests cannot detect these regressions.
// Uses the existing isolated host and local synthetic images, never a supplier API.
async (page) => {
    const assert = (condition, message) => { if (!condition) throw new Error(message); };
    await page.waitForFunction(() => window.fixture?.gallery);
    const cdp = await page.context().newCDPSession(page);
    const cases = [
        { name: 'portrait', width: 390, height: 844, insets: { top: 47, bottom: 34, left: 0, right: 0 } },
        { name: 'landscape', width: 844, height: 390, insets: { top: 0, bottom: 21, left: 47, right: 47 } },
        { name: 'desktop', width: 1280, height: 900, insets: { top: 0, bottom: 0, left: 0, right: 0 } },
        { name: 'zoom-portrait', width: 390, height: 844, scale: 2, insets: { top: 47, bottom: 34, left: 0, right: 0 } },
        { name: 'zoom-landscape', width: 844, height: 390, scale: 1.5, insets: { top: 0, bottom: 21, left: 47, right: 47 } },
    ];
    const slotId = await page.evaluate(async () => {
        const gallery = window.fixture.gallery;
        gallery.closeGallery();
        const slot = `layout-${crypto.randomUUID()}`;
        const shapes = [[320, 240], [1024, 2048], [2048, 1024], [768, 768]];
        const images = shapes.map(([width, height]) => {
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#a5a8ac'; ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#70767e';
            ctx.beginPath(); ctx.moveTo(0, height); ctx.lineTo(width * 0.4, height * 0.25);
            ctx.lineTo(width, height); ctx.fill();
            return canvas.toDataURL();
        });
        for (let index = 0; index < 21; index++) {
            const url = images[index % images.length];
            await gallery.storePreview({
                slotId: slot, imgId: `${slot}-${index}`, messageId: 0, characterName: 'Alice',
                base64: url.split(',')[1], timestamp: Date.now() + index,
                savedUrl: index === 19 ? null : url,
            });
        }
        await gallery.openGallery(slot, 0);
        return slot;
    });
    const settle = () => page.evaluate(async () => {
        await document.querySelector('#nd-gallery-img').decode();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    // Wait for the production viewport observer, not just the browser viewport.
    const waitForViewport = insets => page.waitForFunction(({ left, right }) => {
        const box = document.querySelector('#nd-gallery-overlay').getBoundingClientRect();
        return Math.abs(box.width - (visualViewport.width - left - right)) < 1;
    }, insets);
    const measure = () => page.evaluate(() => {
        const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
        const image = document.querySelector('#nd-gallery-img');
        const badge = document.querySelector('#nd-gallery-saved-badge');
        const badgeStyle = getComputedStyle(badge);
        const thumbs = document.querySelector('.nd-gallery-thumbs');
        return {
            overlay: rect('#nd-gallery-overlay'), main: rect('.nd-gallery-main'),
            image: rect('#nd-gallery-img'), badge: rect('#nd-gallery-saved-badge'),
            badgeVisible: badgeStyle.display !== 'none',
            badgeInset: { top: parseFloat(badgeStyle.top), left: parseFloat(badgeStyle.left) },
            badgeLineHeight: parseFloat(badgeStyle.lineHeight),
            badgePadding: parseFloat(badgeStyle.paddingTop) + parseFloat(badgeStyle.paddingBottom),
            imageRatio: image.naturalWidth / image.naturalHeight,
            thumbs: rect('.nd-gallery-thumbs'), thumbCount: thumbs.children.length,
            canScroll: thumbs.scrollWidth > thumbs.clientWidth,
        };
    });
    const check = (result, label) => {
        const { overlay, main, image, thumbs, badge, badgeInset } = result;
        assert(result.thumbCount === 21, `${label}: missing versions`);
        assert(thumbs.left >= overlay.left - 1 && thumbs.right <= overlay.right + 1, `${label}: thumbnails escaped the safe viewport`);
        assert(result.canScroll, `${label}: versions must remain horizontally scrollable`);
        assert(image.width > 0 && image.height > 0, `${label}: image collapsed`);
        assert(image.top >= main.top - 1 && image.bottom <= main.bottom + 1, `${label}: image escaped its available height`);
        assert(Math.abs(image.width / image.height - result.imageRatio) < 0.03, `${label}: distorted image`);
        assert(Math.abs((image.left + image.right) - (main.left + main.right)) < 2, `${label}: image lost horizontal centering`);
        if (result.badgeVisible) {
            assert(Math.abs(badge.top - image.top - badgeInset.top) < 1, `${label}: badge detached vertically`);
            assert(Math.abs(badge.left - image.left - badgeInset.left) < 1, `${label}: badge detached horizontally`);
            assert(badge.height <= result.badgeLineHeight + result.badgePadding + 1, `${label}: badge wrapped into a column`);
        }
    };
    const results = [];
    try {
        for (const dark of [false, true]) {
            await page.evaluate(value => document.body.classList.toggle('dark', value), dark);
            for (const size of cases) {
                await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
                await page.setViewportSize({ width: size.width, height: size.height });
                await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: size.insets });
                await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: size.scale || 1 });
                await waitForViewport(size.insets);
                for (const index of [0, 1, 2, 3, 4, 20]) {
                    // CDP pinch emulation changes input coordinates; select at 1x, then test the zoomed layout.
                    if (size.scale) {
                        await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
                        await waitForViewport(size.insets);
                    }
                    await page.locator(`.nd-gallery-thumb[data-index="${index}"]`).click();
                    if (size.scale) {
                        await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: size.scale });
                        await waitForViewport(size.insets);
                    }
                    await settle();
                    const result = await measure();
                    assert(result.badgeVisible === (index !== 1), `${size.name}: incorrect saved state`);
                    check(result, `${size.name}/${dark}/${index}`);
                    results.push({ name: size.name, dark, index, ...result });
                }
                await page.screenshot({ path: `output/playwright/gallery-fixed-${size.name}-${dark ? 'dark' : 'light'}.png` });
            }
        }
        await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.locator('#nd-gallery-close').click();
        assert(!await page.locator('#nd-gallery-overlay').isVisible(), 'close failed');
        await page.evaluate(slot => window.fixture.gallery.openGallery(slot, 0), slotId);
        await settle();
        check(await measure(), 'reopened');
        return { layoutChecks: results.length + 1, layouts: cases.map(size => size.name), themes: 2, versions: 21 };
    } finally {
        await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
        await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 0, bottom: 0, left: 0, right: 0 } });
        await cdp.detach();
    }
}
