/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

/**
 * LLM Connections
 *
 * Named provider configurations that users can add, configure, and switch between.
 * Each session locks to a specific connection after the first message.
 * Workspaces can set a default connection.
 */
import { type ModelDefinition } from './models';
import type { CredentialManager } from '../credentials/manager.ts';
type PiModelResolver = (piAuthProvider?: string) => ModelDefinition[];
/**
 * Register the Pi model resolver function.
 * Must be called from main process at app startup (before any Pi connections are used).
 * This avoids pulling @mariozechner/pi-ai into the renderer bundle.
 */
export declare function registerPiModelResolver(resolver: PiModelResolver): void;
/**
 * Provider type determines which backend/SDK implementation to use.
 * This is separate from auth mechanism - a provider may support multiple auth types.
 *
 * - 'anthropic': Direct Anthropic API (api.anthropic.com)
 * - 'anthropic_compat': Anthropic-format compatible endpoints (OpenRouter, etc.)
 * - 'bedrock': AWS Bedrock (Claude models via AWS)
 * - 'vertex': Google Vertex AI (Claude models via GCP)
 * - 'pi': Pi unified LLM API (20+ providers via @mariozechner/pi-ai)
 * - 'pi_compat': Pi with custom endpoint (Ollama, self-hosted models)
 */
export type LlmProviderType = 'anthropic' | 'anthropic_compat' | 'bedrock' | 'vertex' | 'pi' | 'pi_compat';
/**
 * @deprecated Use LlmProviderType instead. Kept for migration compatibility.
 */
export type LlmConnectionType = 'anthropic' | 'openai' | 'openai-compat';
/**
 * Authentication mechanism for the connection.
 * Determines the UI pattern, credential storage format, and how credentials are passed.
 *
 * Simple token auth:
 * - 'api_key': Single API key field, fixed endpoint known
 * - 'api_key_with_endpoint': API key + custom endpoint URL fields
 * - 'bearer_token': Single bearer token (different header than API key)
 *
 * OAuth flows (browser redirect):
 * - 'oauth': Browser OAuth flow, provider determined by providerType
 *
 * Cloud provider auth:
 * - 'iam_credentials': AWS-style (Access Key + Secret Key + Region)
 * - 'service_account_file': GCP-style JSON file upload
 * - 'environment': Auto-detect from environment variables
 *
 * No auth:
 * - 'none': No authentication required (local models like Ollama)
 */
export type LlmAuthType = 'api_key' | 'api_key_with_endpoint' | 'oauth' | 'iam_credentials' | 'bearer_token' | 'service_account_file' | 'environment' | 'none';
/**
 * Ownership mode for a connection's model list.
 * - automaticallySyncedFromProvider: provider defaults are synced automatically.
 * - userDefined3Tier: user-picked Best/Balanced/Fast list is preserved.
 */
export type ModelSelectionMode = 'automaticallySyncedFromProvider' | 'userDefined3Tier';
/**
 * Protocol for custom API endpoints.
 * Determines which streaming adapter the Pi SDK uses for requests.
 */
export type CustomEndpointApi = 'openai-completions' | 'anthropic-messages';
/**
 * Custom endpoint protocol config.
 * Set when user configures an arbitrary API endpoint (Ollama, DashScope, vLLM, etc.).
 */
export interface CustomEndpointConfig {
    api: CustomEndpointApi;
}
/**
 * LLM Connection configuration.
 * Stored in config.llmConnections array.
 */
