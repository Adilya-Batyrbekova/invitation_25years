# Typography dependency provenance

On 2026-10-29 the owner authorized replacing the previous SBOL adapter for public distribution. The application now uses the pinned npm package typograf 7.8.0, from https://github.com/typograf/typograf, under the MIT license. The previous vendor module and dictionaries are no longer included in the current source or build. Earlier Git revisions retain historical source; this task does not rewrite history.

The shared src/lib/typography.ts adapter runs locally, returns plain text, caches display results and disables telephone normalization to preserve meaningful content. It does not change user input while typing. All display copy continues through t(), P or Title. Typograf does not restore dictionary-based yo spellings; source copy must preserve intentional ё. No remote typography service is used.

The upstream MIT license is copied to public/licenses/Typograf-MIT.txt and included in every site build. Dependency version and integrity are retained in package-lock.json.
