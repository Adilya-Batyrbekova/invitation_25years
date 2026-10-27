# Project agent instructions

## Language and authority

Communicate with the owner in Russian, including questions, explanations, progress and final reports. Create and maintain project Markdown in English, including headings, rules, decisions and open questions; use English filenames. Preserve source materials, brands, quotations and Russian interface copy in their meaningful original language. Documentation language does not change the Russian product language.

Owner-authorized exception: [PROJECT-GUIDE-RU.md](PROJECT-GUIDE-RU.md) is a consolidated Russian reading guide for the owner. Keep its filename in English and its content in Russian. It explains the four primary documents without introducing requirements or replacing their authority. Update affected portions in the same task when significant source decisions change; do not extend this exception to other documents without owner instruction.

Direct owner decisions take precedence over historical sources and assumptions. If current owner instructions conflict ambiguously, identify the specific conflict rather than inventing a requirement. Never rewrite confirmed requirements to match an implementation bug.

## Required reading and documentation map

Before every task read this file, [README.md](README.md) and [REQUIREMENTS.md](REQUIREMENTS.md). Read [ARCHITECTURE.md](ARCHITECTURE.md) before implementation, dependency, data, access, testing, deployment or maintenance changes. Read relevant code and more specific directory instructions before editing. Review linked original brief/structure when provenance or historical intent matters; current corrections are in REQUIREMENTS.md. For visual work inspect the actual agreed references and concept image, not just textual summaries.

Information ownership: README contains current stage, navigation and verified operating commands; REQUIREMENTS contains scope, decisions, acceptance and unresolved product inputs; ARCHITECTURE contains technical choices, planned responsibilities, data/security and operations; this file contains working rules. Update existing documents rather than creating parallel versions. Add a new document only for a distinct topic that no existing document can maintain clearly, and link it in the map.

The owner-facing consolidated explanation is maintained in [PROJECT-GUIDE-RU.md](PROJECT-GUIDE-RU.md); it is a reading aid rather than a separate decision source.

Current status is preparation only. Do not imply that the old `sites/birthday-structure/` demonstration is the planned working application. Original Word/Excel files remain source materials. Unrelated lesson, drawing and output files are not application requirements.

## Development rules

- Before adding a component, function or style, inspect existing solutions. Reuse genuine shared behavior consistently instead of duplicating it across pages.
- Separate interface rendering, data access and business/access rules by responsibility and reason to change. Enforce authorization and validation in the backend, regardless of UI visibility.
- Keep structure proportional to one event. Do not impose arbitrary line limits, split files mechanically, or build configurable universal components for substantially different elements. Future reuse means separate adapted copies, not a multi-tenant platform.
- Design remains provisional. Do not invent or approve colors, fonts, composition or component appearance through documentation. Use agreed mockups, annotated references or visual prototypes. Do not create DESIGN.md before approved visual materials justify it. After approval, centralize shared visual values and components; document any justified page-specific variation.
- Before a dependency, check the existing stack. Record the concrete reason for significant additions and verify official support and compatibility. Do not select a component library in advance of the visual concept.
- Refactoring preserves agreed behavior and appearance; state behavior changes separately. Avoid unrelated broad restructuring.
- Build for phones and desktop, keyboard navigation, visible focus, meaningful labels, long content, reduced motion, and applicable loading, empty, failure/retry and saved-success states. Preserve form input after failed requests. Never report success before persistence.
- Avoid needlessly heavy dependencies and resources. Optimize actual images and defer nonessential/admin code; set measurable performance conditions after representative assets and deployment exist.
- Never commit secrets, guest records or private exports. Browser credentials are not administrator rights. Treat anonymous sessions as browser ownership, not verified human identity. Distinguish demo data and integrations from working services. Keep giver names private from public APIs, not just public screens.
- No paid services, subscriptions or unsolicited external messages. The current preparation scope excludes application code, dependency installation, service creation and publication. Later authorized implementation must preserve the zero-budget constraint.

## Checks and completion

When code exists, enforce formatting, strict type checks, static analysis and production build through project scripts and CI; document only real, verified commands. Use automated tests for critical permissions, private data projections, double-booking and author-only edits. Verify database policies with independent guest and administrator sessions. Test interface changes in a browser; a successful build is not interface verification. Scale checks to risk, avoiding tests that merely mirror trivial implementation details.

