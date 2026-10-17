// The camera sits at a fixed offset from the player, so screen directions map to fixed world directions.
export const CAMERA_OFFSET = { x: 10, y: 25, z: 32 } as const;

/**
 * Converts a screen-space direction (x right, y down) into a world-space direction on the ground
 * plane. Game coordinates are metres with y running along the three.js z axis.
 */
export function screenToWorld(x: number, y: number) {
    const length = Math.hypot(CAMERA_OFFSET.x, CAMERA_OFFSET.z);
    const forward = { x: -CAMERA_OFFSET.x / length, z: -CAMERA_OFFSET.z / length };
    const right = { x: -forward.z, z: forward.x };
    return { x: right.x * x - forward.x * y, y: right.z * x - forward.z * y };
}
