/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

/**
 * Documentation Utilities
 *
 * Provides access to built-in documentation that Claude can reference
 * when performing configuration tasks (sources, agents, permissions, etc.).
 *
 * Docs are stored at ~/.twopixel/docs/ and synced from bundled assets.
 * Source content lives in apps/electron/resources/docs/*.md for easier editing.
 */
/**
 * Get bundled docs, loading them lazily on first access.
 * This ensures docs are loaded AFTER setBundledAssetsRoot() has been called.
 */
declare function getBundledDocs(): Record<string, string>;
/**
 * Get the docs directory path
 */
export declare function getDocsDir(): string;
/**
 * Get path to a specific doc file
 */
export declare function getDocPath(filename: string): string;
export declare const APP_ROOT = "~/.twopixel";
/**
 * Documentation file references for use in error messages and tool descriptions.
 * Use these constants instead of hardcoding paths to keep references in sync.
 */
export declare const DOC_REFS: {
    readonly appRoot: "~/.twopixel";
    readonly sources: "~/.twopixel/docs/sources.md";
    readonly permissions: "~/.twopixel/docs/permissions.md";
    readonly skills: "~/.twopixel/docs/skills.md";
    readonly themes: "~/.twopixel/docs/themes.md";
    readonly statuses: "~/.twopixel/docs/statuses.md";
    readonly labels: "~/.twopixel/docs/labels.md";
    readonly toolIcons: "~/.twopixel/docs/tool-icons.md";
    readonly automations: "~/.twopixel/docs/automations.md";
    readonly hooks: "~/.twopixel/docs/automations.md";
    readonly tasks: "~/.twopixel/docs/automations.md";
    readonly mermaid: "~/.twopixel/docs/mermaid.md";
    readonly dataTables: "~/.twopixel/docs/data-tables.md";
    readonly htmlPreview: "~/.twopixel/docs/html-preview.md";
    readonly pdfPreview: "~/.twopixel/docs/pdf-preview.md";
    readonly imagePreview: "~/.twopixel/docs/image-preview.md";
    readonly llmTool: "~/.twopixel/docs/llm-tool.md";
    readonly browserTools: "~/.twopixel/docs/browser-tools.md";
    readonly craftCli: "~/.twopixel/docs/craft-cli.md";
    readonly docsDir: "~/.twopixel/docs/";
};
/**
 * Check if docs directory exists
 */
export declare function docsExist(): boolean;
/**
 * List available doc files
 */
export declare function listDocs(): string[];
/**
 * Initialize docs directory with bundled documentation.
 * Always writes all docs on launch to ensure consistency across debug and release modes.
 */
export declare function initializeDocs(): void;
export { getBundledDocs };
export { parseSourceGuide, getSourceGuide, getSourceGuideForDomain, getSourceKnowledge, extractDomainFromSource, extractDomainFromUrl, type ParsedSourceGuide, type SourceGuideFrontmatter, } from './source-guides.ts';
export { getDocUrl, getDocInfo, DOCS, type DocFeature, type DocInfo, } from './doc-links.ts';
//# sourceMappingURL=index.d.ts.map