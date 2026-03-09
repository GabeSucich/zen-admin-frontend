/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMeetingTypeTodoTemplateRequest } from '../models/CreateMeetingTypeTodoTemplateRequest';
import type { MeetingTypeTodoTemplateResponse } from '../models/MeetingTypeTodoTemplateResponse';
import type { UpdateMeetingTypeTodoTemplateRequest } from '../models/UpdateMeetingTypeTodoTemplateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MeetingTypeTodoTemplatesService {
    /**
     * List Templates
     * @returns MeetingTypeTodoTemplateResponse Successful Response
     * @throws ApiError
     */
    public static listTemplates(): CancelablePromise<Array<MeetingTypeTodoTemplateResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/meeting-type-todo-templates/',
        });
    }
    /**
     * Create Template
     * @param requestBody
     * @returns MeetingTypeTodoTemplateResponse Successful Response
     * @throws ApiError
     */
    public static createTemplate(
        requestBody: CreateMeetingTypeTodoTemplateRequest,
    ): CancelablePromise<MeetingTypeTodoTemplateResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/meeting-type-todo-templates/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Template
     * @param templateId
     * @param requestBody
     * @returns MeetingTypeTodoTemplateResponse Successful Response
     * @throws ApiError
     */
    public static updateTemplate(
        templateId: number,
        requestBody: UpdateMeetingTypeTodoTemplateRequest,
    ): CancelablePromise<MeetingTypeTodoTemplateResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/meeting-type-todo-templates/{template_id}',
            path: {
                'template_id': templateId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Template
     * @param templateId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteTemplate(
        templateId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/meeting-type-todo-templates/{template_id}',
            path: {
                'template_id': templateId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
