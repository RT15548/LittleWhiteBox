// 角色编辑区的共用界面文案（NovelAI 用 HTML 字符串、SD WebUI / ComfyUI 用 DOM API，两套渲染共用同一份措辞）。
// 纯文本常量，不依赖酒馆宿主模块。数据键（dynamicStates / dynstate）不变，这里只管用户看得到的字。

/** “附加标签”：角色 dynamicStates 列表在界面上的名字。 */
export const EXTRA_TAGS_COPY = Object.freeze({
    title: '附加标签',
    addAction: '添加附加标签',
    nameLabel: '附加标签名称',
    nameHint: '点击修改名称，如：草帽、脸红',
});

/** 固定外貌分区：正向 + 负向两个输入框放在同一个可折叠分区里。 */
export const FIXED_APPEARANCE_COPY = Object.freeze({
    title: '固定外貌',
    hint: '静态外貌描述，固定输入，不被 LLM 修改，负向非必选',
    positiveLabel: '正向',
    negativeLabel: '负向',
});

/** 条目标签输入框的标签（服装 / 附加标签共用）。 */
export const NAMED_TAG_TAGS_LABEL = '标签';

/** 列表为空时的极短提示。 */
export const NAMED_TAG_EMPTY_TEXT = '暂无';

/** 编辑区末尾的统一说明（整张角色卡只出现一次）；每个元素一行。 */
export const CHARACTER_EDITOR_NOTE_LINES = Object.freeze([
    '形态、服装、附加标签的名字非关键词调用，而是会发给 AI 的描述，可用自然语言写。',
    '形态示例：人形，兽形',
    '服装示例：常服，家居穿 / white shirt, pleated skirt；礼服，正式场合 / evening dress, lace gloves',
    '附加标签示例：草帽 / straw hat；脸红 / blush, looking away',
    '形态和服装只选其一，附加标签按画面选若干',
]);

function escapeText(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** HTML 版说明块（NovelAI 页面，插入前由调用方 sanitize）：行与行之间用 <br> 保留换行。 */
export function renderCharacterEditorNote() {
    return `<div class="char-edit-note">${CHARACTER_EDITOR_NOTE_LINES.map(escapeText).join('<br>')}</div>`;
}

/** DOM 版说明块（SD WebUI / ComfyUI）：文字用 \n 分行，样式里 white-space: pre-line。 */
export function createCharacterEditorNote(document) {
    const note = document.createElement('div');
    note.className = 'char-edit-note sd-char-editor-note';
    note.textContent = CHARACTER_EDITOR_NOTE_LINES.join('\n');
    return note;
}
