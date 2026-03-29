/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ErrorListResponse } from '../models/ErrorListResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ErrorsService {
    /**
     * List Errors
     * @param pageSize
     * @param cursor
     * @returns ErrorListResponse Successful Response
     * @throws ApiError
     */
    public static listErrors(
        pageSize: number = 10,
        cursor?: (number | null),
    ): CancelablePromise<ErrorListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/errors',
            query: {
                'page_size': pageSize,
                'cursor': cursor,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