export interface LlmConnection {
    /** URL-safe identifier (e.g., 'anthropic-api', 'ollama-local') */
    slug: string;
    /** Display name shown in UI (e.g., 'Anthropic (API Key)', 'Ollama') */
    name: string;
    /** Provider type determines backend/SDK implementation */
    providerType: LlmProviderType;
    /**
     * @deprecated Use providerType instead. Kept for migration compatibility.
     * Will be removed in a future version.
     */
    type?: LlmConnectionType;
    /** Custom base URL (required for *_compat providers, optional override for others) */
    baseUrl?: string;
    /** Authentication mechanism */
    authType: LlmAuthType;
    /** Override available models (for custom endpoints that don't support model listing) */
    models?: Array<ModelDefinition | string>;
    /** Default model for this connection */
    defaultModel?: string;
    /**
     * Ownership mode for the model list.
     * - automaticallySyncedFromProvider: provider defaults are kept in sync.
     * - userDefined3Tier: preserve user-selected Best/Balanced/Fast list.
     */
    modelSelectionMode?: ModelSelectionMode;
    /**
     * Pi auth provider name (e.g., 'anthropic', 'openai', 'github-copilot').
     * Determines which provider credential Pi SDK uses for LLM calls.
     * Only relevant for 'pi' providerType connections.
     */
    piAuthProvider?: string;
    /**
     * Custom endpoint protocol config.
     * Set when user configures an arbitrary API endpoint (Ollama, DashScope, vLLM, etc.).
     * Determines which streaming adapter the Pi SDK uses for requests.
     */
    customEndpoint?: CustomEndpointConfig;
    /** AWS region (for 'bedrock' provider) */
    awsRegion?: string;
    /** GCP project ID (for 'vertex' provider) */
    gcpProjectId?: string;
    /** GCP region (for 'vertex' provider, e.g., 'us-central1') */
    gcpRegion?: string;
    /** Timestamp when connection was created */
    createdAt: number;
    /** Timestamp when connection was last used */
    lastUsedAt?: number;
}
/**
 * LLM Connection with authentication status.
 * Used by UI to show which connections are ready to use.
 */
export interface LlmConnectionWithStatus extends LlmConnection {
    /** Whether the connection has valid credentials */
    isAuthenticated: boolean;
    /** Error message if authentication check failed */
    authError?: string;
    /** Whether this is the global default connection */
    isDefault?: boolean;
}
/**
 * Get the mini/utility model ID for a connection.
 * Provider-aware search:
 *   - Anthropic (incl. bedrock/vertex): find any model with "haiku" in its id/name
 *   - OpenAI: find any model with "mini" in its id/name
 *   - Otherwise: last model in the list
 *
 * Used for mini agent, title generation, and mini completions.
 *
 * @param connection - LLM connection (or partial with models + providerType)
 * @returns Model ID string, or undefined if no models available
 */
export declare function getMiniModel(connection: Pick<LlmConnection, 'models' | 'providerType'>): string | undefined;
/**
 * Get the summarization model ID for a connection.
 * Same provider-aware logic as getMiniModel(), but separate
 * so summarization and mini agent models can diverge independently.
 *
 * Used for response summarization and API tool summarization.
 *
 * @param connection - LLM connection (or partial with models + providerType)
 * @returns Model ID string, or undefined if no models available
 */
export declare function getSummarizationModel(connection: Pick<LlmConnection, 'models' | 'providerType'>): string | undefined;
/**
 * Generate a URL-safe slug from a display name.
 * @param name - Display name to convert
 * @returns URL-safe slug
 */
export declare function generateSlug(name: string): string;
/**
 * Check if a slug is valid (URL-safe, non-empty).
 * @param slug - Slug to validate
 * @returns true if valid
 */
export declare function isValidSlug(slug: string): boolean;
/**
 * Get credential key for an LLM connection.
 * Format: llm::{slug}::{credentialType}
 *
 * @param slug - Connection slug
 * @param credentialType - Type of credential ('api_key' or 'oauth_token')
 * @returns Credential key string
 */
export declare function getLlmCredentialKey(slug: string, credentialType: 'api_key' | 'oauth_token'): string;
/**
 * Credential storage type for each auth mechanism.
 */
export type LlmCredentialStorageType = 'api_key' | 'oauth_token' | 'iam_credentials' | 'service_account' | null;
/**
 * Map LlmAuthType to credential storage type.
 * Determines how credentials are stored in the credential manager.
 *
 * @param authType - LLM auth type
 * @returns Credential storage type or null if no credential storage needed
 */
export declare function authTypeToCredentialStorageType(authType: LlmAuthType): LlmCredentialStorageType;
/**
 * @deprecated Use authTypeToCredentialStorageType instead.
 * Kept for backwards compatibility during migration.
 */
export declare function authTypeToCredentialType(authType: LlmAuthType): 'api_key' | 'oauth_token' | null;
/**
 * Check if an auth type requires a custom endpoint URL.
 * @param authType - LLM auth type
 * @returns true if endpoint URL field should be shown in UI
 */
export declare function authTypeRequiresEndpoint(authType: LlmAuthType): boolean;
/**
 * Check if a provider type is a "compat" provider.
 * Compat providers use custom endpoints and require explicit model lists.
 * @param providerType - Provider type to check
 * @returns true if this is a compat provider (anthropic_compat or pi_compat)
 */
