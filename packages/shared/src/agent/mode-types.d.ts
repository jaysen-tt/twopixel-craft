/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

/**
 * Mode Types and Constants
 *
 * Pure types and UI configuration for permission modes.
 * This file has NO runtime dependencies - safe for browser bundling.
 *
 * For runtime mode management functions, use './mode-manager.ts'
 */
import { z } from 'zod';
/**
 * Available permission modes (internal storage keys).
 *
 * UI-facing canonical names are:
 * - explore  -> safe
 * - ask      -> ask
 * - execute  -> allow-all
 */
export type PermissionMode = 'safe' | 'ask' | 'allow-all';
/**
 * Canonical mode names used in user-facing/session-state surfaces.
 */
export type PermissionModeCanonical = 'explore' | 'ask' | 'execute';
/**
 * Order of modes for cycling with SHIFT+TAB
 */
export declare const PERMISSION_MODE_ORDER: PermissionMode[];
/**
 * Internal -> canonical mapping.
 */
export declare const PERMISSION_MODE_TO_CANONICAL: Record<PermissionMode, PermissionModeCanonical>;
/**
 * Canonical -> internal mapping.
 */
export declare const CANONICAL_TO_PERMISSION_MODE: Record<PermissionModeCanonical, PermissionMode>;
/**
 * Convert internal mode key to canonical user-facing mode name.
 */
export declare function toCanonicalPermissionMode(mode: PermissionMode): PermissionModeCanonical;
/**
 * Parse user-facing mode names into internal mode keys.
 *
 * Accepts canonical values (explore/ask/execute) and legacy aliases
 * (safe/allow-all, ask-to-edit) for backward compatibility.
 */
export declare function parsePermissionMode(mode: string): PermissionMode | null;
/**
 * API endpoint rule - method + path pattern
 */
declare const ApiEndpointRuleSchema: z.ZodObject<{
    method: z.ZodEnum<{
        GET: "GET";
        HEAD: "HEAD";
        POST: "POST";
        PUT: "PUT";
        DELETE: "DELETE";
        OPTIONS: "OPTIONS";
        PATCH: "PATCH";
    }>;
    path: z.ZodString;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ApiEndpointRule = z.infer<typeof ApiEndpointRuleSchema>;
/**
 * Command-specific block hint for clearer Explore-mode rejection messages.
 */
declare const BlockedCommandHintSchema: z.ZodObject<{
    command: z.ZodString;
    reason: z.ZodString;
    context: z.ZodOptional<z.ZodString>;
    tryInstead: z.ZodOptional<z.ZodArray<z.ZodString>>;
    example: z.ZodOptional<z.ZodString>;
    whenNotMatching: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type BlockedCommandHintRule = z.infer<typeof BlockedCommandHintSchema>;
/**
 * Permissions JSON configuration schema
 *
 * Note: Core write tools (Write, Edit, MultiEdit, NotebookEdit) are hardcoded in
 * SAFE_MODE_CONFIG and always blocked in Explore mode. The blockedTools field
 * allows users to block additional tools beyond these defaults.
 */
export declare const PermissionsConfigSchema: z.ZodObject<{
    version: z.ZodOptional<z.ZodString>;
    allowedBashPatterns: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        pattern: z.ZodString;
        comment: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>]>>>;
    allowedMcpPatterns: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        pattern: z.ZodString;
        comment: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>]>>>;
    allowedApiEndpoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        method: z.ZodEnum<{
            GET: "GET";
            HEAD: "HEAD";
            POST: "POST";
            PUT: "PUT";
            DELETE: "DELETE";
            OPTIONS: "OPTIONS";
            PATCH: "PATCH";
        }>;
        path: z.ZodString;
        comment: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    allowedWritePaths: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        pattern: z.ZodString;
        comment: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>]>>>;
    blockedTools: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        pattern: z.ZodString;
        comment: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>]>>>;
    blockedCommandHints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        command: z.ZodString;
        reason: z.ZodString;
        context: z.ZodOptional<z.ZodString>;
        tryInstead: z.ZodOptional<z.ZodArray<z.ZodString>>;
        example: z.ZodOptional<z.ZodString>;
        whenNotMatching: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type PermissionsConfigFile = z.infer<typeof PermissionsConfigSchema>;
