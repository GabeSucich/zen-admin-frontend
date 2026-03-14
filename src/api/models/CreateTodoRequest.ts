/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TodoType } from './TodoType';
export type CreateTodoRequest = {
    client_id?: (number | null);
    cal_event_client_suggestion_id?: (number | null);
    title: string;
    notes?: (string | null);
    due_date: string;
    todo_type: TodoType;
};

