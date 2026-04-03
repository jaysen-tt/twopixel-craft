/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, ChevronDown, CircleDollarSign, Gauge, ShieldCheck, Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AnimatedCollapsibleContent, springTransition } from '@/components/ui/collapsible'
import { useTransportConnectionState } from '@/hooks/useTransportConnectionState'
import * as storage from '@/lib/local-storage'
import { cn } from '@/lib/utils'
import { fetchAccountOverview, getBalance, getUser, isAdmin, type TwoPixelAccountOverview } from '@/lib/twopixel-auth'

function formatCurrency(value?: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: value >= 100 ? 0 : 4,
    maximumFractionDigits: 4,
  }).format(value)
}

function formatCompact(value?: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('zh-CN', {
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
}

function formatUsage(tokens?: number, cost?: number): string {
  if (typeof tokens === 'number' && Number.isFinite(tokens) && tokens > 0) {
    return `${formatCompact(tokens)} tok`
  }

  if (typeof cost === 'number' && Number.isFinite(cost) && cost > 0) {
    return formatCurrency(cost)
  }

  return '--'
}

function formatQuota(used?: number, limit?: number): string {
  if (typeof used === 'number' && typeof limit === 'number' && Number.isFinite(used) && Number.isFinite(limit)) {
    return `${formatCompact(used)} / ${formatCompact(limit)}`
  }

  if (typeof limit === 'number' && Number.isFinite(limit)) {
    return `0 / ${formatCompact(limit)}`
  }

  if (typeof used === 'number' && Number.isFinite(used)) {
    return formatCompact(used)
  }

  return '--'
}

function getInitialOverview(): TwoPixelAccountOverview {
  const user = getUser()
  return {
    user,
    balance: user?.balance ?? getBalance(),
  }
}

export function TwoPixelAccountPanel() {
  const { t } = useTranslation()
  const connectionState = useTransportConnectionState()
  const [overview, setOverview] = useState<TwoPixelAccountOverview>(() => getInitialOverview())
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [isExpanded, setIsExpanded] = useState(() => storage.get(storage.KEYS.accountPanelExpanded, false))

  const refreshOverview = useCallback(async () => {
    try {
      const next = await fetchAccountOverview()
      setOverview(current => ({
        ...current,
        ...next,
        user: next.user ?? current.user,
        balance: next.balance ?? current.balance,
      }))
    } catch (error) {
      console.error('[TwoPixelAccountPanel] Failed to fetch account data:', error)
    }
  }, [])

  useEffect(() => {
    refreshOverview()

    const interval = window.setInterval(refreshOverview, 60_000)
    const handleFocus = () => refreshOverview()
    const handleOnline = () => {
      setIsOnline(true)
      refreshOverview()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('focus', handleFocus)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refreshOverview])

  useEffect(() => {
    storage.set(storage.KEYS.accountPanelExpanded, isExpanded)
  }, [isExpanded])

  const user = overview.user ?? getUser()
  const displayName = user?.username || 'TwoPixel'
  
  // Format ID to 8 digits, e.g., 3 -> 00000003
  const formattedId = user?.user_id 
    ? String(user.user_id).padStart(8, '0') 
    : '--'
    
  const secondaryText = user?.email || `ID ${formattedId}`
  const avatarText = displayName.slice(0, 1).toUpperCase()
  const showAdmin = user?.is_admin || isAdmin()

  const connectionTone = useMemo(() => {
    if (!connectionState) {
      return {
        label: t('sidebar.account.connecting'),
        className: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
      }
    }

    if (connectionState.mode === 'local') {
      return {
        label: t('sidebar.account.localMode'),
        className: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
      }
    }

    if (connectionState.status === 'connected') {
      return {
        label: t('sidebar.account.connected'),
        className: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
      }
    }

    if (connectionState.status === 'connecting' || connectionState.status === 'idle') {
      return {
        label: t('sidebar.account.connecting'),
        className: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
      }
    }

    return {
      label: t('sidebar.account.disconnected'),
      className: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
    }
  }, [connectionState, t])

  const metrics = useMemo(() => ([
    {
      key: 'balance',
      label: t('sidebar.account.balance'),
      value: formatCurrency(overview.balance),
      icon: CircleDollarSign,
    },
    {
      key: 'today',
      label: t('sidebar.account.today'),
      value: formatUsage(overview.todayTokens, overview.todayCost),
      icon: Activity,
    },
    {
      key: 'month',
      label: t('sidebar.account.month'),
      value: formatUsage(overview.monthTokens, overview.monthCost),
      icon: Gauge,
    },
    {
      key: 'quota',
      label: t('sidebar.account.quota'),
      value: formatQuota(overview.quotaUsed, overview.quotaLimit),
      icon: ShieldCheck,
    },
  ]), [overview.balance, overview.monthCost, overview.monthTokens, overview.quotaLimit, overview.quotaUsed, overview.todayCost, overview.todayTokens, t])

  return (
    <div className="rounded-xl border border-foreground/8 bg-foreground/[0.03]">
      <button
        type="button"
        onClick={() => setIsExpanded(current => !current)}
        className={cn(
          'flex w-full items-center gap-3 px-3 py-3 text-left transition-colors duration-200 ease-out hover:bg-foreground/[0.03]',
          isExpanded ? 'rounded-t-xl' : 'rounded-xl',
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-hover text-sm font-semibold text-foreground">
          {avatarText}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-[13px] font-medium text-foreground">{displayName}</div>
            {showAdmin ? (
              <Badge variant="secondary" className="h-5 rounded-full px-1.5 text-[10px] font-medium">
                {t('sidebar.account.admin')}
              </Badge>
            ) : null}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {isOnline ? <Wifi className="h-3 w-3 text-emerald-600" /> : <WifiOff className="h-3 w-3 text-rose-600" />}
            <span className="truncate">
              {isOnline ? t('sidebar.account.online') : t('sidebar.account.offline')}
              {' · '}
              {connectionTone.label}
            </span>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {t('sidebar.account.balance')}: {formatCurrency(overview.balance)}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground',
            isExpanded ? 'rotate-180' : 'rotate-0',
          )}
          style={{ transition: `transform ${typeof springTransition === 'object' ? '0.22s cubic-bezier(0.22, 1, 0.36, 1)' : '0.22s ease-out'}` }}
        />
      </button>

      <AnimatedCollapsibleContent isOpen={isExpanded} className="overflow-hidden">
        <div className="border-t border-foreground/6 px-3 pb-3 pt-2">
          <div className="truncate text-[11px] text-muted-foreground">
            ID {formattedId}
            {user?.email && ` · ${user.email}`}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn(
                'h-6 rounded-full border px-2 text-[11px] font-medium',
                isOnline ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-600 bg-rose-500/10 border-rose-500/20',
              )}
            >
              {isOnline ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
              {isOnline ? t('sidebar.account.online') : t('sidebar.account.offline')}
            </Badge>
            <Badge
              variant="outline"
              className={cn('h-6 rounded-full border px-2 text-[11px] font-medium', connectionTone.className)}
            >
              {connectionTone.label}
            </Badge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {metrics.map(({ key, label, value, icon: Icon }) => (
              <div key={key} className="rounded-lg border border-foreground/6 bg-background/70 px-2.5 py-2">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground/80">
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                </div>
                <div className="mt-1 truncate text-[13px] font-medium text-foreground">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedCollapsibleContent>
    </div>
  )
}
