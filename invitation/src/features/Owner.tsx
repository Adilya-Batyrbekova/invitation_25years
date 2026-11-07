import { useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import { t } from "../lib/typography";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const client =
  url && key
    ? createClient(url, key, {
        auth: { storageKey: "invitation-owner", flowType: "pkce" },
      })
    : undefined;

type Attendance = { id: string; name: string; attending: boolean };

export default function Owner() {
  const [session, setSession] = useState<Session | null>();
  const [rows, setRows] = useState<Attendance[]>();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!client) return;
    const { data } = client.auth.onAuthStateChange((_event, value) => {
      setSession(value);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!client || !session || session.user.is_anonymous) return;
    let active = true;
    void client
      .from("attendance")
      .select("id,name,attending")
      .order("created_at", { ascending: false })
      .limit(100)
      .then((result) => {
        if (!active) return;
        setError(Boolean(result.error));
        setRows(result.data ?? undefined);
      });
    return () => {
      active = false;
    };
  }, [session]);

  return (
    <main className="section">
      <h1>{t("Админка приглашения")}</h1>
      {!client ? (
        <p>{t("Подключение к базе не настроено.")}</p>
      ) : session === undefined ? (
        <p role="status">{t("Проверяем вход…")}</p>
      ) : !session || session.user.is_anonymous ? (
        <button
          className="button"
          onClick={async () => {
            const { error } = await client.auth.signInWithOAuth({
              provider: "github",
              options: { redirectTo: location.origin + location.pathname },
            });
            setError(Boolean(error));
          }}
        >
          {t("Войти через GitHub")}
        </button>
      ) : (
        <>
          <button
            className="button"
            onClick={async () => {
              const { error } = await client.auth.signOut({ scope: "local" });
              setError(Boolean(error));
              if (!error) setRows(undefined);
            }}
          >
            {t("Выйти")}
          </button>
          <h2>{t("Ответы о присутствии")}</h2>
          <p>
            {t("Идентификатор для настройки доступа")}{" "}
            <code>{session.user.id}</code>
          </p>
          {rows?.length === 0 && (
            <p>
              {t(
                "Ответов пока нет или для этой учётной записи не выдан доступ.",
              )}
            </p>
          )}
          {Boolean(rows?.length) && (
            <table>
              <thead>
                <tr>
                  <th>{t("Имя")}</th>
                  <th>{t("Ответ")}</th>
                </tr>
              </thead>
              <tbody>
                {rows?.map((row) => (
                  <tr key={row.id}>
                    <td>{t(row.name)}</td>
                    <td>{t(row.attending ? "Приду" : "Не приду")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      {error && (
        <p role="alert">
          {t("Не получилось выполнить запрос. Попробуйте ещё раз.")}
        </p>
      )}
    </main>
  );
}
