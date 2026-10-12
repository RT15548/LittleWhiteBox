export async function buildPlannerTurnMessages(userContent, promptBlocks, render) {
    const parts = [userContent];
    for (const block of promptBlocks) {
        if (block?.role !== 'user' || !String(block.content ?? '').trim()) continue;
        parts.push(await render(block.content));
    }
    return [{ role: 'user', content: parts.join('\n\n') }];
}
