import { extension_settings } from '../../../../../../extensions.js';
import { extension_prompts } from '../../../../../../../script.js';

// SillyTavern adds extension-owned keys at runtime; its JS initializers are not the registry schema.
export const extensionSettings = extension_settings as Record<string, unknown>;
export const extensionPrompts = extension_prompts as Record<string, Record<string, unknown>>;
