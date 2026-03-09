/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MeetingType } from './MeetingType';
import type { TodoType } from './TodoType';
export type CreateMeetingTypeTodoTemplateRequest = {
    meeting_type: MeetingType;
    todo_type: TodoType;
    title: string;
    notes: string;
    days_until_due: number;
    order: number;
};

