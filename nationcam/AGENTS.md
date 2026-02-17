# AGENTS.md

## Project Overview

NationCam — a static SPA (React 19 + TanStack Router) served by nginx, with a PostgREST API backed by PostgreSQL. Deployed via Docker Compose on Coolify. The active project lives in `nationcam/`; `nationcam-old/` is a legacy Next.js app kept for reference only.

## Architecture

```
Browser  ──▶  nginx (static SPA)
                 │
                 ├── /api/*  ──▶  PostgREST (auto-generated REST API)
                 │                    │
                 │                    ▼
                 │               PostgreSQL
                 │
                 └── /*  ──▶  index.html (SPA fallback)
```

- **Frontend**: Static SPA built with Vite, served by nginx. No Node.js runtime in production.
- **API**: PostgREST auto-generates REST endpoints from the PostgreSQL schema. No custom server code.
- **Database**: PostgreSQL 17 with roles (`web_anon` for reads, `web_admin` for writes).
- **Auth**: Admin writes use a build-time JWT token (`VITE_ADMIN_JWT`) sent as Bearer header.
- **Deployment**: Single `docker-compose.yml` at the repo root with 3 services: postgres, postgrest, app.

## Commands

All commands run from the `nationcam/` directory using **npm**.

```bash
npm run dev          # Start Vite dev server on port 3000
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build locally
npm run test         # Run all tests (vitest run)
npm run lint         # ESLint check
npm run format       # Prettier check (no writes)
npm run check        # Prettier write + ESLint fix (auto-fix)
```

### Docker (from repo root)

```bash
docker compose up -d             # Start all services
docker compose up -d --build     # Rebuild app and start
docker compose down              # Stop all services
docker compose logs -f postgrest # View PostgREST logs
```

### Running a Single Test

```bash
npx vitest run src/path/to/file.test.tsx          # Run one test file
npx vitest run -t "test name"                     # Run by test name pattern
```

Test files use the `.test.ts` or `.test.tsx` extension and live alongside source files. Vitest config is embedded in `vite.config.ts`. The test environment uses `jsdom` and `@testing-library/react`.

## Project Structure

```
new-nationcam/                    # Repo root
  docker-compose.yml              # Coolify-ready compose (postgres + postgrest + app)
  .env.example                    # Docker env vars template
  docker/
    init.sql                      # PostgreSQL schema, roles, permissions, triggers
  nationcam/                      # SPA application
    index.html                    # Static HTML entry point
    Dockerfile                    # Multi-stage: node build → nginx serve
    nginx.conf                    # Nginx config (SPA + /api/ proxy to PostgREST)
    src/
      main.tsx                    # Client-side mount (createRoot + RouterProvider)
      router.tsx                  # Router factory (getRouter)
      routeTree.gen.ts            # Auto-generated route tree (DO NOT EDIT)
      styles.css                  # Global styles — Tailwind v4, Observatory theme, spring easings, reveal animations
      components/                 # Reusable React components (PascalCase filenames)
        ThemeProvider.tsx          # Custom dark/light theme context (localStorage + html.dark)
        Navbar.tsx                 # Main nav — mobile menu, theme toggle, Lucide icons
        Footer.tsx                 # 4-column footer with working links
        Logo.tsx                   # NationCam logo (theme-aware)
        Button.tsx                 # Generic styled button
        Dropdown.tsx               # Custom select dropdown
        ContactCTA.tsx             # Call-to-action section
        AdvertisementLayout.tsx    # Responsive ad sidebar/banner layout
        PasswordProtection.tsx     # Client-side password gate (VITE_PAGE_PASSWORD)
        LocationsHeroSection.tsx   # Dynamic hero with background video
        StreamPlayer.tsx           # HLS/MP4/WebM player (hls.js, Safari native fallback)
        GrainOverlay.tsx           # Full-screen SVG grain texture overlay
        LiveBadge.tsx              # Pulsing red "LIVE" indicator badge
        Reveal.tsx                 # IntersectionObserver scroll-animation wrapper (6 variants)
      hooks/                       # Custom React hooks
        useReveal.ts               # IntersectionObserver hook for scroll-triggered animations
      lib/                         # Shared utilities and config
        api.ts                     # PostgREST fetch wrapper (GET/POST with JWT auth)
        types.ts                   # TypeScript interfaces (State, Sublocation, Video, User)
        utils.ts                   # generateSlug(), assetExists()
        buttonRedirects.ts         # Slug-to-URL redirect map for sponsor buttons
      routes/                      # TanStack Router file-based routes
        __root.tsx                 # Root layout (ThemeProvider, Navbar, Footer)
        index.tsx                  # Home page (hero, featured stream, stats, FAQ, CTA)
        contact.tsx                # Contact / camera signup form
        admin.tsx                  # Password-protected admin dashboard (3 forms)
        locations/
          index.tsx                # Locations list grid
          $slug.tsx                # State page — videos grouped by sublocation
          $slug.$sublocationSlug.tsx  # Sublocation page — video grid
    public/                        # Static assets copied as-is
      videos/                      # Hero background videos (.webm)
      logos/                       # Location logos (.webp)
      buttons/                     # Sponsor button images (.webp)
      ads/                         # Ad banner placeholders (.webp)
    .env.example                   # App-level env vars template
    vite.config.ts                 # Vite + TanStack Router + Tailwind plugins
    eslint.config.js               # ESLint flat config (@tanstack/eslint-config)
    prettier.config.js             # Prettier config
    tsconfig.json                  # TypeScript config (strict)
```

