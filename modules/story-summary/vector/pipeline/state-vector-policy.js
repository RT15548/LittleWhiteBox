function hasValidVectorPair(item) {
    const vectorValid = typeof item?.vectorValid === 'boolean'
        ? item.vectorValid
        : item?.vector?.length > 0;
    const rVectorValid = typeof item?.rVectorValid === 'boolean'
        ? item.rVectorValid
        : item?.rVector?.length > 0;
    return vectorValid && rVectorValid;
}

export function selectMissingStateVectorAtoms(atoms, stateVectors, fingerprint) {
    const currentFingerprint = String(fingerprint || '');
    const validIds = new Set((Array.isArray(stateVectors) ? stateVectors : [])
        .filter(item => (
            item?.atomId
            && item.fingerprint === currentFingerprint
            && hasValidVectorPair(item)
        ))
        .map(item => item.atomId));

    return (Array.isArray(atoms) ? atoms : [])
        .filter(atom => atom?.atomId && !validIds.has(atom.atomId));
}

export function canRepairStateVectors(metaFingerprint, currentFingerprint) {
    const stored = String(metaFingerprint || '');
    return !stored || stored === String(currentFingerprint || '');
}
