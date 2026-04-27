import { normalizePermissionMode } from '../shared/config.js';

export function normalizeSlashCommand(command) {
    const normalized = String(command || '').trim();
    if (!normalized) return '';
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

export function getSlashCommandName(command) {
    const normalized = normalizeSlashCommand(command);
    if (!normalized) return '';
    const body = normalized.slice(1).trim();
    if (!body) return '';
    return body.split(/\s+/)[0].toLowerCase();
}

export function normalizeSlashSkillTrigger(command) {
    const name = getSlashCommandName(command);
    return name ? `/${name}` : '';
}

export function shouldRequireSlashCommandApproval(command, permissionMode = 'default') {
    const normalized = normalizeSlashCommand(command);
    if (!normalized) return false;
    return normalizePermissionMode(permissionMode) !== 'full';
}
