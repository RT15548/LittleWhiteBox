import * as T from 'three';
import { seaLevel } from '../terrain.js';
import { oceanGeometry } from './ocean-mesh.js';

export function createOcean(ground: T.BufferGeometry) {
    const uniforms = {
        time: { value: 0 }, level: { value: seaLevel(0) }, light: { value: 1 },
    };
    const root = new T.Group(), materials: T.ShaderMaterial[] = [];
    function material(overLand: boolean) {
        const surface = new T.ShaderMaterial({ transparent: overLand, depthWrite: !overLand,
            uniforms: { ...uniforms, overLand: { value: overLand } },
            vertexShader: `uniform float level; attribute float shoreMetres; varying vec3 p; varying float depth,shore;
                void main(){p=(modelMatrix*vec4(position,1.)).xyz;depth=level-p.y;shore=shoreMetres;p.y=level;
                gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`,
            fragmentShader: `uniform float time,level,light;uniform bool overLand;
                varying vec3 p;varying float depth,shore;
                float hash(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
                float noise(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);
                    return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
                void main(){
                    if(overLand && depth<=0.) discard;
                    vec2 drift=vec2(time*.055,-time*.038);
                    float broad=noise(p.xz*.18+drift),fine=noise(p.xz*1.65-drift*2.);
                    float ripple=noise(p.xz*3.2+drift*3.);
                    float waterDepth=overLand?depth:max(0.,level)+shore*.13;
                    vec3 shallow=vec3(.045,.32,.31),deep=vec3(.012,.095,.15);
                    vec3 c=mix(shallow,deep,smoothstep(0.,4.8,waterDepth));
                    float fleck=smoothstep(.74,.9,fine)*smoothstep(.50,.76,ripple);
                    c+=(broad-.5)*.035+vec3(.32,.47,.5)*fleck*.22;
                    float edge=overLand?depth*12.:shore;
                    float reach=overLand?1.-smoothstep(.025,.24,depth):(1.-smoothstep(.1,2.,shore))*(1.-smoothstep(0.,.08,level));
                    float breaker=pow(max(0.,sin(edge*2.1-time*.8+broad*.65)),12.);
                    float foam=reach*(breaker*(.45+.55*fine)+.1*smoothstep(.55,.8,ripple));
                    c=mix(c,vec3(.8,.9,.88),foam*.82)*light;
                    // Lose sight of the bed gradually before the outer coast, not at the mesh seam.
                    float alpha=overLand?mix(1.,mix(.28,.8,smoothstep(0.,1.2,depth))+foam*.15,smoothstep(0.,5.,shore))
                        *smoothstep(0.,.055,depth):1.;
                    gl_FragColor=vec4(c,alpha);
                    #include <tonemapping_fragment>
                    #include <colorspace_fragment>
                }` });
        materials.push(surface); return surface;
    }
    const open = new T.Mesh(oceanGeometry(), material(false)); root.add(open);
    // Reuse the exact triangulated bed heights. No shader reimplementation of the terrain.
    const inundation = new T.BufferGeometry();
    inundation.setAttribute('position', ground.getAttribute('position').clone());
    inundation.setAttribute('shoreMetres', ground.getAttribute('shoreMetres').clone());
    inundation.setIndex(ground.getIndex()!.clone());
    const shallows = new T.Mesh(inundation, material(true)); shallows.renderOrder = 1; root.add(shallows);
    for (const surface of [open, shallows]) { surface.frustumCulled = false; }
    return { root,
        update(tide: number, daylight: boolean, rain: boolean) {
            uniforms.level.value = seaLevel(tide); uniforms.light.value = daylight ? rain ? .72 : 1 : .22;
        },
        animate(seconds: number) { uniforms.time.value = seconds; },
        dispose() { root.removeFromParent(); open.geometry.dispose(); inundation.dispose(); for (const surface of materials) { surface.dispose(); } },
    };
}