Before launch perform the acceptance checks in REQUIREMENTS.md and operational checks in ARCHITECTURE.md, including actual regional access and free-tier readiness. Do not claim tests, deployment or integrations ran when they did not. Report what changed, how it was verified, what remains unverified and material limitations. If a required check cannot run, explain why and do not describe the result as fully verified.

## Mandatory documentation maintenance

Before changing anything, identify the documents describing the affected area, check current requirements and limitations, and note any mismatch between documentation and implementation.

Within the same task, update affected descriptions whenever scope, user flows, pages/features, project structure, module responsibilities, technologies/dependencies, models/sources/APIs, permissions, approved design rules, environment/commands/deployment or important limitations change. Resolve documented unknowns when evidence becomes available. Add necessary explanations for new operating processes; remove obsolete descriptions. Fix links after moves/renames. Mark plans implemented only after actual implementation. Do not append a correction while leaving the main description false.

Before completing every task, verify the affected documentation against the actual result, check instructions for contradictions and confirm referenced paths/commands. Mention significant documentation changes in the result. Documentation maintenance and this completion check are required parts of the same task and need no separate owner reminder. Do not document every minor function or file; update what a future agent needs to avoid misunderstanding requirements, implementation or operation.

## Git history and explicit approval

Never create commits automatically. After a substantial, logically complete change, run applicable checks, update related Markdown, inspect the full proposed file list and diff, briefly report the change and verification in Russian, and ask the owner whether to commit. Substantial changes include features, meaningful fixes, refactoring, architecture, configuration, dependencies and substantive documentation. Group related edits; do not ask after every file or intermediate step.

Each commit requires explicit owner approval of its proposed scope. Silence, refusal or moving to another task is not approval; retain uncommitted work. If work from multiple tasks accumulates, explicitly identify all proposed contents and offer separate commits where appropriate. Never silently include deferred or unrelated work. Keep code and its related documentation in the same task commit. If scope changes materially after approval, ask again. Before the first commit, review the initial files, describe their contents and ask in Russian; do not commit until answered.

Use existing identity settings; never invent user.name or user.email. Do not modify global Git configuration. Any necessary setting changes must be repository-local. Do not overwrite others' changes, rewrite history, perform destructive operations or force-push without a separate explicit instruction. After committing, report the short hash, message and remaining uncommitted changes.

The owner explicitly accepted public visibility for `Adilya-Batyrbekova/invitation_25years` and authorized sending the first approved commit there. This supersedes the earlier private-storage request for this repository only. Before creating another remote repository, configuring additional remote access or a first upload to another destination, request explicit permission for the specific action and destination. Do not change repository visibility without permission. Do not infer remote/push consent from local commit consent.

After an approved commit, offer to push it, but perform each push only after explicit approval. Before any upload inspect the exact outgoing changes for secrets, private personal data and unnecessary files; private visibility does not eliminate this check. Never log tokens or credential contents. Keep environment files, local settings, dependencies, builds, temporary artifacts and private exports excluded; preserve dependency lockfiles and safe secret-free configuration examples. Review .gitignore as the project develops. Stage explicit reviewed paths rather than indiscriminately including the mixed workspace.

### Branches and rollback

Keep `main` as the reviewed integration baseline. The owner requested an initial working branch; `work/implementation` starts from `cd2be70`. Use a short-lived branch per coherent later task, created from current main after reviewing local changes and remote state. Do not add a permanent develop branch without need. Branches share the working folder; uncommitted edits are not safely isolated until committed or otherwise deliberately preserved. Check working-tree changes before switching and never discard them automatically.

After checks and documentation updates, explain the change and request the required commit approval. Request explicit approval before pushing and before merging into main; approval to commit does not imply approval to merge. Prefer squash-merging a completed task when it makes one clear reversible change; avoid bundling unrelated tasks. Use a pull request where useful, but do not require one for every tiny change. Create a new task branch from updated main after integration rather than repeatedly reusing the merged branch. Delete remote branches only with owner authorization.

For an unwanted shared change, prefer a reviewed `git revert` that adds a corrective commit and preserves history. Explain its scope, test it and obtain commit/push approval. Avoid reset, history rewriting and force-push without separate explicit permission. Git reverts code/configuration; database migrations, live content and external actions need their own recovery plan and backups.
