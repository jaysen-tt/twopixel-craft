import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  AppWindow,
  CheckCheck,
  Settings2,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { useMenuComponents } from '@/components/ui/menu-context'
import { getDocUrl, type DocFeature } from '@craft-agent/shared/docs/doc-links'

export type SidebarMenuType = 'allSessions' | 'flagged' | 'status' | 'sources' | 'skills' | 'automations' | 'labels' | 'views' | 'newSession'

export interface SidebarMenuProps {
  type: SidebarMenuType
  statusId?: string
  labelId?: string
  onConfigureStatuses?: () => void
  onMarkAllRead?: () => void
  onConfigureLabels?: (labelId?: string) => void
  onAddLabel?: (parentId?: string) => void
  onDeleteLabel?: (labelId: string) => void
  onAddSource?: () => void
  onAddSkill?: () => void
  onAddAutomation?: () => void
  sourceType?: 'api' | 'mcp' | 'local'
  onConfigureViews?: () => void
  viewId?: string
  onDeleteView?: (id: string) => void
}

export function SidebarMenu({
  type,
  statusId,
  labelId,
  onConfigureStatuses,
  onMarkAllRead,
  onConfigureLabels,
  onAddLabel,
  onDeleteLabel,
  onAddSource,
  onAddSkill,
  onAddAutomation,
  sourceType,
  onConfigureViews,
  viewId,
  onDeleteView,
}: SidebarMenuProps) {
  const { t } = useTranslation()
  const { MenuItem, Separator } = useMenuComponents()

  if (type === 'newSession') {
    return (
      <MenuItem onClick={() => window.electronAPI.openUrl('craftagents://action/new-session?window=focused')}>
        <AppWindow className="h-3.5 w-3.5" />
        <span className="flex-1">{t('menu.openInNewWindow')}</span>
      </MenuItem>
    )
  }

  if ((type === 'allSessions' || type === 'status' || type === 'flagged') && onConfigureStatuses) {
    return (
      <>
        {type === 'allSessions' && onMarkAllRead && (
          <>
            <MenuItem onClick={onMarkAllRead}>
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="flex-1">{t('sidebar.markAllRead')}</span>
            </MenuItem>
            <Separator />
          </>
        )}
        <MenuItem onClick={onConfigureStatuses}>
          <Settings2 className="h-3.5 w-3.5" />
          <span className="flex-1">{t('sidebar.configureStatuses')}</span>
        </MenuItem>
      </>
    )
  }

  if (type === 'labels') {
    return (
      <>
        {onAddLabel && (
          <MenuItem onClick={() => onAddLabel(labelId)}>
            <Plus className="h-3.5 w-3.5" />
            <span className="flex-1">{t('sidebar.addNewLabel')}</span>
          </MenuItem>
        )}
        {onConfigureLabels && (
          <MenuItem onClick={() => onConfigureLabels(labelId)}>
            <Settings2 className="h-3.5 w-3.5" />
            <span className="flex-1">{t('sidebar.editLabels')}</span>
          </MenuItem>
        )}
        {labelId && onDeleteLabel && (
          <>
            <Separator />
            <MenuItem onClick={() => onDeleteLabel(labelId)}>
              <Trash2 className="h-3.5 w-3.5" />
              <span className="flex-1">{t('sidebar.deleteLabel')}</span>
            </MenuItem>
          </>
        )}
      </>
    )
  }

  if (type === 'views') {
    return (
      <>
        {onConfigureViews && (
          <MenuItem onClick={onConfigureViews}>
            <Settings2 className="h-3.5 w-3.5" />
            <span className="flex-1">{t('sidebar.editViews')}</span>
          </MenuItem>
        )}
        {viewId && onDeleteView && (
          <>
            <Separator />
            <MenuItem onClick={() => onDeleteView(viewId)}>
              <Trash2 className="h-3.5 w-3.5" />
              <span className="flex-1">{t('sidebar.deleteView')}</span>
            </MenuItem>
          </>
        )}
      </>
    )
  }

  if (type === 'sources') {
    const docFeature: DocFeature = sourceType
      ? `sources-${sourceType}` as DocFeature
      : 'sources'

    const learnMoreLabel = sourceType === 'api'
      ? t('sidebar.learnMoreAboutAPIs')
      : sourceType === 'mcp'
        ? t('sidebar.learnMoreAboutMCP')
        : sourceType === 'local'
          ? t('sidebar.learnMoreAboutLocal')
          : t('sidebar.learnMoreAboutSources')

    return (
      <>
        {onAddSource && (
          <MenuItem onClick={onAddSource}>
            <Plus className="h-3.5 w-3.5" />
            <span className="flex-1">{t('sidebar.addSource')}</span>
          </MenuItem>
        )}
        <Separator />
        <MenuItem onClick={() => window.electronAPI.openUrl(getDocUrl(docFeature))}>
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="flex-1">{learnMoreLabel}</span>
        </MenuItem>
      </>
    )
  }

  if (type === 'skills' && onAddSkill) {
    return (
      <MenuItem onClick={onAddSkill}>
        <Plus className="h-3.5 w-3.5" />
        <span className="flex-1">{t('sidebar.addSkill')}</span>
      </MenuItem>
    )
  }

  if (type === 'automations') {
    return (
      <>
        {onAddAutomation && (
          <MenuItem onClick={onAddAutomation}>
            <Plus className="h-3.5 w-3.5" />
            <span className="flex-1">{t('sidebar.addAutomation')}</span>
          </MenuItem>
        )}
        <Separator />
        <MenuItem onClick={() => window.electronAPI.openUrl(getDocUrl('automations'))}>
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="flex-1">{t('sidebar.learnMoreAboutAutomations')}</span>
        </MenuItem>
      </>
    )
  }

  // Fallback: return null if no handler provided (shouldn't happen)
  return null
}
