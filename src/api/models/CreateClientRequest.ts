/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Location } from './Location';
import type { MembershipStatus } from './MembershipStatus';
export type CreateClientRequest = {
    first_name: string;
    last_name: string;
    email?: (string | null);
    phone?: (string | null);
    notes?: (string | null);
    address?: (string | null);
    location?: (Location | null);
    membership_status?: MembershipStatus;
    charm_id?: (string | null);
};

