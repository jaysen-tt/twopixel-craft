/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

/**
 * Mermaid Validate Handler
 *
 * Validates Mermaid diagram syntax using beautiful-mermaid parser.
 * No DOM required - works identically in Claude and Codex.
 */

import type { SessionToolContext } from '../context.ts';
import type { ToolResult } from '../types.ts';
import { parseMermaid } from 'beautiful-mermaid';

export interface MermaidValidateArgs {
  code: string;
}

/**
 * Handle the mermaid_validate tool call.
 *
 * Uses parseMermaid from beautiful-mermaid to validate syntax.
 * If parsing succeeds, the diagram is valid.
 * If parsing throws, returns the error message.
 */
export async function handleMermaidValidate(
  _ctx: SessionToolContext,
  args: MermaidValidateArgs
): Promise<ToolResult> {
  const { code } = args;

  try {
    // parseMermaid throws if syntax is invalid
    parseMermaid(code);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          valid: true,
          message: 'Diagram syntax is valid',
        }, null, 2),
      }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parse error';

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          valid: false,
          error: errorMessage,
          suggestion: 'Check the syntax against ~/.twopixel/docs/mermaid.md',
        }, null, 2),
      }],
      isError: true,
    };
  }
}
