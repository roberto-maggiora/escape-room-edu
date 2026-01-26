## MVP Decisions

- Next.js App Router for fast Vercel deploy.
- Standalone frontend, no external integrations in MVP.
- Fake puzzle generation to validate UX only.
- Minimal i18n via `?lang=` query param (default it).
- Clean, printable A4 layout using `window.print()`.
- No database, no authentication, no backend in MVP.
- Client-side gameplay logic, simple and deterministic.
- UI consistent with reference, no over-engineering.
- Generator signature stays extensible with optional `sourceContent`.
- Locale-ready content strategy to avoid hardcoded growth.
- Architecture must allow swapping heuristics with AI later.
