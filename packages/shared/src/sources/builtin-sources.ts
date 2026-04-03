/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

/**
 * Built-in Sources
 *
 * System-level sources that are always available in every workspace.
 * These sources are not shown in the sources list UI but are available
 * for the agent to use.
 *
 * NOTE: craft-agents-docs is now an always-available MCP server configured
 * directly in craft-agent.ts, not a source. This file is kept for backwards
 * compatibility but returns empty results.
 */

import type { LoadedSource, FolderSourceConfig } from './types.ts';

import { join } from 'path';

/**
 * Get all built-in sources for a workspace.
 *
 * This injects the built-in MCP servers (like TwoPixel Image Generator)
 * into the agent's available tools.
 *
 * @param _workspaceId - The workspace ID (unused)
 * @param _workspaceRootPath - Absolute path to workspace root folder (unused)
 * @returns Array of built-in sources
 */
export function getBuiltinSources(_workspaceId: string, _workspaceRootPath: string): LoadedSource[] {
  // Determine if we are running in dev mode or packaged
  const isDev = process.env.NODE_ENV !== 'production' && !process.env.CRAFT_HEADLESS;
  // Fallback path resolution for the builtin image generator MCP
  // In dev it runs via bun/ts-node, in production it would point to built JS
  const imageGeneratorEntryPath = join(__dirname, '../../../../builtin-mcps/image-generator/src/index.ts');
  const puppeteerServerPath = join(__dirname, '../../../../builtin-mcps/browser-agent/node_modules/.bin/mcp-server-puppeteer');
  const cuaAgentPath = join(__dirname, '../../../../builtin-mcps/cua-agent/src/index.ts');
  const officeSuitePath = join(__dirname, '../../../../builtin-mcps/office-suite/src/index.ts');
  const databaseAgentPath = join(__dirname, '../../../../builtin-mcps/database-agent/src/index.ts');
  const ragAgentPath = join(__dirname, '../../../../builtin-mcps/rag-agent/src/index.ts');
  const systemAgentPath = join(__dirname, '../../../../builtin-mcps/system-agent/src/index.ts');

  return [
    {
      config: {
        slug: 'twopixel-image-generator',
        name: 'Image Generator',
        type: 'mcp',
        mcp: {
          transport: 'stdio',
          command: 'bun',
          args: ['run', imageGeneratorEntryPath],
          env: {
            // We pass the global env down, specifically looking for token/keys if needed
            ...process.env
          }
        },
      } as any,
      guide: null,
      workspaceId: _workspaceId,
      workspaceRootPath: _workspaceRootPath,
      folderPath: '', // Virtual source, no folder
      iconPath: undefined
    },
    {
      config: {
        slug: 'twopixel-browser-agent',
        name: 'Browser Agent',
        type: 'mcp',
        mcp: {
          transport: 'stdio',
          command: 'node',
          args: [puppeteerServerPath],
        },
      } as any,
      guide: null,
      workspaceId: _workspaceId,
      workspaceRootPath: _workspaceRootPath,
      folderPath: '', // Virtual source, no folder
      iconPath: undefined
    },
    {
      config: {
        slug: 'twopixel-cua-agent',
        name: 'Computer Use Agent',
        type: 'mcp',
        mcp: {
          transport: 'stdio',
          command: 'bun',
          args: ['run', cuaAgentPath],
        },
      } as any,
      guide: null,
      workspaceId: _workspaceId,
      workspaceRootPath: _workspaceRootPath,
      folderPath: '', // Virtual source, no folder
      iconPath: undefined
    },
    {
      config: {
        slug: 'twopixel-office-suite',
        name: 'Office Suite Agent',
        type: 'mcp',
        mcp: {
          transport: 'stdio',
          command: 'bun',
          args: ['run', officeSuitePath],
        },
      } as any,
      guide: null,
      workspaceId: _workspaceId,
      workspaceRootPath: _workspaceRootPath,
      folderPath: '', // Virtual source, no folder
      iconPath: undefined
    },
    {
      config: {
        slug: 'twopixel-database-agent',
        name: 'Database Agent',
        type: 'mcp',
        mcp: {
          transport: 'stdio',
          command: 'bun',
          args: ['run', databaseAgentPath],
        },
      } as any,
      guide: null,
      workspaceId: _workspaceId,
      workspaceRootPath: _workspaceRootPath,
      folderPath: '', // Virtual source, no folder
      iconPath: undefined
    },
    {
      config: {
        slug: 'twopixel-rag-agent',
        name: 'RAG Knowledge Agent',
        type: 'mcp',
        mcp: {
          transport: 'stdio',
          command: 'bun',
          args: ['run', ragAgentPath],
        },
      } as any,
      guide: null,
      workspaceId: _workspaceId,
      workspaceRootPath: _workspaceRootPath,
      folderPath: '', // Virtual source, no folder
      iconPath: undefined
    },
    {
      config: {
        slug: 'twopixel-system-agent',
        name: 'System Agent',
        type: 'mcp',
        mcp: {
          transport: 'stdio',
          command: 'bun',
          args: ['run', systemAgentPath],
        },
      } as any,
      guide: null,
      workspaceId: _workspaceId,
      workspaceRootPath: _workspaceRootPath,
      folderPath: '', // Virtual source, no folder
      iconPath: undefined
    }
  ];
}

/**
 * Get the built-in Craft Agents docs source.
 *
 * @deprecated craft-agents-docs is now an always-available MCP server
 * configured directly in craft-agent.ts. This function is kept for
 * backwards compatibility but returns a placeholder.
 */
export function getDocsSource(workspaceId: string, workspaceRootPath: string): LoadedSource {
  // Return a placeholder - this shouldn't be called anymore
  const placeholderConfig: FolderSourceConfig = {
    id: 'builtin-craft-agents-docs',
    name: 'Craft Agents Docs',
    slug: 'craft-agents-docs',
    enabled: false,
    provider: 'mintlify',
    type: 'mcp',
    mcp: {
      transport: 'http',
      url: 'https://agents.2pixel.cn/docs/mcp',
      authType: 'none',
    },
    tagline: 'Search Craft Agents documentation and source setup guides',
    icon: '📚',
    isAuthenticated: true,
    connectionStatus: 'connected',
  };

  return {
    workspaceId,
    workspaceRootPath,
    folderPath: '',
    config: placeholderConfig,
    guide: { raw: '' },
    isBuiltin: true,
  };
}

/**
 * Check if a source slug is a built-in source.
 *
 * Returns false - craft-agents-docs is now an always-available MCP server,
 * not a source in the sources system.
 *
 * @param _slug - Source slug to check (unused)
 * @returns false (no built-in sources)
 */
export function isBuiltinSource(_slug: string): boolean {
  return false;
}
