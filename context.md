# Context for Issue #5 — Profile Setup

This document gives you everything you need to implement Issue #5 (Profile Setup) without needing to explore the repo yourself.

---

## Project Overview

Joysticked is a Turborepo monorepo with two apps and one package:

```
apps/
  api/   — Elysia.js + Drizzle ORM + PostgreSQL (runtime: Bun)
  web/   — Next.js 16 + Tailwind v4 + React 19
packages/
  igdb/  — IGDB client (not relevant here)
```

---

## API Architecture & Conventions

### Entry Point
`apps/api/src/shared/http/index.ts` — creates the Elysia app, registers global middleware (`cors`, `logger`, `errorHandler`, `openapi`), and mounts routers. The exported `App` type is consumed by the frontend via Eden Treaty.

### Module Structure
Each feature lives under `apps/api/src/modules/<feature>/` and follows this layout:
```
<feature>/
  router.ts              — top-level Elysia router with prefix & tags
  <action>/
    router.ts            — individual route handler
    schemas.ts           — Zod v4 input/output schemas
    use-case.ts          — business logic
```

**Example — `join-waitlist`:**
- `router.ts`: Uses `databaseMiddleware`, validates with Zod schemas, calls use-case, returns typed status response.
- `schemas.ts`: Exports `joinWaitlistBodySchema` and `joinWaitlistSuccessResponseSchema` using `z` from `zod`.
- `use-case.ts`: Receives `db: Database`, creates a repository instance via `createWaitListRepository(db)`, runs logic, uses `executeTransaction` for writes.

### Shared Middleware
- **`databaseMiddleware`** (`apps/api/src/shared/http/middlewares/database.ts`): Derives `{ db }` into route context via `.derive({ as: 'scoped' }, ...)`. Use this on any route that needs the database.
- **`rateLimitMiddleware`**: Wraps `bunlimit` strategies (`fixedWindow`, `tokenBucket`). Use it if the new routes need rate limiting.
- **`errorHandler`**: Handles `ConflictError`, `ResourceNotFoundError`, `RateLimitError`, `InternalServerError`, and validation errors automatically. Throw these custom error classes from use-cases rather than returning error responses manually.

### Database / Drizzle
- Schema files live in `apps/api/src/shared/database/schemas/`. Currently only `waitlists.ts` exists.
- The schemas barrel export is `apps/api/src/shared/database/schemas/index.ts` — **add a new `export *` line here** for every new schema file.
- Drizzle config (`drizzle.config.ts`) points to `./src/shared/database/schemas/index.ts`. No config changes needed.
- Migration commands (run from `apps/api/`):
  ```sh
  bun run db:generate -- <migration-name>   # generates SQL migration
  bun run db:migrate                         # applies migration
  ```
- **Repository pattern**: Create a class under `apps/api/src/shared/database/repositories/`, expose it via a factory function `createXxxRepository(db)`. See `waitlist-repository.ts` for the exact pattern (class with `db` injected via constructor, methods use `this.db` or accept an optional `tx?: Transaction` for transactional writes).

### Existing Error Classes
Located at `apps/api/src/shared/errors/`:
- `ConflictError` — 409
- `ResourceNotFoundError` — 404
- `RateLimitError` — 429
- `InternalServerError` — 500

### Validation (Schemas)
Use **Zod v4** (`import z from 'zod'`). The API uses `@elysiajs/openapi` with `mapJsonSchema: { zod: z.toJSONSchema }` so schemas must be compatible with `z.toJSONSchema`. Note Zod v4 syntax differences: `z.email()` instead of `z.string().email()`, `z.uuid()` instead of `z.string().uuid()`. See `join-waitlist/schemas.ts` as a reference.

---

## Frontend Architecture & Conventions

### API Client
`apps/web/src/lib/api.ts` — `treaty<App>` from `@elysiajs/eden`. This gives full end-to-end type safety. Import `api` from here for all API calls. The `App` type is automatically updated when you add new routes to the Elysia app.

