/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CalendarEventClientSuggestionResponse } from '../models/CalendarEventClientSuggestionResponse';
import type { ConfirmSuggestionRequest } from '../models/ConfirmSuggestionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CalendarSuggestionsService {
    /**
     * Get All Suggestions
     * Fetch all CalendarEventClientSuggestions for events before the given timestamp.
     * @param since
     * @returns CalendarEventClientSuggestionResponse Successful Response
     * @throws ApiError
     */
    public static getAllSuggestions(
        since: string,
    ): CancelablePromise<Array<CalendarEventClientSuggestionResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/calendar-suggestions/all',
            query: {
                'since': since,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Unconfirmed Suggestions
     * Fetch all unconfirmed CalendarEventClientSuggestions with client and todos.
     * @returns CalendarEventClientSuggestionResponse Successful Response
     * @throws ApiError
     */
    public static getUnconfirmedSuggestions(): CancelablePromise<Array<CalendarEventClientSuggestionResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/calendar-suggestions/',
        });
    }
    /**
     * Confirm Suggestion
     * Confirm a calendar event client suggestion, optionally replacing the client.
     * @param suggestionId
     * @param requestBody
     * @returns CalendarEventClientSuggestionResponse Successful Response
     * @throws ApiError
     */
    public static confirmSuggestion(
        suggestionId: number,
        requestBody: ConfirmSuggestionRequest,
    ): CancelablePromise<CalendarEventClientSuggestionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/calendar-suggestions/{suggestion_id}/confirm',
            path: {
                'suggestion_id': suggestionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Calendar Suggestion
     * Delete a calendar suggestion and its todos. Deletes the client if no other references exist.
     * @param suggestionId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteCalendarSuggestion(
        suggestionId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/calendar-suggestions/{suggestion_id}',
            path: {
                'suggestion_id': suggestionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
