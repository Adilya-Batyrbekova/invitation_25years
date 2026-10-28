# Birthday invitation project

Preparation completed on 2026-10-27 after two interview rounds. The planned product is a Russian invitation for a 25th birthday on 2026-11-28, 14:00–18:00, at the church building at Abaya 88, Astana. Launch deadline: 2026-11-18.

The current deliverable is documentation, not a working application. No application dependencies, database, authentication, deployment or external services were created in this preparation task. `sites/birthday-structure/dist/` contains an earlier demonstration, not the planned production implementation.

## Documentation map

- [AGENTS.md](AGENTS.md): mandatory working instructions and documentation maintenance.
- [REQUIREMENTS.md](REQUIREMENTS.md): authoritative current scope, user decisions, source reconciliation, open items and acceptance criteria.
- [ARCHITECTURE.md](ARCHITECTURE.md): recommended implementation, data access, deployment, operating limitations and official references.
- [PROJECT-GUIDE-RU.md](PROJECT-GUIDE-RU.md): owner-requested consolidated Russian explanation of the four primary documents; maintained alongside significant changes.

Original inputs remain unchanged: [brief](Бриф%20—%20приглашение%20на%20день%20рождения.xlsx) and [structure](Структура%20и%20контент%20—%20приглашение%20на%20день%20рождения.docx). They are historical source materials, not the current decision authority where REQUIREMENTS.md records later corrections.

## Local Git and GitHub

The local repository uses `main`. The approved first commit is `cd2be70` (project documentation and Git setup; nine files). Remote `origin` is `https://github.com/Adilya-Batyrbekova/invitation_25years.git`. The owner initially accepted public visibility and authorized uploading the first commit. On 2026-10-28 they requested private visibility; the repository was changed to private and authenticated Git access was verified. After Git Credential Manager device reauthentication, the first commit was successfully pushed. At that initial upload, remote refs `main` and `work/implementation` both matched local commit `cd2be7079d85a8e04614772d6d3a180c86db44bb`; public visibility and default branch main were verified through GitHub metadata.

Local working branch `work/implementation` was created from `cd2be70`, is checked out and tracks `origin/work/implementation`; main tracks `origin/main`. The working branch contains the subsequent documentation changes about GitHub visibility, synchronization and branch/rollback rules. Main remains the initial baseline until a separately approved merge. Follow AGENTS.md for later commit, push and merge approvals.

Git and Git Credential Manager are available; GitHub CLI is not installed. The GitHub plugin is available, but it does not expose repository visibility changes; the authorized change used GitHub REST API with the existing Git credential. No tokens were printed. Existing Git author identity and global configuration were left unchanged.

Initialization ran as the sandbox identity. Git checks run as the desktop user may report ownership mismatch. During this task, only a command-scoped `-c safe.directory="D:/мои документы/работа/Вайб-кодинг"` was used for this exact workspace; no persistent or wildcard trust exception was added. Use the normal owning context where possible; do not change global settings to work around this.

The first commit contains `.gitignore`, the five root Markdown documents, the filled invitation brief, the filled structure and the concept image linked by the documents. Templates, historical prototype files and helper scripts remain outside that scope. Generated outputs, build directories, local state and unrelated lesson/illustration folders are ignored without deleting them.

Keep reviewed work on main; use a short-lived branch for one coherent change and create the next branch from updated main after approved integration. Prefer a reviewed revert commit for shared-code rollback rather than rewriting history. Database and live-content recovery require separate backups and procedures. Source upload does not publish a working website or configure Pages.

Private visibility does not change local branches or committed files. At verification immediately after the visibility change, remote main was `cd2be70` and remote work/implementation was `d561b55`. The visibility operation itself did not create a commit, push or merge; related documentation is recorded separately. Free Pages publication directly from a private repository is unsupported on GitHub Free; choose compatible free hosting before deployment.

## Next implementation work

Review the existing concept image with the owner, then implement the approved visual direction and working data flows. Plan the database access policies and verify them before connecting live guest data. Create service accounts only as part of a later implementation task. Confirm access from Kazakhstan and Russia before distributing the invitation.

No launch, build, test or publication commands have been verified for the planned application. Add actual commands here when the implementation exists. Do not infer them from the historical prototype.
