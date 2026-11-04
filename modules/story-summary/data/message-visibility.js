// The host owns is_system; Story Summary owns only its automatic-range mark.
// A manually hidden message keeps its floor but supplies no new memory input.
export const SUMMARY_HIDDEN_KEY = 'xb_summary_hidden';

export function isUserHidden(message) {
    return !!message?.is_system && message[SUMMARY_HIDDEN_KEY] !== true;
}
