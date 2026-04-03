# 检查清单 (Checklist)

- [x] 本地 `~/.twopixel/memory` 目录下成功生成了 `rules.json`, `facts.json`, `episodes.jsonl` 文件。
- [x] 当某个会话被标记为 `done` 时，能在控制台日志中看到触发了“后台记忆提取 (Memory Extraction)”任务。
- [x] 后台提取任务能正确调用 LLM，并将提取到的总结写入 `episodes.jsonl` 或 `facts.json`。
- [x] 开始新会话时，能够从 `formatPreferencesForPrompt` 的输出中看到刚才存储的 Facts 或 Rules 已经被注入到了 System Prompt 的顶部。
- [x] 注入的上下文被限制在了合理的长度内（没有将所有历史日志无脑全部塞入）。
- [x] 自动化测试验证了记忆模块的 CRUD 逻辑和提炼流程，表现完全符合预期。
