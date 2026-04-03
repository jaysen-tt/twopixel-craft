/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

/**
 * Workspace Types
 *
 * Workspaces are the top-level organizational unit. Everything (sources, sessions)
 * is scoped to a workspace.
 *
 * Directory structure:
 * ~/.twopixel/workspaces/{slug}/
 *   ├── config.json      - Workspace settings
 *   ├── sources/         - Data sources (MCP, API, local)
 *   └── sessions/        - Conversation sessions
 */
import type { PermissionMode } from '../agent/mode-manager.ts';
import type { ThinkingLevel } from '../agent/thinking-levels.ts';
/**
 * Local MCP server configuration
 * Controls whether stdio-based (local subprocess) MCP servers can be spawned.
 */
export interface LocalMcpConfig {
    /**
     * Whether local (stdio) MCP servers are enabled for this workspace.
     * When false, only HTTP-based MCP servers will be used.
     * Default: true (can be overridden by CRAFT_LOCAL_MCP_ENABLED env var)
     */
    enabled: boolean;
}
/**
 * Workspace configuration (stored in config.json)
 */
export interface WorkspaceConfig {
    id: string;
    name: string;
    slug: string;
    /**
     * Default settings for new sessions in this workspace
     */
    defaults?: {
        model?: string;
        /** Default LLM connection for new sessions (slug). Overrides global default. */
        defaultLlmConnection?: string;
        enabledSourceSlugs?: string[];
        permissionMode?: PermissionMode;
        cyclablePermissionModes?: PermissionMode[];
        workingDirectory?: string;
        thinkingLevel?: ThinkingLevel;
        colorTheme?: string;
    };
    /**
     * Local MCP server configuration.
     * Controls whether stdio-based MCP servers can be spawned in this workspace.
     * Resolution order: ENV (CRAFT_LOCAL_MCP_ENABLED) > workspace config > default (true)
     */
    localMcpServers?: LocalMcpConfig;
    createdAt: number;
    updatedAt: number;
}
/**
 * Workspace creation input
 */
export interface CreateWorkspaceInput {
    name: string;
    defaults?: WorkspaceConfig['defaults'];
}
/**
 * Loaded workspace with resolved sources
 */
export interface LoadedWorkspace {
    config: WorkspaceConfig;
    sourceSlugs: string[];
    sessionCount: number;
}
/**
 * Workspace summary for listing (lightweight)
 */
export interface WorkspaceSummary {
    slug: string;
    name: string;
    sourceCount: number;
    sessionCount: number;
    createdAt: number;
    updatedAt: number;
}
//# sourceMappingURL=types.d.ts.map