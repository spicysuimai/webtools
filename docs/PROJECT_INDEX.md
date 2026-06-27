\# Project Index



\## Overview



`spicysuimai.cn v2` is a self-built personal tools site.



It has two parts:



1\. Main Vercel site



&#x20;  \* Public tools

&#x20;  \* Private tools

&#x20;  \* Markdown blog

&#x20;  \* Turso-backed records

&#x20;  \* AI chat



2\. Optional local Windows service



&#x20;  \* Remote terminal

&#x20;  \* File transfer

&#x20;  \* Exposed through Cloudflare Tunnel at `local.spicysuimai.cn`



\## Core Architecture



```text

Vercel Next.js site

&#x20; ├─ Public pages and tools

&#x20; ├─ Private authenticated tools

&#x20; ├─ API routes

&#x20; ├─ Markdown blog

&#x20; └─ Turso database access



Windows local-service

&#x20; ├─ WebSocket terminal

&#x20; ├─ HTTP file transfer

&#x20; └─ Cloudflare Tunnel

```



Main public domain:



```text

spicysuimai.cn

```



Optional local service domain:



```text

local.spicysuimai.cn

```



\## Recommended Structure



```text

project-root/

├── app/

│   ├── layout.tsx

│   ├── page.tsx

│   ├── blog/

│   │   ├── page.tsx

│   │   └── \[slug]/page.tsx

│   ├── about/

│   │   └── page.tsx

│   ├── travel/

│   │   └── page.tsx

│   ├── food/

│   │   └── page.tsx

│   ├── terminal/

│   │   └── page.tsx

│   ├── fileshare/

│   │   └── page.tsx

│   └── api/

│       ├── auth/

│       ├── travel/

│       ├── food/

│       └── ai/

├── tools/

│   ├── registry.ts

│   ├── markdown/

│   ├── image-compress/

│   ├── math/

│   └── ai-chat/

├── components/

│   ├── ui/

│   ├── navbar.tsx

│   └── tool-card.tsx

├── lib/

│   ├── auth.ts

│   ├── db.ts

│   └── markdown.ts

├── content/

│   └── blog/

├── local-service/

├── docs/

│   ├── PROJECT\_INDEX.md

│   └── TASKS.md

├── CLAUDE.md

├── package.json

└── .env.local

```



\## Feature Map



\### Public Features



\* Home page

\* About page

\* Blog list

\* Blog detail

\* Markdown editor

\* Image compressor

\* Math formula converter



\### Private Features



\* Travel records

\* Food diary

\* AI chat history

\* Remote terminal

\* File transfer



\## Data Strategy



Markdown blog:



\* Stored as files in `content/blog/`

\* Built statically

\* No database required



Turso:



\* Travel records

\* Food records

\* AI chat records



Local service:



\* Terminal

\* File transfer

\* Only works when the Windows machine is online



\## Tool Registry Convention



Each tool folder should contain:



```text

tools/<tool-id>/

├── page.tsx

└── meta.ts

```



Example:



```typescript

export const meta = {

&#x20; id: 'markdown',

&#x20; name: 'Markdown 编辑器',

&#x20; description: '实时预览 Markdown 内容',

&#x20; href: '/tools/markdown',

&#x20; requireAuth: false,

&#x20; category: 'public',

}

```



\## Environment Variables



```text

AUTH\_PASSWORD=

JWT\_SECRET=



TURSO\_DB\_URL=

TURSO\_AUTH\_TOKEN=



OPENAI\_API\_KEY=

ANTHROPIC\_API\_KEY=



NEXT\_PUBLIC\_LOCAL\_WS\_URL=

NEXT\_PUBLIC\_LOCAL\_API\_URL=

```



\## Development Principles



\* Do not fork blog frameworks.

\* Keep features modular.

\* Add new tools through `tools/<tool-id>/`.

\* Keep the Vercel site independent from the local service.

\* Keep secrets out of Git.

\* Do not add unnecessary dependencies.



