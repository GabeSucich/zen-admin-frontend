/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateReferrerRequest } from '../models/CreateReferrerRequest';
import type { CreateReferrerResponse } from '../models/CreateReferrerResponse';
import type { ValidateReferralCodeResponse } from '../models/ValidateReferralCodeResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PublicService {
    /**
     * Create Referrer
     * Sign up as a referrer (or fetch the existing link for this email).
     * @param requestBody
     * @returns CreateReferrerResponse Successful Response
     * @throws ApiError
     */
    public static createReferrer(
        requestBody: CreateReferrerRequest,
    ): CancelablePromise<CreateReferrerResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/public/referrers',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Validate Referral Code
     * @param code
     * @returns ValidateReferralCodeResponse Successful Response
     * @throws ApiError
     */
    public static validateReferralCode(
        code: string,
    ): CancelablePromise<ValidateReferralCodeResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/public/referrers/validate',
            query: {
                'code': code,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
