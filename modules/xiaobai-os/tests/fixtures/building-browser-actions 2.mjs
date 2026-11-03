// Playwright CLI on the disposable random-supply preview only. Never reset retained user previews.
export async function exerciseBuilding(page) {
    if (new URL(page.url()).port !== '18922') throw new Error('wrong-preview');
    const frame = page.frameLocator('iframe[title="OS"]'), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const get = async endpoint => (await (await page.request.get(new URL('/__building/' + endpoint, page.url()).href)).json()).result;
    const check = (ok, code) => { if (!ok) throw new Error(code); };
    const idle = () => frame.locator('.building-room[aria-busy="false"][data-build-presenting="false"]').waitFor();
    const open = async () => {
        await page.reload(); await page.bringToFront();
        await frame.getByRole('button', { name: '游戏', exact: true }).click();
        const tile = frame.locator('[data-game-room="building"]');
        await tile.locator('.game-tile-mascot').waitFor();
        check(await tile.locator('.game-tile-mascot').evaluate(el => el.complete && el.naturalWidth > 0), 'mascot-loaded');
        await tile.click(); await idle();
    };
    const put = async part => {
        await frame.locator('[data-build-floor="' + part.y + '"]').click();
        await frame.locator('[data-build-kind="' + part.kind + '"]').click();
        await frame.locator('[data-build-cell="' + part.x + ':' + part.y + ':' + part.z + '"]').click(); await idle();
    };
    const begin = async () => {
        await frame.locator('[data-build-action="start"]').click();
        await frame.locator('[data-build-action="confirm"]').click(); await idle();
    };
    const screenshots = async label => {
        for (const [width, height] of [[390,844], [320,568], [844,390]]) {
            await page.setViewportSize({width,height});
            const size = await frame.locator('.building-room').evaluate(el => ({w:el.clientWidth,scroll:el.scrollWidth}));
            check(size.scroll <= size.w + 1, 'horizontal-overflow-' + label + width);
            const action = frame.locator(label === 'supplies' ? '[data-build-pack="2"]' : '[data-build-action="finish"]');
            await action.scrollIntoViewIfNeeded();
            const box = await action.boundingBox();
            check(box && box.y >= 0 && box.y + box.height <= height, 'action-reachable-' + label + width);
            await page.screenshot({path:'output/playwright/building-random-' + label + '-' + width + '.png'});
        }
        await page.setViewportSize({width:390,height:844});
    };
    await get('reset?seed=17&supplies=fixture'); await page.setViewportSize({width:390,height:844}); await open(); await begin();
    await frame.locator('[data-build-batch="0"]').waitFor();
    check(!await frame.locator('.build-tray').count(), 'no-construction-before-picking');
    check(!await frame.locator('.build-thought').count(), 'no-next-step-instruction');
    await screenshots('supplies');
    await page.evaluate(() => window.buildingPreview.theme('dark'));
    await frame.locator('.build-stage').evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.screenshot({path:'output/playwright/building-random-supplies-dark.png'});
    await page.evaluate(() => window.buildingPreview.theme('light'));
    const offered = JSON.stringify((await get('view')).active.supply.offers), document = JSON.stringify((await get('inspect')).document);
    await get('reload'); await open();
    await frame.locator('[data-build-batch="0"]').waitFor();
    await frame.locator('[data-build-action="desk"]').click();
    await frame.locator('[data-build-action="resume"]').click();
    await frame.locator('[data-build-batch="0"]').waitFor();
    check(JSON.stringify((await get('view')).active.supply.offers) === offered, 'reload-rerolled');
    check(JSON.stringify((await get('inspect')).document) === document, 'resume-writes');
    const outcomes = [];
    for (const route of ['courtyard','terrace']) {
        if (route === 'terrace') { await frame.locator('[data-build-action="desk"]').click(); await begin(); }
        const before = await get('view'), plans = (await get('inspect')).plans;
        const witness = plans.find(plan => route === 'courtyard' ? plan.rooms.every(p => p.y === 0) : plan.rooms.some(p => p.kind === 'terrace'));
        check(!!witness, 'independent-route-' + route);
        for (const choice of [0,1,2]) {
            await frame.locator('[data-build-batch="' + choice + '"]').waitFor();
            if (choice === 0) {
                await frame.locator('.build-supply [role="heading"]').focus();
                await page.keyboard.press('Tab');
                check(await frame.locator('[data-build-pack="0"]').evaluate(el => el === el.ownerDocument.activeElement), 'keyboard-first-pack');
                await page.keyboard.press('Enter');
            } else {
                check(await frame.locator('.build-supply [role="heading"]').evaluate(el => el === el.ownerDocument.activeElement), 'next-batch-focus');
                await frame.locator('[data-build-pack="' + choice + '"]').click();
            }
            await idle();
        }
        await frame.locator('.build-tray').waitFor();
        check(!await frame.locator('.build-supply').count() && (await get('view')).active.supply.remaining === 0, 'three-batches-finished');
        for (const part of witness.rooms.filter(p => p.kind !== 'hall')) await put(part);
        const ready = await get('view');
        check(ready.active.state === 'building' && ready.award === 50, 'no-auto-finish');
        check(!await frame.locator('[data-build-action="finish"]').isDisabled(), 'manual-delivery-enabled');
        await screenshots(route);
        await frame.locator('[data-build-action="finish"]').click();
        await frame.getByRole('button', {name:'再想想',exact:true}).click();
        check((await get('view')).active.state === 'building', 'cancel-keeps-building');
        // A real extra placement remains possible after all reward criteria are met.
        const hall = ready.active.rooms[0];
        const path = {kind:'path',x:hall.x + 1,y:0,z:hall.z};
        await put(path); await frame.locator('[data-build-action="undo"]').click(); await idle();
        check(JSON.stringify((await get('view')).active.rooms) === JSON.stringify(ready.active.rooms), 'continue-and-undo');
        await frame.locator('[data-build-action="finish"]').click();
        await frame.locator('[data-build-action="confirm"]').click(); await idle();
        await frame.locator('[data-build-result="delivered"]').waitFor();
        const completed = await get('view');
        check(completed.active.state === 'living' && completed.award === 140 && completed.balance === before.balance + 140, 'delivery-payout');
        outcomes.push({route,house:completed.active.id,rooms:completed.active.rooms.length});
        await frame.locator('[data-build-action="homes"]').click();
    }
    const final = await get('view'); await get('reload'); await open();
    check((await get('view')).balance === final.balance && (await get('view')).collection.length === 1, 'persisted-two-houses');
    await frame.locator('[data-build-action="homes"]').click();
    const download = page.waitForEvent('download');
    await frame.getByRole('button', {name:'更多',exact:true}).click();
    await frame.getByRole('button', {name:'保存留影',exact:true}).click();
    await (await download).saveAs('output/playwright/building-random-export.png');
    await page.evaluate(() => window.buildingPreview.theme('dark'));
    await page.screenshot({path:'output/playwright/building-random-dark.png'});
    await page.evaluate(() => window.buildingPreview.theme('light'));
    check(!errors.length, errors.join('|'));
    return {outcomes,threeAutomaticBatches:true,keyboardSelection:true,manualDelivery:true,choiceSurvivesReload:true,continueAfterReady:true,retained:final.collection.length,balance:final.balance,errors};
}

