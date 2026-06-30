# CLAUDE.md

## Project
spicysuimai.cn v2 — personal tools site, built from scratch.
Goal: replace NotionNext. Primary: tools. Secondary: Markdown blog.

## Tech Stack
Next.js App Router + TypeScript, TailwindCSS, shadcn/ui, Turso (SQLite), JWT (jose), Vercel.

## Rules
- Don't scan whole repo. Read docs/PROJECT_INDEX.md for architecture context.
- Prefer targeted file reads. List files before editing. Keep replies short.
- Prefer Server Components. Use TypeScript strictly.
- Put logic in lib/, UI in components/, blog in content/blog/.
- Don't add dependencies without asking. Don't commit secrets.
- Remind me to /clear on topic switch. Use PowerShell for local commands.

## Commands
npm run dev / build / lint

## Constraints
- Vercel site works without local Windows service.
- Terminal/files features are private (extra auth).
- Blog is file-based, not DB.
