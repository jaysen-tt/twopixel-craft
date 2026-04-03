import { useTranslation } from 'react-i18next'
import { cn } from "@/lib/utils"
import { Key, Monitor } from "lucide-react"
import { CraftAgentsSymbol } from "@/components/icons/CraftAgentsSymbol"
import { StepFormLayout } from "./primitives"

import claudeIcon from "@/assets/provider-icons/claude.svg"
import openaiIcon from "@/assets/provider-icons/openai.svg"
import copilotIcon from "@/assets/provider-icons/copilot.svg"

export type ProviderChoice = 'claude' | 'chatgpt' | 'copilot' | 'api_key' | 'local'

interface ProviderOption {
  id: ProviderChoice
  nameKey: string
  descKey: string
  icon: React.ReactNode
}

const PROVIDER_OPTIONS: ProviderOption[] = [
  {
    id: 'claude',
    nameKey: 'onboarding.provider.claude',
    descKey: 'onboarding.provider.claudeDesc',
    icon: <img src={claudeIcon} alt="" className="size-5 rounded-[3px]" />,
  },
  {
    id: 'chatgpt',
    nameKey: 'onboarding.provider.chatgpt',
    descKey: 'onboarding.provider.chatgptDesc',
    icon: <img src={openaiIcon} alt="" className="size-5 rounded-[3px]" />,
  },
  {
    id: 'copilot',
    nameKey: 'onboarding.provider.copilot',
    descKey: 'onboarding.provider.copilotDesc',
    icon: <img src={copilotIcon} alt="" className="size-5 rounded-[3px]" />,
  },
  {
    id: 'api_key',
    nameKey: 'onboarding.provider.otherProvider',
    descKey: 'onboarding.provider.otherProviderDesc',
    icon: <Key className="size-5" />,
  },
  {
    id: 'local',
    nameKey: 'onboarding.provider.localModel',
    descKey: 'onboarding.provider.localModelDesc',
    icon: <Monitor className="size-5" />,
  },
]

interface ProviderSelectStepProps {
  onSelect: (choice: ProviderChoice) => void
  onSkip?: () => void
}

export function ProviderSelectStep({ onSelect, onSkip }: ProviderSelectStepProps) {
  const { t } = useTranslation()

  return (
    <StepFormLayout
      iconElement={
        <div className="flex size-16 items-center justify-center">
          <CraftAgentsSymbol className="size-10 text-accent" />
        </div>
      }
      title={t('onboarding.welcome.title')}
      description={t('onboarding.provider.subtitle')}
    >
      <div className="space-y-3">
        {PROVIDER_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              "flex w-full items-start gap-4 rounded-xl bg-foreground-2 p-4 text-left transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "hover:bg-foreground/[0.02] shadow-minimal",
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              {option.icon}
            </div>

            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">{t(option.nameKey)}</span>
              <p className="mt-0 text-xs text-muted-foreground">
                {t(option.descKey)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {onSkip && (
        <div className="mt-4 text-center">
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Setup later
          </button>
        </div>
      )}
    </StepFormLayout>
  )
}
