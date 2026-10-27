# Current requirements

Status: preparation complete; implementation planned. Updated 2026-10-27. This is the current English specification derived from the Russian source brief, structure and two interview rounds. Direct owner decisions override source documents and technical assumptions. Original materials are preserved, not translated or overwritten.

## Product and confirmed scope

Create a personal electronic invitation for the owner's 25th birthday. Event: 2026-11-28, 14:00–18:00, church building at Abaya 88, Astana; approximately 12–16 guests. The owner said to retain the stated time. This is not an apartment or a home venue. The complete initial project is due by 2026-11-18. Later content may be added when available.

All guest and administrator interface text is Russian. Communication is Russian; primary maintained Markdown is English. The owner explicitly requested a consolidated Russian reading guide, PROJECT-GUIDE-RU.md, as a language exception documented in AGENTS.md. One shared public link is sufficient, including for friends in Russia; they may also receive the wishlist link directly. No guest registration or identity confirmation is wanted. Search discovery is not wanted; configure noindex without claiming that it provides privacy. Anyone with the link can share it and access the public content.

The primary action is an individual attendance response. Gifts and bringing one flower are voluntary. No payments, shopping cart, collective purchases, food questionnaire or event schedule are included.

## Functional page structure

The source defines four guest pages. Keep their functional order; it does not approve their visual composition.

| Page | Purpose and content |
| --- | --- |
| Invitation | Banner with short invitation and date; separate personal greeting; full November 2026 calendar with the 28th highlighted; time; venue and route link; attendance form; voluntary flower and wishlist link; links to personal and memory pages; contact |
| «Это всё я» | Introduction, real personal facts and photographs, stories and preferences |
| «На память» | Introduction, text wish form, shared wish feed, invitation link to a Telegram group for event photos and videos |
| Wishlist | Voluntary gift explanation, initially collapsed currency/filter settings, gifts, details, reservation and cancellation |

Retain the source's interaction constraints: no guest header, navigation menu or footer; no banner action buttons, time or address in the banner; contextual floating «Приглашение» return from supplementary pages. Personal and memory pages return to personal links; wishlist returns to gifts. Return must work from direct entry and must not cover content or controls. Personal stories remain in the page flow rather than popups. A gift detail dialog is allowed. Exact story disclosure behavior is deferred to visual prototyping.

## Guest workflows

### Attendance

Collect a name and «Приду» / «Не приду». Each person answers for themselves. Guests do not edit submitted attendance; later changes are communicated directly to the owner. The administrator may correct mistaken records. Attendance is private to the administrator, not part of the public feed. A browser identity does not prove a unique person, so cross-device duplicate prevention cannot be guaranteed without a different access model.

### Wishes and Telegram

Collect name and plain text only. No attachments, on-site guest photo album, video upload or embedded Telegram feed. Publish immediately to all visitors with access. Authors may edit their own wishes from the same browser; after submission only the administrator deletes published content. Provide clear explanation of public visibility before submission. Feed order and pagination are technical decisions, not owner requirements.

Use a normal invitation link to a Telegram group for photos and videos of the event. The owner supplies the group and link. The proposed pinned group message should explain that the group is for event photos and videos. No Telegram bot, automated group management or content synchronization is included. Group creation and posting are outside this preparation task.

### Gifts

Public gift data: title, image, original KZT price, category, description, variants where applicable, shop link and reservation availability. Show «Свободен», «Уже забронирован» and «Твоя бронь» as appropriate. Do not expose giver names to other guests. A reservation stores the guest's name privately. Guests can cancel only their own reservations; simultaneous claims must yield exactly one success for a gift.

The owner accepted recognition in the same browser without registration. A different device or cleared browser shows general availability, not ownership. Recovery is through the owner. Do not use IP or a typed name as proof of ownership. No mandatory saved personal link is required.

The owner accepts that reservation names and gift associations exist in the database and a separate administrator section. This is voluntary surprise preservation, not technical concealment from the owner. Explain where these records live so the owner can avoid opening them.

Source currency behavior: KZT by default, approximate RUB display, a conversion rate and date, category and budget filters, sorting and reset inside collapsed settings. Use KZT if no valid exchange rate exists. No payment or automatic store price/stock synchronization. A manually maintained conversion rate is sufficient as a technical recommendation.

## Administrator workflows

