import path from 'node:path';
import { collectSourceFiles } from '../workspace-files.mjs';

export const root = path.resolve(import.meta.dirname, '../..');
export const entries = {
    'host/plugin': 'plugin-entry.js',
    'apps/novel-draw': 'modules/draw/providers/novelai/novel-draw-page.js',
    'apps/tts-settings': 'modules/tts/tts-settings-page.js',
    'apps/debug-panel': 'modules/debug-panel/debug-panel-page.js',
    'apps/ena-planner': 'modules/ena-planner/ena-planner-page.js',
    'apps/story-outline': 'modules/story-outline/story-outline-page.js',
    'apps/tavern': 'modules/tavern/app-src/main.ts',
    'apps/assistant': 'modules/assistant/app-src/main.js',
    'apps/ebook': 'modules/ebook/app-src/main.js',
    'apps/story-summary': 'modules/story-summary/story-summary-ui.js',
    'apps/xiaobai-os': 'modules/xiaobai-os/shell/app-src/main.ts',
    'runtime/os-agent': 'modules/xiaobai-os/agent/browser-entry.ts',
    'runtime/map-projection': 'modules/xiaobai-os/apps/map/ui/projection-entry.ts',
    'runtime/agent-core': 'modules/agent-core/browser-entry.js',
    'runtime/assistant-jsapi': 'modules/assistant/runtime-src/jsapi-runtime.js',
    'runtime/call-generate': 'bridges/call-generate-service.js',
    'runtime/worldbook': 'bridges/worldbook-bridge.js',
    'runtime/context': 'bridges/context-bridge.js',
    'runtime/draw-settings': 'modules/draw/shared/settings-page.js',
};

// These are design/asset-authoring pages, not plugin pages. They still receive lint.
const developmentPages = new Set([
    'modules/xiaobai-os/docs/prototypes/xiaobai-space-2d.html',
]);
export function discoverPages(directory) {
    return collectSourceFiles(directory, new Set(['.html']))
        .map(file => path.relative(directory, file).split(path.sep).join('/'))
        .filter(file => !developmentPages.has(file));
}
export const pages = discoverPages(root);
