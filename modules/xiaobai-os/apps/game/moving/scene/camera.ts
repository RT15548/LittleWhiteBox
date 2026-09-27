import { Box3, OrthographicCamera, Vector3 } from 'three';

export const INITIAL_YAW = .42;
export function createMovingCamera() { return new OrthographicCamera(-7, 7, 7, -7, .1, 100); }

export function fitMovingCamera(camera: OrthographicCamera, width: number, height: number, yaw: number) {
    camera.position.set(Math.sin(yaw) * 18, 13.5, Math.cos(yaw) * 18);
    camera.lookAt(0, 1, .1); camera.updateMatrixWorld(true);
    const bounds = new Box3(new Vector3(-4.8, -.8, -3.7), new Vector3(4.8, 4.7, 4.4));
    let horizontal = 0, vertical = 0;
    for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
            for (const z of [bounds.min.z, bounds.max.z]) {
                const p = new Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse);
                horizontal = Math.max(horizontal, Math.abs(p.x)); vertical = Math.max(vertical, Math.abs(p.y));
            }
        }
    }
    const aspect = width / height;
    const extent = Math.max(vertical, horizontal / aspect) * 1.035;
    camera.top = extent; camera.bottom = -extent; camera.left = -extent * aspect; camera.right = -camera.left;
    camera.updateProjectionMatrix();
}
