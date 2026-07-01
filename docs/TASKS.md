# Tasks

## Current Phase

Phase 6: 通用网页终端 — COMPLETE

## Phase 2: 基础功能 & 部署

已完成。

* [x] Create `docs/` folder
* [x] Create `CLAUDE.md`
* [x] Create `docs/PROJECT_INDEX.md`
* [x] Create `docs/TASKS.md`
* [x] Confirm Next.js project was initialized
* [x] Run local dev server
* [x] Run production build
* [x] Create base layout
* [x] Create navbar
* [x] Create homepage
* [x] Create tool card component
* [x] Create public about page
* [x] Create placeholder blog pages
* [x] Create placeholder tools registry
* [x] Blog: Markdown reader + frontmatter parser
* [x] Blog: Post list page
* [x] Blog: Post detail page
* [x] Blog: Example posts
* [x] Extract lib/markdown.ts (pure render functions)
* [x] MarkdownEditor client component
* [x] Markdown editor: live preview + toolbar
* [x] Image compressor — 纯浏览器端单图压缩，Canvas API
* [x] Math formula converter — 纯浏览器端 LaTeX 公式渲染，KaTeX
* [x] Homepage public-only filter — 首页只展示公开可用工具
* [x] Footer — 站点底部组件
* [x] 404 page — 自定义 404 页面
* [x] html lang — 修正为 zh-CN
* [x] Vercel deployment — GitHub + Vercel 网页导入部署
* [x] Custom domain — spicysuimai.cn / www.spicysuimai.cn 已绑定

## Phase 3: 公开站点优化

* [x] SEO 基础 — robots.ts / sitemap.xml / metadataBase
* [x] 社交分享：OG / Twitter metadata
* [x] Favicon / site icons
* [x] 清理 public/ 样板文件

## Phase 4: 公开站点内容与体验优化

* [x] Navbar 当前页高亮 + aria-current
* [x] 工具列表页过滤私有工具
* [x] 博客详情加返回链接
* [x] Footer 加导航链接
* [x] 博客列表页术语改写
* [x] 首页文案与 SEO 描述区分
* [x] ToolCard 加 emoji 图标
* [x] 工具列表页过滤博客入口

## Phase 5: 私有工具

### Phase 5.1: 认证基础设施

已完成。

* [x] jose JWT 库安装
* [x] lib/auth.ts — JWT sign/verify + 密码 SHA-256 验证
* [x] app/api/auth/login/route.ts
* [x] app/api/auth/logout/route.ts
* [x] app/api/auth/me/route.ts
* [x] middleware.ts — 私有路由拦截
* [x] app/login/page.tsx
* [x] Navbar 已登录显示"控制台"入口
* [x] app/dashboard/page.tsx — 私有工具列表

上线前需设置 Vercel 环境变量：JWT_SECRET、AUTH_PASSWORD_HASH

### Phase 5.2: 体验完善

已完成。

* [x] app/dashboard/page.tsx — 添加退出登录按钮（components/logout-button.tsx Client Component，POST /api/auth/logout 后跳转 /）
* [x] app/tools/page.tsx — 认证后显示私有工具（async Server Component，读 cookie + verifyToken，拆公共/私有两区）

### Phase 5.3: AI Chat MVP

已完成。

Provider 适配层：

* [x] lib/ai/types.ts — ChatMessage / ChatRequest / ChatResponse 统一格式
* [x] lib/ai/providers/base.ts — IProviderAdapter 接口
* [x] lib/ai/providers/registry.ts — Provider + Model 双层白名单 + 工厂
* [x] lib/ai/providers/openai-compatible.ts — OpenAI / DeepSeek / OpenRouter / Custom 通用适配器
* [x] lib/ai/providers/anthropic.ts — Anthropic Messages API 原生适配器
* [x] lib/ai/providers/gemini.ts — Google Gemini generateContent 原生适配器

API 层：

* [x] app/api/private/ai-chat/route.ts — POST chat（认证 + 校验 + 路由）、GET providers
* [x] middleware.ts — /api/private 加入保护前缀，API 请求返回 401 JSON

UI 层：

* [x] app/tools/ai-chat/page.tsx — 聊天主页面（多 provider/model 联动）
* [x] app/tools/ai-chat/model-selector.tsx — Provider + Model 下拉，初始化自动选中可用项
* [x] app/tools/ai-chat/chat-panel.tsx — 消息列表，Markdown + LaTeX 渲染
* [x] app/tools/ai-chat/message-input.tsx — 输入框（Enter 发送）
* [x] app/tools/ai-chat/use-chat.ts — 客户端状态管理

Bugfix：

* [x] Provider 选择与默认值同步（消除"选 DeepSeek 但发 openai"问题）
* [x] Assistant 消息 Markdown 渲染（react-markdown + remark-gfm + remark-math + rehype-katex）

上线前需设置对应 provider 的 API key 环境变量（如 DEEPSEEK_API_KEY）。无 key 的 provider 前端不展示。

### Phase 6.1: Host Agent MVP

已完成。

* [x] agent/package.json — ws + node-pty + tsx
* [x] agent/src/config.ts — AGENT_HOST/PORT/KEY/DEFAULT_CWD/ALLOWLIST_ROOTS env 读取
* [x] agent/src/auth.ts — pre-shared key 验证（DEV-ONLY，标注替换为 WS ticket）
* [x] agent/src/session.ts — session ID/cwd/pid/timing
* [x] agent/src/pty.ts — node-pty spawn shell（Windows: powershell.exe, Unix: /bin/sh），cwd allowlist 校验
* [x] agent/src/index.ts — WS server，握手鉴权 → spawn PTY → 双向 stream
* [x] .gitignore 修正（node_modules/ 嵌套匹配 + !.env.example）
### Phase 6.2: Web Terminal UI

