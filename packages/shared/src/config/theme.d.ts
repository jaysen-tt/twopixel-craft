/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

/**
 * Theme Configuration
 *
 * App-level theme system with preset themes.
 * Light mode is default, with optional dark mode overrides.
 *
 * Storage locations:
 * - App override:   ~/.twopixel/theme.json
 * - Preset themes:  ~/.twopixel/themes/*.json
 */
/**
 * CSS color string - any valid CSS color format:
 * - Hex: #8b5cf6, #8b5cf6cc
 * - RGB: rgb(139, 92, 246), rgba(139, 92, 246, 0.8)
 * - HSL: hsl(262, 83%, 58%)
 * - OKLCH: oklch(0.58 0.22 293) (recommended)
 * - Named: purple, rebeccapurple
 */
export type CSSColor = string;
/**
 * Core theme colors (6-color semantic system)
 */
export interface ThemeColors {
    background?: CSSColor;
    foreground?: CSSColor;
    accent?: CSSColor;
    info?: CSSColor;
    success?: CSSColor;
    destructive?: CSSColor;
}
/**
 * Surface colors for specific UI regions
 * All optional - fall back to `background` if not set
 */
export interface SurfaceColors {
    paper?: CSSColor;
    navigator?: CSSColor;
    input?: CSSColor;
    popover?: CSSColor;
    popoverSolid?: CSSColor;
}
/**
 * Theme mode - solid (default) or scenic (background image with glass panels)
 */
export type ThemeMode = 'solid' | 'scenic';
/**
 * Theme overrides - light mode default, optional dark overrides
 * App-level only (no workspace cascading)
 */
export interface ThemeOverrides extends ThemeColors, SurfaceColors {
    dark?: ThemeColors & SurfaceColors;
    /**
     * Theme mode: 'solid' (default) or 'scenic'
     * - solid: Traditional solid color backgrounds
     * - scenic: Full-window background image with glass panels
     */
    mode?: ThemeMode;
    /**
     * Background image URL for scenic mode
     * Remote URL to background image (JPEG, PNG, WebP recommended)
     * Required when mode='scenic', ignored otherwise
     */
    backgroundImage?: string;
}
/**
 * Resolve theme from app-level source
 * (Workspace cascading has been removed for simplicity)
 */
export declare function resolveTheme(app?: ThemeOverrides): ThemeOverrides;
/**
 * Generate CSS variable declarations from theme
 * @param theme - Resolved theme object
 * @param isDark - Whether to apply dark mode overrides
 * @returns CSS string with variable declarations
 */
export declare function themeToCSS(theme: ThemeOverrides, isDark?: boolean): string;
/**
 * Hex equivalents of background colors for Electron BrowserWindow.
 * The main process cannot use CSS/oklch colors, so we provide hex values
 * that visually match the DEFAULT_THEME oklch colors.
 */
export declare const BACKGROUND_HEX: {
    readonly light: "#faf9fb";
    readonly dark: "#302f33";
};
/**
 * Get background color hex value for BrowserWindow backgroundColor.
 * Use this in the main process where CSS variables aren't available.
 */
export declare function getBackgroundColor(isDark: boolean): string;
/**
 * Default theme values (matches current index.css)
 */
export declare const DEFAULT_THEME: ThemeOverrides;
/**
 * Shiki theme configuration for syntax highlighting
 */
export interface ShikiThemeConfig {
    light?: string;
    dark?: string;
}
/**
 * Extended theme file format with metadata
 * Used for preset themes stored as JSON files
 */
export interface ThemeFile extends ThemeOverrides {
    name?: string;
    description?: string;
    author?: string;
    license?: string;
    source?: string;
    supportedModes?: ('light' | 'dark')[];
    shikiTheme?: ShikiThemeConfig;
}
/**
 * Preset theme with ID and path
 */
export interface PresetTheme {
    id: string;
    path: string;
    theme: ThemeFile;
}
/**
 * Default Shiki themes (used when no preset is selected)
 */
export declare const DEFAULT_SHIKI_THEME: ShikiThemeConfig;
/**
 * Get Shiki theme name for current mode
 */
export declare function getShikiTheme(shikiConfig: ShikiThemeConfig | undefined, isDark: boolean): string;
//# sourceMappingURL=theme.d.ts.map