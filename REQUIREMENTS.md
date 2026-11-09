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
| Wishlist | Voluntary gift explanation, native currency/category/minimum/maximum price and ordering selects, visible on desktop and toggleable on mobile, gifts, details, reservation and cancellation |

Retain the source's interaction constraints: no guest header, navigation menu or footer; no banner action buttons, time or address in the banner; contextual floating «Приглашение» return from supplementary pages. Personal and memory pages return to personal links; wishlist returns to gifts. Return must work from direct entry and must not cover content or controls. Personal stories remain in the page flow rather than popups. A gift detail dialog is allowed. Personal entries use in-flow captions and mobile «Далее» disclosure for long stories, as requested in the latest October 30 review. The return action floats independently with no footer/dock fill or separate inner page scroller; leave only enough end clearance to reach the final content.

## Guest workflows

### Attendance

Collect a name and «Приду» / «Не приду». Each person answers for themselves. Guests do not edit submitted attendance; later changes are communicated directly to the owner. The administrator may correct mistaken records. Attendance is private to the administrator, not part of the public feed. A browser identity does not prove a unique person, so cross-device duplicate prevention cannot be guaranteed without a different access model.

### Wishes and Telegram

Collect name and plain text only. No attachments, on-site guest photo album, video upload or embedded Telegram feed. Publish immediately to all visitors with access. Authors may edit their own wishes from the same browser; after submission only the administrator deletes published content. Provide clear explanation of public visibility before submission. Feed order and pagination are technical decisions, not owner requirements.

Use a normal invitation link to a Telegram group for photos and videos of the event. The owner supplies the group and link. The proposed pinned group message should explain that the group is for event photos and videos. No Telegram bot, automated group management or content synchronization is included. Group creation and posting are outside this preparation task.

### Gifts

Public gift data: title, one or more images, original KZT price, category for filtering, full description, optional separate note, variants where applicable, shop link/store name and reservation availability. Catalogue cards do not display category labels. Use the reservation action to communicate availability: «Забронировать» for available gifts, grey disabled «Забронировано» for occupied gifts and «Твоя бронь» for ownership. Do not add a separate «Свободен» label. The backend must later enforce availability and own-cancellation rights; the draft does not claim saved reservations. Use equal-size rounded horizontal cards with an image on the left and grouped title, full description and price on the right. Keep small internal gaps and put unused space below this group; prices need not be forced to the same vertical coordinate. The entire card opens details; highlight it on hover without arrows. Place the secondary shop action on the left and the primary reservation action on the right, both below the content. Quick reservation collects the name inside the catalogue without requiring the details dialog. Opening that form must expand only the chosen card; every other card retains its closed height on desktop and mobile. Equal initial card sizes must not propagate reservation-form height across rows or neighbours. Opening details shows images, description, price, shop and reservation actions; only choosing «Забронировать» reveals the name/confirmation form. The name uses the muted placeholder «Твоё имя» and an accessible name, without a visible label or secrecy hint. Focus uses a quiet reinforced underline, not a thick enclosing frame, while forced-colour keyboard focus remains visible. When provided, additional photos are selectable and the optional owner note expands under «Подробнее» with a downward caret. Use ordinary Nunito for card/dialog titles. Do not expose giver names to other guests. A reservation stores the guest's name privately. Guests can cancel only their own reservations; simultaneous claims must yield exactly one success for a gift.

The owner accepted recognition in the same browser without registration. A different device or cleared browser shows general availability, not ownership. Recovery is through the owner. Do not use IP or a typed name as proof of ownership. No mandatory saved personal link is required.

The owner wants a private Telegram report listing active reservations by gift name and price. Giver names and ownership IDs remain private.

The latest October 30 review keeps desktop filters visible in normal flow and hides mobile filters behind a labelled toggle, using native dropdowns for category, currency, lower/upper budget and price order, plus reset. Remove preset price chips and arrow toggle buttons. Preserve filter semantics and currency fallback.

## Administrator workflows

Provide a local visual editor for site texts, personal stories, photographs and gifts. Provide owner-only Telegram reports for attendance names and responses, wish names and texts, and active bookings. Reports are read-only and omit giver names and ownership IDs. Guests remain registration-free and may edit their own wishes or cancel their own reservations through the site.