### Generated Files — Do NOT Edit

- `src/routeTree.gen.ts` — Auto-generated by TanStack Router plugin. Never modify manually.

## Code Style

### Formatting (Prettier)

- **No semicolons**
- **Single quotes** for strings
- **Trailing commas** everywhere (`trailingComma: "all"`)

### Linting (ESLint — @tanstack/eslint-config)

The project uses the TanStack ESLint config (flat config format). Key enforced rules:

**Imports:**

- Use `import type { X } from 'y'` for type-only imports (`consistent-type-imports`, `prefer-top-level`)
- Import order is enforced: builtin > external > internal > parent > sibling > index > object > type
- No CommonJS (`require`/`module.exports`) — ESM only
- Prefer `node:` protocol for Node builtins (e.g., `import { resolve } from 'node:path'`)
- No duplicate imports

**TypeScript:**

- Use generic array syntax: `Array<string>` not `string[]`, `ReadonlyArray<T>` not `readonly T[]`
- Method signatures as properties: `fn: () => void` not `fn(): void`
- Type parameters must be PascalCase matching `^(T|T[A-Z][A-Za-z]+)$` (e.g., `T`, `TData`, `TResult`)
- `@ts-expect-error` is allowed; `@ts-ignore` requires a description
- No unnecessary type assertions or conditions
- No inferrable types on variables (parameters are exempt)

**General:**

- `prefer-const` — use `const` unless reassignment is needed
- No `var` — use `const` or `let`
- No `no-shadow` violations (warn)
- Comments must have a space after `//`

## TypeScript

Config: `tsconfig.json` with strict mode enabled.

- **Strict mode** — `strict: true`
- **verbatimModuleSyntax** — must use `import type` for type-only imports (enforced at both TS and ESLint level)
- **noUnusedLocals / noUnusedParameters** — no dead variables or parameters
- **noFallthroughCasesInSwitch** — every `case` must `break` or `return`
- **Target:** ES2022
- **Path alias:** `@/*` maps to `./src/*` (e.g., `import Header from '@/components/Header'`)

## Naming Conventions

