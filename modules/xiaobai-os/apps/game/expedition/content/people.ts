/** Stable identities and display names; biographies live in docs/expedition-cards. */
export const PERSON_NAMES = { sanniang: '三娘', anian: '阿念', kouzi: '扣子', laobai: '老白' } as const;
export const PERSON_IDS = Object.keys(PERSON_NAMES) as (keyof typeof PERSON_NAMES)[];
export const PERSON_SECRETS = { sanniang: 'changyounian_intel', laobai: 'bajin_intel', anian: null, kouzi: null } as const;
