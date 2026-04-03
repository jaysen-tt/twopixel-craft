# Tasks

- [x] Task 1: 建立结构化的基础记忆存储（阶段一）
  - [x] SubTask 1.1: 在 `packages/shared/src/config/` 或 `memory/` 下创建 `memory-store.ts`，实现对 `rules.json`, `facts.json`, `episodes.jsonl` 的 CRUD 操作。
  - [x] SubTask 1.2: 编写测试脚本确保本地文件读写和结构化存储正常工作。

- [x] Task 2: 实现后台静默记忆提炼逻辑（阶段二）
  - [x] SubTask 2.1: 在 `packages/server-core/src/agent/` 或类似目录中，编写 `memory-extractor.ts`。使用 `miniModel` 跑一段专门的 Prompt，分析传入的消息列表，输出 JSON 格式的 Facts、Rules 和 Episode 摘要。
  - [x] SubTask 2.2: 在 `packages/server-core/src/sessions/SessionManager.ts` 中拦截 `setSessionStatus(id, 'done')`，触发 `memory-extractor` 异步任务，将结果写入阶段一的 Store 中。

- [x] Task 3: 实现轻量级 Context Engine 注入（阶段三）
  - [x] SubTask 3.1: 在 `packages/shared/src/config/preferences.ts` (或新的 `context-engine.ts`) 中，修改 `formatPreferencesForPrompt` 的实现，改为从 `rules.json`, `facts.json` 和最近的 `episodes.jsonl` 中读取内容。
  - [x] SubTask 3.2: 引入简单的关键词匹配或基础 Token 长度控制，确保注入 System Prompt 的内容保持精简。

- [x] Task 4: 移除/废弃旧的工具及清理
  - [x] SubTask 4.1: 修改 `session-tools-core`，将原有的 `update_user_preferences` 工具标记为弃用，或使其代理到新的记忆存储系统。
  - [x] SubTask 4.2: 测试完整生命周期，确认新会话中能正确呈现从旧会话中提取的记忆事实。
