# Planned architecture

Status: recommended implementation, not installed or deployed. Verified against official documentation on 2026-10-27. Product authority: [REQUIREMENTS.md](REQUIREMENTS.md).

## Recommended stack and rationale

Use React with TypeScript, Vite and plain CSS for the guest site and a separately loaded administrator area. Publish the static build on GitHub Pages. Use Supabase Postgres, Auth and Storage for shared data, browser ownership, administrator login and administrator-uploaded site images. Use the official Supabase JavaScript client. No component library, custom application server, SSR, separate CMS or CRM is justified now.

React supports the stateful forms, gift filters and content editor without duplicating interaction logic. TypeScript checks data contracts. Vite builds static files suitable for Pages. SSR and search-oriented rendering are not required. Supabase is necessary because Pages does not provide a writable database or server runtime, while reservations, wishes and administrator updates must be shared and access-controlled. Postgres is behind the administrator tables; the owner does not need to operate it directly.

This is sufficient for one event and later copies. It deliberately does not build a multi-customer service. Plain static files alone would not meet persistence and authorization requirements. The deferred alternative below is recorded at the owner's request, not selected for implementation.

Use current compatible stable releases when implementation begins, record actual versions and runtime requirements, and commit a lockfile. No versions or installation checks are claimed in this preparation task. Official Vite guidance documents current Node requirements; validate the selected runtime against it before installation.

## Deferred alternative: Payload with PostgreSQL

On 2026-10-27 the owner asked to record Payload with PostgreSQL as an available alternative only. The current recommendation above remains unchanged; this is not authorization to install Payload, migrate data or replace the architecture.

Payload provides a configurable administrator interface, authentication, access control and APIs, and officially supports PostgreSQL. It could reduce custom content-management UI work and support later reuse. Guest browser ownership, wish editing permissions and transactional gift reservation behavior would still require project-specific implementation and tests.

Payload requires a server runtime compatible with its Next.js deployment; it cannot run on static GitHub Pages. Adoption would require separate hosting for Payload or moving the combined application to suitable hosting, plus database and persistent image storage. A complete zero-cost deployment and its operating limits have not been validated. Reconsider only after checking these costs, hosting compatibility and maintenance implications; update this architecture and related documents if adoption is later decided. PostgreSQL is already part of the current Supabase recommendation, so the main alternative is the administrator/backend layer.

