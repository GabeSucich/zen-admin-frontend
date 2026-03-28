/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActionItemsResponse } from '../models/ActionItemsResponse';
import type { ArchiveMeetingNotesRequest } from '../models/ArchiveMeetingNotesRequest';
import type { ConfirmMeetingNotesRequest } from '../models/ConfirmMeetingNotesRequest';
import type { GetGranolaNotesForEventResponse } from '../models/GetGranolaNotesForEventResponse';
import type { GranolaMeetingNotesResponse } from '../models/GranolaMeetingNotesResponse';
import type { IngestGranolaNotesRequest } from '../models/IngestGranolaNotesRequest';
import type { IngestGranolaNotesResponse } from '../models/IngestGranolaNotesResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MeetingNotesService {
    /**
     * Get Granola Notes For Event
     * @param calendarEventId
     * @returns GetGranolaNotesForEventResponse Successful Response
     * @throws ApiError
     */
    public static getGranolaNotesForEvent(
        calendarEventId: number,
    ): CancelablePromise<GetGranolaNotesForEventResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/meeting-notes/granola/calendar-event/{calendar_event_id}',
            path: {
                'calendar_event_id': calendarEventId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Confirm Granola Notes
     * @param requestBody
     * @returns GranolaMeetingNotesResponse Successful Response
     * @throws ApiError
     */
    public static confirmGranolaNotes(
        requestBody: ConfirmMeetingNotesRequest,
    ): CancelablePromise<GranolaMeetingNotesResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/meeting-notes/granola/confirm',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Archive Granola Note
     * @param requestBody
     * @returns GranolaMeetingNotesResponse Successful Response
     * @throws ApiError
     */
    public static archiveGranolaNote(
        requestBody: ArchiveMeetingNotesRequest,
    ): CancelablePromise<GranolaMeetingNotesResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/meeting-notes/granola/archive',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Granola Action Items
     * @param meetingNotesId
     * @returns ActionItemsResponse Successful Response
     * @throws ApiError
     */
    public static getGranolaActionItems(
        meetingNotesId: number,
    ): CancelablePromise<ActionItemsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/meeting-notes/granola/{meeting_notes_id}/action-items',
            path: {
                'meeting_notes_id': meetingNotesId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Ingest Granola Notes
     * @param requestBody
     * @returns IngestGranolaNotesResponse Successful Response
     * @throws ApiError
     */
    public static ingestGranolaNotes(
        requestBody: IngestGranolaNotesRequest,
    ): CancelablePromise<IngestGranolaNotesResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/meeting-notes/granola/ingest',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