export declare function isCompatProvider(providerType: LlmProviderType): boolean;
/**
 * Check if a provider type uses Anthropic models (Claude).
 * Includes direct Anthropic, compat endpoints, and cloud providers (Bedrock, Vertex).
 * @param providerType - Provider type to check
 * @returns true if this provider uses Anthropic/Claude models
 */
export declare function isAnthropicProvider(providerType: LlmProviderType): boolean;
/**
 * Check if a provider type uses Pi unified API.
 * @param providerType - Provider type to check
 * @returns true if this provider uses Pi
 */
export declare function isPiProvider(providerType: LlmProviderType): boolean;
/**
 * Get the default model list for a provider type from the registry.
 * For *_compat providers, returns empty array - those should use connection.models instead.
 *
 * @param providerType - Provider type
 * @param piAuthProvider - Optional Pi auth provider for filtering Pi models
 * @returns Model list from registry, or empty array for compat providers
 */
export declare function getModelsForProviderType(providerType: LlmProviderType, piAuthProvider?: string): ModelDefinition[];
/**
 * Get the default model list for a connection's provider type.
 * Unlike getModelsForProviderType(), this handles compat providers by returning
 * the appropriate compat-prefixed model IDs instead of an empty array.
 *
 * Use this whenever you need to populate or backfill a connection's models.
 *
 * @param providerType - Provider type from the connection
 * @param piAuthProvider - Optional Pi auth provider for filtering Pi models
 * @returns Default model list (ModelDefinition[] for standard, string[] for compat)
 */
/**
 * Preferred default model IDs per Pi auth provider.
 * The Pi SDK returns models in arbitrary order (alphabetical by ID), which means
 * deprecated models like claude-3-5-haiku-20241022 can end up first.
 * This map ensures getDefaultModelForConnection() picks a modern, capable model.
 *
 * Format: bare model IDs (without pi/ prefix). Matched against pi/{id} or pi/{id}-*.
 */
export declare const PI_PREFERRED_DEFAULTS: Record<string, string[]>;
export declare function getDefaultModelsForConnection(providerType: LlmProviderType, piAuthProvider?: string): Array<ModelDefinition | string>;
/**
 * Get the default model ID for a connection's provider type.
 * Derived from the first entry in getDefaultModelsForConnection() — single source of truth.
 *
 * @param providerType - Provider type from the connection
 * @param piAuthProvider - Optional Pi auth provider for filtering Pi models
 * @returns Default model ID string
 */
export declare function getDefaultModelForConnection(providerType: LlmProviderType, piAuthProvider?: string): string;
/**
 * Resolve the effective LLM connection slug from available fallbacks.
 *
 * Single source of truth for the fallback chain used everywhere in the UI:
 *   1. Explicit session connection (locked after first message)
 *   2. Workspace-level default override
 *   3. Global default (isDefault flag on a connection)
 *   4. First available connection
 *
 * @param sessionConnection  - Per-session connection slug (session.llmConnection)
 * @param workspaceDefault   - Workspace-level default connection slug
 * @param connections        - All available connections (with status metadata)
 * @returns The resolved slug, or undefined when no connections exist
 */
export declare function resolveEffectiveConnectionSlug(sessionConnection: string | undefined, workspaceDefault: string | undefined, connections: Pick<LlmConnectionWithStatus, 'slug' | 'isDefault'>[]): string | undefined;
/**
 * Check if a session's locked connection is unavailable (deleted/removed).
 * Returns true only when a session has an explicit llmConnection that doesn't
 * match any current connection. Sessions without a stored connection (using
 * the fallback chain) are never "unavailable".
 *
 * @param sessionConnection - Per-session connection slug (session.llmConnection)
 * @param connections - All available connections
 * @returns true if the session's connection no longer exists
 */
export declare function isSessionConnectionUnavailable(sessionConnection: string | undefined, connections: Pick<LlmConnectionWithStatus, 'slug'>[]): boolean;
/**
 * Check if an auth type uses browser OAuth flow.
 * @param authType - LLM auth type
 * @returns true if OAuth browser flow should be triggered
 */
export declare function authTypeIsOAuth(authType: LlmAuthType): boolean;
/**
 * Check if a provider supports a given auth type.
 * Returns valid combinations for the type system.
 *
 * @param providerType - Provider type
 * @param authType - Auth type to check
 * @returns true if this is a valid combination
 */
