/**
 * Pi Backend Constants
 *
 * Shared constants used by the Pi agent and its event adapter.
 * Extracted here to avoid circular imports between pi-agent.ts and event-adapter.ts.
 */
import type { ThinkingLevel as PiThinkingLevel } from '@mariozechner/pi-agent-core';
import type { ThinkingLevel } from '../../thinking-levels.ts';
/**
 * Map thinking levels to Pi thinking levels.
 * Pi supports: "off" | "minimal" | "low" | "medium" | "high" | "xhigh"
 * Craft supports: "off" | "low" | "medium" | "high" | "max"
 */
export declare const THINKING_TO_PI: Record<ThinkingLevel, PiThinkingLevel>;
/**
 * Map Pi SDK lowercase tool names to PascalCase names used by our permission system.
 * Pi's built-in tools use lowercase names (e.g., 'read', 'bash') but
 * ALWAYS_ALLOWED_TOOLS and shouldAllowToolInMode expect PascalCase (e.g., 'Read', 'Bash').
 *
 * Used by PiAgent (permission enforcement) and PiEventAdapter (tool name normalization).
 */
export declare const PI_TOOL_NAME_MAP: Record<string, string>;
//# sourceMappingURL=constants.d.ts.map