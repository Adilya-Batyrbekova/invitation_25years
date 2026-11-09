import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { localEditor } from "./scripts/local-editor.ts";

export default defineConfig({ plugins: [react(), localEditor()], base: "./" });
