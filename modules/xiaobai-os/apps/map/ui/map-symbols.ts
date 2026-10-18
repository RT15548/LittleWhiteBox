import { pluginAsset } from '../../../../../core/build-assets.js';
let loading: Promise<FontFace> | undefined;
export async function loadMapSymbols(): Promise<void> {
    if (!loading) {
        const url = new URL(pluginAsset('libs/material-symbols/material-symbols-rounded.woff2'));
        loading = new FontFace('Xiaobai Map Symbols', `url("${url.href}")`, { display: 'block', weight: '400' }).load();
        loading.catch(() => {loading = undefined;});
    }
    document.fonts.add(await loading);
}
