/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MeetingTypeResponse } from '../models/MeetingTypeResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MeetingTypesService {
    /**
     * Get Meeting Types
     * @returns MeetingTypeResponse Successful Response
     * @throws ApiError
     */
    public static getMeetingTypes(): CancelablePromise<Array<MeetingTypeResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/meeting-types/',
        });
    }
}
