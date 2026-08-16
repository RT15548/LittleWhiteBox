export function transferDirectEvidenceRuntimeLease(context, lease, enabled) {
    if (!enabled || !context || !lease) return lease || null;
    if (context.runtimeLease) throw new Error('direct evidence runtime lease already transferred');
    context.runtimeLease = lease;
    return null;
}

export async function releaseDirectEvidenceRuntimeLease(context, release) {
    const lease = context?.runtimeLease || null;
    if (!lease) return false;
    context.runtimeLease = null;
    await release(lease);
    return true;
}
