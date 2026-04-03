/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import notifier from 'node-notifier';
// @ts-ignore - say doesn't have types available
import sayModule from 'say';

const say = sayModule;

const server = new McpServer({
  name: 'twopixel-system-agent',
  version: '1.0.0'
});

// Tool: send_notification
server.tool(
  'send_notification',
  'Sends a native desktop system notification to the user. Use this to proactively alert the user when a long-running background task is completed, or when you need their attention while they might be looking at another app.',
  {
    title: z.string().optional().describe('The title of the notification. Defaults to "TwoPixel".'),
    message: z.string().describe('The message body of the notification. Keep it concise.'),
    sound: z.boolean().default(true).describe('Whether to play a sound with the notification.')
  },
  async ({ title, message, sound }) => {
    return new Promise((resolve) => {
      try {
        notifier.notify(
          {
            title: title || 'TwoPixel',
            message: message,
            sound: sound,
            wait: false
          },
          (err) => {
            if (err) {
              resolve({ content: [{ type: 'text', text: `Failed to send notification: ${err}` }] });
            } else {
              resolve({ content: [{ type: 'text', text: 'System notification sent successfully.' }] });
            }
          }
        );
      } catch (error: any) {
        resolve({ content: [{ type: 'text', text: `Error sending notification: ${error.message}` }] });
      }
    });
  }
);

// Tool: speak_text
server.tool(
  'speak_text',
  'Uses the system\'s Text-to-Speech (TTS) engine to speak the given text out loud. Use this for highly interactive moments, greetings, or when explicitly asked to speak.',
  {
    text: z.string().describe('The text to speak out loud.'),
    speed: z.number().default(1.0).describe('The speed of the voice (e.g. 1.0 is normal, 1.2 is faster).')
  },
  async ({ text, speed }) => {
    return new Promise((resolve) => {
      try {
        say.speak(text, undefined, speed, (err: any) => {
          if (err) {
            resolve({ content: [{ type: 'text', text: `Failed to speak text: ${err}` }] });
          } else {
            resolve({ content: [{ type: 'text', text: 'Text spoken successfully via TTS.' }] });
          }
        });
      } catch (error: any) {
        resolve({ content: [{ type: 'text', text: `Error speaking text: ${error.message}` }] });
      }
    });
  }
);

// Start the server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[TwoPixel System Agent] MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error running MCP server:', error);
  process.exit(1);
});
