/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProcessCalendarEventsRequest } from '../models/ProcessCalendarEventsRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class N8NIngestionService {
    /**
     * Process Calendar Events
     * Queue calendar events for background processing, skipping already-processed events.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static processCalendarEvents(
        requestBody: ProcessCalendarEventsRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/n8n/process-events',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
