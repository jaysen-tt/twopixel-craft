/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as pdfParseModule from 'pdf-parse';
import * as xlsx from 'xlsx';
import * as mammoth from 'mammoth';
import PptxGenJS from 'pptxgenjs';
// @ts-ignore
import officegen from 'officegen';

const pdfParse = (pdfParseModule as any).default || pdfParseModule;

// Create a new MCP server for Office Suite
const server = new McpServer({
  name: 'twopixel-office-suite',
  version: '1.0.0'
});

function checkFileExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
}

// Tool: read_pdf
server.tool(
  'read_pdf',
  'Extracts text content from a PDF file.',
  {
    file_path: z.string().describe('The absolute path to the PDF file.')
  },
  async ({ file_path }) => {
    try {
      checkFileExists(file_path);
      const dataBuffer = fs.readFileSync(file_path);
      const data = await pdfParse(dataBuffer);
      
      // Return first 50000 characters to avoid overflowing the context window
      const text = data.text.substring(0, 50000);
      const isTruncated = data.text.length > 50000;

      return {
        content: [
          { 
            type: 'text', 
            text: `--- PDF Info ---\nPages: ${data.numpages}\n--- Content ---\n${text}${isTruncated ? '\n\n[Content truncated due to length...]' : ''}` 
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Failed to read PDF: ${error.message}` }]
      };
    }
  }
);

// Tool: read_excel
server.tool(
  'read_excel',
  'Extracts data from an Excel file (.xlsx, .xls, .csv). Returns data as JSON or Markdown table format.',
  {
    file_path: z.string().describe('The absolute path to the Excel/CSV file.'),
    sheet_name: z.string().optional().describe('Specific sheet to read. If not provided, reads the first sheet.'),
    format: z.enum(['json', 'markdown']).default('markdown').describe('Output format.')
  },
  async ({ file_path, sheet_name, format }) => {
    try {
      checkFileExists(file_path);
      const workbook = xlsx.readFile(file_path);
      
      const targetSheetName = sheet_name && workbook.SheetNames.includes(sheet_name) 
        ? sheet_name 
        : workbook.SheetNames[0];
      
      if (!targetSheetName || !workbook.SheetNames.includes(targetSheetName)) {
        throw new Error(`Sheet '${sheet_name}' not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
      }

      const worksheet = workbook.Sheets[targetSheetName];
      if (!worksheet) {
        throw new Error(`Failed to read sheet: ${targetSheetName}`);
      }
      
      if (format === 'json') {
        const jsonData = xlsx.utils.sheet_to_json(worksheet);
        // Limit JSON to first 100 rows to avoid context overflow
        const limitedData = jsonData.slice(0, 100);
        const isTruncated = jsonData.length > 100;
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(limitedData, null, 2) + (isTruncated ? '\n\n[Showing only first 100 rows...]' : '')
            }
          ]
        };
      } else {
        // Output as CSV, which is close enough to Markdown for LLM understanding, or we can use sheet_to_csv
        const csvData = xlsx.utils.sheet_to_csv(worksheet);
        // Limit CSV output to roughly 20000 characters
        const limitedCsv = csvData.substring(0, 20000);
        const isTruncated = csvData.length > 20000;
        return {
          content: [
            { 
              type: 'text', 
              text: `Sheet: ${targetSheetName}\n\n${limitedCsv}${isTruncated ? '\n\n[Content truncated due to length...]' : ''}` 
            }
          ]
        };
      }
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Failed to read Excel file: ${error.message}` }]
      };
    }
  }
);

// Tool: read_word
server.tool(
  'read_word',
  'Extracts text from a Microsoft Word document (.docx).',
  {
    file_path: z.string().describe('The absolute path to the .docx file.')
  },
  async ({ file_path }) => {
    try {
      checkFileExists(file_path);
      const result = await mammoth.extractRawText({ path: file_path });
      
      const text = result.value.substring(0, 50000);
      const isTruncated = result.value.length > 50000;
      
      let warningText = '';
      if (result.messages && result.messages.length > 0) {
        warningText = '\nWarnings during extraction:\n' + result.messages.map(m => `- ${m.message}`).join('\n');
      }

      return {
        content: [
          { 
            type: 'text', 
            text: `${text}${isTruncated ? '\n\n[Content truncated due to length...]' : ''}${warningText}` 
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Failed to read Word document: ${error.message}` }]
      };
    }
  }
);

