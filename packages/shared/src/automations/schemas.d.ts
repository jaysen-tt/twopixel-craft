/**
 * Automations Schema Definitions
 *
 * Zod schemas for validating automations.json configuration.
 * Extracted from index.ts for better separation of concerns.
 */
import { z } from 'zod';
import type { ValidationIssue } from '../config/validators.ts';
export declare const PromptActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"prompt">;
    prompt: z.ZodString;
    llmConnection: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const WebhookActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"webhook">;
    url: z.ZodString;
    method: z.ZodOptional<z.ZodEnum<{
        GET: "GET";
        POST: "POST";
        PUT: "PUT";
        DELETE: "DELETE";
        PATCH: "PATCH";
    }>>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    bodyFormat: z.ZodOptional<z.ZodEnum<{
        raw: "raw";
        form: "form";
        json: "json";
    }>>;
    body: z.ZodOptional<z.ZodUnknown>;
    captureResponse: z.ZodOptional<z.ZodBoolean>;
    auth: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodLiteral<"basic">;
        username: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"bearer">;
        token: z.ZodString;
    }, z.core.$strip>]>>;
}, z.core.$strip>;
/** Accepts prompt and webhook actions strictly; passes through legacy/unknown action types without erroring */
export declare const ActionDefinitionSchema: z.ZodUnion<readonly [z.ZodObject<{
    type: z.ZodLiteral<"prompt">;
    prompt: z.ZodString;
    llmConnection: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"webhook">;
    url: z.ZodString;
    method: z.ZodOptional<z.ZodEnum<{
        GET: "GET";
        POST: "POST";
        PUT: "PUT";
        DELETE: "DELETE";
        PATCH: "PATCH";
    }>>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    bodyFormat: z.ZodOptional<z.ZodEnum<{
        raw: "raw";
        form: "form";
        json: "json";
    }>>;
    body: z.ZodOptional<z.ZodUnknown>;
    captureResponse: z.ZodOptional<z.ZodBoolean>;
    auth: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodLiteral<"basic">;
        username: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"bearer">;
        token: z.ZodString;
    }, z.core.$strip>]>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodString;
}, z.core.$loose>]>;
export declare const TimeConditionSchema: z.ZodObject<{
    condition: z.ZodLiteral<"time">;
    after: z.ZodOptional<z.ZodString>;
    before: z.ZodOptional<z.ZodString>;
    weekday: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        mon: "mon";
        tue: "tue";
        wed: "wed";
        thu: "thu";
        fri: "fri";
        sat: "sat";
        sun: "sun";
    }>>>;
    timezone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const StateConditionSchema: z.ZodObject<{
    condition: z.ZodLiteral<"state">;
    field: z.ZodString;
    value: z.ZodOptional<z.ZodUnknown>;
    from: z.ZodOptional<z.ZodUnknown>;
    to: z.ZodOptional<z.ZodUnknown>;
    contains: z.ZodOptional<z.ZodString>;
    not_value: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export declare const AutomationConditionSchema: z.ZodType;
export declare const AutomationMatcherSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    matcher: z.ZodOptional<z.ZodString>;
    cron: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    permissionMode: z.ZodOptional<z.ZodEnum<{
        safe: "safe";
        ask: "ask";
        "allow-all": "allow-all";
    }>>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString>>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>>;
    actions: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodLiteral<"prompt">;
        prompt: z.ZodString;
        llmConnection: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"webhook">;
        url: z.ZodString;
        method: z.ZodOptional<z.ZodEnum<{
            GET: "GET";
            POST: "POST";
            PUT: "PUT";
            DELETE: "DELETE";
            PATCH: "PATCH";
        }>>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        bodyFormat: z.ZodOptional<z.ZodEnum<{
            raw: "raw";
            form: "form";
            json: "json";
        }>>;
        body: z.ZodOptional<z.ZodUnknown>;
        captureResponse: z.ZodOptional<z.ZodBoolean>;
        auth: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"basic">;
            username: z.ZodString;
            password: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"bearer">;
            token: z.ZodString;
        }, z.core.$strip>]>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodString;
    }, z.core.$loose>]>>;
}, z.core.$strip>;
/**
 * Deprecated event name aliases.
 * Old names are accepted during schema validation and silently rewritten to canonical names.
 * A console.warn() is emitted at runtime so users know to update their configs.
 */
