import { computed, ref } from 'vue';

export type MaterialSymbolFontStatus = 'idle' | 'loading' | 'ready' | 'failed';

const MATERIAL_SYMBOL_FONT_FAMILY = 'Material Symbols Rounded';
const MATERIAL_SYMBOL_FONT_FILE = 'libs/material-symbols/material-symbols-rounded.woff2';
const DEFAULT_FONT_LOAD_TIMEOUT_MS = 5000;

function normalizeExtensionBasePath(value: unknown): string {
    const raw = String(value || '').trim().replace(/\/+$/g, '');
    if (!raw) {return '';}
    return raw.startsWith('/') ? raw : `/${raw}`;
}

function timeoutError(): Error {
    return new Error('material_symbols_font_timeout');
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timer = 0;
    try {
        return await Promise.race([
            promise,
            new Promise<T>((_resolve, reject) => {
                timer = window.setTimeout(() => reject(timeoutError()), timeoutMs);
            }),
        ]);
    } finally {
        if (timer) {window.clearTimeout(timer);}
    }
}

export function useMaterialSymbolFont(options: {
    timeoutMs?: number;
} = {}) {
    const status = ref<MaterialSymbolFontStatus>('idle');
    const error = ref('');
    const ready = computed(() => status.value === 'ready');
    const timeoutMs = Math.max(1000, Number(options.timeoutMs) || DEFAULT_FONT_LOAD_TIMEOUT_MS);
    let loadToken = 0;
    let loadedBasePath = '';

    async function load(extensionBasePath: unknown): Promise<void> {
        const basePath = normalizeExtensionBasePath(extensionBasePath);
        if (!basePath) {
            status.value = 'failed';
            error.value = 'material_symbols_base_path_missing';
            return;
        }
        if (status.value === 'ready' && loadedBasePath === basePath) {return;}
        const token = loadToken + 1;
        loadToken = token;
        status.value = 'loading';
        error.value = '';
        try {
            if (typeof FontFace !== 'function' || !document.fonts?.add) {
                throw new Error('material_symbols_fontface_unavailable');
            }
            const fontUrl = `${basePath}/${MATERIAL_SYMBOL_FONT_FILE}`;
            const font = new FontFace(MATERIAL_SYMBOL_FONT_FAMILY, `url("${fontUrl}")`, {
                display: 'block',
                style: 'normal',
                weight: '300',
            });
            const loadedFont = await withTimeout(font.load(), timeoutMs);
            if (token !== loadToken) {return;}
            document.fonts.add(loadedFont);
            loadedBasePath = basePath;
            status.value = 'ready';
        } catch (loadError) {
            if (token !== loadToken) {return;}
            status.value = 'failed';
            error.value = loadError instanceof Error ? loadError.message : String(loadError || 'material_symbols_font_failed');
        }
    }

    return {
        error,
        load,
        ready,
        status,
    };
}