// Tool: create_excel
server.tool(
  'create_excel',
  'Creates or overwrites an Excel file with provided JSON data.',
  {
    file_path: z.string().describe('The absolute path where the Excel file should be saved.'),
    sheet_name: z.string().default('Sheet1').describe('The name of the sheet.'),
    data: z.string().describe('JSON stringified array of objects representing the rows.')
  },
  async ({ file_path, sheet_name, data }) => {
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(data);
        if (!Array.isArray(parsedData)) {
          throw new Error('Data must be a JSON array of objects');
        }
      } catch (e) {
        throw new Error(`Invalid JSON data provided: ${e}`);
      }

      const worksheet = xlsx.utils.json_to_sheet(parsedData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, sheet_name);
      
      xlsx.writeFile(workbook, file_path);
      
      return {
        content: [{ type: 'text', text: `Successfully created Excel file at: ${file_path}` }]
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Failed to create Excel file: ${error.message}` }]
      };
    }
  }
);

// Tool: create_ppt
server.tool(
  'create_ppt',
  'Creates a PowerPoint presentation (.pptx) based on structured slide data.',
  {
    file_path: z.string().describe('The absolute path where the PPTX file should be saved.'),
    slides: z.string().describe('JSON stringified array of slide objects. Each object should have a "title" and an array of "bullets" (strings).')
  },
  async ({ file_path, slides }) => {
    try {
      let parsedSlides;
      try {
        parsedSlides = JSON.parse(slides);
        if (!Array.isArray(parsedSlides)) {
          throw new Error('Slides data must be a JSON array');
        }
      } catch (e) {
        throw new Error(`Invalid JSON slides data provided: ${e}`);
      }

      const pres = new PptxGenJS();
      pres.title = 'Generated Presentation';

      for (const slideData of parsedSlides) {
        const slide = pres.addSlide();
        
        // Add Title
        if (slideData.title) {
          slide.addText(slideData.title, {
            x: 0.5, y: 0.5, w: '90%', h: 1, 
            fontSize: 36, bold: true, color: '363636', align: 'center'
          });
        }
        
        // Add Bullets
        if (slideData.bullets && Array.isArray(slideData.bullets)) {
          const bulletPoints = slideData.bullets.map((b: string) => ({ text: b, options: { bullet: true } }));
          slide.addText(bulletPoints, {
            x: 1.0, y: 2.0, w: '80%', h: 4, 
            fontSize: 24, color: '363636', align: 'left', valign: 'top'
          });
        }
      }

      await pres.writeFile({ fileName: file_path });
      
      return {
        content: [{ type: 'text', text: `Successfully created PowerPoint presentation at: ${file_path}` }]
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Failed to create PPT: ${error.message}` }]
      };
    }
  }
);

// Tool: create_word
server.tool(
  'create_word',
  'Creates a Microsoft Word document (.docx) with the provided text.',
  {
    file_path: z.string().describe('The absolute path where the .docx file should be saved.'),
    text: z.string().describe('The text content to write into the document.')
  },
  async ({ file_path, text }) => {
    return new Promise((resolve) => {
      try {
        const docx = officegen('docx');
        
        docx.on('error', (err: any) => {
          resolve({ content: [{ type: 'text', text: `Failed to create Word document: ${err.message}` }] });
        });

        const pObj = docx.createP();
        
        // Split text by newlines and add to document
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
          pObj.addText(lines[i]);
          if (i < lines.length - 1) {
            pObj.addLineBreak();
          }
        }

        const out = fs.createWriteStream(file_path);
        
        out.on('error', (err: any) => {
          resolve({ content: [{ type: 'text', text: `Failed to write Word document: ${err.message}` }] });
        });

        out.on('close', () => {
          resolve({ content: [{ type: 'text', text: `Successfully created Word document at: ${file_path}` }] });
        });

        docx.generate(out);
      } catch (error: any) {
        resolve({ content: [{ type: 'text', text: `Error creating Word document: ${error.message}` }] });
      }
    });
  }
);

// Start the server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[TwoPixel Office Suite] MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error running MCP server:', error);
  process.exit(1);
});
