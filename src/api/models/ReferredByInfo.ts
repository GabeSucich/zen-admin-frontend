/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReferralStatus } from './ReferralStatus';
/**
 * This meeting was booked through a referral link.
 */
export type ReferredByInfo = {
    referral_id: number;
    referrer_id: number;
    referrer_name: string;
    status: ReferralStatus;
    qualifies: boolean;
    reward_issued_at: (string | null);
};

