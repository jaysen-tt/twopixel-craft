# Tasks

- [x] Task 1: 扩展记忆存储，支持心跳任务清单
  - [x] SubTask 1.1: 修改 `packages/shared/src/config/memory-store.ts`，增加对 `heartbeat-tasks.json` 的支持（CRUD 函数）。
  - [x] SubTask 1.2: 更新测试脚本 `packages/shared/src/config/__tests__/memory.test.ts`，验证 `heartbeat-tasks.json` 的读写。

- [x] Task 2: 实现 SessionManager 中的心跳唤醒器
  - [x] SubTask 2.1: 在 `SessionManager` 类中添加 `startHeartbeat` 和 `stopHeartbeat` 方法，使用 `setInterval`。
  - [x] SubTask 2.2: 定时器触发时，读取 `heartbeat-tasks.json`。如果有任务且会话处于活跃/就绪状态，则通过 `sendMessage` (或内部等效方法) 向 Agent 发送特定的 System 提示词（包含心跳任务列表和 `HEARTBEAT_OK` 规则）。

- [ ] Task 3: 实现静默拦截器（降噪机制）
  - [ ] SubTask 3.1: 在 `SessionManager` 处理 Agent 返回消息的地方（如 `handleSessionEvent` 中的 `message_completed`），检查消息内容是否完全匹配 `HEARTBEAT_OK`（或包含该标记）。
  - [ ] SubTask 3.2: 如果匹配，则将该消息标记为“隐藏”或从持久化和前端事件广播中移除，实现用户无感。

- [x] Task 4: 编写测试脚本验证心跳闭环
  - [x] SubTask 4.1: 编写一个集成测试脚本，模拟添加心跳任务，触发心跳，并验证 `HEARTBEAT_OK` 能够被正确拦截。