Provide a protected administrator interface for editing site texts, personal stories, site photographs and gifts without code changes. Show attendance as a table with name and response. Keep a separate reservation table with guest name and a link to the selected gift. Allow correction of erroneous data and deletion of wishes. Google Sheets, CRM and external reporting integrations are unnecessary. Administrator sign-in through GitHub OAuth is the recommended implementation; guests remain registration-free. This is a technical recommendation rather than an owner-selected login provider.

Normal content administration must not require opening SQL, source code or the database dashboard. Editing content is different from redesigning layouts; the latter remains development work. No general page builder is required.

## Design status

An existing direction and visualization were developed in the chat «Создание концепции». Its latest image request uses concept 4, «Праздник от руки». The local candidate image is [Главная — непрерывное полотно.png](Главная%20—%20непрерывное%20полотно.png). The owner identifies the visualization as an approximate direction, not blanket approval of every detail.

Do not establish colors, fonts, tokens, component styling or composition from prose in these preparation documents. Earlier brief claims that lavender and hand-drawn decoration are mandatory remain source history under the owner's newer design-status instruction. Visual decisions must come from agreed mockups, references with specific comments, or working visual prototypes. No DESIGN.md is created now. Create one only when approved visual rules need an implementation reference; link the actual materials rather than describing the entire mockup in words.

## Budget, lifespan and reuse

No paid services or subscriptions are authorized. Prefer GitHub Pages on its free address and a free managed backend. The owner wants no additional spending. Free services have quotas and operating limitations; zero-cost perpetual availability is not promised.

The owner initially requested private GitHub storage, then explicitly accepted the existing public repository `Adilya-Batyrbekova/invitation_25years` and approved uploading the first commit. Public source visibility is now accepted for that destination; secrets and private guest records remain excluded. The earlier private-repository blocker to free GitHub Pages no longer applies. Publication itself is still a later task, separate from uploading source. See AGENTS.md for commit, push, branch and merge approval rules.

The site will remain online for some time after the event; its exact retirement date is unspecified. Changing a custom domain alone does not remove the default Pages address or backend access. A later retirement task must unpublish the site, restrict public backend access and decide retention/deletion of guest data. Domain purchase is not required.

Future freelance reuse means copying and adapting the code and structure for separate projects. A multi-customer platform, tenant management, billing and universal theme builder are out of scope. Each future project should have separate credentials and data; hosting suitability must be reassessed for commercial use.

## Source reconciliation

| Earlier material | Current decision |
| --- | --- |
| Home celebration; Abaya 89; city unknown | Church building, Astana, Abaya 88 |
| Guest photo album and possible wish attachments | Text-only wishes; event media in Telegram |
| Reservation secrecy from owner unresolved | Public availability; private names in separate admin table/database; owner voluntarily avoids them |
| Recognition and cancellation unresolved | Same-browser ownership; owner-assisted recovery |
| Editing attendance unresolved | No guest editing; contact owner |
| Hosting, stack and content management unknown | GitHub Pages preference, zero budget, dedicated admin interface; architecture recommendation in ARCHITECTURE.md |
| Old prototype popup stories and temporary in-tab state | Not production requirements; current structure and persistent backend take priority |

## Open inputs and implementation assumptions

Owner inputs still needed for launch: display name, contact link, confirmed route destination, Telegram invite, real photos and personal stories, gift catalog and images. The owner plans a references folder. These do not block the architecture. Do not invent personal facts or leave unlabeled fake records in production.

Technical defaults to validate during implementation: names up to 60 characters and wishes up to 1500 characters; newest wishes first with incremental loading; manual KZT/RUB rate with date; one current reservation per gift. These are recommendations, not interview decisions. Quantity of personal stories follows actual content; 8–10 was a suggestion, not a requirement. Exact storage quotas, browser compatibility matrix and image limits must be set when assets are available. The retirement date remains open.

## Launch acceptance

- Verify all four guest pages, direct links, contextual returns, real content and current venue details on phone and desktop.
- A submitted attendance response persists across clients and is visible only to the administrator.
- Wishes publish for other clients, survive reload, and allow only their author or administrator to edit; guest deletion after publication is not available.
- Own gift reservations survive reload in the same browser; another browser cannot cancel them or retrieve giver identities. Competing requests produce one reservation.
- Administrator access is enforced by backend permissions, not just a hidden URL. Editing content updates the guest view without code edits.
- Telegram link opens the correct group; no on-site guest media upload remains.
- Test keyboard use, focus, readable errors, preserved input after failures, loading/empty/success states and reduced motion.
- Verify deployment under the actual GitHub repository path, access from intended guest regions, free-tier readiness and owner handover. A successful build alone is insufficient.
