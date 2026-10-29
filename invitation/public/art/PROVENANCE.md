# Illustration provenance

`celebration.webp` and `bouquet.webp` were generated for this draft using OpenAI image generation on 2026-10-28, then resized to at most 1400 pixels wide and converted to WebP with Sharp. They are local assets, not downloads from the reference websites.

The art direction follows the owner's supplied Style 1 / Style 2 references: transparent-background painted paper illustrations, a lavender birthday cake, loose flowers, lemon accents and soft watercolor/gouache edges. The second illustration is a separate loose bouquet in a vase. No guest photographs or private portrait source images were used.

The illustrations are provisional. Generated PNGs now supply chains, painted ornaments, the butterfly and an added flower sprig. CSS/SVG supply the address note, calendar markings, hand-drawn arrows and gift sketches. Quiet background audio with a browser gesture fallback is an original Web Audio sine-note sketch in `src/components/Atmosphere.tsx`; no music from a reference website is bundled.

## Painted assets generated on 2026-10-29

The built-in `image_gen` tool generated these project assets with `transparent_background: true`; no API/CLI fallback was used. They were resized with Pillow/Lanczos and saved as optimized RGBA PNGs, preserving alpha. Originals remain in the Codex generated-images folder. Reference images guide style only; their surrounding screenshot UI and text are not site content.

| Local asset | Dimensions | Use |
| --- | --- | --- |
| `paper-garland.png` | 1599 × 533 | Two painted chains at the top, with gentle independent sway |
| `painted-confetti.png` | 900 × 600 | A 3 × 2 sprite sheet: streamer, star, heart, ribbon, yellow flower, lilac flower |
| `painted-butterfly.png` | 320 × 256 | Two CSS background halves, hinged at the body |
| `flower-sprig.png` | 400 × 600 | Separate swaying flowers over the existing bouquet |

The owner's new references are preserved in `рефы/Paper-chain-reference.png`, `рефы/Streamer-reference.png` and `рефы/Party-frame-reference.png`. The lower ornaments use a separate arrangement, not an inverted chain. Source artwork is not a set of independently rigged original flower heads; the additional sprig provides the visible local motion.

## Great Vibes vector lettering

`src/data/lettering.ts` is prepared from the installed Fontsource Great Vibes Latin/Cyrillic WOFF files by `scripts/build-lettering.mjs`, using development-only `opentype.js`. It includes 171 glyphs covering the Russian alphabet, basic Latin and punctuation; unsupported characters render as ordinary text. Advance widths and actual glyph outlines preserve proportions. SVG paths draw their contours and then fill while the character rises. Font contours do not encode the original pen-stroke order of a calligrapher.

The original Great Vibes license and copyright notices are retained in `Great-Vibes-OFL.txt`. No path data or animation from the PieterKoopt signature is copied into the application. The owner's original notes are preserved in `рефы/Scroll-and-lettering-notes.txt` as reference material only.

### Final generation prompts

**paper-garland.png**

Use case: illustration-story. Create a transparent PNG website decoration: a richly painted handmade PAPER CHAIN garland in lavender lilac, pale sky blue and buttery lemon yellow. Long horizontal composition, 3 shallow hanging arcs of interlocked paper loops across the width, natural folded paper overlapping, visible gouache brush texture, irregular pale highlights and delicate painted shadows on the paper itself. Loose yellow and purple crayon stars near the ends, warm festive children's handmade birthday invitation style, sophisticated tactile illustration, airy. Isolated transparent background, NO cream rectangle, NO text, NO bows, no vector strokes. Widescreen composition around 3:1.

**painted-confetti.png**

Use case: illustration-story. Transparent PNG decorative sticker sheet for a hand-painted birthday invitation. Six generously separated painted ornaments in a 3 columns by 2 rows grid, each occupying its own equal cell with transparent space between, no overlap: top left lavender curled paper streamer; top middle lemon yellow scribbled five-point star; top right lavender scribbled heart; bottom left blue and lavender paper ribbon curl; bottom middle lemon yellow four-petal loose flower; bottom right lilac flower with a yellow center. Rich gouache drybrush and colored pencil texture, handmade watercolor paper craft aesthetic, delicate highlights, irregular joyful marks. Palette lavender lilac, buttery yellow and soft sky blue. Truly transparent backdrop, no paper background, no text, no grid lines.

**painted-butterfly.png**

Use case: illustration-story. Single small beautiful hand-painted butterfly, top view with both wings fully open, bilaterally symmetrical with its thin plum body vertical centered exactly on image center. Four gracefully shaped scalloped wings, upper pair lavender and pale lilac, lower pair buttery lemon with blue and purple watercolor flecks, slender antennae. Delicate gouache and colored pencil brush texture, like an illustration on a handmade birthday invitation. Isolated on fully transparent PNG background, all wing tips fit with generous transparent margins, no flowers, no letters, no other objects.

**flower-sprig.png**

Use case: illustration-story. Single delicate small sprig with three lavender crocus-like flowers, one pale yellow daisy and slender sage green stems gathered at bottom center, airy gouache watercolor hand-painted birthday invitation style with softly textured brush edges. Tall narrow composition, on fully transparent PNG background. No vase, no paper background, no text. Lavender, lilac, pale yellow, muted green, compatible with a lavender vase bouquet illustration.
