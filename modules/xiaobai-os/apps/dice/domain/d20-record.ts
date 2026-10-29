import { ACTION_CHECK_REQUEST_FIELDS, type ActionCheckRequest } from './action-check.js';
import { RECORDED_CHECK_CONSEQUENCE_FIELDS, type CheckConsequences } from './check-consequences.js';
import { parseCheckRequestFields } from './request-fields.js';

export type D20RecordedRequest = Omit<ActionCheckRequest, keyof CheckConsequences> & Partial<CheckConsequences>;

const RECORDED_FIELDS = { ...ACTION_CHECK_REQUEST_FIELDS, ...RECORDED_CHECK_CONSEQUENCE_FIELDS };

export function parseD20RecordedRequest(value: unknown): D20RecordedRequest {
    return parseCheckRequestFields(value, RECORDED_FIELDS) as D20RecordedRequest;
}
