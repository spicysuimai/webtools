# Tasks

## Current Phase

Phase 3: 公开站点优化

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

## Later (暂缓)

* [ ] JWT login
* [ ] Turso setup
* [ ] Travel records
* [ ] Food diary
* [ ] AI chat
* [ ] Local terminal service
* [ ] File transfer
* [ ] Cloudflare Tunnel setup

## Decisions

* Blog content uses Markdown files.
* Main site deploys to Vercel.
* Local terminal service is optional and separate.
* Do not fork external templates.
* Do not use NotionNext in this new project.
