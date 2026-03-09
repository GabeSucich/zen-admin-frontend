/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MeetingType } from './MeetingType';
import type { TodoType } from './TodoType';
export type MeetingTypeTodoTemplateResponse = {
    id: number;
    meeting_type: MeetingType;
    todo_type: TodoType;
    title: string;
    notes: string;
    days_until_due: number;
    order: number;
    created_at: string;
    updated_at: string;
};

