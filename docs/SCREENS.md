# Thai MCP Hub screen inventory

## URL conventions

Paths below are the default Thai URLs. Prefix any path with `/en` for English (`/` becomes `/en`). Next.js route groups such as `(dashboard)` do not appear in the URL. Route entry files live under `apps/web/app/[locale]/` and compose feature views.

The current implementation has **16 product route patterns**: four public, one documentation catch-all, two authentication/onboarding, and nine dashboard patterns. The documentation catch-all resolves 12 articles, producing 27 named route entries before expanding locales or source IDs. This inventory lists actual routes rather than treating the brief's “15 screens” as a route count.

## Public screens

| Route | Purpose | Main components |
| --- | --- | --- |
| `/` | Developer infrastructure hero followed by a separate, interactive sample-data playground section | `Hero`, `PlaygroundSection`, `McpPlaygroundDemo`, `DemoResult`, shared `ToolForm` |
| `/pricing` | Compare Free, Starter, Pro, Enterprise and explain common billing questions | `PricingTable`, `PricingFaq` |
| `/sources` | Browse the public catalog using keyword and category filters | `CatalogList`, `CategorySelect`, `SearchInput`, license/status badges |
| `/sources/[id]` | Inspect a source, tools, examples, licensing, attribution, and official source | `CatalogDetail`, `ToolParams`, JSON/code controls |

Public screens share `MarketingHeader` and `MarketingFooter`. Navigation and external footer links come from `config/site.ts`. Catalog/plans use query hooks and mock services; unavailable sources remain visible as coming soon. These are catalog views and do not change workspace enabled state.

The landing page intentionally contains only the hero and playground, with compact footer navigation. Previous comparison, source-table, setup, pricing-summary, and open-source sections are no longer composed on `/`. Pricing is removed from marketing navigation; `/pricing` and its existing functionality remain available by direct URL. The header includes the supplied GitHub SVG linked through `siteConfig.links.github`.

The standalone hero uses IBM Plex Sans Thai and a scoped neutral palette. Open Source, Self-hosted, and Managed Cloud appear as compact deployment labels. The separate playground section follows the hero, with input and result panels side by side on desktop and stacked on tablet/mobile. The public demo offers company lookup, Thai baht text, and working-day tools with generated validated fields. It starts with a sample preview and supports Execute, skeleton loading, success/error feedback, recovery with example input, and expandable raw JSON. Every result is explicitly synthetic. `DemoService` is isolated from workspace logs, credentials, enabled sources and quota.

## Documentation

All articles use `(docs)/docs/[[...slug]]/page.tsx`. `content/docs/manifest.ts` allowlists slugs, titles, files, section grouping, and reading order. Every article has Thai and English MDX files.

| Route | Purpose | Content file under `content/docs/{locale}/` |
| --- | --- | --- |
| `/docs` | Product introduction and data trust model | `introduction.mdx` |
| `/docs/quickstart` | First connection and first useful question | `quickstart.mdx` |
| `/docs/connect/claude-desktop` | Claude plugin installation and prototype boundaries | `connect/claude-desktop.mdx` |
| `/docs/connect/chatgpt` | ChatGPT plugin installation and prototype boundaries | `connect/chatgpt.mdx` |
| `/docs/connect/cursor` | Cursor plugin installation and prototype boundaries | `connect/cursor.mdx` |
| `/docs/concepts/sources` | Sources, availability, enabling, and licensing | `concepts/sources.mdx` |
| `/docs/concepts/tools` | Tool names, schemas, and input/output | `concepts/tools.mdx` |
| `/docs/concepts/attribution` | Source identity and timestamps on answers | `concepts/attribution.mdx` |
| `/docs/concepts/caching` | TTLs and cached responses | `concepts/caching.mdx` |
| `/docs/credentials` | BYOK setup and credential lifecycle | `credentials.mdx` |
| `/docs/rate-limits` | Rate limits, quotas, and handling limits | `rate-limits.mdx` |
| `/docs/tool-reference` | Tool catalog generated from service data | `tool-reference.mdx` and `ToolReference` |

