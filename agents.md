# Project — LocalMate

Astro SSR (version authoritative in `package.json`, currently `6.2.1`), TypeScript strict, npm.
**Read `CONSTITUTION.md` and the per-layer `AGENTS.md` files before changing anything** — this stops each agent from re-discovering the design.

## CommonAgentSDK (instructions + tooling)

This repo is integrated with **CommonAgentSDK**:

| Path | What it is | Applies here? |
|---|---|---|
| `E:\CommonAgentSDK\instructions\template_agents.md` | The **layered-docs standard** this repo follows: root `AGENTS.md` + per-layer `AGENTS.md` files + `CONSTITUTION.md`. | **Yes.** Reference copy committed at `docs/template_agents.md`. |
| `E:\CommonAgentSDK\tools\analyze.mjs` | A `ts-morph` CLI (outline / dead-exports / refs / imports / typecheck / move-symbols) for TypeScript/Astro projects. | **Yes.** Linked via `/tools` junction. |

## Architecture map (read first)

- **`CONSTITUTION.md`** — canonical architecture, invariants, tech stack.
- **`src/components/AGENTS.md`** — UI components layer (React islands & Astro components).
- **`src/layouts/AGENTS.md`** — HTML layout shells (`BaseLayout.astro`).
- **`src/lib/AGENTS.md`** — backend & client utility abstractions (`supabase.ts`, `posthog.ts`, `anon.ts`).
- **`src/pages/api/AGENTS.md`** — API routes (`chat.ts`, `bonus/generate.ts`, `bonus/confirm.ts`, `bonus/status/[code_id].ts`).
- **`supabase/AGENTS.md`** — database schema and SQL migrations.
- **`docs/AGENTS.md`** — documentation ownership map.

## Commands

```sh
npm run dev              # local dev server
npm run build            # production build
npm run preview          # preview production build
```

> **`npm dev` / `npm build` shorthand does not exist** — run `npm run <script>`.

## Analysis tooling (`tools/analyze.mjs`)

**Mandatory Tooling Expectation**: Agents MUST use these tools during feature work, refactoring, and verification instead of reading full source files into context or doing ad-hoc text greps:

```sh
node tools/analyze.mjs context <file>           # interface & type summary (saves 90% tokens)
node tools/analyze.mjs impact <file>            # downstream dependent file analysis
node tools/analyze.mjs syntax-check <file>      # instant AST syntax check (<50ms)
node tools/analyze.mjs validate-docs            # layer docs compliance validation
node tools/analyze.mjs outline <file>           # declaration map of a file
node tools/analyze.mjs refs <Symbol>            # language-service reference resolution
node tools/analyze.mjs imports <module>         # module import consumer mapping
node tools/analyze.mjs typecheck                # fast tsc diagnostics
node tools/analyze.mjs move-symbols --from a.ts --to b.ts --names f,g [--write]
```

**Use these instead of ad-hoc greps, full file reads, or throwaway scripts**. See `tools/README.md` for details.

## Known environment traps (do NOT re-investigate)

1. **CRLF + multi-line edits.** The repo is CRLF; a multi-line text replacement can silently miss on mixed line endings. Normalise line endings if replacements fail.
2. **Capturing `node` output in PowerShell 5.1.** Direct piping in PowerShell 5.1 can fail intermittently; redirect instead: `cmd /c "cd /d <repo> && node tools\analyze.mjs X > out.txt 2>&1"`, then read `out.txt`.

## Shell / commands (Windows PowerShell 5.1)

- Terminal is **Windows PowerShell 5.1**. **NEVER** join commands with `&` or `&&` outside of a `cmd /c "..."` string; use `;`.
- Prefer PowerShell cmdlets: `Get-ChildItem` instead of `dir`, `Remove-Item` instead of `rm`/`del`.

## Conventions

- **Output language**: always respond in English, even if the user writes in another language.
- Style with Tailwind utilities.
- Server-rendered by default; client islands marked explicitly.

## When unsure

Ask. A 30-second clarifying question is cheaper than a 30-minute revert.
