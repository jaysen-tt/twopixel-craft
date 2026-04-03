/**
 * Human-Readable Session ID Generator
 *
 * Generates session IDs in the format: YYMMDD-adjective-noun
 * Example: 260111-swift-river
 *
 * - Time-sortable by date prefix
 * - Human-readable and memorable
 * - ~20,000 unique combinations per day
 * - Collision handling with numeric suffix
 */
/**
 * Generate date prefix in YYMMDD format
 */
export declare function generateDatePrefix(date?: Date): string;
/**
 * Generate a random adjective-noun slug
 */
export declare function generateHumanSlug(): string;
/**
 * Generate a unique session ID, handling collisions
 *
 * @param existingIds - Set or array of existing session IDs in the workspace
 * @param date - Optional date for the prefix (defaults to now)
 * @returns A unique session ID like "260111-swift-river" or "260111-swift-river-2"
 */
export declare function generateUniqueSessionId(existingIds: Set<string> | string[], date?: Date): string;
/**
 * Parse a session ID to extract its components
 *
 * @param sessionId - A session ID like "260111-swift-river" or legacy UUID
 * @returns Parsed components or null if not in human-readable format
 */
export declare function parseSessionId(sessionId: string): {
    datePrefix: string;
    date: Date;
    slug: string;
    suffix?: number;
} | null;
/**
 * Check if a session ID is in the new human-readable format
 */
export declare function isHumanReadableId(sessionId: string): boolean;
//# sourceMappingURL=slug-generator.d.ts.map