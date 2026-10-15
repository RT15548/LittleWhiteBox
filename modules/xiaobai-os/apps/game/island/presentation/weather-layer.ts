import * as T from 'three';

export function createWeatherLayer(scene: T.Scene) {
    const count = 240, positions = new Float32Array(count * 6), geometry = new T.BufferGeometry();
    const material = new T.LineBasicMaterial({ color: '#d6e9ee', transparent: true, opacity: .45, depthWrite: false });
    const rain = new T.LineSegments(geometry, material); rain.frustumCulled = false; rain.visible = false; scene.add(rain);
    const points = new T.BufferAttribute(positions, 3); points.setUsage(T.DynamicDrawUsage); geometry.setAttribute('position', points);
    return {
        setRain(value: boolean) { rain.visible = value; },
        animate(time: number, center: T.Vector3) {
            if (!rain.visible) { return; }
            rain.position.copy(center);
            for (let i = 0; i < count; i++) {
                const x = ((i * 17.137) % 1) * 55 - 27.5, z = ((i * 9.753) % 1) * 55 - 27.5;
                const y = 20 - ((time * 11 + i * 2.793) % 20), drift = y * .16, at = i * 6;
                positions[at] = x + drift; positions[at + 1] = y; positions[at + 2] = z;
                positions[at + 3] = x + drift - .14; positions[at + 4] = y - .9; positions[at + 5] = z;
            }
            points.needsUpdate = true;
        },
        dispose() { scene.remove(rain); geometry.dispose(); material.dispose(); },
    };
}
