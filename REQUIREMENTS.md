# Current requirements

Status: local guest-page design draft ready for owner review on 2026-10-29 following authorization on 2026-10-28; production backend and launch remain planned. This is the current English specification derived from the Russian source brief, structure, interviews and current design request. Direct owner decisions override historical source documents and technical assumptions. Original materials are preserved, not translated or overwritten.

## Product and confirmed scope

Create a personal electronic invitation for the owner's 25th birthday. Event: 2026-11-28, 14:00–18:00, church building at Abaya 89 (large hall), Astana; approximately 12–16 guests. The owner said to retain the stated time. This is not an apartment or a home venue. The complete initial project is due by 2026-11-18. Later content may be added when available.

All guest and administrator interface text is Russian. Communication is Russian; primary maintained Markdown is English. The owner explicitly requested a consolidated Russian reading guide, PROJECT-GUIDE-RU.md, as a language exception documented in AGENTS.md. One shared public link is sufficient, including for friends in Russia; they may also receive the wishlist link directly. No guest registration or identity confirmation is wanted. Search discovery is not wanted; configure noindex without claiming that it provides privacy. Anyone with the link can share it and access the public content.

The primary action is an individual attendance response. Gifts and bringing one flower are voluntary. No payments, shopping cart, collective purchases, food questionnaire or event schedule are included.

## Functional page structure

The source defines four guest pages. Keep their functional order; it does not approve their visual composition.

| Page | Purpose and content |
| --- | --- |
| Invitation | Banner dominated by «Мне 25!», a small invitation note and enlarged date ribbon; one compact date/venue section with full November 2026 calendar, the 28th highlighted, time, a single address note and route link; attendance form; voluntary flower and wishlist link; links to personal and memory pages; contact |
| «Это всё я» | Introduction, real personal facts and photographs, stories and preferences |
| «На память» | One introductory heading, text wish form beside the shared feed, and a compact Telegram group link for event media; no large plane illustration or repeated decorative section headings |
| Wishlist | Voluntary gift explanation, always-visible currency/category/price controls and ascending/descending price actions, gifts, details, reservation and cancellation |

Retain the source's interaction constraints: no guest header, navigation menu or footer; no banner action buttons, time or address in the banner; contextual floating «Приглашение» return from supplementary pages. Personal and memory pages return to personal links; wishlist returns to gifts. Return must work from direct entry and must not cover content or controls. Personal stories remain in the page flow rather than popups. A gift detail dialog is allowed. Personal entries use concise in-flow captions; the owner removed the extra story disclosures. The return action floats independently with no footer/dock fill or separate inner page scroller; leave only enough end clearance to reach the final content.

## Guest workflows

### Attendance

Collect a name and «Приду» / «Не приду». Each person answers for themselves. Guests do not edit submitted attendance; later changes are communicated directly to the owner. The administrator may correct mistaken records. Attendance is private to the administrator, not part of the public feed. A browser identity does not prove a unique person, so cross-device duplicate prevention cannot be guaranteed without a different access model.

### Wishes and Telegram

Collect name and plain text only. No attachments, on-site guest photo album, video upload or embedded Telegram feed. Publish immediately to all visitors with access. Authors may edit their own wishes from the same browser; after submission only the administrator deletes published content. Provide clear explanation of public visibility before submission. Feed order and pagination are technical decisions, not owner requirements.

Use a normal invitation link to a Telegram group for photos and videos of the event. The owner supplies the group and link. The proposed pinned group message should explain that the group is for event photos and videos. No Telegram bot, automated group management or content synchronization is included. Group creation and posting are outside this preparation task.

### Gifts

