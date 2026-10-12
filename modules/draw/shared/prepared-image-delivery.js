// Native reply images survive an unsaved/missing placement, never an explicit
// deletion. Both live execution and journal recovery use these same checkpoints.
export async function deliverPreparedImage({ retainWithoutSlot, resolveTarget, guard,
    isDiscarded, persist, remove, select, clearSelection, commitDelivery }) {
    const discarded = async () => isDiscarded(await guard());
    const removeResult = async () => {
        await remove();
        await clearSelection?.();
        await commitDelivery?.();
        return false;
    };
    if (await discarded()) return removeResult();
    let target = resolveTarget();
    if (!target && !retainWithoutSlot) return removeResult();
    await persist(target);
    if (await discarded()) return removeResult();
    target = resolveTarget();
    if (!target && !retainWithoutSlot) return removeResult();
    if (target) {
        await select();
        if (await discarded()) return removeResult();
        if (!resolveTarget()) {
            await clearSelection?.();
            if (!retainWithoutSlot) return removeResult();
        }
    }
    await commitDelivery?.();
    return true;
}
