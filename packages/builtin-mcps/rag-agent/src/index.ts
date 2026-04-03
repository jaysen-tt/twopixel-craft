/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ChromaClient } from 'chromadb';
import * as fs from 'fs-extra';
import * as path from 'path';

// Note: To use ChromaDB locally without running a docker container, 
// the user needs to install the Python `chromadb` package, which is handled
// by the `chromadb` npm package under the hood or expects a running server.
// For a fully embedded offline vector DB in Node.js, libraries like `hnswlib-node` or `vectra` are often used.
// However, since ChromaDB is industry standard, we'll implement it here assuming a local/remote Chroma instance.
// Alternatively, for a truly zero-config local RAG, we can use a simple JSON-based embedding store if needed,
// but we will stick to ChromaClient for now.

const server = new McpServer({
  name: 'twopixel-rag-agent',
  version: '1.0.0'
});

// Initialize ChromaDB Client (assumes running on default localhost:8000 if not specified)
const chroma = new ChromaClient({
  path: process.env.CHROMA_URL || "http://localhost:8000"
});

// Tool: add_document_to_knowledge_base
server.tool(
  'add_document_to_knowledge_base',
  'Chunks and adds text content to the vector database for future semantic retrieval.',
  {
    collection_name: z.string().default('twopixel_default').describe('The name of the collection/knowledge base.'),
    document_id: z.string().describe('A unique identifier for this document (e.g. filename).'),
    text: z.string().describe('The raw text content to index.'),
    metadata: z.string().optional().describe('Optional JSON string of metadata (e.g. {"author":"John"}).')
  },
  async ({ collection_name, document_id, text, metadata }) => {
    try {
      // Basic chunking strategy (by paragraphs/length)
      const chunks = text.match(/[\s\S]{1,1000}/g) || [];
      
      const collection = await chroma.getOrCreateCollection({
        name: collection_name,
      });

      const ids = chunks.map((_, i) => `${document_id}_chunk_${i}`);
      const metadatas = chunks.map(() => {
        let meta = { source: document_id };
        if (metadata) {
          try { Object.assign(meta, JSON.parse(metadata)); } catch(e){}
        }
        return meta;
      });

      // Add to collection
      await collection.add({
        ids: ids,
        documents: chunks,
        metadatas: metadatas
      });

      return {
        content: [{ type: 'text', text: `Successfully indexed document ${document_id} into ${chunks.length} chunks in collection '${collection_name}'.` }]
      };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Failed to add document: ${error.message}. Ensure ChromaDB is running.` }] };
    }
  }
);

// Tool: query_knowledge_base
server.tool(
  'query_knowledge_base',
  'Performs a semantic vector search to find relevant information from the knowledge base.',
  {
    collection_name: z.string().default('twopixel_default').describe('The name of the collection to search in.'),
    query: z.string().describe('The question or query string.'),
    n_results: z.number().default(3).describe('Number of relevant chunks to return.')
  },
  async ({ collection_name, query, n_results }) => {
    try {
      const collection = await chroma.getCollection({
        name: collection_name,
      });

      const results = await collection.query({
        queryTexts: [query],
        nResults: n_results,
      });

      const documents = results.documents[0] || [];
      const metadatas = results.metadatas[0] || [];

      if (documents.length === 0) {
        return { content: [{ type: 'text', text: "No relevant information found in the knowledge base." }] };
      }

      let responseText = "Found the following relevant excerpts:\n\n";
      documents.forEach((doc, i) => {
        const meta = metadatas[i] || {};
        responseText += `--- Excerpt ${i+1} (Source: ${meta.source || 'Unknown'}) ---\n${doc}\n\n`;
      });

      return {
        content: [{ type: 'text', text: responseText }]
      };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Failed to query knowledge base: ${error.message}. Ensure ChromaDB is running and collection exists.` }] };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[TwoPixel RAG Agent] MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error running MCP server:', error);
  process.exit(1);
});