/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClientResponse } from './ClientResponse';
import type { MeetingType } from './MeetingType';
import type { TodoResponse } from './TodoResponse';
export type CalendarEventClientSuggestionResponse = {
    id: number;
    client_id: (number | null);
    calendar_event_id: number;
    meeting_type: (MeetingType | null);
    user_confirmed: boolean;
    client: (ClientResponse | null);
    todos: Array<TodoResponse>;
    gcal_source_event_id: string;
    title: string;
    description: (string | null);
    start_time: string;
    readonly gcal_link: string;
};

