/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import twoPixelLogo from "@/assets/twopixel_logo.svg"

interface CraftAgentsLogoProps {
  className?: string
}

/**
 * TwoPixel Logo
 */
export function CraftAgentsLogo({ className }: CraftAgentsLogoProps) {
  return (
    <img 
      src={twoPixelLogo} 
      alt="TwoPixel Logo" 
      className={className} 
    />
  )
}