Shared elements: `DocsSidebar`, `DocsMobileNav`, MDX components, copyable code blocks, `DocsToc`, and `DocsPager`. The TOC comes from article headings. Unknown docs slugs use not-found handling.

## Authentication and onboarding

| Route | Purpose | Main components and actions |
| --- | --- | --- |
| `/login` | Demonstrate LINE and Google sign-in entry points | `LoginCard`; either button navigates to onboarding |
| `/onboarding` | Guide the user from plugin installation to source selection and a first connection | `OnboardingFlow`, `OnboardingStepper`, `StepPlugin`, `StepSources`, `StepTry`, `ClientSetupTabs` |

Onboarding has three steps: choose a platform and confirm a demo plugin connection after reviewing workspace access; choose permitted sources with safe defaults; try a sample question and observe mock connection detection. Users can skip or return to the previous step. The mock service must receive an installation confirmation before detection can succeed, and reports the confirmed platform. There is no real OAuth or directory installation.

## Dashboard shell

All dashboard routes share `DashboardShell`, a fixed top bar, desktop `DashboardNav`, and a mobile navigation sheet. The top bar contains `WorkspaceSwitcher`, `CommandPalette`, documentation link, plan badge, `LocaleSwitcher`, and `UserMenu`.

The command palette opens with Cmd+K/Ctrl+K, searches pages, sources, and enabled-source tools, and links to tool-specific playground URLs. The workspace picker currently acknowledges a demo selection without replacing the current dataset.

## Dashboard routes

| Route | Purpose | Main feature entry |
| --- | --- | --- |
| `/dashboard` | Connection health, recent activity, usage, quota | `OverviewView` |
| `/dashboard/sources` | Manage the workspace's enabled sources | `SourcesView` |
| `/dashboard/sources/[sourceId]` | Inspect an enabled or available source in workspace context | `SourceDetailView` |
| `/dashboard/playground` | Execute a tool using a generated form and inspect its result | `PlaygroundView` |
| `/dashboard/logs` | Filter, sort, paginate, and inspect calls | `LogsView` |
| `/dashboard/credentials` | Manage masked BYOK credentials | `CredentialsView` |
| `/dashboard/team` | Invite members, assign roles, remove members | `TeamView` |
| `/dashboard/usage` | Usage breakdown, quota, plan choices, invoice history | `UsageView` |
| `/dashboard/settings` | Workspace name, MCP URL, language, notifications, deletion preview | `SettingsView` |

### Overview

`ConnectionCard` displays plugin setup tabs for ChatGPT, Claude and Cursor, an access-review dialog, and connected clients with last-seen times. The primary flow no longer exposes a secret-bearing URL or configuration snippets. `KpiCards` displays total calls, success rate, latency, and active sources. `CallsPerDayChart` and `CallsBySourceChart` visualize the mock aggregates. `RecentCalls` shows five calls and links to logs. `QuotaCard` warns at 80% and links to usage/plans.

The chart panels show skeletons while loading, explanatory retry states on failed requests, and `UsageEmptyState` with a playground link when no activity exists. Connection/client failures have their own retry actions.

### Sources

`SourcesView` provides search, category, enabled/disabled filters, status and license badges, source links, and `SourceToggle`. The table shows name, provider, category, tool count, status, license, and enabled state; its footer reports the visible tool total. Mobile rows are stacked.

Pending-permission sources cannot be enabled and explain why. BYOK sources without active credentials link to `/dashboard/credentials?add=SOURCE_ID`. Plan-gated sources explain the minimum plan. Successful toggles toast; failed optimistic changes roll back. Filtered empty results offer reset.

`SourceDetailView` shows provider, category, minimum plan, licensing, official URL, attribution, `StatusHistory` for 24 hours, BYOK credential state, and tool input schemas. Enabled-source tools link to `/dashboard/playground?tool=TOOL_NAME`. Tool-list errors retry; an empty tool list links back to sources.

### Playground

`PlaygroundView` lists enabled-source tools, grouped by source. `ToolForm` renders fields from the selected tool's schema and supports example input. `ResultPanel` offers formatted and raw JSON views, request latency, cache state, attribution, timestamp, request retry, and tool-level error explanations.

