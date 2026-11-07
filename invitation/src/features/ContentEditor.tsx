import { useEffect, useId, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { defaults, type EditorContent } from "../data/editorContent";
import { t } from "../lib/typography";

const sections = {
  personal: "Это всё я",
  ideas: "Что мне нравится",
  gifts: "Вишлист",
};

function Text({
  label,
  value,
  change,
  long = false,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  long?: boolean;
}) {
  return (
    <label>
      {t(label)}
      {long ? (
        <textarea
          value={value}
          maxLength={4000}
          onChange={(e) => change(e.target.value)}
        />
      ) : (
        <input
          value={value}
          maxLength={300}
          onChange={(e) => change(e.target.value)}
        />
      )}
    </label>
  );
}

function Order({
  index,
  count,
  move,
  remove,
}: {
  index: number;
  count: number;
  move: (to: number) => void;
  remove: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        disabled={index === 0}
        onClick={() => move(index - 1)}
      >
        {t("Выше")}
      </button>{" "}
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => move(index + 1)}
      >
        {t("Ниже")}
      </button>{" "}
      <button type="button" onClick={remove}>
        {t("Убрать")}
      </button>
    </div>
  );
}

function List<T>({
  items,
  change,
  create,
  render,
  title,
  label,
}: {
  items: T[];
  change: (items: T[]) => void;
  create: () => T;
  render: (item: T, change: (item: T) => void) => React.ReactNode;
  label: string;
  title: (item: T) => string;
}) {
  const group = useId();
  const [added, setAdded] = useState<number>();
  return (
    <div className="owner-records">
      {items.map((item, index) => (
        <details
          className="owner-record"
          key={index}
          name={group}
          open={index === added || undefined}
        >
          <summary>{t(title(item) || label + " " + (index + 1))}</summary>
          <div className="owner-record-fields">
            {render(item, (value) =>
              change(items.map((entry, i) => (i === index ? value : entry))),
            )}
            <Order
              index={index}
              count={items.length}
              remove={() => change(items.filter((_, i) => i !== index))}
              move={(to) => {
                const next = [...items];
                [next[index], next[to]] = [next[to], next[index]];
                change(next);
              }}
            />
          </div>
        </details>
      ))}
      <button
        type="button"
        disabled={items.length >= 30}
        onClick={() => {
          setAdded(items.length);
          change([...items, create()]);
        }}
      >
        {t("Добавить запись")}
      </button>
    </div>
  );
}

function Photos({
  client,
  photos,
  change,
  square = false,
  pending,
}: {
  client: SupabaseClient;
  photos: string[];
  change: (photos: string[]) => void;
  square?: boolean;
  pending: (value: boolean) => void;
}) {
  const [error, setError] = useState("");
  return (
    <fieldset>
      <legend>{t("Фотографии")}</legend>
      {photos.map((src, index) => (
        <div key={index}>
          <img
            src={src}
            width={84}
            height={84}
            style={{ objectFit: "contain" }}
            alt={t("Фото " + (index + 1))}
          />
          <Order
            index={index}
            count={photos.length}
            remove={() => change(photos.filter((_, i) => i !== index))}
            move={(to) => {
              const next = [...photos];
              [next[index], next[to]] = [next[to], next[index]];
              change(next);
            }}
          />
        </div>
      ))}
      <label>
        {t("Загрузить фотографию")}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={photos.length >= 5}
          onChange={async (event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (!file) return;
            setError("");
            pending(true);
            try {
              if (
                file.size > 2097152 ||
                !["image/jpeg", "image/png", "image/webp"].includes(file.type)
              ) {
                setError("Выберите JPEG, PNG или WebP размером до 2 МБ.");
                return;
              }
              const image = await createImageBitmap(file);
              const { width, height } = image;
              image.close();
              if (
                width > 1200 ||
                height > 1200 ||
                (square && width !== height)
              ) {
                setError(
                  square
                    ? "Для истории нужна квадратная фотография до 1200 × 1200."
                    : "Размер фотографии — до 1200 × 1200.",
                );
                return;
              }
              const extension = file.type.split("/")[1];
              const bucket = client.storage.from("invitation-images");
              const { data, error } = await bucket.upload(
                crypto.randomUUID() + "." + extension,
                file,
              );
              if (error) throw error;
              change([
                ...photos,
                bucket.getPublicUrl(data.path).data.publicUrl,
              ]);
            } catch {
              setError("Не удалось загрузить фотографию. Попробуйте ещё раз.");
            } finally {
              pending(false);
            }
          }}
        />
      </label>
      {error && <p role="alert">{t(error)}</p>}
    </fieldset>
  );
}