export declare function isValidProviderAuthCombination(providerType: LlmProviderType, authType: LlmAuthType): boolean;
/** Map a bare Anthropic model ID to its Bedrock-native equivalent. Pass-through if already native or unknown. */
export declare function toBedrockNativeId(modelId: string): string;
/** Map a Bedrock-native model ID back to its bare Anthropic equivalent. Pass-through if already bare or unknown. */
export declare function fromBedrockNativeId(modelId: string): string;
/**
 * Normalize a model ID for Bedrock storage/usage.
 * Strips pi/ prefix and maps bare Anthropic IDs to Bedrock-native format.
 * Idempotent — already-native IDs pass through unchanged.
 */
export declare function normalizeBedrockModelId(modelId: string | undefined): string;
/**
 * Migrate legacy connection type to new provider type.
 * Used during config migration.
 *
 * @param legacyType - Legacy LlmConnectionType value
 * @returns New LlmProviderType value
 */
export declare function migrateConnectionType(legacyType: LlmConnectionType): LlmProviderType;
/**
 * Migrate legacy auth type to new auth type.
 * Determines new auth type based on legacy type + connection context.
 *
 * @param legacyAuthType - Legacy auth type ('api_key' | 'oauth' | 'none')
 * @param hasCustomEndpoint - Whether connection has a custom baseUrl
 * @returns New LlmAuthType value
 */
export declare function migrateAuthType(legacyAuthType: 'api_key' | 'oauth' | 'none', hasCustomEndpoint: boolean): LlmAuthType;
export declare function clearClaudeBedrockRoutingEnvVars(targetEnv?: Record<string, string | undefined>): void;
export declare function resetManagedAnthropicAuthEnvVars(): void;
/**
 * Result of resolving auth env vars for an LLM connection.
 */
export interface ResolvedAuthEnvVars {
    /** Environment variables to set (e.g., ANTHROPIC_API_KEY, CLAUDE_CODE_OAUTH_TOKEN) */
    envVars: Record<string, string>;
    /** Whether credentials were successfully resolved */
    success: boolean;
    /** Warning message if auth resolution encountered issues */
    warning?: string;
}
/**
 * Resolve authentication environment variables for an LLM connection.
 *
 * Provider-agnostic: switches on providerType to determine which env vars
 * to set and how to retrieve credentials. Shared by:
 * - `SessionManager.reinitializeAuth()` (applies to process.env)
 * - `ClaudeAgent.postInit()` (applies to process.env + envOverrides)
 *
 * Providers that handle auth internally (openai, copilot, pi) return
 * empty envVars — their auth is managed in postInit() via native mechanisms.
 *
 * @param connection - The LLM connection config
 * @param connectionSlug - Connection slug for credential lookup
 * @param credentialManager - Credential manager instance
 * @param getValidOAuthToken - Function to get a valid (refreshed) OAuth token
 * @returns Resolved env vars and status
 */
export declare function resolveAuthEnvVars(connection: LlmConnection, connectionSlug: string, credentialManager: CredentialManager, getValidOAuthToken: (slug: string) => Promise<{
    accessToken?: string | null;
}>): Promise<ResolvedAuthEnvVars>;
/**
 * Migrate a legacy LlmConnection to the new format.
 * Creates a new connection object with providerType instead of type.
 *
 * @param legacy - Legacy connection with 'type' field
 * @returns Migrated connection with 'providerType' field
 */
export declare function migrateLlmConnection(legacy: {
    slug: string;
    name: string;
    type: LlmConnectionType;
    baseUrl?: string;
    authType: 'api_key' | 'oauth' | 'none';
    models?: ModelDefinition[];
    defaultModel?: string;
    createdAt: number;
    lastUsedAt?: number;
}): LlmConnection;
/**
 * TwoPixel built-in LLM connection configuration.
 * Points to the TwoPixel LLM proxy server with pre-configured models.
 * Uses OpenAI-compatible API format (pi_compat provider).
 */
export declare const TWOPIXEL_BUILTIN_CONNECTION: LlmConnection;
/**
 * Check if a connection is the TwoPixel built-in connection.
 * @param slug - Connection slug to check
 * @returns true if this is the TwoPixel built-in connection
 */
export declare function isTwoPixelBuiltinConnection(slug: string): boolean;
export {};
//# sourceMappingURL=llm-connections.d.ts.map