export declare const DEPRECATED_EVENT_ALIASES: Record<string, string>;
/** All valid event names: canonical events + deprecated aliases. Derived from types.ts. */
export declare const VALID_EVENTS: readonly string[];
export declare const AutomationsConfigSchema: z.ZodPipe<z.ZodObject<{
    version: z.ZodOptional<z.ZodNumber>;
    automations: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        matcher: z.ZodOptional<z.ZodString>;
        cron: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
        permissionMode: z.ZodOptional<z.ZodEnum<{
            safe: "safe";
            ask: "ask";
            "allow-all": "allow-all";
        }>>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString>>;
        enabled: z.ZodOptional<z.ZodBoolean>;
        conditions: z.ZodOptional<z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>>;
        actions: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"prompt">;
            prompt: z.ZodString;
            llmConnection: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"webhook">;
            url: z.ZodString;
            method: z.ZodOptional<z.ZodEnum<{
                GET: "GET";
                POST: "POST";
                PUT: "PUT";
                DELETE: "DELETE";
                PATCH: "PATCH";
            }>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            bodyFormat: z.ZodOptional<z.ZodEnum<{
                raw: "raw";
                form: "form";
                json: "json";
            }>>;
            body: z.ZodOptional<z.ZodUnknown>;
            captureResponse: z.ZodOptional<z.ZodBoolean>;
            auth: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"basic">;
                username: z.ZodString;
                password: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"bearer">;
                token: z.ZodString;
            }, z.core.$strip>]>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodString;
        }, z.core.$loose>]>>;
    }, z.core.$strip>>>>;
}, z.core.$strip>, z.ZodTransform<{
    version: number;
    automations: Record<string, {
        actions: ({
            type: "prompt";
            prompt: string;
            llmConnection?: string;
            model?: string;
        } | {
            type: "webhook";
            url: string;
            method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
            headers?: Record<string, string>;
            bodyFormat?: "raw" | "form" | "json";
            body?: unknown;
            captureResponse?: boolean;
            auth?: {
                type: "basic";
                username: string;
                password: string;
            } | {
                type: "bearer";
                token: string;
            };
        } | {
            [x: string]: unknown;
            type: string;
        })[];
        id?: string;
        name?: string;
        matcher?: string;
        cron?: string;
        timezone?: string;
        permissionMode?: "safe" | "ask" | "allow-all";
        labels?: string[];
        enabled?: boolean;
        conditions?: unknown[];
    }[]>;
}, {
    version?: number;
    automations?: Record<string, {
        actions: ({
            type: "prompt";
            prompt: string;
            llmConnection?: string;
            model?: string;
        } | {
            type: "webhook";
            url: string;
            method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
            headers?: Record<string, string>;
            bodyFormat?: "raw" | "form" | "json";
            body?: unknown;
            captureResponse?: boolean;
            auth?: {
                type: "basic";
                username: string;
                password: string;
            } | {
                type: "bearer";
                token: string;
            };
        } | {
            [x: string]: unknown;
            type: string;
        })[];
        id?: string;
        name?: string;
        matcher?: string;
        cron?: string;
        timezone?: string;
        permissionMode?: "safe" | "ask" | "allow-all";
        labels?: string[];
        enabled?: boolean;
        conditions?: unknown[];
    }[]>;
}>>;
/**
 * Convert Zod error to ValidationIssues (matches validators.ts pattern)
 */
export declare function zodErrorToIssues(error: z.ZodError, file: string): ValidationIssue[];
//# sourceMappingURL=schemas.d.ts.map