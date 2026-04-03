/**
 * Thinking Level Configuration
 *
 * Five-tier thinking system for extended reasoning:
 * - OFF: No extended thinking (disabled)
 * - Low: Light reasoning, faster responses
 * - Medium: Balanced speed and reasoning (default)
 * - High: Deep reasoning for complex tasks
 * - Max: Maximum effort reasoning
 *
 * Session-level setting with workspace defaults.
 *
 * Provider mappings:
 * - Anthropic: adaptive thinking + effort levels (Opus 4.6+)
 * - Pi/OpenAI: reasoning_effort via Pi SDK levels
 */
export type ThinkingLevel = 'off' | 'low' | 'medium' | 'high' | 'max';
export interface ThinkingLevelDefinition {
    id: ThinkingLevel;
    name: string;
    description: string;
}
/**
 * Available thinking levels with display metadata.
 * Used in UI dropdowns and for validation.
 *
 * Labels are user-facing and should be consistent across all UI surfaces
 * (model dropdown, workspace settings, etc.)
 */
export declare const THINKING_LEVELS: readonly ThinkingLevelDefinition[];
/** Default thinking level for new sessions when workspace has no default */
export declare const DEFAULT_THINKING_LEVEL: ThinkingLevel;
/**
 * Map ThinkingLevel to Anthropic SDK effort parameter.
 * Used with adaptive thinking (thinking: { type: 'adaptive' }).
 * Returns null for 'off' (thinking should be disabled entirely).
 */
export declare const THINKING_TO_EFFORT: Record<ThinkingLevel, 'low' | 'medium' | 'high' | 'max' | null>;
/**
 * Get the thinking token budget for a given level and model.
 * Used as fallback for models that don't support adaptive thinking.
 *
 * @param level - The thinking level
 * @param modelId - The model ID (e.g., 'claude-haiku-4-5-20251001')
 * @returns Number of thinking tokens to allocate
 */
export declare function getThinkingTokens(level: ThinkingLevel, modelId: string): number;
/**
 * Get display name for a thinking level.
 */
export declare function getThinkingLevelName(level: ThinkingLevel): string;
/**
 * Validate that a value is a valid ThinkingLevel.
 */
export declare function isValidThinkingLevel(value: unknown): value is ThinkingLevel;
/**
 * Normalize a persisted thinking level value, handling legacy values.
 * Maps the old 'think' value to 'medium' for backward compatibility.
 *
 * TODO: Remove the legacy 'think' compatibility path after old persisted session
 * and workspace data has realistically aged out across upgrades.
 *
 * @returns The normalized ThinkingLevel, or undefined if the value is invalid
 */
export declare function normalizeThinkingLevel(value: unknown): ThinkingLevel | undefined;
//# sourceMappingURL=thinking-levels.d.ts.map