Official references reviewed during the discussion: [Payload overview](https://payloadcms.com/docs/getting-started/what-is-payload), [PostgreSQL adapter](https://payloadcms.com/docs/database/postgres), and [deployment requirements](https://payloadcms.com/docs/production/deployment).

## Hosting and navigation

Pages serves the client bundle; Supabase serves data. Configure the Vite base path for the actual repository URL. Use hash routing for the four pages and admin area to avoid requiring server rewrites on Pages. Contextual return targets must encode both page and section, for example `/#/invitation?section=gifts` before applying the repository base. Exact routes are planned and must be verified with direct navigation and reload. Do not accidentally combine a router fragment with a second anchor fragment.

Load the administrator interface on demand. Use explicit navigation and focus restoration for page/section changes. Do not add guest menus solely because a router exists. Add noindex metadata; it is a discovery preference, not an access boundary. The public repository must contain no private guest records, database exports or privileged credentials.

## Planned code responsibilities

- `src/app/`: application initialization, navigation and session coordination.
- `src/features/invitation/`, `personal/`, `wishes/`, `wishlist/`: page-specific behavior and presentation.
- `src/features/admin/`: authenticated content forms and separate attendance/reservation tables.
- `src/components/`: genuinely shared fields, feedback and dialog behavior; visual components after design agreement.
- `src/data/`: typed Supabase access functions and response mapping; no database calls scattered through rendering components.
- `src/styles/`: shared foundations and, after approval, visual tokens.
- `supabase/migrations/`: schema, constraints, access policies and narrowly scoped database functions; no production records.

These are proposed boundaries, not existing directories. Keep the new implementation separate from the historical `sites/birthday-structure/` demonstration. Decide its exact application directory during scaffolding and update README paths then. Do not reuse unrelated drawing scripts or lesson files as application modules.

## Data and permissions

| Planned record | Contents | Access |
| --- | --- | --- |
| `site_content` | Structured editable texts, event details, contact and Telegram links, conversion rate/date | Public read of published fields; admin write |
| `personal_entries` | Owner-provided stories, captions, image references, order | Public read of published entries; admin write |
| `gifts` | Public catalog fields and publication state | Public published read; admin write |
| `attendance` | Browser owner ID, guest name, yes/no, timestamps | Submitter insert through validated operation; admin read/correct; no guest update |
| `wishes` | Owner ID, public name/text, timestamps | Public projection; author update; admin update/delete |
| `reservations` | Gift ID, owner ID, private guest name, timestamp | Validated claim/cancel operations; admin private read/correct |
| `admin_members` | Explicit administrator user IDs | Privileged setup only; no client self-assignment |

Public reads must expose only intended columns. Never publish reservation names or ownership identifiers through catalog payloads, views or error messages. Return public gift availability and a scoped own-reservation response separately from private reservation records. The reservations table is the surprise-sensitive location; the administrator reservation section displays it. No gift-association data belongs in Markdown or repository files.

Use a database unique constraint on reserved gift ID and a transactional claim operation to prevent double reservation. Cancellation checks the authenticated owner ID inside the database operation. Reject malformed values and invalid gifts on the backend. Use plain text for guest wishes; never render guest HTML. Record limits and enforce them consistently on the client and backend.

Enable row-level security on exposed tables. Audit view execution permissions and any security-definer function, its search path and grants; avoid elevated functions where policies suffice. Public availability endpoints must not bypass privacy accidentally. A hidden admin page is not authorization. Derive admin rights from protected membership, not client-controlled metadata. Privileged service keys stay outside the client build and repository; only publishable client configuration is shipped.

## Registration-free ownership

Create an anonymous Supabase Auth session when a guest first needs to submit or manage data. Retain the session in the browser using the supported client persistence mechanism. The server-issued user ID establishes ownership for database policies; IP and guest names do not. This is technical authentication without a guest registration form, email or identity verification.

The session is specific to browser storage and site origin. Private mode, cleared storage, a different browser/device or a domain change may lose access. Tell guests to contact the owner for corrections; do not offer unauthenticated ownership recovery by name. Losing a session does not delete the stored record. Attendance duplicate handling is best effort per session, not verified per human.

Use GitHub OAuth through Supabase for the administrator. Redirect credential entry to GitHub; do not collect passwords on Pages, whose documentation discourages sensitive transactions such as sending passwords. Allow only the explicitly provisioned owner user ID in protected administrator membership; successful GitHub sign-in alone must not grant admin rights. Configure exact callback/redirect URLs and test them with hash routing and the repository base path. Keep OAuth client secrets in Supabase provider configuration, never the browser bundle. Document account recovery through the identity provider and administrator reprovisioning before handover. An administrator must not silently inherit guest-only permissions or vice versa.

Public links can be forwarded. Anonymous writes need basic abuse controls: validate inputs, constrain text size, use submission throttling and evaluate the provider's recommended CAPTCHA protections. Select a free compatible challenge only if necessary; it must not add guest registration. Measure the chosen provider's rate limits against guests who may share the venue's network. Anonymous-account cleanup and database export must be documented before retirement.

## Content and media

Store editable content in the database so admin updates do not require a rebuild. Keep implementation-owned illustrations and approved static assets in the repository where appropriate. Use Storage only for administrator-managed site and gift images, with restricted upload/delete rights, validated image types and size limits, and optimized display versions. Guest photographs and videos are exclusively in Telegram. No backend Telegram integration is needed.

Validate shop/contact/Telegram links as allowed web links rather than executable schemes. Owner-provided content is not automatically safe HTML. Do not expose editor internals or drafts in public responses.

## Costs and operations

The owner now requests private GitHub source/history storage. GitHub Free supports Pages from public repositories; Pages from private repositories requires an eligible paid plan. Consequently, direct free Pages publication from the requested private repository is unresolved. Keep the source private; do not change visibility or purchase a plan. Reassess a free publication destination separately before deployment. A default hosting address can avoid buying a domain. Supabase Free currently lists 500 MB database storage, 1 GB file storage, 5 GB egress plus 5 GB cached egress, and two active free projects; projects may pause after one week of inactivity. These are provider limits, not a promise that this project is already within them. Small text records for 12–16 guests should be modest, but image volume must be measured.

Do not upgrade or enable paid services automatically. Check quotas and project status before launch and before the event; document manual restoration if paused. Do not create artificial keep-alive automation to imply guaranteed availability. If unavailable, preserve form input, show a clear Russian retry message and the owner's contact. Free-tier uptime and perpetual retention are not guaranteed. Keep export/restore instructions and an owner-controlled backup procedure for private data; do not commit exports.

Verify real access to Pages and Supabase from Kazakhstan and Russia before launch; none was tested in this preparation task. If inaccessible, report the blocker and reassess hosting within the zero-budget requirement rather than claiming compatibility from documentation alone.

Retirement is a separate operational action: agree whether private records should be exported or deleted, unpublish Pages, close public backend writes/reads as appropriate and handle Storage. A custom-domain change neither disables the default Pages address nor guarantees old browser sessions continue. Reassess GitHub Pages usage limits and hosting terms before commercial freelance deployments; the personal invitation is the current deployment scope.

## Planned verification and tooling

At implementation time configure TypeScript strict checks, ESLint for React/hooks and common errors, Prettier, and a production build in CI. Use Vitest for meaningful logic tests such as currency fallback and form validation; use database integration tests for row-level security, privacy, ownership and reservation races. Test with two independent guest sessions and an administrator, not only mocked API responses.

Use browser checks, with Playwright for critical end-to-end flows where useful, for direct links, attendance, wish editing, admin updates and cancellation. Cover narrow phones and desktop, keyboard/focus, long Russian text, error/retry and reduced motion. Test the deployed repository base path. Start with responsive appropriately compressed images, lazy loading below the fold and on-demand admin code; measure the actual build and page before selecting numeric performance budgets. No performance score is claimed now.

## Official verification references

Reviewed on 2026-10-27; these establish documented capabilities, not a tested installation:

- [React build-from-scratch guidance](https://react.dev/learn/build-a-react-app-from-scratch): client application with a build tool; framework tradeoffs remain relevant if SSR is later required.
- [Vite guide](https://vite.dev/guide/) and [Pages deployment](https://vite.dev/guide/static-deploy.html#github-pages): static build, runtime prerequisites and repository base configuration.
- [GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages): static hosting, public repository availability and default addresses.
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits): reassess limits and commercial-use suitability before reuse.
- [Supabase anonymous sessions](https://supabase.com/docs/guides/auth/auth-anonymous): registration-free authenticated identities and abuse considerations.
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security): backend access enforcement.
- [Supabase GitHub OAuth](https://supabase.com/docs/guides/auth/social-sign-in/auth-github): administrator sign-in redirects and provider configuration.
- [Supabase pricing](https://supabase.com/pricing): free quotas and inactivity pause.

Followish was provided as a behavioral reference, but the supplied page could not be read through the web tool. Its internal code, identity mechanism and IP behavior were not verified and are not architecture evidence.
