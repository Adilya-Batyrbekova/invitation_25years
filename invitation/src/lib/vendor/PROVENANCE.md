# SBOL Typograph local adapter

Source: https://github.com/DanilovM/SBOLTypographJS (master, fetched 2026-10-28).

The local module combines upstream `data/monthWeekday.js`, `noBreakSpace.js`, `phoneCodeRu.js`, `yo.js` and the `runTypograph` function from `scripts/sboltypograph.js`. The website UI, DOM dependencies and statistics display are excluded. The function is exported as an ES module. No text leaves the browser.

Telephone normalization, bank/brand spelling substitutions and forced lowercase are not invoked: they can change the owner's meaningful content. The upstream optional removal of a sentence's final period remains disabled. Punctuation, quotes, spacing, nonbreaking spaces, dictionary-based yo, dashes and numeric typography remain active. Source content remains in the content module; formatting happens on display through `t()` after each edit, including future data-driven copy. Never use the formatted string as HTML.

Upstream does not include a license file at the reviewed revision. This local design draft is not published; obtain a clear redistribution license or replace the dependency with an approved compatible implementation before public distribution. Retain upstream attribution and review new upstream changes before updating.