`?tool=TOOL_NAME` initializes a particular tool and responds to navigation between tool links on the same route. An unavailable tool displays recovery actions instead of silently selecting another tool. Selection and history restoration are disabled during a run so an old response cannot be mistaken for the newly selected tool.

`RunHistory` retains the last ten results for the tab, with restore and clear controls. Successful mock transport calls append a log and update aggregate usage even when the tool's business result is an error. Transport failures leave usage unchanged. All execution is simulated.

### Logs

`LogsView` uses service-side date presets (today, seven days, thirty days, all), status/source/client filters, timestamp/latency sorting, and pages of 20 rows. `DataTable` renders desktop and mobile variants. Selecting a row opens `LogDetailSheet` with input, output/error, source attribution, and timing. `LogsEmptyState` suggests a concrete first question; filtered-empty results offer reset. Failed requests can be retried.

### Credentials

`CredentialsView` shows source, label, masked value, creation/last-use information, and status. `AddCredentialDialog` validates a source, label, and sample value; `RotateCredentialDialog` replaces it; `DeleteCredentialDialog` confirms removal. `?add=SOURCE_ID` opens add with the BYOK source selected. Successful actions toast and invalidate dependent data. Removing a source's last active credential disables that source in mock state.

Raw values are form input only; the mock service retains the masked value. No credential is sent to or stored by a real backend. Use sample credentials during review.

### Team

`TeamView` renders members, localized roles, invitation/active status, last activity, and a current-user marker. `InviteMemberDialog` validates email and role, handles duplicate email, and adds a pending mock member. Role selectors update local service state; `RemoveMemberDialog` confirms removal. The owner cannot be removed or reassigned and remains visible when they are the only member. An empty list offers invitation.

The per-source permissions card is explicitly visual only. No invitation email is sent and no authorization is enforced.

### Usage and plan

`QuotaCard` displays usage and the warning threshold. The source chart and breakdown table show call counts and shares. `PlanCard` compares plans and marks the current plan. The nearby quota CTA links to configured sales contact. Plan actions acknowledge a demo request without changing a subscription or charging money.

`InvoiceList` uses `DataTable` for desktop and stacked mobile rows with invoice number, billing dates, plan, total, status, and a download action. Download explains that this prototype has no PDF. Empty invoices link to pricing. Usage, source names, plans/workspace, and invoices expose their own loading/error states; no-activity usage links to the playground.

### Settings

`SettingsView` composes:

- Workspace-name form with validation and save feedback.
- A collapsed Advanced connections section contains the developer MCP endpoint and its regeneration warning dialog. Regeneration clears connected clients and resets mock plugin detection. Everyday setup uses the plugin flow on Overview.
- Language selection through localized navigation.
- Mock LINE connection status and saved error/quota alert preferences.
- A danger-zone dialog requiring the exact workspace name. Confirmation displays a demo message; it does not delete the workspace.

Workspace loading uses section skeletons; failure provides retry. Mutation failures keep actionable forms/dialogs available.

## Error routes and external destinations

`app/[locale]/not-found.tsx`, `[...rest]/page.tsx`, and `NotFoundView` handle unknown localized routes. Invalid source IDs are reported through the source service's not-found state. Terms, privacy, status, GitHub, and sales contact are configured external destinations, not additional local screens.

## Review status

Source-level inspection covered route files, feature wiring, relative/internal imports, and Thai/English translation-key parity. No install, build, dev server, lint, typecheck, test, or browser-rendering pass was run during this completion, as required by the original brief. Layout, accessibility, and interactions described here are implementation intent awaiting runtime verification. See [ARCHITECTURE.md](ARCHITECTURE.md) for mock lifetimes and backend integration boundaries.

The subsequent plugin UX update preserves all route patterns, including `/docs/connect/claude-desktop` for existing links. Marketing setup now links to sign-in rather than displaying JSON snippets. Login, user menu, and LINE notification settings use the user-supplied brand SVG assets through `ProviderIcon`. Plugin confirmations update mock services only; no listing is published or installed on an external account.