Normal content administration must not require opening SQL, source code or the database dashboard. Editing content is different from redesigning layouts; the latter remains development work. No general page builder is required.

## Design status

An existing direction and visualization were developed in the chat «Создание концепции». Its latest image request uses concept 4, «Праздник от руки». The local candidate image is [Главная — непрерывное полотно.png](Главная%20—%20непрерывное%20полотно.png). The owner identifies the visualization as an approximate direction, not blanket approval of every detail.

On 2026-10-28 the owner requested implementation of concept 4 with Style 1 and Style 2 as the primary references. Their local paths remain in the references folder. The latest draft uses warm paper, lavender/lemon/blue accents, Great Vibes for accent text and Nunito for body copy. Great Vibes replaces the rejected Pacifico; these are provisional choices for review. The newer owner references override conflicting details. Preserve the continuous canvas, functional page order and wide desktop composition. Phone, tablet, 1920, 2560 and 3840 pixel layouts must preserve content.

The 2026-10-29 revisions request distinct coloured fields inspired by [the floral invitation](%D1%80%D0%B5%D1%84%D1%8B/Floral-blocks-reference.png), a viewport-sized envelope and an opaque rounded letter above its front edges. Disabled/opening state must not reduce the opacity of the envelope group; the rising flap and then the card cover the invitation line above. The door is replaced by an address note. The latest address is Astana, Abaya 89 (large hall), superseding Abaya 88. The guest address note shows «Абая, 89» and «Большой зал» without the city; Astana remains the confirmed city in event/map data. Calendar month and year share the script font. Remove the «Обведи этот день» caption while retaining the 28th highlight. Time text and its soft organic yellow badge reveal together as one object, without independently staggered words. All visible paper notes and badges have soft rounded corners. There is no strict dress code; the owner wishes for a light, preferably plain top. Painted PNG chains and ornaments follow the [chain](%D1%80%D0%B5%D1%84%D1%8B/Paper-chain-reference.png), [streamer](%D1%80%D0%B5%D1%84%D1%8B/Streamer-reference.png) and [party-frame](%D1%80%D0%B5%D1%84%D1%8B/Party-frame-reference.png) examples. The painted butterfly with moving wings recurs in five scattered locations (hero, calendar, flowers, personal links and contact), across left, centre and right. Animate existing flower regions and candle flames without added sprigs or detached duplicated elements. Remove the decorative footer row. Rounded buttons, aligned attendance choices and quiet personal links remain. Personal links and the direct contact link share a visible curved SVG underline, redrawn on activation for touch feedback. Keep keyboard focus visible and bypass the brief internal-transition delay for reduced motion. The inline wishlist link has a thinner matching underline and slightly heavier text. The calendar 28 is enlarged with an animated ring, with a small decorative tape accent. Section boundaries use regular smooth waves inspired by the supplied reference; date/time/heart fields use neat rounded paper shapes with safe text padding. All supplementary page tops use smaller paper chains. Remove the extra standalone star/heart/flower beside the supplementary introductory headings. Current mobile corrections use one top chain, shorter vertical gaps and undistorted square sprite cells. Remove the whole personal greeting/«Этот день — про нас» section and the generic home-atmosphere paragraph. Keep the date/venue composition compact enough for a desktop viewport. Shaped RSVP layers have a cream backing matching their top contour and covering the layer below after the yellow bottom edge. Shorten the flower invitation, retain the meaningful flower request, set «Самое главное — приходи» apart with a heart inside a soft organic note inspired by the supplied October 30 silhouette, and make only «вишлист» inside the sentence a coloured link; no separate wishlist CTA.

