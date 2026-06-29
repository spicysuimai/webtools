# Tasks

## Current Phase

Phase 5: 私有工具

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

## Later (暂缓)

* [x] JWT login
* [ ] Turso setup
* [ ] Travel records
* [ ] Food diary
* [x] AI chat (multi-provider, non-streaming)
* [ ] Local terminal service
* [ ] File transfer
* [ ] Cloudflare Tunnel setup

## Decisions

* Blog content uses Markdown files.
* Main site deploys to Vercel.
* Local terminal service is optional and separate.
* Do not fork external templates.
* Do not use NotionNext in this new project.
