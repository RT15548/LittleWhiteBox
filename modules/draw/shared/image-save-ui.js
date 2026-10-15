const SAVE_LABEL = '保存到服务器';
const SAVING_LABEL = '保存中...';

// Draw-owned static markup, shared by image cards, provider transitions and the gallery.
const SAVE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-0.125em"><path d="M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10Z"/><path d="M7 3v6h7V3M7 21v-8h10v8"/></svg>';

export const IMAGE_SAVE_BUTTON_HTML = `<button type="button" data-action="save-image" title="${SAVE_LABEL}" aria-label="${SAVE_LABEL}">${SAVE_ICON}</button>`;
export const IMAGE_SAVE_LABEL_HTML = `${SAVE_ICON} ${SAVE_LABEL}`;
export const IMAGE_SAVING_INDICATOR_HTML = `<div class="xb-nd-indicator">${SAVE_ICON} ${SAVING_LABEL}</div>`;
