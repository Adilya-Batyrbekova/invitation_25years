import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/caveat/cyrillic-400.css";
import "@fontsource/caveat/latin-400.css";
import "@fontsource/caveat/cyrillic-500.css";
import "@fontsource/caveat/latin-500.css";
import "@fontsource/golos-text/cyrillic-400.css";
import "@fontsource/golos-text/latin-400.css";
import "@fontsource/golos-text/cyrillic-500.css";
import "@fontsource/golos-text/latin-500.css";
import { App } from "./app/App";
import "./styles/site.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
