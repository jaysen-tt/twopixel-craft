/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import { getApiClientConfig } from '@/config/api-client-config'

export interface TwoPixelUser {
  user_id: string | number
  username: string
  email?: string
  balance?: number
  is_admin?: boolean
}

export interface TwoPixelAuthResult {
  success: boolean
  token?: string
  user?: TwoPixelUser
  error?: string
}

export interface TwoPixelTokenPayload {
  userId: string | number
  username: string
  email?: string
  exp?: number
}

export interface TwoPixelAccountOverview {
  user: TwoPixelUser | null
  balance: number
  todayTokens?: number
  monthTokens?: number
  quotaUsed?: number
  quotaLimit?: number
  todayCost?: number
  monthCost?: number
}

const TOKEN_STORAGE_KEY = 'twopixel_token'
const USER_STORAGE_KEY = 'twopixel_user'
const BALANCE_STORAGE_KEY = 'twopixel_balance'
const IS_ADMIN_STORAGE_KEY = 'twopixel_is_admin'

function getBaseUrl(): string {
  const config = getApiClientConfig()
  return config.baseUrl || 'https://api.2pixel.cn'
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const parsed = parseNumber(value)
    if (parsed !== undefined) return parsed
  }
  return undefined
}

function setStoredUser(user: TwoPixelUser): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  localStorage.setItem(BALANCE_STORAGE_KEY, String(user.balance || 0))
  localStorage.setItem(IS_ADMIN_STORAGE_KEY, String(user.is_admin ? 1 : 0))
}

