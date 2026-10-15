import * as T from 'three';

// Camera-only visibility aid. It never changes world perception, collision or
// shadows. Uniforms follow the already-confirmed player's visual position.
export function createCutaway() {
    const focus = { value: new T.Vector3() }, towardCamera = { value: new T.Vector3() };
    const materials = new Map<T.MeshStandardMaterial, T.MeshStandardMaterial>();
    function material(source: T.MeshStandardMaterial) {
        let result = materials.get(source);
        if (result) { return result; }
        result = source.clone();
        result.onBeforeCompile = shader => {
            shader.uniforms.cutawayFocus = focus; shader.uniforms.cutawayCamera = towardCamera;
            shader.vertexShader = `varying vec3 vCutawayPosition;\n${shader.vertexShader}`.replace('#include <project_vertex>', `
                vec4 cutawayWorld = vec4(transformed, 1.);
                #ifdef USE_INSTANCING
                    cutawayWorld = instanceMatrix * cutawayWorld;
                #endif
                vCutawayPosition = (modelMatrix * cutawayWorld).xyz;
                #include <project_vertex>`);
            shader.fragmentShader = `varying vec3 vCutawayPosition; uniform vec3 cutawayFocus; uniform vec3 cutawayCamera;\n${shader.fragmentShader}`
                .replace('#include <alphatest_fragment>', `#include <alphatest_fragment>
                    vec3 gap = vCutawayPosition - cutawayFocus;
                    float depth = dot(gap, cutawayCamera);
                    float radius = length(gap - depth * cutawayCamera);
                    float opening = (1. - smoothstep(.6, 1.65, radius)) * step(.3, depth);
                    float grain = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(.06711056, .00583715))));
                    if(grain < opening * .92) discard;`);
        };
        materials.set(source, result); return result;
    }
    return { material, get materials() { return [...materials.values()]; }, apply(root: T.Object3D) {
        root.traverse(object => { if (object instanceof T.Mesh && object.material instanceof T.MeshStandardMaterial) { object.material = material(object.material); } });
    }, update(player: T.Vector3, camera: T.Camera) {
        focus.value.copy(player).y += .9; towardCamera.value.copy(camera.position).sub(focus.value).normalize();
    }, dispose() { for (const m of materials.values()) { m.dispose(); } materials.clear(); } };
}
export type Cutaway = ReturnType<typeof createCutaway>;
