/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */

import { unlink } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import { RPC_CHANNELS } from '@craft-agent/shared/protocol'
import { getCredentialManager } from '@craft-agent/shared/credentials'
import type { RpcServer } from '@craft-agent/server-core/transport'
import type { HandlerDeps } from '../handler-deps'
import { requestClientConfirmDialog } from '@craft-agent/server-core/transport'

export const HANDLED_CHANNELS = [
  RPC_CHANNELS.auth.LOGOUT,
  RPC_CHANNELS.auth.RESET_APP,
  RPC_CHANNELS.auth.SHOW_LOGOUT_CONFIRMATION,
  RPC_CHANNELS.auth.SHOW_DELETE_SESSION_CONFIRMATION,
  RPC_CHANNELS.credentials.HEALTH_CHECK,
] as const

export function registerAuthHandlers(server: RpcServer, deps: HandlerDeps): void {
  // Show logout confirmation dialog (routed to client)
  server.handle(RPC_CHANNELS.auth.SHOW_LOGOUT_CONFIRMATION, async (ctx) => {
    const result = await requestClientConfirmDialog(server, ctx.clientId, {
      type: 'warning',
      buttons: ['Cancel', 'Log Out'],
      defaultId: 0,
      cancelId: 0,
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      detail: 'You will be signed out on this device and need to log in again.',
    })
    // result.response is the index of the clicked button
    // 0 = Cancel, 1 = Log Out
    return result.response === 1
  })

  // Show delete session confirmation dialog (routed to client)
  server.handle(RPC_CHANNELS.auth.SHOW_DELETE_SESSION_CONFIRMATION, async (ctx, name: string) => {
    const result = await requestClientConfirmDialog(server, ctx.clientId, {
      type: 'warning',
      buttons: ['Cancel', 'Delete'],
      defaultId: 0,
      cancelId: 0,
      title: 'Delete Conversation',
      message: `Are you sure you want to delete: "${name}"?`,
      detail: 'This action cannot be undone.',
    })
    // result.response is the index of the clicked button
    // 0 = Cancel, 1 = Delete
    return result.response === 1
  })

  // Logout - clear only the built-in TwoPixel login credential
  server.handle(RPC_CHANNELS.auth.LOGOUT, async () => {
    try {
      const manager = getCredentialManager()
      await Promise.all([
        manager.delete({ type: 'llm_api_key', connectionSlug: 'twopixel-built-in' }),
        manager.delete({ type: 'llm_oauth', connectionSlug: 'twopixel-built-in' }),
        manager.delete({ type: 'llm_iam', connectionSlug: 'twopixel-built-in' }),
        manager.delete({ type: 'llm_service_account', connectionSlug: 'twopixel-built-in' }),
      ])
      deps.platform.logger.info('Logout complete - cleared TwoPixel login credential only')
    } catch (error) {
      deps.platform.logger.error('Logout error:', error)
      throw error
    }
  })

  // Reset app - clear all local credentials and config
  server.handle(RPC_CHANNELS.auth.RESET_APP, async () => {
    try {
      const manager = getCredentialManager()

      const allCredentials = await manager.list()
      for (const credId of allCredentials) {
        await manager.delete(credId)
      }

      const configPath = join(homedir(), '.twopixel', 'config.json')
      await unlink(configPath).catch(() => {
        // Ignore if file doesn't exist
      })

      deps.platform.logger.info('Reset app complete - cleared all credentials and config')
    } catch (error) {
      deps.platform.logger.error('Reset app error:', error)
      throw error
    }
  })

  // Credential health check - validates credential store is readable and usable
  // Called on app startup to detect corruption, machine migration, or missing credentials
  server.handle(RPC_CHANNELS.credentials.HEALTH_CHECK, async () => {
    const manager = getCredentialManager()
    return manager.checkHealth()
  })
}