Public gift data: title, one or more images, original KZT price, category for filtering, full description, optional separate note, variants where applicable, shop link/store name and reservation availability. Catalogue cards do not display category labels. Use the reservation action to communicate availability: «Забронировать» for available gifts, grey disabled «Забронировано» for occupied gifts and «Твоя бронь» for ownership. Do not add a separate «Свободен» label. The backend must later enforce availability and own-cancellation rights; the draft does not claim saved reservations. Use equal-size rounded horizontal cards with an image on the left and grouped title, full description and price on the right. Keep small internal gaps and put unused space below this group; prices need not be forced to the same vertical coordinate. The entire card opens details; highlight it on hover without arrows. Place the secondary shop action on the left and the primary reservation action on the right, both below the content. Quick reservation collects the name inside the catalogue without requiring the details dialog. Opening that form must expand only the chosen card; every other card retains its closed height on desktop and mobile. Equal initial card sizes must not propagate reservation-form height across rows or neighbours. Opening details shows images, description, price, shop and reservation actions; only choosing «Забронировать» reveals the name/confirmation form. The name uses the muted placeholder «Твоё имя» and an accessible name, without a visible label or secrecy hint. Focus uses a quiet reinforced underline, not a thick enclosing frame, while forced-colour keyboard focus remains visible. When provided, additional photos are selectable and the optional owner note expands under «Подробнее» with a downward caret. Use ordinary Nunito for card/dialog titles. Do not expose giver names to other guests. A reservation stores the guest's name privately. Guests can cancel only their own reservations; simultaneous claims must yield exactly one success for a gift.

The owner accepted recognition in the same browser without registration. A different device or cleared browser shows general availability, not ownership. Recovery is through the owner. Do not use IP or a typed name as proof of ownership. No mandatory saved personal link is required.

The owner accepts that reservation names and gift associations exist in the database and a separate administrator section. This is voluntary surprise preservation, not technical concealment from the owner. Explain where these records live so the owner can avoid opening them.

The latest review replaces the icon/disclosure with an always-open filter block in normal document flow on desktop and mobile. Use only a top divider and no coloured panel. Include category/currency/upper-budget controls, inclusive lower-price tags such as «От 1 000 ₸» and «От 5 000 ₸», ascending/descending price arrows and reset. Scrolling must not hide or collapse controls. Source currency behavior: KZT by default, approximate RUB display, a conversion rate and date, category and budget filters, sorting and reset in the open strip. Use KZT if no valid exchange rate exists. No payment or automatic store price/stock synchronization. A manually maintained conversion rate is sufficient as a technical recommendation.

## Administrator workflows

Provide a protected administrator interface for editing site texts, personal stories, site photographs and gifts without code changes. Show attendance as a table with name and response. Keep a separate reservation table with guest name and a link to the selected gift. Allow correction of erroneous data and deletion of wishes. Google Sheets, CRM and external reporting integrations are unnecessary. Administrator sign-in through GitHub OAuth is the recommended implementation; guests remain registration-free. This is a technical recommendation rather than an owner-selected login provider.

Normal content administration must not require opening SQL, source code or the database dashboard. Editing content is different from redesigning layouts; the latter remains development work. No general page builder is required.

## Design status

An existing direction and visualization were developed in the chat «Создание концепции». Its latest image request uses concept 4, «Праздник от руки». The local candidate image is [Главная — непрерывное полотно.png](Главная%20—%20непрерывное%20полотно.png). The owner identifies the visualization as an approximate direction, not blanket approval of every detail.

On 2026-10-28 the owner requested implementation of concept 4 with Style 1 and Style 2 as the primary references. Their local paths remain in the references folder. The latest draft uses warm paper, lavender/lemon/blue accents, Great Vibes for accent text and Nunito for body copy. Great Vibes replaces the rejected Pacifico; these are provisional choices for review. The newer owner references override conflicting details. Preserve the continuous canvas, functional page order and wide desktop composition. Phone, tablet, 1920, 2560 and 3840 pixel layouts must preserve content.

