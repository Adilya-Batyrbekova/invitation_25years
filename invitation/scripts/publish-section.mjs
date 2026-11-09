import { execFile } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { prepareContent } from "./prepare-content.mjs";

const run = promisify(execFile);
export const pages = "https://adilya-batyrbekova.github.io/invitation_25years/";
const destination =
  "https://github.com/Adilya-Batyrbekova/invitation_25years.git";

export async function publishSection(
  root,
  folder,
  content,
  section,
  {
    remote = destination,
    publicUrl = pages,
    request = fetch,
    attempts = 36,
    interval = 10000,
  } = {},
) {
  if (section !== "ideas" && section !== "personal")
    throw new Error("Invalid release section");
  const git = async (cwd, ...args) =>
    (
      await run(
        "git",
        [
          "-c",
          "safe.directory=" + root.replaceAll("\\", "/"),
          "-C",
          cwd,
          ...args,
        ],
        {
          env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
          timeout: 60000,
          windowsHide: true,
        },
      )
    ).stdout.trim();
  if (
    (await git(root, "remote", "get-url", "origin")) !== remote ||
    (await git(root, "remote", "get-url", "--push", "origin")) !== remote
  ) {
    throw new Error("Unexpected publication destination");
  }
  await git(root, "fetch", "--no-tags", "origin", "refs/heads/main");
  const base = await git(root, "rev-parse", "FETCH_HEAD");
  const checkout = await mkdtemp(join(folder, "pages-save-"));
  const snapshot = "invitation-" + section + ".json";
  let expected;
  await git(root, "worktree", "add", "--detach", checkout, base);
  try {
    // The deployed reader must understand both independent snapshots.
    const reader = await git(
      checkout,
      "show",
      "HEAD:invitation/src/data/editorContent.ts",
    );
    if (!reader.includes("readPublishedSection"))
      throw new Error("Pages reader is not installed");
    if (section === "ideas" && !reader.includes("normalizeIdeas"))
      return "upgrade";
    const output = pathToFileURL(join(checkout, "invitation", "public") + "/");
    const images = await prepareContent(content, {
      draft: pathToFileURL(folder + "/"),
      output,
      section,
      source: "https://dukdjygqsnjlsdiaqyir.supabase.co",
    });
    expected = await readFile(new URL(snapshot, output), "utf8");
    await git(
      checkout,
      "add",
      "--",
      ...[snapshot, ...images].map((file) => "invitation/public/" + file),
    );
    if (await git(checkout, "diff", "--cached", "--name-only")) {
      await git(checkout, "diff", "--cached", "--check");
      await git(
        checkout,
        "commit",
        "-m",
        "content: publish invitation " + section,
      );
      await git(checkout, "push", "origin", "HEAD:refs/heads/main");
    }
  } finally {
    await git(root, "worktree", "remove", "--force", checkout);
  }
  for (let i = 0; i < attempts; i++) {
    try {
      const url = new URL(snapshot, publicUrl);
      url.searchParams.set("check", String(Date.now()));
      const response = await request(url, {
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok && (await response.text()).trim() === expected.trim())
        return "live";
    } catch {
      // A transient network error does not change the saved draft or pushed commit.
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return "waiting";
}
