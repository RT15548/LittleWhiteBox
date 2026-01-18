// image-live-effect.js
// Live Photo - 柔和分区 + 亮度感知

import { extensionFolderPath } from "../../core/constants.js";

let PIXI = null;
let pixiLoading = null;
const activeEffects = new Map();

async function ensurePixi() {
    if (PIXI) return PIXI;
    if (pixiLoading) return pixiLoading;
    
    pixiLoading = new Promise((resolve, reject) => {
        if (window.PIXI) { PIXI = window.PIXI; resolve(PIXI); return; }
        const script = document.createElement('script');
        script.src = `${extensionFolderPath}/libs/pixi.min.js`;
        script.onload = () => { PIXI = window.PIXI; resolve(PIXI); };
        script.onerror = () => reject(new Error('PixiJS 加载失败'));
        // eslint-disable-next-line no-unsanitized/method
        document.head.appendChild(script);
    });
    return pixiLoading;
}

// ═══════════════════════════════════════════════════════════════════════════
// 着色器 - 柔和分区 + 亮度感知
// ═══════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat3 projectionMatrix;
varying vec2 vTextureCoord;
void main() {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uTime;
uniform float uIntensity;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
    );
}

float zone(float v, float start, float end) {
    return smoothstep(start, start + 0.08, v) * (1.0 - smoothstep(end - 0.08, end, v));
}

float skinDetect(vec4 color) {
    float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    float warmth = color.r - color.b;
    return smoothstep(0.3, 0.6, brightness) * smoothstep(0.0, 0.15, warmth);
}

