export function transferEventDetailRuntimeLease(context, lease, enabled) {
    if (!enabled || !context || !lease) return lease || null;
    if (context.runtimeLease) throw new Error('event detail runtime lease already transferred');
    context.runtimeLease = lease;
    return null;
}

export async function releaseEventDetailRuntimeLease(context, release) {
    const lease = context?.runtimeLease || null;
    if (!lease) return false;
    context.runtimeLease = null;
    await release(lease);
    return true;
}
