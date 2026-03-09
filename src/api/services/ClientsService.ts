/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClientResponse } from '../models/ClientResponse';
import type { CreateClientRequest } from '../models/CreateClientRequest';
import type { UpdateClientRequest } from '../models/UpdateClientRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClientsService {
    /**
     * Get Clients
     * Fetch all non-archived clients, with optional user_confirmed filter.
     * @param userConfirmed
     * @returns ClientResponse Successful Response
     * @throws ApiError
     */
    public static getClients(
        userConfirmed?: (boolean | null),
    ): CancelablePromise<Array<ClientResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/clients/',
            query: {
                'user_confirmed': userConfirmed,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Client
     * Create a new client (manually created clients are user_confirmed by default).
     * @param requestBody
     * @returns ClientResponse Successful Response
     * @throws ApiError
     */
    public static createClient(
        requestBody: CreateClientRequest,
    ): CancelablePromise<ClientResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/clients/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Client
     * Update specific fields on a client.
     * @param clientId
     * @param requestBody
     * @returns ClientResponse Successful Response
     * @throws ApiError
     */
    public static updateClient(
        clientId: number,
        requestBody: UpdateClientRequest,
    ): CancelablePromise<ClientResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/clients/{client_id}',
            path: {
                'client_id': clientId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Archive Client
     * Set archived=True on a client.
     * @param clientId
     * @returns ClientResponse Successful Response
     * @throws ApiError
     */
    public static archiveClient(
        clientId: number,
    ): CancelablePromise<ClientResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/clients/{client_id}/archive',
            path: {
                'client_id': clientId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
