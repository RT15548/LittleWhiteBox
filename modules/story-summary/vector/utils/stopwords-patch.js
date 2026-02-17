// Small domain-level tuning surface.
// Keep this file tiny: add/remove only words that are repeatedly noisy in real logs.

// Extra stopwords on top of BASE_STOP_WORDS.
export const DOMAIN_STOP_WORDS = [];

// High-value words that must never be filtered as stopwords.
// Default to empty for plugin-wide deployment; entity names are already protected dynamically.
export const KEEP_WORDS = [];