The 2026-10-29 revisions request distinct coloured fields inspired by [the floral invitation](%D1%80%D0%B5%D1%84%D1%8B/Floral-blocks-reference.png), a viewport-sized envelope and an opaque rounded letter above its front edges. Disabled/opening state must not reduce the opacity of the envelope group; the rising flap and then the card cover the invitation line above. The door is replaced by an address note. The latest address is Astana, Abaya 89 (large hall), superseding Abaya 88. The guest address note shows «Абая, 89» and «Большой зал» without the city; Astana remains the confirmed city in event/map data. Calendar month and year share the script font. Remove the «Обведи этот день» caption while retaining the 28th highlight. Time text and its rounded yellow badge reveal together as one object, without independently staggered words. All visible paper notes and badges have soft rounded corners. There is no strict dress code; the owner wishes for a light, preferably plain top. Painted PNG chains and ornaments follow the [chain](%D1%80%D0%B5%D1%84%D1%8B/Paper-chain-reference.png), [streamer](%D1%80%D0%B5%D1%84%D1%8B/Streamer-reference.png) and [party-frame](%D1%80%D0%B5%D1%84%D1%8B/Party-frame-reference.png) examples. The painted butterfly with moving wings recurs in the hero and two selected lower sections (flowers and personal links), not every block; the bouquet drifts and an added sprig sways. Lower decorations have their own arrangement. Rounded buttons, aligned attendance choices and quiet personal links remain. Personal links and the direct contact link share the same curved SVG underline on hover/focus, with dash-offset motion like the calendar ring, and animate the arrow. All supplementary page tops use smaller paper chains. Remove the extra standalone star/heart/flower beside the supplementary introductory headings. Current mobile corrections use one top chain, shorter vertical gaps and undistorted square sprite cells. Remove the whole personal greeting/«Этот день — про нас» section and the generic home-atmosphere paragraph. Keep the date/venue composition compact enough for a desktop viewport. Shaped RSVP layers have a cream backing matching their top contour and covering the layer below after the yellow bottom edge. Shorten the flower invitation, retain the meaningful flower request, set «Самое главное — приходи» apart with a heart inside a complete rounded note, with no truncated oval ends, and make only «вишлист» inside the sentence a coloured link; no separate wishlist CTA.

