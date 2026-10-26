export interface CheckConsequences { success?: string; failure?: string }

export const CHECK_CONSEQUENCE_FIELDS = {
    success: { required: false, maxLength: 240, description: 'A short consequence if the objective is achieved, in the story language.' },
    failure: { required: false, maxLength: 240, description: 'A short consequence if the objective is not achieved, in the story language.' },
} as const;