void main() {
    vec2 uv = vTextureCoord;
    float v = uv.y;
    float u = uv.x;
    float centerX = abs(u - 0.5);
    
    vec4 baseColor = texture2D(uSampler, uv);
    float skin = skinDetect(baseColor);
    
    vec2 offset = vec2(0.0);
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🛡️ 头部保护 (Y: 0 ~ 0.30)
    // ═══════════════════════════════════════════════════════════════════════
    float headLock = 1.0 - smoothstep(0.0, 0.30, v);
    float headDampen = mix(1.0, 0.05, headLock);
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🫁 全局呼吸
    // ═══════════════════════════════════════════════════════════════════════
    float breath = sin(uTime * 0.8) * 0.004;
    offset += (uv - 0.5) * breath * headDampen;
    
    // ═══════════════════════════════════════════════════════════════════════
    // 👙 胸部区域 (Y: 0.35 ~ 0.55) - 呼吸起伏
    // ═══════════════════════════════════════════════════════════════════════
    float chestZone = zone(v, 0.35, 0.55);
    float chestCenter = 1.0 - smoothstep(0.0, 0.35, centerX);
    float chestStrength = chestZone * chestCenter;
    
    float breathRhythm = sin(uTime * 1.0) * 0.6 + sin(uTime * 2.0) * 0.4;
    
    // 纵向起伏
    float chestY = breathRhythm * 0.010 * (1.0 + skin * 0.7);
    offset.y += chestY * chestStrength * uIntensity;
    
    // 横向微扩
    float chestX = breathRhythm * 0.005 * (u - 0.5);
    offset.x += chestX * chestStrength * uIntensity * (1.0 + skin * 0.4);
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🍑 腰臀区域 (Y: 0.55 ~ 0.75) - 轻微摇摆
    // ═══════════════════════════════════════════════════════════════════════
    float hipZone = zone(v, 0.55, 0.75);
    float hipCenter = 1.0 - smoothstep(0.0, 0.4, centerX);
    float hipStrength = hipZone * hipCenter;
    
    // 左右轻晃
    float hipSway = sin(uTime * 0.6) * 0.008;
    offset.x += hipSway * hipStrength * uIntensity * (1.0 + skin * 0.4);
    
    // 微弱弹动
    float hipBounce = sin(uTime * 1.0 + 0.3) * 0.006;
    offset.y += hipBounce * hipStrength * uIntensity * (1.0 + skin * 0.6);
    
    // ═══════════════════════════════════════════════════════════════════════
    // 👗 底部区域 (Y: 0.75+) - 轻微飘动
    // ═══════════════════════════════════════════════════════════════════════
    float bottomZone = smoothstep(0.73, 0.80, v);
    float bottomStrength = bottomZone * (v - 0.75) * 2.5;
    
    float bottomWave = sin(uTime * 1.2 + u * 5.0) * 0.012;
    offset.x += bottomWave * bottomStrength * uIntensity;    
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🌊 环境流动 - 极轻微
    // ═══════════════════════════════════════════════════════════════════════
    float ambient = noise(uv * 2.5 + uTime * 0.15) * 0.003;
    offset.x += ambient * headDampen * uIntensity;
    offset.y += noise(uv * 3.0 - uTime * 0.12) * 0.002 * headDampen * uIntensity;
    
    // ═══════════════════════════════════════════════════════════════════════
    // 应用偏移
    // ═══════════════════════════════════════════════════════════════════════
    vec2 finalUV = clamp(uv + offset, 0.001, 0.999);
    
    gl_FragColor = texture2D(uSampler, finalUV);
}`;

// ═══════════════════════════════════════════════════════════════════════════
// Live 效果类
// ═══════════════════════════════════════════════════════════════════════════

class ImageLiveEffect {
    constructor(container, imageSrc) {
        this.container = container;
        this.imageSrc = imageSrc;
        this.app = null;
        this.sprite = null;
        this.filter = null;
        this.canvas = null;
        this.running = false;
        this.destroyed = false;
        this.startTime = Date.now();
        this.intensity = 1.0;
        this._boundAnimate = this.animate.bind(this);
    }
    
    async init() {
        const wrap = this.container.querySelector('.xb-nd-img-wrap');
        const img = this.container.querySelector('img');
        if (!wrap || !img) return false;
        
        const rect = img.getBoundingClientRect();
        this.width = Math.round(rect.width);
        this.height = Math.round(rect.height);
        if (this.width < 50 || this.height < 50) return false;
        
        try {
            this.app = new PIXI.Application({
                width: this.width,
                height: this.height,
                backgroundAlpha: 0,
                resolution: 1,
                autoDensity: true,
            });
            
            this.canvas = document.createElement('div');
            this.canvas.className = 'xb-nd-live-canvas';
            this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;';
            this.app.view.style.cssText = 'width:100%;height:100%;display:block;';
            this.canvas.appendChild(this.app.view);
            wrap.appendChild(this.canvas);
            
            const texture = await this.loadTexture(this.imageSrc);
            if (!texture || this.destroyed) { this.destroy(); return false; }
            
            this.sprite = new PIXI.Sprite(texture);
            this.sprite.width = this.width;
            this.sprite.height = this.height;
            
            this.filter = new PIXI.Filter(VERTEX_SHADER, FRAGMENT_SHADER, {
                uTime: 0,
                uIntensity: this.intensity,
            });
            this.sprite.filters = [this.filter];
            this.app.stage.addChild(this.sprite);
            
            img.style.opacity = '0';
            this.container.classList.add('mode-live');
            this.start();
            return true;
        } catch (e) {
            console.error('[Live] init error:', e);
            this.destroy();
            return false;
        }
    }
    
    loadTexture(src) {
        return new Promise((resolve) => {
            if (this.destroyed) { resolve(null); return; }
            try {
                const texture = PIXI.Texture.from(src);
                if (texture.baseTexture.valid) resolve(texture);
                else {
                    texture.baseTexture.once('loaded', () => resolve(texture));
                    texture.baseTexture.once('error', () => resolve(null));
                }
            } catch { resolve(null); }
        });
    }
    
    start() {
        if (this.running || this.destroyed) return;
        this.running = true;
        this.app.ticker.add(this._boundAnimate);
    }
    
    stop() {
        this.running = false;
        this.app?.ticker?.remove(this._boundAnimate);
    }
    
    animate() {
        if (this.destroyed || !this.filter) return;
        this.filter.uniforms.uTime = (Date.now() - this.startTime) / 1000;
    }
    
    setIntensity(value) {
        this.intensity = Math.max(0, Math.min(2, value));
        if (this.filter) this.filter.uniforms.uIntensity = this.intensity;
    }
    
    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        this.stop();
        this.container?.classList.remove('mode-live');
        const img = this.container?.querySelector('img');
        if (img) img.style.opacity = '';
        this.canvas?.remove();
        this.app?.destroy(true, { children: true, texture: false });
        this.app = null;
        this.sprite = null;
        this.filter = null;
        this.canvas = null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════════════════

export async function toggleLiveEffect(container) {
    const existing = activeEffects.get(container);
    const btn = container.querySelector('.xb-nd-live-btn');
    
    if (existing) {
        existing.destroy();
        activeEffects.delete(container);
        btn?.classList.remove('active');
        return false;
    }
    
    btn?.classList.add('loading');
    
    try {
        await ensurePixi();
        const img = container.querySelector('img');
        if (!img?.src) { btn?.classList.remove('loading'); return false; }
        
        const effect = new ImageLiveEffect(container, img.src);
        const success = await effect.init();
        btn?.classList.remove('loading');
        
        if (success) {
            activeEffects.set(container, effect);
            btn?.classList.add('active');
            return true;
        }
        return false;
    } catch (e) {
        console.error('[Live] failed:', e);
        btn?.classList.remove('loading');
        return false;
    }
}

export function destroyLiveEffect(container) {
    const effect = activeEffects.get(container);
    if (effect) {
        effect.destroy();
        activeEffects.delete(container);
        container.querySelector('.xb-nd-live-btn')?.classList.remove('active');
    }
}

export function destroyAllLiveEffects() {
    activeEffects.forEach(e => e.destroy());
    activeEffects.clear();
}

export function isLiveActive(container) {
    return activeEffects.has(container);
}

export function getEffect(container) {
    return activeEffects.get(container);
}
