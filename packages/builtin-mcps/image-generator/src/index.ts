/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Create a new MCP server for TwoPixel Image Generation
const server = new McpServer({
  name: 'twopixel-image-generator',
  version: '1.0.0'
});

// Register the generate_image tool
server.tool(
  'generate_image',
  'Generates an image based on a text prompt using Nano Banana Pro (Gemini 3 Pro Image) via TwoPixel standard process.',
  {
    prompt: z.string().describe('The detailed text prompt describing the image to generate.'),
    resolution: z.enum(['1K', '2K', '4K']).default('1K').describe('The resolution of the generated image (1K, 2K, or 4K).'),
  },
  async ({ prompt, resolution }) => {
    try {
      // In production (like your old ai-chat-pro v1), the server relay mode dynamically fetches the Gemini Key 
      // or it is provided via environment variables. 
      // We will first check for the user's TwoPixel token to see if we can get a key from the backend, 
      // but fallback to the direct ENV variables if they are provided (for the local agent context).
      
      let apiKey = process.env.TWOPIXEL_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // If we don't have the API key locally, in the new architecture we would either:
        // 1. Fetch it from the user's backend profile using their JWT token
        // 2. Or pass it down securely from the Electron process.
        const userToken = process.env.TWOPIXEL_TOKEN;
        
        if (userToken && userToken !== 'test') {
          // Future enhancement: Fetch the proxy configuration from the backend
          // const configRes = await fetch('http://43.160.252.207:16686/api/auth/me', { headers: { Authorization: `Bearer ${userToken}` }});
          // const config = await configRes.json();
          // apiKey = config.gemini_api_key;
        }

        if (!apiKey) {
          return {
            content: [{ type: 'text', text: 'Error: Cannot proceed with image generation. GEMINI_API_KEY is missing and relay mode failed to fetch one.' }]
          };
        }
      }

      // Initialize Google GenAI Client
      const ai = new GoogleGenAI({ apiKey });

      // Call the Nano Banana Pro model
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: prompt,
        config: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            imageSize: resolution as any // "1K" | "2K" | "4K"
          }
        }
      });

      // Process the response
      let imageBuffer: Buffer | null = null;
      let mimeType = 'image/png'; // Default
      
      // Look for image data in the parts
      if (response.candidates && response.candidates[0] && response.candidates[0].content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            // The data is base64 encoded string from the REST API
            imageBuffer = Buffer.from(part.inlineData.data as string, 'base64');
            if (part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            break; // Just take the first image
          }
        }
      }

      if (!imageBuffer) {
        return {
          content: [{ type: 'text', text: 'Error: No image data was returned from the model.' }]
        };
      }

      // Save the image to a temporary file so the frontend can render it via local path or we can return it as base64
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
      const filename = `twopixel-gen-${timestamp}.${ext}`;
      
      // Store in OS temp directory
      const tmpDir = os.tmpdir();
      const filePath = path.join(tmpDir, filename);
      
      fs.writeFileSync(filePath, imageBuffer);
      const base64Data = imageBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return {
        content: [
          { type: 'text', text: `Image generated successfully! Saved to: ${filePath}\n\n![Generated Image](${dataUrl})` }
        ]
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `An error occurred while generating the image: ${error.message}` }]
      };
    }
  }
);

// Start the server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[TwoPixel Image Generator] MCP Server running on stdio (Proxy Mode)');
}

main().catch((error) => {
  console.error('Fatal error running MCP server:', error);
  process.exit(1);
});