export async function fetchAuthorizedJson(endpoint: string): Promise<any> {
  const token = getToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  // Use the standard HTTP backend port 6185 (or base url) instead of LLM proxy 16686
  let url = endpoint
  // When using Vite proxy, we don't prepend getBaseUrl() if it's already a relative path starting with /api/
  if (url.startsWith('/api/') && import.meta.env.DEV) {
    // Keep it relative to hit the Vite proxy
  } else if (url.startsWith('/api/')) {
    url = `${getBaseUrl()}${url}`
  } else if (!url.startsWith('http')) {
    url = `${getBaseUrl()}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    if (response.status === 401) {
      await logout()
    }
    throw new Error(`Failed to fetch ${endpoint}`)
  }

  return response.json()
}

export async function login(username: string, password: string): Promise<TwoPixelAuthResult> {
  try {
    const url = import.meta.env.DEV ? '/api/auth/login' : `${getBaseUrl()}/api/auth/login`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (data.success && data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
      const user: TwoPixelUser = {
        user_id: data.user_id || username,
        username: data.username || username,
        email: data.email,
        balance: data.balance || 0,
        is_admin: data.is_admin || false,
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      localStorage.setItem(BALANCE_STORAGE_KEY, String(user.balance || 0))
      localStorage.setItem(IS_ADMIN_STORAGE_KEY, String(user.is_admin ? 1 : 0))
      
      // Sync token to main process platform adapter
      if ((window as any).electronAPI?.syncTwoPixelToken) {
        await (window as any).electronAPI.syncTwoPixelToken(data.token, user.user_id)
      }
      
      return {
        success: true,
        token: data.token,
        user,
      }
    }

    return {
      success: false,
      error: data.error || '登录失败',
    }
  } catch (error) {
    console.error('[TwoPixelAuth] Login error:', error)
    return {
      success: false,
      error: '网络错误，请检查网络连接',
    }
  }
}

export async function sendVerificationCode(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const url = import.meta.env.DEV ? '/api/auth/send-code' : `${getBaseUrl()}/api/auth/send-code`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      return { success: false, error: errData.error || errData.message || '发送验证码失败，请重试' }
    }

    const data = await response.json().catch(() => ({}))
    
    // Gateway might return {"message": "..."} instead of success
    if (data.success || data.message) {
      return { success: true }
    }

    return { success: false, error: data.error || data.message || '发送验证码失败' }
  } catch (error) {
    console.error('[TwoPixelAuth] Send code error:', error)
    return { success: false, error: 'Network error, please check your connection' }
  }
}

export async function register(
  username: string,
  password: string,
  email: string,
  code: string,
): Promise<TwoPixelAuthResult> {
  try {
    const url = import.meta.env.DEV ? '/api/auth/register' : `${getBaseUrl()}/api/auth/register`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, email, code }),
    })

    const data = await response.json()

    // Support both { success: true, token: "..." } and { access_token: "..." }
    const token = data.access_token || data.token
    
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
      const user: TwoPixelUser = {
        user_id: data.user?.id || data.user_id || username,
        username: data.user?.username || data.username || username,
        email: data.user?.email || data.email || email,
        balance: data.user?.balance || data.balance || 10,
        is_admin: data.user?.is_admin || data.is_admin || false,
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      localStorage.setItem(BALANCE_STORAGE_KEY, String(user.balance || 10))
      localStorage.setItem(IS_ADMIN_STORAGE_KEY, String(user.is_admin ? 1 : 0))
      
      // Sync token to main process platform adapter
      if ((window as any).electronAPI?.syncTwoPixelToken) {
        await (window as any).electronAPI.syncTwoPixelToken(token, user.user_id)
      }
      
      return {
        success: true,
        token,
        user,
      }
    }

    return {
      success: false,
      error: data.error || data.message || '注册失败',
    }
  } catch (error) {
    console.error('[TwoPixelAuth] Register error:', error)
    return {
      success: false,
      error: '网络错误，请检查网络连接',
    }
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getUser(): TwoPixelUser | null {
  const userStr = localStorage.getItem(USER_STORAGE_KEY)
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function getBalance(): number {
  return parseFloat(localStorage.getItem(BALANCE_STORAGE_KEY) || '0')
}

export function isAdmin(): boolean {
  return localStorage.getItem(IS_ADMIN_STORAGE_KEY) === '1'
}

export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const payload = JSON.parse(atob(parts[1])) as TwoPixelTokenPayload
    if (payload.exp && payload.exp < Date.now() / 1000) {
      logout() // Fire and forget in sync function
      return false
    }

    return true
  } catch {
    // invalid token
    logout() // Fire and forget in sync function
    return false
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem(BALANCE_STORAGE_KEY)
  localStorage.removeItem(IS_ADMIN_STORAGE_KEY)
  
  if ((window as any).electronAPI?.syncTwoPixelToken) {
    await (window as any).electronAPI.syncTwoPixelToken(null, null)
  }
}

export async function validateToken(): Promise<boolean> {
  const token = getToken()
  if (!token) return false

  try {
    const response = await fetch(`${getBaseUrl()}/api/auth/validate`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      logout()
      return false
    }

    return true
  } catch (error) {
    console.error('[TwoPixelAuth] Token validation error:', error)
    return true
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  if (!token) return {}

  return {
    Authorization: `Bearer ${token}`,
  }
}

export async function fetchAccountOverview(): Promise<TwoPixelAccountOverview> {
  const storedUser = getUser()
  const storedBalance = getBalance()

  let profileResponse: any = null
  let usageResponse: any = null
  let quotaResponse: any = null

  try {
    const results = await Promise.allSettled([
      fetchAuthorizedJson('/api/user/balance'),
      fetchAuthorizedJson('/api/user/quota'),
      fetchAuthorizedJson('/api/v1/usage/summary'),
    ])

    if (results[0].status === 'fulfilled') {
      profileResponse = results[0].value
    } else {
      console.warn('[TwoPixelAuth] Balance fetch failed:', results[0].reason)
    }

    if (results[1].status === 'fulfilled') {
      quotaResponse = results[1].value 
    } else {
      console.warn('[TwoPixelAuth] Quota fetch failed:', results[1].reason)
    }
    
    if (results[2].status === 'fulfilled') {
      usageResponse = results[2].value 
    } else {
      console.warn('[TwoPixelAuth] Usage summary fetch failed:', results[2].reason)
    }
  } catch (error) {
    console.error('[TwoPixelAuth] Error fetching account overview:', error)
  }

  const balance = pickNumber(
    profileResponse?.available_balance,
    profileResponse?.balance,
    storedUser?.balance,
    storedBalance,
  ) ?? 0

  const quotaLimit = pickNumber(quotaResponse?.quota, quotaResponse?.limit) ?? 10.0
  const quotaUsed = pickNumber(quotaResponse?.used_quota, quotaResponse?.used) ?? 0

  const todayCost = pickNumber(
    usageResponse?.today?.total_cost,
    profileResponse?.usage_today?.total_cost,
  )

  const monthCost = pickNumber(
    usageResponse?.month?.total_cost,
    profileResponse?.usage_month?.total_cost,
  )

  const todayTokens = pickNumber(
    usageResponse?.today?.input_tokens,
  ) ? (usageResponse?.today?.input_tokens + usageResponse?.today?.output_tokens) : undefined

  const monthTokens = pickNumber(
    usageResponse?.month?.input_tokens,
  ) ? (usageResponse?.month?.input_tokens + usageResponse?.month?.output_tokens) : undefined

  const user = storedUser
    ? {
        ...storedUser,
        balance,
      }
    : null

  if (user) {
    setStoredUser(user)
  } else {
    localStorage.setItem(BALANCE_STORAGE_KEY, String(balance))
  }

  return {
    user,
    balance,
    todayTokens,
    monthTokens,
    quotaUsed,
    quotaLimit,
    todayCost,
    monthCost,
  }
}
