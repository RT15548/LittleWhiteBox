export interface CheckConsequences { success: string; failure: string }

export const CHECK_CONSEQUENCE_FIELDS = {
    success: { type: 'string', required: true, maxLength: 240, description: 'A short consequence if the objective is achieved, in the story language.' },
    failure: { type: 'string', required: true, maxLength: 240, description: 'A short consequence if the objective is not achieved, in the story language.' },
} as const;

// Published schema 4 and converted schemas 1/3 can lack separate consequences.
// Keep those recorded facts readable while these saved formats are supported;
// only saved-record readers use this contract, never new model requests.
export const RECORDED_CHECK_CONSEQUENCE_FIELDS = {
    success: { ...CHECK_CONSEQUENCE_FIELDS.success, required: false },
    failure: { ...CHECK_CONSEQUENCE_FIELDS.failure, required: false },
} as const;
