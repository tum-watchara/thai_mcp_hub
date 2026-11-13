# Thai MCP Hub architecture

## Scope

This repository is a frontend prototype for a hosted Thai-data MCP hub. It contains marketing, bilingual documentation, onboarding, and a workspace dashboard. All product data comes from typed, in-memory mock services. There is no authentication implementation, MCP server, external data integration, payment processing, database, API route, or server action.

The implementation follows the original monorepo layout. `overview`, `settings`, and `docs` are additional feature directories so those screens follow the same feature ownership rule as sources, logs, and team.

## Workspace map

```text
apps/web/
  app/[locale]/
    (marketing)/              Landing, pricing, public source catalog
    (docs)/docs/[[...slug]]/   MDX documentation route
    (auth)/login/             Mock sign-in
    (onboarding)/onboarding/  Three-step setup
    (dashboard)/dashboard/    Workspace routes
    [...rest]/               Unknown-route handling
  components/                App shells and cross-feature components
  config/site.ts             Product identity, URLs, navigation
  content/docs/{th,en}/      Localized MDX articles
  content/docs/manifest.ts   Documentation navigation and page registry
  features/                  Feature-owned views, forms, dialogs, local helpers
  i18n/                      Locale routing, request config, navigation helpers
  lib/
    docs/                    Heading extraction and slug generation
    query/                   Query keys, hooks, mutations, invalidation
    services/                Domain interfaces, provider, implementation factory
      mock/                  In-memory implementations and latency simulation
    utils/                   Formatting, validation, metadata, JSON helpers
  messages/{th,en}.json       UI translations
  proxy.ts                   Locale negotiation
packages/
  schemas/src/               Zod contracts and inferred TypeScript types
  mocks/src/                 Seed data, generators, simulated tool outputs
  ui/src/components/         Shared source-owned UI primitives
  ui/src/styles/             Design tokens and shared styles
  config/                    Shared TypeScript, ESLint, Tailwind configuration
docs/                        Architecture and screen inventory
```

The root `pnpm-workspace.yaml` includes `apps/*` and `packages/*`. Turborepo task definitions live in `turbo.json`; package scripts are configuration for a later execution phase. The web app transpiles the shared source packages. Strict TypeScript settings are inherited from `packages/config/tsconfig`.

## Rendering and data flow

```text
page.tsx
  -> feature view
     -> domain query/mutation hook
        -> useServices() -> domain service interface
           -> Mock...Service -> shared MockDb -> @repo/mocks seeds/runners
        <- inferred @repo/schemas types
     <- loading / data / error state from TanStack Query
```

Pages compose features and metadata. Locale and dynamic route parameters are resolved at the route boundary; business rules and data transformation belong in services or features. The existing Next.js route components await their promise-based parameters.

`components/providers.tsx` creates a services provider, one QueryClient, tooltips, and toasts. `ServicesProvider` retains one service collection for the mounted provider lifetime. `lib/services/mock/index.ts` creates all service implementations against one `MockDb`, so changes remain visible across client navigation.

`lib/services/index.ts` is the implementation switch: `createServices()` currently returns `createMockServices()`. Components never import mock databases or runners. Domain hooks obtain service interfaces through `useServices()`.

Documentation is a separate content path: a server-rendered docs route resolves an allowlisted entry from the manifest, imports the matching local MDX article, extracts headings, and composes the navigation, article, TOC, and pager. The generated tool-reference component obtains tools through the query layer.

## Shared contracts

`packages/schemas/src/index.ts` exports Zod schemas and inferred types. Entity definitions live once in the following files:

| File | Contracts |
| --- | --- |
| `common.ts` | Locales, localized text, JSON values, dates, pagination |
| `source.ts` | Sources, categories, licensing, availability, list filters, status points |
| `tool.ts` | Tools, displayable input schema, run input and result |
| `call-log.ts` | Call logs, clients, statuses, filtering and sorting |
| `usage.ts` | Daily/source aggregates, usage summary, 80% warning threshold |
| `credential.ts` | Masked credentials and add/rotate inputs |
| `team.ts` | Members, roles, invitation and role-change inputs |
| `plan.ts` | Plans, features, plan ordering, invoices |
| `workspace.ts` | Workspace, user, clients, plugin platform enum, notifications, connection checks |

Forms use React Hook Form with Zod resolvers. Validation messages map to localized UI copy. Mock implementations are TypeScript-typed; they are not a substitute for validating untrusted HTTP responses at a future API boundary.

## Service ownership

All interfaces are declared in `apps/web/lib/services/types.ts`.

| Service | Responsibility |
| --- | --- |
| `DemoService` | Allowlisted public playground tools and simulated runs, isolated from workspace state |
| `SourcesService` | Search/filter sources, details, enabled state, onboarding selection, status history |
| `ToolsService` | Tool catalog, tool details, simulated execution |
| `LogsService` | Date/source/client/status filters, sort, pagination, details |
| `UsageService` | Usage totals, daily series, source breakdown, quota |
| `CredentialsService` | Masked list, add, rotate, delete |
| `TeamService` | Member list, simulated invitation, role change, removal |
| `BillingService` | Plan catalog and mock invoices |
| `WorkspaceService` | Workspace/user reads, name and notification updates, URL regeneration, mock plugin installation, client list, onboarding connection check |

