import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
export const decoderAssetPaths = {
    'image/png': '@jsquash/png/codec/pkg/squoosh_png_bg.wasm',
    'image/jpeg': '@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm',
    'image/webp': '@jsquash/webp/codec/dec/webp_dec.wasm',
};

export const loadDecoderAsset = mime => readFile(require.resolve(decoderAssetPaths[mime]));
