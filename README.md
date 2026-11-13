# Thai MCP Hub

A bilingual Thai/English frontend prototype for connecting Thai data sources to AI assistants through MCP.

The app includes public product pages, source discovery, MDX documentation, mock sign-in and onboarding, and a workspace dashboard for sources, tool execution, call logs, credentials, team, usage, and settings.

The primary connection journey is now plugin installation for ChatGPT, Claude or Cursor: choose a platform, review workspace access and confirm a demo connection. MCP remains the underlying tool protocol; manual endpoints are under Settings → Advanced connections. No plugin listing, real installation or OAuth integration is published by this frontend. Platform setup metadata lives in `apps/web/config/site.ts`.

## Project map

- apps/web: Next.js App Router app, feature views, translations, query hooks, and services.
- packages/ui: Shared UI primitives and design tokens.
- packages/schemas: Zod contracts and inferred TypeScript types.
- packages/mocks: Sample data and simulated tool responses.
- packages/config: Shared TypeScript, ESLint, and Tailwind configuration.
- docs: Architecture and route inventory.

The configured workspace uses pnpm and Turborepo. See package manifests for scripts.

## Local development

Install dependencies with the pinned pnpm version, then start the web app from the repository root:

```sh
pnpm install
pnpm dev
```

The root dev command starts `@repo/web` directly. Turbo 2.11.11 exited with code 3221226505 in an interactive Windows terminal in this checkout, including with stream output; direct Next.js startup worked in the same terminal. `pnpm dev:turbo` retains the original orchestration command for environments where it works. Build, lint, and typecheck scripts still use Turbo.

A subsequent startup troubleshooting pass verified `pnpm dev` in an interactive terminal and HTTP 200 responses from `/` and `/dashboard`. The web app also passed `tsc --noEmit --incremental false`, and the landing page was checked in a browser at desktop and mobile widths.

## Documentation

- [Architecture](docs/ARCHITECTURE.md): Folder ownership, data flow, services, mocks, localization, UI system, and the path to a real API.
- [Screens](docs/SCREENS.md): Every product route and documentation article, components, actions, and prototype boundaries.

Thai is the default locale at /; English starts at /en. The dashboard starts at /dashboard, and product documentation at /docs.

## Prototype scope

All domain data uses in-memory mock services. State survives client navigation and resets on reload; playground history is stored separately for the tab. Sign-in, MCP connectivity, LINE notifications, billing, and invitations are demonstrations. No backend, authentication, payment, or real credential integration is implemented.

Product identity, URLs, and navigation are configured in apps/web/config/site.ts. External .example URLs are placeholders.

Before changing Next.js framework behavior, follow [AGENTS.md](AGENTS.md) and read the version-specific guides bundled with the installed Next.js package. With pnpm, they are available under apps/web/node_modules/next/dist/docs/. A production build and lint pass have not been run.
