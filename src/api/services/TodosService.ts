/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChangeDueDateRequest } from '../models/ChangeDueDateRequest';
import type { CreateTodoRequest } from '../models/CreateTodoRequest';
import type { TodoResponse } from '../models/TodoResponse';
import type { UpdateTodoRequest } from '../models/UpdateTodoRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TodosService {
    /**
     * Get Confirmed Todos
     * Return todos where the associated CalendarEventClientSuggestion is None or user_confirmed=True.
     * @param dueBeforeOrOn
     * @param isCompleted
     * @returns TodoResponse Successful Response
     * @throws ApiError
     */
    public static getConfirmedTodos(
        dueBeforeOrOn?: (string | null),
        isCompleted?: (boolean | null),
    ): CancelablePromise<Array<TodoResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/todos/confirmed',
            query: {
                'due_before_or_on': dueBeforeOrOn,
                'is_completed': isCompleted,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Todo
     * @param todoId
     * @returns TodoResponse Successful Response
     * @throws ApiError
     */
    public static getTodo(
        todoId: number,
    ): CancelablePromise<TodoResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/todos/{todo_id}',
            path: {
                'todo_id': todoId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Todo
     * @param todoId
     * @param requestBody
     * @returns TodoResponse Successful Response
     * @throws ApiError
     */
    public static updateTodo(
        todoId: number,
        requestBody: UpdateTodoRequest,
    ): CancelablePromise<TodoResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/todos/{todo_id}',
            path: {
                'todo_id': todoId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Todo
     * @param todoId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteTodo(
        todoId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/todos/{todo_id}',
            path: {
                'todo_id': todoId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Todo
     * @param requestBody
     * @returns TodoResponse Successful Response
     * @throws ApiError
     */
    public static createTodo(
        requestBody: CreateTodoRequest,
    ): CancelablePromise<TodoResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/todos/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mark Todo Complete
     * @param todoId
     * @returns TodoResponse Successful Response
     * @throws ApiError
     */
    public static markTodoComplete(
        todoId: number,
    ): CancelablePromise<TodoResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/todos/{todo_id}/complete',
            path: {
                'todo_id': todoId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Change Due Date
     * @param todoId
     * @param requestBody
     * @returns TodoResponse Successful Response
     * @throws ApiError
     */
    public static changeDueDate(
        todoId: number,
        requestBody: ChangeDueDateRequest,
    ): CancelablePromise<TodoResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/todos/{todo_id}/change-due-date',
            path: {
                'todo_id': todoId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
