import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { Spinner } from "@craft-agent/ui"
import { CraftAgentsSymbol } from "@/components/icons/CraftAgentsSymbol"
import { StepFormLayout } from "./primitives"

interface CompletionStepProps {
  status: 'saving' | 'complete'
  spaceName?: string
  onFinish: () => void
}

export function CompletionStep({
  status,
  spaceName,
  onFinish
}: CompletionStepProps) {
  const { t } = useTranslation()
  const isSaving = status === 'saving'

  return (
    <StepFormLayout
      iconElement={isSaving ? (
        <div className="flex size-16 items-center justify-center">
          <Spinner className="text-2xl text-foreground" />
        </div>
      ) : (
        <div className="flex size-16 items-center justify-center">
          <CraftAgentsSymbol className="size-10 text-accent" />
        </div>
      )}
      title={isSaving ? t('onboarding.completion.saving') : t('onboarding.completion.ready')}
      description={
        isSaving ? (
          t('onboarding.completion.savingDesc')
        ) : (
          t('onboarding.completion.readyDesc')
        )
      }
      actions={
        status === 'complete' ? (
          <Button onClick={onFinish} className="w-full max-w-[320px] bg-background shadow-minimal text-foreground hover:bg-foreground/5 rounded-lg" size="lg">
            {t('onboarding.completion.startUsing')}
          </Button>
        ) : undefined
      }
    />
  )
}
