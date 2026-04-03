# 心跳与后台任务引擎（Heartbeat Engine） Spec

## Why
目前 TwoPixel (Craft) 的 AI 只能通过用户手动发送消息（Prompt）来触发。在许多场景下，我们需要 AI 能够像数字员工一样，在后台周期性地醒来，检查系统状态、轮询任务或监控错误日志。参考 OpenClaw 的设计，我们需要一个“心跳（Heartbeat）”机制：定期向活跃的会话发送隐藏的系统指令，唤醒 AI 执行检查任务，并在没有异常时静默结束，避免打扰用户。

## What Changes
- **任务存储层**：在 `~/.twopixel/memory/` 下新增 `heartbeat-tasks.json`，存储用户配置的周期性任务（例如：“每隔15分钟检查一次项目错误日志”）。
- **定时唤醒器**：在 `SessionManager.ts` 中引入一个定时器（例如 `setInterval`），每隔 N 分钟扫描活跃会话，如果发现有心跳任务，则向该会话推入一条不可见的 System Message。
- **静默拦截器**：修改 Agent 的响应处理逻辑。如果 AI 判断后台任务一切正常，它只需输出 `HEARTBEAT_OK`。系统拦截到该消息后，直接丢弃且不通知前端界面。只有在 AI 发现问题并输出具体警告时，才作为普通消息展示给用户。

## Impact
- Affected specs: `Session Management`, `Agent Message Pipeline`, `Memory Store`
- Affected code:
  - `packages/shared/src/config/memory-store.ts` (新增 `heartbeat-tasks.json` 支持)
  - `packages/server-core/src/sessions/SessionManager.ts` (增加 `setInterval` 唤醒逻辑和消息注入)
  - `packages/server-core/src/agent/pi-event-adapter.ts` 或 `SessionManager.ts` 中的消息处理逻辑 (增加对 `HEARTBEAT_OK` 的静默拦截)

## ADDED Requirements
### Requirement: 后台定时唤醒机制
The system SHALL provide a heartbeat timer that periodically checks for background tasks and wakes up the active AI session.

#### Scenario: Success case
- **WHEN** the heartbeat timer ticks and there is a configured task "check logs"
- **THEN** a hidden message is sent to the AI instructing it to perform the check.

### Requirement: 消息静默拦截（降噪）
The system SHALL suppress AI responses that consist solely of a specific OK signal (e.g., `HEARTBEAT_OK`).

#### Scenario: Success case
- **WHEN** the AI finishes a background check and finds no issues, outputting `HEARTBEAT_OK`
- **THEN** the message is NOT broadcasted to the frontend UI, keeping the user undisturbed.

## MODIFIED Requirements
### Requirement: 记忆存储引擎
扩展 `memory-store.ts`，增加对 `heartbeat-tasks.json` 的 CRUD 支持。
