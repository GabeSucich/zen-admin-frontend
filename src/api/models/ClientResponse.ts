/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Location } from './Location';
import type { MembershipStatus } from './MembershipStatus';
export type ClientResponse = {
    id: number;
    first_name: string;
    last_name: string;
    email: (string | null);
    phone: (string | null);
    notes: (string | null);
    address: (string | null);
    source: string;
    location: (Location | null);
    membership_status: MembershipStatus;
    charm_id: (string | null);
    user_confirmed: boolean;
    archived: boolean;
    created_at: string;
    updated_at: string;
};