The owner supplied [PieterKoopt](https://www.pieterkoopt.nl/) and [local animation notes](%D1%80%D0%B5%D1%84%D1%8B/Scroll-and-lettering-notes.txt). The combined date/venue card stays at full width while RSVP slides over it from below, reversing naturally on upward scroll. Never scale or fade stack-card roots. Personal story cards use the same opaque layered transition. RSVP has a paper-coloured backing that begins at exactly the yellow top wave and extends below it inside the stack bounds; no rectangular paper edge may rise above the wave or blue corner remain below it. Place its heart beside the question and keep the whole form/button inside the yellow area on phones. The scroll transition must reach a complete cover pose with no exposed blue field, then reverse on upward scroll. Disable stacking for reduced motion or cards taller than the viewport; keyboard focus must reveal covered controls. Wish-card stacking is prepared in the empty feed container, but real published wishes require the planned backend and must not be invented.

The latest owner review restores individual Great Vibes glyph rises with the earlier slower cadence (0.85 s rise and 0.045 s character stagger), showing filled glyphs immediately. No contour-first stage or fill tween remains. Reserve the script for main/section headings; use Nunito at appropriate weights for card titles, prices, supporting notes and personal preferences. Enlarge script accents relative to body text and tighten heading/subtitle spacing on all supplementary pages. Keep the hero title, invitation line and date ordered; replay on re-entry. Body text reveals word by word across all four pages. On downward entry, a visible heading finishes before its supporting copy; upward entry follows the elements encountered from below without waiting for an off-screen heading. Inline wishlist words belong to their paragraph reveal. Other actions and images reveal as they enter the viewport in either direction. Pictures fade as a whole rather than appearing in bands. Keep reduced-motion support. The cursor trail is one ribbon whose entire colour slowly interpolates through the concept palette. Music should attempt a quiet automatic start and retry on the first activation gesture if blocked. One button toggles audio, and a deliberate pause persists through other interactions during the current mount. There is no separate animation toggle; no reference music is copied.

All primary action buttons share one filled style with the subtle white inner edge; secondary actions share one quieter outlined style, including shop, group and return actions. Use Phosphor icons where needed. Process all current and future Russian display text through the locally integrated SBOL Typograph; preserve wording and source originals. Record the reusable rule in AGENTS.md. No DESIGN.md is created until the owner approves the visual result.

## Budget, lifespan and reuse

No paid services or subscriptions are authorized. Prefer GitHub Pages on its free address and a free managed backend. The owner wants no additional spending. Free services have quotas and operating limitations; zero-cost perpetual availability is not promised.

On 2026-10-28 the owner requested private storage again, superseding their temporary acceptance of public visibility. The existing repository `Adilya-Batyrbekova/invitation_25years` was changed to private and access was verified. Secrets and private guest records remain excluded from source history. GitHub Free cannot publish Pages directly from a private repository; resolve free site hosting before deployment without exposing source or buying a plan. Source visibility is separate from guest access to the eventual website. See AGENTS.md for commit, push, branch and merge approval rules.

The site will remain online for some time after the event; its exact retirement date is unspecified. Changing a custom domain alone does not remove the default Pages address or backend access. A later retirement task must unpublish the site, restrict public backend access and decide retention/deletion of guest data. Domain purchase is not required.

Future freelance reuse means copying and adapting the code and structure for separate projects. A multi-customer platform, tenant management, billing and universal theme builder are out of scope. Each future project should have separate credentials and data; hosting suitability must be reassessed for commercial use.

## Source reconciliation

| Earlier material | Current decision |
| --- | --- |
| Home celebration; city unknown; later church address Abaya 88 | Church building, Astana, Abaya 89 (large hall), corrected directly by the owner on 2026-10-29 |
| Guest photo album and possible wish attachments | Text-only wishes; event media in Telegram |
| Reservation secrecy from owner unresolved | Public availability; private names in separate admin table/database; owner voluntarily avoids them |
| Recognition and cancellation unresolved | Same-browser ownership; owner-assisted recovery |
| Editing attendance unresolved | No guest editing; contact owner |
| Hosting, stack and content management unknown | GitHub Pages preference, zero budget, dedicated admin interface; architecture recommendation in ARCHITECTURE.md |
| Old prototype popup stories and temporary in-tab state | Not production requirements; current structure and persistent backend take priority |

## Open inputs and implementation assumptions

Owner inputs still needed for launch: display name, confirmed route destination, Telegram invite, real photos and personal stories, gift catalog and images. The references folder is present and inspected. On 2026-10-28 the owner allowed provisional content and photo placeholders for design review, without technical placeholder disclaimers on the guest pages. `invitation/src/data/content.ts` contains a provisional gift catalogue; personal captions and preferences are provisional. These are not confirmed personal facts and must be replaced or removed before launch. Functional failure messages and public-wish privacy explanations remain necessary UI, not editorial disclaimers.

The local draft uses a 2GIS search for the confirmed street address; the exact entrance/destination is not verified. The contact link opens the owner-supplied https://t.me/ADelhi directly with ordinary text, without a contact dialog or script heading. The Telegram media-group destination is still missing, so its action retains a contextual dialog until supplied. No shop URLs, exchange rate, wish records, attendance records or reservations are invented. Submissions preserve entered data and return a failure instead of claiming persistence. Shared data and the protected administrator area remain outside this design-only implementation.

Technical defaults to validate during implementation: names up to 60 characters and wishes up to 1500 characters; newest wishes first with incremental loading; manual KZT/RUB rate with date; one current reservation per gift. These are recommendations, not interview decisions. Quantity of personal stories follows actual content; 8–10 was a suggestion, not a requirement. Exact storage quotas, browser compatibility matrix and image limits must be set when assets are available. The retirement date remains open.

On 2026-10-29 the owner authorized committing the reviewed local draft and integrating it into the existing repository main branch, and requested GitHub Pages publication. The source repository must remain private and the zero-budget rule remains in force. The owner reports GitHub Free or an unknown plan. A separate public build-only repository or another hosting destination requires explicit destination approval; no public-source conversion or paid upgrade is authorized. Public distribution also requires resolving the recorded SBOL Typograph license gap.

## Launch acceptance

- Verify all four guest pages, direct links, contextual returns, real content and current venue details on phone and desktop.
- A submitted attendance response persists across clients and is visible only to the administrator.
- Wishes publish for other clients, survive reload, and allow only their author or administrator to edit; guest deletion after publication is not available.
- Own gift reservations survive reload in the same browser; another browser cannot cancel them or retrieve giver identities. Competing requests produce one reservation.
- Administrator access is enforced by backend permissions, not just a hidden URL. Editing content updates the guest view without code edits.
- Telegram link opens the correct group; no on-site guest media upload remains.
- Test keyboard use, focus, readable errors, preserved input after failures, loading/empty/success states and reduced motion.
- Verify deployment under the actual GitHub repository path, access from intended guest regions, free-tier readiness and owner handover. A successful build alone is insufficient.
