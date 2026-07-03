@AGENTS.md

# ToolNest

ToolNest is a free online tools website that also serves as the official site of the
company **ToolNest**. Every tool runs entirely in the browser — there is no backend.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- 100% client-side computation — deployed to Vercel as a static/serverless app

## Project conventions

- **One tool per route.** Each tool lives in its own directory under `app/<tool>/page.tsx`.
- **Shared UI lives in `components/`.** Avoid duplicating markup or logic across tools;
  extract reusable pieces (buttons, layout, tool scaffolding) into components.
- **Pure front-end, no backend.** Tools compute in the browser. Interactive tool pages
  are Client Components (`"use client"`).
- **Chinese UI.** User-facing copy is in Simplified Chinese.
- **Each tool page has:** a clear input area, an output area, a copy button, basic input
  validation, and friendly error messages.

### Backend strategy (architecture principle)

1. **Prefer pure front-end** (browser-side computation) whenever possible.
2. When server logic is genuinely required, prefer **Next.js Route Handlers**
   (`app/api/xxx/route.ts`) implemented as **Serverless** functions, to keep the Vercel
   free-tier deployment.
3. Do **not** introduce a separate backend service unless the requirement demands a
   long-running process, WebSockets, heavy compute, or a heavy database.

## Commit conventions

- Use **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, etc.
- Commit messages in English, concise, one logical change per commit.
- Ship in stages: each runnable milestone (project init, layout, each tool page) is its
  own commit, pushed so the GitHub history reads as clear development progress.

## Adding a new tool

1. Create `app/<tool>/page.tsx` (Client Component).
2. Use the shared `ToolLayout` / UI components from `components/`.
3. Register the tool in the central tool list (`lib/tools.ts`) so it appears on the home
   page automatically.
