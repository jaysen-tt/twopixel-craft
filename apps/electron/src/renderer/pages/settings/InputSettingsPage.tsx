import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PanelHeader } from '@/components/app-shell/PanelHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HeaderMenu } from '@/components/ui/HeaderMenu'
import { routes } from '@/lib/navigate'
import { isMac } from '@/lib/platform'
import type { DetailsPageMeta } from '@/lib/navigation-registry'

import {
  SettingsSection,
  SettingsCard,
  SettingsToggle,
  SettingsMenuSelectRow,
} from '@/components/settings'

export const meta: DetailsPageMeta = {
  navigator: 'settings',
  slug: 'input',
}

export default function InputSettingsPage() {
  const { t } = useTranslation()
  const [autoCapitalisation, setAutoCapitalisation] = useState(true)
  const [spellCheck, setSpellCheck] = useState(false)
  const [sendMessageKey, setSendMessageKey] = useState<'enter' | 'cmd-enter'>('enter')

  useEffect(() => {
    const loadSettings = async () => {
      if (!window.electronAPI) return
      try {
        const [autoCapEnabled, spellCheckEnabled, sendKey] = await Promise.all([
          window.electronAPI.getAutoCapitalisation(),
          window.electronAPI.getSpellCheck(),
          window.electronAPI.getSendMessageKey(),
        ])
        setAutoCapitalisation(autoCapEnabled)
        setSpellCheck(spellCheckEnabled)
        setSendMessageKey(sendKey)
      } catch (error) {
        console.error('Failed to load input settings:', error)
      }
    }
    loadSettings()
  }, [])

  const handleAutoCapitalisationChange = useCallback(async (enabled: boolean) => {
    setAutoCapitalisation(enabled)
    await window.electronAPI.setAutoCapitalisation(enabled)
  }, [])

  const handleSpellCheckChange = useCallback(async (enabled: boolean) => {
    setSpellCheck(enabled)
    await window.electronAPI.setSpellCheck(enabled)
  }, [])

  const handleSendMessageKeyChange = useCallback((value: string) => {
    const key = value as 'enter' | 'cmd-enter'
    setSendMessageKey(key)
    window.electronAPI.setSendMessageKey(key)
  }, [])

  return (
    <div className="h-full flex flex-col">
      <PanelHeader title={t('settings.input')} actions={<HeaderMenu route={routes.view.settings('input')} />} />
      <div className="flex-1 min-h-0 mask-fade-y">
        <ScrollArea className="h-full">
          <div className="px-5 py-7 max-w-3xl mx-auto">
            <div className="space-y-8">
              <SettingsSection title={t('settings.inputSettings.typing')} description={t('settings.inputSettings.typingDesc')}>
                <SettingsCard>
                  <SettingsToggle
                    label={t('settings.inputSettings.autoCapitalisation')}
                    description={t('settings.inputSettings.autoCapitalisationDesc', 'Automatically capitalise the first letter when typing a message.')}
                    checked={autoCapitalisation}
                    onCheckedChange={handleAutoCapitalisationChange}
                  />
                  <SettingsToggle
                    label={t('settings.inputSettings.spellCheck')}
                    description={t('settings.inputSettings.spellCheckDesc', 'Underline misspelled words while typing.')}
                    checked={spellCheck}
                    onCheckedChange={handleSpellCheckChange}
                  />
                </SettingsCard>
              </SettingsSection>

              <SettingsSection title={t('settings.inputSettings.sending', 'Sending')} description={t('settings.inputSettings.sendingDesc', 'Choose how to send messages.')}>
                <SettingsCard>
                  <SettingsMenuSelectRow
                    label={t('settings.inputSettings.sendMessageWith', 'Send message with')}
                    description={t('settings.inputSettings.sendMessageWithDesc', 'Keyboard shortcut for sending messages')}
                    value={sendMessageKey}
                    onValueChange={handleSendMessageKeyChange}
                    options={[
                      { value: 'enter', label: t('settings.inputSettings.enter'), description: t('settings.inputSettings.enterDesc', 'Use Shift+Enter for new lines') },
                      { value: 'cmd-enter', label: isMac ? '⌘ Enter' : 'Ctrl+Enter', description: t('settings.inputSettings.cmdEnterDesc', 'Use Enter for new lines') },
                    ]}
                  />
                </SettingsCard>
              </SettingsSection>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
