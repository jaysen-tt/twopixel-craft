/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LogIn, User, Lock, AlertCircle } from 'lucide-react'
import { CraftAgentsSymbol } from "@/components/icons/CraftAgentsSymbol"
import { StepFormLayout, ContinueButton } from "./primitives"
import { login, type TwoPixelAuthResult } from '@/lib/twopixel-auth'

interface LoginStepProps {
  onLoginSuccess: (result: TwoPixelAuthResult) => void
  onSwitchToRegister: () => void
  isLoading?: boolean
}

export function LoginStep({
  onLoginSuccess,
  onSwitchToRegister,
  isLoading: externalLoading = false
}: LoginStepProps) {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!username.trim() || !password.trim()) {
      setError(t('auth.login.error.emptyFields'))
      return
    }

    setIsLoading(true)
    try {
      const result = await login(username.trim(), password)
      
      if (result.success) {
        onLoginSuccess(result)
      } else {
        setError(result.error || t('auth.login.error.failed'))
      }
    } catch (err) {
      setError(t('auth.login.error.network'))
    } finally {
      setIsLoading(false)
    }
  }

  const loading = isLoading || externalLoading

  return (
    <StepFormLayout
      iconElement={
        <div className="flex size-16 items-center justify-center">
          <CraftAgentsSymbol className="size-10 text-accent" />
        </div>
      }
      title={t('auth.login.title')}
      description={t('auth.login.description')}
      actions={
        <div className="w-full space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                {t('auth.login.username')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder={t('auth.login.usernamePlaceholder')}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                {t('auth.login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder={t('auth.login.passwordPlaceholder')}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <ContinueButton 
              type="submit"
              className="w-full max-w-none" 
              loading={loading} 
              loadingText={t('common.loading')}
            >
              <LogIn className="mr-2 size-4" />
              {t('auth.login.submit')}
            </ContinueButton>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {t('auth.login.noAccount')}{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              disabled={loading}
            >
              {t('auth.login.register')}
            </button>
          </div>
        </div>
      }
    />
  )
}
