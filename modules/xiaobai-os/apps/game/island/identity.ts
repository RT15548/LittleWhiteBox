import { PLAYER_AGES, PLAYER_GENDERS, PLAYER_NAME_LIMIT, PLAYER_BACKGROUND_LIMIT, type PlayerAge, type PlayerIdentity } from './characters.js';
import { fail } from './fault.js';
import { member, object, shape } from './validation.js';

export function parsePlayerIdentity(raw: unknown): PlayerIdentity {
    const hasBackground = Object.hasOwn(object(raw), 'background');
    const value = shape(raw, ['name', 'gender', 'appearanceAge', ...(hasBackground ? ['background'] : [])]);
    if (typeof value.name !== 'string' || !value.name.trim() || value.name.trim().length > PLAYER_NAME_LIMIT || /[\r\n]/.test(value.name)) { fail('invalid'); }
    if (hasBackground && (typeof value.background !== 'string' || value.background.length > PLAYER_BACKGROUND_LIMIT)) { fail('invalid'); }
    const background = hasBackground ? (value.background as string).trim() : '';
    return { name: value.name.trim(), gender: member(value.gender, PLAYER_GENDERS),
        appearanceAge: member(value.appearanceAge, Object.keys(PLAYER_AGES) as PlayerAge[]), ...(background ? { background } : {}) };
}
