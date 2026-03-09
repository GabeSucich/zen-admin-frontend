/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClientResponse } from './ClientResponse';
import type { TodoSource } from './TodoSource';
import type { TodoType } from './TodoType';
export type TodoResponse = {
    id: number;
    client_id: (number | null);
    cal_event_client_suggestion_id: (number | null);
    title: string;
    notes: (string | null);
    due_date: string;
    completed_at: (string | null);
    source: TodoSource;
    todo_type: TodoType;
    client: (ClientResponse | null);
    created_at: string;
    updated_at: string;
};