已完成。

* [x] lib/ws-config.ts — WS URL 配置（NEXT_PUBLIC_TERMINAL_WS or default localhost:4200）
* [x] components/terminal-view.tsx — xterm.js React wrapper（Tokyo Night 主题，FitAddon，WebLinksAddon，ResizeObserver）
* [x] app/tools/terminal/layout.tsx — metadata（"远程终端"）
* [x] app/tools/terminal/page.tsx — 连接表单（Host URL + Auth Key + cwd），认证后全屏终端
* [x] tools/registry.ts — 注册 terminal（requireAuth: true，middleware 自动保护）
* [x] tsconfig.json — 排除 agent/ 目录
* [x] agent/src/index.ts — 修复 import type → 值导入，PtyWebSocket 类型
* [x] agent/src/auth.ts — 清理未使用变量

### Phase 6.3: Session Manager

已完成。

* [x] agent/src/session.ts — DEFAULT_IDLE_TIMEOUT_MS, isTimedOut(), summary(), label field
* [x] agent/src/config.ts — AGENT_IDLE_TIMEOUT_MS env 读取
* [x] agent/src/index.ts — idle sweep (60s 间隔), list/kill_session 消息, __sessionId
* [x] app/tools/terminal/page.tsx — 多 tab 栏，新建表单，关闭 tab → kill PTY
* [x] components/terminal-view.tsx — onReady(label) 回调设置 tab 名称

### Phase 6.4: Auth Upgrade

已完成。

* [x] agent/package.json — 添加 jose 依赖
* [x] agent/src/auth.ts — verifyTicket (jose JWT), verifyKey (fallback), checkOrigin, checkRateLimit
* [x] agent/src/config.ts — JWT_SECRET, AGENT_ORIGIN_ALLOWLIST, AGENT_MAX_CONNS_PER_MIN
* [x] agent/src/index.ts — Origin 硬拦截, rate limit, [audit] 日志, ticket 优先于 key
* [x] lib/auth.ts — signTerminalTicket (sub=terminal, 60s TTL)
* [x] app/api/private/terminal-ticket/route.ts — POST 发放 WS ticket
* [x] app/tools/terminal/page.tsx — 连接前获取 ticket，移除 auth key 输入
* [x] components/terminal-view.tsx — ticket prop 替代 authKey
* [x] agent/.env.example — 文档更新

### Phase 6.5: Device Registry

已完成。

* [x] agent/src/registry.ts — 启动注册 + 30s 心跳到 AGENT_REGISTRY_URL
* [x] agent/src/config.ts — AGENT_DEVICE_NAME, AGENT_REGISTRY_URL
* [x] lib/device-store.ts — 共享内存设备表，listDevices/registerDevice/removeDevice
* [x] app/api/private/devices/route.ts — GET 设备列表（含 online 状态，90s 超时）、POST 注册
* [x] app/api/private/devices/[name]/route.ts — DELETE 移除设备
* [x] app/tools/terminal/page.tsx — 设备选择器（dropdown + online/offline 状态）
* [x] components/terminal-view.tsx — wsUrl prop 支持多设备切换

### Phase 6.6: Cloudflare Tunnel

已完成。

* [x] agent/src/config.ts — AGENT_PUBLIC_URL 配置
* [x] agent/src/registry.ts — 心跳上报 publicUrl
* [x] lib/device-store.ts — DeviceInfo.publicUrl 字段
* [x] app/api/private/devices/route.ts — POST 接受 publicUrl
* [x] app/tools/terminal/page.tsx — publicUrl 优先，自动 wss://，CF 标记
* [x] agent/.env.example — 文档示例

### Phase 6.7: Quick Launch Presets

已完成。

* [x] lib/presets.ts — localStorage CRUD (add/load/delete)
* [x] components/terminal-view.tsx — initCommand prop，auth_ok 后写入 PTY
* [x] app/tools/terminal/page.tsx — preset 选择器 + 保存表单

**Phase 6: 通用网页终端 — COMPLETE**


## Later (暂缓)

* [x] JWT login
* [ ] Turso setup
* [ ] Travel records
* [ ] Food diary
* [x] AI chat (multi-provider, non-streaming)
* [x] Local terminal service (Phase 6.1 Host Agent)
* [ ] File transfer
* [ ] Cloudflare Tunnel setup (Phase 6.6)

## Bugfix

* [x] Agent: 添加 dotenv 加载 `agent/.env`，修复 JWT_SECRET 未读取
* [x] Agent: EADDRINUSE 友好错误提示，不抛 unhandled error
* [x] Agent heartbeat 401: middleware 支持 Bearer token，agent 心跳带 `sub: "agent"` JWT
* [x] Terminal 连接即断: React Strict Mode mount counter 防 WS 重复创建/销毁
* [x] Tab 切换清空输出: display:none → visibility:hidden + absolute 定位保留 xterm 状态
* [x] 退出终端按钮: 确认弹窗 → 关闭所有 session → 返回连接表单
* [x] 终端组件防竞态: WS 回调添加 disposed 守卫，防 tab 关闭后写已销毁 xterm
* [x] Agent 心跳 JWT TTL: 30s → 60s，防网络延迟导致 token 过期

## Decisions

* Blog content uses Markdown files.
* Main site deploys to Vercel.
* Local terminal service is optional and separate.
* Do not fork external templates.
* Do not use NotionNext in this new project.