Sources awaiting permission remain visible and cannot be enabled. BYOK sources require an active credential. Minimum-plan checks and owner protection are also applied in mock services, in addition to UI controls. These checks model intended behavior and provide no security boundary.

## Query lifecycle and feedback

`lib/query/keys.ts` defines hierarchical keys. List parameters form part of each key. Query defaults use a 30-second stale time, disable refetch on window focus, and retry transient reads once. Not-found, forbidden, and conflict errors are not retried. Mutations are not retried automatically.

| Mutation | Cache effects |
| --- | --- |
| Source toggle | Optimistic source update with rollback; invalidate sources, tools, usage |
| Onboarding source selection | Invalidate sources, tools, usage |
| Credential add/rotate/delete | Invalidate credentials, sources, tools, usage |
| Playground execution | Invalidate logs and usage |
| Member invite/role/remove | Invalidate team |
| Workspace update/notifications/URL regeneration | Write current workspace result; invalidate workspace queries, including clients |
| Plugin installation | Update mock connected clients; invalidate client list and reset cached connection detection |

The source-table renderer uses TanStack Table with stacked mobile rows. Logs use manual sorting and pagination delegated to the service. Loading views use skeletons; `ErrorState` maps service errors to explanatory copy and retry actions; `EmptyState` provides guidance and the relevant next action. Copying and mutations report success/failure through shared toast components.

## Mock behavior and persistence

- Seed generators provide 13 sources, tool definitions, approximately 200 call logs, 30 daily usage buckets, plans, invoices, credentials, clients, and members. Names, addresses, and checksum-valid identifiers are sample fixtures.
- `simulate.ts` delays requests by 200–800 ms by default. Random failures occur before writes, preventing simulated network errors from partially applying a mutation. Returned values are cloned.
- Default read/write failure rates are 4% and 3%. Reliable reads, such as the current user and onboarding polling, opt out. Onboarding polling has its own shorter request latency and detects the selected platform about six seconds after the mock plugin installation is confirmed. Skipping installation does not produce a successful detection.
- Browser storage key `mock:errorRate` overrides random failure probability between 0 and 1. Removing the key restores defaults. This override does not affect explicitly reliable operations.
- Log filtering and daily buckets use Bangkok calendar dates. Daily totals and per-source usage are seeded aggregates, rather than a roll-up of the 200 sampled logs. Playground runs increment aggregate usage and append a log; service/network failures do not count as completed tool calls.
- The mock usage window starts as the last 30 days. It is a demonstration of quota UI, not a real billing-period meter. Previous-period comparison and source distribution are synthetic. Unlimited/custom Enterprise limits currently use a numeric fallback in mock usage.
- Repeating a tool/input within its TTL simulates a cache hit. Cache behavior and tool responses are local; no upstream request occurs.
- Mock database state resets on page reload or provider remount. The last ten playground results are separately stored in `sessionStorage` for the current tab, parsed with Zod, and can survive a reload. If storage is unavailable, history stays in memory.

## Routing and localization

`next-intl` supports Thai by default and English. Thai canonical paths have no locale prefix; English paths start with `/en`. Use the localized `Link`, `useRouter`, and pathname helpers from `i18n/navigation.ts` for internal navigation. `proxy.ts` handles negotiation and prefix behavior.

Put interface copy in both message files. Domain descriptions and MDX content have Thai/English variants. Use `useFormatters()` and `useLocalized()` for dates, numbers, and localized entities; request configuration sets the Bangkok timezone.

Product name, tagline, external URLs, sample juristic ID, and dashboard/marketing/footer navigation are centralized in `config/site.ts`. Documentation navigation intentionally lives in its content manifest because it also maps route slugs to localized MDX files and reading order.

## Plugin setup

Plugins are the primary user installation flow for ChatGPT, Claude and Cursor. MCP remains the protocol behind the tools; this UI change does not assert that MCP is deprecated. `pluginIntegrations` in `config/site.ts` contains platform documentation URLs and intentionally null listing URLs until real listings exist. No directory URL, install deeplink, or OAuth redirect is fabricated.

`ClientSetupTabs` is shared by marketing, onboarding and Overview. Public users continue to sign-in. Workspace users review tool access, logging and BYOK behavior in a clearly labeled demo dialog. `useInstallPluginMutation` calls `WorkspaceService.installPlugin`, which records a mock connection and the selected platform. Polling detects only this confirmed installation. There are no platform requests, publication operations, OAuth grants, or real installations. A real API integration must provide these before offering a production install action.

The main setup flow contains no `mcp-remote` command or manual JSON. Developer endpoints remain behind a collapsed Advanced connections section in Settings. Existing documentation URLs are preserved while their content describes plugin setup.

