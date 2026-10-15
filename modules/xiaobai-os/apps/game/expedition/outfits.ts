import type { ExpeditionData, Outfit } from './types.js';
import type { Campaign } from './campaign/types.js';
import { COURTYARD } from './content/courtyard.js';
export function canChangeOutfit(campaign: Campaign | null) {
    return !campaign || COURTYARD[campaign.location.scene].safe && campaign.phase === 'exploration';
}
export interface OutfitSpec { price: number; achievement: string | null; fabric: string; metal: string; glow: string; silhouette: 'cloak' | 'armor' | 'robe' | 'hood' | 'coat'; head: 'none' | 'helm' | 'crown' | 'hat' | 'hood' | 'horns' | 'goggles'; }
export const OUTFITS: Record<Outfit, OutfitSpec> = {
    traveler: { price: 0, achievement: null, fabric: '#326d9f', metal: '#d5b77b', glow: '#a7def3', silhouette: 'cloak', head: 'none' },
    guardian: { price: 0, achievement: 'boss-0', fabric: '#278c7f', metal: '#d9bb75', glow: '#99e2c5', silhouette: 'armor', head: 'helm' },
    moonweaver: { price: 0, achievement: 'boss-1', fabric: '#7863b4', metal: '#ddd9ed', glow: '#bdceff', silhouette: 'robe', head: 'hat' },
    sovereign: { price: 0, achievement: 'boss-2', fabric: '#973f59', metal: '#e3bd64', glow: '#ffe4a4', silhouette: 'armor', head: 'crown' },
    ranger: { price: 180, achievement: null, fabric: '#387759', metal: '#d2b989', glow: '#c8ebad', silhouette: 'hood', head: 'hood' },
    paladin: { price: 320, achievement: null, fabric: '#e9e6d4', metal: '#a1b9c5', glow: '#e8dba3', silhouette: 'armor', head: 'helm' },
    witch: { price: 240, achievement: null, fabric: '#383b69', metal: '#cda56d', glow: '#b9a6f3', silhouette: 'robe', head: 'hat' },
    assassin: { price: 280, achievement: null, fabric: '#343947', metal: '#d88675', glow: '#ce9cac', silhouette: 'hood', head: 'hood' },
    machinist: { price: 260, achievement: null, fabric: '#b67745', metal: '#3f636c', glow: '#b0eff1', silhouette: 'coat', head: 'goggles' },
    beastcaller: { price: 300, achievement: null, fabric: '#70906b', metal: '#ece0b7', glow: '#c5e895', silhouette: 'cloak', head: 'horns' },
    frostbound: { price: 420, achievement: null, fabric: '#8dbbc7', metal: '#e4eef0', glow: '#c3fbff', silhouette: 'coat', head: 'crown' },
    stargazer: { price: 480, achievement: null, fabric: '#504881', metal: '#d4bc8c', glow: '#ddcbff', silhouette: 'robe', head: 'crown' },
};
export function ownsOutfit(data: ExpeditionData, id: Outfit) {
    const spec = OUTFITS[id];
    return id === 'traveler' || data.purchases.some(p => p.id === id) || spec.achievement !== null && data.awards.some(a => a.key === spec.achievement);
}
