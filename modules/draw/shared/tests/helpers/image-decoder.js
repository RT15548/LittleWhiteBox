import { Buffer } from 'node:buffer';
import { MediaApiError } from '../../../../../shared/media-api.js';
import { isDecodableImage } from '../../../server/providers/image-decoder.mjs';

export async function decodeFixtureImage(blob) {
    if (!await isDecodableImage(Buffer.from(await blob.arrayBuffer()), blob.type)) throw new MediaApiError('invalid_result');
}
