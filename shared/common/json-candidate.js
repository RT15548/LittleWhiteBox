/**
 * Probe text that may also be a supported non-JSON format.
 * @param {string} text
 * @returns {{ ok: true, value: any } | { ok: false, error: unknown }}
 */
export function tryParseJson(text) {
    try {
        return { ok: true, value: JSON.parse(text) };
    } catch (error) {
        return { ok: false, error };
    }
}
