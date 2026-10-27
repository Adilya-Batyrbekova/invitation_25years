# Birthday invitation project

Preparation completed on 2026-10-27 after two interview rounds. The planned product is a Russian invitation for a 25th birthday on 2026-11-28, 14:00–18:00, at the church building at Abaya 88, Astana. Launch deadline: 2026-11-18.

The current deliverable is documentation, not a working application. No application dependencies, database, authentication, deployment or external services were created in this preparation task. `sites/birthday-structure/dist/` contains an earlier demonstration, not the planned production implementation.

## Documentation map

- [AGENTS.md](AGENTS.md): mandatory working instructions and documentation maintenance.
- [REQUIREMENTS.md](REQUIREMENTS.md): authoritative current scope, user decisions, source reconciliation, open items and acceptance criteria.
- [ARCHITECTURE.md](ARCHITECTURE.md): recommended implementation, data access, deployment, operating limitations and official references.
- [PROJECT-GUIDE-RU.md](PROJECT-GUIDE-RU.md): owner-requested consolidated Russian explanation of the four primary documents; maintained alongside significant changes.

Original inputs remain unchanged: [brief](Бриф%20—%20приглашение%20на%20день%20рождения.xlsx) and [structure](Структура%20и%20контент%20—%20приглашение%20на%20день%20рождения.docx). They are historical source materials, not the current decision authority where REQUIREMENTS.md records later corrections.

## Local Git and private remote

The local repository is initialized on branch `main`. The owner approved recording the proposed first commit and requested uploading it to their existing private GitHub repository. Its exact URL is still needed: no remote is configured and no files have been uploaded from this workspace. Git and Git Credential Manager are available; the read-only account listing returned `Adilya-Batyrbekova`. GitHub CLI is not installed. Plugin discovery reports GitHub installed and enabled, but no GitHub repository tools are exposed in this chat. No token or repository permissions were tested. Existing Git author identity was found and left unchanged; no global settings were modified.

Initialization ran as the sandbox identity. Git checks run as the desktop user may report ownership mismatch. During this task, only a command-scoped `-c safe.directory="D:/мои документы/работа/Вайб-кодинг"` was used for this exact workspace; no persistent or wildcard trust exception was added. Use the normal owning context where possible; do not change global settings to work around this.

The proposed first commit contains `.gitignore`, the five root Markdown documents, the filled invitation brief, the filled structure and the concept image linked by the documents. Templates, historical prototype files and helper scripts are outside that proposed scope. Generated outputs, build directories, local state and unrelated lesson/illustration folders are ignored without deleting them. Exact paths must be reviewed again before committing.

Private GitHub storage is requested. The owner now wants their existing private repository used; do not create a replacement repository or guess its name. Confirm the exact destination and check its visibility and history before configuring/uploading. Each later commit and push still needs explicit approval under AGENTS.md. GitHub Free does not publish Pages directly from private repositories; a free publication approach remains open. The source must not be made public to work around this.

## Next implementation work

Review the existing concept image with the owner, then implement the approved visual direction and working data flows. Plan the database access policies and verify them before connecting live guest data. Create service accounts only as part of a later implementation task. Confirm access from Kazakhstan and Russia before distributing the invitation.

No launch, build, test or publication commands have been verified for the planned application. Add actual commands here when the implementation exists. Do not infer them from the historical prototype.