| Item            | Convention                                 | Example                                            |
| --------------- | ------------------------------------------ | -------------------------------------------------- |
| Components      | PascalCase filename + default export       | `Header.tsx` → `export default function Header()`  |
| Route files     | Lowercase, follow TanStack Router patterns | `index.tsx`, `__root.tsx`, `about.tsx`             |
| Route exports   | Named export `Route`                       | `export const Route = createFileRoute('/')({...})` |
| Type parameters | PascalCase, `T` or `T` + PascalCase suffix | `T`, `TData`, `TResult`                            |
| Utilities/hooks | camelCase filenames                        | `useAuth.ts`, `formatDate.ts`                      |
| CSS classes     | Tailwind utility classes                   | `className="flex items-center gap-3"`              |

## Routing (TanStack Router — client-side SPA)

- **File-based routing** — files in `src/routes/` auto-generate routes
- Route files export `const Route = createFileRoute('/path')({...})`
- The root layout is in `src/routes/__root.tsx` using `createRootRoute`
- Use `<Link to="/path">` from `@tanstack/react-router` for SPA navigation
- Router instance created in `src/router.tsx` via `getRouter()`, mounted in `src/main.tsx`
- The route tree type is registered globally via module declaration on `@tanstack/react-router`

## Component Patterns

- **Functional components only** — no class components
- **React 19** — hooks, JSX
- **Default exports** for standalone components (`export default function ComponentName()`)
- **Named exports** for route definitions (`export const Route = ...`)
- **Lucide React** for icons (`import { Home, Menu } from 'lucide-react'`)
- **Tailwind CSS v4** for all styling — use utility classes in `className`, avoid inline styles
- **CSS spring easings** — custom `linear()` easings for animations (`--spring-snappy`, `--spring-smooth`, etc.), no JS animation libraries
- **Scroll reveal animations** — wrap elements in `<Reveal>` (or `<Reveal variant="left">`, etc.) for entrance animations on scroll

## Error Handling

- Let TypeScript's strict mode catch type errors at compile time
- Use `@ts-expect-error` (not `@ts-ignore`) when suppressing TS errors — it will flag itself when no longer needed
- Prefer early returns and guard clauses over deep nesting

## Database

- **PostgreSQL 17** via PostgREST (auto-generated REST API)
- 4 tables: `states`, `sublocations`, `videos`, `users`
- Schema defined in `docker/init.sql` with roles, indexes, and triggers
- Roles: `web_anon` (read-only), `web_admin` (full CRUD), `authenticator` (login role for PostgREST)
- Slugs auto-generated via database triggers on INSERT/UPDATE
- Admin writes authenticated via JWT Bearer token (`VITE_ADMIN_JWT`)

## API (PostgREST)

All API calls go through `/api/` which nginx proxies to PostgREST.

| Method | Endpoint                                                | Description                   | Auth                   |
| ------ | ------------------------------------------------------- | ----------------------------- | ---------------------- |
| GET    | `/api/states?select=*,videos(count)`                    | List states with video counts | None (web_anon)        |
| GET    | `/api/sublocations?select=*,states(name),videos(count)` | List sublocations with joins  | None (web_anon)        |
| GET    | `/api/videos?state_id=eq.{id}`                          | Videos by state               | None (web_anon)        |
| GET    | `/api/videos?sublocation_id=eq.{id}`                    | Videos by sublocation         | None (web_anon)        |
| POST   | `/api/states`                                           | Create state                  | Bearer JWT (web_admin) |
| POST   | `/api/sublocations`                                     | Create sublocation            | Bearer JWT (web_admin) |
| POST   | `/api/videos`                                           | Create video                  | Bearer JWT (web_admin) |

## Dependencies of Note

| Package                             | Purpose                                  |
| ----------------------------------- | ---------------------------------------- |
| `@tanstack/react-router`            | File-based routing with type safety      |
| `@tanstack/router-plugin`           | Vite plugin for route generation         |
| `@tanstack/react-router-devtools`   | Router devtools (dev only)               |
| `tailwindcss` + `@tailwindcss/vite` | Styling (v4, Vite plugin)                |
| `lucide-react`                      | Icon library                             |
| `hls.js`                            | HLS streaming (with native Safari fallback) |
| `vite-tsconfig-paths`               | Resolves TS path aliases in Vite         |
| `vitest` + `@testing-library/react` | Testing                                  |
