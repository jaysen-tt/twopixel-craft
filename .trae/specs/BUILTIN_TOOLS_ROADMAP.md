# TwoPixel 全能助理内置工具 (MCP & Skills) 补全计划

基于 TwoPixel 从“代码助手”向“全能型桌面 AI 员工”转型的战略目标，我们将利用现有的 **MCP (Model Context Protocol)** 和 **Skills 动态加载** 架构，以“即插即用”的方式内置 7 大核心能力。

为了保证系统核心的纯净度，所有新增能力均以独立的 MCP Server 形式存在于 `packages/builtin-mcps/` 目录下，并由主进程在后台静默拉起。

---

## 实施阶段规划

### Phase 1: 视觉与网页探索 (本周目标)
这两项能力见效最快，且能极大扩展 Agent 的使用场景。

- [x] **1. 文生图与图像处理 (Image Generation)**
  - **实现方式**: 自研轻量级 Node.js MCP Server。
  - **功能**: 提供 `generate_image` 工具，对接 TwoPixel 后端绘图 API（Nano Banana / Gemini 3 Pro Image）。
  - **交互**: 结合 Skill，在对话中直接渲染 Markdown 图片。
  - **状态记录**: 客户端 MCP 插件已完成。发现旧版直连存在 API Key 泄漏风险，当前节点转向**改造服务器端**，补充 `/v1/images/generations` 代理路由，实现真正的安全中转后，再行联调。
- [x] **2. 浏览器自动化 (Browser Automation)**
  - **实现方式**: 引入官方开源的 `puppeteer` 或 `playwright` MCP Server。
  - **功能**: `goto`, `click`, `screenshot`, `evaluate_js`。
  - **场景**: 让 Agent 帮你去网页抓取热搜、填表、甚至操作后台系统。

### Phase 2: 物理接管与办公提效 (已完成)
这两项是硬核能力，直接替代用户的键鼠和繁琐的数据处理。

- [x] **3. CUA 电脑控制 (Computer Use Automation)**
  - **实现方式**: 引入轻量级跨平台 Node.js 库 (robotjs) 构建本地 MCP Server。
  - **功能**: 获取屏幕截图、计算坐标、模拟鼠标点击、键盘输入。
  - **场景**: 真正的“无人值守”自动化。
- [x] **4. 办公文档解析 (Office Suite)**
  - **实现方式**: 自研 Node.js MCP Server，集成 `pdf-parse`, `xlsx`, `mammoth`, `officegen`, `pptxgenjs` 等库。
  - **功能**: `read_pdf`, `read_excel`, `read_word`, `create_excel`, `create_word`, `create_ppt`。
  - **场景**: 用户丢入报表或文档路径，Agent 直接提取文本和表格数据并给出总结；或根据对话直接生成并保存排版好的办公文档。

### Phase 3: 数据库与外脑扩展 (已完成)
- [x] **5. 数据库查询 (Database Access)**
  - **实现方式**: 自研 Node.js MCP Server，集成 `better-sqlite3` 和 `pg`。
  - **功能**: 安全执行只读 SQL 查询，支持截断保护。
  - **场景**: 协助用户或企业进行基础的业务数据摸底和分析。
- [x] **6. 知识库与向量检索 (RAG)**
  - **实现方式**: 自研 Node.js MCP Server，集成 `chromadb` 官方客户端。
  - **功能**: 文档切片索引、语义化向量搜索 (`add_document_to_knowledge_base`, `query_knowledge_base`)。
  - **场景**: 充当设计师的“个人灵感库”、“提示词词典”及“超长甲方规范解读外脑”。

### Phase 4: 语音与系统通知 (进行中)
- [ ] **7. 系统通知推送 (System Notifications)**
  - **实现方式**: 构建本地 Node.js MCP Server，调用操作系统原生 API (如 `node-notifier`)。
  - **功能**: Agent 在后台完成长耗时任务后，主动弹窗提醒。
- [ ] **8. 语音播报 (TTS)**
  - **实现方式**: 集成跨平台 TTS 库 (如 `say`)，通过命令行调用系统发声引擎。
  - **功能**: Agent 可以通过语音汇报工作结果，增强“实体助理”感。

---

## 技术规范与架构约定

1. **目录结构**:
   新增 `packages/builtin-mcps/` 目录，所有的官方内置 MCP 服务都放在这里独立维护。
   ```text
   twopixel-craft/
   └── packages/
       └── builtin-mcps/
           ├── image-generator/   # 文生图 MCP
           ├── browser-agent/     # 网页自动化 MCP
           └── office-suite/      # 办公套件 MCP
   ```
2. **静默加载**:
   修改 `SessionManager` 或 `app/electron/src/main/index.ts` 的 MCP 注册逻辑，将这些内置的 MCP 服务默认注入到 `mcp_servers.json` 中，用户“开箱即用”，无需手动配置命令行路径。
3. **安全隔离**:
   所有高危操作（如 CUA 点击、数据库查询）必须接入现有的 `Explore/Ask/Auto` 权限系统，默认在 `Ask` 模式下需要用户确认。
