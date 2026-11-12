import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import type { IncomingMessage } from "node:http";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { parseContent } from "./local-content.mjs";
import { publishSection } from "./publish-section.mjs";

async function readBody(request: IncomingMessage, limit: number) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new Error("Request is too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export function localEditor(): Plugin {
  return {
    name: "invitation-local-editor",
    apply: "serve",
    config: () => ({
      server: {
        host: "127.0.0.1",
        watch: { ignored: ["**/.local-content/**"] },
        fs: {
          deny: [
            ".env",
            ".env.*",
            "*.{crt,pem}",
            "**/.git/**",
            "**/.local-content/**",
          ],
        },
      },
    }),
    configureServer(server) {
      const folder = resolve(server.config.root, ".local-content");
      const draft = resolve(folder, "draft.json");
      const images = resolve(folder, "images");
      const publishEnabled = process.env.INVITATION_AUTO_PUBLISH === "1";
      const publications = new Map<string, string>();
      let publishing = false;
      server.middlewares.use(async (request, response, next) => {
        const path = request.url?.split("?")[0] ?? "";
        const image =
          /^\/editor-images\/([0-9a-f-]{36}\.(png|webp|jpeg))$/.exec(path);
        const api =
          path === "/__invitation-editor" ||
          path === "/__invitation-editor/image" ||
          path === "/__invitation-editor/publish";
        if (!image && !api) return next();
        const host = request.headers.host ?? "";
        const remote = request.socket.remoteAddress;
        const origin = request.headers.origin;
        if (
          (remote !== "127.0.0.1" &&
            remote !== "::1" &&
            remote !== "::ffff:127.0.0.1") ||
          !/^(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(host) ||
          (origin && origin !== "http://" + host) ||
          (api && request.headers["x-invitation-editor"] !== "1")
        ) {
          response.statusCode = 403;
          response.end();
          return;
        }
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("X-Content-Type-Options", "nosniff");
        try {
          if (image && request.method === "GET") {
            const bytes = await readFile(resolve(images, image[1]));
            response.setHeader("Content-Type", "image/" + image[2]);
            response.end(bytes);
            return;
          }
          response.setHeader("Content-Type", "application/json");
          const section = new URL(
            request.url ?? "/",
            "http://localhost",
          ).searchParams.get("section");
          if (
            path === "/__invitation-editor/publish" &&
            request.method === "GET"
          ) {
            response.end(
              JSON.stringify({
                enabled: publishEnabled,
                state: section && publications.get(section),
              }),
            );
          } else if (
            path === "/__invitation-editor" &&
            request.method === "GET"
          ) {
            const content = await readFile(draft, "utf8").catch(
              (error: NodeJS.ErrnoException) => {
                if (error.code === "ENOENT") return "null";
                throw error;
              },
            );
            response.end(content);
          } else if (
            path === "/__invitation-editor" &&
            request.method === "PUT"
          ) {
            const content = parseContent(
              (await readBody(request, 512 * 1024)).toString("utf8"),
            );
            await mkdir(folder, { recursive: true });
            const pending = resolve(folder, randomUUID() + ".tmp");
            await writeFile(pending, JSON.stringify(content, null, 2) + "\n", {
              flag: "wx",
            });
            await rename(pending, draft);
            let state = "local";

            if (
              publishEnabled &&
              (section === "ideas" || section === "personal")
            ) {
              if (publishing) {
                state = "busy";
              } else {
                state = "publishing";
                publishing = true;
                publications.set(section, state);
                void publishSection(
                  resolve(server.config.root, ".."),
                  folder,
                  content,
                  section,
                )
                  .then((result) => publications.set(section, result))
                  .catch(() => publications.set(section, "failed"))
                  .finally(() => {
                    publishing = false;
                  });
              }
            }
            response.end(JSON.stringify({ state }));
          } else if (path.endsWith("/image") && request.method === "POST") {
            const bytes = await readBody(request, 8 * 1024 * 1024);
            if (
              bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" ||
              bytes.length < 24 ||
              bytes.toString("ascii", 12, 16) !== "IHDR" ||
              bytes.readUInt32BE(16) < 1 ||
              bytes.readUInt32BE(16) > 1200 ||
              bytes.readUInt32BE(20) < 1 ||
              bytes.readUInt32BE(20) > 1200
            ) {
              throw new Error("Invalid image");
            }
            const name = randomUUID() + ".png";
            await mkdir(images, { recursive: true });
            await writeFile(resolve(images, name), bytes, { flag: "wx" });
            response.end(JSON.stringify({ path: "editor-images/" + name }));
          } else {
            response.statusCode = 405;
            response.end("{}");
          }
        } catch {
          if (image) return next();
          response.statusCode = 400;
          response.end("{}");
        }
      });
    },
  };
}
