/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, User, Lock, Mail, AlertCircle, KeyRound } from 'lucide-react'
import { CraftAgentsSymbol } from "@/components/icons/CraftAgentsSymbol"
import { StepFormLayout, ContinueButton } from "./primitives"
import { register, sendVerificationCode, type TwoPixelAuthResult } from '@/lib/twopixel-auth'

interface RegisterStepProps {
  onRegisterSuccess: (result: TwoPixelAuthResult) => void
  onSwitchToLogin: () => void
  isLoading?: boolean
}

export function RegisterStep({
  onRegisterSuccess,
  onSwitchToLogin,
  isLoading: externalLoading = false
}: RegisterStepProps) {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [countdown])

  const handleSendCode = async () => {
    setError(null)
    setSuccessMsg(null)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t('auth.register.error.invalidEmail'))
      return
    }

    setIsSendingCode(true)
    try {
      const result = await sendVerificationCode(email.trim())
      if (result.success) {
        setSuccessMsg(t('auth.register.sendCodeSuccess'))
        setCountdown(60)
      } else {
        setError(result.error || '发送验证码失败')
      }
    } catch (err) {
      setError(t('auth.register.error.network'))
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    
    if (!username.trim() || !email.trim() || !password.trim() || !code.trim()) {
      setError(t('auth.register.error.emptyFields'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.register.error.passwordMismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('auth.register.error.passwordTooShort'))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t('auth.register.error.invalidEmail'))
      return
    }

    setIsLoading(true)
    try {
      const result = await register(username.trim(), password, email.trim(), code.trim())
      
      if (result.success) {
        onRegisterSuccess(result)
      } else {
        setError(result.error || t('auth.register.error.failed'))
      }
    } catch (err) {
      setError(t('auth.register.error.network'))
    } finally {
      setIsLoading(false)
    }
  }

  const loading = isLoading || externalLoading || isSendingCode

  return (
    <StepFormLayout
      iconElement={
        <div className="flex size-16 items-center justify-center">
          <CraftAgentsSymbol className="size-10 text-accent" />
        </div>
      }
      title={t('auth.register.title')}
      description={t('auth.register.description')}
      actions={
        <div className="w-full space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-600">
                <span>{successMsg}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="reg-username" className="text-sm font-medium text-foreground">
                {t('auth.register.username')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="reg-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder={t('auth.register.usernamePlaceholder')}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-sm font-medium text-foreground">
                {t('auth.register.email')}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder={t('auth.register.emailPlaceholder')}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading || countdown > 0 || !email}
                  className="whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                >
                  {countdown > 0 ? `${countdown}s` : t('auth.register.sendCode')}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-code" className="text-sm font-medium text-foreground">
                {t('auth.register.verificationCode')}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="reg-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder={t('auth.register.verificationCodePlaceholder')}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-password" className="text-sm font-medium text-foreground">
                {t('auth.register.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder={t('auth.register.passwordPlaceholder')}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-confirm-password" className="text-sm font-medium text-foreground">
                {t('auth.register.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="reg-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <ContinueButton 
              type="submit"
              className="w-full max-w-none" 
              loading={loading} 
              loadingText={t('common.loading')}
            >
              <UserPlus className="mr-2 size-4" />
              {t('auth.register.submit')}
            </ContinueButton>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {t('auth.register.hasAccount')}{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              disabled={loading}
            >
              {t('auth.register.login')}
            </button>
          </div>
        </div>
      }
    />
  )
}
