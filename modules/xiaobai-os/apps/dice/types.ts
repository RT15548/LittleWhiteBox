export type DiceFeature = 'actionChecksEnabled' | 'encountersEnabled';
export type ActionCheckFrequency = 'light' | 'standard' | 'active';

export interface DiceSettings {
    actionChecksEnabled: boolean;
    actionCheckFrequency: ActionCheckFrequency;
    encountersEnabled: boolean;
}

export interface DiceClientState extends DiceSettings {
    chatIdentity: string;
}
