/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReferralStatus } from './ReferralStatus';
export type UpdateReferralRequest = {
    status?: (ReferralStatus | null);
    qualifies?: (boolean | null);
    referee_discount_applied?: (boolean | null);
    referrer_discount_applied?: (boolean | null);
    notes?: (string | null);
};

