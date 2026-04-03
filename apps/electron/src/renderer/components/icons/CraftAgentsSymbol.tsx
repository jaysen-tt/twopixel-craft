import twoPixelLogo from "@/assets/twopixel_logo.svg"

interface CraftAgentsSymbolProps {
  className?: string
}

/**
 * TwoPixel symbol
 */
export function CraftAgentsSymbol({ className }: CraftAgentsSymbolProps) {
  return (
    <img 
      src={twoPixelLogo} 
      alt="TwoPixel Symbol" 
      className={className} 
    />
  )
}
