/**
 * SDK Bridge - Environment variable building for Claude SDK automation integration
 *
 * Maps SDK automation input fields to CRAFT_* environment variables for command execution.
 */
import type { AgentEvent, SdkAutomationInput } from './types.ts';
/**
 * Build environment variables from SDK automation input.
 * Maps SDK input fields to CRAFT_* environment variables.
 */
export declare function buildEnvFromSdkInput(event: AgentEvent, input: SdkAutomationInput): Record<string, string>;
//# sourceMappingURL=sdk-bridge.d.ts.map