Platform references checked for this update: [OpenAI Plugins](https://developers.openai.com/plugins), [Claude Plugins](https://claude.com/resources/articles/build-plugins-for-claude), and [Cursor Plugins](https://cursor.com/docs/plugins).

## UI system

`packages/ui/src/styles/tokens.css` defines the color, spacing, typography, and layout tokens. Shared styles map these to Tailwind v4 theme utilities; the shared config preset provides font and other theme settings. App-specific prose styles live in `apps/web/app/globals.css`.

Reusable primitives include buttons, fields, tabs, cards, badges, switches, tables, dialogs, sheets, tooltips, code/copy controls, skeletons, and toasts. Radix primitives supply dialog/menu keyboard behavior. Lucide provides outline icons; Recharts uses token-based colors and disables chart animations. Fonts are loaded through the existing locale layout: Inter, IBM Plex Sans Thai, and Geist Mono.

Brand marks are an explicit asset exception: `apps/web/public/brands/line.svg` and `google.svg` preserve the supplied SVG colors and gradients. `ProviderIcon` renders them at a consistent size without changing the artwork. They appear in sign-in, the account menu, and LINE notification settings; adjacent text supplies the accessible name.

The dashboard has a fixed top bar and desktop sidebar, with a navigation sheet on mobile. Data tables and invoices use stacked rows below `md`. Docs use a left navigation and desktop right TOC, with mobile navigation. Keyboard users can use the skip link, visible focus styles, and Ctrl+K or Cmd+K command palette.

The marketing shell uses a scoped `.marketing-surface` palette defined in the shared token file and prioritizes IBM Plex Sans Thai. It does not change dashboard or documentation colors. The landing page composes a standalone `Hero` followed by a separate `PlaygroundSection` containing `McpPlaygroundDemo`; the demo itself uses two panels on desktop. Legacy landing sections remain available in source but are not rendered. Pricing retains its route but is no longer in marketing navigation. The GitHub mark uses the user-supplied SVG geometry.

`MockDemoService` has no `MockDb` reference. It exposes only three allowlisted tools, calls local mock runners, measures the simulated request delay, and labels attribution as sample data. It neither calls upstream APIs nor writes to logs, quota, credentials or sources. `lib/query/demo.ts` uses a separate public-demo query key and a mutation without dashboard invalidation. The generated `ToolForm` is shared with the authenticated playground; optional submit text and ID prefixes keep both uses independent. Structured sample results are the primary presentation; raw JSON is an optional disclosure.

## Replacing mocks with a real API

1. Implement the existing service interfaces under `lib/services/http/`. Preserve input/output contracts, filtering, and pagination semantics.
2. Validate response payloads using the exported Zod schemas. Convert transport errors to the existing `ServiceError` codes so current error UI remains useful.
3. Return the HTTP service collection from `createServices()` in `lib/services/index.ts`. `ServicesProvider` also accepts injected services for an integration harness.
4. Keep view components and query hooks dependent on interfaces. Preserve cache invalidation rules; scope keys to the workspace when real workspace switching is added.
5. Introduce real auth, authorization, credential storage, metering, payments, and MCP connectivity as a separately reviewed backend phase. Never ship the mock credential, owner, or plan checks as authorization.

## Deliberate prototype boundaries

Login buttons navigate to onboarding; there is no session or access protection. Workspace switching currently shows an explicitly labeled demo toast and keeps the original dataset. Plan-change buttons acknowledge a demo request without changing billing or the active plan. Invoice download shows that no PDF exists. LINE connection/alerts, member invitations, MCP regeneration, and onboarding connection detection only update or simulate local state. Workspace deletion requires a matching name but only shows a demo toast. External `.example` links are product configuration placeholders.

## Verification status

This completion pass used source inspection, route/import inventory, translation-key comparison, and Git whitespace inspection. No dependency installation, build, dev server, lint, typecheck, or test command was run, following the supplied frontend brief. Browser rendering and runtime behavior remain unverified.

The local Next.js guides requested by `AGENTS.md` were absent at both the repository and app package locations. No Next.js routing API or configuration was introduced in this completion pass; existing route conventions were retained. Read the bundled version-specific guides when dependencies are made available before changing framework behavior.

Subsequent startup troubleshooting: after the user installed dependencies, the bundled installation guide became available under `apps/web/node_modules/next/dist/docs/` and was read. Turbo 2.11.11 reproduced exit code 3221226505 in an interactive Windows terminal, even with stream output, while Next.js started successfully in the same terminal. The root `dev` script now runs `pnpm --filter @repo/web dev`; `dev:turbo` retains the original command. The updated `pnpm dev` reached Ready and `/` and `/dashboard` returned HTTP 200. Build, lint, typecheck, automated tests, and browser interactions were not checked in this troubleshooting pass.

The plugin UX update was inspected for source syntax, local import resolution, translation-key parity, MDX route continuity, and exact preservation of the supplied Google SVG. No additional build, typecheck, test, or browser interaction run was performed for that update.
