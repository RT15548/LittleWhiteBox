export { workspaceImageObservations } from '../../assistant/shared/workspace-images.js';
import { createAssistantDrawing } from './service.js';
import { DRAW_IMAGE, DRAW_PRESETS, SAVE_DRAW_IMAGES } from './contract.js';
import { writeWorkspaceImages, observeWorkspaceImagePaths } from '../../assistant/shared/workspace-images.js';
const drawing = createAssistantDrawing({ getApi: () => window.xiaobaixDraw, writeImages: writeWorkspaceImages, observePaths: observeWorkspaceImagePaths });
export function runAssistantDrawing(name, args, options) {
    if (name === DRAW_IMAGE) return drawing.generate(args, options);
    if (name === DRAW_PRESETS) return drawing.presets(args);
    if (name === SAVE_DRAW_IMAGES) return drawing.save(args);
    throw new Error('drawing_tool_unknown');
}
