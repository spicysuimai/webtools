\# CLAUDE.md



\## Project



This is `spicysuimai.cn v2`, a personal tools site built from scratch.



Goal:



\* Replace the old NotionNext blog.

\* Main focus: personal tools.

\* Secondary focus: Markdown blog.

\* No forked templates.

\* Avoid upstream merge conflicts.



\## Tech Stack



\* Next.js App Router + TypeScript

\* TailwindCSS

\* shadcn/ui

\* Markdown files for blog posts

\* Turso for cloud SQLite data

\* JWT cookie auth with `jose`

\* Vercel for main deployment

\* Optional local Windows service for terminal/files through Cloudflare Tunnel



\## Token-Saving Rules



\* Do not scan the whole repository unless explicitly asked.

\* Read `docs/PROJECT\_INDEX.md` when architecture context is needed.

\* Before editing, list the files you plan to inspect.

\* Prefer targeted file reads over broad exploration.

\* Do not paste large file contents back to me.

\* Do not add dependencies without asking.

\* Keep replies short: plan, changed files, next step.

\* Use PowerShell commands for local instructions.

\* Remind me to use `/clear` when switching to an unrelated task.



\## Coding Rules



\* Keep the project simple and low-dependency.

\* Prefer Server Components unless client interactivity is required.

\* Use semantic HTML and accessible UI.

\* Use TypeScript strictly.

\* Put reusable logic in `lib/`.

\* Put shared UI in `components/`.

\* Put blog posts in `content/blog/`.

\* Do not commit `.env.local`, secrets, local data, or generated files.



\## Common Commands



```powershell

npm run dev

npm run build

npm run lint

```



\## Important Notes



\* The main Vercel site must work even when the local Windows service is offline.

\* Terminal and file transfer features are private and require extra authentication.

\* Blog content should stay file-based, not database-based.



