# 检查清单 (Checklist)

- [x] `heartbeat-tasks.json` 能够被正确创建和读写。
- [x] SessionManager 在启动时能成功注册心跳定时器。
- [x] 当心跳定时器触发时，且存在配置的任务时，能看到后台成功构造并下发了心跳专属 Prompt。
- [x] 当 AI 的回复是 `HEARTBEAT_OK` 时，该消息不会触发前端的未读消息提醒，也不会在 UI 历史记录中堆积。
- [x] 自动化测试或手动验证确认了：异常情况（AI 回复了非 OK 内容）能正常显示给用户。
