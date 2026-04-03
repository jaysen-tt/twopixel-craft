import WebSocket from 'ws';
import { randomUUID } from 'crypto';
import { debug } from '../utils/debug.ts';

export interface PlatformAdapterOptions {
  url: string;
  token?: string;
  clientId?: string;
  onMessage?: (message: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

/**
 * TwoPixel Platform Adapter
 * 负责桌面端 Agent 核心与自研云端 (api.2pixel.cn) 的 WebSocket 长连接通信
 */
export class TwoPixelPlatformAdapter {
  private ws: WebSocket | null = null;
  private options: PlatformAdapterOptions;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;
  private isClosed: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_DELAY = 30000;
  private readonly PING_INTERVAL = 15000; // 15s heartbeats

  constructor(options: PlatformAdapterOptions) {
    this.options = {
      ...options,
      clientId: options.clientId || `twopixel-desktop-${randomUUID().slice(0, 8)}`,
    };
  }

  public connect(): void {
    if (this.isClosed) return;
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;

    this.isConnecting = true;
    
    try {
      debug(`[PlatformAdapter] Connecting to ${this.options.url}...`);
      this.ws = new WebSocket(this.options.url);

      this.ws.on('open', this.handleOpen.bind(this));
      this.ws.on('message', this.handleMessage.bind(this));
      this.ws.on('close', this.handleClose.bind(this));
      this.ws.on('error', this.handleError.bind(this));
      
    } catch (err) {
      this.isConnecting = false;
      this.handleError(err instanceof Error ? err : new Error(String(err)));
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    debug('[PlatformAdapter] Disconnecting...');
    this.isClosed = true;
    this.clearTimers();
    
    if (this.ws) {
      // 1000 = Normal Closure
      this.ws.close(1000, 'Client disconnected');
      this.ws = null;
    }
  }

  public send(payload: any): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      debug('[PlatformAdapter] Cannot send, socket is not open.');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(payload));
      return true;
    } catch (err) {
      debug('[PlatformAdapter] Error sending message:', err);
      return false;
    }
  }

  // ==== 核心业务方法 ====

  /**
   * 广播桌面端的会话流式输出（打字机效果同步给远端）
   */
  public broadcastStreamDelta(sessionId: string, delta: string): void {
    this.send({
      type: 'stream_delta',
      session_id: sessionId,
      delta: delta,
      timestamp: Date.now()
    });
  }

  /**
   * 广播桌面端 Agent 状态变更 (思考中、执行工具中等)
   */
  public broadcastAgentState(sessionId: string, state: string, detail?: any): void {
    this.send({
      type: 'agent_state',
      session_id: sessionId,
      state: state,
      detail: detail,
      timestamp: Date.now()
    });
  }

  /**
   * 远端授权请求 (Ask 权限模式下推送到手机)
   */
  public requestRemoteApproval(toolName: string, params: any, summary: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = randomUUID();
      
      this.send({
        type: 'approval_request',
        request_id: requestId,
        tool: toolName,
        params: params,
        summary: summary,
        timestamp: Date.now()
      });

      // 简单模拟等待超时机制 (实际生产需要更健壮的 Promise Map)
      const timeout = setTimeout(() => {
        reject(new Error('Remote approval timeout'));
      }, 60000); // 60s timeout

      // Note: 实际中，响应会在 handleMessage 中被截获并 resolve
      // 这里仅提供基础骨架
    });
  }

  // ==== 内部处理逻辑 ====

  private handleOpen(): void {
    debug('[PlatformAdapter] WebSocket connected.');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    
    // 发送认证帧
    this.send({
      type: 'auth',
      token: this.options.token || '',
      client_role: 'desktop',
      client_id: this.options.clientId,
      timestamp: Date.now()
    });

    this.startHeartbeat();
    this.options.onConnect?.();
  }

  private handleMessage(data: WebSocket.Data): void {
    try {
      const payload = JSON.parse(data.toString());
      debug(`[PlatformAdapter] Received msg type: ${payload.type}`);
      
      if (payload.type === 'pong') {
        // Heartbeat response, ignore
        return;
      }

      // 透传给上层
      this.options.onMessage?.(payload);
    } catch (err) {
      debug('[PlatformAdapter] Failed to parse incoming message:', err);
    }
  }

  private handleClose(code: number, reason: Buffer): void {
    debug(`[PlatformAdapter] WebSocket closed. Code: ${code}, Reason: ${reason.toString()}`);
    this.isConnecting = false;
    this.ws = null;
    this.clearTimers();
    this.options.onDisconnect?.();
    
    if (!this.isClosed) {
      this.scheduleReconnect();
    }
  }

  private handleError(err: Error): void {
    debug(`[PlatformAdapter] WebSocket error:`, err.message);
    this.options.onError?.(err);
  }

  private scheduleReconnect(): void {
    if (this.isClosed || this.reconnectTimer) return;

    // Exponential backoff
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts), 
      this.MAX_RECONNECT_DELAY
    );
    
    this.reconnectAttempts++;
    debug(`[PlatformAdapter] Reconnecting in ${delay}ms (Attempt ${this.reconnectAttempts})...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.clearTimers();
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, this.PING_INTERVAL);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}
