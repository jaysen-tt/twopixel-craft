/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

/**
 * Centralized path configuration for Craft Agent.
 *
 * Supports multi-instance development via TWOPIXEL_CONFIG_DIR environment variable.
 * When running from a numbered folder (e.g., craft-tui-agent-1), the detect-instance.sh
 * script sets TWOPIXEL_CONFIG_DIR to ~/.twopixel-1, allowing multiple instances to run
 * simultaneously with separate configurations.
 *
 * Default (non-numbered folders): ~/.twopixel/
 * Instance 1 (-1 suffix): ~/.twopixel-1/
 * Instance 2 (-2 suffix): ~/.twopixel-2/
 */
export declare const CONFIG_DIR: string;
//# sourceMappingURL=paths.d.ts.map