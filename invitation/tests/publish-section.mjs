import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { publishSection } from "../scripts/publish-section.mjs";

const fixture = await mkdtemp(join(tmpdir(), "invitation-publish-test-"));
const root = join(fixture, "source");
const remote = join(fixture, "remote");
const git = (cwd, ...args) =>
  execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8" }).trim();
await mkdir(root);
await mkdir(remote);
git(root, "init", "-b", "main");
git(remote, "init", "--bare", "-b", "main");
git(root, "config", "user.name", "Synthetic fixture");
git(root, "config", "user.email", "fixture@example.invalid");
git(root, "remote", "add", "origin", remote);
await mkdir(join(root, "invitation", "src", "data"), { recursive: true });
await writeFile(
  join(root, "invitation", "src", "data", "editorContent.ts"),
  "function readPublishedSection() {}\n",
);
await writeFile(join(root, "working-copy.txt"), "original\n");
git(
  root,
  "add",
  "--",
  "invitation/src/data/editorContent.ts",
  "working-copy.txt",
);
git(root, "commit", "-m", "fixture");
git(root, "push", "origin", "main");
const oldReader = git(root, "rev-parse", "HEAD");
await writeFile(join(root, "working-copy.txt"), "uncommitted\n");
const folder = join(root, ".local-content");
await mkdir(folder);
const content = {
  personal: { intro: "Private draft", stories: [] },
  ideas: { intro: "**Synthetic preference**", cards: [] },
  gifts: { items: [] },
};
const options = {
  remote: git(root, "remote", "get-url", "origin"),
  publicUrl: "https://example.invalid/",
  request: async (url) =>
    new Response(git(remote, "show", "main:invitation/public" + url.pathname)),
  attempts: 1,
  interval: 0,
};
await assert.rejects(publishSection(root, folder, content, "gifts", options));
await assert.rejects(
  publishSection(root, folder, content, "ideas", {
    ...options,
    remote: "wrong",
  }),
);
assert.equal(
  await publishSection(root, folder, content, "ideas", options),
  "upgrade",
);
assert.equal(git(remote, "rev-parse", "main"), oldReader);
await writeFile(
  join(root, "invitation", "src", "data", "editorContent.ts"),
  "function readPublishedSection() { normalizeIdeas(); }\n",
);
git(root, "add", "--", "invitation/src/data/editorContent.ts");
git(root, "commit", "-m", "compatible reader");
git(root, "push", "origin", "main");
const before = git(root, "rev-parse", "HEAD");
assert.equal(
  await publishSection(root, folder, content, "ideas", options),
  "live",
);
const after = git(remote, "rev-parse", "main");
assert.notEqual(after, before);
assert.equal(
  git(remote, "diff", "--name-only", before, after),
  "invitation/public/invitation-ideas.json",
);
assert.equal(git(root, "rev-parse", "HEAD"), before);
assert.match(git(root, "diff", "--", "working-copy.txt"), /uncommitted/);
assert.equal(
  await publishSection(root, folder, content, "ideas", options),
  "live",
);
assert.equal(git(remote, "rev-parse", "main"), after);
console.log(
  "Verified section-only publication, destination guard and repeat saves against an isolated Git remote.",
);