The owner supplied [PieterKoopt](https://www.pieterkoopt.nl/) and [local animation notes](%D1%80%D0%B5%D1%84%D1%8B/Scroll-and-lettering-notes.txt). On desktop the combined date/venue card stays at full width while RSVP slides over it from below, reversing naturally on upward scroll. Never scale or fade stack-card roots. Personal story cards use the same opaque layered transition on desktop; mobile stories retain compact sticky overlays. RSVP has a paper-coloured backing that begins at exactly the yellow top wave and extends below it inside the stack bounds; no rectangular paper edge may rise above the wave or blue corner remain below it. Place its heart beside the question and keep the whole form/button inside the yellow area on phones. The scroll transition must reach a complete cover pose with no exposed blue field, then reverse on upward scroll. Disable stacking for reduced motion or cards taller than the viewport; keyboard focus must reveal covered controls. For design review, show 24 clearly identified synthetic wish examples of varied lengths; these are not submitted guest records. Real publication still requires the backend. Personal stories keep desktop vertical stacking, with compact sticky overlays on phones and each contains an independent cyclic horizontal photo fan with discreet captions and accessible controls.

The latest owner review restores individual Great Vibes glyph rises with the earlier slower cadence (0.6 s rise and 0.025 s character stagger), showing filled glyphs immediately. No contour-first stage or fill tween remains. Reserve the script for main/section headings; use Nunito at appropriate weights for card titles, prices, supporting notes and personal preferences. Enlarge script accents relative to body text and tighten heading/subtitle spacing on all supplementary pages. Keep the hero title, invitation line and date ordered; replay on re-entry. Ordinary body text reveals word by word across all four pages; text on a coloured note, date/time badge, preference note or wish card appears together with its complete surface and icon. On downward entry, a visible heading finishes before its supporting copy; upward entry follows the elements encountered from below without waiting for an off-screen heading. Inline wishlist words belong to their paragraph reveal. Other actions and images reveal as they enter the viewport in either direction. Pictures fade as a whole rather than appearing in bands. Keep reduced-motion support. The cursor trail is one ribbon whose entire colour slowly interpolates through the concept palette. Music should attempt a quiet automatic start and retry on the first activation gesture if blocked. One button toggles audio, and a deliberate pause persists through other interactions during the current mount. There is no separate animation toggle; no reference music is copied.

All primary action buttons share one filled style with the subtle white inner edge; secondary actions share one quieter outlined style, including shop, group and return actions. Use Phosphor icons where needed. Process all current and future Russian display text through the locally integrated Typograf; preserve wording and source originals. Record the reusable rule in AGENTS.md. No DESIGN.md is created until the owner approves the visual result.

## Budget, lifespan and reuse

No paid services or subscriptions are authorized. Prefer GitHub Pages on its free address and a free managed backend. The owner wants no additional spending. Free services have quotas and operating limitations; zero-cost perpetual availability is not promised.

On 2026-10-28 the owner requested private storage. On 2026-10-29 they explicitly superseded that decision and authorized public visibility of the existing Adilya-Batyrbekova/invitation_25years repository and free GitHub Pages publication. No separate repository or plan purchase is required. Secrets and private guest records remain excluded from all history. Public source/history visibility is distinct from access to the guest website. See AGENTS.md for commit, push, branch and merge approval rules.

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

The local draft uses a 2GIS search for the confirmed street address; the exact entrance/destination is not verified. The contact link opens the owner-supplied https://t.me/ADelhi directly with ordinary text, without a contact dialog or script heading. The Telegram media-group destination is still missing, so its action retains a contextual dialog until supplied. No shop URLs, exchange rate, live wish records, attendance records or reservations are invented. The owner explicitly authorized synthetic wish examples on October 30. Submissions preserve entered data and return a failure instead of claiming persistence. Shared data and the protected administrator area remain outside this design-only implementation.

Technical defaults to validate during implementation: names up to 60 characters and wishes up to 1500 characters; newest wishes first with incremental loading; manual KZT/RUB rate with date; one current reservation per gift. These are recommendations, not interview decisions. Quantity of personal stories follows actual content; 8–10 was a suggestion, not a requirement. Exact storage quotas, browser compatibility matrix and image limits must be set when assets are available. The retirement date remains open.

On 2026-10-29 the owner authorized committing and integrating the reviewed draft into main; commit 637c7d7 is now local and remote main. They subsequently explicitly authorized changing the existing repository to public and publishing the static draft using GitHub Pages. This supersedes the prior private-storage requirement. The zero-budget rule remains in force; no separate repository or paid upgrade is required. The owner also authorized replacing Typograf with MIT-licensed Typograf through the shared t() adapter, preserving meaningful copy. The static draft was published successfully from 8fffcd2 to https://adilya-batyrbekova.github.io/invitation_25years/ and remotely checked at phone/desktop widths. This is a design preview, not completion of the backend-dependent launch acceptance below.

## Launch acceptance

- Verify all four guest pages, direct links, contextual returns, real content and current venue details on phone and desktop.
- A submitted attendance response persists across clients and is visible only to the administrator.
- Wishes publish for other clients, survive reload, and allow only their author or administrator to edit; guest deletion after publication is not available.
- Own gift reservations survive reload in the same browser; another browser cannot cancel them or retrieve giver identities. Competing requests produce one reservation.
- Administrator access is enforced by backend permissions, not just a hidden URL. Editing content updates the guest view without code edits.
- Telegram link opens the correct group; no on-site guest media upload remains.
- Test keyboard use, focus, readable errors, preserved input after failures, loading/empty/success states and reduced motion.
- Verify deployment under the actual GitHub repository path, access from intended guest regions, free-tier readiness and owner handover. A successful build alone is insufficient.


The second October 30 review restores hover underline drawing and the calendar ring. Entire inline wishlist copy, navigation papers and preference surfaces reveal together; preferences stagger as complete cards. Flower artwork has no scroll parallax. Desktop wishes scroll inside a bounded, keyboard-focusable region; mobile shows eight per batch with a load-more control until exhausted (24 synthetic samples). The submit action says «Отправить». Filters start collapsed on mobile and desktop. Personal galleries preview three square sample illustrations with discreet dot controls, swipes and a 1–5 image interface; owner photographs remain pending. Personal and gift images, including gift details, use square contain-fit areas. Planned admin upload contract: 1–5 square personal photos per entry, at most 1200×1200 pixels; validate dimensions/count in the future backend and preserve aspect ratio rather than cropping. No administrator or upload service is implemented here. Venue styling uses a clean address paper, tape detail and no colour swatches; the later owner correction restores only a light, preferably plain top, without colour swatches or a black-clothing restriction. The envelope flap uses a rounded SVG mask. Butterfly portal layers track document positions without section clipping; only viewport edges may clip them.


Latest October 30 reading correction: gentle idle art hovering returns alongside stronger regional flower sway; no flower-section scroll parallax. Appearance is faster (0.6 s script rise, 0.025 s glyph stagger, 0.42 s body rise). Flower copy and personal navigation reveal once in visual order; inline wishlist underline draws with its paragraph. Important notes use broad shallow waves with safe text padding. Calendar ring is positioned relative to its day cell; mobile chains stay inside the viewport top. Desktop stacks retain reading travel; mobile venue/RSVP and personal stories retain compact sticky overlays. Mobile stories use content-sized heights, varied sample lengths and full descriptions without «Далее» controls. The load-more action is small, centred and unfilled, separated from the last wish; the demo-introduction sentence is removed. Telegram remains in document flow and is excluded from stale window-based reveal state after appended batches. Sample author labels still identify synthetic wishes. Dress copy is «Моё пожелание — светлый, желательно однотонный верх.»; colour hearts and the black-clothing instruction are removed.


The owner clarification preserves mobile scroll overlays. Do not disable mobile stacking to remove whitespace. Mobile stories remain content-sized with 24 px gaps. The flower section is outside the shared venue/RSVP stack and cannot cover the form. Tall cards and reduced motion retain their existing flow fallback; cards taller than the viewport use ordinary flow for reading.


The owner superseded the flower overlay on 2026-11-05. Keep the flower section outside the shared venue/RSVP stack so the entire form remains usable.


The wishlist has separate preferences and catalogue views. Categories use buttons and the remaining filters sit behind a disclosure on both screen sizes. Personal stories show their complete descriptions without expansion controls.


Wishlist categories support multiple selections combined by union. Sorting by name or price is separate. The filter disclosure contains currency radios and bounded budget sliders. Preferences preview a zoomable collage, expandable book lists and a gallery using sample artwork. Real references and admin editing remain planned. Bouquet drift runs on the inner illustration independently of its entrance.


Personal stories use content-sized cards and show their full text without expansion controls. A shared price track presents two native range handles with independent accessible labels. The preferences dashboard has an interior carousel and softly indicated book disclosures. Guest-facing sample notices were removed at the owner’s request; underlying sample data remains provisional.

The wishlist filter uses a responsive grid and reserves a separate row for the currency fallback notice. Preference cards sit independently, and their image viewer closes on backdrop click. Invitation sections share a regular scallop pattern. The flower section follows RSVP in normal flow; the personal-links section has mirrored top and bottom scallops over an opaque paper backing.

The owner requested four personal stories with alternating long and short descriptions shown in full and horizontal photos that rotate every three seconds. This supersedes the previous expandable story interaction. The invitation stack approach remains a reversible visual trial.

Use the flower section's scallop silhouette on the colored invitation sections. Preserve the lilac personal-links surface and the layered personal photo decks. Only the foreground story rotates automatically. Both guest submission buttons use purple flight feedback during the pending state.

The owner authorized an explicitly labeled simulated submission for previewing the plane animation. This mode reports a preview completion and does not imply persistence.

Ordinary text and block reveals play once per page entry. Only the invitation hero title replays on returning upward. The reference card effect uses GSAP scale 0.7 and a 40-degree X rotation; outgoing layers additionally fit shorter successors. Venue and RSVP surfaces use CSS masks for their four scalloped edges; the legacy SVG is hidden. Preview submission includes a decorative plane and purple trail.

On 2026-11-05 the owner requested scalloped edges on all four sides of the venue and RSVP surfaces, a solid flower section outside the stack, filled controls without decorative outlines, filter left and sort right, three-second visible wishlist carousels, and shared plane feedback for reservation submission. Keyboard focus outlines remain available.

Music starts disabled. A native modal dialog on the envelope offers explicit enable/disable choices; the mounted Atmosphere component preserves that choice during route navigation until the guest toggles it. Melody and bass gains are 0.070 and 0.025; the first note starts immediately after AudioContext.resume resolves. Wishlist tabs and category chips retain their outlined appearance; filter and sort remain at opposite edges.

The RSVP answer deadline is November 24, 2026. Submission labels are shortened to «Отправить» and reservation confirmation to «Подтвердить». The owner reverted the global #d9bfe4 / #fceff8 button treatment. Buttons, tabs and category chips use their preceding styles.


On 2026-11-06 the owner requested quieter focus feedback throughout the guest interface, no initially emphasized music choice, and a sorting popup anchored to the right that opens toward the left without crossing the viewport. Keep keyboard focus visible: a thin muted lilac contour replaces the thick dark ring. The music prompt initially focuses its question, with Tab moving to the choices. Guest name forms request autocomplete off to reduce saved-data suggestions; browser-owned keyboard/accessory UI is outside site styling control and requires Android hardware confirmation. The owner authorized committing, pushing to the existing repository and updating GitHub Pages for this correction.


## Integration status

The task branch implements the configured Supabase paths for attendance and wishes. The production Pages build at fe858f4 is connected to Supabase for attendance and wishes. Public feed retrieval was verified on the deployed site. The local owner access screen starts GitHub sign-in and can read attendance once membership is provisioned. End-to-end owner verification, live reservations, content editing, image uploads and regional verification remain pending.


## Owner content editing scope

The editor covers the personal introduction, ordered story cards and their images, and personal preference notes. The wishlist preferences view exposes the interior text and gallery, book lists, and cup collection. The gift catalogue exposes its introduction and editable gift details, category, price, shop link and images. The local owner interface and guest read paths are implemented on the editor branch. The hosted migration was applied and the public content endpoint returned HTTP 200. The guest reader was published in Pages commit d8c59a9. The live personal page displays the owner-saved content, and both wishlist content reads returned HTTP 200. Owner acceptance of the complete editing workflow remains open.


The local editor works with content files for reviewed GitHub Pages publication. It supports crop preview, position, zoom and lossless PNG output up to 1200 pixels on the longest side. A switch controls the personal-page link. The owner-only read-only Telegram handler covers attendance, wishes and active bookings. Notification preferences and hosted bot acceptance remain open. Guest submissions, wish edits and booking changes remain in Supabase.

Each gift keeps its existing ID across title, price, image and ordering changes. A new gift gets a new ID. A removed gift cannot receive new bookings, and its existing booking remains associated with its original ID. The registry migration is prepared locally. Local preparation generates a registry synchronization transaction. Hosted migration, application of the registry transaction and publication remain pending.
