/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReferralResponse } from '../models/ReferralResponse';
import type { ReferralStatus } from '../models/ReferralStatus';
import type { ReferrerResponse } from '../models/ReferrerResponse';
import type { UpdateReferralRequest } from '../models/UpdateReferralRequest';
import type { UpdateReferrerRequest } from '../models/UpdateReferrerRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReferralsService {
    /**
     * Get Referrers
     * All referrers with booking and discount counts.
     * @returns ReferrerResponse Successful Response
     * @throws ApiError
     */
    public static getReferrers(): CancelablePromise<Array<ReferrerResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/referrals/referrers',
        });
    }
    /**
     * Update Referrer
     * Rename or (de)activate a referrer. Inactive codes are ignored by the website and webhook.
     * @param referrerId
     * @param requestBody
     * @returns ReferrerResponse Successful Response
     * @throws ApiError
     */
    public static updateReferrer(
        referrerId: number,
        requestBody: UpdateReferrerRequest,
    ): CancelablePromise<ReferrerResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/referrals/referrers/{referrer_id}',
            path: {
                'referrer_id': referrerId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Referrals
     * Referral bookings, newest first, with optional filters.
     * @param referrerId
     * @param status
     * @param qualifies
     * @param referrerDiscountActiveOnly
     * @param scheduledFrom
     * @param scheduledTo
     * @returns ReferralResponse Successful Response
     * @throws ApiError
     */
    public static getReferrals(
        referrerId?: (number | null),
        status?: (ReferralStatus | null),
        qualifies?: (boolean | null),
        referrerDiscountActiveOnly?: (boolean | null),
        scheduledFrom?: (string | null),
        scheduledTo?: (string | null),
    ): CancelablePromise<Array<ReferralResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/referrals',
            query: {
                'referrer_id': referrerId,
                'status': status,
                'qualifies': qualifies,
                'referrer_discount_active_only': referrerDiscountActiveOnly,
                'scheduled_from': scheduledFrom,
                'scheduled_to': scheduledTo,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Referral
     * Update status, override qualification, mark either discount applied, or edit notes.
     * @param referralId
     * @param requestBody
     * @returns ReferralResponse Successful Response
     * @throws ApiError
     */
    public static updateReferral(
        referralId: number,
        requestBody: UpdateReferralRequest,
    ): CancelablePromise<ReferralResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/referrals/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
