import { readTextPreview } from '../../../../agent-core/runtime/text-preview.js';
import { OS_SOURCE_LIMITS as LIMITS } from '../domain/source-code.js';

export function sourceTextPreview(response: Response, current: () => void, lineLimit: number, tail: boolean) {
    return readTextPreview(response, {
        lineLimit,
        extraLines: LIMITS.headExtraLines,
        charLimit: LIMITS.readChars + LIMITS.lineChars * 2,
        lineChars: LIMITS.lineChars,
        tail,
        assertCurrent: current,
    });
}
