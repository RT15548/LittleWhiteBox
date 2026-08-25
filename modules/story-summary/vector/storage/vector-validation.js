export function assertFiniteVector(vector, label = 'vector', expectedDimensions = null) {
    const supported = Array.isArray(vector) || ArrayBuffer.isView(vector);
    const dimensions = Number(vector?.length);
    if (
        !supported
        || !Number.isInteger(dimensions)
        || dimensions <= 0
        || (expectedDimensions != null && dimensions !== expectedDimensions)
    ) {
        throw new TypeError(`${label} has invalid dimensions`);
    }
    for (let i = 0; i < dimensions; i++) {
        if (
            typeof vector[i] !== 'number'
            || !Number.isFinite(vector[i])
            || !Number.isFinite(Math.fround(vector[i]))
        ) {
            throw new TypeError(`${label} contains a non-finite value`);
        }
    }
    return dimensions;
}
