import { StorageFile } from '../../../../core/storage-file.js';
import { getRequestHeaders } from '../../../../../../../../script.js';
import { providerDefinition } from './settings-model.js';
import { createSettingsRepository } from './settings-repository.js';

const stores = new Map();
const repository = createSettingsRepository(provider => {
    providerDefinition(provider);
    if (!stores.has(provider)) stores.set(provider, new StorageFile(`LittleWhiteBox_Draw_${provider}.json`, { getRequestHeaders }));
    return stores.get(provider);
});
export const getSettings = repository.get;
export const loadSettings = repository.load;
export const saveSettings = repository.save;
export const updateSettingsPersistent = repository.update;
export const subscribeSettings = repository.subscribe;
