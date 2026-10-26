const EJS_ERRORS = {
    unavailable: '剧情规划提示词使用了 EJS，请安装并启用“提示词模板”扩展后重试。',
    failed: '剧情规划的 EJS 求值失败',
};

/** Use the extension's own variable context and async getwi implementation. */
export async function renderPlannerEjs(text, template = globalThis.EjsTemplate) {
    const content = String(text ?? '');
    if (!content.includes('<%')) return content;
    if (typeof template?.evalTemplate !== 'function' || template.getFeatures?.().enabled === false) {
        throw Object.assign(new Error(EJS_ERRORS.unavailable), { code: 'PLANNER_EJS_UNAVAILABLE' });
    }
    try {
        return await template.evalTemplate(content);
    } catch (cause) {
        throw Object.assign(new Error(`${EJS_ERRORS.failed}：${cause?.message || cause}`, { cause }), {
            code: 'PLANNER_EJS_FAILED',
        });
    }
}
