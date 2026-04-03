# 长期记忆架构（Long-Term Memory Engine） Spec

## Why
目前系统仅支持简单的 `preferences.json` 作为静态的用户偏好记录，需要依赖 AI 主动调用工具，且每次全量注入到 System Prompt 中。随着时间推移，这种方式无法支撑复杂的记忆结构（如情景记忆、规则记忆），且全量注入会消耗大量 Token 并降低 AI 的专注度。我们需要参考 OpenClaw 的设计，引入结构化的记忆存储、后台静默提取和轻量级的上下文检索引擎，让 AI 的“记忆”变得无感、强大且智能。

## What Changes
- **阶段一：结构化记忆存储**
  - 在 `~/.twopixel/` 配置目录下新增 `memory/` 目录。
  - 拆分记忆类型为：`rules.json`（长青规则/开发偏好）、`facts.json`（关于用户和项目的事实）以及 `episodes.jsonl`（每日日志/会话摘要）。
- **阶段二：劫持会话生命周期实现静默提炼**
  - 在 `SessionManager.ts` 中拦截会话结束（变为 `done`）或触发上下文压缩（`compact`）的时机。
  - 在后台静默启动一个基于 `miniModel` 的提取任务，分析刚才的对话，提取新的 Rule、Fact 和 Episode，并写入本地记忆文件。
- **阶段三：轻量级 Context Engine 注入**
  - 改造现有的 `formatPreferencesForPrompt` 逻辑。
  - 实现一个简单的文本匹配或基础的检索器，在每次新会话开始或构建 Prompt 时，动态读取 `rules.json`、`facts.json` 和最近的 `episodes.jsonl`，按需将高相关性的内容注入到 System Prompt 的顶部，确保每次注入的文本长度可控。

## Impact
- Affected specs: `Agent Core`, `Session Management`, `System Prompt Generation`
- Affected code:
  - `packages/shared/src/config/preferences.ts` （记忆读取与格式化）
  - `packages/server-core/src/sessions/SessionManager.ts` （会话生命周期拦截）
  - `packages/session-tools-core/src/handlers/update-preferences.ts` （废弃或改造原有的工具逻辑）
  - 新增 `packages/shared/src/memory/` 相关模块。

## ADDED Requirements
### Requirement: 结构化长期记忆存储
The system SHALL provide a file-based storage mechanism separating rules, facts, and episodes.

#### Scenario: Success case
- **WHEN** AI extracts a new coding habit from a conversation
- **THEN** it is saved to `rules.json` and automatically included in future relevant conversations.

### Requirement: 异步记忆巩固（Memory Consolidation）
The system SHALL automatically summarize and extract long-term memories when a session concludes.

#### Scenario: Success case
- **WHEN** a user marks a session as "done"
- **THEN** a background task silently summarizes the session, logs it to `episodes.jsonl`, and extracts any new facts to `facts.json`.

## MODIFIED Requirements
### Requirement: 系统提示词构建
将原本直接读取 `preferences.json` 的逻辑，升级为调用 `ContextEngine`，根据当前会话环境动态拼接记忆上下文。

## REMOVED Requirements
### Requirement: 手动的 update_user_preferences 工具
**Reason**: 记忆提取将转为后台静默自动完成，不再需要占用主线程的 Token 和推理时间。
**Migration**: 逐步淘汰该工具，或者保留其接口仅作内部测试使用。
