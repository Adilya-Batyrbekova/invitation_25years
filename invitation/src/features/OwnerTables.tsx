import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Gift } from "../data/content";
import { t } from "../lib/typography";

export const tableSections = {
  attendance: "Ответы о присутствии",
  wishes: "Пожелания",
  reservations: "Бронирование подарков",
};

type TableSection = keyof typeof tableSections;
type TableRow = { id: string | number; name: string; value: string };
const pageSize = 50;

export function OwnerTables({
  client,
  section,
  gifts,
  published,
}: {
  client: SupabaseClient;
  section: TableSection;
  gifts: Gift[];
  published: boolean;
}) {
  const [rows, setRows] = useState<TableRow[]>();
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      if (section === "reservations") {
        if (!published)
          return gifts.map(({ id, name }) => ({
            id,
            name,
            value: "Каталог ещё не опубликован для бронирования",
          }));
        const { data, error } = await client.rpc("gift_reservation_status");
        if (error) throw error;
        const reserved = new Set(
          (data as { gift_id: number }[]).map(({ gift_id }) => gift_id),
        );
        return gifts.map(({ id, name }) => ({
          id,
          name,
          value: reserved.has(id) ? "Забронирован" : "Свободен",
        }));
      }
      const start = page * pageSize;
      if (section === "attendance") {
        const { data, error } = await client
          .from("attendance")
          .select("id,name,attending")
          .order("created_at", { ascending: false })
          .order("id")
          .range(start, start + pageSize);
        if (error) throw error;
        return data.map(({ id, name, attending }) => ({
          id,
          name,
          value: attending ? "Приду" : "Не приду",
        }));
      }
      const { data, error } = await client
        .from("wishes")
        .select("id,name,message")
        .order("created_at", { ascending: false })
        .order("id")
        .range(start, start + pageSize);
      if (error) throw error;
      return data.map(({ id, name, message }) => ({
        id,
        name,
        value: message,
      }));
    }
    void load().then(
      (data) => {
        if (!active) return;
        setRows(data);
        setError(false);
      },
      () => {
        if (active) setError(true);
      },
    );
    return () => {
      active = false;
    };
  }, [client, section, gifts, published, page, refresh]);

  const update = (nextPage: number) => {
    setRows(undefined);
    setError(false);
    setPage(nextPage);
    setRefresh((current) => current + 1);
  };

  return (
    <section>
      <h2>{t(tableSections[section])}</h2>
      <div className="owner-table-tools">
        <button type="button" onClick={() => update(0)}>
          {t("Обновить")}
        </button>
        {section !== "reservations" && page > 0 && (
          <button type="button" onClick={() => update(page - 1)}>
            {t("Предыдущая страница")}
          </button>
        )}
        {section !== "reservations" && (rows?.length ?? 0) > pageSize && (
          <button type="button" onClick={() => update(page + 1)}>
            {t("Следующая страница")}
          </button>
        )}
      </div>
      {error ? (
        <p role="alert">
          {t(
            section === "reservations"
              ? "Не удалось загрузить статусы брони. Проверьте, что миграция бронирования подключена."
              : "Не удалось загрузить данные. Нажмите «Обновить», чтобы повторить.",
          )}
        </p>
      ) : !rows ? (
        <p role="status">{t("Загружаем данные…")}</p>
      ) : !rows.length ? (
        <p>{t("Пока нет записей.")}</p>
      ) : (
        <div className="owner-table-scroll">
          <table className="owner-table">
            <thead>
              <tr>
                <th scope="col">
                  {t(section === "reservations" ? "Подарок" : "Имя")}
                </th>
                <th scope="col">
                  {t(
                    section === "attendance"
                      ? "Ответ"
                      : section === "wishes"
                        ? "Пожелание"
                        : "Статус",
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {(section === "reservations"
                ? rows
                : rows.slice(0, pageSize)
              ).map(({ id, name, value }) => (
                <tr key={id}>
                  <th scope="row">{t(name)}</th>
                  <td>{t(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
