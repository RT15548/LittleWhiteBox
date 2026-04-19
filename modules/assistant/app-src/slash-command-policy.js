const READ_ONLY_SLASH_COMMANDS = new Set([
    'char-data',
    'char-get',
    'char-find',
    'clipboard-get',
    'extension-exists',
    'extension-installed',
    'extension-state',
    'findchar',
    'findentry',
    'getchatname',
    'getentryfield',
    'getglobalbooks',
    'getglobalvar',
    'getpromptentry',
    'getvar',
    'is-mobile',
    'len',
    'listinjects',
    'listvar',
    'member-count',
    'member-get',
    'messages',
    'tokens',
    'wi-get-timed-effect',
]);

const READ_ONLY_SLASH_COMMANDS_WITH_SAFE_FLAGS = new Set([
    'api',
    'api-url',
    'context',
    'getcharbook',
    'getchatbook',
    'getpersonabook',
    'instruct',
    'instruct-state',
    'model',
    'tokenizer',
]);

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

export function getSlashCommandTail(command) {
    const normalized = normalizeSlashCommand(command);
    if (!normalized) return '';
    const body = normalized.slice(1).trim();
    if (!body) return '';
    const firstWhitespace = body.search(/\s/);
    if (firstWhitespace < 0) return '';
    return body.slice(firstWhitespace + 1).trim();
}

export function tokenizeSlashCommandTail(tail) {
    const normalized = String(tail || '').trim();
    if (!normalized) return [];
    return normalized.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
}

export function parseSlashCommandTail(tail) {
    const tokens = tokenizeSlashCommandTail(tail);
    const named = new Map();
    const positional = [];

    tokens.forEach((token) => {
        const match = token.match(/^([A-Za-z0-9_-]+)=(.+)$/);
        if (!match) {
            positional.push(token);
            return;
        }
        const key = String(match[1] || '').trim();
        const value = String(match[2] || '').trim();
        named.set(key, value);
    });

    return { tokens, named, positional };
}

function stripOptionalQuotes(value) {
    const text = String(value || '').trim();
    if (text.length >= 2 && ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'")))) {
        return text.slice(1, -1);
    }
    return text;
}

function isExplicitFalseLike(value) {
    const normalized = stripOptionalQuotes(value).toLowerCase();
    return ['false', 'off', '0', 'no'].includes(normalized);
}

function hasOnlySafeReadFlags(tail, allowedFlags = [], options = {}) {
    const { allowPositional = false } = options;
    const parsed = parseSlashCommandTail(tail);
    if (!allowPositional && parsed.positional.length) {
        return false;
    }
    return Array.from(parsed.named.keys()).every((key) => allowedFlags.includes(key));
}

export function isReadOnlySlashInvocation(command) {
    const name = getSlashCommandName(command);
    if (!name) return false;

    if (READ_ONLY_SLASH_COMMANDS.has(name)) {
        return true;
    }

    const tail = getSlashCommandTail(command);
    if (!READ_ONLY_SLASH_COMMANDS_WITH_SAFE_FLAGS.has(name)) {
        return false;
    }

    switch (name) {
        case 'api':
        case 'context':
        case 'model':
            return hasOnlySafeReadFlags(tail, ['quiet']);
        case 'tokenizer':
            return tokenizeSlashCommandTail(tail).length === 0;
        case 'api-url':
            return hasOnlySafeReadFlags(tail, ['api', 'connect', 'quiet']);
        case 'instruct':
            return hasOnlySafeReadFlags(tail, ['quiet', 'forceGet']);
        case 'instruct-state':
            return tokenizeSlashCommandTail(tail).length === 0;
        case 'getchatbook': {
            const parsed = parseSlashCommandTail(tail);
            return !parsed.positional.length
                && !parsed.named.has('name')
                && parsed.named.has('create')
                && isExplicitFalseLike(parsed.named.get('create'));
        }
        case 'getpersonabook': {
            const parsed = parseSlashCommandTail(tail);
            if (parsed.positional.length || parsed.named.has('name')) {
                return false;
            }
            if (!parsed.named.size) {
                return true;
            }
            return parsed.named.size === 1
                && parsed.named.has('create')
                && isExplicitFalseLike(parsed.named.get('create'));
        }
        case 'getcharbook': {
            const parsed = parseSlashCommandTail(tail);
            const allowedKeys = ['type', 'create'];
            const hasOnlyAllowedKeys = Array.from(parsed.named.keys()).every((key) => allowedKeys.includes(key));
            if (!hasOnlyAllowedKeys || parsed.named.has('name')) {
                return false;
            }
            if (parsed.named.has('create') && !isExplicitFalseLike(parsed.named.get('create'))) {
                return false;
            }
            return parsed.positional.length <= 1;
        }
        default:
            return false;
    }
}

export function shouldRequireSlashCommandApproval(command) {
    const name = getSlashCommandName(command);
    if (!name) return false;
    return !isReadOnlySlashInvocation(command);
}
