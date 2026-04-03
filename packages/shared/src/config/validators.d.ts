/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

/**
 * Config Validators
 *
 * Zod schemas and validation utilities for config files.
 * Used by agents to validate config changes before they take effect.
 *
 * Validates:
 * - config.json: Main app configuration
 * - preferences.json: User preferences
 * - sources/{slug}/config.json: Workspace-scoped source configs
 * - permissions.json: Permission rules for Explore mode
 * - tool-icons/tool-icons.json: CLI tool icon mappings
 */
import { z } from 'zod';
export interface ValidationIssue {
    file: string;
    path: string;
    message: string;
    severity: 'error' | 'warning';
    suggestion?: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
    fixed?: string[];
}
export declare const StoredConfigSchema: z.ZodObject<{
    workspaces: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodNumber;
        sessionId: z.ZodOptional<z.ZodString>;
        iconUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    activeWorkspaceId: z.ZodNullable<z.ZodString>;
    activeSessionId: z.ZodNullable<z.ZodString>;
    llmConnections: z.ZodOptional<z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        name: z.ZodString;
        providerType: z.ZodEnum<{
            anthropic: "anthropic";
            openai: "openai";
            pi: "pi";
            anthropic_compat: "anthropic_compat";
            bedrock: "bedrock";
            vertex: "vertex";
            pi_compat: "pi_compat";
            openai_compat: "openai_compat";
            copilot: "copilot";
        }>;
        authType: z.ZodEnum<{
            none: "none";
            environment: "environment";
            api_key: "api_key";
            oauth: "oauth";
            api_key_with_endpoint: "api_key_with_endpoint";
            iam_credentials: "iam_credentials";
            bearer_token: "bearer_token";
            service_account_file: "service_account_file";
        }>;
        baseUrl: z.ZodOptional<z.ZodString>;
        models: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
            id: z.ZodString;
        }, z.core.$loose>]>>>;
        defaultModel: z.ZodOptional<z.ZodString>;
        modelSelectionMode: z.ZodOptional<z.ZodEnum<{
            automaticallySyncedFromProvider: "automaticallySyncedFromProvider";
            userDefined3Tier: "userDefined3Tier";
        }>>;
        createdAt: z.ZodNumber;
    }, z.core.$loose>>>;
    defaultLlmConnection: z.ZodOptional<z.ZodString>;
    defaultThinkingLevel: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
        max: "max";
        high: "high";
        low: "low";
        medium: "medium";
        off: "off";
        think: "think";
    }>, z.ZodTransform<"max" | "high" | "low" | "medium" | "off", "max" | "high" | "low" | "medium" | "off" | "think">>>;
}, z.core.$strip>;
export declare const UserPreferencesSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodObject<{
        city: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    language: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Validate config.json
 */
export declare function validateConfig(): ValidationResult;
/**
 * Validate preferences.json
 */
export declare function validatePreferences(): ValidationResult;
/**
 * Validate all config files
 * @param workspaceId - Optional workspace ID for source validation
 * @param workspaceRoot - Optional workspace root path for skill and status validation
 */
export declare function validateAll(workspaceId?: string, workspaceRoot?: string): ValidationResult;
export declare const FolderSourceConfigSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    enabled: z.ZodBoolean;
    provider: z.ZodString;
    type: z.ZodEnum<{
        local: "local";
        mcp: "mcp";
        api: "api";
    }>;
    mcp: z.ZodOptional<z.ZodObject<{
        transport: z.ZodOptional<z.ZodEnum<{
            sse: "sse";
            stdio: "stdio";
            http: "http";
        }>>;
        url: z.ZodOptional<z.ZodString>;
        authType: z.ZodOptional<z.ZodEnum<{
            none: "none";
            oauth: "oauth";
            bearer: "bearer";
        }>>;
        clientId: z.ZodOptional<z.ZodString>;
        command: z.ZodOptional<z.ZodString>;
        args: z.ZodOptional<z.ZodArray<z.ZodString>>;
        env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        headerNames: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    api: z.ZodOptional<z.ZodObject<{
        baseUrl: z.ZodString;
        authType: z.ZodEnum<{
            basic: "basic";
            none: "none";
            header: "header";
            query: "query";
            bearer: "bearer";
        }>;
        headerName: z.ZodOptional<z.ZodString>;
        queryParam: z.ZodOptional<z.ZodString>;
        authScheme: z.ZodOptional<z.ZodString>;
        testEndpoint: z.ZodOptional<z.ZodObject<{
            method: z.ZodEnum<{
                GET: "GET";
                POST: "POST";
            }>;
            path: z.ZodString;
            body: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strip>>;
        googleService: z.ZodOptional<z.ZodEnum<{
            calendar: "calendar";
            gmail: "gmail";
            drive: "drive";
            docs: "docs";
            sheets: "sheets";
            youtube: "youtube";
            searchconsole: "searchconsole";
        }>>;
        googleScopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    local: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
        format: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    brand: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>>;
    isAuthenticated: z.ZodOptional<z.ZodBoolean>;
    lastTestedAt: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodOptional<z.ZodNumber>;
    updatedAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Validate a source config object (in-memory, no disk reads)
 */
export declare function validateSourceConfig(config: unknown): ValidationResult;
/**
 * Validate source config from a JSON string.
 * Used by PreToolUse hook to validate before writing to disk.
 */
export declare function validateSourceConfigContent(jsonString: string): ValidationResult;
/**
 * Validate a source folder (workspace-scoped)
 */
export declare function validateSource(workspaceId: string, slug: string): ValidationResult;
/**
 * Validate all sources in a workspace
 */
export declare function validateAllSources(workspaceId: string): ValidationResult;
/**
 * Schema for skill metadata (SKILL.md frontmatter)
 */
export declare const SkillMetadataSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    globs: z.ZodOptional<z.ZodArray<z.ZodString>>;
    alwaysAllow: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
/**
 * Validate a skill folder
 * @param workspaceRoot - Absolute path to workspace root folder
 * @param slug - Skill directory name
 */
export declare function validateSkill(workspaceRoot: string, slug: string): ValidationResult;
/**
 * Validate skill SKILL.md content from a string (no disk reads).
 * Used by PreToolUse hook to validate before writing to disk.
 * Checks frontmatter schema and non-empty body. Skips icon/folder checks.
 *
 * @param markdownContent - The full SKILL.md file content
 * @param slug - The skill slug (folder name), used for slug format validation
 */
export declare function validateSkillContent(markdownContent: string, slug: string): ValidationResult;
/**
 * Validate all skills in a workspace
 * @param workspaceRoot - Absolute path to workspace root folder
 */
export declare function validateAllSkills(workspaceRoot: string): ValidationResult;
/**
 * Validate statuses configuration for a workspace
 * @param workspaceRoot - Absolute path to workspace root folder
 */
export declare function validateStatuses(workspaceRoot: string): ValidationResult;
/**
 * Validate statuses config from a JSON string (no disk reads).
 * Used by PreToolUse hook to validate before writing to disk.
 * Runs schema validation and semantic checks. Skips icon file existence checks.
 */
export declare function validateStatusesContent(jsonString: string): ValidationResult;
/**
 * Validate labels configuration for a workspace (reads from disk)
 * @param workspaceRoot - Absolute path to workspace root folder
 */
export declare function validateLabels(workspaceRoot: string): ValidationResult;
/**
 * Validate labels config from a JSON string (no disk reads).
 * Used by PreToolUse hook to validate before writing to disk.
 * Checks schema validation and semantic rules (unique IDs, max depth).
 */
export declare function validateLabelsContent(jsonString: string): ValidationResult;
/**
 * Validate permissions config from a JSON string (no disk reads).
 * Used by PreToolUse hook to validate before writing to disk.
 * Runs Zod schema validation and regex pattern compilation checks.
 *
 * @param jsonString - The raw JSON content of the permissions file
 * @param displayFile - File name for error messages (e.g., 'permissions.json' or 'sources/github/permissions.json')
 */
export declare function validatePermissionsContent(jsonString: string, displayFile?: string): ValidationResult;
/**
 * Validate workspace-level permissions.json
 * @param workspaceRoot - Absolute path to workspace root folder
 */
export declare function validateWorkspacePermissions(workspaceRoot: string): ValidationResult;
/**
 * Validate source-level permissions.json
 * @param workspaceRoot - Absolute path to workspace root folder
 * @param sourceSlug - Source slug
 */
export declare function validateSourcePermissions(workspaceRoot: string, sourceSlug: string): ValidationResult;
/**
 * Validate app-level default permissions
 */
export declare function validateDefaultPermissions(): ValidationResult;
/**
 * Validate all permissions files in a workspace
 * Includes: app-level default, workspace-level, and all source-level permissions
 */
export declare function validateAllPermissions(workspaceRoot: string): ValidationResult;
/**
 * Check if a permissions file at the given path is valid.
 * Returns true if the file exists and passes schema validation.
 */
export declare function isValidPermissionsFile(filePath: string): boolean;
/**
 * Zod schema for app-level theme override files (~/.twopixel/theme.json).
 * Allows partial overrides but rejects unknown keys.
 */
export declare const ThemeOverrideSchema: z.ZodObject<{
    background: z.ZodOptional<z.ZodString>;
    foreground: z.ZodOptional<z.ZodString>;
    accent: z.ZodOptional<z.ZodString>;
    info: z.ZodOptional<z.ZodString>;
    success: z.ZodOptional<z.ZodString>;
    destructive: z.ZodOptional<z.ZodString>;
    paper: z.ZodOptional<z.ZodString>;
    navigator: z.ZodOptional<z.ZodString>;
    input: z.ZodOptional<z.ZodString>;
    popover: z.ZodOptional<z.ZodString>;
    popoverSolid: z.ZodOptional<z.ZodString>;
    mode: z.ZodOptional<z.ZodEnum<{
        solid: "solid";
        scenic: "scenic";
    }>>;
    backgroundImage: z.ZodOptional<z.ZodString>;
    dark: z.ZodOptional<z.ZodObject<{
        background: z.ZodOptional<z.ZodString>;
        foreground: z.ZodOptional<z.ZodString>;
        accent: z.ZodOptional<z.ZodString>;
        info: z.ZodOptional<z.ZodString>;
        success: z.ZodOptional<z.ZodString>;
        destructive: z.ZodOptional<z.ZodString>;
        paper: z.ZodOptional<z.ZodString>;
        navigator: z.ZodOptional<z.ZodString>;
        input: z.ZodOptional<z.ZodString>;
        popover: z.ZodOptional<z.ZodString>;
        popoverSolid: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
/**
 * Zod schema for preset theme files.
 * Validates theme structure and requires at least one color property.
 */
export declare const PresetThemeSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    license: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    supportedModes: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        light: "light";
        dark: "dark";
    }>>>;
    background: z.ZodOptional<z.ZodString>;
    foreground: z.ZodOptional<z.ZodString>;
    accent: z.ZodOptional<z.ZodString>;
    info: z.ZodOptional<z.ZodString>;
    success: z.ZodOptional<z.ZodString>;
    destructive: z.ZodOptional<z.ZodString>;
    paper: z.ZodOptional<z.ZodString>;
    navigator: z.ZodOptional<z.ZodString>;
    input: z.ZodOptional<z.ZodString>;
    popover: z.ZodOptional<z.ZodString>;
    popoverSolid: z.ZodOptional<z.ZodString>;
    mode: z.ZodOptional<z.ZodEnum<{
        solid: "solid";
        scenic: "scenic";
    }>>;
    backgroundImage: z.ZodOptional<z.ZodString>;
    dark: z.ZodOptional<z.ZodObject<{}, z.core.$loose>>;
    shikiTheme: z.ZodOptional<z.ZodObject<{
        light: z.ZodOptional<z.ZodString>;
        dark: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Validate theme content from a JSON string (no disk reads).
 * Used to check if an existing theme file is valid before deciding to overwrite.
 */
export declare function validateThemeContent(jsonString: string, displayFile?: string): ValidationResult;
/**
 * Validate app-level theme override content from a JSON string (no disk reads).
 * Unlike preset validation, this accepts partial ThemeOverrides objects and rejects unknown keys.
 */
export declare function validateThemeOverrideContent(jsonString: string, displayFile?: string): ValidationResult;
/**
 * Check if a theme file at the given path is valid.
 * Returns true if the file exists and passes schema validation.
 */
export declare function isValidThemeFile(filePath: string): boolean;
/**
 * Validate tool-icons config from a JSON string (no disk reads).
 * Used by PreToolUse hook to validate before writing to disk.
 * Checks JSON syntax, Zod schema, duplicate IDs, and duplicate commands.
 */
export declare function validateToolIconsContent(jsonString: string): ValidationResult;
/**
 * Validate tool-icons/tool-icons.json from disk.
 * Reads the file, runs content validation, and also checks that referenced icon files exist.
 */
export declare function validateToolIcons(): ValidationResult;
/**
 * Format validation result as text for agent response
 */
export declare function formatValidationResult(result: ValidationResult): string;
/**
 * Result of detecting what type of config file a path corresponds to.
 */
export interface ConfigFileDetection {
    type: 'source' | 'skill' | 'statuses' | 'labels' | 'permissions' | 'tool-icons' | 'automations';
    /** Slug of the source or skill (if applicable) */
    slug?: string;
    /** Display file path for error messages */
    displayFile: string;
}
/**
 * Detect if a file path corresponds to a known config file type within a workspace.
 * Returns null if the path is not a recognized config file.
 *
 * Matches patterns:
 * - .../sources/{slug}/config.json → source config
 * - .../skills/{slug}/SKILL.md → skill definition
 * - .../statuses/config.json → status workflow config
 * - .../labels/config.json → label config
 * - .../permissions.json (workspace or source-level) → permission rules
 */
export declare function detectConfigFileType(filePath: string, workspaceRootPath: string): ConfigFileDetection | null;
/**
 * Detect if a file path corresponds to an app-level config file (outside workspace scope).
 * Checks paths relative to CONFIG_DIR (~/.twopixel/).
 * Returns null if the path is not a recognized app-level config file.
 *
 * Matches patterns:
 * - ~/.twopixel/tool-icons/tool-icons.json → tool icon mappings
 */
export declare function detectAppConfigFileType(filePath: string): ConfigFileDetection | null;
/**
 * Validate config file content based on its detected type.
 * Dispatches to the appropriate content-based validator.
 * Returns null if the detection type is unrecognized.
 */
export declare function validateConfigFileContent(detection: ConfigFileDetection, content: string): ValidationResult | null;
//# sourceMappingURL=validators.d.ts.map