/**
 * Compiled API endpoint rule for runtime checking
 */
export interface CompiledApiEndpointRule {
    method: string;
    pathPattern: RegExp;
}
/**
 * Compiled bash pattern with metadata for error messages.
 * Stores the original pattern string and comment alongside the compiled RegExp
 * so we can provide helpful error messages when commands don't match.
 */
export interface CompiledBashPattern {
    /** Compiled regex for matching */
    regex: RegExp;
    /** Original pattern string (for error messages) */
    source: string;
    /** Human-readable comment explaining what this pattern allows */
    comment?: string;
}
/**
 * Runtime command-specific hint for blocked Bash commands.
 */
export interface CompiledBlockedCommandHint {
    /** Base command token (lowercase), e.g. "printf" */
    command: string;
    reason: string;
    context?: string;
    tryInstead?: string[];
    example?: string;
    /** Optional condition: hint applies only when command does NOT match this regex */
    whenNotMatching?: string;
    whenNotMatchingRegex?: RegExp;
}
/**
 * Analysis of why a command didn't match a pattern.
 * Used by incr-regex-package to provide detailed diagnostics showing
 * exactly WHERE matching failed and what was expected.
 */
export interface MismatchAnalysis {
    /** How much of the command matched before failure */
    matchedPrefix: string;
    /** Character position where matching stopped */
    failedAtPosition: number;
    /** The token/word that caused the mismatch */
    failedToken: string;
    /** The pattern that got closest to matching */
    bestMatchPattern?: {
        source: string;
        comment?: string;
    };
    /** Actionable suggestion for the user/agent */
    suggestion?: string;
}
/**
 * Paths to permissions configuration files.
 * Used in error messages to guide the agent on how to customize permissions.
 */
export interface PermissionPaths {
    /** Path to workspace-level permissions.json */
    workspacePath: string;
    /** Path to app-level default.json */
    appDefaultPath: string;
    /** Path to permissions documentation */
    docsPath: string;
}
/**
 * Safe mode configuration - defines behavior for read-only mode
 */
export interface ModeConfig {
    /** Tools that are always blocked in safe mode (Write, Edit, etc.) - hardcoded, not configurable */
    blockedTools: Set<string>;
    /** Read-only Bash command patterns with metadata for helpful error messages */
    readOnlyBashPatterns: CompiledBashPattern[];
    /** Command-specific hints shown when blocked Bash commands are rejected */
    blockedCommandHints?: CompiledBlockedCommandHint[];
    /** Read-only MCP patterns (tools matching these are allowed) */
    readOnlyMcpPatterns: RegExp[];
    /** Fine-grained API endpoint rules (method + path pattern) */
    allowedApiEndpoints: CompiledApiEndpointRule[];
    /** File paths allowed for writes in Explore mode (glob patterns) */
    allowedWritePaths?: string[];
    /** User-friendly name */
    displayName: string;
    /** Keyboard shortcut hint */
    shortcutHint: string;
    /** Paths to permission files for actionable error messages */
    permissionPaths?: PermissionPaths;
}
/**
 * Minimal fallback configuration for safe mode.
 *
 * The actual patterns are loaded from ~/.twopixel/permissions/default.json
 * at runtime by PermissionsConfigCache. This fallback ensures the app works
 * even if the JSON file is missing or invalid.
 *
 * To customize allowed commands, edit ~/.twopixel/permissions/default.json
 */
export declare const SAFE_MODE_CONFIG: ModeConfig;
/**
 * Display configuration for each mode
 */
export declare const PERMISSION_MODE_CONFIG: Record<PermissionMode, {
    displayName: string;
    shortName: string;
    description: string;
    /** SVG path data for the icon (viewBox 0 0 24 24, stroke-based) */
    svgPath: string;
    /** Tailwind color classes for consistent theming */
    colorClass: {
        /** Text color class (e.g., 'text-info') */
        text: string;
        /** Background color class (e.g., 'bg-info') */
        bg: string;
        /** Border color class (e.g., 'border-info') */
        border: string;
    };
}>;
export {};
//# sourceMappingURL=mode-types.d.ts.map