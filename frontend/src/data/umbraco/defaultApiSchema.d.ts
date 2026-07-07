export interface paths {
    "/api/v1/conference/{conferenceId}/issue": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["PostConferenceByConferenceIdIssue"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/conference/{conferenceId}/schedule": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetConferenceByConferenceIdSchedule"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/session/{sessionId}/feedback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["PostSessionBySessionIdFeedback"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ConferenceScheduleResponseDto: {
            scheduleGrid: string[][];
        };
        CreateIssueRequestDto: {
            message: string;
            resolution?: null | string;
            name?: null | string;
            email?: null | string;
            phone?: null | string;
        };
        CreateIssueResponseDto: {
            message: string;
            resolution?: null | string;
            name?: null | string;
            email?: null | string;
            phone?: null | string;
            responseMarkup: string;
        };
        CreateSessionFeedbackRequestDto: {
            /** Format: int32 */
            speakerRating: number | string;
            /** Format: int32 */
            contentRating: number | string;
            /** Format: int32 */
            venueRating: number | string;
            comments?: null | string;
            name?: null | string;
            email?: null | string;
        };
        SessionFeedbackResponseDto: {
            /** Format: uuid */
            id?: string;
            /** Format: int32 */
            speakerRating: number | string;
            /** Format: int32 */
            contentRating: number | string;
            /** Format: int32 */
            venueRating: number | string;
            comments?: null | string;
            name?: null | string;
            email?: null | string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    PostConferenceByConferenceIdIssue: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                conferenceId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateIssueRequestDto"];
                "text/json": components["schemas"]["CreateIssueRequestDto"];
                "application/*+json": components["schemas"]["CreateIssueRequestDto"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateIssueResponseDto"];
                    "text/json": components["schemas"]["CreateIssueResponseDto"];
                    "text/plain": components["schemas"]["CreateIssueResponseDto"];
                };
            };
        };
    };
    GetConferenceByConferenceIdSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                conferenceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConferenceScheduleResponseDto"];
                    "text/json": components["schemas"]["ConferenceScheduleResponseDto"];
                    "text/plain": components["schemas"]["ConferenceScheduleResponseDto"];
                };
            };
        };
    };
    PostSessionBySessionIdFeedback: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSessionFeedbackRequestDto"];
                "text/json": components["schemas"]["CreateSessionFeedbackRequestDto"];
                "application/*+json": components["schemas"]["CreateSessionFeedbackRequestDto"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionFeedbackResponseDto"];
                    "text/json": components["schemas"]["SessionFeedbackResponseDto"];
                    "text/plain": components["schemas"]["SessionFeedbackResponseDto"];
                };
            };
        };
    };
}
