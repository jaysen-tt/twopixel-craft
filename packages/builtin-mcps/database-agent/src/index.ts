/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import Database from 'better-sqlite3';
import { Client } from 'pg';
import * as fs from 'fs';

const server = new McpServer({
  name: 'twopixel-database-agent',
  version: '1.0.0'
});

// Cache for DB connections
const sqliteConnections = new Map<string, Database.Database>();
const pgConnections = new Map<string, Client>();

// --- SQLite Tools ---

server.tool(
  'sqlite_query',
  'Executes a READ-ONLY SQL query against a local SQLite database file. ALWAYS use this to explore table schemas and data before writing complex queries.',
  {
    db_path: z.string().describe('Absolute path to the .db or .sqlite file.'),
    query: z.string().describe('The SELECT SQL query to execute.')
  },
  async ({ db_path, query }) => {
    try {
      if (!fs.existsSync(db_path)) {
        return { content: [{ type: 'text', text: `Error: Database file not found at ${db_path}` }] };
      }

      // Security check: Only allow SELECT, PRAGMA, EXPLAIN queries
      const lowerQuery = query.trim().toLowerCase();
      if (!lowerQuery.startsWith('select') && !lowerQuery.startsWith('pragma') && !lowerQuery.startsWith('explain')) {
        return { content: [{ type: 'text', text: 'Error: Only READ-ONLY queries (SELECT, PRAGMA) are allowed for safety.' }] };
      }

      let db = sqliteConnections.get(db_path);
      if (!db) {
        db = new Database(db_path, { readonly: true });
        sqliteConnections.set(db_path, db);
      }

      const stmt = db.prepare(query);
      const rows = stmt.all();
      
      // Limit output to prevent context overflow
      const limitedRows = rows.slice(0, 100);
      const isTruncated = rows.length > 100;
      
      let resultText = JSON.stringify(limitedRows, null, 2);
      if (isTruncated) {
        resultText += '\n\n... [Results truncated to 100 rows. Add LIMIT/OFFSET to your query to paginate]';
      }

      return {
        content: [{ type: 'text', text: resultText || 'No results found.' }]
      };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `SQLite Error: ${error.message}` }] };
    }
  }
);

// --- PostgreSQL Tools ---

server.tool(
  'postgres_query',
  'Executes a READ-ONLY SQL query against a PostgreSQL database. Requires a valid connection string.',
  {
    connection_string: z.string().describe('PostgreSQL connection string (e.g. postgresql://user:password@localhost:5432/dbname)'),
    query: z.string().describe('The SELECT SQL query to execute.')
  },
  async ({ connection_string, query }) => {
    try {
      // Security check: Only allow SELECT, EXPLAIN queries
      const lowerQuery = query.trim().toLowerCase();
      if (!lowerQuery.startsWith('select') && !lowerQuery.startsWith('explain') && !lowerQuery.startsWith('\\d')) {
        return { content: [{ type: 'text', text: 'Error: Only READ-ONLY queries (SELECT) are allowed for safety.' }] };
      }

      let client = pgConnections.get(connection_string);
      if (!client) {
        client = new Client({ connectionString: connection_string });
        await client.connect();
        pgConnections.set(connection_string, client);
      }

      // We enforce readonly at the transaction level just in case
      await client.query('BEGIN READ ONLY');
      try {
        const res = await client.query(query);
        await client.query('ROLLBACK'); // Always rollback read-only transactions
        
        const rows = res.rows;
        const limitedRows = rows.slice(0, 100);
        const isTruncated = rows.length > 100;
        
        let resultText = JSON.stringify(limitedRows, null, 2);
        if (isTruncated) {
          resultText += '\n\n... [Results truncated to 100 rows. Add LIMIT/OFFSET to your query to paginate]';
        }

        return {
          content: [{ type: 'text', text: resultText || 'No results found.' }]
        };
      } catch (innerError) {
        await client.query('ROLLBACK');
        throw innerError;
      }
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Postgres Error: ${error.message}` }] };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[TwoPixel Database Agent] MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error running MCP server:', error);
  process.exit(1);
});
