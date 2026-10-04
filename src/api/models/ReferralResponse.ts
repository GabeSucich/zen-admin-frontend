/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReferralStatus } from './ReferralStatus';
export type ReferralResponse = {
    id: number;
    referrer_id: number;
    referrer_name: string;
    client_id: (number | null);
    client_name: (string | null);
    invitee_name: (string | null);
    invitee_email: (string | null);
    event_type_name: (string | null);
    reported_patient_type: (string | null);
    scheduled_for: (string | null);
    status: ReferralStatus;
    is_self_referral: boolean;
    qualifies: boolean;
    rescheduled_from_id: (number | null);
    purchased_at: (string | null);
    reward_issued_at: (string | null);
    notes: (string | null);
    created_at: string;
    updated_at: string;
};

