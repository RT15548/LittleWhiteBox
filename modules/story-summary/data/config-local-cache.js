import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';

export const SUMMARY_CONFIG_LOCAL_STORAGE_KEY = 'summary_panel_config';

// Host and iframe share an optional cache, never the server save receipt.
export function writeSummaryConfigLocalCache(config, warn) {
    const serialized = JSON.stringify(config);
    try {
        localStorage.setItem(SUMMARY_CONFIG_LOCAL_STORAGE_KEY, serialized);
    } catch (error) {
        // Only the browser failure category is diagnostic; configuration and
        // exception messages may contain credentials and must not be logged.
        warn(SUMMARY_FEEDBACK_COPY.configLocalCacheUnavailable, error.name);
    }
}
