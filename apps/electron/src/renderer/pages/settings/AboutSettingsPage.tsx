/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Spinner } from '@craft-agent/ui'
import type { DetailsPageMeta } from '@/lib/navigation-registry'

import {
  SettingsSection,
  SettingsCard,
  SettingsRow,
} from '@/components/settings'
import { useUpdateChecker } from '@/hooks/useUpdateChecker'

export const meta: DetailsPageMeta = {
  navigator: 'settings',
  slug: 'about',
}

export default function AboutSettingsPage() {
  const { t } = useTranslation()
  const updateChecker = useUpdateChecker()
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false)

  const handleCheckForUpdates = useCallback(async () => {
    setIsCheckingForUpdates(true)
    try {
      await updateChecker.checkForUpdates()
    } finally {
      setIsCheckingForUpdates(false)
    }
  }, [updateChecker])

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex justify-center min-h-full">
            <div className="w-full max-w-[600px] p-8 pb-16 space-y-10">
              
              {/* Header */}
              <div className="space-y-1.5 pt-4">
                <h1 className="text-2xl font-semibold tracking-tight">{t('settings.about')}</h1>
                <p className="text-sm text-muted-foreground">{t('settings.aboutDesc')}</p>
              </div>

              {/* About section */}
              <SettingsSection title={t('settings.appSettings.about')}>
                <SettingsCard>
                  <SettingsRow label={t('settings.appSettings.version')}>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {updateChecker.updateInfo?.currentVersion ?? t('common.loading')}
                      </span>
                      {updateChecker.isDownloading && updateChecker.updateInfo?.latestVersion && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Spinner className="w-3 h-3" />
                          <span>{t('settings.appSettings.downloading')} v{updateChecker.updateInfo.latestVersion} ({updateChecker.downloadProgress}%)</span>
                        </div>
                      )}
                    </div>
                  </SettingsRow>
                  <SettingsRow label={t('settings.appSettings.checkForUpdates')}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCheckForUpdates}
                      disabled={isCheckingForUpdates}
                    >
                      {isCheckingForUpdates ? (
                        <>
                          <Spinner className="mr-1.5" />
                          {t('settings.appSettings.checking')}
                        </>
                      ) : (
                        t('settings.appSettings.checkNow')
                      )}
                    </Button>
                  </SettingsRow>

                  {updateChecker.isReadyToInstall && updateChecker.updateInfo?.latestVersion && (
                    <SettingsRow label={t('settings.appSettings.updateReady')}>
                      <Button
                        size="sm"
                        onClick={updateChecker.installUpdate}
                      >
                        {t('settings.appSettings.restartToUpdate')} v{updateChecker.updateInfo.latestVersion}
                      </Button>
                    </SettingsRow>
                  )}
                  <SettingsRow label="License">
                    <div className="text-sm text-muted-foreground flex flex-col gap-2">
                      <p>
                        本软件基于 <strong>Craft Agents</strong> 二次修改（非 Craft 官方原版）。
                      </p>
                      <div className="bg-foreground/5 p-3 rounded-md text-xs font-mono space-y-1">
                        <p>原始项目：<a href="https://github.com/craftdocs/craft-agents" target="_blank" rel="noreferrer" className="text-primary hover:underline">https://github.com/craftdocs/craft-agents</a></p>
                        <p>原始版权：Copyright 2025 Craft Docs Ltd.</p>
                        <p>开源协议：Apache License 2.0</p>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={async () => {
                            if (window.electronAPI) {
                              try {
                                const appRoot = await window.electronAPI.getAppRootPath();
                                // Assuming LICENSE is in the root directory
                                await window.electronAPI.showInFolder(`${appRoot}/LICENSE`);
                              } catch (e) {
                                console.error('Failed to open local license', e);
                              }
                            }
                          }}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          查看本地 LICENSE 文件
                        </Button>
                      </div>
                    </div>
                  </SettingsRow>
                </SettingsCard>
              </SettingsSection>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
