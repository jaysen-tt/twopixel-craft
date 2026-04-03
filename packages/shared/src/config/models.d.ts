/**
 * Provider identifier for AI backends.
 */
export type ModelProvider = 'anthropic' | 'pi';
/**
 * Full model definition with capabilities and costs.
 * Used throughout the application for model selection and display.
 */
export interface ModelDefinition {
    /** Model identifier (e.g., 'claude-sonnet-4-6', 'gpt-5.3-codex') */
    id: string;
    /** Human-readable name (e.g., 'Sonnet 4.6', 'Codex') */
    name: string;
    /** Short display name for compact UI (e.g., 'Sonnet', 'Codex') */
    shortName: string;
    /** Brief description of the model's strengths */
    description: string;
    /** Provider that offers this model */
    provider: ModelProvider;
    /** Maximum context window in tokens */
    contextWindow: number;
    /** Whether this model supports thinking/reasoning effort. Defaults to true when undefined. */
    supportsThinking?: boolean;
}
/**
 * All available models across all providers.
 * This is the authoritative list - all other model arrays derive from this.
 */
export declare const MODEL_REGISTRY: ModelDefinition[];
/**
 * Get models filtered by provider.
 */
export declare function getModelsByProvider(provider: ModelProvider): ModelDefinition[];
/** All Anthropic Claude models */
export declare const ANTHROPIC_MODELS: ModelDefinition[];
/**
 * Legacy compatibility export.
 * Used by existing code that imports MODELS (expects Claude models only).
 * @deprecated Use ANTHROPIC_MODELS or MODEL_REGISTRY instead
 */
export declare const MODELS: ModelDefinition[];
/** Get the first model ID matching a short name (throws if not found) */
export declare function getModelIdByShortName(shortName: string): string;
/** Default model for Anthropic connections (used when creating/backfilling connections) */
export declare const DEFAULT_MODEL: string;
/**
 * Get the default summarization model ID (Haiku).
 * Used as fallback when no connection context is available
 * (e.g., url-validator, mcp/validation, summarize.ts without modelOverride).
 *
 * For connection-aware summarization model resolution, use
 * getSummarizationModel(connection) from llm-connections.ts instead.
 */
export declare function getDefaultSummarizationModel(): string;
/**
 * Get a model by ID from the registry.
 * Also handles Bedrock-native IDs (e.g. "anthropic.claude-opus-4-6-v1")
 * by reverse-mapping to the bare Anthropic ID for lookup.
 */
export declare function getModelById(modelId: string): ModelDefinition | undefined;
/**
 * Get display name for a model ID (full name with version).
 */
export declare function getModelDisplayName(modelId: string): string;
/**
 * Get short display name for a model ID (without version number).
 */
export declare function getModelShortName(modelId: string): string;
/**
 * Get known context window size for a model ID.
 */
export declare function getModelContextWindow(modelId: string): number | undefined;
/**
 * Check if model is an Opus model (for cache TTL decisions).
 */
export declare function isOpusModel(modelId: string): boolean;
/**
 * Check if a model ID refers to a Claude model.
 * Handles direct Anthropic IDs (e.g. "claude-sonnet-4-6"),
 * provider-prefixed IDs (e.g. "anthropic/claude-sonnet-4" via OpenRouter),
 * and Bedrock-native IDs (e.g. "anthropic.claude-opus-4-6-v1").
 */
export declare function isClaudeModel(modelId: string): boolean;
/**
 * Get the provider for a model ID.
 */
export declare function getModelProvider(modelId: string): ModelProvider | undefined;
//# sourceMappingURL=models.d.ts.map