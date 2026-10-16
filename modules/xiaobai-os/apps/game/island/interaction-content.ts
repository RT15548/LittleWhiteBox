import type { ContactForm, StrikeForm } from './model.js';

// Game tuning, not medical measurements or personality/consent thresholds.
export const CONTACTS: Record<ContactForm, { sideBySide: boolean; gapPerHeight: number }> = {
    embrace: { sideBySide: false, gapPerHeight: .224 },
    handhold: { sideBySide: true, gapPerHeight: .34 },
    kiss: { sideBySide: false, gapPerHeight: .23 },
    lean: { sideBySide: true, gapPerHeight: .22 },
};
export const CONTACT_APPROACH_SPEED = .35;
export const GUARD = { defaultSeconds: 10, fatigueLimit: 90 } as const;
export const STRIKES: Record<StrikeForm, { seconds: number; reach: number; fatigue: number; wound: number; displacement: number }> = {
    push: { seconds: 2, reach: 1, fatigue: 2, wound: .018, displacement: .6 },
    punch: { seconds: 3, reach: .95, fatigue: 4, wound: .1, displacement: 0 },
};