function Pairs({
  items,
  change,
}: {
  items: { label: string; value: string }[];
  change: (items: { label: string; value: string }[]) => void;
}) {
  return (
    <List
      items={items}
      change={change}
      create={() => ({ label: "", value: "" })}
      label="Пункт"
      title={(item) => item.label}
      render={(item, set) => (
        <>
          <Text
            label="Заголовок"
            value={item.label}
            change={(label) => set({ ...item, label })}
          />
          <Text
            label="Текст"
            value={item.value}
            change={(value) => set({ ...item, value })}
            long
          />
        </>
      )}
    />
  );
}

const samplePhotos = [
  "art/celebration.webp",
  "art/bouquet.webp",
  "art/painted-butterfly.png",
];

export function ContentEditor({ client }: { client: SupabaseClient }) {
  const [content, setContent] = useState<EditorContent>();
  const [section, setSection] = useState<keyof EditorContent>("personal");
  const [panel, setPanel] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    void client
      .from("invitation_content")
      .select("section,body")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setMessage(
            "Не удалось загрузить редактор. Проверьте, что миграция применена.",
          );
          return;
        }
        setMessage("");
        const next = { ...defaults };
        for (const row of data) {
          if (row.section in defaults)
            Object.assign(next, { [row.section]: row.body });
        }
        setContent(next);
      });
    return () => {
      active = false;
    };
  }, [client, retry]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!content)
    return (
      <div role="status">
        {t(message || "Загружаем редактор…")}
        {message && (
          <button type="button" onClick={() => setRetry(retry + 1)}>
            {t("Повторить")}
          </button>
        )}
      </div>
    );

  function edit<K extends keyof EditorContent>(
    key: K,
    value: EditorContent[K],
  ) {
    setContent((current) => current && { ...current, [key]: value });
    setDirty(true);
    setMessage("");
  }
  const { personal, ideas, gifts } = content;
  const photoProps = { client, pending: setBusy };
  return (
    <section className="owner-editor">
      <aside className="owner-sidebar">
        <nav aria-label={t("Разделы редактора")}>
          <button
            type="button"
            aria-current={panel ? "page" : undefined}
            disabled={busy || dirty}
            onClick={() => {
              setPanel(true);
              setMessage("");
            }}
          >
            {t("Панель")}
          </button>
          <h3>{t("Содержимое")}</h3>
          {Object.entries(sections).map(([key, label]) => (
            <button
              type="button"
              key={key}
              aria-current={!panel && section === key ? "page" : undefined}
              disabled={busy || dirty}
              onClick={() => {
                setSection(key as keyof EditorContent);
                setPanel(false);
                setMessage("");
              }}
            >
              {t(label)}
            </button>
          ))}
        </nav>
      </aside>
      <div className="owner-workspace">
        {panel ? (
          <>
            <h2>{t("Панель")}</h2>
            <p>{t("Выберите, что хотите изменить на сайте.")}</p>
            <div className="owner-panel-links">
              {Object.entries(sections).map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => {
                    setSection(key as keyof EditorContent);
                    setPanel(false);
                  }}
                >
                  {t(label)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2>{t(sections[section])}</h2>
            <fieldset className="owner-form-frame" disabled={busy}>
              {dirty && (
                <p role="status">{t("Есть несохранённые изменения.")}</p>
              )}
              <form
                key={section}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  try {
                    const { error } = await client
                      .from("invitation_content")
                      .upsert({ section, body: content[section] });
                    if (error) throw error;
                    setDirty(false);
                    setMessage(
                      "Изменения сохранены. Они появятся на гостевой странице после обновления.",
                    );
                  } catch {
                    setMessage(
                      "Сохранить не удалось. Введённые изменения остались в редакторе.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Text
                  label="Вступление"
                  value={content[section].intro}
                  long
                  change={(intro) => {
                    setContent({
                      ...content,
                      [section]: { ...content[section], intro },
                    });
                    setDirty(true);
                    setMessage("");
                  }}
                />
                {section === "personal" && (
                  <>
                    <List
                      items={personal.stories}
                      change={(stories) =>
                        edit("personal", { ...personal, stories })
                      }
                      create={() => ({
                        id: Date.now(),
                        title: "",
                        label: "Фотография",
                        description: "",
                        photos: [],
                      })}
                      label="История"
                      title={(item) => item.title}
                      render={(item, set) => (
                        <>
                          <Text
                            label="Заголовок"
                            value={item.title}
                            change={(title) => set({ ...item, title })}
                          />
                          <Text
                            label="Описание фотографии"
                            value={item.label}
                            change={(label) => set({ ...item, label })}
                          />
                          <Text
                            label="Текст истории"
                            value={item.description}
                            change={(description) =>
                              set({ ...item, description })
                            }
                            long
                          />
                          <Photos
                            {...photoProps}
                            square
                            photos={item.photos ?? samplePhotos}
                            change={(photos) => set({ ...item, photos })}
                          />
                        </>
                      )}
                    />
                    <h3>{t("Маленькие предпочтения")}</h3>
                    <Pairs
                      items={personal.preferences}
                      change={(preferences) =>
                        edit("personal", { ...personal, preferences })
                      }
                    />
                  </>
                )}
                {section === "ideas" && (
                  <>
                    <Text
                      label="Заголовок блока интерьера"
                      value={ideas.interiorTitle}
                      change={(interiorTitle) =>
                        edit("ideas", { ...ideas, interiorTitle })
                      }
                    />
                    <Text
                      label="Текст о дизайне интерьера"
                      value={ideas.interiorText}
                      change={(interiorText) =>
                        edit("ideas", { ...ideas, interiorText })
                      }
                      long
                    />
                    <Photos
                      {...photoProps}
                      photos={ideas.interiorPhotos}
                      change={(interiorPhotos) =>
                        edit("ideas", { ...ideas, interiorPhotos })
                      }
                    />
                    <Text
                      label="Заголовок блока о книгах"
                      value={ideas.booksTitle}
                      change={(booksTitle) =>
                        edit("ideas", { ...ideas, booksTitle })
                      }
                    />
                    <Pairs
                      items={ideas.books}
                      change={(books) => edit("ideas", { ...ideas, books })}
                    />
                    <Text
                      label="Заголовок блока о кружках"
                      value={ideas.cupsTitle}
                      change={(cupsTitle) =>
                        edit("ideas", { ...ideas, cupsTitle })
                      }
                    />
                    <Text
                      label="Текст о кружках"
                      value={ideas.cupsText}
                      change={(cupsText) =>
                        edit("ideas", { ...ideas, cupsText })
                      }
                      long
                    />
                    <Photos
                      {...photoProps}
                      photos={ideas.cupsPhotos ?? samplePhotos}
                      change={(cupsPhotos) =>
                        edit("ideas", { ...ideas, cupsPhotos })
                      }
                    />
                  </>
                )}
                {section === "gifts" && (
                  <List<EditorContent["gifts"]["items"][number]>
                    items={gifts.items}
                    change={(items) => edit("gifts", { ...gifts, items })}
                    create={() => ({
                      id: Date.now(),
                      name: "",
                      category: "",
                      price: 0,
                      description: "",
                      availability: "available",
                      shape: "vase",
                    })}
                    label="Подарок"
                    title={(item) => item.name}
                    render={(item, set) => (
                      <>
                        <Text
                          label="Название"
                          value={item.name}
                          change={(name) => set({ ...item, name })}
                        />
                        <Text
                          label="Категория"
                          value={item.category}
                          change={(category) => set({ ...item, category })}
                        />
                        <label>
                          {t("Цена в тенге")}
                          <input
                            type="number"
                            min={0}
                            max={100000000}
                            required
                            value={item.price}
                            onChange={(e) =>
                              set({ ...item, price: Number(e.target.value) })
                            }
                          />
                        </label>
                        <Text
                          label="Описание"
                          value={item.description}
                          change={(description) =>
                            set({ ...item, description })
                          }
                          long
                        />
                        <Text
                          label="Дополнительная заметка"
                          value={item.note ?? ""}
                          change={(note) => set({ ...item, note })}
                          long
                        />
                        <Text
                          label="Название магазина"
                          value={item.shop?.name ?? ""}
                          change={(name) =>
                            set({
                              ...item,
                              shop: { name, url: item.shop?.url ?? "" },
                            })
                          }
                        />
                        <label>
                          {t("Ссылка на магазин")}
                          <input
                            type="url"
                            pattern="https?://.+"
                            value={item.shop?.url ?? ""}
                            onChange={(e) =>
                              set({
                                ...item,
                                shop: {
                                  name: item.shop?.name ?? "",
                                  url: e.target.value,
                                },
                              })
                            }
                          />
                        </label>
                        <Photos
                          {...photoProps}
                          photos={item.images?.map(({ src }) => src) ?? []}
                          change={(photos) =>
                            set({
                              ...item,
                              images: photos.map((src) => ({
                                src,
                                alt: item.name,
                              })),
                            })
                          }
                        />
                      </>
                    )}
                  />
                )}
                <p>
                  <button className="button" type="submit" disabled={!dirty}>
                    {t("Сохранить на сайте")}
                  </button>
                </p>
              </form>
            </fieldset>
            {message && <p role="status">{t(message)}</p>}
          </>
        )}
      </div>
    </section>
  );
}
