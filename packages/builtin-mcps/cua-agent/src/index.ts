/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import robot from 'robotjs';

// Create a new MCP server for Computer Use Automation
const server = new McpServer({
  name: 'twopixel-cua-agent',
  version: '1.0.0'
});

// Tool: mouse_move
server.tool(
  'mouse_move',
  'Moves the mouse to the specified x, y coordinates on the screen.',
  {
    x: z.number().describe('The x coordinate to move the mouse to.'),
    y: z.number().describe('The y coordinate to move the mouse to.')
  },
  async ({ x, y }) => {
    try {
      robot.moveMouse(x, y);
      return {
        content: [{ type: 'text', text: `Successfully moved mouse to (${x}, ${y})` }]
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Failed to move mouse: ${error.message}` }]
      };
    }
  }
);

// Tool: left_click
server.tool(
  'left_click',
  'Performs a left mouse click at the current mouse position.',
  {},
  async () => {
    try {
      robot.mouseClick('left');
      return {
        content: [{ type: 'text', text: 'Successfully clicked left mouse button' }]
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Failed to click: ${error.message}` }]
      };
    }
  }
);

// Tool: type_text
server.tool(
  'type_text',
  'Types the specified text using the keyboard.',
  {
    text: z.string().describe('The text to type.')
  },
  async ({ text }) => {
    try {
      robot.typeString(text);
      return {
        content: [{ type: 'text', text: `Successfully typed: "${text}"` }]
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Failed to type text: ${error.message}` }]
      };
    }
  }
);

// Tool: press_key
server.tool(
  'press_key',
  'Presses a specific key on the keyboard (e.g., enter, escape, tab).',
  {
    key: z.string().describe('The name of the key to press (e.g., enter, escape, tab, space).')
  },
  async ({ key }) => {
    try {
      robot.keyTap(key);
      return {
        content: [{ type: 'text', text: `Successfully pressed key: ${key}` }]
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Failed to press key: ${error.message}` }]
      };
    }
  }
);

// Tool: get_screen_size
server.tool(
  'get_screen_size',
  'Gets the width and height of the main screen.',
  {},
  async () => {
    try {
      const size = robot.getScreenSize();
      return {
        content: [{ type: 'text', text: `Screen size: ${size.width}x${size.height}` }]
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Failed to get screen size: ${error.message}` }]
      };
    }
  }
);

// Start the server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[TwoPixel CUA Agent] MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error running MCP server:', error);
  process.exit(1);
});