### Forms
- Use **`@tanstack/react-form`** (`1.23.8`).
- Use the existing `<FieldInfo field={field} />` component from `apps/web/src/components/forms/field-info.tsx` to render validation errors and loading states under each field.

### UI Components
Available in `apps/web/src/components/ui/`:
- `button.tsx` — `<Button>` with `class-variance-authority` variants
- `input.tsx` — `<Input>`
- `sonner.tsx` — toast notifications via `sonner`

Use `lucide-react` for icons. Use `motion` (Framer Motion v12) if you need animations.

### Styling
Tailwind v4 with a custom design system. Follow the existing CSS custom properties defined in `apps/web/src/app/globals.css`. Do not add ad-hoc Tailwind utilities that bypass the design tokens.

### State / Data Fetching
`@tanstack/react-query` (`^5.90.9`) is available if you need server state / caching beyond what Eden Treaty provides.

---

## What You Need to Build

### 1. Database Schema (`apps/api/src/shared/database/schemas/`)

Create `users.ts` (or `profiles.ts`) with a Drizzle table. Suggested fields:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, `defaultRandom()` |
| `username` | `text` | unique, not null |
| `avatar_url` | `varchar` | nullable |
| `banner_url` | `varchar` | nullable |
| `bio` | `text` | nullable |
| `socials` | `jsonb` | nullable — store `{ twitter?, twitch?, discord? }` |
| `created_at` | `timestamp` | `defaultNow()`, not null |

Then add `export * from './users';` (or `./profiles`) to `schemas/index.ts`.

Run migrations after:
```sh
bun run db:generate -- add-users-table
bun run db:migrate
```

### 2. Profile Repository (`apps/api/src/shared/database/repositories/profile-repository.ts`)

Follow the `WaitListRepository` class pattern. At minimum implement:
- `findById(id: string)`
- `create(data, tx?)` — returns the new row
- `update(id: string, data, tx?)` — returns the updated row

### 3. API Module (`apps/api/src/modules/profile/`)

Structure:
```
profile/
  router.ts
  get-profile/
    router.ts
    schemas.ts
    use-case.ts
  update-profile/
    router.ts
    schemas.ts
    use-case.ts
```

Routes:
- `GET /profile/:id` — fetch a profile by ID
- `PUT /profile/:id` — update profile fields

Use `databaseMiddleware` to get `db`. Throw `ResourceNotFoundError` if profile is not found.

Register the new router in `apps/api/src/shared/http/index.ts`:
```ts
import { profileRouter } from '../../modules/profile/router';
// ...
.use(profileRouter)
```

### 4. Frontend Page (`apps/web/src/app/profile/page.tsx`)

Create a profile setup/edit page. Use:
- `@tanstack/react-form` for the form
- `api` (Eden Treaty client) for API calls
- `<FieldInfo>` for field validation
- Existing `<Button>` and `<Input>` components
- Include fields for: avatar upload, banner upload, bio/about me textarea, social links (Twitter, Twitch, Discord)

---

## Notes & Open Decisions

- **Auth**: There is currently no auth module. For now, **hardcode a stub user ID** so you can wire up and test the full profile flow end-to-end. Leave a `// TODO: replace with real auth` comment so it's easy to swap later.
- **Image Uploads**: The codebase has no existing file upload infrastructure. You have two options:
  - **(Simple)** Accept image URLs as plain text inputs for now, and leave a TODO for actual upload support.
  - **(Full)** Add a multipart upload endpoint in Elysia and store files somewhere (local disk, S3, Cloudflare R2, or Uploadthing). Only go this route if the issue explicitly requires it.
- **Zod v4**: The project uses Zod v4 (`zod@4.1.12`). Use `z.email()`, `z.uuid()` — not `z.string().email()` / `z.string().uuid()`.
