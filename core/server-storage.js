import { getRequestHeaders } from '../../../../../script.js';
import { debounce } from '../../../../utils.js';
import { StorageFile } from './storage-file.js';

const createStorage = (filename, opts = {}) => new StorageFile(filename, {
    ...opts,
    getRequestHeaders,
    debounce,
});

export const TasksStorage = createStorage('LittleWhiteBox_Tasks.json');
export const StoryOutlineStorage = createStorage('LittleWhiteBox_StoryOutline.json');
export const NovelDrawStorage = createStorage('LittleWhiteBox_NovelDraw.json', { debounceMs: 800 });
export const SdDrawStorage = createStorage('LittleWhiteBox_SdDraw.json', { debounceMs: 800 });
export const ComfyDrawStorage = createStorage('LittleWhiteBox_ComfyDraw.json', { debounceMs: 800 });
export const AssistantStorage = createStorage('LittleWhiteBox_Assistant.json', { debounceMs: 800 });
export const TtsStorage = createStorage('LittleWhiteBox_TTS.json', { debounceMs: 800 });
export const EnaPlannerStorage = createStorage('LittleWhiteBox_EnaPlanner.json', { debounceMs: 800 });
export const CommonSettingStorage = createStorage('LittleWhiteBox_CommonSettings.json', { debounceMs: 1000 });
export const VectorStorage = createStorage('LittleWhiteBox_Vectors.json', { debounceMs: 3000 });
