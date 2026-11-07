import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/great-vibes/cyrillic-400.css";
import "@fontsource/great-vibes/latin-400.css";
import "@fontsource/nunito/cyrillic-400.css";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/cyrillic-600.css";
import "@fontsource/nunito/latin-600.css";
import { App } from "./app/App";
import "./styles/site.css";
const Owner =
  import.meta.env.DEV && location.pathname === "/owner"
    ? React.lazy(() => import("./features/Owner"))
    : undefined;
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {Owner ? (
      <React.Suspense>
        <Owner />
      </React.Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
