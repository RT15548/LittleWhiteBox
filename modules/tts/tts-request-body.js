/** Provider wire format shared by downloaded and streaming speech. */
export function buildTtsV3Body({
    uid = 'st_user', text, speaker, model, format = 'mp3', sampleRate = 24000,
    speechRate = 0, loudnessRate = 0, emotion, emotionScale, contextTexts, explicitLanguage,
    disableMarkdownFilter = true, disableEmojiFilter, enableLanguageDetector,
    maxLengthToFilterParenthesis, postProcessPitch, cacheConfig,
}) {
    const additions = {};
    if (contextTexts !== undefined) additions.context_texts = contextTexts;
    if (explicitLanguage !== undefined) additions.explicit_language = explicitLanguage;
    if (disableMarkdownFilter !== undefined) additions.disable_markdown_filter = disableMarkdownFilter;
    if (disableEmojiFilter !== undefined) additions.disable_emoji_filter = disableEmojiFilter;
    if (enableLanguageDetector !== undefined) additions.enable_language_detector = enableLanguageDetector;
    if (Number.isFinite(maxLengthToFilterParenthesis)) additions.max_length_to_filter_parenthesis = maxLengthToFilterParenthesis;
    if (Number.isFinite(postProcessPitch)) additions.post_process = { pitch: postProcessPitch };
    if (cacheConfig) additions.cache_config = cacheConfig;
    const body = {
        user: { uid },
        req_params: { text, speaker, audio_params: { format, sample_rate: sampleRate, speech_rate: speechRate, loudness_rate: loudnessRate } },
    };
    if (model) body.req_params.model = model;
    if (emotion) Object.assign(body.req_params.audio_params, { emotion, emotion_scale: emotionScale ?? 4 });
    if (Object.keys(additions).length) body.req_params.additions = JSON.stringify(additions);
    return body;
}