export async function verifyBuildingRecovery(page) {
    if (new URL(page.url()).port !== '18922') throw new Error('wrong-preview');
    const frame = page.frameLocator('iframe[title="OS"]');
    const get = async endpoint => (await (await page.request.get(new URL('/__building/' + endpoint, page.url()).href)).json()).result;
    const check = (ok, code) => { if (!ok) throw new Error(code); };
    const idle = () => frame.locator('.building-room[aria-busy="false"][data-build-presenting="false"]').waitFor();
    const open = async () => {
        await page.reload(); await page.bringToFront();
        await frame.getByRole('button', {name:'游戏',exact:true}).click();
        await frame.locator('[data-game-room="building"]').click(); await idle();
    };
    await get('reset?seed=17&supplies=fixture'); await open();
    await frame.locator('[data-build-action="start"]').click();
    await frame.locator('[data-build-action="confirm"]').click(); await idle();
    const plan = (await get('inspect')).plans[0];
    await frame.locator('[data-build-batch="0"]').waitFor();
    await get('mode?value=unknown');
    await frame.locator('[data-build-pack="0"]').click(); await idle();
    check(await frame.locator('[data-build-pack="0"]').isDisabled(), 'uncertain-choice-not-blocked');
    await get('mode?value=confirmed'); await get('reload'); await open();
    await frame.getByRole('button', {name:'复核原操作',exact:true}).click(); await idle();
    await frame.locator('[data-build-batch="1"]').waitFor();
    const supply = (await get('view')).active.supply;
    check(supply.remaining === 2 && JSON.stringify(supply.owned) === JSON.stringify(['room','room','study','garden']), 'choice-replayed-twice');
    for (const choice of [1,2]) {
        await frame.locator('[data-build-pack="' + choice + '"]').click(); await idle();
    }
    for (const p of plan.rooms.filter(p => p.kind !== 'hall')) {
        await frame.locator('[data-build-floor="' + p.y + '"]').click();
        await frame.locator('[data-build-kind="' + p.kind + '"]').click();
        await frame.locator('[data-build-cell="' + p.x + ':' + p.y + ':' + p.z + '"]').click(); await idle();
    }
    await frame.locator('[data-build-action="finish"]').click(); await get('mode?value=unknown');
    await frame.locator('[data-build-action="confirm"]').click(); await idle();
    check(!await frame.locator('[data-build-result="delivered"]').count(), 'unconfirmed-success');
    await get('mode?value=confirmed'); await get('reload'); await open();
    await frame.getByRole('button', {name:'复核原操作',exact:true}).click(); await idle();
    await frame.locator('[data-build-result="delivered"]').waitFor();
    const state = await get('inspect');
    check(state.view.balance === 190 && state.document.partitions.economy.transactions.filter(t => t.kind === 'building_finished').length === 1, 'delivery-recovery');
    await frame.locator('.build-canvas').evaluate(el => el.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await frame.getByRole('button', {name:'重载画面',exact:true}).click(); await idle();
    check((await get('view')).revision === state.view.revision, 'graphics-reload-mutated-project');
    return {uncertainPackRestart:true,uncertainDeliveryRestart:true,oneReward:true,graphicsRecovery:true};
}

export async function verifyBuildingHomeReturn(page) {
    if (new URL(page.url()).port !== '18922') throw new Error('wrong-preview');
    const frame = page.frameLocator('iframe[title="OS"]');
    const get = async () => (await (await page.request.get(new URL('/__building/view', page.url()).href)).json()).result;
    const idle = () => frame.locator('.building-room[aria-busy="false"][data-build-presenting="false"]').waitFor();
    await page.reload(); await page.bringToFront();
    await frame.getByRole('button', { name: '游戏', exact: true }).click();
    await frame.getByRole('button', { name: /^小白筑家 / }).click(); await idle();
    await frame.locator('[data-build-action="homes"]').click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await frame.locator('[data-life-phase="using"]').waitFor();
    const before = await get();
    await frame.locator('[data-build-action="remodel"]').click();
    const hall = before.active.rooms.find(p => p.kind === 'hall');
    const candidates = [{ x: hall.x, z: hall.z - 1 }, { x: hall.x - 1, z: hall.z }, { x: hall.x + 1, z: hall.z }];
    const target = candidates.find(p => !before.active.rooms.some(r => r.x === p.x && r.z === p.z && r.y === 0));
    if (!target) throw new Error('home-test-no-free-neighbour');
    await frame.locator('[data-build-kind="path"]').focus(); await page.keyboard.press('Enter');
    await frame.locator('[data-build-cell="' + target.x + ':0:' + target.z + '"]').focus(); await page.keyboard.press('Enter'); await idle();
    if ((await get()).active.rooms.length !== before.active.rooms.length + 1) throw new Error('keyboard-placement');
    await frame.locator('[data-build-action="undo"]').click(); await idle();
    const saved = await get();
    await frame.locator('[data-build-action="finish"]').click();
    if ((await get()).revision !== saved.revision || (await get()).balance !== before.balance) throw new Error('home-exit-settled-again');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    return { homeEditable: true, keyboard: true, exitIsLocal: true, noRepeatedReward: true };
}

export async function verifyBuildingTouch(page) {
    if (new URL(page.url()).port !== '18922') throw new Error('wrong-preview');
    const context = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    try {
        const touch = await context.newPage(); await touch.goto(page.url()); await touch.bringToFront();
        const frame = touch.frameLocator('iframe[title="OS"]');
        await frame.getByRole('button', { name: '游戏', exact: true }).tap();
        await frame.getByRole('button', { name: /^小白筑家 / }).tap();
        await frame.locator('.building-room[aria-busy="false"]').waitFor();
        await frame.locator('[data-build-action="homes"]').tap();
        await frame.locator('[data-build-action="remodel"]').tap();
        await frame.locator('[data-build-kind="path"]').tap();
        const get = async () => (await (await touch.request.get(new URL('/__building/view', touch.url()).href)).json()).result;
        const before = await get(), hall = before.active.rooms.find(p => p.kind === 'hall');
        const target = [{ x: hall.x, z: hall.z - 1 }, { x: hall.x - 1, z: hall.z }, { x: hall.x + 1, z: hall.z }].find(p => !before.active.rooms.some(r => r.x === p.x && r.z === p.z && r.y === 0));
        await frame.locator('[data-build-cell="' + target.x + ':0:' + target.z + '"]').tap();
        await frame.locator('.building-room[aria-busy="false"][data-build-presenting="false"]').waitFor();
        if ((await get()).active.rooms.length !== before.active.rooms.length + 1) throw new Error('touch-placement');
        await frame.locator('[data-build-action="undo"]').tap();
        await frame.locator('.building-room[aria-busy="false"]').waitFor();
        if (JSON.stringify((await get()).active.rooms) !== JSON.stringify(before.active.rooms)) throw new Error('touch-undo');
        await frame.locator('[data-build-action="desk"]').tap();
        await frame.locator('[data-build-action="start"]').tap();
        await frame.locator('[data-build-action="confirm"]').tap();
        for (const batch of [0,1,2]) {
            await frame.locator('[data-build-batch="' + batch + '"]').waitFor();
            await frame.locator('.building-room[aria-busy="false"][data-build-presenting="false"]').waitFor();
            await frame.locator('[data-build-pack="' + batch + '"]').tap();
        }
        await frame.locator('.build-tray').waitFor();
        if ((await get()).active.supply.remaining !== 0) throw new Error('touch-three-batches');
        return { touchPlacement: true, touchUndo: true, touchAutomaticBatches: true };
    } finally { await context.close(); await page.bringToFront(); }
}


// Read-only acceptance after fixture-seeding our preview; never reset or mutate the copied document.
export async function verifyRetainedBuilding(page) {
    if (new URL(page.url()).port !== '18922') throw new Error('wrong-preview');
    const get = async () => (await (await page.request.get(new URL('/__building/inspect', page.url()).href)).json()).result;
    const before = await get(), frame = page.frameLocator('iframe[title="OS"]');
    if (before.document.partitions.building.projects.length !== 5 || before.view.balance !== 430 || before.view.collection.length !== 4) throw new Error('not-retained-campaign');
    const expected = [['garden','room','room'],['study','garden'],['wide','room']];
    if (before.view.active.supply.remaining !== 1 || JSON.stringify(before.view.active.supply.offers) !== JSON.stringify(expected)) throw new Error('lost-pending-batch');
    await page.setViewportSize({width:390,height:844});
    await page.reload(); await page.bringToFront();
    await frame.getByRole('button', {name:'游戏',exact:true}).click();
    await frame.locator('[data-game-room="building"]').click();
    await frame.locator('.building-room[aria-busy="false"]').waitFor();
    await frame.locator('[data-build-batch="2"]').waitFor();
    await page.screenshot({path:'output/playwright/building-random-retained-batch.png'});
    await frame.locator('[data-build-action="desk"]').click();
    await frame.locator('[data-build-action="homes"]').click();
    if (await frame.locator('.build-collection button').count() !== before.view.collection.length) throw new Error('missing-retained-house');
    await frame.locator('.build-collection button').first().click();
    await frame.locator('[data-build-action="return"]').waitFor();
    await page.screenshot({path:'output/playwright/building-random-retained-home.png'});
    await frame.locator('[data-build-action="return"]').click();
    await frame.locator('[data-build-batch="2"]').waitFor();
    await frame.locator('[data-build-action="desk"]').click();
    await page.screenshot({path:'output/playwright/building-random-retained-desk.png'});
    await frame.locator('[data-build-action="resume"]').click();
    await frame.locator('[data-build-batch="2"]').waitFor();
    const after = await get();
    if (JSON.stringify(after.document) !== JSON.stringify(before.document)) throw new Error('read-mutated-retained-data');
    return {houses:after.document.partitions.building.projects.length,balance:after.view.balance,pendingBatchPreserved:true,unchangedDocument:true};
}
