import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Download, FolderOpen, RefreshCw, HardDriveDownload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StepFormLayout, BackButton } from "./primitives"
import type { GitBashStatus } from "../../../shared/types"

export type { GitBashStatus }

interface GitBashWarningProps {
  status: GitBashStatus
  onBrowse: () => Promise<string | null>
  onUsePath: (path: string) => void
  onRecheck: () => void
  onBack: () => void
  isRechecking?: boolean
  errorMessage?: string
  onClearError?: () => void
}

/**
 * GitBashWarning - Warning screen when Git Bash is not found on Windows
 */
export function GitBashWarning({
  status,
  onBrowse,
  onUsePath,
  onRecheck,
  onBack,
  isRechecking = false,
  errorMessage,
  onClearError,
}: GitBashWarningProps) {
  const { t } = useTranslation()
  const [customPath, setCustomPath] = useState(status.path || '')
  const [showCustomPath, setShowCustomPath] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [installProgress, setInstallProgress] = useState<string | null>(null)

  const handleBrowse = async () => {
    const path = await onBrowse()
    if (path) {
      setCustomPath(path)
      setShowCustomPath(true)
    }
  }

  const handleUsePath = () => {
    if (customPath.trim()) {
      onUsePath(customPath.trim())
    }
  }

  const handleDownload = () => {
    window.electronAPI.openUrl('https://git-scm.com/downloads/win')
  }

  const handleSilentInstall = async () => {
    setIsInstalling(true)
    setInstallProgress(t('auth.gitBash.downloading', '正在下载 Git for Windows...'))
    try {
      const result = await (window.electronAPI as any).installGitBash()
      if (result.success) {
        setInstallProgress(t('auth.gitBash.installSuccess', '安装成功，正在重新检查...'))
        setTimeout(() => onRecheck(), 1500)
      } else {
        setInstallProgress(t('auth.gitBash.installFailed', '安装失败: ') + result.error)
        setIsInstalling(false)
      }
    } catch (err: any) {
      setInstallProgress(t('auth.gitBash.installFailed', '安装失败: ') + err.message)
      setIsInstalling(false)
    }
  }

  return (
    <StepFormLayout
      title={t('auth.gitBash.title', '缺少 Git Bash 环境')}
      description={t('auth.gitBash.description', 'TwoPixel 需要 Git Bash 来执行 Windows 上的终端命令，但在您的系统上未找到。')}
    >
      <div className="space-y-4">
        {/* Primary action: One-click install */}
        <div className="rounded-lg border border-border bg-foreground-2 p-4">
          <h3 className="text-sm font-medium text-foreground">
            {t('auth.gitBash.oneClickInstall', '一键静默安装 Git')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('auth.gitBash.oneClickInstallDesc', '推荐：后台自动下载并安装 Git for Windows（约 60MB）。')}
          </p>
          <Button
            onClick={handleSilentInstall}
            disabled={isInstalling}
            className="mt-3 w-full bg-background shadow-minimal text-foreground hover:bg-foreground/5 rounded-lg"
            size="sm"
          >
            {isInstalling ? (
              <RefreshCw className="mr-2 size-4 animate-spin" />
            ) : (
              <HardDriveDownload className="mr-2 size-4" />
            )}
            {isInstalling ? installProgress : t('auth.gitBash.btnInstall', '立即下载并安装')}
          </Button>
          {isInstalling && installProgress && (
            <p className="mt-2 text-center text-xs text-muted-foreground">{installProgress}</p>
          )}
        </div>

        {/* Secondary: Manual download */}
        <div className="rounded-lg border border-border bg-foreground-2 p-4 opacity-80">
          <h3 className="text-sm font-medium text-foreground">
            {t('auth.gitBash.manualDownload', '手动下载安装')}
          </h3>
          <Button
            onClick={handleDownload}
            disabled={isInstalling}
            className="mt-3 w-full bg-background shadow-minimal text-foreground hover:bg-foreground/5 rounded-lg"
            size="sm"
          >
            <Download className="mr-2 size-4" />
            {t('auth.gitBash.btnDownload', '去官网下载')}
          </Button>
        </div>

        {/* Tertiary: Already have Git? */}
        <div className="rounded-lg border border-border bg-foreground-2 p-4">
          <h3 className="text-sm font-medium text-foreground">
            {t('auth.gitBash.alreadyInstalled', '已经安装了 Git？')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('auth.gitBash.alreadyInstalledDesc', '如果安装在非标准路径，您可以手动指定 bash.exe 的位置。')}
          </p>

          {showCustomPath ? (
            <div className="mt-3 space-y-2">
              <Input
                value={customPath}
                onChange={(e) => {
                  setCustomPath(e.target.value)
                  onClearError?.()
                }}
                placeholder="C:\Program Files\Git\bin\bash.exe"
                className="text-xs"
                disabled={isInstalling}
              />
              <Button
                onClick={handleUsePath}
                disabled={!customPath.trim() || isInstalling}
                className="w-full bg-background shadow-minimal text-foreground hover:bg-foreground/5 rounded-lg"
                size="sm"
              >
                {t('auth.gitBash.btnUsePath', '使用此路径')}
              </Button>
              {errorMessage && (
                <p className="text-xs text-red-500">{errorMessage}</p>
              )}
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <Button
                onClick={onRecheck}
                disabled={isRechecking || isInstalling}
                size="sm"
                className="flex-1 bg-background text-foreground hover:bg-foreground/5 rounded-lg shadow-minimal"
              >
                <RefreshCw className={`mr-2 size-4 ${isRechecking ? 'animate-spin' : ''}`} />
                {isRechecking ? t('common.checking', '检查中...') : t('auth.gitBash.btnRecheck', '重新检查')}
              </Button>
              <Button
                onClick={handleBrowse}
                disabled={isInstalling}
                size="sm"
                className="flex-1 bg-background text-foreground hover:bg-foreground/5 rounded-lg shadow-minimal"
              >
                <FolderOpen className="mr-2 size-4" />
                {t('common.browse', '浏览...')}
              </Button>
            </div>
          )}
        </div>

        {/* Back button */}
        <div className="flex justify-center pt-2">
          <BackButton onClick={onBack} disabled={isInstalling} className="max-w-[200px]" />
        </div>
      </div>
    </StepFormLayout>
  )
}
