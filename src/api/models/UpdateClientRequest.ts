/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Location } from './Location';
import type { MembershipStatus } from './MembershipStatus';
export type UpdateClientRequest = {
    first_name?: (string | null);
    last_name?: (string | null);
    email?: (string | null);
    phone?: (string | null);
    notes?: (string | null);
    address?: (string | null);
    location?: (Location | null);
    membership_status?: (MembershipStatus | null);
    charm_id?: (string | null);
};

