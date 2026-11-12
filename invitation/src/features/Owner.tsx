import { t } from "../lib/typography";
import { ContentEditor } from "./ContentEditor";
import "../styles/owner.css";

export default function Owner() {
  return (
    <main className="owner-app">
      <h1>{t("Редактор приглашения")}</h1>
      <ContentEditor />
    </main>
  );
}
